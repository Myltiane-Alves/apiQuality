import Joi from 'joi';

export const duplicarPermicaoSchema = Joi.object({

    IDUSUARIO: Joi.number().integer()
        .messages({
            'number.base': 'IDUSUARIO deve ser um número',
            'any.required': 'IDUSUARIO é obrigatório'
        }),

    CRIAR: Joi.string().allow('').required()
        .messages({
            'string.base': 'IDUSUARIO deve ser uma string',
        }),

    ALTERAR: Joi.string().allow('').required()
        .messages({
            'string.base': 'ALTERAR deve ser uma string',
        }),

    STATIVO: Joi.string().allow('')
        .messages({
            'string.base': 'STATIVO deve ser uma string',
        }),

    DATAULTIMAALTERACAO: Joi.string().allow('')
        .messages({
            'string.base': 'DATAULTIMAALTERACAO deve ser uma string',
        }),

    DATA_CRIACAO: Joi.string().allow('')
        .messages({
            'string.base': 'DATA_CRIACAO deve ser uma string',
        }),

    IDMODULO: Joi.string().allow('')
        .messages({
            'string.base': 'IDMODULO deve ser uma string',
        }),

    IDMODULOADMINISTRATIVO: Joi.string().allow('')
        .messages({
            'string.base': 'IDMODULOADMINISTRATIVO deve ser uma string',
        }),

    IDMODULOCOMERCIAL: Joi.string().allow('')
        .messages({
            'string.base': 'IDMODULOCOMERCIAL deve ser uma string',
        }),

    IDMODULOCONTABILIDADE: Joi.string().allow('')
        .messages({
            'string.base': 'IDMODULOCONTABILIDADE deve ser uma string',
        }),

    IDMODULOFINANCEIRO: Joi.string().allow('')
        .messages({
            'string.base': 'IDMODULOFINANCEIRO deve ser uma string',
        }),

    IDMODULOGERENCIA: Joi.string().allow('')
        .messages({
            'string.base': 'IDMODULOFINANCEIRO deve ser uma string',
        }),

    IDMODULOINFORMATICA: Joi.string().allow('')
        .messages({
            'string.base': 'IDMODULOFINANCEIRO deve ser uma string',
        }),

    IDMODULOMARKETING: Joi.string().allow('')
        .messages({
            'string.base': 'IDMODULOFINANCEIRO deve ser uma string',
        }),

    IDMODULOCOMPRAS: Joi.string().allow('')
        .messages({
            'string.base': 'IDMODULOCOMPRAS deve ser uma string',
        }),

    IDMODULOCADASTRO: Joi.string().allow('')
        .messages({
            'string.base': 'IDMODULOCADASTRO deve ser uma string',
        }),

    IDMODULOEXPEDICAO: Joi.string().allow('')
        .messages({
            'string.base': 'IDMODULOEXPEDICAO deve ser uma string',
        }),

    IDMODULOCOMPRASADM: Joi.string().allow('')
        .messages({
            'string.base': 'IDMODULOCOMPRASADM deve ser uma string',
        }),


    IDMODULOETIQUETAGEM: Joi.string().allow('')
        .messages({
            'string.base': 'IDMODULOETIQUETAGEM deve ser uma string',
        }),

    IDMODULOCONFERENCIACEGA: Joi.string().allow('')
        .messages({
            'string.base': 'IDMODULOCONFERENCIACEGA deve ser uma string',
        }),

    IDMODULOVOUCHER: Joi.string().allow('')
        .messages({
            'string.base': 'IDMODULOVOUCHER deve ser uma string',
        }),

    IDMODULOMALOTE: Joi.string().allow('')
        .messages({
            'string.base': 'IDMODULOMALOTE deve ser uma string',
        }),

    IDMODULORH: Joi.string().allow('')
        .messages({
            'string.base': 'IDMODULORH deve ser uma string',
        }),

    IDUSERULTIMAALTERACAO: Joi.string().allow('')
        .messages({
            'string.base': 'IDUSERULTIMAALTERACAO deve ser uma string',
        }),

    IDPERMISSAO: Joi.string().allow('')
        .messages({
            'string.base': 'IDPERMISSAO deve ser uma string',
        }),

    IDMODULORESUMOVENDAS: Joi.string().allow('')
        .messages({
            'string.base': 'IDMODULORESUMOVENDAS deve ser uma string',
        }),

    IDMODULOPROMOCAO: Joi.string().allow('')
        .messages({
            'string.base': 'IDMODULOPROMOCAO deve ser uma string',
        }),

    ADMINISTRADOR: Joi.string().allow('').required()
        .messages({
            'string.base': 'ADMINISTRADOR deve ser uma string',
        }),

    N4: Joi.string().allow('')
        .messages({
            'string.base': 'N4 deve ser uma string',
        }),

    N3: Joi.string().allow('')
        .messages({
            'string.base': 'N3 deve ser uma string',
        }),

    N2: Joi.string().allow('')
        .messages({
            'string.base': 'N2 deve ser uma string',
        }),

    N1: Joi.string().allow('')
        .messages({
            'string.base': 'N1 deve ser uma string',
        }),

    IDMENU: Joi.number().integer().required()
        .messages({
            'number.base': 'IDMENU deve ser um número',
            'any.required': 'IDMENU é obrigatório'
        }),

    IDMENUFILHO: Joi.number().integer().required()
        .messages({
            'number.base': 'IDMENUFILHO deve ser um número',
            'any.required': 'IDMENUFILHO é obrigatório'
        }),

})
