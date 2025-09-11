// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const updateCancelamentoPedido = async (dados) => {
    try {
        const queryUpdate = `
            UPDATE "${databaseSchema}"."RESUMOPEDIDO" SET 
            "IDANDAMENTO" = ?, 
            "IDRESPCANCELAMENTO" = ?, 
            "DSMOTIVOCANCELAMENTO" = ?, 
            "DTCANCELAMENTO" = ?, 
            "STCANCELADO" = ?, 
            "DTMOVPEDIDO" = now() 
            WHERE "IDRESUMOPEDIDO" = ?
        `;

        const statementUpdate = await conn.prepare(queryUpdate);


        for (const dado of dados) {
            const params = [
                
            ];

            await conn.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Atualização Realizada com sucesso de Status Produto do Pedido',
        };
    } catch (e) {
        throw new Error(`Erro ao atualizar Status Produto do Pedido: ${e.message}`);
    }
};

export const updateStatusProdutoPedido = async (dados) => {
    try {
        const query = `
            UPDATE "${databaseSchema}"."DETALHEPEDIDO" SET 
            "STCANCELADO" = ?, 
            "IDRESPCANCELAMENTO" = ?, 
            "TXTOBSCANCELAMENTO" = ?, 
            "DTCANCELAMENTO" = now() 
            WHERE "IDDETALHEPEDIDO" = ?
        `;
       
        const statement = await conn.prepare(query);

        for (const dado of dados) {
            const params = [
                dado.STCANCELADO,
                dado.IDRESPCANCELAMENTO || '',
                dado.TXTOBSCANCELAMENTO || '',
                dado.IDDETALHEPEDIDO
            ];


            await updateResumoPedido(dado.IDRESUMOPEDIDO)
            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Atualização Realizada com sucesso de Status do Produto do Pedido',
        };
    } catch (e) {
        throw new Error(`Erro ao atualizar Status do Produto do Pedido: ${e.message}`);
    }
}