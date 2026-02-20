import { Router } from "express";
//import MenuFilhoController from "../controller/controllerMenuFilho";
const routes = new Router();

routes.get('/menu-pai', MenuFilhoController.getMenuPai)
routes.get('/menu-filho', MenuFilhoController.getMenuFilho)
routes.post('/menu-filho/:id', MenuFilhoController.postMenuFilho)