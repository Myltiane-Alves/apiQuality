// import conn from "../../config/dbConnection.js";

export const getLogsUsuarios = async (byId, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {

        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                tbl.IDLOG,
                tbl.IDFUNCIONARIO,
                tbl.PATHFUNCAO,
                tbl.DATALOG,
                tbl.DADOS,
                tbl.IP
            FROM 
                "QUALITY_CONC_HML"."LOG" tbl
            WHERE 
                1 = 1
        `;

        const params = [];

       
        if (byId) {
            query += ` AND tbl.IDLOG = ?`;
            params.push(byId);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
          
            query += ` AND (tbl.DATALOG BETWEEN ? AND ?)`;
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

      
        query += ` ORDER BY tbl.DATALOG DESC LIMIT ? OFFSET ?`;
        const offset = (page - 1) * pageSize;
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page,
            pageSize,
            rows: result.length,
            data: result
        };
    } catch (e) {
        throw new Error(`Erro ao obter logs de usuários: ${e.message}`);
    }
};


export const postLogUsuario = async (logs) => {
    try {
        let query = `
            INSERT INTO "QUALITY_CONC_HML"."LOG" (
            "IDFUNCIONARIO",
            "PATHFUNCAO",
            "DATALOG",
            "DADOS",
            "IP"
            ) VALUES (?, ?, now(), ?, ?);
        `;

        const statement = await conn.prepare(query);

        for (const log of logs) {
            const params = [
                log.IDFUNCIONARIO,
                log.PATHFUNCAO,
                log.DADOS,
                log.IP
            ];
        
            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Log de usuário criado com sucesso!',
            data: logs
        };
    } catch (e) {
        throw new Error(`Erro ao Criar Log: ${e.message}`);
    }
};