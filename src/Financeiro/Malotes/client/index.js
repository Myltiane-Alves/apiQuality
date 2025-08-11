import axios from 'axios';
import 'dotenv/config';
const url = process.env.API_URL;

export class MaloteClient {
    constructor(baseURL) {
        this.api = axios.create({
            baseURL: baseURL || url,
            timeout: 80000
        });
    }

    
    async atualizarMalote(IDMALOTE, IDUSERULTIMAALTERACAO, STATUS, OBSERVACAOADMINISTRATIVO, PENDENCIAS) {
        // console.log(IDMALOTE, IDUSERULTIMAALTERACAO, STATUS, OBSERVACAOADMINISTRATIVO, PENDENCIAS, 'CLIENT')
        const response = await this.api.put(`${url}/api/financeiro/malotes-por-loja.xsjs`, 
            IDMALOTE,
            IDUSERULTIMAALTERACAO,
            STATUS,
            OBSERVACAOADMINISTRATIVO,
            PENDENCIAS
        );
        console.log(response.data, 'CLIENT');
        return response.data;
    }
}
