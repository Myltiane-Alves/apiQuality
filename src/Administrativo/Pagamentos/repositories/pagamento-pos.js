// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getPagamentoPos = async (numeroPos, page, pageSize) => {
    try {

        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;


        let query = `
            SELECT 
                concat(concat(TVP.TPAG, '-'), TVP.DSTIPOPAGAMENTO) AS DSTIPOPAGAMENTOPOS 
            FROM 
                "${databaseSchema}".VENDAPAGAMENTO TVP 
            WHERE 
                1 = ?
                AND TVP.NOTEF = 'POS'
                AND concat(concat(TVP.TPAG, '-'), TVP.DSTIPOPAGAMENTO) IS NOT NULL 
                AND TVP.DSTIPOPAGAMENTO != '' 
                AND TVP.DTPROCESSAMENTO > '2022-01-01' 
            GROUP BY 
                TVP.TPAG, TVP.DSTIPOPAGAMENTO
        `;


        const params = [1];

        if (numeroPos) {
            query += ` AND TVP.NOTEF = ? `;
            params.push(numeroPos);
        }

        query += ' ORDER BY UPPER(TVP.DSTIPOPAGAMENTO) ';
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
        };
    } catch (error) {
        console.error('Erro ao executar a consulta forma pagamento:', error);
        throw error;
    }
};
