// import conn from "../../../config/dbConnection.js";
const databaseSchema = process.env.HANA_DATABASE;

export const getVendasPagamento = async (idVenda,  page, pageSize) => {
    try {
        
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                IDVENDA, 
                DSTIPOPAGAMENTO, 
                VALORRECEBIDO, 
                VALORDEDUZIDO, 
                VALORLIQUIDO, 
                DTPROCESSAMENTO, 
                IFNULL(NPARCELAS, 0) AS NPARCELAS, 
                NOTEF, 
                NOAUTORIZADOR, 
                NUAUTORIZACAO, 
                STCANCELADO 
            FROM 
            "${databaseSchema}".VENDAPAGAMENTO 
            WHERE 
            1 = 1 
        `;
        
        const params = [];

        if(idVenda) {
            query += ' AND IDVENDA = ?';
            params.push(idVenda);
        }

    
        query += ' ORDER BY NPARCELAS';

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
        console.error('Erro ao executar a consulta Vendas Pagamentos:', error);
        throw error;
    }
};
