// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getAdiantamentoSalarial = async (idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 10;

        let query = `
            SELECT 
                tbas.IDADIANTAMENTOSALARIO,
                tbas.VRVALORDESCONTO,
                tbas.TXTMOTIVO,
                tbf.IDFUNCIONARIO,
                tbf.NOFUNCIONARIO,
                tbf.NOLOGIN
            FROM 
                "${databaseSchema}".ADIANTAMENTOSALARIAL tbas
                LEFT JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbf.IDFUNCIONARIO = tbas.IDFUNCIONARIO
            WHERE 
                1 = 1
            AND tbas.STATIVO = 'True'
        `;

        const params = [];

        if (idEmpresa > 0) {
            query += ' AND tbas.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND (tbas.DTLANCAMENTO BETWEEN ? AND ?)';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        // Obtenha o número total de registros para paginação
        let countQuery = `
            SELECT COUNT(*) AS total
            FROM "${databaseSchema}".ADIANTAMENTOSALARIAL tbas
            LEFT JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbf.IDFUNCIONARIO = tbas.IDFUNCIONARIO
            WHERE 1 = 1
            AND tbas.STATIVO = 'True'
        `;

        const countParams = [];

        if (idEmpresa > 0) {
            countQuery += ' AND tbas.IDEMPRESA = ?';
            countParams.push(idEmpresa);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            countQuery += ' AND (tbas.DTLANCAMENTO BETWEEN ? AND ?)';
            countParams.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        const countStatement = await conn.prepare(countQuery);
        const countResult = await countStatement.exec(countParams);

        const rows = countResult[0].TOTAL;

        return {
            page,
            pageSize,
            rows,
            data: result
        };
    } catch (error) {
        console.error('Error executing query', error);
        throw error;
    }
};
