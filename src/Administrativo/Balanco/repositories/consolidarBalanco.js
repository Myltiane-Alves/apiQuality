// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;


export const getConsolidarBalanco = async (
    idResumo,
    page,
    pageSize
) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        if (!idResumo) {
            throw 'Favor informar o id do resumo';
        }

        let query = `
            SELECT 
                rb.IDRESUMOBALANCO, 
                rb.IDEMPRESA,
                rb.DSRESUMOBALANCO,
                TO_VARCHAR(rb.DTABERTURA, 'DD-MM-YYYY HH24:MI:SS') AS DTABERTURA,
                TO_VARCHAR(rb.DTFECHAMENTO, 'DD-MM-YYYY HH24:MI:SS') AS DTFECHAMENTO,
                rb.QTDTOTALITENS,
                rb.QTDTOTALSOBRA,
                rb.QTDTOTALFALTA,
                rb.TXTOBSERVACAO,
                rb.STATIVO,
                rb.IDUSRFECHAMENTO,
                rb.VRESTOQUEANTERIOR,
                rb.DTESTOQUEANTERIOR,
                rb.QTDTOTALANTERIOR,
                rb.VRTOTALROMANEIO,
                rb.DTPERIODOROMANEIO,
                rb.VRALTAMERCADORIA,
                rb.DTPERIODOALTA,
                rb.SOBRAMERCADORIA,
                rb.DTPERIODOSOBRA,
                rb.TOTALGERALENTRADA,
                rb.VRBAIXAMERCADORIA,
                rb.DTPERIODOBAIXA,
                rb.VRDEVOLUCAOMERCADORIA,
                rb.DTPERIODODEVOLUCAO,
                rb.VRFALTAMERCADORIA,
                rb.DTPERIODOFALTAMERCADORIA,
                rb.VRDESCONTOCAIXA,
                rb.DTPERIODODESCONTOCAIXA,
                rb.VRVENDACAIXA,
                rb.DTPERIODOVENDACAIXA,
                rb.TOTALGERALSAIDA,
                rb.TOTALGERALPRESTARCONTA,
                rb.VRESTOQUEATUAL,
                rb.QTDTOTALENTRADA,
                rb.QTDTOTALDEVOLVIDA,
                rb.QTDTOTALCONTAGEM,
                rb.VRTOTALFALTA,
                rb.DTFALTA,
                rb.PERCFALTA,
                rb.OBSCONTAGEM,
                rb.OBSDIVERGENCIACONTAGEM,
                rb.OBSDIVERGENCIAGERENTE,
                rb.STCANCELADO,
                rb.IDUSRCANCELADO,
                rb.TXTMOTIVOCANCELADO,
                rb.STCONCLUIDO,
                rb.STCONSOLIDADO,
                e.NOFANTASIA
            FROM "${databaseSchema}".RESUMOBALANCO rb
            INNER JOIN "${databaseSchema}".EMPRESA e ON e.IDEMPRESA = rb.IDEMPRESA
            WHERE 1 = ?
        `;

        const params = [1];

        if (idResumo) {
            query += 'AND rb.IDRESUMOBALANCO = ? ';
            params.push(idResumo);
        }

        query += ' AND rb.STCANCELADO = \'False\' ';

        const offset = (page - 1) * pageSize;
        query += 'LIMIT ? OFFSET ? ';
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result,
        }
    } catch (error) {
        console.error('Erro ao executar a consulta Consolidação de Balanco:', error);
        throw error;
    }
}

export const updateConsolidarBalanco = async (resumos) => {
    try {
        const query = `
            UPDATE "${databaseSchema}".RESUMOBALANCO SET 
                VRESTOQUEATUAL = TO_DECIMAL((SELECT IFNULL(SUM(QTD * PRECOVENDA), 0) FROM "${databaseSchema}".PREVIABALANCO WHERE IDRESUMOBALANCO = ? )), 
                QTDTOTALANTERIOR = TO_INT((SELECT IFNULL(SUM(QTDFINAL), 0) FROM "${databaseSchema}".PREVIABALANCO WHERE IDRESUMOBALANCO = ? )), 
                QTDTOTALCONTAGEM = TO_INT((SELECT IFNULL(SUM(QTD), 0) FROM "${databaseSchema}".PREVIABALANCO WHERE IDRESUMOBALANCO = ? )), 
                VRESTOQUEANTERIOR = TO_DECIMAL((SELECT IFNULL(VRESTOQUEATUAL, 0) FROM "${databaseSchema}".RESUMOBALANCO WHERE IDEMPRESA = ? 
                    AND IDRESUMOBALANCO <> ? AND STCONCLUIDO = 'True' ORDER BY IDRESUMOBALANCO DESC LIMIT 1)), 
                DTESTOQUEANTERIOR = (SELECT DTFECHAMENTO FROM "${databaseSchema}".RESUMOBALANCO WHERE IDEMPRESA = ? 
                    AND IDRESUMOBALANCO <> ? AND STCONCLUIDO = 'True' ORDER BY IDRESUMOBALANCO DESC LIMIT 1) 
            WHERE IDRESUMOBALANCO = ?
        `;

        const statement = await conn.prepare(query);

        for (const resumo of resumos) {
            const params = [
                resumo.IDRESUMOBALANCO,
                resumo.IDRESUMOBALANCO,
                resumo.IDRESUMOBALANCO,
                resumo.IDEMPRESA,
                resumo.IDRESUMOBALANCO,
                resumo.IDEMPRESA,
                resumo.IDRESUMOBALANCO,
                resumo.IDRESUMOBALANCO,
            ];

            await statement.exec(params);
        }

        await conn.commit();

        return {
            status: 'success',
            message: 'Resumo consolidado com sucesso!'
        };
    } catch (error) {
        console.error('Erro ao executar a consulta Consolidação de Balanco:', error);
        throw error;
    }
};
