import Joi from 'joi';

const updateBalancoConsolidadoSchema = Joi.object({
    IDRESUMOBALANCO: Joi.number().integer().required()
    .messages({
        'number.base': 'IDRESUMOBALANCO deve ser um número',
        'number.integer': 'IDRESUMOBALANCO deve ser um número inteiro',
        'any.required': 'IDRESUMOBALANCO é um campo obrigatório'
    }),
    OBSCONTAGEM: Joi.string().max(255).allow('')
    .messages({
        'string.base': 'OBSCONTAGEM deve ser uma string',
        'string.max': 'OBSCONTAGEM deve ter no máximo 255 caracteres',
    }),
    OBSDIVERGENCIACONTAGEM: Joi.string().max(255).allow('')
    .messages({
        'string.base': 'OBSDIVERGENCIACONTAGEM deve ser uma string',
        'string.max': 'OBSDIVERGENCIACONTAGEM deve ter no máximo 255 caracteres',
        'any.required': 'OBSDIVERGENCIACONTAGEM é um campo obrigatório'
    }),
    OBSDIVERGENCIAGERENTE: Joi.string().max(255).allow('')
    .messages({
        'string.base': 'OBSDIVERGENCIAGERENTE deve ser uma string',
        'string.max': 'OBSDIVERGENCIAGERENTE deve ter no máximo 255 caracteres',
        'any.required': 'OBSDIVERGENCIAGERENTE é um campo obrigatório'
    })

});

export default updateBalancoConsolidadoSchema;
