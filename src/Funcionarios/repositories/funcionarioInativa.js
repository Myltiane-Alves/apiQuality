// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const updateInativarFuncionario = async (data) => {
  try {
    const query = `
        UPDATE "${databaseSchema}"."FUNCIONARIO" SET 
          "DATAULTIMAALTERACAO" = ?, 
          "DATA_DEMISSAO" = ?, 
          "STATIVO" = ? 
        WHERE "ID" = ? 
    `;

    const statement = conn.prepare(query);

    for (const registro of data) {
     
      const params = [
        registro.DATAULTIMAALTERACAO,
        registro.DATA_DEMISSAO,
        registro.STATIVO,
        registro.ID
      ];
    
      await statement.exec(params);
    }

  
    conn.commit();

    return {
      status: 'success',
      msg: "Atualização realizada com sucesso!",
    };
  } catch (error) {
    console.error('Erro ao executar a atualização de funcionários:', error);
    throw new Error(`Erro ao atualizar funcionários: ${error.message}`);
  }
};

export const handlePostFuncionario = async (data) => {
  try {
    const query = `
      INSERT INTO QUALITY_CONC_HML."FUNCIONARIO" 
      (
        "IDFUNCIONARIO",
        "IDGRUPOEMPRESARIAL",
        "IDSUBGRUPOEMPRESARIAL",
        "IDEMPRESA",
        "NOFUNCIONARIO",
        "IDPERFIL",
        "NUCPF",
        "NOLOGIN",
        "PWSENHA",
        "DSFUNCAO",
        "DATAULTIMAALTERACAO",
        "VALORSALARIO",
        "DATA_DEMISSAO",
        "PERC"
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const statement = conn.prepare(query);

    for (const registro of data) {
      if (parseFloat(registro.PERC) > 50) {
        return { msg: "Valor desconto maior que permitido!" };
      }

      const params = [
        registro.IDFUNCIONARIO,
        registro.IDGRUPOEMPRESARIAL,
        registro.IDSUBGRUPOEMPRESARIAL,
        registro.IDEMPRESA,
        registro.NOFUNCIONARIO,
        registro.IDPERFIL,
        registro.NUCPF,
        registro.NOLOGIN,
        registro.PWSENHA,
        registro.DSFUNCAO,
        registro.DATAULTIMAALTERACAO,
        registro.VALORSALARIO,
        registro.DATA_DEMISSAO,
        registro.PERC
      ];

      await statement.exec(params);
    }

    statement.close();
    conn.commit();

    return { msg: "Inclusão realizada com sucesso!" };
  } catch (error) {
    console.error('Erro ao executar a inclusão de funcionários:', error);
    throw error;
  }
};
