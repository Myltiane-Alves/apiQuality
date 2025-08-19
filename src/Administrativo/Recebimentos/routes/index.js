import { Router } from 'express';
import AdmRecebimentosControllers from '../controllers/recebimentos.js';


const admRecebimentosRoutes = new Router();

admRecebimentosRoutes.get('/recebimento', AdmRecebimentosControllers.getListaPagamentoVenda)
// admRecebimentosRoutes.get('/funcionario-recebimento', AdmRecebimentosControllers.getListaFuncionarioRecebimento)

export default admRecebimentosRoutes;