import axios from 'axios';
import 'dotenv/config';
const url = process.env.API_URL;

export class BalancoClient {
    constructor(baseURL) {
       this.api = axios.create({
            baseURL: baseURL || url,
            timeout: 80000
       }); 
    }

    async ConfirmarConsolidarBalanco(
        IDRESUMOBALANCO,
        OBSCONTAGEM,
        OBSDIVERGENCIACONTAGEM,
        OBSDIVERGENCIAGERENTE
    ) {
        const response = await this.api.put(`${url}/api/administrativo/confirmar-consolidar-balanco.xsjs`, [{
            IDRESUMOBALANCO,
            OBSCONTAGEM,
            OBSDIVERGENCIACONTAGEM,
            OBSDIVERGENCIAGERENTE
        }]);

        return response.data;
    }
}