// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const updateProdutosImagem = async (dados) => {
    try {
        const query = `
            UPDATE "${databaseSchema}"."TBIMAGEMPRODUTO" SET 
            "STATIVO" = ?
            WHERE "IDIMAGEMPRODUTO" = ? 
        `;

       
        const statement = await conn.prepare(query);

        for (const dado of dados) {
            const params = [dado.STATIVO, dado.IDIMAGEMPRODUTO];

            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Atualização Realizada com sucesso da Imagem do Produto',
        };
    } catch (e) {
        throw new Error(`Erro ao atualizar Imagem do Produto: ${e.message}`);
    }
};