import { Make, Tools } from 'node-sped-nfe';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import 'dotenv/config';
import Decimal from 'decimal.js';

// Configure precisão global
Decimal.set({ precision: 10, rounding: Decimal.ROUND_HALF_UP });

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

export function roundTo(valor, casasDecimais) {
  const multiplicador = Math.pow(10, Math.abs(casasDecimais));
  return Math.round(valor * multiplicador) / multiplicador;
}
class ConsultaNfeController {
  async consultaNFce(req, res) {
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

      const response = await axios.get(`http://164.152.245.77:8000/quality/concentrador/api/venda/lista-venda-new-xml.xsjs?id=${idVenda}`);
      const vendaData = response.data;
      
      let v_TotICMS = 0;
      let v_TotPis = 0;

      let v_TotCofins = 0;
      let v_TotIBSUF = 0;
      let v_TotCBS = 0;
      let V_Tot_Desconto = 0;
      let V_ICMSTot_vNF = 0;

      const uf = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_UF || "SP";
      const cnf = vendaData.data[0]?.venda.NFE_INFNFE_IDE_CNF || "00000000";
      const natOp = vendaData.data[0]?.venda.NFE_INFNFE_IDE_NATOP || "VENDA";
      const serie = vendaData.data[0]?.venda.NFE_INFNFE_IDE_SERIE || "0";
      const nnf = vendaData.data[0]?.venda.NFE_INFNFE_IDE_NNF || "";
      const dhEmiRaw = vendaData.data[0]?.venda.NFE_INFNFE_IDE_DHEMI;
      const dhEmi = dhEmiRaw ? (dhEmiRaw.includes('T') ? dhEmiRaw : new Date(dhEmiRaw + 'T09:00:00-03:00').toISOString()) : new Date().toISOString();
      const chaveRaw = vendaData.data[0]?.venda.CHAVE || "";
      const chave = chaveRaw.replace(/^NFe/i, '').replace(/\D/g, '').slice(0, 44);
      // console.log('Chave da NFe:', vendaData.data[0]?.venda);
      const tpNF = vendaData.data[0]?.venda.NFE_INFNFE_IDE_TPNF || "1";
      const idDest = vendaData.data[0]?.venda.NFE_INFNFE_IDE_IDDEST || "1";
      const cMunFG = vendaData.data[0]?.venda.NFE_INFNFE_IDE_CMUNFG || "3550308";
      const tpImp = vendaData.data[0]?.venda.NFE_INFNFE_IDE_TPIMP || "2";
      const tpEmis = vendaData.data[0]?.venda.NFE_INFNFE_IDE_TPEMIS || "1";
      const cDV = vendaData.data[0]?.venda.NFE_INFNFE_IDE_CDV || "0";
      const tpAmb = String(vendaData.data[0]?.venda.NFE_INFNFE_IDE_TPAMB || "1");
      const finNFe = vendaData.data[0]?.venda.NFE_INFNFE_IDE_FINNFE || "1";
      const indFinal = vendaData.data[0]?.venda.NFE_INFNFE_IDE_INDFINAL || "1";
      const indPres = vendaData.data[0]?.venda.NFE_INFNFE_IDE_INDPRES || "1";
      const cnpj = vendaData.data[0]?.venda?.NFE_INFNFE_EMIT_CNPJ || "00000000000000";
      const cnpjAutxml = vendaData.data[0]?.venda?.NFE_INFNFE_AUTXML_CNPJ || "00000000000000";
      const nome = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_NOME || "Emitente Padrão";
      const nomeFantasia = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_FANT || "Fantasia Padrão";
      const cep = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_CEP || "01000000";
      const xPais = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_XPAIS || "1058";
      const cPais = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_CPAIS || "BRASIL";
      const cMun = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_CMUN || "3550308";
      const xMun = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_XMUN || "Sao Paulo";
      const xBairro = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_XBAIRRO || "Bairro";
      const nro = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_NRO || "0";
      const xLgr = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_XLGR || "Endereco";
      const emit_IE = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_IE || "";
      const emit_CRT = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_CRT || "1";
      const infCpl = vendaData.data[0]?.venda.NFE_INFNFE_INFADIC_INFCPL || "Nenhuma informação adicional";
      const vOutro = vendaData.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VOUTRO || "0.00";
      const modFrete = vendaData.data[0]?.venda.NFE_INFNFE_TRANSP_MODFRETE || "9";
      const vIPIDevol = vendaData.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VIPIDEVOL || "0";
      const vIPI = vendaData.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VIPI || "0.00";
      const vDesc = vendaData.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VDESC || "0.00";
      const vII = vendaData.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VII || "0.00";
      const vSeg = vendaData.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VSEG || "0.00";
      const vFCP = vendaData.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VFCP || "0.00";
      const vBCST = vendaData.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VBCST || "0.00";
      const vST = vendaData.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VST || "0.00";
      const vFCPST = vendaData.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VFCPST || "0.00";
      const vFCPSTRet = vendaData.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VFCPSTRET || "0.00";
      const vProd = vendaData.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VPROD || "0.01";
      const icmsVFrete = vendaData.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VFRETE || "0.00";
      const qrCode = vendaData.data[0]?.venda.NFE_INFNFESUPL_QRCODE || "";
      const icms_vicmsdeson = vendaData.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VICMSDESON || "0.00";
      const procEmi = vendaData.data[0]?.venda.NFE_INFNFE_IDE_PROCEMI || "0";
      const urlChave = vendaData.data[0]?.venda.NFE_INFNFESUPL_URLCHAVE || "www.fazenda.df.gov.br/nfce/consulta";
      const nProtRaw = vendaData.data[0]?.venda.PROTNFE_INFPROT_ID || "";
      const nProt = nProtRaw.replace(/^ID/i, '');
      const digVal = vendaData.data[0]?.venda.PROTNFE_INFPROT_DIGVAL || "";
      const xmotivo = vendaData.data[0]?.venda.PROTNFE_INFPROT_XMOTIVO || "";
      const cstat = vendaData.data[0]?.venda.PROTNFE_INFPROT_CSTAT;
      const cprod = vendaData.data[0]?.detalhe?.map(item => item.det.CPROD) || "0001";
      const cean = vendaData.data[0]?.detalhe?.map(item => item.det.CEAN) || "0000000000000";
      const xprod = vendaData.data[0]?.detalhe?.map(item => item.det.XPROD) || "Produto Teste";

      const ncm = vendaData.data[0]?.detalhe?.map(item => item.det.NCM) || "00000000";
      // const tpCredPresIBSZFM 
      const CFOP = vendaData.data[0]?.detalhe?.map(item => item.det.CFOP) || "5102";
      const uCom = vendaData.data[0]?.detalhe?.map(item => item.det.UCOM) || "UN";
      const qCom = vendaData.data[0]?.detalhe?.map(item => item.det.QCOM) || "1.0000";
      const vUnCom = vendaData.data[0]?.detalhe?.map(item => item.det.VUNCOM) || "0.01";
      const cEANTrib = vendaData.data[0]?.detalhe?.map(item => item.det.CEANTRIB) || "0000000000000";
      const uTrib = vendaData.data[0]?.detalhe?.map(item => item.det.UTRIB) || "UN";
      const qTrib = vendaData.data[0]?.detalhe?.map(item => item.det.QTRIB) || "1.0000";
      const vUnTrib = vendaData.data[0]?.detalhe?.map(item => item.det.VUNTRIB) || "0.01";
      const indTot = vendaData.data[0]?.detalhe?.map(item => item.det.INDTOT) || "1";
      const orig = vendaData.data[0]?.detalhe?.map(item => item.det.ICMS_ORIG) || "0";
      const CST = vendaData.data[0]?.detalhe?.map(item => item.det.ICMS_CST) || "00";
      const modBC = vendaData.data[0]?.detalhe?.map(item => item.det.ICMS_MODBC) || "3";
      const vBC = vendaData.data[0]?.NFE_INFNFE_TOTAL_ICMSTOT_VBC || "0.00";
      const vICMS = vendaData.data[0]?.NFE_INFNFE_TOTAL_ICMSTOT_VICMS || "0.00";
      const pICMS = vendaData.data[0]?.detalhe?.map(item => item.det.ICMS_PICMS) || "0.00";
      const PIS_CST = vendaData.data[0]?.detalhe?.map(item => item.det.PIS_CST) || "01";
      const PIS_VBC = vendaData.data[0]?.detalhe?.map(item => item.det.PIS_VBC) || "0.00";
      const PIS_PPIS = vendaData.data[0]?.detalhe?.map(item => item.det.PIS_PPIS) || "0.00";
      const VPIS_VPIS = vendaData.data[0]?.detalhe?.map(item => item.det.PIS_VPIS) || "0.00";
      const COFINS_CST = vendaData.data[0]?.detalhe?.map(item => item.det.COFINS_CST) || "01";
      const COFINS_VBC = vendaData.data[0]?.detalhe?.map(item => item.det.COFINS_VBC) || "0.00";
      const COFINS_PCOFINS = vendaData.data[0]?.detalhe?.map(item => item.det.COFINS_PCOFINS) || "0.00";
      const VCOFINS_VCOFINS = vendaData.data[0]?.detalhe?.map(item => item.det.COFINS_VCOFINS) || "0.00";
      const CSTIS = vendaData.data[0]?.detalhe?.map(item => item.det.IS_CST) || "41";
      const cClassTribIS = vendaData.data[0]?.detalhe?.map(item => item.det.IS_CCLASSTRIBIS) || "00000000";
      const vFrete = vendaData.data[0]?.detalhe?.map(item => item.det.VFRETE) || "0.00";
      
      // Acessar configurações corretamente - é um array com objeto que tem propriedade config
      const configData = vendaData.data[0]?.configuracao?.config?.[0]?.config || {};
      const tpFormaEmissao = configData.TPFORMAEMISSAO || "";
      const tpModeloFiscal = configData.TPMODELODOCFISCAL || "";
      const tpVersaoFiscal = configData.TPVERSAOMODFISCAL || "";
      const tpEmissao = configData.TPEMISSAO || "";
      const tpAmbiente = configData.TPAMBIENTE || "2"; // Default: homologação
      const dsCRT = configData.DSCRT || "";
      const cscId = configData.IDTOKEN || "1";
      const csc = configData.TOKENCSC || "";
      

      // MAPEAMENTO: Códigos do banco → Códigos SEFAZ
      function mapearTipoPagamento(tPagBanco) {
        const mapeamento = {
          '001': '01',  // Dinheiro
          '002': '02',  // Cheque
          '003': '03',  // Cartão Crédito
          '004': '04',  // Cartão Débito
          '005': '05',  // Crédito Loja
          '009': '03',  // Credsystem → Cartão Crédito
          '010': '10',  // Vale Alimentação
          '011': '11',  // Vale Refeição
          '012': '12',  // Vale Presente
          '013': '13',  // Vale Combustível
          '015': '15',  // Boleto
          '016': '16',  // Depósito
          '017': '17',  // PIX
          '018': '18',  // Transferência
          '031': '03',  // Outros cartões → Cartão Crédito
          '090': '90',  // Sem pagamento
          '099': '99'   // Outros
        };
        return mapeamento[tPagBanco] || '99';
      }

      // AGRUPAR PAGAMENTOS POR tPag (soma valores do mesmo tipo)
      function agruparPagamentos(pagamentos) {
        if (!pagamentos || pagamentos.length === 0) {
          return [{ tPag: "01", vPag: "0.00" }];
        }

        const agrupados = {};

        pagamentos.forEach(p => {
          const tPagBanco = p.pag.TPAG || "01";
          const tPagSefaz = mapearTipoPagamento(tPagBanco);
          const valor = parseFloat(p.pag.VALORRECEBIDO || 0);

          if (!agrupados[tPagSefaz]) {
            agrupados[tPagSefaz] = 0;
          }

          agrupados[tPagSefaz] += valor;
        });

        // Converter objeto em array
        return Object.entries(agrupados).map(([tPag, vPag]) => ({
          tPag: tPag,
          vPag: vPag.toFixed(2)
        }));
      }

      const pagamentosAgrupados = agruparPagamentos(vendaData.data[0]?.pagamento);
    

      function montarItens(venda) {
        const itens = venda.data[0]?.detalhe || [];

        return itens.map((item, index) => {
          const det = item.det;

          return {
            nItem: index + 1,
            prod: {
              cProd: det.CPROD,
              cEAN: det.CEAN,
              xProd: det.XPROD,
              NCM: det.NCM,
              CFOP: det.CFOP,
              uCom: det.UCOM,
              qCom: det.QCOM,
              vUnCom: det.VUNCOM,
              vProd: det.VPROD,
              cEANTrib: det.CEANTRIB,
              uTrib: det.UTRIB,
              qTrib: det.QTRIB,
              vUnTrib: det.VUNTRIB,
              indTot: det.INDTOT
            },

            imposto: {
              ICMS: {
                ICMS00: {
                  orig: det.ICMS_ORIG || "0",
                  CST: det.ICMS_CST || "00",
                  modBC: det.ICMS_MODBC || "3",
                  vBC: det.ICMS_VBC || "0.00",
                  pICMS: det.ICMS_PICMS || "0.00",
                  vICMS: det.ICMS_VICMS || "0.00"
                }
              },

              PIS: {
                PISAliq: {
                  CST: det.PIS_CST || "01",
                  vBC: det.PIS_VBC || "0.00",
                  pPIS: det.PIS_PPIS || "0.00",
                  vPIS: det.PIS_VPIS || "0.00"
                }
              },

              COFINS: {
                COFINSAliq: {
                  CST: det.COFINS_CST || "01",
                  vBC: det.COFINS_VBC || "0.00",
                  pCOFINS: det.COFINS_PCOFINS || "0.00",
                  vCOFINS: det.COFINS_VCOFINS || "0.00"
                }
              },

              ISSQN: det.IS_CST
                ? {
                  ISSQN: {
                    cSitTrib: det.IS_CST || "N",
                    cListServ: det.IS_CCLASSTRIBIS || "0000",
                    vBC: det.IS_VBC || "0.00",
                    vAliq: det.IS_VALIQ || "0.00",
                    vISSQN: det.IS_VISSQN || "0.00"
                  }
                }
                : undefined
            }
          };
        });
      }
   


      // Usa getCertOptions para carregar o certificado
      const SENHA_CERT = process.env.SENHA || "#senhagto2024#";
      const certOptions = await getCertOptions(SENHA_CERT, './GTO COMERCIO 2025-2026.pfx');

      if (!certOptions) {
        return res.status(500).json({
          error: 'Não foi possível carregar o certificado. Verifique as variáveis de ambiente ou o arquivo local.'
        });
      }

      const tools = new Tools({
        mod: "65",
        UF: uf || "SP",
        tpAmb: parseInt(tpAmb) || 2, // Fallback para homologação
        CSC: csc,
        CSCid: cscId ,
        versao: "4.00",
        xmllint: path.resolve("./libs/libxml/bin/xmllint.exe"),
      }, certOptions);

      let NFe = new Make()
      NFe.tagInfNFe({
        Id: `NFe${chave}`,
        versao: "4.00"
      });

      NFe.tagIde({
        cUF: ufToCodigo(uf),
        cNF: cnf,
        natOp: String(natOp),
        mod: "65",
        serie: serie,
        nNF: nnf,
        dhEmi: dhEmi,
        tpNF: tpNF,
        idDest: idDest,
        cMunFG: cMunFG,
        tpImp: tpImp,
        tpEmis: tpEmis,
        cDV: cDV,
        tpAmb: tpAmbiente,
        finNFe: finNFe,
        indFinal: indFinal,
        indPres: indPres,
        procEmi: procEmi,
        verProc: "1.0",

      })


      NFe.tagEmit({
        CNPJ: String(cnpj),
        xNome: nome,
        xFant: nomeFantasia,
        IE: emit_IE,
        CRT: emit_CRT,
      })


      NFe.tagEnderEmit({
        xLgr: xLgr,
        nro: nro,
        xBairro: xBairro,
        cMun: cMun,
        xMun: xMun,
        UF: uf,
        CEP: cep,
        cPais: cPais,
        xPais: xPais
      })

      NFe.tagAutXML({
        CNPJ: cnpjAutxml
      })
      // Processar cada item do detalhe

      const itens = vendaData.data[0]?.detalhe || [];

      // Primeiro: construir array de produtos para passar ao tagProd
      const produtosArray = itens.map((item, index) => {
        const det = item.det;
        const vrUnit = parseFloat(det.VUNCOM) || 0;
        const qtd = parseFloat(det.QCOM) || 0;
        
        return {
          cProd: det.CPROD,
          cEAN: det.CEAN || "SEM GTIN",
          xProd: det.XPROD,
          NCM: det.NCM,
          CFOP: det.CFOP,
          uCom: det.UCOM,
          qCom: det.QCOM,
          vUnCom: det.VUNCOM,
          vProd: roundTo(vrUnit * qtd, 2),
          cEANTrib: det.CEANTRIB || "SEM GTIN",
          uTrib: det.UTRIB,
          qTrib: det.QTRIB,
          vUnTrib: det.VUNTRIB,
          vDesc: det.VDESC,
          indTot: det.INDTOT
        };
      });

      // Passar array completo de produtos de uma vez
      NFe.tagProd(produtosArray);

      // Processar impostos de cada item
      itens.forEach((item, index) => {
        const det = item.det;
        const crt = emit_CRT;

        // ICMS
        if (crt === "1") {
          NFe.tagProdICMSSN(index, { orig: "0", CSOSN: "102" });
        } else {
          NFe.tagProdICMS(index, {
            CST: det.ICMS_CST || "00",
            orig: det.ICMS_ORIG || "0",
            modBC: det.ICMS_MODBC || "3",
            vBC: det.ICMS_VBC || "0.00",
            pICMS: det.ICMS_PICMS || "0.00",
            vICMS: det.ICMS_VICMS || "0.00"
          });
        }

        // PIS
        NFe.tagProdPIS(index, {
          CST: det.PIS_CST || "01",
          vBC: det.PIS_VBC || "0.00",
          pPIS: det.PIS_PPIS || "0.00",
          vPIS: det.PIS_VPIS || "0.00"
        });

        // COFINS
        NFe.tagProdCOFINS(index, {
          CST: det.COFINS_CST || "01",
          vBC: det.COFINS_VBC || "0.00",
          pCOFINS: det.COFINS_PCOFINS || "0.00",
          vCOFINS: det.COFINS_VCOFINS || "0.00"
        });
      });

      // Calcular totais automaticamente
      NFe.tagTotal();

      NFe.tagTransp({
        modFrete: modFrete
      })

      // Pagamentos
      const pagamentosFormatados = pagamentosAgrupados.map(p => ({
        indPag: 0,
        tPag: p.tPag,
        vPag: p.vPag
      }));
      NFe.tagDetPag(pagamentosFormatados);

      // Informações adicionais
      const idVendaInfo = vendaData.data[0]?.venda.IDVENDA || idVenda;
      const infCplCompleto = `Nº VENDA: ${idVendaInfo} - PRAZO DE TROCA: VALIDO POR 30 DIAS`;
      // NFe.tagInfAdic({
      //   infCpl: infCplCompleto
      // });

     NFe.tagInfAdic({
        infCpl: infCpl,
        tpAmb: tpAmbiente,
        verAplic: "1.0",
        chNFe: chave,
        dhRecbto: new Date().toISOString(),
        nProt: nProt,
        digVal: digVal,
        cStat: cstat,
        cMotivo: xmotivo,
      })


      // Gerar XML antes de assinar
      fs.writeFileSync(`./xmls/nfe${chave}.xml`, NFe.xml(), { encoding: "utf-8" });
      
      tools.sefazStatus().then(s => console.log(JSON.stringify(s, null, 2))).catch(err => console.log(err, 'erro status'));

      // tools.xmlSign(NFe.xml()).then(async xmlSign => {
      //   fs.writeFileSync(`./xmls/nfce${chave}.xml`, xmlSign, { encoding: "utf-8" });
      //   tools.sefazEnviaLote(xmlSign, { indSinc: 1 }).then(res => {
      //       fs.writeFileSync("ret.json", JSON.stringify(res, null, 2), { encoding: "utf-8" });
      //       console.log('Resposta SEFAZ:', res);
      //   }).catch(err => {
      //       fs.writeFileSync("err.json", JSON.stringify(err, null, 2), { encoding: "utf-8" });
      //       console.log(err, 'erro sefazEnviaLote');
      //   });
      // }).catch(err => {
      //     console.log(err, 'erro tools');
      // })



      return res.json(vendaData);
    } catch (error) {
      console.error('Erro ao consultar venda ou gerar XML:', error);
      return res.status(500).json({ error: 'Erro ao consultar venda ou gerar XML' });
    }
  }
}
export default new ConsultaNfeController();

