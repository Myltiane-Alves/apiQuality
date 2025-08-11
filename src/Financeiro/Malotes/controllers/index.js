export class MaloteFinanceiroController {
    async putMalotesLoja(req, res) {
        
    try {
        let { IDMALOTE, STATUS, OBSERVACAOADMINISTRATIVO, PENDENCIAS, IDUSERULTIMAALTERACAO } = req.body;
    
       
        return res.status(200).json(response.data);
      } catch (error) {
        console.error("Erro no FinanceiroControllers.putMalotes:", error);
        return res.status(500).json({ error: "Erro no servidor" });
    }
  }
}

export default new MaloteFinanceiroController();