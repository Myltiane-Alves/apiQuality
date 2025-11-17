import axios from 'axios';
import 'dotenv/config';
//const url = process.env.API_URL;
const url = 'http://164.152.245.77:8000/quality/concentrador_node';

export class OTClient {
    constructor(baseURL) {
        this.api = axios.create({
            baseURL: baseURL || url,
            timeout: 80000
        });
    }
    async criarOT(
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

        const response = await this.api.post(`api/expedicao/resumo-ordem-transferencia.xsjs`, {
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
        });
        return response.data;
    }
    async atualizarOT(
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

        const response = await this.api.put(`api/expedicao/resumo-ordem-transferencia.xsjs`, {
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
        });
        return response.data;
    }


    async salvarOTDeposito(
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

        const response = await this.api.post(`api/conferencia-cega/resumo-ordem-transferencia.xsjs`, {
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
        });
        return response.data;
    }

    async cancelarOTDeposito(
        IDSTATUSOT,
        IDRESUMOOT,
        IDUSRCANCELAMENTO
    ) {

        const response = await this.api.put(`api/conferencia-cega/resumo-ordem-transferencia.xsjs`, [{
            IDSTATUSOT,
            IDRESUMOOT,
            IDUSRCANCELAMENTO
        }]);
        return response.data;
    }

    async finalizarOTDeposito(
        IDSTATUSOT,
        NUTOTALVOLUMES,
        TPVOLUME,
        IDRESUMOOT,
        IDEMPRESAORIGEM,
        NOTAFISCAL
    ) {

        const response = await this.api.put(`api/conferencia-cega/resumo-ordem-transferencia.xsjs`, [{
            IDSTATUSOT,
            NUTOTALVOLUMES,
            TPVOLUME,
            IDRESUMOOT,
            IDEMPRESAORIGEM,
            NOTAFISCAL
        }]);
        return response.data;
    }

    async encerrarOT(
        IDSTDIVERGENCIA,
        OBSDIVERGENCIA,
        IDUSRAJUSTE,
        IDSTATUSOT,
        IDRESUMOOT
    ) {

        const response = await this.api.put(`api/conferencia-cega/resumo-ordem-transferencia.xsjs`, {
            IDSTDIVERGENCIA,
            OBSDIVERGENCIA,
            IDUSRAJUSTE,
            IDSTATUSOT,
            IDRESUMOOT
        });
        return response.data;
    }

    async statusDivergenciaClient(
        DESCRICAODIVERGENCIA,
        IDUSRCRIACAO,
        STATIVO,

    ) {

        const response = await this.api.post(`api/conferencia-cega/status-divergencia.xsjs`, {
            DESCRICAODIVERGENCIA,
            IDUSRCRIACAO,
            STATIVO,
        });
        return response.data;
    }

    async statusEditarDivergenciaClient(
        DESCRICAODIVERGENCIA,
        IDSTATUSDIVERGENCIA,
        STATIVO,

    ) {

        const response = await this.api.put(`/api/conferencia-cega/status-divergencia.xsjs`, {
            DESCRICAODIVERGENCIA,
            IDSTATUSDIVERGENCIA,
            STATIVO,
        });
        return response.data;
    }

}