import Joi from 'joi';

export const menuFilhoSchema = Joi.object({

    DSNOME: Joi.string().allow('').required()
        .messages({
            'string.base': 'DSNOME deve ser uma string',
        }),

    IDMENUPAI: Joi.number().integer().required()
        .messages({
            'number.base': 'IDMENUPAI deve ser um número inteiro',
            'any.required': 'IDMENUPAI é obrigatório'
        }),

    URL: Joi.string().allow('').required()
        .messages({
            'string.base': 'URL deve ser uma string',
        }),

});

export default menuFilhoSchema;