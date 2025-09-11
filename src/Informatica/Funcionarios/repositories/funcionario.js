// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';

const databaseSchema = process.env.HANA_DATABASE;

export const updateFuncionarioLoja = async (funcionarios) => {
    try {
        let query = `
            UPDATE "${databaseSchema}"."FUNCIONARIO"
            SET
            "PERC" = ?,
            "DATAULTIMAALTERACAO" = NOW()
            WHERE 
            "ID" = ? 
            -- Remova o comentário para testar sem o filtro de data
            AND "DATA_ADMISSAO" >= '2024-07-01'
        `;

        const statement = await conn.prepare(query);

        for (const funcionario of funcionarios) {
            const currentDate = new Date();

            // Tente converter DATA_ADMISSAO em uma data válida
            const admissionDate = new Date(funcionario.DATA_ADMISSAO);
            
            if (isNaN(admissionDate.getTime())) {
                console.log(`Data de admissão inválida para o funcionário ID ${funcionario.ID}: ${funcionario.DATA_ADMISSAO}`);
                continue;  // Se a data for inválida, pula para o próximo funcionário
            }

            const diffTime = Math.abs(currentDate - admissionDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));  // Calcula a quantidade de dias

            let perc = funcionario.PERC;

            if (diffDays >= 730) {
                perc = 20;
            } else if (diffDays >= 365) {
                perc = 15;
            } else if (diffDays >= 90) {
                perc = 10;
            }

            // Apenas atualiza se o funcionário tiver mais de 90 dias de admissão
            if (diffDays >= 90) {
                const params = [perc, funcionario.ID];
                console.log('Atualizando funcionário:', params);

                try {
                    const result = await statement.exec(params);
                    console.log(`Funcionário ID ${funcionario.ID} atualizado com sucesso. Linhas afetadas: ${result}`);
                } catch (execError) {
                    console.error(`Erro ao atualizar funcionário ID ${funcionario.ID}:`, execError);
                }
            } else {
                // Adicionando a quantidade de dias no log
                console.log(`Funcionário ID ${funcionario.ID} não foi atualizado, ${diffDays} dias de admissão (menos de 90 dias).`);
            }
        }

        // Tenta commitar a transação
        try {
            await conn.commit();
            console.log('Commit realizado com sucesso.');
        } catch (commitError) {
            console.error('Erro ao realizar o commit:', commitError);
        }

        return {
            status: 'success',
            message: 'Atualização realizada com sucesso!',
            data: funcionarios
        };
    } catch (error) {
        console.error('Erro ao executar a atualização:', error);
        throw error;
    } finally {
        // Fecha a conexão com o banco
        try {
            await conn.close();
            console.log('Conexão fechada com sucesso.');
        } catch (closeError) {
            console.error('Erro ao fechar a conexão:', closeError);
        }
    }
};

