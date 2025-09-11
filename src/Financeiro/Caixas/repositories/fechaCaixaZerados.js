// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const putFecharCaixaZerados = async (registro) => {
    try {

        let query = `
            UPDATE "${databaseSchema}"."MOVIMENTOCAIXA" SET 
                "DTFECHAMENTO" = DTABERTURA,
                "STFECHADO" = 'True',
                "TXT_OBS" = 'Fechado pelo Dep. Financeiro' 
            WHERE "ID" =  ? 
        `;

        const params = [registro.ID];

        const statement = conn.prepare(query);
        const result = statement.exec(params);

      
        conn.commit();
        return {
            msg: "Atualização realizada com sucesso!"
        };
    } catch(e) {
        console.log('Erro ao fechar caixa zerado: ', e.message);
        throw new Error(e.message);
    }
}