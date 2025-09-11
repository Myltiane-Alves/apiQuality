// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const putAtualizacaoStatus = async (status) => {
    try {
        

        let query = `
            UPDATE "${databaseSchema}"."MOVIMENTOCAIXA" SET 
            "IDSUPERVISOR" = ?, 
            "STCONFERIDO" = ? 
            WHERE "ID" = ? 
        `;

        const statement = await conn.prepare(query);

        for (const registro of status) {
          

            
            await statement.exec([
                registro.IDSUPERVISOR,
                registro.STCONFERIDO,
                registro.ID
            ]);


        }

        conn.commit();
    
        return {
            status: 'success',
            msg: 'Atualização realizada com sucesso!',
            data: status
        
        }
      
    } catch (error) {
        console.error("um erro ao executar :", error);
        res.status(500).json({ error: error.message });
    }
};