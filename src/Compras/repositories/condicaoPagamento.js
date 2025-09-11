// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getCondicaoPagamento = async (idCondPagamento, dsCondPagamanto, idGrupoEmpresarial, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
            tbcp.IDCONDICAOPAGAMENTO,
            tbcp.IDGRUPOEMPRESARIAL,
            tbcp.IDEMPRESA,
            tbcp.DSCONDICAOPAG,
            tbcp.STPARCELADO,
            tbcp.NUPARCELAS,
            tbcp.NUNDIA1PAG,
            tbcp.NUNDIA2PAG,
            tbcp.NUNDIA3PAG,
            tbcp.NUNDIA4PAG,
            tbcp.NUNDIA5PAG,
            tbcp.NUNDIA6PAG,
            tbcp.NUNDIA7PAG,
            tbcp.NUNDIA8PAG,
            tbcp.NUNDIA9PAG,
            tbcp.NUNDIA10PAG,
            tbcp.NUNDIA11PAG,
            tbcp.NUNDIA12PAG,
            tbcp.TPDOCUMENTO,
            tbcp.DTULTALTERACAO,
            tbcp.STATIVO,
            tbcp.QTDDIAS,
            tbcp.IDTPDOCUMENTO,
            t2.DSTPDOCUMENTO
            FROM 
            "${databaseSchema}".CONDICAOPAGAMENTO tbcp
            LEFT JOIN "${databaseSchema}"."TIPODOCUMENTO" t2 on tbcp.IDTPDOCUMENTO = t2.IDTPDOCUMENTO 
            WHERE 
            1 = ?
            AND tbcp.STATIVO='True'
        `;

        const params = [1];

        if (idGrupoEmpresarial) {
            query += ' And tbcp.IDGRUPOEMPRESARIAL = ? ';
            params.push(idGrupoEmpresarial);
        }
    
        if (idCondPagamento) {
            query += ' And tbcp.IDCONDICAOPAGAMENTO = ? ';
            params.push(idCondPagamento);
        }

        if (dsCondPagamanto) {
            query += ' And tbcp.DSCONDICAOPAG LIKE ? OR tbcp.DSCONDICAOPAG LIKE ? ';
            params.push(`%${dsCondPagamanto}% `, `%${dsCondPagamanto}%`);
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
            data: result,
        }

    } catch (error) {
        console.error('Erro ao consultar Condição Pagamento:', error);
        throw error;
    }
}

export const updateCondicaoPagamento = async (dados) => {
    try {
        const queryUpdate = `
            UPDATE "${databaseSchema}"."CONDICAOPAGAMENTO" SET 
                "IDGRUPOEMPRESARIAL" = ?, 
                "DSCONDICAOPAG" = ?, 
                "STPARCELADO" = ?, 
                "NUPARCELAS" = ?, 
                "NUNDIA1PAG" = ?, 
                "NUNDIA2PAG" = ?, 
                "NUNDIA3PAG" = ?, 
                "NUNDIA4PAG" = ?, 
                "NUNDIA5PAG" = ?, 
                "NUNDIA6PAG" = ?, 
                "NUNDIA7PAG" = ?, 
                "NUNDIA8PAG" = ?, 
                "NUNDIA9PAG" = ?, 
                "NUNDIA10PAG" = ?, 
                "NUNDIA11PAG" = ?, 
                "NUNDIA12PAG" = ?, 
                "DTULTALTERACAO" = ?, 
                "STATIVO" = ?, 
                "QTDDIAS" = ?, 
                "IDTPDOCUMENTO" = ? 
            WHERE "IDCONDICAOPAGAMENTO" = ? 
        `;
        const statement = await conn.prepare(queryUpdate);

        for (const dado of dados) {
            const params = [
                dado.IDGRUPOEMPRESARIAL,
                dado.DSCONDICAOPAG,
                dado.STPARCELADO,
                dado.NUPARCELAS,
                dado.NUNDIA1PAG,
                dado.NUNDIA2PAG,
                dado.NUNDIA3PAG,
                dado.NUNDIA4PAG,
                dado.NUNDIA5PAG,
                dado.NUNDIA6PAG,
                dado.NUNDIA7PAG,
                dado.NUNDIA8PAG,
                dado.NUNDIA9PAG,
                dado.NUNDIA10PAG,
                dado.NUNDIA11PAG,
                dado.NUNDIA12PAG,
                dado.DTULTALTERACAO,
                dado.STATIVO,
                dado.QTDDIAS,
                dado.IDTPDOCUMENTO,
                dado.IDCONDICAOPAGAMENTO
            ];

            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Atualização Realizada com sucesso da Condição de Pagamento',
        };
    } catch (e) {
        throw new Error(`Erro ao atualizar Condição de Pagamento: ${e.message}`);
    }
}

export const createCondicaoPagamento = async (dados) => {
    try {
        const queryId = `
            SELECT IFNULL(MAX(TO_INT("IDCONDICAOPAGAMENTO")), 0) + 1 AS NEXT_ID
            FROM "${databaseSchema}"."CONDICAOPAGAMENTO"
        `;

        const queryInsert = `
            INSERT INTO "${databaseSchema}"."CONDICAOPAGAMENTO" (
                "IDCONDICAOPAGAMENTO",
                "IDGRUPOEMPRESARIAL",
                "DSCONDICAOPAG",
                "STPARCELADO",
                "NUPARCELAS",
                "NUNDIA1PAG",
                "NUNDIA2PAG",
                "NUNDIA3PAG",
                "NUNDIA4PAG",
                "NUNDIA5PAG",
                "NUNDIA6PAG",
                "NUNDIA7PAG",
                "NUNDIA8PAG",
                "NUNDIA9PAG",
                "NUNDIA10PAG",
                "NUNDIA11PAG",
                "NUNDIA12PAG",
                "DTULTALTERACAO",
                "STATIVO",
                "QTDDIAS",
                "IDTPDOCUMENTO"
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const statement = await conn.prepare(queryInsert);

        for (const dado of dados) {
            const [result] = await conn.exec(queryId); // Obtem o próximo ID
            const nextId = result.NEXT_ID;

            const params = [
                nextId,
                dado.IDGRUPOEMPRESARIAL,
                dado.DSCONDICAOPAG,
                dado.STPARCELADO,
                dado.NUPARCELAS,
                dado.NUNDIA1PAG,
                dado.NUNDIA2PAG,
                dado.NUNDIA3PAG,
                dado.NUNDIA4PAG,
                dado.NUNDIA5PAG,
                dado.NUNDIA6PAG,
                dado.NUNDIA7PAG,
                dado.NUNDIA8PAG,
                dado.NUNDIA9PAG,
                dado.NUNDIA10PAG,
                dado.NUNDIA11PAG,
                dado.NUNDIA12PAG,
                dado.DTULTALTERACAO,
                dado.STATIVO,
                dado.QTDDIAS,
                dado.IDTPDOCUMENTO
            ];

            await statement.exec(params);
        }

        await conn.commit();
        return {
            status: 'success',
            message: 'Inclusão realizada com sucesso da Condição de Pagamento!',
        };
    } catch (e) {
        await conn.rollback(); // Reverte transações em caso de erro
        throw new Error(`Erro ao criar Condição de Pagamento: ${e.message}`);
    }
};
