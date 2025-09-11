// import conn from "../../config/dbConnection.js";
import 'dotenv/config';

const databaseSchema = process.env.HANA_DATABASE;

// export const updateAtualizarTodosCaixa = async (dados) => {
//     const query = `
//         UPDATE "${databaseSchema}"."CAIXA" SET 
//         "STATUALIZA" = ?, 
//         "STLIMPA" = ? 
//         WHERE "IDCAIXAWEB" = ?;
//     `;

//     try {
//         const statement = await conn.prepare(query);

//         for (const registro of dados) {
//             // Verifica se STATUALIZA é um array antes de iterar sobre ele
//             if (Array.isArray(registro.STATUALIZA)) {
//                 for (const pontoAtualizar of registro.STATUALIZA) {
//                     let stAtualiza = 'False';
//                     let stLimpar = 'False';
//                     const id = parseInt(pontoAtualizar.replace(/[A|L]/, ''));

//                     // Verifica os indicadores 'A' e 'L'
//                     if (pontoAtualizar.includes('A')) stAtualiza = 'True';
//                     if (pontoAtualizar.includes('L')) stLimpar = 'True';

//                     const params = [stAtualiza, stLimpar, id];
//                     console.log(stAtualiza, stLimpar, id)
//                     console.log(params)
//                     await statement.exec(params); // Executa a query para cada conjunto de parâmetros
//                 }
//             } else {
//                 console.warn(`STATUALIZA não é um array no registro:`, registro);
//             }
//         }

//         await conn.commit();
//         return {
//             status: 'success',
//             message: 'Atualização realizada com sucesso!'
//         };
//     } catch (error) {
//         console.error('Erro ao executar a atualização dos caixas:', error);
//         await conn.rollback();
//         throw error;
//     } finally {
//         console.log('Fechando conexão com o banco de dados...');
       
//     }
// };


export const updateAtualizarTodosCaixa = async (dados) => {
    const query = `
        UPDATE "${databaseSchema}"."CAIXA" SET 
        "STATUALIZA" = ?, 
        "STLIMPA" = ? 
        WHERE "IDCAIXAWEB" = ? 
    `;
    
    try {
        const statement = await conn.prepare(query);

        for (const registro of dados) {
            console.log(registro, 'registro.STATUALIZA')
            for (const pontoAtualizar of registro.STATUALIZA) {
                let stAtualiza = 'False';
                let stLimpar = 'False';
                let id = '';
                
                if (pontoAtualizar.includes('A')) {
                    stAtualiza = 'True';
                    id = pontoAtualizar.replace('A', '');
                }
                if (pontoAtualizar.includes('L')) {
                    stLimpar = 'True';
                    id = pontoAtualizar.replace('L', '');
                }
                id = parseInt(id, 10);

                const params = [stAtualiza, stLimpar, id];
                console.log('params', params);
                await statement.exec(params);
            }
        }

        await conn.commit();
        const result = {
            status: 'success',
            message: 'Atualização realizada com sucesso!'
        };

        // console.log(result, 'result')
        return result;
    } catch (error) {
        console.error("Erro ao executar a atualização:", error);
        throw error;
    }
}

