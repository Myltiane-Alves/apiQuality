// // import conn from "../../../config/dbConnection.js";
// import 'dotenv/config';
// const databaseSchema = process.env.HANA_DATABASE;

// export const getListaPCJ = async (idMovimento) => {
//     try {
//         const sql = `
//             SELECT 
//                 SUM(tbv.VRRECCARTAO) AS TOTALVENDIDOCARTAO, 
//                 (SELECT IFNULL(SUM(tbvp.VALORRECEBIDO), 0) 
//                  FROM "${databaseSchema}".VENDAPAGAMENTO tbvp 
//                  INNER JOIN "${databaseSchema}".VENDA tbv1 
//                  ON tbvp.IDVENDA = tbv1.IDVENDA 
//                  WHERE tbv1.IDMOVIMENTOCAIXAWEB = ? 
//                  AND tbv1.STCANCELADO = 'False' 
//                  AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) 
//                  AND (tbvp.NOAUTORIZADOR = 'CREDSYSTEM' OR tbvp.NOAUTORIZADOR = 'PL') 
//                  AND (tbvp.DSTIPOPAGAMENTO != 'GIRO PREMIADO') 
//                  AND (tbvp.NPARCELAS = 7 OR tbvp.NPARCELAS = 8)) AS TOTALPCJ78, 
//                 (SELECT IFNULL(SUM(tbvp.VALORRECEBIDO), 0) 
//                  FROM "${databaseSchema}".VENDAPAGAMENTO tbvp 
//                  INNER JOIN "${databaseSchema}".VENDA tbv1 
//                  ON tbvp.IDVENDA = tbv1.IDVENDA 
//                  WHERE tbv1.IDMOVIMENTOCAIXAWEB = ? 
//                  AND tbv1.STCANCELADO = 'False' 
//                  AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) 
//                  AND (tbvp.NOAUTORIZADOR = 'CREDSYSTEM' OR tbvp.NOAUTORIZADOR = 'PL') 
//                  AND (tbvp.DSTIPOPAGAMENTO != 'GIRO PREMIADO')) AS TOTALPCJ18 
//             FROM 
//                 "${databaseSchema}".VENDA tbv 
//             WHERE 
//                 tbv.IDMOVIMENTOCAIXAWEB = ? 
//                 AND tbv.STCANCELADO = 'False'`;

//         const [rows] = await // conn.execute(sql, [idMovimento, idMovimento, idMovimento]);

//         const lines = rows.map((row, index) => ({
//             "@nItem": index + 1,
//             "venda-pcj": {
//                 "TOTALVENDIDOCARTAO": row.TOTALVENDIDOCARTAO,
//                 "TOTALPCJ78": row.TOTALPCJ78,
//                 "TOTALPCJ18": row.TOTALPCJ18
//             }
//         }));

//         return lines;

//     } catch (e) {
//         throw new Error(e.message);
//     }
// };

// export const getListaPCJById = async (idMarca, dataPesquisaInicio, dataPesquisaFim, idLoja) => {
//     let query = `
//     SELECT 
//     tbmc.ID,
//     tbmc.IDOPERADOR,
//     tbmc.VRRECDINHEIRO,
//             tbc.IDCAIXAWEB,
//             tbc.DSCAIXA,
//             tbc.IDEMPRESA,
//             tbe.NOFANTASIA,
//             tbf.NOFUNCIONARIO,
//             tbf.NUCPF,
//             tbmc.STFECHADO,
//             TO_VARCHAR(tbmc.DTABERTURA,'DD-MM-YYYY HH24:MI:SS') AS DTABERTURA
//         FROM ${databaseSchema}.MOVIMENTOCAIXA tbmc
//         INNER JOIN ${databaseSchema}.CAIXA tbc ON tbmc.IDCAIXA = tbc.IDCAIXAWEB
//         LEFT JOIN ${databaseSchema}.FUNCIONARIO tbf ON tbmc.IDOPERADOR = tbf.IDFUNCIONARIO
//         INNER JOIN ${databaseSchema}.EMPRESA tbe ON tbmc.IDEMPRESA = tbe.IDEMPRESA
//         WHERE 1 = 1
//         `;
        
//     const params = [];
//     if (idMarca) {
//         query += ` AND tbe.IDSUBGRUPOEMPRESARIAL IN (${Array.isArray(idMarca) ? idMarca.map(() => '?').join(',') : '?'}) `;
//         params.push(...[].concat(idMarca)); 
//     }

//     if (idLoja) {
//         query += ` AND tbmc.IDEMPRESA IN (${Array.isArray(idLoja) ? idLoja.map(() => '?').join(',') : '?'}) `;
//         params.push(...[].concat(idLoja));
//     }

//     if (dataPesquisaInicio && dataPesquisaFim) {
//         query += ' AND (tbmc.DTABERTURA BETWEEN ? AND ?)';
//         params.push(dataPesquisaInicio + ' 00:00:00', dataPesquisaFim + ' 23:59:59');
//     }

//     query += `
//         GROUP BY tbmc.ID, tbc.IDCAIXAWEB, tbmc.IDOPERADOR,tbf.NUCPF,tbc.DSCAIXA, tbf.NOFUNCIONARIO, tbc.IDEMPRESA, tbmc.STFECHADO, tbmc.DTABERTURA, tbmc.VRRECDINHEIRO,tbe.NOFANTASIA
//     `;

//     try {
//         const result = await conn.exec(query, params); 
//         const rows = Array.isArray(result) ? result : [result];
       
//         const data = rows.map((registro) => ({
//             caixa: {
//                 ID: registro.ID,
//                 NOFANTASIA: registro.NOFANTASIA,
//                 IDOPERADOR: registro.IDOPERADOR,
//                 VRRECDINHEIRO: registro.VRRECDINHEIRO,
//                 IDCAIXAWEB: registro.IDCAIXAWEB,
//                 DSCAIXA: registro.DSCAIXA,
//                 NOFUNCIONARIO: registro.NOFUNCIONARIO,
//                 NUCPF: registro.NUCPF,
//                 DTABERTURA: registro.DTABERTURA,
//                 STFECHADO: registro.STFECHADO
//             },
//             vendapcj: getListaPCJ(registro)
//         }));
        
//         return {
//             page: 1,  
//             pageSize: 100, 
//             rows: data.length,
//             data: data
//         };
//     } catch (error) {
//         throw new Error(`Error executing query: ${error.message}`);
//     }
// };

