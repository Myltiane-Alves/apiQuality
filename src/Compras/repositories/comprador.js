// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getCompradores = async (idComprador, descComprador, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
            A.IDFUNCIONARIO, 
            A.NOFUNCIONARIO,  
            A.NUCPF, 
            A.DSFUNCAO, 
            A.STATIVO 
            FROM "${databaseSchema}".FUNCIONARIO A 
            WHERE 
            1 = ?
            AND A.STATIVO = 'True'
            AND (A.DSFUNCAO LIKE '%Compras%' OR A.IDPERFIL = 2)
        `;

        const params = [1];

        if (idComprador) {
            query += ' And A.IDFUNCIONARIO IN = ? ';
            params.push(idComprador);
        }
    
        if(descComprador) {
            query += ' And A.NOFUNCIONARIO LIKE ? OR A.NOFUNCIONARIO  LIKE ? ';
            params.push(`%${descComprador}%`, `%${descComprador}%`);
        }

        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);
        
        query += 'ORDER BY A."NOFUNCIONARIO"';

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);


        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result,
        }

    } catch (error) {
        console.error('Erro ao consultar de Compradores:', error);
        throw error;
    }
}