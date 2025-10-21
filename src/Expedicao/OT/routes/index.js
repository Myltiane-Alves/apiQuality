import { Router } from 'express';
import OrdemTransferenciaControllers from '../controllers/index.js';


const routes = new Router();


// routes.get('/resumo-ordem-transferencia', OrdemTransferenciaControllers.getListaOrdemTransferencia)
routes.put('/resumo-ordem-transferencia/:id', OrdemTransferenciaControllers.putResumoOrdemTransferencia)
routes.post('/criar-resumo-ordem-transferencia', OrdemTransferenciaControllers.postResumoOrdemTransferencia)

export default routes;