export class BalancoServices {
    constructor(client) {
        this.client = client;
    }

    async updateConfirmarBalancoConsolidado(
        IDRESUMOBALANCO,
        OBSCONTAGEM,
        OBSDIVERGENCIACONTAGEM,
        OBSDIVERGENCIAGERENTE
    ) {

        const result = await this.client.ConfirmarConsolidarBalanco(
            IDRESUMOBALANCO,
            OBSCONTAGEM,
            OBSDIVERGENCIACONTAGEM,
            OBSDIVERGENCIAGERENTE
        );

        return result;
    }

    async updateDetalheBalancoAvulso(
        IDEMPRESA,
        NUMEROCOLETOR,
        DSCOLETOR,
        IDPRODUTO,
        TOTALCONTAGEMGERAL
    ) {

        const result = await this.client.ConfirmarConsolidarBalanco(
            IDEMPRESA,
            NUMEROCOLETOR,
            DSCOLETOR,
            IDPRODUTO,
            TOTALCONTAGEMGERAL
        );

        return result;
    }
}