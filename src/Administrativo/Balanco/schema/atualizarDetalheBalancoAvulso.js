import Joi from 'joi';

const updateDetalheBalancoAvulsoSchema = Joi.object({
     IDEMPRESA: Joi.number().required(),
     NUMEROCOLETOR: Joi.number().required(),
     DSCOLETOR: Joi.string().max(255).required(),
     IDPRODUTO: Joi.number().required(),
     TOTALCONTAGEMGERAL: Joi.number().required()
})

export default updateDetalheBalancoAvulsoSchema;    