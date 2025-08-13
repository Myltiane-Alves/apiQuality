import { MaloteClient } from "../client/index.js";
import { MaloteService } from "../services/index.js";

import maloteSchema from "../schema/index.js";
const maloteClient = new MaloteClient(process.env.API_URL);
const maloteService = new MaloteService(maloteClient);

export class MaloteFinanceiroController {
  async putMalotesLoja(req, res) {
    try {
      // Validar dados usando o schema
      const { error, value } = maloteSchema.validate(req.body, { 
        abortEarly: false,    // Mostra todos os erros, não apenas o primeiro
        stripUnknown: true    // Remove campos não definidos no schema
      });
      
      // Se houver erros de validação, retornar erro 400
      if (error) {
        return res.status(400).json({
          message: 'Dados inválidos',
          errors: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }

      // Usar os dados validados (value) em vez de req.body
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