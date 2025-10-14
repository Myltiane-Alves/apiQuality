import axios from "axios";
import { dataFormatada } from "../../utils/dataFormatada.js";
import { getMarcas } from "../Marcas/marca.js";
import { getGrupoEmpresa } from "../Marcas/grupoEmpresa.js";
import { updateFuncionarioLoja } from "../Funcionarios/repositories/funcionario.js";
import { createFuncionario, getFuncionariosLoja, updateFuncionario } from "../../Funcionarios/repositories/funcionarioLoja.js";
import { updateInativarFuncionario } from "../../Funcionarios/repositories/funcionarioInativa.js";
import { getAtualizaEmpresaDiario, updateAtualizaEmpresaDiario } from "../Empresas/autualizaEmpresDiario.js";
import { updateAtualizarTodosCaixa } from "../caixas/atualizarTodosCaixas.js";
import { getVendasLoja } from "../vendas/repositories/vendasLoja.js";
import { getPagamentoTEF } from "../pagamento/pagamentoTef.js";
import { getPagamentoPOS } from "../pagamento/pagamentoPos.js";
import { getVendasAlloc } from "../vendas/repositories/vendasAlloc.js";
import { getVendasContigencia } from "../vendas/repositories/vendasContigencia.js";
import { getCliente } from "../cliente/repositories/cliente.js";
import { createRelatarioBI, getRelatorioBI, updateRelatarioBI } from "../relatorio/ralatoriaBI/relatorioBI.js";
import { createLinkRelatarioBI, getLinkRelatorioBI, updateLinkRelatarioBI } from "../relatorio/linkRelatorioBI/linkRelatorioBI.js";
import { getCadastroClienteCredSystem } from "../credSystem/cadastroCliente.js";
import { getMeioPagamentoCredSystem } from "../credSystem/meioPagamento.js";
import { getParceriaCredSystem } from "../credSystem/parceria.js";
import { createCaixa, getCaixa, updateCaixa } from "../caixas/caixa.js";
import { createConfiguracao, getConfiguracoes, updateConfiguracao } from "../configuracao/repositories/configuracao.js";
import { updateFuncionarioDesconto } from "../Funcionarios/repositories/funcionarioDesconto.js";
import 'dotenv/config';
const url = process.env.API_URL

class InformaticaControllers {

    async getListaEmpresas(req, res) {
        let {  } = req.query;

        try {
            const apiUrl = `${url}/api/informatica/empresa.xsjs`
            const response = await axios.get(apiUrl)
        
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
     
    }

    async getListaEmpresasInformatica(req, res) {
        let { 
            idEmpresa 

         } = req.query;
            idEmpresa = idEmpresa ? idEmpresa : '';
        try {

            const apiUrl = `http://164.152.245.77:8000/quality/concentrador/api/informatica/empresa.xsjs?id=${idEmpresa}`
       
            const response = await axios.get(apiUrl)
        
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
     
    }

    async getListaMarcas(req, res) {
         let {  } = req.query;
        try {
            const apiUrl = `${url}/api/grupo-empresarial.xsjs`
            const response = await axios.get(apiUrl)
            // const response = await getGrupoEmpresa()
            
            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async getListaGrupoEmpresas(req, res) {
        let {  } = req.query;

        try {
            const apiUrl = `${url}/api/informatica/grupoempresas.xsjs`
            const response = await axios.get(apiUrl)
        
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
     
    }

    async getListaProdutoPreco(req, res) {
        let { idEmpresa, dsProduto, pageNumber } = req.query;
        if (!isNaN(idEmpresa)) {

            idEmpresa = Number(idEmpresa);
            const numPage = 100;            
            const offset = (pageNumber - 1) * numPage;
         
            try {
                const apiUrl = `${url}/api/informatica/produto-preco.xsjs?page=10&idEmpresa=${idEmpresa}&dsProduto=${dsProduto}`
                const response = await axios.get(apiUrl)
                if(response.status === 200){
                    return res.json(response.data); 
                } else {
                    return res.status(500).json({ message: "Erro ao buscar produtos." });
                }
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    }
    async getListaProdutoPrecoInformatica(req, res) {
        let { idEmpresa, descricaoProduto, pageNumber } = req.query;

        idEmpresa = idEmpresa ? idEmpresa : '';
        descricaoProduto = descricaoProduto ? descricaoProduto : '';
       
        try {
            const apiUrl = `${url}/api/informatica/produto-preco.xsjs?idEmpresa=${idEmpresa}&dsProduto=${descricaoProduto}`
            const response = await axios.get(apiUrl)
            if(response.status === 200){
                return res.json(response.data); 
            } else {
                return res.status(500).json({ message: "Erro ao buscar produtos." });
            }
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaCaixas(req, res) {
        let { idEmpresa, idCaixaWeb, dataUltimaAtualizacao,   page, pageSize } = req.query;
       
            try {
                idEmpresa = idEmpresa ? idEmpresa : '';
                idCaixaWeb = idCaixaWeb ? idCaixaWeb : '';
                dataUltimaAtualizacao = dataUltimaAtualizacao ? dataFormatada(dataUltimaAtualizacao) : '';
                page = page ? page : '';
                pageSize = pageSize ? pageSize : '';

                const apiUrl = `${url}/api/informatica/caixa.xsjs?idEmpresa=${idEmpresa}`
                const response = await axios.get(apiUrl)
                // const response = await getCaixa(idEmpresa, idCaixaWeb, dataUltimaAtualizacao,   page, pageSize) 
                
                return res.json(response.data); 
             
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        
    }

    async getListaCaixasID(req, res) {
        let { idCaixa } = req.query;
        if (!isNaN(idCaixa)) {
            try {
                const apiUrl = `http://164.152.245.77:8000/quality/concentrador_homologacao/api/informatica/caixa.xsjs?id=${idCaixa}`
                const response = await axios.get(apiUrl)
                if(response.status === 200){
                    return res.json(response.data); 
                } else {
                    return res.status(500).json({ message: "Erro ao buscar caixas." });
                }
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    }

    async getListaAtualizaEmpresaDiario(req, res) {
        let { idEmpresa,page, pageSize } = req.query;

        try {
            idEmpresa = idEmpresa ? idEmpresa : '';
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';    
            const apiUrl = `${url}/api/informatica/atualiza-empresa-diario.xsjs?id=${idEmpresa}`
            const response = await axios.get(apiUrl)
            // const response = await getAtualizaEmpresaDiario(idEmpresa)
            
            return res.json(response.data); 
            
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;

        }
        
    }

    async getListaVendasLojaInformatica(req, res) {
        let { idEmpresa, status, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;
        try {
            idEmpresa = idEmpresa ? idEmpresa : '';
            status = status ? status : '';
            dataPesquisaInicio = dataPesquisaInicio ? dataFormatada(dataPesquisaInicio) : '';
            dataPesquisaFim = dataPesquisaFim ? dataFormatada(dataPesquisaFim) : '';
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';
            const apiUrl = `${url}/api/informatica/vendas-lojas.xsjs?idEmpresa=${idEmpresa}&status=${status}&dataInicio=${dataPesquisaInicio}&dataFim=${dataPesquisaFim}`
            const response = await axios.get(apiUrl)
            // const response = await getVendasLoja(idEmpresa, status, dataPesquisaInicio, dataPesquisaFim, page, pageSize)
   
            return res.json(response.data); 
         
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaAtualizarFuncionario(req, res) {
        let { idFuncionario} = req.query;
        idFuncionario = idFuncionario ? idFuncionario : '';
       
        try {
            // ajaxGet('api/informatica/funcionario-loja.xsjs?pagesize=1000&id)
            const apiUrl = `http://164.152.245.77:8000/quality/concentrador/api/informatica/funcionario-loja.xsjs?pagesize=1000&id=${idFuncionario}`
            const response = await axios.get(apiUrl)
            if(response.status === 200){
                return res.json(response.data); 
            } else {
                return res.status(500).json({ message: "Erro ao buscar caixas." });
            }
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }
    async getListaPagamentoTEFInformatica(req, res) {
        let { } = req.query;   
        try {
            const response = await getPagamentoTEF()
            
            return res.json(response); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }
    async getListaPagamentoPOSInformatica(req, res) {
        let { } = req.query;   
        try {
            const response = await getPagamentoPOS()
            
            return res.json(response); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async getListaFuncionariosLoja(req, res) {
        let { byId, idEmpresa, cpf, noFuncionarioCPF, page, pageSize} = req.query;
        
        try {
            byId = byId ? byId : '';
            idEmpresa = idEmpresa ? idEmpresa : '';
            cpf = cpf ? cpf : '';
            noFuncionarioCPF = noFuncionarioCPF ? noFuncionarioCPF : '';
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';
            const apiUrl = `${url}/api/informatica/funcionario-loja.xsjs?id=${byId}&idEmpresa=${idEmpresa}&dsNomeFunc=${noFuncionarioCPF}&nuCPF=${cpf}&page=${page}&pagesize=${pageSize}`;

            const response = await axios.get(apiUrl)
           
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaVendasAlloc(req, res) {
        let { idEmpresa, status, idVenda, dataPesquisaInicio, dataPesquisaFim, stVendasAlloc , page, pageSize} = req.query;
        idEmpresa = idEmpresa ? idEmpresa : '';
        status = status ? status : '';
        idVenda = idVenda ? idVenda : '';
        stVendasAlloc = stVendasAlloc ? stVendasAlloc : '';
        dataPesquisaInicio = dataPesquisaInicio ? dataFormatada(dataPesquisaInicio) : '';
        dataPesquisaFim = dataPesquisaFim ? dataFormatada(dataPesquisaFim) : '';
        try {
            // ajaxGet('api/informatica/lista-vendas-alloc.xsjs?idVenda=' + idVenda + '&idEmpresa=' + IDEmpresaLoja + '&dataPesquisaInic=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&stvendasalloc=' + stvendasalloc)
            const apiUrl = `${url}/api/informatica/lista-vendas-alloc.xsjs?idVenda=${idVenda}&idEmpresa=${idEmpresa}&dataPesquisaInic=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&stvendasalloc=${stVendasAlloc}`
            const response = await axios.get(apiUrl)

            // const response = await getVendasAlloc(idEmpresa, status, idVenda, dataPesquisaInicio, dataPesquisaFim, page, pageSize)
            
            return res.json(response.data); 
            
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaVendasContigenciaIformatica(req, res) {
        let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize} = req.query;
        idEmpresa = idEmpresa ? idEmpresa : '';
        dataPesquisaInicio = dataPesquisaInicio ? dataFormatada(dataPesquisaInicio) : '';
        dataPesquisaFim = dataPesquisaFim ? dataFormatada(dataPesquisaFim) : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
      
        try {
            // ajaxGet('api/informatica/lista-vendas-contingencia.xsjs?idEmpresa=' + IDEmpresaLoja + '&dataPesquisaInic=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
            const apiUrl = `${url}/api/informatica/lista-vendas-contingencia.xsjs?idEmpresa=${idEmpresa}&dataPesquisaInic=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
            const response = await axios.get(apiUrl)
            // const response = await getVendasContigencia(idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize)
            return res.json(response.data); 
  
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaCliente(req, res) {
        let { idCliente} = req.query;
            
        try {
            idCliente = idCliente ? idCliente : '';

            const apiUrl = `${url}/api/informatica/cliente.xsjs?id=${idCliente}`
            const response = await axios.get(apiUrl)
            if(response.status === 200){
                return res.json(response.data); 
            } else {
                return res.status(500).json({ message: "Erro ao buscar caixas." });
            }
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaClienteIformatica(req, res) {
        let {idEmpresa, idCliente, idMarca, cpf, descCliente, tpCliente, status,  page, pageSize} = req.query;
        
      
        try {
            idEmpresa = idEmpresa ? idEmpresa : '';
            idCliente = idCliente ? idCliente : '';
            idMarca = idMarca ? idMarca : '';
            cpf = cpf ? cpf : '';
            descCliente = descCliente ? descCliente : '';
            tpCliente = tpCliente ? tpCliente : '';
            status = status ? status : '';
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';
            // ajaxGet('api/informatica/cliente.xsjs?page=' + numPage + '&idmarca=' + idmarca + '&idloja=' + idloja + '&dscliente=' + dscliente + '&idcpfcnpj=' + idcpfcnpj + '&idtipocliente=' + idtipocliente + '&idstatus=' + idstatus)

            const apiUrl = `${url}/api/informatica/cliente.xsjs?idmarca=${idMarca}&idloja=${idEmpresa}&dscliente=${descCliente}&idcpfcnpj=${cpf}&idtipocliente=${tpCliente}&idstatus=${status}&id=${idCliente}`
            const response = await axios.get(apiUrl)
            // const response = await getCliente(idEmpresa, idCliente, idMarca, cpf, descCliente, tpCliente, status,  page, pageSize)
         
            return res.json(response.data); 
        
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaLinkRelatorioBI(req, res) {
        let { idRelatorio, idEmpresa, page, pageSize, idLoja} = req.query;
        
        idRelatorio = idRelatorio ? idRelatorio : '';
        idEmpresa = idEmpresa ? idEmpresa : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        idLoja = idLoja ? idLoja : '';
        
        try {
            // ajaxGet('api/informatica/linkrelatoriobi.xsjs?page=' + numPage + '&id=' + idrelatoriobi + '&idfilial=' + idloja)
            const apiUrl = `${url}/api/informatica/linkrelatoriobi.xsjs?id=${idRelatorio}&idfilial=${idEmpresa}&page=${page}&pageSize=${pageSize}`
            const response = await axios.get(apiUrl)
            // const response = await getLinkRelatorioBI(idRelatorio, idEmpresa, page, pageSize)
        
            return res.json(response.data); 
         
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaRelatorioBI(req, res) {
        let { idRelatorio, status, page, pageSize } = req.query;

        try {
            idRelatorio = idRelatorio ? idRelatorio : '';
            status = status ? status : '';
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';
            const apiUrl = `${url}/api/informatica/relatoriobi.xsjs?`
            const response = await axios.get(apiUrl)
            // const response = await getRelatorioBI(idRelatorio, status, page, pageSize)
          
            return res.json(response.data); 
         
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaCadastroClienteCredSystem(req, res) {
        let { idEmpresa, dataPesquisaInicio, dataPesquisaFim,  page, pageSize } = req.query;

        try {
            idEmpresa = idEmpresa ? idEmpresa : '';
            dataPesquisaInicio = dataPesquisaInicio ? dataFormatada(dataPesquisaInicio) : '';
            dataPesquisaFim = dataPesquisaFim ? dataFormatada(dataPesquisaFim) : '';
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';
          
            // http://164.152.245.77:8000/quality/concentrador/api/informatica/cadastro-cliente-credsystem.xsjs?idEmpresa=&dtInicio=2024-12-09&dtFim=2024-12-09&page=1
            const apiUrl = `${url}/api/informatica/cadastro-cliente-credsystem.xsjs?idEmpresa=${idEmpresa}&dtInicio=${dataPesquisaInicio}&dtFim=${dataPesquisaFim}&page=${page}&pageSize=${pageSize}`;
            const response = await axios.get(apiUrl)
            
            // const response = await getCadastroClienteCredSystem(idEmpresa, dataPesquisaInicio, dataPesquisaFim,  page, pageSize)
          
            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }   
    }

    async getListaMeioPagamentoCredSystem(req, res) {
        let { idEmpresa, dataPesquisaInicio, dataPesquisaFim,  page, pageSize } = req.query;

        try {
            idEmpresa = idEmpresa ? idEmpresa : '';
            dataPesquisaInicio = dataPesquisaInicio ? dataFormatada(dataPesquisaInicio) : '';
            dataPesquisaFim = dataPesquisaFim ? dataFormatada(dataPesquisaFim) : '';
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';
            
            const apiUrl = `${url}/api/informatica/meio-pagamento-credsystem.xsjs?idEmpresa=${idEmpresa}&dtInicio=${dataPesquisaInicio}&dtFim=${dataPesquisaFim}&page=${page}&pageSize=${pageSize}`
            const response = await axios.get(apiUrl)
            
            // const response = await getMeioPagamentoCredSystem(idEmpresa, dataPesquisaInicio, dataPesquisaFim,  page, pageSize)
        
            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }
    async getListaParceriaCredSystem(req, res) {
        let { idEmpresa, dataPesquisaInicio, dataPesquisaFim,  page, pageSize } = req.query;

        try {
            idEmpresa = idEmpresa ? idEmpresa : '';
            dataPesquisaInicio = dataPesquisaInicio ? dataFormatada(dataPesquisaInicio) : '';
            dataPesquisaFim = dataPesquisaFim ? dataFormatada(dataPesquisaFim) : '';
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';
            const apiUrl = `${url}/api/informatica/parceria-credsystem.xsjs?idEmpresa=${idEmpresa}&dtInicio=${dataPesquisaInicio}&dtFim=${dataPesquisaFim}&page=${page}&pageSize=${pageSize}`
            const response = await axios.get(apiUrl)
            // const response = await getParceriaCredSystem(idEmpresa, dataPesquisaInicio, dataPesquisaFim,  page, pageSize)
          
            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }
    async getListaConfiguracoes(req, res) {
        let { idConfiguracao, idEmpresa, page, pageSize } = req.query;

        try {
            idConfiguracao = idConfiguracao ? idConfiguracao : '';
            idEmpresa = idEmpresa ? idEmpresa : '';
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';
           
            const response = await getConfiguracoes(idConfiguracao, idEmpresa, page, pageSize)
          
            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    // Create
 


    // Update
    async putInativarFuncionario(req, res) {
        try {
            let  {DATAULTIMAALTERACAO,STATIVO,DATA_DEMISSAO,ID} = req.body; 
            const response = await axios.put(`${url}/api/informatica/funcionario-inativa.xsjs`, { 
                DATAULTIMAALTERACAO,
                STATIVO,
                DATA_DEMISSAO,
                ID
            })
            
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: error.message });
        }
    }
    async putRelatorioBI(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body]; 

            const response = await axios.put(`${url}/api/informatica/relatoriobi.xsjs`, dados)
            // const response = await updateRelatarioBI(dados);
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: error.message });
        }
    }
    async putLinkRelatorioBI(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body]; 
            const response = await axios.put(`${url}/api/informatica/linkrelatoriobi.xsjs`, dados)

            // const response = await updateLinkRelatarioBI(dados);
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: error.message });
        }
    }

  
    async putAtualizaEmpresaDiario(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];   
            const response = await axios.put(`${url}/api/informatica/atualiza-empresa-diario.xsjs`, dados)
            // const response = await updateAtualizaEmpresaDiario(dados)
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }
   

    async putAtualizarTodosCaixas(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];   
            const response = await axios.put(`${url}/api/informatica/atualizar_todos_caixa.xsjs`, dados)

            // const response = await updateAtualizarTodosCaixa(dados)
        
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async putFuncionarioLoja(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];   
            const response = await axios.put(`${url}/api/informatica/funcionario-loja.xsjs`, dados)
            // const response = await updateFuncionario(dados)
        
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }
    async postFuncionarioLoja(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];   
            const response = await axios.post(`${url}/api/informatica/funcionario-loja.xsjs`, dados)
        
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async putFuncionarioDesconto(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];   
            const response = await axios.put(`${url}/api/informatica/funcionario-desconto.xsjs`, dados)
            // const response = await updateFuncionarioDesconto(dados)

            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }
   
    async putCaixaLoja(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];   
            const response = await updateCaixa(dados)
        
            return res.json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }
   
    async putConfiguracao(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];   
            const response = await updateConfiguracao(dados)
        
            return res.json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async postRelatorioBI(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];   
            const response = await axios.post(`${url}/api/informatica/relatoriobi.xsjs`, dados)

            // const response = await createRelatarioBI(dados)
        
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }
    async postLinkRelatorioBI(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];   
            const response = await axios.post(`${url}/api/informatica/linkrelatoriobi.xsjs`, dados)

            // const response = await createLinkRelatarioBI(dados)
        
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async postCaixaLoja(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];   
            const response = await createCaixa(dados)
        
            return res.json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async postConfiguracao(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];   
            const response = await createConfiguracao(dados)
        
            return res.json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }
}

export default new InformaticaControllers();