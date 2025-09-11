
// import conn from '../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getCategoriaReceitaDespesa = async (idCategoria, tipoCategoria, pageSize, page) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                tbcrd.IDCATEGORIARECDESP,
                tbcrd.TPCATEGORIA,
                tbcrd.DSCATEGORIA,
                tbcrd.STDESPESALOJA,
                tbcrd.STMATRICULAFUNCIONARIO,
                TO_VARCHAR(tbcrd.DTULTALTERACAO, 'YYYY-MM-DD HH24:MI:SS') AS DTULTALTERACAO,
                tbcrd.STATIVO,
                tbcrd.NCONTA
            FROM 
                "${databaseSchema}".CATEGORIARECEITADESPESA tbcrd
            WHERE 
                1 = ?
                AND tbcrd.STATIVO = 'True'
        `;

        const params = [1];

        if (idCategoria) {
            query += 'AND tbcrd.IDCATEGORIARECDESP = ?';
            params.push(idCategoria);
        }
        
        if (tipoCategoria === 'D') {
            query += 'AND tbcrd.TPCATEGORIA = ?';
            params.push('DESPESA');
        }

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
        console.error('Erro ao executar consulta deposito loja empresa', error);
        throw error;
    }
};