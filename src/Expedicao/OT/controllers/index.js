import 'dotenv/config';
import { OTClient } from "../Client/index.js";
import { OTService } from "../Services/index.js";
import criarOTSchema from '../Schema/criarOTSchema.js';
import atualizarOTSchema from '../Schema/atualizarOTSchema.js';
const url = process.env.API_URL;
const otClient = new OTClient(url);
const otService = new OTService(otClient);

class OrdemTransferenciaControllers {

    async putResumoOrdemTransferencia(req, res) {
        
        try {
            const {error, value} = atualizarOTSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });
    
            if(error) {
                return res.status(400).json({
                    message: 'Dados inválidos',
                    errors: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message
                    }))
                });
            }

            if(!value.IDRESUMOOT) {
                return res.status(400).json({message: 'IDRESUMOOT é obrigatório.'});
            }
     

            const response = await otService.updateOT(
                    value.IDEMPRESAORIGEM,
                    value.IDEMPRESADESTINO,
                    value.DATAEXPEDICAO,
                    value.IDOPERADOREXPEDICAO,
                    value.NUTOTALITENS,
                    value.QTDTOTALITENS,
                    value.QTDTOTALITENSRECEPCIONADO,
                    value.QTDTOTALITENSDIVERGENCIA,
                    value.NUTOTALVOLUMES,
                    value.TPVOLUME,
                    value.VRTOTALCUSTO,
                    value.VRTOTALVENDA,
                    value.DTRECEPCAO,
                    value.IDOPERADORRECEPTOR,
                    value.DSOBSERVACAO,
                    value.IDUSRCANCELAMENTO,
                    value.DTULTALTERACAO,
                    value.IDSTDIVERGENCIA,
                    value.OBSDIVERGENCIA,
                    value.STEMISSAONFE,
                    value.NUMERONFE,
                    value.STENTRADAINVENTARIO,
                    value.QTDCONFERENCIA,
                    value.dadosdetalheot,
                    value.IDRESUMOOT,
                    value.IDSTATUSOT,
                    value.IDUSRAJUSTE,
                    value.DTAJUSTE,
                    value.QTDTOTALITENSAJUSTE,
                    value.CONFEREITENS,
                    value.IDROTINA,
                    value.DATAENTREGA
    
            );
    
            if(!value.IDEMPRESADESTINO) {
                return res.status(400).json({message: 'IDEMPRESADESTINO é obrigatório.'});
            }
    
            if(!value.IDEMPRESAORIGEM) {
                return res.status(400).json({message: 'IDEMPRESAORIGEM é obrigatório.'});
            }
           
            return res.status(200).json(response);
        } catch(error) {
            console.log('Erro ao atualizar ordem de transferência:', error);
            return res.status(500).json({message: 'Erro ao atualizar ordem de transferência.'});
            
        }
    }

    async postResumoOrdemTransferencia(req, res) {
        
        try {
            const {error, value} = criarOTSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });
    
            if(error) {
                return res.status(400).json({
                    message: 'Dados inválidos',
                    errors: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message
                    }))
                });
            }

            const response = await otService.createOT(
                    value.IDRESUMOOT,
                    value.IDEMPRESAORIGEM,
                    value.IDEMPRESADESTINO,
                    value.DATAEXPEDICAO,
                    value.IDOPERADOREXPEDICAO,
                    value.NUTOTALITENS,
                    value.QTDTOTALITENS,
                    value.QTDTOTALITENSRECEPCIONADO,
                    value.QTDTOTALITENSDIVERGENCIA,
                    value.NUTOTALVOLUMES,
                    value.TPVOLUME,
                    value.VRTOTALCUSTO,
                    value.VRTOTALVENDA,
                    value.DTRECEPCAO,
                    value.IDOPERADORRECEPTOR,
                    value.DSOBSERVACAO,
                    value.IDUSRCANCELAMENTO,
                    value.DTULTALTERACAO,
                    value.IDSTDIVERGENCIA,
                    value.OBSDIVERGENCIA,
                    value.STEMISSAONFE,
                    value.NUMERONFE,
                    value.STENTRADAINVENTARIO,
                    value.QTDCONFERENCIA,
                    value.dadosdetalheot,
                    value.IDRESUMOOT,
                    value.IDSTATUSOT,
                    value.IDUSRAJUSTE,
                    value.DTAJUSTE,
                    value.QTDTOTALITENSAJUSTE,
                    value.CONFEREITENS,
                    value.IDROTINA,
                    value.DATAENTREGA
    
            );
    
            if(!value.IDEMPRESADESTINO) {
                return res.status(400).json({message: 'IDEMPRESADESTINO é obrigatório.'});
            }
    
            if(!value.IDEMPRESAORIGEM) {
                return res.status(400).json({message: 'IDEMPRESAORIGEM é obrigatório.'});
            }
           
            return res.status(200).json(response);
        } catch(error) {
            console.log('Erro ao atualizar ordem de transferência:', error);
            return res.status(500).json({message: 'Erro ao atualizar ordem de transferência.'});
            
        }
    }
}

export default new OrdemTransferenciaControllers();