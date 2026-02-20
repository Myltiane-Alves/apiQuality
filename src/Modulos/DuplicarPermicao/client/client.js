import axios from 'axios';
import 'dotenv/config';
const url = process.env.API_URL;

export class DuplicarPermissaoClient {
    constructor(baseURL) {
        this.api = axios.create({
            baseURL: baseURL || url,
            timeout: 80000
        });
    }

    async criarDuplicarPermissao(
        IDUSUARIO,
        CRIAR,
        ALTERAR,
        STATIVO,
        DATAULTIMAALTERACAO,
        DATA_CRIACAO,
        IDMODULO,
        IDMODULOADMINISTRATIVO,
        IDMODULOCOMERCIAL,
        IDMODULOCONTABILIDADE,
        IDMODULOFINANCEIRO,
        IDMODULOGERENCIA,
        IDMODULOINFORMATICA,
        IDMODULOMARKETING,
        IDMODULOCOMPRAS,
        IDMODULOCADASTRO,
        IDMODULOEXPEDICAO,
        IDMODULOCOMPRASADM,
        IDMODULOETIQUETAGEM,
        IDMODULOCONFERENCIACEGA,
        IDMODULOVOUCHER,
        IDMODULOMALOTE,
        IDMODULORH,
        IDUSERULTIMAALTERACAO,
        IDPERMISSAO,
        IDMODULORESUMOVENDAS,
        IDMODULOPROMOCAO,
        ADMINISTRADOR,
        N4,
        N3,
        N2,
        N1,
        IDMENU,
        IDMENUFILHO,
    ) {
        const response = await this.api.post(`${url}/api/perfilUsuario/perfilUsuarioMenu.xsjs`, {
            IDUSUARIO,
            CRIAR,
            ALTERAR,
            STATIVO,
            DATAULTIMAALTERACAO,
            DATA_CRIACAO,
            IDMODULO,
            IDMODULOADMINISTRATIVO,
            IDMODULOCOMERCIAL,
            IDMODULOCONTABILIDADE,
            IDMODULOFINANCEIRO,
            IDMODULOGERENCIA,
            IDMODULOINFORMATICA,
            IDMODULOMARKETING,
            IDMODULOCOMPRAS,
            IDMODULOCADASTRO,
            IDMODULOEXPEDICAO,
            IDMODULOCOMPRASADM,
            IDMODULOETIQUETAGEM,
            IDMODULOCONFERENCIACEGA,
            IDMODULOVOUCHER,
            IDMODULOMALOTE,
            IDMODULORH,
            IDUSERULTIMAALTERACAO,
            IDPERMISSAO,
            IDMODULORESUMOVENDAS,
            IDMODULOPROMOCAO,
            ADMINISTRADOR,
            N4,
            N3,
            N2,
            N1,
            IDMENU,
            IDMENUFILHO,
        });
        return response.data;
    }
}