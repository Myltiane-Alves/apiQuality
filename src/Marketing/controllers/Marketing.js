import { dataFormatada } from "../../utils/dataFormatada.js";
import axios from 'axios';
import { getPromocao } from "../Promocao/repositories/listaPromocao.js";
import { createProdutoPromocao, getProdutoPromocao, updateProdutoPromocao } from "../../Produtos/repositories/produtoPromocao.js";
import { createCampanhaCLiente, getCampanhaCliente, updateCampanhaCLiente } from "../Campanha/repositories/campanhaCliente.js";
import { createCampanhaEmpresa, getCampanhaEmpresa, updateCampanhaEmpresa } from "../Campanha/repositories/todos.js";
let url = `http://164.152.245.77:8000/quality/concentrador_node`;

class MarketingControllers {



    async getListaProdutosPromocao(req, res) {
        let { idProduto, codeBarsOuNome, page, pageSize} = req.query;
        try {
            idProduto = idProduto ? idProduto : '';
            codeBarsOuNome = codeBarsOuNome ? codeBarsOuNome : '';
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';
            const apiUrl = `${url}/api/produto-promocao.xsjs?codeBarsOuNome=${descricaoProduto}`
            const response = await axios.get(apiUrl)
            // const response = await getProdutoPromocao(idProduto, codeBarsOuNome, page, pageSize)
    
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }
    async getListaPromocao(req, res) {
        let { idResumoPromocao, page, pageSize } = req.query;
        try {
            idResumoPromocao = idResumoPromocao ? idResumoPromocao : '';
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';
            const apiUrl = `${url}/api/promocao/listapromocao.xsjs?idResumoPromocao=${idResumoPromocao}&page=${page}&pageSize=${pageSize}`  
            const response = await axios.get(apiUrl)
            // const response = await getPromocao(idResumoPromocao, page, pageSize)
    
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }
    async getListaCampanha(req, res) {
        let { idCampanha, page, pageSize } = req.query;
        try {
            idCampanha = idCampanha ? idCampanha : '';
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';
            const apiUrl = `${url}/api/campanha/todos.xsjs`
            const response = await axios.get(apiUrl)
            // const response = await getCampanhaEmpresa(idCampanha, page, pageSize)
    
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }
    async getListaCampanhaCliente(req, res) {
        let { cpf,telefone, idCampanha, page, pageSize } = req.query;
        try {
            cpf = cpf ? cpf : '';
            telefone = telefone ? telefone : '';
            idCampanha = idCampanha ? idCampanha : '';
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';

            const apiUrl = `${url}/api/campanha/cliente.xsjs?cpf=${cpf}&telefone=${telefone}&idCampanha=${idCampanha}&page=${page}&pageSize=${pageSize}`
          
            const response = await axios.get(apiUrl)
            // const response = await getCampanhaCliente(cpf,telefone, idCampanha, page, pageSize)
    
            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async putCampanhaCliente(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];  

            const response = await axios.put(`${url}/api/campanha/cliente.xsjs`, dados)
            // const response = await  updateCampanhaCLiente(dados)
        
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async putProdutoPromocao(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];   
            const response = await updateProdutoPromocao(dados)
        
            return res.json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }
   
    async putCampanhaEmpresa(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];   
            const response = await updateCampanhaEmpresa(dados)
        
            return res.json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async postCampanhaCliente(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];   
            const response = await axios.post(`${url}/api/campanha/cliente.xsjs`, dados)
            // const response = await  createCampanhaCLiente(dados)
        
            return res.json(response.adat);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }
    async postCampanhaEmpresa(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];   

            const response = await axios.post(`${url}/api/campanha/todos.xsjs`, dados)
            
            // const response = await createCampanhaEmpresa(dados)
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }
    
    async postProdutoPromocao(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];   
            const response = await axios.post(`${url}/api/produto-promocao.xsjs`, dados)

            // const response = await createProdutoPromocao(dados)
        
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }
}

export default new MarketingControllers();
