
import axios from "axios";
import { dataFormatada } from "../../../utils/dataFormatada.js";

import { getMovimentoSaldoBonificacaoById, postMovimentoSaldoBonificacao } from "../repositories/movimentoSaldoBonificacao.js";
import { getLojaSaldoPorGrupo } from "../repositories/saldoLojaPorGrupo.js";
import 'dotenv/config';
import { SaldosClient } from "../client/index.js";
import { SaldoService } from "../services/index.js";
import criarMotivoDevolucaoSchema from  '../schema/criarMotivoDevolucaoSchema.js';
const url = process.env.API_URL;
const saldoClient = new SaldosClient(process.env.API_URL);
const saldoService = new SaldoService(saldoClient);
class SaldosControllers {
  async getListaExtratoBonificacaoById(req, res) {
    let { idFuncionario, page, pageSize } = req.query;
    idFuncionario = idFuncionario ? idFuncionario : '';
    page = page ? page : '';
    pageSize = pageSize ? pageSize : '';
    try {
      const apiUrl = `${url}/api/financeiro/movimento-saldo-bonificacao.xsjs?page=${page}&pageSize=${pageSize}&idFuncionario=${idFuncionario}`
      const response = await axios.get(apiUrl)
      // const response = await getMovimentoSaldoBonificacaoById(idFuncionario,  page, pageSize)

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }
  }

  async getListaSaldoExtratoLoja(req, res) {
    let { idGrupoEmpresarial, dataPesquisa, pageSize, page } = req.query;
    idGrupoEmpresarial = idGrupoEmpresarial ? idGrupoEmpresarial : '';
    try {
      const apiUrl = `${url}/api/financeiro/saldo-loja-por-grupo.xsjs?idGrupoEmpresarial=${idGrupoEmpresarial}&dataPesquisa=${dataPesquisa}&pageSize=${pageSize}&page=${page}`
      const response = await axios.get(apiUrl)

      // const response = await getLojaSaldoPorGrupo(idGrupoEmpresarial, dataPesquisa, pageSize, page)

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }
  }


  async createMovimentoSaldoBonificacao(req, res) {
    // let { IDFUNCIONARIO, TIPOMOVIMENTO, VRMOVIMENTO, OBSERVACAO, IDFUNCIONARIORESP } = req.body;


    try {
      const { error, value } = criarMotivoDevolucaoSchema.validate(req.body, { 
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


      const response = await saldoService.createMovimentoSaldoBonificacao(
        value.IDFUNCIONARIO,
        value.TIPOMOVIMENTO,
        value.VRMOVIMENTO,
        value.OBSERVACAO,
        value.IDFUNCIONARIORESP
      );
     
      return res.status(200).json(response);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      return res.status(500).json({
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

export default new SaldosControllers();