// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getCategorias = async (idCategorias, descricao, tipoPedido, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT DISTINCT 
                n.IDCATEGORIAS,
                n.DSCATEGORIAS,
                n.TPCATEGORIAS,
                n.TPCATEGORIAPEDIDO,
                n.STATIVO
            FROM 
                "${databaseSchema}".CATEGORIAS n
            WHERE 
                1 = ?
        `;

        const params = [1];

        if (idCategorias) {
            query += ' And n.IDCATEGORIAS = ? ';
            params.push(idCategorias);
        }

        if (descricao) {
            query += ' And n.DSCATEGORIAS ? ';
            params.push(descricao);
        }

        if(tipoPedido) {
            query += ' And n.TPCATEGORIAPEDIDO = ? ';
            params.push(tipoPedido);
        }
    
        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);


        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result,
        }

    } catch (error) {
        console.error('Erro ao consultar Categorias :', error);
        throw error;
    }
}