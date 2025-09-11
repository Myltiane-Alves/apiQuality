
// import conn from "../../config/dbConnection.js";
import { v4 as uuidv4 } from 'uuid'; 
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const autenticacaoUsuario = async (role, userName, password) => {
  

  try {
    let query = `
      SELECT 
        tbf.IDFUNCIONARIO, 
        tbf.IDGRUPOEMPRESARIAL, 
        tbf.IDSUBGRUPOEMPRESARIAL, 
        tbf.IDEMPRESA, 
        tbf.NOFUNCIONARIO, 
        tbf.IDPERFIL, 
        tbf.DSFUNCAO, 
        tbe.NOFANTASIA, 
        tbe.ID_LISTA_LOJA, 
        TO_VARCHAR(CURRENT_UTCTIMESTAMP, 'DD/MM/YYYY HH24:MI:SS') AS DATAHORASESSAO
      FROM "${databaseSchema}".FUNCIONARIO tbf 
      INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbf.IDEMPRESA = tbe.IDEMPRESA 
      WHERE tbf.NOLOGIN = ? AND tbf.PWSENHA = ? AND tbf.STATIVO = 'True'
    `;

    const params = [userName, password];

    const result = await new Promise((resolve, reject) => {
      const statement = conn.prepare(query);
      statement.exec(params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    if (!result.length) {
      return {
        error: true,
        msg: 'Usuario ou Senha não são validos'
      };
    }

    const usuario = result[0];

    const token = uuidv4() + '.' + uuidv4();

    const dataAtual = new Date();
    const dia = String(dataAtual.getDate()).padStart(2, '0');
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const ano = dataAtual.getFullYear();
    const dataSessao = `${dia}/${mes}/${ano}`;

    const userToken = {
      token,
      id: usuario.IDFUNCIONARIO,
      IDGRUPOEMPRESARIAL: usuario.IDGRUPOEMPRESARIAL,
      IDSUBGRUPOEMPRESARIAL: usuario.IDSUBGRUPOEMPRESARIAL,
      IDEMPRESA: usuario.IDEMPRESA,
      NOFUNCIONARIO: usuario.NOFUNCIONARIO,
      IDPERFIL: usuario.IDPERFIL,
      DSFUNCAO: usuario.DSFUNCAO,
      NOFANTASIA: usuario.NOFANTASIA,
      ID_LISTA_LOJA: usuario.ID_LISTA_LOJA,
      DATA_HORA_SESSAO: dataSessao
    };

    return userToken;
  } catch (error) {
    console.error('Error executing query', error);
    throw error;
  } finally {
    conn.close();
  }
};
