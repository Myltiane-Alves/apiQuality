import axios from "axios";
import 'dotenv/config';
const url = process.env.API_URL;
import updateVoucherSchema from '../schema/useUpdateVoucher.js'
import { VouchersClient } from '../client/index.js'
import { VoucherServices } from '../services/index.js'
const updateVoucherClient = new VouchersClient(process.env.API_URL);
const updateVoucherService = new VoucherServices(updateVoucherClient);

class AdmVouchersControllers {
    async putEditarVoucher(req, res) {

        try {

            const { error, value } = updateVoucherSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            })

            if (error) {
                return res.status(400).json({
                    message: 'Dados inválidos',
                    errors: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message
                    }))
                });
            }
            
            const response = await updateVoucherService.updateVoucher(
                value.STATIVO,
                value.STCANCELADO,
                value.DSMOTIVOTROCASTATUS,
                value.STSTATUS,
                value.STTIPOTROCA,
                value.IDFUNCIONARIO,
                value.IDEMPRESALOGADA,
                value.IDGRUPOEMPRESARIAL,
                value.IDVOUCHER
            )

            return res.status(200).json(response);

        } catch (error) {
            console.error("Erro no AdministativoControllers.putEditarVoucher:", error);
            return res.status(500).json({ error: "Erro ao conectar ao servidor" });
        }

    }

}

export default new AdmVouchersControllers();