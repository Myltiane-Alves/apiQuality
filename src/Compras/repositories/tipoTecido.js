// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getTipoTecido = async (idTipoTecido, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT A."IDTPTECIDO", A."DSTIPOTECIDO", A."STATIVO" FROM "${databaseSchema}"."TIPOTECIDOS" A WHERE 1=?
        `;

        const params = [1];

        if (idTipoTecido) {
            query += ' And A."IDTPTECIDO" = ? ';
            params.push(idTipoTecido);
        }
    

        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);
        
        query += 'ORDER BY A."DSTIPOTECIDO"';

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