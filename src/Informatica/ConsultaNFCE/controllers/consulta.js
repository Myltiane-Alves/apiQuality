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
    async getListaVendasContigenciaValidas(req, res) {
    // Extrai parâmetros de paginação da query string
    const { page = 1, pageSize = 150 } = req.query;

    try {
      const apiUrl = `http://164.152.245.77:8000/quality/concentrador_homologacao/api/venda/valida-venda-contingencia.xsjs?page=${page}&pageSize=${pageSize}`
      const response = await axios.get(apiUrl)

      return res.json(response.data); // Retorna
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }
  
  

  async putValidarVendaContigencia(req, res) {
    try {
      let { IDVENDA, STVALIDACONTINGENCIA, page, pageSize } = req.body;
      page = page ? page : ''
      pageSize = pageSize ? pageSize : ''
      const response = await axios.put(`http://164.152.245.77:8000/quality/concentrador/api/venda/valida-venda-contingencia.xsjs?page=${page}&pageSize=${pageSize}`, {
        IDVENDA
      })
      return res.json(response.data);
    } catch (error) {
      console.error("Erro no ConsultaNfeController.putValidarVendaContigencia", error);
      return res.status(500).json({ error: error.message });
    }
  }
  
  async validarStatusSefaz(req, res) {
    try {
      const CERTIFICADO_BASE64 =
        process.env.CERTIFICADO_BASE64 ||
        fs.readFileSync("./cert_base64.txt", "utf-8").trim();

      const SENHA = process.env.SENHA_CERTIFICADO || "#senhagto2024#";

      // Salva o arquivo temporário do certificado (PFX)
      const tempPfxPath = path.join(os.tmpdir(), "certificado.pfx");
      fs.writeFileSync(tempPfxPath, Buffer.from(CERTIFICADO_BASE64, "base64"));

      let { vendas } = req.body;
      let { page, pageSize } = req.query;
      
      if (!vendas) {
        page = page || '';
        pageSize = pageSize || '';
        
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page);
        if (pageSize) queryParams.append('pageSize', pageSize);
        
        const apiUrl = `http://164.152.245.77:8000/quality/concentrador_homologacao/api/venda/valida-venda-contingencia.xsjs?page=${page}&pageSize=${pageSize}`;
        const response = await axios.get(apiUrl);
        vendas = response.data;
      }
      // Normaliza formatos paginados/wrapped: { data: [...] } ou { rows: [...] } ou { page, data: [...] }
      if (!Array.isArray(vendas)) {
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
      }

      if (!Array.isArray(vendas) || vendas.length === 0) {
        return res.status(400).json({ error: "Nenhuma venda para consultar." });
      }

      const certOptions = {
        pfx: fs.readFileSync(tempPfxPath),
        senha: SENHA,
      };

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
              mod: "65",
              tpAmb: 1,
              UF,
              versao: "4.00",
              xmllint: path.resolve("./libs/libxml/bin/xmllint.exe"),
            },
            certOptions
          );

          const resposta = await tools.sefazStatus(CHAVE);
          console.log('resposta status sefaz:', resposta);
        
          const xml = resposta ?? null;
          const cstat =
            resposta?.retConsSitNFe?.cStat ??
            (xml?.match(/<cStat>(\d+)<\/cStat>/)?.[1] ?? null);

          resultados.push({ IDVENDA, UF, CHAVE, CSTAT: cstat, XML: xml });
        } catch (e) {
          resultados.push({ IDVENDA, UF, CHAVE, error: e.message });
        }
      }

      // remove o arquivo temporário
      fs.unlinkSync(tempPfxPath);

      return res.json({
        total: resultados.length,
        processados: resultados.filter((r) => !r.error).length,
        data: resultados,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } 

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
        "RO": "11","AC":"12","AM":"13","RR":"14","PA":"15","AP":"16","TO":"17",
        "MA":"21","PI":"22","CE":"23","RN":"24","PB":"25","PE":"26","AL":"27","SE":"28","BA":"29",
        "MG":"31","ES":"32","RJ":"33","SP":"35","PR":"41","SC":"42","RS":"43","MS":"50","MT":"51","GO":"52","DF":"53"
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
        det: {
          prod: {
            cProd: cprod,
            cean: cean,
            xProd: xprod,
            NCM: ncm,
            CFOP: CFOP,
            uCom: uCom,
            qCom: qCom,
            vUnCom: vUnCom,
            vProd: vProd,
            cEANTrib: cEANTrib,
            uTrib: uTrib,
            qTrib: qTrib,
            vUnTrib: vUnTrib,
            indTot: indTot
          },
          imposto: {
            ICMS: {
              ICMS00: {
                orig: orig,
                CST: CST,
                modBC: modBC,
                vBC: vBC,
                pICMS: pICMS,
                vICMS: vICMS
              },
            },
            PIS: {
              PISAliq: {
                CST: PIS_CST,
                vBC: PIS_VBC,
                pPIS: PIS_PPIS,
                vPIS: VPIS_VPIS
              }
            },
            COFINS: {
              COFINSAliq: {
                CST: COFINS_CST,
                vBC: COFINS_VBC,
                pCOFINS: COFINS_PCOFINS,
                vCOFINS: VCOFINS_VCOFINS
              }
            },
            IS: {
              CSTIS: CSTIS,
              cClassTribIS: cClassTribIS,
            },
            IBSCBS: {
              CST: "01",
              cClassTrib: "00000000",
              indDoacao: "0",
              gIBSCBS: {
                vBC: "0.00",
                gIBSUF: {
                  pIBSUF: "0.00",
                  gRed: {
                    pRedAliq: "0.00",
                    pAliqEfet: "0.00",
                  },
                  vIBSUF: "0.05"
                },
                gIBSMun: {
                  pIBSMun: "0.00",
                  gRed: {
                    pRedAliq: "0.00",
                    pAliqEfet: "0.00",
                  },
                  vIBSMun: "0.00"
                },
                vIBS: "0.05",
                gCBS: {
                  pCBS: "0.00",
                  gRed: {
                    pRedAliq: "0.00",
                    pAliqEfet: "0.00",
                  },
                  vCBS: "0.00"
                },
                gTribRegular: {
                  CSTReg: "000",
                  cClassTribReg: "00000001",
                  pAliqEfetRegIBSUF: "0.00",
                  vTribRegIBSUF: "0.00",
                  pAliqEfetRegIBSMun: "0.00",
                  vTribRegIBSMun: "0.00",
                  pAliqEfetRegCBS: "0.00",
                  vTribRegCBS: "0.00"
                }
              },
              gCredPresIBSZFM: {
                competApur: "2025-10",
                tpCredPresIBSZFM: "1",
                vCredPresIBSZFM: "0.00"
              },
            }
          },
          vItem: "0.01"
        },
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
        // infAdic: {
        //   infCpl: infCpl
        // },
        // infNFeSupl: {
        //     qrCode: qrCode,
        //     urlChave: urlChave
        // },
        // Signature: {
        //   SignedInfo: {
        //     CanonicalizationMethod: {
        //       Algorithm: "http://www.w3.org/2000/09/xmldsig#"
        //     },
        //     SignatureMethod: {
        //       Algorithm: "http://www.w3.org/2000/09/xmldsig#rsa-sha1"
        //     },
        //     Reference: {
        //       Transforms: {
        //         Transform: {
        //           Algorithm: "http://www.w3.org/2000/09/xmldsig#enveloped-signature"
        //         },
        //         Transform: {
        //           Algorithm: "http://www.w3.org/TR/2001/REC-xml-c14n-20010315"
        //         }
        //       },
        //       DigestMethod: {
        //         Algorithm: "http://www.w3.org/2000/09/xmldsig#sha1"
        //       },
        //       DigestValue: "DigestValuePlaceholder"
        //     },
        //   },
        //   SignatureValue: "SignatureValuePlaceholder",
        //   KeyInfo: {
        //     X509Data: {
        //       X509Certificate: "X509CertificatePlaceholder"
        //     },
        //   },
        // },
      };

      return payload;
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
      await tools.sefazDistDFe({chNFe: payload.ide.chave}).then(res =>  {
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

  async consultaNFe(req, res) {
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
      
      // Log detalhado dos dados recebidos
      console.log('\n════════════ DADOS DA VENDA ════════════');
      // console.log('Total de registros:', response.data.rows);
      console.log('Venda:', JSON.stringify(response.data.data[0]?.venda, null, 2));
      // console.log('\nDetalhes (itens):', response.data.data[0]?.detalhe?.length, 'itens');
      // console.log('Pagamentos:', response.data.data[0]?.pagamento?.length, 'formas');
      
      // Log dos pagamentos para verificar agrupamento
      if (response.data.data[0]?.pagamento) {
        console.log('\n─── PAGAMENTOS ORIGINAIS ───');
        response.data.data[0].pagamento.forEach((p, idx) => {
          console.log(`  ${idx + 1}. tPag: ${p.pag.TPAG} | Valor: R$ ${p.pag.VALORRECEBIDO} | ${p.pag.DSTIPOPAGAMENTO}`);
        });
      }
      console.log('═══════════════════════════════════════\n');

      let v_TotICMS = 0;
      let v_TotPis = 0;
      let v_TotCofins = 0;
      let v_TotIBSUF = 0;
      let v_TotCBS = 0;
      let V_Tot_Desconto = 0;
      let V_ICMSTot_vNF = 0;

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
        const tpAmb = venda.data[0]?.venda.NFE_INFNFE_IDE_TPAMB || 2 || 1;
        const finNFe = venda.data[0]?.venda.NFE_INFNFE_IDE_FINNFE || "1";
        const indFinal = venda.data[0]?.venda.NFE_INFNFE_IDE_INDFINAL || "1";
        const indPres = venda.data[0]?.venda.NFE_INFNFE_IDE_INDPRES || "1";
        const cnpj = venda.data[0]?.venda?.NFE_INFNFE_EMIT_CNPJ || "00000000000000";
        const cnpjAutxml = venda.data[0]?.venda?.NFE_INFNFE_AUTXML_CNPJ || "00000000000000";
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
        const qrCode = venda.data[0]?.venda.NFE_INFNFESUPL_QRCODE || "";
        const icms_vicmsdeson = venda.data[0]?.venda.NFE_INFNFE_TOTAL_ICMSTOT_VICMSDESON || "0.00";
        const procEmi = venda.data[0]?.venda.NFE_INFNFE_IDE_PROCEMI || "0";
        const urlChave = venda.data[0]?.venda.NFE_INFNFESUPL_URLCHAVE || "";
        const nProtRaw = venda.data[0]?.venda.PROTNFE_INFPROT_ID || "";
        const nProt = nProtRaw.replace(/^ID/i, '');
        const digVal = venda.data[0]?.venda.PROTNFE_INFPROT_DIGVAL || "";
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
        const xMotivo = venda.data[0]?.venda.PROTNFE_INFPROT_XMOTIVO || "Autorizado o uso da NF-e";
        const CSTIS = venda.data[0]?.detalhe?.map(item => item.det.IS_CST) || "41";
        const cClassTribIS = venda.data[0]?.detalhe?.map(item => item.det.IS_CCLASSTRIBIS) || "00000000";
        const vFrete = venda.data[0]?.detalhe?.map(item => item.det.VFRETE) || "0.00";

        const configData = vendaData.data[0]?.configuracao?.config?.[0]?.config || {};
        const tpFormaEmissao = configData.TPFORMAEMISSAO || "";
        const tpModeloFiscal = configData.TPMODELODOCFISCAL || "";
        const tpVersaoFiscal = configData.TPVERSAOMODFISCAL || "";
        const tpEmissao = configData.TPEMISSAO || "";
        const tpAmbiente = configData.TPAMBIENTE || "2"; // Default: homologação
        const dsCRT = configData.DSCRT || "";
        const cscId = configData.IDTOKEN || "1";
        const csc = configData.TOKENCSC || "";

        // AGRUPAR PAGAMENTOS POR tPag (soma valores do mesmo tipo)
        function agruparPagamentos(pagamentos) {
          if (!pagamentos || pagamentos.length === 0) {
            return [{ tPag: "01", vPag: "0.00" }];
          }

          const agrupados = {};

          pagamentos.forEach(p => {
            const tPag = p.pag.TPAG || "01";
            const valor = parseFloat(p.pag.VALORRECEBIDO || 0);

            if (!agrupados[tPag]) {
              agrupados[tPag] = 0;
            }

            agrupados[tPag] += valor;
          });

          // Converter objeto em array
          return Object.entries(agrupados).map(([tPag, vPag]) => ({
            tPag: tPag,
            vPag: vPag.toFixed(2)
          }));
        }

        const pagamentosAgrupados = agruparPagamentos(venda.data[0]?.pagamento);
        
        console.log('\n─── PAGAMENTOS AGRUPADOS ───');
        pagamentosAgrupados.forEach((p, idx) => {
          console.log(`  ${idx + 1}. tPag: ${p.tPag} | Valor: R$ ${p.vPag}`);
        });
        console.log('────────────────────────────\n');

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
            cUF: uf,
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
            CNPJ: cnpjAutxml,
          },
          det: montarItens(venda),
          // total: {
          //   ICMSTot: {
          //     vBC: vBC,
          //     vICMS: vICMS,
          //     vICMSDeson: icms_vicmsdeson,
          //     vFCP: vFCP,
          //     vBCST: vBCST,
          //     vST: vST,
          //     vFCPST: vFCPST,
          //     vFCPSTRet: vFCPSTRet,
          //     vProd: vProd,
          //     vFrete: icmsVFrete,
          //     vSeg: vSeg,
          //     vDesc: vDesc,
          //     vII: vII,
          //     vIPI: vIPI,
          //     vIPIDevol: vIPIDevol,
          //     vPIS: VPIS_VPIS,
          //     vCOFINS: VCOFINS_VCOFINS,
          //     vOutro: vOutro,
          //     vNF: vProd
          //   },
          //   IBSCBSTot: {
          //     vBCIBSCBS: "0.00",
          //     gIBS: {
          //       gIBSUF: {
          //         vDif: "0.00",
          //         vDevTrib: "0.00",
          //         vIBSUF: "0.05"
          //       },
          //       gIBSMun: {
          //         vDif: "0.00",
          //         vDevTrib: "0.00",
          //         vIBSMun: "0.00"
          //       },
          //       vIBS: "0.05",
          //       vCredPres: "0.00",
          //       vCredPresCondSus: "0.00"
          //     },
          //     gCBS: {
          //       vDif: "0.00",
          //       vDevTrib: "0.00",
          //       vCBS: "0.00",
          //       vCredPres: "0.00",
          //       vCredPresCondSus: "0.00"
          //     },
          //   },
          //   vNFTot: vProd
          // },
          transp: {
            modFrete: modFrete
          },
          pag: {
            detPag: pagamentosAgrupados
          },
          infAdic: {
            infCpl: infCpl
          },
          infNFeSupl: {
            qrCode: qrCode,
            urlChave: urlChave
          }
        };

        return payload;
      }
      const payload = gerarXML(response.data);

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
        // refNFe: payload.ide.gPagAntecipado.refNFe,
        tpEnteGov: payload.ide.gCompraGov.tpEnteGov,
        pRedutor: payload.ide.gCompraGov.pRedutor,
        tpOperGov: payload.ide.gCompraGov.tpOperGov,
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
        UF: payload.emit.enderEmit?.UF,
        cPais: payload.emit.enderEmit.cPais,
        xPais: payload.emit.enderEmit.xPais
      })

      NFe.tagAutXML({
        CNPJ: payload.autXML.CNPJ
      })
      // Processar cada item do detalhe

      const itens = response.data[0]?.detalhe || [];

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

      const uf = response.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_UF || "SP";
      const enderecoProcon = uf === "GO" ? enderecoProconGO : uf === "DF" ? enderecoProconDF : "";

      const infCpl = `Você pagou aproximadamente R$ ${OlhoImposto_Fed.toFixed(2)} tributos federais; ` +
        `R$ ${OlhoImposto_UF.toFixed(2)} tributos estaduais; ` +
        `R$ 0,00 tributos municipais. Fonte: IBPT/FECOMERCIO RS Xe67Eq` +
        (enderecoProcon ? ` ${enderecoProcon}` : '') +
        `Nº VENDA: ${response.data[0]?.venda.IDVENDA} ` +
        `PRAZO DE TROCA: VALIDO POR 30 DIAS;`
        ;

      NFe.tagTransp({
        modFrete: payload.transp.modFrete
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
        tpAmb: payload.infProt.tbAmb,
        verAplic: payload.infProt.verAplic,
        chNFe: payload.infProt.chNFe,
        dhRecbto: payload.infProt.dhRecbto,
        nProt: payload.infProt.nProt,
        digVal: payload.infProt.digVal,
        cStat: payload.infProt.cStat,
        cMotivo: payload.infProt.xMotivo,
      })



      NFe.taginfNFeSupl({
        qrCode: payload.infNFeSupl.qrCode,
        urlChave: payload.infNFeSupl.urlChave,

      })
      
      // ❌ NÃO CONSULTAR ANTES DE ENVIAR - A nota ainda não existe na SEFAZ
      // if (payload?.ide.mod == "65") {
      //   await tools.consultarNFe(payload.ide.chave).then(res => {
      //     console.log('Protocolo NFC-e:', res);
      //   }).catch(err => {
      //     console.error('Erro ao consultar NFC-e:', err);
      //   });
      // } else if (payload?.ide.mod == "55") {
      //   await tools.sefazDistDFe({ chNFe: payload.ide.chave }).then(res => {
      //     console.log('XML NF-e:', res);
      //   }).catch(err => {
      //     console.error('Erro ao consultar NF-e:', err);
      //   });
      // }

      // Gerar XML antes de assinar
      const xmlGerado = NFe.xml();
      console.log('\n═══════════ DEBUG XML ═══════════');
      console.log('Tamanho do XML:', xmlGerado.length, 'caracteres');
      console.log('XML válido?', xmlGerado.includes('</NFe>'));
      console.log('Tem tag <pag>?', xmlGerado.includes('<pag>'));
      console.log('Fecha tag </pag>?', xmlGerado.includes('</pag>'));
      
      // Contar tags de pagamento
      const countDetPag = (xmlGerado.match(/<detPag>/g) || []).length;
      const countDetPagClose = (xmlGerado.match(/<\/detPag>/g) || []).length;
      console.log('Tags <detPag>:', countDetPag);
      console.log('Tags </detPag>:', countDetPagClose);
      console.log('Tags balanceadas?', countDetPag === countDetPagClose);
      console.log('═════════════════════════════════\n');

      tools.xmlSign(xmlGerado).then(async xmlSigned => {
        console.log('XML assinado, tamanho:', xmlSigned.length);
        
        // Salvar XML assinado
        const caminhoXml = path.resolve(`./xmls/nfe_venda_${response.data.data[0]?.venda.IDVENDA}.xml`);
        // console.log(response.data.venda);
        fs.writeFileSync(caminhoXml, xmlSigned, { encoding: 'utf8' });
        console.log('XML salvo em:', caminhoXml);
        
        // Verificar se XML está bem formado
        const temFechamento = xmlSigned.includes('</NFe>') && xmlSigned.includes('</Signature>');
        console.log('XML tem fechamento correto?', temFechamento);
        
        // Não enviar para SEFAZ se XML inválido
        if (!temFechamento) {
          console.error('❌ XML INVÁLIDO! Não será enviado para SEFAZ');
          return;
        }
        
        tools.sefazEnviaLote(xmlSigned, { indSinc: 1 }).then(res => {
          console.log('Resposta SEFAZ:', res);
        }).catch(err => {
          console.error('Erro ao enviar para SEFAZ:', err);
        });
      })

      return res.json(response.data);
    } catch (error) {
      console.error('Erro ao consultar venda ou gerar XML:', error);
      return res.status(500).json({ error: 'Erro ao consultar venda ou gerar XML' });
    }
  }

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
      const qrCode = vendaData.data[0]?.venda.NFE_INFNFESUPL_QRCODE || "";
      const urlChave = vendaData.data[0]?.venda.NFE_INFNFESUPL_URLCHAVE || "";
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
      const pagamentosFormatados = Array.isArray(pagamentosAgrupados) && pagamentosAgrupados.length > 0
        ? pagamentosAgrupados.map((p, idx) => ({
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
        qrCode: qrCode,
        urlChave: urlChave,
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