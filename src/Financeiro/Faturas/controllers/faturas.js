
import axios from "axios";
import { dataFormatada } from "../../../utils/dataFormatada.js";
import { getFaturaPixPeriodo } from "../repositories/faturaPixPeriodo.js";
import { getVendaFaturaPixPeriodo, getVendaFaturaPixPeriodoCompensada, putVendaPixStatusConferido } from "../repositories/vendaTotalFaturaPixPeriodoEmpresa.js";
import { getDetalheFatura } from "../repositories/detalheFatura.js";
import { putAtualizarFatura, putAtualizarRecompra } from "../repositories/FaturaLoja/faturaLoja.js";
import { getFaturaPixPeriodoConsolidado } from "../repositories/faturaPixPeriodoConsolidado.js";

import 'dotenv/config';
const url = process.env.API_URL|| 'localhost:6001'

class FaturasControllers {
  async getListaFaturasPixPeriodo(req, res) {
    let { idMarca, dataPesquisaInicio, dataPesquisaFim, idLojaPesquisa, empresaLista, page, pageSize } = req.query;

    idMarca = idMarca ? idMarca : '';
    dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
    dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
    idLojaPesquisa = idLojaPesquisa ? idLojaPesquisa : '';
    empresaLista = empresaLista ? empresaLista : '';
    page = page ? page : '';
    pageSize = pageSize ? pageSize : '';
    try {
      const apiUrl = `${url}/api/financeiro/fatura-pix-periodo.xsjs?idMarca=${idMarca}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idLojaPesquisa=${idLojaPesquisa}&empresaLista=${empresaLista}&page=${page}&pageSize=${pageSize}`;
      const response = await axios.get(apiUrl);
      // const response = await getFaturaPixPeriodo(idMarca, dataPesquisaInicio, dataPesquisaFim, idLojaPesquisa, empresaLista, page, pageSize)

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }
  }

  async getListaFaturasPixConsolidado2(req, res) {
    let { idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;

    idMarca = idMarca ? idMarca : '';
    dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
    dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
    page = page ? page : '';
    pageSize = pageSize ? pageSize : '';

    try {
      
      const apiUrl = `${url}/api/financeiro/fatura-pix-consolidado.xsjs?idMarca=${idMarca}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&page=${page}&pageSize=${pageSize}`;
      const response = await axios.get(apiUrl);
      // const response = await getFaturaPixPeriodoConsolidado(idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize)

      return res.json(response);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }

  }

  async getDetalheFaturaFinanceiro(req, res) {
    let { idEmpresa, idDetalheFatura, dataPesquisaInicio, dataPesquisaFim, codigoFatura,  page, pageSize} = req.query;
    
    idEmpresa = idEmpresa ? idEmpresa : '';
    idDetalheFatura = idDetalheFatura ? idDetalheFatura : '';
    dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
    dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
    codigoFatura = codigoFatura ? codigoFatura : '';
    page = page ? page : '';
    pageSize = pageSize ? pageSize : '';

    
    try {
                      
      // const apiUrl = `${url}/api/detalhe-fatura.xsjs?idEmpresa=${idEmpresa}&dataPesquisaInic=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&nuCodigoAutorizacao=${codigoFatura}&idDetalheFatura=${idDetalheFatura}&page=${page}&pageSize=${pageSize}`;
      const apiUrl = `http://164.152.245.77:8000/quality/concentrador_homologacao/api/detalhe-fatura.xsjs?idEmpresa=${idEmpresa}&dataPesquisaInic=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&nuCodigoAutorizacao=${codigoFatura}&id=${idDetalheFatura}&page=${page}&pageSize=${pageSize}`;
      const response = await axios.get(apiUrl);
      // const response = await getDetalheFatura(idEmpresa, dataPesquisaInicio, dataPesquisaFim, codigoFatura, idDetalheFatura, page, pageSize);

      return res.json(response.data); 
    } catch (error) {
      console.error("Erro no FaturasController.getDetalheFaturaFinanceiro:", error);
      throw error;
    }
    
  }

  async getPreviaFaturasConsolidadas(req, res) {
    let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize} = req.query;
    
    idEmpresa = idEmpresa ? idEmpresa : '';
    dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
    dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
    page = page ? page : '';
    pageSize = pageSize ? pageSize : '';

    
    try {
                      
      // const apiUrl = `${url}/api/detalhe-fatura.xsjs?idEmpresa=${idEmpresa}&dataPesquisaInic=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&nuCodigoAutorizacao=${codigoFatura}&idDetalheFatura=${idDetalheFatura}&page=${page}&pageSize=${pageSize}`;
      const apiUrl = `http://164.152.245.77:8000/quality/concentrador_homologacao/api/financeiro/previa-consolidacao-faturas.xsjs?idEmpresa=${idEmpresa}&dtInicio=${dataPesquisaInicio}&dtFim=${dataPesquisaFim}&page=${page}&pageSize=${pageSize}`;
      const response = await axios.get(apiUrl);
      // const response = await getDetalheFatura(idEmpresa, dataPesquisaInicio, dataPesquisaFim, codigoFatura, idDetalheFatura, page, pageSize);

      return res.json(response.data); 
    } catch (error) {
      console.error("Erro no FaturasController.getPreviaFaturasConsolidadas:", error);
      throw error;
    }
    
  }

  async getListaVendaFaturaPixPeriodo(req, res) {
    let { idMarca, idEmpresa, dataPesquisaInicio, dataPesquisaFim, dataCompInicio, dataCompFim, page, pageSize} = req.query;
    
    idMarca = idMarca ? idMarca : '';
    idEmpresa = idEmpresa ? idEmpresa : '';
    dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
    dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
    dataCompInicio = dataCompInicio ? dataCompInicio : '';
    dataCompFim = dataCompFim ? dataCompFim : '';
    page = page ? page : '';
    pageSize = pageSize ? pageSize : '';
    
    try {
                         // api/financeiro/venda-total-fatura-pix-empresa.xsjs?pageSize=1000&page=1&idMarca=1&idEmpresa=0&dataPesquisaInicio=2024-11-04&dataPesquisaFim=2024-11-04
      const apiUrl = `${url}/api/financeiro/venda-total-fatura-pix-empresa.xsjs?idMarca=${idMarca}&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&dataCompInicio=${dataCompInicio}&dataCompFim=${dataCompFim}&page=${page}&pageSize=${pageSize}`;
      const response = await axios.get(apiUrl);
      // const response = await getVendaFaturaPixPeriodo(idMarca, idEmpresa, dataPesquisaInicio, dataPesquisaFim, dataCompInicio, dataCompFim, page, pageSize)
      return res.json(response.data); 
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }
    
  }

  async getListaVendaFaturaPixPeriodoCompensacao(req, res) {
    let { idMarca, idEmpresa, dataCompInicio, dataCompFim, page, pageSize} = req.query;
    
    idMarca = idMarca ? idMarca : '';
    idEmpresa = idEmpresa ? idEmpresa : '';
    dataCompInicio = dataCompInicio ? dataCompInicio : '';
    dataCompFim = dataCompFim ? dataCompFim : '';
    page = page ? page : '';
    pageSize = pageSize ? pageSize : '';
    
    try {
      // http://164.152.245.77:8000/quality/concentrador_homologacao/api/financeiro/venda-total-fatura-pix-empresa-compensada.xsjs?pageSize=1000&dataPesquisaInicio=2024-12-06&dataPesquisaFim=2024-12-06&idMarca=0&idEmpresa=&page=1
      const apiUrl = `${url}/api/financeiro/venda-total-fatura-pix-empresa-compensada.xsjs?idMarca=${idMarca}&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataCompInicio}&dataPesquisaFim=${dataCompFim}&page=${page}&pageSize=${pageSize}`;
      const response = await axios.get(apiUrl);
      
      // const response = await getVendaFaturaPixPeriodoCompensada(idMarca, idEmpresa, dataCompInicio, dataCompFim, page, pageSize)
      return res.json(response.data); 
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }
    
  }
  
  async putListaFaturaVendaPixStatusConferido(req, res) {
    try {
        const vendas = Array.isArray(req.body) ? req.body : [req.body]; 
        const response = await putVendaPixStatusConferido(vendas);
        return res.json(response);
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        return res.status(500).json({ error: error.message });
    }
  }

  async putListaAtualizarRecompra(req, res) {
    try {
      let {IDDETALHEFATURA, STRECOMPRA} = req.body; 
        // const response = await putAtualizarRecompra(detalhes);
        if(!IDDETALHEFATURA) {
          return res.status(400).json({ error: "IDDETALHEFATURA is required" });
        }
        const response = await axios.put(`${url}/api/fatura-loja/atualizar-recompra.xsjs`, {
          IDDETALHEFATURA,
          STRECOMPRA
        });
        return res.status(200).json({ message: "Recompra atualizada com sucesso", data: response.data });
    } catch (error) {
        console.error("Erro no FaturasControllers.putListaAtualizarRecompra:", error);
        return res.status(500).json({ error: error.message });
    }
  }

  async putListaAtualizarFatura(req, res) {
    try {
      let { IDDETALHEFATURA, NUCODAUTORIZACAO, VRRECEBIDO } = req.body; 

      const response = await axios.put(`${url}/api/fatura-loja/atualizar.xsjs`, {
        IDDETALHEFATURA,
        NUCODAUTORIZACAO,
        VRRECEBIDO
      });
      return res.status(200).json({ message: "Fatura atualizada com sucesso"});
    } catch (error) {
        console.error("Erro no FaturasControllers.putListaAtualizarFatura:", error);
        return res.status(500).json({ error: error.message });
    }
  }

  async putConsolidacaoFatura(req, res) {
    try {
      let { IDEMPRESA, DTPROCESSAMENTO, QTDTOTALFATURAS, VRTOTALRECEBIDO, IDFUNCIONARIO } = req.body; 

      const response = await axios.put(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/financeiro/consolidacao-faturas.xsjs`, {
        IDEMPRESA,
        DTPROCESSAMENTO,
        QTDTOTALFATURAS,
        VRTOTALRECEBIDO,
        IDFUNCIONARIO
      });
      return res.status(200).json({ message: "Fatura atualizada com sucesso"});
    } catch (error) {
        console.error("Erro no FaturasControllers.putConsolidacaoFatura:", error);
        return res.status(500).json({ error: error.message });
    }
  }

  async postConsolidacaoFatura(req, res) {
    try {
      let { IDEMPRESA, DTPROCESSAMENTO, QTDTOTALFATURAS, VRTOTALRECEBIDO, IDFUNCIONARIO } = req.body; 

      const response = await axios.post(`http://164.152.245.77:8000/quality/concentrador_homologacao/api/financeiro/consolidacao-faturas.xsjs`, {
        IDEMPRESA,
        DTPROCESSAMENTO,
        QTDTOTALFATURAS,
        VRTOTALRECEBIDO,
        IDFUNCIONARIO
      });
      return res.status(200).json({ message: "Fatura atualizada com sucesso"});
    } catch (error) {
        console.error("Erro no FaturasControllers.postConsolidacaoFatura:", error);
        return res.status(500).json({ error: error.message });
    }
  }

}

export default new FaturasControllers();