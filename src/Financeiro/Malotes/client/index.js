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

    async updateMalote(IDMALOTE, IDUSERULTIMAALTERACAO, STATUS, OBSERVACAOADMINISTRATIVO, PENDENCIAS) {
        const response = await this.api.put(`${url}/api/financeiro/malotes-por-loja.xsjs`, {
            IDMALOTE,
            IDUSERULTIMAALTERACAO,
            STATUS,
            OBSERVACAOADMINISTRATIVO,
            PENDENCIAS
        });

        return response.data;
    }
}
