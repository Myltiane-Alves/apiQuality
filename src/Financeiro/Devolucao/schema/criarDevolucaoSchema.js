import Joi from 'joi';

const criarDevolucaoSchema = Joi.object({
    IDUSUARIO: Joi.number().integer().positive().required()
        .messages({
            'number.base': 'IDUSUARIO deve ser um número',
            'any.required': 'IDUSUARIO é obrigatório'
        }),
    DSMOTIVO: Joi.string().max(500).required()
        .messages({
            'string.base': 'DSMOTIVO deve ser uma string',
            'string.max': 'DSMOTIVO deve ter no máximo 500 caracteres',
            'any.required': 'DSMOTIVO é obrigatório'
        })
});

export default criarDevolucaoSchema;