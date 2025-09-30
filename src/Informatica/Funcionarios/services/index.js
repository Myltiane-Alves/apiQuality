export class FuncionarioService {
    constructor(client) {
        this.client = client;
    }       
    async updateFuncionario(IDFUNCIONARIO, NUCPF, IDFUNCALTERACAO, IDEMPRESA, ID) {
        if (!IDFUNCIONARIO) {
            throw new Error('ID do funcionário é obrigatório.');
        }

         if (!NUCPF) {
            throw new Error('CPF do funcionário é obrigatório.');
        }

         if (!IDFUNCALTERACAO) {
            throw new Error('ID do usuário da última alteração é obrigatório.');
        }

          if (!IDEMPRESA) {
            throw new Error('ID da empresa é obrigatório.');
        }
           if (!ID) {
            throw new Error('ID é obrigatório.');
        }

         const result = await this.client.criarFuncionario( IDFUNCIONARIO,
            NUCPF,
            IDFUNCALTERACAO,
            IDEMPRESA,
            ID
        );
        
        return result;
  }
}