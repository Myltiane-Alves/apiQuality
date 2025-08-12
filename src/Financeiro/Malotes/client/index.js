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

    
    async atualizarMalote(IDMALOTE, STATUS, OBSERVACAOADMINISTRATIVO, PENDENCIAS, IDUSERULTIMAALTERACAO) {

        const response = await this.api.put(`${url}/api/financeiro/malotes-por-loja.xsjs`, {
          IDMALOTE,
          STATUS,
          OBSERVACAOADMINISTRATIVO,
          PENDENCIAS,
          IDUSERULTIMAALTERACAO
        });
     
        return response.data;
    }
}
