// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getDetalheBalancoAvulso = async (idFilial, coletor, page, pageSize) => {
    try {

        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                dba.IDDETALHEBALANCOAVULSO,
                dba.IDEMPRESA,
                dba.NUMEROCOLETOR,
                dba.DSCOLETOR,
                dba.IDPRODUTO,
                dba.CODIGODEBARRAS AS NUCODBARRAS,
                dba.DSPRODUTO AS DSNOME,
                IFNULL(SUM(dba.TOTALCONTAGEMGERAL), 0) AS TOTALCONTAGEMGERAL,
                IFNULL(dba.PRECOVENDA, 0) AS PRECOVENDA,
                IFNULL(dba.PRECOCUSTO, 0) AS PRECOCUSTO,
                dba.STCANCELADO,
                e.NOFANTASIA
            FROM 
                "${databaseSchema}"."DETALHEBALANCOAVULSO" dba
            INNER JOIN 
                "${databaseSchema}".EMPRESA e ON e.IDEMPRESA = dba.IDEMPRESA
            WHERE 
                1 = ?
        `;
        
        const params = [1];


        if (coletor) {
            query += ' AND dba.NUMEROCOLETOR = ?';
            params.push(coletor);
        }

        if (idFilial) {
            query += ' AND e.IDEMPRESA = ?';
            params.push(idFilial);
        }

        query += ' AND dba.STCANCELADO = \'False\' ';
        query += `
            GROUP BY 
                dba.IDDETALHEBALANCOAVULSO, 
                dba.IDEMPRESA, 
                dba.NUMEROCOLETOR, 
                dba.DSCOLETOR, 
                dba.IDPRODUTO, 
                dba.CODIGODEBARRAS, 
                dba.DSPRODUTO, 
                dba.PRECOVENDA, 
                dba.PRECOCUSTO, 
                dba.STCANCELADO,
                e.NOFANTASIA
        `;


        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);


        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result,
        };
    } catch (error) {
        console.error('Erro ao executar a consulta Detalhe Balanco Avulso:', error);
        throw error;
    }
};


export const getIncluirDetalhes = async (listaDetalhe, idResumoBalanco) => {
    try {


        let insertQuery = `
            INSERT INTO "${databaseSchema}"."DETALHEBALANCO" (
                "IDRESUMOBALANCO", "NUMEROCOLETOR", "IDPRODUTO", "CODIGODEBARRAS", "DSPRODUTO", 
                "TOTALCONTAGEMATUAL", "TOTALCONTAGEMGERAL", "PRECOCUSTO", "PRECOVENDA", "STCANCELADO", 
                "DSCOLETOR"
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'False', ?)
        `;
        
        let updateQuery = `
            UPDATE "${databaseSchema}"."DETALHEBALANCO" 
            SET "TOTALCONTAGEMGERAL" = "TOTALCONTAGEMGERAL" + ? 
            WHERE "STCANCELADO" = 'False' 
            AND "NUMEROCOLETOR" = ? 
            AND "IDPRODUTO" = ? 
            AND "IDRESUMOBALANCO" = ?
        `;
    

        const insertStmt = await conn.prepare(insertQuery);
        const updateStmt = await conn.prepare(updateQuery);
    

        for(let registro of listaDetalhe) {
            const recordExistsQuery = `
                SELECT COUNT(1) AS "count" 
                FROM "${databaseSchema}"."DETALHEBALANCO"
                WHERE "STCANCELADO" = 'False' 
                AND "IDRESUMOBALANCO" = ? 
                AND "NUMEROCOLETOR" = ? 
                AND "IDPRODUTO" = ?
            `;
            const [recordExists] = await conn.execute(recordExistsQuery, [idResumoBalanco, registro.NUMEROCOLETOR, registro.IDPRODUTO]);

            if (recordExists.count > 0) {
                await updateStmt.execute([
                    registro.TOTALCONTAGEMGERAL,
                    registro.NUMEROCOLETOR,
                    registro.IDPRODUTO,
                    idResumoBalanco
                ]);
            } else {
                await insertStmt.execute([
                    idResumoBalanco,
                    registro.NUMEROCOLETOR,
                    registro.IDPRODUTO,
                    registro.CODIGODEBARRAS,
                    registro.DSPRODUTO,
                    registro.TOTALCONTAGEMATUAL,
                    registro.TOTALCONTAGEMGERAL,
                    registro.PRECOCUSTO,
                    registro.PRECOVENDA,
                    registro.DSCOLETOR || ''
                ]);
            }
        }

        await insertStmt.close();
        await updateStmt.close();

        await conn.commit();
    } catch (error) {
        console.error('Erro ao executar a consulta Detalhe Balanco Avulso:', error);
        throw error;
    }
};

export const putDetalheBalancoAvulso = async (detalhes) => {
    try {
        const totalContagemGeral = parseInt(detalhes[0].TOTALCONTAGEMGERAL);
        const idEmpresa = parseInt(detalhes[0].IDEMPRESA);
        const numeroColetor = parseInt(detalhes[0].NUMEROCOLETOR);
        const idProduto = detalhes[0].IDPRODUTO;

        if (totalContagemGeral === 0) {
            let deleteQuery = `
                DELETE FROM "${databaseSchema}"."DETALHEBALANCOAVULSO"
                WHERE "STCANCELADO" = 'False'
                AND "NUMEROCOLETOR" = ?
                AND "IDPRODUTO" = ?
                AND "IDEMPRESA" = ?
            `;
            console.log(numeroColetor, idProduto, idEmpresa);
                   console.log(deleteQuery);
            await conn.execute(deleteQuery, [numeroColetor, idProduto, idEmpresa]);
            await conn.commit();
        } else {
            let updateQuery = `
                UPDATE "${databaseSchema}"."DETALHEBALANCOAVULSO"
                SET "TOTALCONTAGEMGERAL" = ?
                WHERE "STCANCELADO" = 'False'
                AND "IDEMPRESA" = ?
                AND "NUMEROCOLETOR" = ?
                AND "IDPRODUTO" = ?
            `;

            console.log(updateQuery);
            await conn.execute(updateQuery, [totalContagemGeral, idEmpresa, numeroColetor, idProduto]);
            await conn.commit();
        }

        return {
            status: 'success',
            message: 'Detalhes do balanço Avulso atualizados com sucesso'
        };
    } catch (error) {
        console.error('Erro ao executar a atualização do Detalhe Balanco Avulso:', error);
        throw error;
    }
}

export const createDetalheBalancoAvulso = async (bodyJson) => {
    try {
     
        if (bodyJson[0].INSBALANCO === 1) {
            
            const idResumoBalancoQuery = `
                SELECT "IDRESUMOBALANCO" FROM "${databaseSchema}"."RESUMOBALANCO"
                WHERE "IDEMPRESA" = ? AND "STATIVO" = 'True'
            `;
            const [idResumoBalanco] = await conn.execute(idResumoBalancoQuery, [bodyJson[0].IDEMPRESA]);

           
            if (idResumoBalanco.length === 0) {
                const newIdResumoBalancoQuery = `
                    SELECT IFNULL(MAX(TO_INT("IDRESUMOBALANCO")), 0) + 1 
                    FROM "${databaseSchema}"."RESUMOBALANCO"
                `;
                const [[{ MAX: queryId }]] = await conn.execute(newIdResumoBalancoQuery);

                const insertResumoQuery = `
                    INSERT INTO "${databaseSchema}"."RESUMOBALANCO" (
                        "IDRESUMOBALANCO", "IDEMPRESA", "DSRESUMOBALANCO", "DTABERTURA", "DTFECHAMENTO", 
                        "QTDTOTALITENS", "QTDTOTALSOBRA", "QTDTOTALFALTA", "TXTOBSERVACAO", "STATIVO", 
                        "STCANCELADO", "STCONCLUIDO", "STCONSOLIDADO"
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'False', 'False', 'False')
                `;
                const insertResumoStmt = await conn.prepare(insertResumoQuery);

                
                for (let registro of bodyJson) {
                    await insertResumoStmt.execute([
                        queryId,
                        registro.IDEMPRESA,
                        registro.DSRESUMOBALANCO,
                        registro.DTABERTURA,
                        registro.DTFECHAMENTO || null,
                        registro.QTDTOTALITENS,
                        registro.QTDTOTALSOBRA,
                        registro.QTDTOTALFALTA,
                        registro.TXTOBSERVACAO,
                        registro.STATIVO
                    ]);

                    await getIncluirDetalhes(conn, registro.det, queryId);
                }

                await insertResumoStmt.close();
            } else {
                
                await getIncluirDetalhes(connection, bodyJson[0].det, idResumoBalanco[0].IDRESUMOBALANCO);
            }

            const updateQuery = `
                UPDATE "${databaseSchema}"."DETALHEBALANCOAVULSO"
                SET "STCANCELADO" = ?
                WHERE "STCANCELADO" = 'False' AND "IDEMPRESA" = ? AND "NUMEROCOLETOR" = ?
            `;
            await conn.execute(updateQuery, ['True', bodyJson[0].IDEMPRESA, bodyJson[0].det[0].NUMEROCOLETOR]);
        } else {
            
            const insertDetalheQuery = `
                INSERT INTO "${databaseSchema}"."DETALHEBALANCOAVULSO" (
                    "IDDETALHEBALANCOAVULSO", "IDEMPRESA", "NUMEROCOLETOR", "DSCOLETOR", "IDPRODUTO", 
                    "CODIGODEBARRAS", "DSPRODUTO", "TOTALCONTAGEMGERAL", "PRECOCUSTO", "PRECOVENDA", "STCANCELADO"
                ) VALUES (QUALITY_CONC.SEQ_DETALHEBALANCOAVULSO.NEXTVAL, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'False')
            `;

            const insertDetalheStmt = await conn.prepare(insertDetalheQuery);
            await insertDetalheStmt.execute([
                bodyJson[0].IDEMPRESA,
                bodyJson[0].NUMEROCOLETOR,
                bodyJson[0].DSCOLETOR || '',
                bodyJson[0].IDPRODUTO,
                bodyJson[0].CODIGODEBARRAS,
                bodyJson[0].DSPRODUTO,
                bodyJson[0].TOTALCONTAGEMGERAL,
                bodyJson[0].PRECOCUSTO,
                bodyJson[0].PRECOVENDA
            ]);

            await insertDetalheStmt.close();
        }

        
        await conn.commit();

        return {
            msg: "Inclusão realizada com sucesso!"
        };
    } catch (error) {
        await conn.rollback();
        console.error('Erro ao executar a inserção ou atualização do Detalhe Balanco Avulso:', error);
        throw error;
    } finally {
        await conn.release();
    }
}


export const handlePostDetalheBalancoAvulso = async (bodyJson) => {
    const connection = await conn.getConnection();
    try {
        // Check if the first entry requires inserting into RESUMOBALANCO
        if (bodyJson[0].INSBALANCO === 1) {
            // Check if there is an active RESUMOBALANCO for the given company
            const idResumoBalancoQuery = `
                SELECT "IDRESUMOBALANCO" FROM "${databaseSchema}"."RESUMOBALANCO"
                WHERE "IDEMPRESA" = ? AND "STATIVO" = 'True'
            `;
            const [idResumoBalanco] = await connection.execute(idResumoBalancoQuery, [bodyJson[0].IDEMPRESA]);

            // If no active RESUMOBALANCO found, insert a new one
            if (idResumoBalanco.length === 0) {
                const newIdResumoBalancoQuery = `
                    SELECT IFNULL(MAX(TO_INT("IDRESUMOBALANCO")), 0) + 1 
                    FROM "${databaseSchema}"."RESUMOBALANCO"
                `;
                const [[{ MAX: queryId }]] = await connection.execute(newIdResumoBalancoQuery);

                const insertResumoQuery = `
                    INSERT INTO "${databaseSchema}"."RESUMOBALANCO" (
                        "IDRESUMOBALANCO", "IDEMPRESA", "DSRESUMOBALANCO", "DTABERTURA", "DTFECHAMENTO", 
                        "QTDTOTALITENS", "QTDTOTALSOBRA", "QTDTOTALFALTA", "TXTOBSERVACAO", "STATIVO", 
                        "STCANCELADO", "STCONCLUIDO", "STCONSOLIDADO"
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'False', 'False', 'False')
                `;
                const insertResumoStmt = await connection.prepare(insertResumoQuery);

                // Insert the new RESUMOBALANCO entry for each item in the bodyJson array
                for (let registro of bodyJson) {
                    await insertResumoStmt.execute([
                        queryId,
                        registro.IDEMPRESA,
                        registro.DSRESUMOBALANCO,
                        registro.DTABERTURA,
                        registro.DTFECHAMENTO || null,
                        registro.QTDTOTALITENS,
                        registro.QTDTOTALSOBRA,
                        registro.QTDTOTALFALTA,
                        registro.TXTOBSERVACAO,
                        registro.STATIVO
                    ]);

                    await insertDetalhes(connection, registro.det, queryId);
                }

                await insertResumoStmt.close();
            } else {
                // If an active RESUMOBALANCO is found, insert the details
                await insertDetalhes(connection, bodyJson[0].det, idResumoBalanco[0].IDRESUMOBALANCO);
            }

            // Update DETALHEBALANCOAVULSO to mark as canceled
            const updateQuery = `
                UPDATE "${databaseSchema}"."DETALHEBALANCOAVULSO"
                SET "STCANCELADO" = ?
                WHERE "STCANCELADO" = 'False' AND "IDEMPRESA" = ? AND "NUMEROCOLETOR" = ?
            `;
            await connection.execute(updateQuery, ['True', bodyJson[0].IDEMPRESA, bodyJson[0].det[0].NUMEROCOLETOR]);
        } else {
            // Insert into DETALHEBALANCOAVULSO if not INS BALANCO
            const insertDetalheQuery = `
                INSERT INTO "${databaseSchema}"."DETALHEBALANCOAVULSO" (
                    "IDDETALHEBALANCOAVULSO", "IDEMPRESA", "NUMEROCOLETOR", "DSCOLETOR", "IDPRODUTO", 
                    "CODIGODEBARRAS", "DSPRODUTO", "TOTALCONTAGEMGERAL", "PRECOCUSTO", "PRECOVENDA", "STCANCELADO"
                ) VALUES (QUALITY_CONC.SEQ_DETALHEBALANCOAVULSO.NEXTVAL, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'False')
            `;

            const insertDetalheStmt = await connection.prepare(insertDetalheQuery);
            await insertDetalheStmt.execute([
                bodyJson[0].IDEMPRESA,
                bodyJson[0].NUMEROCOLETOR,
                bodyJson[0].DSCOLETOR || '',
                bodyJson[0].IDPRODUTO,
                bodyJson[0].CODIGODEBARRAS,
                bodyJson[0].DSPRODUTO,
                bodyJson[0].TOTALCONTAGEMGERAL,
                bodyJson[0].PRECOCUSTO,
                bodyJson[0].PRECOVENDA
            ]);

            await insertDetalheStmt.close();
        }

        // Commit all changes
        await connection.commit();

        return {
            msg: "Inclusão realizada com sucesso!"
        };
    } catch (error) {
        await connection.rollback();
        console.error('Erro ao executar a inserção ou atualização do Detalhe Balanco Avulso:', error);
        throw error;
    } finally {
        await connection.release();
    }
};

// export const handlePutDetalheBalancoAvulso = async (bodyJson) => {
//     const connection = await conn.getConnection();
//     try {
//         // Parse the values from the request body
//         const pTotalContagemGeral = parseInt(bodyJson.TOTALCONTAGEMGERAL);
//         const pIdEmpresa = parseInt(bodyJson.IDEMPRESA);
//         const pNumeroColetor = parseInt(bodyJson.NUMEROCOLETOR);
//         const pIdProduto = bodyJson.IDPRODUTO;

//         // Case when TOTALCONTAGEMGERAL is 0: perform DELETE
//         if (pTotalContagemGeral === 0) {
//             const deleteQuery = `
//                 DELETE FROM "${databaseSchema}"."DETALHEBALANCOAVULSO"
//                 WHERE "STCANCELADO" = 'False'
//                 AND "NUMEROCOLETOR" = ?
//                 AND "IDPRODUTO" = ?
//                 AND "IDEMPRESA" = ?
//             `;

//             // Execute DELETE statement
//             await connection.execute(deleteQuery, [pNumeroColetor, pIdProduto, pIdEmpresa]);
//             await connection.commit();

//         } else {
//             // Case when TOTALCONTAGEMGERAL is not 0: perform UPDATE
//             const updateQuery = `
//                 UPDATE "${databaseSchema}"."DETALHEBALANCOAVULSO"
//                 SET "TOTALCONTAGEMGERAL" = ?
//                 WHERE "STCANCELADO" = 'False'
//                 AND "IDEMPRESA" = ?
//                 AND "NUMEROCOLETOR" = ?
//                 AND "IDPRODUTO" = ?
//             `;

//             // Execute UPDATE statement
//             await connection.execute(updateQuery, [pTotalContagemGeral, pIdEmpresa, pNumeroColetor, pIdProduto]);
//             await connection.commit();
//         }

//         return {
//             msg: "Atualização realizada com sucesso!"
//         };

//     } catch (error) {
//         await connection.rollback();
//         console.error('Erro ao executar a atualização do Detalhe Balanco Avulso:', error);
//         throw error;
//     } finally {
//         await connection.release();
//     }
// };
