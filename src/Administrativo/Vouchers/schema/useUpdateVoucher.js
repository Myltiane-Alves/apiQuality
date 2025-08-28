import Joi from 'joi';

const updateVoucherSchema = Joi.object({
  IDVOUCHER: Joi.number().integer().required()
  .messages({
    'number.base': 'IDVOUCHER must be a number',
    'any.required': 'IDVOUCHER is a required field'
  }),
  STATIVO: Joi.string().allow(''),
  STCANCELADO: Joi.string().allow(''),
  DSMOTIVOTROCASTATUS: Joi.string().max(255).allow(''),
  STSTATUS: Joi.string().allow(''),
  STTIPOTROCA: Joi.string().allow(''),
  IDFUNCIONARIO: Joi.number().integer().required(),
  IDEMPRESALOGADA: Joi.number().integer().required(),
  IDGRUPOEMPRESARIAL: Joi.number().integer().required(),
});

export default updateVoucherSchema;