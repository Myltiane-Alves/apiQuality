import axios from "axios";

import { dataFormatada } from "../../../utils/dataFormatada.js";
import { getBalancoLoja } from "../repositories/balancoLoja.js";
import { getColetorBalanco } from "../repositories/coletorBalanco.js";
import { getPrepararPrimeiroBalancoLoja, updatePrepararPrimeiroBalancoLoja } from "../repositories/prepararPrimeiroBalancoLoja.js";
import { getDetalheBalanco, putDetalheBalanco } from "../repositories/detalheBalanco.js";
import { getConsolidarBalanco, updateConsolidarBalanco } from "../repositories/consolidarBalanco.js";
import { getPrestacaoContasBalanco } from "../repositories/prestacaoContaBalanco.js";
import { getNovoPreviaBalanco } from "../repositories/novoPreviaBalanco.js";
import { createDetalheBalancoAvulso, getDetalheBalancoAvulso, putDetalheBalancoAvulso } from "../repositories/detalheBalancoAvulso.js";
import 'dotenv/config';
const url = process.env.API_URL;



class AdmBalancoControllers {
    async getListaBalancoLoja(req, res) {
        let { idEmpresa, dsDescricao, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;

        idEmpresa = idEmpresa ? Number(idEmpresa) : '';
        dsDescricao = dsDescricao ? dsDescricao : ''; 
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : ''
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : ''
        page = page ? Number(page) : '';
        pageSize = pageSize ? Number(pageSize) : '';
        
        try {
            // http://164.152.245.77:/api/administrativo/balanco-loja.xsjs?page=1&idEmpresa=1&dataInicial=2024-12-07&dataFinal=2024-12-07&DSdesc=
            const apiUrl = `${url}/api/administrativo/balanco-loja.xsjs?idEmpresa=${idEmpresa}&DSdesc=${dsDescricao}&dataInicial=${dataPesquisaInicio}&dataFinal=${dataPesquisaFim}&page=${page}&pageSize=${pageSize}`;
            const response = await axios.get(apiUrl)
            // const response = await getBalancoLoja(idEmpresa, dsDescricao, dataPesquisaInicio, dataPesquisaFim, page, pageSize);
        
            return res.json(response.data);
        } catch (error) {
            console.error("Erro no ADM Balanco Controllers getListaBalancoLoja:", error);
            return res.status(500).json({ error: "Erro ao buscar lista de balanços por loja." });
         
        }
    }

    // async getListaColetorBalanco(req, res) {
    //     let { idEmpresa, idResumo, descricaoProduto, } = req.query;
        
    //     idEmpresa = idEmpresa ? idEmpresa : '';
    //     idResumo = idResumo ? idResumo : '';
    //     descricaoProduto = descricaoProduto ? descricaoProduto : '';
        
    //     try {
    //         const apiUrl = `${url}/api/administrativo/coletor-balanco.xsjs?idresumo=${idResumo}&idempresa=${idEmpresa}`
    //         const response = await axios.get(apiUrl)

    //         return res.json(response.data); 
    //     } catch (error) {
    //         console.error("Unable to connect to the database:", error);
    //         throw error;
    //     }
        
    // }
    
    async getListaColetorBalanco(req, res) {
        let { idEmpresa, idResumo, descricaoProduto, page, pageSize } = req.query;
        
        idEmpresa = idEmpresa ? idEmpresa : '';
        idResumo = idResumo ? idResumo : '';
        descricaoProduto = descricaoProduto ? descricaoProduto : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {
            
            // const response = await getColetorBalanco(idEmpresa, idResumo, descricaoProduto, page, pageSize)
            const apiUrl = `${url}/api/administrativo/coletor-balanco.xsjs?idresumo=${idResumo}&idempresa=${idEmpresa}&descProduto=${descricaoProduto}&page=${page}&pageSize=${pageSize}`
            const response = await axios.get(apiUrl)
            return res.json(response.data); 
        } catch (error) {
            console.error("Erro no ADM Balanco Controllers getListaColetorBalanco:", error);
            throw error;
        }
        
    }

    async getListaPrepararPrimeiroBalancoLoja(req, res) {
        let { idEmpresa, page, pageSize } = req.query;
        
        idEmpresa = idEmpresa ? idEmpresa : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {
            const apiUrl = `${url}/api/administrativo/prepara-primeiro-balanco-loja.xsjs`
            const response = await axios.get(apiUrl)
            // const response = await getPrepararPrimeiroBalancoLoja(idEmpresa, page, pageSize)
            return res.json(response.data); 
        } catch (error) {
            console.error("Erro no ADM Balanco Controllers getListaPrepararPrimeiroBalancoLoja:", error);
            throw error;
        }
        
    }
    async getListaDetalheBalancoLoja(req, res) {
        let { idResumo, numeroColetor, page, pageSize } = req.query;
        
        idResumo = idResumo ? idResumo : '';
        numeroColetor = numeroColetor ? numeroColetor : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {
            
            // const response = await getDetalheBalanco(idResumo, numeroColetor, page, pageSize)
            const apiUrl = `${url}/api/administrativo/detalhe-balanco.xsjs?idresumo=${idResumo}&coletor=${numeroColetor}&page=${page}&pageSize=${pageSize}`
            const response = await axios.get(apiUrl)
            return res.json(response.data); 
        } catch (error) {
            console.error("Erro no ADM Balanco Controllers getListaDetalheBalancoLoja:", error);
            throw error;
        }
        
    }

    async getListaConsolidarBalanco(req, res) {
        let { idResumo,  page, pageSize } = req.query;
        
        idResumo = idResumo ? idResumo : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {

            const apiUrl = `${url}/api/administrativo/consolidar-balanco.xsjs?id=${idResumo}&page=${page}&pageSize=${pageSize}`
            const response = await axios.get(apiUrl)
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaPrestacaoContasBalanco(req, res) {
        let { idResumoBalanco,  page, pageSize } = req.query;
        
        idResumoBalanco = idResumoBalanco ? idResumoBalanco : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {
            const apiUrl = `${url}/api/administrativo/prestacao-contas-balanco.xsjs?id=${idResumoBalanco}`
            const response = await axios.get(apiUrl)
            // const response = await getPrestacaoContasBalanco(idResumoBalanco, page, pageSize)
            return res.json(response.data); 
        } catch (error) {
            console.error("Erro no ADMBalancoControllers getListaPrestacaoContasBalanco:", error);
            throw error;
        }
        
    }

    async getListaNovoPreviaBalanco(req, res) {
        let { idResumoBalanco,  page, pageSize } = req.query;
        
        idResumoBalanco = idResumoBalanco ? idResumoBalanco : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {
            
            const response = await getNovoPreviaBalanco(idResumoBalanco, page, pageSize)
            return res.json(response); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaDetalheBalancoAvulso(req, res) {
        let { idFilial, coletor, page, pageSize } = req.query;
        
        idFilial = idFilial ? idFilial : '';
        coletor = coletor ? coletor : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {
            const apiUrl = `${url}/api/administrativo/detalhe-balanco-avulso.xsjs?idfilial=${idFilial}&coletor=${coletor}`;
            const response = await axios.get(apiUrl)
            // const response = await getDetalheBalancoAvulso(idFilial, coletor, page, pageSize)
            return res.json(response.data); 
        } catch (error) {
            console.error("erro no ADM Balanco Controllers getListaDetalheBalancoAvulso:", error);
            return res.status(500).json({ error: "Erro ao buscar lista de balanços avulso." });
        
        }
        
    }

  
    async putConsolidarBalanco(req, res) {
        try {
            let {IDRESUMOBALANCO, IDEMPRESA} =  req.body;            
            // const response = await updateConsolidarBalanco(balancos)
            if (!IDRESUMOBALANCO || !IDEMPRESA) {
                return res.status(400).json({ error: "IDRESUMOBALANCO and IDEMPRESA are required." });
            }

            const apiUrl = `${url}/api/administrativo/consolidar-balanco.xsjs`;
            const response = await axios.put(apiUrl, {
                IDRESUMOBALANCO,
                IDEMPRESA
            });

            return res.json(response.data);
        } catch (error) {
            console.error("Erro no ADM Balanco Controllers putConsolidarBalanco:", error);
            return res.status(500).json({ error: error.message });
            
        }
    }

    async putListaPrepararPrimeiroBalancoLoja(req, res) {
        try {
            let { IDEMPRESA } = req.body;   
            // const response = await updatePrepararPrimeiroBalancoLoja(balancos)

            if (!IDEMPRESA) {
                return res.status(400).json({ error: "IDEMPRESA is required." });
            }

            const apiUrl = `${url}/api/administrativo/prepara-primeiro-balanco-loja.xsjs`
            
            const response = await axios.put(apiUrl, {
                IDEMPRESA
            })

            return res.json(response.data);
        } catch (error) {
            console.error("Erro no ADM Balanco Controllers putListaPrepararPrimeiroBalancoLoja:", error);
            return res.status(500).json({ error: error.message });
            
        }
    }

    async putListaDetalheBalanco(req, res) {
        try {
            let {IDDETALHEBALANCO, TOTALCONTAGEMGERAL} = req.body;   
           
            const apiUrl = `${url}/api/administrativo/detalhe-balanco.xsjs`;
            const response = await axios.put(apiUrl, {
                IDDETALHEBALANCO: Number(IDDETALHEBALANCO),
                TOTALCONTAGEMGERAL: Number(TOTALCONTAGEMGERAL)
            });
         
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async putListaDetalheBalancoAvulso(req, res) {
        try {
            let { TOTALCONTAGEMGERAL, IDEMPRESA, NUMEROCOLETOR, IDPRODUTO, DSCOLETOR, CODIGODEBARRAS, DSPRODUTO, PRECOCUSTO, PRECOVENDA, STCANCELADO, INSBALANCO } = req.body;
            // const detalhes = Array.isArray(req.body) ? req.body : [req.body];   
            // const response = await putDetalheBalancoAvulso(detalhes)
            const apiUrl = `${url}/api/administrativo/detalhe-balanco-avulso.xsjs`;
            const response = await axios.put(apiUrl, req.body);

            return res.json(response.data);
        } catch (error) {
            console.error("Erro no ADM Balanco Controllers putListaDetalheBalancoAvulso:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    async postDetalheBalancoAvulso(req, res) {
        try {
            let {} =  req.body;   
            // const response = await createDetalheBalancoAvulso(detalhes)

            const apiUrl = `${url}/api/administrativo/detalhe-balanco-avulso.xsjs`;
            const response = await axios.post(apiUrl, req.body);
        
            return res.json(response.data);
        } catch (error) {
            console.error("Erro no ADM Balanco Controllers postDetalheBalancoAvulso:", error);
            return res.status(500).json({ error: error.message });
            
        }
    }
 
    async putColetorBalanco(req, res) {
        try {
            let { IDRESUMOBALANCO,  NUMEROCOLETOR} = req.body;
            if (!IDRESUMOBALANCO || !NUMEROCOLETOR) {
                return res.status(400).json({ error: "idResumo, e numeroColetor are required." });
            }

            const apiUrl = `${url}/api/administrativo/coletor-balanco.xsjs`;
            const response = await axios.put(apiUrl, {
                IDRESUMOBALANCO,
                NUMEROCOLETOR
            });

            return res.json(response.data);
        } catch (error) {
            console.error("Erro no ADM Balanco Controllers putColetorBalanco:", error);
            return res.status(500).json({ error: error.message });
        }
    }
    async putConfirmarConsolidarBalanco(req, res) {
        try {
            let { IDRESUMOBALANCO,  OBSCONTAGEM, OBSDIVERGENCIACONTAGEM, OBSDIVERGENCIAGERENTE} = req.body;
            if (!IDRESUMOBALANCO) {
                return res.status(400).json({ error: "idResumo is required." });
            }

            const apiUrl = `${url}/api/administrativo/confirmar-consolidar-balanco.xsjs`;
            const response = await axios.put(apiUrl, {
                IDRESUMOBALANCO,
                OBSCONTAGEM,
                OBSDIVERGENCIACONTAGEM,
                OBSDIVERGENCIAGERENTE
            });

            return res.json(response.data);
        } catch (error) {
            console.error("Erro no ADM Balanco Controllers putConfirmarConsolidarBalanco:", error);
            return res.status(500).json({ error: error.message });
        }
    }
}

export default new AdmBalancoControllers();