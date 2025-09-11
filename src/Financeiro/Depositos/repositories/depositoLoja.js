// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

function setIntOrNull(params, value) {
    if (value == null) {
        params.push(null);
    } else {
        params.push(parseInt(value, 10));
    }
}

function setDateOrNull(params, value) {
    if (value == null) {
        params.push(null);
    } else {
        
        params.push(value);
    }
}

export const getDepositoLoja = async (idDeposito, idConta, idEmpresa, dataCompInicio, dataCompFim, dataMovInicio, dataMovFim, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        let query = `
            SELECT 
                tbdl.IDDEPOSITOLOJA,
                TO_VARCHAR(tbdl.DTMOVIMENTOCAIXA, 'DD/MM/YYYY HH24:MI:SS') AS DTMOVIMENTOCAIXA,
                TO_VARCHAR(tbdl.DTDEPOSITO, 'DD/MM/YYYY HH24:MI:SS') AS DTDEPOSITO,
                tbdl.DTDEPOSITO AS DTDEPCOMPLETA,
                TO_VARCHAR(tbdl.DTDEPOSITO, 'YYYY-MM-DD') AS DTDEP,
                tbdl.DTMOVIMENTOCAIXA AS DTMOVDEPCOMPLETA,
                TO_VARCHAR(tbdl.DTMOVIMENTOCAIXA, 'YYYY-MM-DD') AS DTMOVDEP,
                TO_VARCHAR(tbdl.DTCOMPENSACAO, 'DD/MM/YYYY HH24:MI:SS') AS DTCOMPENSACAO,
                tbdl.DSHISTORIO,
                tbdl.NUDOCDEPOSITO,
                tbdl.VRDEPOSITO,
                tbdl.STATIVO,
                tbdl.STCANCELADO,
                tbdl.STCONFERIDO,
                TO_VARCHAR(tbdl.DTCOMPENSACAO, 'DD/MM/YYYY HH24:MI:SS') AS DTCOMPENSACAODEP,
                tbcb.IDCONTABANCO,
                tbcb.DSCONTABANCO,
                tbcb.NUCONTASAP,
                tbb.DSBANCO,
                tbf.NOFUNCIONARIO,
                tbe.NOFANTASIA,
                tbe.CONTACREDITOSAP
            FROM 
                "${databaseSchema}".DEPOSITOLOJA tbdl
                INNER JOIN "${databaseSchema}".CONTABANCO tbcb ON tbdl.IDCONTABANCO = tbcb.IDCONTABANCO
                INNER JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbdl.IDUSR = tbf.IDFUNCIONARIO
                INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbdl.IDEMPRESA = tbe.IDEMPRESA
                INNER JOIN "${databaseSchema}".BANCO tbb ON tbcb.IDBANCO = tbb.IDBANCO
            WHERE 
                1 = 1
        `;

        const params = [];

        if (idDeposito) {
            query += ' AND tbdl.IDDEPOSITOLOJA = ?';
            setIntOrNull(params, idDeposito);
        }
        
        if (idConta) {
            query += ' AND tbdl.IDCONTABANCO = ?';
            setIntOrNull(params, idConta);
        }
        
        if (idEmpresa > 0) {
            query += ' AND tbdl.IDEMPRESA = ?';
            setIntOrNull(params, idEmpresa);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND tbdl.DTDEPOSITO BETWEEN ? AND ?';
            setDateOrNull(params, `${dataPesquisaInicio} 00:00:00`);
            setDateOrNull(params, `${dataPesquisaFim} 23:59:59`);
        }

        if (dataCompInicio && dataCompFim) {
            query += ' AND tbdl.DTCOMPENSACAO BETWEEN ? AND ?';
            setDateOrNull(params, `${dataCompInicio} 00:00:00`);
            setDateOrNull(params, `${dataCompFim} 23:59:59`);
        }

        if (dataMovInicio && dataMovFim) {
            query += ' AND tbdl.DTMOVIMENTOCAIXA BETWEEN ? AND ?';
            setDateOrNull(params, `${dataMovInicio} 00:00:00`);
            setDateOrNull(params, `${dataMovFim} 23:59:59`);
        }


        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        setIntOrNull(params, pageSize);
        setIntOrNull(params, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

       

        return {
            page,
            pageSize,
            rows: result.length,
            data: result
        };
        
    } catch (error) {
        throw new Error(error.message);
    }
};

export const putDepositoLoja = async (idDepositoLoja) => {
    try {
        let query = `
            UPDATE "${databaseSchema}"."DEPOSITOLOJA" SET 
                "STCONFERIDO" = 'False', 
                "DTCOMPENSACAO" = null 
            WHERE "IDDEPOSITOLOJA" = ?
        `;

        const params = [idDepositoLoja];
       
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);


        return result;
    } catch (error) {
        throw new Error(error.message);
    }
};

