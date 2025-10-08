import axios from 'axios';
import 'dotenv/config';
const url = process.env.API_URL;

export class RelatorioClient {
    constructor(baseURL) {
        this.api = axios.create({
            baseURL: baseURL || url,
            timeout: 80000
        });
    }

    async criarLinkRelatoioBI(IDRELATORIOBI, IDEMPRESA, LINK, STATIVO) {
    const response = await this.api.post(`/criarlinkRelatorioBI`, {
        IDRELATORIOBI,
        IDEMPRESA,
        LINK,
        STATIVO
    })

    return response.data
        
    }

    async atualizarRelatorio(IDRELATORIOBI, IDEMPRESA, LINK, STATIVO){
    const response = await this.api.put(`/atualizarRelatorio`,{
        IDRELATORIOBI,
        IDEMPRESA,
        LINK,
        STATIVO
    })
        return response.data
    }

}
 