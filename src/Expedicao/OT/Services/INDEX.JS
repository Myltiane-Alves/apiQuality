export class OTService {
    constructor(client) {
        this.client = client;
    }

    async createOT(
        IDRESUMOOT
    ){
        if(!IDRESUMOOT) {
            throw new Error("IDRESUMOOT is required");
        }

        const result = await this.client.criarOT(
            IDRESUMOOT
        )
        return result;
    }
}