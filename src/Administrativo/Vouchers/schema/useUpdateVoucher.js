import Joi from 'joi';

const updateVoucherSchema = Joi.object({
  IDVOUCHER: Joi.number().integer().required()
  .messages({
    'number.base': 'IDVOUCHER must be a number',
    'any.required': 'IDVOUCHER is a required field'
  }),
  STATIVO: Joi.string().allow('')
  .messages({
    'string.base': 'STATIVO must be a string',
  }),
  STCANCELADO: Joi.string().allow('')
  .messages({
    'string.base': 'STCANCELADO must be a string',
  }),
  DSMOTIVOTROCASTATUS: Joi.string().max(255).allow('')
  .messages({
    'string.base': 'DSMOTIVOTROCASTATUS must be a string',
    'string.max': 'DSMOTIVOTROCASTATUS must be at most 255 characters long'
  }),
  STSTATUS: Joi.string().allow('')
  .messages({
    'string.base': 'STSTATUS must be a string',
  }),
  STTIPOTROCA: Joi.string().allow('')
  .messages({
    'string.base': 'STTIPOTROCA must be a string',
  }),
  IDFUNCIONARIO: Joi.number().integer().required()
  .messages({
    'number.base': 'IDFUNCIONARIO must be a number',
    'any.required': 'IDFUNCIONARIO is a required field'
  }),
  IDEMPRESALOGADA: Joi.number().integer().required()
  .messages({
    'number.base': 'IDEMPRESALOGADA must be a number',
    'any.required': 'IDEMPRESALOGADA is a required field'
  }),
  IDGRUPOEMPRESARIAL: Joi.number().integer().required()
  .messages({
    'number.base': 'IDGRUPOEMPRESARIAL must be a number',
    'any.required': 'IDGRUPOEMPRESARIAL is a required field'
  }),
});

export default updateVoucherSchema;