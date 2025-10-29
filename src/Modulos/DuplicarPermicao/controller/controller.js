import { DuplicarPermissaoClient } from "../client/client.js";
import { duplicarPermicaoSchema } from "../schema/schema.js";
import { duplicarPermicaoSevice } from "../service/service.js";

const duplicarPermicaoClient = new DuplicarPermissaoClient(process.env.API_URL);
const duplicarPermicaoServices = new duplicarPermicaoSevice(duplicarPermicaoClient);

class DuplicarPermicaoController {
    async postDuplicarPermicao(req, res) {
        try {
            const { error, value } = duplicarPermicaoSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                return res.status(400).json({
                    message: 'Dados inválidos',
                    errors: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message
                    }))
                });
            }
            const response = await duplicarPermicaoServices.createDuplicarPermicao({
                IDUSUARIO: value.IDUSUARIO,
                CRIAR: value.CRIAR,
                ALTERAR: value.ALTERAR,
                STATIVO: value.STATIVO,
                DATAULTIMAALTERACAO: value.DATAULTIMAALTERACAO,
                DATA_CRIACAO: value.DATA_CRIACAO,
                IDMODULO: value.IDMODULO,
                IDMODULOADMINISTRATIVO: value.IDMODULOADMINISTRATIVO,
                IDMODULOCOMERCIAL: value.IDMODULOCOMERCIAL,
                IDMODULOCONTABILIDADE: value.IDMODULOCONTABILIDADE,
                IDMODULOFINANCEIRO: value.IDMODULOFINANCEIRO,
                IDMODULOGERENCIA: value.IDMODULOGERENCIA,
                IDMODULOINFORMATICA: value.IDMODULOINFORMATICA,
                IDMODULOMARKETING: value.IDMODULOMARKETING,
                IDMODULOCOMPRAS: value.IDMODULOCOMPRAS,
                IDMODULOCADASTRO: value.IDMODULOCADASTRO,
                IDMODULOEXPEDICAO: value.IDMODULOEXPEDICAO,
                IDMODULOCOMPRASADM: value.IDMODULOCOMPRASADM,
                IDMODULOETIQUETAGEM: value.IDMODULOETIQUETAGEM,
                IDMODULOCONFERENCIACEGA: value.IDMODULOCONFERENCIACEGA,
                IDMODULOVOUCHER: value.IDMODULOVOUCHER,
                IDMODULOMALOTE: value.IDMODULOMALOTE,
                IDMODULORH: value.IDMODULORH,
                IDUSERULTIMAALTERACAO: value.IDUSERULTIMAALTERACAO,
                IDPERMISSAO: value.IDPERMISSAO,
                IDMODULORESUMOVENDAS: value.IDMODULORESUMOVENDAS,
                IDMODULOPROMOCAO: value.IDMODULOPROMOCAO,
                ADMINISTRADOR: value.ADMINISTRADOR,
                N4: value.N4,
                N3: value.N3,
                N2: value.N2,
                N1: value.N1,
                IDMENU: value.IDMENU,
                IDMENUFILHO: value.IDMENUFILHO,
            });
            return res.status(200).json(response);
        } catch (error) {
            console.error("Error no DuplicarPermicaoController.postDuplicarPermicao", error);
            return res.status(500).json({ error: "Error no Servidor" })
        }
    }
}

export default new DuplicarPermicaoController();