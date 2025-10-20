export class OTService {
    constructor(client) {
        this.client = client;
    }

    async createOT(
        IDRESUMOOT
    ){
        if(!IDRESUMOOT) {
            throw new Error("IDRESUMOOT is required");
        }

        const result = await this.client.criarOT(
            IDRESUMOOT
        )
        return result;
    }

    async updateOT(
        IDRESUMOOT,
        IDEMPRESAORIGEM,
        IDEMPRESADESTINO,
        DATAEXPEDICAO,
        IDOPERADOREXPEDICAO,
        NUTOTALITENS,
        QTDTOTALITENS,
        QTDTOTALITENSRECEPCIONADO,
        QTDTOTALITENSDIVERGENCIA,
        NUTOTALVOLUMES,
        TPVOLUME,
        VRTOTALCUSTO,
        VRTOTALVENDA,
        DTRECEPCAO,
        IDOPERADORRECEPTOR,
        DSOBSERVACAO,
        IDUSRCANCELAMENTO,
        DTULTALTERACAO,
        IDSTDIVERGENCIA,
        OBSDIVERGENCIA,
        STEMISSAONFE,
        NUMERONFE,
        STENTRADAINVENTARIO,
        QTDCONFERENCIA,
        dadosdetalheot,
        IDSTATUSOT,
        IDUSRAJUSTE,
        DTAJUSTE,
        QTDTOTALITENSAJUSTE,
        CONFEREITENS,
        IDROTINA,
        DATAENTREGA,
    ) {
        if(!IDRESUMOOT) {
            throw new Error("IDRESUMOOT is required");
        }

        const result = await this.client.atualizarOT(
            IDRESUMOOT,
            IDEMPRESAORIGEM,
            IDEMPRESADESTINO,
            DATAEXPEDICAO,
            IDOPERADOREXPEDICAO,
            NUTOTALITENS,
            QTDTOTALITENS,
            QTDTOTALITENSRECEPCIONADO,
            QTDTOTALITENSDIVERGENCIA,
            NUTOTALVOLUMES,
            TPVOLUME,
            VRTOTALCUSTO,
            VRTOTALVENDA,
            DTRECEPCAO,
            IDOPERADORRECEPTOR,
            DSOBSERVACAO,
            IDUSRCANCELAMENTO,
            DTULTALTERACAO,
            IDSTDIVERGENCIA,
            OBSDIVERGENCIA,
            STEMISSAONFE,
            NUMERONFE,
            STENTRADAINVENTARIO,
            QTDCONFERENCIA,
            dadosdetalheot,
            IDSTATUSOT,
            IDUSRAJUSTE,
            DTAJUSTE,
            QTDTOTALITENSAJUSTE,
            CONFEREITENS,
            IDROTINA,
            DATAENTREGA,
        )
        return result;
    }
}