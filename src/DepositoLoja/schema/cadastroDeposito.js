import Joi from "joi";

const cadastroDepositoSchema = Joi.array().items(
    Joi.object({
        DTDEPOSITO: Joi.string().required()
        .messages({
            'string.empty': 'A data do depósito é obrigatória',
            'any.required': 'A data do depósito é obrigatória'
        }),
        DTMOVIMENTOCAIXA: Joi.string().required()
        .messages({
            'string.empty': 'A data do movimento é obrigatória',
            'any.required': 'A data do movimento é obrigatória'
        }),
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
        VRDEPOSITO: Joi.number()
        .messages({
            'number.base': 'O valor do depósito deve ser um número',
        }),
        DSHISTORIO: Joi.string()
        .messages({
            'string.empty': 'A descrição do histórico é obrigatória',
        }),
        NUDOCDEPOSITO: Joi.string()
        .messages({
            'string.empty': 'O número do documento do depósito é obrigatório',
        }),
        DSPATHDOCDEPOSITO: Joi.string(),
        DSMOTIVOCANCELAMENTO: Joi.string(),
        IDUSRCACELAMENTO: Joi.number()
        .messages({
            'number.base': 'O ID do usuário de cancelamento deve ser um número',
        }),
        
    })

) 

export default cadastroDepositoSchema;