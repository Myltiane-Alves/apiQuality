// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getDespesaLojaDashBoard = async (idDespesaLoja, idEmpresa, dataPesquisa, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        let query = `
            SELECT 
                SUM(dl.VRDESPESA) AS VRDESPESA
            FROM 
                "${databaseSchema}".DESPESALOJA dl
            WHERE 
            1 = ?
            AND dl.STCANCELADO = 'False'
        `;
    
        const params = [1];
     
        if (idDespesaLoja) {
            query += ' AND dl.IDDESPESASLOJA = ?';
            params.push(idDespesaLoja);
        }
    
        if (idEmpresa) {
            query += ' AND dl.IDEMPRESA = ?';
            params.push(idEmpresa);
        }
    
        if (dataPesquisa) {
            query += ' AND (dl.DTDESPESA BETWEEN ? AND ?)';
            params.push(`${dataPesquisa} 00:00:00`, `${dataPesquisa} 23:59:59`);
            
        }
    
        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize);
        params.push(offset);
        
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);
   
        return {
            page,
            pageSize,
            rows: result.length,
            data: result,
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

