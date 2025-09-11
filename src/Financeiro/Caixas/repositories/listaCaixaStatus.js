// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getCaixaStatus = async (idEmpresa, idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        const offset = (page - 1) * pageSize;

        let query = `
            SELECT
                MC.ID AS IDMOVIMENTO,
                MC.IDCAIXA AS IDCAIXAFECHAMENTO,
                CX.DSCAIXA AS DSCAIXAFECHAMENTO,
                TO_VARCHAR(MC.DTABERTURA, 'DD-MM-YYYY HH24:MI:SS') AS DTHORAABERTURACAIXA,
                TO_VARCHAR(MC.DTFECHAMENTO, 'DD-MM-YYYY HH24:MI:SS') AS DTHORAFECHAMENTOCAIXA,
                FC.NOFUNCIONARIO AS OPERADORFECHAMENTO,
                (MC.VRFISICODINHEIRO) AS TOTALFECHAMENTODINHEIROFISICO,
                (MC.VRRECDINHEIRO) AS TOTALFECHAMENTODINHEIRO,
                IFNULL(MC.VRAJUSTDINHEIRO,0) AS TOTALFECHAMENTODINHEIROAJUSTE,
                (MC.VRRECTEF) AS TOTALFECHAMENTOCARTAO,
                (MC.VRRECPOS) AS TOTALFECHAMENTOPOS,
                (MC.VRRECVOUCHER) AS TOTALFECHAMENTOVOUCHER,
                (MC.VRRECFATURA) AS TOTALFECHAMENTOFATURA,
                (MC.VRRECCONVENIO) AS TOTALFECHAMENTOCONVENIO,
                (MC.VRRECPIX) AS TOTALFECHAMENTOPIX,
                (MC.VRRECPL) AS TOTALFECHAMENTOCPL,
                MC.STCONFERIDO,
                MC.STFECHADO,
                E.NOFANTASIA
            FROM
                "${databaseSchema}".MOVIMENTOCAIXA MC
                LEFT JOIN "${databaseSchema}".CAIXA CX ON MC.IDCAIXA = CX.IDCAIXAWEB
                LEFT JOIN "${databaseSchema}".FUNCIONARIO FC ON MC.IDOPERADOR = FC.IDFUNCIONARIO
                INNER JOIN "${databaseSchema}".EMPRESA E ON E.IDEMPRESA = MC.IDEMPRESA
            WHERE
                1 = ?
            AND MC.STCANCELADO = 'False'
        `;

        const params = [1];

        if (idEmpresa > 0) {
            query += ' AND MC.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (idMarca > 0) {
            query += ' AND E.IDGRUPOEMPRESARIAL = ?';
            params.push(idMarca);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND (MC.DTABERTURA BETWEEN ? AND ?)';
            params.push(dataPesquisaInicio + ' 00:00:00', dataPesquisaFim + ' 23:59:59');
        }

        query += ' ORDER BY MC.DTABERTURA, MC.IDEMPRESA';
        query += ' LIMIT ? OFFSET ?';
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
}


