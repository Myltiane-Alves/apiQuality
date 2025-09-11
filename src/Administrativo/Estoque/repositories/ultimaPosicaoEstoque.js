// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getUltimaPosicaoEstoque = async (
    idEmpresa,
    idGrupo,
    idSubGrupo,
    idMarca,
    idFornecedor,
    descricaoProduto,
    stAtivo,
    STNegativo,
    dataPesquisaInicio,
    dataPesquisaFim,
    page,
    pageSize
) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
        SELECT
            T.IDINVMOVIMENTO,
            T.IDPRODUTO,
            T2.DSNOME AS DSPRODUTO,
            T2.NUCODBARRAS,
            IFNULL(T2.UND,(SELECT "SalUnitMsr" FROM SBO_GTO_PRD.OITM WHERE "ItemCode" = T.IDPRODUTO)) AS UND,
            ( CASE WHEN IFNULL(T2.PRECOCUSTO, 0) = 0 THEN 1 ELSE T2.PRECOCUSTO END ) AS PRECOCUSTO,
            TO_DECIMAL(IFNULL(TBPP.PRECO_VENDA, 0), 10, 2) AS PRECOVENDA,
            T.IDEMPRESA,
            TBE.NOFANTASIA,
            T.QTDFINAL,
            T.DTMOVIMENTO,
            TO_VARCHAR(T.DTMOVIMENTO, 'DD/MM/YYYY HH24:MI:SS') AS DTMOVIMENTOFORMATADO
        FROM
            (
            SELECT
                FIRST_VALUE(TBI.IDINVMOVIMENTO ORDER BY TBI.DTMOVIMENTO DESC) AS IDINVMOVIMENTO
            FROM
                "${databaseSchema}".INVENTARIOMOVIMENTO TBI
            INNER JOIN "${databaseSchema}".EMPRESA e ON e.IDEMPRESA = TBI.IDEMPRESA
    `;

        const params = [];

        if (idEmpresa) {
            if (idEmpresa === '101') {
                query +=  `LEFT JOIN "${databaseSchema}".VW_PRODUTO p ON p.IDPRODUTO = TBI.IDPRODUTO` ;
            } else {
                query +=  `LEFT JOIN "${databaseSchema}".VW_PRODUTO p ON p.IDPRODUTO = TBI.IDPRODUTO AND p.IDGRUPOEMPRESARIAL = e.IDGRUPOEMPRESARIAL`;
            }
        } else {
            query += `LEFT JOIN "${databaseSchema}".VW_PRODUTO p ON p.IDPRODUTO = TBI.IDPRODUTO AND p.IDGRUPOEMPRESARIAL = e.IDGRUPOEMPRESARIAL `;
        }

        query += `
            LEFT JOIN "${databaseSchema}".PRODUTO pp ON pp.IDPRODUTO = TBI.IDPRODUTO
            LEFT JOIN "${databaseSchema}".PRODUTO_PRECO pr ON pr.IDPRODUTO = TBI.IDPRODUTO AND pr.IDEMPRESA = TBI.IDEMPRESA
            WHERE 1 = 1
        `;

        if (idEmpresa) {
            query += 'AND TBI.IDEMPRESA = ? ';
            params.push(idEmpresa);
        }

        if (idGrupo) {
            const listarIdGrupo = idGrupo.split(',');
            let listarDescGrupo = listarIdGrupo.map(grupo => {
                switch (grupo) {
                    case '1': return 'Verão';
                    case '2': return 'Calçados/Acessórios';
                    case '3': return 'Cama/Mesa/Banho';
                    case '4': return 'Utilidades Do Lar';
                    case '5': return 'Diversos';
                    case '6': return 'Artigos Esportivos';
                    case '7': return 'Cosméticos';
                    case '8': return 'Acessórios';
                    case '9': return 'Peças Íntimas';
                    case '10': return 'Inverno';
                    default: return '';
                }
            }).filter(Boolean).join(',');

            if (listarDescGrupo) {
                query += `AND p.GRUPO IN (${listarDescGrupo}) `;
            }
        }

        if (idSubGrupo) {
            query += 'AND p.IDSUBGRUPO IN (?) ';
            params.push(idSubGrupo);
        }

        if (idMarca) {
            query += 'AND p.IDMARCA IN (?) ';
            params.push(idMarca);
        }

        if (idFornecedor) {
            query += 'AND p.IDRAZAO_SOCIAL_FORNECEDOR IN (?) ';
            params.push(idFornecedor);
        }

        if (descricaoProduto) {
            query += 'AND (UPPER(pp.DSNOME) LIKE UPPER(?) OR pp.NUCODBARRAS LIKE ?) ';
            params.push(`%${descricaoProduto}%`, `%${descricaoProduto}%`);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += 'AND TBI.DTMOVIMENTO BETWEEN ? AND ? ';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        if (stAtivo) {
            query += 'AND TBI.STATIVO = ? ';
            params.push(stAtivo);
        }

        query += `
            GROUP BY
                TBI.IDPRODUTO,
                TBI.IDEMPRESA
            ) AS R
        INNER JOIN "${databaseSchema}".INVENTARIOMOVIMENTO AS T ON
            T.IDINVMOVIMENTO  = R.IDINVMOVIMENTO
        INNER JOIN "${databaseSchema}".PRODUTO AS T2 ON
            T2.IDPRODUTO = T.IDPRODUTO
        INNER JOIN "${databaseSchema}".EMPRESA TBE ON 
            TBE.IDEMPRESA = T.IDEMPRESA
        LEFT JOIN "${databaseSchema}".PRODUTO_PRECO TBPP ON TBPP.IDPRODUTO = T.IDPRODUTO AND TBPP.IDEMPRESA = TBE.IDEMPRESA
        ORDER BY T.IDEMPRESA ASC, T.IDPRODUTO ASC, T.DTMOVIMENTO DESC 
        `;

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
        };
    } catch (error) {
        console.error('Erro ao executar a consulta Inventario Movimento:', error);
        throw error;
    }
};
