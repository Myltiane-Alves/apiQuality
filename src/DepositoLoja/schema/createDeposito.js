import Joi from "joi";

const createDepositoSchema = Joi.object({
    IDEMPRESA: Joi.number().required()
    .messages({
        'number.base': 'O ID da empresa deve ser um número',
        'any.required': 'O ID da empresa é obrigatório'
    }),
    IDUSR: Joi.number().required()
    .messages({
        'number.base': 'O ID do usuário deve ser um número',
        'any.required': 'O ID do usuário é obrigatório'
    }),
    IDCONTABANCO: Joi.number().required()
    .messages({
        'number.base': 'O ID da conta bancária deve ser um número',
        'any.required': 'O ID da conta bancária é obrigatório'
    }),
    DTDEPOSITO: Joi.string().allow('').required()
    .messages({
        'string.empty': 'A data do depósito é obrigatória',
        'any.required': 'A data do depósito é obrigatória'
    }),
    DTMOVIMENTOCAIXA: Joi.string().allow('').required()
    .messages({
        'string.empty': 'A data do movimento é obrigatória',
        'any.required': 'A data do movimento é obrigatória'
    }),
    DSHISTORIO: Joi.string().allow('')
    .messages({
        'string.empty': 'A descrição do histórico é obrigatória',
    }),
    NUDOCDEPOSITO: Joi.string().allow('')
    .messages({
        'string.empty': 'O número do documento do depósito é obrigatório',
    }),
    VRDEPOSITO: Joi.number()
    .messages({
        'number.base': 'O valor do depósito deve ser um número',
    }),
    STATIVO: Joi.string().allow(''),
    STCANCELADO: Joi.string().allow(''),
    DSPATHDOCDEPOSITO: Joi.string().allow(''),
    DSMOTIVOCANCELAMENTO: Joi.string().allow(''),
    IDUSRCACELAMENTO: Joi.string().allow('')

})

export default createDepositoSchema;