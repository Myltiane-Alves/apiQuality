// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getTamanhos = async (idTamanho, descricao, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                A.IDTAMANHO, 
                A.DSABREVIACAO, 
                A.DSTAMANHO, 
                A.STVESTUARIO, 
                A.STCALCADO, 
                A.STDIVERSOS, 
                A.STATIVO 
            FROM "${databaseSchema}".TAMANHO A 
            WHERE 1 = ?
        `;

        const params = [1];

        if (idTamanho) {
            query += ' And  A.IDTAMANHO = ? ';
            params.push(idTamanho);
        }
    
        if(descricao) {
            query += ' And  A.DSTAMANHO LIKE ? OR A.DSABREVIACAO LIKE ? ';
            params.push(`%${descricao}%`, `%${descricao}%`);
        }

        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);
        
        query += 'ORDER BY A."DSTAMANHO" DESC';

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);


        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result,
        }

    } catch (error) {
        console.error('Erro ao consultar Tamanhos:', error);
        throw error;
    }
}