// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getProdutos = async (idEmpresa, codBarras, dsProduto, page, pageSize) => {
    try {
       
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        
        var query = `
            SELECT 
                p.IDPRODUTO, 
                p.NUCODBARRAS, 
                p.DSNOME,
                IFNULL(pp.PRECO_VENDA, p.PRECOVENDA) AS PRECOVENDA,
                IFNULL(p.PRECOCUSTO, 0) AS PRECOCUSTO
            FROM "${databaseSchema}".PRODUTO p
                LEFT JOIN "${databaseSchema}".PRODUTO_PRECO pp  ON pp.IDPRODUTO = p.IDPRODUTO AND pp.IDEMPRESA = ?
            WHERE 1 = ?
        `;

        const params = [idEmpresa, 1];

        if(codBarras) {
            query += ' AND p.NUCODBARRAS = ?';
            params.push(codBarras);
        }

        if (dsProduto) {
            query += ' AND (p.NUCODBARRAS LIKE ? OR UPPER(p.DSNOME) LIKE UPPER(?))';
            params.push(`%${dsProduto}%`, `%${dsProduto}%`);
        }

        query += ` ORDER BY p.DSNOME`;
       
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
        console.error('Error executar a consulta produtos ', error);
        throw error;
    }
};
