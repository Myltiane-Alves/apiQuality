export class SaldoService {
    constructor(client) {
        this.client = client;
    }

    async createSaldoMovimento(
        IDFUNCIONARIO,
        TIPOMOVIMENTO,
        VRMOVIMENTO,
        OBSERVACAO,
        IDFUNCIONARIORESP
    ) {
        if(!IDFUNCIONARIO) {
            throw new Error("IDFUNCIONARIO is required");
        }

        
        const result = await this.client.criarMovimentoSaldoBonificacao(
            IDFUNCIONARIO,
            TIPOMOVIMENTO,
            VRMOVIMENTO,
            OBSERVACAO,
            IDFUNCIONARIORESP
        );

        return result;
    }
}