import axios from "axios";
import { dataFormatada } from "../../../utils/dataFormatada.js";
import { getMovimentoCaixaGerencia } from "../repositories/gerencia.js";
import { putAtualizacaoStatus } from "../repositories/atualizacaoStatus.js";
import { putAjusteRecebimento } from "../repositories/ajusteRecebimento.js";
import { getFechamentoCaixa } from "../repositories/fechamentoCaixa.js";
import 'dotenv/config';
import { MovimentoCaixaClient } from "../client/index.js";
import { MovimentoCaixaService } from "../services/index.js";
const url = process.env.API_URL;

const movimentoCaixaClient = new MovimentoCaixaClient(process.env.API_URL);
const movimentoCaixaService = new MovimentoCaixaService(movimentoCaixaClient);
class MovimentoCaixaControllers {

    async listaCaixasMovimentojuste(req, res) {

        let { idEmpresa, pageNumber, dataPesq } = req.query;
        if (!isNaN(idEmpresa)) {
            idEmpresa = Number(idEmpresa);
            const pageSize = 100;
            const offset = (pageNumber - 1) * pageSize;
            dataPesq = dataFormatada(dataPesq)
            try {
                const apiUrl = `${url}/api/movimento-caixa/ajuste-fisicodinheiro.xsjs?pagesize=${pageSize}&idEmpresa=${idEmpresa}&offset=${offset}`
                const response = await axios.get(apiUrl)

                return res.json(response.data);
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    }
    async listaAjusteMovimentoCaixa(req, res) {

        let { idMovimentoCaixa } = req.query;
        if (!isNaN(idMovimentoCaixa)) {
            idMovimentoCaixa = Number(idMovimentoCaixa);

            try {
                const apiUrl = `${url}/api/movimento-caixa/gerencia.xsjs?idMovimentoCaixa=${idMovimentoCaixa}`
                const response = await axios.get(apiUrl)

           
                return res.json(response.data);
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    }
    async listaCaixasMovimentoGerencia(req, res) {

        let { idEmpresa, idMovimentoCaixa, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;

        idEmpresa = Number(idEmpresa) ? idEmpresa : '';
        idMovimentoCaixa = idMovimentoCaixa ? idMovimentoCaixa : '';
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';

        try {
            // http://164.152.245.77:8000/quality/concentrador_homologacao/api/movimento-caixa/gerencia.xsjs?idEmpresa=1&dataPesquisaInic=2023-12-09&dataPesquisaFim=2024-12-09
            const apiUrl = `${url}/api/movimento-caixa/gerencia.xsjs?idEmpresa=${idEmpresa}&idMovimentoCaixa=${idMovimentoCaixa}&dataPesquisaInic=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
            const response = await axios.get(apiUrl)
            // const response = await getMovimentoCaixaGerencia(idEmpresa, idMovimentoCaixa, dataPesquisaInicio, dataPesquisaFim, page, pageSize)
            return res.json(response.data);
        } catch (error) {
            console.error("Error no MovimentoCaixaControllers.listaCaixasMovimentoGerencia:", error);
            return res.status(500).json({ error: error.message });
            
        }

    }

    async getListaFechamentoCaixa(req, res) {
        let { idEmpresa, idMovimentoCaixa, idCaixa, dataPesquisa,  page, pageSize } = req.query;
            idEmpresa = idEmpresa ? idEmpresa : '';
            idMovimentoCaixa = idMovimentoCaixa ? idMovimentoCaixa : '';
            idCaixa = idCaixa ? idCaixa : '';
            dataPesquisa = dataPesquisa ? dataPesquisa : '';
            page = page ? page : ''
            pageSize = pageSize ? pageSize : ''
        try {
            
            const apiUrl = `${url}/api/movimento-caixa/fechamento-caixa.xsjs?idMovimentoCaixa=${idMovimentoCaixa}`
            const response = await axios.get(apiUrl)
            // const response = await getFechamentoCaixa(idEmpresa, idMovimentoCaixa, idCaixa, dataPesquisa,  page, pageSize)
    
          return res.json(response.data);
        } catch (error) {
          console.error("Error no MovimentoCaixaControllers.getListaFechamentoCaixa:", error);
          return res.status(500).json({ error: error.message });
         
        }
      
    }

    async putListaAtualizacaoStatus(req, res) {
        try {
            let {IDSUPERVISOR, STCONFERIDO, ID} = req.body;
            
            const response = await movimentoCaixaService.updateStatus(IDSUPERVISOR, STCONFERIDO, ID)
          

            return res.status(200).json(response);
        } catch (error) {
            console.error("Erro no MovimentoCaixaControllers.putListaAtualizacaoStatus:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    async putListaAjusteRecebimento(req, res) {
        try {
            let {ID, VRAJUSTDINHEIRO, VRAJUSTTEF, VRAJUSTPOS, VRAJUSTFATURA, VRAJUSTVOUCHER, VRAJUSTCONVENIO, VRAJUSTPIX, VRAJUSTPL, TXT_OBS, VRQUEBRACAIXA} = req.body; 

            if(!ID) {
                return res.status(400).json({ error: "ID is required" });
            }

            if(!TXT_OBS) {
                return res.status(400).json({ error: "TXT_OBS is required" });
            }

            const response = await axios.put(`${url}/api/movimento-caixa/ajuste-recebimento.xsjs`, {
                ID,
                VRAJUSTDINHEIRO,
                VRAJUSTTEF,
                VRAJUSTPOS,
                VRAJUSTFATURA,
                VRAJUSTVOUCHER,
                VRAJUSTCONVENIO,
                VRAJUSTPIX,
                VRAJUSTPL,
                TXT_OBS,
                VRQUEBRACAIXA
            })
            // const response = await putAjusteRecebimento(dados);
            return res.status(200).json({message: "Ajuste de recebimento atualizado com sucesso!"});
        } catch (error) {
            console.error("Erro no MovimentoCaixaControllers.putListaAjusteRecebimento:", error);
            return res.status(500).json({ error: error.message });
        }
    }
}

export default new MovimentoCaixaControllers();