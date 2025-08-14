import { console } from "inspector";

export class MotivoDevolucaoService {
    constructor(client) {
        this.client = client;
    }

    async createMotivo(IDUSUARIO, DSMOTIVO) {
        const result = await this.client.criarMotivo(IDUSUARIO, DSMOTIVO);
  
        return result;
    }

    async updateMotivoDevolucao(DSMOTIVO, STATIVO, IDUSUARIO, IDMOTIVODEVOLUCAO) {
        if(!IDMOTIVODEVOLUCAO) {
            throw new Error("ID do motivo de devolução é obrigatório");
        }
        const result = await this.client.atualizarMotivoDevolucao(DSMOTIVO, STATIVO, IDUSUARIO, IDMOTIVODEVOLUCAO);
    
        return result;
    }
}