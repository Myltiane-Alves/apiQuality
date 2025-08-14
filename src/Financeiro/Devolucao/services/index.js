export class MotivoDevolucaoService {
    constructor(client) {
        this.client = client;
    }

    async createMotivo(data) {
        const result = await this.client.criarMotivo(data);
  
        return result;
    }
}