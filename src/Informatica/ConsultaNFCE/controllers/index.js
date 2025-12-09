import { Tools, docZip } from 'node-sped-nfe';
import fs from 'fs';
import xlsx from 'xlsx';
import path from 'path';
import archiver from 'archiver';
import axios from 'axios';
import os from 'os';
import { Sign } from 'crypto';
import 'dotenv/config';

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

class ConsultaNfeController {
  async issueFromVendaId(req, res) {
    try {
      let { idVenda } = req.query;

      if (!idVenda) {
        return res.status(400).json({ error: "idVenda é obrigatório" });
      }
      // console.log('Iniciando consulta de venda para idVenda:', idVenda);
      // Função local para converter UF
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

      // Função local para gerar XML
      /*
      se a tag do imposto 0.10 e não for maior que 1 centavos, deve ser preenchida com 0.00
      */
      //  console.log('Iniciando consulta de venda para idVenda:', idVenda);
      function gerarXML(venda) {

        const uf = venda.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_UF || "SP";
        const cnf = venda.data[0]?.venda.NFE_INFNFE_IDE_CNF || "00000000";
        const natOp = venda.data[0]?.venda.NFE_INFNFE_IDE_NATOP || "VENDA";
        const mod = venda.data[0]?.venda.NFE_INFNFE_IDE_MOD || "65" || "55";
        const serie = venda.data[0]?.venda.NFE_INFNFE_IDE_SERIE || "0";
        const nnf = venda.data[0]?.venda.NFE_INFNFE_IDE_NNF || "";
        const dhEmi = venda.data[0]?.venda.NFE_INFNFE_IDE_DHEMI || new Date().toISOString();
        const chaveRaw = venda.data[0]?.venda.CHAVE || "";
        const chave = chaveRaw.replace(/^NFe/i, '').replace(/\D/g, '').slice(0, 44);
        const tpNF = venda.data[0]?.venda.NFE_INFNFE_IDE_TPNF || "1";
        const idDest = venda.data[0]?.venda.NFE_INFNFE_IDE_IDDEST || "1";
        const cMunFG = venda.data[0]?.venda.NFE_INFNFE_IDE_CMUNFG || "3550308";
        const tpImp = venda.data[0]?.venda.NFE_INFNFE_IDE_TPIMP || "4";
        const tpEmis = venda.data[0]?.venda.NFE_INFNFE_IDE_TPEMIS || "1";
        const cDV = venda.data[0]?.venda.NFE_INFNFE_IDE_CDV || "0";
        const tpAmb = venda.data[0]?.venda.NFE_INFNFE_IDE_TPAMB || "2";
        const finNFe = venda.data[0]?.venda.NFE_INFNFE_IDE_FINNFE || "1";
        const indFinal = venda.data[0]?.venda.NFE_INFNFE_IDE_INDFINAL || "1";
        const indPres = venda.data[0]?.venda.NFE_INFNFE_IDE_INDPRES || "1";
        const cnpj = venda.data[0]?.venda?.NFE_INFNFE_EMIT_CNPJ || "00000000000000";
        const nome = venda.data[0]?.venda.NFE_INFNFE_EMIT_NOME || "Emitente Padrão";
        const nomeFantasia = venda.data[0]?.venda.NFE_INFNFE_EMIT_FANT || "Fantasia Padrão";
        const cStat = venda.data[0]?.venda.PROTNFE_INFPROT_CSTAT || "100";
        const cep = venda.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_CEP || "01000000";
        const xPais = venda.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_XPAIS || "1058";
        const cPais = venda.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_CPAIS || "BRASIL";
        const fone = venda.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_FONE || "0000000000";
        const cMun = venda.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_CMUN || "3550308";
        const xMun = venda.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_XMUN || "Sao Paulo";
        const xBairro = venda.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_XBAIRRO || "Bairro";
        const nro = venda.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_NRO || "0";
        const xLgr = venda.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_XLGR || "Endereco";
        const emit_IE = venda.data[0]?.venda.NFE_INFNFE_EMIT_IE || "";
        const emit_CRT = venda.data[0]?.venda.NFE_INFNFE_EMIT_CRT || "1";
        const infCpl = venda.data[0]?.venda.NFE_INFNFE_INFADIC_INFCPL || "Nenhuma informação adicional";
        const vOutro = venda.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VOUTRO || "0.00";
        const modFrete = venda.data[0]?.venda.NFE_INFNFE_TRANSP_MODFRETE || "9";
        const vIPIDevol = venda.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VIPIDEVOL || "0";
        const vIPI = venda.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VIPI || "0.00";
        const vDesc = venda.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VDESC || "0.00";
        const vII = venda.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VII || "0.00";
        const vSeg = venda.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VSEG || "0.00";
        const vFCP = venda.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VFCP || "0.00";
        const vBCST = venda.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VBCST || "0.00";
        const vST = venda.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VST || "0.00";
        const vFCPST = venda.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VFCPST || "0.00";
        const vFCPSTRet = venda.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VFCPSTRET || "0.00";
        const vProd = venda.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VPROD || "0.01";
        const icmsVFrete = venda.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VFRETE || "0.00";
        const qrCode = venda.data[0]?.venda.NFE_INFNFE_INFNFESUPL_QRCODE || "";
        const icms_vicmsdeson = venda.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VICMSDESON || "0.00";
        const procEmi = venda.data[0]?.venda.NFE_INFNFE_IDE_PROCEMI || "0";
        const urlChave = venda.data[0]?.venda.NFE_INFNFESUPL_URLCHAVE || "";

        const cprod = venda.data[0]?.detalhe?.map(item => item.det.CPROD) || "0001";
        const cean = venda.data[0]?.detalhe?.map(item => item.det.CEAN) || "0000000000000";
        const xprod = venda.data[0]?.detalhe?.map(item => item.det.XPROD) || "Produto Teste";

        const ncm = venda.data[0]?.detalhe?.map(item => item.det.NCM) || "00000000";
        // const tpCredPresIBSZFM 
        const CFOP = venda.data[0]?.detalhe?.map(item => item.det.CFOP) || "5102";
        const uCom = venda.data[0]?.detalhe?.map(item => item.det.UCOM) || "UN";
        const qCom = venda.data[0]?.detalhe?.map(item => item.det.QCOM) || "1.0000";
        const vUnCom = venda.data[0]?.detalhe?.map(item => item.det.VUNCOM) || "0.01";
        const cEANTrib = venda.data[0]?.detalhe?.map(item => item.det.CEANTRIB) || "0000000000000";
        const uTrib = venda.data[0]?.detalhe?.map(item => item.det.UTRIB) || "UN";
        const qTrib = venda.data[0]?.detalhe?.map(item => item.det.QTRIB) || "1.0000";
        const vUnTrib = venda.data[0]?.detalhe?.map(item => item.det.VUNTRIB) || "0.01";
        const indTot = venda.data[0]?.detalhe?.map(item => item.det.INDTOT) || "1";
        const orig = venda.data[0]?.detalhe?.map(item => item.det.ICMS_ORIG) || "0";
        const CST = venda.data[0]?.detalhe?.map(item => item.det.ICMS_CST) || "00";
        const modBC = venda.data[0]?.detalhe?.map(item => item.det.ICMS_MODBC) || "3";
        const vBC = venda.data[0]?.NFE_INFNFE_TOTAL_ICMSTOT_VBC || "0.00";
        const vICMS = venda.data[0]?.NFE_INFNFE_TOTAL_ICMSTOT_VICMS || "0.00";
        const pICMS = venda.data[0]?.detalhe?.map(item => item.det.ICMS_PICMS) || "0.00";
        const PIS_CST = venda.data[0]?.detalhe?.map(item => item.det.PIS_CST) || "01";
        const PIS_VBC = venda.data[0]?.detalhe?.map(item => item.det.PIS_VBC) || "0.00";
        const PIS_PPIS = venda.data[0]?.detalhe?.map(item => item.det.PIS_PPIS) || "0.00";
        const VPIS_VPIS = venda.data[0]?.detalhe?.map(item => item.det.PIS_VPIS) || "0.00";
        const COFINS_CST = venda.data[0]?.detalhe?.map(item => item.det.COFINS_CST) || "01";
        const COFINS_VBC = venda.data[0]?.detalhe?.map(item => item.det.COFINS_VBC) || "0.00";
        const COFINS_PCOFINS = venda.data[0]?.detalhe?.map(item => item.det.COFINS_PCOFINS) || "0.00";
        const VCOFINS_VCOFINS = venda.data[0]?.detalhe?.map(item => item.det.COFINS_VCOFINS) || "0.00";
        const CSTIS = venda.data[0]?.detalhe?.map(item => item.det.IS_CST) || "41";
        const cClassTribIS = venda.data[0]?.detalhe?.map(item => item.det.IS_CCLASSTRIBIS) || "00000000";
        const vFrete = venda.data[0]?.detalhe?.map(item => item.det.VFRETE) || "0.00";

        const tPag = venda.data[0]?.pagamento?.map(item => item.TPAG) || "01";
        const vPag = venda.data[0]?.pagamento?.map(item => item.VALORRECEBIDO) || '0';

      }

      // Fazer requisição para obter dados da venda
      // console.log('Fazendo requisição para venda idVenda:', idVenda);
      const response = await axios.get(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/venda/lista-venda-new-xml.xsjs?id=${idVenda}`);
      // console.log('venda:', response);
      const vendaData = response.data;
      const payload = gerarXML(vendaData);
      const result = {
        venda: vendaData,
        payload,
      };
        const chaveRaw = vendaData.data[0]?.venda.CHAVE || "";
        const chave = chaveRaw.replace(/^NFe/i, '').replace(/\D/g, '').slice(0, 44);

      // Usa getCertOptions para carregar o certificado
      const SENHA = process.env.CERT_SENHA || "#senhagto2024#";
      const certOptions = await getCertOptions(SENHA, 'GTO COMERCIO 2025-2026.pfx');

      if (!certOptions) {
        return res.status(500).json({
          error: 'Não foi possível carregar o certificado. Verifique as variáveis de ambiente ou o arquivo local.'
        });
      }

      console.log('Certificado carregado:', {
        tipo: certOptions.pfx ? 'PFX' : 'PEM',
        tamanho: certOptions.pfx?.length,
        temCaminho: !!certOptions.pfxPath,
        caminho: certOptions.pfxPath
      });

      console.log('Params Tools:', {
        mod: payload.ide.mod,
        tpAmb: parseInt(payload.ide.tpAmb),
        UF: vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_UF || "SP",
      });

      // Tenta primeiro com o caminho do arquivo (algumas versões da lib precisam)
      const certOptionsForTools = certOptions.pfxPath
        ? { pfx: certOptions.pfxPath, senha: certOptions.senha }
        : certOptions;

      try {
        const tools = new Tools({
          mod: payload.ide.mod,
          tpAmb: parseInt(payload.ide.tpAmb),
          UF: vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_UF || "SP",
          CNPJ: payload.emit.CNPJ,
          versao: "4.00",
          xmllint: path.resolve("./libs/libxml/bin/xmllint.exe"),
        }, certOptionsForTools);

        console.log('Tools inicializado:', tools);
        await tools.sefazDistDFe({ chNFe: chave }).then(res => {
          console.log('sefazDistDFe resposta:', res);
          docZip(res).then(res => {
            console.log('Conteúdo do ZIP retornado pela sefazDistDFe:', res);

          })

        }).catch(err => {
          console.error('Erro ao consultar sefazDistDFe:', err);
        })


      } catch (e) {
        console.error('Erro ao inicializar Tools:', e.message);
        console.error('Stack:', e.stack);
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