// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getQuebraCaixaLoja = async (idEmpresa, dataPesquisa, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        
        
        let query = `
            SELECT
                dl.ID AS IDMOVCAIXAOP,
                IFNULL((dl.VRFISICODINHEIRO), 0) AS VRFISICODINHEIRO,
                IFNULL((dl.VRRECDINHEIRO), 0) AS VRRECDINHEIRO,
                IFNULL((dl.VRAJUSTDINHEIRO), 0) AS VRRECDINHEIROAJUSTE
            FROM
                "${databaseSchema}".MOVIMENTOCAIXA dl
            WHERE
                1 = 1
                AND dl.STCANCELADO = 'False'
                AND dl.STFECHADO = 'True'
                AND dl.IDEMPRESA = ?
        `;
        
        const params = [];
        
        if (idEmpresa) {
            query = query + ' AND dl.IDEMPRESA = ? ';
            params.push(idEmpresa);
        }
     
        if (dataPesquisa) {
            query += ' AND (dl.DTABERTURA BETWEEN ? AND ?)';
            params.push(`${dataPesquisa} 00:00:00`, `${dataPesquisa} 23:59:59`);
        }


        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);


        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        return{
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result,
        }
    } catch (error) {
        console.error('Erro ao executar a consulta Quebra de Caixa:', error);
        throw error;
    }
};
