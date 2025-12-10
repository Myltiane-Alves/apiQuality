import { Make, Tools, docZip } from 'node-sped-nfe';
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

      const response = await axios.get(`http://164.152.245.77:8000/quality/concentrador/api/venda/lista-venda-new-xml.xsjs?id=${idVenda}`);
      const vendaData = response.data;

      const result = {
        venda: vendaData,
      };
      
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
      // console.log('Chave da NFe:', venda.data[0]?.venda);
      const tpNF = venda.data[0]?.venda.NFE_INFNFE_IDE_TPNF || "1";
      const idDest = venda.data[0]?.venda.NFE_INFNFE_IDE_IDDEST || "1";
      const cMunFG = venda.data[0]?.venda.NFE_INFNFE_IDE_CMUNFG || "3550308";
      const tpImp = venda.data[0]?.venda.NFE_INFNFE_IDE_TPIMP || "2";
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

      const tPag = venda.data[0]?.pagamento?.map(item => item.pag.TPAG) || "01";
      const vPag = venda.data[0]?.pagamento?.map(item => item.pag.VALORRECEBIDO) || '0';
 
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

      const payload = {
        ide: {
          chave: chave,
          cUF: ufToCodigo(uf),
          cNF: cnf,
          natOp: natOp,
          mod: mod,
          serie: serie,
          nNF: nnf,
          dhEmi: dhEmi,
          tpNF: tpNF,
          idDest: idDest,
          cMunFG: cMunFG,
          cMunFGIBS: cMunFG, // conferirir este
          tpImp: tpImp,
          tpEmis: tpEmis,
          cDV: cDV,
          tpAmb: tpAmb,
          finNFe: finNFe,
          indFinal: indFinal,
          indPres: indPres,
          procEmi: procEmi,
          verProc: "1.0",
          gCompraGov: {
            tpEnteGov: "0",
            pRedutor: "0",
            tpOperGov: "0"
          },
          gPagAntecipado: {
            refNFe: "",
            refNFe: "",
          }
        },
        emit: {
          CNPJ: cnpj,
          xNome: nome,
          xFant: nomeFantasia,
          enderEmit: {
            xLgr: xLgr,
            nro: nro,
            xBairro: xBairro,
            cMun: cMun,
            xMun: xMun,
            UF: uf,
            CEP: cep,
            cPais: cPais,
            xPais: xPais,
            fone: fone
          },
          IE: emit_IE,
          CRT: emit_CRT
        },
        autXML: {
          CNPJ: cnpj,
        },
        det: montarItens(venda),
        total: {
          ICMSTot: {
            vBC: vBC,
            vICMS: vICMS,
            vICMSDeson: icms_vicmsdeson,
            vFCP: vFCP,
            vBCST: vBCST,
            vST: vST,
            vFCPST: vFCPST,
            vFCPSTRet: vFCPSTRet,
            vProd: vProd,
            vFrete: icmsVFrete,
            vSeg: vSeg,
            vDesc: vDesc,
            vII: vII,
            vIPI: vIPI,
            vIPIDevol: vIPIDevol,
            vPIS: VPIS_VPIS,
            vCOFINS: VCOFINS_VCOFINS,
            vOutro: vOutro,
            vNF: vProd
          },
          IBSCBSTot: {
            vBCIBSCBS: "0.00",
            gIBS: {
              gIBSUF: {
                vDif: "0.00",
                vDevTrib: "0.00",
                vIBSUF: "0.05"
              },
              gIBSMun: {
                vDif: "0.00",
                vDevTrib: "0.00",
                vIBSMun: "0.00"
              },
              vIBS: "0.05",
              vCredPres: "0.00",
              vCredPresCondSus: "0.00"
            },
            gCBS: {
              vDif: "0.00",
              vDevTrib: "0.00",
              vCBS: "0.00",
              vCredPres: "0.00",
              vCredPresCondSus: "0.00"
            },
          },
          vNFTot: vProd
        },
        transp: {
          modFrete: modFrete
        },
        pag: {
          detPag: {
            tPag: tPag,
            vPag: vPag
          },
        },
      };

      return payload;
    } 
    const payload = gerarXML(vendaData);
    
    // Usa getCertOptions para carregar o certificado
    const SENHA_CERT = process.env.SENHA || "#senhagto2024#";
    const certOptions = await getCertOptions(SENHA_CERT, './GTO COMERCIO 2025-2026.pfx');
    
    if (!certOptions) {
      return res.status(500).json({
        error: 'Não foi possível carregar o certificado. Verifique as variáveis de ambiente ou o arquivo local.'
      });
    }
    
    
    const tools = new Tools({
      mod: payload.ide.mod,
      tpAmb: parseInt(payload.ide.tpAmb),
      UF: payload.emit.enderEmit.UF || "SP",
      CNPJ: payload.emit.CNPJ,
      versao: "4.00",
      xmllint: path.resolve("./libs/libxml/bin/xmllint.exe"),
    }, certOptions);
    

    let NFe = new Make()
    NFe.tagInfNFe({
      Id: `NFe${payload.ide.chave}`,
      versao: "4.00"
    });
    
    NFe.tagIde({
      cUF: ufToCodigo(payload.ide.cUF),
      cNF: payload.ide.cNF,
      natOp: payload.ide.natOp,
      mod: payload.ide.mod,
      serie: payload.ide.serie,
      nNF: payload.ide.nNF,
      dhEmi: payload.ide.dhEmi,
      tpNF: payload.ide.tpNF,
      idDest: payload.ide.idDest,
      cMunFG: payload.ide.cMunFG,
      tpImp: payload.ide.tpImp,
      tpEmis: payload.ide.tpEmis,
      cDV: payload.ide.cDV,
      tpAmb: payload.ide.tpAmb,
      finNFe: payload.ide.finNFe,
      indFinal: payload.ide.indFinal,
      indPres: payload.ide.indPres,
      procEmi: payload.ide.procEmi,
      verProc: payload.ide.verProc,

    })
    
    NFe.tagRefNFe({
      refNFe: payload.ide.gPagAntecipado.refNFe,  
    })
    NFe.tagEmit({
      CNPJ: payload.emit.CNPJ,
      xNome: payload.emit.xNome,
      xFant: payload.emit.xFant,
      IE: payload.emit.IE,
      CRT: payload.emit.CRT,
    })
    
    
    NFe.tagEnderEmit({
      xLgr: payload.emit.enderEmit.xLgr,
      nro: payload.emit.enderEmit.nro,
      xBairro: payload.emit.enderEmit.xBairro,
      cMun: payload.emit.enderEmit.cMun,
      xMun: payload.emit.enderEmit.xMun,
      CEP: payload.emit.enderEmit.CEP,
      UF: ufToCodigo(payload.emit.enderEmit?.UF),
      cPais: payload.emit.enderEmit.cPais,
      xPais: payload.emit.enderEmit.xPais,
      fone: payload.emit.enderEmit.fone,
    })

    // Processar cada item do detalhe
    
    const itens = vendaData.data[0]?.detalhe;;
    itens.forEach((item, index) => {
      
        const det = item.det;

        // Produto
        NFe.tagProd([{
            cProd: det.CPROD,
            cEAN: det.CEAN,
            xProd: det.XPROD,
            NCM: det.NCM,
            CFOP: det.CFOP,
            uCom: det.UCOM,
            qCom: det.QTRIB,
            vUnCom: det.VUNTRIB,
            vProd: det.VPROD,
            indTot: det.INDTOT
        }]);

        // ICMS
        NFe.tagProdICMS(index, {
            orig: det.ICMS_ORIG,
            CST: det.ICMS_CST,
            modBC: det.ICMS_MODBC,
            vBC: det.ICMS_VBC,
            pICMS: det.ICMS_PICMS,
            vICMS: det.ICMS_VICMS
        });

        // PIS
        NFe.tagProdPIS(index, {
            CST: det.PIS_CST,
            vBC: det.PIS_VBC,
            pPIS: det.PIS_PPIS,
            vPIS: det.PIS_VPIS
        });

        // COFINS
        NFe.tagProdCOFINS(index, {
            CST: det.COFINS_CST,
            vBC: det.COFINS_VBC,
            pCOFINS: det.COFINS_PCOFINS,
            vCOFINS: det.COFINS_VCOFINS
        });
    });

    // [payload.det.imposto].map((value, index) => {
    //   NFe.tagProdPIS(index, {
    //     CST: payload.det.imposto.PIS.PISAliq.CST[index],
    //     vAliqProd: payload.det.imposto.PIS.PISAliq.pPIS[index],
    //     vPIS: payload.det.imposto.PIS.PISAliq.vPIS[index],
    //   })
    //   NFe.tagProdCOFINS(index, {
    //     CST: payload.det.imposto.COFINS.COFINSAliq.CST[index],
    //     qBCProd: payload.det.imposto.COFINS.COFINSAliq.vBC[index],
    //     vAliqProd: payload.det.imposto.COFINS.COFINSAliq.pCOFINS[index],
    //     vCOFINS: payload.det.imposto.COFINS.COFINSAliq.vCOFINS[index],
    //   })
    // })

    // NFe.tagTotal()
    
   
    NFe.tagAutXML({
      CNPJ: payload.autXML.CNPJ
    })
    
    NFe.tagICMSTot({
      vBC: payload.total.ICMSTot.vBC,
      vICMS: payload.total.ICMSTot.vICMS,
      vICMSDeson: payload.total.ICMSTot.vICMSDeson,
      vFCP: payload.total.ICMSTot.vFCP,
      vBCST: payload.total.ICMSTot.vBCST,
      vST: payload.total.ICMSTot.vST,
      vFCPST: payload.total.ICMSTot.vFCPST,
      vFCPSTRet: payload.total.ICMSTot.vFCPSTRet,
      vProd: payload.total.ICMSTot.vProd,
      vFrete: payload.total.ICMSTot.vFrete,
      vSeg: payload.total.ICMSTot.vSeg,
      vDesc: payload.total.ICMSTot.vDesc,
      vII: payload.total.ICMSTot.vII,
      vIPI: payload.total.ICMSTot.vIPI,
      vIPIDevol: payload.total.ICMSTot.vIPIDevol,
      vPIS: payload.total.ICMSTot.vPIS,
      vCOFINS: payload.total.ICMSTot.vCOFINS,
      vOutro: payload.total.ICMSTot.vOutro,
      vNF: payload.total.ICMSTot.vNF
    })
    
    NFe.tagTransp({
      modFrete: payload.transp.modFrete
    })

    NFe.tagDetPag({
      tPag: payload.pag.detPag.tPag,
      vPag: payload.pag.detPag.vPag
    })
    
    if (payload?.ide.mod == "65") {
      // NFC-e - Usa consultarNFe
      await tools.consultarNFe(payload.ide.chave).then(res => {
        // console.log('Protocolo NFC-e:', res);
      });
    } else if (payload?.ide.mod == "55") {
      // NF-e - Usa sefazDistDFe
      await tools.sefazDistDFe({ chNFe: payload.ide.chave }).then(res => {
        // console.log('XML NF-e:', res);
      });
    }
    // await tools.sefazStatus().then(res => {
    //   console.log('Status SEFAZ:', res);
    // });

    // await tools.consultarNFe(payload.ide.chave).then(res => {
    //   console.log('Consulta NFe:', res);
    // });

    tools.xmlSign(NFe.xml()).then(async xmlSigned => {
      fs.writeFileSync(path.resolve(`./xmls/nfe_venda_${vendaData.data[0]?.venda.IDVENDA}.xml`), xmlSigned, {encoding: 'utf8'});
      tools.sefazEnviaLote(xmlSigned, {indSinc: 1}).then(res => {
        // console.log('Resposta SEFAZ:', res);
      })
    })
        // console.log('Tools inicializado:', tools);

        /* 
        
SELECT * FROM QUALITY_CONC_HML.VENDA WHERE IDVENDA = '2-1-15'

SELECT * FROM QUALITY_CONC_HML.VENDADETALHE WHERE IDVENDA = '6-1-359'

SELECT * FROM VENDADETALHE;

SELECT * FROM QUALITY_CONC_HML.VENDAPAGAMENTO WHERE IDVENDA = '2-1-15'

SELECT * FROM QUALITY_CONC_TST.VENDA WHERE IDVENDA = '6-1-359'

SELECT * FROM QUALITY_CONC.VENDA WHERE DTHORAABERTURA >= '2025-12-09';

QUADRA QR 608 CONJUNTO 7-A
407
        */

      return res.json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new ConsultaNfeController();