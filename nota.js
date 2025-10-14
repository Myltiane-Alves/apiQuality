import fs from 'fs-extra';
import XLSX from 'xlsx';
import inquirer from 'inquirer';
import cliProgress from 'cli-progress';
import csvWriter from 'csv-writer';
import soap from 'soap';
import path from 'path';
// ===================== CONFIG ===================== //
const CERTIFICADO = "C:/certificados/GTO COMERCIO 2025-2026.pfx";
const SENHA = "#senhagto2024#";
const ARQ_PLANILHA = "./python_notas/consulta_nfe/dados.xlsx";
const PASTA_RESULTADOS = "./python_notas/resultados";
const ARQ_LOG = "./python_notas/consulta_nfe/log/consultas.csv";
const WSDL_URL = "https://nfe.sefaz.df.gov.br/ws/NFeConsultaProtocolo4"; // Troque pelo WSDL real

// ===================== FUNÇÕES ===================== //

// Lê a planilha Excel
function lerPlanilhaExcel(caminho) {
  const workbook = XLSX.readFile(caminho);
  const sheetName = workbook.SheetNames[0];
  return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
}

// Lê o log CSV existente ou inicializa se não existir
function lerLogCsv(caminho) {
  if (!fs.existsSync(caminho)) {
    // Cria o arquivo com cabeçalho padrão
    fs.ensureDirSync(path.dirname(caminho));
    fs.writeFileSync(caminho, "DATA_HORA,CHAVE_NFE,STATUS,ERRO\n", 'utf8');
    return [];
  }
  const dados = fs.readFileSync(caminho, 'utf8');
  const linhas = dados.split('\n').filter(l => l.trim());
  if (linhas.length === 0) return [];
  const cabecalho = linhas[0].split(',');
  return linhas.slice(1).map(linha => {
    const valores = linha.split(',');
    return cabecalho.reduce((obj, col, idx) => {
      obj[col] = valores[idx];
      return obj;
    }, {});
  });
}

// Escreve log CSV
async function escreveLogCsv(caminho, registros) {
  if (registros.length === 0) return;
  const cabecalho = Object.keys(registros[0]);
  const writer = csvWriter.createObjectCsvWriter({
    path: caminho,
    header: cabecalho.map(col => ({ id: col, title: col }))
  });
  await writer.writeRecords(registros);
}

// Consulta NFE/NFCE na SEFAZ via SOAP usando certificado
async function consultaNfeSefaz(chaveNfe) {
  const pfx = fs.readFileSync(CERTIFICADO);
  const options = {
    wsdl_options: {
      pfx: pfx,
      passphrase: SENHA,
      rejectUnauthorized: false // para homologação
    }
  };

  return new Promise((resolve, reject) => {
    soap.createClient(WSDL_URL, options, (err, client) => {
      if (err) return reject(err);
      // Troque 'consultaNota' pelo método correto do WSDL
      client.consultaNota({ chave: chaveNfe }, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  });
}

// Salva resultado XML
function salvaResultadoXml(pasta, chaveNfe, xmlString) {
  fs.ensureDirSync(pasta);
  fs.writeFileSync(`${pasta}/${chaveNfe}.xml`, xmlString, 'utf8');
}

// ===================== FLUXO PRINCIPAL ===================== //

async function main() {
  // 1. Pergunta se continua ou recomeça
  const { continuar } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continuar',
      message: 'Deseja continuar do último log?',
      default: true
    }
  ]);

  // 2. Lê planilha Excel
  const tarefas = lerPlanilhaExcel(ARQ_PLANILHA);

  // 3. Lê log CSV
  let log = continuar ? lerLogCsv(ARQ_LOG) : [];
  console.log(`Log atual tem ${log.length} registros.`);
  // 4. Monta lista de tarefas pendentes
  const chavesProcessadas = new Set(log.map(r => r.CHAVE_NFE));
  const tarefasPendentes = tarefas.filter(t => !chavesProcessadas.has(t.CHAVE_NFE));

  // 5. Barra de progresso
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  bar.start(tarefasPendentes.length, 0);

  // 6. Processa cada tarefa
  for (let i = 0; i < tarefasPendentes.length; i++) {
    const tarefa = tarefasPendentes[i];
    try {
      // Consulta SEFAZ
      const resultado = await consultaNfeSefaz(tarefa.CHAVE_NFE);
    //   console.log(`Resultado da chave ${tarefa.CHAVE_NFE}:`, resultado);

      // Extrai XML do resultado (ajuste conforme resposta real)
      const xmlString = resultado.xml || resultado.XML || '';
      if (!xmlString) {
        console.log(`Nenhum XML retornado para chave ${tarefa.CHAVE_NFE}`);
      }
      salvaResultadoXml(PASTA_RESULTADOS, tarefa.CHAVE_NFE, xmlString);

      // Atualiza log
      log.push({
        DATA_HORA: new Date().toISOString(),
        CHAVE_NFE: tarefa.CHAVE_NFE,
        STATUS: xmlString ? 'OK' : 'SEM_XML',
        ERRO: xmlString ? '' : 'Sem XML retornado'
      });
      await escreveLogCsv(ARQ_LOG, log);

      bar.update(i + 1);
    } catch (err) {
      log.push({
        DATA_HORA: new Date().toISOString(),
        CHAVE_NFE: tarefa.CHAVE_NFE,
        STATUS: 'ERRO',
        ERRO: err.message
      });
      await escreveLogCsv(ARQ_LOG, log);
      bar.update(i + 1);
      console.error(`Erro na chave ${tarefa.CHAVE_NFE}:`, err.message);
    }
  }

  // Teste de escrita de arquivo
  fs.ensureDirSync(PASTA_RESULTADOS);
  fs.writeFileSync(`${PASTA_RESULTADOS}/teste.txt`, 'teste', 'utf8');

  bar.stop();
  console.log('Processo finalizado!');
}

main();