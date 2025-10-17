import { Tools } from 'node-sped-nfe';
import fs from 'fs';
import xlsx from 'xlsx';
import path from 'path';
import archiver from 'archiver';
import axios from 'axios';
import os from 'os';

/**
 * Utilitário: garante que o certificado PFX esteja disponível no runtime.
 * - Se a variável de ambiente CERT_PFX_BASE64 existir, decodifica e grava o PFX.
 * - Tenta gravar no caminho relativo esperado (./GTO COMERCIO 2025-2026.pfx).
 * - Se não for possível gravar no diretório do projeto, grava em um path temporário e retorna esse path.
 *
 * Uso: chame `await ensureCertificateFromEnv()` na inicialização do servidor ou antes de usar as funções que dependem do PFX.
 * Retorna: { path: string, buffer: Buffer }
 */
export async function ensureCertificateFromEnv(options = {}) {
  const envName = options.envName || 'CERT_PFX_BASE64';
  const fallbackName = options.fallbackFilename || 'GTO COMERCIO 2025-2026.pfx';
  const base64 = process.env[envName];

  if (!base64) {
    // nenhuma variável definida
    return { path: null, buffer: null };
  }

  const buf = Buffer.from(base64, 'base64');

  // tenta gravar no caminho relativo do projeto (o mesmo que o código atual usa)
  const relativePath = `./${fallbackName}`;
  try {
    fs.writeFileSync(relativePath, buf, { flag: 'w' });
    return { path: relativePath, buffer: buf };
  } catch (err) {
    // se falhar (por exemplo ambientes serverless read-only), grava em /tmp
    try {
      const tmpDir = os.tmpdir();
      const tmpPath = path.join(tmpDir, fallbackName.replace(/[^a-zA-Z0-9.-]/g, '_'));
      fs.writeFileSync(tmpPath, buf, { flag: 'w' });
      return { path: tmpPath, buffer: buf };
    } catch (err2) {
      // não foi possível gravar em nenhum lugar
      console.error('ensureCertificateFromEnv: não foi possível gravar o certificado PFX:', err, err2);
      return { path: null, buffer: buf };
    }
  }
}

function extrairCStat(xml) {
  const match = String(xml).match(/<cStat>(\d+)<\/cStat>/);
  return match ? match[1] : 'SEM_CSTAT';
}

class ConsultaNfeController {
  async consultar(req, res) {
    try {
      const CERTIFICADO = './GTO COMERCIO 2025-2026.pfx';
      const SENHA = '#senhagto2024#';
      // tenta garantir certificado a partir da variável de ambiente (se configurada)
      const { path: envCertPath, buffer: envCertBuffer } = await ensureCertificateFromEnv();
      const ARQ_PLANILHA = req.file?.path || req.body?.planilhaPath;
      const PASTA_RESULTADOS = path.resolve('python_notas/resultados');
      const LOG_DIR = path.resolve('python_notas/consulta_nfe/log');
      const LOG_FILE = path.join(LOG_DIR, 'consultas.csv');

      fs.mkdirSync(PASTA_RESULTADOS, { recursive: true });
      fs.mkdirSync(LOG_DIR, { recursive: true });

      if (!ARQ_PLANILHA || !fs.existsSync(ARQ_PLANILHA)) {
        return res.status(400).json({ error: 'Arquivo da planilha não enviado ou não encontrado.' });
      }

      const workbook = xlsx.readFile(ARQ_PLANILHA);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const dados = xlsx.utils.sheet_to_json(sheet);

      let chavesConsultadas = new Set();
      if (fs.existsSync(LOG_FILE)) {
        const linhas = fs.readFileSync(LOG_FILE, 'utf8').split('\n').slice(1);
        for (const l of linhas) {
          const parts = l.split(',');
          if (parts[3]) chavesConsultadas.add(parts[3].trim());
        }
      }

      const tarefas = dados.filter(row => !chavesConsultadas.has(row['CHAVE']?.trim()));
      let processados = 0;

      for (const row of tarefas) {
        const IDVENDA = String(row['IDVENDA']);
        const UF = String(row['NFE_INFNFE_EMIT_ENDEREMIT_UF']).trim();
        const CHAVE = String(row['CHAVE']).trim();
        // usa buffer carregado da env se disponível, caso contrário lê do arquivo local
        const certificadoBuffer = envCertBuffer || fs.readFileSync(CERTIFICADO);
        const myTools = new Tools({
          mod: '55',
          tpAmb: 1,
          UF: UF,
          versao: '4.00',
          xmllint: '../libxml/bin/xmllint.exe',
        }, {
          pfx: certificadoBuffer,
          senha: SENHA,
        });

        const resposta = await myTools.consultarNFe(CHAVE);
        const xmlContent = resposta && resposta.xml ? resposta.xml : resposta;
        const cstat = resposta && resposta.retConsSitNFe?.cStat ? resposta.retConsSitNFe.cStat : extrairCStat(xmlContent);

        if (!String(cstat).toUpperCase().includes('SEM')) {
          console.log(`Venda com cstat diferente de SEM: IDVENDA=${IDVENDA}, CHAVE=${CHAVE}, UF=${UF}, cstat=${cstat}`);
        }

        const subpasta = path.join(PASTA_RESULTADOS, `${cstat}-${UF}`);
        fs.mkdirSync(subpasta, { recursive: true });
        const arquivoSaida = path.join(subpasta, `${IDVENDA}.txt`);
        fs.writeFileSync(arquivoSaida, xmlContent, 'utf8');
        processados++;
      }

      const zipPath = path.join(PASTA_RESULTADOS, 'resultados.zip');
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        res.download(zipPath, 'resultados.zip', err => {
          if (err) {
            return res.status(500).json({ error: 'Erro ao enviar o arquivo zip.' });
          }
        });
      });

      archive.on('error', err => {
        throw err;
      });

      archive.pipe(output);
      archive.directory(PASTA_RESULTADOS, false);
      await archive.finalize();

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  async getListaVendasContigenciaValidas(req, res) {
    let {  } = req.query;

    try {
        const apiUrl = `http://164.152.245.77:8000/quality/concentrador/api/venda/valida-venda-contingencia.xsjs`
        const response = await axios.get(apiUrl)
        
        return res.json(response.data); // Retorna
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        throw error;
    }
    
  }

  async putValidarVendaContigencia(req, res) {
    try {
      let  {IDVENDA, STVALIDACONTINGENCIA} = req.body; 
    
      const apiUrl = `http://164.152.245.77:8000/quality/concentrador/api/venda/valida-venda-contingencia.xsjs`



      const response = await axios.put(`http://164.152.245.77:8000/quality/concentrador/api/venda/valida-venda-contingencia.xsjs`, { 
        IDVENDA
      })
      return res.json(response.data);
    } catch (error) {
      console.error("Erro no ConsultaNfeController.putValidarVendaContigencia", error);
      return res.status(500).json({ error: error.message });
    }
  }

  async validarConsultar(req, res) {
    try {
      const CERTIFICADO = './GTO COMERCIO 2025-2026.pfx';
      const SENHA = '#senhagto2024#';
      // tenta garantir certificado a partir da variável de ambiente (se configurada)
      const { path: envCertPath, buffer: envCertBuffer } = await ensureCertificateFromEnv();

      let vendas = req.body?.vendas;
      if (!vendas) {
        const apiUrl = 'http://164.152.245.77:8000/quality/concentrador/api/venda/valida-venda-contingencia.xsjs';
        const response = await axios.get(apiUrl);
        vendas = response.data;
      }

      if (vendas && !Array.isArray(vendas)) {
        if (Array.isArray(vendas.data)) {
          vendas = vendas.data;
        } else if (Array.isArray(vendas.rows)) {
          vendas = vendas.rows;
        } else if (vendas.data && Array.isArray(vendas.data.rows)) {
          vendas = vendas.data.rows;
        } else {
          const possibleArray = Object.values(vendas).find(v => Array.isArray(v));
          if (Array.isArray(possibleArray)) {
            vendas = possibleArray;
          }
        }
      }

      if (!Array.isArray(vendas) || vendas.length === 0) {
        return res.status(400).json({ error: 'Nenhuma venda para consultar.' });
      }

  // usa buffer carregado da env se disponível, caso contrário lê do arquivo local
  const certificadoBuffer = envCertBuffer || fs.readFileSync(CERTIFICADO);
      let processados = 0;
      const resultados = [];

      for (const row of vendas) {
        const IDVENDA = String(row.IDVENDA ?? row['IDVENDA'] ?? '').trim();
        const UF = String(row.NFE_INFNFE_EMIT_ENDEREMIT_UF ?? row['NFE_INFNFE_EMIT_ENDEREMIT_UF'] ?? '').trim();
        const CHAVE = String(row.CHAVE ?? row['CHAVE'] ?? '').trim();

        if (!CHAVE) {
          resultados.push({ IDVENDA, UF, CHAVE, error: 'CHAVE ausente' });
          continue;
        }

        try {
          const myTools = new Tools({
            mod: '55',
            tpAmb: 1,
            UF: UF,
            versao: '4.00',
            xmllint: '../libxml/bin/xmllint.exe',
          }, {
            pfx: certificadoBuffer,
            senha: SENHA,
          });

          const resposta = await myTools.consultarNFe(CHAVE);
          const xmlContent = resposta && resposta.xml ? resposta.xml : resposta;
          const cstat = resposta && resposta.retConsSitNFe?.cStat ? resposta.retConsSitNFe.cStat : extrairCStat(xmlContent);

          resultados.push({
            IDVENDA,
            UF,
            CHAVE,
            cstat,
            xml: xmlContent,
          });

          processados++;
        } catch (innerErr) {
          resultados.push({ IDVENDA, UF, CHAVE, error: innerErr.message });
        }
      }

      const putApiUrl = 'http://164.152.245.77:8000/quality/concentrador/api/venda/valida-venda-contingencia.xsjs';
      let putCount = 0;

      for (const r of resultados) {
        if (r.error) continue;
        if (!r.cstat) continue;
        if (String(r.cstat) === '100') continue;

        try {
          const resp = await axios.put(putApiUrl, { IDVENDA: r.IDVENDA });
          r.putResult = { status: 'ok', data: resp.data };
          putCount++;
        } catch (putErr) {
          r.putResult = { status: 'error', message: putErr.message };
        }
      }

      // const idVendas = Array.from(new Set(
      //   resultados
      //     .map(r => String(r.IDVENDA ?? r['IDVENDA'] ?? '').trim())
      //     .filter(v => v !== '')
      // ));

      return res.json({ processados, putCount, resultados });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}

export default new ConsultaNfeController();
