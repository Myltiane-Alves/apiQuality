export class EmpresaServices {
    constructor(client) {
        this.client = client;
    }
    async updateEmpresa({
        STGRUPOEMPRESARIAL,
        IDGRUPOEMPRESARIAL,
        IDSUBGRUPOEMPRESARIAL,
        NORAZAOSOCIAL,
        NOFANTASIA,
        NUCNPJ,
        NUINSCESTADUAL,
        NUINSCMUNICIPAL,
        CNAE,
        EENDERECO,
        ECOMPLEMENTO,
        EBAIRRO,
        ECIDADE,
        SGUF,
        NUUF,
        NUCEP,
        NUIBGE,
        EEMAILPRINCIPAL,
        NUTELGERENCIA,
        NUCNAE,
        STECOMMERCE,
        DTULTATUALIZACAO,
        STATIVO,
        ALIQPIS,
        ALIQCOFINS,
        IDEMPRESA
    }) {
        if (!IDEMPRESA) {
            throw new Error("ID da Empresa é Obrigatorio.")
        }
        if (!NOFANTASIA) {
            throw new Error("NOFANTASIA é Obrigatorio.")
        }

        const result = await this.client.atualizarEmpresa(
            STGRUPOEMPRESARIAL,
            IDGRUPOEMPRESARIAL,
            IDSUBGRUPOEMPRESARIAL,
            NORAZAOSOCIAL,
            NOFANTASIA,
            NUCNPJ,
            NUINSCESTADUAL,
            NUINSCMUNICIPAL,
            CNAE,
            EENDERECO,
            ECOMPLEMENTO,
            EBAIRRO,
            ECIDADE,
            SGUF,
            NUUF,
            NUCEP,
            NUIBGE,
            EEMAILPRINCIPAL,
            NUTELGERENCIA,
            NUCNAE,
            STECOMMERCE,
            DTULTATUALIZACAO,
            STATIVO,
            ALIQPIS,
            ALIQCOFINS,
            IDEMPRESA
        );
        return result;
    }
}