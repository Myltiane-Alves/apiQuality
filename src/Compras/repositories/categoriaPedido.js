// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getCategoriaPedido = async (idTipoPedido, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT A."IDCATEGORIAPEDIDO", A."DSCATEGORIAPEDIDO", A."TIPOPEDIDO" FROM "${databaseSchema}"."CATEGORIAPEDIDO" A WHERE 1=?
        `;

        const params = [1];

        if (idTipoPedido) {
            query += ' And And  A."TIPOPEDIDO" = ? ';
            params.push(idTipoPedido);
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
        console.error('Erro ao consultar Categoria Pedido:', error);
        throw error;
    }
}

export const getCategoriasPedidos = async (idCategoriaPedido, idTipoPedido, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT A."IDCATEGORIAPEDIDO", A."DSCATEGORIAPEDIDO", A."TIPOPEDIDO" FROM "${databaseSchema}"."CATEGORIAPEDIDO" A WHERE 1=?
        `;

        const params = [1];

        if (idCategoriaPedido) {
            query += ' And And  A."IDCATEGORIAPEDIDO" = ? ';
            params.push(idCategoriaPedido);
        }

        if (idTipoPedido) {
            query += ' And And  A."TIPOPEDIDO" = ? ';
            params.push(idTipoPedido);
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
        console.error('Erro ao consultar Categorias Pedidos:', error);
        throw error;
    }
}