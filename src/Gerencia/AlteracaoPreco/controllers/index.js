import axios from "axios";
import { getAlteracaoPreco } from "../repositories/alteracao.js";
import 'dotenv/config';
const url = process.env.API_URL;




class GERAlteracaoPrecoControllers {
    async getListaAlteracaoPreco(req, res) {
        let {
            idMarca,
            idEmpresa,
            grupo,
            subGrupo,
            descProduto,
            codBarras,
            estoque,
            dataPesquisaInicio,
            dataPesquisaFim,
            page,
            pageSize 
        } = req.query;


        idMarca = idMarca ? idMarca : '';
        idEmpresa = idEmpresa ? idEmpresa : '';
        grupo = grupo ? grupo : '';
        subGrupo = subGrupo ? subGrupo : '';
        descProduto = descProduto ? descProduto : '';
        codBarras = codBarras ? codBarras : '';
        estoque = estoque ? estoque : '';
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : '';
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';
        

        try {
            
            const apiUrl = `${url}/api/administrativo/alteracao-preco.xsjs?idEmpresa=${idEmpresa}&grupo=${grupo}&subgrupo=${subGrupo}&descProduto=${descProduto}&codBarras=${codBarras}&estoque=${estoque}&dataInicio=${dataPesquisaInicio}&dataFim=${dataPesquisaFim}&page=${page}&pageSize=${pageSize}`;
            const response = await axios.get(apiUrl);
            // const response = await getAlteracaoPreco(idMarca, idEmpresa, grupo, subGrupo, descProduto, codBarras, estoque, dataPesquisaInicio, dataPesquisaFim, page, pageSize)

            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Erro no GeRAlteracaoPrecoControllers:", error);
            res.status(500).json({ error: "Erro ao buscar dados de alteração de preço" });
            throw error;
        }
        
    }
}



export default new GERAlteracaoPrecoControllers();