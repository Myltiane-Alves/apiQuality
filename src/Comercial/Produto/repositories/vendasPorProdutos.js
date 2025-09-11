// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getVendasPorProdutos = async (idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        // Definindo valores padrão para paginação
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        // Construção da query
        let query = `
            SELECT DISTINCT 
                v2.IDVENDA,
                v2.IDEMPRESA,
                v2.NOFANTASIA,
                v2.GRUPO,
                v2.SUBGRUPO,
                v2.MARCA,
                v3.NUCODBARRAS,
                v3.DSNOME,
                SUM(v2.QTD) AS QTD,
                (SELECT SUM(VD.QTD) FROM QUALITY_CONC.VENDADETALHE VD WHERE VD.IDVENDA = V2.IDVENDA) AS TOTAL
            FROM 
                "${databaseSchema}".VW_VENDAS_PRODUTO_GRUPO_SUBGRUPO v2
                INNER JOIN "${databaseSchema}".PRODUTO v3 ON V2.CPROD = V3.IDPRODUTO
            WHERE 1 = 1
        `;

        const params = [];

        // Filtros opcionais
        if (idEmpresa) {
            query += ` AND v2.IDEMPRESA = ? `;
            params.push(idEmpresa);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND v2.DTHORAFECHAMENTO BETWEEN ? AND ? ';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        query += `
            GROUP BY v2.IDVENDA, v2.IDEMPRESA, v2.NOFANTASIA, v2.GRUPO, v2.SUBGRUPO, v2.MARCA, v3.NUCODBARRAS, v3.DSNOME
            ORDER BY v2.IDVENDA
            LIMIT ? OFFSET ?
        `;

        const offset = (page - 1) * pageSize;
        params.push(pageSize, offset);

        // Executando a consulta
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page,
            pageSize,
            rows: result.length,
            data: result,
        };

    } catch (error) {
        console.error('Erro ao executar a consulta de vendas por produtos:', error);
        throw error;
    }
};
