// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getVendaTotalRecebidoEleteronico = async (idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page) => {
  try {
    page = page && !isNaN(page) ? parseInt(page) : 1;
    pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

    let query = `SELECT 
          tbe.IDEMPRESA,
          tbe.NOFANTASIA,
          tbvp.NOAUTORIZADOR,
          tbvp.NOTEF,
          IFNULL(tbvp.NPARCELAS, 0) AS NPARCELAS,
          UPPER(tbvp.DSTIPOPAGAMENTO) AS DSTIPOPAGAMENTO,
          COUNT(1) AS QTDE,
          IFNULL(SUM(tbvp.VALORRECEBIDO), 0) AS VALORRECEBIDO,
          COUNT(DISTINCT tbvp.NUAUTORIZACAO) AS QTDPGTOS
      FROM 
          "${databaseSchema}".VENDAPAGAMENTO tbvp
          INNER JOIN "${databaseSchema}".VENDA tbv ON tbvp.IDVENDA = tbv.IDVENDA
          INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbe.IDEMPRESA = tbv.IDEMPRESA
      WHERE 
          1 = 1
          AND tbv.STCANCELADO = 'False'
          AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL)
          AND (tbvp.NOTEF = 'POS' OR tbvp.NOTEF = 'TEF')`;

    const params = [];

    if (idEmpresa > 0) {
      query += ' AND tbv.IDEMPRESA = ?';
      params.push(idEmpresa);
    }

    if (dataPesquisaInicio && dataPesquisaFim) {
      query += ' AND (tbv.DTHORAFECHAMENTO BETWEEN ? AND ?)';
      params.push(dataPesquisaInicio + ' 00:00:00', dataPesquisaFim + ' 23:59:59');
    }

    query += ' GROUP BY tbe.IDEMPRESA, tbe.NOFANTASIA, tbvp.NOAUTORIZADOR, UPPER(tbvp.DSTIPOPAGAMENTO), IFNULL(tbvp.NPARCELAS, 0), tbvp.NOTEF';
    query += ' ORDER BY tbe.IDEMPRESA';

    const offset = (page - 1) * pageSize;
    query += ' LIMIT ? OFFSET ?';
    params.push(pageSize, offset);

    const statement = conn.prepare(query);
    const result = statement.exec(params);

    return {
      page,
      pageSize,
      rows: result.length,
      data: result,
    
    }
  } catch (error) {
    console.error('Error executing query', error);
    throw error;
  }
};
