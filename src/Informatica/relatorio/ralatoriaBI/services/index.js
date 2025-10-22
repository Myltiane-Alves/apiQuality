export class RelatorioServices {

    constructor(client) {
        this.client = client;
    }

    async createRelatorioBi({
        DSRELATORIOBI,
        STATIVO
    }) {

        if (!DSRELATORIOBI) {
            throw new Error('DSRELATORIOBI obrigatorio');
        }
        if (!STATIVO) {
            throw new Error('STATIVO obrigatorio');
        }

        const result = await this.client.criarRelatorioBi(
            DSRELATORIOBI,
            STATIVO
        );
        return result
    }
}