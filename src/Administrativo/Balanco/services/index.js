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
}