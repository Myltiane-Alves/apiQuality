// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getColetorBalanco = async (
    idEmpresa,
    idResumo,
    descricaoProduto,
    page,
    pageSize
) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        if (!idResumo) {
            throw 'Favor informar o id do resumo';
        }

        if (!idEmpresa) {
            throw 'Favor informar o id da empresa';
        }

        let query = ` SELECT 
            db.NUMEROCOLETOR, IFNULL(db.DSCOLETOR, '') AS DSCOLETOR,
            SUM(db.TOTALCONTAGEMGERAL) AS NUMITENS,
            SUM(db.TOTALCONTAGEMGERAL * IFNULL(p.PRECOCUSTO, 0)) AS TOTALCUSTO,
            SUM(db.TOTALCONTAGEMGERAL * TO_DECIMAL( IFNULL( IFNULL( pr.PRECO_VENDA, p.PRECOVENDA), 0))) AS TOTALVENDA,
            db.IDRESUMOBALANCO, rb.IDEMPRESA, rb.STCONSOLIDADO
            FROM "${databaseSchema}".DETALHEBALANCO db
            INNER JOIN "${databaseSchema}".RESUMOBALANCO rb ON rb.IDRESUMOBALANCO = db.IDRESUMOBALANCO
            LEFT JOIN "${databaseSchema}".PRODUTO p ON p.IDPRODUTO = db.IDPRODUTO
            LEFT JOIN "${databaseSchema}".PRODUTO_PRECO pr ON pr.IDPRODUTO = db.IDPRODUTO AND pr.IDEMPRESA = ?
            WHERE 1 = ? 
        `;

        const params = [idEmpresa, 1]; 

        if (idResumo) {
            query += 'AND db.IDRESUMOBALANCO = ? ';
            params.push(idResumo);
        }
        if (descricaoProduto) {
            query += 'AND (db.CODIGODEBARRAS LIKE ? OR UPPER(db.DSPRODUTO) LIKE UPPER(?)) ';
            params.push('%' + descricaoProduto + '%', '%' + descricaoProduto + '%');
        }

        query += ' AND db.STCANCELADO = \'False\' ';
        query += ' GROUP BY db.NUMEROCOLETOR, db.DSCOLETOR, db.IDRESUMOBALANCO, rb.IDEMPRESA, rb.STCONSOLIDADO ';

        const offset = (page - 1) * pageSize;
        query += 'LIMIT ? OFFSET ? ';
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);
        return {
            data: result,
            page: page,
            pageSize: pageSize,
            rows: result.length,
        };
    } catch (error) {
        console.error('Erro ao executar a consulta Coletor Balanco:', error);
        throw error;
    }
};
