import axios from "axios";
import 'dotenv/config';
const url = process.env.API_URL;

// let url = `http://164.152.245.77:8000/quality/concentrador_node`;

class ServiceLayerControllers {

    async postDepositoIntegrarNoSAP(req, res) {
        let { IDDEPOSITOLOJA } = req.body;

        try {

            if(!IDDEPOSITOLOJA) {
                return res.status(400).json({ message: 'ID do depósito é obrigatório.' });
            }

           const response = await axios.post(`api/service-layer/deposito/jobs/depositos-integracao.xsjs?`, {
               IDDEPOSITOLOJA
           })
            res.status(200).json({ message: 'Depósito integrado no SAP com sucesso.' });
        } catch (error) {
            console.error('Erro ao integrar depósito no SAP:', error);
            res.status(500).json({ message: 'Erro ao integrar depósito no SAP.' });
        }
    }
}

export default new ServiceLayerControllers();