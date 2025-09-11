// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getVersaoPDV = async (idVersaoPDV,page, pageSize) => {
  try {
    page = page && !isNaN(page) ? parseInt(page) : 1;
    pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

    let query = `
        SELECT
            tbvp.IDVERSAOPDV,
            tbvp.NUVERSAOPDV,
            tbvp.DTVERSAO,
            tbvp.STATIVO
            FROM
            "${databaseSchema}".VERSAOPDV tbvp
            WHERE
        1 = ?
   `;
   
   const params = [];
    
    if(idVersaoPDV) {
        query += ` AND tbvp.IDVERSAOPDV = ?`;
        params.push(idVersaoPDV)
    }

    query += ' And tbvp.STATIVO = \'True\'';
    query += ' ORDER BY tbvp.IDVERSAOPDV DESC';

    const offset = (page - 1) * pageSize;
    query += ' LIMIT ? OFFSET ?';
    params.push(pageSize, offset);

    const statement = conn.prepare(query);
    const result = await statement.exec();


    return result;
  } catch (error) {
    console.error('Erro ao executar a consulta Funcionarios:', error);
    throw error;
  }
};