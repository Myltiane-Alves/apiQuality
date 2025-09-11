// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getFaturaPixPeriodoConsolidado = async (idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                tbse.DSSUBGRUPOEMPRESARIAL,
                IFNULL(SUM(tbdf.VRRECEBIDO), 0) AS VRRECEBIDO
            FROM 
                "${databaseSchema}".DETALHEFATURA tbdf
                INNER JOIN "${databaseSchema}".EMPRESA tbe on tbdf.IDEMPRESA = tbe.IDEMPRESA
                INNER JOIN "${databaseSchema}".SUBGRUPOEMPRESARIAL tbse on tbe.IDSUBGRUPOEMPRESARIAL = tbse.IDSUBGRUPOEMPRESARIAL
            WHERE 
                1 = ?
                AND tbdf.STCANCELADO = 'False'
                AND tbdf.STPIX = 'True'
        `;

        const params = [1];

        if (idMarca == 0) {
            query += ` AND tbe.IDGRUPOEMPRESARIAL IN (1, 2, 3, 4)`;
        } else {
            query += ` AND tbe.IDGRUPOEMPRESARIAL = ?`;
            params.push(idMarca);
        }


        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ` AND (tbdf.DTPROCESSAMENTO BETWEEN ? AND ?)`;
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        query += ` GROUP BY tbse.DSSUBGRUPOEMPRESARIAL`;

    
        const offset = (page - 1) * pageSize;

        query += ` LIMIT ? OFFSET ?`;
        params.push(pageSize, offset);

      
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result
        };
    } catch (e) {
        throw new Error(e.message);
    }
};
