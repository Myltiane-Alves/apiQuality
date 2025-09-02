import Joi from 'joi';

const updateDetalheBalancoAvulsoSchema = Joi.object({
     IDEMPRESA: Joi.number().integer().required()
     .messages({
        'number.base': 'O campo IDEMPRESA deve ser um número',
        'number.integer': 'O campo IDEMPRESA deve ser um número inteiro',
        'any.required': 'O campo IDEMPRESA é obrigatório'
     }),
     NUMEROCOLETOR: Joi.number().required()
     .messages({
        'number.base': 'O campo NUMEROCOLETOR deve ser um número',
        'any.required': 'O campo NUMEROCOLETOR é obrigatório'
     }),
     DSCOLETOR: Joi.string().max(255).allow('')
     .messages({
        'string.base': 'O campo DSCOLETOR deve ser uma string',
        'string.max': 'O campo DSCOLETOR deve ter no máximo 255 caracteres'
     }),
     IDPRODUTO: Joi.string().required()
     .messages({
        'string.base': 'O campo IDPRODUTO deve ser uma string',
        'any.required': 'O campo IDPRODUTO é obrigatório'
     }),
     CODIGODEBARRAS: Joi.string().required()
     .messages({
        'string.base': 'O campo CODIGODEBARRAS deve ser uma string',
        'any.required': 'O campo CODIGODEBARRAS é obrigatório'
     }),
     TOTALCONTAGEMGERAL: Joi.number().required()
     .messages({
        'number.base': 'O campo TOTALCONTAGEMGERAL deve ser um número',
        'any.required': 'O campo TOTALCONTAGEMGERAL é obrigatório'
     })
})

export default updateDetalheBalancoAvulsoSchema;    