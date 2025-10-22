import { CaixaClient } from "../client/index.js";
import { caixaPutSchema } from "../schema/caixaPutSchema.js";
import { caixaSchema } from "../schema/index.js";
import { caixaServices as CaixaServices } from "../services/index.js";

const caixaClient = new CaixaClient(process.env.API_URL);
const caixaServices = new CaixaServices(caixaClient);

 class CaixaControllers {
    async postCaixaLojas(req, res) {
        
        try {
            const { error, value } = caixaSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });
                //console.log('Dados validados:', value);
            if (error) {
                return res.status(400).json({
                    message: 'Dados inválidos',
                    errors: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message
                    }))
                });
            }

            const response = await caixaServices.createCaixa({
                IDEMPRESA: value.IDEMPRESA,
                DSCAIXA: value.DSCAIXA,
                NUULTNFCE: value.NUULTNFCE,
                NUSERIE: value.NUSERIE,
                TBEMISSAOFISCAL: value.TBEMISSAOFISCAL,
                NOIMPRESSORA: value.NOIMPRESSORA,
                NULINHAIMPRESSORA: value.NULINHAIMPRESSORA,
                DSPORTACOMUNICACAO: value.DSPORTACOMUNICACAO,
                NUBAUD: value.NUBAUD,
                NULINHAENTRECUPOM: value.NULINHAENTRECUPOM,
                STIMPRIMIRUMITEMPORLINHA: value.STIMPRIMIRUMITEMPORLINHA,
                STDANFCERESUMIDO: value.STDANFCERESUMIDO,
                STIGNORARTAGFORMATACAO: value.STIGNORARTAGFORMATACAO,
                STIMPRIMIRDESCACRESITEM: value.STIMPRIMIRDESCACRESITEM,
                STVIACONSUMIDOR: value.STVIACONSUMIDOR,
                STTEF: value.STTEF,
                STBALANCA: value.STBALANCA,
                STGAVETEIRO: value.STGAVETEIRO,
                STSANGRIA: value.STSANGRIA,
                VRMAXSANGRIA: value.VRMAXSANGRIA,
                STCONTROLAHORARIO: value.STCONTROLAHORARIO,
                HRINICIOLOGIN: value.HRINICIOLOGIN,
                HRFIMLOGIN: value.HRFIMLOGIN,
                STSTATUS: value.STSTATUS,
                DTULTALTERACAO: value.DTULTALTERACAO,
                NUSERIEPROD: value.NUSERIEPROD ?? 0,
                NUNFCEPROD: value.NUNFCEPROD ?? 0,
                NUSERIEHOM: value.NUSERIEHOM,
                NUNFCEHOM: value.NUNFCEHOM,
                STATIVO: value.STATIVO,
                VSSISTEMA: value.VSSISTEMA,
                STATUALIZA: value.STATUALIZA,
                STLIMPA: value.STLIMPA
        });
            return res.status(200).json(response);
        } catch (error) {
            console.error("Erro no CaixaControllers.postCaixaLojas", error);
            return res.status(500).json({ error: "Erro no servidor" });
        }
    }

    async putCaixaLoja(req, res) {
        try {
            const { error, value } = caixaPutSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
    console.log("❌ Erro de validação PUT:", error.details);
    return res.status(400).json({
        message: 'Dados inválidos',
        errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
        }))
    });
}


         /*    if (error) {
                return res.status(400).json({
                    message: 'Dados inválidos',
                    errors: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message
                    }))
                });
            } */

            const response = await caixaServices.updateCaixa({
                DSCAIXAWEB: value.DSCAIXAWEB, 
                TBEMISSAOFISCAL: value.TBEMISSAOFISCAL,
                NOIMPRESSORA: value.NOIMPRESSORA,
                DSPORTACOMUNICACAO: value.DSPORTACOMUNICACAO,
                DTULTALTERACAO: value.DTULTALTERACAO,
                NUSERIEPROD: value.NUSERIEPROD,
                NUNFCEPROD: value.NUNFCEPROD,
                STTEF: value.STTEF,
                STATUALIZA: value.STATUALIZA,
                STLIMPA: value.STLIMPA,
                IDCAIXAWEB: value.IDCAIXAWEB,
            });
            
            return res.status(200).json(response);
        } catch (error) {
            console.error("Erro no CaixaControllers.putCaixaLoja", error);
            return res.status(500).json({ error: "Erro no servidor" });
        }
    }
}


export default new CaixaControllers();