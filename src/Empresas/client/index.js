import axios from 'axios';
import 'dotenv/config';

const url = process.env.API_URL;

export class EmpresaClient {
    constructor(baseURL) {
        this.api = axios.create({
            baseURL: baseURL || url,
            timeout: 80000
        });

    }

    async atualizarEmpresa(
        STGRUPOEMPRESARIAL,
        IDGRUPOEMPRESARIAL,
        IDSUBGRUPOEMPRESARIAL,
        NORAZAOSOCIAL,
        NOFANTASIA,
        NUCNPJ,
        NUINSCESTADUAL,
        NUINSCMUNICIPAL,
        CNAE,
        EENDERECO,
        ECOMPLEMENTO,
        EBAIRRO,
        ECIDADE,
        SGUF,
        NUUF,
        NUCEP,
        NUIBGE,
        EEMAILPRINCIPAL,
        EEMAILCOMERCIAL,
        EEMAILFINANCEIRO,
        EEMAILCONTABILIDADE,
        NUTELPUBLICO,
        NUTELCOMERCIAL,
        NUTELFINANCEIRO,
        NUTELGERENCIA,
        EURL,
        PATHIMG,
        NUCNAE,
        STECOMMERCE,
        DTULTATUALIZACAO,
        STATIVO,
        ALIQPIS,
        ALIQCOFINS,
        IDEMPRESA,
    ) {

        const response = await this.api.put(`${url}/api/empresa.xsjs`, {
            STGRUPOEMPRESARIAL,
            IDGRUPOEMPRESARIAL,
            IDSUBGRUPOEMPRESARIAL,
            NORAZAOSOCIAL,
            NOFANTASIA,
            NUCNPJ,
            NUINSCESTADUAL,
            NUINSCMUNICIPAL,
            CNAE,
            EENDERECO,
            ECOMPLEMENTO,
            EBAIRRO,
            ECIDADE,
            SGUF,
            NUUF,
            NUCEP,
            NUIBGE,
            EEMAILPRINCIPAL,
            EEMAILCOMERCIAL,
            EEMAILFINANCEIRO,
            EEMAILCONTABILIDADE,
            NUTELPUBLICO,
            NUTELCOMERCIAL,
            NUTELFINANCEIRO,
            NUTELGERENCIA,
            EURL,
            PATHIMG,
            NUCNAE,
            STECOMMERCE,
            DTULTATUALIZACAO,
            STATIVO,
            ALIQPIS,
            ALIQCOFINS,
            IDEMPRESA,
        })
        return response.data;
    }
}