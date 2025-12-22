import { docZip, Make, Tools } from 'node-sped-nfe';
import fs from 'fs';
// import path from 'path';
import path from "node:path";
import axios from 'axios';
import 'dotenv/config';
import dns from 'dns';
import { time } from 'console';
dns.setDefaultResultOrder('ipv4first');

// export async function getCertOptions(senha, fallbackPfxPath = './GTO COMERCIO 2025-2026.pfx') {
//   if (process.env.CERT_PFX_BASE64) {
//     try {
//       const buf = Buffer.from(process.env.CERT_PFX_BASE64, "base64");
//       if (buf.length > 0) {
//         return { pfx: buf, senha };
//       }
//     } catch (e) {
//       console.error("ERRO: CERT_PFX_BASE64 inválido:", e.message);
//     }
//   }


//   if (fallbackPfxPath && fs.existsSync(fallbackPfxPath)) {
//     try {
//       const buf = fs.readFileSync(path.resolve(fallbackPfxPath));
//       if (buf.length > 0) {
//         return { pfx: buf, senha };
//       }
//     } catch (e) {
//       console.error("ERRO ao ler arquivo PFX local:", e.message);
//     }
//   }

//   if (process.env.CERT_PEM_CERT_BASE64 && process.env.CERT_PEM_KEY_BASE64) {
//     try {
//       const cert = Buffer.from(process.env.CERT_PEM_CERT_BASE64, "base64");
//       const key = Buffer.from(process.env.CERT_PEM_KEY_BASE64, "base64");
//       return { cert, key };
//     } catch (e) {
//       console.error("ERRO: CERT_PEM_*_BASE64 inválido:", e.message);
//     }
//   }

//   if (process.env.CERT_PEM_CERT_PATH && process.env.CERT_PEM_KEY_PATH) {
//     try {
//       const cert = fs.readFileSync(process.env.CERT_PEM_CERT_PATH);
//       const key = fs.readFileSync(process.env.CERT_PEM_KEY_PATH);
//       return { cert, key };
//     } catch (e) {
//       console.error("ERRO ao ler caminhos PEM:", e.message);
//     }
//   }
//   return null;
// }

async function getCertOptions(senha, fallbackPfxPath = './GTO COMERCIO 2025-2026.pfx') {
  // 1) PFX via env base64
  const pfxBase64 = process.env.CERT_PFX_BASE64;
  if (pfxBase64) {
    try {
      const pfxBuf = Buffer.from(pfxBase64, 'base64');
      // tenta gravar em um tmp para compatibilidade com bibliotecas que pedem caminho
      let tmpPath = null;
      try {
        tmpPath = path.join(os.tmpdir(), fallbackPfxPath.replace(/[^a-zA-Z0-9.\-_]/g, '_'));
        fs.writeFileSync(tmpPath, pfxBuf, { flag: 'w' });
        process.env.CERT_PFX_PATH = tmpPath;
      } catch (e) {
        // se não gravar, não é crítico — ainda temos o buffer
        console.warn('getCertOptions: não foi possível gravar PFX em tmp:', e?.message || e);
      }
      return { pfx: pfxBuf, senha, pfxPath: tmpPath };
    } catch (e) {
      console.error('getCertOptions: falha ao decodificar CERT_PFX_BASE64:', e?.message || e);
    }
  }

  // 2) PFX arquivo local
  if (fs.existsSync(fallbackPfxPath)) {
    try {
      const pfxBuf = fs.readFileSync(fallbackPfxPath);
      process.env.CERT_PFX_PATH = fallbackPfxPath;
      return { pfx: pfxBuf, senha, pfxPath: fallbackPfxPath };
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

export function roundTo(valor, casasDecimais) {
  const multiplicador = Math.pow(10, Math.abs(casasDecimais));
  return Math.round(valor * multiplicador) / multiplicador;
}
class ConsultaNfeController {

  async consultaSefaz(req, res) {
    try {
      const { idVenda } = req.query;

      function ufToCodigo(uf) {
        const map = {
          RO: "11", AC: "12", AM: "13", RR: "14", PA: "15", AP: "16", TO: "17",
          MA: "21", PI: "22", CE: "23", RN: "24", PB: "25", PE: "26", AL: "27",
          SE: "28", BA: "29", MG: "31", ES: "32", RJ: "33", SP: "35",
          PR: "41", SC: "42", RS: "43", MS: "50", MT: "51", GO: "52", DF: "53"
        };
        return map[uf?.toUpperCase()] || "35";
      }

      // ================== 1. BUSCAR VENDA ==================
      const response = await axios.get(
        `http://164.152.245.77:8000/quality/concentrador_homologacao/api/venda/lista-venda-new-xml.xsjs?id=${idVenda}`
      );

      const vendaApi = response.data.data[0];
      const venda = vendaApi.venda;
      const itens = vendaApi.detalhe;
      const pagamentos = vendaApi.pagamento;
      const config = vendaApi.configuracao[0].config;

      // ================== 2. CHAVE ==================
      const chave = venda.CHAVE.replace(/^NFe/, "");
      if (!/^\d{44}$/.test(chave)) {
        throw new Error(`Chave inválida: ${chave}`);
      }

      // ================== 3. DATA ==================
      let dhEmi = venda.NFE_INFNFE_IDE_DHEMI;
      if (!dhEmi.includes("T")) {
        const agora = new Date();
        dhEmi = `${dhEmi}T${agora.toTimeString().substring(0, 8)}-03:00`;
      }

      // ================== 4. CERTIFICADO ==================
      const SENHA_CERT = process.env.SENHA || "#senhagto2024#";
      const certOptions = await getCertOptions(
        SENHA_CERT,
        "./GTO COMERCIO 2025-2026.pfx"
      );
      const opensslModulesPath = path.resolve("./libs/openssl/lib/ossl-modules");
      process.env.OPENSSL_MODULES = opensslModulesPath;

      // ================== 5. TOOLS ==================
      const tools = new Tools(
        {
          mod: "65",
          tpAmb: 2,
          UF: 'DF',
          versao: "4.00",
          CSC: config.TOKENCSC,
          CSCid: config.IDTOKEN,
          timeout: 60,
          xmllint: path.resolve("./libs/libxml/bin/xmllint.exe"),
          openssl: path.resolve("./libs/openssl/bin/openssl.exe"),
        },
        certOptions
      );

      // ================== 6. MONTAR XML (MAKE) ==================
      const NFe = new Make();

      // 👉 Pode ser null OU NFe + chave (ambos funcionam)
      NFe.tagInfNFe({ Id: `NFe${chave}`, versao: "4.00" });

      NFe.tagIde({
        cUF: ufToCodigo(venda.NFE_INFNFE_EMIT_ENDEREMIT_UF),
        cNF: venda.NFE_INFNFE_IDE_CNF,
        natOp: venda.NFE_INFNFE_IDE_NATOP,
        mod: "65",
        serie: venda.NFE_INFNFE_IDE_SERIE,
        nNF: venda.NFE_INFNFE_IDE_NNF,
        dhEmi,
        tpNF: "1",
        idDest: "1",
        cMunFG: venda.NFE_INFNFE_IDE_CMUNFG,
        tpImp: "4",
        tpEmis: "1",
        cDV: venda.NFE_INFNFE_IDE_CDV,
        tpAmb: "2",
        finNFe: "1",
        indFinal: "1",
        indPres: "1",
        indIntermed: "0",
        procEmi: "0",
        verProc: "1.0.0",
      });

      NFe.tagEmit({
        CNPJ: venda.NFE_INFNFE_EMIT_CNPJ,
        xNome: venda.NFE_INFNFE_EMIT_NOME,
        xFant: venda.NFE_INFNFE_EMIT_FANT,
        IE: venda.NFE_INFNFE_EMIT_IE,
        CRT: venda.NFE_INFNFE_EMIT_CRT,
      });

      NFe.tagEnderEmit({
        xLgr: venda.NFE_INFNFE_EMIT_ENDEREMIT_XLGR,
        nro: venda.NFE_INFNFE_EMIT_ENDEREMIT_NRO,
        xBairro: venda.NFE_INFNFE_EMIT_ENDEREMIT_XBAIRRO,
        cMun: venda.NFE_INFNFE_EMIT_ENDEREMIT_CMUN,
        xMun: venda.NFE_INFNFE_EMIT_ENDEREMIT_XMUN,
        UF: venda.NFE_INFNFE_EMIT_ENDEREMIT_UF,
        CEP: venda.NFE_INFNFE_EMIT_ENDEREMIT_CEP,
        cPais: venda.NFE_INFNFE_EMIT_ENDEREMIT_CPAIS,
        xPais: venda.NFE_INFNFE_EMIT_ENDEREMIT_XPAIS,
      });

      // ================== PRODUTOS ==================
      NFe.tagProd(
        itens.map(item => ({
          cProd: item.det.CPROD,
          cEAN: item.det.CEAN,
          xProd: item.det.XPROD,
          NCM: item.det.NCM,
          CFOP: item.det.CFOP,
          uCom: item.det.UCOM,
          qCom: item.det.QCOM,
          vUnCom: item.det.VUNCOM,
          vProd: item.det.VPROD,
          cEANTrib: item.det.CEANTRIB,
          uTrib: item.det.UTRIB,
          qTrib: item.det.QTRIB,
          vUnTrib: item.det.VUNTRIB,
          indTot: "1",
        }))
      );

      itens.forEach((item, index) => {
        NFe.tagProdICMS(index, {
          orig: item.det.ICMS_ORIG,
          CST: item.det.ICMS_CST,
          modBC: item.det.ICMS_MODBC,
          vBC: item.det.ICMS_VBC,
          pICMS: item.det.ICMS_PICMS,
          vICMS: item.det.ICMS_VICMS,
        });

        NFe.tagProdPIS(index, {
          CST: item.det.PIS_CST,
          vBC: item.det.PIS_VBC,
          pPIS: item.det.PIS_PPIS,
          vPIS: item.det.PIS_VPIS,
        });

        NFe.tagProdCOFINS(index, {
          CST: item.det.COFINS_CST,
          vBC: item.det.COFINS_VBC,
          pCOFINS: item.det.COFINS_PCOFINS,
          vCOFINS: item.det.COFINS_VCOFINS,
        });
      });

      // ================== TOTAL / PAGAMENTO ==================
      NFe.tagTotal();
      NFe.tagTransp({ modFrete: "9" });

      NFe.tagDetPag(
        pagamentos.map(p => ({
          indPag: "0",
          tPag: p.pag.TPAG, // ex: 01, 03, 04, 17
          vPag: p.pag.VALORRECEBIDO,
        }))
      );


      tools.sefazStatus()
        .then(res => console.log('STATUS SEFAZ:', res))
        .catch(err => console.error('ERRO STATUS:', err));

      // ================== 7. GERAR / ASSINAR / ENVIAR ==================
      const xmlBase = NFe.xml();

      // Garantir que o XML base tenha UTF-8
      let xmlBaseUtf8 = xmlBase;
      if (!xmlBaseUtf8.includes('encoding="UTF-8"')) {
        xmlBaseUtf8 = xmlBaseUtf8.replace(
          /^<\?xml[^>]*\?>/,
          '<?xml version="1.0" encoding="UTF-8"?>'
        );
      }

      console.log("✅ XML gerado com UTF-8. Tamanho:", xmlBaseUtf8.length);

      const xmlAssinado = await tools.xmlSign(xmlBaseUtf8);

      // Garantir que o XML assinado também tenha UTF-8
      let xmlAssinadoUtf8 = xmlAssinado;
      if (!xmlAssinadoUtf8.includes('encoding="UTF-8"')) {
        xmlAssinadoUtf8 = xmlAssinadoUtf8.replace(
          /^<\?xml[^>]*\?>/,
          '<?xml version="1.0" encoding="UTF-8"?>'
        );
      }

      console.log("✅ XML assinado com UTF-8. Tamanho:", xmlAssinadoUtf8.length);

      const resposta = await tools.sefazEnviaLote(xmlAssinadoUtf8, { indSinc: 1 });

      return res.json({
        sucesso: true,
        resposta,
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        sucesso: false,
        erro: error.message,
      });
    }
  }

}

export default new ConsultaNfeController();