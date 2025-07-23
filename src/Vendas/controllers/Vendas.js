import { dataFormatada } from "../../utils/dataFormatada.js";
import axios from 'axios';
import { getVendaXML } from "../repositories/vendaXML.js";
import { getVendaCliente } from "../repositories/listaVendaCliente.js";
import 'dotenv/config';
const url = process.env.API_URL;

class VendasControllers {

    async getListaVendas(req, res) {
        try {
            const apiUrl = `${url}/api/venda/lista-venda.xsjs`
            const response = await axios.get(apiUrl)
    
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async getListaVendaId(req, res) {
        let { idVenda } = req.query;
        try {
            const apiUrl = `${url}/api/venda/lista-venda.xsjs?id=${idVenda}`
            const response = await axios.get(apiUrl)
    
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaVendaClienteGerencia(req, res) {
        let { nnf, serie, idEmpresa, idVenda, idSubGrupoEmpresarial, cpfOUidVenda, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;
            nnf = nnf ? nnf : '';
            serie = serie ? serie : '';
            idEmpresa = idEmpresa ? idEmpresa : '';
            idVenda = idVenda ? idVenda : '';
            idSubGrupoEmpresarial = idSubGrupoEmpresarial ? idSubGrupoEmpresarial : '';
            cpfOUidVenda = cpfOUidVenda ? cpfOUidVenda : '';
            dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio : '';
            dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataPesquisaFim : '';
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';
        try {
         
            // const apiUrl = `${url}/api/venda/lista-venda-cliente.xsjs?page=${page}&dtInicio=${dataPesquisaInicio}&dtFim=${dataPesquisaFim}&cpfouIdVenda=${cpfOUidVenda}&nnf=${nnf}&serie=${serie}&idSubgrupoEmpresarial=${idSubGrupoEmpresarial}&idEmpresa=${idEmpresa}&pageSize=${pageSize}`
            // const response = await axios.get(apiUrl)
            const response = await getVendaCliente(nnf, serie, idEmpresa, idVenda, idSubGrupoEmpresarial, cpfOUidVenda, dataPesquisaInicio, dataPesquisaFim, page, pageSize)
    
            return res.json(response); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaDetalheVendaCliente(req, res) {
        let { idVenda} = req.query;
      

        try {
          
            const apiUrl = `${url}/api/venda/lista-venda-cliente.xsjs?id=${idVenda}`
            const response = await axios.get(apiUrl)
    
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaVendasSaldo(req, res) {
        let { dataPesquisaInicio, dataPesquisaFim, idGrupoEmpresarial, idEmpresa, produtoPesquisado, ufPesquisa, idFornecedor, idGrupoGrade, idGrade  } = req.query;

        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataPesquisaFim : '';
        idGrupoEmpresarial = idGrupoEmpresarial ? idGrupoEmpresarial : '';
        produtoPesquisado = produtoPesquisado ? produtoPesquisado : '';
        idFornecedor = idFornecedor ? idFornecedor : '';
        idGrupoGrade = idGrupoGrade ? idGrupoGrade : '';
        idGrade = idGrade ? idGrade : '';
        try {
            numPage = 1;
            const apiUrl = `${url}/api/venda/movimentacao-saldo.xsjs?page=&dataInicio=${dataPesquisaInicio}&dataFim=${dataPesquisaFim}&idGrupoEmpresarial=${idGrupoEmpresarial}&idEmpresa=${idEmpresa}&descricaoProduto=${produtoPesquisado}&uf=${ufPesquisa}&idFornecedor=${idFornecedor}&idGrupoGrade=${idGrupoGrade}&idGrade=${idGrade}`

            const response = await axios.get(apiUrl)
    
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaRotatividade(req, res) {
        let { dataPesquisaInicio, dataPesquisaFim, idGrupoEmpresarial, idEmpresa, produtoPesquisado, ufPesquisa, idFornecedor, idGrupoGrade, idGrade  } = req.query;

        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataPesquisaFim : '';
        idGrupoEmpresarial = idGrupoEmpresarial ? idGrupoEmpresarial : '';
        produtoPesquisado = produtoPesquisado ? produtoPesquisado : '';
        idFornecedor = idFornecedor ? idFornecedor : '';
        idGrupoGrade = idGrupoGrade ? idGrupoGrade : '';
        idGrade = idGrade ? idGrade : '';
        try {
            // ajaxGet('api/venda/rotatividade.xsjs?page='+numPage+'&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim + '&idGrupoEmpresarial=' + IDMarcaPesqVenda + '&idEmpresa=' + IDLojaPesqVenda + '&descricaoProduto=' + ProdutoPesqVenda + '&uf=' + UFPesquisa+ '&idFornecedor=' + IDForn+ '&idGrupoGrade=' + IDGrupo+ '&idGrade=' + IDGrade)

            const apiUrl = `${url}/api/venda/rotatividade.xsjs?page=&dataInicio=${dataPesquisaInicio}&dataFim=${dataPesquisaFim}&idGrupoEmpresarial=${idGrupoEmpresarial}&idEmpresa=${idEmpresa}&descricaoProduto=${produtoPesquisado}&uf=${ufPesquisa}&idFornecedor=${idFornecedor}&idGrupoGrade=${idGrupoGrade}&idGrade=${idGrade}`

            const response = await axios.get(apiUrl)
    
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaVendaXML(req, res) {
        let { idVenda, idMarca,idEmpresa, stCancelado, stContigencia, dataPesquisaInicio, dataPesquisaFim, page, pageSize  } = req.query;
        idVenda = idVenda ? idVenda : '';
        idMarca = idMarca ? idMarca : '';
        idEmpresa = idEmpresa ? idEmpresa : '';
        stCancelado = stCancelado ? stCancelado : '';
        stContigencia = stContigencia ? stContigencia : '';
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataPesquisaFim : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {
     
            const apiUrl = `http://164.152.245.77:8000/quality/concentrador/api/venda/venda-xml.xsjs?id=${idVenda}&idGrupoEmpresarial=${idMarca}&idEmpresa=${idEmpresa}&stContigencia=${stContigencia}&dataInicio=${dataPesquisaInicio}&dataFim=${dataPesquisaFim}`
            // const apiUrl = `${url}/api/venda/venda-xml.xsjs?id=${idVenda}&idGrupoEmpresarial=${idMarca}&idEmpresa=${idEmpresa}&stContigencia=${stContigencia}&dataInicio=${dataPesquisaInicio}&dataFim=${dataPesquisaFim}`

            const response = await axios.get(apiUrl)
            // const response = await getVendaXML(idVenda, idMarca,idEmpresa, stCancelado, stContigencia, dataPesquisaInicio, dataPesquisaFim, page, pageSize)
         
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Erro no VendasControllers.getListaVendaXML:", error);
            throw error;
        }
        

    }
    
}

export default new VendasControllers();
