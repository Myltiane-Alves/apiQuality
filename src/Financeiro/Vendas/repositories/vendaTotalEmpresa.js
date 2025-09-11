// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;


export const getVendasTotalEmpresa = async (idEmpresa, dataPesquisa, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                tbe.IDEMPRESA,
                tbe.NOFANTASIA,
                tbe.IDGRUPOEMPRESARIAL,
                tbe.CONTACREDITOSAP,
                tbf.STCONFERIDO,
                tbf.IDDETALHEFATURA,
                tbf.DATA_COMPENSACAO,
                IFNULL(SUM(tbv.VRRECDINHEIRO), 0) AS VALORTOTALDINHEIRO,
                IFNULL(SUM(tbv.VRRECCARTAO), 0) AS VALORTOTALCARTAO,
                IFNULL(SUM(tbv.VRRECCONVENIO), 0) AS VALORTOTALCONVENIO,
                (SELECT IFNULL(SUM(tbvp.VALORRECEBIDO), 0) 
                 FROM "${databaseSchema}".VENDAPAGAMENTO tbvp 
                 INNER JOIN "${databaseSchema}".VENDA tbv1 ON tbvp.IDVENDA = tbv1.IDVENDA 
                 WHERE (tbv1.DTHORAFECHAMENTO BETWEEN '${dataPesquisa} 00:00:00' AND '${dataPesquisa} 23:59:59') 
                 AND tbv1.IDEMPRESA = tbe.IDEMPRESA AND tbv1.STCANCELADO = 'False' 
                 AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) 
                 AND tbvp.NOTEF = 'POS' AND (tbvp.DSTIPOPAGAMENTO != 'PIX')) AS VALORTOTALPOS,
                (SELECT IFNULL(SUM(tbvp.VALORRECEBIDO), 0) 
                 FROM "${databaseSchema}".VENDAPAGAMENTO tbvp 
                 INNER JOIN "${databaseSchema}".VENDA tbv1 ON tbvp.IDVENDA = tbv1.IDVENDA 
                 WHERE (tbv1.DTHORAFECHAMENTO BETWEEN '${dataPesquisa} 00:00:00' AND '${dataPesquisa} 23:59:59') 
                 AND tbv1.IDEMPRESA = tbe.IDEMPRESA AND tbv1.STCANCELADO = 'False' 
                 AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) 
                 AND tbvp.NOTEF = 'PIX' AND (tbvp.DSTIPOPAGAMENTO = 'PIX')) AS VALORTOTALPIX,
                (SELECT IFNULL(SUM(tbvp.VALORRECEBIDO), 0) 
                 FROM "${databaseSchema}".VENDAPAGAMENTO tbvp 
                 INNER JOIN "${databaseSchema}".VENDA tbv1 ON tbvp.IDVENDA = tbv1.IDVENDA 
                 WHERE (tbv1.DTHORAFECHAMENTO BETWEEN '${dataPesquisa} 00:00:00' AND '${dataPesquisa} 23:59:59') 
                 AND tbv1.IDEMPRESA = tbe.IDEMPRESA AND tbv1.STCANCELADO = 'False' 
                 AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) 
                 AND tbvp.NOTEF = 'POS' AND (tbvp.DSTIPOPAGAMENTO = 'MoovPay')) AS TOTALVENDIDOMOOVPAY,
                IFNULL(SUM(tbv.VRRECPOS), 0) AS VALORTOTALPOS2,
                IFNULL(SUM(tbv.VRRECVOUCHER), 0) AS VALORTOTALVOUCHER,
                (SELECT IFNULL(SUM(tbf.VRRECEBIDO), 0) 
                 FROM "${databaseSchema}".DETALHEFATURA tbf 
                 INNER JOIN "${databaseSchema}".MOVIMENTOCAIXA tbmcf ON tbf.IDMOVIMENTOCAIXAWEB = tbmcf.ID 
                 WHERE tbf.IDEMPRESA = tbe.IDEMPRESA AND tbf.STCANCELADO = 'False' 
                 AND (tbf.STPIX = 'False' OR tbf.STPIX IS NULL) 
                 AND (tbf.DTPROCESSAMENTO BETWEEN '${dataPesquisa} 00:00:00' AND '${dataPesquisa} 23:59:59')) AS VALORTOTALFATURA,
                (SELECT IFNULL(SUM(tbf.VRRECEBIDO), 0) 
                 FROM "${databaseSchema}".DETALHEFATURA tbf 
                 INNER JOIN "${databaseSchema}".MOVIMENTOCAIXA tbmcf ON tbf.IDMOVIMENTOCAIXAWEB = tbmcf.ID 
                 WHERE tbf.IDEMPRESA = tbe.IDEMPRESA AND tbf.STCANCELADO = 'False' 
                 AND tbf.STPIX = 'True' 
                 AND (tbf.DTPROCESSAMENTO BETWEEN '${dataPesquisa} 00:00:00' AND '${dataPesquisa} 23:59:59')) AS VALORTOTALFATURAPIX,
                (SELECT IFNULL(SUM(tbd.VRDESPESA), 0) 
                 FROM "${databaseSchema}".DESPESALOJA tbd 
                 WHERE tbd.IDEMPRESA = tbe.IDEMPRESA AND tbd.STCANCELADO = 'False' 
                 AND tbd.DTDESPESA = '${dataPesquisa}') AS VALORTOTALDESPESA,
                (SELECT IFNULL(SUM(tbas.VRVALORDESCONTO), 0) 
                 FROM "${databaseSchema}".ADIANTAMENTOSALARIAL tbas 
                 WHERE tbas.IDEMPRESA = tbe.IDEMPRESA AND tbas.STATIVO = 'True' 
                 AND tbas.DTLANCAMENTO = '${dataPesquisa}') AS VALORTOTALADIANTAMENTOSALARIAL
            FROM
                "${databaseSchema}".VENDA tbv
            INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbe.IDEMPRESA = tbv.IDEMPRESA
            LEFT JOIN "${databaseSchema}".DETALHEFATURA tbf ON tbf.IDEMPRESA = tbe.IDEMPRESA
            WHERE 1 = ? AND tbv.STCANCELADO = 'False'`;

        const params = [1];

        if (idEmpresa) {
            query += ' AND tbv.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (dataPesquisa) {
            query += ' AND tbv.DTHORAFECHAMENTO BETWEEN ? AND ?';
            params.push(`${dataPesquisa} 00:00:00`, `${dataPesquisa} 23:59:59`);
        }

        query += ' GROUP BY tbe.IDEMPRESA, tbe.NOFANTASIA, tbe.IDGRUPOEMPRESARIAL, tbe.CONTACREDITOSAP, tbf.STCONFERIDO, tbf.IDDETALHEFATURA, tbf.DATA_COMPENSACAO';
        query += ' ORDER BY tbe.IDEMPRESA';

        query += ` LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;
        const statement = conn.prepare(query);
        const result = await statement.execute(params);

        return {
            page,
            pageSize,
            rows: result.length,
            data: result
        };
    } catch (e) {
        console.error('Erro ao executar a consulta de vendas total empresa:', e);
        throw new Error(`Erro ao executar a consulta de vendas total empresa: ${e.message}`);
    }
};
