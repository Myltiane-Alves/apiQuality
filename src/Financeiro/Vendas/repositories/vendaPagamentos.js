// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getVendasPagamentos = async (idEmpresa, dataPesquisa, page, pageSize) => {
    try {
        
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

   
        let query = `
            SELECT 
                tbe.IDEMPRESA,
                tbe.NOFANTASIA,
                tbvp.NOAUTORIZADOR,
                UPPER(tbvp.DSTIPOPAGAMENTO) AS DSTIPOPAGAMENTO,
                COUNT(1) AS QTDE,
                IFNULL(SUM(tbvp.VALORRECEBIDO), 0) AS VALORRECEBIDO
            FROM 
                ${databaseSchema}.VENDAPAGAMENTO tbvp
            INNER JOIN 
                ${databaseSchema}.VENDA tbv ON tbvp.IDVENDA = tbv.IDVENDA
            INNER JOIN 
                ${databaseSchema}.EMPRESA tbe ON tbe.IDEMPRESA = tbv.IDEMPRESA
            WHERE 
                1 = ? 
                AND tbv.STCANCELADO = 'False' 
                AND tbvp.DSTIPOPAGAMENTO NOT IN ('DINHEIRO', 'Voucher', 'Vale Funcionário')
        `;


        const params = [1];

    
        if (idEmpresa > 0) {
            query += ' AND tbv.IDEMPRESA = ?';
            params.push(idEmpresa);
        }


        if (dataPesquisa) {
            query += ' AND (tbv.DTHORAFECHAMENTO BETWEEN ? AND ?)';
            params.push(`${dataPesquisa} 00:00:00`, `${dataPesquisa} 23:59:59`);
        }


        query += ` GROUP BY tbe.IDEMPRESA, tbe.NOFANTASIA, tbvp.NOAUTORIZADOR, tbvp.DSTIPOPAGAMENTO`;
        query += ` ORDER BY tbe.IDEMPRESA`;

        query += ` LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;
        const statement = conn.prepare(query);
        const result = await statement.execute(params);

        return {
            page,
            pageSize,
            rows: result.length,
            data: result
        };
    } catch (e) {
        console.error('Erro ao executar a consulta de vendas:', e);
        throw new Error(e.toString());
    } 
};
