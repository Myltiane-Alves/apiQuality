// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getFaturaPixPeriodo = async (idMarca, dataPesquisaInicio, dataPesquisaFim, idLojaPesquisa, empresaLista, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                tbdf.IDDETALHEFATURA,
                tbdf.IDEMPRESA,
                tbe.NOFANTASIA,
                tbdf.IDFUNCIONARIO,
                tbdf.IDDETALHEFATURALOCAL,
                tbdf.IDCAIXAWEB,
                tbdf.IDCAIXALOCAL,
                tbdf.NUESTABELECIMENTO,
                tbdf.NUCARTAO,
                TO_VARCHAR(tbdf.DTPROCESSAMENTO, 'DD-MM-YYYY') AS DTPROCESSAMENTO,
                TO_VARCHAR(tbdf.HRPROCESSAMENTO, 'HH24:MI:SS') AS HRPROCESSAMENTO,
                tbdf.NUNSU,
                tbdf.NUNSUHOST,
                tbdf.NUCODAUTORIZACAO,
                tbdf.VRRECEBIDO,
                TO_VARCHAR(tbdf.DTHRMIGRACAO, 'YYYY-MM-DD HH24:MI:SS') AS DTHRMIGRACAO,
                tbdf.STCANCELADO,
                tbdf.IDUSRCACELAMENTO,
                tbf.NOFUNCIONARIO,
                tbc.DSCAIXA,
                tbdf.IDMOVIMENTOCAIXAWEB,
                tbdf.TXTMOTIVOCANCELAMENTO,
                tbdf.STPIX,
                tbdf.NUAUTORIZACAO,
                tbmc.STCONFERIDO
            FROM 
                "${databaseSchema}".DETALHEFATURA tbdf
                INNER JOIN "${databaseSchema}".CAIXA tbc ON tbc.IDCAIXAWEB = tbdf.IDCAIXAWEB
                LEFT JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbdf.IDFUNCIONARIO = tbf.IDFUNCIONARIO
                LEFT JOIN "${databaseSchema}".MOVIMENTOCAIXA tbmc ON tbdf.IDMOVIMENTOCAIXAWEB = tbmc.ID
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

        if (idLojaPesquisa && idLojaPesquisa.length > 0) {
            query += ` AND tbe.IDEMPRESA IN (${idLojaPesquisa.join(",")})`;
        }

        if (empresaLista && empresaLista.length > 0) {
            query += ` AND tbe.IDEMPRESA IN (${empresaLista.join(",")})`;
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ` AND (tbdf.DTPROCESSAMENTO BETWEEN ? AND ?)`;
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        query += ` ORDER BY tbe.NOFANTASIA, tbdf.DTPROCESSAMENTO`;

        const offset = (page - 1) * pageSize;
        query += ` LIMIT ? OFFSET ?`;
        params.push(pageSize, offset);

        const statement = conn.prepare(query);
        const result = await statement.exec(params);
  
        return {
            page,
            pageSize,
            rows: result.length,
            data: result
        };
    } catch (e) {
        throw new Error(e.message);
    }
};
