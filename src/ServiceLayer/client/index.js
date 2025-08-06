import axios from 'axios';
import 'dotenv/config';
const url = process.env.API_URL;

// let url = `http://164.152.245.77:8000/quality/concentrador_node`;

export class ServiceLayerClient {
    constructor(baseURL) {
        this.api = axios.create({
            baseURL: baseURL || url,
            timeout: 80000,
        });
    }
    async integrarDeposito(IDDEPOSITOLOJA) {
        console.log('IDDEPOSITOLOJA recebido no client:', IDDEPOSITOLOJA);
        return this.api.post(`${url}/api/service-layer/deposito/jobs/depositos-integracao.xsjs`, { IDDEPOSITOLOJA });
    }
}

// export default new ServiceLayerClient();