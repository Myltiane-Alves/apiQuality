import fs from "fs";
import path from "path";
import https from "https";
import xlsx from "xlsx";
import readline from "readline";
import { parseStringPromise } from "xml2js";
import ora from "ora";
import csvWriter from "csv-writer";
import chalk from "chalk";

// ===================== CONFIG ===================== //
const CERTIFICADO = "./cert.pem";
const CHAVE = "./chave.pem";

const ARQ_PLANILHA = "./python_notas/consulta_nfe/dados.xlsx";
const PASTA_RESULTADOS = "./python_notas/resultados";
const LOG_DIR = "./python_notas/consulta_nfe/log";
const LOG_FILE = path.join(LOG_DIR, "consultas.csv");
const SENHA = "#senhagto2024#";

// Cria pastas
fs.mkdirSync(PASTA_RESULTADOS, { recursive: true });
fs.mkdirSync(LOG_DIR, { recursive: true });

// ----------------- Endpoints UF ----------------- //
const ENDPOINTS = {
  DF: "https://nfe.fazenda.df.gov.br/NFeConsulta/NFeConsulta2.asmx",
  GO: "https://nfe.sefaz.go.gov.br/nfe/services/NFeConsultaProtocolo4",
  MG: "https://nfe.fazenda.mg.gov.br/nfe2/services/NFeConsultaProtocolo4",
  RS: "https://nfe.sefaz.rs.gov.br/ws/nfeconsulta/NfeConsulta.asmx?WSDL",
  SP: "https://nfe.fazenda.sp.gov.br/ws/NfeConsultaProtocolo4.asmx"
};


// ----------------- Helpers ----------------- //
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(query, (ans) => {
    rl.close();
    resolve(ans.trim());
  }));
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Registrar log CSV
async function registrarLog(linhaLog) {
  const exists = fs.existsSync(LOG_FILE);
  const createCsvWriter = csvWriter.createObjectCsvWriter;
  const writer = createCsvWriter({
    path: LOG_FILE,
    header: [
      { id: "DATA_HORA", title: "DATA_HORA" },
      { id: "IDVENDA", title: "IDVENDA" },
      { id: "UF", title: "UF" },
      { id: "CHAVE", title: "CHAVE" },
      { id: "CSTAT", title: "CSTAT" },
      { id: "SUBPASTA", title: "SUBPASTA" },
      { id: "ARQUIVO", title: "ARQUIVO" },
    ],
    append: exists,
  });
  await writer.writeRecords([linhaLog]);
}


// ----------------- Consulta NFe ----------------- //
async function consultarNFe(UF, chave) {
  const endpoint = ENDPOINTS[UF.toUpperCase()];
  if (!endpoint) throw new Error(`UF ${UF} não possui endpoint configurado`);

  const xmlEnvelope = `
  <?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema"
               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <soap:Body>
    <nfe:consSitNFe xmlns:nfe="http://www.portalfiscal.inf.br/nfe/wsdl/NFeConsultaProtocolo4" versao="4.00">
      <tpAmb>1</tpAmb>
      <xServ>CONSULTAR</xServ>
      <chNFe>${chave}</chNFe>
    </nfe:consSitNFe>
  </soap:Body>
</soap:Envelope>
`;


 const options = {
  key: fs.readFileSync("chave.pem"),
  cert: fs.readFileSync("cert.pem"),
  passphrase: SENHA,
  method: "POST",
  secureProtocol: "TLSv1_2_method",
  headers: {
    "Content-Type": "application/soap+xml; charset=utf-8",
    "SOAPAction": "https://www.portalfiscal.inf.br/nfe/wsdl/NFeConsulta/NFeConsulta2"

  }
};


const req = https.request("https://www.portalfiscal.inf.br/nfe/wsdl/NFeConsulta/NFeConsulta2", options, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => console.log(data));
});

req.on("error", console.error);
req.write("<XML_ENVELOPE_DA_CONSULTA>");
req.end();

  return new Promise((resolve, reject) => {
    const req = https.request(endpoint, options, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.write(xmlEnvelope);
    req.end();
  });
}

// Retry automático
async function consultarComRetry(UF, CHAVE, tentativas = 3) {
  for (let i = 1; i <= tentativas; i++) {
    try {
      return await consultarNFe(UF, CHAVE);
    } catch (err) {
      if (i === tentativas) throw err;
      console.log(chalk.yellow(`Tentativa ${i} falhou para ${CHAVE}, retry em 1s...`));
      await delay(1000);
    }
  }
}

// ----------------- Execução principal ----------------- //
(async () => {
  console.clear();
  console.log(chalk.cyan.bold("=== Consulta NF-e SEFAZ – Node.js ===\n"));

  const continuar = (await askQuestion("Deseja continuar o script anterior? (s/n): "))
    .toLowerCase() === "s";

  if (!continuar && fs.existsSync(PASTA_RESULTADOS)) {
    fs.rmSync(PASTA_RESULTADOS, { recursive: true, force: true });
  }
  fs.mkdirSync(PASTA_RESULTADOS, { recursive: true });

  if (!continuar && fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);

  // Lê Excel
  const workbook = xlsx.readFile(ARQ_PLANILHA);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const dados = xlsx.utils.sheet_to_json(sheet);

  // Lê chaves já consultadas
  let chavesConsultadas = new Set();
  if (fs.existsSync(LOG_FILE)) {
    const linhas = fs.readFileSync(LOG_FILE, "utf8").split("\n").slice(1);
    for (const l of linhas) {
      const parts = l.split(",");
      if (parts[3]) chavesConsultadas.add(parts[3].trim());
    }
  }

  const tarefas = dados.filter(row => !chavesConsultadas.has(row["CHAVE"]?.trim()));

  const total = tarefas.length;
  let processados = 0;
  const spinner = ora("Consultando notas...").start();

  for (const row of tarefas) {
    const IDVENDA = String(row["IDVENDA"]);
    const UF = String(row["NFE_INFNFE_EMIT_ENDEREMIT_UF"]).trim();
    const CHAVE = String(row["CHAVE"]).trim();

    try {
      const resposta = await consultarComRetry(UF, CHAVE, 3);
      const parsed = await parseStringPromise(resposta);
      const cstat = parsed?.["soap:Envelope"] ? "200" : "ERRO";

      const subpasta = path.join(PASTA_RESULTADOS, `${cstat}-${UF}`);
      fs.mkdirSync(subpasta, { recursive: true });
      const arquivoSaida = path.join(subpasta, `${IDVENDA}.xml`);
      fs.writeFileSync(arquivoSaida, resposta, "utf8");

      await registrarLog({
        DATA_HORA: new Date().toISOString().replace("T", " ").split(".")[0],
        IDVENDA,
        UF,
        CHAVE,
        CSTAT: cstat,
        SUBPASTA: subpasta,
        ARQUIVO: arquivoSaida,
      });

      processados++;
      spinner.text = `Processados ${processados}/${total}`;
      await delay(500); // pequena pausa entre requisições

    } catch (err) {
      console.error(chalk.red(`Erro na consulta da chave ${CHAVE}: ${err.message}`));
    }
  }

  spinner.succeed("Consulta concluída!");
})();
