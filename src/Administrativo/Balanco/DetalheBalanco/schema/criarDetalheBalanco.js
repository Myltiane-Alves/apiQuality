import Joi from "joi";

const criarDetalheBalancoSchema = Joi.object({
    CODIGODEBARRAS: Joi.string().required()
    .messages({
        "string.empty": "O campo CODIGODEBARRAS não pode estar vazio.",
        "any.required": "O campo CODIGODEBARRAS é obrigatório."
    }),
    DSCOLETOR: Joi.string().required()
    .messages({
        "string.empty": "O campo DSCOLETOR não pode estar vazio.",
        "any.required": "O campo DSCOLETOR é obrigatório."
    }),
    DSPRODUTO: Joi.string().required()
    .messages({
        "string.empty": "O campo DSPRODUTO não pode estar vazio.",
        "any.required": "O campo DSPRODUTO é obrigatório."
    }),
    IDPRODUTO: Joi.string().required()
    .messages({
        "string.empty": "O campo IDPRODUTO não pode estar vazio.",
        "any.required": "O campo IDPRODUTO é obrigatório."
    }),
    NUMEROCOLETOR: Joi.number().required()
    .messages({
        "number.base": "O campo NUMEROCOLETOR deve ser um número.",
        "any.required": "O campo NUMEROCOLETOR é obrigatório."
    }),
    PRECOCUSTO: Joi.number().required()
    .messages({
        "number.base": "O campo PRECOCUSTO deve ser um número.",
        "any.required": "O campo PRECOCUSTO é obrigatório."
    }),
    PRECOVENDA: Joi.number().required()
    .messages({
        "number.base": "O campo PRECOVENDA deve ser um número.",
        "any.required": "O campo PRECOVENDA é obrigatório."
    }),
    STCANCELADO: Joi.string().valid('True', 'False').required()
    .messages({
        "any.required": "O campo STCANCELADO é obrigatório."
    }),
    TOTALCONTAGEMATUAL: Joi.number().required()
    .messages({
        "number.base": "O campo TOTALCONTAGEMATUAL deve ser um número.",
        "any.required": "O campo TOTALCONTAGEMATUAL é obrigatório."
    }),
    TOTALCONTAGEMGERAL: Joi.number().required()
    .messages({
        "number.base": "O campo TOTALCONTAGEMGERAL deve ser um número.",
        "any.required": "O campo TOTALCONTAGEMGERAL é obrigatório."
    }),
});

export default criarDetalheBalancoSchema;
