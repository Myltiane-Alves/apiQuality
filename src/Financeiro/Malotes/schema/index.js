import Joi from 'joi';

const maloteSchema = Joi.object({
    IDMALOTE: Joi.number().integer().required()
    .messages({
        'number.base': 'IDMALOTE deve ser um número inteiro',
        'any.required': 'ID do malote é obrigatório'
    }),
    STATUS: Joi.string().allow('').max(500).optional()
    .messages({
        'string.base': 'STATUS deve ser uma string',
        'string.max': 'STATUS deve ter no máximo 500 caracteres'
    }),
    
    OBSERVACAOADMINISTRATIVO: Joi.string().allow('').max(500).optional()
    .messages({
        'string.base': 'OBSERVACAOADMINISTRATIVO deve ser uma string',
        'string.max': 'OBSERVACAOADMINISTRATIVO deve ter no máximo 500 caracteres'
    }),
    PENDENCIAS: Joi.array().items(
        Joi.object({
            IDPENDENCIA: Joi.number().integer().required()
        })
    ).optional().default([])
    .messages({
        'array.base': 'PENDENCIAS deve ser um array de objetos',
        'any.required': 'PENDENCIAS é obrigatório'
    }),
     IDUSERULTIMAALTERACAO: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'IDUSERULTIMAALTERACAO deve ser um número',
      'any.required': 'IDUSERULTIMAALTERACAO é obrigatório'
    })

});

export default maloteSchema;