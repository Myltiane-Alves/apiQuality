// import conn from "../../../config/dbConnection.js";


import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getMotivoDevolucao = async (idMotivo, descricaoMotivo, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
  try {
    page = page && !isNaN(page) ? parseInt(page) : 1;
    pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

    let query = `
            SELECT 
                IDMOTIVODEVOLUCAO,
                DSMOTIVO,
                STATIVO,
                IDUSERCRIACAO,
                TO_VARCHAR(DTCRIACAO, 'YYYY-MM-DD HH24:MI:SS') AS DTCRIACAO,
                IDUSERULTALTERACAO,
                TO_VARCHAR(DTULTALTERACAO, 'YYYY-MM-DD HH24:MI:SS') AS DTULTALTERACAO,
                TO_VARCHAR(DTCRIACAO, 'DD/MM/YYYY HH24:MI:SS') AS DTCRIACAOFORMATADA,
                TO_VARCHAR(DTULTALTERACAO, 'DD/MM/YYYY HH24:MI:SS') AS DTULTALTERACAOFORMATADA
            FROM 
                "${databaseSchema}".MOTIVODEVOLUCAO
            WHERE 1 = 1
        `;
    const params = [];

    if (idMotivo) {
      query += ' AND IDMOTIVODEVOLUCAO = ?';
      params.push(idMotivo);
    }

    if (descricaoMotivo) {
      query += ' AND DSMOTIVO LIKE ?';
      params.push(`%${descricaoMotivo}%`);
    }

    if (dataPesquisaInicio && dataPesquisaFim) {
      query += ' AND (DTCRIACAO BETWEEN ? AND ? OR DTULTALTERACAO BETWEEN ? AND ?)';
      params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`, `${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
    }

    query += ' ORDER BY IDMOTIVODEVOLUCAO';

    const offset = (page - 1) * pageSize;
    query += ' LIMIT ? OFFSET ?';
    params.push(pageSize, offset);

    const statement = await conn.prepare(query);
    const result = await statement.exec(params);


    return {
      page: page,
      pageSize: pageSize,
      rows: result.length,
      data: result,
    };
  } catch (error) {
    console.error('Error executing query', error);
    throw error;
  }
};



export const putMotivoDevolucao = async (devolucao) => {

  try {

    const query = `
          UPDATE
              "${databaseSchema}".MOTIVODEVOLUCAO
          SET
              DSMOTIVO = ?,
              STATIVO = ?,
              IDUSERULTALTERACAO = ?,
              DTULTALTERACAO = NOW()
          WHERE
              IDMOTIVODEVOLUCAO = ?
      `;

    const statement = await conn.prepare(query);

    for (const dados of devolucao) {
      const params = [
        dados.DSMOTIVO,
        dados.STATIVO,
        dados.IDUSUARIO,
        dados.IDMOTIVODEVOLUCAO
      ];

      await statement.exec(params);

    }

    conn.commit();
    return {
      status: 'success',
      message: 'Atualização do Motivo com sucesso!',
    };
  } catch (error) {
    console.error('Error executing query', error);
    return {
      status: 'error',
      message: 'Erro ao atualizar o Motivo de Devolução!',
    }
  }

};

export const postMotivoDevolucao = async (devolucao) => {
  try {

    const query = `
      INSERT INTO
          "${databaseSchema}".MOTIVODEVOLUCAO
          (
              DSMOTIVO,
              STATIVO,
              IDUSERCRIACAO,
              DTCRIACAO,
              IDUSERULTALTERACAO,
              DTULTALTERACAO
          )
      VALUES
          (?, 'True', ?, NOW(), ?, NOW())
    `;

    const statement = await conn.prepare(query);

    for (const dados of devolucao) {
      const params = [
        dados.DSMOTIVO,
        dados.IDUSUARIO,
        dados.IDUSUARIO,
      ];

      await statement.exec(params);
    }
    conn.commit();
    return {
      status: 'success',
      message: 'Motivo de Devolução inserido com sucesso!',
    };
  } catch (error) {
    console.error('Error executing query', error);
    return {
      status: 'error',
      message: 'Erro ao inserir o Motivo de Devolução!',
    }
  }
}