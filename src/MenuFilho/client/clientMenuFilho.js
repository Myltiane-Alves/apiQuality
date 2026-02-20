import axios from 'axios';
import 'dotenv/config';
const url = process.env.API_URL;


export class MenuFilhoClient {
    constructor(baseURL) {
        this.api = axios.create({
            baseURL: baseURL || url,
            timeout: 80000
        });
    }

    async criarMenuFilho(
        DSNOME,
        IDMENUPAI,
        URL
    ) {
        const response = await this.api.post(`${url}/api/perfilUsuario/menuFilhos.xsjs`, {
            DSNOME,
            IDMENUPAI,
            URL
        })
        return response.data;
    }
}