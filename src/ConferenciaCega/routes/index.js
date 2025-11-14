import { Router } from 'express';
import ConferenciaCegaControllers from '../controllers/ConferenciaCega.js';

const routes = new Router();

routes.get('/listaOrdemTransferenciaConferenciaCega', ConferenciaCegaControllers.getListaOrdemTransferenciaConferenciaCega)
routes.get('/impressao-etiqueta-OTDeposito', ConferenciaCegaControllers.getListaImpressaoEtiquetaOTDeposito)
routes.put('/resumo-ordem-transferencia/:id', ConferenciaCegaControllers.putResumoOrdemTransferencia)


routes.post('/inserir-status-divergencia', ConferenciaCegaControllers.postStatusDivergencia)

//routes.put('/encerrar-OT/:id', ConferenciaCegaControllers.putEncerrarOT)
//routes.put('/resumo-ordem-transferencia/:id', ConferenciaCegaControllers.putResumoOrdemTransferencia)
//routes.post('/criar-resumo-ordem-transferencia', ConferenciaCegaControllers.postResumoOrdemTransferencia)
//routes.post('/criar-resumo-ordem-transferencia-deposito', ConferenciaCegaControllers.postResumoOrdemTransferenciaDepositos)
//routes.put('/resumo-ordem-transferencia/:id', ConferenciaCegaControllers.putCancelarOTDeposito)
//routes.put('/finalizarOT-listaOrdemTransferenciaConferenciaCega/:id', ConferenciaCegaControllers.putFinalizarOTDeposito)

export default routes;

