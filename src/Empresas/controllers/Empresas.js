import axios from "axios";
import { dataFormatada } from "../../utils/dataFormatada.js";
// import { getEmpresasLista, updateEmpresa } from "../repositories/empresas.js";
import 'dotenv/config';
import { EmpresaServices } from "../services/index.js";
import { EmpresaClient } from "../client/index.js";
const url = process.env.API_URL|| 'localhost:6001'
const updateServiceEmpresa = new EmpresaServices(process.env.API_URL);
const updateClientEmpresa = new EmpresaClient(updateServiceEmpresa)

class EmpresaControllers {

    async getAllEmpresas(req, res) {
        let {idEmpresa, idSubGrupoEmpresa,  page, pageSize} = req.query;
        idEmpresa = idEmpresa ? idEmpresa : '';
        idSubGrupoEmpresa = idSubGrupoEmpresa ? idSubGrupoEmpresa : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
       
        try {
            const response = await axios.get(`${url}/api/empresa.xsjs?id=${idEmpresa}`)
            // const response = await getEmpresasLista(idEmpresa, idSubGrupoEmpresa,  page, pageSize)
            
            return res.json(response.data); 
        } catch (error) {
            console.error("Erro no EmpresaControllers.getAllEmpresas:", error);
            throw error; 
        }
    }
    async getListaEmpresas(req, res,) {
        let {idEmpresa} = req.query;

        try {
            idEmpresa = idEmpresa ? idEmpresa : '';
            const apiUrl = `${url}/api/empresa.xsjs?id=${idEmpresa}`;
            const response = await axios.get(apiUrl)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; // Lança o erro para tratamento posterior, se necessário
        }
    }
    
    async getAllGrupoEmpresarial(req, res, ) {
        let {idEmpresa, pageNumber, dataPesquisa} = req.query;
        
        const pageSize = 100;
        const offset = (pageNumber - 1) * pageSize;
        // const dataPesquisaFormatada = dataFormatada(dataPesquisa)
        try {
            const response = await axios.get(`${url}/api/grupo-empresarial.xsjs`)
            
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; // Lança o erro para tratamento posterior, se necessário
        }
    }

    
    async getSelectLojaVouchers(req, res,) {
        let {idGrupoEmpresarial, pageNumber, dataPesquisa} = req.query;

        idGrupoEmpresarial = Number(idGrupoEmpresarial) ? idGrupoEmpresarial : '';
    
        const pageSize = 100;
        const offset = (pageNumber - 1) * pageSize;
        // const dataPesquisaFormatada = dataFormatada(dataPesquisa)
        try {
            const response = await axios.get(`${url}/api/empresa.xsjs?idSubGrupoEmpresa=${idGrupoEmpresarial}`)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; // Lança o erro para tratamento posterior, se necessário
        }
       
    }
    async getById(req, res) {

    }

    async putListaEmpresas(req, res) {
        try {
            let {
                STGRUPOEMPRESARIAL,
                IDGRUPOEMPRESARIAL,
                IDSUBGRUPOEMPRESARIAL,
                NORAZAOSOCIAL,
                NOFANTASIA,
                NUCNPJ,
                NUINSCESTADUAL,
                NUINSCMUNICIPAL,
                CNAE,
                EENDERECO,
                ECOMPLEMENTO,
                EBAIRRO,
                ECIDADE,
                SGUF,
                NUUF,
                NUCEP,
                NUIBGE,
                EEMAILPRINCIPAL,
                EEMAILCOMERCIAL,
                EEMAILFINANCEIRO,
                EEMAILCONTABILIDADE,
                NUTELPUBLICO,
                NUTELCOMERCIAL,
                NUTELFINANCEIRO,
                NUTELGERENCIA,
                EURL,
                PATHIMG,
                NUCNAE,
                STECOMMERCE,
                DTULTATUALIZACAO,
                STATIVO,
                ALIQPIS,
                ALIQCOFINS,
                IDEMPRESA,
            } = req.body;   

            if(!IDEMPRESA) {
                return res.status(400).json({ error: "IDEMPRESA is required" });
            }
            // const response = await updateEmpresa(empresas)
            const response = await axios.put(`${url}/api/empresa.xsjs`, {
                STGRUPOEMPRESARIAL,
                IDGRUPOEMPRESARIAL,
                IDSUBGRUPOEMPRESARIAL,
                NORAZAOSOCIAL,
                NOFANTASIA,
                NUCNPJ,
                NUINSCESTADUAL,
                NUINSCMUNICIPAL,
                CNAE,
                EENDERECO,
                ECOMPLEMENTO,
                EBAIRRO,
                ECIDADE,
                SGUF,
                NUUF,
                NUCEP,
                NUIBGE,
                EEMAILPRINCIPAL,
                EEMAILCOMERCIAL,
                EEMAILFINANCEIRO,
                EEMAILCONTABILIDADE,
                NUTELPUBLICO,
                NUTELCOMERCIAL,
                NUTELFINANCEIRO,
                NUTELGERENCIA,
                EURL,
                PATHIMG,
                NUCNAE,
                STECOMMERCE,
                DTULTATUALIZACAO,
                STATIVO,
                ALIQPIS,
                ALIQCOFINS,
                IDEMPRESA,
            });
        
            return res.status(200).json({message: "Empresa atualizada com sucesso"});
        } catch (error) {
            console.error("Erro no EmpresaControllers.putListaEmpresas:", error);
            res.status(500).json({ error: "Erro ao atualizar empresa" });
            throw error;
        }
    }
}

export default new EmpresaControllers();