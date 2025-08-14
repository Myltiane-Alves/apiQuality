export class MotivoDevolucaoService {
    constructor(client) {
        this.client = client;
    }

    async createMotivo( IDUSUARIO, DSMOTIVO) {
        const result = await this.client.criarMotivo(IDUSUARIO, DSMOTIVO);
  
        return result;
    }
}