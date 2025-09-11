// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const updateAndamentoPedido = async (dados) => {
    try {
        const query = `
            UPDATE "${databaseSchema}"."RESUMOPEDIDO" SET 
                "IDANDAMENTO" = ?, 
                "TXTOBSDEVPEDIDO" = ?, 
                "DTMOVPEDIDO" = now() 
            WHERE "IDRESUMOPEDIDO" = ? 
        `;

       
        const statement = await conn.prepare(query);

        for (const dado of dados) {
            const params = [dado.IDANDAMENTO, dado.TXTOBSDEVPEDIDO, dado.IDRESUMOPEDIDO];

            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Atualização Realizada com sucesso do Andamento do Pedido',
        };
    } catch (e) {
        throw new Error(`Erro ao atualizar Andamento do Pedido: ${e.message}`);
    }
};