// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;


export const updateAlterarVendaRecebimento = async (dados) => {
    try {
        const query = `
            UPDATE "${databaseSchema}"."VENDA" SET 
            "VRRECDINHEIRO" = ?, 
            "VRRECCONVENIO" = ?, 
            "VRRECCHEQUE" = ?, 
            "VRRECCARTAO" = ?, 
            "VRRECPOS" = ?, 
            "VRRECVOUCHER" = ? 
            WHERE "IDVENDA" = ? 
        `;
        const statement = await conn.prepare(query);

        for(const dado of dados) {
            const params = [
                dado.VRRECDINHEIRO,
                dado.VRRECCONVENIO,
                dado.VRRECCHEQUE,
                dado.VRRECCARTAO,
                dado.VRRECPOS,
                dado.VRRECVOUCHER,
                dado.IDVENDA
            ]
            console.log(params, 'alterar recebimento da venda');
            await statement.exec(params);
        }
        
        conn.commit();
        return {
            status: 'success',
            message: 'Recebimento da venda alterado com sucesso!'
        }
    } catch (error) {
        console.error('Erro ao executar a alteração do recebimento da venda', error);
        throw error;
    }
}

