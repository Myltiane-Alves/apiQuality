import { createCliente, getCliente,  updateCliente } from "../cliente/index.js";
const url = process.env.API_URL;
import axios from 'axios';


class GerenciaControllers {
      async getListaDetalhesMalortesPorLoja(req, res) {
        let {idEmpresa, idMalote, status, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;
        idEmpresa = idEmpresa ? idEmpresa : ''
        idMalote = idMalote ? idMalote : ''
        status = status ? status : ''
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : ''
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : ''
        page = page ? page : ''
        pageSize = pageSize ? pageSize : ''

   
        
        if (!idMalote) {
            return res.status(400).json({
                error: "Parâmetros inválidos. É necessário informar 'idMalote' ."
            });
        }

        try {
            const apiUrl = `${url}/api/gerencia/detalhe-malotes-por-loja.xsjs?idMalote=${idMalote}`;
            // const response = await getDetalhesMalortesPorLoja(idMalote, page, pageSize)
            const response = await axios.get(apiUrl);
            return res.json(response.data); 
        } catch (error) {
            console.error("Erro no GerenciaControllers.getDetalhesMalortesPorLoja verifique se os parâmetros estão sendo preenchidos:", error);
            return res.status(500).json({ error: "Erro ao conectar ao banco de dados." });
        }
    }
    async getListaMalortesPorLoja(req, res) {
        let { idEmpresa, idMalote, statusMalote, pendenciaMalote, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;

        idEmpresa = idEmpresa ? idEmpresa : ''
        idMalote = idMalote ? idMalote : ''
        statusMalote = statusMalote ? statusMalote : ''
        pendenciaMalote = pendenciaMalote ? pendenciaMalote : ''
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : ''
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : ''
        page = page ? page : ''
        pageSize = pageSize ? pageSize : ''
        
        if (!idMalote && (!dataPesquisaInicio || !dataPesquisaFim)) {
            return res.status(400).json({
                error: "Parâmetros inválidos. É necessário informar 'idMalote' ou 'dataPesquisaInicio' e 'dataPesquisaFim'."
            });
        }
        

        try {
            const apiUrl = `${url}/api/gerencia/malotes-por-loja.xsjs?idEmpresa=${idEmpresa}&statusMalote=${statusMalote}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;
            // const response = await getMalortesPorLoja(idEmpresa, idMalote, statusMalote, pendenciaMalote, dataPesquisaInicio, dataPesquisaFim, page, pageSize)
            const response = await axios.get(apiUrl);
            return res.json(response.data); 
        } catch (error) {
            console.error("Erro no GerenciaControllers.getListaMalortesPorLoja verifique se os parâmetros estão sendo preenchidos:", error);
            return res.status(500).json({ error: "Erro ao conectar ao banco de dados." });
        }
    }

    async getListaCliente(req, res) {
        let { idCliente, cpfoucnpj,  page, pageSize } = req.query;

        idCliente = idCliente ? idCliente : ''
        cpfoucnpj = cpfoucnpj ? cpfoucnpj : ''
        page = page ? page : ''
        pageSize = pageSize ? pageSize : ''
    
        try {
            // const response = await getCliente(idCliente, cpfoucnpj,  page, pageSize)
            const apiUrl = `${url}/api/cliente/todos.xsjs?byId=${idCliente}&numeroCpfCnpj=${cpfoucnpj}&page=${page}&pageSize=${pageSize}`;
            const response = await axios.get(apiUrl);
    
            return res.json(response.data); 
        } catch (error) {
            console.error("Erro no GerenciaControllers.getListaCliente verifique se os parâmetros estão sendo preenchidos:", error);
            return res.status(500).json({ error: "Erro ao conectar ao banco de dados." });
           
        }
    }

    async putListaCliente(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body]; 
            const response = await putCliente(dados);
            return res.json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: error.message });
        }
    }
    async putCliente(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body]; 
            const response = await updateCliente(dados);
            return res.json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    async postCliente(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body]; 
            const response = await createCliente(dados);
            return res.json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: error.message });
        }
    }

        
    async putMalotesPorLoja(req, res) {      
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body]; 
    
            for (const item of dados) {
                const {IDMALOTE, IDUSERULTIMAALTERACAO, STATUS } = item;
    
                if (!IDMALOTE|| !STATUS) {
                    return res.status(400).json({
                        error: "Parâmetros inválidos. É necessário informar 'IDMALOTE' e 'STATUS' para cada item."
                    });
                }
            }

            // const response = await updateMalote(dados)
            const response = await axios.put(`${url}/api/gerencia/malotes-por-loja.xsjs`, dados);
          
            return res.json(response.data);
        } catch (error) {
            console.error("Erro no GerenciaControllers.putMalotesPorLoja verifique se os parâmetros estão sendo preenchidos:", error);
            return res.status(500).json({ error: "Erro ao conectar ao banco de dados." });
        }
    }

    async postMalotesPorLoja(req, res) {      
        try {
            const { IDEMPRESA, DATAMOVIMENTOCAIXA } = req.body;
            // const dataFormatada = formatarDataMalote(req.body.DATAMOVIMENTOCAIXA)
            if (!IDEMPRESA || !DATAMOVIMENTOCAIXA) {
                return res.status(400).json({error: "Parâmetros inválidos. É necessário informar 'IDEMPRESA'."    });
            }  
            const payload = [{
                ...req.body,
                IDEMPRESA: req.body.IDEMPRESA,
                DATAMOVIMENTOCAIXA: req.body.DATAMOVIMENTOCAIXA,
                VRDINHEIRO: req.body.VRDINHEIRO,
                VRCARTAO: req.body.VRCARTAO,
                VRPOS: req.body.VRPOS,
                VRPIX: req.body.VRPIX,
                VRCONVENIO: req.body.VRCONVENIO,
                VRVOUCHER: req.body.VRVOUCHER,
                VRFATURA: req.body.VRFATURA,
                VRFATURAPIX: req.body.VRFATURAPIX,
                VRDESPESA: req.body.VRDESPESA,
                VRTOTALRECEBIDO: req.body.VRTOTALRECEBIDO,
                VRDISPONIVEL: req.body.VRDISPONIVEL,
                OBSERVACAOLOJA: req.body.OBSERVACAOLOJA,
                IDUSERCRIACAO: req.body.IDUSERCRIACAO,
                IDUSERULTIMAALTERACAO: req.body.IDUSERULTIMAALTERACAO,
                IDUSERENVIO: req.body.IDUSERENVIO,
            }];

            // const response = await createMalote(payload);
            const response = await axios.post(`${url}/api/gerencia/malotes-por-loja.xsjs`, payload)
            
            return res.json(response.data); 
        } catch (error) {
            console.error("Erro no GerenciaControllers.postMalotesPorLoja verifique se os parâmetros estão sendo preenchidos:", error);
            return res.status(500).json({ error: "Erro ao conectar ao banco de dados." });
        }
    }
}

export default new GerenciaControllers();
