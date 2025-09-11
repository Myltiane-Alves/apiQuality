// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getProdutoPrecoNovo = async (idEmpresa, dsProduto, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let queryIdListaLoja = `SELECT ID_LISTA_LOJA FROM "${databaseSchema}"."EMPRESA" WHERE IDEMPRESA= ?`;
        const resultListaLoja = await conn.prepare(queryIdListaLoja).exec([idEmpresa]);
        const IdListaLoja = resultListaLoja.length ? resultListaLoja[0].ID_LISTA_LOJA : null;

        dsProduto = dsProduto.replace(' ', '%');


        let query = `
            SELECT 
                A.DATA_ULTIMA_ALTERACAO_PDV,
                TO_VARCHAR(A.DATA_ULTIMA_ALTERACAO_PDV, 'DD-MM-YYYY HH24:MI:SS') AS DATA_ULTIMA_ALTERACAO_PDV,
                A.CODIGO_ITEM,
                A.DESCRICAO_ITEM,
                A.CODIGO_BARRAS,
                A.PRECO_VENDA_PDV,
                A.PRECO_VENDA_SAP,
                ROUND(IFNULL(B."Price", 0), 2) AS "PRECO_CUSTO",
                A.ID_LISTA_LOJA,
                A.LISTA_PRECO_LOJA,
                A.PRECO_VENDA_BRASILIA,
                A.LISTA_PRECO_BRASILIA,
                A.IDEMPRESA,
                A.LOJA,
                C."GRUPO",
                C."SUBGRUPO"
            FROM 
                SBO_GTO_PRD.RS_PRECO_VENDA_PDV_X_SAP A
            INNER JOIN 
                "SBO_GTO_PRD"."ITM1" B ON B."ItemCode" = A.CODIGO_ITEM AND B."PriceList" = 3
            INNER JOIN 
                "${databaseSchema}"."VW_PRODUTO_ESTRUTURA_MERCADOLOGICA" C ON C.IDPRODUTO = B."ItemCode"
            WHERE 
                1 = 1 
                AND A.ID_LISTA_LOJA = '${IdListaLoja}'
                AND A.IDEMPRESA = '${idEmpresa}'
        `;

        const params = [idEmpresa];

       
        if (dsProduto) {
            query += ` AND (A.CODIGO_BARRAS = ? OR UPPER(A.DESCRICAO_ITEM) LIKE UPPER(?))`;
            params.push(dsProduto, `%${dsProduto}%`);
        }


        query += ` ORDER BY A.CODIGO_ITEM`;

      
        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

  
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);


        return {
            page,
            pageSize,
            rows: result.length,
            data: result
        };
    } catch (error) {
        console.error('Error ao execultar consulta Produto preco novo:', error);
        throw error;
    }
};
