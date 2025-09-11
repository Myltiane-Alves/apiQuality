// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getTotaisVenda = async (idEmpresa, dataPesquisa, page, pageSize) => {
  try {
    page = page && !isNaN(page) ? parseInt(page) : 1;
    pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;


    const query = `
      SELECT 
      IFNULL(SUM(tbv.VRRECDINHEIRO), 0) AS VALORTOTALDINHEIRO,
      IFNULL(SUM(tbv.VRRECCARTAO), 0) AS VALORTOTALCARTAO,
      IFNULL(SUM(tbv.VRRECCONVENIO), 0) AS VALORTOTALCONVENIO,
      (SELECT IFNULL(SUM(tbvp.VALORRECEBIDO), 0) 
       FROM "${databaseSchema}".VENDAPAGAMENTO tbvp 
       INNER JOIN "${databaseSchema}".VENDA tbv1 ON tbvp.IDVENDA = tbv1.IDVENDA 
       WHERE (tbv1.DTHORAFECHAMENTO BETWEEN '${dataPesquisa} 00:00:00' AND '${dataPesquisa} 23:59:59') 
         AND tbv1.IDEMPRESA = '${idEmpresa}' 
         AND tbv1.STCANCELADO = 'False' 
         AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) 
         AND tbvp.NOTEF = 'POS' 
         AND (tbvp.DSTIPOPAGAMENTO != 'PIX')) AS VALORTOTALPOS,
      (SELECT IFNULL(SUM(tbvp.VALORRECEBIDO), 0) 
       FROM "${databaseSchema}".VENDAPAGAMENTO tbvp 
       INNER JOIN "${databaseSchema}".VENDA tbv1 ON tbvp.IDVENDA = tbv1.IDVENDA 
       WHERE (tbv1.DTHORAFECHAMENTO BETWEEN '${dataPesquisa} 00:00:00' AND '${dataPesquisa} 23:59:59') 
         AND tbv1.IDEMPRESA = '${idEmpresa}' 
         AND tbv1.STCANCELADO = 'False' 
         AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) 
         AND tbvp.NOTEF = 'PIX' 
         AND (tbvp.DSTIPOPAGAMENTO = 'PIX')) AS VALORTOTALPIX,
      (SELECT IFNULL(SUM(tbvp.VALORRECEBIDO), 0) 
       FROM "${databaseSchema}".VENDAPAGAMENTO tbvp 
       INNER JOIN "${databaseSchema}".VENDA tbv1 ON tbvp.IDVENDA = tbv1.IDVENDA 
       WHERE (tbv1.DTHORAFECHAMENTO BETWEEN '${dataPesquisa} 00:00:00' AND '${dataPesquisa} 23:59:59') 
         AND tbv1.IDEMPRESA = '${idEmpresa}' 
         AND tbv1.STCANCELADO = 'False' 
         AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) 
         AND tbvp.NOTEF = 'POS' 
         AND (tbvp.DSTIPOPAGAMENTO = 'MoovPay')) AS VALORTOTALMOOVPAY,
      IFNULL(SUM(tbv.VRRECVOUCHER), 0) AS VALORTOTALVOUCHER,
      (SELECT IFNULL(SUM(tbdf.VRRECEBIDO), 0) 
       FROM "${databaseSchema}".DETALHEFATURA tbdf 
       WHERE tbdf.DTPROCESSAMENTO = '${dataPesquisa}' 
         AND tbdf.IDEMPRESA = '${idEmpresa}' 
         AND tbdf.STCANCELADO = 'False' 
         AND (tbdf.STPIX = 'False' OR tbdf.STPIX IS NULL)) AS VALORTOTALFATURA,
      (SELECT IFNULL(SUM(tbdf.VRRECEBIDO), 0) 
       FROM "${databaseSchema}".DETALHEFATURA tbdf 
       WHERE tbdf.DTPROCESSAMENTO = '${dataPesquisa}' 
         AND tbdf.IDEMPRESA = '${idEmpresa}' 
         AND tbdf.STCANCELADO = 'False' 
         AND tbdf.STPIX = 'True') AS VALORTOTALFATURAPIX,
      (SELECT IFNULL(SUM(tbd.VRDESPESA), 0) 
       FROM "${databaseSchema}".DESPESALOJA tbd 
       WHERE tbd.DTDESPESA = '${dataPesquisa}' 
         AND tbd.IDEMPRESA = '${idEmpresa}' 
         AND tbd.STCANCELADO = 'False') AS VALORTOTALDESPESA,
      (SELECT IFNULL(SUM(tbas.VRVALORDESCONTO), 0) 
       FROM "${databaseSchema}".ADIANTAMENTOSALARIAL tbas 
       WHERE tbas.DTLANCAMENTO = '${dataPesquisa}' 
         AND tbas.IDEMPRESA = '${idEmpresa}' 
         AND tbas.STATIVO = 'True') AS VALORTOTALADIANTAMENTOSALARIAL,
      (SELECT IFNULL(SUM(dl.VRFISICODINHEIRO), 0) 
       FROM "${databaseSchema}".MOVIMENTOCAIXA dl 
       WHERE (dl.DTABERTURA BETWEEN '${dataPesquisa} 00:00:00' AND '${dataPesquisa} 23:59:59') 
         AND dl.IDEMPRESA = '${idEmpresa}' 
         AND dl.STCANCELADO = 'False' 
         AND dl.STFECHADO = 'True') AS VRFISICODINHEIRO,
      (SELECT IFNULL(SUM(dl.VRAJUSTDINHEIRO), 0) 
       FROM "${databaseSchema}".MOVIMENTOCAIXA dl 
       WHERE (dl.DTABERTURA BETWEEN '${dataPesquisa} 00:00:00' AND '${dataPesquisa} 23:59:59') 
         AND dl.IDEMPRESA = '${idEmpresa}' 
         AND dl.STCANCELADO = 'False' 
         AND dl.STFECHADO = 'True') AS VRAJUSTEDINHEIRO,
      (SELECT IFNULL(SUM(dl.VRRECDINHEIRO), 0) 
       FROM "${databaseSchema}".MOVIMENTOCAIXA dl 
       WHERE (dl.DTABERTURA BETWEEN '${dataPesquisa} 00:00:00' AND '${dataPesquisa} 23:59:59') 
         AND dl.IDEMPRESA = '${idEmpresa}' 
         AND dl.STCANCELADO = 'False' 
         AND dl.STFECHADO = 'True') AS VRRECDINHEIRO
      FROM 
      "${databaseSchema}".VENDA tbv 
      WHERE 
      tbv.IDEMPRESA = ?
      AND tbv.STCANCELADO = 'False'
    `;

    const params = [idEmpresa];


    const statement = conn.prepare(query);
    const result = await statement.exec(params);

    if (!Array.isArray(result) || result.length === 0) return null;
    const det = result[0];
    const docLine = {
      "VALORTOTALDINHEIRO": det.VALORTOTALDINHEIRO,
      "VALORTOTALCARTAO": det.VALORTOTALCARTAO,
      "VALORTOTALCONVENIO": det.VALORTOTALCONVENIO,
      "VALORTOTALPOS": det.VALORTOTALPOS,
      "VALORTOTALPIX": det.VALORTOTALPIX,
      "VALORTOTALMOOVPAY": det.VALORTOTALMOOVPAY,
      "VALORTOTALVOUCHER": det.VALORTOTALVOUCHER,
      "VALORTOTALFATURA": det.VALORTOTALFATURA,
      "VALORTOTALFATURAPIX": det.VALORTOTALFATURAPIX,
      "VALORTOTALDESPESA": det.VALORTOTALDESPESA,
      "VALORTOTALADIANTAMENTOSALARIAL": det.VALORTOTALADIANTAMENTOSALARIAL,
      "VRFISICODINHEIRO": det.VRFISICODINHEIRO,
      "VRAJUSTEDINHEIRO": det.VRAJUSTEDINHEIRO,
      "VRRECDINHEIRO": det.VRRECDINHEIRO
    }

    return docLine;
  } catch (error) {
    console.error("Erro ao consulta vendas totais:", error);
    throw error;
  }
};

export const getVendasTotaisById = async (idEmpresa, dataPesquisaInicio, dataPesquisaFim, byId, page, pageSize) => {
  try {
    page = page && !isNaN(page) ? parseInt(page) : 1;
    pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

    let query = `
      SELECT DISTINCT 
        tbe.IDEMPRESA,
        tbe.NOFANTASIA,
        TO_VARCHAR(tbv.DTHORAFECHAMENTO, 'YYYY-MM-DD') AS DTHORAFECHAMENTO, 
        TO_VARCHAR(tbv.DTHORAFECHAMENTO, 'DD/MM/YYYY') AS DTHORAFECHAMENTOFORMATADA 
      FROM 
        "${databaseSchema}".VENDA tbv
      INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbe.IDEMPRESA = tbv.IDEMPRESA
      WHERE 
        tbv.STCANCELADO = 'False'
    `;

    const params = [];

    if (byId) {
      query += ` AND tbv.IDVENDA = ? `;
      params.push(byId);
    }

    if (idEmpresa) {
      query += ` AND tbv.IDEMPRESA = ? `;
      params.push(idEmpresa);
    }

    if (dataPesquisaInicio && dataPesquisaFim) {
      query += ` AND (tbv.DTHORAFECHAMENTO BETWEEN ? AND ?) `;
      params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
    }
    const statement = conn.prepare(query);
    const result = await statement.exec(params);

    const data = await Promise.all(result.map(async (registro) => {
      const totais = await getTotaisVenda(registro.IDEMPRESA, registro.DTHORAFECHAMENTO);
      return {
        IDVENDA: registro.IDVENDA,
        NOFANTASIA: registro.NOFANTASIA,
        DTHORAFECHAMENTO: registro.DTHORAFECHAMENTOFORMATADA,
        totais
      };
    }));

    return {
      data,
      rows: data.length,
      page,
      pageSize
    };
  } catch (error) {
    console.error("Error in getVendasTotaisById:", error);
    throw error;
  }
};
