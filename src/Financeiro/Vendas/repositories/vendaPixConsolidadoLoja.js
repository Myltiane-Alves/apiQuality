// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getVendaPixConsolidadoLoja = async (idMarca, idLoja, empresaLista, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        
        let query = `
            SELECT 
                tbe.NOFANTASIA,
                IFNULL(SUM(tbvp.VALORRECEBIDO), 0) AS PIX
            FROM 
                "${databaseSchema}".VENDA tbv
                INNER JOIN "${databaseSchema}".VENDAPAGAMENTO tbvp on tbv.IDVENDA = tbvp.IDVENDA
                INNER JOIN "${databaseSchema}".EMPRESA tbe on tbv.IDEMPRESA = tbe.IDEMPRESA
            WHERE 
                1 = 1
                AND tbv.STCANCELADO = 'False'
                AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL)
                AND tbvp.NOTEF = 'PIX' AND tbvp.DSTIPOPAGAMENTO = 'PIX'
        `;
        
        const params = [];


        if (idMarca == 0) {
            query += ` AND tbe.IDGRUPOEMPRESARIAL IN (1, 2, 3, 4)`;
        } else {
            query += ` AND tbe.IDGRUPOEMPRESARIAL = ?`;
            params.push(idMarca);
        }

        if (idLoja > 0) {
            query += ` AND tbe.IDEMPRESA = ?`;
            params.push(idLoja);
        }


        if (empresaLista) {
            const empresaList = empresaLista.split(',').map(emp => `'${emp.trim()}'`).join(',');
            query += ` AND tbe.IDEMPRESA IN (${empresaList})`;
        }

    
        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ` AND (tbv.DTHORAFECHAMENTO BETWEEN ? AND ?)`;
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        query += ` GROUP BY tbe.NOFANTASIA`;
        query += ` ORDER BY tbe.NOFANTASIA`;


        const offset = (page - 1) * pageSize;
        query += ` LIMIT ? OFFSET ?`;
        params.push(pageSize, offset);

       
        const statement = conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result,
        }
    } catch (e) {
        throw new Error(e.message);
    }
};
