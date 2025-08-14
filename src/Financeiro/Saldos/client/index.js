import axios from "axios";
import 'dotenv/config';
const url = process.env.API_URL;

export class SaldosClient {
  constructor(baseURL) {
    this.api = axios.create({
      baseURL: baseURL || url,
      timeout: 80000
    });
  }

  async getExtratoBonificacaoById(idFuncionario, page, pageSize) {
    const response = await this.api.get(`${url}/api/financeiro/movimento-saldo-bonificacao.xsjs`, {
      params: { idFuncionario, page, pageSize }
    });
    return response.data;
  }

  async getSaldoExtratoLoja(idGrupoEmpresarial, dataPesquisa, pageSize, page) {
    const response = await this.api.get(`${url}/api/financeiro/saldo-loja-por-grupo.xsjs`, {
      params: { idGrupoEmpresarial, dataPesquisa, pageSize, page }
    });
    return response.data;
  }

  async criarMovimentoSaldoBonificacao(
    IDFUNCIONARIO,
    TIPOMOVIMENTO,
    VRMOVIMENTO,
    OBSERVACAO,
    IDFUNCIONARIORESP
  ) {
    const response = await this.api.post(`${url}/api/financeiro/movimento-saldo-bonificacao.xsjs`, {
      IDFUNCIONARIO,
      TIPOMOVIMENTO,
      VRMOVIMENTO,
      OBSERVACAO,
      IDFUNCIONARIORESP
    });
    return response.data;
  }
}
