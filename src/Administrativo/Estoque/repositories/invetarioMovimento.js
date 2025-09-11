// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;


export const getInventarioMovimento = async (
    idEmpresa,
    idGrupo,
    idSubGrupo,
    idMarca,
    idFornecedor,
    descricaoProduto,
    STAtivo,
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
                im.IDEMPRESA, e.NOFANTASIA,
                IFNULL(p.NUCODBARRAS, (SELECT IFNULL("CodeBars", '') FROM "SBO_GTO_PRD"."OITM" WHERE "ItemCode" = im.IDPRODUTO)) AS NUCODBARRAS,
                IFNULL(p.DSPRODUTO, (SELECT IFNULL("ItemName", '') FROM "SBO_GTO_PRD"."OITM" WHERE "ItemCode" = im.IDPRODUTO)) as DSPRODUTO,
                IFNULL(p.IDRAZAO_SOCIAL_FORNECEDOR, (SELECT IFNULL(T1."CardCode", '') FROM "SBO_GTO_PRD"."OITM" T0 INNER JOIN "SBO_GTO_PRD"."OCRD" T1 ON T1."CardCode" = T0."CardCode" WHERE T0."ItemCode" = im.IDPRODUTO)) AS IDRAZAO_SOCIAL_FORNECEDOR,
                IFNULL(p.RAZAO_SOCIAL_FORNECEDOR, (SELECT IFNULL(T1."CardName", '') FROM "SBO_GTO_PRD"."OITM" T0 INNER JOIN "SBO_GTO_PRD"."OCRD" T1 ON T1."CardCode" = T0."CardCode" WHERE T0."ItemCode" = im.IDPRODUTO)) AS RAZAO_SOCIAL_FORNECEDOR,
                IFNULL(pp.PRECOCUSTO, 0) AS PRECOCUSTO,
                IFNULL(IFNULL(pr.PRECO_VENDA, pp.PRECOVENDA), 0) AS PRECOVENDA,
                im.IDPRODUTO, im.DTMOVIMENTO, im.QTDINICIO, im.QTDENTRADA, im.QTDENTRADAVOUCHER,
                im.QTDSAIDA, im.QTDSAIDATRANSFERENCIA, im.QTDRETORNOAJUSTEPEDIDO, im.QTDFINAL, im.QTDAJUSTEBALANCO, im.STATIVO,
                TO_VARCHAR(im.DTMOVIMENTO, 'YYYY-MM-DD') AS DATAMOVIMENTO,
                pp.SKUVTEX, IFNULL(im.QTDENTRADAECOMMERCE, 0) AS QTDENTRADAECOMMERCE, IFNULL(im.QTDSAIDAECOMMERCE, 0) AS QTDSAIDAECOMMERCE
            FROM "${databaseSchema}".INVENTARIOMOVIMENTO im
            INNER JOIN "${databaseSchema}".EMPRESA e ON e.IDEMPRESA = im.IDEMPRESA
        `;

        const params = [];

        if (idEmpresa) {
            if (idEmpresa === '101') {
                query += ` LEFT JOIN "${databaseSchema}".VW_PRODUTO p ON p.IDPRODUTO = im.IDPRODUTO `;
            } else {
                query += ` LEFT JOIN "${databaseSchema}".VW_PRODUTO p ON p.IDPRODUTO = im.IDPRODUTO AND p.IDGRUPOEMPRESARIAL = e.IDGRUPOEMPRESARIAL `;
            }
        } else {
            query += ` LEFT JOIN "${databaseSchema}".VW_PRODUTO p ON p.IDPRODUTO = im.IDPRODUTO AND p.IDGRUPOEMPRESARIAL = e.IDGRUPOEMPRESARIAL `;
        }

        query += `
            LEFT JOIN "${databaseSchema}".PRODUTO pp ON pp.IDPRODUTO = im.IDPRODUTO
            LEFT JOIN "${databaseSchema}".PRODUTO_PRECO pr ON pr.IDPRODUTO = im.IDPRODUTO AND pr.IDEMPRESA = im.IDEMPRESA
            WHERE 1 = 1
        `;

        if (idEmpresa) {
            query += 'AND im.IDEMPRESA = ? ';
            params.push(idEmpresa);
        }

        if (idGrupo) {
            const listarIdGrupo = idGrupo.split(',');
            let descGrupo = '';
            let listarDescGrupo = '';

            for (let i = 0; i < listarIdGrupo.length; i++) {
                switch (listarIdGrupo[i]) {
                    case '1':
                        descGrupo = 'Verão';
                        break;
                    case '2':
                        descGrupo = 'Calçados/Acessórios';
                        break;
                    case '3':
                        descGrupo = 'Cama/Mesa/Banho';
                        break;
                    case '4':
                        descGrupo = 'Utilidades Do Lar';
                        break;
                    case '5':
                        descGrupo = 'Diversos';
                        break;
                    case '6':
                        descGrupo = 'Artigos Esportivos';
                        break;
                    case '7':
                        descGrupo = 'Cosméticos';
                        break;
                    case '8':
                        descGrupo = 'Acessórios';
                        break;
                    case '9':
                        descGrupo = 'Peças Íntimas';
                        break;
                    case '10':
                        descGrupo = 'Inverno';
                        break;
                }

                listarDescGrupo += i === 0 ? `'${descGrupo}'` : `,'${descGrupo}'`;
            }
            query += `AND p.GRUPO IN (${listarDescGrupo}) `;
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
            query += 'AND im.IDRAZAO_SOCIAL_FORNECEDOR IN (?) ';
            params.push(idFornecedor);
        }

        if (descricaoProduto) {
            query += 'AND (UPPER(pp.DSNOME) LIKE UPPER(?) OR pp.NUCODBARRAS LIKE ?) ';
            params.push(`%${descricaoProduto}%`, `%${descricaoProduto}%`);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += 'AND im.DTMOVIMENTO BETWEEN ? AND ? ';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        if (STAtivo) {
            query += 'AND im.STATIVO = ? ';
            params.push(STAtivo);
        }

        query += 'ORDER BY im.IDPRODUTO, im.DTMOVIMENTO DESC ';

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
        console.error('Erro ao executar a consulta Inventario Movimento:', error);
        throw error;
    }
};
