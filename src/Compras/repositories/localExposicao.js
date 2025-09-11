// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getLocalExposicao = async (idLocalExposicao, descricao, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                A.IDLOCALEXPOSICAO, 
                A.DSLOCALEXPOSICAO, 
                A.STATIVO 
            FROM "${databaseSchema}".LOCALEXPOSICAO A 
            WHERE 
                1 = ?
        `;

        const params = [1];

        if (idLocalExposicao) {
            query += ' And A.IDLOCALEXPOSICAO  = ? ';
            params.push(idLocalExposicao);
        }
    
        if(descricao) {
            query += ' And  A.DSLOCALEXPOSICAO LIKE ? OR A.DSLOCALEXPOSICAO LIKE ? ';
            params.push(`%${descricao}%`, `%${descricao}%`);
        }

        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);
        
        query += 'ORDER BY A."DSLOCALEXPOSICAO"';

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