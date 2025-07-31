
import axios from "axios";
import { dataFormatada } from "../../../utils/dataFormatada.js";
import { getResumoVoucher } from "../repositories/resumoVoucher.js";
import 'dotenv/config';
const url = process.env.API_URL;


class VoucherControllers {
  async getListaResumoVoucherFinanceiro(req, res) {
    let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page } = req.query;

    idEmpresa = idEmpresa ? idEmpresa : '';
    dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
    dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
    pageSize = pageSize ? pageSize : '';
    page = page ? page : '';
    try {
      const apiUrl = `${url}/api/financeiro/resumo-voucher.xsjs?page=${page}&pageSize=${pageSize}&idEmpresa=${idEmpresa}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`

      const response = await axios.get(apiUrl);
      // const response = await getResumoVoucher(idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page)

      return res.json(response.data);
    } catch (error) {
      console.error("Unable to connect to the database:", error);
      throw error;
    }
  }
}

export default new VoucherControllers();