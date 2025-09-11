// import conn from "../../../config/dbConnection.js";
const databaseSchema = process.env.HANA_DATABASE;

export const getVendasDetalhe = async (idVenda, idVendaDetalhe,  page, pageSize) => {
    try {
        
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT
                TBVD.IDVENDADETALHE,
                TBVD.IDVENDA,
                TBVD.NITEM,
                TBVD.CPROD,
                TBP.NUCODBARRAS,
                TBVD.CEAN,
                TBVD.XPROD,
                TBVD.NCM,
                TBVD.CFOP,
                TBVD.UCOM,
                TBVD.QCOM,
                TBVD.VUNCOM,
                TBVD.VPROD,
                TBVD.CEANTRIB,
                TBVD.UTRIB,
                TBVD.QTRIB,
                TBVD.VUNTRIB,
                TBVD.INDTOT,
                TBVD.ICMS_ORIG,
                TBVD.ICMS_CST,
                TBVD.ICMS_MODBC,
                TBVD.ICMS_VBC,
                TBVD.ICMS_PICMS,
                TBVD.ICMS_VICMS,
                TBVD.PIS_CST,
                TBVD.PIS_VBC,
                TBVD.PIS_PPIS,
                TBVD.PIS_VPIS,
                TBVD.COFINS_CST,
                TBVD.COFINS_VBC,
                TBVD.COFINS_PCOFINS,
                TBVD.COFINS_VCOFINS,
                TBVD.VENDEDOR_MATRICULA,
                TBVD.VENDEDOR_NOME,
                TBVD.VENDEDOR_CPF, 
                TBVD.VRTOTALLIQUIDO,
                TBVD.QTD
            FROM
                "${databaseSchema}".VENDADETALHE TBVD
            LEFT JOIN "${databaseSchema}".PRODUTO TBP ON
                TBVD.CPROD = TBP.IDPRODUTO
            WHERE
                1 = 1
                AND STCANCELADO = \'False\' 
        `;

        
        const params = [];

        if(idVenda) {
            query += ' AND TBVD.IDVENDA = ?';
            params.push(idVenda);
        }

        if(idVendaDetalhe) {
            query += ' AND TBVD.IDVENDADETALHE = ?';
            params.push(idVendaDetalhe);
        }

    
        query += ' ORDER BY IDVENDADETALHE';

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
        console.error('Erro ao executar a consulta Vendas Detalhe:', error);
        throw error;
    }
};
