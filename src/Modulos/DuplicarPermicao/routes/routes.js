import { Router } from 'express';
//import DuplicarPermicaoController from '../controller/controller.js';

const routes = new Router();

routes.post('/criar-perfil-usuario', DuplicarPermicaoController.postDuplicarPermicao)

export default routes
