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
    TXTOBSERVACAO: Joi.string().max(255)
});

export default confirmarBalancoSchema;