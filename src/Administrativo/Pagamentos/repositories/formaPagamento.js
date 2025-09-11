// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getFormaPagamento = async (page, pageSize) => {
    try {

        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;


        let query = `
            SELECT DISTINCT
                UPPER(v.DSTIPOPAGAMENTO) AS DSTIPOPAGAMENTO
            FROM 
                "${databaseSchema}".VENDAPAGAMENTO v 
            WHERE 
                1 = ?
                AND v.DTPROCESSAMENTO >= '2022-01-01'
        `;


        const params = [1];


        query += ' ORDER BY UPPER(v.DSTIPOPAGAMENTO) ';
        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);


        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

      
        const countQuery = `
            SELECT COUNT(DISTINCT UPPER(v.DSTIPOPAGAMENTO)) AS total
            FROM 
                "${databaseSchema}".VENDAPAGAMENTO v 
            WHERE 
                1 = ?
                AND v.DTPROCESSAMENTO >= '2022-01-01'
        `;
        const countStatement = await conn.prepare(countQuery);
        const countResult = await countStatement.exec([1]);
        const totalRows = countResult[0].TOTAL;

   
        return {
            page: page,
            pageSize: pageSize,
            rows: totalRows,
            data: result,
        };
    } catch (error) {
        console.error('Erro ao executar a consulta forma pagamento:', error);
        throw error;
    }
};
