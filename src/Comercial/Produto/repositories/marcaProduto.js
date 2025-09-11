// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getMarcaProduto = async (idEstrutura, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        let query = `
            SELECT A.ID_ESTRUTURA, A.ID_MARCA, A.MARCA
             FROM "${databaseSchema}"."VW_CLASSIFICACAO_MARCA" A WHERE 1=?
        `;

        const params = [1];

        if (idEstrutura) {
            query += ` AND A.ID_ESTRUTURA LIKE ? `;
            params.push(idEstrutura);
        }

      
        
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);
       
        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result,
        };

    } catch (error) {
        console.error('Erro ao executar a consulta de Marca Produto:', error);
        throw error;
    }
};

