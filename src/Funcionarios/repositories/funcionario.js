// import conn from "../../config/dbConnection.js";

// // export const getFuncionarios = async () => {
// //   try {
// //     const sql = `
// //       SELECT 
// //         tbf.ID,
// //         tbf.IDFUNCIONARIO,
// //         tbf.IDGRUPOEMPRESARIAL,
// //         tbf.IDSUBGRUPOEMPRESARIAL,
// //         IFNULL(tbf.IDEMPRESA, 1) AS IDEMPRESA,
// //         tbf.NOFUNCIONARIO,
// //         tbf.IDPERFIL,
// //         tbf.NUCPF,
// //         tbf.NOLOGIN,
// //         tbf.PWSENHA,
// //         tbf.DSFUNCAO,
// //         IFNULL(TO_VARCHAR(tbf.DATAULTIMAALTERACAO, 'YYYY-MM-DD HH:MM:SS'), TO_VARCHAR(NOW(), 'YYYY-MM-DD HH:MM:SS')) AS DTULTALTERACAO,
// //         tbf.VALORSALARIO,
// //         tbf.DATA_DEMISSAO,
// //         tbf.PERC,
// //         tbf.STATIVO,
// //         IFNULL(tbf.PERCDESCPDV, 0) AS PERCDESCPDV,
// //         tbf.DSTIPO,
// //         IFNULL(tbf.VALORDISPONIVEL, 0) AS VALORDISPONIVEL,
// //         IFNULL(TO_VARCHAR(tbf.DTINICIODESC, 'YYYY-MM-DD HH:MM:SS'), '') AS DTINICIODESC,
// //         IFNULL(TO_VARCHAR(tbf.DTFIMDESC, 'YYYY-MM-DD HH:MM:SS'), '') AS DTFIMDESC,
// //         IFNULL(tbf.PERCDESCUSUAUTORIZADO, 0) AS PERCDESCUSUAUTORIZADO
// //       FROM 
// //         QUALITY_CONC_HML.FUNCIONARIO tbf
// //     `;

// //     const statement = conn.prepare(sql);
// //     const result = await statement.exec();


// //     return result;
// //   } catch (error) {
// //     console.error('Erro ao executar a consulta Funcionarios:', error);
// //     throw error;
// //   }
// // };

// export const getFuncionarios = async (
//   page, 
//   pageSize
// ) => {
//   try {
//       page = page && !isNaN(page) ? parseInt(page) : 1;
//       pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
//     const sql = `
//       SELECT 
//         tbf.ID,
//         tbf.IDFUNCIONARIO,
//         tbf.IDGRUPOEMPRESARIAL,
//         tbf.IDSUBGRUPOEMPRESARIAL,
//         IFNULL(tbf.IDEMPRESA, 1) AS IDEMPRESA,
//         tbf.NOFUNCIONARIO,
//         tbf.IDPERFIL,
//         tbf.NUCPF,
//         tbf.NOLOGIN,
//         tbf.PWSENHA,
//         tbf.DSFUNCAO,
//         IFNULL(TO_VARCHAR(tbf.DATAULTIMAALTERACAO, 'YYYY-MM-DD HH:MM:SS'), TO_VARCHAR(NOW(), 'YYYY-MM-DD HH:MM:SS')) AS DTULTALTERACAO,
//         tbf.VALORSALARIO,
//         tbf.DATA_DEMISSAO,
//         tbf.PERC,
//         tbf.STATIVO,
//         IFNULL(tbf.PERCDESCPDV, 0) AS PERCDESCPDV,
//         tbf.DSTIPO,
//         IFNULL(tbf.VALORDISPONIVEL, 0) AS VALORDISPONIVEL,
//         IFNULL(TO_VARCHAR(tbf.DTINICIODESC, 'YYYY-MM-DD HH:MM:SS'), '') AS DTINICIODESC,
//         IFNULL(TO_VARCHAR(tbf.DTFIMDESC, 'YYYY-MM-DD HH:MM:SS'), '') AS DTFIMDESC,
//         IFNULL(tbf.PERCDESCUSUAUTORIZADO, 0) AS PERCDESCUSUAUTORIZADO
//       FROM 
//         QUALITY_CONC_HML.FUNCIONARIO tbf
//       LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
//     `;

//     const statement = conn.prepare(sql);
//     const result = await statement.exec();

//     // Retornar o objeto com data, rows, page, e pageSize
//     return {
//       data: result,
//       rows: result.length,
//       page,
//       pageSize
//     };
//   } catch (error) {
//     console.error('Erro ao executar a consulta Funcionarios:', error);
//     throw error;
//   }
// };

// export const getFuncionariosById = async (cpf, id, idEmpresa, matricula, senha, page, pageSize) => {
//   try {
//     page = page && !isNaN(page) ? parseInt(page) : 1;
//     pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

//     let query = `SELECT 
//         tbf.ID,
//         tbf.IDFUNCIONARIO,
//         tbf.IDGRUPOEMPRESARIAL,
//         tbf.IDSUBGRUPOEMPRESARIAL,
//         IFNULL(tbf.IDEMPRESA, 1) AS IDEMPRESA,
//         tbf.NOFUNCIONARIO,
//         tbf.IDPERFIL,
//         tbf.NUCPF,
//         tbf.NOLOGIN,
//         tbf.PWSENHA,
//         tbf.DSFUNCAO,
//         IFNULL(TO_VARCHAR(tbf.DATAULTIMAALTERACAO, 'YYYY-MM-DD HH:MM:SS'), TO_VARCHAR(NOW(), 'YYYY-MM-DD HH:MM:SS')) AS DTULTALTERACAO,
//         tbf.VALORSALARIO,
//         tbf.DATA_DEMISSAO,
//         tbf.PERC,
//         tbf.STATIVO,
//         IFNULL(tbf.PERCDESCPDV, 0) AS PERCDESCPDV,
//         tbf.DSTIPO,
//         IFNULL(tbf.VALORDISPONIVEL, 0) AS VALORDISPONIVEL,
//         IFNULL(TO_VARCHAR(tbf.DTINICIODESC, 'YYYY-MM-DD HH:MM:SS'), '') AS DTINICIODESC,
//         IFNULL(TO_VARCHAR(tbf.DTFIMDESC, 'YYYY-MM-DD HH:MM:SS'), '') AS DTFIMDESC,
//         IFNULL(tbf.PERCDESCUSUAUTORIZADO, 0) AS PERCDESCUSUAUTORIZADO
//       FROM 
//         QUALITY_CONC_HML.FUNCIONARIO tbf
//       WHERE 1 = 1`;

//     const params = [];

//     if (cpf) {
//       query += ` AND tbf.DATA_DEMISSAO IS NULL AND tbf.STATIVO = 'True' AND DSTIPO <> 'PN'`;
//     } else {
//       query += ` AND tbf.DATA_DEMISSAO IS NULL AND tbf.STATIVO = 'True'`;
//       params.push(cpf);
//     }

//     if (id) {
//       query += ` AND tbf.ID = ?`;
//       params.push(id);
//     }

//     if (idEmpresa) {
//       query += ` AND (tbf.IDEMPRESA = ? OR DSFUNCAO = 'TI') AND tbf.IDFUNCIONARIO IS NOT NULL AND tbf.NOLOGIN <> ''`;
//       params.push(idEmpresa);
//     }

//     if (cpf) {
//       query += ` AND tbf.NUCPF = ?`;
//       params.push(cpf);
//     }

//     if (matricula && senha) {
//       query += ` AND tbf.NOLOGIN = ? AND tbf.PWSENHA = ?`;
//       params.push(matricula, senha);
//     }

//     query += ` ORDER BY tbf.NOFUNCIONARIO`;

//     const offset = (page - 1) * pageSize;
//     query += ' LIMIT ? OFFSET ?';
//     params.push(pageSize, offset);

//     const statement = conn.prepare(query);
//     const result = await statement.exec();
  

//     return result;
//   } catch (error) {
//     console.error('Erro ao executar a consulta Funcionarios:', error);
//     throw error;
//   }
// };

// export const handlePutFuncionario = async (data) => {
//   try {
//     const query = `
//       UPDATE QUALITY_CONC_HML."FUNCIONARIO" 
//       SET 
//         "IDFUNCIONARIO" = ?, 
//         "IDGRUPOEMPRESARIAL" = ?, 
//         "IDSUBGRUPOEMPRESARIAL" = ?, 
//         "IDEMPRESA" = ?, 
//         "NOFUNCIONARIO" = ?, 
//         "IDPERFIL" = ?, 
//         "NUCPF" = ?, 
//         "NOLOGIN" = ?, 
//         "PWSENHA" = ?, 
//         "DSFUNCAO" = ?, 
//         "DATAULTIMAALTERACAO" = ?, 
//         "VALORSALARIO" = ?, 
//         "DATA_DEMISSAO" = ?, 
//         "PERC" = ?
//       WHERE 
//         "ID" = ?`;

//     const statement = conn.prepare(query);

//     for (const registro of data) {
//       if (parseFloat(registro.PERC) > 50) {
//         return { msg: "Valor desconto maior que permitido!" };
//       }

//       const params = [
//         registro.IDFUNCIONARIO,
//         registro.IDGRUPOEMPRESARIAL,
//         registro.IDSUBGRUPOEMPRESARIAL,
//         registro.IDEMPRESA,
//         registro.NOFUNCIONARIO,
//         registro.IDPERFIL,
//         registro.NUCPF,
//         registro.NOLOGIN,
//         registro.PWSENHA,
//         registro.DSFUNCAO,
//         registro.DATAULTIMAALTERACAO,
//         registro.VALORSALARIO,
//         registro.DATA_DEMISSAO,
//         registro.PERC,
//         registro.ID
//       ];

//       await statement.exec(params);
//     }

//     statement.close();
//     conn.commit();

//     return { msg: "Atualização realizada com sucesso!" };
//   } catch (error) {
//     console.error('Erro ao executar a atualização de funcionários:', error);
//     throw error;
//   }
// };

// export const handlePostFuncionario = async (data) => {
//   try {
//     const query = `
//       INSERT INTO QUALITY_CONC_HML."FUNCIONARIO" 
//       (
//         "IDFUNCIONARIO",
//         "IDGRUPOEMPRESARIAL",
//         "IDSUBGRUPOEMPRESARIAL",
//         "IDEMPRESA",
//         "NOFUNCIONARIO",
//         "IDPERFIL",
//         "NUCPF",
//         "NOLOGIN",
//         "PWSENHA",
//         "DSFUNCAO",
//         "DATAULTIMAALTERACAO",
//         "VALORSALARIO",
//         "DATA_DEMISSAO",
//         "PERC"
//       ) 
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//     const statement = conn.prepare(query);

//     for (const registro of data) {
//       if (parseFloat(registro.PERC) > 50) {
//         return { msg: "Valor desconto maior que permitido!" };
//       }

//       const params = [
//         registro.IDFUNCIONARIO,
//         registro.IDGRUPOEMPRESARIAL,
//         registro.IDSUBGRUPOEMPRESARIAL,
//         registro.IDEMPRESA,
//         registro.NOFUNCIONARIO,
//         registro.IDPERFIL,
//         registro.NUCPF,
//         registro.NOLOGIN,
//         registro.PWSENHA,
//         registro.DSFUNCAO,
//         registro.DATAULTIMAALTERACAO,
//         registro.VALORSALARIO,
//         registro.DATA_DEMISSAO,
//         registro.PERC
//       ];

//       await statement.exec(params);
//     }

//     statement.close();
//     conn.commit();

//     return { msg: "Inclusão realizada com sucesso!" };
//   } catch (error) {
//     console.error('Erro ao executar a inclusão de funcionários:', error);
//     throw error;
//   }
// };
