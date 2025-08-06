export class DepositoService {
    constructor(client) {
        this.client = client;
    }

    async integrarDeposito(IDDEPOSITOLOJA) {
        if(!IDDEPOSITOLOJA) {
            throw new Error('ID do depósito é obrigatório.');
        }
        console.log('IDDEPOSITOLOJA recebido no service:', IDDEPOSITOLOJA);
        await this.client.integrarDeposito(IDDEPOSITOLOJA);

        return { message: 'Depósito integrado no SAP com sucesso.' };
    }
}