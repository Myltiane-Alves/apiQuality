import Joi from "joi";

const updateEmpresaSchema = Joi.object({
    IDEMPRESA: Joi.number().integer().required()
        .messages({
            "number.base": "IDEMPRESA must be a number",
            "any.required": "IDEMPRESA is a required field"
        }),
    IDGRUPOEMPRESARIAL: Joi.number().integer().required()
        .messages({
            "number.base": "IDGRUPOEMPRESARIAL must be a number",
            "any.required": "IDGRUPOEMPRESARIAL is required field"
        }),
    IDSUBGRUPOEMPRESARIAL: Joi.number().integer().required()
        .messages({
            "number.base": "IDSUBGRUPOEMPRESARIAL must be a number",
            "any.required": "IDSUBGRUPOEMPRESARIAL is required field"
        }),
    NORAZAOSOCIAL: Joi.string().allow("")
        .messages({
            "string.base": "NORAZAOSOCIAL must be a string",

        }),
    NOFANTASIA: Joi.string().allow("")
        .messages({
            "string.base": "NOFANTASIA must be a string",

        }),
    NUCNPJ: Joi.string().allow("")
        .messages({
            "string.base": "NUCNPJ must be a string",
        }),
    NUINSCESTADUAL: Joi.string().allow("")
        .messages({
            "string.base": "NUINSCESTADUAL must be a string",
        }),
    NUINSCMUNICIPAL: Joi.string().allow("")
        .messages({
            "string.base": "NUINSCMUNICIPAL must be a string",
        }),
    CNAE: Joi.string().allow("")
        .messages({
            "string.base": "CNAE must be a string",
        }),
    EENDERECO: Joi.string().allow("")
        .messages({
            "string.base": "EENDERECO must be a string",
        }),
    ECOMPLEMENTO: Joi.string().allow("")
        .messages({
            "string.base": "ECOMPLEMENTO must be a string",
        }),
    EBAIRRO: Joi.string().allow("")
        .messages({
            "string.base": "EBAIRRO must be a string",
        }),
    ECIDADE: Joi.string().allow("")
        .messages({
            "string.base": "ECIDADE must be a string",
        }),
    SGUF: Joi.string().allow("")
        .messages({
            "string.base": "SGUF must be a string",
        }),
    NUUF: Joi.number().integer().required()
        .messages({
            "number.base": "SGUF must be a string",
            'any.required': 'NUUF is a required field'
        }),

    NUCEP: Joi.string().allow("")
        .messages({
            "string.base": "NUCEP must be a string",
        }),
    NUIBGE: Joi.string().allow("")
        .messages({
            "string.base": "NUIBGE must be a string",
        }),
    EEMAILPRINCIPAL: Joi.string().allow("")
        .messages({
            "string.base": "SGUF must be a string",
        }),
    EEMAILCOMERCIAL: Joi.string().allow("")
        .messages({
            "string.base": "SGUF must be a string",
        }),
    EEMAILFINANCEIRO: Joi.string().allow("")
        .messages({
            "string.base": "EEMAILFINANCEIRO must be a string",
        }),
    EEMAILCONTABILIDADE: Joi.string().allow("")
        .messages({
            "string.base": "EEMAILCONTABILIDADE must be a string",
        }),
    NUTELPUBLICO: Joi.string().allow("")
        .messages({
            "string.base": "NUTELPUBLICO must be a string",
        }),
    NUTELCOMERCIAL: Joi.string().allow("")
        .messages({
            "string.base": "NUTELCOMERCIAL must be a string",
        }),
    NUTELFINANCEIRO: Joi.string().allow("")
        .messages({
            "string.base": "NUTELCOMERCIAL must be a string",
        }),
    NUTELGERENCIA: Joi.string().allow("")
        .messages({
            "string.base": "NUTELCOMERCIAL must be a string",
        }), EURL: Joi.string().allow("")
            .messages({
                "string.base": "EURL must be a string",
            }), PATHIMG: Joi.string().allow("")
                .messages({
                    "string.base": "PATHIMG must be a string",
                }),
    NUCNAE: Joi.string().allow("")
        .messages({
            "string.base": "NUCNAE must be a string",
        }),
    STECOMMERCE: Joi.string().allow("")
        .messages({
            "string.base": "STECOMMERCE must be a string",
        }),
    DTULTATUALIZACAO: Joi.string().allow("")
        .messages({
            "string.base": "STECOMMERCE must be a string",
        }),
    STATIVO: Joi.string().allow("")
        .messages({
            "string.base": "STATIVO must be a string",

        }),

    ALIQPIS: Joi.number().integer().required()
        .messages({
            'number.base': 'ALIQPIS must be a number',
            'any.required': 'ALIQPIS is a required field'
        }),
    ALIQCOFINS: Joi.number().integer().required()
        .messages({
            'number.base': 'ALIQCOFINS must be a number',
            'any.required': 'ALIQCOFINS is a required field'
        }),
    IDEMPRESA: Joi.number().integer().required()
        .messages({
            'number.base': 'IDEMPRESA must be a number',
            'any.required': 'IDEMPRESA is a required field'
        }),

})




// DTULTATUALIZACAO,
// STATIVO,
// ALIQPIS,
// ALIQCOFINS,
// IDEMPRESA,