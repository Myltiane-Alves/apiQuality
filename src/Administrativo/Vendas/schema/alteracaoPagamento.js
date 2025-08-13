import Joi from 'joi';

const alterarVendaPagamentoSchema = Joi.object({
    IDVENDA: Joi.number().integer().required()
    .messages({
        'number.base': 'IDVENDA deve ser um número inteiro.',
        'any.required': 'IDVENDA é um campo obrigatório.'
    }),
    STCANCELADO: Joi.string().valid('True', 'False')
    .messages({
        'string.base': 'STCANCELADO deve ser uma string.',
    }),
    DTULTIMAALTERACAO: Joi.date().iso()
    .messages({
        'date.base': 'DTULTIMAALTERACAO deve ser uma data válida.',
        'date.format': 'DTULTIMAALTERACAO deve estar no formato ISO 8601.'
    }),
    IDFUNCIONARIOCANCELA: Joi.number().integer().required()
    .messages({
        'number.base': 'IDFUNCIONARIOCANCELA deve ser um número inteiro.',
        'any.required': 'IDFUNCIONARIOCANCELA é um campo obrigatório.'
    }),
    TXTMOTIVOCANCELA: Joi.string().max(255).required()
    .messages({
        'string.base': 'TXTMOTIVOCANCELA deve ser uma string.',
        'string.max': 'TXTMOTIVOCANCELA deve ter no máximo 255 caracteres.',
        'any.required': 'TXTMOTIVOCANCELA é um campo obrigatório.'
    })
})

export default alterarVendaPagamentoSchema;