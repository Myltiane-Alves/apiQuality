// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const updatePedido = async (dados) => {
    try {
        const query = `
            UPDATE "${databaseSchema}"."RESUMOPEDIDO" SET 
            "IDGRUPOEMPRESARIAL" = ?, 
            "IDSUBGRUPOEMPRESARIAL" = ?, 
            "IDCOMPRADOR" = ?, 
            "IDCONDICAOPAGAMENTO" = ?, 
            "IDFORNECEDOR" = ?, 
            "IDTRANSPORTADORA" = ?, 
            "IDANDAMENTO" = ?, 
            "MODPEDIDO" = ?, 
            "NOVENDEDOR" = ?, 
            "EEMAILVENDEDOR" = ?, 
            "DTPEDIDO" = ?, 
            "DTPREVENTREGA" = ?, 
            "TPFRETE" = ?, 
            "DESCPERC01" = ?, 
            "DESCPERC02" = ?, 
            "DESCPERC03" = ?, 
            "PERCCOMISSAO" = ?, 
            "VRTOTALLIQUIDO" = ?, 
            "OBSPEDIDO" = ?, 
            "OBSPEDIDO2" = ?, 
            "DTFECHAMENTOPEDIDO" = ?, 
            "DTCADASTRO" = ?, 
            "TPARQUIVO" = ?, 
            "STDISTRIBUIDO" = ?, 
            "STAGRUPAPRODUTO" = ?, 
            "STCANCELADO" = ?, 
            "TPFISCAL" = ?, 
            "STRASCUNHO" = ? 
            WHERE "IDRESUMOPEDIDO" = ?;
        `;
       
        const statement = await conn.prepare(query);

        for (const dado of dados) {
            const params = [
                dado.IDGRUPOEMPRESARIAL,
                dado.IDSUBGRUPOEMPRESARIAL,
                dado.IDCOMPRADOR,
                dado.IDCONDICAOPAGAMENTO,
                dado.IDFORNECEDOR,
                dado.IDTRANSPORTADORA,
                dado.IDANDAMENTO,
                dado.MODPEDIDO,
                dado.NOVENDEDOR,
                dado.EEMAILVENDEDOR,
                dado.DTPEDIDO,
                dado.DTPREVENTREGA,
                dado.TPFRETE,
                dado.DESCPERC01,
                dado.DESCPERC02,
                dado.DESCPERC03,
                dado.PERCCOMISSAO,
                dado.VRTOTALLIQUIDO,
                dado.OBSPEDIDO,
                dado.OBSPEDIDO2,
                dado.DTFECHAMENTOPEDIDO,
                dado.DTCADASTRO,
                dado.TPARQUIVO,
                dado.STDISTRIBUIDO,
                dado.STAGRUPAPRODUTO,
                dado.STCANCELADO,
                dado.TPFISCAL,
                dado.STRASCUNHO,
                dado.IDRESUMOPEDIDO
            ];

            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Atualização Realizada com sucesso do Pedido',
        };
    } catch (e) {
        throw new Error(`Erro ao atualizar  Pedido: ${e.message}`);
    }
}