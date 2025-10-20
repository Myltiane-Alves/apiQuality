import Joi from "joi";

const atualizarOTSchema = Joi.object({
    IDRESUMOOT: Joi.number().required()
    .messages({
        "any.required": "O ID do resumo da OT é obrigatório",
        "number.base": "O ID do resumo da OT deve ser um número"
    })
})