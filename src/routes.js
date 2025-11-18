import { Router } from 'express';
import authMiddleware from './middlewares/authMiddleware.js';

import FuncionariosControllers from "./Funcionarios/controllers/index.js";
import EmpresaControllers from "./Empresas/controllers/Empresas.js"
import ApiPing from './controllers/ApiPing.js';
import AuthentiCationController from './Auth/controllers/Auth.js';
import AdministrativoControllers from './Administrativo/controllers/Administrativo.js';
import FinanceiroControllers from './Financeiro/controllers/Financeiro.js';
import InformaticaControllers from './Informatica/controllers/Informatica.js';
import ExpedicaoControllers from './Expedicao/controllers/index.js';
import DashBoardControllers from './DashBoard/controllers/DashBoard.js';
import VendasControllers from './Vendas/controllers/Vendas.js';
import ResumoVoucherControllers from './ResumoVoucher/controllers/index.js';
import ComercialControllers from './Comercial/controllers/Comercial.js';
import ComprasControllers from './Compras/controllers/Compras.js';
import CadastroControllers from './Cadastro/controllers/Cadastro.js';
import ProdutoControllers from './Produtos/controllers/Produtos.js';
import DepositosLojaControllers from './DepositoLoja/controllers/DepositosLoja.js';
import ContaBancoControllers from './ContaBanco/controllers/ContaBanco.js';
import DespesasLojaControllers from './Despesas/controllers/DespesasLoja.js';
import CategoriaReceitaDespesasControllers from './CategoriaReceita/controllers/CategoriaReceitaDespesa.js';
import MovimentoCaixaControllers from './Gerencia/MovimentoCaixa/controllers/MovimentoCaixa.js';
import DetalheFaturasControllers from './DetalheFaturas/controllers/Detalhes.js';
import MarketingControllers from './Marketing/controllers/Marketing.js';
import ContabilidadeControllers from './Contabilidade/controllers/Contabilidade.js';
import ConfiguracaoPixPDVControllers from './ConfiguracaoPIX/controllers/ConfiguracaoPixPDV.js';
import ConferenciaCegaControllers from './ConferenciaCega/controllers/ConferenciaCega.js';
import ListaPrecoControllers from './controllers/ListaPreco.js';
import LogsControllers from './LogsUsuario/controllers/log.js';
import PromocaoControllers from './Promocao/controllers/Promocao.js'

import CaixaControllers from './Informatica/caixas/controllers/controllersCaixas.js'
import RelatorioBIController from './Informatica/relatorio/ralatoriaBI/controller/controllerRelatorioBi.js';
import LinkRelatorioBiController from './Informatica/relatorio/linkRelatorioBI/controllers/controllersLinkRelatorioBi.js'

import ConsultaNfeController from './Informatica/ConsultaNFCE/controllers/index.js'


// Financeiro Início
import AdiantamentosControllers from './Financeiro/Adiantamentos/controllers/adiantamentos.js'
import DepositosControllers from './Financeiro/Depositos/controllers/depositos.js'
import CaixasControllers from './Financeiro/Caixas/controllers/caixas.js'
import DescontoControllers from './Financeiro/Desconto/controllers/desconto.js'
import DespesasControllers from './Financeiro/Despesas/controllers/depesas.js'
import DevolucaoControllers from './Financeiro/Devolucao/controllers/devolucao.js'
import EstabelecimentoControllers from './Financeiro/Estabelecimentos/controllers/estabelecimento.js'
import FaturasControllers from './Financeiro/Faturas/controllers/faturas.js'
import PedidosControllers from './Financeiro/Pedidos/controllers/pedidos.js'
import SaldosControllers from './Financeiro/Saldos/controllers/saldos.js'
import FinanceiroVendasControllers from './Financeiro/Vendas/controllers/vendas.js'
import VoucherControllers from './Financeiro/Voucher/controllers/voucher.js'
import ExtratosControllers from './Financeiro/Extrato/controllers/extrato.js'
// Financeiro Fim

import QuebraCaixaControllers from './DashBoard/QuebraCaixa/controllers/quebraCaixaLoja.js'
import ADMCaixasControllers from './Administrativo/Caixa/controllers/admCaixas.js'
import AdmVendasControllers from './Administrativo/Vendas/controllers/admVendas.js'
import AdmPagamentosControllers from './Administrativo/Pagamentos/controllers/pagamentos.js'
import AdmRecebimentosControllers from './Administrativo/Recebimentos/controllers/recebimentos.js'
import AdmDescontoControllers from './Administrativo/Desconto/controllers/desconto.js'
import EstoqueControllers from './Administrativo/Estoque/controllers/estoque.js'
import AdmBalancoControllers from './Administrativo/Balanco/controllers/balanco.js'
import DashBoardVendasControllers from './DashBoard/Vendas/controllers/venda.js';
import DashBoardFuncionariosControllers from './DashBoard/Funcionario/controllers/funcionarios.js';
import DashBoardAdiantamentoSalarialControllers from './DashBoard/AdiantamentoSalarial/controllers/index.js';
import GerenciaControllers from './Gerencia/controllers/index.js';

import ServiceLayerControllers from './ServiceLayer/controllers/index.js'

//  Gerencia
import GERAlteracaoPrecoControllers from './Gerencia/AlteracaoPreco/controllers/index.js'


//  Comercial
import ComercialProdutoControllers from './Comercial/Produto/controllers/index.js'

import ModulosControllers from './Modulos/controllers/modulos.js';
import DanfeControllers from './Danfe/controllers/danfe.js';

import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

const routes = new Router();
// routes.use(authMiddleware)

routes.get('/', (req, res) => {
    res.send('Hello World! Myltiane');
});

routes.get('/ping', ApiPing.index);

routes.post('/login', AuthentiCationController.login);
routes.post('/login2', AuthentiCationController.login);
routes.post('/gerar-danfe', DanfeControllers.gerarDanfeLocal);

// routes.use(authMiddleware)


//  Funcionarios 

routes.get('/autorizarVoucher', FuncionariosControllers.getAutorizacaoVoucherFuncionarios)
// routes.get('/listaFuncionariosEmpresa', FuncionariosControllers.getListaFuncionariosEmpresa)
routes.get('/funcionario-ativo-por-empresa', FuncionariosControllers.getListaFuncionariosAtivos)
routes.get('/todos-funcionario', FuncionariosControllers.getListaTodosFuncionarios)

routes.get('/empresas', EmpresaControllers.getAllEmpresas);
routes.get('/grupoEmpresarial', EmpresaControllers.getAllGrupoEmpresarial);
routes.get('/subGrupoEmpresarial', EmpresaControllers.getSelectLojaVouchers);
routes.get('/listaEmpresas', EmpresaControllers.getListaEmpresas)
routes.put('/empresas/:id', EmpresaControllers.putListaEmpresas)

routes.get('/modulos', ModulosControllers.getListaModulos)
routes.put('/modulos/:id', ModulosControllers.putModulo)
routes.post('/criar-modulos', ModulosControllers.postModulo)

routes.get('/menus-usuario', ModulosControllers.getListaPerfilUsuario)
routes.get('/menus-usuario-excecao', ModulosControllers.getListaMenusPorUsuario)
routes.get('/menus-filho-usuario', ModulosControllers.getListaMenusFilhosUsuario)
routes.get('/menus', ModulosControllers.getListaSubMenusUsuario)
routes.get('/menus-filho-usuario', ModulosControllers.getListaMenusFilhosUsuario)

routes.put('/perfil-permissao/:id', ModulosControllers.putPerfilPermissoes)
routes.put('/perfil-usuario/:id', ModulosControllers.putPerfilUsuarioMenu)
routes.post('/criar-perfil-usuario', ModulosControllers.postPerfilUsuarioMenu)

// routes.get('/listaCaixasMovimento', AdministrativoControllers.getListaCaixasMovimento);
//Início Administrativo
routes.get('/listaCaixasMovimento', AdministrativoControllers.retornoListaCaixasMovimento);

routes.get('/listaCaixasFechados', AdministrativoControllers.retornoListaCaixasFechados);
routes.get('/vendaVendedor', AdministrativoControllers.getVendaVendedor);
routes.get('/vendaAtivaAction', AdministrativoControllers.getVendaAtivaAction);
routes.get('/vendaAtivaResumo', AdministrativoControllers.getVendaAtivaResumo)
routes.get('/vendaCancelada', AdministrativoControllers.getVendaCancelada);
routes.get('/vendaCanceladaResumo', AdministrativoControllers.getVendaCanceladaResumo);
routes.get('/resumoVenda', AdministrativoControllers.getResumoVenda);
routes.get('/detalheFatura', AdministrativoControllers.getDetalheFatura);
routes.get('/detalheDespesas', AdministrativoControllers.getDetalheDespesas);
routes.get('/resumoVendaConvenio', AdministrativoControllers.getResumoVendaConvenio)
routes.get('/resumoVendaConveniodesconto', AdministrativoControllers.getResumoVendaConvenioDesconto)
routes.get('/detalheVoucher', AdministrativoControllers.getDetalheVoucher)
routes.get('/detalhe-voucher-dados-adm', AdministrativoControllers.getListaDetalheVoucherDados)
routes.get('/extratoDaLojaDia', AdministrativoControllers.getListaExtratoDaLojaDia)
routes.get('/listaDetalheVenda', AdministrativoControllers.getListaVendasDetalheAlterar)
routes.get('/detalheProdutoVoucher', AdministrativoControllers.getDetalheProdutoVoucher)
routes.get('/pagamentoTef', AdministrativoControllers.getRetornoListaPagamentoTEFSelect)
routes.get('/pagamentoPos', AdministrativoControllers.getRetornoListaPagamentoPOSSelect)
// routes.get('/vendaTotalFormaPagamento', AdministrativoControllers.getRetornoListaRecebimentosFormaPagamento)
routes.get('/listaAlteracaoPreco', AdministrativoControllers.getListaAlteracaoPreco)
routes.get('/vendaAtivaCliente', AdministrativoControllers.getListaClientesVendas)
routes.get('/prestacaoContasBalanco', AdministrativoControllers.getListaPrestacaoDeContas)
routes.get('/novo-previa-balanco', AdministrativoControllers.getListaPreviaBalanco)
routes.get('/vendaCanceladaEmpresa', AdministrativoControllers.getVendaCancelada30Minutos)
routes.get('/vendaCanceladaWeb', AdministrativoControllers.getVendaCanceladaWeb)
routes.get('/vendaCanceladaEmitidaPDV', AdministrativoControllers.getVendaCanceladaEmitidaPDV)
// routes.get('/vendaContigencia', AdministrativoControllers.getListaVendasContigenciaPorEmpresa)
routes.get('/formaPagamentos', AdministrativoControllers.getListaFormaPagamento)
// routes.get('/vendaTotalRecebidoPeriodoADM', AdministrativoControllers.getListaVendaTotalRecebido)
// routes.get('/ultimaPosicaoEstoque', AdministrativoControllers.getListaEstoqueUltimaPosicao)

// routes.get('/pesqBalanco', AdministrativoControllers.getPesqBalanco)
// routes.get('/coletorBalanco', AdministrativoControllers.getListaColetorBalanco)
// routes.get('/detalheBalancoAvulso', AdministrativoControllers.getDetalheBalancoAvulso)
routes.get('/detalheBalancoAvulso', AdmBalancoControllers.getListaDetalheBalancoAvulso)
routes.get('/coletor-balanco', AdmBalancoControllers.getListaColetorBalanco)
routes.get('/balanco-loja', AdmBalancoControllers.getListaBalancoLoja)
routes.get('/detalhe-balanco', AdmBalancoControllers.getListaDetalheBalancoLoja)
routes.get('/preparar-primeiro-balanco-loja', AdmBalancoControllers.getListaPrepararPrimeiroBalancoLoja)
routes.get('/prestacao-contas-balanco', AdmBalancoControllers.getListaPrestacaoContasBalanco)
routes.get('/consolidar-balanco', AdmBalancoControllers.getListaConsolidarBalanco)

routes.put('/coletor-balanco/:id', AdmBalancoControllers.putColetorBalanco)
routes.put('/prestacao-contas-balanco/:id', AdmBalancoControllers.putConfirmarPrestacaoContas)
routes.put('/consolidar-balanco/:id', AdmBalancoControllers.putConsolidarBalanco)
routes.put('/confirmar-consolidar-balanco/:id', AdmBalancoControllers.putConfirmarConsolidarBalanco)
routes.put('/preparar-primeiro-balanco-loja/:id', AdmBalancoControllers.putListaPrepararPrimeiroBalancoLoja)
routes.put('/detalhe-balanco/:id', AdmBalancoControllers.putListaDetalheBalanco)
routes.put('/detalhe-balanco-avulso/:id', AdmBalancoControllers.putListaDetalheBalancoAvulso)
routes.post('/criar-detalhe-balanco-avulso', AdmBalancoControllers.postDetalheBalancoAvulso)

routes.get('/despesasLojaADM', AdministrativoControllers.getListaDespesasLojaADM)

routes.put('/alterarVendaVendedor', AdministrativoControllers.updateAlterarVendaVendedor)
routes.put('/editar-voucher/:id', AdministrativoControllers.putEditarVoucher)

// routes.get('/estoqueAtual', AdministrativoControllers.getEstoqueAtual)
routes.get('/ultimaPosicaoEstoque', EstoqueControllers.getListaEstoqueUltimaPosicao)
routes.get('/inventariomovimento', EstoqueControllers.getListaEstoqueAtual)



routes.get('/recebimento-resumo', AdministrativoControllers.getRetornoListaPagamentoVenda)
routes.get('/lista-venda-cliente', AdmVendasControllers.getListaVendaCliente);
routes.get('/lista-venda', AdmVendasControllers.getListaVendasById)
routes.get('/alterar-venda-pagamento', AdmVendasControllers.getListaAlterarVendasPagamento);
routes.get('/venda-ativa', AdmVendasControllers.getListaVendaAtiva);
routes.get('/venda-vendedor-adm', AdmVendasControllers.getVendaVendedorAction);
routes.get('/venda-total-forma-pagamento', AdmVendasControllers.getRecebimentosFormaPagamento)
routes.get('/venda-total-recebido-periodo-adm', AdmVendasControllers.getListaVendaTotalRecebido)

routes.put('/alterar-venda-pagamento/:id', AdmVendasControllers.putAlterarVendasPagamento);
routes.put('/atualiza-recebimento-venda/:id', AdmVendasControllers.putAlterarVendaRecebimento);
routes.put('/venda-vendedor/:id', AdmVendasControllers.putVendaVendedor);

routes.post('/alterar-venda-pagamento', AdmVendasControllers.postAlterarVendasPagamento);

// Desconto
// routes.get('/vendaConvenio', AdministrativoControllers.getVendaConvenio)
routes.get('/desconto-motivo-vendas-adm', AdmDescontoControllers.getListaDescontoMotivoVendas)


//  Recebimentos
routes.get('/recebimento', AdmRecebimentosControllers.getListaPagamentoVenda)
routes.get('/funcionario-recebimento', AdmRecebimentosControllers.getListaFuncionarioRecebimento)


// Forma de Pagamento

routes.get('/forma-pagamentos', AdmPagamentosControllers.getListaFormaPagamento)
routes.get('/pagamento-tef', AdmPagamentosControllers.getListaPagamentoTef)
routes.get('/pagamento-pos', AdmPagamentosControllers.getListaPagamentoPos)
// Fim Administrativo

// Início GERENCIA
routes.get('/clientes', GerenciaControllers.getListaCliente)
routes.get('/malotes-por-loja', GerenciaControllers.getListaMalortesPorLoja)
routes.get('/detalhe-malotes-por-loja', GerenciaControllers.getListaDetalhesMalortesPorLoja)
routes.post('/criar-malotes-por-loja', GerenciaControllers.postMalotesPorLoja)
routes.put('/malotes-por-loja/:id', GerenciaControllers.putMalotesPorLoja)

routes.get('/alteracaoPreco', GERAlteracaoPrecoControllers.getListaAlteracaoPreco)

// FIM GERENCIA

// Início Quebra Caixa 
routes.get('/quebra-caixa-loja-resumo', QuebraCaixaControllers.getListaQuebraCaixaResumoADM)
routes.get('/quebra-caixa-loja', QuebraCaixaControllers.getListaQuebraCaixa)
routes.get('/quebra-caixa-loja/:id', QuebraCaixaControllers.getQuebraCaixaID)
routes.put('/atualizar-status-quebra', QuebraCaixaControllers.putListaStatusQuebraCaixa)
routes.put('/quebra-caixa-todos/:id', QuebraCaixaControllers.putQuebraCaixa)
routes.post('/quebra-caixa-todos', QuebraCaixaControllers.postQuebraCaixa)

// Início Financeiro

routes.get('/listaExtratoDaLojaPeriodo', FinanceiroControllers.getListaExtratoDaLojaPeriodoFinan)
routes.get('/historicos-malotes', FinanceiroControllers.getListasHistoricosMalotes)
routes.get('/malotes-loja', FinanceiroControllers.getListasMalotesLojas)
routes.get('/pendencias-malotes', FinanceiroControllers.getListaPendenciasMalotes)

routes.put('/malotes-loja/:id', FinanceiroControllers.putMalotesLoja)

// routes.get('/listaVendasMarca', FinanceiroControllers.getListaVendasMarca)
routes.get('/resumoVendaFinanceiro', FinanceiroControllers.getListaVendasResumidaFinanceiro)

routes.get('/vendaPagamento', FinanceiroControllers.getListaVendasTransacoesEmpresa)
routes.get('/vendaTotalEmpresa', FinanceiroControllers.getListaVendasEmpresa)
routes.get('/detalheFechamento', FinanceiroControllers.getListaDetalheFechamento)
routes.get('/listaCaixasMovimentoFinanceiro', FinanceiroControllers.getListaCaixasMovmentoFinanceiro)
routes.get('/vendaMarcaPeriodoFinanceiro', FinanceiroControllers.getListaVendasMarcaFinanceiro)
routes.get('/vendaMarcaRob', FinanceiroControllers.getListaVendasMarcaROB)
routes.get('/vendaMarcaMarckup', FinanceiroControllers.getListaVendasMarcaMarckup)
routes.get('/vendaDigitalFinanceiro', FinanceiroControllers.getListaVendasDigital)
routes.get('/vendaPixPeriodo', FinanceiroControllers.getListaVendasPixPeriodo)
routes.get('/vendaPixConsolidadoLoja', FinanceiroControllers.getListaVendasPixConsolidadoLojas)
routes.get('/vendaPixConsolidado', FinanceiroControllers.getListaVendasPixConsolidado)

// routes.get('/faturaPixPeriodoConsolidado', FinanceiroControllers.getListaFaturasPixConsolidado)
routes.get('/faturaPixConsolidadoLoja', FinanceiroControllers.getListaFaturaPixConsolidadoLoja)
// routes.get('/vendaConciliar', FinanceiroControllers.getListaVendasConciliar)
routes.get('/venda-detalhe-recebimento-eletronico', FinanceiroControllers.getListaDetalheRecebimentosEletronico)
// routes.get('/vendaDetalheRecebimentoEletronico', FinanceiroControllers.getListaDetalheRecebimentosEletronico)
// routes.get('/deposito-loja', FinanceiroControllers.getListaConciliarBanco)
routes.get('/deposito-loja-consolidado', FinanceiroControllers.getListaConciliarBancoConsolidado)
// routes.get('/saldoLojaPorGrupo', FinanceiroControllers.getListaSaldoExtratoLoja)
routes.post('/motivoDevolucao', FinanceiroControllers.createMotivoDevolucao)
// routes.get('/detalheFaturaFinanceiro', FinanceiroControllers.getListaDetalheFaturaFinanceiro)

routes.get('/primeira-venda', ExtratosControllers.getPrimeiraVenda)
routes.get('/lista-extrato', ExtratosControllers.getListaExtratoDaLojaPeriodoFinanceiro)
routes.put('/ajuste-extrato/:id', ExtratosControllers.putListaAjusteExtrato)
routes.post('/ajuste-extrato', ExtratosControllers.postListaAjusteExtrato)

routes.get('/resumo-voucher', VoucherControllers.getListaResumoVoucherFinanceiro)
// routes.put('/atualizacaoAdiantamentoStatus', FinanceiroControllers.updateAdiantamentoStatus)
routes.put('/atualizarFatura/:id', FinanceiroControllers.putFaturaFinanceiro)


// Início Vendas 
routes.get('/vendaLojaPeriodo', FinanceiroControllers.getListaVendasLojaPeriodo)
routes.get('/venda-digital-marca', FinanceiroVendasControllers.getListaVendasDigitalMarca)

routes.get('/venda-total-recebido-periodo', FinanceiroVendasControllers.getListaRecebimentos)
routes.get('/venda-recebido-eletronico', FinanceiroVendasControllers.getListaRecebimentosEletronico)
routes.get('/remessa-vendas', FinanceiroVendasControllers.getListaRemessaVendas)
routes.get('/venda-periodo-loja', FinanceiroVendasControllers.getListaVendasLojaPeriodo)
// routes.get('/venda-periodo-lojaID', FinanceiroVendasControllers.getListaVendasLojaById)
routes.get('/venda-pagamentos', FinanceiroVendasControllers.getListaVendasPagamentos)
routes.get('/venda-total', FinanceiroVendasControllers.getListaVendasTotal)
routes.get('/venda-total-empresa', FinanceiroVendasControllers.getListaVendasEmpresa)
routes.get('/venda-digital', FinanceiroVendasControllers.getListaVendasDigital)
routes.get('/venda-pix-periodo', FinanceiroVendasControllers.getListaVendasPixPeriodo)
routes.get('/venda-pix-consolidado', FinanceiroVendasControllers.getListaVendasPixConsolidado)
routes.get('/venda-pix-consolidado-loja', FinanceiroVendasControllers.getListaVendasPixConsolidadoLojas)
routes.get('/venda-conciliacao', FinanceiroVendasControllers.getListaVendasConciliar)
routes.get('/vendas-marca-periodo', FinanceiroVendasControllers.getListaVendasMarca)
routes.get('/vendas-total-loja-hora', FinanceiroVendasControllers.getListaVendasTotalLojaHora)
routes.get('/vendas-total-to', FinanceiroVendasControllers.getListaVendasTotalTO)
routes.get('/vendas-total-mes', FinanceiroVendasControllers.getListaVendasTotalMes)
routes.get('/vendas-total-mes-ano-passado', FinanceiroVendasControllers.getListaVendasTotalMes)
routes.get('/vendas-total-loja-hora-ano-passado', FinanceiroVendasControllers.getListaVendasTotalLojaHoraAnoPassado)


routes.put('/venda-pix-status-conferido', FinanceiroVendasControllers.putListaVendaPixStatusConferido)
routes.post('/cadastrarMotivoDevolucao', FinanceiroControllers.createMotivoDevolucao)

//  Saldos
routes.get('/movimento-saldo-bonificacao', SaldosControllers.getListaExtratoBonificacaoById)
routes.get('/saldo-loja-por-grupo', SaldosControllers.getListaSaldoExtratoLoja)
routes.post('/criar-movimento-saldo-bonificacao', SaldosControllers.createMovimentoSaldoBonificacao)

//  Pedidos
routes.get('/pedido-compras', PedidosControllers.getListaPedidosCompras)


// Faturas
routes.get('/fatura-pix-periodo-consolidado', FinanceiroControllers.getListaFaturasPixConsolidado)
routes.get('/fatura-pix-periodo', FaturasControllers.getListaFaturasPixPeriodo)
routes.get('/detalhe-faturas', FaturasControllers.getDetalheFaturaFinanceiro)
// routes.get('/faturaPixPeriodo', FaturasControllers.getListaVendaFaturaPixPeriodo)
routes.get('/venda-total-fatura-pix-empresa', FaturasControllers.getListaVendaFaturaPixPeriodo)
routes.get('/venda-total-fatura-pix-empresa-compensada', FaturasControllers.getListaVendaFaturaPixPeriodoCompensacao)

routes.put('/atualizar-status-fatura-pix', FaturasControllers.putListaFaturaVendaPixStatusConferido)
routes.put('/atualizar-recompra', FaturasControllers.putListaAtualizarRecompra)
routes.put('/fatura-loja-atualizar', FaturasControllers.putListaAtualizarFatura)


//  Estabelecimento
routes.get('/estabelecimento', EstabelecimentoControllers.getListaEstabelecimentos)


// Devolução
routes.get('/motivo-devolucao', DevolucaoControllers.getListaMotivosDevolucao)
routes.put('/atualizar-motivo-devolucao', DevolucaoControllers.putMotivoDevolucao)
routes.post('/criar-motivo-devolucao', DevolucaoControllers.createMotivoDevolucao)

// Despesas
routes.get('/despesa-loja', DespesasControllers.getListaDespesasLoja)
routes.put('/editar-despesa', DespesasControllers.putDespesasLoja)
routes.put('/editar-status-despesa/:id', DespesasControllers.putStatusDespesasLoja)

// Desconto
routes.get('/desconto-vendas', DescontoControllers.getListaDescontoVendas)
routes.get('/desconto-vendas-simplificado', DescontoControllers.getListaDescontoVendasSimplificada)
routes.get('/desconto-motivo-vendas', DescontoControllers.getListaDescontoMotivoVendas)

//  Adiantamentos 
routes.get('/adiantamento-salarial', AdiantamentosControllers.getListaAdiantamentoSalarialFinanceiro)

// Caixas
routes.get('/lista-caixas-movimento', CaixasControllers.getListaCaixasMovmentoFinanceiro)
routes.get('/lista-caixas-status', CaixasControllers.getListaCaixaStatus)
routes.get('/lista-caixas-zerados', CaixasControllers.getListaCaixaZerados)
routes.put('/fechar-caixas-zerados', CaixasControllers.updateFecharCaixaZerado)


// Depositos
routes.put('/atualizar-deposito-loja/:id', DepositosControllers.updateDepositoLoja)
routes.get('/deposito-loja', DepositosControllers.getListaDepositosLoja)




// Dashboard

routes.get('/lista-quebra-caixa', DashBoardControllers.getListaQuebraCaixa)
routes.get('/listaDeQuebraDeCaixaPositiva', DashBoardControllers.getListaQuebraCaixaPositiva)
routes.get('/listaDeQuebraDeCaixaNegativa', DashBoardControllers.getListaQuebraCaixaNegativa)
routes.get('/quebra-caixa', DashBoardControllers.getRetornoTableImprimeQuebra)
routes.get('/resumoVendaConvenioDesc', DashBoardControllers.getRetornoListaVendasConvenioDesconto)
routes.get('/resumoVendaGerencia', DashBoardControllers.getResumoVendaGerencia)
// routes.get('/listaCaixaMovimentoGerencia', DashBoardControllers.retornoListaCaixasMovimentoGerencia)
routes.get('/vendedor', DashBoardControllers.getListaVendasVendedorGerencia)
// routes.get('/vendasAtivasResumoGerencia', DashBoardControllers.getListaResumoVendasAtivaGerencia)
routes.get('/vendasCanceladasResumoGerencia', DashBoardControllers.getListaResumoVendasCanceladasGerencia)
routes.get('/adiantamentoSalarialFuncionarios', DashBoardControllers.getListAdiantamentoLoja)
routes.get('/adiantamento-salarial-gerencia', DashBoardControllers.getAdiantamentoSalarialFuncionario)
// routes.get('/vendasResumoLojaGerencia', DashBoardControllers.getListaVendasLojaResumidoGerencia)
// routes.get('/vendasVendedorPeriodoLojaGerencia', DashBoardControllers.getListaVendasVendedorPeriodoGerencia)
routes.get('/extrato-loja-periodo', DashBoardControllers.getListaExtratoDaLojaPeriodo)
routes.get('/relatorioBI', DashBoardControllers.getListaRelatorioBIGerencia)
// routes.get('/listaVendasGerencia', DashBoardControllers.getListaVendasGerencia)
// routes.get('/extratoLojaPeriodo', DashBoardControllers.getListaExtratoDaLojaPeriodo)
routes.get('/adiantamentoSalarialData', DashBoardControllers.getListAdiantamentoSalarialData)
// routes.get('/detalheVenda', DashBoardControllers.getRetornoListaVendasAtivasDetalheProduto)
// routes.get('/resumoVendaCaixaDetalhado', DashBoardControllers.getRetornoListaVendaDetalhe)


// routes.get('/listaFuncionarioVendasDesconto', DashBoardControllers.getListaFuncionario)
routes.get('/funcionarios', DashBoardFuncionariosControllers.getListaFuncionarios)

routes.get('/adiantamento-loja', DashBoardAdiantamentoSalarialControllers.getListaAdiantamentoSalarialLoja)
routes.get('/adiantamento-funcionarios', DashBoardAdiantamentoSalarialControllers.getListaAdiantamentosFuncionarios)
routes.get('/adiantamentos-salarial', DashBoardAdiantamentoSalarialControllers.getListaAdiantamentosSalarialDashBoard)

routes.put('/atualizacao-adiantamento-status', DashBoardAdiantamentoSalarialControllers.updateAdiantamentoStatus)
routes.post('/adiantamento-salarial', DashBoardAdiantamentoSalarialControllers.postAdiantamentoSalarial)
routes.put('/adiantamento-salarial/:id', DashBoardAdiantamentoSalarialControllers.putAdiantamentoSalarial)

// routes.get('/resumoVendaConvenioDescontoFN', DashBoardControllers.getRetornoListaVendasConvenioDescontoFuncionario)
routes.get('/resumo-venda-convenio-desconto', DashBoardVendasControllers.getVendasConvenioDescontoFuncionario)
routes.get('/resumo-venda-convenio', DashBoardVendasControllers.getVendasConvenioDescontoFuncionario)
routes.get('/detalhe-venda', DashBoardVendasControllers.getRetornoVendasAtivasDetalheProduto)
routes.get('/resumo-venda-caixa-detalhado', DashBoardVendasControllers.getListaVendaDetalhe)
routes.get('/resumo-venda-caixa', DashBoardVendasControllers.getListaResumoVendasCaixas)
routes.get('/venda-resumido', DashBoardVendasControllers.getListaVendasLojaResumidoGerencia)
routes.get('/venda-vendedor', DashBoardVendasControllers.getListaVendasVendedorPeriodoGerencia)
routes.get('/vendas-recebimentos', DashBoardVendasControllers.getListaRecebimento)
routes.get('/lista-caixas-movimento-gerencia', DashBoardVendasControllers.getListaCaixaMovimentosGerencia)

// routes.put('/atualizacaoStatus', DashBoardControllers.updateStatusQuebraCaixaLoja)


// Início Informática GET
routes.get('/marcasLista', InformaticaControllers.getListaMarcas)
routes.get('/listaGrupoEmpresas', InformaticaControllers.getListaGrupoEmpresas)
routes.get('/listaEmpresasControleTransferencia', InformaticaControllers.getListaEmpresas);
routes.get('/listaEmpresasIformatica', InformaticaControllers.getListaEmpresasInformatica);
routes.get('/listaProdutoPreco', InformaticaControllers.getListaProdutoPreco)
routes.get('/lista-caixas', InformaticaControllers.getListaCaixas)
// routes.get('/listaCaixasID', InformaticaControllers.getListaCaixasID)
routes.get('/atualiza-empresa-diario', InformaticaControllers.getListaAtualizaEmpresaDiario)
routes.get('/vendas-loja-informatica', InformaticaControllers.getListaVendasLojaInformatica)
routes.get('/funcionarios-loja', InformaticaControllers.getListaFuncionariosLoja)
routes.get('/funcionarios-loja-ativos', InformaticaControllers.getListaFuncionariosLoja)
routes.get('/atualizarFuncionario', InformaticaControllers.getListaAtualizarFuncionario)
routes.get('/pagamento-tef-informatica', InformaticaControllers.getListaPagamentoTEFInformatica)
routes.get('/pagamento-pos-informatica', InformaticaControllers.getListaPagamentoPOSInformatica)

routes.get('/vendas-alloc', InformaticaControllers.getListaVendasAlloc)
routes.get('/vendas-contigencia', InformaticaControllers.getListaVendasContigenciaIformatica)
routes.get('/lista-cliente', InformaticaControllers.getListaClienteIformatica)
// routes.get('/listaClienteID', InformaticaControllers.getListaCliente)
routes.get('/linkRelatorioBI', InformaticaControllers.getListaLinkRelatorioBI)
routes.get('/relatorioInformaticaBI', InformaticaControllers.getListaRelatorioBI)
routes.get('/lista-cliente-credsystem', InformaticaControllers.getListaCadastroClienteCredSystem)
routes.get('/lista-meio-pagamento-credsystem', InformaticaControllers.getListaMeioPagamentoCredSystem)
routes.get('/lista-parceria-credsystem', InformaticaControllers.getListaParceriaCredSystem)

// POST
routes.post('/createRelatorioInformaticaBI', RelatorioBIController.postRelatorioBi)
//routes.post('/createRelatorioInformaticaBI', InformaticaControllers.postRelatorioBI)
routes.post('/criarlinkRelatorioBI', LinkRelatorioBiController.postLinkRelatorioBi)
//routes.post('/criarlinkRelatorioBI', InformaticaControllers.postLinkRelatorioBI)
routes.post('/configuracao-todos', InformaticaControllers.postCaixaLoja)
routes.post('/criar-lista-caixas', InformaticaControllers.postConfiguracao)
routes.post('/criar-caixas', CaixaControllers.postCaixaLojas)


// PUT
routes.put('/inativar-funcionario', InformaticaControllers.putInativarFuncionario)
//routes.put('/relatorioInformaticaBI/:id', InformaticaControllers.putRelatorioBI)
routes.put('/linkRelatorioBI/:id', LinkRelatorioBiController.putLinkRelatorioBi)
routes.put('/relatorioInformaticaBI/:id', RelatorioBIController.putRelatorioBi)
//routes.put('/linkRelatorioBI/:id', InformaticaControllers.putLinkRelatorioBI)
//routes.put('/atualiza-empresa-diario/:id', InformaticaControllers.putAtualizaEmpresaDiario)
//routes.put('/atualizar-todos-caixa', InformaticaControllers.putAtualizarTodosCaixas)
routes.put('/atualiza-empresa-diario/:id', CaixaControllers.putAtualizaEmpresaDiario)
routes.put('/atualizar-todos-caixa', CaixaControllers.putAtualizarTodosCaixas)
routes.put('/lista-caixas/:id', CaixaControllers.putCaixaLoja)
// routes.put('/atualizaStatusCaixa', InformaticaControllers.updateAtualizaSTCaixasInformatica)
routes.put('/funcionarios-loja/:id', InformaticaControllers.putFuncionarioLoja)
routes.post('/criar-funcionarios-loja', InformaticaControllers.postFuncionarioLoja)
routes.put('/lista-caixas/:id', InformaticaControllers.putCaixaLoja)
routes.put('/funcionarios-desconto/:id', InformaticaControllers.putFuncionarioDesconto)
// routes.post('/consulta-nfec', ConsultaNfeController.consultar)
// routes.post('/consultar-nfe', upload.single('planilha'), ConsultaNfeController.consultar);
routes.get('/valida-venda-contingencia', ConsultaNfeController.getListaVendasContigenciaValidas);
routes.put('/valida-venda-contingencia/:id', ConsultaNfeController.putValidarVendaContigencia);
routes.get('/validarConsulta', ConsultaNfeController.validarConsultar);
// routes.get('/statusSefaz', ConsultaNfeController.issueFromVendaId);

// routes.put('/configuracao-todos/:id', InformaticaControllers.putCaixaLoja)
// FIM Informática



// Expedição
routes.get('/listaProdutos', ExpedicaoControllers.getListaProdutosExpedicao)
routes.get('/resumoOrdemTransferenciaExpedicao', ExpedicaoControllers.getListaOrdemTransferenciaExpedicao)
routes.get('/detalhe-ordem-transferencia', ExpedicaoControllers.getListaDetalheOT)

routes.get('/statusDivergencia', ExpedicaoControllers.getListaSD)
routes.get('/statusOrdemTransferencia', ExpedicaoControllers.getListaStatusOT)
routes.get('/faturasOT', ExpedicaoControllers.getListaFaturasOT)
routes.get('/rotinaMovimentacao', ExpedicaoControllers.getListaRotinaMovimentacao)
routes.get('/otTransferencia', ExpedicaoControllers.getListaOTDepLoja)
routes.get('/impressao-etiqueta-ot', ExpedicaoControllers.getListaImpressaoEtiquetaOT)
routes.get('/consulta-nfe-saida-tranferencia', ExpedicaoControllers.getListaNFESaidaTransferencia)
routes.put('/updateOrdemTransferencia', ExpedicaoControllers.updateOrdemTransferencia)
routes.put('/updateStatusDivergencia', ExpedicaoControllers.updateAlterarSD)

routes.put('/inserirSD', ExpedicaoControllers.storeInserirSD)

routes.get('/resumo-ordem-transferencia', ExpedicaoControllers.getListaOrdemTransferencia)
routes.put('/resumo-ordem-transferencia/:id', ExpedicaoControllers.putResumoOrdemTransferencia)
routes.post('/criar-resumo-ordem-transferencia', ExpedicaoControllers.postResumoOrdemTransferencia)

// Vendas
// routes.get('/listaVendas', FinanceiroVendasControllers.getListaVendas)

// routes.get('/listaVendaCliente', Vendas.getListaVendaCliente)
routes.get('/movimentacaoSaldo', VendasControllers.getListaVendasSaldo)
routes.get('/rotatividadeVendas', VendasControllers.getListaRotatividade)
routes.get('/listaDetalheVendaCliente', VendasControllers.getListaDetalheVendaCliente)
routes.get('/venda-xml', VendasControllers.getListaVendaXML)
routes.get('/venda-cliente', VendasControllers.getListaVendaClienteGerencia)

// Vouchers
routes.get('/detalheVoucherDados', ResumoVoucherControllers.getListaDetalheVoucherDados)
routes.get('/voucher-completo', ResumoVoucherControllers.getListaVoucherCompleto)
routes.get('/detalheNumeroVoucherDados', ResumoVoucherControllers.getDetalheNumeroVoucherDados)
routes.get('/detalhesVouchersId', ResumoVoucherControllers.getDetalheIDVoucherDadosModal)
routes.get('/detalheIDVoucherDados', ResumoVoucherControllers.getDetalheIDVoucherDados)
routes.get('/resumoDetalheVoucher', ResumoVoucherControllers.getResumoDetalheVoucher)
routes.get('/detalhe-voucher', ResumoVoucherControllers.getListaVoucherGerencia)
routes.get('/empresasVoucher', ResumoVoucherControllers.getListaEmpresasVoucher)
routes.get('/cliente-todos', ResumoVoucherControllers.getListaTodosClientes)
routes.put('/todos-web/:id', ResumoVoucherControllers.putResumoVoucher)
routes.post('/todos-web', ResumoVoucherControllers.postResumoVoucher)

routes.put('/todos-cliente/:id', ResumoVoucherControllers.putCliente)
routes.post('/criar-cliente', ResumoVoucherControllers.postCliente)

routes.post('/auth-funcionario-status', ResumoVoucherControllers.autorizacaoEditarStatusVoucher)
routes.post('/auth-funcionario-create-voucher', ResumoVoucherControllers.postAuthFuncionarioCreateVoucher)
routes.post('/auth-funcionario-print-voucher', ResumoVoucherControllers.postAuthFuncionarioPrintVoucher)
routes.post('/auth-funcionario-update-voucher', ResumoVoucherControllers.postAuthFuncionarioUpdateVoucher)

// Comercial
routes.get('/listaProdutoSap', ComercialControllers.getListaProdutoSap)
routes.get('/listaEmpresaComercial', ComercialControllers.getListaEmpresaComercial)
// routes.get('/listaVendasPorProduto', ComercialControllers.getListaVendasEstruturaProdutos)
routes.get('/vendaMarcaPeriodoFinanceiro', ComercialControllers.getListaVendasMarcaPorPeriodoComercial)
routes.get('/vendasEstoqueGrupoSubGrupo', ComercialControllers.getListaVendasEstoqueGrupoSubGrupoComercial)
routes.get('/produtosPrecosEstoquesLojas', ComercialControllers.getListaProdutosEstoquePrecoLoja)
routes.get('/vendasEstoqueProduto', ComercialControllers.getListaVendasPosicionamentoEstoquePeriodos)
routes.get('/funcionarioRelatorio', ComercialControllers.getListaColaboradorRelatorio)
routes.get('/custoPorLoja', ComercialControllers.getListaVendasCustoLojas)
routes.get('/vendasPosicionamentoEstoque', ComercialControllers.getListaVendasPosicionamentoEstoque)
routes.get('/colaboradorProdutosVendidos', ComercialControllers.getListaColaboradorProdutosVendidos)
routes.get('/listaMetaVendas', ComercialControllers.getListaMetasGrupo)
routes.get('/listaPremiacoes', ComercialControllers.getListaPremiacoesPeriodo)

// routes.get('/listaGrupoProduto', ComercialControllers.getListaGrupoProduto)
// routes.get('/listaSubGrupoProduto', ComercialControllers.getListaSubGrupoProduto)

routes.get('/lista-marca-produto', ComercialProdutoControllers.getListaMarcaProduto)
routes.get('/lista-fornecedor-produto', ComercialProdutoControllers.getListaFornecedorProduto)
routes.get('/grupo-produto', ComercialProdutoControllers.getListaGrupoProduto)
routes.get('/subgrupo-produto', ComercialProdutoControllers.getListaSubGrupoProduto)
routes.get('/vendas-por-produtos', ComercialProdutoControllers.getListaVendasPorProduto)
routes.get('/vendas-vendedor-estrutura', ComercialProdutoControllers.getListaVendasVendedorEstrutura)
routes.get('/produtos-mais-vendidos', ComercialProdutoControllers.getListaProdutosMaisVendidosEstrutura)
routes.get('/vendas-por-estrutura', ComercialProdutoControllers.getListaVendasIndicadoresEstrutura)

// Compras
routes.get('/lista-pedidos', ComprasControllers.getListaPedidos)
routes.get('/ultimo-pedido', ComprasControllers.getListaUltimoPedido)
routes.get('/listaDetalhePedidos', ComprasControllers.getListaDetalhePedidos)
routes.get('/listaTodosPedidos', ComprasControllers.getListaTodosPedidos)
routes.get('/fornecedores', ComprasControllers.getListaFornecedores)
routes.get('/fabricantes', ComprasControllers.getListaFabricantes)
routes.get('/compradores', ComprasControllers.getListaCompradores)
routes.get('/listaPromocoes', ComprasControllers.getListaPromocoes)
routes.get('/listaEmpresaPromocoes', ComprasControllers.getListaEmpresaPromocoes)
routes.get('/listaProdutosOrigemPromocoes', ComprasControllers.getListaProdutoOrigemPromocoes)
routes.get('/listaProdutoDestinoPromocoes', ComprasControllers.getListaProdutoDestinoPromocoes)
routes.get('/fornecedorFabricante', ComprasControllers.getListaFornecedorFabricante)
routes.get('/vincularFabricanteFornecedor', ComprasControllers.getListaVinculoFornecedorFabricante)
routes.get('/condicaoPagamento', ComprasControllers.getListaCondicoesPagamento)
routes.get('/transportadoras', ComprasControllers.getListaTransportadora)
routes.get('/listaPedidosDetalhado', ComprasControllers.getListaPedidosDetalhado)
routes.get('/fabricante-fornecedor', ComprasControllers.getListaFabricanteCadastro)
routes.get('/subGrupoEstrutura', ComprasControllers.getListaEstruturaMercadoria)
routes.get('/imagemProdutos', ComprasControllers.getListaImagemProduto)
routes.get('/listaProdutosImagem', ComprasControllers.getListaDetalheImagemProduto)
routes.get('/produtos-imagens', ComprasControllers.getListaProdutosImagens)
routes.get('/listaTransportador', ComprasControllers.getListaTransportador)
routes.get('/transportadorID', ComprasControllers.getListaByIdTransportador)
routes.get('/tipoDocumento', ComprasControllers.getListaTPDocumento)
routes.get('/grupoEstrutura', ComprasControllers.getListaGrupoEstrutura)
routes.get('/listaCores', ComprasControllers.getListaCores)
routes.get('/grupoCores', ComprasControllers.getListaGrupoCores)
routes.get('/listaEstilos', ComprasControllers.getListaEstilos)
routes.get('/tipoTecidos', ComprasControllers.getListaTipoTecidos)
routes.get('/tipo-tecido', ComprasControllers.getListaTipoTecidoSelect)
routes.get('/categoriaPedidos', ComprasControllers.getListaCategoriaPedidos)
routes.get('/categoria-pedido', ComprasControllers.getListaCategoriaPedido)
routes.get('/tamanhosPedidos', ComprasControllers.getListaTamanhosPedidos)
routes.get('/vinculo-tamanho-categoria', ComprasControllers.getListaTamanhosCategoriaPedidos)
routes.get('/fornecedor-produto', ComprasControllers.getListaFornecedorProduto)
routes.get('/produtos-pedido', ComprasControllers.getListaProdutoPedido)
routes.get('/listaDetalhePedidos', ComprasControllers.getListaDetalhePedidos)
routes.get('/unidadeMedida', ComprasControllers.getListaUnidadeMedida)
routes.get('/unidades-de-Medidas', ComprasControllers.getListaUnidadesMedidas)

routes.get('/localExposicao', ComprasControllers.getListaLocalExposicao)
routes.get('/distribuicaoComprasHistorico', ComprasControllers.getListaDistribuicaoHistorico)
routes.get('/detalheDistribuicaoCompras', ComprasControllers.getListaDetalheDistribuicao)
routes.get('/distribuicaoSugestoesHistorico', ComprasControllers.getListaDistribuicaoSugestoesHistorico)
routes.get('/produtos-entre-filiais', ComprasControllers.getListaProdutosEntreFiliais)
routes.get('/produtos-por-pedido', ComprasControllers.getListaProdutosPorPedido)
routes.get('/consulta-fornecedor-sap', ComprasControllers.getListaFornecedorSap)



// UPDATE'
routes.put('/condicaoPagamento/:id', ComprasControllers.putCondicaoPagamento)
routes.put('/transportador/:id', ComprasControllers.putCadastroTransportador)
routes.put('/atualizarProdutoImagem', ComprasControllers.updateProdutoImagem)
routes.put('/sub-grupo-estrutura/:id', ComprasControllers.updateSubGrupoEstrutura)
routes.put('/grupo-estrutura/:id', ComprasControllers.putGrupoEstrutura)
routes.put('/unidadeMedida/:id', ComprasControllers.updateUnidadeMedida)
routes.put('/cores/:id', ComprasControllers.updateCores)
// routes.put('/atualizarEstilos', ComprasControllers.updateEstilos)
routes.put('/listaEstilos/:id', ComprasControllers.putEstilos)
routes.put('/tipo-tecido/:id', ComprasControllers.updateTipoTecidos)
routes.put('/categoriaPedidos/:id', ComprasControllers.putCategoriaPedidos)
routes.put('/fabricante/:id', ComprasControllers.putFabricante)
routes.put('/fabricante-fornecedor/:id', ComprasControllers.putFabricanteFornecedor)
routes.put('/fornecedor-fabricante/:id', ComprasControllers.putFornecedorFabricante)
routes.put('/excluir-vinculo-fornecedor', ComprasControllers.putExcluirVinculoFornecedorFabricante)

routes.put('/deletar-vinculo-tamanho-categoria', ComprasControllers.updateVinculoTamanhoCategoria)
routes.put('/fornecedor/:id', ComprasControllers.putFornecedor)
routes.put('/finalizar-pedido/:id', ComprasControllers.putFinalizarPedido)
routes.put('/atualizar-pedido/:id', ComprasControllers.putPedido)

// POST
routes.post('/cadastrarCondicaoPagamento', ComprasControllers.postCondicaoPagamento)
routes.post('/cadastro-sub-grupo-estrutura', ComprasControllers.createSubGrupoEstrutura)
routes.post('/cadastrarUnidadeMedida', ComprasControllers.createUnidadeMedida)
routes.post('/cadastrar-cores', ComprasControllers.createCores)
routes.post('/criarlistaEstilos', ComprasControllers.postEstilos)
routes.post('/cadastrar-tipo-tecido', ComprasControllers.createTipoTecidos)
routes.post('/criar-categoria-pedidos', ComprasControllers.createCategoriaPedidos)
routes.post('/cadastro-grupoEstrutura', ComprasControllers.postGrupoEstrutura)
routes.post('/cadastro-vinculo-tamanho-categoria', ComprasControllers.postVinculoCategoriaPedido)
routes.post('/cadastrar-transportador', ComprasControllers.postCadastroTransportador)
routes.post('/cadastrar-fabricante', ComprasControllers.postFabricante)
routes.post('/cadastrar-fabricante-fornecedor', ComprasControllers.postFabricanteFornecedor)
routes.post('/migrar-fabricante', ComprasControllers.postMigrarFabricanteSap)
routes.post('/cadastrar-fornecedor', ComprasControllers.postFornecedor)
routes.post('/cadastrar-imagem-produto', ComprasControllers.postImagemProduto)
routes.post('/finalizar-pedido', ComprasControllers.postFinalizarPedido)
routes.post('/pedido', ComprasControllers.postPedido)


// Cadastro
routes.get('/listaProdutoCriadoPedidoCompra', CadastroControllers.getListaProdutoCriadoPedidoCompra)
routes.get('/categoriasProdutos', CadastroControllers.getListaCategoriasProduto)
routes.get('/tipoProduto', CadastroControllers.getListaTipoProdutos)
routes.get('/tipoFiscalProduto', CadastroControllers.getListaTipoFiscalProdutos)
routes.get('/consultaProdutos', CadastroControllers.getConsultaProdutos)
routes.get('/nfPedido', CadastroControllers.getListaNFPedido)


routes.get('/produtoAvulso', CadastroControllers.getListaProdutosAvulso)
routes.put('/produtoAvulso/:id', CadastroControllers.getListaTipoFiscalProdutos)
routes.post('/produtoAvulso', CadastroControllers.postDetalheProdutoPedido)

// Movimento Caixa

routes.get('/ajusteFisicoDinheiro', MovimentoCaixaControllers.listaCaixasMovimentojuste)
routes.get('/movimento-caixa-gerencia', MovimentoCaixaControllers.listaCaixasMovimentoGerencia)
routes.get('/fechamento-caixa', MovimentoCaixaControllers.getListaFechamentoCaixa)
routes.get('/ajusteMovimento', MovimentoCaixaControllers.listaAjusteMovimentoCaixa)
routes.put('/atualizacao-status', MovimentoCaixaControllers.putListaAtualizacaoStatus)

routes.put('/ajuste-recebimento', MovimentoCaixaControllers.putListaAjusteRecebimento)

// Produtos 
routes.get('/produtoQuality', ProdutoControllers.getListaProdutosLojaQuality)
routes.get('/produtoSap', ProdutoControllers.getListaProdutosLojaSap)
routes.get('/produto-preco', ProdutoControllers.getListaProdutosPrecoInformatica)
routes.get('/grupoProdutoSap', ProdutoControllers.getListaGrupoProdutoSap)
routes.get('/produtoInformatica', ProdutoControllers.getListaProdutosInformaticaQuality)
routes.get('/lista-produtos', ProdutoControllers.getListaProdutos)
routes.get('/listaGrade', ProdutoControllers.getListaGrade)
routes.get('/listas-de-precos-sap', ProdutoControllers.ListaProdutosEtiqueta)
routes.get('/responsaveisAlteracaoPrecos', ProdutoControllers.getListaResponsavelAlteracaoPreco)
routes.get('/lista-produtos-etiqueta-sap', ProdutoControllers.ListaProdutosEtiquetagem)
routes.get('/alteracoes-de-precos-resumo', ProdutoControllers.getListaAlteracaoPrecoResumo)
routes.get('/alteracoes-de-precos-detalhes', ProdutoControllers.getListaAlteracaoPrecoDetalhe)

//  Depositos Loja
routes.get('/depositosLoja', DepositosLojaControllers.getListaDepositosLojaEmpresa)
routes.get('/deposito-loja-empresa', DepositosLojaControllers.getListaDepositosLojaEmpresa)

routes.post('/cadastrar-deposito-loja', DepositosLojaControllers.postDepositoLoja)
routes.put('/deposito-loja/:id', DepositosLojaControllers.putListaDepositosLoja)
routes.put('/atualizacao-status-conferido/:id', DepositosLojaControllers.putAtualizarStatusConferido)
routes.put('/deposito-loja-atualizacao-status/:id', DepositosLojaControllers.putAtualizarStatusDepositoLoja)

// Conta Banco
routes.get('/contaBanco', ContaBancoControllers.getListaContaBanco)

// Despesas Loja
routes.get('/despesas-loja-empresa', DespesasLojaControllers.getListaDespesasLojaEmpresa)
routes.get('/despesa-Loja-todos', DespesasLojaControllers.getListaTodasDespesasLojas)
routes.get('/despesa-lojas-dash', DespesasLojaControllers.getListaDespesasLojaDashBoard)
routes.get('/despesasEmpresas', DespesasLojaControllers.getListaDespesasEmpresaGerencia)

routes.post('/cadastrar-despesa-loja', DespesasLojaControllers.postCadastrarDespesasLoja)

//  Categoria Despesas
routes.get('/categoria-receita-despesa', CategoriaReceitaDespesasControllers.getListaCategoriaDespesas)
routes.get('/categoriaReceitaDespesaFinanceira', CategoriaReceitaDespesasControllers.getListaCategoriaDespesasFinanceira)


// Detalhes 
routes.get('/detalheFaturaGerencia', DetalheFaturasControllers.getDetalheFatura)

routes.get('/detalhe-Fatura-id', DetalheFaturasControllers.getDetalheFaturaById)
routes.put('/atualizar-fatura', DetalheFaturasControllers.updateFatura)

routes.put('/atualizar-detalhe-fatura-loja', DetalheFaturasControllers.putDetalheFaturaLoja)
routes.post('/criar-detalhe-fatura', DetalheFaturasControllers.postDetalheFaturaLoja)


// Marketing
routes.get('/produto-promocao', MarketingControllers.getListaProdutosPromocao)
routes.get('/listaPromocao', MarketingControllers.getListaPromocao)
routes.get('/campanha', MarketingControllers.getListaCampanha)
routes.get('/campanha-cliente', MarketingControllers.getListaCampanhaCliente)


routes.put('/campanha/:id', MarketingControllers.putCampanhaEmpresa)
routes.put('/campanha-cliente/:id', MarketingControllers.putCampanhaCliente)
routes.put('/produto-promocao/:id', MarketingControllers.putProdutoPromocao)

routes.post('/cadastrar-campanha-cliente', MarketingControllers.postCampanhaCliente)
routes.post('/cadastra-campanha', MarketingControllers.postCampanhaEmpresa)
routes.post('/cadastrar-produto-promocao', MarketingControllers.postProdutoPromocao)

// Contabilidade
routes.get('/listaVendasContigencia', ContabilidadeControllers.getListaVendasContigencia)
routes.get('/vendasDetalheContigencia', ContabilidadeControllers.getListaDetalheVendasContigencia)
routes.get('/vendasPagamentoContigencia', ContabilidadeControllers.getListaPagamentoVendasContigencia)
routes.get('/vendasEstoqueComercial', ContabilidadeControllers.getListaVendasEstoqueComercial)
routes.get('/vendasProdutos', ContabilidadeControllers.getListaVendasPeriodo)
routes.get('/vendasProdutosConsolidado', ContabilidadeControllers.getListaVendasPeriodoConsolidado)

// Configuração Pix PDV
routes.get('/configuracao-pix-pdv', ConfiguracaoPixPDVControllers.getListaConfiguracaoPixPDV)
// routes.put('/configuracao-pix-pdv', ConfiguracaoPixPDVControllers.updateConfiguracaoPixPDV)
routes.put('/atualizarConfiguracaoPixPDV', ConfiguracaoPixPDVControllers.updateConfiguracaoPixPDV)


// Conferencia Cega
routes.get('/listaOrdemTransferenciaConferenciaCega', ConferenciaCegaControllers.getListaOrdemTransferenciaConferenciaCega)
routes.get('/detalhe-ordem-transferencia-cega', ConferenciaCegaControllers.getDetalheOrdemTransferenciaConferenciaCega)
routes.get('/status-divergencia', ConferenciaCegaControllers.getListaStatusOTConfrecencia)
routes.put('/resumo-ordem-transferencia-cega/:id', ConferenciaCegaControllers.putResumoOrdemTransferencia)
routes.put('/status-divergencia/:id', ConferenciaCegaControllers.putStatusDivergencia)
routes.post('/inserir-status-divergencia', ConferenciaCegaControllers.postStatusDivergencia)

// Lista de Preço
routes.get('/listaPreco', ListaPrecoControllers.getListaPrecoPorMarca)


routes.get('/promocoes-ativas', PromocaoControllers.getListaPromocoesAtivas)
routes.get('/produto-promocao-ativa', PromocaoControllers.getListaProdutosPromocoesAtiva)
routes.get('/produto-promocao-destino', PromocaoControllers.getListaProdutosDestinoPromocoesAtiva)
routes.get('/produto-promocao-origem', PromocaoControllers.getListaProdutosOrigemPromocoesAtiva)
routes.get('/mecanicas-ativas', PromocaoControllers.getListaMecanicaAtivas)
routes.get('/detalhe-promocoes-ativas', PromocaoControllers.getListaDetalhesPromocoesAtivas)
routes.get('/empresa-promocoes-ativas', PromocaoControllers.getListaEmpresasPromocoesAtiva)
routes.post('/criar-promocoes-ativas', PromocaoControllers.postPromocao)
routes.put('/promocoes-ativas/:id', PromocaoControllers.putPromocao)
routes.post('/criar-mecanica', PromocaoControllers.postMecanicaAtivas)
routes.put('/desativar-produto-promocao-destino', PromocaoControllers.putProdutoDestinoPromocao)
routes.put('/desativar-produto-promocao-origem', PromocaoControllers.putProdutoOrigemPromocao)
routes.put('/desativar-empresa-promocao', PromocaoControllers.putEmpresaPromocao)
routes.put('/desativar-status-promocao', PromocaoControllers.putStatusPromocao)
// routes.post('/criar-mecanica', PromocaoControllers.postMecanicaAtivas)

routes.post('/deposito-integracao', ServiceLayerControllers.postDepositoIntegrarNoSAP)
// // Logs
// routes.get('/log-web', LogsControllers.getListaLogsUsuario)
routes.post('/log-web', LogsControllers.createLogsUsuario)



export default routes;

