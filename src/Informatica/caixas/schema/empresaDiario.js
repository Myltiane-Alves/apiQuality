import Joi from "joi";

export const empresaDiarioSchema = Joi.object({
    IDEMPRESA: Joi.number().integer().required().messages({
        "number.base": "IDEMPRESA deve ser um número inteiro",
        "any.required": "IDEMPRESA é obrigatório"
    }),
    HORAATUALIZA: Joi.string().allow('')
        .messages({
            'string.base': 'HORAATUALIZA deve ser uma string',
        }),
    STATUALIZADIARIO: Joi.string().allow('')
        .messages({
            'string.base': 'STATUALIZADIARIO deve ser uma string',
        }),
    STLOJAABERTA: Joi.string().allow('')
        .messages({
            'string.base': 'STLOJAABERTA deve ser uma string',
        }),
    IDFUNCIONARIOSUPERVISOR: Joi.number().integer().required().messages({
        "number.base": "IDFUNCIONARIOSUPERVISOR deve ser um número inteiro",
        "any.required": "IDFUNCIONARIOSUPERVISOR é obrigatório"
    }),

});
