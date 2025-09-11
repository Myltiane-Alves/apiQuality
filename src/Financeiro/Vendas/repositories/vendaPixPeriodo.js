// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema =  process.env.HANA_DATABASE;

export const getVendaPixPeriodo = async (byId, idMarca, dataPesquisaInicio, dataPesquisaFim, dataCompInicio, dataCompFim, idLoja, empresaLista, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                tbe.IDEMPRESA,
                tbe.NOFANTASIA,
                tbv.IDVENDA,
                tbvp.DSTIPOPAGAMENTO,
                IFNULL(tbvp.VALORRECEBIDO, 0) AS PIX,
                IFNULL (TO_VARCHAR(tbv.DATA_COMPENSACAO, 'DD/mm/YYYY'),'NÃO INFORMADO') AS DATA_COMPENSACAO,
                IFNULL(TO_VARCHAR(tbv.DTHORAFECHAMENTO, 'DD/MM/YYYY'), 'NÃO INFORMADO') AS DATAVENDA,
                tbvp.NUAUTORIZACAO
            FROM 
                "${databaseSchema}".VENDA tbv
                INNER JOIN "${databaseSchema}".VENDAPAGAMENTO tbvp on tbv.IDVENDA = tbvp.IDVENDA
                INNER JOIN "${databaseSchema}".EMPRESA tbe on tbv.IDEMPRESA = tbe.IDEMPRESA
            WHERE 
                1 = 1
                AND tbv.STCANCELADO = 'False'
                AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL)
                AND tbvp.NOTEF = 'PIX' AND tbvp.DSTIPOPAGAMENTO = 'PIX'
        `;

        const params = [];

        if (byId) {
            query += ` AND tbe.IDEMPRESA = ?`;
            params.push(byId);
        }

        if (empresaLista) {
            query += ` AND tbe.IDEMPRESA IN (${empresaLista})`;
        } else {
            if (idMarca == 0) {
                query += ` AND tbe.IDGRUPOEMPRESARIAL IN (1, 2, 3, 4)`;
            } else {
                query += ` AND tbe.IDGRUPOEMPRESARIAL = ?`;
                params.push(idMarca);
            }

            if (idLoja > 0) {
                query += ` AND tbe.IDEMPRESA IN (${idLoja})`;
            }
        }

        
        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ` AND (tbv.DTHORAFECHAMENTO BETWEEN ? AND ?)`;
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        query += ` ORDER BY tbe.NOFANTASIA, tbv.DTHORAFECHAMENTO`;

        query += ` LIMIT ? OFFSET ?`;
        params.push(pageSize, (page - 1) * pageSize);


        const statement = conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page,
            pageSize,
            rows: result.length,
            data: result,
        };
    } catch (e) {
        throw new Error(e.message);
    }
};

export const putVendaPixStatusConferido = async (vendas) => {
    try {
        const query = `
            UPDATE "${databaseSchema}"."VENDA" SET 
                STCONFERIDO = ?,
                DATA_COMPENSACAO = ?
            WHERE "IDVENDA" = ?;
        `;

        const statement = await conn.prepare(query);

        for (const venda of vendas) {
            const params = [
                venda.STCONFERIDO,
                venda.DATA_COMPENSACAO,
                venda.IDVENDA
            ];
            
            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Data Compensação Vendas atualizadas com sucesso!',
        };
    } catch (e) {
        throw new Error(`Erro ao atualizar vendas: ${e.message}`);
    }
};

