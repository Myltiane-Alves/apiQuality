import { MaloteClient } from "../client/index.js";
import { MaloteService } from "../services/index.js";

const maloteClient = new MaloteClient(process.env.API_URL);
const maloteService = new MaloteService(maloteClient);
export class MaloteFinanceiroController {
  async putMalotesLoja(req, res) {

    try {
      let { IDMALOTE, STATUS, OBSERVACAOADMINISTRATIVO, PENDENCIAS, IDUSERULTIMAALTERACAO } = req.body;

      const response = await maloteService.updateMalote(
        IDMALOTE,
        STATUS,
        OBSERVACAOADMINISTRATIVO,
        PENDENCIAS,
        IDUSERULTIMAALTERACAO
      );


      return res.status(200).json(response);
    } catch (error) {
      console.error("Erro no MaloteFinanceiroController.putMalotes:", error);
      return res.status(500).json({ error: "Erro no servidor" });
    }
  }
}

export default new MaloteFinanceiroController();