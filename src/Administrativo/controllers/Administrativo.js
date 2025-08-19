import axios from "axios";
import { dataFormatada } from "../../utils/dataFormatada.js";
import { getDetalheVendas } from "../Vendas/repositories/detalheVenda.js";
import { getDetalheVoucherDados } from "../Vouchers/repositories/detalheVoucherDados.js";
import 'dotenv/config';
const url = process.env.API_URL;

class AdministrativoControllers {

    async getListaExtratoDaLojaDia(req, res) {
        let { idEmpresa, pageNumber, datapesq } = req.query;

        if (!isNaN(idEmpresa)) {
            idEmpresa = Number(idEmpresa);
            const pageSize = 100;
            const offset = (pageNumber - 1) * pageSize;
            datapesq = dataFormatada(datapesq)
            // ajaxGet('api/dashboard/extrato-loja-periodo.xsjs?pageSize=500&page=1&idEmpresa=' + idemp + '&dataPesquisaInicio=' + datapesq + '&dataPesquisaFim=' + datapesq)
            try {
                const apiUrl = `${url}/api/dashboard/extrato-loja-periodo.xsjs?pageSize=${pageSize}&idEmpresa=${idEmpresa}&dataPesquisaInicio=${datapesq}&dataPesquisaFim=${datapesq}`
                const response = await axios.get(apiUrl)
            
                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    }

    async getListaQuebraCaixaResumoADM(req, res) {
        let { idEmpresa, pageNumber, dataPesquisa } = req.query;

        if (!isNaN(idEmpresa)) {
            idEmpresa = Number(idEmpresa);
            const pageSize = 100;
            const offset = (pageNumber - 1) * pageSize;
            dataPesquisa = dataFormatada(dataPesquisa)
            
            try {
                const apiUrl = `${url}/api/administrativo/quebra-caixa-loja.xsjs?idEmpresa=${idEmpresa}&dataPesquisa=${dataPesquisa}`
                const response = await axios.get(apiUrl)
            
                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    }

    async retornoListaCaixasMovimento(req, res) {
        let { idEmpresa, dataFechamento } = req.query;
      
        idEmpresa = Number(idEmpresa) ? Number(idEmpresa) : '';
        dataFechamento = dataFormatada(dataFechamento) ? dataFechamento : '';
        // ajaxGet('api/administrativo/lista-caixas-movimento.xsjs?idEmpresa=' + idemp + '&dataFechamento=' + datapesq)
        try {
            const apiUrl = `${url}/api/administrativo/lista-caixas-movimento.xsjs?idEmpresa=${idEmpresa}&dataFechamento=${dataFechamento}`
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async retornoListaCaixasFechados(req, res) {

        let { idEmpresa, pageSize, dataFechamento } = req.query;
        if (!isNaN(idEmpresa)) {
            idEmpresa = Number(idEmpresa) ? Number(idEmpresa) : '';
            pageSize = pageSize ? pageSize : '';
            dataFechamento = dataFormatada(dataFechamento)
            // ajaxGet('api/administrativo/lista-caixas-fechados.xsjs?idEmpresa=' + idemp + '&dataFechamento=' + dataFechamento)
            try {
                const apiUrl = `${url}/api/administrativo/lista-caixas-fechados.xsjs?pagesize=${pageSize}&idEmpresa=${idEmpresa}&dataFechamento=${dataFechamento}`
                const response = await axios.get(apiUrl)

                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
                
            }
        }
    }
  
    async getVendaConvenio(req, res) {
        let { idEmpresa, idGrupo, pageNumber, dataPesquisaInicio, dataPesquisaFim, descontoFuncionario } = req.query;
      

        idEmpresa = idEmpresa ? Number(idEmpresa) : '';
        idGrupo = idGrupo ? Number(idGrupo) : '';
        const numPage = 100;

        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataPesquisaFim : '';
        descontoFuncionario = descontoFuncionario ? descontoFuncionario : '';

        try {
            const apiUrl = `${url}/api/administrativo/desconto-motivo-vendas.xsjs?idMarca=${idGrupo}&idEmpresa=${idEmpresa}&dataInicial=${dataPesquisaInicio}&dataFinal=${dataPesquisaFim}&dsmotdesc=${descontoFuncionario}`
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getVendaVendedor(req, res) {
        let { idEmpresa, dataPesquisaInicio, dataPesquisaFim } = req.query;
        if (!isNaN(idEmpresa)) {

            idEmpresa = Number(idEmpresa);
            dataPesquisaInicio = dataFormatada(dataPesquisaInicio)
            dataPesquisaFim = dataFormatada(dataPesquisaFim)

            try {
                const apiUrl = `${url}/api/administrativo/venda-vendedor.xsjs?idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
                const response = await axios.get(apiUrl)

                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    }
    async getVendaVendedorAction(req, res) {
        let { idEmpresa, idGrupo, pageNumber, dataPesquisaInicio, dataPesquisaFim } = req.query;


        idEmpresa = idEmpresa ? Number(idEmpresa) : '';
        idGrupo = idGrupo ? Number(idGrupo) : '';
        const pageSize = 100;
        const offset = (pageNumber - 1) * pageSize;
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataPesquisaFim : '';
        


        // console.log(ajaxGet('api/administrativo/venda-vendedor.xsjs?idEmpresa=' + idemp + '&dataPesquisaInicio=' + datapesq + '&dataPesquisaFim=' + datapesq));
        try {
            const apiUrl = `${url}/api/administrativo/venda-vendedor.xsjs?idGrupo=${idGrupo}&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getVendaAtiva(req, res) {

        let { idEmpresa, idGrupo,  dataPesquisaInicio, dataPesquisaFim } = req.query;
        idEmpresa = Number(idEmpresa) ? Number(idEmpresa) : '';
        idGrupo = Number(idGrupo) ? Number(idGrupo) : '';
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataPesquisaFim : '';
                
        try {
            const apiUrl = `${url}/api/administrativo/venda-ativa.xsjs?idMarca=${idGrupo}&idEmpresa=${idEmpresa}&dataFechamento=${dataPesquisaInicio}&dataFechamentoFim=${dataPesquisaFim}&status=True`
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }
    async getListaVendasContigenciaPorEmpresa(req, res) {

        let { idEmpresa, idGrupo,  dataPesquisaInicio, dataPesquisaFim } = req.query;
        idEmpresa = Number(idEmpresa) ? Number(idEmpresa) : '';
        idGrupo = Number(idGrupo) ? Number(idGrupo) : '';
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataPesquisaFim : '';
                
        try {
            const apiUrl = `${url}/api/administrativo/venda-ativa.xsjs?idMarca=${idGrupo}&idEmpresa=${idEmpresa}&dataFechamento=${dataPesquisaInicio}&dataFechamentoFim=${dataPesquisaFim}&statusContingencia=True&status=False`
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async getVendaCancelada30Minutos(req, res) {

        let { idMarca, idEmpresa, dataPesquisaInicio, dataPesquisaFim, stCancelado, stCanceladoWeb,stCanceladoPDVEmitida,stCanceladoApos30Min, stCanceladoPDVEmTela,  } = req.query;
      
        idMarca = Number(idMarca) ? Number(idMarca) : '';
        idEmpresa = Number(idEmpresa) ? Number(idEmpresa) : '';
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataPesquisaFim : '';
        stCancelado = stCancelado ? stCancelado : '';
        stCanceladoWeb = stCanceladoWeb ? stCanceladoWeb : '';
        stCanceladoPDVEmitida = stCanceladoPDVEmitida ? stCanceladoPDVEmitida : '';
        stCanceladoApos30Min = stCanceladoApos30Min ? stCanceladoApos30Min : '';
        stCanceladoPDVEmTela = stCanceladoPDVEmTela ? stCanceladoPDVEmTela : '';
                
        try {
            const apiUrl = `${url}/api/administrativo/venda-ativa.xsjs?idMarca=${idMarca}&idEmpresa=${idEmpresa}&dataFechamento=${dataPesquisaInicio}&dataFechamentoFim=${dataPesquisaFim}&status=${stCancelado}&stCanceladoWeb=${stCanceladoWeb}&stCanceladoPDVEmitida=${stCanceladoPDVEmitida}&stCanceladoApos30Min=${stCanceladoApos30Min}&stCanceladoPDVEmTela=${stCanceladoPDVEmTela}`
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getVendaCanceladaWeb(req, res) {

        let { idMarca, idEmpresa, dataPesquisaInicio, dataPesquisaFim, stCancelado, stCanceladoWeb,stCanceladoPDVEmitida,stCanceladoApos30Min, stCanceladoPDVEmTela,  } = req.query;
      
        idMarca = Number(idMarca) ? Number(idMarca) : '';
        idEmpresa = Number(idEmpresa) ? Number(idEmpresa) : '';
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataPesquisaFim : '';
        stCancelado = stCancelado ? stCancelado : '';
        stCanceladoWeb = stCanceladoWeb ? stCanceladoWeb : '';
        stCanceladoPDVEmitida = stCanceladoPDVEmitida ? stCanceladoPDVEmitida : '';
        stCanceladoApos30Min = stCanceladoApos30Min ? stCanceladoApos30Min : '';
        stCanceladoPDVEmTela = stCanceladoPDVEmTela ? stCanceladoPDVEmTela : '';
                
        try {
            const apiUrl = `${url}/api/administrativo/venda-ativa.xsjs?idMarca=${idMarca}&idEmpresa=${idEmpresa}&dataFechamento=${dataPesquisaInicio}&dataFechamentoFim=${dataPesquisaFim}&status=${stCancelado}&stCanceladoWeb=${stCanceladoWeb}&stCanceladoPDVEmitida=${stCanceladoPDVEmitida}&stCanceladoApos30Min=${stCanceladoApos30Min}&stCanceladoPDVEmTela=${stCanceladoPDVEmTela}`
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getVendaCanceladaEmitidaPDV(req, res) {

        let { idMarca, idEmpresa, dataPesquisaInicio, dataPesquisaFim, stCancelado, stCanceladoWeb,stCanceladoPDVEmitida,stCanceladoApos30Min, stCanceladoPDVEmTela,  } = req.query;
      
        idMarca = Number(idMarca) ? Number(idMarca) : '';
        idEmpresa = Number(idEmpresa) ? Number(idEmpresa) : '';
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataPesquisaFim : '';
        stCancelado = stCancelado ? stCancelado : '';
        stCanceladoWeb = stCanceladoWeb ? stCanceladoWeb : '';
        stCanceladoPDVEmitida = stCanceladoPDVEmitida ? stCanceladoPDVEmitida : '';
        stCanceladoApos30Min = stCanceladoApos30Min ? stCanceladoApos30Min : '';
        stCanceladoPDVEmTela = stCanceladoPDVEmTela ? stCanceladoPDVEmTela : '';
                
        try {
            const apiUrl = `${url}/api/administrativo/venda-ativa.xsjs?idMarca=${idMarca}&idEmpresa=${idEmpresa}&dataFechamento=${dataPesquisaInicio}&dataFechamentoFim=${dataPesquisaFim}&status=${stCancelado}&stCanceladoWeb=${stCanceladoWeb}&stCanceladoPDVEmitida=${stCanceladoPDVEmitida}&stCanceladoApos30Min=${stCanceladoApos30Min}&stCanceladoPDVEmTela=${stCanceladoPDVEmTela}`
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaClientesVendas(req, res) {

        let { cpfCliente,  dataPesquisaInicio, dataPesquisaFim } = req.query;
 
        cpfCliente = cpfCliente ? cpfCliente : '';
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio: '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataPesquisaFim : '';
        
        // ajaxGet('api/administrativo/venda-ativa.xsjs?pagesize=1000&cpfCliente=' + clienteCPF + '&dataFechamento=' + datapesqinicio + '&dataFechamentoFim=' + datapesqfim)            
        try {
            const apiUrl = `${url}/api/administrativo/venda-ativa.xsjs?pageSize=1000&cpfCliente=${cpfCliente}&dataFechamento=${dataPesquisaInicio}&dataFechamentoFim=${dataPesquisaFim}`
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        

    }

    async getVendaAtivaResumo(req, res) {

        let { idEmpresa, pageNumber, dataPesquisaInicio, dataPesquisaFim } = req.query;
        if (!isNaN(idEmpresa)) {
            idEmpresa = Number(idEmpresa);
            const pageSize = 100;
            const offset = (pageNumber - 1) * pageSize;
            dataPesquisaInicio = dataFormatada(dataPesquisaInicio)
            dataPesquisaFim = dataFormatada(dataPesquisaFim)
         
            // ajaxGet('api/administrativo/venda-ativa.xsjs?pagesize=1000&status=False&idEmpresa=' + idemp + '&dataFechamento=' + datapesq + '&dataFechamentoFim=' + datapesq)
            try {
                const apiUrl = `${url}/api/administrativo/venda-ativa.xsjs?pagesize=${pageSize}&status=False&idEmpresa=${idEmpresa}&dataFechamento=${dataPesquisaInicio}&dataFechamentoFim=${dataPesquisaFim}`
                const response = await axios.get(apiUrl)

                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }

    }

    async getVendaAtivaAction(req, res) {

        let { idEmpresa, pageNumber, dataFechamento, dataFechamentoFim } = req.query;
        
        idEmpresa = Number(idEmpresa) ? Number(idEmpresa) : '';
        const pageSize = 1000;
        const offset = (pageNumber - 1) * pageSize;
        dataFechamento = dataFormatada(dataFechamento) ? dataFechamento : '';
        dataFechamentoFim = dataFormatada(dataFechamentoFim) ? dataFechamentoFim : '';
        
        // ajaxGet('api/administrativo/venda-ativa.xsjs?pagesize=1000&status=False&idEmpresa=' + idemp + '&dataFechamento=' + datapesq + '&dataFechamentoFim=' + datapesq)
        try {
            const apiUrl = `${url}/api/administrativo/venda-ativa.xsjs?page=1&pagesize=${pageSize}&status=False&idEmpresa=${idEmpresa}&dataFechamento=${dataFechamento}&dataFechamentoFim=${dataFechamentoFim}`
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        

    }

    async getVendaCancelada(req, res) {
        let { idEmpresa,idGrupo, pageNumber, datapesq } = req.query;
        if (!isNaN(idEmpresa) && !isNaN(idGrupo)) {
            idEmpresa = Number(idEmpresa);
            idGrupo = Number(idGrupo);
            const pageSize = 100;
            const offset = (pageNumber - 1) * pageSize;
            datapesq = dataFormatada(datapesq)
          

            // ajaxGet('api/administrativo/venda-ativa.xsjs?page=' + numPage + '&idMarca=' + idgrupo + '&idEmpresa=' + idempresa + '&dataFechamento=' + datapesqinicio + '&dataFechamentoFim=' + datapesqfim + '&status=True')
            try {
                const apiUrl = `${url}/api/administrativo/venda-ativa.xsjs?pagesize=${pageSize}&idMarca=${idGrupo}&idEmpresa=${idEmpresa}&dataFechamento=${datapesq}&dataFechamentoFim=${datapesq}&status=True`
                const response = await axios.get(apiUrl)

              
                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    }
    
    async getVendaCanceladaResumo(req, res) {
        let { idEmpresa, pageNumber, dataPesquisaInicio, dataPesquisaFim } = req.query;
        if (!isNaN(idEmpresa)) {
            idEmpresa = Number(idEmpresa);
           
            const pageSize = 100;
            const offset = (pageNumber - 1) * pageSize;
            dataPesquisaInicio = dataFormatada(dataPesquisaInicio)
            dataPesquisaFim = dataFormatada(dataPesquisaFim)
          
            try {
                const apiUrl = `${url}/api/administrativo/venda-ativa.xsjs?pagesize=${pageSize}&idEmpresa=${idEmpresa}&dataFechamento=${dataPesquisaInicio}&dataFechamentoFim=${dataPesquisaFim}&status=True`
                const response = await axios.get(apiUrl)

                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    }

    async getListaVendasDetalheAlterar(req, res) {
        let { idVenda, idEmpresa, page, pageSize } = req.query;
 
            
          
            try {
                idVenda = idVenda ? idVenda : '';
                idEmpresa = idEmpresa ? idEmpresa : '';
                page = page ? page : '';
                pageSize = pageSize ? pageSize : '';
                const apiUrl = `${url}/api/administrativo/detalhe-venda.xsjs?idEmpresa=${idEmpresa}&idVenda=${idVenda}`
                
                const response = await axios.get(apiUrl)
                // const response = await getDetalheVendas(idVenda, idEmpresa, page, pageSize)

                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Erro no AdministrativoControllers.getListaVendasDetalheAlterar:", error);
                return res.status(500).json({ error: "Erro ao conectar ao servidor" });
            }
        
    }

    async pesquisaMovimentoDeCaixa(req, res) {

        let { idEmpresa, pageNumber } = req.query;
        if (!isNaN(idEmpresa)) {
            idEmpresa = Number(idEmpresa);
            const pageSize = 100;
            const offset = (pageNumber - 1) * pageSize;
            datapesq = dataFormatada(datapesq)

            try {
                const apiUrl = `${url}/api/administrativo/resumo-venda.xsjs?pagesize=${pageSize}&idEmpresa=${idEmpresa}&offset=${offset}`
                const response = await axios.get(apiUrl)
               
                return res.json(response.data);
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    }

    async listaCaixasMovimento(req, res) {

        let { idEmpresa, pageNumber, dataPesq } = req.query;
        if (!isNaN(idEmpresa)) {
            idEmpresa = Number(idEmpresa);
            const pageSize = 100;
            const offset = (pageNumber - 1) * pageSize;
            dataPesq = dataFormatada(dataPesq)
            try {
                const apiUrl = `${url}/api/movimento-caixa/ajuste-fisicodinheiro.xsjs?pagesize=${pageSize}&idEmpresa=${idEmpresa}&offset=${offset}`
                const response = await axios.get(apiUrl)

                return res.json(response.data);
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    }

    async getDetalheFatura(req, res) {

        let { idEmpresa, pageSize, dataPesquisaInicio, dataPesquisaFim } = req.query;
        if (!isNaN(idEmpresa)) {
            idEmpresa = Number(idEmpresa) ? Number(idEmpresa) : '';
            pageSize = pageSize ? pageSize : '';
            dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio : '';
            dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataPesquisaFim : '';
      
            // ajaxGet('api/administrativo/detalhe-fatura.xsjs?idEmpresa=' + idemp + '&dataPesquisaInic=' + datapesq + '&dataPesquisaFim=' + datapesq)
            try {
                const apiUrl = `${url}/api/administrativo/detalhe-fatura.xsjs?pagesize=${pageSize}&idEmpresa=${idEmpresa}&dataPesquisaInic=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
                const response = await axios.get(apiUrl)

                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    }

    async getDetalheDespesas(req, res) {

        let { idEmpresa, pageNumber, datapesq } = req.query;
        if (!isNaN(idEmpresa)) {
            idEmpresa = Number(idEmpresa);
            const pageSize = 100;
            const offset = (pageNumber - 1) * pageSize;
            datapesq = dataFormatada(datapesq)
            
            try {
                const apiUrl = `${url}/api/administrativo/detalhe-despesa.xsjs?pagesize=${pageSize}&idEmpresa=${idEmpresa}&dataPesquisa=${datapesq}`
                const response = await axios.get(apiUrl)
                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    }

    async getDetalheVoucher(req, res) {

        let { idEmpresa, page, pageSize, datapesq } = req.query;
        if (!isNaN(idEmpresa)) {
            idEmpresa = Number(idEmpresa) ? Number(idEmpresa) : '';
           
            datapesq = dataFormatada(datapesq) ? datapesq : '';
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';
            // ajaxGet('api/administrativo/detalhe-voucher.xsjs?idEmpresa=' + idemp + '&dataPesquisa=' + datapesq)
            try {
                const apiUrl = `${url}/api/administrativo/detalhe-voucher.xsjs?pagesize=${pageSize}&idEmpresa=${idEmpresa}&dataPesquisa=${datapesq}`
                const response = await axios.get(apiUrl)
                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }

        }
    }
    async getDetalheProdutoVoucher(req, res) {

        let { idVoucher } = req.query;
        if (!isNaN(idVoucher)) {
            idVoucher = Number(idVoucher);
         
            try {
                const apiUrl = `${url}/api/administrativo/detalhe-prod-voucher.xsjs?idvoucher=${idVoucher}`
                const response = await axios.get(apiUrl)
                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }

        }
    }

    async getResumoVendaConvenio(req, res) {

        let { idEmpresa, pageNumber } = req.query;
        if (!isNaN(idEmpresa)) {

            idEmpresa = Number(idEmpresa);
            const pageSize = 100;
            const offset = (pageNumber - 1) * pageSize;
            datapesq = dataFormatada(datapesq)
            try {
                const apiUrl = `${url}/api/dashboard/venda/resumo-venda-convenio.xsjs?pagesize=${pageSize}&idEmpresa=${idEmpresa}&offset=${offset}`
                const response = await axios.get(apiUrl)

             
                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    }

    async getResumoVendaConvenioDesconto(req, res) {

        let { idEmpresa, pageNumber } = req.query;
        if (!isNaN(idEmpresa)) {
            idEmpresa = Number(idEmpresa);
            const pageSize = 100;
            const offset = (pageNumber - 1) * pageSize;
            datapesq = dataFormatada(datapesq)
            try {
                const apiUrl = `${url}/api/dashboard/venda/resumo-venda-convenio-desconto.xsjs?pagesize=${pageSize}&idEmpresa=${idEmpresa}&offset=${offset}`
                const response = await axios.get(apiUrl)

                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }

        }
    }
    
    async getResumoVenda(req, res) {
        let { idEmpresa, pageSize, dataPesquisa } = req.query;
  
        if (!isNaN(idEmpresa)) {
            idEmpresa = Number(idEmpresa) ? Number(idEmpresa) : '';
            pageSize = pageSize ? pageSize : '';
            dataPesquisa = dataFormatada(dataPesquisa) ? dataPesquisa : '';

            try {
                const apiUrl = `${url}/api/administrativo/resumo-venda.xsjs?idEmpresa=${idEmpresa}&dataPesquisa=${dataPesquisa}`;
                const response = await axios.get(apiUrl);     
                return res.json(response.data);
            } catch (error) {
                console.error("Erro ao conectar ao servidor:", error);

                throw error;
            }
        }
    }
    async getListaDespesasLojaADM(req, res) {
        let { idEmpresa, pageSize, dataPesquisa } = req.query;
  
        if (!isNaN(idEmpresa)) {
            idEmpresa = Number(idEmpresa) ? Number(idEmpresa) : '';
            pageSize = pageSize ? pageSize : '';
            dataPesquisa = dataFormatada(dataPesquisa) ? dataPesquisa : '';

            try {
                const apiUrl = `${url}/api/administrativo/despesa-loja.xsjs?idEmpresa=${idEmpresa}&dataPesquisa=${dataPesquisa}`;
                const response = await axios.get(apiUrl);     
                return res.json(response.data);
            } catch (error) {
                console.error("Erro ao conectar ao servidor:", error);

                throw error;
            }
        }
    }

    async getPesqBalanco(req, res) {
        let { idEmpresa, descricao, dataPesqInicio, dataPesqFim } = req.query;

        idEmpresa = idEmpresa ? idEmpresa : '';
        const numPage = 100;
        dataPesqInicio = dataFormatada(dataPesqInicio) ? dataPesqInicio : '';
        dataPesqFim = dataFormatada(dataPesqFim) ? dataPesqFim : '';
        descricao = descricao ? descricao : '';

        try {
            const apiUrl = `${url}/api/administrativo/balanco-loja.xsjs?idEmpresa=${idEmpresa}&dataInicial=${dataPesqInicio}&dataFinal=${dataPesqFim}&DSdesc=${descricao}`
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }
    async getListaPrestacaoDeContas(req, res) {
        let { idResumo } = req.query;
        idResumo = idResumo ? idResumo : '';
        try {
            // ajaxGet('api/administrativo/prestacao-contas-balanco.xsjs?page=' + numPage + '&id=' + idresumo)
            const apiUrl = `${url}/api/administrativo/prestacao-contas-balanco.xsjs?id=${idResumo}`
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    // async getListaColetorBalanco(req, res) {
    //     let { idEmpresa, idResumo, descProduto, dataPesqInicio, dataPesqFim } = req.query;
        
    //     idEmpresa = idEmpresa ? idEmpresa : '';
    //     idResumo = idResumo ? idResumo : '';
    //     const numPage = 100;
        
    //     try {
    //         const apiUrl = `${url}/api/administrativo/coletor-balanco.xsjs?idresumo=${idResumo}&idempresa=${idEmpresa}`
    //         const response = await axios.get(apiUrl)

    //         return res.json(response.data); // Retorna
    //     } catch (error) {
    //         console.error("Unable to connect to the database:", error);
    //         throw error;
    //     }
        
    // }

    async getListaPreviaBalanco(req, res) {
        let { idEmpresa, idResumo, processa, diferenca } = req.query;
        
        idEmpresa = idEmpresa ? idEmpresa : '';
        idResumo = idResumo ? idResumo : '';
        processa = processa ? processa : '';
        diferenca = diferenca ? diferenca : '';
        const numPage = 100;
        
        try {
            // ajaxGet('api/administrativo/novo-previa-balanco.xsjs?page=' + numPage + '&id=' + idresumoPreviaBalanco + '&idempresa=' + idempresaPreviaBalanco + '&processa=' + processaPreviaBalanco + '&diferenca=' + diferencaPreviaBalanco)

            const apiUrl = `${url}/api/administrativo/novo-previa-balanco.xsjs?id=${idResumo}&idempresa=${idEmpresa}&processa=&${processa}&diferenca=${diferenca}`
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Erro no AdministrativoController getListaPreviaBalanco:", error);
            throw error;
        }
        
    }

    async getDetalheBalancoAvulso(req, res) {
        let { idFilial, coletor, descProduto, } = req.query;
            
            idFilial = idFilial ? idFilial : '';
            coletor = coletor ? coletor : '';
            
        try {
            const apiUrl = `http://164.152.245.77:8000/quality/concentrador_homologacao/api/administrativo/detalhe-balanco-avulso.xsjs?page=1&idfilial=${idFilial}&coletor=${coletor}`
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getEstoqueAtual(req, res) {
        let { idEmpresa, idGrupo, idSubGrupo, idMarca, idFornecedor, descProduto, pageNumber, dataInicial, dataFinal, } = req.query;

   
            idEmpresa = idEmpresa ? Number(idEmpresa) : '';
            idGrupo = idGrupo ? idGrupo : '';
            idSubGrupo = idSubGrupo ? idSubGrupo : '';
            idMarca = idMarca ? idMarca : '';
            idFornecedor = idFornecedor ? idFornecedor : '';
            descProduto = descProduto ? descProduto : '';
            dataInicial = dataFormatada(dataInicial) ? dataFormatada(dataInicial) : ''
            dataFinal = dataFormatada(dataFinal) ? dataFormatada(dataFinal) : ''
            
           
            const pageSize = 100;
            const offset = (pageNumber - 1) * pageSize;
            try {
                // ajaxGet('api/administrativo/inventariomovimento.xsjs?page=' + numPage + '&idEmpresa=' + idempresa + '&idgrupo=' + idgrupo + '&idsubgrupo=' + idsubgrupo + '&idmarca=' + idmarca + '&idfornecedor=' + idfornecedor + '&descproduto=' + descproduto + '&dtinicial=' + dtinicial + '&dtfinal=' + dtfinal + '&stativo=' + stativo)

                const apiUrl = `${url}/api/administrativo/inventariomovimento.xsjs?idEmpresa=${idEmpresa}&idgrupo=${idGrupo}&idsubgrupo=${idSubGrupo}&idmarca=${idMarca}&idfornecedor=${idFornecedor}&descproduto=${descProduto}&dtinicial=${dataInicial}&dtfinal=${dataFinal}&stativo=True`;
                const response = await axios.get(apiUrl)
         
                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        
    }

    async getRetornoListaPagamentoVenda(req, res) {
        let { idVenda,  } = req.query;

        try {
            const apiUrl = `${url}/api/administrativo/recebimento.xsjs?id=${idVenda}`;
            const response = await axios.get(apiUrl)
        
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }  
    }

    async getRetornoListaPagamentoTEFSelect(req, res) {
        try {
            const apiUrl = `${url}/api/administrativo/pagamento-tef.xsjs`;
            const response = await axios.get(apiUrl)
        
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }  
    }

    async getRetornoListaPagamentoPOSSelect(req, res) {
        try {
            const apiUrl = `${url}/api/administrativo/pagamento-pos.xsjs`;
            const response = await axios.get(apiUrl)
        
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }  
    }

    async getRetornoListaRecebimentosFormaPagamento(req, res) {
        let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, idFuncionario, formaPagamento, parcela, idMarca, numPage } = req.query; 
        idEmpresa = idEmpresa ? idEmpresa : '';
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataPesquisaFim : '';
        idFuncionario = idFuncionario ? idFuncionario : '';
        formaPagamento = formaPagamento ? formaPagamento : '';
        parcela = parcela ? parcela : '';
        idMarca = idMarca ? idMarca : '';

        try {
            const apiUrl = `${url}/api/administrativo/venda-total-forma-pag.xsjs?pageSize=500&page=&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idFunc=${idFuncionario}&dSFormaPag=${formaPagamento}&dSParc=${parcela}&idEmpGrupo=${idMarca}`;
            const response = await axios.get(apiUrl)
        
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }  
    }

    async getListaAlteracaoPreco(req, res) {
        let { idEmpresa, dataPesquisa, idSubGrupo, descricaoProduto, idGrupo } = req.query; 
        idEmpresa = idEmpresa ? idEmpresa : '';
        dataPesquisa = dataFormatada(dataPesquisa) ? dataPesquisa : '';
        idSubGrupo = idSubGrupo ? idSubGrupo : '';
        descricaoProduto = descricaoProduto ? descricaoProduto : '';
        idGrupo = idGrupo ? idGrupo : '';
        try {
            // ajaxGet('api/administrativo/lista-alteraco-preco.xsjs?page=' + numPage + '&idEmpresa=' + idempresa + '&idgrupo=' + idgrupo + '&idsubgrupo=' + idsubgrupo + '&descproduto=' + descproduto + '&dtinicial=' + dtinicial)
            const apiUrl = `${url}/api/administrativo/lista-alteraco-preco.xsjs?page=&idEmpresa=${idEmpresa}&idgrupo=${idGrupo}&idsubgrupo=${idSubGrupo}&descproduto${descricaoProduto}&dtinicial=${dataPesquisa}`;
            const response = await axios.get(apiUrl)
        
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }  
    }

    async getListaFormaPagamento(req, res) {
        let { idEmpresa} = req.query; 
        try {

            const apiUrl = `${url}/api/administrativo/formapagamento.xsjs`;
            const response = await axios.get(apiUrl)
        
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }  
    }
    

    async getListaFuncionarioRecebimento(req, res) {
        let { idEmpresa} = req.query; 
        try {

            const apiUrl = `${url}/api/administrativo/funcionarioreceb.xsjs?idEmpresa=${idEmpresa}`;
            const response = await axios.get(apiUrl)
        
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }  
    }

    async getListaDetalheVoucherDados(req, res) {
        let { idSubGrupoEmpresa, idEmpresa, idVoucher, dataPesquisaInicio, dataPesquisaFim, dadosVoucher, stStatus, stTipoTroca, page, pageSize} = req.query;
        
        idSubGrupoEmpresa = idSubGrupoEmpresa ? idSubGrupoEmpresa : ''
        idEmpresa = idEmpresa ? idEmpresa : ''
        idVoucher = idVoucher ? idVoucher : ''
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : ''
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : ''
        dadosVoucher = dadosVoucher ? dadosVoucher : ''
        stStatus = stStatus ? stStatus : ''
        stTipoTroca = stTipoTroca ? stTipoTroca : ''
        page = page ? page : ''
        pageSize = pageSize ? pageSize : ''
        try {
            // ${url}/api/resumo-voucher/detalhe-voucher-dados.xsjs?page=1&dataPesquisaInicio=2024-01-03&dataPesquisaFim=2024-01-03&subgrupoEmpresa=1&idEmpresa=1
            const apiUrl = `${url}/api/administrativo/detalhe-voucher-dados.xsjs?dadosVoucher=${dadosVoucher}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&page=${page}&pageSize=${pageSize}`
            const response = await axios.get(apiUrl)
            // const response = await getDetalheVoucherDados(idSubGrupoEmpresa, idEmpresa, idVoucher, dataPesquisaInicio, dataPesquisaFim, dadosVoucher, stStatus, stTipoTroca, page, pageSize)
    
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    // async getListaVendaTotalRecebido(req, res) {
    //     let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, idFuncionario, formaPagamento, parcela, idMarca,} = req.query; 
    //     idEmpresa = idEmpresa ? idEmpresa : '';
    //     dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio : '';
    //     dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataPesquisaFim : '';
    //     idFuncionario = idFuncionario ? idFuncionario : '';
    //     formaPagamento = formaPagamento ? formaPagamento : '';
    //     parcela = parcela ? parcela : '';
    //     idMarca = idMarca ? idMarca : '';

    //     try {

    //         const apiUrl = `${url}/api/administrativo/venda-total-recebido-periodo.xsjs?pageSize=500&page=4&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idFunc=${idFuncionario}&dSFormaPag=${formaPagamento}&dSParc=${parcela}&idEmpGrupo=${idMarca}`;
    //         const response = await axios.get(apiUrl)
        
    //         return res.json(response.data); // Retorna
    //     } catch (error) {
    //         console.error("Unable to connect to the database:", error);
    //         throw error;
    //     }  
    // }

    async getListaEstoqueUltimaPosicao(req, res) {
        let { idEmpresa, idGrupo, idSubGrupo, idMarca, idFornecedor, descProduto, dataPesquisaInicio} = req.query; 
            idEmpresa = idEmpresa ? idEmpresa : '';
            idGrupo = idGrupo ? idGrupo : '';
            idSubGrupo = idSubGrupo ? idSubGrupo : '';
            idMarca = idMarca ? idMarca : '';
            idFornecedor = idFornecedor ? idFornecedor : '';
            descProduto = descProduto ? descProduto : '';
            dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio : '';
        
        try {

            const apiUrl = `${url}/api/administrativo/ultima-posicao-estoque.xsjs?&idEmpresa=${idEmpresa}&idgrupo=${idGrupo}&idsubgrupo${idSubGrupo}&idmarca=${idMarca}&idfornecedor=${idFornecedor}&descproduto=${descProduto}&dtinicial=${dataPesquisaInicio}&stativo=True`;
            const response = await axios.get(apiUrl)
        
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }  
    }

    // PUT 
    async updateAlterarVendaVendedor(req, res) {
        
        try {
            let {IDVENDADETALHE,IDVENDEDOR } = req.body;         
            
            let dataIdVendaDetalhe = [1];
            if (isNaN(IDVENDADETALHE > 0 )) {

                const apiUrl = `${url}/api/administrativo/venda-vendedor.xsjs`
             
                const response = await axios.put(apiUrl,  {
                    IDVENDADETALHE: dataIdVendaDetalhe,
                    IDVENDEDOR: IDVENDEDOR,
    
                })

         
                return res.json(response.data); // Retorna
            }
          

        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: "Erro ao conectar ao servidor" });
        }
        
    }
    
    async deleteAdministrativo(req, res) {

    }


}

export default new AdministrativoControllers();