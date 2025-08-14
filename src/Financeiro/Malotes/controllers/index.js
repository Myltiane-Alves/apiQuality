import { MaloteClient } from "../client/index.js";
import { MaloteService } from "../services/index.js";

import maloteSchema from "../schema/index.js";
const maloteClient = new MaloteClient(process.env.API_URL);
const maloteService = new MaloteService(maloteClient);

export class MaloteFinanceiroController {
  async putMalotesLoja(req, res) {
    try {
    
      const { error, value } = maloteSchema.validate(req.body, { 
        abortEarly: false,
        stripUnknown: true
      });
      
    
      if (error) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }


      const response = await maloteService.updateMalote(
        value.IDMALOTE,
        value.STATUS,
        value.OBSERVACAOADMINISTRATIVO,
        value.PENDENCIAS,
        value.IDUSERULTIMAALTERACAO
      );
      
      return res.status(200).json(response);
    } catch (error) {
      console.error("Erro no MaloteFinanceiroController.putMalotes:", error);
      return res.status(500).json({ error: "Erro no servidor" });
    }
  }
}

export default new MaloteFinanceiroController();