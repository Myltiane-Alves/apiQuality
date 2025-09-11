// import conn from "../../config/dbConnection.js";
// import 'dotenv/config';
// const databaseSchema = process.env.HANA_DATABASE;

// export const getTodosFuncionarios = async (byId, idEmpresa, cpf, matricula, senha, page, pageSize) => {
//   try {
//     page = page && !isNaN(page) ? parseInt(page) : 1;
//     pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

//     let query = `
//         SELECT 
//           tbf.ID,
//           tbf.IDFUNCIONARIO,
//           tbf.IDGRUPOEMPRESARIAL,
//           tbf.IDSUBGRUPOEMPRESARIAL,
//           IFNULL(tbf.IDEMPRESA, 1) AS IDEMPRESA,
//           tbf.NOFUNCIONARIO,
//           tbf.IDPERFIL,
//           tbf.NUCPF,
//           tbf.NOLOGIN,
//           tbf.PWSENHA,
//           tbf.DSFUNCAO,
//           IFNULL(TO_VARCHAR(tbf.DATAULTIMAALTERACAO, 'YYYY-MM-DD HH:MM:SS'), TO_VARCHAR(NOW(), 'YYYY-MM-DD HH:MM:SS')) AS DTULTALTERACAO,
//           tbf.VALORSALARIO,
//           tbf.DATA_DEMISSAO,
//           tbf.PERC,
//           tbf.STATIVO,
//           IFNULL(tbf.PERCDESCPDV, 0) AS PERCDESCPDV,
//           tbf.DSTIPO,
//           IFNULL(tbf.VALORDISPONIVEL, 0) AS VALORDISPONIVEL,
//           IFNULL(TO_VARCHAR(tbf.DTINICIODESC, 'YYYY-MM-DD HH:MM:SS'), '') AS DTINICIODESC,
//           IFNULL(TO_VARCHAR(tbf.DTFIMDESC, 'YYYY-MM-DD HH:MM:SS'), '') AS DTFIMDESC,
//           IFNULL(tbf.PERCDESCUSUAUTORIZADO, 0) AS PERCDESCUSUAUTORIZADO
//         FROM 
//           "${databaseSchema}".FUNCIONARIO tbf
//         WHERE 1 = ?
//     `;

//     const params = [1];

    
//     if (cpf) {
//       query += ' and tbf.DATA_DEMISSAO is null and tbf.STATIVO=\'True\' and DSTIPO <> \'PN\' ';
//       params.push(cpf);
//     } else {
//       query += ' and tbf.DATA_DEMISSAO is null and tbf.STATIVO=\'True\'';
//     }

 
//     if (byId) {
//       query += ' and tbf.ID = ?';
//       params.push(byId);
//     }

    
//     if (idEmpresa) {
//       query += ' and (tbf.IDEMPRESA = ? or tbf.DSFUNCAO = \'TI\') and tbf.IDFUNCIONARIO is not null and tbf.NOLOGIN <> \'\'';
//       params.push(idEmpresa);
//     }

    
//     if (matricula && senha) {
//       query += ' and tbf.NOLOGIN = ? and tbf.PWSENHA = ?';
//       params.push(matricula, senha);
//     }

//     query += ' ORDER BY tbf.NOFUNCIONARIO';

   
//     const offset = (page - 1) * pageSize;
//     query += ' LIMIT ? OFFSET ?';
//     params.push(pageSize, offset);

//     const statement = await conn.prepare(query);
//     const result = await statement.exec(params);

//     return {
//       page,
//       pageSize,
//       rows: result.length,
//       data: result,
//     };
//   } catch (error) {
//     console.error('Erro ao executar a consulta Funcionarios:', error);
//     throw error;
//   }
// };
