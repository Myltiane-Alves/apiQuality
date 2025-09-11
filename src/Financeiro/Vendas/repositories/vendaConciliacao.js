// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getVendaConciliacao = async (idGrupo, idLoja, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        
        let query = `
            SELECT 
                tbe.IDEMPRESA, 
                tbe.NOFANTASIA, 
                tbv.IDVENDA, 
                IFNULL(TO_VARCHAR(tbv.DTHORAFECHAMENTO, 'YYYY-MM-DD'), 'NÃO INFORMADO') AS Data, 
                CASE 
                WHEN tbvp.NOTEF = 'POS' THEN tbvp.NUAUTORIZACAO 
                ELSE REPLACE(tbvp.NSUAUTORIZADORA, ' VA', '') 
                END AS Nsu, 
                tbvp.NSUTEF AS Autorizacao, 
                IFNULL(SUM(tbv.VRTOTALPAGO), 0) AS VRTOTALPAGO, 
                IFNULL(SUM(tbv.VRTOTALDESCONTO), 0) AS VRTOTALDESCONTO, 
                IFNULL(SUM(tbvp.VALORRECEBIDO), 0) AS VRPAGO, 
                IFNULL(tbvp.DSTIPOPAGAMENTO, NULL) AS DSTIPOPAGAMENTO, 
                IFNULL(tbvp.NSUTEF, NULL) AS NSU, 
                IFNULL(tbvp.NUAUTORIZACAO, NULL) AS NUAUTORIZACAO, 
                CASE 
                WHEN tbvp.NPARCELAS IS NULL THEN 1 
                WHEN tbvp.NPARCELAS = 0 THEN 1 
                ELSE tbvp.NPARCELAS 
                END AS Plano, 
                CASE 
                WHEN DSTIPOPAGAMENTO = 'CREDSYSTEM' THEN 
                    (SELECT e.CODESTABELECIMENTO FROM ${databaseSchema}.ESTABELECIMENTO e WHERE e.IDEMPRESA = tbe.IDEMPRESA AND e.NUESTABELECIMENTO = 'CREDSYSTEM') 
                ELSE 
                    (SELECT e.CODESTABELECIMENTO FROM ${databaseSchema}.ESTABELECIMENTO e WHERE e.IDEMPRESA = tbe.IDEMPRESA AND e.NUESTABELECIMENTO = 'REDE') 
                END AS Estabelecimento 
            FROM 
                "${databaseSchema}".VENDAPAGAMENTO tbvp 
                INNER JOIN "${databaseSchema}".VENDA tbv ON tbvp.IDVENDA = tbv.IDVENDA 
                INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbv.IDEMPRESA = tbe.IDEMPRESA 
            WHERE 
                1 = ? 
                AND tbv.STCANCELADO = 'False' 
                AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) 
                AND (tbvp.NOTEF = 'POS' OR tbvp.NOTEF = 'TEF')
        `;

        const params = [1];

        if (idGrupo === '1') {
            query += ` AND tbe.IDEMPRESA IN (SELECT IDEMPRESA FROM "${databaseSchema}".EMPRESA WHERE IDGRUPOEMPRESARIAL = 1 AND STATIVO = \'True\') `;
        }
        if (idGrupo === '2') {
            query += ` AND tbe.IDEMPRESA IN (SELECT IDEMPRESA FROM "${databaseSchema}".EMPRESA WHERE IDGRUPOEMPRESARIAL = 2 AND STATIVO = \'True\') `;
        }
        if (idGrupo === '3') {
            query += ` AND tbe.IDEMPRESA IN (SELECT IDEMPRESA FROM "${databaseSchema}".EMPRESA WHERE IDGRUPOEMPRESARIAL = 3 AND STATIVO = \'True\') `;
        }
        if (idGrupo === '4') {
            query += ` AND tbe.IDEMPRESA IN (SELECT IDEMPRESA FROM "${databaseSchema}".EMPRESA WHERE IDGRUPOEMPRESARIAL = 4 AND STATIVO = \'True\') `;
        }

        if (idLoja) {
            query += ' AND tbe.IDEMPRESA = ? ';
            params.push(idLoja);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND tbv.DTHORAFECHAMENTO BETWEEN ? AND ? ';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        query += ` GROUP BY tbv.IDVENDA, tbvp.DSTIPOPAGAMENTO, tbvp.NSUAUTORIZADORA, tbvp.NSUTEF, tbvp.NPARCELAS, tbvp.NUAUTORIZACAO, tbvp.NOAUTORIZADOR, tbvp.NOTEF, tbv.DTHORAFECHAMENTO, TBVP.DSTIPOPAGAMENTO, tbe.IDEMPRESA, tbe.NOFANTASIA`;
        query += ` ORDER BY tbe.IDEMPRESA, tbv.DTHORAFECHAMENTO`;
        
     
        const statement = conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page,
            pageSize,
            rows: result.length,
            data: result
        };
    } catch (e) {
        throw new Error(e.message);
    }
};
