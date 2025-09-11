// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getLojaSaldoPorGrupo = async (idGrupoEmpresarial, dataPesquisa, pageSize, page) => {
  try {

    page = page && !isNaN(page) ? parseInt(page) : 1;
    pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;


    let query = `
            SELECT
                tbe.IDEMPRESA,
                tbe.NUCNPJ,
                tbe.NOFANTASIA,
                (SELECT IFNULL(SUM(VRRECDINHEIRO - VRTROCO), 0) 
                 FROM ${databaseSchema}.VENDA 
                 WHERE STCANCELADO = 'False' 
                   AND DTHORAFECHAMENTO BETWEEN '2020-12-11 00:00:00' AND '${dataPesquisa} 23:59:59' 
                   AND IDEMPRESA = tbe.IDEMPRESA) AS VALORTOTALDINHEIRO,
                (SELECT IFNULL(SUM(VRRECEBIDO), 0) 
                 FROM ${databaseSchema}.DETALHEFATURA 
                 WHERE STCANCELADO = 'False' 
                   AND (STPIX = 'False' OR STPIX IS NULL) 
                   AND DTPROCESSAMENTO BETWEEN '2020-12-11 00:00:00' AND '${dataPesquisa} 23:59:59' 
                   AND IDEMPRESA = tbe.IDEMPRESA) AS VALORTOTALFATURA,
                (SELECT IFNULL(SUM(VRDEPOSITO), 0) 
                 FROM ${databaseSchema}.DEPOSITOLOJA 
                 WHERE STCANCELADO = 'False' 
                   AND DTDEPOSITO BETWEEN '2020-12-11 00:00:00' AND '${dataPesquisa} 23:59:59' 
                   AND IDEMPRESA = tbe.IDEMPRESA) AS VALORTOTALDEPOSITO,
                (SELECT IFNULL(SUM(VRDEBITO), 0) 
                 FROM ${databaseSchema}.AJUSTEEXTRATO 
                 WHERE STCANCELADO = 'False' 
                   AND DATACADASTRO BETWEEN '2020-12-11 00:00:00' AND '${dataPesquisa} 23:59:59' 
                   AND IDEMPRESA = tbe.IDEMPRESA) AS VALORTOTALDEBITO,
                (SELECT IFNULL(SUM(VRCREDITO), 0) 
                 FROM ${databaseSchema}.AJUSTEEXTRATO 
                 WHERE STCANCELADO = 'False' 
                   AND DATACADASTRO BETWEEN '2020-12-11 00:00:00' AND '${dataPesquisa} 23:59:59' 
                   AND IDEMPRESA = tbe.IDEMPRESA) AS VALORTOTALCREDITO,
                (SELECT IFNULL(SUM(VRVALORDESCONTO), 0) 
                 FROM ${databaseSchema}.ADIANTAMENTOSALARIAL 
                 WHERE STATIVO = 'True' 
                   AND DTLANCAMENTO BETWEEN '2020-12-11 00:00:00' AND '${dataPesquisa} 23:59:59' 
                   AND IDEMPRESA = tbe.IDEMPRESA) AS VALORTOTALADINAT,
                (SELECT IFNULL(SUM(VRDESPESA), 0) 
                 FROM ${databaseSchema}.DESPESALOJA 
                 WHERE STCANCELADO = 'False' 
                   AND DTDESPESA BETWEEN '2020-12-11 00:00:00' AND '${dataPesquisa} 23:59:59' 
                   AND IDEMPRESA = tbe.IDEMPRESA) AS VALORTOTALDESPESA
            FROM
                ${databaseSchema}.EMPRESA tbe
            WHERE 1 = 1 
              AND tbe.IDGRUPOEMPRESARIAL = ${idGrupoEmpresarial}
            ORDER BY tbe.IDEMPRESA ASC
        `;


    const offset = (page - 1) * pageSize;
    query += ' LIMIT ? OFFSET ?';


    const params = [pageSize, offset];
    const statement = await conn.prepare(query);
    const result = await statement.exec(params);

    return {
      page: page,
      pageSize: pageSize,
      rows: result.length,
      data: result,
    }
  } catch (error) {
    console.error('Error executing query', error);
    throw error;
  }
};
