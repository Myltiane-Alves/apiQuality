import axios from 'axios';
import 'dotenv/config';
const url = process.env.API_URL;

export class DepositoClient {
    constructor(baseURL){
        this.client = axios.create({
            baseURL: baseURL || url,
            timeout: 80000
        });
    }

    async criarDeposito(
        DTDEPOSITO,
        DTMOVIMENTOCAIXA,
        IDEMPRESA,
        IDUSR,
        IDCONTABANCO,
        VRDEPOSITO,
        DSHISTORIO,
        NUDOCDEPOSITO,
        DSPATHDOCDEPOSITO,
        STATIVO,
        STCANCELADO,
        IDUSRCACELAMENTO,
        DSMOTIVOCANCELAMENTO,
    ) {
        const response = await this.client.post(`${url}/api/deposito-loja/todos.xsjs`, {
            DTDEPOSITO,
            DTMOVIMENTOCAIXA,
            IDEMPRESA,
            IDUSR,
            IDCONTABANCO,
            VRDEPOSITO,
            DSHISTORIO,
            NUDOCDEPOSITO,
            DSPATHDOCDEPOSITO,
            STATIVO,
            STCANCELADO,
            IDUSRCACELAMENTO,
            DSMOTIVOCANCELAMENTO,
        });

        return response.data;
    }

    async atualizarDeposito(
        IDDEPOSITOLOJA,
        IDEMPRESA,
        IDUSR,
        IDCONTABANCO,
        DTDEPOSITO,
        DTMOVIMENTOCAIXA,
        DSHISTORIO,
        NUDOCDEPOSITO,
        VRDEPOSITO,
        STATIVO,
        STCANCELADO
    ) {
        const response = await this.client.post(`${url}/api/deposito-loja/todos.xsjs`, {
            IDDEPOSITOLOJA,
            IDEMPRESA,
            IDUSR,
            IDCONTABANCO,
            DTDEPOSITO,
            DTMOVIMENTOCAIXA,
            DSHISTORIO,
            NUDOCDEPOSITO,
            VRDEPOSITO,
            STATIVO,
            STCANCELADO
        });

        return response.data;
    }
}