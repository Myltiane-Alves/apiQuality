// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const putAjusteRecebimento = async (status) => {
    try {
        

        let query = `
            UPDATE "${databaseSchema}"."MOVIMENTOCAIXA" SET 
                "TXT_OBS" = ?, 
                "VRAJUSTDINHEIRO" = ?, 
                "VRAJUSTTEF" = ?, 
                "VRAJUSTPOS" = ?, 
                "VRAJUSTCONVENIO" = ?, 
                "VRAJUSTVOUCHER" = ?, 
                "VRAJUSTFATURA" = ?, 
                "VRAJUSTPIX" = ?, 
                "VRAJUSTPL" = ?, 
                "VRQUEBRACAIXA" = ? 
            WHERE "ID" = ? 
        `;

        const statement = await conn.prepare(query);

        for (const registro of status) {
          

            
            await statement.exec([
                registro.TXT_OBS,
                registro.VRAJUSTDINHEIRO,
                registro.VRAJUSTTEF,
                registro.VRAJUSTPOS,
                registro.VRAJUSTCONVENIO,
                registro.VRAJUSTVOUCHER,
                registro.VRAJUSTFATURA,
                registro.VRAJUSTPIX,
                registro.VRAJUSTPL,
                registro.VRQUEBRACAIXA,
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