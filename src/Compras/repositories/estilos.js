// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getEstilos = async (idEstilo, idGrupoEstilo, descEstilo, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                A.IDESTILO ID_ESTILOS, 
                A.DSESTILO DS_ESTILOS, 
                A.STATIVO, 
                B.IDVINCESTILOSESTRUTURA, 
                B.IDGRUPOESTRUTURA ID_GRUPOESTILOS, 
                C.DSGRUPOESTRUTURA DS_GRUPOESTILOS, 
                C.CODGRUPOESTRUTURA COD_GRUPOESTILOS 
            FROM "${databaseSchema}".ESTILOS A 
            INNER JOIN "${databaseSchema}".VINCESTILOSGRUPOESTRUTURA B on A.IDESTILO = B.IDESTILO
            INNER JOIN "${databaseSchema}".GRUPOESTRUTURA C on B.IDGRUPOESTRUTURA = C.IDGRUPOESTRUTURA
            WHERE 1 = 1
          
        `;

        const params = [];

        if (idEstilo) {
            query += 'AND A.IDESTILO = ? ';
            params.push(idEstilo);
        }
    
        if(idGrupoEstilo) {
            query += 'AND B.IDGRUPOESTRUTURA = ? ';
            params.push(idGrupoEstilo);
        }

        if(descEstilo) {
            query += 'AND A.DSESTILO LIKE ? ';
            params.push(`%${descEstilo}%`);
        }

        query += 'ORDER BY B."IDGRUPOESTRUTURA", A."IDESTILO"'
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
        }

    } catch (error) {
        console.error('Erro ao consultar Estilos:', error);
        throw error;
    }
}

export const updateEstilo = async (dados) => {
    try {
        const queryUpdate = `
            UPDATE "${databaseSchema}"."ESTILOS" SET 
            "DSESTILO" = ?, 
            "STATIVO" = ? 
            WHERE "IDESTILO" = ?
        `;

        const queryAtualizaVinculoEstilo = `
            UPDATE "${databaseSchema}"."VINCESTILOSGRUPOESTRUTURA" SET 
                "IDGRUPOESTRUTURA" = ? 
            WHERE "IDVINCESTILOSESTRUTURA" = ?
        `;

        const statementVinculo = await conn.prepare(queryAtualizaVinculoEstilo);

        const statementEstilo = await conn.prepare(queryUpdate);

        for (const registro of dados) {
            await statementVinculo.exec([
                registro.IDGRUPOESTRUTURA,
                registro.IDVINCESTILOSESTRUTURA,
            ]);

            
            await statementEstilo.exec([
                registro.DSESTILO,
                registro.STATIVO,
                registro.IDESTILO,
            ]);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Atualização do Estilo Realizada com sucesso',
        };
    } catch (e) {
        throw new Error(`Erro ao atualizar Estilo: ${e.message}`);
    }
};



// export const createEstilo = async (dados) => {
//     try {
//         const queryIdEstilo = `
//             SELECT IFNULL(MAX(TO_INT("IDESTILO")),0) + 1 FROM "${databaseSchema}"."ESTILOS" WHERE 1 = ? 
//         `;
//         const queryIdVinculo = `
//             SELECT IFNULL(MAX(TO_INT("IDVINCESTILOSESTRUTURA")),0) + 1 FROM "${databaseSchema}"."VINCESTILOSGRUPOESTRUTURA" WHERE 1 = ?
//         `;
//         const insertEstiloQuery = `
//             INSERT INTO "${databaseSchema}"."ESTILOS" 
//             ( 
//                 "IDESTILO", 
//                 "DSESTILO", 
//                 "STATIVO" 
//             ) 
//             VALUES(?,?,?)
//         `;
            
//         const insertVinculoQuery = `
//             INSERT INTO "${databaseSchema}"."VINCESTILOSGRUPOESTRUTURA" 
//             ( 
//             "IDVINCESTILOSESTRUTURA", 
//             "IDESTILO", 
//             "IDGRUPOESTRUTURA", 
//             "STATIVO" 
//             ) 
//             VALUES(?,?,?,?)
//         `;
//             const statementIdEstilo = await conn.prepare(queryIdEstilo);
//             const statementIdVinculo = await conn.prepare(queryIdVinculo);
//             const statementEstilo = await conn.prepare(insertEstiloQuery);
//             const statementVinculo = await conn.prepare(insertVinculoQuery);
            

//         for (const registro of dados) {

//             const idEstilo = await statementIdEstilo.exec([1]);
//             const idVinculo = await statementIdVinculo.exec([1]);
            
//             const paramsStilo = [
//                 idEstilo,
//                 registro.DSESTILO,
//                 registro.STATIVO,
//             ];

//             const paramsVinculo = [
//                 idVinculo,
//                 idEstilo,                  
//                 registro.IDGRUPOESTRUTURA,
//                 registro.STATIVO,
//             ]
//             console.log(paramsStilo);
//             console.log(paramsVinculo);
//             await statementEstilo.exec(paramsStilo);

//             await statementVinculo.exec(paramsVinculo);
//         }

//         conn.commit();
//         return {
//             status: 'success',
//             message: 'Estilo Criado com sucesso',
//             data: dados
//         };
//     } catch (e) {
//         throw new Error(`Erro ao Criar Estilo: ${e.message}`);
//     }
// };



export const createEstilo = async (dados) => {
    try {
        // Queries
        const queryIdEstilo = `
            SELECT IFNULL(MAX(TO_INT("IDESTILO")),0) + 1 FROM "${databaseSchema}"."ESTILOS" WHERE 1 = ? 
        `;
        const queryIdVinculo = `
            SELECT IFNULL(MAX(TO_INT("IDVINCESTILOSESTRUTURA")),0) + 1 FROM "${databaseSchema}"."VINCESTILOSGRUPOESTRUTURA" WHERE 1 = ? 
        `;
        const insertEstiloQuery = `
            INSERT INTO "${databaseSchema}"."ESTILOS" 
            ("IDESTILO", "DSESTILO", "STATIVO") 
            VALUES (?, ?, ?)
        `;
        const insertVinculoQuery = `
            INSERT INTO "${databaseSchema}"."VINCESTILOSGRUPOESTRUTURA" 
            ("IDVINCESTILOSESTRUTURA", "IDESTILO", "IDGRUPOESTRUTURA", "STATIVO") 
            VALUES (?, ?, ?, ?)
        `;

        // Statements
        const statementIdEstilo = await conn.prepare(queryIdEstilo);
        const statementIdVinculo = await conn.prepare(queryIdVinculo);
        const statementEstilo = await conn.prepare(insertEstiloQuery);
        const statementVinculo = await conn.prepare(insertVinculoQuery);

        // Processamento dos registros
        for (const registro of dados) {
            // Obtenção dos IDs
            const idEstiloResult = await statementIdEstilo.exec([1]);
            const idVinculoResult = await statementIdVinculo.exec([1]);
            const idEstilo = idEstiloResult[0][0]; // Extração do valor
            const idVinculo = idVinculoResult[0][0]; // Extração do valor

            // Parâmetros para as queries
            const paramsEstilo = [idEstilo, registro.DSESTILO, registro.STATIVO];
            const paramsVinculo = [idVinculo, idEstilo, registro.IDGRUPOESTRUTURA, registro.STATIVO];

            // Execução das queries
            await statementEstilo.exec(paramsEstilo);
            await statementVinculo.exec(paramsVinculo);
        }

        // Commit das alterações
        await conn.commit();

        // Fechamento de statements
        await statementIdEstilo.close();
        await statementIdVinculo.close();
        await statementEstilo.close();
        await statementVinculo.close();

        return {
            status: 'success',
            message: 'Estilo criado com sucesso!',
            data: dados,
        };
    } catch (e) {
        // Log do erro detalhado
        console.error(`Erro ao criar estilo: ${e.message}`, e);
        throw new Error(`Erro ao criar estilo: ${e.message}`);
    }
};
