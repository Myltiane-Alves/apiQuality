// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getFaturaPixConsolidadoLoja = async (idMarca, dataPesquisaInicio, dataPesquisaFim, idLoja, empresaLista, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
          SELECT 
            tbe.NOFANTASIA,
            IFNULL(SUM(tbdf.VRRECEBIDO), 0) AS VRRECEBIDO
        FROM 
            "${databaseSchema}".DETALHEFATURA tbdf
        INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbdf.IDEMPRESA = tbe.IDEMPRESA
            WHERE 
            1 = ? 
            AND tbdf.STCANCELADO = 'False'
            AND tbdf.STPIX = 'True'
        `;

        const params = [1];

        if (idMarca == 0) {
            query += ` AND tbe.IDGRUPOEMPRESARIAL IN (1, 2, 3, 4)`;
        } else {
            query += ` AND tbe.IDGRUPOEMPRESARIAL = ?`;
            params.push(idMarca);
        }
        if (idLoja) {
            if (Array.isArray(idLoja) && idLoja.length > 0) {
            query += ` AND tbe.IDEMPRESA IN (${idLoja.join(",")})`;
            } else {
            query += ` AND tbe.IDEMPRESA = ?`;
            params.push(idLoja);
            }
        }

        if (empresaLista) {
            if (Array.isArray(empresaLista) && empresaLista.length > 0) {
            query += ` AND tbe.IDEMPRESA IN (${empresaLista.join(",")})`;
            } else {
            query += ` AND tbe.IDEMPRESA = ?`;
            params.push(empresaLista);
            }
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ` AND (tbdf.DTPROCESSAMENTO BETWEEN ? AND ?)`;
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        query += ` GROUP BY tbe.NOFANTASIA`;
        query += ` ORDER BY tbe.NOFANTASIA`;
    
        const offset = (page - 1) * pageSize;

        query += ` LIMIT ? OFFSET ?`;
        params.push(pageSize, offset);

      
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result
        };
    } catch (e) {
        throw new Error(e.message);
    }
};
