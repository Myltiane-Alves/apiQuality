import Joi from 'joi';

const confirmarBalancoSchema = Joi.object({
    DSRESUMOBALANCO: Joi.string().required(),
    DTABERTURA: Joi.date().required(),
    DTFECHAMENTO: Joi.date().required(),
    IDEMPRESA: Joi.number().required(),
    INSBALANCO: Joi.number().required(),
    QTDTOTALFALTA: Joi.number().required(),
    QTDTOTALITENS: Joi.number().required(),
    QTDTOTALSOBRA: Joi.number().required(),
    STATIVO: Joi.string().valid('True', 'False').required(),
    TXTOBSERVACAO: Joi.string().max(255),
    det: Joi.array().items(
        Joi.object({
            NUMEROCOLETOR: Joi.number().required(),
            IDPRODUTO: Joi.number().required(),
            CODIGODEBARRAS: Joi.string().max(255).required(),
            DSPRODUTO: Joi.string().max(255).required(),
            TOTALCONTAGEMATUAL: Joi.number().required(),
            TOTALCONTAGEMGERAL: Joi.number().required(),
            PRECOCUSTO: Joi.number().required(),
            PRECOVENDA: Joi.number().required(),
            STCANCELADO: Joi.string().valid('True', 'False').required(),
            DSCOLETOR: Joi.string().max(255).required()
        })
    )
});

export default confirmarBalancoSchema;