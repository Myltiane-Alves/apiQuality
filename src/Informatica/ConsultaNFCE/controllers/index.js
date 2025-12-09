import { Tools, Make } from 'node-sped-nfe';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import 'dotenv/config';

export async function getCertOptions(senha, fallbackPfxPath = './GTO COMERCIO 2025-2026.pfx') {

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

  if (process.env.CERT_PEM_CERT_BASE64 && process.env.CERT_PEM_KEY_BASE64) {
    try {
      const cert = Buffer.from(process.env.CERT_PEM_CERT_BASE64, "base64");
      const key = Buffer.from(process.env.CERT_PEM_KEY_BASE64, "base64");
      return { cert, key };
    } catch (e) {
      console.error("ERRO: CERT_PEM_*_BASE64 inválido:", e.message);
    }
  }

  if (process.env.CERT_PEM_CERT_PATH && process.env.CERT_PEM_KEY_PATH) {
    try {
      const cert = fs.readFileSync(process.env.CERT_PEM_CERT_PATH);
      const key = fs.readFileSync(process.env.CERT_PEM_KEY_PATH);
      return { cert, key };
    } catch (e) {
      console.error("ERRO ao ler caminhos PEM:", e.message);
    }
  }
  return null;
}

class ConsultaNfeController {
  async issueFromVendaId(req, res) {
    try {
      let { idVenda } = req.query;

      if (!idVenda) {
        return res.status(400).json({ error: "idVenda é obrigatório" });
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

      const response = await axios.get(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/venda/lista-venda-new-xml.xsjs?id=${idVenda}`);
      const vendaData = response.data;

      const result = {
        venda: vendaData,
      };
      
      const chaveRaw = vendaData.data[0]?.venda.CHAVE || "";
      const chave = chaveRaw.replace(/^NFe/i, '').replace(/\D/g, '').slice(0, 44);
      const mod = vendaData.data[0]?.venda.NFE_INFNFE_IDE_MOD || "65" || "55";
      const tpAmb = vendaData.data[0]?.venda.NFE_INFNFE_IDE_TPAMB || "2";
      const cnpj = vendaData.data[0]?.venda?.NFE_INFNFE_EMIT_CNPJ || "00000000000000";
      
      // Usa getCertOptions para carregar o certificado
      const SENHA_CERT = process.env.SENHA || "#senhagto2024#";
      const certOptions = await getCertOptions(SENHA_CERT, './GTO COMERCIO 2025-2026.pfx');
      
      if (!certOptions) {
        return res.status(500).json({
          error: 'Não foi possível carregar o certificado. Verifique as variáveis de ambiente ou o arquivo local.'
        });
      }


      try {
        const tools = new Tools({
          mod: mod,
          tpAmb: parseInt(tpAmb),
          UF: vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_UF || "SP",
          CNPJ: cnpj,
          versao: "4.00",
          xmllint: path.resolve("./libs/libxml/bin/xmllint.exe"),
        }, certOptions);

        let NFe = new Make()
        NFe.tagInfNFe({
          Id: `NFe${chave}`,
          versao: "4.00"
        });

        NFe.tagIde({
          cUF: vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_UF,
        })

        NFe.tagEmit({
          CNPJ: cnpj,
        })
        NFe.tagEnderEmit({
          UF: vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_UF || "SP",
        })
        NFe.tagProd({
          cProd: "0001",
        })

        NFe.tagImposto({
          vTotTrib: "0.00",
        })
       
        tools.xmlSign(NFe.xml()).then(async xmlSigned => {
          fs.writeFileSync(path.resolve(`./xmls/nfe_venda_${idVenda}.xml`), xmlSigned, {encoding: 'utf8'});
          tools.sefazEnviaLote(xmlSigned, {indSinc: 1}).then(res => {
            console.log('Resposta SEFAZ:', res);
          })
        })
      } catch (e) {
        // console.error('Erro ao inicializar Tools:', e.message);
        // console.error('Stack:', e.stack);
        return res.status(500).json({
          error: 'Erro ao inicializar Tools: ' + e.message,
          stack: e.stack
        });
      }

      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new ConsultaNfeController();