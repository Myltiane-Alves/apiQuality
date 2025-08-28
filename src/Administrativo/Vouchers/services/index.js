export class VoucherServices {
    constructor(client) {
        this.client = client;
    }

    async updateVoucher(
        STATIVO,
        STCANCELADO,
        DSMOTIVOTROCASTATUS,
        STSTATUS,
        STTIPOTROCA,
        IDFUNCIONARIO,
        IDEMPRESALOGADA,
        IDGRUPOEMPRESARIAL,
        IDVOUCHER
    ) {
        if (!IDVOUCHER) {
            throw new Error('ID do voucher é obrigatório.');
        }

        const result = await this.client.atualizarVoucher(
            STATIVO,
            STCANCELADO,
            DSMOTIVOTROCASTATUS,
            STSTATUS,
            STTIPOTROCA,
            IDFUNCIONARIO,
            IDEMPRESALOGADA,
            IDGRUPOEMPRESARIAL,
            IDVOUCHER
        );

        return result;
    }
}