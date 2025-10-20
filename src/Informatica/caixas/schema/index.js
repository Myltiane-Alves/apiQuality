import Joi from 'joi';

export const caixaSchema = Joi.object({
    IDEMPRESA: Joi.number().integer().required()
        .messages({
            'number.base': 'IDEMPRESA deve ser um número inteiro',
            'any.required': 'IDEMPRESA do caixa é obrigatório'
        }),
    NUSERIEPROD: Joi.number().integer().required()
        .messages({
            'number.base': 'NUSERIEPROD deve ser um número inteiro',
            'any.required': 'NUSERIEPROD do caixa é obrigatório'
        }),
    NUNFCEPROD: Joi.number().integer().required()
        .messages({
            'number.base': 'NUNFCEPROD deve ser um número inteiro',
            'any.required': 'NUNFCEPROD do caixa é obrigatório'
        }),
    DSCAIXA: Joi.string().allow('')
        .messages({
            'string.base': 'DSCAIXA deve ser uma string',
            'string.max': 'DSCAIXA deve ter no máximo 500 caracteres'
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
    NUNFCEPROD: Joi.number().integer().required()
        .messages({
            'number.base': 'NUNFCEPROD deve ser um número inteiro',
            'any.required': 'NUNFCEPROD do caixa é obrigatório'
        }),
    STATUALIZA: Joi.string().allow('')
        .messages({
            'string.base': 'DSPORTACOMUNICACAO deve ser uma string',
        }),
    STLIMPA: Joi.string().allow('')
        .messages({
            'string.base': 'DSPORTACOMUNICACAO deve ser uma string',
        }),

    NUULTNFCE: Joi.number().integer().required()
        .messages({
            'number.base': 'NUULTNFCE deve ser um número inteiro',
            'any.required': 'NUULTNFCE é obrigatório'
        }),

    NUSERIE: Joi.number().integer().required()
        .messages({
            'number.base': 'NUSERIE deve ser um número inteiro',
            'any.required': 'NUSERIE é obrigatório'
        }),

    NULINHAIMPRESSORA: Joi.number().integer().required()
        .messages({
            'number.base': 'NULINHAIMPRESSORA deve ser um número inteiro',
            'any.required': 'NULINHAIMPRESSORA é obrigatório'
        }),
    NUBAUD: Joi.string().allow('')
        .messages({
            'string.base': 'NUBAUD deve ser uma string',
        }),
    NULINHAENTRECUPOM: Joi.number().integer()
        .messages({
            'number.base': 'NULINHAENTRECUPOM deve ser um número inteiro',
        }),
    STIMPRIMIRUMITEMPORLINHA: Joi.string().allow('')
        .messages({
            'string.base': 'STIMPRIMIRUMITEMPORLINHA deve ser uma string',
        }),
    STDANFCERESUMIDO: Joi.string().allow('')
        .messages({
            'string.base': 'STDANFCERESUMIDO deve ser uma string',
        }),
    STIGNORARTAGFORMATACAO: Joi.string().allow('')
        .messages({
            'string.base': 'STIGNORARTAGFORMATACAO deve ser uma string',
        }),
    STIMPRIMIRDESCACRESITEM: Joi.string().allow('')
        .messages({
            'string.base': 'STIMPRIMIRDESCACRESITEM deve ser uma string',
        }),
    STVIACONSUMIDOR: Joi.string().allow('')
        .messages({
            'string.base': 'STVIACONSUMIDOR deve ser uma string',
        }),
    STTEF: Joi.string().allow('')
        .messages({
            'string.base': 'STTEF deve ser uma string',
        }),
    STBALANCA: Joi.string().allow('')
        .messages({
            'string.base': 'STBALANCA deve ser uma string',
        }),
    STGAVETEIRO: Joi.string().allow('')
        .messages({
            'string.base': 'STGAVETEIRO deve ser uma string',
        }),
    VRMAXSANGRIA: Joi.number().integer()
        .messages({
            'number.base': 'VRMAXSANGRIA deve ser um número inteiro',
        }),
    STCONTROLAHORARIO: Joi.string().allow('')
        .messages({
            'string.base': 'STCONTROLAHORARIO deve ser uma string',
        }),
    HRINICIOLOGIN: Joi.string().allow('')
        .messages({
            'string.base': 'HRINICIOLOGIN deve ser uma string',
        }),
    HRFIMLOGIN: Joi.string().allow('')
        .messages({
            'string.base': 'HRFIMLOGIN deve ser uma string',
        }),
    STSTATUS: Joi.string().allow('')
        .messages({
            'string.base': 'STSTATUS deve ser uma string',
        }),
    NUSERIEHOM: Joi.number().integer()
        .messages({
            'number.base': 'NUSERIEHOM deve ser um número inteiro',
        }),
    NUNFCEHOM: Joi.number().integer()
        .messages({
            'number.base': 'NUNFCEHOM deve ser um número inteiro',
        }),
    STATIVO: Joi.string().allow('')
        .messages({
            'string.base': 'STATIVO deve ser uma string',
        }),
    VSSISTEMA: Joi.string().allow('')
        .messages({
            'string.base': 'VSSISTEMA deve ser uma string',
        }),

    DTULTALTERACAO: Joi.string().allow('')
        .messages({
            'string.base': 'DTULTALTERACAO deve ser uma string',
        }),

})        