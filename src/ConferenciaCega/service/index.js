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
    ) {
        if (!IDEMPRESAORIGEM) {
            throw new Error("IDEMPRESAORIGEM is required, services");
        }
        console.log("IDEMPRESAORIGEM", IDEMPRESAORIGEM)

        if (!IDEMPRESADESTINO) {
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
        if (!IDRESUMOOT) {
            throw new Error("IDRESUMOOT is required");
        }

        if (!IDEMPRESAORIGEM) {
            throw new Error("IDEMPRESAORIGEM is required");
        }

        if (!IDEMPRESADESTINO) {
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

    async criarOTDeposito(
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
        if (!IDEMPRESAORIGEM) {
            throw new Error("IDEMPRESAORIGEM is required");
        }

        if (!IDEMPRESADESTINO) {
            throw new Error("IDEMPRESADESTINO is required");
        }



        const result = await this.client.salvarOTDeposito(

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

    async cancelOTDeposito(
        IDSTATUSOT,
        IDRESUMOOT,
        IDUSRCANCELAMENTO

    ) {
        if (!IDSTATUSOT) {
            throw new Error("IDSTATUSOT is required");
        }

        if (!IDUSRCANCELAMENTO) {
            throw new Error("IDUSRCANCELAMENTO is required");
        }

        const result = await this.client.cancelarOTDeposito(

            IDSTATUSOT,
            IDRESUMOOT,
            IDUSRCANCELAMENTO
        )
        return result;
    }

    async finishOTDeposito(
        IDSTATUSOT,
        NUTOTALVOLUMES,
        TPVOLUME,
        IDRESUMOOT,
        IDEMPRESAORIGEM,
        NOTAFISCAL

    ) {
        if (!IDSTATUSOT) {
            throw new Error("IDSTATUSOT is required");
        }

        const result = await this.client.finalizarOTDeposito(

            IDSTATUSOT,
            NUTOTALVOLUMES,
            TPVOLUME,
            IDRESUMOOT,
            IDEMPRESAORIGEM,
            NOTAFISCAL
        )
        return result;
    }

    async closeOT(
        IDSTDIVERGENCIA,
        OBSDIVERGENCIA,
        IDUSRAJUSTE,
        IDSTATUSOT,
        IDRESUMOOT

    ) {
        if (!IDSTATUSOT) {
            throw new Error("IDSTATUSOT is required");
        }
        if (!IDRESUMOOT) {
            throw new Error("IDSTATUSOT is required");
        }

        const result = await this.client.encerrarOT(
            IDSTDIVERGENCIA,
            OBSDIVERGENCIA,
            IDUSRAJUSTE,
            IDSTATUSOT,
            IDRESUMOOT
        )
        return result;
    }
}