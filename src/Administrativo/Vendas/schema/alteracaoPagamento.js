import Joi from 'joi';

const alterarVendaPagamentoSchema = Joi.object({
    IDVENDA: Joi.string().required()
    .messages({
        'string.base': 'IDVENDA deve ser uma string.',
        'any.required': 'IDVENDA é um campo obrigatório.'
    }),
    STCANCELADO: Joi.string().valid('True', 'False')
    .messages({
        'string.base': 'STCANCELADO deve ser uma string.',
    }),
    DTULTIMAALTERACAO: Joi.date().iso()
    .messages({
        'date.base': 'DTULTIMAALTERACAO deve ser uma data válida.',
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