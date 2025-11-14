import Joi from "joi";

const schemaEncerrarOT = Joi.object({
    IDSTDIVERGENCIA: Joi.number().required()
        .messages({
            "any.required": "IDSTDIVERGENCIA é obrigatório",
            "number.base": "IDSTDIVERGENCIA  deve ser um número"
        }),

    OBSDIVERGENCIA: Joi.string().required()
        .messages({
            "any.required": "OBSDIVERGENCIA é obrigatório",
            "string.base": "OBSDIVERGENCIA  deve ser uma string"
        }),

    IDUSRAJUSTE: Joi.number().required()
        .messages({
            "any.required": "IDUSRAJUSTE é obrigatório",
            "string.base": "IDUSRAJUSTE  deve ser uma string"
        }),

    IDSTATUSOT: Joi.number().required()
        .messages({
            "any.required": "IDSTATUSOT é obrigatório",
            "number.base": "IDSTATUSOT  deve ser um número"
        }),

    IDRESUMOOT: Joi.number().required()
        .messages({
            "any.required": "IDRESUMOOT é obrigatório",
            "number.base": "IDRESUMOOT  deve ser um número"
        }),
});


export default schemaEncerrarOT;