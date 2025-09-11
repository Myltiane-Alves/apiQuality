
// import conn from '../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getRotinaMovimentacao = async (idRotina,  pageSize, page) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

     
        let query = `SELECT IDROTINA, DESCROTINA FROM "${databaseSchema}".ROTINASORDEMTRANSFERENCIA WHERE 1 = 1 `;

        const params = [];

        if (idRotina) {
            query += 'AND IDROTINA = ? ';
            params.push(idRotina);
        }

        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);


        return {
            page,
            pageSize,
            rows: result.length,
            data: result
        };
    } catch (error) {
        console.error('Erro ao executar consulta Rotina de Movimentação', error);
        throw error;
    }
};