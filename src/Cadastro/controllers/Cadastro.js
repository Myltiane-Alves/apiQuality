import axios from "axios";
import { dataFormatada } from "../../utils/dataFormatada.js";
import { createDetalheProdutoPedido, updateDetalheProdutoPedido } from "../repositories/cadastrarProdutoAvulso.js";
import { getProduto } from "../repositories/consultaProduto.js";
import { getNFPedido } from "../repositories/nfPedido.js";
let url = `http://164.152.245.77:8000/quality/concentrador_homologacao`;

class CadastroControllers  {

    
    async getListaProdutoCriadoPedidoCompra(req, res) {
        let { 
            NuPedidoPesquisa,
            dataPesquisaInicio, 
            dataPesquisaFim,
        } = req.query;
    
        dataPesquisaInicio = dataPesquisaInicio ? dataFormatada(dataPesquisaInicio) : ''; 
        dataPesquisaFim = dataPesquisaFim ? dataFormatada(dataPesquisaFim) : '';
        NuPedidoPesquisa = NuPedidoPesquisa ? NuPedidoPesquisa : '';

        try {
            const apiUrl = `${url}/api/cadastro/cadastrar-produto-pedido.xsjs?iResPedido=${NuPedidoPesquisa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;
            const response = await axios.get(apiUrl)
            return res.json(response.data); // Retorna
        } catch(error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        } 
    }
    
    async getListaCategoriasProduto(req, res) {
        let { idTipoPedido } = req.query;
        idTipoPedido = idTipoPedido ? idTipoPedido : '';
        
        
        try {
            const apiUrl = `${url}/api/cadastro/categorias.xsjs?idtipopedido=${idTipoPedido}`;
            const response = await axios.get(apiUrl)
            return res.json(response.data); // Retorna
        } catch(error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        } 
    }
    
    async getListaProdutosAvulso(req, res) {
        let { 
            idDetalhePedidoProduto,
            descricao,
            codBarras,
            dataPesquisaFim,
            dataPesquisaInicio,
            page, 
            pageSize
        } = req.query;
        
        idDetalhePedidoProduto = idDetalhePedidoProduto ? idDetalhePedidoProduto : '';
        codBarras = codBarras ? codBarras : '';
        descricao = descricao ? descricao : '';
        dataPesquisaInicio = dataPesquisaInicio ? dataFormatada(dataPesquisaInicio) : ''; 
        dataPesquisaFim = dataPesquisaFim ? dataFormatada(dataPesquisaFim) : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';

        try {
            const apiUrl = `${url}/api/cadastro/cadastrar-produto-avulso.xsjs?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&DescProdAv=${descricao}&BarrasProdAv=${codBarras}&idDetalhePedidoProduto=${idDetalhePedidoProduto}&page=${page}&pageSize=${pageSize}`;
            const response = await axios.get(apiUrl)
            return res.json(response.data); // Retorna
        } catch(error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        } 
    }
    async getListaTipoProdutos(req, res) {
        let { } = req.query;

        try {
            const apiUrl = `${url}/api/cadastro/tipoproduto.xsjs?`;
            const response = await axios.get(apiUrl)
            return res.json(response.data); // Retorna
        } catch(error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        } 
    }
    async getListaTipoFiscalProdutos(req, res) {
        let { } = req.query;

        try {
            const apiUrl = `${url}/api/cadastro/tipofiscalproduto.xsjs?`;
            const response = await axios.get(apiUrl)
            return res.json(response.data); // Retorna
        } catch(error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        } 
    }
    
    async getConsultaProdutos(req, res) {
        let { descricaoProduto, page, pageSize } = req.query;
        descricaoProduto = descricaoProduto ? descricaoProduto : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {
            // const apiUrl = `${url}/api/cadastro/consulta_produtos.xsjs?`;
            // const response = await axios.get(apiUrl)
            const response = await getProduto(descricaoProduto, page, pageSize);
            return res.json(response); // Retorna
        } catch(error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        } 
    }

    async getListaNFPedido(req, res) {
        let { idPedido, idResumoEntrada, idFonecedor, numSerie, numNFE, dataPesquisaInicio, dataPesquisaFim, stTransformado, page, pageSize } = req.query;
        idPedido = idPedido ? idPedido : '';
        idResumoEntrada = idResumoEntrada ? idResumoEntrada : '';
        idFonecedor = idFonecedor ? idFonecedor : '';
        numSerie = numSerie ? numSerie : '';
        numNFE = numNFE ? numNFE : '';
        dataPesquisaInicio = dataPesquisaInicio ? dataFormatada(dataPesquisaInicio) : '';
        dataPesquisaFim = dataPesquisaFim ? dataFormatada(dataPesquisaFim) : '';
        stTransformado = stTransformado ? stTransformado : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {
            // const apiUrl = `${url}/api/cadastro/cadastro_nfpedido.xsjs?idPedido=${idPedido}&idResumoEntrada=${idResumoEntrada}&idFonecedor=${idFonecedor}&numSerie=${numSerie}&numNFE=${numNFE}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&stTransformado=${stTransformado}&page=${page}&pageSize=${pageSize}`;
            const apiUrl = `${url}/api/cadastro/cadastrar-nota-fiscal-entrada.xsjs?id=${idPedido}&idResumoEntrada=${idResumoEntrada}&idFonecedor=${idFonecedor}&numSerie=${numSerie}&numNFE=${numNFE}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&stTransformado=${stTransformado}&page=${page}&pageSize=${pageSize}`;
            const response = await axios.get(apiUrl)
            // const response = await getNFPedido(idPedido, idResumoEntrada, dataPesquisaInicio, dataPesquisaFim, stTransformado, page, pageSize);
            return res.json(response.data); // Retorna
        } catch(error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        } 
    }

    
    async putDetalheProdutoPedido(req, res) {
        try {
            const depositos = Array.isArray(req.body) ? req.body : [req.body]; 
            const response = await  updateDetalheProdutoPedido(depositos);
            return res.json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: error.message });
        }
       
    }

    async postDetalheProdutoPedido(req, res) {
        try {
            const depositos = Array.isArray(req.body) ? req.body : [req.body]; 
            const response = await  createDetalheProdutoPedido(depositos);
            return res.json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: error.message });
        }
       
    }
}

export default new CadastroControllers();