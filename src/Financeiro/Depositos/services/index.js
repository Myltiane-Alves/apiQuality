export class DepositoService {
    constructor(client) {
        this.client = client;
    }

    async getListaConciliarBalancoService () {
        let {
            idDeposito, 
            idConta, 
            idEmpresa, 
            dataCompInicio, 
            dataCompFim, 
            dataMovInicio, 
            dataMovFim, 
            dataPesquisaInicio, 
            dataPesquisaFim, 
            pageSize,
            page
        } = queryParams;
        idDeposito = idDeposito ? idDeposito : '';
        idConta = idConta ? idConta : '';
        idEmpresa = idEmpresa ? idEmpresa : '';
        dataCompInicio = dataCompInicio ? dataCompInicio : '';
        dataCompFim = dataCompFim ? dataCompFim : '';
        dataMovInicio = dataMovInicio ? dataMovInicio : '';
        dataMovFim = dataMovFim ? dataMovFim : '';
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
        pageSize = pageSize ? pageSize : '';
        page = page ? page : '';
    }

    async cancelarDeposito(IDDEPOSITOLOJA) {
        if(!IDDEPOSITOLOJA) {
            throw new Error('ID do depósito é obrigatório.');
        }

        const response = await this.client.cancelarDeposito(IDDEPOSITOLOJA);
        return response.data;
    }
}