import axios from "axios";
import { dataFormatada } from "../../utils/dataFormatada.js";
import { getDetalheOrdemTransferencia } from "../repositories/detalheOrdemTransferencia.js";
import { createStatusDivergencia, getStatusDivergencia, updateStatusDivergencia } from "../repositories/statusDivergencia.js";
import { OTClient } from '../client/index.js';
import { OTService } from '../service/index.js';
import criarOTSchema from '../schema/shemaCriarOT.js';
import criarOTSchemaDeposito from '../schema/shemaCriarOTDeposito.js';
import shemaCancelarOTDeposito from "../schema/shemaCancelarOTDeposito.js";
import schemaFinalizarOTDeposito from "../schema/schemaFinalizarOTDeposito.js";
//let url = `http://164.152.245.77:8000/quality/concentrador_homologacao`;
const url = 'http://164.152.245.77:8000/quality/concentrador_node';
//const url = process.env.API_URL;
const otClient = new OTClient(url);
const otService = new OTService(otClient);

class ConferenciaCegaControllers {

        async getListaImpressaoEtiquetaOTDeposito(req, res,) {
            let { idResumoOT, stAtivo, pageSize, page } = req.query;
            
            idResumoOT = idResumoOT ? idResumoOT : '';
            stAtivo = stAtivo ? stAtivo : '';
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';
            try {
                const response = await axios.get(`${url}/api/conferencia-cega/resumo-ordem-transferencia.xsjs?id=${idResumoOT}&stAtivo=${stAtivo}&pageSize=${pageSize}&page=${page}`)
              
                return res.json(response.data); 
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error; 
            }
        }

    async getListaOrdemTransferenciaConferenciaCega(req, res,) {
        let { idResumoOT, idTipoFiltro, idEmpresaOrigem, idEmpresaDestino, dataPesquisaInicio, dataPesquisaFim } = req.query;

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
        let { idResumoOT, idTipoFiltro, page, pageSize } = req.query;

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
        let { idResumoOT, page, pageSize } = req.query;

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
            const response = await updateStatusDivergencia(dados);
            return res.json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: error.message });
        }
    }
    async postStatusDivergencia(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];
            const response = await createStatusDivergencia(dados);
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

    async putResumoOrdemTransferencia(req, res) {
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

            return res.status(200).json({ message: 'Ordem de transferência atualizada com sucesso!' });
        } catch (error) {
            console.log('Erro ao atualizar ordem de transferência:', error);
            throw error;
        }
    }

    async putResumoOrdemTransferencia(req, res) {

        try {
            const { error, value } = atualizarOTSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                return res.status(400).json({
                    message: 'Dados inválidos',
                    errors: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message
                    }))
                });
            }

            if (!value.IDRESUMOOT) {
                return res.status(400).json({ message: 'IDRESUMOOT é obrigatório.' });
            }


            const response = await otService.updateOT(
                value.IDRESUMOOT,
                value.IDEMPRESAORIGEM,
                value.IDEMPRESADESTINO,
                value.DATAEXPEDICAO,
                value.IDOPERADOREXPEDICAO,
                value.NUTOTALITENS,
                value.QTDTOTALITENS,
                value.QTDTOTALITENSRECEPCIONADO,
                value.QTDTOTALITENSDIVERGENCIA,
                value.NUTOTALVOLUMES,
                value.TPVOLUME,
                value.VRTOTALCUSTO,
                value.VRTOTALVENDA,
                value.DTRECEPCAO,
                value.IDOPERADORRECEPTOR,
                value.DSOBSERVACAO,
                value.IDUSRCANCELAMENTO,
                value.DTULTALTERACAO,
                value.IDSTDIVERGENCIA,
                value.OBSDIVERGENCIA,
                value.STEMISSAONFE,
                value.NUMERONFE,
                value.STENTRADAINVENTARIO,
                value.QTDCONFERENCIA,
                value.dadosdetalheot,
                value.IDRESUMOOT,
                value.IDSTATUSOT,
                value.IDUSRAJUSTE,
                value.DTAJUSTE,
                value.QTDTOTALITENSAJUSTE,
                value.CONFEREITENS,
                value.IDROTINA,
                value.DATAENTREGA

            );

            if (!value.IDEMPRESADESTINO) {
                return res.status(400).json({ message: 'IDEMPRESADESTINO é obrigatório.' });
            }

            if (!value.IDEMPRESAORIGEM) {
                return res.status(400).json({ message: 'IDEMPRESAORIGEM é obrigatório.' });
            }

            return res.status(200).json(response);
        } catch (error) {
            console.log('Erro ao atualizar ordem de transferência:', error);
            return res.status(500).json({ message: 'Erro ao atualizar ordem de transferência.' });

        }
    }

    async postResumoOrdemTransferencia(req, res) {

        try {
            const { error, value } = criarOTSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                return res.status(400).json({
                    message: 'Dados inválidos',
                    errors: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message
                    }))
                });
            }

            const response = await otService.createOT(
                value.IDRESUMOOT,
                value.IDEMPRESAORIGEM,
                value.IDEMPRESADESTINO,
                value.DATAEXPEDICAO,
                value.IDOPERADOREXPEDICAO,
                value.NUTOTALITENS,
                value.QTDTOTALITENS,
                value.QTDTOTALITENSRECEPCIONADO,
                value.QTDTOTALITENSDIVERGENCIA,
                value.NUTOTALVOLUMES,
                value.TPVOLUME,
                value.VRTOTALCUSTO,
                value.VRTOTALVENDA,
                value.DTRECEPCAO,
                value.IDOPERADORRECEPTOR,
                value.DSOBSERVACAO,
                value.IDUSRCANCELAMENTO,
                value.DTULTALTERACAO,
                value.IDSTDIVERGENCIA,
                value.OBSDIVERGENCIA,
                value.STEMISSAONFE,
                value.NUMERONFE,
                value.STENTRADAINVENTARIO,
                value.QTDCONFERENCIA,
                value.dadosdetalheot,
                value.IDRESUMOOT,
                value.IDSTATUSOT,
                value.IDUSRAJUSTE,
                value.DTAJUSTE,
                value.QTDTOTALITENSAJUSTE,
                value.CONFEREITENS,
                value.IDROTINA,
                value.DATAENTREGA

            );

            if (!value.IDEMPRESADESTINO) {
                return res.status(400).json({ message: 'IDEMPRESADESTINO é obrigatório.' });
            }

            if (!value.IDEMPRESAORIGEM) {
                return res.status(400).json({ message: 'IDEMPRESAORIGEM é obrigatório.' });
            }

            return res.status(200).json(response);
        } catch (error) {
            console.log('Erro ao atualizar ordem de transferência:', error);
            return res.status(500).json({ message: 'Erro ao atualizar ordem de transferência.' });

        }
    }



    async postResumoOrdemTransferenciaDepositos(req, res) {

        try {
            const { error, value } = criarOTSchemaDeposito.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                return res.status(400).json({
                    message: 'Dados inválidos',
                    errors: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message
                    }))
                });
            }


            const response = await otService.criarOTDeposito(

                value.IDRESUMOOT,
                value.IDEMPRESAORIGEM,
                value.IDEMPRESADESTINO,
                value.IDOPERADOREXPEDICAO,
                value.NUTOTALITENS,
                value.QTDTOTALITENS,
                value.QTDTOTALITENSRECEPCIONADO,
                value.QTDTOTALITENSDIVERGENCIA,
                value.NUTOTALVOLUMES,
                value.TPVOLUME,
                value.VRTOTALCUSTO,
                value.VRTOTALVENDA,
                value.DTRECEPCAO,
                value.IDOPERADORRECEPTOR,
                value.DSOBSERVACAO,
                value.IDUSRCANCELAMENTO,
                value.IDSTDIVERGENCIA,
                value.OBSDIVERGENCIA,
                value.STEMISSAONFE,
                value.NUMERONFE,
                value.STENTRADAINVENTARIO,
                value.QTDCONFERENCIA,
                value.IDSTATUSOT,
                value.IDUSRAJUSTE,
                value.DTAJUSTE,
                value.QTDTOTALITENSAJUSTE,
                value.dadosdetalheot

            );

            if (!value.IDEMPRESADESTINO) {
                return res.status(400).json({ message: 'IDEMPRESADESTINO é obrigatório.' });
            }

            if (!value.IDEMPRESAORIGEM) {
                return res.status(400).json({ message: 'IDEMPRESAORIGEM é obrigatório.' });
            }

            return res.status(200).json(response);
        } catch (error) {
            console.log('Erro ao atualizar ordem de transferência:', error);
            return res.status(500).json({ message: 'Erro ao atualizar ordem de transferência.', error });

        }
    }

    async putCancelarOTDeposito(req, res) {

        try {
            const { error, value } = shemaCancelarOTDeposito.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                return res.status(400).json({
                    message: 'Dados inválidos',
                    errors: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message
                    }))
                });
            }


            const response = await otService.cancelOTDeposito(

                value.IDSTATUSOT,
                value.IDRESUMOOT,
                value.IDUSRCANCELAMENTO,
            );

            return res.status(200).json(response);
        } catch (error) {
            console.log('Erro ao atualizar ordem de transferência:', error);
            return res.status(500).json({ message: 'Erro ao atualizar ordem de transferência.', error });

        }
    }

    async putFinalizarOTDeposito(req, res) {

        try {
            const { error, value } = schemaFinalizarOTDeposito.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                return res.status(400).json({
                    message: 'Dados inválidos',
                    errors: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message
                    }))
                });
            }


            const response = await otService.finishOTDeposito(

                value.IDSTATUSOT,
                value.NUTOTALVOLUMES,
                value.TPVOLUME,
                value.IDRESUMOOT,
                value.IDEMPRESAORIGEM,
                value.NOTAFISCAL
            );

            return res.status(200).json(response);
        } catch (error) {
            console.log('Erro ao atualizar ordem de transferência:', error);
            return res.status(500).json({ message: 'Erro ao atualizar ordem de transferência.', error });

        }
    }

}



export default new ConferenciaCegaControllers();

