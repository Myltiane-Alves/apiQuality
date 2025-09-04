import axios from "axios";
import { dataFormatada } from "../../utils/dataFormatada.js";
import { getProdutoQuality } from "../repositories/produtoQuality.js";
import 'dotenv/config';
const url = process.env.API_URL;

class ProdutoControllers  {

    async getListaPedidos(req,res) {
        let { dataPesquisaInicio, dataPesquisaFim, idFornPesquisa, idMarcaPesquisa, NuPedidoPesquisa, idFabPesquisa, idCompradorPesq, STSituacoPedidoPesq, pageNumber } = req.query;

        const pageSize = 100;
        const offset = (pageNumber - 1) * pageSize;
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio)
        dataPesquisaFim = dataFormatada(dataPesquisaFim)
        try {
            // ajaxGet('api/compras/lista_pedidos.xsjs?pageSize=1000&page=' + numPage + '&dataPesquisaInicio=' + dataPesqInic + '&dataPesquisaFim=' + dataPesqFim + '&idFornPesquisa=' + idFornPesq + '&idMarcaPesquisa=' + idMarcaPesq + '&idpedido=' + NuPedidoPesq + '&idFabPesquisa=' + idFabPesq + '&idCompradorPesquisa=' + idCompradorPesq + '&stSituacaoSAP=' + STSituacoPedidoPesq)
            const apiUrl = `${url}/api/compras/lista_pedidos.xsjs?pageSize=1000&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idFornPesquisa=${idFornPesquisa}&idMarcaPesquisa=${idMarcaPesquisa}&idpedido=${NuPedidoPesquisa}&idFabPesquisa=${idFabPesquisa}&idCompradorPesquisa=${idCompradorPesq}&stSituacaoSAP=${STSituacoPedidoPesq}`;
            const response = await axios.get(apiUrl)
            return res.json(response.data); // Retorna
        } catch(error) {
            console.error("Unable to connect to the database:", error);
                throw error;
        }
        
    }

    async getListaProdutosLojaQuality(req, res) {
        let { descricaoProduto, idEmpresa, idListaLoja, codBarrasOuNome, page, pageSize } = req.query;
    
    
        descricaoProduto = descricaoProduto ? descricaoProduto : ''; 
        idEmpresa = idEmpresa ? idEmpresa : ''; 
        idListaLoja = idListaLoja ? idListaLoja : '';         
        codBarrasOuNome = codBarrasOuNome ? codBarrasOuNome : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {   

            const apiUrl = `${url}/api/produto-sap/produto-quality.xsjs?page=${page}&pageSize${pageSize}&codeBarsOuNome=${descricaoProduto}&IdEmpresaLoja=${idEmpresa}&IdListaLoja=${idListaLoja}`;
            const response = await axios.get(apiUrl)
            // const response = await getProdutoQuality(idEmpresa, codBarrasOuNome, page, pageSize);

            return res.json(response.data); // Retorna
        } catch(error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        } 
    }
    async getListaProdutosPrecoInformatica(req, res) {
        let { idEmpresa, dsProduto, page, pageSize } = req.query;
    
    
        dsProduto = dsProduto ? dsProduto : ''; 
        idEmpresa = idEmpresa ? idEmpresa : ''; 
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {   
            const apiUrl = `${url}/api/informatica/produto-preco.xsjs?idEmpresa=${idEmpresa}&dsProduto=${dsProduto}`;
            const response = await axios.get(apiUrl)
            // const response = await getProdutoPreco(idEmpresa, codBarrasOuNome, page, pageSize);
            return res.json(response.data); // Retorna
        } catch(error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        } 
    }

    async getListaProdutosInformaticaQuality(req, res) {
        let { 
        
            descricaoProduto, 
            idEmpresa,
            idListaEmpresa,
        } = req.query;
    
    
        descricaoProduto = descricaoProduto ? descricaoProduto : ''; 
        idEmpresa = idEmpresa ? idEmpresa : ''; 
        idListaEmpresa = idListaEmpresa ? idListaEmpresa : '';         
    
        try {   
            const apiUrl = `${url}/api/produto-sap/produto-quality.xsjs?codeBarsOuNome=${descricaoProduto}&IdEmpresaLoja=${idEmpresa}`;
            const response = await axios.get(apiUrl)
            return res.json(response.data); // Retorna
        } catch(error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        } 
    }
    
    async getListaProdutosLojaSap(req, res) {
        let { descricaoProduto, idEmpresaLogin, idListaLoja, page, pageSize  } = req.query;
    
    
        descricaoProduto = descricaoProduto ? descricaoProduto : ''; 
        idEmpresaLogin = idEmpresaLogin ? idEmpresaLogin : ''; 
        idListaLoja = idListaLoja ? idListaLoja : '';         
        pageSize = pageSize ? pageSize : '';
        page = page ? page : '';
    
        try {   
            // api/produto-sap/produto-sap.xsjs?page=' + numPage + '&codeBarsOuNome=' + DSdesc + '&IdEmpresaLoja=' + IDEmpresaLogin + '&IdListaLoja=' + IDListaEmp
            const apiUrl = `${url}/api/produto-sap/produto-sap.xsjs?page=${page}&pageSize=${pageSize}&codeBarsOuNome=${descricaoProduto}&IdEmpresaLoja=${idEmpresaLogin}&IdListaLoja=${idListaLoja}`;
            const response = await axios.get(apiUrl)
            return res.json(response.data); // Retorna
        } catch(error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        } 
    }

    async getListaProdutos(req, res) {
        let { idEmpresa, idProduto, dsProduto, codBarras, page, pageSize  } = req.query; 
        idEmpresa = idEmpresa ? idEmpresa : '';        
        idProduto = idProduto ? idProduto : '';
        dsProduto = dsProduto ? dsProduto : '';
        codBarras = codBarras ? codBarras : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
    
        try {   
            const apiUrl = `${url}/api/produto.xsjs?idEmpresa=${idEmpresa}&byId=${idProduto}&dsProduto=${dsProduto}&codeBars=${codBarras}&page=${page}&pageSize=${pageSize}`;
            const response = await axios.get(apiUrl)
            return res.json(response.data); // Retorna
        } catch(error) {
            console.error("Erro no ProdutoControllers getListaProdutos:", error);
            return res.status(500).json({ error: "Erro no servidor ao buscar produtos." });
        } 
    }

    async getListaGrade(req, res) {
        let { idGrupo  } = req.query; 
        idGrupo = idGrupo ? idGrupo : '';        
    
        try {   
            const apiUrl = `${url}/api/produto-sap/grade.xsjs?idgrupograde=${idGrupo}`;
            const response = await axios.get(apiUrl)
            return res.json(response.data); // Retorna
        } catch(error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        } 
    }
    
    async getListaGrupoProdutoSap(req, res) {
        let { idEmpresa } = req.query;

        try {
            const apiUrl = `${url}/api/produto-sap/grupo.xsjs`;
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async ListaProdutosEtiqueta(req, res) {
        let { idEmpresa } = req.query;

        try {

            const apiUrl = `${url}/api/produtos/listas-de-precos-SAP.xsjs?page=1`;
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }
    
    async getListaResponsavelAlteracaoPreco(req, res) {
        let { idEmpresa } = req.query;
        
        try {
            
            const apiUrl = `${url}/api/produtos/responsaveis-alteracoes-de-precos.xsjs`;
            const response = await axios.get(apiUrl)
            
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }
    
    async getListaAlteracaoPrecoResumo(req, res) {
        let { dataPesquisaInicio, dataPesquisaFim, id, idLista, idLoja, idUsuario, idProduto, descProduto, codBarras, page, pageSize } = req.query;
        idResumoAlteracao = idResumoAlteracao ? idResumoAlteracao : '';
        idLoja = idLoja ? idLoja : '';
        idLista = idLista ? idLista : '';
        idUsuario = idUsuario ? idUsuario : '';
        idProduto = idProduto ? idProduto : '';
        codBarras = codBarras ? codBarras : '';
        descProduto = descProduto ? descProduto : '';
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {
            // http://164.152.245.77:8000/quality/concentrador_homologacao/api/produtos/alteracoes-de-precos-resumo.xsjs?dtInicio=2024-12-11&dtFim=2024-12-11&id=&idLista=&idLoja=&idUser=&idProd=&descProd=&codeBars=&page=1
            const apiUrl = `${url}/api/produtos/alteracoes-de-precos-resumo.xsjs?dtIinicio=${dataPesquisaInicio}&dtFim=${dataPesquisaFim}&id=${id}&idLista=${idLista}&idLoja=${idLoja}&idUser=${idUsuario}&idProd=${idProduto}&descProd=${descProduto}&codeBars=${codBarras}&page=${page}&pageSize=${pageSize}`;
            const response = await axios.get(apiUrl)
            
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async getListaAlteracaoPrecoDetalhe(req, res) {
        let { idAlteracaoPreco, page, pageSize } = req.query;
        
        idAlteracaoPreco = idAlteracaoPreco ? idAlteracaoPreco : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {
            // http://164.152.245.77:8000/quality/concentrador_homologacao/api/produtos/alteracoes-de-precos-resumo.xsjs?dtInicio=2024-12-11&dtFim=2024-12-11&id=&idLista=&idLoja=&idUser=&idProd=&descProd=&codeBars=&page=1
            const apiUrl = `${url}/api/produtos/alteracoes-de-precos-detalhes.xsjs?idAlteracao=${idAlteracaoPreco}&page=${page}&pageSize=${pageSize}`;
            const response = await axios.get(apiUrl)
            
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async ListaProdutosEtiquetagem(req, res) {
        let { idLista, idProduto, descricao, codBarras, page, pageSize } = req.query;

        idLista = idLista ? idLista : '';
        idProduto = idProduto ? idProduto : '';
        descricao = descricao ? descricao : '';
        codBarras = codBarras ? codBarras : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        
        try {
                           
            const apiUrl = `${url}/api/produtos/lista-produtos-etiqueta-SAP.xsjs?idLista=${idLista}&id=${idProduto}&descProd=${descricao}&codeBars=${codBarras}&page=${page}&pageSize=${pageSize}`;
            const response = await axios.get(apiUrl)
            console.log(apiUrl, 'url')
            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

}

export default new ProdutoControllers();