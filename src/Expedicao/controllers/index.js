import axios from "axios";
import { dataFormatada } from "../../utils/dataFormatada.js";
import 'dotenv/config';
import { OTClient } from "../OT/Client/index.js";
import { OTService } from "../OT/Services/index.js";
// const url = process.env.API_URL;
const url = 'http://164.152.245.77:8000/quality/concentrador_homologacao';
const otClient = new OTClient(url);
const otService = new OTService(otClient);

class ExpedicaoControllers {

    async getListaProdutosExpedicao(req, res,) {
        let {idEmpresa, codBarras, dsProduto, idProduto, page, pageSize, } = req.query;

        idEmpresa = idEmpresa ? idEmpresa : '';
        codBarras = codBarras ? codBarras : '';
        dsProduto = dsProduto ? dsProduto : '';
        idProduto = idProduto ? idProduto : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {
            const apiUrl = `${url}/api/expedicao/produto.xsjs?idEmpresa=${idEmpresa}&id=${idProduto}&descProduto=${dsProduto}&page=${page}&pageSize=${pageSize}`
            const response = await axios.get(apiUrl)
            
            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; 
        }
        
    }

    async getListaOrdemTransferencia(req, res,) {
        let {idEmpresaDestino, idEmpresaOrigem, idTipoFiltro, dataPesquisaInicio, dataPesquisaFim,  pageSize, page} = req.query;
       
        idEmpresaDestino = Number(idEmpresaDestino) ? Number(idEmpresaDestino) : Number(idEmpresaDestino);
        idEmpresaOrigem = Number(idEmpresaOrigem) ? Number(idEmpresaOrigem) : Number(idEmpresaOrigem);
        idTipoFiltro = Number(idTipoFiltro) ? Number(idTipoFiltro) : Number(idTipoFiltro)
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';    
        pageSize = pageSize ? pageSize : '';
        page = page ? page : '';

        try {
           
            const apiUrl = `${url}/api/expedicao/resumo-ordem-transferencia.xsjs?idtipofiltro=${Number(idTipoFiltro)}&idEmpresaOrigem=${Number(idEmpresaOrigem)}&idEmpresaDestino=${Number(idEmpresaDestino)}&datapesqinicio=${dataPesquisaInicio}&datapesqfim=${dataPesquisaFim}`
            const response = await axios.get(apiUrl)
           

            return res.json(response.data); 
        } catch (error) {
            console.error("Erro no ExpedicaoControllers getListaOrdemTransferencia:", error);
            return res.status(500).json({ error: 'Erro ao buscar lista de ordens de transferência.' });
       
        }
        
    }

    async getListaOrdemTransferenciaExpedicao(req, res,) {
        let {idEmpresaLogin, idLojaDestino, dataPesquisaInicio, dataPesquisaFim} = req.query;
       
        idEmpresaLogin = idEmpresaLogin ? idEmpresaLogin : ''; 
        idLojaDestino = idLojaDestino ? idLojaDestino : '';
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';    

        try {
            

            const response = await axios.get(`${url}/api/expedicao/resumo-ordem-transferencia.xsjs?idtipofiltro=1&idEmpresaOrigem=${idEmpresaLogin}&idEmpresaDestino=${idLojaDestino}&datapesqinicio=${dataPesquisaInicio}&datapesqfim=${dataPesquisaFim}`)

            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; 
        }
        
    }

    async getListaDetalheOT(req, res,) {
        let {idResumoOT, idTipoFiltro, pageSize, page} = req.query;
       
        idResumoOT = idResumoOT ? idResumoOT : ''; 
        idTipoFiltro = idTipoFiltro ? idTipoFiltro : '';
        pageSize = pageSize ? pageSize : '';
        page = page ? page : '';
        try {
            // ajaxGet('api/expedicao/detalhe-ordem-transferencia.xsjs?page=' + numPage + '&id=' + id + '&idtipofiltro=' + 1)
            const response = await axios.get(`${url}/api/expedicao/detalhe-ordem-transferencia.xsjs?id=${idResumoOT}`)
     
            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; 
        }
    }
    
    async getListaOT(req, res,) {
        let {idEmpresaLogin, idLojaDestino, dataPesquisaInicio, dataPesquisaFim} = req.query;
       
        idEmpresaLogin = idEmpresaLogin ? idEmpresaLogin : ''; 
        idLojaDestino = idLojaDestino ? idLojaDestino : '';
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';    

        dataPesquisaInicio = dataFormatada(dataPesquisaInicio)
        dataPesquisaFim = dataFormatada(dataPesquisaFim)

        try {

            const apiUrl = `${url}/api/expedicao/resumo-ordem-transferencia.xsjs?idtipofiltro=2&idEmpresaOrigem=${idEmpresaLogin}&idEmpresaDestino=${idLojaDestino}&datapesqinicio=${dataPesquisaInicio}&datapesqfim=${dataPesquisaFim}`
            const response = await axios.get(apiUrl)

            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; 
        }
    }
    async getListaSD(req, res,) {
        let {} = req.query;
       
        try {
            const response = await axios.get(`${url}/api/expedicao/status-divergencia.xsjs?page=1`)

            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; 
        }
    }
   
    async getListaFaturasOT(req, res,) {
        let {idLojaDestino, idLojaOrigem, dataPesquisaInicio, dataPesquisaFim, dataInicioFatura, dataFimFatura, idStatusOt } = req.query;
       
        idLojaDestino = idLojaDestino ? idLojaDestino : '';
        idLojaOrigem = idLojaOrigem ? idLojaOrigem : '';
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
        dataInicioFatura = dataInicioFatura ? dataInicioFatura : '';
        dataFimFatura = dataFimFatura ? dataFimFatura : '';
        idStatusOt = idStatusOt ? idStatusOt : '';
        try {
            const response = await axios.get(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/expedicao/resumo-ordem-transferencia.xsjs?page=1&idtipofiltro=1&idEmpresaOrigem=${idLojaOrigem}&idEmpresaDestino=${idLojaDestino}&datapesqinicio=${dataPesquisaInicio}&datapesqfim=${dataPesquisaFim}&idstatusot=${idStatusOt}&dtinifat=${dataInicioFatura}&dtfimfat=${dataFimFatura}`)
           
            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; 
        }
    }
    async getListaOTDepLoja(req, res,) {
        let {idEmpresaDestino, idEmpresaOrigem, idTipoFiltro, dataPesquisaInicio, dataPesquisaFim, idRotina, pageSize, page } = req.query;
       
        idEmpresaDestino = idEmpresaDestino ? idEmpresaDestino : '';
        idEmpresaOrigem = idEmpresaOrigem ? idEmpresaOrigem : '';
        idTipoFiltro = idTipoFiltro ? idTipoFiltro : '';
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
        // dataInicioEntrega = dataInicioEntrega ? dataInicioEntrega : '';
        // dataFimEntrega = dataFimEntrega ? dataFimEntrega : '';
        idRotina = idRotina ? idRotina : '';
        pageSize = pageSize ? pageSize : '';
        page = page ? page : '';
        try {
            const response = await axios.get(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/expedicao/resumo-ordem-transferencia.xsjs?page=1&idtipofiltro=2&idEmpresaOrigem=${idEmpresaOrigem}&idEmpresaDestino=${idEmpresaDestino}&datapesqinicio=${dataPesquisaInicio}&datapesqfim=${dataPesquisaFim}&idrotina=${idRotina}&dtinient=${dataPesquisaInicio}&dtfiment=${dataPesquisaFim}`)
            
            
            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; 
        }
    }

    async getListaStatusOT(req, res,) {
        let {} = req.query;
       
        try {
            const response = await axios.get(`${url}/api/expedicao/status-ordem-transferencia.xsjs`)

            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; 
        }
    }

    async getListaRotinaMovimentacao(req, res,) {
        let { idRotina, page, pageSize } = req.query;
        
        idRotina = idRotina ? idRotina : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {
            const response = await axios.get(`${url}/api/expedicao/rotina-movimentacao.xsjs`)
         
            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; 
        }
    }
    async getListaImpressaoEtiquetaOT(req, res,) {
        let { idResumoOT, stAtivo, pageSize, page } = req.query;
        
        idResumoOT = idResumoOT ? idResumoOT : '';
        stAtivo = stAtivo ? stAtivo : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {
            const response = await axios.get(`${url}/api/expedicao/impressao-etiqueta-ot.xsjs?id=${idResumoOT}&stAtivo=${stAtivo}&pageSize=${pageSize}&page=${page}`)
          
            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; 
        }
    }
    async getListaNFESaidaTransferencia(req, res,) {
        let { idSapOrigem, page, pageSize } = req.query;
        
        idSapOrigem = idSapOrigem ? idSapOrigem : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {
            const response = await axios.get(`${url}/api/service-layer/notas-transferencia/consulta-nfe-saida-tranferencia.xsjs?id=${idSapOrigem}&pageSize=${pageSize}&page=${page}`)
            
            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; 
        }
    }


    // UPDATE
    async updateOrdemTransferencia(req, res) {
        let {
            IDPRODUTO,
            QTDEXPEDICAO,
            QTDRECEPCAO,
            QTDDIFERENCA,
            QTDAJUSTE,
            VLRUNITVENDA,
            VLRUNITCUSTO,
            STFALTA,
            STSOBRA,
            IDSTATUSOT,
            IDRESUMOOT
        } = req.body;

        if(isNaN(QTDAJUSTE)) {
            QTDAJUSTE = 0;
        }

        if(QTDAJUSTE < 0) {
            STSOBRA = "True"
        }
        
        if(QTDAJUSTE > 0) {
            STFALTA = "True"
        }

        try {
            const response = await axios.put(`${url}/api/expedicao/resumo-ordem-transferencia.xsjs`, {
                IDPRODUTO,
                QTDEXPEDICAO,
                QTDRECEPCAO,
                QTDDIFERENCA,
                QTDAJUSTE,
                VLRUNITVENDA,
                VLRUNITCUSTO,
                STFALTA,
                STSOBRA,
                IDSTATUSOT,
                IDRESUMOOT
            })

            return res.status(200).json({message: 'Ordem de transferência atualizada com sucesso!'});
        } catch(error) {
            console.log('Erro ao atualizar ordem de transferência:', error);
            throw error;
        }
    }

    async updateAlterarSD(req, res,) {
        let {
            IDSTATUSDIVERGENCIA,
            DESCRICAODIVERGENCIA,
            STATIVO
        } = req.body;
       
        try {
            const response = await axios.put(`${url}/api/expedicao/status-divergencia.xsjs`, {
                IDSTATUSDIVERGENCIA,
                DESCRICAODIVERGENCIA,
                STATIVO,
            })

            return res.status(200).json({message: 'Atualizado com sucesso'}); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; 
        }
    }

    async storeInserirSD(req, res,) {
        let {
            DESCRICAODIVERGENCIA,
            IDUSRCRIACAO,
            STATIVO
        } = req.body;
       
        try {
            const response = await axios.post(`${url}/api/expedicao/status-divergencia.xsjs`, {
                DESCRICAODIVERGENCIA,
                IDUSRCRIACAO,
                STATIVO
            })

            return res.status(200).json({message: 'Cadastrado com sucesso'}); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; 
        }
    }

    async putResumoOrdemTransferencia(req, res) {
        let {
            IDEMPRESAORIGEM,
            IDEMPRESADESTINO,
            DATAEXPEDICAO,
            IDOPERADOREXPEDICAO,
            NUTOTALITENS,
            QTDTOTALITENS,
            QTDTOTALITENSRECEPCIONADO,
            QTDTOTALITENSDIVERGENCIA,
            NUTOTALVOLUMES,
            TPVOLUME,
            VRTOTALCUSTO,
            VRTOTALVENDA,
            DTRECEPCAO,
            IDOPERADORRECEPTOR,
            DSOBSERVACAO,
            IDUSRCANCELAMENTO,
            DTULTALTERACAO,
            IDSTDIVERGENCIA,
            OBSDIVERGENCIA,
            STEMISSAONFE,
            NUMERONFE,
            STENTRADAINVENTARIO,
            QTDCONFERENCIA,
            dadosdetalheot,
            IDRESUMOOT,
            IDSTATUSOT,
            IDUSRAJUSTE,
            DTAJUSTE,
            QTDTOTALITENSAJUSTE,
            CONFEREITENS,
            IDROTINA,
            DATAENTREGA
        } = req.body;

        if(!IDRESUMOOT) {
            return res.status(400).json({message: 'IDRESUMOOT é obrigatório.'});
        }



        try {
            const response = await axios.put(`${url}/api/expedicao/resumo-ordem-transferencia.xsjs`, {
                IDEMPRESAORIGEM,
                IDEMPRESADESTINO,
                DATAEXPEDICAO,
                IDOPERADOREXPEDICAO,
                NUTOTALITENS,
                QTDTOTALITENS,
                QTDTOTALITENSRECEPCIONADO,
                QTDTOTALITENSDIVERGENCIA,
                NUTOTALVOLUMES,
                TPVOLUME,
                VRTOTALCUSTO,
                VRTOTALVENDA,
                DTRECEPCAO,
                IDOPERADORRECEPTOR,
                DSOBSERVACAO,
                IDUSRCANCELAMENTO,
                DTULTALTERACAO,
                IDSTDIVERGENCIA,
                OBSDIVERGENCIA,
                STEMISSAONFE,
                NUMERONFE,
                STENTRADAINVENTARIO,
                QTDCONFERENCIA,
                dadosdetalheot,
                IDRESUMOOT,
                IDSTATUSOT,
                IDUSRAJUSTE,
                DTAJUSTE,
                QTDTOTALITENSAJUSTE,
                CONFEREITENS,
                IDROTINA,
                DATAENTREGA
            })

            return res.status(200).json({message: 'Ordem de transferência atualizada com sucesso!'});
        } catch(error) {
            console.log('Erro ao atualizar ordem de transferência:', error);
            return res.status(500).json({message: 'Erro ao atualizar ordem de transferência.'});
            
        }
    }

    async postResumoOrdemTransferencia(req, res) {
        let {
            IDEMPRESAORIGEM,
            IDEMPRESADESTINO,
            DATAEXPEDICAO,
            IDOPERADOREXPEDICAO,
            NUTOTALITENS,
            QTDTOTALITENS,
            QTDTOTALITENSRECEPCIONADO,
            QTDTOTALITENSDIVERGENCIA,
            NUTOTALVOLUMES,
            TPVOLUME,
            VRTOTALCUSTO,
            VRTOTALVENDA,
            DTRECEPCAO,
            IDOPERADORRECEPTOR,
            DSOBSERVACAO,
            IDUSRCANCELAMENTO,
            DTULTALTERACAO,
            IDSTDIVERGENCIA,
            OBSDIVERGENCIA,
            STEMISSAONFE,
            NUMERONFE,
            STENTRADAINVENTARIO,
            QTDCONFERENCIA,
            dadosdetalheot,
            IDRESUMOOT,
            IDSTATUSOT,
            IDUSRAJUSTE,
            DTAJUSTE,
            QTDTOTALITENSAJUSTE,
            CONFEREITENS,
            IDROTINA,
            DATAENTREGA,
            
        } = req.body;
        
        // if(!IDRESUMOOT) {
        //     return res.status(400).json({message: 'IDRESUMOOT é obrigatório.'});
        // }


        if(!IDEMPRESADESTINO) {
            return res.status(400).json({message: 'IDEMPRESADESTINO é obrigatório.'});
        }

        if(!IDEMPRESAORIGEM) {
            return res.status(400).json({message: 'IDEMPRESAORIGEM é obrigatório.'});
        }

        try {
            const response = await axios.post(`${url}/api/expedicao/resumo-ordem-transferencia.xsjs`, {
                IDEMPRESAORIGEM,
                IDEMPRESADESTINO,
                DATAEXPEDICAO,
                IDOPERADOREXPEDICAO,
                NUTOTALITENS,
                QTDTOTALITENS,
                QTDTOTALITENSRECEPCIONADO,
                QTDTOTALITENSDIVERGENCIA,
                NUTOTALVOLUMES,
                TPVOLUME,
                VRTOTALCUSTO,
                VRTOTALVENDA,
                DTRECEPCAO,
                IDOPERADORRECEPTOR,
                DSOBSERVACAO,
                IDUSRCANCELAMENTO,
                DTULTALTERACAO,
                IDSTDIVERGENCIA,
                OBSDIVERGENCIA,
                STEMISSAONFE,
                NUMERONFE,
                STENTRADAINVENTARIO,
                QTDCONFERENCIA,
                dadosdetalheot,
                IDRESUMOOT,
                IDSTATUSOT,
                IDUSRAJUSTE,
                DTAJUSTE,
                QTDTOTALITENSAJUSTE,
                CONFEREITENS,
                IDROTINA,
                DATAENTREGA
            })

            return res.status(200).json({message: 'Ordem de transferência atualizada com sucesso!'});
        } catch(error) {
            console.log('Erro ao atualizar ordem de transferência:', error);
            return res.status(500).json({message: 'Erro ao atualizar ordem de transferência.'});
            
        }
    }
}

export default new ExpedicaoControllers();