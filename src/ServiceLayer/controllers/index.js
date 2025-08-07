
import { DepositoService } from "../services/index.js";
import { ServiceLayerClient } from "../client/index.js";
const sapClient = new ServiceLayerClient(process.env.API_URL);
const depositoService = new DepositoService(sapClient);

class ServiceLayerControllers {

    async postDepositoIntegrarNoSAP(req, res) {
        
        try {

            let {IDDEPOSITOLOJA} = req.body;

            if (Array.isArray(req.body) && req.body.length > 0) {
                IDDEPOSITOLOJA = req.body[0].IDDEPOSITOLOJA;
            } else {
                IDDEPOSITOLOJA = req.body.IDDEPOSITOLOJA;
            }
            
            const message = await depositoService.integrarDeposito([{ IDDEPOSITOLOJA }]);
            res.status(200).json({ message });
        } catch (error) {
            console.error('Erro ao integrar depósito no SAP:', error);
            res.status(500).json({ message: 'Erro ao integrar depósito no SAP.' });
        }
    }
}

export default new ServiceLayerControllers();