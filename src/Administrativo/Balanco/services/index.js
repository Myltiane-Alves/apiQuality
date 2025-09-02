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

        const result = await this.client.confirmarConsolidarBalanco(
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
        CODIGODEBARRAS,
        DSPRODUTO,
        TOTALCONTAGEMGERAL,
        PRECOCUSTO,
        PRECOVENDA,
        STCANCELADO,
        INSBALANCO
    ) {

        const result = await this.client.atualizarDetalheBalancoAvulso(
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
        );

        return result;
    }

    async createConfirmarBalanco(data) {
        const result = await this.client.confirmarBalanco(data);
        return result;
    }
}