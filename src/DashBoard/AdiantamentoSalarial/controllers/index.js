import axios from "axios";
import { getAdiantamentosLojas, putAdiantamentosLojas } from "../repositories/adiantamento-lojas.js";
import { getAdiantamentosFuncionarios } from "../repositories/funcionarios.js";
import { createAdiantamentoSalarial, getAdiantamentoSalarialDashBoard, updateAdiantamentoSalarial } from "../repositories/adiantamentoSalarial.js";
import 'dotenv/config';
const url = process.env.API_URL;


class DashBoardAdiantamentoSalarialControllers {


    async getListaAdiantamentoSalarialLoja(req, res) {
        let { idMarca, idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page } = req.query;

        idEmpresa = idEmpresa ? idEmpresa : '';
        idMarca = idMarca ? idMarca : '';
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
        pageSize = pageSize ? pageSize : '';
        page = page ? page : '';

        try {
            const apiUrl = `${url}/api/dashboard/adiantamento-salarial/adiantamentolojas.xsjs?idEmpresa=${idEmpresa}&dataPesquisaIni=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&idMarca=${idMarca}&pageSize=${pageSize}&page=${page}`;
           const response = await axios.get(apiUrl);
            // const response = await getAdiantamentosLojas(idMarca, idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }

    }
    async getListaAdiantamentosFuncionarios(req, res) {
        let { idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page } = req.query;

        idEmpresa = idEmpresa ? idEmpresa : '';
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
        pageSize = pageSize ? pageSize : '';
        page = page ? page : '';

        try {
                                //   /api/dashboard/adiantamento-salarial/funcionarios.xsjs?idEmpresa=1&dataPesquisaInicio=2024-12-07&dataPesquisaFim=2024-12-07
            const apiUrl = `${url}/api/dashboard/adiantamento-salarial/funcionarios.xsjs?idEmpresa=${idEmpresa}&dataPesquisaIni=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&pageSize=${pageSize}&page=${page}`;
            const response = await axios.get(apiUrl);

            // const response = await getAdiantamentosFuncionarios(idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page)

            return res.json(response.data); 
        } catch (error) {
            console.error("Error in DashBoardAdiantamentoSalarialControllers.getListaAdiantamentosFuncionarios:", error);
            throw error;
        }

    }

    async getListaAdiantamentosSalarialDashBoard(req, res) {
        let { idEmpresa, dataPesquisa, pageSize, page } = req.query;

        idEmpresa = idEmpresa ? idEmpresa : '';
        dataPesquisa = dataPesquisa ? dataPesquisa : '';
        pageSize = pageSize ? pageSize : '';
        page = page ? page : '';

        try {
            const apiUrl =  `${url}/api/dashboard/adiantamento-salarial.xsjs?idEmpresa=${idEmpresa}&dataPesquisa=${dataPesquisa}`;
            const response = await axios.get(apiUrl);

            // const response = await getAdiantamentoSalarialDashBoard(idEmpresa, dataPesquisa, pageSize, page)

            return res.json(response.data)
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }

    }


    async updateAdiantamentoStatus(req, res) {
        let { STATIVO,IDADIANTAMENTOSALARIO } = req.body;
        
        if (!STATIVO || !IDADIANTAMENTOSALARIO) {
            return res.status(400).json({ error: "STATIVO and IDADIANTAMENTOSALARIO are required." });
        }
        try {
           
            // const response = await putAdiantamentosLojas(STATIVO, IDADIANTAMENTOSALARIO, )
            const response = await axios.put(`${url}/api/financeiro/atualizacao-adiantamento-status.xsjs`, {
                STATIVO,
                IDADIANTAMENTOSALARIO
            });

            return res.json(response.data);
        } catch (error) {
          console.error("Erro no DashBoardAdiantamentoSalarialControllers.updateAdiantamentoStatus :", error);
          throw error;
        }
    }

    async putAdiantamentoSalarial(req, res) {
        try {
            const dados = Array.isArray(req.body) ? req.body : [req.body];   
            const response = await updateAdiantamentoSalarial(dados)
        
            return res.json(response);
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
    }
 
    async postAdiantamentoSalarial(req, res) {
        try {
            let { IDEMPRESA, IDFUNCIONARIO, DTLANCAMENTO, TXTMOTIVO, VRVALORDESCONTO, STATIVO, IDUSR } = req.body;   
            // const response = await createAdiantamentoSalarial(dados)
            if(!IDEMPRESA) {
                return res.status(400).json({ error: "IDEMPRESA is required." });
            }

            if(!IDFUNCIONARIO) {
                return res.status(400).json({ error: "IDFUNCIONARIO is required."});
            }

            if(!DTLANCAMENTO) {
                return res.status(400).json({ error: "DTLANCAMENTO is required."});
            }

            if(!TXTMOTIVO) {
                return res.status(400).json({ error: "TXTMOTIVO is required."});
            }

            if(!VRVALORDESCONTO) {
                return res.status(400).json({ error: "VRVALORDESCONTO is required."});
            }

            if(!STATIVO) {
                return res.status(400).json({ error: "STATIVO is required."});
            }

            if(!IDUSR) {
                return res.status(400).json({ error: "IDUSR is required."});
            }

            const response = await axios.post(`${url}/api/adiantamento-salarial.xsjs`, {
                IDEMPRESA,
                IDFUNCIONARIO,
                DTLANCAMENTO,
                TXTMOTIVO,
                VRVALORDESCONTO,
                STATIVO,
                IDUSR
            });
        
            return res.json(response.data);
        } catch (error) {
            console.error("Error in DashBoardAdiantamentoSalarialControllers.postAdiantamentoSalarial:", error);
            throw error;
        }
    }
}

export default new DashBoardAdiantamentoSalarialControllers();