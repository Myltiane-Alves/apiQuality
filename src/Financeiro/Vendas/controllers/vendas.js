
import axios from "axios";
import { dataFormatada } from "../../../utils/dataFormatada.js";
import { getVendaTotal } from "../repositories/vendaTotal.js";
import { getRemessaVendas } from "../repositories/remessaVendas.js";
import { getVendaConciliacao } from "../repositories/vendaConciliacao.js";
import { getVendaDigital } from "../repositories/vendaDigital.js";
import { getTotaisVenda, getVendasTotaisById } from "../repositories/vendaLojaPeriodo.js";
import { getVendasPagamentos } from "../repositories/vendaPagamentos.js";
import { getVendaPixConsolidado } from "../repositories/vendaPixConsolidado.js";
import { getVendaPixConsolidadoLoja } from "../repositories/vendaPixConsolidadoLoja.js";
import { getVendaPixPeriodo, putVendaPixStatusConferido } from "../repositories/vendaPixPeriodo.js";
import { getVendasTotalEmpresa } from "../repositories/vendaTotalEmpresa.js";
import { getVendaTotalRecebidoEleteronico } from "../repositories/vendaTotalRecebidoEletronico.js";
import { getVendaTotalRecebidoPeriodo } from "../repositories/vendaTotalRecebidoPeriodo.js";
import { getVendaMarcaPeriodo } from "../repositories/vendaMarcaPeriodo.js";
import { getVendaDigitalMarca } from "../repositories/vendaDigitalMarca.js";

import 'dotenv/config';
const url = process.env.API_URL || 'localhost:6001'

class FinanceiroVendasControllers {


  async getListaVendasLojaPeriodo(req, res) {
    try {
      let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;
      idEmpresa = idEmpresa ? idEmpresa : '';
      dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
      dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
      page = page ? page : '';
      pageSize = pageSize ? pageSize : '';
      
      const apiUrl = `${url}/api/financeiro/venda-loja-periodo.xsjs?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idEmpresa=${idEmpresa}&page=${page}&pageSize=${pageSize}`
      const response = await axios.get(apiUrl)
      return res.json(response.data);
    } catch (err) {
      console.error('Erro ao buscar Vendas Loja Por Periodo:', err);
      return res.status(500).json({ message: 'Erro ao buscar Vendas Loja Por Periodo' });
    }
  }
  // async getListaVendasLojaPeriodo(req, res) {
  //     try {      
  //       let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;
  //       idEmpresa = idEmpresa ? idEmpresa : '';
  //       dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
  //       dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
  //       const result = await getVendasTotaisById(idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize);
  //       // const apiUrl = await `http://localhost:6001/venda-pagamentos?dataPesquisa= ${dataPesquisa}&idEmpresa=${idEmpresa}`
  //       // const response = await axios.get(apiUrl)
  //       return res.json(result);
  //     } catch (err) {
  //       console.error('Erro ao buscar Vendas Loja Por Periodo:', err);
  //       return res.status(500).json({ message: 'Erro ao buscar Vendas Loja Por Periodo' });
  //     }
  // }

  async getListaVendasDigital(req, res) {

    try {
      let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;
      idEmpresa = idEmpresa ? idEmpresa : '';
      dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
      dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
      page = page ? page : '';
      pageSize = pageSize ? pageSize : '';

      // const response = await getVendaDigital(idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize);
      // http://164.152.245.77:8000/quality/concentrador_homologacao/api/financeiro/venda-digital.xsjs?pageSize=500&page=2&idEmpresa=1&dataPesquisaInicio=2021-12-06&dataPesquisaFim=2024-12-06
      const apiUrl = `${url}/api/financeiro/venda-digital.xsjs?pageSize=${pageSize}&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&page=${page}`
      const response = await axios.get(apiUrl)
      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  async getListaVendasDigitalMarca(req, res) {
    let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;
    idEmpresa = idEmpresa ? idEmpresa : '';
    dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
    dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
    page = page ? page : '';
    pageSize = pageSize ? pageSize : '';
    try {
      const apiUrl = `${url}/api/financeiro/venda-digital-marca.xsjs?pageSize=500&page=1&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
      const response = await axios.get(apiUrl)
      // const response = await getVendaDigitalMarca(idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize)

      return res.json(response.data);
    } catch (error) {
      console.error("Erro no FinanceiroVendasControllers.getListaVendasDigitalMarca:", error);
      throw error;
    }

  }

  async getListaVendasConciliar(req, res) {
    let { idGrupo, idLoja, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;

    try {
      idGrupo = idGrupo ? idGrupo : '';
      idLoja = idLoja ? idLoja : '';
      dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
      dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
      page = page ? page : '';
      pageSize = pageSize ? pageSize : '';
      const apiUrl = `${url}/api/financeiro/venda-conciliacao.xsjs?page=${page}&idGrupo=${idGrupo}&dtInicio=${dataPesquisaInicio}&dtFim=${dataPesquisaFim}&idLoja=${idLoja}`
      const response = await axios.get(apiUrl)
      // const response = await getVendaConciliacao(idGrupo, idLoja, dataPesquisaInicio, dataPesquisaFim, page, pageSize)

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  async getListaVendasTotal(req, res) {
    let { dataPesquisa, page, pageSize } = req.query;
    dataPesquisa = dataPesquisa ? dataPesquisa : '';
    page = page ? page : '';
    pageSize = pageSize ? pageSize : '';
    try {
      // const response = await getVendaTotal(dataPesquisa, page, pageSize);

      const apiUrl = await `${url}/api/financeiro/venda-total.xsjs?dataPesquisa=${dataPesquisa}`
      const response = await axios.get(apiUrl)
      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  async getListaRemessaVendas(req, res) {
    let { idGrupo, idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page } = req.query;

    idEmpresa = idEmpresa ? idEmpresa : '';
    idGrupo = idGrupo ? idGrupo : '';
    dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
    dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
    pageSize = pageSize ? pageSize : '';
    page = page ? page : '';
    try {
      const apiUrl = `${url}/api/financeiro/remessa-venda.xsjs?page=${page}&pageSize=${pageSize}&idGrupoEmpresa=${idGrupo}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesuisaFim=${dataPesquisaFim}&idLojaEmpresa=${idEmpresa}`
      const response = await axios.get(apiUrl)
      // const response = await getRemessaVendas(idGrupo, idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page)

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  async getListaVendasPagamentos(req, res) {
    try {
      let { idEmpresa, dataPesquisa, page, pageSize } = req.query;
      const apiUrl = await `${url}/api/financeiro/venda-pagamentos.xsjs?idEmpresa=${idEmpresa}&dataPesquisa=${dataPesquisa}`
      const response = await axios.get(apiUrl)
      // const response = await getVendasPagamentos(idEmpresa, dataPesquisa, page, pageSize);

      return res.json(response.data);
    } catch (err) {
      console.error('Controller Erro ao buscar Vendas Loja Por Periodo:', err);
      throw err;
    }
  }

  async getListaVendasPixConsolidado(req, res) {
    let { idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;



    try {
      idMarca = Number(idMarca) ? Number(idMarca) : '';
      dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
      dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
      pageSize = pageSize ? pageSize : '';
      page = page ? page : '';

      const apiUrl = `${url}/api/financeiro/venda-pix-consolidado.xsjs?pageSize=${pageSize}&idMarca=${idMarca}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&page=${page}`
      const response = await axios.get(apiUrl)
      // const response = await getVendaPixConsolidado(idMarca, dataPesquisaInicio, dataPesquisaFim,  page, pageSize)

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  async getListaVendasPixConsolidadoLojas(req, res) {
    let { idMarca, idLoja, empresaLista, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;

    try {
      idMarca = Number(idMarca) ? Number(idMarca) : '';
      idLoja = idLoja ? idLoja : '';
      empresaLista = empresaLista ? empresaLista : '';
      dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
      dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
      page = page ? page : '';
      pageSize = pageSize ? pageSize : '';

      const apiUrl = `${url}/api/financeiro/venda-pix-consolidado-loja.xsjs?pageSize=${pageSize}&idMarca=${idMarca}&idLoja=${idLoja}&empresasList=${empresaLista}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&page=${page}`
      const response = await axios.get(apiUrl)
      // const response = await getVendaPixConsolidadoLoja(idMarca, idLoja, empresaLista, dataPesquisaInicio, dataPesquisaFim, page, pageSize)
      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  async getListaVendasPixPeriodo(req, res) {
    let { byId, idMarca, dataPesquisaInicio, dataPesquisaFim, dataCompInicio, dataCompFim, idLoja, empresaLista, page, pageSize } = req.query;

    try {
      byId = byId ? byId : '';
      idMarca = idMarca ? idMarca : '';
      dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
      dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
      dataCompInicio = dataCompInicio ? dataCompInicio : '';
      dataCompFim = dataCompFim ? dataCompFim : '';
      idLoja = idLoja ? idLoja : '';
      empresaLista = empresaLista ? empresaLista : '';
      page = page ? page : '';
      pageSize = pageSize ? pageSize : '';


      const apiUrl = `${url}/api/financeiro/venda-pix-periodo.xsjs?pageSize=${pageSize}&idMarca=${idMarca}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&lojas=${idLoja}&empresasList=${empresaLista}&page=${page}`
      const response = await axios.get(apiUrl)
      // const response = await getVendaPixPeriodo(byId, idMarca, dataPesquisaInicio, dataPesquisaFim, dataCompInicio, dataCompFim, idLoja, empresaLista, page, pageSize)

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  async getListaVendasEmpresa(req, res) {
    let { idEmpresa, dataPesquisa, page, pageSize } = req.query;
    try {
      idEmpresa = idEmpresa ? idEmpresa : '';
      dataPesquisa = dataPesquisa ? dataPesquisa : '';
      page = page ? page : '';
      pageSize = pageSize ? pageSize : '';

      const apiUrl = `${url}/api/financeiro/venda-total-empresa.xsjs?pageSize=${pageSize}&idEmpresa=${idEmpresa}&dataPesquisa=${dataPesquisa}&page=${page}`
      const response = await axios.get(apiUrl)
      // const response = await getVendasTotalEmpresa(idEmpresa, dataPesquisa, page, pageSize);

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }
  }

  async getListaRecebimentosEletronico(req, res) {
    let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page } = req.query;

    idEmpresa = idEmpresa ? idEmpresa : '';
    dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
    dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
    page = page ? page : '';;
    pageSize = pageSize ? pageSize : '';

    try {
      const apiUrl = `${url}/api/financeiro/venda-recebido-eletronico.xsjs?pageSize=${pageSize}&page=${page}&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
      const response = await axios.get(apiUrl)
      // const response = await getVendaTotalRecebidoEleteronico(idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page)

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  async getListaRecebimentos(req, res) {
    let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page } = req.query;

    idEmpresa = idEmpresa ? idEmpresa : '';
    dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
    dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
    page = page ? page : '';;
    pageSize = pageSize ? pageSize : '';

    try {
      const apiUrl = `${url}/api/financeiro/venda-total-recebido-periodo.xsjs?pageSize=${pageSize}&page=${page}&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
      const response = await axios.get(apiUrl)
      // const response = await getVendaTotalRecebidoPeriodo(idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page)

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }
  }

  async getListaVendasMarca(req, res) {
    let { idMarca, dataPesquisaInicio, dataPesquisaFim, idEmpresa, page, pageSize } = req.query;

    idMarca = idMarca ? idMarca : '';
    idEmpresa = idEmpresa ? idEmpresa : '';
    dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
    dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
    page = page ? page : '';
    pageSize = pageSize ? pageSize : '';

    try {
      const apiUrl = `${url}/api/financeiro/venda-marca-periodo.xsjs?pageSize=1000&idMarca=${idMarca}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
      const response = await axios.get(apiUrl)
      // const response = await getVendaMarcaPeriodo(idMarca, dataPesquisaInicio, dataPesquisaFim, idEmpresa, page, pageSize)

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

   async getListaVendasTotalMes(req, res) {
    let { dataPesquisaInicio, dataPesquisaFim, horaFinal, page, pageSize } = req.query;

      dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
      dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
      horaFinal = horaFinal ? horaFinal : '';
      page = page ? page : '';
      pageSize = pageSize ? pageSize : '';
    try {
      const apiUrl = `${url}/api/financeiro/venda-total-mes.xsjs?dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisa=${dataPesquisaFim}&horaFinal=${horaFinal}`
      const response = await axios.get(apiUrl)
      // const response = await getVendaTotalMes(dataPesquisaInicio, dataPesquisaFim, page, pageSize)
      return res.json(response.data);
    } catch (error) {
      console.error("erro ao buscar vendas totais por mes: no controller Vendas", error);
      throw error;
    }
  }

  async putListaVendaPixStatusConferido(req, res) {
    try {
      const vendas = Array.isArray(req.body) ? req.body : [req.body];
      // const response = await putVendaPixStatusConferido(vendas);
      const response = await axios.post(`${url}/api/financeiro/venda-pix-periodo-status-conferido.xsjs`, vendas);
      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      return res.status(500).json({ error: error.message });
    }
  }


}

export default new FinanceiroVendasControllers();