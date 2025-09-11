// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE; // Certifique-se de que está definido corretamente.

export const getPagamentoTef = async (numeroTef, page, pageSize) => {
    try {
        // Valores padrão de paginação
        page = page && !isNaN(page) ? parseInt(page, 10) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize, 10) : 1000;

        let query = `
            SELECT 
                CONCAT(CONCAT(TVP.TPAG, '-', TVP.DSTIPOPAGAMENTO)) AS DSTIPOPAGAMENTOTEF 
            FROM 
                "${databaseSchema}"."VENDAPAGAMENTO" TVP 
            WHERE 
                TVP.NOTEF = 'TEF' 
                AND CONCAT(CONCAT(TVP.TPAG, '-', TVP.DSTIPOPAGAMENTO)) IS NOT NULL 
                AND TVP.DSTIPOPAGAMENTO != '' 
                AND TVP.DTPROCESSAMENTO > '2022-01-01' 
            GROUP BY 
                TVP.TPAG, TVP.DSTIPOPAGAMENTO
        `;

        const params = [];

        if (numeroTef) {
            query += ` AND TVP.NOTEF = ? `;
            params.push(numeroTef);
        }

        console.log('Params:', params);
        console.log('Query:', query);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page,
            pageSize,
            rows: result.length,
            data: result,
        };
    } catch (error) {
        console.error('Erro ao executar a consulta forma pagamento:', error);
        throw error;
    }
};
