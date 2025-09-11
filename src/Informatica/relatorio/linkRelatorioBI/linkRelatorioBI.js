// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getLinkRelatorioBI = async (idRelatorio, idEmpresa, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                lrbi.IDRELATORIOBI, lrbi.IDEMPRESA, lrbi.LINK, lrbi.STATIVO, 
                rbi.IDRELATORIOBI, rbi.DSRELATORIOBI, 
                e.NOFANTASIA 
            FROM "${databaseSchema}".LINKRELATORIOBI lrbi 
                JOIN "${databaseSchema}".RELATORIOBI rbi ON rbi.IDRELATORIOBI = lrbi.IDRELATORIOBI 
                JOIN "${databaseSchema}".EMPRESA e ON e.IDEMPRESA = lrbi.IDEMPRESA 
            WHERE 1 = ? 
        `;

        const params = [1];
        
        if(idRelatorio) {
            query += ' AND lrbi.IDRELATORIOBI = ?';
            params.push(idRelatorio);
        }

        if(idEmpresa) {
            query += ' AND lrbi.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        query += ` LIMIT ? OFFSET ?`;
        params.push(pageSize, (page - 1) * pageSize);

        const statement = await conn.prepare(query);
        const result = await statement.execute(params);
      
        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result
        };
    } catch (e) {
        console.error('Erro ao executar a consulta do link relatório do BI:', e);
        throw new Error('Erro ao executar a consulta do link relatório do BI');
    }
};

export const updateLinkRelatarioBI = async (dados) => {
    try {
            
        let query = `
            UPDATE "${databaseSchema}"."LINKRELATORIOBI" 
            SET 
                "IDRELATORIOBI" = ?, 
                "IDEMPRESA" = ?, 
                "LINK" = ?, 
                "STATIVO" = ? 
            WHERE 
                "IDRELATORIOBI" = ? 
            AND "IDEMPRESA" = ?
        `;

        const statement = await conn.prepare(query);

        for(const registro of dados) {
          
            const params = [
                registro.IDRELATORIOBI,
                registro.IDEMPRESA,
                registro.LINK,
                registro.STATIVO,
                registro.IDRELATORIOBIANTIGO,
                registro.IDEMPRESA,
            ]
            await statement.exec(params);
        }
        
        conn.commit();
        return {
            status: 'success',
            message: 'Atualização do Relatório do Link BI com sucesso'
        }
    } catch (error) {
        console.error('Erro ao executar a atualização do Relatório do Link BI:', error);
        throw error;
    }
}


export const createLinkRelatarioBI = async (dados) => {
    try {
            
        let insertQuery = `
            INSERT INTO "${databaseSchema}"."LINKRELATORIOBI" 
            (
                "IDRELATORIOBI", 
                "IDEMPRESA", 
                "LINK", 
                "STATIVO"
            ) 
            VALUES (?, ?, ?, ?)
        `;

        const insertStatement = await conn.prepare(insertQuery);
        let results = [];
        for(const registro of dados) {
          
            const checkQuery = `
                SELECT COUNT(1) AS COUNT 
                    FROM "${databaseSchema}".LINKRELATORIOBI 
                WHERE IDRELATORIOBI = ? 
                AND IDEMPRESA = ?
            `;

            const ckeckStatement = await conn.prepare(checkQuery);
            const checkResult = await ckeckStatement.execute([registro.IDRELATORIOBI, registro.IDEMPRESA]);

            if(checkResult[0].COUNT > 0) {
                const deleteQuery = `
                    DELETE FROM "${databaseSchema}".LINKRELATORIOBI
                    WHERE IDRELATORIOBI = ?
                    AND IDEMPRESA = ?
                `;

                const deleteStatement = await conn.prepare(deleteQuery);
                await deleteStatement.exec([registro.IDRELATORIOBI, registro.IDEMPRESA]);

                results.push({
                    status: 'success',
                    message: 'Relatório do BI já cadastrado, foi removido para ser cadastrado novamente',
                })
            } else {
                results.push({
                    status: 'success',
                    message: `Novo Relatório do BI cadastrado com sucesso para filial ${registro.IDEMPRESA}`,
                })
            }
            const params = [
                registro.IDRELATORIOBI,
                registro.IDEMPRESA,
                registro.LINK,
                registro.STATIVO,
            ]
           
            await insertStatement.exec(params);
        }
        
        conn.commit();
        return {
            status: 'success',
            message: 'Processo de cadastro do Relatório do BI concluído com sucesso'
        }
    } catch (error) {
        console.error('Erro ao executar a cadastro do Relatório BI:', error);
        throw error;
    }
}