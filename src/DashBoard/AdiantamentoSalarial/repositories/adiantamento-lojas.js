// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getAdiantamentosLojas = async (idMarca, idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        
        var query = ` SELECT 
            tbas.IDEMPRESA,
            tbas.IDADIANTAMENTOSALARIO,
            tbas.IDFUNCIONARIO,
            TO_VARCHAR(tbas.DTLANCAMENTO,'DD-MM-YYYY') AS DTLANCAMENTO,
            tbas.TXTMOTIVO,
            tbas.VRVALORDESCONTO,
            tbas.STATIVO,
            tbf.NOFUNCIONARIO,
            tbf.NUCPF,
            tbe.NOFANTASIA
            FROM
            "${databaseSchema}".ADIANTAMENTOSALARIAL tbas
            INNER JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbas.IDFUNCIONARIO = tbf.IDFUNCIONARIO
            INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbas.IDEMPRESA = tbe.IDEMPRESA
            WHERE
            1 = 1
        `;


        const params = [];

        
        if (idMarca > 0) {
            query += ' AND tbe.IDGRUPOEMPRESARIAL IN (?)';
            params.push(idMarca);
        }

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

        const statement = conn.prepare(query);
        const result = statement.exec(params);

     
        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result,
        };
    } catch (error) {
        console.error('Error executing query', error);
        throw error;
    }
};


export const putAdiantamentosLojas = async (STATIVO, IDADIANTAMENTOSALARIO) => {
    try {
        const query = `
            UPDATE "${databaseSchema}"."ADIANTAMENTOSALARIAL" SET 
                "STATIVO" = ?
            WHERE "IDADIANTAMENTOSALARIO" = ?;
        `;

        const statement = await conn.prepare(query);
        
        const params = [STATIVO, IDADIANTAMENTOSALARIO];

        await statement.exec(params);
        console.log('params', params);
        await conn.commit();

        return {
            msg: "Atualização realizada com sucesso!",
            data: {
                STATIVO,
                IDADIANTAMENTOSALARIO
            },
        };

    } catch (e) {
        throw new Error(`Erro ao atualizar adiantamento salarial: ${e.message}`);
    }
};