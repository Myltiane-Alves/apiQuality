import axios from "axios";
import { dataFormatada } from "../../utils/dataFormatada.js";
import 'dotenv/config';
const url = process.env.API_URL;

class DetalheFaturasControllers {

  async getDetalheFatura(req, res) {

    let { idEmpresa, page, pageSize, dataPesquisaInicio, dataPesquisaFim, } = req.query;
    if (!isNaN(idEmpresa)) {
      idEmpresa = Number(idEmpresa);
      dataPesquisaInicio = dataFormatada(dataPesquisaInicio) ? dataPesquisaInicio : '';
      dataPesquisaFim = dataFormatada(dataPesquisaFim) ? dataPesquisaFim : '';
      page = page ? page : '';
      pageSize = pageSize ? pageSize : '';


      try {
        const apiUrl = `${url}/api/detalhe-fatura.xsjs?idEmpresa=${idEmpresa}&dataPesquisaInic=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
        const response = await axios.get(apiUrl)

        return res.json(response.data); // Retorna
      } catch (error) {
        console.error("Unable to connect to the database:", error);
        throw error;
      }
    }
  }

  // async getDetalheFaturaFinanceiro(req, res) {
  //     let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, codigoFatura,  page, pageSize} = req.query;

  //     idEmpresa = idEmpresa ? idEmpresa : '';
  //     dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
  //     dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
  //     codigoFatura = codigoFatura ? codigoFatura : '';
  //     page = page ? page : '';
  //     pageSize = pageSize ? pageSize : '';


  //     try {

  //         const response = await getDetalheFatura(idEmpresa, dataPesquisaInicio, dataPesquisaFim, codigoFatura,  page, pageSize)
  //         return res.json(response); 
  //     } catch (error) {
  //         console.error("Unable to connect to the database:", error);
  //         throw error;
  //     }

  // }

  async getDetalheFaturaById(req, res) {
    let { idFatura } = req.query;

    try {
      const apiUrl = `${url}/api/detalhe-fatura.xsjs?id=${idFatura}`
      const response = await axios.get(apiUrl)
      // const response = await getDetalheFaturaId(idFatura)

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  async updateFatura(req, res) {
    try {
      const despesas = Array.isArray(req.body) ? req.body : [req.body];
      //   const apiUrl = `${url}/api/financeiro/atualizar-fatura.xsjs`
      const response = await axios.put(`${url}/api/financeiro/atualizar-fatura.xsjs`, despesas);
      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }
  }

  async postDetalheFaturaLoja(req, res) {
    try {
      let {
        IDEMPRESA,
        IDFUNCIONARIO,
        IDDETALHEFATURALOCAL,
        IDCAIXAWEB,
        IDCAIXALOCAL,
        NUESTABELECIMENTO,
        NUCARTAO,
        DTPROCESSAMENTO,
        HRPROCESSAMENTO,
        NUNSU,
        NUNSUHOST,
        IDMOVIMENTOCAIXAWEB,
        NUCODAUTORIZACAO,
        VRRECEBIDO,
        DTHRMIGRACAO,
        STCANCELADO,
        IDUSRCACELAMENTO
      } = req.body;

      if(!IDEMPRESA) {
        return res.status(400).json({ error: "IDEMPRESA is required" });
      }

      if(!IDFUNCIONARIO) {
        return res.status(400).json({ error: "IDFUNCIONARIO is required" });
      }

      if(!NUCODAUTORIZACAO) {
        return res.status(400).json({ error: "NUCODAUTORIZACAO is required" });
      }
      // const response = await createDetalheFatura(detalhes);
      const response = await axios.post(`${url}/api/detalhe-fatura.xsjs`, {
        IDEMPRESA,
        IDFUNCIONARIO,
        IDDETALHEFATURALOCAL,
        IDCAIXAWEB,
        IDCAIXALOCAL,
        NUESTABELECIMENTO,
        NUCARTAO,
        DTPROCESSAMENTO,
        HRPROCESSAMENTO,
        NUNSU,
        NUNSUHOST,
        IDMOVIMENTOCAIXAWEB,
        NUCODAUTORIZACAO,
        VRRECEBIDO,
        DTHRMIGRACAO,
        STCANCELADO,
        IDUSRCACELAMENTO
      });
      return res.status(201).json({ message: "Detalhe Fatura created successfully" });
    } catch (error) {
      console.error("Erro no DetalheFaturasControllers.postDetalheFatura:", error);
      return res.status(500).json({ error: error.message });
    }
  }
  async putDetalheFaturaLoja(req, res) {
    try {
      let {IDDETALHEFATURA, TXTMOTIVOCANCELAMENTO, STCANCELADO, IDUSRCACELAMENTO } = req.body;
      // const response = await createDetalheFatura(detalhes);

      if(!IDDETALHEFATURA) {
        return res.status(400).json({ error: "IDDETALHEFATURA is required" });
      }

      if(!TXTMOTIVOCANCELAMENTO) {
        return res.status(400).json({ error: "TXTMOTIVOCANCELAMENTO is required" });
      }

      if(!STCANCELADO) {
        return res.status(400).json({ error: "STCANCELADO is required" });
      }

      if(!IDUSRCACELAMENTO) {
        return res.status(400).json({ error: "IDUSRCACELAMENTO is required" }); 
      }

      const response = await axios.put(`${url}/api/fatura-loja/detalhe-fatura.xsjs`, {
        IDDETALHEFATURA,
        TXTMOTIVOCANCELAMENTO,
        STCANCELADO,
        IDUSRCACELAMENTO,
      });
      return res.status(200).json({ message: "Detalhe Fatura atualizada com sucesso", data: response.data });
    } catch (error) {
      console.error("Erro no DetalheFaturasControllers.putDetalheFatura:", error);
      return res.status(500).json({ error: error.message });
    }
  }

}

export default new DetalheFaturasControllers();