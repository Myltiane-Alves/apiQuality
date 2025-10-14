// consultaNfe.js
import fs from "fs";
import path from "path";
import https from "https";
import { parseStringPromise } from "xml2js";
import xlsx from "xlsx";
import readline from "readline";
import chalk from "chalk";
import ora from "ora";
import csvWriter from "csv-writer";
import { strict } from "assert";

// ===================== CONFIG ===================== //
const CERTIFICADO = "./GTO COMERCIO 2025-2026.pfx";
const SENHA = "#senhagto2024#";

const ARQ_PLANILHA = "./python_notas/consulta_nfe/dados.xlsx";
const PASTA_RESULTADOS = "./python_notas/resultados";
const LOG_DIR = "./python_notas/consulta_nfe/log";
const LOG_FILE = path.join(LOG_DIR, "consultas.csv");
// ================================================== //

// cria pastas se necessário
fs.mkdirSync(PASTA_RESULTADOS, { recursive: true });
fs.mkdirSync(LOG_DIR, { recursive: true });

// função auxiliar para perguntar no terminal
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans.trim());
  }));
}

// função para registrar no CSV
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

const ENDPOINTS = {
  AC: "https://nfe.sefazvirtual.rs.gov.br/ws/NfeConsultaProtocolo4.asmx",
  AL: "https://nfe.sefaz.al.gov.br/nfe2/services/NFeConsultaProtocolo4",
  AM: "https://nfe.sefaz.am.gov.br/services2/services/NFeConsultaProtocolo4",
  AP: "https://nfe.sefaz.ap.gov.br/nfe/services/NFeConsultaProtocolo4",
  BA: "https://nfe.sefaz.ba.gov.br/webservices/NFeConsultaProtocolo4/NFeConsultaProtocolo4.asmx",
  CE: "https://nfe.sefaz.ce.gov.br/nfe2/services/NFeConsultaProtocolo4",
  DF: "https://www1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx",
  ES: "https://nfe.sefaz.es.gov.br/nfe2/services/NFeConsultaProtocolo4",
  GO: "https://nfe.sefaz.go.gov.br/nfe/services/NFeConsultaProtocolo4",
  MA: "https://nfe.sefaz.ma.gov.br/nfe2/services/NFeConsultaProtocolo4",
  MG: "https://nfe.fazenda.mg.gov.br/nfe2/services/NFeConsultaProtocolo4",
  MS: "https://nfe.sefaz.ms.gov.br/ws/NFeConsultaProtocolo4",
  MT: "https://nfe.sefaz.mt.gov.br/nfews/v2/services/NFeConsultaProtocolo4",
  PA: "https://nfe.sefa.pa.gov.br/nfews/NFeConsultaProtocolo4",
  PB: "https://nfe.sefaz.pb.gov.br/nfe2/services/NFeConsultaProtocolo4",
  PE: "https://nfe.sefaz.pe.gov.br/nfe-service/services/NFeConsultaProtocolo4",
  PI: "https://nfe.sefaz.pi.gov.br/nfeweb/services/NFeConsultaProtocolo4",
  PR: "https://nfe.sefa.pr.gov.br/nfe/NFeConsultaProtocolo4",
  RJ: "https://nfe.fazenda.rj.gov.br/nfe/services/NFeConsultaProtocolo4",
  RN: "https://nfe.set.rn.gov.br/nfe2/services/NFeConsultaProtocolo4",
  RO: "https://nfe.sefin.ro.gov.br/nfe2/services/NFeConsultaProtocolo4",
  RR: "https://nfe.sefaz.rr.gov.br/nfe2/services/NFeConsultaProtocolo4",
  RS: "https://nfe.sefazrs.rs.gov.br/ws/NfeConsultaProtocolo4.asmx",
  SC: "https://nfe.sef.sc.gov.br/nfe/services/NFeConsultaProtocolo4",
  SE: "https://nfe.sefaz.se.gov.br/nfe2/services/NFeConsultaProtocolo4",
  SP: "https://nfe.fazenda.sp.gov.br/ws/NfeConsultaProtocolo4.asmx",
  TO: "https://nfe.sefaz.to.gov.br/nfe/services/NFeConsultaProtocolo4",
  SVRS: "https://nfe.sefazvirtual.rs.gov.br/ws/NfeConsultaProtocolo4.asmx",
  SVAN: "https://www.sefazvirtual.fazenda.gov.br/NFeConsultaProtocolo4/NFeConsultaProtocolo4.asmx"
};

// função para consultar na SEFAZ
async function consultarNFe(uf, chave) {
  const endpoint = ENDPOINTS[uf.toUpperCase()];
  if (!endpoint) throw new Error(`UF ${uf} não possui endpoint configurado`);

  const xmlEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"
                 xmlns:nfe="http://www.portalfiscal.inf.br/nfe">
  <soap12:Body>
    <nfe:consSitNFe versao="4.00">
      <tpAmb>1</tpAmb>
      <xServ>CONSULTAR</xServ>
      <chNFe>53251036769602004495650050000021411383333471</chNFe>
    </nfe:consSitNFe>
  </soap12:Body>
</soap12:Envelope>`;


//   const xmlEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
//   <soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"
//                    xmlns:nfe="http://www.portalfiscal.inf.br/nfe/wsdl/NFeConsultaProtocolo4">
//     <soap12:Header/>
//     <soap12:Body>
//       <nfe:consultaNFe>
//         <nfe:consSitNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
//           <tpAmb>1</tpAmb>
//           <xServ>CONSULTAR</xServ>
//           <chNFe>${chave}</chNFe>
//         </nfe:consSitNFe>
//       </nfe:consultaNFe>
//     </soap12:Body>
//   </soap12:Envelope>`;

  const options = {
    forever: true,
    strictSSL: false,
    method: "POST",
    pfx: fs.readFileSync(CERTIFICADO),
    passphrase: SENHA,
    headers: {
      "Content-Type": "application/soap+xml; charset=utf-8; action=\"http://www.portalfiscal.inf.br/nfe/wsdl/NfeConsulta2/nfeConsultaNF2\"",
      "Content-Length": Buffer.byteLength(xmlEnvelope),
      "SOAPAction": "http://www.portalfiscal.inf.br/nfe/wsdl/NFeConsultaProtocolo4/consultaNFe"
    },
    rejectUnauthorized: false,
  };

  return new Promise((resolve, reject) => {
    const req = https.request(endpoint, options, res => {
      let data = "";
      res.on("data", chunk => (data += chunk));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.write(xmlEnvelope);
    req.end();
  });
}


// ===================== EXECUÇÃO PRINCIPAL ===================== //
(async () => {
  console.clear();
  console.log(chalk.cyan.bold("=== Consulta NF-e SEFAZ – Node.js ===\n"));

  const continuar = (await askQuestion("Deseja continuar o script anterior? (s/n): ")).toLowerCase() === "s";

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
      const resposta = await consultarNFe(UF, CHAVE);
      const parsed = await parseStringPromise(resposta);
      const cstat = parsed?.["soap:Envelope"] ? "200" : "ERRO"; // exemplo simplificado

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
    } catch (err) {
      console.error(chalk.red(`Erro na consulta da chave ${CHAVE}: ${err.message}`));
    }
  }

  spinner.succeed("Consulta concluída!");
})();
