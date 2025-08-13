import axios from 'axios';
import 'dotenv/config';
const url = process.env.API_URL;
export class VendasClient {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }

    async atualizarVendaPagamento(IDVENDA, STCANCELADO, DTULTIMAALTERACAO, IDFUNCIONARIOCANCELA, TXTMOTIVOCANCELA) {
        const response = await this.api.put(`${url}/api/administrativo/altera-venda-pagamento.xsjs`, {
            STCANCELADO,
            DTULTIMAALTERACAO,
            IDFUNCIONARIOCANCELA,
            TXTMOTIVOCANCELA
        });
        return response.data;
    }
}
