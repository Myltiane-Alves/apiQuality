
import { DepositoService } from "../services/index.js";
import { ServiceLayerClient } from "../client/index.js";
import axios from "axios";
import dotenv from "dotenv";
const sapClient = new ServiceLayerClient(process.env.API_URL);
const depositoService = new DepositoService(sapClient);
let url = `http://164.152.245.77:8000/quality/concentrador_homologacao`;

class ServiceLayerControllers {

    async postDepositoIntegrarNoSAP(req, res) {
        
        try {
            // Se req.body for um array, pegue o primeiro elemento
            let IDDEPOSITOLOJA;
            if (Array.isArray(req.body) && req.body.length > 0) {
                IDDEPOSITOLOJA = req.body[0].IDDEPOSITOLOJA;
            } else {
                IDDEPOSITOLOJA = req.body.IDDEPOSITOLOJA;
            }

            const response = await axios.post(`${url}/api/service-layer/deposito/jobs/depositos-integracao.xsjs`, { IDDEPOSITOLOJA })

            res.json(response.data);
        } catch (error) {
            console.error('Erro ao integrar depósito no SAP:', error);
            res.status(500).json({ message: 'Erro ao integrar depósito no SAP.' });
        }
    }
    // async postDepositoIntegrarNoSAP(req, res) {
        
    //     try {
    //         // Se req.body for um array, pegue o primeiro elemento
    //         let IDDEPOSITOLOJA;
    //         if (Array.isArray(req.body) && req.body.length > 0) {
    //             IDDEPOSITOLOJA = req.body[0].IDDEPOSITOLOJA;
    //         } else {
    //             IDDEPOSITOLOJA = req.body.IDDEPOSITOLOJA;
    //         }
    //         console.log('Corpo da requisição recebido no controller:', req.body);
    //         console.log('IDDEPOSITOLOJA recebido no controller:', IDDEPOSITOLOJA);
    //         const message = await depositoService.integrarDeposito(IDDEPOSITOLOJA);

    //         res.status(200).json({ message });
    //     } catch (error) {
    //         console.error('Erro ao integrar depósito no SAP:', error);
    //         res.status(500).json({ message: 'Erro ao integrar depósito no SAP.' });
    //     }
    // }
}

export default new ServiceLayerControllers();