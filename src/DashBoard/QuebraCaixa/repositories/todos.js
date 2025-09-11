// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const updateQuebraCaixa = async (dados) => {
    try {
        let query = `
            UPDATE "${databaseSchema}"."QUEBRACAIXA" SET 
                "IDCAIXAWEB" = ?, 
                "IDMOVIMENTOCAIXA" = ?, 
                "IDGERENTE" = ?, 
                "IDFUNCIONARIO" = ?, 
                "DTLANCAMENTO" = ?, 
                "VRQUEBRASISTEMA" = ?, 
                "VRQUEBRAEFETIVADO" = ?, 
                "TXTHISTORICO" = ?, 
                "STATIVO" = ? 
            WHERE "IDQUEBRACAIXA" = ? 
        `;

        const statement = await conn.prepare(query);

        for (const registro of dados) {
          

            
            await statement.exec([
                registro.IDCAIXAWEB,
                registro.IDMOVIMENTOCAIXA,
                registro.IDGERENTE,
                registro.IDFUNCIONARIO,
                registro.DTLANCAMENTO,
                registro.VRQUEBRASISTEMA,
                registro.VRQUEBRAEFETIVADO,
                registro.TXTHISTORICO,
                registro.STATIVO,
                registro.IDQUEBRACAIXA
                
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

export const createQuebraCaixa = async (dados) => {
    try {
        
        const query = `
            INSERT INTO "${databaseSchema}"."QUEBRACAIXA" 
            ( 
                "IDQUEBRACAIXA", 
                "IDCAIXAWEB", 
                "IDMOVIMENTOCAIXA", 
                "IDGERENTE", 
                "IDFUNCIONARIO", 
                "DTLANCAMENTO", 
                "VRQUEBRASISTEMA", 
                "VRQUEBRAEFETIVADO", 
                "TXTHISTORICO", 
                "STATIVO" 
            ) 
            VALUES(${databaseSchema}.SEQ_QUEBRACAIXA.NEXTVAL,?,?,?,?,?,?,?,?,?) 
        `;
        
        const statement = await conn.prepare(query);

        for (const registro of dados) {
             
            await statement.exec([
                registro.IDCAIXAWEB,
                registro.IDMOVIMENTOCAIXA,
                registro.IDGERENTE,
                registro.IDFUNCIONARIO,
                registro.DTLANCAMENTO,
                registro.VRQUEBRASISTEMA,
                registro.VRQUEBRAEFETIVADO,
                registro.TXTHISTORICO,
                registro.STATIVO
            ]);

        }

        conn.commit();
    
        return {
            status: 'success',
            msg: 'Inclusão realizada com sucesso!',
        
        }
      
    } catch (error) {
        console.error("um erro ao executar :", error);
       
    }
};