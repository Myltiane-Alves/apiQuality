import Joi from "joi";

const schemaStatusDivergencia = Joi.object({
    DESCRICAODIVERGENCIA: Joi.string().required()
        .messages({
            "any.required": "DESCRICAODIVERGENCIA é obrigatório",
            "string.base": "DESCRICAODIVERGENCIA  deve ser um número"
        }),

    IDUSRCRIACAO: Joi.number().required()
        .messages({
            "any.required": "IDUSRCRIACAO é obrigatório",
            "number.base": "IDUSRCRIACAO  deve ser uma numero"
        }),

    STATIVO: Joi.string().required()
        .messages({
            "any.required": "STATIVO é obrigatório",
            "number.base": "STATIVO  deve ser uma string"
        }),

});


export default schemaStatusDivergencia;