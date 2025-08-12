export class MaloteService {
    constructor(client) {
        this.client = client;
    }

    async updateMalote(IDMALOTE, STATUS, OBSERVACAOADMINISTRATIVO, PENDENCIAS, IDUSERULTIMAALTERACAO) {
        if (!IDMALOTE) {
            throw new Error('ID do malote é obrigatório.');
        }

        if(!IDUSERULTIMAALTERACAO) {
            throw new Error('ID do usuário da última alteração é obrigatório.');
        }
    
        
        const result = await this.client.atualizarMalote(IDMALOTE,
          STATUS,
          OBSERVACAOADMINISTRATIVO,
          PENDENCIAS,
          IDUSERULTIMAALTERACAO
        );
        
        return result;
    }
}
