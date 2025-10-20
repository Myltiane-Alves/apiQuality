import Joi from "joi";

const criarOTSchema = Joi.object({
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
    })
});

export default criarOTSchema;