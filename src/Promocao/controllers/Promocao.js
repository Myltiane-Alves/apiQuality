import { createPromocao, getPromocaoAtiva, updatePromocao } from "../repositories/promocaoAtiva.js";
let url = `http://164.152.245.77:8000/quality/concentrador_homologacao`;
// let url = `http://164.152.245.77:8000/quality/concentrador`;
import axios from "axios";
// import 'dotenv/config';
// const url = process.env.API_URL;
class PromocaoControllers  {


   async getListaMecanicaAtivas(req, res) {
        let { idResumoPromocao, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query; 
            idResumoPromocao = idResumoPromocao ? idResumoPromocao : '';
            dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
            dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';     
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';
        try {   
            // const apiUrl = `${url}/api/promocoes-ativas/select-mecanica.xsjs`
            const apiUrl = `http://164.152.245.77:8000/quality/concentrador_homologacao/api/promocoes-ativas/select-mecanica.xsjs`
            const response = await axios.get(apiUrl)
            return res.json(response.data);
        } catch(error) {
            console.error("erro no PromocaoControllers  getListaMecanicaAtivas:", error);
            throw error;
        } 
    }

    async getListaPromocoesAtivas(req, res) {
        let { idResumoPromocao, dataPesquisaInicio, dataPesquisaFim, status, page, pageSize } = req.query; 
            idResumoPromocao = idResumoPromocao ? idResumoPromocao : '';
            dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
            dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';     
            status = status ? status : '';
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';
        try {   
            // const apiUrl = `${url}/api/promocoes-ativas/promocao-ativa.xsjs?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idResumoPromocao=${idResumoPromocao}&status=${status}&page=${page}&pageSize=${pageSize}`;
            const apiUrl = `http://164.152.245.77:8000/quality/concentrador_homologacao/api/promocoes-ativas/promocao-ativa.xsjs?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idResumoPromocao=${idResumoPromocao}&status=${status}&page=${page}&pageSize=${pageSize}`;
            const response = await axios.get(apiUrl)
            // const response = await getPromocaoAtiva(idResumoPromocao, dataPesquisaInicio, dataPesquisaFim, page, pageSize)

            return res.json(response.data);
        } catch(error) {
            console.error("erro no PromocaoControllers  getListaPromocoesAtivas:", error);
            throw error;
        } 
    }
    async getListaDetalhesPromocoesAtivas(req, res) {
        let { idResumoPromocao, dataPesquisaInicio, dataPesquisaFim, page, pageSize} = req.query; 
            idResumoPromocao = idResumoPromocao ? idResumoPromocao : '';    
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';
        try {   
            // const apiUrl = `${url}/api/promocoes-ativas/detalhe-promocao-ativa.xsjs?idResumoPromocao=${idResumoPromocao}&page=${page}&pageSize=${pageSize}`;
            const apiUrl = `http://164.152.245.77:8000/quality/concentrador_homologacao/api/promocoes-ativas/detalhe-promocao-ativa.xsjs?idResumoPromocao=${idResumoPromocao}&page=${page}&pageSize=${pageSize}`;
            const response = await axios.get(apiUrl)
            // const response = await getPromocaoAtiva(idResumoPromocao, dataPesquisaInicio, dataPesquisaFim, page, pageSize)
            return res.json(response.data);
        } catch(error) {
            console.error("erro no PromocaoControllers  getListaPromocoesAtivas:", error);
            throw error; 
        } 
    }

    async getListaProdutosPromocoesAtiva(req, res) {
        let { idEmpresa, idProduto, dsProduto, codBarras, page, pageSize  } = req.query; 
        idEmpresa = idEmpresa ? idEmpresa : '';        
        idProduto = idProduto ? idProduto : '';
        dsProduto = dsProduto ? dsProduto : '';
        codBarras = codBarras ? codBarras : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
    
        try {   
            // const apiUrl = `${url}/api/promocoes-ativas/produto-promocao-ativa.xsjs?idProduto=${idProduto}&dsProduto=${dsProduto}&codeBars=${codBarras}&page=${page}&pageSize=${pageSize}`;
            const apiUrl = `http://164.152.245.77:8000/quality/concentrador_homologacao/api/promocoes-ativas/produto-promocao-ativa.xsjs?idProduto=${idProduto}&dsProduto=${dsProduto}&codeBars=${codBarras}&page=${page}&pageSize=${pageSize}`;
            const response = await axios.get(apiUrl)
          
            return res.json(response.data); // Retorna
        } catch(error) {
            console.error("Erro no PromoçãoControllers getListaProdutosPromocoesAtiva:", error);
            return res.status(500).json({ error: "Erro no servidor ao buscar produtos." });
        } 
    }

    async getListaProdutosDestinoPromocoesAtiva(req, res) {
        let {  idProduto, dsProduto, codBarras, page, pageSize  } = req.query;      
        idProduto = idProduto ? idProduto : '';
        dsProduto = dsProduto ? dsProduto : '';
        codBarras = codBarras ? codBarras : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
    
        try {   
            // const apiUrl = `${url}/api/promocoes-ativas/produto-promocao-destino.xsjs?idProduto=${idProduto}&dsProduto=${dsProduto}&codeBars=${codBarras}&page=${page}&pageSize=${pageSize}`;
            const apiUrl = `http://164.152.245.77:8000/quality/concentrador_homologacao/api/promocoes-ativas/produto-promocao-destino.xsjs?idProduto=${idProduto}&dsProduto=${dsProduto}&codeBars=${codBarras}&page=${page}&pageSize=${pageSize}`;
            const response = await axios.get(apiUrl)
            return res.json(response.data); // Retorna
        } catch(error) {
            console.error("Erro no PromoçãoControllers getListaProdutosDestinoPromocoesAtiva:", error);
            return res.status(500).json({ error: "Erro no servidor ao buscar produtos." });
        } 
    }

    async getListaProdutosOrigemPromocoesAtiva(req, res) {
        let {  idProduto, dsProduto, codBarras, page, pageSize  } = req.query;      
        idProduto = idProduto ? idProduto : '';
        dsProduto = dsProduto ? dsProduto : '';
        codBarras = codBarras ? codBarras : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
    
        try {   
            // const apiUrl = `${url}/api/promocoes-ativas/produto-promocao-origem.xsjs?idProduto=${idProduto}&dsProduto=${dsProduto}&codeBars=${codBarras}&page=${page}&pageSize=${pageSize}`;
            const apiUrl = `http://164.152.245.77:8000/quality/concentrador_homologacao/api/promocoes-ativas/produto-promocao-origem.xsjs?idProduto=${idProduto}&dsProduto=${dsProduto}&codeBars=${codBarras}&page=${page}&pageSize=${pageSize}`;
            const response = await axios.get(apiUrl)
            return res.json(response.data); // Retorna
        } catch(error) {
            console.error("Erro no PromoçãoControllers getListaProdutosOrigemPromocoesAtiva:", error);
            return res.status(500).json({ error: "Erro no servidor ao buscar produtos." });
        } 
    }


    async getListaEmpresasPromocoesAtiva(req, res) {
        let { idResumoPromocao, page, pageSize  } = req.query; 
        idResumoPromocao = idResumoPromocao ? idResumoPromocao : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
    
        try {   
            // const apiUrl = `${url}/api/promocoes-ativas/empresa-promocao.xsjs?idResumoPromocao=${idResumoPromocao}&page=${page}&pageSize=${pageSize}`;
            const apiUrl = `http://164.152.245.77:8000/quality/concentrador_homologacao/api/promocoes-ativas/empresa-promocao.xsjs?idResumoPromocao=${idResumoPromocao}&page=${page}&pageSize=${pageSize}`;
            const response = await axios.get(apiUrl)
   
            return res.json(response.data); // Retorna
        } catch(error) {
            console.error("Erro no PromoçãoControllers getListaEmpresasPromocoesAtiva:", error);
            return res.status(500).json({ error: "Erro no servidor ao buscar empresas." });
        } 
    }

    async putPromocao(req, res) {
        try {
            let {
                IDRESUMOPROMOCAOMARKETING,
                IDMECANICARESUMOPROMOCAOMARKETING,
                TPAPARTIRDE,
                TPAPLICADOA,
                TPFATORPROMO,
                APARTIRDEQTD,
                APARTIRDOVLR,
                FATORPROMOVLR,
                FATORPROMOPERC,
                VLPRECOPRODUTO,
                DTHORAINICIO,
                DTHORAFIM,
                DSPROMOCAOMARKETING,
                IDPRODUTO,
                STATIVO,
                STEMPRESAPROMO,
                STDETPROMOORIGEM,
                STDETPROMODESTINO,
                IDEMPRESA,
                IDGRUPOEMDESTINO,
                IDSUBGRUPOEMDESTINO,
                IDMARCAEMDESTINO,
                IDFORNECEDOREMDESTINO,
                IDPRODUTODESTINO,
                IDGRUPOEMORIGEM,
                IDSUBGRUPOEMORIGEM,
                IDMARCAEMORIGEM,
                IDFORNECEDOREMORIGEM,
                IDPRODUTOORIGEM
            } = req.body;   

            if(!IDRESUMOPROMOCAOMARKETING) {
                return res.status(400).json({ error: "IDRESUMOPROMOCAOMARKETING é obrigatório." });
            }
            
            // const response = await axios.put(`${url}/api/promocoes-ativas/promocao-ativa.xsjs`, [{
            const response = await axios.put(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/promocoes-ativas/promocao-ativa.xsjs`, [{
                DSPROMOCAOMARKETING,
                DTHORAINICIO,
                DTHORAFIM,
                TPAPLICADOA,
                APARTIRDEQTD,
                APARTIRDOVLR,
                TPFATORPROMO,
                FATORPROMOVLR,
                FATORPROMOPERC,
                TPAPARTIRDE,
                VLPRECOPRODUTO,
                STEMPRESAPROMO,
                STDETPROMOORIGEM,
                STDETPROMODESTINO,
                IDMECANICARESUMOPROMOCAOMARKETING,
                STATIVO,
                IDRESUMOPROMOCAOMARKETING,
                IDPRODUTO,
                IDEMPRESA,
                IDGRUPOEMDESTINO,
                IDSUBGRUPOEMDESTINO,
                IDMARCAEMDESTINO,
                IDFORNECEDOREMDESTINO,
                IDPRODUTODESTINO,
                IDGRUPOEMORIGEM,
                IDSUBGRUPOEMORIGEM,
                IDMARCAEMORIGEM,
                IDFORNECEDOREMORIGEM,
                IDPRODUTOORIGEM
                
                
            }]);
            
            
            return res.status(200).json({
                message: "Promoção atualizada com sucesso",
                data: response.data
            });
        } catch (error) {
            console.error("Erro ao atualizar promoção:", error);
            return res.status(500).json({ error: "Erro ao atualizar promoção." });
        }
    }
    async putProdutoDestinoPromocao(req, res) {
        try {
            let {
                IDRESUMOPROMOCAOMARKETING,
                STATIVO,
                IDPRODUTODESTINO,
            } = req.body;   

            if(!IDRESUMOPROMOCAOMARKETING) {
                return res.status(400).json({ error: "IDRESUMOPROMOCAOMARKETING é obrigatório." });
            }
            
                                                        
            // const response = await axios.put(`${url}/api/promocoes-ativas/desativar-pruduto-promocao-destino.xsjs`, [{
            const response = await axios.put(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/promocoes-ativas/desativar-pruduto-promocao-destino.xsjs`, [{
                STATIVO,
                IDRESUMOPROMOCAOMARKETING,
                IDPRODUTODESTINO
                
            }]);
            
            return res.status(200).json({
                message: "Produto Destino da Promoção atualizada com sucesso",
                data: response.data
            });
        } catch (error) {
            console.error("Erro ao atualizar Produto Destino da Promoção:", error);
            return res.status(500).json({ error: "Erro ao atualizar Produto Destino da Promoção." });
        }
    }
    
    async putProdutoOrigemPromocao(req, res) {
        try {
            let {
                IDRESUMOPROMOCAOMARKETING,
                STATIVO,
                IDPRODUTOORIGEM,
            } = req.body;

            if(!IDRESUMOPROMOCAOMARKETING) {
                return res.status(400).json({ error: "IDRESUMOPROMOCAOMARKETING é obrigatório." });
            }
            // const response = await axios.put(`${url}/api/promocoes-ativas/desativar-pruduto-promocao-origem.xsjs`, [{
            const response = await axios.put(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/promocoes-ativas/desativar-pruduto-promocao-origem.xsjs`, [{
                STATIVO,
                IDRESUMOPROMOCAOMARKETING,
                IDPRODUTOORIGEM
            }]);

            return res.status(200).json({
                message: "Produto Origem da Promoção atualizada com sucesso",
                data: response.data
            });

        } catch (error) {
            console.error("Erro ao atualizar Produto Origem da Promoção:", error);
            return res.status(500).json({ error: "Erro ao atualizar Produto Origem da Promoção." });
        }
    }

    async putEmpresaPromocao(req, res) {
        try {
            let {
                IDRESUMOPROMOCAOMARKETING,
                STATIVO,
                IDEMPRESA,
                IDEMPRESAPROMOCAOMARKETING
            } = req.body;

            if(!IDRESUMOPROMOCAOMARKETING) {
                return res.status(400).json({ error: "IDRESUMOPROMOCAOMARKETING é obrigatório." });
            }
            // const response = await axios.put(`${url}/api/promocoes-ativas/desativar-empresa-promocao.xsjs`, [{
            const response = await axios.put(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/promocoes-ativas/desativar-empresa-promocao.xsjs`, [{
                STATIVO,
                IDRESUMOPROMOCAOMARKETING,
                IDEMPRESA,
                IDEMPRESAPROMOCAOMARKETING
            }]);

            return res.status(200).json({
                message: "Empresa da Promoção atualizada com sucesso",
                data: response.data
            });

        } catch (error) {
            console.error("Erro ao atualizar Empresa da Promoção:", error);
            return res.status(500).json({ error: "Erro ao atualizar Empresa da Promoção." });
        }
    }


    async putStatusPromocao(req, res) {
        try {
            let {
                IDRESUMOPROMOCAOMARKETING,
                STATIVO,
                IDEMPRESA,
                IDEMPRESAPROMOCAOMARKETING
            } = req.body;

            if(!IDRESUMOPROMOCAOMARKETING) {
                return res.status(400).json({ error: "IDRESUMOPROMOCAOMARKETING é obrigatório." });
            }
            // const response = await axios.put(`${url}/api/promocoes-ativas/desativar-status-promocao.xsjs`, [{
            const response = await axios.put(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/promocoes-ativas/desativar-status-promocao.xsjs`, [{
                STATIVO,
                IDRESUMOPROMOCAOMARKETING,
                IDEMPRESA,
                IDEMPRESAPROMOCAOMARKETING
            }]);

            return res.status(200).json({
                message: "Empresa da Promoção atualizada com sucesso",
                data: response.data
            });

        } catch (error) {
            console.error("Erro ao atualizar Empresa da Promoção:", error);
            return res.status(500).json({ error: "Erro ao atualizar Empresa da Promoção." });
        }
    }
    
    async postPromocao(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];
                  
            // const response = await axios.post(`${url}/api/promocoes-ativas/promocao-ativa.xsjs`, dados);
            const response = await axios.post(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/promocoes-ativas/promocao-ativa.xsjs`, dados);

            
            return res.status(200).json({
                message: "Promoção(s) criada(s) com sucesso",
                data: response.data
            });
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async postMecanicaAtivas(req, res) {
        // console.log("postMecanicaAtivas - req.query:", req.query);
        try {   
            let { DESCRICAO, APLICACAODESTINO, MECANICA, TIPODESCONTO } = req.body; 
            // if(!MECANICA || !APLICACAODESTINO || !TIPODESCONTO) {
            //     return res.status(400).json({ error: "Todos os parâmetros (DESCRICAO, APLICACAODESTINO, MECANICA, TIPODESCONTO) são obrigatórios." });
            // }

            // const response = `${url}/api/select-mecanica.xsjs`
            // const response = await axios.post(`${url}/api/promocoes-ativas/select-mecanica.xsjs`, {
            const response = await axios.post(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/promocoes-ativas/select-mecanica.xsjs`, {
                    DESCRICAO,
                    APLICACAODESTINO,
                    MECANICA,
                    TIPODESCONTO
                },
            )
            
            return res.json(response.data);
        } catch(error) {
            console.error("erro no PromocaoControllers  postMecanicaAtivas:", error);
            throw error;
        } 
    }

    // async postPromocao(req, res) {
    //     try {
    //         const dados = Array.isArray(req.body) ? req.body : [req.body];
    //         const promocao = dados[0]; 

    //         if (!promocao.TPAPLICADOA) {
    //             return res.status(400).json({ error: "Selecione uma mecânica!" });
    //         }
    //         if (!promocao.IDEMPRESA) {
    //             return res.status(400).json({ error: "Selecione uma empresa!" });
    //         }
    //         if (!promocao.DSPROMOCAOMARKETING || promocao.DSPROMOCAOMARKETING.length < 20 || promocao.DSPROMOCAOMARKETING.length > 200) {
    //             return res.status(400).json({ error: "Descrição deve ter entre 20 e 200 caracteres!" });
    //         }

    //         const apiUrl = `${url}/api/promocao-ativa.xsjs?dataPesquisaFim=${promocao.DTHORAFIM.split(' ')[0]}&idEmpresa=${promocao.IDEMPRESA}`;
    //         const responseAtivas = await axios.get(apiUrl);
    //         const promocoesAtivas = responseAtivas.data || [];

    //         const existeMecanicaAplicacao = promocoesAtivas.some(p =>
    //             p.TPAPLICADOA == promocao.TPAPLICADOA &&
    //             p.TPAPARTIRDE == promocao.TPAPARTIRDE
    //         );
    //         if (existeMecanicaAplicacao) {
    //             return res.status(400).json({ error: "Já existe uma promoção ativa com esta mecânica e aplicação destino." });
    //         }

    //         const existeAplicacaoDestino = promocoesAtivas.some(p =>
    //             p.TPAPARTIRDE == promocao.TPAPARTIRDE
    //         );
    //         if (existeAplicacaoDestino) {
    //             return res.status(400).json({ error: "Já existe uma promoção ativa com a mesma aplicação de destino nesta Empresa." });
    //         }

    //         const idsResumo = promocoesAtivas.map(p => p.IDRESUMOPROMOCAOMARKETING).filter(Boolean);
    //         if (idsResumo.length > 0) {
    //             const detalhesUrl = `${url}/api/detalhe-promocao-ativa.xsjs?idResumoPromocao=${idsResumo.join(',')}`;
    //             const responseDetalhes = await axios.get(detalhesUrl);
    //             const detalhes = responseDetalhes.data?.detalhePromo || [];

    //             if (Array.isArray(promocao.IDPRODUTODESTINO)) {
    //                 const existeProduto = detalhes.some(produto =>
    //                     promocao.IDPRODUTODESTINO.includes(produto.IDPRODUTO)
    //                 );
    //                 if (existeProduto) {
    //                     return res.status(400).json({ error: "Um dos produtos destino já está vinculado a uma promoção ativa." });
    //                 }
    //             }
    //         }

    //         if (promocao.TPAPARTIRDE == 0 || promocao.TPAPARTIRDE == 3) {
    //             if (JSON.stringify(promocao.IDPRODUTOORIGEM) !== JSON.stringify(promocao.IDPRODUTODESTINO)) {
    //                 return res.status(400).json({ error: "Para Mecânica por pares ou menos na primeira, os produtos de origem e destino devem ser iguais." });
    //             }
    //         }
    //         if (promocao.TPAPARTIRDE == 4) {
            
    //             if (
    //                 !Array.isArray(promocao.IDPRODUTOORIGEM) || 
    //                 !Array.isArray(promocao.IDPRODUTODESTINO) ||
    //                 promocao.IDPRODUTOORIGEM.length !== 1 ||
    //                 promocao.IDPRODUTODESTINO.length !== 1 ||
    //                 promocao.IDPRODUTOORIGEM[0] !== promocao.IDPRODUTODESTINO[0]
    //             ) {
    //                 return res.status(400).json({ error: "Para Mecânica em um produto, apenas um produto pode ser enviado tanto na origem quanto no destino, e eles devem ser iguais." });
    //             }
    //         }

        
    //         const response = await axios.post(`${url}/api/promocao-ativa.xsjs`, dados);

    //         return res.status(200).json({
    //             message: "Promoção(s) criada(s) com sucesso",
    //             data: response.data
    //         });
    //     } catch (error) {
    //         console.error("Unable to connect to the database:", error);
    //         return res.status(500).json({ error: "Erro ao criar promoção." });
    //     }
    // }

}

export default new PromocaoControllers();
