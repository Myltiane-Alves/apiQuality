import Joi from 'joi';

const confirmarBalancoSchema = Joi.object({
    DSRESUMOBALANCO: Joi.string().required(),
    DTABERTURA: Joi.string().allow(''),
    DTFECHAMENTO: Joi.string().allow(''),
    IDEMPRESA: Joi.number().required(),
    INSBALANCO: Joi.number().required(),
    QTDTOTALFALTA: Joi.number().required(),
    QTDTOTALITENS: Joi.number().required(),
    QTDTOTALSOBRA: Joi.number().required(),
    STATIVO: Joi.string().valid('True', 'False').required(),
    TXTOBSERVACAO: Joi.string().max(255),
    det: Joi.array().items(
        Joi.object({
            CODIGODEBARRAS: Joi.string().required(),
            DSCOLETOR: Joi.string().required(),
            DSPRODUTO: Joi.string().required(),
            IDPRODUTO: Joi.string().required(),
            NUMEROCOLETOR: Joi.number().required(),
            PRECOCUSTO: Joi.number().required(),
            PRECOVENDA: Joi.number().required(),
            STCANCELADO: Joi.string().valid('True', 'False').required(),
            TOTALCONTAGEMATUAL: Joi.number().required(),
            TOTALCONTAGEMGERAL: Joi.number().required(),
        })
    )
});

export default confirmarBalancoSchema;