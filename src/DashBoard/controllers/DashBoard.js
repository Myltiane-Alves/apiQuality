// import { getAdiantamentosLojas } from "../DashBoard/AdiantamentoSalarial/adiantamento-lojas.js";
import { getQuebraCaixa } from "../QuebraCaixa/repositories/listaQuebraCaixa.js";
import { dataFormatada } from "../../utils/dataFormatada.js";
import 'dotenv/config';
const url = process.env.API_URL;
import axios from 'axios';

class DashBoardControllers {

    async getResumoVendaGerencia(req, res) {

        let { idEmpresa, page, pageSize, dataPesquisa } = req.query;

        if (!isNaN(idEmpresa)) {
            idEmpresa = Number(idEmpresa) ? idEmpresa : '';
            dataPesquisa = dataPesquisa ? dataPesquisa : '';
            pageSize = pageSize ? pageSize : '';
            page = page ? page : '';

            try {
                const apiUrl = `${url}/api/dashboard/resumo-venda.xsjs?idEmpresa=${idEmpresa}&dataPesquisa=${dataPesquisa}`;
                const response = await axios.get(apiUrl);

                return res.json(response.data);
            } catch (error) {
                console.error("Erro ao conectar ao servidor:", error);

                throw error;
            }

        }
    }
    async getListaVendasLojaResumidoGerencia(req, res) {

        let { idEmpresaLogin, dataPesquisaInicio, dataPesquisaFim } = req.query;

        dataPesquisaInicio = dataFormatada(dataPesquisaInicio)
        dataPesquisaFim = dataFormatada(dataPesquisaFim)

        try {
            // ajaxGet('api/dashboard/venda/venda-resumido.xsjs?pageSize=500&idLoja=' + IDEmpresaLogin + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)

            const apiUrl = `${url}/api/dashboard/venda/venda-resumido.xsjs?pageSize=500&idLoja=${idEmpresaLogin}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`;

            const response = await axios.get(apiUrl);
            return res.json(response.data);
        } catch (error) {
            console.error("Erro ao conectar ao servidor:", error);

            throw error;
        }


    }

    async getListaQuebraCaixa(req, res) {
        let { idMarca, idEmpresa, cpfOperadorQuebra, stQuebraPositivaNegativa, dataPesquisaInicio, dataPesquisaFim, pageSize, page } = req.query;
        // let { idEmpresa, pageSize, page, dataPesquisaInicio, dataPesquisaFim, idMarca, cpfOperadorQuebra } = req.query;

        idMarca = idMarca ? idMarca : '';
        idEmpresa = idEmpresa ? idEmpresa : '';
        cpfOperadorQuebra = cpfOperadorQuebra ? cpfOperadorQuebra : '';
        stQuebraPositivaNegativa = stQuebraPositivaNegativa ? stQuebraPositivaNegativa : '';
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';

        try {
            // quebra-caixa/lista-quebra-caixa.xsjs?idEmpresa=1&dataPesquisaInic=2024-02-01&dataPesquisaFim=2024-02-13
            const apiUrl = `${url}/api/dashboard/quebra-caixa/lista-quebra-caixa.xsjs?pageSize=${pageSize}&page=${page}&idEmpresa=${idEmpresa}&dataPesquisaInic=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idMarca=${idMarca}&cpfquebraop=${cpfOperadorQuebra}`
            const response = await axios.get(apiUrl)
            // const response = await getQuebraCaixa(idMarca, idEmpresa, cpfOperadorQuebra, stQuebraPositivaNegativa, dataPesquisaInicio, dataPesquisaFim, pageSize, page)

            return res.json(response.data); 
        } catch (error) {
            console.error("Erro no DashBoardControllers.getListaQuebraCaixa:", error);
            throw error;
        }


    }

    async getListaQuebraCaixaPositiva(req, res) {
        let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, quebra, idMarca, cpfOperadorQuebra } = req.query;

        idEmpresa = idEmpresa ? idEmpresa : '';
        const pageSize = 100;
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
        quebra = quebra ? quebra : '';
        idMarca = idMarca ? idMarca : '';
        cpfOperadorQuebra = cpfOperadorQuebra ? cpfOperadorQuebra : '';

        try {
            // ajaxGet('api/dashboard/quebra-caixa/lista-quebra-caixa.xsjs?pageSize=1000&page=1&idEmpresa=' + IDEmpresaLoja + '&dataPesquisaInic=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim +'&stQuebraPositivaNegativa=Positiva' + '&idMarca=' + IDMarcaLoja + '&cpfquebraop=' + CPFOperadorQuebra)
            const apiUrl = `${url}/api/dashboard/quebra-caixa/lista-quebra-caixa.xsjs?pageSize=1000&page=1&idEmpresa=${idEmpresa}&dataPesquisaInic=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&stQuebraPositivaNegativa=${quebra}&idMarca=${idMarca}&cpfquebraop=${cpfOperadorQuebra}`
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }


    }

    async getListaQuebraCaixaNegativa(req, res) {
        let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, quebra, idMarca, cpfOperadorQuebra } = req.query;

        idEmpresa = idEmpresa ? idEmpresa : '';
        const pageSize = 100;
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
        quebra = quebra ? quebra : '';
        idMarca = idMarca ? idMarca : '';
        cpfOperadorQuebra = cpfOperadorQuebra ? cpfOperadorQuebra : '';


        try {
            // ajaxGet('api/dashboard/quebra-caixa/lista-quebra-caixa.xsjs?idEmpresa=' + IDEmpresaLoja + '&dataPesquisaInic=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&stQuebraPositivaNegativa=Negativa')
            const apiUrl = `${url}/api/dashboard/quebra-caixa/lista-quebra-caixa.xsjs?pageSize=1000&page=1&idEmpresa=${idEmpresa}&dataPesquisaInic=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&stQuebraPositivaNegativa=${quebra}&idMarca=${idMarca}&cpfquebraop=${cpfOperadorQuebra}`
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }


    }

    async getRetornoTableImprimeQuebra(req, res) {
        let { idQuebraCaixa } = req.query;

        if (!isNaN(idQuebraCaixa)) {
            idQuebraCaixa = Number(idQuebraCaixa)

            try {
                const apiUrl = `${url}/api/dashboard/quebra-caixa/quebra-caixa.xsjs?id=${idQuebraCaixa}`
                const response = await axios.get(apiUrl)

                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Error no DashBoardControllers.getRetornoTableImprimeQuebra:", error);
                return res.status(500).json({ error: error.message });
    
            }
        }

    }

    async getRetornoListaVendaDetalhe(req, res) {
        let { idEmpresa, idVenda } = req.query;

        idEmpresa = idEmpresa ? idEmpresa : '';
        idVenda = idVenda ? idVenda : '';
        try {
            const apiUrl = `${url}/api/dashboard/venda/resumo-venda-caixa-detalhado.xsjs?idEmpresa=${idEmpresa}&idVenda=${idVenda}`
            const response = await axios.get(apiUrl)

            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async getRetornoListaVendasAtivasDetalheProduto(req, res) {
        let { idEmpresa, idVenda } = req.query;

        idEmpresa = idEmpresa ? idEmpresa : '';
        idVenda = idVenda ? idVenda : '';
        try {
            const apiUrl = `${url}/api/dashboard/venda/detalhe-venda.xsjs?idEmpresa=${idEmpresa}&idVenda=${idVenda}`
            const response = await axios.get(apiUrl)

            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async getRetornoListaVendasConvenioDescontoFuncionario(req, res) {
        let { idEmpresaLogin, idFuncionarioPN, dataFechamento, dataInicio } = req.query;
        idEmpresaLogin = idEmpresaLogin ? idEmpresaLogin : '';
        idFuncionarioPN = idFuncionarioPN ? idFuncionarioPN : '';
        dataFormatada(dataFechamento)
        dataFormatada(dataInicio)
        try {
            const apiUrl = `${url}/api/dashboard/venda/resumo-venda-convenio-desconto.xsjs?pagesize=1000&status=False&idEmpresa=${idEmpresaLogin}&dataInicio=${dataInicio}&dataFechamento=${dataFechamento}&idFuncPN=${idFuncionarioPN}`
            const response = await axios.get(apiUrl)

            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }
    // async getListaFuncionario(req, res) {

    //     let { idEmpresa, page, pageSize } = req.query;
    //     idEmpresa = idEmpresa ? idEmpresa : '';
    //     page = page ? page : '';
    //     pageSize = pageSize ? pageSize : '';
    //     try {
    //         const apiUrl = `${url}/api/dashboard/funcionario.xsjs?idEmpresa=${idEmpresa}`
    //         const response = await axios.get(apiUrl)
            
    //         return res.json(response.data);
    //     } catch (error) {
    //         console.error("Unable to connect to the database:", error);
    //         throw error;
    //     }
    // }

    async getRetornoListaVendasConvenioDesconto(req, res) {
        let { idEmpresa, dataFechamento, dataInicio } = req.query;

        try {
            idEmpresa = idEmpresa ? idEmpresa : '';
            dataFormatada(dataFechamento) = dataFormatada(dataFechamento) ? dataFormatada(dataFechamento) : '';
            dataFormatada(dataInicio) = dataFormatada(dataInicio) ? dataFormatada(dataInicio) : '';
            const apiUrl = `${url}/api/dashboard/venda/resumo-venda-convenio-desconto.xsjs?pagesize=1000&status=False&idEmpresa=${idEmpresa}&dataInicio=${dataInicio}&dataFechamento=${dataFechamento}`
            const response = await axios.get(apiUrl)

            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    // async retornoListaCaixasMovimentoGerencia(req, res) {
    //     let { idEmpresa, pageNumber, dataFechamento } = req.query;
    //     if (!isNaN(idEmpresa)) {
    //         idEmpresa = Number(idEmpresa);

    //         const pageSize = 100;
    //         const offset = (pageNumber - 1) * pageSize;
    //         dataFechamento = dataFormatada(dataFechamento)
    //         try {
    //             const apiUrl = `${url}/api/dashboard/venda/lista-caixas-movimento.xsjs?idEmpresa=${idEmpresa}&dataFechamento=${dataFechamento}`
    //             const response = await axios.get(apiUrl)

    //             return res.json(response.data); // Retorna
    //         } catch (error) {
    //             console.error("Unable to connect to the database:", error);
    //             throw error;
    //         }
    //     }
    // }

    async getListaVendasVendedorGerencia(req, res) {
        let { idEmpresa, page, pageSize, dataFechamento } = req.query;
        if (!isNaN(idEmpresa)) {
            idEmpresa = Number(idEmpresa) ? idEmpresa : '';
            dataFechamento = dataFechamento ? dataFechamento : '';
            pageSize = pageSize ? pageSize : '';
            page = page ? page : '';
            try {
                const apiUrl = `${url}/api/dashboard/venda/vendedor.xsjs?page=${page}&pagesize=${pageSize}&idEmpresa=${idEmpresa}&dataFechamento=${dataFechamento}`
                const response = await axios.get(apiUrl)

                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    }
    // async getListaVendasVendedorPeriodoGerencia(req, res) {
    //     let { idEmpresaLogin, pageNumber, dataPesquisaInicio, dataPesquisaFim } = req.query;
    //     if (!isNaN(idEmpresaLogin)) {
    //         idEmpresaLogin = Number(idEmpresaLogin);

    //         const pageSize = 100;
    //         const offset = (pageNumber - 1) * pageSize;
    //         dataPesquisaInicio = dataFormatada(dataPesquisaInicio)
    //         dataPesquisaFim = dataFormatada(dataPesquisaFim)
    //         try {
    //             // ajaxGet('api/dashboard/venda/venda-vendedor.xsjs?idEmpresa=' + IDEmpresaLogin + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
    //             const apiUrl = `${url}/api/dashboard/venda/venda-vendedor.xsjs?idEmpresa=${idEmpresaLogin}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
    //             const response = await axios.get(apiUrl)

    //             return res.json(response.data); // Retorna
    //         } catch (error) {
    //             console.error("Unable to connect to the database:", error);
    //             throw error;
    //         }
    //     }
    // }

    async getListaResumoVendasAtivaGerencia(req, res) {
        let { idEmpresa, page, pageSize, dataFechamento, status } = req.query;
        if (!isNaN(idEmpresa)) {
            idEmpresa = idEmpresa ? idEmpresa : '';
            dataFechamento = dataFechamento ? dataFechamento : '';
            pageSize = pageSize ? pageSize : '';
            page = page ? page : '';
            try {
                const apiUrl = `${url}/api/dashboard/venda/resumo-venda-caixa.xsjs?pagesize=100&status=False&idEmpresa=${idEmpresa}&dataFechamento=${dataFechamento}`
                const response = await axios.get(apiUrl)

                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    }
    async getListaVendasGerencia(req, res) {
        let { idVenda } = req.query;

        idVenda = idVenda ? idVenda : '';
        try {
            const apiUrl = `${url}/api/dashboard/venda/resumo-venda-caixa.xsjs?idVenda=${idVenda}`
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }

    }

    async getListaResumoVendasCanceladasGerencia(req, res) {
        let { idEmpresa, pageNumber, dataFechamento } = req.query;
        if (!isNaN(idEmpresa)) {
            idEmpresa = Number(idEmpresa);

            const pageSize = 100;
            const offset = (pageNumber - 1) * pageSize;
            dataFechamento = dataFormatada(dataFechamento)
            try {
                const apiUrl = `${url}/api/dashboard/venda/resumo-venda-caixa.xsjs?pagesize=100&status=True&idEmpresa=${idEmpresa}&dataFechamento=${dataFechamento}`
                const response = await axios.get(apiUrl)

                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    }

    async getListAdiantamentoLoja(req, res) {
        let { idEmpresa, dataPesquisaInicio, dataPesquisaFim } = req.query;

        idEmpresa = idEmpresa ? idEmpresa : '';
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
        try {
            const apiUrl = `${url}/api/dashboard/adiantamento-salarial/funcionarios.xsjs?idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }

    }
    async getListAdiantamentoSalarialData(req, res) {
        let { idEmpresa, pageNumber, dataPesquisa } = req.query;

        idEmpresa = idEmpresa ? idEmpresa : '';

        const pageSize = 100;
        const offset = (pageNumber - 1) * pageSize;
        dataPesquisa = dataFormatada(dataPesquisa) ? dataFormatada(dataPesquisa) : '';

        try {
            const apiUrl = `${url}/api/dashboard/adiantamento-salarial.xsjs?idEmpresa=${idEmpresa}&dataPesquisa=${dataPesquisa}`
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }

    }
    async getListaAdiantamentoSalarialLoja(req, res) {
        let { idMarca, idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page } = req.query;

        // idEmpresa = idEmpresa ? idEmpresa : '';
        // idMarca = idMarca ? idMarca : '';
        // const pageSize = 100;
        // const offset = (pageNumber - 1) * pageSize;
        // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
        // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
        try {
            // const apiUrl = `http://164.152.245.77:8000/quality/concentrador/api/dashboard/adiantamento-salarial/adiantamentolojas.xsjs?idEmpresa=${idEmpresa}&dataPesquisaIni=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idMarca=${idMarca}`
            const response = await getAdiantamentosLojas(idMarca, idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page)

            return res.json(response); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }

    }

    async getAdiantamentoSalarialFuncionario(req, res) {
        let { idFuncionario } = req.query;
        try {
            const apiUrl = `${url}/api/adiantamento-salarial.xsjs?id=${idFuncionario}`;
            const response = await axios.get(apiUrl);

            return res.json(response.data); // Retorna os dados da resposta
        } catch (error) {
            console.error("Erro no DashBoardControllers.getAdiantamentoSalarialFuncionario:", error);
            throw error; // Lança o erro para tratamento posterior, se necessário
        }

    }

    async getListaExtratoDaLojaPeriodo(req, res) {
        let { idEmpresa, page, pageSize, dataPesquisaInicio, dataPesquisaFim } = req.query;

        if (!isNaN(idEmpresa)) {
            idEmpresa = Number(idEmpresa) ? idEmpresa : '';
            dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
            dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
            pageSize = pageSize ? pageSize : '';
            page = page ? page : '';
            // ajaxGet('api/dashboard/extrato-loja-periodo.xsjs?pageSize=500&page=1&idEmpresa=' + idemp + '&dataPesquisaInicio=' + datapesq + '&dataPesquisaFim=' + datapesq)
            try {
                const apiUrl = `${url}/api/dashboard/extrato-loja-periodo.xsjs?pageSize=${pageSize}&page=${page}&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
                const response = await axios.get(apiUrl)

                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    }
    async getListaExtratoDaLojaPeriodoADM(req, res) {
        let { idEmpresa, pageNumber, dataPesquisaInicio, dataPesquisaFim } = req.query;

        if (!isNaN(idEmpresa)) {
            idEmpresa = Number(idEmpresa);
            const pageSize = 100;
            const offset = (pageNumber - 1) * pageSize;
            dataPesquisaInicio = dataFormatada(dataPesquisaInicio)
            dataPesquisaFim = dataFormatada(dataPesquisaFim)


            try {
                const apiUrl = `${url}/api/dashboard/extrato-loja-periodo.xsjs?pageSize=500&page=1&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
                const response = await axios.get(apiUrl)

                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    }

    async getListaRelatorioBIGerencia(req, res) {
        let { idEmpresaLogin, idRelatorio } = req.query;

        if (!isNaN(idEmpresaLogin)) {
            idEmpresaLogin = Number(idEmpresaLogin);
            let numPage = 1
            try {
                const apiUrl = `${url}/api/relatorio-bi.xsjs?page=1&id=${idEmpresaLogin}&idrelatorio=${idRelatorio}`
                const response = await axios.get(apiUrl)

                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Erro no DashBoardControllers.getListaRelatorioBIGerencia:", error);
                throw error;
            }
        }
    }

    // async getListaPagamentoVenda(req, res) {
    //     let { idVenda } = req.query
    //     try {
    //         const apiUrl = `${url}/api/dashboard/venda/recebimento.xsjs?id=${idVenda}`
    //         const response = await axios.get(apiUrl)

    //         return res.json(response.data);
    //     } catch (error) {
    //         console.error("Unable to connect to the database:", error);
    //         throw error;
    //     }
    // }

    async updateStatusQuebraCaixaLoja(req, res) {
        let {
            IDQUEBRACAIXA,
            STATIVO,
        } = req.body;

        try {
            const response = await axios.put(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/dashboard/quebra-caixa/atualizacao-status.xsjs`, {
                IDQUEBRACAIXA,
                STATIVO,
            })

            return res.status(200).json({ message: 'Status Atualizado com sucesso!' })
        } catch (error) {
            console.error("Erro Verifique verifique os dados do banco:", error);
            throw error;
        }
    }
    // async postCadastrarAdiantamento(req, res) {
    //     let {
    //         IDEMPRESA,
    //         IDFUNCIONARIO,
    //         DTLANCAMENTO,
    //         TXTMOTIVO,
    //         VRVALORDESCONTO,
    //         STATIVO,
    //         IDUSR

    //     } = req.body;

    //     try {
    //         const response = await axios.post(`${url}/api/adiantamento-salarial.xsjs`, {
    //             IDEMPRESA,
    //             IDFUNCIONARIO,
    //             DTLANCAMENTO,
    //             TXTMOTIVO,
    //             VRVALORDESCONTO,
    //             STATIVO,
    //             IDUSR,

    //         })

    //         return res.status(200).json({ message: 'Adiantamento Salarial cadastrado com sucesso!' })
    //     } catch (error) {
    //         console.error("Erro Verifique os campos do formulário:", error);
    //         throw error;
    //     }
    // }

    // async getAdiantamentoSalarialFuncionario(req, res,) {
    //     let { idFuncionario } = req.query;
    //     if(isNaN(idFuncionario)) {
    //         idFuncionario = Number(idFuncionario)
    //         try {
    //             const apiUrl = `${url}/api/adiantamento-salarial.xsjs?id=${idFuncionario}`
    //             const response = await axios.get(apiUrl);

    //             return res.json(response.data); // Retorna
    //         } catch (error) {
    //             console.error("Unable to connect to the database:", error);
    //             throw error; // Lança o erro para tratamento posterior, se necessário
    //         }
    //     }
    // }
}

export default new DashBoardControllers();


