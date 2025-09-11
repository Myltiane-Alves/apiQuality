// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const updateResumoPedido = async (dados) => {
    try {
        const querydetpedido = `
            SELECT COUNT(DETPED.IDDETALHEPEDIDO) TOTALITENS, 
               SUM(DETPED.QTDTOTAL) QTDTOTAL, 
               SUM(DETPED.VRTOTAL) VRTOTAL
            FROM "${databaseSchema}".DETALHEPEDIDO DETPED
            WHERE DETPED."STCANCELADO"='False' 
              AND DETPED."IDRESUMOPEDIDO" = ?
        `;
        const [result] = await conn.exec(querydetpedido, [dados[0].IDRESUMOPEDIDO]);

        const det = result || {};

        const NUTOTALITENS = parseFloat(det.TOTALITENS || 0);
        const QTDTOTPRODUTOS = !det.QTDTOTAL ? 0 : parseFloat(det.QTDTOTAL);
        const VRTOTALBRUTO = !det.VRTOTAL ? 0 : parseFloat(det.VRTOTAL);
        const VRTOTALLIQUIDO = !det.VRTOTAL ? 0 : parseFloat(det.VRTOTAL);

        const queryUpdate = `
            UPDATE "${databaseSchema}"."RESUMOPEDIDO"
                SET 
                    "NUTOTALITENS" = ?, 
                    "QTDTOTPRODUTOS" = ?, 
                    "VRTOTALBRUTO" = ?, 
                    "VRTOTALLIQUIDO" = ?
            WHERE "IDRESUMOPEDIDO" = ?
        `;
        for (const dado of dados) {
            const params = [
                NUTOTALITENS,
                QTDTOTPRODUTOS,
                VRTOTALBRUTO,
                VRTOTALLIQUIDO,
                dado.IDRESUMOPEDIDO
            ];

            await conn.exec(queryUpdate, params);
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