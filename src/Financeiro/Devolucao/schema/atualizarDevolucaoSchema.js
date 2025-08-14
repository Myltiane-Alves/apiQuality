import Joi from 'joi';

const atualizarDevolucaoSchema = Joi.object({
    IDMOTIVODEVOLUCAO: Joi.number().integer().positive().required()
    .messages({
        'number.base': 'ID do motivo de devolução deve ser um número',
        'number.integer': 'ID do motivo de devolução deve ser um número inteiro',
        'number.positive': 'ID do motivo de devolução deve ser um número positivo',
        'any.required': 'ID do motivo de devolução é um campo obrigatório'
    }),
    DSMOTIVO: Joi.string().min(2).max(500).required()
    .messages({
        'string.base': 'Descrição do motivo de devolução deve ser um texto',
        'string.min': 'Descrição do motivo de devolução deve ter pelo menos 2 caracteres',
        'string.max': 'Descrição do motivo de devolução deve ter no máximo 500 caracteres',
        'any.required': 'Descrição do motivo de devolução é um campo obrigatório'
    }),
    IDUSUARIO: Joi.number().integer().positive().required()
    .messages({
        'number.base': 'ID do usuário deve ser um número',
        'number.integer': 'ID do usuário deve ser um número inteiro',
        'number.positive': 'ID do usuário deve ser um número positivo',
        'any.required': 'ID do usuário é um campo obrigatório'
    }),
    STATIVO: Joi.string().valid('ATIVO', 'INATIVO').required()
    .messages({
        'string.base': 'Status deve ser um texto',
        'any.only': 'Status deve ser ATIVO ou INATIVO',
        'any.required': 'Status é um campo obrigatório'
    })
})

export default atualizarDevolucaoSchema;