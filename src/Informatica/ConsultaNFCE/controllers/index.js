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

      const response = await axios.get(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/venda/lista-venda-new-xml.xsjs?id=${idVenda}`);
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

      const modFrete = vendaData.data[0]?.venda.NFE_INFNFE_TRANSP_MODFRETE || "9";
      const procEmi = vendaData.data[0]?.venda.NFE_INFNFE_IDE_PROCEMI || "0";
      const nProtRaw = vendaData.data[0]?.venda.PROTNFE_INFPROT_ID || "";
      const nProt = nProtRaw.replace(/^ID/i, '');
      const digVal = vendaData.data[0]?.venda.PROTNFE_INFPROT_DIGVAL || "";
      const xmotivo = vendaData.data[0]?.venda.PROTNFE_INFPROT_XMOTIVO || "";
      const cstat = vendaData.data[0]?.venda.PROTNFE_INFPROT_CSTAT;
  
      
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

      // Função para formatar data no timezone Brasil (-03:00) sem milissegundos
      const formatarDataBrasil = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}-03:00`;
      };

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
        dhEmi: formatarDataBrasil(),
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

       // Segundo: calcular impostos e aplicar para cada produto
      itens.forEach((item, index) => {
        const det = item.det;

        //1. Calcular valor base do Item
        const vrUnit = parseFloat(det.VUNCOM) || 0;
        const qtd = parseFloat(det.QCOM) || 0;
        const vrDesconto = parseFloat(det.VDESC) || 0;

        // Fórmula: VrCalculado = (VrUnit * qtd) - VrDesconto
        const VrCalculado = roundTo((vrUnit * qtd) - vrDesconto, 2);

        // Acumular total da nota e descontos
        V_ICMSTot_vNF += VrCalculado;
        V_Tot_Desconto += vrDesconto;


        // 2.vERIFICAR REGIME TRIBUTÁRIO
        const crt = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_CRT || "3";
        const uf = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_UF || "SP";
        const ncm = det.NCM || "";

        // Calcular ICMS
        let icmsData = {}

        if (crt == "1") {
          // Simples Nacional
          icmsData = {
            CSOSN: "102",
            orig: "0",
            vBC: 0,
            pICMS: 0,
            vICMS: 0
          };
          // Simples Nacional: NÃO acumula v_TotICMS
        } else {
          // Regime Normal
          if ((ncm === "38089429" || ncm === "22072019") && uf === "DF") {
            icmsData = {
              CST: "40", // ISENTO
              orig: "0",
              vBC: 0,
              pICMS: 0,
              vICMS: 0
            };
            // Não acumula ICMS
          } else {
            // Caso 2: Outros Produtos
            let pICMS = 19.00;

            if (uf === "DF") {
              // DF: usa % do produto se >= 12, senão 20%
              const percProduto = parseFloat(det.ICMS_PICMS) || 0;
              pICMS = (percProduto >= 12) ? percProduto : 20.00;
            }

            const vICMS = roundTo(VrCalculado * (pICMS / 100), 2);

            icmsData = {
              CST: "00", // TRIBUTADO INTEGRALMENTE
              orig: "0", // Nacional
              modBC: "3", // Valor da Operação
              vBC: VrCalculado,
              pICMS: pICMS,
              vICMS: vICMS
            };

            // Acumular total de ICMS
            v_TotICMS += vICMS;
          }
        }

        // 4.Calcular PIS
        let pisData = {}

        if (crt == "1") {
          // Simples Nacional: PIS não aplicável na nota
          pisData = { CST: "49", vBC: 0, pPIS: 0, vPIS: 0 };
        } else {
          if (ncm === "38089429") {
            // Produto não tributável
            pisData = {
              CST: "04",  // Operação não tributável
              vBC: 0,
              pPIS: 0,
              vPIS: 0
            };
          } else {
            // Produto normal: 1.65%
            const vPIS = roundTo(VrCalculado * 0.0165, 2);

            pisData = {
              CST: "01",  // Operação tributável
              vBC: VrCalculado,
              pPIS: 1.65,
              vPIS: vPIS
            }

            // Acumular total de PIS
            v_TotPis += vPIS;
          }
        }

        // 5.Calcular COFINS
        let cofinsData = {}

        if (crt == "1") {
          // Simples Nacional: COFINS não aplicável na nota
          cofinsData = { CST: "49", vBC: 0, pCOFINS: 0, vCOFINS: 0 };
        } else {
          if (ncm === "38089429") {
            // Produto não tributável
            cofinsData = {
              CST: "04",  // Operação não tributável
              vBC: 0,
              pCOFINS: 0,
              vCOFINS: 0
            };
          } else {
            // Produto normal: 7.60%
            const vCOFINS = roundTo(VrCalculado * 0.076, 2);

            cofinsData = {
              CST: "01",  // Operação tributável
              vBC: VrCalculado,
              pCOFINS: 7.60,
              vCOFINS: vCOFINS
            }

            // Acumular total de COFINS
            v_TotCofins += vCOFINS;
          }
        }

        // ===== 6. CALCULAR IBS/CBS (REFORMA TRIBUTÁRIA) =====
        let ibscbsData = {};

        if (crt !== "1") {
          // Regime Normal

          // IBS Estadual UF: 0.10%
          const vIBSUF = roundTo(VrCalculado * 0.001, 2);

          //  CBS Federal: 0,90%
          const vCBS = roundTo(VrCalculado * 0.009, 2);

          ibscbsData = {
            CST: "000",
            cClassTrib: "000001",
            gIBSCBS: {
              vBC: VrCalculado,
              vIBS: vIBSUF + 0,  // IBS UF + IBS Mun
              gIBSUF: {
                pIBSUF: 0.10,
                vIBSUF: vIBSUF
              },
              gIBSMun: {
                pIBSMun: 0,
                vIBSMun: 0
              },
              gCBS: {
                pCBS: 0.90,
                vCBS: vCBS
              }
            }
          };

          // Acumular totais IBS/CBS
          v_TotIBSUF += vIBSUF;
          v_TotCBS += vCBS;
        }

        // ===== 7. MONTAR OBJETO DO ITEM COM IMPOSTOS =====
        const itemComImposto = {
          nItem: index + 1,
          prod: {
            cProd: det.CPROD,
            cEAN: det.CEAN || "SEM GTIN",
            xProd: det.XPROD,
            NCM: det.NCM,
            CFOP: det.CFOP,
            uCom: det.UCOM,
            qCom: det.QCOM,
            vUnCom: det.VUNCOM,
            vProd: roundTo(vrUnit * qtd, 2),
            vDesc: vrDesconto,
            cEANTrib: det.CEANTRIB || "SEM GTIN",
            uTrib: det.UTRIB,
            qTrib: det.QTRIB,
            vUnTrib: det.VUNTRIB,
            indTot: det.INDTOT
          },
          imposto: {
            vTotTrib: 0,  // Lei da Transparência
            ICMS: icmsData,
            PIS: pisData,
            COFINS: cofinsData,
            IBSCBS: ibscbsData
          }
        };

        // ===== TOTAIS DA NOTA =====
        const totais = {
          ICMSTot: {
            vBC: (crt === "1") ? 0 : V_ICMSTot_vNF,
            vICMS: v_TotICMS,
            vICMSDeson: 0,
            vFCP: 0,
            vBCST: 0,
            vST: 0,
            vFCPST: 0,
            vFCPSTRet: 0,
            vProd: V_ICMSTot_vNF + V_Tot_Desconto,  // Valor bruto dos produtos
            vFrete: 0,
            vSeg: 0,
            vDesc: V_Tot_Desconto,
            vII: 0,
            vIPI: 0,
            vIPIDevol: 0,
            vPIS: v_TotPis,
            vCOFINS: v_TotCofins,
            vOutro: 0,
            vNF: V_ICMSTot_vNF  // Valor líquido da nota
          },

          IBSCBSTot: {
            vBCIBSCBS: V_ICMSTot_vNF,
            gIBS: {
              vIBS: v_TotIBSUF,
              vCredPres: 0,
              vCredPresCondSus: 0,
              gIBSUF: {
                vDif: 0,
                vDevTrib: 0,
                vIBSUF: v_TotIBSUF
              },
              gIBSMun: {
                vDif: 0,
                vDevTrib: 0,
                vIBSMun: 0
              }
            },
            gCBS: {
              vDif: 0,
              vDevTrib: 0,
              vCBS: v_TotCBS,
              vCredPres: 0,
              vCredPresCondSus: 0
            }
          },

          vNFTot: V_ICMSTot_vNF  // Valor total da NF com impostos
        };

        // ===== LEI DA TRANSPARÊNCIA (IBPT) =====
        const OlhoImposto_Fed = roundTo(V_ICMSTot_vNF * 0.2524, 2);  // 25,24% Federal
        const OlhoImposto_UF = roundTo(V_ICMSTot_vNF * 0.1941, 2);   // 19,41% Estadual

        const infCpl = `Você pagou aproximadamente R$ ${OlhoImposto_Fed.toFixed(2)} tributos federais; ` +
          `R$ ${OlhoImposto_UF.toFixed(2)} tributos estaduais; ` +
          `R$ 0,00 tributos municipais. Fonte: IBPT/FECOMERCIO RS`;

        // console.log('Informações complementares:', infCpl);

        // Aplicar impostos para este produto específico
        // NFe.tagImposto(index, { vTotTrib: "0.00" });
        NFe.tagProdICMS(index, icmsData);
        NFe.tagProdPIS(index, pisData);
        NFe.tagProdCOFINS(index, cofinsData);
        NFe.tagProdIBSCBS(index, ibscbsData);

        NFe.tagTotal({
          ICMSTot: {
            vBC: totais.ICMSTot.vBC,
            vICMS: totais.ICMSTot.vICMS,
            vICMSDeson: totais.ICMSTot.vICMSDeson,
            vFCP: totais.ICMSTot.vFCP,
            vBCST: totais.ICMSTot.vBCST,
            vST: totais.ICMSTot.vST,
            vFCPST: totais.ICMSTot.vFCPST,
            vFCPSTRet: totais.ICMSTot.vFCPSTRet,
            vProd: totais.ICMSTot.vProd,
            vFrete: totais.ICMSTot.vFrete,
            vSeg: totais.ICMSTot.vSeg,
            vDesc: totais.ICMSTot.vDesc,
            vII: totais.ICMSTot.vII,
            vIPI: totais.ICMSTot.vIPI,
            vIPIDevol: totais.ICMSTot.vIPIDevol,
            vPIS: totais.ICMSTot.vPIS,
            vCOFINS: totais.ICMSTot.vCOFINS,
            vOutro: totais.ICMSTot.vOutro,
            vNF: totais.ICMSTot.vNF
          },
          IBSCBSTot: {
            vBCIBSCBS: totais.IBSCBSTot.vBCIBSCBS,
            gIBS: {
              vIBS: totais.IBSCBSTot.gIBS.vIBS,
              vCredPres: totais.IBSCBSTot.gIBS.vCredPres,
              vCredPresCondSus: totais.IBSCBSTot.gIBS.vCredPresCondSus,
              gIBSUF: {
                vDif: totais.IBSCBSTot.gIBS.gIBSUF.vDif,
                vDevTrib: totais.IBSCBSTot.gIBS.gIBSUF.vDevTrib,
                vIBSUF: totais.IBSCBSTot.gIBS.gIBSUF.vIBSUF
              },
              gIBSMun: {
                vDif: totais.IBSCBSTot.gIBS.gIBSMun.vDif,
                vDevTrib: totais.IBSCBSTot.gIBS.gIBSMun.vDevTrib,
                vIBSMun: totais.IBSCBSTot.gIBS.gIBSMun.vIBSMun
              }
            },
            gCBS: {
              vDif: totais.IBSCBSTot.gCBS.vDif,
              vDevTrib: totais.IBSCBSTot.gCBS.vDevTrib,
              vCBS: totais.IBSCBSTot.gCBS.vCBS,
              vCredPres: totais.IBSCBSTot.gCBS.vCredPres,
              vCredPresCondSus: totais.IBSCBSTot.gCBS.vCredPresCondSus
            }
          },
          vNFTot: totais.vNFTot
        })
      });

      // ===== LEI DA TRANSPARÊNCIA (IBPT) - APÓS O LOOP =====
      const OlhoImposto_Fed = roundTo(V_ICMSTot_vNF * 0.2524, 2);  // 25,24% Federal
      const OlhoImposto_UF = roundTo(V_ICMSTot_vNF * 0.1941, 2);   // 19,41% Estadual
      const enderecoProconDF = `PROCON - DF - 151;SCS, QD. 08, BL. B-60, SALA 240, VENANCIO 2000`;
      const enderecoProconGO = `PROCON - 151;Rua 8, N . 242 QD. 5, LT. 36, St. Central, Goiania - GO`;

      
      const enderecoProcon = uf === "GO" ? enderecoProconGO : uf === "DF" ? enderecoProconDF : "";

      const infCpl = `Você pagou aproximadamente R$ ${OlhoImposto_Fed.toFixed(2)} tributos federais; ` +
        `R$ ${OlhoImposto_UF.toFixed(2)} tributos estaduais; ` +
        `R$ 0,00 tributos municipais. Fonte: IBPT/FECOMERCIO RS Xe67Eq` +
        (enderecoProcon ? ` ${enderecoProcon}` : '') +
        `Nº VENDA: ${response.data[0]?.venda.IDVENDA} ` +
        `PRAZO DE TROCA: VALIDO POR 30 DIAS;`
        ;

      NFe.tagTransp({
        modFrete: modFrete
      })

          // Formatar array para a biblioteca (adicionar indPag se necessário)
      const pagamentosFormatados = Array.isArray(payload.pag.detPag)
        ? payload.pag.detPag.map((p, idx) => ({
          indPag: 0, // 0=Pagamento à Vista
          tPag: p.tPag,
          vPag: p.vPag
        }))
      : [{ indPag: 0, tPag: "01", vPag: "0.00" }];
      
      NFe.tagDetPag(pagamentosFormatados);


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

      NFe.taginfNFeSupl({
        qrCode: payload.infNFeSupl.qrCode,
        urlChave: payload.infNFeSupl.urlChave,
      });
      
      // Gerar XML antes de assinar
      fs.writeFileSync(`./xmls/nfe${chave}.xml`, NFe.xml(), { encoding: "utf-8" });
      
      tools.sefazStatus().then(s => console.log(JSON.stringify(s, null, 2))).catch(err => console.log(err, 'erro status'));

      tools.xmlSign(NFe.xml()).then(async xmlSign => {
        fs.writeFileSync(`./xmls/nfce${chave}.xml`, xmlSign, { encoding: "utf-8" });
        tools.sefazEnviaLote(xmlSign, { indSinc: 1 }).then(res => {
            fs.writeFileSync("./xml-logs/ret.json", JSON.stringify(res, null, 2), { encoding: "utf-8" });
            console.log('Resposta SEFAZ:', res);
        }).catch(err => {
            fs.writeFileSync("./xmlogs-erros/err.json", JSON.stringify(err, null, 2), { encoding: "utf-8" });
            console.log(err, 'erro sefazEnviaLote');
        });
      }).catch(err => {
          console.log(err, 'erro tools');
      })



      return res.json(vendaData);
    } catch (error) {
      console.error('Erro ao consultar venda ou gerar XML:', error);
      return res.status(500).json({ error: 'Erro ao consultar venda ou gerar XML' });
    }
  }
}
export default new ConsultaNfeController();