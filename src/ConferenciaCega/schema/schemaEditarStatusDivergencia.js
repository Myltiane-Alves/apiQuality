import Joi from "joi";

const schemaEditarStatusDivergencia = Joi.object({
    DESCRICAODIVERGENCIA: Joi.string().required()
        .messages({
            "any.required": "DESCRICAODIVERGENCIA é obrigatório",
            "string.base": "DESCRICAODIVERGENCIA  deve ser uma string"
        }),

    IDSTATUSDIVERGENCIA: Joi.number().required()
        .messages({
            "any.required": "IDSTATUSDIVERGENCIA é obrigatório",
            "number.base": "IDSTATUSDIVERGENCIA deve ser uma número"
        }),

    STATIVO: Joi.string().required()
        .messages({
            "any.required": "STATIVO é obrigatório",
            "number.base": "STATIVO  deve ser uma string"
        }),

});


export default schemaEditarStatusDivergencia;