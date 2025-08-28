import axios from "axios"; 
import 'dotenv/config';
const url = process.env.API_URL;


class AdmVouchersControllers {
     async putEditarVoucher(req, res) {
        
        try {
            let {
                STATIVO, 
                STCANCELADO, 
                DSMOTIVOTROCASTATUS,  
                STSTATUS, 
                STTIPOTROCA,
                IDFUNCIONARIO, 
                IDEMPRESALOGADA, 
                IDGRUPOEMPRESARIAL, 
                IDVOUCHER 
            } = req.body;            

            const apiUrl = `${url}/api/administrativo/editar-voucher.xsjs`
            
            const response = await axios.put(apiUrl,  {
                STATIVO, 
                STCANCELADO, 
                DSMOTIVOTROCASTATUS,  
                STSTATUS, 
                STTIPOTROCA,
                IDFUNCIONARIO, 
                IDEMPRESALOGADA, 
                IDGRUPOEMPRESARIAL, 
                IDVOUCHER
            })
        
            return res.json(response.data);
        
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: "Erro ao conectar ao servidor" });
        }
        
    }
}

export default new AdmVouchersControllers();