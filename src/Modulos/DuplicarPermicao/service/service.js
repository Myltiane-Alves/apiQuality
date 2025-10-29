export class duplicarPermicaoSevice {

    constructor(client) {
        this.client = client;
    }

    async createDuplicarPermicao({

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
    }) {
        if (!IDUSUARIO) {
            throw new Error('IDUSUARIO é obrigatório')
        };
        if (!CRIAR) {
            throw new Error('CRIAR é obrigatório')
        };
        if (!ALTERAR) {
            throw new Error('ALTERAR é obrigatório')
        };
        if (!ADMINISTRADOR) {
            throw new Error('ADMINISTRADOR é obrigatório')
        };
        if (!N4) {
            throw new Error('N4 é obrigatório')
        };
        if (!N3) {
            throw new Error('N3 é obrigatório')
        };
        if (!N2) {
            throw new Error('N2 é obrigatório')
        };
        if (!N1) {
            throw new Error('N1 é obrigatório')
        };
        if (!IDMENU) {
            throw new Error('IDMENU é obrigatório')
        };
        if (!IDMENUFILHO) {
            throw new Error('IDMENUFILHO é obrigatório')
        };

        const result = await this.client.criarDuplicarPermissao(
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
        );
        return result
    }

}