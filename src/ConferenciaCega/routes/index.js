import { Router } from 'express';
import ConferenciaCegaControllers from '../controllers/ConferenciaCega.js';

const routes = new Router();

routes.get('/listaOrdemTransferenciaConferenciaCega', ConferenciaCegaControllers.getListaOrdemTransferenciaConferenciaCega)
routes.put('/resumo-ordem-transferencia/:id', ConferenciaCegaControllers.putResumoOrdemTransferencia)

routes.post('/inserir-status-divergencia', ConferenciaCegaControllers.postStatusDivergencia)

//routes.put('/resumo-ordem-transferencia/:id', ConferenciaCegaControllers.putResumoOrdemTransferencia)
//routes.post('/criar-resumo-ordem-transferencia', ConferenciaCegaControllers.postResumoOrdemTransferencia)
export default routes;