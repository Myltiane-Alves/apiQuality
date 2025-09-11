
import 'dotenv/config';
// import conn from '../../../config/dbConnection.js';
const databaseSchema = process.env.HANA_DATABASE;

export const getAjusteExtrato = async (idAjusteExtrato,  pageSize, page) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 10;

        const query = `
            SELECT 
                tbae.IDAJUSTEEXTRATO,
                tbae.IDEMPRESA,
                tbae.HISTORICO,
                tbae.VRDEBITO,
                tbae.VRCREDITO,
                tbae.IDOPERADOR,
                TO_VARCHAR(tbae.DATACADASTRO,'DD-MM-YYYY') AS DTAJUSTEFORMATADA,
                tbae.STATIVO,
                tbae.STCANCELADO
            FROM 
                "${databaseSchema}".AJUSTEEXTRATO tbae
            WHERE 
                1 = ?
        `;

        const params = [];

        if (idAjusteExtrato > 0) {
            query += ' AND tbae.IDAJUSTEEXTRATO = ?';
            params.push(idAjusteExtrato);
        }

        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);


        return {
            page,
            pageSize,
            rows: result.length,
            data: result
        };
    } catch (error) {
        console.error('Error executing query', error);
        throw error;
    }
};

export const updateAjusteExtrato = async (extratos) => {
    try {
        const query = `UPDATE "${databaseSchema}"."AJUSTEEXTRATO" SET 
            "HISTORICO" = ?, 
            "VRDEBITO" = ?, 
            "VRCREDITO" = ?, 
            "IDOPERADOR" = ?, 
            "DATACADASTRO" = ?, 
            "STATIVO" = ?, 
            "STCANCELADO" = ? 
            WHERE "IDAJUSTEEXTRATO" = ?
        `;

        const statement = await conn.prepare(query);

        for (const extrato of extratos) {
            const params = [
                extrato.DSHISTORIO,
                extrato.VRDEBITO,
                extrato.VRCREDITO,
                extrato.IDOPERADOR,
                extrato.DATACADASTRO,
                extrato.STATIVO,
                extrato.STCANCELADO,
                extrato.IDAJUSTEEXTRATO
            ];
            
            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Ajuste Extrato atualizado com sucesso!',
        };
    } catch (e) {
        throw new Error(`Erro ao atualizar Ajuste do extrato: ${e.message}`);
    }
};