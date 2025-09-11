// import conn from "../../config/dbConnection.js";
// import 'dotenv/config';
// const databaseSchema = process.env.HANA_DATABASE;

// export const getEmpresasLista = async (idEmpresa, idSubGrupoEmpresa, page, pageSize) => {
//     try {
//         page = page && !isNaN(page) ? parseInt(page) : 1;
//         pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

//         let query = `
//             SELECT
//                 tbe.IDEMPRESA,
//                 tbe.STGRUPOEMPRESARIAL,
//                 tbe.IDGRUPOEMPRESARIAL,
//                 tbe.IDSUBGRUPOEMPRESARIAL,
//                 tbe.NORAZAOSOCIAL,
//                 tbe.NOFANTASIA,
//                 tbe.NUCNPJ,
//                 tbe.NUINSCESTADUAL,
//                 tbe.NUINSCMUNICIPAL,
//                 tbe.CNAE,
//                 tbe.EENDERECO,
//                 tbe.ECOMPLEMENTO,
//                 tbe.EBAIRRO,
//                 tbe.ECIDADE,
//                 tbe.SGUF,
//                 tbe.NUUF,
//                 tbe.NUCEP,
//                 tbe.NUIBGE,
//                 tbe.EEMAILPRINCIPAL,
//                 tbe.EEMAILCOMERCIAL,
//                 tbe.EEMAILFINANCEIRO,
//                 tbe.EEMAILCONTABILIDADE,
//                 tbe.NUTELPUBLICO,
//                 tbe.NUTELCOMERCIAL,
//                 tbe.NUTELFINANCEIRO,
//                 tbe.NUTELGERENCIA,
//                 tbe.EURL,
//                 tbe.PATHIMG,
//                 tbe.NUCNAE,
//                 tbe.STECOMMERCE,
//                 TO_VARCHAR(tbe.DTULTATUALIZACAO, 'YYYY-MM-DD HH24:MI:SS') AS DTULTATUALIZACAO,
//                 tbe.STATIVO,
//                 tbe.ALIQPIS,
//                 tbe.ALIQCOFINS
//             FROM
//                 "${databaseSchema}".EMPRESA tbe
//             WHERE
//                 1 = 1
//         `;

//         const params = [];

//         if (idEmpresa) {
//             query += ' AND tbe.IDEMPRESA = ?';
//             params.push(idEmpresa);
//         }

//         if (idSubGrupoEmpresa) {
//             query += ' AND tbe.IDSUBGRUPOEMPRESARIAL = ?';
//             params.push(idSubGrupoEmpresa);
//         }

//         query += ' ORDER BY tbe.IDEMPRESA';

//         const offset = (page - 1) * pageSize;
//         query += ' LIMIT ? OFFSET ?';
//         params.push(pageSize, offset);

//         const statement = await conn.prepare(query);
//         const result = await statement.exec(params);
  
//         return {
//             page,
//             pageSize,
//             rows: result.length,
//             data: result
//         };
//     } catch (error) {
//         console.error('Error executing query', error);
//         throw error;
//     }
// };

// export const updateEmpresa = async (empresas) => {
//     try {
        
        
//         var query = `
//             UPDATE "${databaseSchema}"."EMPRESA" SET 
//                 "STGRUPOEMPRESARIAL" = ?, 
//                 "IDGRUPOEMPRESARIAL" = ?, 
//                 "IDSUBGRUPOEMPRESARIAL" = ?, 
//                 "NORAZAOSOCIAL" = ?, 
//                 "NOFANTASIA" = ?, 
//                 "NUCNPJ" = ?, 
//                 "NUINSCESTADUAL" = ?, 
//                 "NUINSCMUNICIPAL" = ?, 
//                 "CNAE" = ?, 
//                 "EENDERECO" = ?, 
//                 "ECOMPLEMENTO" = ?, 
//                 "EBAIRRO" = ?, 
//                 "ECIDADE" = ?, 
//                 "SGUF" = ?, 
//                 "NUUF" = ?, 
//                 "NUCEP" = ?, 
//                 "NUIBGE" = ?, 
//                 "EEMAILPRINCIPAL" = ?, 
//                 "EEMAILCOMERCIAL" = ?, 
//                 "EEMAILFINANCEIRO" = ?, 
//                 "EEMAILCONTABILIDADE" = ?, 
//                 "NUTELPUBLICO" = ?, 
//                 "NUTELCOMERCIAL" = ?, 
//                 "NUTELFINANCEIRO" = ?, 
//                 "NUTELGERENCIA" = ?, 
//                 "EURL" = ?, 
//                 "PATHIMG" = ?, 
//                 "NUCNAE" = ?, 
//                 "STECOMMERCE" = ?, 
//                 "DTULTATUALIZACAO" = ?, 
//                 "STATIVO" = ?, 
//                 "ALIQPIS" = ?, 
//                 "ALIQCOFINS" = ? 
//             WHERE "IDEMPRESA" = ? 
//         `;

//         const statement = await conn.prepare(query);

//         for(const empresa of empresas) {
//             const params = [
//                 empresa.STGRUPOEMPRESARIAL,
//                 empresa.IDGRUPOEMPRESARIAL,
//                 empresa.IDSUBGRUPOEMPRESARIAL,
//                 empresa.NORAZAOSOCIAL,
//                 empresa.NOFANTASIA,
//                 empresa.NUCNPJ,
//                 empresa.NUINSCESTADUAL,
//                 empresa.NUINSCMUNICIPAL,
//                 empresa.CNAE,
//                 empresa.EENDERECO,
//                 empresa.ECOMPLEMENTO,
//                 empresa.EBAIRRO,
//                 empresa.ECIDADE,
//                 empresa.SGUF,
//                 empresa.NUUF,
//                 empresa.NUCEP,
//                 empresa.NUIBGE,
//                 empresa.EEMAILPRINCIPAL,
//                 empresa.EEMAILCOMERCIAL,
//                 empresa.EEMAILFINANCEIRO,
//                 empresa.EEMAILCONTABILIDADE,
//                 empresa.NUTELPUBLICO,
//                 empresa.NUTELCOMERCIAL,
//                 empresa.NUTELFINANCEIRO,
//                 empresa.NUTELGERENCIA,
//                 empresa.EURL,
//                 empresa.PATHIMG,
//                 empresa.NUCNAE,
//                 empresa.STECOMMERCE,
//                 empresa.DTULTATUALIZACAO,
//                 empresa.STATIVO,
//                 empresa.ALIQPIS,
//                 empresa.ALIQCOFINS,
//                 empresa.IDEMPRESA
//             ]
//             await statement.exec(params);
//         }
        
//         conn.commit();
//         return {
//             status: 'success',
//             message: 'Empresa atualizadas com sucesso'
//         }
//     } catch (error) {
//         console.error('Erro ao executar a atualização da empresa:', error);
//         throw error;
//     }
// }
