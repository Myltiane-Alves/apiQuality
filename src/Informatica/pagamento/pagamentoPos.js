// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getPagamentoPOS = async () => {
    try {
        let query = `
            SELECT 
                TVP.DSTIPOPAGAMENTO DSTIPOPAGAMENTOPOS 
            FROM 
                "${databaseSchema}".VENDAPAGAMENTO TVP 
            WHERE 
                1 = ?
                AND TVP.NOTEF = 'POS'
            GROUP BY 
                TVP.DSTIPOPAGAMENTO
        `;

        const params = [1];

        const statement = conn.prepare(query);
        const result = await statement.exec(params);

        return {
            rows: result.length,
            data: result,
        }
    } catch (error) {
        console.error('Erro ao executar consulta pagamento pos', error);
        throw error;
    }
};
