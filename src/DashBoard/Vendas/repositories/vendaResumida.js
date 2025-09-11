// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getVendasResumida = async (idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
       
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

       
        let query = `
            SELECT DISTINCT 
                (SELECT IFNULL(COUNT(VENDA.IDVENDA), 0) 
                FROM "${databaseSchema}".VENDA 
                WHERE VENDA.IDEMPRESA = VWV.IDEMPRESA 
                AND VENDA.STCANCELADO = 'False' 
                AND (VENDA.DTHORAFECHAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59')) AS QTDVENDA,
                VWV.IDEMPRESA,
                VWV.NOFANTASIA,
                SUM(VWV.QTD * VWV.VUNCOM) AS TOTALBRUTO,
                SUM(VWV.VDESC) AS TOTALDESCONTO,
                SUM(VWV.VRRECVOUCHER) AS VRRECVOUCHER
            FROM 
                "${databaseSchema}".VW_VENDAS_PRODUTO_GRUPO_SUBGRUPO VWV
            WHERE 
            1 = 1 
        `;

        const params = [];


        if (idEmpresa > 0) {
            query += ' AND TBV.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if(dataPesquisaInicio && dataPesquisaFim){
            query += ` AND VWV.DTHORAFECHAMENTO BETWEEN ? AND ?`;
            params.push(dataPesquisaInicio, dataPesquisaFim);
        }

        query += ' GROUP BY VWV.IDEMPRESA, VWV.NOFANTASIA';
        query += ' ORDER BY VWV.NOFANTASIA';

        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

       
        return {
            page,
            pageSize,
            rows: result.length,
            data: result,
        };

    } catch (error) {
        console.error('Erro ao executar a consulta de vendas resumidas:', error);
        throw error;
    }
};
