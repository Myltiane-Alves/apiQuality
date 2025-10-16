import { Tools } from 'node-sped-nfe';
import fs from 'fs';
import xlsx from 'xlsx';
import path from 'path';
import archiver from 'archiver';
import axios from 'axios';

function extrairCStat(xml) {
  const match = String(xml).match(/<cStat>(\d+)<\/cStat>/);
  return match ? match[1] : 'SEM_CSTAT';
}

class ConsultaNfeController {
  static async consultar(req, res) {
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

        let certificadoBuffer = fs.readFileSync(CERTIFICADO);
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
        const apiUrl = `http://164.152.245.77:8000/quality/concentrador_homologacao/api/venda/valida-venda-contingencia.xsjs`
        const response = await axios.get(apiUrl)
        console.log(response.data.length, 'aqui')
        return res.json(response.data); // Retorna
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        throw error;
    }
    
  }

  async putValidarVendaContigencia(req, res) {
    try {
      let  {IDVENDA} = req.body; 
      const response = await axios.put(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/venda/valida-venda-contingencia.xsjs`, { 
          IDVENDA
      })
      
      return res.json(response.data);
    } catch (error) {
      console.error("Erro no ConsultaNfeController.putValidarVendaContigencia", error);
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new ConsultaNfeController();