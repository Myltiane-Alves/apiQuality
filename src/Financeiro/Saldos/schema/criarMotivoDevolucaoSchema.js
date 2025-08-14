import Joi from "joi";

const criarMotivoDevolucaoSchema = Joi.object({
    IDFUNCIONARIO: Joi.number().integer().required()
    .messages({
        "any.required": "O ID é obrigatório",
        "number.base": "O ID deve ser um número"
    }),
    IDFUNCIONARIORESP: Joi.number().integer().required()
    .messages({
        "any.required": "O ID do funcionário responsável é obrigatório",
        "number.base": "O ID do funcionário responsável deve ser um número"
    }),
    TIPOMOVIMENTO: Joi.string().required()
    .messages({
        "any.required": "O tipo de movimento é obrigatório",
        "string.empty": "O tipo de movimento não pode estar vazio"
    }),
    VRMOVIMENTO: Joi.number().min(0).required()
    .messages({
        "any.required": "O valor do movimento é obrigatório",
        "number.base": "O valor do movimento deve ser um número",
        "number.min": "O valor do movimento deve ser maior ou igual a zero"
    }),
    OBSERVACAO: Joi.string().max(500).optional()
    .messages({
        "string.max": "A observação deve ter no máximo 500 caracteres",
        "string.empty": "A observação não pode estar vazia"

    })
});

export default criarMotivoDevolucaoSchema;
