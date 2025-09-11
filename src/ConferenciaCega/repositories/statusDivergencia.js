// import conn from '../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getStatusDivergencia = async (idResumoOT,  pageSize, page) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

     
        let query = `
            SELECT 
                sd.IDSTATUSDIVERGENCIA,
                sd.DESCRICAODIVERGENCIA,
                IFNULL(TO_VARCHAR(sd.DATACRIACAO,'YYYY-MM-DD HH24:MI:SS'), '') AS DATACRIACAO,
                IFNULL(TO_VARCHAR(sd.DATACRIACAO,'DD/MM/YYYY'), 'Não Informado') AS DATACRIACAOFORMATADA,
                sd.IDUSRCRIACAO,
                sd.STATIVO
            FROM "${databaseSchema}".STATUSDIVERGENCIA sd
            WHERE 1 = 1
        `;

        const params = [];

        if (idResumoOT) {
            query += 'AND IDRESUMOOT = ? ';
            params.push(idResumoOT);
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
        console.error('Erro ao executar consulta Status divergente', error);
        throw error;
    }
};

export const updateStatusDivergencia = async (dados) => {
    try {
        const query = `
            UPDATE "${databaseSchema}"."STATUSDIVERGENCIA"
            SET "DESCRICAODIVERGENCIA" = ?, 
            "STATIVO" = ?
            WHERE "IDSTATUSDIVERGENCIA" = ?
        `;

        const statement = await conn.prepare(query);

        for (const dado of dados) {
            const params = [
                dado.DESCRICAODIVERGENCIA,
                dado.STATIVO,
                dado.IDSTATUSDIVERGENCIA
            ];
            
            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Status divergencia atualizado com sucesso',
        };
    } catch (e) {
        throw new Error(`Erro ao atualizar Status Divergencia: ${e.message}`);
    }
};

export const createStatusDivergencia = async (dados) => {
    try {
        const query = `
            INSERT INTO "${databaseSchema}"."STATUSDIVERGENCIA" 
                ("IDSTATUSDIVERGENCIA", "DESCRICAODIVERGENCIA", "DATACRIACAO", "IDUSRCRIACAO", "STATIVO") 
            VALUES (${databaseSchema}.SEQ_STATUSDIVERGENCIA.NEXTVAL, ?, NOW(), ?, ?)
        `;

        const statement = await conn.prepare(query);

        for (const dado of dados) {
            const params = [
                dado.DESCRICAODIVERGENCIA,
                dado.IDUSRCRIACAO,
                dado.STATIVO,
            ];
            
            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Status divergencia criado com sucesso',
        };
    } catch (e) {
        throw new Error(`Erro ao criar Status Divergencia: ${e.message}`);
    }
};