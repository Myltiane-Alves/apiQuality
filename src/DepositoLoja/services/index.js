export class DepositoService {
    constructor(client) {
        this.client = client;
    }

    async createDeposito(
        DTDEPOSITO,
        DTMOVIMENTOCAIXA,
        IDEMPRESA,
        IDUSR,
        IDCONTABANCO,
        VRDEPOSITO,
        DSHISTORIO,
        NUDOCDEPOSITO,
        DSPATHDOCDEPOSITO,
        STATIVO,
        STCANCELADO,
        IDUSRCACELAMENTO,
        DSMOTIVOCANCELAMENTO,
    ) {

        const result = await this.client.criarDeposito(
            DTDEPOSITO,
            DTMOVIMENTOCAIXA,
            IDEMPRESA,
            IDUSR,
            IDCONTABANCO,
            VRDEPOSITO,
            DSHISTORIO,
            NUDOCDEPOSITO,
            DSPATHDOCDEPOSITO,
            STATIVO,
            STCANCELADO,
            IDUSRCACELAMENTO,
            DSMOTIVOCANCELAMENTO,
        )
        return result;
    }

    async updateDeposito(
        IDDEPOSITOLOJA,
        DTDEPOSITO,
        DTMOVIMENTOCAIXA,
        IDEMPRESA,
        IDUSR,
        IDCONTABANCO,
        VRDEPOSITO,
        DSHISTORIO,
        NUDOCDEPOSITO,
        DSPATHDOCDEPOSITO,
        STATIVO,
        STCANCELADO,
        IDUSRCACELAMENTO,
        DSMOTIVOCANCELAMENTO,
    ) {

        const result = await this.client.atualizarDeposito(
            IDDEPOSITOLOJA,
            DTDEPOSITO,
            DTMOVIMENTOCAIXA,
            IDEMPRESA,
            IDUSR,
            IDCONTABANCO,
            VRDEPOSITO,
            DSHISTORIO,
            NUDOCDEPOSITO,
            DSPATHDOCDEPOSITO,
            STATIVO,
            STCANCELADO,
            IDUSRCACELAMENTO,
            DSMOTIVOCANCELAMENTO,
        )
        return result;
    }
}