// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getVendaPixConsolidado = async (idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        
        let query = `
            SELECT 
                tbse.DSSUBGRUPOEMPRESARIAL,
                IFNULL(SUM(tbvp.VALORRECEBIDO), 0) AS PIX
            FROM 
                "${databaseSchema}".VENDA tbv
                INNER JOIN "${databaseSchema}".VENDAPAGAMENTO tbvp on tbv.IDVENDA = tbvp.IDVENDA
                INNER JOIN "${databaseSchema}".EMPRESA tbe on tbv.IDEMPRESA = tbe.IDEMPRESA
                INNER JOIN "${databaseSchema}".SUBGRUPOEMPRESARIAL tbse on tbe.IDSUBGRUPOEMPRESARIAL = tbse.IDSUBGRUPOEMPRESARIAL
            WHERE 
                1 = 1
                AND tbv.STCANCELADO = 'False'
                AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL)
                AND tbvp.NOTEF = 'PIX' AND tbvp.DSTIPOPAGAMENTO = 'PIX'
        `;

        const params = [];

        
        if (idMarca == 0) {
            query += ` AND tbe.IDGRUPOEMPRESARIAL IN (1, 2, 3, 4)`;
        } else {
            query += ` AND tbe.IDGRUPOEMPRESARIAL = ?`;
            params.push(idMarca);
        }

        
        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ` AND (tbv.DTHORAFECHAMENTO BETWEEN ? AND ?)`;
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        query += ` GROUP BY tbse.DSSUBGRUPOEMPRESARIAL`;

        
        const offset = (page - 1) * pageSize;
        query += ` LIMIT ? OFFSET ?`;
        params.push(pageSize, offset);

        
        const statement = conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result,
        }
    } catch (e) {
        throw new Error(e.message);
    }
};
