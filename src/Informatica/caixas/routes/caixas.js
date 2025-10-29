import { Router } from 'express' ;
//import CaixaControllers from '.././controllers/controllersCaixas'
const routes = new Router();

routes.post('/criar-caixas', CaixaControllers.postCaixaLojas)
routes.put('/lista-caixas/:id', CaixaControllers.putCaixaLoja)
routes.put('/atualiza-empresa-diario/:id', CaixaControllers.putAtualizaEmpresaDiario)
routes.put('/atualizar-todos-caixa', CaixaControllers.putAtualizarTodosCaixas)
export default routes
