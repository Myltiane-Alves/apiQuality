// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;


export const getProdutosMaisVendidos = async (
    idEmpresa,
    idGrupoEmpresarial,
    idGrupo,
    idSubGrupo,
    idMarca,
    idFornecedor,
    descricaoProduto,
    uf,
    dataPesquisaInicio,
    dataPesquisaFim,
    page,
    pageSize
) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT DISTINCT 
                VWV.CPROD, 
                P.NUCODBARRAS, 
                P.DSNOME, 
                SUM(VWV.QTD) AS QTD, 
                ROUND(VWV.VUNCOM, 2) AS VALOR_UNITARIO, 
                (ROUND(VWV.VUNCOM, 2) * SUM(VWV.QTD)) AS VALOR_TOTAL 
            FROM "${databaseSchema}"."VW_VENDAS_PRODUTO_GRUPO_SUBGRUPO" VWV 
                INNER JOIN "${databaseSchema}".EMPRESA E ON VWV.IDEMPRESA = E.IDEMPRESA 
                INNER JOIN "${databaseSchema}".PRODUTO P ON VWV.CPROD = P.IDPRODUTO 
            WHERE 1=1
        `;

        const params = [];

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += 'AND VWV.DTHORAFECHAMENTO BETWEEN ? AND ? ';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        if(idGrupoEmpresarial > 0) {
            query += 'AND VWV.IDGRUPOEMPRESARIAL IN (?) ';
            params.push(idGrupoEmpresarial);
        }

        if (idEmpresa) {
            query += 'AND VWV.IDEMPRESA = ? ';
            params.push(idEmpresa);
        }

        if (descricaoProduto) {
            query += 'AND (UPPER(P.DSNOME) LIKE UPPER(?) OR P.NUCODBARRAS LIKE ?) ';
            params.push(`%${descricaoProduto}%`, `%${descricaoProduto}%`);
        }

        if(uf > 0) {
            query += 'AND VWV.SGUF = ? ';
            params.push(uf);
        }

        if (idFornecedor) {
            query += 'AND VWV.IDRAZAO_SOCIAL_FORNECEDOR IN (?) ';
            params.push(idFornecedor);
        }

        if (idGrupo) {
            const listarIdGrupo = idGrupo.split(',');
            let descGrupo = '';
            let listarDescGrupo = '';

            for (let i = 0; i < listarIdGrupo.length; i++) {
                switch (listarIdGrupo[i]) {
                    case '1':
                        descGrupo = 'Verão';
                        break;
                    case '2':
                        descGrupo = 'Calçados/Acessórios';
                        break;
                    case '3':
                        descGrupo = 'Cama/Mesa/Banho';
                        break;
                    case '4':
                        descGrupo = 'Utilidades Do Lar';
                        break;
                    case '5':
                        descGrupo = 'Diversos';
                        break;
                    case '6':
                        descGrupo = 'Artigos Esportivos';
                        break;
                    case '7':
                        descGrupo = 'Cosméticos';
                        break;
                    case '8':
                        descGrupo = 'Acessórios';
                        break;
                    case '9':
                        descGrupo = 'Peças Íntimas';
                        break;
                    case '10':
                        descGrupo = 'Inverno';
                        break;
                }

                listarDescGrupo += i === 0 ? `'${descGrupo}'` : `,'${descGrupo}'`;
            }
            query += `AND VWV.GRUPO IN (${listarDescGrupo}) `;
        }

        if (idSubGrupo) {
            query += 'AND VWV.IDSUBGRUPO IN (?) ';
            params.push(idSubGrupo);
        }

        if (idMarca) {
            query += 'AND VWV.IDMARCA IN (?) ';
            params.push(idMarca);
        }

        query += 'GROUP BY VWV.CPROD, P.NUCODBARRAS, P.DSNOME,VWV.VUNCOM';
        query += 'ORDER BY SUM(VWV.QTD) DESC';

        const offset = (page - 1) * pageSize;
        query += 'LIMIT ? OFFSET ? ';
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);
        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result,
        }
    } catch (error) {
        console.error('Erro ao executar a consulta Produtos Mais Vendidos:', error);
        throw error;
    }
};
