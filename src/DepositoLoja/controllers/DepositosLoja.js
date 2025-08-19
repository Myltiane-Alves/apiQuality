import axios from "axios";
import { dataFormatada } from "../../utils/dataFormatada.js";
import { createDepositoLoja, updateDepositoLoja } from "../repositories/depositoLoja.js";
import { getDepositosEmpresa } from "../repositories/empresa.js";
import 'dotenv/config';
const url = process.env.API_URL;
import createDepositoSchema from '../schema/createDeposito.js';
import updateDepositoSchema from '../schema/updateDeposito.js';

import { DepositoClient } from "../client/index.js";
import { DepositoService } from "../services/index.js";
const depositoClient = new DepositoClient(process.env.API_URL);
const depositoService = new DepositoService(depositoClient);


class DepositosLojaControllers  {

    async getListaDepositosLojaEmpresa(req,res) {
        let {idEmpresa, dataPesquisaInicio, dataPesquisaFim    } = req.query;
        idEmpresa = idEmpresa ? idEmpresa : '';
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
        try {
            // ajaxGet('api/compras/lista_pedidos.xsjs?pageSize=1000&page=' + numPage + '&dataPesquisaInicio=' + dataPesqInic + '&dataPesquisaFim=' + dataPesqFim + '&idFornPesquisa=' + idFornPesq + '&idMarcaPesquisa=' + idMarcaPesq + '&idpedido=' + NuPedidoPesq + '&idFabPesquisa=' + idFabPesq + '&idCompradorPesquisa=' + idCompradorPesq + '&stSituacaoSAP=' + STSituacoPedidoPesq)
            const apiUrl = `${url}/api/deposito-loja/empresa.xsjs?idEmpresa=${idEmpresa}&dataPesquisaInic=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;
            const response = await axios.get(apiUrl)
            return res.json(response.data); // Retorna
        } catch(error) {
            console.error("Unable to connect to the database:", error);
                throw error;
        }
    }
    
    async getListaProdutosLojaSap(req, res) {
        let { descricaoProduto, idEmpresa, idListaEmpresa, pageNumber } = req.query;
    
    
        descricaoProduto = descricaoProduto ? descricaoProduto : ''; 
        idEmpresa = idEmpresa ? idEmpresa : ''; 
        idListaEmpresa = idListaEmpresa ? idListaEmpresa : '';         
        pageNumber = pageNumber ? pageNumber : 1; 

    
        const pageSize = 100;
        const offset = (pageNumber - 1) * pageSize;
    
        try {   
            // api/produto-sap/produto-sap.xsjs?page=' + numPage + '&codeBarsOuNome=' + DSdesc + '&IdEmpresaLoja=' + IDEmpresaLogin + '&IdListaLoja=' + IDListaEmp
            const apiUrl = `${url}/api/produto-sap/produto-sap.xsjs?codeBarsOuNome=${descricaoProduto}&IdEmpresaLoja=${idEmpresa}&IDEmpresaLogin=${idEmpresa}&IdListaLoja=${idListaEmpresa}`;
            const response = await axios.get(apiUrl)
            return res.json(response.data); // Retorna
        } catch(error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        } 
    }
    
    async putListaDepositosLoja(req, res) {
        try {
             let {error, value} = updateDepositoSchema.validate(req.body, {
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

            const response = await depositoService.updateDeposito(
                value.IDDEPOSITOLOJA,
                value.IDEMPRESA,
                value.IDUSR,
                value.IDCONTABANCO,
                value.DTDEPOSITO,
                value.DTMOVIMENTOCAIXA,
                value.DSHISTORIO,
                value.NUDOCDEPOSITO,
                value.VRDEPOSITO,
                value.STATIVO,
                value.STCANCELADO,
            )
            return res.status(201).json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: error.message });
        }
       
    }
    
    async putAtualizarStatusConferido(req, res) {
        try {
            let {IDDEPOSITOLOJA, STCONFERIDO, DTCOMPENSACAO } = req.body;

            if(!IDDEPOSITOLOJA) {
                return res.status(400).json({ error: "IDDEPOSITOLOJA is required." });
            }
            const response = await axios.put(`${url}/api/deposito-loja/atualizacao-status-conferido.xsjs`, {
                IDDEPOSITOLOJA,
                STCONFERIDO,
                DTCOMPENSACAO
            });

            return res.status(201).json(response.data);
        } catch (error) {
            console.error("Erro no servidor:", error);
            return res.status(500).json({ error: error.message });
        }
       
    }
    async putAtualizarStatusDepositoLoja(req, res) {
        try {
            let {IDDEPOSITOLOJA, STCANCELADO } = req.body;

            if(!IDDEPOSITOLOJA) {
                return res.status(400).json({ error: "IDDEPOSITOLOJA is required." });
            }
            const response = await axios.put(`${url}/api/deposito-loja/atualizacao-status.xsjs`, {
                IDDEPOSITOLOJA,
                STCANCELADO
            });
            return res.status(201).json(response.data);
        } catch (error) {
            console.error("Erro no servidor:", error);
            return res.status(500).json({ error: error.message });
        }
       
    }

    async postDepositoLoja(req, res) {
        
        try {
            let {error, value} = createDepositoSchema.validate(req.body, {
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

            if(!value.IDEMPRESA) {
                return res.status(400).json({ error: "IDEMPRESA is required." });
            }

            if(!value.IDUSR) {
                return res.status(400).json({ error: "IDUSUARIO is required." });
            }
            if(!value.IDCONTABANCO) {
                return res.status(400).json({ error: "IDCONTABANCO is required." });
            }

            const response = await depositoService.createDeposito(
                value.DTDEPOSITO,
                value.DTMOVIMENTOCAIXA,
                value.IDEMPRESA,
                value.IDUSR,
                value.IDCONTABANCO,
                value.VRDEPOSITO,
                value.DSHISTORIO,
                value.NUDOCDEPOSITO,
                value.DSPATHDOCDEPOSITO,
                value.STATIVO,
                value.STCANCELADO,
                value.IDUSRCACELAMENTO,
                value.DSMOTIVOCANCELAMENTO,
            );

            return res.status(201).json(response);
        } catch (error) {
            console.error("Error creating deposit:", error.message);
            return res.status(error.response?.status || 500).json({ error: error.message });
        }
    }
 
}

export default new DepositosLojaControllers();