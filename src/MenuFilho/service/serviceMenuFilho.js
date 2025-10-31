
export class menuFilhoServices {
    constructor(client) {
        this.client = client;
    }

    async creatMenuFilho({
        DSNOME,
        IDMENUPAI,
        URL
    }) {

        if (!DSNOME) {
            throw new Error('DSNOME obrigatorio');
        }

        if (!IDMENUPAI) {
            throw new Error('IDMENUPAI obrigatorio');
        }

        if (!URL) {
            throw new Error('URL obrigatorio');
        }

        const result = await this.client.criarMenuFilho(
            DSNOME,
            IDMENUPAI,
            URL
        );
        return result

    }
}