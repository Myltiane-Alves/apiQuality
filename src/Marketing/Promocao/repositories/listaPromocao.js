// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;


export const getPromocao = async (idResumoPromocao, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        var query = `
            SELECT 
            tbrp.IDRESUMOPROMO,
            tbrp.DSPROMO,
            tbrp.STATIVO
            FROM 
            "${databaseSchema}".RESUMOPROMOCAO tbrp
            WHERE 
            1 = ?
            AND tbrp.STATIVO='True'
        `;

        const params = [1];

        if(idResumoPromocao) {
            query += `AND tbrp.IDRESUMOPROMO = ?`;
            params.push(idResumoPromocao);
        }

        query += ` ORDER BY tbrp.IDRESUMOPROMO`;

        query += ` LIMIT ? OFFSET ?`;
        params.push(pageSize, (page - 1) * pageSize);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page,
            pageSize,
            rows: result.length,
            data: result,
        }
    } catch(error) {
        console.error('Erro ao executar a consulta Lista Caixas', error);
        throw error;
    }
}

export const updatePromocao = async (dados) => {
    try {
        
        const query = `
            UPDATE "${databaseSchema}".RESUMOPROMOCAO SET 
            "STATIVO" = ? 
            WHERE "IDRESUMOPROMO" = ? 
        `;

        const statement = await conn.prepare(query);

        for(const registro of dados) {
          
            const params = [
                registro.STATIVO,
                registro.IDRESUMOPROMO,
            ]
            await statement.exec(params);
        }
        
        conn.commit();
        return {
            status: 'success',
            message: 'Promoção atualizadas com sucesso'
        }
    } catch (error) {
        console.error('Erro ao executar a atualização da promoção:', error);
        throw error;
    }
}