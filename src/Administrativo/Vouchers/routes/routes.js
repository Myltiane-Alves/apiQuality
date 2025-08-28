import { Router } from 'express';
import AdmVouchersControllers from '../controllers/index.js';


const admVouchersRoutes = new Router();

// admVendasRoutes.get('/lista-venda-cliente', AdmVendasControllers.getListaVendaCliente);

admVouchersRoutes.post('/editar-voucher/:id', AdmVouchersControllers.putEditarVoucher);

export default admVouchersRoutes;