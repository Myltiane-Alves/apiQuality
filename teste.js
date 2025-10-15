import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseStringPromise } from 'xml2js';
import xlsx from 'xlsx';
import https from 'https';
import readline from 'readline';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===================== CONFIG ===================== #
const CERTIFICADO = "./GTO COMERCIO 2025-2026.pfx";
const SENHA = '#senhagto2024#';

const ARQ_PLANILHA = "./python_notas/consulta_nfe/dados.xlsx";
const PASTA_RESULTADOS = "./python_notas/resultados";
const LOG_DIR = "./python_notas/consulta_nfe/log";
const LOG_FILE = path.join(LOG_DIR, 'consultas.csv');
// ================================================== #

// Criar agente HTTPS que ignora certificados
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  pfx: fs.readFileSync(CERTIFICADO),
  passphrase: SENHA
});

// URLs dos serviços SEFAZ (exemplo - ajuste conforme necessário)
const SEFAZ_URLS = {
  'SP': 'https://nfe.fazenda.sp.gov.br/ws/nfeconsulta2.asmx',
  'RJ': 'https://nfe.fazenda.rj.gov.br/ws/nfeconsulta2.asmx',
  'MG': 'https://nfe.fazenda.mg.gov.br/ws/nfeconsulta2.asmx',
  'RS': 'https://nfe.sefazrs.rs.gov.br/ws/nfeconsulta2.asmx',
  'DF': "https://nfe.fazenda.df.gov.br/NFeConsulta/NFeConsulta2.asmx",
  'GO': "https://nfe.sefaz.go.gov.br/nfe/services/NFeConsultaProtocolo4",
  'MG': "https://nfe.fazenda.mg.gov.br/nfe2/services/NFeConsultaProtocolo4",
  // Adicione outras UFs conforme necessário
};

class ConsultaNFE {
  constructor() {
    this.chavesConsultadas = new Set();
    this.processados = 0;
    this.total = 0;
  }

  async perguntarContinuar() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Deseja continuar o script anterior? (s/n): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 's');
      });
    });
  }

  inicializarPastas(continuar) {
    // Limpar pasta de resultados se não for continuar
    if (!continuar && fs.existsSync(PASTA_RESULTADOS)) {
      fs.rmSync(PASTA_RESULTADOS, { recursive: true, force: true });
    }

    // Criar pastas
    fs.mkdirSync(PASTA_RESULTADOS, { recursive: true });
    fs.mkdirSync(LOG_DIR, { recursive: true });

    // Se recomeçar do zero: zera o LOG
    if (!continuar && fs.existsSync(LOG_FILE)) {
      fs.unlinkSync(LOG_FILE);
    }

    if (!continuar) {
      this.registrarLog({
        DATA_HORA: new Date().toISOString(),
        IDVENDA: '',
        UF: '',
        CHAVE: '',
        CSTAT: '',
        SUBPASTA: '',
        ARQUIVO: ''
      }, true); // true = escrever cabeçalho
    }
  }

  carregarLogExistente() {
    if (!fs.existsSync(LOG_FILE)) {
      return;
    }

    try {
      const logContent = fs.readFileSync(LOG_FILE, 'utf-8');
      const lines = logContent.split('\n').filter(line => line.trim());
      
      // Pular cabeçalho e processar linhas
      for (let i = 1; i < lines.length; i++) {
        const fields = lines[i].split(',');
        if (fields.length >= 4 && fields[3]) { // CHAVE está na posição 3
          this.chavesConsultadas.add(fields[3].trim());
        }
      }
    } catch (error) {
      console.log('Aviso: falha ao ler LOG existente:', error.message);
    }
  }

  registrarLog(linhaLog, escreverCabecalho = false) {
    const campos = ['DATA_HORA', 'IDVENDA', 'UF', 'CHAVE', 'CSTAT', 'SUBPASTA', 'ARQUIVO'];
    
    try {
      let content = '';
      
      if (escreverCabecalho || !fs.existsSync(LOG_FILE)) {
        content = campos.join(',') + '\n';
      }
      
      content += [
        linhaLog.DATA_HORA || new Date().toISOString(),
        linhaLog.IDVENDA || '',
        linhaLog.UF || '',
        linhaLog.CHAVE || '',
        linhaLog.CSTAT || '',
        linhaLog.SUBPASTA || '',
        linhaLog.ARQUIVO || ''
      ].join(',') + '\n';
      
      fs.appendFileSync(LOG_FILE, content, 'utf-8');
    } catch (error) {
      console.log('Aviso: falha ao escrever no LOG:', error.message);
    }
  }

  carregarPlanilha() {
    const workbook = xlsx.readFile(ARQ_PLANILHA);
    const sheetName = workbook.SheetNames[0];
    return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
  }

  montarTarefas(dadosPlanilha) {
    const tarefas = [];
    
    for (const row of dadosPlanilha) {
      const idv = String(row.IDVENDA || '');
      const ufv = String(row.NFE_INFNFE_EMIT_ENDEREMIT_UF || '');
      const chv = String(row.CHAVE || '').trim();
      
      if (chv && !this.chavesConsultadas.has(chv)) {
        tarefas.push({ IDVENDA: idv, UF: ufv, CHAVE: chv });
      }
    }
    
    return tarefas;
  }

  async consultarSefaz(uf, chaveAcesso) {
    const url = SEFAZ_URLS[uf];
    if (!url) {
      throw new Error(`URL da SEFAZ não configurada para a UF: ${uf}`);
    }

    // XML da consulta (exemplo - ajuste conforme necessário)
    const xmlConsulta = `
      <consultaNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
        <tpAmb>1</tpAmb>
        <xServ>CONSULTAR</xServ>
        <chNFe>${chaveAcesso}</chNFe>
      </consultaNFe>
    `;

    const soapEnvelope = `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <nfeConsultaNF xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeConsultaProtocolo4">
            <nfeDadosMsg>${xmlConsulta.replace(/[\n\r]/g, '')}</nfeDadosMsg>
          </nfeConsultaNF>
        </soap12:Body>
      </soap12:Envelope>
    `;

    return new Promise((resolve, reject) => {
      const options = {
        hostname: new URL(url).hostname,
        port: 443,
        path: new URL(url).pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8',
          'Content-Length': Buffer.byteLength(soapEnvelope)
        },
        agent: httpsAgent
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve(data);
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(soapEnvelope);
      req.end();
    });
  }

  async extrairCSTAT(xmlResponse) {
    try {
      const result = await parseStringPromise(xmlResponse, {
        explicitArray: false,
        mergeAttrs: true
      });
      
      // Tenta encontrar cStat em diferentes locais do XML
      let cstat = 'SEM_CSTAT';
      
      const findCStat = (obj) => {
        if (typeof obj !== 'object' || obj === null) return null;
        
        if (obj.cStat) return obj.cStat;
        if (obj.cstat) return obj.cstat;
        
        for (const key in obj) {
          const found = findCStat(obj[key]);
          if (found) return found;
        }
        
        return null;
      };
      
      const foundCStat = findCStat(result);
      if (foundCStat) {
        cstat = String(foundCStat);
      }
      
      return cstat;
    } catch (error) {
      console.log('Erro ao parsear XML:', error.message);
      return 'ERRO_PARSE';
    }
  }

  formatarXML(xmlString) {
    // Formatação básica do XML (para versão mais sofisticada, use uma biblioteca)
    return xmlString
      .replace(/>\s+</g, '>\n<')
      .replace(/(<\/[^>]+>)/g, '$1\n')
      .replace(/(<[^/][^>]*>)/g, '\n$1');
  }

  atualizarProgresso() {
    const percentual = ((this.processados / this.total) * 100).toFixed(1);
    process.stdout.write(`\rProcessados ${this.processados} de ${this.total} (${percentual}%) — Faltam ${this.total - this.processados}`);
  }

  async processar() {
    try {
      // 1) Perguntar se deseja continuar
      const continuar = await this.perguntarContinuar();
      
      // 2) Inicializar pastas e LOG
      this.inicializarPastas(continuar);
      this.carregarLogExistente();
      
      // 3) Carregar planilha
      console.log('Carregando planilha...');
      const dadosPlanilha = this.carregarPlanilha();
      
      // 4) Montar tarefas
      const tarefas = this.montarTarefas(dadosPlanilha);
      this.total = tarefas.length;
      this.processados = 0;
      
      console.log(`\nTotal de NFes a consultar: ${this.total}`);
      
      if (this.total === 0) {
        console.log('Nenhuma NFe pendente para consulta.');
        return;
      }
      
      // 5) Processar cada tarefa
      for (const tarefa of tarefas) {
        const { IDVENDA, UF, CHAVE } = tarefa;
        
        try {
          console.log(`\nConsultando: ${IDVENDA} - ${CHAVE}`);
          
          // Consultar SEFAZ
          const xmlResponse = await this.consultarSefaz(UF, CHAVE);
          
          // Extrair CSTAT
          const CSTAT = await this.extrairCSTAT(xmlResponse);
          
          // Criar subpasta
          const subPasta = path.join(PASTA_RESULTADOS, `${CSTAT}-${UF}`);
          fs.mkdirSync(subPasta, { recursive: true });
          
          // Salvar arquivo
          const arquivoSaida = path.join(subPasta, `${IDVENDA}.txt`);
          const xmlFormatado = this.formatarXML(xmlResponse);
          fs.writeFileSync(arquivoSaida, xmlFormatado, 'utf-8');
          
          // Registrar no LOG
          this.registrarLog({
            IDVENDA: IDVENDA,
            UF: UF,
            CHAVE: CHAVE,
            CSTAT: CSTAT,
            SUBPASTA: subPasta,
            ARQUIVO: arquivoSaida
          });
          
          this.chavesConsultadas.add(CHAVE);
          this.processados++;
          
          console.log(`Status: ${CSTAT}`);
          this.atualizarProgresso();
          
          // Pequena pausa para não sobrecarregar o servidor
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.log(`\nErro ao consultar ${IDVENDA}:`, error.message);
          
          // Registrar erro no LOG
          this.registrarLog({
            IDVENDA: IDVENDA,
            UF: UF,
            CHAVE: CHAVE,
            CSTAT: 'ERRO_CONSULTA',
            SUBPASTA: path.join(PASTA_RESULTADOS, `ERRO-${UF}`),
            ARQUIVO: ''
          });
          
          this.processados++;
          this.atualizarProgresso();
        }
      }
      
      console.log('\n\nConcluído ✔');
      
    } catch (error) {
      console.error('Erro no processamento:', error);
    }
  }
}

// Executar o script
const consulta = new ConsultaNFE();
consulta.processar();