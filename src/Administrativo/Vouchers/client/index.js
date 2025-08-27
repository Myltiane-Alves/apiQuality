import axios from 'axios';
import 'dotenv/config';
const url = process.env.API_URL;
export class VouchersClient {
    constructor(baseURL) {
        this.api = axios.create({
            baseURL: baseURL || url,
            timeout: 80000
        });
    }

    async atualizarVendaPagamento(
        STATIVO, 
        STCANCELADO, 
        DSMOTIVOTROCASTATUS,  
        STSTATUS, 
        STTIPOTROCA,
        IDFUNCIONARIO, 
        IDEMPRESALOGADA, 
        IDGRUPOEMPRESARIAL, 
        IDVOUCHER 
) {
        const response = await this.api.put(`${url}/api/administrativo/altera-venda-pagamento.xsjs`, [{
            STATIVO, 
            STCANCELADO, 
            DSMOTIVOTROCASTATUS,  
            STSTATUS, 
            STTIPOTROCA,
            IDFUNCIONARIO, 
            IDEMPRESALOGADA, 
            IDGRUPOEMPRESARIAL, 
            IDVOUCHER 
        }]);
        return response.data;
    }
}
