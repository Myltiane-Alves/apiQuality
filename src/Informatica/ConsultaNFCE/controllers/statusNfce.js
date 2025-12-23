import { Make, Tools, docZip } from 'node-sped-nfe';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

export async function getCertOptions(senha, fallbackPfxPath = './GTO COMERCIO 2025-2026.pfx') {
  // -----------------------------
  // 1) PFX BASE64 VIA ENV
  // -----------------------------
  if (process.env.CERT_PFX_BASE64) {
    try {
      const buf = Buffer.from(process.env.CERT_PFX_BASE64, "base64");
      if (buf.length > 0) {
        return { pfx: buf, senha };
      }
    } catch (e) {
      console.error("ERRO: CERT_PFX_BASE64 inválido:", e.message);
    }
  }

  // -----------------------------
  // 2) PFX ARQUIVO LOCAL
  // -----------------------------
  if (fallbackPfxPath && fs.existsSync(fallbackPfxPath)) {
    try {
      const buf = fs.readFileSync(path.resolve(fallbackPfxPath));
      if (buf.length > 0) {
        return { pfx: buf, senha };
      }
    } catch (e) {
      console.error("ERRO ao ler arquivo PFX local:", e.message);
    }
  }

  // -----------------------------
  // 3) PEM BASE64 (cert + key)
  // -----------------------------
  if (process.env.CERT_PEM_CERT_BASE64 && process.env.CERT_PEM_KEY_BASE64) {
    try {
      const cert = Buffer.from(process.env.CERT_PEM_CERT_BASE64, "base64");
      const key = Buffer.from(process.env.CERT_PEM_KEY_BASE64, "base64");
      return { cert, key };
    } catch (e) {
      console.error("ERRO: CERT_PEM_*_BASE64 inválido:", e.message);
    }
  }

  // -----------------------------
  // 4) PEM POR CAMINHO
  // -----------------------------
  if (process.env.CERT_PEM_CERT_PATH && process.env.CERT_PEM_KEY_PATH) {
    try {
      const cert = fs.readFileSync(process.env.CERT_PEM_CERT_PATH);
      const key = fs.readFileSync(process.env.CERT_PEM_KEY_PATH);
      return { cert, key };
    } catch (e) {
      console.error("ERRO ao ler caminhos PEM:", e.message);
    }
  }

  // -----------------------------
  // 5) NADA ENCONTRADO
  // -----------------------------
  return null;
}

function ufToCodigo(uf) {
  const map = {
    "RO": "11", "AC": "12", "AM": "13", "RR": "14", "PA": "15", "AP": "16", "TO": "17",
    "MA": "21", "PI": "22", "CE": "23", "RN": "24", "PB": "25", "PE": "26", "AL": "27", "SE": "28", "BA": "29",
    "MG": "31", "ES": "32", "RJ": "33", "SP": "35", "PR": "41", "SC": "42", "RS": "43", "MS": "50", "MT": "51", "GO": "52", "DF": "53"
  };
  if (!uf) return "35";
  const u = uf.toUpperCase();
  return map[u] || "35";
}
class ConsultaStatusNfeController {
  async statusSefaz(req, res) {
    try {
      let { idVenda } = req.query;

      if (!idVenda) {
        return res.status(400).json({ error: "idVenda é obrigatório" });
      }

      const response = await axios.get(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/venda/lista-venda-new-xml.xsjs?id=${idVenda}`);
      const vendaData = response.data;
      const configData = response.data.data[0]?.configuracao?.[0]?.config || {};
      const dsCRT = configData.DSCRT || "";
      const cscId = configData.IDTOKEN || "1";
      const csc = configData.TOKENCSC || "";
      const uf = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_UF;
      const mod = vendaData.data[0]?.venda.NFE_INFNFE_IDE_MOD
      const tpAmb = vendaData.data[0]?.venda.NFE_INFNFE_IDE_TPAMB

      const SENHA_CERT = process.env.SENHA || "#senhagto2024#";
      const certOptions = await getCertOptions(SENHA_CERT, './GTO COMERCIO 2025-2026.pfx');
      const opensslModulesPath = path.resolve("./libs/openssl/lib/ossl-modules");
        process.env.OPENSSL_MODULES = opensslModulesPath;

      if (!certOptions) {
        return res.status(500).json({
          error: 'Não foi possível carregar o certificado. Verifique as variáveis de ambiente ou o arquivo local.'
        });
      }

      const tools = new Tools({
        mod: '65',
        tpAmb: tpAmb,
        UF: uf,
        versao: "4.00",
        CSC: csc,
        CSCid: cscId,
        xmllint: path.resolve("./libs/libxml/bin/xmllint.exe"),
        openssl: path.resolve("./libs/openssl/bin/openssl.exe"),
      }, certOptions);

      tools.sefazStatus().then(res => {
        console.log('Status da SEFAZ:', res);
      }).catch(err => {
        console.error('Erro ao consultar status da SEFAZ:', err);
      })

      return res.json(vendaData);
    } catch (error) {
      console.error('Erro ao consultar venda ou gerar XML:', error);
      return res.status(500).json({ error: 'Erro ao consultar venda ou gerar XML' });
    }
  }
  async downloadNFE(req, res) {
    try {
      let { idVenda } = req.query;

      if (!idVenda) {
        return res.status(400).json({ error: "idVenda é obrigatório" });
      }

      const response = await axios.get(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/venda/lista-venda-new-xml.xsjs?id=${idVenda}`);
      const vendaData = response.data;


      const configData = response.data.data[0]?.configuracao?.[0]?.config || {};
      const dsCRT = configData.DSCRT || "";
      const cscId = configData.IDTOKEN || "1";
      const csc = configData.TOKENCSC || "";
      const uf = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_UF;
      const mod = vendaData.data[0]?.venda.NFE_INFNFE_IDE_MOD
      const tpAmb = vendaData.data[0]?.venda.NFE_INFNFE_IDE_TPAMB
      console.log(cscId, '<-- cscId');
      console.log(csc, '<-- csc');
      console.log(uf, '<-- uf');
      console.log(mod, '<-- mod');
      console.log(tpAmb, '<-- tpAmb');

      const SENHA_CERT = process.env.SENHA || "#senhagto2024#";
      const certOptions = await getCertOptions(SENHA_CERT, './GTO COMERCIO 2025-2026.pfx');
      const opensslModulesPath = path.resolve("./libs/openssl/lib/ossl-modules");
        process.env.OPENSSL_MODULES = opensslModulesPath;

      if (!certOptions) {
        return res.status(500).json({
          error: 'Não foi possível carregar o certificado. Verifique as variáveis de ambiente ou o arquivo local.'
        });
      }

      const tools = new Tools({
        mod: '55',
        tpAmb: tpAmb,
        UF: uf,
        versao: "4.00",
        CSC: csc,
        CSCid: cscId,
        xmllint: path.resolve("./libs/libxml/bin/xmllint.exe"),
        openssl: path.resolve("./libs/openssl/bin/openssl.exe"),
      }, certOptions);

      tools.sefazStatus().then(res => {
        console.log('Status da SEFAZ:', res);
      }).catch(err => {
        console.error('Erro ao consultar status da SEFAZ:', err);
      })

      return res.json(vendaData);
    } catch (error) {
      console.error('Erro ao consultar venda ou gerar XML:', error);
      return res.status(500).json({ error: 'Erro ao consultar venda ou gerar XML' });
    }
  }
}

export default new ConsultaStatusNfeController();