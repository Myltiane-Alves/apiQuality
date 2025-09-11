// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getVendasAlloc = async (idEmpresa, status, idVenda, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                MC.IDEMPRESA, 
                MC.IDVENDA, 
                TO_VARCHAR(MC.DTEMVIO, 'DD-MM-YYYY HH24:MI:SS') AS DTEMVIO, 
                TO_VARCHAR(MC.DTVENDA, 'DD-MM-YYYY HH24:MI:SS') AS DTVENDA, 
                IFNULL(MC.IDRETORNOALLOC, 0) AS IDRETORNOALLOC, 
                IFNULL(MC.CUPOM_CODIGO, 0) AS CUPOM_CODIGO, 
                IFNULL(MC.IDRETORNOPAGAMENTO, 0) AS IDRETORNOPAGAMENTO, 
                MC.TXT_VENDA, 
                MC.TXT_PAGAMENTO, 
                MC.TXTRETORNOALLOC, 
                MC.TXTRETORNOERROALLOC, 
                MC.STSTATUS 
            FROM 
            "${databaseSchema}".INTEGRACAOVENDAALLOC MC 
                LEFT JOIN "${databaseSchema}".EMPRESA EMP ON MC.IDEMPRESA = EMP.IDEMPRESA  
                WHERE 1 = ?
          `;

        const params = [1];

        if(idVenda) {
            query += ' AND MC.IDVENDA = ?';
            params.push(idVenda);
        }
        
        if(idEmpresa) {
            query += ' AND MC.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if(status !== 'Todas') {
            query += ' AND MC.STSTATUS = ?';
            params.push(status);
        }


        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND (MC.DTVENDA BETWEEN ? AND ?)';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        const statement = conn.prepare(query);
        const result = await statement.execute(params);

        return {
            page,
            pageSize,
            rows: result.length,
            data: result
        };
    } catch (e) {
        console.error('Erro ao executar a consulta de vendas alloc:', e);
        throw new Error('Erro ao executar a consulta de vendas');
    }
};
