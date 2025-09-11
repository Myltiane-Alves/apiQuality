// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getProdutoQuality = async (idEmpresa, codBarrasOuNome, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        codBarrasOuNome = codBarrasOuNome.replace(' ', '%');

    
        let query = `
            SELECT 
                TO_VARCHAR(T1.DTULTALTERACAO, 'DD/MM/YYYY HH24:MI:SS') AS DTULTALTERACAO,
                T1.IDPRODUTO, 
                T1.DSNOME, 
                T1.NUCODBARRAS, 
                T2.PRECO_VENDA 
            FROM ${databaseSchema}.PRODUTO T1 
            INNER JOIN "${databaseSchema}"."PRODUTO_PRECO" T2 ON T2."IDPRODUTO" = T1.IDPRODUTO
            WHERE 1 = 1
            AND T2.IDEMPRESA = ?
            AND (T1.NUCODBARRAS = ? OR UPPER(T1.DSNOME) LIKE UPPER(?))
        `;

        const params = [idEmpresa, codBarrasOuNome, `%${codBarrasOuNome}%`];

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
        console.error('Error executing query', error);
        throw error;
    }
};
