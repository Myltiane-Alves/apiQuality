export class OTService {
    constructor(client) {
        this.client = client;
    }

    async createOT(
        IDRESUMOOT,
        IDEMPRESAORIGEM,
        IDEMPRESADESTINO,
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
        IDSTDIVERGENCIA,
        OBSDIVERGENCIA,
        STEMISSAONFE,
        NUMERONFE,
        STENTRADAINVENTARIO,
        QTDCONFERENCIA,
        IDSTATUSOT,
        IDUSRAJUSTE,
        DTAJUSTE,
        QTDTOTALITENSAJUSTE,
        dadosdetalheot,
    ){
        if(!IDEMPRESAORIGEM) {
            throw new Error("IDEMPRESAORIGEM is required, services");
        }
        console.log("IDEMPRESAORIGEM", IDEMPRESAORIGEM)

        if(!IDEMPRESADESTINO) {
            throw new Error("IDEMPRESADESTINO is required, services");
        }

        const result = await this.client.criarOT(
            IDRESUMOOT,
            IDEMPRESAORIGEM,
            IDEMPRESADESTINO,
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
            IDSTDIVERGENCIA,
            OBSDIVERGENCIA,
            STEMISSAONFE,
            NUMERONFE,
            STENTRADAINVENTARIO,
            QTDCONFERENCIA,
            IDSTATUSOT,
            IDUSRAJUSTE,
            DTAJUSTE,
            QTDTOTALITENSAJUSTE,
            dadosdetalheot,
        )
        return result;
    }

    async updateOT(
         IDRESUMOOT,
            IDEMPRESAORIGEM,
            IDEMPRESADESTINO,
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
            IDSTDIVERGENCIA,
            OBSDIVERGENCIA,
            STEMISSAONFE,
            NUMERONFE,
            STENTRADAINVENTARIO,
            QTDCONFERENCIA,
            IDSTATUSOT,
            IDUSRAJUSTE,
            DTAJUSTE,
            QTDTOTALITENSAJUSTE,
            dadosdetalheot,
    ) {
        if(!IDRESUMOOT) {
            throw new Error("IDRESUMOOT is required");
        }
        
        if(!IDEMPRESAORIGEM) {
            throw new Error("IDEMPRESAORIGEM is required");
        }

        if(!IDEMPRESADESTINO) {
            throw new Error("IDEMPRESADESTINO is required");
        }
        
        const result = await this.client.atualizarOT(
            IDRESUMOOT,
            IDEMPRESAORIGEM,
            IDEMPRESADESTINO,
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
            IDSTDIVERGENCIA,
            OBSDIVERGENCIA,
            STEMISSAONFE,
            NUMERONFE,
            STENTRADAINVENTARIO,
            QTDCONFERENCIA,
            IDSTATUSOT,
            IDUSRAJUSTE,
            DTAJUSTE,
            QTDTOTALITENSAJUSTE,
            dadosdetalheot,
        )
        return result;
    }
}