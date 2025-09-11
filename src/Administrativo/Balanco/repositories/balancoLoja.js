// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;


export const getBalancoLoja = async (
    idEmpresa,
    dsDescricao,
    dataPesquisaInicio,
    dataPesquisaFim,
    page,
    pageSize
) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT tbresb.IDRESUMOBALANCO,
                tbresb.IDEMPRESA,
                tbe.NOFANTASIA,
                tbresb.DSRESUMOBALANCO,
                TO_VARCHAR(tbresb.DTABERTURA,'DD-MM-YYYY HH24:MI:SS') AS DTABERTURA,
                TO_VARCHAR(tbresb.DTFECHAMENTO,'DD-MM-YYYY HH24:MI:SS') AS DTFECHAMENTO,
                tbresb.QTDTOTALITENS,
                tbresb.QTDTOTALSOBRA,
                tbresb.QTDTOTALFALTA,
                tbresb.TXTOBSERVACAO,
                tbresb.STATIVO,
                tbresb.IDUSRFECHAMENTO,
                tbresb.VRESTOQUEANTERIOR,
                tbresb.DTESTOQUEANTERIOR,
                tbresb.QTDTOTALANTERIOR,
                tbresb.VRTOTALROMANEIO,
                tbresb.DTPERIODOROMANEIO,
                tbresb.VRALTAMERCADORIA,
                tbresb.DTPERIODOALTA,
                tbresb.SOBRAMERCADORIA,
                tbresb.DTPERIODOSOBRA,
                tbresb.TOTALGERALENTRADA,
                tbresb.VRBAIXAMERCADORIA,
                tbresb.DTPERIODOBAIXA,
                tbresb.VRDEVOLUCAOMERCADORIA,
                tbresb.DTPERIODODEVOLUCAO,
                tbresb.VRFALTAMERCADORIA,
                tbresb.DTPERIODOFALTAMERCADORIA,
                tbresb.VRDESCONTOCAIXA,
                tbresb.DTPERIODODESCONTOCAIXA,
                tbresb.VRVENDACAIXA,
                tbresb.DTPERIODOVENDACAIXA,
                tbresb.TOTALGERALSAIDA,
                tbresb.TOTALGERALPRESTARCONTA,
                tbresb.VRESTOQUEATUAL,
                tbresb.QTDTOTALENTRADA,
                tbresb.QTDTOTALDEVOLVIDA,
                tbresb.QTDTOTALCONTAGEM,
                tbresb.VRTOTALFALTA,
                tbresb.DTFALTA,
                tbresb.PERCFALTA,
                tbresb.OBSCONTAGEM,
                tbresb.OBSDIVERGENCIACONTAGEM,
                tbresb.OBSDIVERGENCIAGERENTE,
                tbresb.STCANCELADO,
                tbresb.IDUSRCANCELADO,
                tbresb.TXTMOTIVOCANCELADO,
                tbresb.STCONCLUIDO,
                tbresb.STCONSOLIDADO
            FROM
                "${databaseSchema}".RESUMOBALANCO tbresb
                INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbresb.IDEMPRESA = tbe.IDEMPRESA
            WHERE
                1 = 1
        `;

        const params = [];

        if (idEmpresa) {
            query += 'AND tbresb.IDEMPRESA = ? ';
            params.push(idEmpresa);
        }

        if (dsDescricao) {
            query += 'AND tbresb.DSRESUMOBALANCO LIKE ? ';
            params.push(`%${dsDescricao}%`);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += 'AND tbresb.DTABERTURA BETWEEN ? AND ? ';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        query += 'AND tbresb.STCANCELADO = \'False\' ';
        query += 'ORDER BY tbresb.IDRESUMOBALANCO DESC ';

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
        };
    } catch (error) {
        console.error('Erro ao executar a consulta Inventario Movimento:', error);
        throw error;
    }
};
