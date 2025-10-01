
import { DepositoService } from "../services/index.js";
import { ServiceLayerClient } from "../client/index.js";
const sapClient = new ServiceLayerClient(process.env.API_URL);
const depositoService = new DepositoService(sapClient);
import axios from "axios";
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

    async postVoucher(req, res) {
        try {
          
            let { } = req.body;
   

            const response = await axios.post(`http://164.152.245.77:8000/quality/concentrador/api/service-layer/devolucao/devolucao-produtos-voucher-nova/jobs/gerar-devolucao-rotina-completa.xsjs`)

            return res.status(200).json(response.data);
        } catch (error) {
            console.error("Erro no ResumoVoucherControllers.putResumoVoucher:", error);
            return res.status(400).json({ error: error.message });
        }
    }
}

export default new ServiceLayerControllers();