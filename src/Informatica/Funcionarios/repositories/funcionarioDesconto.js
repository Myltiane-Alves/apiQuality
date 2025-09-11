// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';

const databaseSchema = process.env.HANA_DATABASE;

export const updateFuncionarioDesconto = async (funcionarios) => {
    try {
        const query = `
            UPDATE "${databaseSchema}"."FUNCIONARIO" SET 
            "DTINICIODESC" = ?, 
            "DTFIMDESC" = ?, 
            "PERCDESCUSUAUTORIZADO" = ?, 
            "TXTMOTIVODESCONTO" = ?, 
            "IDFUNCIONARIOULTALTERACAO" = ?, 
            "DATAULTIMAALTERACAO" = now() 
            WHERE "ID" = ? 
        `;

        const statement = await conn.prepare(query);

        for (const funcionario of funcionarios) {
            const params = [
                funcionario.DTINICIODESC,
                funcionario.DTFIMDESC,
                funcionario.PERCDESCUSUAUTORIZADO,
                funcionario.TXTMOTIVODESCONTO,
                funcionario.IDFUNCIONARIOULTALTERACAO,
                funcionario.ID
            ];
            await statement.exec(params);
        }
        
        conn.commit();
        return {
            status: 'success',
            message: 'Atualização realizada com sucesso!',
            data: funcionarios
        };
    } catch (error) {
        console.error('Erro ao executar a atualização desconto funcionario:', error);
        throw error;
    } 
};

