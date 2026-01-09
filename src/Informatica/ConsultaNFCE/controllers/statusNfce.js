import { Make, Tools, docZip } from 'node-sped-nfe';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import os from 'os';
import 'dotenv/config';
const url = process.env.API_URL

// Detectar SO e retornar extensão correta
const getToolPath = (basePath, executable) => {
  const isWindows = os.platform() === 'win32';
  const ext = isWindows ? '.exe' : '';
  return path.resolve(`${basePath}${executable}${ext}`);
};


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
  // if (process.env.CERT_PEM_CERT_PATH && process.env.CERT_PEM_KEY_PATH) {
  //   try {
  //     const cert = fs.readFileSync(process.env.CERT_PEM_CERT_PATH);
  //     const key = fs.readFileSync(process.env.CERT_PEM_KEY_PATH);
  //     return { cert, key };
  //   } catch (e) {
  //     console.error("ERRO ao ler caminhos PEM:", e.message);
  //   }
  // }

  // -----------------------------
  // 5) NADA ENCONTRADO
  // -----------------------------
  return null;
}


class ConsultaStatusNfeController {
  async validarConsulta(req, res) {
    try {

      const SENHA_CERT = process.env.SENHA || "#senhagto2024#";
      const certOptions = await getCertOptions(SENHA_CERT, './GTO COMERCIO 2025-2026.pfx');

      if (!certOptions) {
        return res.status(500).json({
          error: 'Não foi possível carregar o certificado. Verifique as variáveis de ambiente ou o arquivo local.'
        });
      }

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
              tpAmb: 2,
              UF: UF,
              versao: "4.00",
            },
            certOptions
          );

          const resposta = await tools.sefazStatus(CHAVE);
          
          const xml = resposta ?? null;
          const cstat =
            resposta?.retConsSitNFe?.cStat ??
            (xml?.match(/<cStat>(\d+)<\/cStat>/)?.[1] ?? null);

          resultados.push({ IDVENDA, UF, CHAVE, CSTAT: cstat, XML: xml });
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

  async statusSefaz(req, res) {
    try {
      let { idVenda } = req.query;

      if (!idVenda) {
        return res.status(400).json({ error: "idVenda é obrigatório" });
      }

      const apiUrl = `${url}/api/venda/lista-venda-new-xml.xsjs?id=${idVenda}`;
      console.log('🔗 Chamando URL:', apiUrl);
      const response = await axios.get(apiUrl);
      const vendaData = response.data;
      const configData = response.data.data[0]?.configuracao?.[0]?.config || {};
      const cscId = configData.IDTOKEN || "1";
      const csc = configData.TOKENCSC || "";
      const uf = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_UF;
      const mod = String(vendaData.data[0]?.venda.NFE_INFNFE_IDE_MOD || "65");
      const tpAmb = parseInt(vendaData.data[0]?.venda.NFE_INFNFE_IDE_TPAMB || 2);
      const chaveRaw = vendaData.data[0]?.venda.CHAVE || "";
      const chave = chaveRaw.replace(/^NFe/i, '').replace(/\D/g, '').slice(0, 44);
      const SENHA_CERT = process.env.SENHA || "#senhagto2024#";
      const certOptions = await getCertOptions(SENHA_CERT, './caminho/para/seu/certificado.pfx');

      if (!certOptions) {
        return res.status(500).json({
          error: 'Não foi possível carregar o certificado. Verifique as variáveis de ambiente ou o arquivo local.'
        });
      }
      
           const opensslPath = getToolPath('./libs/openssl/bin/', 'openssl');
      const opensslModulesPath = path.resolve("./libs/openssl/lib/ossl-modules");
      process.env.OPENSSL_MODULES = opensslModulesPath;
      const toolsConfig = {
        mod: mod,
        tpAmb: tpAmb,
        UF: String(uf),
        versao: "4.00",
        timeout: 60000,
        CSC: csc,
        CSCid: cscId,
        openssl: getToolPath('./libs/openssl/bin/', 'openssl'),
      };
      
      // Adicionar xmllint apenas se for Windows
      if (os.platform() === 'win32') {
        toolsConfig.xmllint = getToolPath('./libs/libxml/bin/', 'xmllint');
      }
      
      const tools = new Tools(toolsConfig, certOptions);

      const resposta = await tools.sefazStatus(chave).catch(err => {
        console.error('Erro ao consultar status da SEFAZ:', err.message);
        throw err;
      });
 
      return res.json({
        vendaData,
        xml: resposta
      });
    } catch (error) {
      console.error('❌ Erro completo:', error);
      console.error('Erro ao consultar XML:', error.message);
      console.error('Stack:', error.stack);
      return res.status(500).json({ error: error.message || 'Erro ao consultar venda ou gerar XML' });
    }
  }

  async downloadNFE(req, res) {
    try {
      let { idVenda } = req.body;

      if (!idVenda) {
        return res.status(400).json({ error: "idVenda é obrigatório" });
      }

      const response = await axios.get(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/venda/lista-venda-new-xml.xsjs?id=${idVenda}`);
      const vendaData = response.data;

      const configData = response.data.data[0]?.configuracao?.[0]?.config || {};
      const cscId = configData.IDTOKEN || "1";
      const csc = configData.TOKENCSC || "";
      const uf = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_UF;
      const mod = String(vendaData.data[0]?.venda.NFE_INFNFE_IDE_MOD || "55");
      const tpAmb = parseInt(vendaData.data[0]?.venda.NFE_INFNFE_IDE_TPAMB || "2", 10);
      const cnpj = vendaData.data[0]?.venda?.NFE_INFNFE_EMIT_CNPJ;
      const chaveRaw = vendaData.data[0]?.venda.CHAVE || "";
      const chave = chaveRaw.replace(/^NFe/i, '').replace(/\D/g, '').slice(0, 44);


      const SENHA_CERT = process.env.SENHA || "#senhagto2024#";
      const certOptions = await getCertOptions(SENHA_CERT, './GTO COMERCIO 2025-2026.pfx');

      if (!certOptions) {
        return res.status(500).json({
          error: 'Não foi possível carregar o certificado. Verifique as variáveis de ambiente ou o arquivo local.'
        });
      }

      const tools = new Tools({
        mod: mod,
        tpAmb: tpAmb,
        UF: String(uf),
        versao: "4.00",
        CNPJ: cnpj,
        CSC: csc,
        CSCid: cscId,
      }, certOptions);
  
      tools.sefazDistDFe({chNFe: chave}).then(res => {
        console.log('Status da SEFAZ:', res);
        fs.writeFileSync(`./xml-download/NFe-${chave}.xml.zip`, res);
        docZip(res)
          .then(() => {
            console.log(`Arquivo NFe-${chave}.xml extraído com sucesso!`);
          })
          .catch(err => {
            console.error('Erro ao extrair o arquivo XML:', err.message);
          });
      }).catch(err => {
        console.error('Erro ao consultar status da SEFAZ:', err.message);
        fs.writeFileSync(`./xml-download/Erro-NFe-${chave}.xml`, JSON.stringify(err, null, 2));
      })

      return res.json(vendaData);
    } catch (error) {
      console.error('Erro ao consultar venda ou gerar XML:', error);
      return res.status(500).json({ error: 'Erro ao consultar venda ou gerar XML' });
    }
  }

  async cancelarNFE(req, res) {
    try {
      let { idVenda, xJust } = req.body;

      if (!idVenda) {
        return res.status(400).json({ error: "idVenda é obrigatório" });
      }

      const response = await axios.get(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/venda/lista-venda-new-xml.xsjs?id=${idVenda}`);
      const vendaData = response.data;

      const configData = response.data.data[0]?.configuracao?.[0]?.config || {};
      const cscId = configData.IDTOKEN || "1";
      const csc = configData.TOKENCSC || "";
      const uf = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_UF;
      const mod = String(vendaData.data[0]?.venda.NFE_INFNFE_IDE_MOD || "55");
      const tpAmb = parseInt(vendaData.data[0]?.venda.NFE_INFNFE_IDE_TPAMB || "2", 10);
      const cnpj = vendaData.data[0]?.venda?.NFE_INFNFE_EMIT_CNPJ;
      const chaveRaw = vendaData.data[0]?.venda.CHAVE || "";
      const chave = chaveRaw.replace(/^NFe/i, '').replace(/\D/g, '').slice(0, 44);


      const SENHA_CERT = process.env.SENHA || "#senhagto2024#";
      const certOptions = await getCertOptions(SENHA_CERT, './GTO COMERCIO 2025-2026.pfx');

      if (!certOptions) {
        return res.status(500).json({
          error: 'Não foi possível carregar o certificado. Verifique as variáveis de ambiente ou o arquivo local.'
        });
      }

      const tools = new Tools({
        mod: mod,
        tpAmb: tpAmb,
        UF: String(uf),
        versao: "4.00",
        CNPJ: cnpj,
        CSC: csc,
        CSCid: cscId,
      }, certOptions);
  
      const resposta = await tools.sefazEvento({
        chNFe: chave,
        tpEvento: '110111',
        nProt: '123456789012345',
        xJust: 'Cancelamento de teste'
      }).then(res => {
        console.log('Cancelamento da NFE:', res);
        fs.writeFileSync(`./xml-cancelamento/Cancelamento-NFe-${chave}.xml`, res);
      }).catch(err => {
        console.error('Erro ao cancelar a NFE:', err.message);
      })

      return res.json(resposta);
    } catch (error) {
      console.error('Erro ao consultar venda ou gerar XML:', error);
      return res.status(500).json({ error: 'Erro ao consultar venda ou gerar XML' });
    }
  }

  async inutilizarNFE(req, res) {
    try {
      let { idVenda, xJust } = req.body;

      if (!idVenda) {
        return res.status(400).json({ error: "idVenda é obrigatório" });
      }

      const response = await axios.get(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/venda/lista-venda-new-xml.xsjs?id=${idVenda}`);
      const vendaData = response.data;

      const configData = response.data.data[0]?.configuracao?.[0]?.config || {};
      const cscId = configData.IDTOKEN || "1";
      const csc = configData.TOKENCSC || "";
      const uf = vendaData.data[0]?.venda.NFE_INFNFE_EMIT_ENDEREMIT_UF;
      const mod = String(vendaData.data[0]?.venda.NFE_INFNFE_IDE_MOD || "55");
      const tpAmb = parseInt(vendaData.data[0]?.venda.NFE_INFNFE_IDE_TPAMB || "2", 10);
      const cnpj = vendaData.data[0]?.venda?.NFE_INFNFE_EMIT_CNPJ;
      const chaveRaw = vendaData.data[0]?.venda.CHAVE || "";
      const chave = chaveRaw.replace(/^NFe/i, '').replace(/\D/g, '').slice(0, 44);
      const serie = vendaData.data[0]?.venda.NFE_INFNFE_IDE_SERIE;

      const SENHA_CERT = process.env.SENHA || "#senhagto2024#";
      const certOptions = await getCertOptions(SENHA_CERT, './GTO COMERCIO 2025-2026.pfx');

      if (!certOptions) {
        return res.status(500).json({
          error: 'Não foi possível carregar o certificado. Verifique as variáveis de ambiente ou o arquivo local.'
        });
      }

      const tools = new Tools({
        mod: mod,
        tpAmb: tpAmb,
        UF: String(uf),
        versao: "4.00",
        CNPJ: cnpj,
        CSC: csc,
        CSCid: cscId,
      }, certOptions);
  
      const resposta = await tools.sefazInutiliza({
        nSerie: serie,
        nIni: 1,
        nFin: 1,
        xJust: xJust
      }).then(res => {
        console.log('Inutilização da NFE:', res);
        fs.writeFileSync(`./xml-inutilizada/inutilizacao-NFe-${chave}.xml`, res);
      }).catch(err => {
        console.error('Erro ao inutilizar a NFE:', err.message);
      })

      return res.json(resposta);
    } catch (error) {
      console.error('Erro ao inutilizar a NFE:', error);
      return res.status(500).json({ error: 'Erro ao inutilizar a NFE' });
    }
  }
}

export default new ConsultaStatusNfeController();