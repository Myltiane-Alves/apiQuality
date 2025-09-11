// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getVendaTotalRecebidoPeriodo = async (idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page) => {
  try {
    page = page && !isNaN(page) ? parseInt(page) : 1;
    pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

    let query = `
      SELECT 
          tbe.IDEMPRESA,
          tbe.NOFANTASIA,
          IFNULL(SUM(tbv.VRRECDINHEIRO),0) AS VALORTOTALDINHEIRO,
          IFNULL(SUM(tbv.VRRECCARTAO),0) AS VALORTOTALCARTAO,
          IFNULL(SUM(tbv.VRRECCONVENIO),0) AS VALORTOTALCONVENIO,
          IFNULL(SUM(tbv.VRRECPOS),0) AS VALORTOTALPOS,
          IFNULL(SUM(tbv.VRRECVOUCHER),0) AS VALORTOTALVOUCHER,
          (SELECT IFNULL(SUM(tbvp.VALORRECEBIDO),0) FROM "${databaseSchema}".VENDAPAGAMENTO tbvp INNER JOIN "${databaseSchema}".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE (tbv1.DTHORAFECHAMENTO BETWEEN ? AND ?) AND tbv1.IDEMPRESA = tbe.IDEMPRESA AND tbv1.STCANCELADO = 'False' AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = 'POS' AND (tbvp.DSTIPOPAGAMENTO!='PIX')) AS VRPOS,
          (SELECT IFNULL(SUM(tbvp.VALORRECEBIDO),0) FROM "${databaseSchema}".VENDAPAGAMENTO tbvp INNER JOIN "${databaseSchema}".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE (tbv1.DTHORAFECHAMENTO BETWEEN ? AND ?) AND tbv1.IDEMPRESA = tbe.IDEMPRESA AND tbv1.STCANCELADO = 'False' AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = 'PIX' AND (tbvp.DSTIPOPAGAMENTO ='PIX')) AS VRPIX,
          (SELECT IFNULL(SUM(tbvp.VALORRECEBIDO),0) FROM "${databaseSchema}".VENDAPAGAMENTO tbvp INNER JOIN "${databaseSchema}".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE (tbv1.DTHORAFECHAMENTO BETWEEN ? AND ?) AND tbv1.IDEMPRESA = tbe.IDEMPRESA AND tbv1.STCANCELADO = 'False' AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = 'POS' AND (tbvp.DSTIPOPAGAMENTO ='MoovPay')) AS VRMOOVPAY,
          (SELECT IFNULL(SUM(tbdf.VRRECEBIDO),0) FROM "${databaseSchema}".DETALHEFATURA tbdf WHERE tbdf.IDEMPRESA = tbe.IDEMPRESA AND tbdf.DTPROCESSAMENTO BETWEEN ? AND ? AND tbdf.STCANCELADO = 'False') AS VALORTOTALFATURA,
          (SELECT IFNULL(SUM(tbd.VRDESPESA),0) FROM "${databaseSchema}".DESPESALOJA tbd WHERE tbd.IDEMPRESA = tbe.IDEMPRESA AND tbd.DTDESPESA BETWEEN ? AND ? AND tbd.STCANCELADO = 'False') AS VALORTOTALDESPESA,
          (SELECT IFNULL(SUM(tbas.VRVALORDESCONTO),0) FROM "${databaseSchema}".ADIANTAMENTOSALARIAL tbas WHERE tbas.IDEMPRESA = tbe.IDEMPRESA AND tbas.DTLANCAMENTO BETWEEN ? AND ? AND tbas.STATIVO = 'True') AS VALORTOTALADIANTAMENTOSALARIAL
      FROM 
          "${databaseSchema}".VENDA tbv
          INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbe.IDEMPRESA = tbv.IDEMPRESA
      WHERE 
          tbv.STCANCELADO = 'False'`;

    const params = [
      dataPesquisaInicio + ' 00:00:00', dataPesquisaFim + ' 23:59:59',
      dataPesquisaInicio + ' 00:00:00', dataPesquisaFim + ' 23:59:59',
      dataPesquisaInicio + ' 00:00:00', dataPesquisaFim + ' 23:59:59',
      dataPesquisaInicio + ' 00:00:00', dataPesquisaFim + ' 23:59:59',
      dataPesquisaInicio + ' 00:00:00', dataPesquisaFim + ' 23:59:59',
      dataPesquisaInicio + ' 00:00:00', dataPesquisaFim + ' 23:59:59'
    ];

    if (idEmpresa > 0) {
      query += ' AND tbv.IDEMPRESA = ? ';
      params.push(idEmpresa);
    }

    if (dataPesquisaInicio && dataPesquisaFim) {
      query += ' AND (tbv.DTHORAFECHAMENTO BETWEEN ? AND ?)';
      params.push(dataPesquisaInicio + ' 00:00:00', dataPesquisaFim + ' 23:59:59');
    }

    query += ' GROUP BY tbe.IDEMPRESA, tbe.NOFANTASIA';

    const offset = (page - 1) * pageSize;
    query += ` LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);

    const statement = conn.prepare(query);
    const result =  statement.exec(params);
    
    return {
      page,
      pageSize,
      rows: result.length,
      data: result,
    };
  } catch (error) {
    console.error('Error executing query', error);
    throw error;
  }
};
