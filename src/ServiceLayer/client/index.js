import axios from 'axios';
import 'dotenv/config';
const url = process.env.API_URL;

export class ServiceLayerClient {
    constructor(baseURL) {
        this.api = axios.create({
            baseURL: baseURL || url,
            timeout: 80000,
        });
    }
    async integrarDeposito(IDDEPOSITOLOJA) {
        const response = await this.api.post(`${url}/api/service-layer/deposito/jobs/depositos-integracao.xsjs`, IDDEPOSITOLOJA);
        return response.data;
    }
}