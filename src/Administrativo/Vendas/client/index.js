import axios from 'axios';
import 'dotenv/config';
const url = process.env.API_URL;
export class VendasClient {
    constructor(baseURL) {
        this.api = axios.create({
            baseURL: baseURL || url,
            timeout: 80000
        });
    }

    async atualizarVendaPagamento(IDVENDA, STCANCELADO, DTULTIMAALTERACAO, IDFUNCIONARIOCANCELA, TXTMOTIVOCANCELA) {
        const response = await this.api.put(`${url}/api/administrativo/altera-venda-pagamento.xsjs`, {
            IDVENDA,
            STCANCELADO,
            DTULTIMAALTERACAO,
            IDFUNCIONARIOCANCELA,
            TXTMOTIVOCANCELA
        });
        return response.data;
    }
}
