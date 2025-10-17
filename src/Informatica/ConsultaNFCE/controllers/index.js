import { Tools } from 'node-sped-nfe';
import fs from 'fs';
import xlsx from 'xlsx';
import path from 'path';
import archiver from 'archiver';
import axios from 'axios';
import os from 'os';

function extrairCStat(xml) {
  const match = String(xml).match(/<cStat>(\d+)<\/cStat>/);
  return match ? match[1] : 'SEM_CSTAT';
}

/**
 * Carrega opções de certificado para passar ao constructor de Tools.
 * Suporta, na ordem de preferência:
 *  - PFX via variável de ambiente CERT_PFX_BASE64
 *  - PFX arquivo local './GTO COMERCIO 2025-2026.pfx'
 *  - PEM via variáveis CERT_PEM_CERT_BASE64 / CERT_PEM_KEY_BASE64
 *  - PEM via caminhos process.env.CERT_PEM_CERT_PATH / process.env.CERT_PEM_KEY_PATH
 * Retorna um objeto que pode ser passado como 2º argumento do Tools, por exemplo { pfx: Buffer, senha } ou { cert: Buffer, key: Buffer }
 */
async function getCertOptions(senha, fallbackPfxPath = './GTO COMERCIO 2025-2026.pfx') {
  // 1) PFX via env base64
  const pfxBase64 = process.env.CERT_PFX_BASE64;
  if (pfxBase64) {
    try {
      const pfxBuf = Buffer.from(pfxBase64, 'base64');
      // tenta gravar em um tmp para compatibilidade com bibliotecas que pedem caminho
      try {
        const tmpPath = path.join(os.tmpdir(), fallbackPfxPath.replace(/[^a-zA-Z0-9.\-_]/g, '_'));
        fs.writeFileSync(tmpPath, pfxBuf, { flag: 'w' });
        process.env.CERT_PFX_PATH = tmpPath;
      } catch (e) {
        // se não gravar, não é crítico — ainda temos o buffer
        console.warn('getCertOptions: não foi possível gravar PFX em tmp:', e?.message || e);
      }
      return { pfx: pfxBuf, senha };
    } catch (e) {
      console.error('getCertOptions: falha ao decodificar CERT_PFX_BASE64:', e?.message || e);
    }
  }

  // 2) PFX arquivo local
  if (fs.existsSync(fallbackPfxPath)) {
    try {
      const pfxBuf = fs.readFileSync(fallbackPfxPath);
      process.env.CERT_PFX_PATH = fallbackPfxPath;
      return { pfx: pfxBuf, senha };
    } catch (e) {
      console.warn('getCertOptions: falha ao ler PFX local:', e?.message || e);
    }
  }

  // 3) PEM via envs base64
  const pemCertBase64 = process.env.CERT_PEM_CERT_BASE64;
  const pemKeyBase64 = process.env.CERT_PEM_KEY_BASE64;
  if (pemCertBase64 && pemKeyBase64) {
    try {
      const certBuf = Buffer.from(pemCertBase64, 'base64');
      const keyBuf = Buffer.from(pemKeyBase64, 'base64');
      try {
        const certPath = path.join(os.tmpdir(), 'cert.pem');
        const keyPath = path.join(os.tmpdir(), 'key.pem');
        fs.writeFileSync(certPath, certBuf, { flag: 'w' });
        fs.writeFileSync(keyPath, keyBuf, { flag: 'w' });
        process.env.CERT_PEM_CERT_PATH = certPath;
        process.env.CERT_PEM_KEY_PATH = keyPath;
      } catch (e) {
        console.warn('getCertOptions: não foi possível gravar PEMs em tmp:', e?.message || e);
      }
      return { cert: certBuf, key: keyBuf };
    } catch (e) {
      console.error('getCertOptions: falha ao decodificar CERT_PEM_*_BASE64:', e?.message || e);
    }
  }

  // 4) PEM via caminhos já apontados no ambiente
  const certPathEnv = process.env.CERT_PEM_CERT_PATH;
  const keyPathEnv = process.env.CERT_PEM_KEY_PATH;
  if (certPathEnv && keyPathEnv && fs.existsSync(certPathEnv) && fs.existsSync(keyPathEnv)) {
    try {
      const certBuf = fs.readFileSync(certPathEnv);
      const keyBuf = fs.readFileSync(keyPathEnv);
      return { cert: certBuf, key: keyBuf };
    } catch (e) {
      console.warn('getCertOptions: falha ao ler PEMs dos caminhos apontados:', e?.message || e);
    }
  }

  // nada encontrado
  return null;
}

class ConsultaNfeController {
  async consultar(req, res) {
    try {
      const CERTIFICADO = './GTO COMERCIO 2025-2026.pfx';
      const SENHA = '#senhagto2024#';
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

        // carrega opções de certificado (PFX ou PEM)
        const certOptions = await getCertOptions(SENHA, CERTIFICADO);
        const toolsOpts = Object.assign({
          mod: '55',
          tpAmb: 1,
          UF: UF,
          versao: '4.00',
          xmllint: '../libxml/bin/xmllint.exe',
        }, {});
        const myTools = new Tools(toolsOpts, certOptions || { pfx: fs.readFileSync(CERTIFICADO), senha: SENHA });

        const resposta = await myTools.consultarNFe(CHAVE);
        const xmlContent = resposta && resposta.xml ? resposta.xml : resposta;
        const cstat = resposta && resposta.retConsSitNFe?.cStat ? resposta.retConsSitNFe.cStat : extrairCStat(xmlContent);

        // Logar a venda quando o cstat NÃO for "sem" (ex.: SEM_CSTAT)
        if (!String(cstat).toUpperCase().includes('SEM')) {
          console.log(`Venda com cstat diferente de SEM: IDVENDA=${IDVENDA}, CHAVE=${CHAVE}, UF=${UF}, cstat=${cstat}`);
        }

        const subpasta = path.join(PASTA_RESULTADOS, `${cstat}-${UF}`);
        fs.mkdirSync(subpasta, { recursive: true });
        const arquivoSaida = path.join(subpasta, `${IDVENDA}.txt`);
        fs.writeFileSync(arquivoSaida, xmlContent, 'utf8');
        processados++;
      }

      // Compacta a pasta de resultados
      const zipPath = path.join(PASTA_RESULTADOS, 'resultados.zip');
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        res.download(zipPath, 'resultados.zip', err => {
          if (err) {
            return res.status(500).json({ error: 'Erro ao enviar o arquivo zip.' });
          }
          // Opcional: remover o zip após download
          // fs.unlinkSync(zipPath);
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

      // Pega vendas do body.vendas ou busca na API se não informado
      let vendas = req.body?.vendas;
      if (!vendas) {
        const apiUrl = 'http://164.152.245.77:8000/quality/concentrador/api/venda/valida-venda-contingencia.xsjs';
        const response = await axios.get(apiUrl);
        vendas = response.data;
        // console.log('Vendas buscadas da API (raw):', vendas);
      }

      // Normaliza formatos paginados: { data: [...] } ou { rows: [...] } ou { page, data: [...] }
      if (vendas && !Array.isArray(vendas)) {
        if (Array.isArray(vendas.data)) {
          vendas = vendas.data;
        } else if (Array.isArray(vendas.rows)) {
          vendas = vendas.rows;
        } else if (vendas.data && Array.isArray(vendas.data.rows)) {
          vendas = vendas.data.rows;
        } else {
          // tenta encontrar a primeira propriedade que é array
          const possibleArray = Object.values(vendas).find(v => Array.isArray(v));
          if (Array.isArray(possibleArray)) {
            vendas = possibleArray;
          }
        }
        console.log('Vendas após normalização:', Array.isArray(vendas) ? `array(${vendas.length})` : typeof vendas);
      }

      if (!Array.isArray(vendas) || vendas.length === 0) {
        return res.status(400).json({ error: 'Nenhuma venda para consultar.' });
      }

  const certOptions = await getCertOptions(SENHA, CERTIFICADO);
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
          const toolsOpts = {
            mod: '55',
            tpAmb: 1,
            UF: UF,
            versao: '4.00',
            xmllint: '../libxml/bin/xmllint.exe',
          };
          const myTools = new Tools(toolsOpts, certOptions || { pfx: fs.readFileSync(CERTIFICADO), senha: SENHA });

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

      // Fazer PUT nas vendas cujo cstat é diferente de '100'
      const putApiUrl = 'http://164.152.245.77:8000/quality/concentrador/api/venda/valida-venda-contingencia.xsjs';
      const putResponses = [];

      for (const r of resultados) {
        if (r.error) continue;
        if (!r.cstat) continue;
        if (String(r.cstat) === '100') continue;

        try {
          const resp = await axios.put(putApiUrl, { IDVENDA: r.IDVENDA });
          putResponses.push(resp.data);
        } catch (putErr) {
          putResponses.push({ IDVENDA: r.IDVENDA, error: putErr.message });
        }
      }

      return res.json(putResponses);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
}

export default new ConsultaNfeController();
