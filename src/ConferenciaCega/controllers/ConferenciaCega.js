import axios from "axios";
import { dataFormatada } from "../../utils/dataFormatada.js";
import { getDetalheOrdemTransferencia } from "../repositories/detalheOrdemTransferencia.js";
import { createStatusDivergencia, getStatusDivergencia, updateStatusDivergencia } from "../repositories/statusDivergencia.js";
//let url = `http://164.152.245.77:8000/quality/concentrador_homologacao`;
const url = 'http://164.152.245.77:8000/quality/concentrador_node';

class ConferenciaCegaControllers  {

    async getListaOrdemTransferenciaConferenciaCega(req, res,) {
        let {idResumoOT, idTipoFiltro, idEmpresaOrigem, idEmpresaDestino, dataPesquisaInicio, dataPesquisaFim} = req.query;
       
        idResumoOT = idResumoOT ? idResumoOT : '';
        idTipoFiltro = idTipoFiltro ? idTipoFiltro : '';
        idEmpresaOrigem = idEmpresaOrigem ? idEmpresaOrigem : ''; 
        idEmpresaDestino = idEmpresaDestino ? idEmpresaDestino : '';
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';    

        dataPesquisaInicio = dataFormatada(dataPesquisaInicio)
        dataPesquisaFim = dataFormatada(dataPesquisaFim)

        try {
        
            const response = await axios.get(`${url}/api/conferencia-cega/resumo-ordem-transferencia.xsjs?page=1&idtipofiltro=${idResumoOT}&idEmpresaOrigem=${idEmpresaOrigem}&idEmpresaDestino=${idEmpresaDestino}&datapesqinicio=${dataPesquisaInicio}&datapesqfim=${dataPesquisaFim}`)
            //const response = await axios.get(`${url}/api/conferencia-cega/resumo-ordem-transferencia.xsjs?id=${idResumoOT}&idtipofiltro=${idTipoFiltro}&idEmpresaOrigem=${idEmpresaOrigem}&idEmpresaDestino=${idEmpresaDestino}&datapesqinicio=${dataPesquisaInicio}&datapesqfim=${dataPesquisaFim}`)
            
   
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; 
        }
        
    }
    async getDetalheOrdemTransferenciaConferenciaCega(req, res,) {
        let {idResumoOT, idTipoFiltro, page, pageSize} = req.query;
       
        idResumoOT = idResumoOT ? idResumoOT : ''; 
        idTipoFiltro = idTipoFiltro ? idTipoFiltro : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';

        try {
           
            const response = await axios.get(`${url}/api/conferencia-cega/detalhe-ordem-transferencia.xsjs?id=${idResumoOT}&idtipofiltro=${idTipoFiltro}&page=${page}&pageSize=${pageSize}`)
            // const response = await getDetalheOrdemTransferencia(idResumoOT, idTipoFiltro, page, pageSize);
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; 
        }
        
    }

    async getListaStatusOTConfrecencia(req, res,) {
        let {idResumoOT, page, pageSize} = req.query;
        
        idResumoOT = idResumoOT ? idResumoOT : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {
            const response = await axios.get(`${url}/api/conferencia-cega/status-divergencia.xsjs`)
            // const response = await getStatusDivergencia(idResumoOT,  pageSize, page)
            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; 
        }
    }

    async putStatusDivergencia(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body]; 
            const response = await  updateStatusDivergencia(dados);
            return res.json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: error.message });
        }
    }
    async postStatusDivergencia(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body]; 
            const response = await  createStatusDivergencia(dados);
            return res.json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: error.message });
        }
    }
    
    // async putResumoOrdemTransferencia(req, res) {
    //     try {
    //         const dados = Array.isArray(req.body) ? req.body : [req.body]; 
    //         const response = await  createStatusDivergencia(dados);
    //         return res.json(response);
    //     } catch (error) {
    //         console.error("Unable to connect to the database:", error);
    //         return res.status(500).json({ error: error.message });
    //     }
    // }

    async  putResumoOrdemTransferencia(req, res) {
        let {
            IDSTDIVERGENCIA,
            OBSDIVERGENCIA,
            IDUSRAJUSTE,
            IDSTATUSOT,
            IDRESUMOOT
        } = req.body;

        try {
            const response = await axios.put(`${url}/api/conferencia-cega/resumo-ordem-transferencia.xsjs`, {
                IDSTDIVERGENCIA,
                OBSDIVERGENCIA,
                IDUSRAJUSTE,
                IDSTATUSOT,
                IDRESUMOOT
            })

            return res.status(200).json({message: 'Ordem de transferência atualizada com sucesso!'});
        } catch(error) {
            console.log('Erro ao atualizar ordem de transferência:', error);
            throw error;
        }
    }

    
}

export default new ConferenciaCegaControllers();