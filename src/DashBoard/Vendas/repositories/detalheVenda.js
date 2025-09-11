// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getDetalheVendas = async (idVenda, idEmpresa, page, pageSize) => {
    try {
   
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                tbvd.IDVENDADETALHE, 
                tbvd.IDVENDA, 
                tbp.NUCODBARRAS, 
                tbp.DSNOME, 
                tbvd.QTD, 
                tbvd.VUNCOM, 
                tbvd.VRTOTALLIQUIDO, 
                tbvd.STCANCELADO, 
                tbvd.VENDEDOR_MATRICULA, 
                tbvd.VENDEDOR_NOME,  
                tbvd.STTROCA  
            FROM 
                "${databaseSchema}".VENDADETALHE tbvd 
                INNER JOIN "${databaseSchema}".VENDA tbv ON tbvd.IDVENDA = tbv.IDVENDA 
                INNER JOIN "${databaseSchema}".PRODUTO tbp ON tbvd.CPROD = tbp.IDPRODUTO 
            WHERE 
                1 = ?
        `;

        const params = [1];

        if (idVenda) {
            query += ' AND tbv.IDVENDA = ? ';
            params.push(idVenda);
        }
        
        if (idEmpresa > 0) {
            query += ' AND tbv.IDEMPRESA = ? ';
            params.push(idEmpresa);
        }

        
        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        
        return {
            data: result,
            page,
            pageSize,
            rows: result.length
        };

    } catch (error) {
        console.error('Erro ao executar a consulta detalhes vendas:', error);
        throw error;
    }
};
