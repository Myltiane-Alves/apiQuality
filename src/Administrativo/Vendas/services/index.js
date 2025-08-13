export class VendasServices {
    constructor(client) {
        this.client = client;
    }

    async updateVendaPagamento(IDVENDA, STCANCELADO, DTULTIMAALTERACAO, IDFUNCIONARIOCANCELA, TXTMOTIVOCANCELA ) {
        if(!IDVENDA) {
            throw new Error('ID da venda é obrigatório.');
        }

        const result = await this.client.atualizarVendaPagamento(
            IDVENDA,
            STCANCELADO, 
            DTULTIMAALTERACAO, 
            IDFUNCIONARIOCANCELA, 
            TXTMOTIVOCANCELA
        );

        return result;
    }
}