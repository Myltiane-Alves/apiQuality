// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;


export const getMeioPagamentoCredSystem = async (idEmpresa, dataPesquisaInicio, dataPesquisaFim,  page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT DISTINCT 
                TBV.DEST_CPF AS CPF_CLIENTE,
                TBV.IDVENDA  AS COD_CUPOM,
                TBV.DTHORAFECHAMENTO AS DT_COMPRA,
                UPPER(TBVP.DSTIPOPAGAMENTO) AS TP_PAGTO,
                TBV.VRTOTALPAGO AS VL_COMPRA,
                TBE.NOFANTASIA AS NOME_EMP_FIDELDD,
                NULL AS NOME_PARC_CRED,
                NULL  AS COD_LOJA_PRC_CRD,
                TBVP.DTPROCESSAMENTO AS DT_INCLUSAO_DW
            FROM
                "${databaseSchema}".VENDA TBV
            INNER JOIN "${databaseSchema}".VENDAPAGAMENTO TBVP ON
                TBV.IDVENDA = TBVP.IDVENDA
                AND CONTAINS(TBVP.DSTIPOPAGAMENTO,'CREDSYSTEM')
            INNER JOIN "${databaseSchema}".EMPRESA TBE ON
                TBV.IDEMPRESA = TBE.IDEMPRESA
            WHERE
                TBV.STCANCELADO = 'False' AND 1 = 1
        `;

        const params = [];

        if(idEmpresa) {
            query += `AND TBV.IDEMPRESA = ?`;
            params.push(idEmpresa);
        }
        
        if(dataPesquisaInicio && dataPesquisaFim) {
            query += ` AND TBV.DTHORAFECHAMENTO BETWEEN ? AND ?`;
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        query += ` ORDER BY TBV.DTHORAFECHAMENTO`;

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
        console.error('Erro ao executar a consulta Meio de Pagamento CredSystem:', error);
        throw error;
    }
}
