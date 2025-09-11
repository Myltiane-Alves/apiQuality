// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;


export const getParceriaCredSystem = async (idEmpresa, dataPesquisaInicio, dataPesquisaFim,  page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        var query = `
            SELECT
                DISTINCT
                TBVD.IDVENDA AS AVC,
                TBVP.NSUAUTORIZADORA AS NSU,
                TBVD.QCOM AS QUANTIDADE,
                ROUND(TBVD.VUNCOM, 2) AS VALOR_UNITARIO,
                ROUND(TBV.VRTOTALPAGO, 2) AS TOTAL_VENDA,
                (SELECT ROUND(SUM(VALORRECEBIDO), 2) FROM "${databaseSchema}".VENDAPAGAMENTO WHERE IDVENDA = TBV.IDVENDA GROUP BY IDVENDA) AS KALLANCARD,
                TBVP.NOAUTORIZADOR AS ADMINISTRADORA,
                TBP.NUCODBARRAS AS PRODUTO,
                NULL AS DESCRICAO_COR,
                NULL  AS LINHA,
                TBRGC."Grupo" AS GRUPO_PRODUTO, 
                TBOB."ItmsGrpNam" AS SUBGRUPO_PRODUTO,
                TBOC."FirmName" AS MARCA,
                TBVD.XPROD,
                NULL AS DESC_COLECAO,
                TBV.DTHORAFECHAMENTO,
                TO_VARCHAR(TBV.DTHORAFECHAMENTO, 'YYYY-MM-DD') AS DT_COMPRA
            FROM
                "${databaseSchema}".VENDA TBV
            INNER JOIN "${databaseSchema}".VENDADETALHE TBVD ON
                TBV.IDVENDA = TBVD.IDVENDA
            INNER JOIN "${databaseSchema}".VENDAPAGAMENTO TBVP ON
                TBV.IDVENDA = TBVP.IDVENDA
                AND CONTAINS(TBVP.DSTIPOPAGAMENTO,'CREDSYSTEM')
            INNER JOIN "${databaseSchema}".PRODUTO TBP ON 
                TBVD.CPROD = TBP.IDPRODUTO
            LEFT JOIN "SBO_GTO_PRD"."OITM" TBOM ON 
                TBOM."ItemCode" = TBP.IDPRODUTO 
            LEFT JOIN "SBO_GTO_PRD"."OMRC" TBOC ON 
                TBOC."FirmCode" = TBOM."FirmCode" 
            LEFT JOIN "SBO_GTO_PRD"."RSD_GRUPO_CLASSIFICACAO" TBRGC ON 
                TBRGC."ItemCode" = TBP.IDPRODUTO
            LEFT JOIN "SBO_GTO_PRD"."OITB" TBOB ON 
                TBOB."ItmsGrpCod" = TBOM."ItmsGrpCod"
            INNER JOIN "${databaseSchema}".EMPRESA TBE ON
                TBV.IDEMPRESA = TBE.IDEMPRESA
            WHERE
                TBV.STCANCELADO = 'False' AND 1 = ? 
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

        query += ` ORDER BY TBV.DTHORAFECHAMENTO, TBVD.IDVENDA`;

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
