// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getFornecedorProduto = async (idMarca, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        let query = `
            SELECT 
                A."ID_MARCA", 
                A."ID_FORNECEDOR", 
                A."FORNECEDOR", 
                A."CNPJ_CPF" 
            FROM 
                "${databaseSchema}"."VW_CLASSIFICACAO_DO_FORNECEDOR" A 
            WHERE 
                1=?
        `;

        const params = [1];

        if (idMarca) {
            query += ` AND A.ID_MARCA LIKE ? `;
            params.push(idMarca);
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
        console.error('Erro ao executar a consulta de Fornecedor Produto:', error);
        throw error;
    }
}