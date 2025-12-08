import { Tools } from 'node-sped-nfe';
import fs from 'fs';
import xlsx from 'xlsx';
import path from 'path';
import archiver from 'archiver';
import axios from 'axios';
import os from 'os';


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
      try {
        const tmpPath = path.join(os.tmpdir(), fallbackPfxPath.replace(/[^a-zA-Z0-9.\-_]/g, '_'));
        fs.writeFileSync(tmpPath, pfxBuf, { flag: 'w' });
        process.env.CERT_PFX_PATH = tmpPath;
      } catch (e) {
        // se não gravar, não é crítico — ainda temos o buffer
        console.warn('getCertOptions: não foi possível gravar PFX em tmp:', e?.message || e);
      }
      return { pfx: pfxBuf, senha };
    } catch (e) {
      console.error('getCertOptions: falha ao decodificar CERT_PFX_BASE64:', e?.message || e);
    }
  }

  // 2) PFX arquivo local
  if (fs.existsSync(fallbackPfxPath)) {
    try {
      const pfxBuf = fs.readFileSync(fallbackPfxPath);
      process.env.CERT_PFX_PATH = fallbackPfxPath;
      return { pfx: pfxBuf, senha };
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
  
 async validarConsultar(req, res) {
  try {
    // Extrai parâmetros de paginação
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 150;

    const CERTIFICADO_BASE64 =
      process.env.CERTIFICADO_BASE64 ||
      fs.readFileSync("./cert_base64.txt", "utf-8").trim();

    const SENHA = process.env.SENHA_CERTIFICADO || "#senhagto2024#";

    // Salva o arquivo temporário do certificado (PFX)
    const tempPfxPath = path.join(os.tmpdir(), "certificado.pfx");
    fs.writeFileSync(tempPfxPath, Buffer.from(CERTIFICADO_BASE64, "base64"));

    let vendas = req.body?.vendas;
    if (!vendas) {
      // Monta URL com parâmetros de paginação
      const apiUrl = `http://164.152.245.77:8000/quality/concentrador_homologacao/api/venda/valida-venda-contingencia.xsjs?page=${page}&pageSize=${pageSize}`;
      const response = await axios.get(apiUrl);
      // console.log('response data:', response);
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
            mod: "55",
            tpAmb: 1,
            UF,
            versao: "4.00",
      
            xmllint: path.resolve("./libs/libxml/bin/xmllint.exe"),
          },
          certOptions
        );

        const resposta = await tools.consultarNFe(CHAVE);
       
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
      page,
      pageSize,
      total: resultados.length,
      processados: resultados.filter((r) => !r.error).length,
      data: resultados,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
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
    console.log('gerarXML venda:', idVenda);
     const uf = venda.data[0].NFE_INFNFE_EMIT_ENDEREMIT_UF || "SP";
     const mod = venda.data[0].NFE_INFNFE_ID_MOD || "65" || "55";
     const serie = venda.data[0].NFE_INFNFE_IDE_SERIE || "0";
      const chave = venda.data[0].CHAVE || "";
      const tpNF = venda.data[0].NFE_INFNFE_IDE_TPNF || "1";
      const idDest = venda.data[0].NFE_INFNFE_IDE_IDDEST || "1";
      const cMunFG = venda.data[0].NFE_INFNFE_IDE_CMUNFG || "3550308";
      const cnpj = venda.data[0]?.venda?.NFE_INFNFE_EMIT_CNPJ || "00000000000000";
      const nome = venda.data[0].NFE_INFNFE_EMIT_NOME || "Emitente Padrão";
      const nomeFantasia = venda.data[0].NFE_INFNFE_EMIT_FANT || "Fantasia Padrão";
      const cStat = venda.data[0].PROTNFE_INFPROT_CSTAT || "100";
      const cep = venda.data[0].NFE_INFNFE_EMIT_ENDEREMIT_CEP || "01000000";
      const xPais = venda.data[0].NFE_INFNFE_EMIT_ENDEREMIT_XPAIS || "1058";
      const cPais = venda.data[0].NFE_INFNFE_EMIT_ENDEREMIT_CPAIS || "BRASIL";
      const fone = venda.data[0].NFE_INFNFE_EMIT_ENDEREMIT_FONE || "0000000000";
      const cMun = venda.data[0].NFE_INFNFE_EMIT_ENDEREMIT_CMUN || "3550308";
      const xMun = venda.data[0].NFE_INFNFE_EMIT_ENDEREMIT_XMUN || "Sao Paulo";
      const xBairro = venda.data[0].NFE_INFNFE_EMIT_ENDEREMIT_XBAIRRO || "Bairro";
      const nro = venda.data[0].NFE_INFNFE_EMIT_ENDEREMIT_NRO || "0";
      const xLgr = venda.data[0].NFE_INFNFE_EMIT_ENDEREMIT_XLGR || "Endereco";
      const emit_IE = venda.data[0].NFE_INFNFE_EMIT_IE || "";
      const emit_CRT = venda.data[0].NFE_INFNFE_EMIT_CRT || "1";
      // console.log(venda.data[0]?.venda?.NFE_INFNFE_EMIT_CNPJ, 'venda.produtos')
      // console.log(chave, 'chave')
      const payload = {
        ide: {
          cUF: ufToCodigo(uf),
          cNF: chave.slice(-8),
          natOp: "VENDA",
          mod: mod,
          serie: serie,
          nNF: chave.slice(-9) || "1",
          dhEmi: new Date().toISOString(),
          tpNF: tpNF,
          idDest: idDest,
          cMunFG: cMunFG,
          cMunFGIBS: cMunFG,
          tpImp: "4",
          tpEmis: "1",
          cDV: "0",
          tpAmb: Number(process.env.TPAMBIENTE || 2),
          finNFe: "1",
          indFinal: "1",
          indPres: "1",
          indIntermed: "0",
          procEmi: "0",
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
          prod: venda.produtos.map((prod, index) => ({
            
          })),
        },
        icms: {
          orig: "0",
          cStat: cStat,
          modBC: "3",
          vBC: "0.00",
          pICMS: "0.00",
          vICMS: "0.00"
        },
        meta: {
          chaveVendaExterna: chave,
          idVendaExterna: venda.IDVENDA
        }
      };

      return payload;
    }

    // Fazer requisição para obter dados da venda
    // console.log('Fazendo requisição para venda idVenda:', idVenda);
    const response = await axios.get(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/venda/lista-venda-new-xml.xsjs?id=${idVenda}`);
    // console.log('venda:', response);
    const vendaData = response.data;
//     console.log('vendaData completo:', JSON.stringify(vendaData, null, 2));
// console.log('vendaData.data existe?', !!vendaData.data);
// console.log('vendaData.data[0]:', vendaData.data?.[0]);
    const payload = gerarXML(vendaData);
    const result = {
      venda: vendaData,
      payload,
    };

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
 }
}

export default new ConsultaNfeController();