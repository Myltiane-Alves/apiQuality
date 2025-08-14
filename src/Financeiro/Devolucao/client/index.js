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

    async criarMotivo(IDUSUARIO, DSMOTIVO) {
        
        const response = await this.client.post(`${url}/api/financeiro/motivo-devolucao.xsjs`, {
            IDUSUARIO, 
            DSMOTIVO
        });
        return response.data;
     
    }

    async atualizarMotivoDevolucao(DSMOTIVO, STATIVO, IDUSUARIO, IDMOTIVODEVOLUCAO) {
        const response = await this.client.put(`${url}/api/financeiro/motivo-devolucao.xsjs`, {
            DSMOTIVO,
            STATIVO,
            IDUSUARIO,
            IDMOTIVODEVOLUCAO,
        });
  
        return response.data;
    }
}