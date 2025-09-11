// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;


export const getNovoPreviaBalanco = async (idResumo, diferenca, processa,  page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        if (!idResumo) {
            throw 'Favor informar o id do resumo';
        }

        let query = `
            SELECT 
                pb.IDPREVIABALANCO, pb.IDPRODUTO, pb.IDRESUMOBALANCO, pb.IDEMPRESA, pb.QTD, pb.QTDFINAL, pb.QTDFALTA, pb.QTDSOBRA, pb.PRECOVENDA, pb.TOTALVENDA,
                IFNULL(p.NUCODBARRAS, (SELECT IFNULL("CodeBars", '') FROM "SBO_GTO_PRD"."OITM" WHERE "ItemCode" = pb.IDPRODUTO)) AS NUCODBARRAS,
                IFNULL(p.DSNOME, (SELECT IFNULL("ItemName", '') FROM "SBO_GTO_PRD"."OITM" WHERE "ItemCode" = pb.IDPRODUTO)) AS DSNOME
            FROM "${databaseSchema}".PREVIABALANCO pb
            LEFT JOIN "${databaseSchema}".PRODUTO p ON p.IDPRODUTO = pb.IDPRODUTO
            WHERE 1 = ?
        `;

        const params = [1];

        if (idResumo) {
            query += 'AND pb.IDRESUMOBALANCO = ? ';
            params.push(idResumo);
        }

        if(diferenca === '1') {
            query += ' AND (pb.QTDFALTA <> 0 OR pb.QTDSOBRA <> 0) ';
            
        }

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