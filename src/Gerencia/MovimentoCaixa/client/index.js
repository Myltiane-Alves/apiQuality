import axios from 'axios';
import 'dotenv/config';
const url = process.env.API_URL;

export class MovimentoCaixaClient {
    constructor(baseURL) {
        this.api = axios.create({
            baseURL: baseURL || url,
            timeout: 80000
        });
    }

    async atuaizarStatus(IDSUPERVISOR, STCONFERIDO, ID) {
        const response = await this.api.put(`${url}/api/movimento-caixa/atualizacao-status.xsjs`, {
            IDSUPERVISOR,
            STCONFERIDO,
            ID,
        })

        return response.data;
    }
}