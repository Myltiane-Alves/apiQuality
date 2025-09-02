import axios from 'axios';
import 'dotenv/config';
const url = process.env.API_URL;

export class DetalheBalancoClient {
    constructor(baseURL) {
       this.api = axios.create({
            baseURL: baseURL || url,
            timeout: 80000
       }); 
    }

 

    async atualizarDetalheBalancoAvulso(
        IDEMPRESA,
        NUMEROCOLETOR,
        DSCOLETOR,
        IDPRODUTO,
        CODIGODEBARRAS,
        DSPRODUTO,
        TOTALCONTAGEMGERAL,
        PRECOCUSTO,
        PRECOVENDA,
        STCANCELADO,
        INSBALANCO
    ) {
        const response = await this.api.put(`${url}/api/administrativo/detalhe-balanco-avulso.xsjs`,{
            IDEMPRESA,
            NUMEROCOLETOR,
            DSCOLETOR,
            IDPRODUTO,
            CODIGODEBARRAS,
            DSPRODUTO,
            TOTALCONTAGEMGERAL,
            PRECOCUSTO,
            PRECOVENDA,
            STCANCELADO,
            INSBALANCO
        });

        return response.data;
    }

    async criarDetalheBalanco(
        CODIGODEBARRAS,
        DSCOLETOR,
        DSPRODUTO,
        IDEMPRESA,
        IDPRODUTO,
        INSBALANCO,
        NUMEROCOLETOR,
        PRECOCUSTO,
        PRECOVENDA,
        STCANCELADO,
        TOTALCONTAGEMGERAL
    ) {
        const response = await this.api.post(`${url}/api/administrativo/detalhe-balanco-avulso.xsjs`, {
            CODIGODEBARRAS,
            DSCOLETOR,
            DSPRODUTO,
            IDEMPRESA,
            IDPRODUTO,
            INSBALANCO,
            NUMEROCOLETOR,
            PRECOCUSTO,
            PRECOVENDA,
            STCANCELADO,
            TOTALCONTAGEMGERAL
        });
        return response.data;
    }
}