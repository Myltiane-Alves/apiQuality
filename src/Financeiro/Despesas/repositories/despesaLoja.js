// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getDespesaLoja = async (idDespesaLoja, idEmpresa, dataPesquisaInicio, dataPesquisaFim, idCategoria, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        
        let query = `
            SELECT 
                tbdl.IDEMPRESA,
                tbdl.IDDESPESASLOJA,
                TO_VARCHAR(tbdl.DTDESPESA, 'DD/mm/YYYY') AS DTDESPESA,
                TO_VARCHAR(tbdl.DTDESPESA, 'DD/mm/YYYY HH:MM') AS DTHORADESPESA,
                tbdl.IDCATEGORIARECEITADESPESA,
                tbcrd.DSCATEGORIA AS DSCATEGORIA,
                tbdl.VRDESPESA,
                tbdl.DSHISTORIO,
                tbdl.DSPAGOA,
                tbdl.NUNOTAFISCAL,
                tbdl.STATIVO,
                tbdl.STCANCELADO,
                tbf.IDFUNCIONARIO,
                tbf.NOFUNCIONARIO,
                tbfv.NOFUNCIONARIO AS NOFUNCVALE,
                tbf.NOLOGIN,
                tbe.NUCNPJ,
                tbe.NOFANTASIA
            FROM 
            "${databaseSchema}".DESPESALOJA tbdl
                INNER JOIN "${databaseSchema}".CATEGORIARECEITADESPESA tbcrd ON tbdl.IDCATEGORIARECEITADESPESA = tbcrd.IDCATEGORIARECDESP
                INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbdl.IDEMPRESA = tbe.IDEMPRESA
                LEFT JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbf.IDFUNCIONARIO = tbdl.IDUSR
                LEFT JOIN "${databaseSchema}".FUNCIONARIO tbfv ON tbdl.IDFUNCIONARIO = tbfv.IDFUNCIONARIO
            WHERE 1 = ?
        `;
    
        const params = [1];
     
        if (idDespesaLoja) {
            query += ' AND tbdl.IDDESPESASLOJA = ?';
            params.push(idDespesaLoja);
        }
    
        if (idEmpresa) {
            query += ' AND tbdl.IDEMPRESA = ?';
            params.push(idEmpresa);
        }
    
        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND (tbdl.DTDESPESA BETWEEN ? AND ?)';
            params.push(`${dataPesquisaInicio} 00:00:00`);
            params.push(`${dataPesquisaFim} 23:59:59`);
        }
    
        if (idCategoria) {
            query += ' AND tbdl.IDCATEGORIARECEITADESPESA = ?';
            params.push(idCategoria);
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


export const updateDespesasLoja = async (dados) => {
    try {
        var query = `
            UPDATE "${databaseSchema}"."DESPESALOJA" SET 
                "IDCATEGORIARECEITADESPESA" = ?, 
                "VRDESPESA" = ?, 
                "DSPAGOA" = ?, 
                "DSHISTORIO" = ?, 
                "TPNOTA" = ?, 
                "NUNOTAFISCAL" = ?, 
                "IDUSRCACELAMENTO" = ?, 
                "DSMOTIVOCANCELAMENTO" = ? 
            WHERE "IDDESPESASLOJA" = ? 
      `;

        const statement = await conn.prepare(query);

        for (const despesa of dados) {
            const params = [
                despesa.IDCATEGORIARECEITADESPESA,
                despesa.VRDESPESA,
                despesa.DSPAGOA,
                despesa.DSHISTORIO,
                despesa.TPNOTA,
                despesa.NUNOTAFISCAL,
                despesa.IDUSRCACELAMENTO,
                despesa.DSMOTIVOCANCELAMENTO,
                despesa.IDDESPESASLOJA
            ];
            console.log(params);
            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Despesa atualizadas com sucesso!',
        };
    } catch (e) {
        throw new Error(`Erro ao atualizar despesa: ${e.message}`);
    }
};
export const updateStatusDespesasLoja = async (dados) => {
    try {
        var query = `
            UPDATE "${databaseSchema}"."DESPESALOJA" SET 
                "STCANCELADO" = ?, 
                "IDUSRCACELAMENTO" = ?, 
                "DSMOTIVOCANCELAMENTO" = ? 
            WHERE "IDDESPESASLOJA" = ? 
      `;

        const statement = await conn.prepare(query);

        for (const despesa of dados) {
            const params = [
                despesa.STCANCELADO,
                despesa.IDUSRCACELAMENTO,
                despesa.DSMOTIVOCANCELAMENTO,
                despesa.IDDESPESASLOJA
            ];
            console.log(params);
            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Despesa atualizadas com sucesso!',
        };
    } catch (e) {
        throw new Error(`Erro ao atualizar despesa: ${e.message}`);
    }
};

