import Joi from "joi";

const shemaCancelarOTDeposito = Joi.object({
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

    IDUSRCANCELAMENTO: Joi.number().required()
        .messages({
            "any.required": "IDUSRCANCELAMENTO é obrigatório",
            "number.base": "IDUSRCANCELAMENTO  deve ser um número"
        }),
});


export default shemaCancelarOTDeposito;