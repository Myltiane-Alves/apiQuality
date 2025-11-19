import axios, { Axios } from "axios";
import { dataFormatada } from "../../utils/dataFormatada.js";
import { getDetalheFechamento } from "../Detalhes/repositories/detalheFachamento.js";
import { getFaturaPixConsolidadoLoja } from "../Faturas/repositories/faturaPixConsolidadoLoja.js";
import { getExtratoLojaPeriodo } from "../Extrato/repositories/extratoLojaPeriodo.js";
// import { getVendaTotal } from "../Financeiro/Vendas/repositories/vendaTotal.js";
// import { getTotaisVenda} from "../Financeiro/Vendas/repositories/vendaLojaPeriodo.js";
// import { getVendasPagamentos } from "../Financeiro/Vendas/repositories/vendaPagamentos.js";
// import { getVendasTotalEmpresa } from "../Financeiro/Vendas/repositories/vendaTotalEmpresa.js";
// import { getVendaDigital } from "../Financeiro/Vendas/repositories/vendaDigital.js";
// import { getListaPCJById } from "../Financeiro/Caixas/repositories/listaCaixaMovimentos.js";
// import { getVendaPixPeriodo } from "../Financeiro/Vendas/repositories/vendaPixPeriodo.js";
// import { getFaturaPixPeriodo } from "../Financeiro/Faturas/repositories/faturaPixPeriodo.js";
// import { getVendaPixConsolidado } from "../Financeiro/Vendas/repositories/vendaPixConsolidado.js";
// import { getVendaPixConsolidadoLoja } from "../Financeiro/Vendas/repositories/vendaPixConsolidadoLoja.js";
// import { getFaturaPixPeriodoConsolidado } from "../Financeiro/Faturas/repositories/faturaPixPeriodoConsolidado.js";
// import { getVendaConciliacao } from "../Financeiro/Vendas/repositories/vendaConciliacao.js";
// import { getDepositoLoja, putDepositoLoja } from "../Financeiro/Depositos/repositories/depositoLoja.js";
// import { getDespesaLoja } from "../Financeiro/Despesas/despesaLoja.js";
// import { getVendaTotalRecebidoPeriodo } from "../Financeiro/Vendas/repositories/vendaTotalRecebidoPeriodo.js";
// import { getVendaTotalRecebidoEleteronico } from "../Financeiro/Vendas/repositories/vendaTotalRecebidoEletronico.js";
// import { getAdiantamentoSalarial } from "../Financeiro/Adiantamentos/adiantamentoSalarial.js";
// import { getResumoVoucher } from "../Financeiro/Voucher/resumoVoucher.js";
// import { getEstabelecimentos } from "../Financeiro/Estabelecimentos/estabelecimentos.js";
// import { getRemessaVendas } from "../Financeiro/Vendas/repositories/remessaVendas.js";
// import { getCaixaStatus } from "../Financeiro/Caixas/repositories/listaCaixaStatus.js";
// import { getCaixaZerados } from "../Financeiro/Caixas/repositories/listaCaixaZerados.js";
// import { putFecharCaixaZerados } from "../Financeiro/Caixas/repositories/fechaCaixaZerados.js";
// import { getDescontoVendas } from "../Financeiro/Desconto/descontoVendas.js";
// import { getDescontoVendaSimplificado } from "../Financeiro/Desconto/descontoVendasSimplificado.js";
// import { getDescontoMotivoVendas } from "../Financeiro/Desconto/descontoMotivoVendas.js";
// import { getMovimentoSaldoBonificacaoById, postMovimentoSaldoBonificacao } from "../Financeiro/Saldos/movimentoSaldoBonificacao.js";
// import { getPedidosCompras } from "../Financeiro/Pedidos/repositories/pedidosCompra.js";
// import { getMotivoDevolucao, putMotivoDevolucao } from "../Financeiro/Devolucao/repositories/motivoDevolucao.js";
// import { getVendas } from "../repositories/repositoriesVendaTotal.js";
import 'dotenv/config';
const url = process.env.API_URL;
import { MaloteClient } from "../Malotes/client/index.js";
import { MaloteService } from "../Malotes/services/index.js";

const maloteClient = new MaloteClient(process.env.API_URL);
const maloteService = new MaloteService(maloteClient);
import maloteSchema from "../Malotes/schema/index.js";
class FinanceiroControllers {

  async getListasHistoricosMalotes(req, res) {
    let { idEmpresa, idMalote, idHistoricoMalote, dataPesquisaInicio, dataPesquisaFim, dataConferenciaInicio, dataConferenciaFim, page, pageSize } = req.query;

    idEmpresa = idEmpresa ? idEmpresa : '';
    idMalote = idMalote ? idMalote : '';
    idHistoricoMalote = idHistoricoMalote ? idHistoricoMalote : '';
    dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
    dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
    dataConferenciaInicio = dataFormatada(dataConferenciaInicio) ? dataFormatada(dataConferenciaInicio) : '';
    dataConferenciaFim = dataFormatada(dataConferenciaFim) ? dataFormatada(dataConferenciaFim) : '';
    page = page ? page : '';
    pageSize = pageSize ? pageSize : '';

    try {

      // const response = await getHistoricosMalotes(idEmpresa, idMalote, idHistoricoMalote, dataPesquisaInicio, dataPesquisaFim, page, pageSize)
      const apiUrl = `${url}/api/financeiro/historicos-malotes.xsjs?idEmpresa=${idEmpresa}&idMalote=${idMalote}&idHistoricoMalote=${idHistoricoMalote}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&page=${page}&pageSize=${pageSize}`
      const response = await axios.get(apiUrl)
      return res.json(response.data);
    } catch (error) {
      console.error("Erro no FinanceiroControllers.getListasHistoricosMalotes verifique se os parâmetros estão sendo preenchidos:", error);
      throw error;
    }
  }

  async getListasMalotesLojas(req, res) {
    let { idEmpresa, idMarca, idMalote, statusMalote, pendenciaMalote, dataPesquisaInicio, dataPesquisaFim, dataConferenciaInicio, dataConferenciaFim, page, pageSize } = req.query;


    idEmpresa = idEmpresa ? idEmpresa : '';
    idMalote = idMalote ? idMalote : '';
    statusMalote = statusMalote ? statusMalote : '';
    pendenciaMalote = pendenciaMalote ? pendenciaMalote : '';
    dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
    dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
    idMarca = idMarca ? idMarca : '';
    dataConferenciaInicio = dataFormatada(dataConferenciaInicio) ? dataFormatada(dataConferenciaInicio) : '';
    dataConferenciaFim = dataFormatada(dataConferenciaFim) ? dataFormatada(dataConferenciaFim) : '';
    page = page ? page : '';
    pageSize = pageSize ? pageSize : '';

    try {

      const apiUrl = `${url}/api/financeiro/malotes-por-loja.xsjs?idGrupoEmpresarial=${idMarca}&idEmpresa=${idEmpresa}&statusMalote=${statusMalote}&idMalote=${idMalote}&idPendenciaMalote=${pendenciaMalote}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&dataConferenciaInicio=${dataConferenciaInicio}&dataConferenciaFim=${dataConferenciaFim}&page=${page}&pageSize=${pageSize}`
      // const apiUrl = `http://164.152.245.77:8000/quality/concentrador/api/financeiro/malotes-por-loja.xsjs?idGrupoEmpresarial=${idMarca}&idEmpresa=${idEmpresa}&statusMalote=${statusMalote}&idMalote=${idMalote}&idPendenciaMalote=${pendenciaMalote}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&dataConferenciaInicio=${dataConferenciaInicio}&dataConferenciaFim=${dataConferenciaFim}&page=${page}&pageSize=${pageSize}`
      const response = await axios.get(apiUrl)
      // const response = await getMalortesPorLoja(idEmpresa, idMarca, idMalote, statusMalote, pendenciaMalote, dataPesquisaInicio, dataPesquisaFim, page, pageSize)

      return res.json(response.data);
    } catch (error) {
      console.error("Erro no FinanceiroControllers.getListasMalotes verifique se os parâmetros estão sendo preenchidos:", error);
      throw error;
    }
  }

  async getListaPendenciasMalotes(req, res) {
    let { idEmpresa, idMalote, statusMalote, pendenciaMalote, page, pageSize } = req.query;


    idEmpresa = idEmpresa ? idEmpresa : '';
    idMalote = idMalote ? idMalote : '';
    statusMalote = statusMalote ? statusMalote : '';
    pendenciaMalote = pendenciaMalote ? pendenciaMalote : '';
    page = page ? page : '';
    pageSize = pageSize ? pageSize : '';

    try {
      const apiUrl = `${url}/api/financeiro/pendencias-malotes.xsjs?idEmpresa=${idEmpresa}&idMalote=${idMalote}&statusMalote=${statusMalote}&pendenciaMalote=${pendenciaMalote}&page=${page}&pageSize=${pageSize}`
      const response = await axios.get(apiUrl)
      // const response = await getPendenciasMalotes(idEmpresa, idMalote, statusMalote, pendenciaMalote, page, pageSize)

      return res.json(response.data);
    } catch (error) {
      console.error("Erro no FinanceiroControllers.getListaPendenciasMalotes verifique se os parâmetros estão sendo preenchidos:", error);
      throw error;
    }

  }

  async getListaExtratoDaLojaPeriodoFinan(req, res) {
    let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;


    idEmpresa = idEmpresa ? idEmpresa : '';
    dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
    dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
    page = page ? page : '';
    pageSize = pageSize ? pageSize : '';
    // ajaxGet('api/dashboard/extrato-loja-periodo.xsjs?pageSize=500&page=1&idEmpresa=' + idemp + '&dataPesquisaInicio=' + datapesq + '&dataPesquisaFim=' + datapesq)
    try {
      const apiUrl = `${url}/api/financeiro/extrato-loja-periodo.xsjs?pageSize=${pageSize}&page=${page}&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
      // const apiUrl = `http://164.152.245.77:8000/quality/concentrador/api/financeiro/extrato-loja-periodo.xsjs?pageSize=${pageSize}&page=${page}&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
      const response = await axios.get(apiUrl)
      // const response = await getExtratoLojaPeriodo(idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize)

      return res.json(response.data); // Retorna
    } catch (error) {
      console.error("Erro no FinanceiroControllers.getListaExtratoDaLojaPeriodoFinan verifique se os parâmetros estão sendo preenchidos:", error);
      return res.status(500).json({ error: "Erro ao buscar extrato da loja por período." });

    }

  }

  async getListaVendasMarca(req, res) {
    let { idMarcaPesqVenda, pageNumber, dataPesqInicio, dataPesqFim } = req.query;


    idMarcaPesqVenda = idMarcaPesqVenda ? idMarcaPesqVenda : '';
    const pageSize = 100;
    const offset = (pageNumber - 1) * pageSize;
    dataPesqInicio = dataFormatada(dataPesqInicio) ? dataFormatada(dataPesqInicio) : '';
    dataPesqFim = dataFormatada(dataPesqFim) ? dataFormatada(dataPesqFim) : '';

    try {
      const apiUrl = `${url}/api/financeiro/venda-marca-periodo.xsjs?pageSize=1000&idMarca=${idMarcaPesqVenda}&dataPesquisaInicio=${dataPesqInicio}&dataPesquisaFim=${dataPesqFim}`
      const response = await axios.get(apiUrl)

      return res.json(response.data); // Retorna
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  async getListaVendasMarcaFinanceiro(req, res) {
    let { idMarca, idLoja, idLojaPesquisa, pageNumber, dataPesquisaInicio, dataPesquisaFim } = req.query;


    idMarca = Number(idMarca);
    const pageSize = 100;
    const offset = (pageNumber - 1) * pageSize;
    dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
    dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
    idLoja = idLoja ? idLoja : '';
    idLojaPesquisa = idLojaPesquisa ? idLojaPesquisa : '';

    try {
      const apiUrl = `${url}/api/financeiro/venda-marca-periodo.xsjs?pageSize=500&idMarca=${idMarca}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idLoja=${idLoja}&idLojaPesquisa=${idLojaPesquisa}`
      const response = await axios.get(apiUrl)

      return res.json(response.data); // Retorna
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  async getListaVendasResumidaMarca(req, res) {
    let { dataPesquisaInicio, dataPesquisaFim } = req.query;
    const pageSize = 100;
    dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
    dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';

    try {
      const apiUrl = `${url}/api/financeiro/venda-digital-marca.xsjs?pageSize=500&page=1&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
      const response = await axios.get(apiUrl)

      return res.json(response.data); // Retorna
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }


  async getListaVendasResumidaFinanceiro(req, res) {
    let { dataPesquisa } = req.query;
    const pageSize = 100;
    dataPesquisa = dataFormatada(dataPesquisa)

    try {
      const apiUrl = `${url}/api/financeiro/venda-total.xsjs?dataPesquisa=${dataPesquisa}`
      const response = await axios.get(apiUrl)

      return res.json(response.data); // Retorna
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }
  }


  async getListaVendasTransacoesEmpresa(req, res) {
    let { dataPesquisa } = req.query;
    const pageSize = 100;
    dataPesquisa = dataFormatada(dataPesquisa)

    try {
      const apiUrl = `${url}/api/financeiro/venda-pagamentos.xsjs?dataPesquisa=${dataPesquisa}`
      const response = await axios.get(apiUrl)

      return res.json(response.data); // Retorna
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  async getListaVendasEmpresa(req, res) {
    let { dataPesquisa } = req.query;
    const pageSize = 100;
    dataPesquisa = dataFormatada(dataPesquisa)

    try {
      const apiUrl = `${url}/api/financeiro/venda-total-empresa.xsjs?dataPesquisa=${dataPesquisa}`
      const response = await axios.get(apiUrl)

      return res.json(response.data); // Retorna
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  async getListaDetalheFechamento(req, res) {
    let { idEmpresa, dataPesquisa, page, pageSize } = req.query;
    idEmpresa = idEmpresa ? idEmpresa : '';
    dataPesquisa = dataPesquisa ? dataPesquisa : '';
    page = page ? page : '';
    pageSize = pageSize ? pageSize : '';

    try {
      const apiUrl = `${url}/api/financeiro/detalhe-fechamento.xsjs?idEmpresa=${idEmpresa}&dataPesquisa=${dataPesquisa}`
      const response = await axios.get(apiUrl)
      // const response = await getDetalheFechamento(idEmpresa, dataPesquisa);

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }
  async getListaVendasLojaPeriodo(req, res) {
    let { idEmpresa, dataPesquisaInicio, dataPesquisaFim } = req.query;
    const pageSize = 1000;
    const page = 1;
    dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
    dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
    idEmpresa = idEmpresa ? idEmpresa : '';

    try {
      // ajaxGet('api/financeiro/venda-loja-periodo.xsjs?pageSize=500&page='+numPage+'&idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)

      const apiUrl = `${url}/api/financeiro/venda-loja-periodo.xsjs?pageSize=${pageSize}&page=${page}&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
      const response = await axios.get(apiUrl)

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  // INICIO CONSUMINDO BANCO DO RECAT


  // async getListaVendasLojaPeriodo2(req, res) {
  //   try {      
  //     const { idEmpresa, dataPesquisa } = req.query;
  //     const result = await getTotaisVenda(idEmpresa, dataPesquisa);
  //     // const apiUrl = await `http://localhost:6001/venda-pagamentos?dataPesquisa= ${dataPesquisa}&idEmpresa=${idEmpresa}`
  //     // const response = await axios.get(apiUrl)
  //     return res.json(result);
  //   } catch (err) {
  //     console.error('Erro ao buscar Vendas Loja Por Periodo:', err);
  //     return res.status(500).json({ message: 'Erro ao buscar Vendas Loja Por Periodo' });
  //   }
  // }


  // async getListaVendasPagamentos2(req, res) {
  //   try {
  //     const { idEmpresa, dataPesquisa, page, pageSize } = req.query;

  //     const result = await getVendasPagamentos(idEmpresa, dataPesquisa, page, pageSize);

  //     if (!result || result.length === 0) {
  //       return res.status(404).json({ message: 'Nenhum resultado encontrado.' });
  //     }

  //     return res.json(result);
  //   } catch (err) {
  //     console.error('Controller Erro ao buscar Vendas Loja Por Periodo:', err);
  //     return res.status(500).json({ message: 'Erro ao buscar Vendas Loja Por Periodo.' });
  //   }
  // }


  // async getListaVendasLojaById(req, res) {    
  //   try {
  //     let { byId, idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize  } = req.query; 
  //     byId = byId ? byId : '';
  //     dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //     dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //     idEmpresa = idEmpresa ? idEmpresa : '';
  //     page = page ? page : '';
  //     pageSize = pageSize ? pageSize : '';
  //     const result = await getVendasTotaisById();

  //     return res.json(result);
  //   } catch (err) {
  //     console.error('Erro ao buscar Vendas Loja Por Periodo por ID:', err);
  //     return res.status(500).json({ message: 'Erro ao buscar Vendas Loja Por Periodo por ID' });
  //   }

  // }

  // async getListaVendasTotal(req, res) {
  //   let { dataPesquisa } = req.query;
  //   dataPesquisa = dataFormatada(dataPesquisa) ? dataFormatada(dataPesquisa) : '';

  //   try {
  //     const response = await getVendaTotal(dataPesquisa);

  //     return res.json(response); 
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }
  // }

  // async getListaVendasEmpresa2(req, res) {
  //   let {idEmpresa, dataPesquisa } = req.query;
  //   // idEmpresa = Number(idEmpresa) ? Number(idEmpresa) : '';
  //   // dataPesquisa = dataFormatada(dataPesquisa) ? dataFormatada(dataPesquisa) : '';

  //   try {
  //     const response = await getVendasTotalEmpresa(idEmpresa, dataPesquisa);
  //     return res.json(response); 
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }
  // }

  // async getListaVendasDigital2(req, res) {

  //   try {
  //       const { idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;
  //       const response = await getVendaDigital(null, idEmpresa, dataPesquisaInicio, dataPesquisaFim, parseInt(page) || 1, parseInt(pageSize) || 10);

  //       return res.json(response);
  //     } catch (error) {
  //       console.error("Unable to connect to the database:", error);
  //       throw error;
  //     }

  // }

  // async getListaCaixasMovmentoFinanceiro2(req, res) {
  //   let {idMarca, dataPesquisaInicio, dataPesquisaFim, idLoja, idLojaPesquisa, page, pageSize } = req.query;

  //   // idMarca = idMarca ? idMarca : '';
  //   // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //   // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //   // idLoja = idLoja ? idLoja : '';
  //   // idLojaPesquisa = idLojaPesquisa ? idLojaPesquisa : '';
  //   // page = page ? page : '';
  //   // pageSize = pageSize ? pageSize : '';
  //   try {
  //     // const apiUrl = `http://localhost:6001/lista-caixas-movimento?idMarca=${idMarca}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idLoja=${idLoja}&idLojaPesquisa=${idLojaPesquisa}&page=${page}&pageSize=${pageSize}`
  //     const response = await getListaPCJById(idMarca, dataPesquisaInicio, dataPesquisaFim, idLoja, idLojaPesquisa, page, pageSize)
  //     console.log(response)
  //     return res.json(response); // Retorna
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }

  // }

  // async getListaVendasPixPeriodo2(req, res) {
  //   let { idMarca, dataPesquisaInicio, dataPesquisaFim, idLojaPesquisa, empresaLista, page, pageSize } = req.query;


  //   try {
  //     // idMarca = Number(idMarca);
  //     // pageSize = pageSize ? pageSize : '';
  //     // page = page ? page : '';
  //     // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //     // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //     // idLoja = idLoja ? idLoja : '';
  //     // listaEmpresas = listaEmpresas ? listaEmpresas : '';

  //     const response = await getVendaPixPeriodo(idMarca, dataPesquisaInicio, dataPesquisaFim, idLojaPesquisa, empresaLista, page, pageSize)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }

  // }

  // async getListaFaturasPixPeriodo2(req, res) {
  //   let { idMarca, dataPesquisaInicio, dataPesquisaFim, idLojaPesquisa, empresaLista, page, pageSize } = req.query;

  //   // idMarca = Number(idMarca);
  //   // pageSize = pageSize ? pageSize : '';
  //   // page = page ? page : '';
  //   // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //   // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //   // idLoja = idLoja ? idLoja : '';
  //   // listaEmpresas = listaEmpresas ? listaEmpresas : '';
  //   try {

  //     const response = await getFaturaPixPeriodo(idMarca, dataPesquisaInicio, dataPesquisaFim, idLojaPesquisa, empresaLista, page, pageSize)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }
  // }

  // async getListaVendasPixConsolidado2(req, res) {
  //   let { idMarca, dataPesquisaInicio, dataPesquisaFim,  page, pageSize} = req.query;


  //   // idMarca = Number(idMarca);
  //   // pageSize = pageSize ? pageSize : '';
  //   // page = page ? page : '';
  //   // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //   // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //   // idLoja = idLoja ? idLoja : '';
  //   // listaEmpresas = listaEmpresas ? listaEmpresas : '';

  //   try {

  //     const response = await getVendaPixConsolidado(idMarca, dataPesquisaInicio, dataPesquisaFim,  page, pageSize)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }

  // }

  // async getListaVendasPixConsolidadoLojas2(req, res) {
  //   let { idMarca, idLojaPesquisa, empresaLista, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;

  //     // idMarca = Number(idMarca);
  //     // pageSize = pageSize ? pageSize : '';
  //     // page = page ? page : '';
  //     // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //     // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //     // idLoja = idLoja ? idLoja : '';
  //     // listaEmpresas = listaEmpresas ? listaEmpresas : '';
  //     try {

  //       const response = await getVendaPixConsolidadoLoja(idMarca, idLojaPesquisa, empresaLista, dataPesquisaInicio, dataPesquisaFim, page, pageSize)

  //       return res.json(response);
  //     } catch (error) {
  //       console.error("Unable to connect to the database:", error);
  //       throw error;
  //     }

  // }

  // async getListaFaturasPixConsolidado2(req, res) {
  //   let { idMarca, dataPesquisaInicio, dataPesquisaFim,  page, pageSize } = req.query;

  //     // idMarca = Number(idMarca);
  //     // const pageSize = 100;
  //     // const offset = (pageNumber - 1) * pageSize;
  //     // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //     // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';

  //     try {

  //       const response = await getFaturaPixPeriodoConsolidado(idMarca, dataPesquisaInicio, dataPesquisaFim,  page, pageSize)

  //       return res.json(response);
  //     } catch (error) {
  //       console.error("Unable to connect to the database:", error);
  //       throw error;
  //     }

  // }

  // async getListaVendasConciliar2(req, res) {
  //   let { idGrupo, idLoja, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;


  //   // idGrupo = Number(idGrupo) ? Number(idGrupo) : '';
  //   // const pageSize = 1000;

  //   // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //   // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //   // idLoja = idLoja ? idLoja : '';
  //   // page = page ? page : 1;
  //   try {

  //     const response = await getVendaConciliacao(idGrupo, idLoja, dataPesquisaInicio, dataPesquisaFim, page, pageSize)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }

  // }

  // FIM CONSUMINDO BANCO DO RECAT

  async getListaCaixasMovmentoFinanceiro(req, res) {
    let { idMarca, dataPesquisaInicio, dataPesquisaFim, idLoja, idLojasPesquisa } = req.query;
    const pageSize = 1000;
    dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
    dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
    idMarca = idMarca ? idMarca : '';
    idLoja = idLoja ? idLoja : '';
    idLojasPesquisa = idLojasPesquisa ? idLojasPesquisa : '';

    try {
      // ajaxGet('api/financeiro/lista-caixas-movimento.xsjs?pageSize=1000&idMarca=' + IDMarcaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idLoja=' + IDLojaPesqVenda + '&idLojasPesq=' + IDLojasPesq)
      const apiUrl = `${url}/api/financeiro/lista-caixas-movimento.xsjs?pageSize=1000&idMarca=${idMarca}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idLoja=${idLoja}&idLojasPesq=${idLojasPesquisa}`
      const response = await axios.get(apiUrl)

      return res.json(response.data); // Retorna
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  async getListaVendasMarcaROB(req, res) {
    let { idMarca, pageNumber, dataPesquisaInicio, dataPesquisaFim } = req.query;

    if (!isNaN(idMarca)) {
      idMarca = Number(idMarca);
      const pageSize = 100;
      const offset = (pageNumber - 1) * pageSize;
      dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
      dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';

      try {

        const apiUrl = `${url}/api/financeiro/venda-marca-rob.xsjs?pageSize=500&idMarca=${idMarca}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
        const response = await axios.get(apiUrl)

        return res.json(response.data);
      } catch (error) {
        console.error("Unable to connect to the database:", error);
        throw error;
      }
    }
  }

  async getListaVendasMarcaMarckup(req, res) {
    let { idMarca, pageNumber, dataPesquisaInicio, dataPesquisaFim, idLoja, idLojaPesquisa } = req.query;

    if (!isNaN(idMarca)) {
      idMarca = Number(idMarca);
      const pageSize = 100;
      const offset = (pageNumber - 1) * pageSize;
      dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
      dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
      idLoja = idLoja ? idLoja : '';
      idLojaPesquisa = idLojaPesquisa ? idLojaPesquisa : '';
      try {
        // ajaxGet('api/financeiro/venda-marca-marckup.xsjs?pageSize=500&idMarca=' + IDMarcaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&idLoja=' + IDLojaPesqVenda + '&idLojasPesq=' + IDLojasPesq)
        const apiUrl = `${url}/api/financeiro/venda-marca-marckup.xsjs?pageSize=500&idMarca=${idMarca}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idLoja=${idLoja}&idLojasPesq=${idLojaPesquisa}`
        const response = await axios.get(apiUrl)

        return res.json(response.data);
      } catch (error) {
        console.error("Unable to connect to the database:", error);
        throw error;
      }
    }
  }

  async getListaVendasDigital(req, res) {
    let { idEmpresa, pageNumber, dataPesquisaInicio, dataPesquisaFim } = req.query;

    if (!isNaN(idEmpresa)) {
      idEmpresa = Number(idEmpresa);
      const pageSize = 100;
      const offset = (pageNumber - 1) * pageSize;
      dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
      dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';

      try {

        const apiUrl = `${url}/api/financeiro/venda-digital.xsjs?pageSize=1000&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
        const response = await axios.get(apiUrl)

        return res.json(response.data);
      } catch (error) {
        console.error("Unable to connect to the database:", error);
        throw error;
      }
    }
  }

  async getListaDespesasLoja(req, res) {
    let { idEmpresa, idCategoria, dataPesquisaInicio, dataPesquisaFim } = req.query;

    idEmpresa = Number(idEmpresa) ? Number(idEmpresa) : '';
    idCategoria = idCategoria ? idCategoria : '';
    dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
    dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';

    try {

      const apiUrl = `${url}/api/financeiro/despesa-loja.xsjs?idCategoria=${idCategoria}&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
      const response = await axios.get(apiUrl)
      // const response = await getDespesaLoja(idEmpresa, idCategoria, dataPesquisaInicio, dataPesquisaFim)

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  async getListaVendasPixPeriodo(req, res) {
    let { idMarca, pageSize, page, dataPesquisaInicio, dataPesquisaFim, idLoja, listaEmpresas } = req.query;

    if (!isNaN(idMarca)) {
      idMarca = Number(idMarca);
      pageSize = pageSize ? pageSize : '';
      page = page ? page : '';
      dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
      dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
      idLoja = idLoja ? idLoja : '';
      listaEmpresas = listaEmpresas ? listaEmpresas : '';
      try {
        // ajaxGet('api/financeiro/venda-pix-periodo.xsjs?pageSize=1000&page=' + numPage + '&idMarca=' + IDPesqVendaPix + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&lojas=' + IDLojaPesqVenda + '&empresasList=' + listEmpresas)

        const apiUrl = `${url}/api/financeiro/venda-pix-periodo.xsjs?pageSize=${pageSize}&page=${page}&idMarca=${idMarca}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&lojas=${idLoja}&empresasList=${listaEmpresas}`
        const response = await axios.get(apiUrl)

        return res.json(response.data);
      } catch (error) {
        console.error("Unable to connect to the database:", error);
        throw error;
      }
    }
  }

  async getListaVendasPixConsolidadoLojas(req, res) {
    let { idMarca, pageSize, page, dataPesquisaInicio, dataPesquisaFim, idLoja, listaEmpresas } = req.query;

    if (!isNaN(idMarca)) {
      idMarca = Number(idMarca);
      pageSize = pageSize ? pageSize : '';
      page = page ? page : '';
      dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
      dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
      idLoja = idLoja ? idLoja : '';
      listaEmpresas = listaEmpresas ? listaEmpresas : '';
      try {

        const apiUrl = `${url}/api/financeiro/venda-pix-consolidado-loja.xsjs?pageSize=${pageSize}&page=${page}&idMarca=${idMarca}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&lojas=${idLoja}&empresasList=${listaEmpresas}`
        const response = await axios.get(apiUrl)

        return res.json(response.data);
      } catch (error) {
        console.error("Unable to connect to the database:", error);
        throw error;
      }
    }
  }

  // async getListaFaturasPixPeriodo(req, res) {
  //   let { idMarca, pageSize, page, dataPesquisaInicio, dataPesquisaFim, idLoja, listaEmpresas } = req.query;

  //   if (!isNaN(idMarca)) {
  //     idMarca = Number(idMarca);
  //     pageSize = pageSize ? pageSize : '';
  //     page = page ? page : '';
  //     dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //     dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //     idLoja = idLoja ? idLoja : '';
  //     listaEmpresas = listaEmpresas ? listaEmpresas : '';
  //     try {
  //       // ajaxGet('api/financeiro/venda-pix-periodo.xsjs?pageSize=1000&page=' + numPage + '&idMarca=' + IDPesqVendaPix + '&dataPesquisaInicio=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&lojas=' + IDLojaPesqVenda + '&empresasList=' + listEmpresas)

  //       const apiUrl = `${url}/api/financeiro/fatura-pix-periodo.xsjs?pageSize=${pageSize}&page=${page}&idMarca=${idMarca}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&lojas=${idLoja}&empresasList=${listaEmpresas}`
  //       const response = await axios.get(apiUrl)

  //       return res.json(response.data);
  //     } catch (error) {
  //       console.error("Unable to connect to the database:", error);
  //       throw error;
  //     }
  //   }
  // }

  async getListaVendasPixConsolidado(req, res) {
    let { idMarca, pageSize, page, dataPesquisaInicio, dataPesquisaFim, idLoja, listaEmpresas } = req.query;

    if (!isNaN(idMarca)) {
      idMarca = Number(idMarca);
      pageSize = pageSize ? pageSize : '';
      page = page ? page : '';
      dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
      dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
      idLoja = idLoja ? idLoja : '';
      listaEmpresas = listaEmpresas ? listaEmpresas : '';

      try {
        // ajaxGet('api/financeiro/venda-pix-consolidado.xsjs?pageSize=1000&page=' + numPage + '&idMarca=' + IDPesqVendaPixConsolid + '&dataPesquisaInicio=' + datapesqinicioConsolid + '&dataPesquisaFim=' + datapesqfimConsolid)
        const apiUrl = `${url}/api/financeiro/venda-pix-consolidado.xsjs?pageSize=${pageSize}&page=${page}&idMarca=${idMarca}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&lojas=${idLoja}&empresasList=${listaEmpresas}`
        const response = await axios.get(apiUrl)

        return res.json(response.data);
      } catch (error) {
        console.error("Unable to connect to the database:", error);
        throw error;
      }
    }
  }

  async getListaFaturasPixConsolidado(req, res) {
    let { idMarca, page, pageSize, dataPesquisaInicio, dataPesquisaFim } = req.query;

    if (!isNaN(idMarca)) {
      idMarca = Number(idMarca);
      dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
      dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
      pageSize = pageSize ? pageSize : '';
      page = page ? page : '';
      try {

        const apiUrl = `${url}/api/financeiro/fatura-pix-periodo-consolidado.xsjs?page=${page}&pageSize=${pageSize}&idMarca=${idMarca}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
        const response = await axios.get(apiUrl)

        return res.json(response.data);
      } catch (error) {
        console.error("Unable to connect to the database:", error);
        throw error;
      }
    }
  }

  async getListaFaturaPixConsolidadoLoja(req, res) {
    let { idMarca, dataPesquisaInicio, dataPesquisaFim, idLoja, empresa, page, pageSize } = req.query;

    idMarca = Number(idMarca) ? Number(idMarca) : '';
    dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
    dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
    idLoja = idLoja ? idLoja : '';
    empresa = empresa ? empresa : '';
    page = page ? page : '';
    pageSize = pageSize ? pageSize : '';

    try {

      const apiUrl = `${url}/api/financeiro/fatura-pix-consolidado-loja.xsjs?page=${page}&pageSize=${pageSize}&idMarca=${idMarca}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&lojas=${idLoja}&empresa=${empresa}`
      const response = await axios.get(apiUrl)
      // const response = await getFaturaPixConsolidadoLoja(idMarca, dataPesquisaInicio, dataPesquisaFim, idLoja, empresaLista, page, pageSize)

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  async getListaVendasConciliar(req, res) {
    let { idGrupo, idLoja, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;


    idGrupo = Number(idGrupo) ? Number(idGrupo) : '';
    dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
    dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
    idLoja = idLoja ? idLoja : '';
    page = page ? page : '';
    pageSize = pageSize ? pageSize : '';
    try {
      const apiUrl = `${url}/api/financeiro/venda-conciliacao.xsjs?idGrupo=${idGrupo}&idLoja=${idLoja}&dtInicio=${dataPesquisaInicio}&dtFim=${dataPesquisaFim}&page=${page}&pageSize=${pageSize}`
      const response = await axios.get(apiUrl)

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  // async getListaConciliarBanco(req, res) {
  //   let {idDeposito, idConta, idEmpresa, dataCompInicio, dataCompFim, dataMovInicio, dataMovFim, dataPesquisaInicio, dataPesquisaFim, pageSize, page } = req.query;

  //   pageSize = pageSize ? pageSize : '';
  //   page = page ? page : '';
  //   idConta = idConta ? idConta : '';
  //   dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //   dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //   dataCompInicio = dataFormatada(dataCompInicio) ? dataFormatada(dataCompInicio) : '';
  //   dataCompFim = dataFormatada(dataCompFim) ? dataFormatada(dataCompFim) : '';
  //   dataMovInicio = dataFormatada(dataMovInicio) ? dataFormatada(dataMovInicio) : '';
  //   dataMovFim = dataFormatada(dataMovFim) ? dataFormatada(dataMovFim) : '';

  //   try {
  //     // const apiUrl = `${url}/api/financeiro/deposito-loja.xsjs?page=1&idConta=${idConta}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&dataCompInicio=${dataCompensacaoInicio}&dataCompFim=${dataCompensacaoFim}&datamovinicio=${dataMovimentoInicio}&datamovfim=${dataMovimentoFim}`
  //     const response = await getDepositoLoja(idDeposito, idConta, idEmpresa, dataCompInicio, dataCompFim, dataMovInicio, dataMovFim, dataPesquisaInicio, dataPesquisaFim, pageSize, page)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }

  // }

  async getListaConciliarBancoConsolidado(req, res) {
    let { idConta, pageSize, page, dataPesquisaInicio, dataPesquisaFim, dataCompensacaoInicio, dataCompensacaoFim, dataMovimentoInicio, dataMovimentoFim } = req.query;

    pageSize = pageSize ? pageSize : '';
    page = page ? page : '';
    idConta = idConta ? idConta : '';
    dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
    dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
    dataCompensacaoInicio = dataCompensacaoInicio ? dataCompensacaoInicio : '';
    dataCompensacaoFim = dataCompensacaoFim ? dataCompensacaoFim : '';
    dataMovimentoInicio = dataMovimentoInicio ? dataMovimentoInicio : '';
    dataMovimentoFim = dataMovimentoFim ? dataMovimentoFim : '';

    try {
      const apiUrl = `${url}/api/financeiro/deposito-loja-consolidado.xsjs?page=${page}&pageSize=${pageSize}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&dataCompInicio=${dataCompensacaoInicio}&dataCompFim=${dataCompensacaoFim}&datamovinicio=${dataMovimentoInicio}&datamovfim=${dataMovimentoFim}`
      const response = await axios.get(apiUrl)

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  // async getListaDepositosLoja(req, res) {
  //   let {  idDeposito, idConta, idEmpresa, dataCompInicio, dataCompFim, dataMovInicio, dataMovFim, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;

  //   // const pageSize = 100;
  //   // const offset = (pageNumber - 1) * pageSize;
  //   // idDeposito = idDeposito ? idDeposito : '';
  //   // idConta = idConta ? idConta : '';
  //   // idEmpresa = idEmpresa ? idEmpresa : '';
  //   // dataCompInicio = dataCompInicio ? dataCompInicio : '';
  //   // dataCompFim = dataCompFim ? dataCompFim : '';
  //   // dataMovInicio = dataMovInicio ? dataMovInicio : '';
  //   // dataMovFim = dataMovFim ? dataMovFim : '';
  //   // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //   // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //   // page = page ? page : '';
  //   // pageSize = pageSize ? pageSize : '';
  //   try {
  //     // const apiUrl = `${url}/api/financeiro/deposito-loja.xsjs?page=1&pagesize=1000&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
  //     // const response = await axios.get(apiUrl)
  //     const response = await getDepositoLoja(idDeposito, idConta, idEmpresa, dataCompInicio, dataCompFim, dataMovInicio, dataMovFim, dataPesquisaInicio, dataPesquisaFim, page, pageSize)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }

  // }

  // async getListaRecebimentos(req, res) {
  //   let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page } = req.query;

  //   // pageSize = pageSize ? pageSize : '';
  //   // page = page ? page : '';
  //   // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //   // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //   // idEmpresa = idEmpresa ? idEmpresa : '';

  //   try {
  //     // const apiUrl = `${url}/api/financeiro/venda-total-recebido-periodo.xsjs?pageSize=500&page=1&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
  //     // const response = await axios.get(apiUrl)
  //     const response = await getVendaTotalRecebidoPeriodo(idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }

  // }
  // async getListaRecebimentosEletronico(req, res) {
  //   let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page } = req.query;

  //   // pageSize = pageSize ? pageSize : '';
  //   // page = page ? page : '';
  //   // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //   // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //   // idEmpresa = idEmpresa ? idEmpresa : '';

  //   try {
  //     // const apiUrl = `${url}/api/financeiro/venda-recebido-eletronico.xsjs?pageSize=${pageSize}&page=${page}&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
  //     const response = await getVendaTotalRecebidoEleteronico(idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }

  // }
  async getListaDetalheRecebimentosEletronico(req, res) {
    let { idEmpresa, page, pageSize, dataPesquisaInicio, dataPesquisaFim, nomeTef, nomeAutorizador, numeroParcelas } = req.query;


    idEmpresa = idEmpresa ? idEmpresa : '';
    dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
    dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
    nomeTef = nomeTef ? nomeTef : '';
    nomeAutorizador = nomeAutorizador ? nomeAutorizador : '';
    numeroParcelas = numeroParcelas ? numeroParcelas : '';
    page = page ? page : '';
    pageSize = pageSize ? pageSize : '';
    try {
      // ajaxGet('api/financeiro/venda-detalhe-recebimento-eletronico.xsjs?idEmpresa=' + IDEmpresaPesqVenda + '&dataPesquisaInicio=' + datapesqinicio +'&dataPesquisaFim=' + datapesqfim +'&nomeTef=' + nomeTef +'&nomeAutorizador=' + nomeAutorizador +'&numeroParcelas=' + numeroParcelas)
      const apiUrl = `${url}/api/financeiro/venda-detalhe-recebimento-eletronico.xsjs?page=${page}&pageSize=${pageSize}&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&nomeTef=${nomeTef}&nomeAutorizador=${nomeAutorizador}&numeroParcelas=${numeroParcelas}`
      const response = await axios.get(apiUrl)

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  // async getListaEstabelecimentos(req, res) {
  //   let { idGrupo, idEstabelecimento, idEmpresa,  page, pageSize } = req.query;


  //   // pageSize = pageSize ? pageSize : ''
  //   // page = page ? page : '';
  //   // idEmpresa = idEmpresa ? idEmpresa : '';
  //   // idGrupo = idGrupo ? idGrupo : '';
  //   try {
  //     // const apiUrl = `${url}/api/financeiro/estabelecimentos.xsjs?page=${page}&pageSize=${pageSize}&idGrupoEmpresa=${idGrupo}&idLojaEmpresa=${idEmpresa}`
  //     const response = await getEstabelecimentos(idGrupo, idEstabelecimento, idEmpresa,  page, pageSize)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }

  // }

  // async getListaRemessaVendas(req, res) {
  //   let { idGrupo, idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page } = req.query;

  //   // pageSize = pageSize ? pageSize : '';
  //   // page = page ? page : '';
  //   // idEmpresa = idEmpresa ? idEmpresa : '';
  //   // idGrupo = idGrupo ? idGrupo : '';
  //   // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //   // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //   try {
  //     // const apiUrl = `${url}/api/financeiro/remessa-venda.xsjs?page=${page}&idGrupoEmpresa=${idGrupo}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesuisaFim=${dataPesquisaFim}&idLojaEmpresa=${idEmpresa}`
  //     // const response = await axios.get(apiUrl)
  //     const response = await getRemessaVendas(idGrupo, idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }

  // }
  // async getListaCaixaStatus(req, res) {
  //   let { idEmpresa, idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;

  //   // page = page ? page : '';
  //   // pageSize = pageSize ? pageSize : ''
  //   // idEmpresa = idEmpresa ? idEmpresa : '';
  //   // idMarca = idMarca ? idMarca : '';
  //   // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //   // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //   try {
  //     // const apiUrl = `${url}/api/financeiro/lista-caixas-status.xsjs?page=${page}&idMarca=${idMarca}&idEmpresa=${idEmpresa}&dataInicial=${dataPesquisaInicio}&dataFinal=${dataPesquisaFim}`
  //     const response = await getCaixaStatus(idEmpresa, idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }

  // }
  // async getListaCaixaZerados(req, res) {
  //   let { idEmpresa, idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;

  //   // page = page ? page : ''
  //   // pageSize = pageSize ? pageSize : ''
  //   // idEmpresa = idEmpresa ? idEmpresa : '';
  //   // idMarca = idMarca ? idMarca : '';
  //   // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //   // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //   try {
  //     // const apiUrl = `http://164.152.245.77:8000/quality/concentrador_homologacao/api/financeiro/lista-caixas-zerados.xsjs?page=${page}&idMarca=${idMarca}&idEmpresa=${idEmpresa}&dataInicial=${dataPesquisaInicio}&dataFinal=${dataPesquisaFim}`
  //     const response = await getCaixaZerados(idEmpresa, idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }

  // }

  // async getListaDescontoVendas(req, res) {
  //   let {idEmpresa, idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;

  //   // page = page ? page : '';
  //   // pageSize = pageSize ? pageSize : '';
  //   // idEmpresa = idEmpresa ? idEmpresa : '';
  //   // idMarca = idMarca ? idMarca : '';
  //   // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //   // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //   try {
  //     // const apiUrl = `${url}/api/financeiro/desconto-vendas.xsjs?page=${page}&idMarca=${idMarca}&idEmpresa=${idEmpresa}&dataInicial=${dataPesquisaInicio}&dataFinal=${dataPesquisaFim}`
  //     const response = await getDescontoVendas(idEmpresa, idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }
  // }

  // async getListaDescontoVendasSimplificada(req, res) {
  //   let { idEmpresa, idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;


  //   // idEmpresa = idEmpresa ? idEmpresa : '';
  //   // idMarca = idMarca ? idMarca : '';
  //   // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //   // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //   try {
  //     // const apiUrl = `${url}/api/financeiro/desconto-vendas-simplificado.xsjs?page=1&idMarca=${idMarca}&idEmpresa=${idEmpresa}&dataInicial=${dataPesquisaInicio}&dataFinal=${dataPesquisaFim}`
  //     const response = await getDescontoVendaSimplificado(idEmpresa, idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }
  // }


  // async getListaDescontoMotivoVendas(req, res) {
  //   let { idEmpresa, idMarca, dsMotivoDesconto, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;

  //   // idEmpresa = idEmpresa ? idEmpresa : '';
  //   // idMarca = idMarca ? idMarca : '';
  //   // descontoMotivo = descontoMotivo ? descontoMotivo : '';
  //   // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //   // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //   try {
  //     // const apiUrl = `${url}/api/financeiro/desconto-motivo-vendas.xsjs?page=1&idMarca=${idMarca}&idEmpresa=${idEmpresa}&dataInicial=${dataPesquisaInicio}&dataFinal=${dataPesquisaFim}&dsmotdesc=${descontoMotivo}`
  //     const response = await getDescontoMotivoVendas(idEmpresa, idMarca, dsMotivoDesconto, dataPesquisaInicio, dataPesquisaFim, page, pageSize)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }
  // }
  // async getListaExtratoBonificacaoById(req, res) {
  //   let { idFuncionario, page, pageSize } = req.query;
  //   // idFuncionario = idFuncionario ? idFuncionario : '';
  //   try {
  //     // const apiUrl = `${url}/api/financeiro/movimento-saldo-bonificacao.xsjs?pageSize=500&idFuncionario=${idFuncionario}`
  //     const response = await getMovimentoSaldoBonificacaoById(idFuncionario,  page, pageSize)

  //     return res.json(response.data);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }
  // }

  // async getListaPedidosCompras(req, res) {
  //   let { id, idContaPagar, idPedido, idMarca, idFornecedor, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;
  //   page = page ? page : '';
  //   pageSize = pageSize ? pageSize : '';
  //   // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //   // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //   // idFornecedor = idFornecedor ? idFornecedor : '';
  //   // idMarca = idMarca ? idMarca : '';
  //   // numeroPedido = numeroPedido ? numeroPedido : '';
  //   try {
  //     // const apiUrl = `${url}/api/financeiro/pedidos_compra.xsjs?pageSize=500&page=1&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idFornPesquisa=${idFornecedor}&idMarcaPesquisa=${idMarca}&idpedido=${numeroPedido}`
  //     const response = await getPedidosCompras(id, idContaPagar, idPedido, idMarca, idFornecedor, dataPesquisaInicio, dataPesquisaFim, page, pageSize)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }
  // }

  async getListaSaldoExtratoLoja(req, res) {
    let { dataPesquisaInicio, idMarca } = req.query;
    const numPage = [1, 2, 3, 4, 5]
    dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
    idMarca = idMarca ? idMarca : '';
    try {
      const apiUrl = `${url}/api/financeiro/saldo-loja-por-grupo.xsjs?&idGrupoEmpresarial=${idMarca}&dataPesquisa=${dataPesquisaInicio}`
      const response = await axios.get(apiUrl)

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }
  }

  // async getListaMotivosDevolucao(req, res) {
  //   let { idMotivo, descricaoMotivo, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;

  //   idMotivo = idMotivo ? idMotivo : '';
  //   descricaoMotivo = descricaoMotivo ? descricaoMotivo : '';
  //   dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
  //   dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
  //   page = page ? page : '';
  //   pageSize = pageSize ? pageSize : '';
  //   try {
  //     // const apiUrl = `${url}/api/financeiro/motivo-devolucao.xsjs?dtInicio=${dataPesquisaInicio}&dtFim=${dataPesquisaFim}&idMotivo=${idMotivo}&descMotivo=${descricaoMotivo}`
  //     const response = await getMotivoDevolucao(idMotivo, descricaoMotivo, dataPesquisaInicio, dataPesquisaFim, page, pageSize)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }
  // }

  // async getListaAdiantamentoSalarialFinanceiro(req, res) {
  //   let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page } = req.query;

  //   // idEmpresa = idEmpresa ? idEmpresa : '';
  //   // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //   // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //   try {
  //     // const apiUrl = `${url}/api/financeiro/adiantamento-salarial.xsjs?idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
  //     const response = await getAdiantamentoSalarial(idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }
  // }

  // async getListaResumoVoucherFinanceiro(req, res) {
  //   let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page } = req.query;

  //   // idEmpresa = idEmpresa ? idEmpresa : '';
  //   // dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //   // dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //   try {
  //     // const apiUrl = `${url}/api/financeiro/resumo-voucher.xsjs?pageSize=500&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
  //     const response = await getResumoVoucher(idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }
  // }
  // async getListaDetalheFaturaFinanceiro(req, res) {
  //   let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, } = req.query;

  //   idEmpresa = idEmpresa ? idEmpresa : '';
  //   dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
  //   dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
  //   try {
  //     const apiUrl = `${url}/api/financeiro/detalhe-fatura.xsjs?pageSize=500&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
  //     const response = await axios.get(apiUrl)

  //     return res.json(response.data);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }
  // }


  async getListaBanco(req, res) {
    let { } = req.query;

    try {
      const apiUrl = `${url}/api/banco.xsjs`
      const response = await axios.get(apiUrl)

      return res.json(response.data);
    } catch (error) {
      console.error("Error no FinanceiroControllers.getListaBanco:", error);
      throw error;
    }
  }

  async getListaContaBanco(req, res) {
    let { } = req.query;

    try {
      const apiUrl = `${url}/api/financeiro/conta-banco.xsjs`
      const response = await axios.get(apiUrl)

      return res.json(response.data);
    } catch (error) {
      console.error("Error no FinanceiroControllers.getListaContaBanco:", error);
      throw error;
    }
  }


  // async updateMotivoDevolucao(req, res) {
  //   let { IDMOTIVODEVOLUCAO, IDUSUARIO, DSMOTIVO, STATIVO } = req.body;

  //   try {
  //     // const apiUrl = `${url}/api/financeiro/motivo-devolucao.xsjs`
  //     const response = await putMotivoDevolucao(
  //       IDMOTIVODEVOLUCAO,
  //       IDUSUARIO,
  //       DSMOTIVO,
  //       STATIVO
  //     )

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }
  // }
  // async createMotivoDevolucao(req, res) {
  //   let { IDUSUARIO, DSMOTIVO } = req.body;

  //   try {
  //     // const apiUrl = `${url}/api/financeiro/motivo-devolucao.xsjs`
  //     const response = await putMotivoDevolucao(IDUSUARIO, DSMOTIVO)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }
  // }

  async putFaturaFinanceiro(req, res) {
    let { IDDETALHEFATURA, NUCODAUTORIZACAO, VRRECEBIDO, NUAUTORIZACAO, STPIX, STCANCELADO } = req.body;

    if (!IDDETALHEFATURA) {
      console.error("Erro no FinanceiroControllers.putFaturaFinanceiro: Faltando Parametos obrigatórios");
      return res.status(400).json({ error: "Faltando Parametos obrigatórios" });
    }

    try {
      const apiUrl = `${url}/api/financeiro/atualizar-fatura.xsjs`
      const response = await axios.put(apiUrl, {
        NUCODAUTORIZACAO,
        VRRECEBIDO,
        STCANCELADO,
        STPIX,
        NUAUTORIZACAO,
        IDDETALHEFATURA,
      })

      return res.json(response.data);
    } catch (error) {
      console.error("Erro no FinanceiroControllers.putFaturaFinanceiro:", error);
      throw error;
    }
  }


  async updateAdiantamentoStatus(req, res) {
    let { IDADIANTAMENTOSALARIO, STATIVO } = req.body;

    try {
      const apiUrl = `${url}/api/financeiro/atualizacao-adiantamento-status.xsjs`
      const response = await axios.put(apiUrl, {
        IDADIANTAMENTOSALARIO,
        STATIVO
      })

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }
  }

  // async updateFecharCaixaZerado(req, res) {
  //   let { ID } = req.body;

  //   try {
  //     // const apiUrl = `http://164.152.245.77:8000/quality/concentrador_homologacao/api/financeiro/fecha-caixas-zerados.xsjs`
  //     const response = await putFecharCaixaZerados(ID)

  //     return res.json(response);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }
  // }

  // async updateDepositoLoja(req, res) {
  //   let { IDDEPOSITOLOJA } = req.body;

  //   try {
  //     // const apiUrl = `http://164.152.245.77:8000/quality/concentrador_homologacao/api/financeiro/atualizar-deposito-loja.xsjs`
  //     const response = await putDepositoLoja(IDDEPOSITOLOJA)

  //     return res.json(response.data);
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }
  // }

  async createMotivoDevolucao(req, res) {
    let { IDUSUARIO, DSMOTIVO } = req.body;

    try {
      const apiUrl = `${url}/api/financeiro/motivo-devolucao.xsjs`
      const response = await axios.post(apiUrl, {
        IDUSUARIO,
        DSMOTIVO,

      })

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }
  }
  // async createMovimentoSaldoBonificacao(req, res) {
  //   let { IDFUNCIONARIO, TIPOMOVIMENTO, VRMOVIMENTO, OBSERVACAO, IDFUNCIONARIORESP } = req.body;

  //   try {

  //     const response = await postMovimentoSaldoBonificacao(IDFUNCIONARIO, TIPOMOVIMENTO, VRMOVIMENTO, OBSERVACAO, IDFUNCIONARIORESP)

  //     return res.json(response); 
  //   } catch (error) {
  //     console.error("Unable to connect to the database:", error);
  //     throw error;
  //   }
  // }

  async putMalotesLoja(req, res) {

    try {
      const { error, value } = maloteSchema.validate(req.body, { 
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

      const response = await maloteService.updateMalote(
        value.IDMALOTE,
        value.STATUS,
        value.OBSERVACAOADMINISTRATIVO,
        value.PENDENCIAS,
        value.IDUSERULTIMAALTERACAO
      );

      return res.status(200).json(response);
    } catch (error) {
      console.error("Erro no FinanceiroControllers.putMalotes:", error);
      return res.status(500).json({ error: "Erro no servidor" });
    }
  }
}


export default new FinanceiroControllers();
