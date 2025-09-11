
// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getVendaMarcaPeriodo = async (idMarca, dataPesquisaInicio, dataPesquisaFim, idEmpresa, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = ` SELECT DISTINCT
            tbe.IDEMPRESA,
            tbe.NOFANTASIA,
            (SELECT IFNULL (SUM(tbf.VRRECEBIDO),0) FROM "${databaseSchema}".DETALHEFATURA tbf INNER JOIN "${databaseSchema}".MOVIMENTOCAIXA tbmcf on tbf.IDMOVIMENTOCAIXAWEB = tbmcf.ID WHERE tbf.IDEMPRESA = tbe.IDEMPRESA AND tbf.STCANCELADO='False' AND (tbf.STPIX = 'False' OR tbf.STPIX IS NULL) AND (tbf.DTPROCESSAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59')) AS VRFATURA,
            (SELECT IFNULL (SUM(tbf.VRRECEBIDO),0) FROM "${databaseSchema}".DETALHEFATURA tbf INNER JOIN "${databaseSchema}".MOVIMENTOCAIXA tbmcf on tbf.IDMOVIMENTOCAIXAWEB = tbmcf.ID WHERE tbf.IDEMPRESA = tbe.IDEMPRESA AND tbf.STCANCELADO='False' AND tbf.STPIX = 'True' AND (tbf.DTPROCESSAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59')) AS VRFATURAPIX,
            (SELECT IFNULL (SUM(VENDA.VRTOTALPAGO),0) FROM "${databaseSchema}".VENDA WHERE VENDA.IDEMPRESA = tbe.IDEMPRESA AND VENDA.STCANCELADO='False' AND (VENDA.DTHORAFECHAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59')) AS VRTOTALPAGO,
            (SELECT IFNULL (SUM(VENDA.VRRECDINHEIRO),0) FROM "${databaseSchema}".VENDA WHERE VENDA.IDEMPRESA = tbe.IDEMPRESA AND VENDA.STCANCELADO='False' AND (VENDA.DTHORAFECHAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59')) AS VRDINHEIRO,
            (SELECT IFNULL (COUNT(VENDA.IDVENDA),0) FROM "${databaseSchema}".VENDA WHERE VENDA.IDEMPRESA = tbe.IDEMPRESA AND VENDA.STCANCELADO='False' AND (VENDA.DTHORAFECHAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59')) AS QTDVENDA,
            (SELECT IFNULL (SUM(VENDA.VRRECCARTAO),0) FROM "${databaseSchema}".VENDA WHERE VENDA.IDEMPRESA = tbe.IDEMPRESA AND VENDA.STCANCELADO='False' AND (VENDA.DTHORAFECHAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59')) AS VRCARTAO,
            (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "${databaseSchema}".VENDAPAGAMENTO tbvp INNER JOIN "${databaseSchema}".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE (tbv1.DTHORAFECHAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59') AND tbv1.IDEMPRESA = tbe.IDEMPRESA AND tbv1.STCANCELADO = 'False' AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = 'POS' AND (tbvp.DSTIPOPAGAMENTO!='PIX') AND (tbvp.DSTIPOPAGAMENTO!='MoovPay')) AS VRPOS,
            (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "${databaseSchema}".VENDAPAGAMENTO tbvp INNER JOIN "${databaseSchema}".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE (tbv1.DTHORAFECHAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59') AND tbv1.IDEMPRESA = tbe.IDEMPRESA AND tbv1.STCANCELADO = 'False' AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = 'PIX' AND (tbvp.DSTIPOPAGAMENTO ='PIX')) AS VRPIX,
            (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "${databaseSchema}".VENDAPAGAMENTO tbvp INNER JOIN "${databaseSchema}".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE (tbv1.DTHORAFECHAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59') AND tbv1.IDEMPRESA = tbe.IDEMPRESA AND tbv1.STCANCELADO = 'False' AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = 'POS' AND (tbvp.DSTIPOPAGAMENTO ='MoovPay')) AS VRMOOVPAY,
            (SELECT IFNULL (SUM(VENDA.VRRECCONVENIO),0) FROM "${databaseSchema}".VENDA WHERE VENDA.IDEMPRESA = tbe.IDEMPRESA AND VENDA.STCANCELADO='False' AND (VENDA.DTHORAFECHAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59')) AS CONVENIO,
            (SELECT IFNULL (SUM(VENDA.VRRECVOUCHER),0) FROM "${databaseSchema}".VENDA WHERE VENDA.IDEMPRESA = tbe.IDEMPRESA AND VENDA.STCANCELADO='False' AND (VENDA.DTHORAFECHAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59')) AS VOUCHER,
            (SELECT IFNULL (SUM(DESPESALOJA.VRDESPESA),0) FROM "${databaseSchema}".DESPESALOJA WHERE DESPESALOJA.IDEMPRESA = tbe.IDEMPRESA AND DESPESALOJA.STCANCELADO='False' AND (DESPESALOJA.DTDESPESA BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59')) AS VRDESPESA,
            (SELECT IFNULL (SUM(a.VRVALORDESCONTO),0) FROM "${databaseSchema}".ADIANTAMENTOSALARIAL a WHERE a.IDEMPRESA = tbe.IDEMPRESA AND a.STATIVO='True' AND (a.DTLANCAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59')) AS VRADIANTAMENTOSALARIO,
            (SELECT IFNULL (SUM(dl.VRFISICODINHEIRO),0) FROM "${databaseSchema}".MOVIMENTOCAIXA dl WHERE (dl.DTABERTURA  BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59') AND dl.IDEMPRESA =tbe.IDEMPRESA  AND dl.STCANCELADO = 'False' AND dl.STFECHADO = 'True') AS VRFISICODINHEIRO,
            (SELECT IFNULL (SUM(dl.VRRECDINHEIRO),0) FROM "${databaseSchema}".MOVIMENTOCAIXA dl WHERE (dl.DTABERTURA  BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59') AND dl.IDEMPRESA =tbe.IDEMPRESA  AND dl.STCANCELADO = 'False' AND dl.STFECHADO = 'True') AS VRRECDINHEIRO
        FROM
            "${databaseSchema}".MOVIMENTOCAIXA tbmc
            INNER JOIN "${databaseSchema}".EMPRESA tbe on tbmc.IDEMPRESA = tbe.IDEMPRESA
        WHERE
            1 = ? `;

        const params = [1];


        if (idEmpresa) {
            query += ' AND tbe.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (idMarca) {
            query += ' AND tbe.IDGRUPOEMPRESARIAL = ?';
            params.push(idMarca);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND (tbmc.DTABERTURA BETWEEN ? AND ?)';
            params.push(dataPesquisaInicio + ' 00:00:00', dataPesquisaFim + ' 23:59:59');
        }

        query += ' ORDER BY tbe.IDEMPRESA';
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);


        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result,
        }
    } catch (error) {
        throw new Error(`Erro ao executar a consulta Vendas por Marca: `, error);
    }
};
