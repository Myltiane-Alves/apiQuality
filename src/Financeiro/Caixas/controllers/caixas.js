
import axios from "axios";
// import { getListaPCJById } from "../repositories/listaCaixaMovimentos.js";
// import { getCaixaStatus } from "../repositories/listaCaixaStatus.js";
// import { getCaixaZerados } from "../repositories/listaCaixaZerados.js";
// import { putFecharCaixaZerados } from "../repositories/fechaCaixaZerados.js";
import { dataFormatada } from "../../../utils/dataFormatada.js";
import 'dotenv/config';
const url = process.env.API_URL|| 'localhost:6001'


class CaixasControllers {
    async getListaCaixasMovmentoFinanceiro(req, res) {
        let {idMarca, dataPesquisaInicio, dataPesquisaFim, idLoja, idLojaPesquisa, page, pageSize } = req.query;
    
        idMarca = idMarca ? idMarca : '';
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
        idLoja = idLoja ? idLoja : '';
        idLojaPesquisa = idLojaPesquisa ? idLojaPesquisa : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        try {
          
          const apiUrl = `${url}/api/financeiro/lista-caixas-movimento.xsjs?idMarca=${idMarca}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idLoja=${idLoja}&idLojaPesq=${idLojaPesquisa}&page=${page}&pageSize=${pageSize}`
          const response = await axios.get(apiUrl)
          // const response = await getListaPCJById(idMarca, dataPesquisaInicio, dataPesquisaFim, idLoja)
          
          return res.json(response.data); // Retorna
        } catch (error) {
          console.error("Unable to connect to the database:", error);
          throw error;
        }
    
    }

    async getListaCaixaStatus(req, res) {
        let { idEmpresa, idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;
    
        idEmpresa = idEmpresa ? idEmpresa : '';
        idMarca = idMarca ? idMarca : '';
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : ''
        try {
          const apiUrl = `${url}/api/financeiro/lista-caixas-status.xsjs?page=${page}&pageSize=${pageSize}&idMarca=${idMarca}&idEmpresa=${idEmpresa}&dataInicial=${dataPesquisaInicio}&dataFinal=${dataPesquisaFim}`
          const response = await axios.get(apiUrl)
          // const response = await getCaixaStatus(idEmpresa, idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize)
    
          
          return res.json(response.data);
        } catch (error) {
          console.error("Unable to connect to the database:", error);
          throw error;
        }
    
    }

    async getListaCaixaZerados(req, res) {
      let { idEmpresa, idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;
        idEmpresa = idEmpresa ? idEmpresa : '';
        idMarca = idMarca ? idMarca : '';
        dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataFormatada(dataPesquisaInicio) : '';
        dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataFormatada(dataPesquisaFim) : '';
        page = page ? page : ''
        pageSize = pageSize ? pageSize : ''
      try {
          
        const apiUrl = `${url}/api/financeiro/lista-caixas-zerados.xsjs?page=${page}&pageSize=${pageSize}&idMarca=${idMarca}&idEmpresa=${idEmpresa}&dataInicial=${dataPesquisaInicio}&dataFinal=${dataPesquisaFim}`
        const response = await axios.get(apiUrl)
        // const response = await getCaixaZerados(idEmpresa, idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize)
  
        return res.json(response.data);
      } catch (error) {
        console.error("Unable to connect to the database:", error);
        throw error;
      }
    
    }


    

    async updateFecharCaixaZerado(req, res) {
      let { ID } = req.body;
  
      try {
        const response = await axios.put(`${url}/api/financeiro/fecha-caixas-zerados.xsjs`, {
          ID
        });
        return res.json(response.data);
      } catch (error) {
        console.error("Erro no CaixasControllers.updateFecharCaixaZerado:", error);
        throw error;
      }
    }
}

export default new CaixasControllers();