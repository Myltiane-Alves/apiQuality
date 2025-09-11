// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getVendaDigitalMarca = async (idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {

        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

 
        const offset = (page - 1) * pageSize;
        
   
        let query = `
            SELECT DISTINCT 
                tbe.IDEMPRESA,
                tbe.NOFANTASIA,
                tbe.IDGRUPOEMPRESARIAL,
                (SELECT IFNULL(SUM(TBVD.VRTOTALLIQUIDO), 0) 
                    FROM "${databaseSchema}".VENDADETALHE TBVD 
                    INNER JOIN "${databaseSchema}".VENDA ON TBVD.IDVENDA = VENDA.IDVENDA 
                    WHERE VENDA.DTHORAFECHAMENTO BETWEEN ? AND ? 
                    AND VENDA.IDEMPRESA = tbe.IDEMPRESA 
                    AND TBVD.STCANCELADO = 'False' 
                    AND TBVD.STVENDIGITAL = 'True') AS VRTOTALVENDA,
                (SELECT IFNULL(SUM(TBVD.QTD), 0) 
                    FROM "${databaseSchema}".VENDADETALHE TBVD 
                    INNER JOIN "${databaseSchema}".VENDA ON TBVD.IDVENDA = VENDA.IDVENDA 
                    WHERE VENDA.DTHORAFECHAMENTO BETWEEN ? AND ? 
                    AND VENDA.IDEMPRESA = tbe.IDEMPRESA 
                    AND TBVD.STCANCELADO = 'False' 
                    AND TBVD.STVENDIGITAL = 'True') AS QTDTOTAL
            FROM 
                "${databaseSchema}".VENDA tbmc
                INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbmc.IDEMPRESA = tbe.IDEMPRESA
            WHERE 1 = 1
        `;
        
        const params = [
            `${dataPesquisaInicio} 00:00:00`,
            `${dataPesquisaFim} 23:59:59`,
            `${dataPesquisaInicio} 00:00:00`,
            `${dataPesquisaFim} 23:59:59`
        ];

        // Condição opcional para `idEmpresa`
        if (idEmpresa) {
            query += ' AND tbmc.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        // Condição opcional para intervalo de datas
        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND tbmc.DTHORAFECHAMENTO BETWEEN ? AND ?';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        // Ordenação e paginação
        query += ' ORDER BY tbe.IDGRUPOEMPRESARIAL LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        // Preparação e execução da query
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page,
            pageSize,
            rows: result.length,
            data: result
        };
    } catch (e) {
        console.error('Erro ao executar a consulta de vendas:', e);
        throw new Error('Erro interno ao processar a requisição.');
    }
};
