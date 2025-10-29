import Joi from "joi";

export const todosCaixasSchema = Joi.object({
    STATUALIZA: Joi.string().allow('')
        .messages({
            'string.base': 'STLOJAABERTA deve ser uma string',
        }),
    STLIMPAR: Joi.string().allow('')
        .messages({
            'string.base': 'STLOJAABERTA deve ser uma string',
        }),
})

