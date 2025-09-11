// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;


export const getRemessaVendas = async (idGrupo, idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                IFNULL(TO_VARCHAR(tbv.DTHORAFECHAMENTO,'YYYYmmDD'),'NÃO INFORMADO') AS Data, 
                CASE WHEN tbvp.NOTEF = 'POS' THEN tbvp.NUAUTORIZACAO 
                ELSE (replace(tbvp.NSUAUTORIZADORA,' VA','')) 
                END AS Nsu, 
                tbvp.NSUTEF AS Autorizacao, 
                IFNULL(SUM(tbvp.VALORRECEBIDO),0) AS Valor,  
                CASE WHEN tbvp.NPARCELAS IS NULL THEN 1 
                WHEN tbvp.NPARCELAS = 0 THEN 1 
                ELSE tbvp.NPARCELAS 
                END AS Plano, 
                CASE WHEN DSTIPOPAGAMENTO = 'CREDSYSTEM' THEN (SELECT e.CODESTABELECIMENTO FROM ${databaseSchema}.ESTABELECIMENTO e WHERE e.IDEMPRESA = tbe.IDEMPRESA AND e.NUESTABELECIMENTO='CREDSYSTEM') 
                ELSE (SELECT e.CODESTABELECIMENTO FROM ${databaseSchema}.ESTABELECIMENTO e WHERE e.IDEMPRESA = tbe.IDEMPRESA AND e.NUESTABELECIMENTO='REDE') 
                END AS Estabelecimento 
            FROM 
                ${databaseSchema}.VENDAPAGAMENTO tbvp 
                INNER JOIN ${databaseSchema}.VENDA tbv ON tbvp.IDVENDA = tbv.IDVENDA 
                INNER JOIN ${databaseSchema}.EMPRESA tbe on tbv.IDEMPRESA = tbe.IDEMPRESA 
            WHERE 
                1 = 1
                AND tbv.STCANCELADO = 'False' 
                AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) 
                AND (tbvp.NOTEF = 'POS' OR tbvp.NOTEF = 'TEF')
        `;

        if (idGrupo === '1' && idEmpresa === 0) {
            query += ` AND tbe.IDEMPRESA IN (SELECT IDEMPRESA FROM "${databaseSchema}".EMPRESA WHERE IDGRUPOEMPRESARIAL = 1 AND STATIVO = 'True') `;
        }
        if (idGrupo === '2' && idEmpresa === 0) {
            query += ` AND tbe.IDEMPRESA IN (SELECT IDEMPRESA FROM "${databaseSchema}".EMPRESA WHERE IDGRUPOEMPRESARIAL = 2 AND STATIVO = 'True') `;
        }
        if (idGrupo === '3' && idEmpresa === 0) {
            query += ` AND tbe.IDEMPRESA IN (SELECT IDEMPRESA FROM "${databaseSchema}".EMPRESA WHERE IDGRUPOEMPRESARIAL = 3 AND STATIVO = 'True') `;
        }
        if (idGrupo === '4' && idEmpresa === 0) {
            query += ` AND tbe.IDEMPRESA IN (SELECT IDEMPRESA FROM "${databaseSchema}".EMPRESA WHERE IDGRUPOEMPRESARIAL = 4 AND STATIVO = 'True') `;
        }

        if (idEmpresa > 0) {
            query += ` AND tbe.IDEMPRESA = '${idEmpresa}' `;
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ` AND (tbv.DTHORAFECHAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59') `;
        }

        query += `
            GROUP BY tbv.IDVENDA, tbvp.DSTIPOPAGAMENTO, tbvp.NSUAUTORIZADORA, tbvp.NSUTEF, tbvp.NPARCELAS, tbvp.NUAUTORIZACAO, tbvp.NOAUTORIZADOR, tbvp.NOTEF, tbv.DTHORAFECHAMENTO, TBVP.DSTIPOPAGAMENTO, tbe.IDEMPRESA
            ORDER BY tbe.IDEMPRESA, tbv.DTHORAFECHAMENTO
            LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
        `;

        const statement = conn.prepare(query);
        const result = await statement.exec([]);

        return result;
    } catch (error) {
        console.error('Error executing query', error);
        throw error;
    }
}
