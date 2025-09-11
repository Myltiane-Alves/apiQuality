// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const updateImagem = async (dados) => {
    try {
        const queryImagem = `
            UPDATE "${databaseSchema}"."TBIMAGEM" SET 
            "STATIVO" = ?
            WHERE "IDIMAGEM" = ? 
        `;

        const statementImagem = await conn.prepare(queryImagem);

        const queryImagemProduto = `
            UPDATE "${databaseSchema}"."TBIMAGEMPRODUTO" 
                SET "STATIVO" = 'False' 
            WHERE "IDIMAGEM" = ?
        `;

        const statementImagemProduto = await conn.prepare(queryImagemProduto);

        for (const dado of dados) {
            await statementImagem.exec([dado.STATIVO, dado.IDIMAGEM]);
            await statementImagemProduto.exec([dado.IDIMAGEM]);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Atualização Realizada com sucesso na Imagem e Imagem do Produto',
        };
    } catch (e) {
        throw new Error(`Erro ao atualizar Imagem e Imagem do Produto: ${e.message}`);
    }
};