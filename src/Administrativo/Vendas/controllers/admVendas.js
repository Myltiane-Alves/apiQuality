import axios from "axios";

import { getVendaTotalFormaPagamento } from "../repositories/vendaTotalFormaPag.js";
import { dataFormatada } from "../../../utils/dataFormatada.js";
import { getVendaTotalRecebidoPeriodo } from "../repositories/vendaTotalRecebidoPeriodo.js";
import { getVendaVendedor, updateVendaVendedor } from "../repositories/vendaVendedor.js";
import { getVendaAtiva } from "../repositories/vendaAtiva.js";
import { createAlterarVendaPagamento, getAlterarVendaPagamento, updateAlterarVendaPagamento } from "../repositories/alterarVendaPagamento.js";
import { getListaVenda } from "../repositories/listaVenda.js";
import { getVendaCliente, getVendaDetalhe } from "../repositories/listaVendaCliente.js";
import { updateAlterarVendaRecebimento } from "../repositories/atualizaRecebimentoVenda.js";
import 'dotenv/config';
const url = process.env.API_URL;

class AdmVendasControllers {
    async getRecebimentosFormaPagamento(req, res) {
        let { idMarca, idEmpresa, dataPesquisaInicio, dataPesquisaFim, idFuncionario, dsFormaPagamento, dsParcela, page, pageSize } = req.query; 
        idEmpresa = idEmpresa ? idEmpresa : '';
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataPesquisaFim : '';
        idFuncionario = idFuncionario ? idFuncionario : '';
        dsFormaPagamento = dsFormaPagamento ? dsFormaPagamento : '';
        dsParcela = dsParcela ? dsParcela : '';
        idMarca = idMarca ? idMarca : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';

        try {
           
            const apiUrl = `${url}/api/administrativo/venda-total-forma-pag.xsjs?pageSize=${pageSize}&page=${page}&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idFunc=${idFuncionario}&dSFormaPag=${dsFormaPagamento}&dSParc=${dsParcela}&idEmpGrupo=${idMarca}`;
            const response = await axios.get(apiUrl)
            // const response = await getVendaTotalFormaPagamento(idGrupo, idEmpresa, dataPesquisaInicio, dataPesquisaFim, idFuncionario, dsFormaPagamento, dsParcela, page, pageSize);
        
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: error.message });
     
        }  
    }

    async getListaVendaTotalRecebido(req, res) {
        let { idMarca, idEmpresa, dataPesquisaInicio, dataPesquisaFim, idFuncionario, dsFormaPagamento, dsParcela, page, pageSize} = req.query; 
        idEmpresa = idEmpresa ? idEmpresa : '';
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataPesquisaFim : '';
        idFuncionario = idFuncionario ? idFuncionario : '';
        dsFormaPagamento = dsFormaPagamento ? dsFormaPagamento : '';
        dsParcela = dsParcela ? dsParcela : '';
        idMarca = idMarca ? idMarca : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {

            const apiUrl = `${url}/api/administrativo/venda-total-recebido-periodo.xsjs?pageSize=${pageSize}&page=${page}&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idFunc=${idFuncionario}&dSFormaPag=${dsFormaPagamento}&dSParc=${dsParcela}&idEmpGrupo=${idMarca}`;
            const response = await axios.get(apiUrl)
            // const response = await getVendaTotalRecebidoPeriodo(idGrupo, idEmpresa, dataPesquisaInicio, dataPesquisaFim, idFuncionario, dsFormaPagamento, dsParcela, page, pageSize)
        
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: error.message });
        }  
    }


    async getVendaVendedorAction(req, res) {
        let { idEmpresa, idGrupo, dataPesquisaInicio, dataPesquisaFim, page, pageSize, byId } = req.query;

        idEmpresa = idEmpresa ? Number(idEmpresa) : '';
        idGrupo = idGrupo ? Number(idGrupo) : '';
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataPesquisaFim : '';
        byId = byId ? byId : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';

        try {
            const apiUrl = `${url}/api/administrativo/venda-vendedor.xsjs?idGrupo=${idGrupo}&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
            const response = await axios.get(apiUrl)
            // const response = await getVendaVendedor(idGrupo, idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize);

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaVendaAtiva(req, res) {

        let { statusCancelado, statusContingencia, statusCanceladoWeb, stCanceladoPDVEmitida, stCanceladoPDVEmTela, statusCanceladoDepois30Minutos, cpfCliente, idGrupo, idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;
        statusCancelado = statusCancelado ? statusCancelado : '';
        statusCanceladoWeb = statusCanceladoWeb ? statusCanceladoWeb : '';
        stCanceladoPDVEmitida = stCanceladoPDVEmitida ? stCanceladoPDVEmitida : '';
        stCanceladoPDVEmTela = stCanceladoPDVEmTela ? stCanceladoPDVEmTela : '';
        statusCanceladoDepois30Minutos = statusCanceladoDepois30Minutos ? statusCanceladoDepois30Minutos : '';
        statusContingencia = statusContingencia ? statusContingencia : '';
        cpfCliente = cpfCliente ? cpfCliente : '';
        idGrupo = Number(idGrupo) ? Number(idGrupo) : '';
        idEmpresa = Number(idEmpresa) ? Number(idEmpresa) : '';
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';

        try {
            // http://164.152.245.77:8000/quality/concentrador/api/administrativo/venda-ativa.xsjs?idMarca=0&idEmpresa=&dataFechamento=2024-12-07&dataFechamentoFim=2024-12-07&status=True&stCanceladoWeb=&stCanceladoPDVEmitida=&stCanceladoApos30Min=&stCanceladoPDVEmTela=&page=1
           
            const apiUrl = `${url}/api/administrativo/venda-ativa.xsjs?cpfCliente=${cpfCliente}&idMarca=${idGrupo}&idEmpresa=${idEmpresa}&dataFechamento=${dataPesquisaInicio}&dataFechamentoFim=${dataPesquisaFim}&status=${statusCancelado}&stCanceladoWeb=${statusCanceladoWeb}&stCanceladoPDVEmitida=${stCanceladoPDVEmitida}&stCanceladoApos30Min=${statusCanceladoDepois30Minutos}&stCanceladoPDVEmTela=${stCanceladoPDVEmTela}&page=${page}&pageSize=${pageSize}`;
            const response = await axios.get(apiUrl) 
            // const response = await getVendaAtiva(statusCancelado, statusContingencia, statusCanceladoWeb, stCanceladoPDVEmitida, stCanceladoPDVEmTela, statusCanceladoDepois30Minutos, cpfCliente, idGrupo, idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize)
            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async getListaAlterarVendasPagamento(req, res) {

        let { idVenda, byId, page, pageSize  } = req.query;
      
        idVenda = idVenda ? idVenda : '';
        byId = byId ? byId : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
                
        try {
            const response = getAlterarVendaPagamento(idVenda, byId, page, pageSize)
            return res.json(response); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }
    async getListaVendasById(req, res) {
        let {nnf, serie, idVenda, idEmpresa, page, pageSize  } = req.query;
        nnf = nnf ? nnf : '';
        serie = serie ? serie : '';
        idVenda = idVenda ? idVenda : '';
        idEmpresa = idEmpresa ? idEmpresa : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
            
        if(!idVenda == '') {
            return res.status(400).json({ error: "idVenda is required" });
        }
        try {
            const apiUrl = `${url}/api/venda/lista-venda.xsjs?nnf=${nnf}&serie=${serie}&idEmpresa=${idEmpresa}&id=${idVenda}&pageSize=${pageSize}&page=${page}`;
            const response = await axios.get(apiUrl)
            // const response = await getListaVenda(nnf, serie, idEmpresa, idVenda, page, pageSize)
     
            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaVendaCliente(req, res) {
        let {nnf, serie, idEmpresa, idVenda, idSubGrupoEmpresarial, cpfOUidVenda, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;
        nnf = nnf ? nnf : '';
        serie = serie ? serie : '';
        idEmpresa = idEmpresa ? idEmpresa : '';
        idVenda = idVenda ? idVenda : '';
        idSubGrupoEmpresarial = idSubGrupoEmpresarial ? idSubGrupoEmpresarial : '';
        cpfOUidVenda = cpfOUidVenda ? cpfOUidVenda : '';
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
                
        try {
            // const response = await getVendaCliente(nnf, serie, idEmpresa, idVenda, idSubGrupoEmpresarial, cpfOUidVenda, dataPesquisaInicio, dataPesquisaFim, page, pageSize)
            // const response = await getVendaDetalhe(nnf, serie, idEmpresa, idVenda, idSubGrupoEmpresarial, cpfOUidVenda, dataPesquisaInicio, dataPesquisaFim, page, pageSize)
            const apiUrl = `${url}/api/venda/lista-venda-cliente.xsjs?id=${idVenda}&dtInicio=${dataPesquisaInicio}&dtFim=${dataPesquisaFim}&idSubgrupoEmpresarial=${idSubGrupoEmpresarial}&idEmpresa=${idEmpresa}&cpfouIdVenda=${cpfOUidVenda}&nnf=${nnf}&serie=${serie}&pageSize=${pageSize}&page=${page}`;
            const response = await axios.get(apiUrl)
            return res.json(response.data); 
        } catch (error) {
            console.error("Error no AdmVendasControllers.getListaVendaCliente:", error);
            throw error;
        }
        
    }

    async putAlterarVendasPagamento(req, res) {
        try {
            const vendas = Array.isArray(req.body) ? req.body : [req.body]; 
            const response = await  updateAlterarVendaPagamento(vendas);
            return res.json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    
    async putVendaVendedor(req, res) {
        try {
            const vendas = Array.isArray(req.body) ? req.body : [req.body]; 
            // const response = await  updateVendaVendedor(vendas);
            const response = await  axios.put(`${url}/api/administrativo/venda-vendedor.xsjs`, vendas);
            return res.status(200).json({message: "Venda atualizada com sucesso", });
        } catch (error) {
            console.error("Error no AdmVendasControllers.putVendaVendedor:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    async putAlterarVendaRecebimento(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body]; 
            const response = await  updateAlterarVendaRecebimento(dados);
            return res.json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    async postAlterarVendasPagamento(req, res) {
        try {
            const vendas = Array.isArray(req.body) ? req.body : [req.body]; 
            const response = await  createAlterarVendaPagamento(vendas);
            return res.json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: error.message });
        }
    }
}

export default new AdmVendasControllers();