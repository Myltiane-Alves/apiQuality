import axios from 'axios';
import 'dotenv/config';
const url = process.env.API_URL;

export class OTClient {
    constructor(baseURL) {
        this.api = axios.create({
            baseURL: baseURL || url
        });
    }
    async criarOT(IDDEPOSITOLOJA) {
        
        const response = await this.api.post(`api/expedicao/resumo-ordem-transferencia.xsjs`, IDDEPOSITOLOJA);
        return response.data;
    }
    async atualizarOT(IDRESUMOOT) {

        const response = await this.api.put(`api/expedicao/resumo-ordem-transferencia.xsjs`, IDDEPOSITOLOJA);
        return response.data;
    }
}