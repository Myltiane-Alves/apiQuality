export class MaloteService {
    constructor(client) {
        this.client = client;
    }

    async updateMalote(IDMALOTE, IDUSERULTIMAALTERACAO, STATUS, OBSERVACAOADMINISTRATIVO, PENDENCIAS) {
        // if (!IDMALOTE) {
        //     throw new Error('ID do malote é obrigatório.');
        // }

        // if(!IDUSERULTIMAALTERACAO) {
        //     throw new Error('ID do usuário da última alteração é obrigatório.');
        // }
        console.log(IDMALOTE, IDUSERULTIMAALTERACAO, STATUS, OBSERVACAOADMINISTRATIVO, PENDENCIAS, 'SERVICE');
        await this.client.atualizarMalote(IDMALOTE, IDUSERULTIMAALTERACAO, STATUS, OBSERVACAOADMINISTRATIVO, PENDENCIAS);
        return;
    }
}
