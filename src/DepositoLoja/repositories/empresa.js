
// import conn from '../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getDepositosEmpresa = async (idEmpresa, dataPesquisaInicio, dataPesquisaFim,  pageSize, page) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                tbdl.IDDEPOSITOLOJA, 
                TO_VARCHAR(tbdl.DTMOVIMENTOCAIXA,'DD-MM-YYYY') AS DTMOVIMENTOCAIXA, 
                TO_VARCHAR(tbdl.DTDEPOSITO,'DD-MM-YYYY') AS DTDEPOSITO, 
                tbdl.DSHISTORIO, 
                tbdl.NUDOCDEPOSITO, 
                tbdl.VRDEPOSITO, 
                tbdl.STATIVO, 
                tbdl.STCANCELADO, 
                tbdl.STCONFERIDO, 
                tbcb.DSCONTABANCO, 
                tbf.NOFUNCIONARIO  
            FROM 
                "${databaseSchema}".DEPOSITOLOJA tbdl 
                INNER JOIN "${databaseSchema}".CONTABANCO tbcb ON tbdl.IDCONTABANCO = tbcb.IDCONTABANCO 
                LEFT JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbdl.IDUSR = tbf.IDFUNCIONARIO  
            WHERE 
            1 = ?
          `;

        const params = [1];

        if (idEmpresa) {
            query += 'AND tbdl.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if(dataPesquisaInicio && dataPesquisaFim){
            query += ' AND tbdl.DTDEPOSITO BETWEEN ? AND ?';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
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