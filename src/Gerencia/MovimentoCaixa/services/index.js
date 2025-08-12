export class MovimentoCaixaService {
    constructor(client) {
        this.client = client;
    }

    async updateStatus(IDSUPERVISOR, STCONFERIDO, ID) {
        if(!ID) {
            throw new Error('ID é obrigatório.');
        }

        if(!IDSUPERVISOR) {
            throw new Error('IDSUPERVISOR é obrigatório.');
        }

        const result = await this.client.atuaizarStatus(IDSUPERVISOR, STCONFERIDO, ID);

        return result;
    }
}