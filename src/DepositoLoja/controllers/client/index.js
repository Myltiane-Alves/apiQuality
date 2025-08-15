import axios from 'axios';
import 'dotenv/config';
const url = process.env.API_URL;

export class DepositoLojaClient {
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

    }
}