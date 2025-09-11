// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getTipoFiscalProduto = async (idTipoFiscalProduto, dsTipoFiscalProduto, tipoPedido, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                tbtfp.IDTIPOFISCALPRODUTO,
                tbtfp.CODTIPOFISCALPRODUTO,
                tbtfp.DSTIPOFISCALPRODUTO,
                tbtfp.STATIVO,
                tbtfp.IDSAP
            FROM 
                "${databaseSchema}".TIPOFISCALPRODUTO tbtfp
            WHERE 
                1 = ?
                AND tbtfp.STATIVO='True'
        `;

        const params = [1];

        if (idTipoFiscalProduto) {
            query += ' And tbtfp.IDTIPOFISCALPRODUTO ? ';
            params.push(idTipoFiscalProduto);
        }

        if (dsTipoFiscalProduto) {
            query += ' And tbtfp.DSTIPOFISCALPRODUTO  LIKE ? OR tbtfp.DSTIPOFISCALPRODUTO  LIKE ? ';
            params.push(`%${dsTipoFiscalProduto}%`, `%${dsTipoFiscalProduto}%`);
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
        console.error('Erro ao consultar Tipo Fiscal Produto :', error);
        throw error;
    }
}