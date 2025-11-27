
import axios from "axios";
import { dataFormatada } from "../../../utils/dataFormatada.js";
import { getPrimeiraVendaSaldoAtual } from "../repositories/extratoLojaPeriodo.js";
import { getAjusteExtrato, updateAjusteExtrato } from "../repositories/ajusteExtrato.js";

import 'dotenv/config';
const url = process.env.API_URL;


class ExtratosControllers {
  async getListaExtratoDaLojaPeriodoFinanceiro(req, res) {
    let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;


    idEmpresa = idEmpresa ? idEmpresa : '';
    dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
    dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
    page = page ? page : '';
    pageSize = pageSize ? pageSize : '';

    try {
      const apiUrl = `${url}/api/financeiro/extrato-loja-periodo.xsjs?idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&page=${page}&pageSize=${pageSize}`
      // const response = await getListaTotal(idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize)
      const response = await axios.get(apiUrl)
      
      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }


  async putListaAjusteExtrato(req, res) {
    try {
      const extratos = Array.isArray(req.body) ? req.body : [req.body];
      const response = await updateAjusteExtrato(extratos);
      return res.json(response);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      return res.status(500).json({ error: error.message });
    }
  }
  async postListaAjusteExtrato(req, res) {
    try {
      let {
        IDEMPRESA,
        HISTORICO,
        VRDEBITO,
        VRCREDITO,
        STATIVO,
        STCANCELADO,
        IDOPERADOR,
        DATACADASTRO,
      } = req.body;
      const response = await axios.post(`${url}/api/financeiro/ajuste-extrato.xsjs`, {
        IDEMPRESA,
        HISTORICO,
        VRDEBITO,
        VRCREDITO,
        STATIVO,
        STCANCELADO,
        IDOPERADOR,
        DATACADASTRO,
      });
      return res.status(201).json(response.data);
    } catch (error) {
      console.error("Erroor no servidor", error);
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new ExtratosControllers();