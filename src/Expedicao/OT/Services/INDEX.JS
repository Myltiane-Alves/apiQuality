export class OTService {
    constructor(client) {
        this.client = client;
    }

    async createOT(
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
        IDRESUMOOT,
        IDSTATUSOT,
        IDUSRAJUSTE,
        DTAJUSTE,
        QTDTOTALITENSAJUSTE,
        CONFEREITENS,
        IDROTINA,
        DATAENTREGA
    ){
        if(!IDEMPRESAORIGEM) {
            throw new Error("IDEMPRESAORIGEM is required");
        }

        if(!IDEMPRESADESTINO) {
            throw new Error("IDEMPRESADESTINO is required");
        }

        const result = await this.client.criarOT(
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
            IDRESUMOOT,
            IDSTATUSOT,
            IDUSRAJUSTE,
            DTAJUSTE,
            QTDTOTALITENSAJUSTE,
            CONFEREITENS,
            IDROTINA,
            DATAENTREGA
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