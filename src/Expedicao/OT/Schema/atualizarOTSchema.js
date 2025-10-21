import Joi from "joi";

const atualizarOTSchema = Joi.object({
     IDRESUMOOT: Joi.number().required()
        .messages({
            "any.required": "O ID do resumo da OT é obrigatório",
            "number.base": "O ID do resumo da OT deve ser um número"
        }),
        IDEMPRESAORIGEM: Joi.number().required()
        .messages({
            "any.required": "O ID da empresa de origem é obrigatório",
            "number.base": "O ID da empresa de origem deve ser um número"
        }),
        IDEMPRESADESTINO: Joi.number().required()
        .messages({
            "any.required": "O ID da empresa de destino é obrigatório",
            "number.base": "O ID da empresa de destino deve ser um número"
        }),
        DATAEXPEDICAO: Joi.string().required()
        .messages({
            "any.required": "A data de expedição é obrigatória",
            "string.base": "A data de expedição deve ser uma string"
        }),
        IDOPERADOREXPEDICAO: Joi.number().required()
        .messages({
            "any.required": "O ID do operador de expedição é obrigatório",
            "number.base": "O ID do operador de expedição deve ser um número"
        }),
        NUTOTALITENS: Joi.number().allow()
        .messages({
            "number.base": "O número total de itens deve ser um número"
        }),
        QTDTOTALITENS: Joi.number().allow()
        .messages({
            "number.base": "A quantidade total de itens deve ser um número"
        }),
        QTDTOTALITENSRECEPCIONADO: Joi.number().allow()
        .messages({
            "number.base": "A quantidade total de itens recepcionados deve ser um número"
        }),
        QTDTOTALITENSDIVERGENCIA: Joi.number().allow()
        .messages({
            "number.base": "A quantidade total de itens com divergência deve ser um número"
        }),
        NUTOTALVOLUMES: Joi.number().allow()
        .messages({
            "number.base": "O número total de volumes deve ser um número"
        }),
        TPVOLUME: Joi.string().allow()
        .messages({
            "string.base": "O tipo de volume deve ser uma string"
        }),
        VRTOTALCUSTO: Joi.number().allow()
        .messages({
            "number.base": "O valor total de custo deve ser um número"
        }),
        VRTOTALVENDA: Joi.number().allow()
        .messages({
            "number.base": "O valor total de venda deve ser um número"
        }),
        DTRECEPCAO: Joi.string().allow()
        .messages({
            "string.base": "A data de recepção deve ser uma string"
        }),
        IDOPERADORRECEPTOR: Joi.number().allow()
        .messages({
            "number.base": "O ID do operador receptor deve ser um número"
        }),
        DSOBSERVACAO: Joi.string().allow()
        .messages({
            "string.base": "A observação deve ser uma string"
        }),
        IDUSRCANCELAMENTO: Joi.number().allow()
        .messages({
            "number.base": "O ID do usuário de cancelamento deve ser um número"
        }),
        DTULTALTERACAO: Joi.string().allow()
        .messages({
            "string.base": "A data da última alteração deve ser uma string"
        }),
        IDSTDIVERGENCIA: Joi.number().allow()
        .messages({
            "number.base": "O ID do status de divergência deve ser um número"
        }),
        OBSDIVERGENCIA: Joi.string().allow()
        .messages({
            "string.base": "A observação de divergência deve ser uma string"
        }),
        STEMISSAONFE: Joi.string().required()
        .messages({
            "any.required": "A descrição da emissão NFE é obrigatória",
            "string.base": "A descrição da emissão NFE deve ser uma string"
        }),
        NUMERONFE: Joi.string().allow()
        .messages({
            "string.base": "O número da NFE deve ser uma string"
        }),
        STENTRADAINVENTARIO: Joi.string().allow()
        .messages({
            "string.base": "A descrição da entrada no inventário deve ser uma string"
        }),
        QTDCONFERENCIA: Joi.number().allow()
        .messages({
            "number.base": "A quantidade de conferência deve ser um número"
        }),
        dadosdetalheot: Joi.array().items(
            Joi.object({
                IDPRODUTO: Joi.number().required()
                .messages({
                    "any.required": "O ID do produto é obrigatório",
                    "number.base": "O ID do produto deve ser um número" 
                }),
                QTDEXPEDICAO: Joi.number().required()
                .messages({
                    "any.required": "A quantidade de expedição é obrigatória",
                    "number.base": "A quantidade de expedição deve ser um número"
                }),
                QTDRECEPCAO: Joi.number().allow()
                .messages({
                    "number.base": "A quantidade de recepção deve ser um número"
                }),
                QTDDIFERENCA: Joi.number().allow()
                .messages({
                    "number.base": "A quantidade de diferença deve ser um número"
                }),
                QTDAJUSTE: Joi.number().allow()
                .messages({
                    "number.base": "A quantidade de ajuste deve ser um número"
                }),
                VLRUNITVENDA: Joi.number().allow()
                .messages({
                    "number.base": "O valor unitário de venda deve ser um número"
                }),
                VLRUNITCUSTO: Joi.number().allow()
                .messages({
                    "number.base": "O valor unitário de custo deve ser um número"
                }),
                STCONFERIDO: Joi.string().allow()
                .messages({
                    "string.base": "O status de conferido deve ser uma string"
                }),
                IDUSRAJUSTE: Joi.number().allow()
                .messages({
                    "number.base": "O ID do usuário de ajuste deve ser um número"
                }),
                STATIVO: Joi.string().allow()
                .messages({
                    "string.base": "O status ativo deve ser uma string"
                }),
                STFALTA: Joi.string().allow()
                .messages({
                    "string.base": "O status de falta deve ser uma string"
                }),
                STSOBRA: Joi.string().allow()
                .messages({
                    "string.base": "O status de sobra deve ser uma string"
                })
            })
        ).required()
        .messages({
            "any.required": "Os detalhes da OT são obrigatórios",
            "array.base": "Os detalhes da OT devem ser um array"
        }),
        IDSTATUSOT: Joi.number().required()
        .messages({
            "any.required": "O ID do status da OT é obrigatório",
            "number.base": "O ID do status da OT deve ser um número"
        }),
        IDUSRAJUSTE: Joi.number().allow()
        .messages({
            "number.base": "O ID do usuário de ajuste deve ser um número"
        }),
        DTAJUSTE: Joi.string().allow()
        .messages({
            "string.base": "A data de ajuste deve ser uma string"
        }),
        QTDTOTALITENSAJUSTE: Joi.number().allow()
        .messages({
            "number.base": "A quantidade total de itens de ajuste deve ser um número"
        }),
        CONFEREITENS: Joi.boolean().allow()
        .messages({
            "boolean.base": "O campo de conferência de itens deve ser um booleano"
        }),
        IDROTINA: Joi.number().allow()
        .messages({
            "number.base": "O ID da rotina deve ser um número"
        }),
        DATAENTREGA: Joi.string().allow()
        .messages({
            "string.base": "A data de entrega deve ser uma string"
        }),
})

export default atualizarOTSchema;