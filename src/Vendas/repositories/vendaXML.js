// import conn from "../../config/dbConnection.js";
const databaseSchema = process.env.HANA_DATABASE;

export const getVendaXML = async (idVenda, idMarca,idEmpresa, stCancelado, stContigencia, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
            TBV."IDVENDA",
            TBE."NOFANTASIA",
            TBV."NFE_INFNFE_IDE_SERIE" AS "SERIE",
            TBV."NFE_INFNFE_IDE_NNF" AS "NF",
            TBV."PROTNFE_INFPROT_CHNFE" AS "CHAVENFE",
            TBV."NFE_INFNFE_ID" AS "IDCHAVENFE",
            TBV."STCONTINGENCIA",
            TBV."STCANCELADO",
            TBV."TXTMOTIVOCANCELAMENTO",
            TBV."VRTOTALPAGO",
            TBV."PROTNFE_INFPROT_CSTAT",
            TBV."PROTNFE_INFPROT_XMOTIVO",
            TBV."DTHORAFECHAMENTO",
            BASE64_DECODE(CAST(TBV2."XML" AS NVARCHAR(40000))) AS "XML_FORMATADO"
		FROM
            "${databaseSchema}".VENDA TBV
        INNER JOIN "${databaseSchema}".EMPRESA TBE ON 
            TBV.IDEMPRESA = TBE.IDEMPRESA
        LEFT JOIN "${databaseSchema}".VENDAXML TBV2 ON
            TBV.IDVENDA = TBV2.IDVENDA
		WHERE
		    1 = ? 
        `;

        
        const params = [1];

        if(idVenda){
            query += ' AND TBV."IDVENDA" = ?';
            params.push(idVenda);
        }

        if(dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND TBV."DTHORAFECHAMENTO" BETWEEN ? AND ?';
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

        if (stCancelado) {
            query += 'AND TBV.STCANCELADO = ?';
            params.push(stCancelado);
        }
      
        if (stContigencia) {
            query += 'AND TBV.STCONTINGENCIA = ?';
            params.push(stContigencia);
        }

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
        console.error('Erro ao executar a consulta Vendas XML:', error);
        throw error;
    }
};
