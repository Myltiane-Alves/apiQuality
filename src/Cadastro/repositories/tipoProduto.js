// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getTipoProduto = async (idTipoProduto, dsTipoProduto, tipoPedido, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                tbtp.IDTIPOPRODUTO,
                tbtp.CODTIPOPRODUTO,
                tbtp.DSTIPOPRODUTO,
                tbtp.STATIVO,
                tbtp.IDSAP
                FROM 
                "${databaseSchema}".TIPOPRODUTO tbtp
            WHERE 
                1 = ?
                AND tbtp.STATIVO='True'
        `;

        const params = [1];

        if (idTipoProduto) {
            query += ' And tbtp.IDTIPOPRODUTO  ? ';
            params.push(idTipoProduto);
        }

        if (dsTipoProduto) {
            query += ' And tbtp.DSTIPOPRODUTO LIKE ? OR tbtp.DSTIPOPRODUTO LIKE ? ';
            params.push(`%${dsTipoProduto}%`, `%${dsTipoProduto}%`);
        }

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