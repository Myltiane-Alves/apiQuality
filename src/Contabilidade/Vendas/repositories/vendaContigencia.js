// import conn from "../../../config/dbConnection.js";
const databaseSchema = process.env.HANA_DATABASE;

export const getVendasContigencia = async (idMarca,idEmpresa, idVenda, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        var query = `
            SELECT
                TBE."NOFANTASIA",
                TBV."IDVENDA",
                TBV."NFE_INFNFE_IDE_SERIE" AS "SERIE",
                TBV."NFE_INFNFE_IDE_NNF" AS "NF",
                TBV."PROTNFE_INFPROT_CHNFE" AS "CHAVENFE",
                TBV."NFE_INFNFE_ID" AS "IDCHAVENFE",
                TBV."STCONTINGENCIA",
                TBV."VRTOTALPAGO",
                TBV."PROTNFE_INFPROT_CSTAT",
                TBV."PROTNFE_INFPROT_XMOTIVO",
                TBV."DTHORAFECHAMENTO"
            FROM
                "${databaseSchema}"."VENDA" TBV
            INNER JOIN "${databaseSchema}"."EMPRESA" TBE ON
                TBV."IDEMPRESA" = TBE."IDEMPRESA"
            WHERE 1 = 1
                AND
                    TBV."STATIVO" = 'False'
                AND
                    TBV."STCANCELADO" = 'False'
                AND 
                    TBV."STCONTINGENCIA" = 'True'
        `;

        
        const params = [];

        if(idVenda) {
            query += ' AND TBV.IDVENDA = ?';
            params.push(idVenda);
        }

        if(dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND TBV.DTHORAFECHAMENTO BETWEEN ? AND ?';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        if(idMarca) {
            query += 'AND TBE.IDGRUPOEMPRESARIAL = ?';
            params.push(idMarca);
        }

        if (idEmpresa) {
            query += 'AND TBE.IDEMPRESA  = ?';
            params.push(idEmpresa);
        }

      
        query += ' ORDER BY TBV.DTHORAFECHAMENTO';
        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
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
        console.error('Erro ao executar a consulta Vendas Contigencia:', error);
        throw error;
    }
};
