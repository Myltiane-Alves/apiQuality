import axios from "axios";
import { getQuebraCaixaLoja } from "../repositories/quebraCaixaLoja.js";
import { getQuebraCaixa, updateStatusQuebraCaixa } from "../repositories/listaQuebraCaixa.js";
import { createQuebraCaixa, updateQuebraCaixa, } from "../repositories/todos.js";
import { getQuebraCaixaID } from "../repositories/quebraCaixa.js";
import 'dotenv/config';
const url = process.env.API_URL;


class QuebraCaixaControllers {
    async getListaQuebraCaixaResumoADM(req, res) {
        let { idEmpresa, dataPesquisa, page, pageSize } = req.query;

        idEmpresa = idEmpresa ? idEmpresa : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        dataPesquisa = dataPesquisa ? dataPesquisa : '';
        
        try {
            
        
            const apiUrl = `${url}/api/administrativo/quebra-caixa-loja.xsjs?idEmpresa=${idEmpresa}&dataPesquisa=${dataPesquisa}&page=${page}&pageSize=${pageSize}`;
            const response = await axios.get(apiUrl);
            // const response = await getQuebraCaixaLoja(idEmpresa, dataPesquisa, page, pageSize)
           
            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    }

    async getListaQuebraCaixa(req, res) {
        let { idMarca, idEmpresa, cpfOperadorQuebra, uf, stQuebraPositivaNegativa, dataPesquisaInicio, dataPesquisaFim, pageSize, page } = req.query;

        idMarca = idMarca ? idMarca : '';
        idEmpresa = idEmpresa ? idEmpresa : '';
        cpfOperadorQuebra = cpfOperadorQuebra ? cpfOperadorQuebra : '';
        uf = uf ? uf : '';
        stQuebraPositivaNegativa = stQuebraPositivaNegativa ? stQuebraPositivaNegativa : '';
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        
        try {
            // http://164.152.245.77:8000/quality/concentrador/api/dashboard/quebra-caixa/lista-quebra-caixa.xsjs?pageSize=1000&page=2&idEmpresa=0&dataPesquisaInic=2024-12-06&dataPesquisaFim=2024-12-06&idMarca=0&cpfquebraop=
            const apiUrl = `${url}/api/dashboard/quebra-caixa/lista-quebra-caixa.xsjs?pageSize=${pageSize}&page=${page}&idEmpresa=${idEmpresa}&dataPesquisaInic=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idMarca=${idMarca}&cpfquebraop=${cpfOperadorQuebra}&stQuebraPositivaNegativa=${stQuebraPositivaNegativa}&uf=${uf}`;
            const response = await axios.get(apiUrl);
            // const response = await getQuebraCaixa(idMarca, idEmpresa, cpfOperadorQuebra, stQuebraPositivaNegativa, dataPesquisaInicio, dataPesquisaFim, pageSize, page)
          
            return res.json(response.data); 
        } catch (error) {
            console.error("Erro no QuebraCaixaControllers.getListaQuebraCaixa:", error);
            throw error;
        }
        
    }

    async getQuebraCaixaID(req, res) {
        let { idQuebraCaixa, page, pageSize } = req.query;

        idQuebraCaixa = idQuebraCaixa ? idQuebraCaixa : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        
        try {
            
            // const response = await getQuebraCaixaID(idQuebraCaixa, page, pageSize)
            const apiUrl = `${url}/api/dashboard/quebra-caixa/quebra-caixa.xsjs?id=${idQuebraCaixa}`;
            const response = await axios.get(apiUrl);
            
            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }

    async putListaStatusQuebraCaixa(req, res) {
        try {
            let { IDQUEBRACAIXA, STATIVO } = req.body 
            // const response = await  updateStatusQuebraCaixa(quebras);
            if(!IDQUEBRACAIXA || !STATIVO)  {
                return res.status(400).json({ error: "IDQUEBRACAIXA and STATIVO are required." });
            }
            const response = await axios.put(`${url}/api/dashboard/quebra-caixa/atualizacao-status.xsjs`, { IDQUEBRACAIXA, STATIVO });
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: error.message });
        }
       
    }
    async putQuebraCaixa(req, res) {
        try {
            const quebras = Array.isArray(req.body) ? req.body : [req.body]; 
            const response = await  updateQuebraCaixa(quebras);
            return res.json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            return res.status(500).json({ error: error.message });
        }
       
    }

    async postQuebraCaixa(req, res) {

        try {
            let {IDCAIXAWEB, IDMOVIMENTOCAIXA, IDGERENTE, IDFUNCIONARIO, DTLANCAMENTO, VRQUEBRASISTEMA, VRQUEBRAEFETIVADO, TXTHISTORICO, STATIVO} = req.body; 
            // const response = await createQuebraCaixa(quebras);

            if(!IDCAIXAWEB) {
                return res.status(400).json({ error: "IDCAIXAWEB is required." });
            }

            if(!IDMOVIMENTOCAIXA) {
                return res.status(400).json({ error: "IDMOVIMENTOCAIXA is required." });
            }

            if(!IDGERENTE) {
                return res.status(400).json({ error: "IDGERENTE is required." });
            }

            if(!IDFUNCIONARIO) {
                return res.status(400).json({ error: "IDFUNCIONARIO is required."});
            }
            
            const response = await axios.post(`${url}/api/dashboard/quebra-caixa/todos.xsjs`, {
                IDCAIXAWEB,
                IDMOVIMENTOCAIXA,
                IDGERENTE,
                IDFUNCIONARIO,
                DTLANCAMENTO,
                VRQUEBRASISTEMA,
                VRQUEBRAEFETIVADO,
                TXTHISTORICO,
                STATIVO
            });
            return res.json(response.data);
        } catch (error) {
            console.error("Erro no QuebraCaixaControllers.postQuebraCaixa:", error);
            return res.status(500).json({ error: error.message });
        }
       
    }
}

export default new QuebraCaixaControllers();