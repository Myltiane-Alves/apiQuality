import { Tools } from 'node-sped-nfe';
import fs from 'fs';
import xlsx from 'xlsx';
import path from 'path';
import archiver from 'archiver';
import axios from 'axios';
import os from 'os';
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extrairCStat(xml) {
  if (!xml || typeof xml !== "string") return null;
  const match = xml.match(/<cStat>(\d+)<\/cStat>/);
  return match ? match[1] : null;
}

// ======================================================
// ✅ Carrega o certificado corretamente (Vercel + Local)
// ======================================================
async function getCertOptions() {
  const senha =
    process.env.CERT_SENHA ||
    process.env.SENHA_CERTIFICADO ||
    "#senhagto2024#";

  // 🔹 1. Primeiro tenta variável de ambiente Base64 (Vercel)
  const pfxBase64 = process.env.CERT_PFX_BASE64;
  if (pfxBase64) {
    console.log("✅ Usando certificado da variável de ambiente CERT_PFX_BASE64");

    const tempPath = path.join(os.tmpdir(), "certificado_vercel.pfx");
    fs.writeFileSync(tempPath, Buffer.from(pfxBase64, "base64"));
    return { pfx: fs.readFileSync(tempPath), senha };
  }

  // 🔹 2. Se não existir env, tenta ler o arquivo local (modo dev)
  const certBase64Path = path.resolve(__dirname, "../cert_base64.txt");
  const certPfxPath = path.resolve(__dirname, "./GTO COMERCIO 2025-2026.pfx");

  if (fs.existsSync(certPfxPath)) {
    console.log("✅ Usando certificado PFX local");
    return { pfx: fs.readFileSync(certPfxPath), senha };
  }

  if (fs.existsSync(certBase64Path)) {
    console.log("✅ Usando certificado Base64 local");
    const base64Data = fs.readFileSync(certBase64Path, "utf-8").trim();
    return { pfx: Buffer.from(base64Data, "base64"), senha };
  }

  throw new Error("❌ Nenhum certificado encontrado (PFX ou Base64).");
}

class ConsultaNfeController {
async validarConsultar(req, res) {
  try {
    // 🔹 Carrega certificado
    const certOptions = await getCertOptions();

    // 🔹 Caminho fixo do xmllint local (ignorado na Vercel)
    const xmllintPath = path.resolve(
      "C:\\quality\\react_node\\homologacao\\apiQuality\\libs\\libxml\\bin\\xmllint.exe"
    );

    let vendas = req.body?.vendas;
    if (!vendas) {
      const apiUrl =
        "http://164.152.245.77:8000/quality/concentrador_homologacao/api/venda/valida-venda-contingencia.xsjs";
      const response = await axios.get(apiUrl);
      vendas = response.data;
    }

    if (!Array.isArray(vendas)) {
      vendas =
        vendas.data ??
        vendas.rows ??
        vendas?.data?.rows ??
        Object.values(vendas).find((v) => Array.isArray(v)) ??
        [];
    }

    if (!Array.isArray(vendas) || vendas.length === 0) {
      return res.status(400).json({ error: "Nenhuma venda para consultar." });
    }

    const resultados = [];

    for (const row of vendas) {
      const IDVENDA = String(row.IDVENDA ?? "").trim();
      const UF = String(row.NFE_INFNFE_EMIT_ENDEREMIT_UF ?? "").trim();
      const CHAVE = String(row.CHAVE ?? "").trim();

      if (!CHAVE) {
        resultados.push({ IDVENDA, UF, error: "CHAVE ausente" });
        continue;
      }

      try {
        const tools = new Tools(
          {
            mod: "55",
            tpAmb: 1,
            UF,
            versao: "4.00",
            xmllint: xmllintPath,
          },
          certOptions
        );

        const resposta = await tools.consultarNFe(CHAVE);
        const xml = resposta?.xml || resposta;
        const cstat =
          resposta?.retConsSitNFe?.cStat ||
          extrairCStat(xml) ||
          "SEM_CSTAT";

        resultados.push({ IDVENDA, UF, CHAVE, CSTAT: cstat });
      } catch (e) {
        resultados.push({ IDVENDA, UF, CHAVE, error: e.message });
      }
    }

    return res.json({
      total: resultados.length,
      processados: resultados.filter((r) => !r.error).length,
      data: resultados,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}


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
    let { } = req.query;

    try {
      const apiUrl = `http://164.152.245.77:8000/quality/concentrador_homologacao/api/venda/valida-venda-contingencia.xsjs`
      const response = await axios.get(apiUrl)

      return res.json(response.data); // Retorna
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  async putValidarVendaContigencia(req, res) {
    try {
      let { IDVENDA, STVALIDACONTINGENCIA } = req.body;

      const response = await axios.put(`http://164.152.245.77:8000/quality/concentrador/api/venda/valida-venda-contingencia.xsjs`, {
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
