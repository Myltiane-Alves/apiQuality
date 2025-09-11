// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getQuebraCaixa = async (idMarca, idEmpresa, cpfOperadorQuebra, stQuebraPositivaNegativa, dataPesquisaInicio, dataPesquisaFim, pageSize, page) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 10;

        let query = `SELECT 
            tbqc.IDQUEBRACAIXA,
            tbemp.NOFANTASIA,
            tbqc.IDCAIXAWEB,
            tbqc.IDMOVIMENTOCAIXA,
            tbqc.IDGERENTE,
            tbqc.IDFUNCIONARIO,
            TO_VARCHAR(tbqc.DTLANCAMENTO, 'DD-MM-YYYY') AS DTLANCAMENTO,
            tbqc.VRQUEBRASISTEMA,
            tbqc.VRQUEBRAEFETIVADO,
            tbqc.TXTHISTORICO,
            tbqc.STATIVO,
            tbf.NOFUNCIONARIO AS NOMEOPERADOR,
            tbf.DSFUNCAO,
            tbf.NUCPF AS CPFOPERADOR,
            tbf1.NOFUNCIONARIO AS NOMEGERENTE
        FROM 
            "${databaseSchema}".QUEBRACAIXA tbqc
            LEFT JOIN "${databaseSchema}".MOVIMENTOCAIXA tbmc ON tbqc.IDMOVIMENTOCAIXA = tbmc.ID
            LEFT JOIN "${databaseSchema}".EMPRESA tbemp ON tbmc.IDEMPRESA = tbemp.IDEMPRESA
            LEFT JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbqc.IDFUNCIONARIO = tbf.IDFUNCIONARIO
            LEFT JOIN "${databaseSchema}".FUNCIONARIO tbf1 ON tbqc.IDGERENTE = tbf1.IDFUNCIONARIO
        WHERE 
            1 = 1`;

        const params = [];

        if (idMarca > 0) {
            query += ' AND tbemp.IDGRUPOEMPRESARIAL IN (?)';
            params.push(idMarca);
        }

        if (idEmpresa > 0) {
            query += ' AND tbmc.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (cpfOperadorQuebra > 0) {
            query += ' AND tbf.NUCPF = ?';
            params.push(cpfOperadorQuebra);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND tbqc.DTLANCAMENTO BETWEEN ? AND ?';
            params.push(dataPesquisaInicio + ' 00:00:00', dataPesquisaFim + ' 23:59:59');
        }

        if (stQuebraPositivaNegativa) {
            if (stQuebraPositivaNegativa === "Positiva") {
                query += ' AND tbqc.VRQUEBRASISTEMA >= 0.0';
            } else {
                query += ' AND tbqc.VRQUEBRASISTEMA < 0.0';
            }
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
            data: result
        };
    } catch (error) {
        console.error('Error executing query', error);
        throw error;
    }
};


export const updateStatusQuebraCaixa = async (quebras) => {
    try {
        let query = `
            UPDATE "${databaseSchema}"."QUEBRACAIXA" SET 
                "STATIVO" = ? 
            WHERE "IDQUEBRACAIXA" =  ? 
        `;
        const statement = await conn.prepare(query);

        for(const quebra of quebras) {
            const params = [
                quebra.STATIVO,
                quebra.IDQUEBRACAIXA
            ]
            await statement.exec(params);
        }
        
        conn.commit();
        return {
            status: 'success',
            message: 'Status quebra caixa alterado com sucesso'
        }
    } catch (error) {
        console.error('Erro ao executar a alteração do status quebra caixa:', error);
        throw error;
    }
}