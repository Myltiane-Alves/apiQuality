
import axios from 'axios';
import 'dotenv/config';
const url = process.env.API_URL;
export class CaixaClient {
    constructor(baseURL) {
        this.api = axios.create({
            baseURL: baseURL || url,
            timeout: 80000
        });
    }
    async criarCaixa(
        IDEMPRESA,
        DSCAIXA,
        NUULTNFCE,
        NUSERIE,
        TBEMISSAOFISCAL,
        NOIMPRESSORA,
        NULINHAIMPRESSORA,
        DSPORTACOMUNICACAO,
        NUBAUD,
        NULINHAENTRECUPOM,
        STIMPRIMIRUMITEMPORLINHA,
        STDANFCERESUMIDO,
        STIGNORARTAGFORMATACAO,
        STIMPRIMIRDESCACRESITEM,
        STVIACONSUMIDOR,
        STTEF,
        STBALANCA,
        STGAVETEIRO,
        STSANGRIA,
        VRMAXSANGRIA,
        STCONTROLAHORARIO,
        HRINICIOLOGIN,
        HRFIMLOGIN,
        STSTATUS,
        DTULTALTERACAO,
        NUSERIEPROD,
        NUNFCEPROD,
        NUSERIEHOM,
        NUNFCEHOM,
        STATIVO,
        VSSISTEMA,
        STATUALIZA,
        STLIMPA
    ) {
        const response = await this.api.post(`${url}/api/informatica/caixa.xsjs`, {
            IDEMPRESA,
            DSCAIXA,
            NUULTNFCE,
            NUSERIE,
            TBEMISSAOFISCAL,
            NOIMPRESSORA,
            NULINHAIMPRESSORA,
            DSPORTACOMUNICACAO,
            NUBAUD,
            NULINHAENTRECUPOM,
            STIMPRIMIRUMITEMPORLINHA,
            STDANFCERESUMIDO,
            STIGNORARTAGFORMATACAO,
            STIMPRIMIRDESCACRESITEM,
            STVIACONSUMIDOR,
            STTEF,
            STBALANCA,
            STGAVETEIRO,
            STSANGRIA,
            VRMAXSANGRIA,
            STCONTROLAHORARIO,
            HRINICIOLOGIN,
            HRFIMLOGIN,
            STSTATUS,
            DTULTALTERACAO,
            NUSERIEPROD,
            NUNFCEPROD,
            NUSERIEHOM,
            NUNFCEHOM,
            STATIVO,
            VSSISTEMA,
            STATUALIZA,
            STLIMPA
        })
        return response.data;
    }

    async atualizarCaixa(
        DSCAIXAWEB,
        TBEMISSAOFISCAL,
        NOIMPRESSORA,
        DSPORTACOMUNICACAO,
        DTULTALTERACAO,
        NUSERIEPROD,
        NUNFCEPROD,
        STTEF,
        STATUALIZA,
        STLIMPA,
        IDCAIXAWEB
    ) {
        const response = await this.api.put(`${url}/api/informatica/caixa.xsjs`, {
            DSCAIXAWEB,
            TBEMISSAOFISCAL,
            NOIMPRESSORA,
            DSPORTACOMUNICACAO,
            DTULTALTERACAO,
            NUSERIEPROD,
            NUNFCEPROD,
            STTEF,
            STATUALIZA,
            STLIMPA,
            IDCAIXAWEB
        })
        return response.data;
    }

}