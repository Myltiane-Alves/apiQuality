// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const updateStatusPedido = async (dados) => {
    try {
        const query = `
            UPDATE "${databaseSchema}"."RESUMOPEDIDO" SET 
            "IDANDAMENTO" = ?, 
            "IDRESPCANCELAMENTO" = ?, 
            "DSMOTIVOCANCELAMENTO" = ?, 
            "DTCANCELAMENTO" = ?, 
            "STCANCELADO" = ? 
            WHERE "IDRESUMOPEDIDO" = ? 
        `;
       
        const statement = await conn.prepare(query);

        for (const dado of dados) {
            const params = [
                dado.IDANDAMENTO, 
                dado.IDRESPCANCELAMENTO, 
                dado.DSMOTIVOCANCELAMENTO, 
                dado.DTCANCELAMENTO, 
                dado.STCANCELADO, 
                dado.IDRESUMOPEDIDO
            ];

            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Atualização Realizada com sucesso de Status do Pedido',
        };
    } catch (e) {
        throw new Error(`Erro ao atualizar Status do Pedido: ${e.message}`);
    }
};