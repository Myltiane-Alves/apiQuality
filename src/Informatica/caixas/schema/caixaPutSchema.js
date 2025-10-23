import Joi from 'joi';

export const caixaPutSchema = Joi.object({

  DSCAIXAWEB: Joi.string().allow('')
    .messages({
      'string.base': 'DSCAIXAWEB deve ser uma string',
    }),

  TBEMISSAOFISCAL: Joi.string().allow('')
    .messages({
      'string.base': 'TBEMISSAOFISCAL deve ser uma string',
    }),

  NOIMPRESSORA: Joi.string().allow('')
    .messages({
      'string.base': 'NOIMPRESSORA deve ser uma string',
    }),

  DSPORTACOMUNICACAO: Joi.string().allow('')
    .messages({
      'string.base': 'DSPORTACOMUNICACAO deve ser uma string',
    }),

  DTULTALTERACAO: Joi.string().allow('')
    .messages({
      'string.base': 'DTULTALTERACAO deve ser uma string',
    }),

  NUSERIEPROD: Joi.number().integer()
    .messages({
      'number.base': 'NUSERIEPROD deve ser um número inteiro',
      'any.required': 'NUSERIEPROD do caixa é obrigatório'
    }),

  NUNFCEPROD: Joi.number().integer()
    .messages({
      'number.base': 'NUNFCEPROD deve ser um número inteiro',
      'any.required': 'NUNFCEPROD do caixa é obrigatório'
    }),

  STTEF: Joi.string().allow('')
    .messages({
      'string.base': 'STTEF deve ser uma string',
    }),

  STATUALIZA: Joi.string().allow('')
    .messages({
      'string.base': 'STATUALIZA deve ser uma string',
    }),

  STLIMPA: Joi.string().allow('')
    .messages({
      'string.base': 'STLIMPA deve ser uma string',
    }),

  IDCAIXAWEB: Joi.number().integer()
    .messages({
      'number.base': 'IDCAIXAWEB deve ser um número inteiro',
      'any.required': 'IDCAIXAWEB do caixa é obrigatório'
    }),
});
