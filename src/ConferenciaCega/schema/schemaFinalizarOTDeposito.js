import Joi from "joi";

const schemaFinalizarOTDeposito = Joi.object({
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

    NUTOTALVOLUMES: Joi.number().required()
        .messages({
            "any.required": "NUTOTALVOLUMES é obrigatório",
            "number.base": "NUTOTALVOLUMES  deve ser um número"
        }),

    TPVOLUME: Joi.string().required()
        .messages({
            "any.required": "TPVOLUME é obrigatório",
            "number.base": "TPVOLUME  deve ser um número"
        }),

    IDEMPRESAORIGEM: Joi.number().required()
        .messages({
            "any.required": "IDEMPRESAORIGEM é obrigatório",
            "number.base": "IDEMPRESAORIGEM  deve ser um número"
        }),

    NOTAFISCAL: Joi.number().required()
        .messages({
            "any.required": "NOTAFISCAL é obrigatório",
            "number.base": "NOTAFISCAL  deve ser um número"
        }),
});


export default schemaFinalizarOTDeposito;
