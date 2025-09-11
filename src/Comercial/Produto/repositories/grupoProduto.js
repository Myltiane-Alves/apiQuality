// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getGrupoProduto = async (nome, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        var query = `
            SELECT 
                A."IDGRUPOESTRUTURA" AS ID_GRUPO, 
                A."DSGRUPOESTRUTURA" AS GRUPO 
            FROM 
                "${databaseSchema}"."GRUPOESTRUTURA" A 
                WHERE 1 = ? 
            AND A.STATIVO='True'
      `;

        const params = [1];

        if (nome) {
            query += ` AND A.DSGRUPOESTRUTURA LIKE ? `;
            params.push(nome);
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
        console.error('Erro ao executar a consulta de Grupo Estrutura:', error);
        throw error;
    }
};

