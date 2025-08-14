import axios from 'axios';
import 'dotenv/config';
const url = process.env.API_URL;

export class MotivoDevolucaoClient {
    constructor(baseURL) {
        this.client = axios.create({
            baseURL: baseURL || url,
            timeout: 80000
        });
    }

    async criarMotivo(data) {
        
        const response = await this.client.post('/motivo-devolucao', {
            
        });
        return response.data;
     
    }
}