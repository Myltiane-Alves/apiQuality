import { Router } from 'express';
//import RelatorioBIController from '../controller/controllerRelatorioBi';

const routes = new Router();

routes.post('/createRelatorioInformaticaBI', RelatorioBIController.postRelatorioBi)

export default routes
