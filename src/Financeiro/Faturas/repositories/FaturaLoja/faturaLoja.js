// import conn from '../../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const putAtualizarRecompra = async (detalhes) => {
    try {
        const query = `
            UPDATE "${databaseSchema}"."DETALHEFATURA" SET 
                "STRECOMPRA" = ?
            WHERE "IDDETALHEFATURA" = ?
        `;

        const statement = await conn.prepare(query);

        for (const registro of detalhes) {

            await statement.exec([
                registro.STRECOMPRA,
                registro.IDDETALHEFATURA
            ]);
        }

        conn.commit();

        return {
            status: 'success',
            msg: 'Atualização realizada com sucesso!'
        
        }
      
    } catch (error) {
        console.error("Erro ao Atualizar a recompra:", error);
    }
};

export const putAtualizarFatura = async (detalhes) => {
    try {
        let query = `
            UPDATE "${databaseSchema}"."DETALHEFATURA" SET 
            "NUCODAUTORIZACAO" = ?, 
            "VRRECEBIDO" = ? 
            WHERE "IDDETALHEFATURA" = ? 
        `;

        const statement = await conn.prepare(query);

        for (const registro of detalhes) {

            await statement.exec([
                registro.NUCODAUTORIZACAO,
                registro.VRRECEBIDO,
                registro.IDDETALHEFATURA
            ]);
        }

        conn.commit();

        return {
            status: 'success',
            msg: 'Atualização realizada com sucesso!'
        
        }
      
    } catch (error) {
        console.error("Erro ao Atualizar Valor Fatura:", error);
       
    }
};