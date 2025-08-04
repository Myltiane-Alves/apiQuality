import axios from "axios";
import { dataFormatada } from "../../utils/dataFormatada.js";
import { createDepositoLoja, updateDepositoLoja } from "../repositories/depositoLoja.js";
import { getDepositosEmpresa } from "../repositories/empresa.js";
import 'dotenv/config';
const url = process.env.API_URL;

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
    // async getListaDepositosLojaEmpresa(req,res) {
    //     let {idEmpresa, dataPesquisaInicio, dataPesquisaFim,  pageSize, page   } = req.query;
    //         idEmpresa = idEmpresa ? idEmpresa : '';
    //         dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
    //         dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
    //     try {
    //         const response = await getDepositosEmpresa(idEmpresa, dataPesquisaInicio, dataPesquisaFim,  pageSize, page)
    //         return res.json(response); 
    //     } catch(error) {
    //         console.error("Unable to connect to the database:", error);
    //             throw error;
    //     }
    // }

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
            const depositos = Array.isArray(req.body) ? req.body : [req.body]; 
            const response = await  updateDepositoLoja(depositos);
            return res.json(response);
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
            const response = await axios.post(`${url}/api/deposito-loja/atualizacao-status-conferido.xsjs`, {
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
            const response = await axios.post(`${url}/api/deposito-loja/atualizacao-status.xsjs`, {
                IDDEPOSITOLOJA,
                STCANCELADO
            });

            return res.status(201).json(response.data);
        } catch (error) {
            console.error("Erro no servidor:", error);
            return res.status(500).json({ error: error.message });
        }
       
    }

    async cadastroDepositoLoja(req, res) {
        
        try {
            let {
                 DTDEPOSITO,
                DTMOVIMENTOCAIXA,
                IDEMPRESA,
                IDUSR,
                IDCONTABANCO,
                VRDEPOSITO,
                DSHISTORIO,
                NUDOCDEPOSITO,
                DSPATHDOCDEPOSITO,
                STATIVO,
                STCANCELADO,
                IDUSRCACELAMENTO,
                DSMOTIVOCANCELAMENTO,
            } = req.body;
            if(!IDEMPRESA) {
                return res.status(400).json({ error: "IDEMPRESA is required." });
            }

            if(!IDUSR) {
                return res.status(400).json({ error: "IDUSUARIO is required." });
            }
            if(!IDCONTABANCO) {
                return res.status(400).json({ error: "IDCONTABANCO is required." });
            }

            if(!DTDEPOSITO) {
                return res.status(400).json({ error: "DTDEPOSITO is required." });
            }

            if(!DTMOVIMENTOCAIXA) {
                return res.status(400).json({ error: "DTMOVIMENTOCAIXA is required." });
            }
            if(!DSHISTORIO) {
                return res.status(400).json({ error: "DSHISTORIO is required." });
            }
            if(!NUDOCDEPOSITO) {
                return res.status(400).json({ error: "NUDOCDEPOSITO is required." });
            }
            if(!VRDEPOSITO) {
                return res.status(400).json({ error: "VRDEPOSITO is required." });
            }

            if(STATIVO === undefined) {
                return res.status(400).json({ error: "STATIVO is required." }); 
            }
            if(STCANCELADO === undefined) {
                return res.status(400).json({ error: "STCANCELADO is required." }); 
            }
            

            const response = await axios.post(`${url}/api/deposito-loja/todos.xsjs`, {
                DTDEPOSITO,
                DTMOVIMENTOCAIXA,
                IDEMPRESA,
                IDUSR,
                IDCONTABANCO,
                VRDEPOSITO,
                DSHISTORIO,
                NUDOCDEPOSITO,
                DSPATHDOCDEPOSITO,
                STATIVO,
                STCANCELADO,
                IDUSRCACELAMENTO,
                DSMOTIVOCANCELAMENTO,
            });
            return res.status(201).json(response.data);
        } catch (error) {
            console.error("Error creating deposit:", error.message);
            return res.status(error.response?.status || 500).json({ error: error.message });
        }
    }
 
}

export default new DepositosLojaControllers();