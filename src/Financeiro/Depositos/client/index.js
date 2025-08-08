import axios from 'axios';
import 'dotenv/config';
const url = process.env.API_URL;

export class DepositoClient {
    constructor(baseURL) {
        this.api = axios.create({
            baseURL: baseURL || url
        });
    }
    async cancelarDeposito(IDDEPOSITOLOJA) {
        
        const response = await this.api.put('/api/financeiro/atualizar-deposito-loja.xsjs', IDDEPOSITOLOJA);
        return response.data;
    }
}