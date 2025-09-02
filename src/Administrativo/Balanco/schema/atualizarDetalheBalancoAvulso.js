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
   DSPRODUTO: Joi.string().required()
      .messages({
         'string.base': 'O campo DSPRODUTO deve ser uma string',
         'any.required': 'O campo DSPRODUTO é obrigatório'
      }),
   TOTALCONTAGEMGERAL: Joi.number().required()
      .messages({
         'number.base': 'O campo TOTALCONTAGEMGERAL deve ser um número',
         'any.required': 'O campo TOTALCONTAGEMGERAL é obrigatório'
      }),
   PRECOCUSTO: Joi.number().required()
      .messages({
         'number.base': 'O campo PRECOCUSTO deve ser um número',
         'any.required': 'O campo PRECOCUSTO é obrigatório'
      }),
   PRECOVENDA: Joi.number().required()
      .messages({
         'number.base': 'O campo PRECOVENDA deve ser um número',
         'any.required': 'O campo PRECOVENDA é obrigatório'
      }),
   STCANCELADO: Joi.string().required()
      .messages({
         'string.base': 'O campo STCANCELADO deve ser uma string',
         'any.required': 'O campo STCANCELADO é obrigatório'
      }),
   INSBALANCO: Joi.number().required()
      .messages({
         'number.base': 'O campo INSBALANCO deve ser um número',
         'any.required': 'O campo INSBALANCO é obrigatório'
      })
})

export default updateDetalheBalancoAvulsoSchema;    