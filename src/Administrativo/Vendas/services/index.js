export class VendasServices {
    constructor(client) {
        this.client = client;
    }

    async updateVendaPagamento( 
        STCANCELADO,
        DTULTIMAALTERACAO,
        IDFUNCIONARIOCANCELA,
        TXTMOTIVOCANCELA,
        IDVENDA
    ) {
        if(!IDVENDA) {
            throw new Error('ID da venda é obrigatório.');
        }

        const result = await this.client.atualizarVendaPagamento(
            STCANCELADO,
            DTULTIMAALTERACAO,
            IDFUNCIONARIOCANCELA,
            TXTMOTIVOCANCELA,
            IDVENDA
        );

        return result;
    }
}