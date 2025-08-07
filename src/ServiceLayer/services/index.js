export class DepositoService {
    constructor(client) {
        this.client = client;
    }

    async integrarDeposito(IDDEPOSITOLOJA) {
        if(!IDDEPOSITOLOJA) {
            throw new Error('ID do depósito é obrigatório.');
        }

        await this.client.integrarDeposito(IDDEPOSITOLOJA);
        return;
    }
}