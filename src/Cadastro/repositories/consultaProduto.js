// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getProduto = async (descricaoProduto, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT
            	(SELECT "ItemCode" FROM SBO_GTO_PRD.OITM WHERE UPPER("ItemName") = '${descricaoProduto}' LIMIT 1)AS IDPRODUTOSAP,
            	(SELECT IDPRODUTO FROM "${databaseSchema}".PRODUTO WHERE UPPER(DSNOME) = '${descricaoProduto}' LIMIT 1)AS IDPRODUTOQUALITY,
            	(SELECT IDPRODCADASTRO FROM "${databaseSchema}".DETALHEPRODUTOPEDIDO WHERE UPPER(DSPRODUTO) = '${descricaoProduto}' AND STCANCELADO = 'False' LIMIT 1) AS IDPRODUTODETALHEPRODPEDIDO
            FROM
            	DUMMY
            WHERE
            	1 = ?
        `;

        const params = [1];

        // if (descricaoProduto) {
        //     query += ' And tbtp.DSTIPOPRODUTO LIKE ? OR tbtp.DSTIPOPRODUTO LIKE ? ';
        //     params.push(`%${descricaoProduto}%`, `%${descricaoProduto}%`);
        // }

        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
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
        console.error('Erro ao consultar Categorias :', error);
        throw error;
    }
}