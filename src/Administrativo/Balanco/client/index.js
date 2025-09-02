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

    async confirmarConsolidarBalanco(
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
    //    return  console.log(IDEMPRESA,
    //     NUMEROCOLETOR,
    //     DSCOLETOR,
    //     IDPRODUTO,
    //     CODIGODEBARRAS,
    //     DSPRODUTO,
    //     TOTALCONTAGEMGERAL,
    //     PRECOCUSTO,
    //     PRECOVENDA,
    //     STCANCELADO,
    //     INSBALANCO)

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
}