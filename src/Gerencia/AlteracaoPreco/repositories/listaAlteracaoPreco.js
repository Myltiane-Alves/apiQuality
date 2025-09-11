// import conn from "../../../config/dbConnection.js";

export const obterPrecoVendaAnterior = async (idProduto, idEmpresa) => {
    const query = `
        SELECT TOP 1
            CASE WHEN IFNULL(pp.PRECO_VENDA, 0) = 0 THEN p.PRECOVENDA ELSE pp.PRECO_VENDA END AS PRECOANTIGO
        FROM "VAR_DB_NAME".PRODUTO_PRECO pp
        INNER JOIN "VAR_DB_NAME".PRODUTO p ON pp.IDPRODUTO = p.IDPRODUTO
        WHERE pp.IDPRODUTO = ?
        AND pp.IDEMPRESA = ?
        ORDER BY p.DTULTALTERACAO DESC
    `;
    const params = [idProduto, idEmpresa];
    const statement = await conn.prepare(query);
    const result = await statement.exec(params);
    return result.map(det => ({
        antigopreco: {
            PRECOANTIGO: det.PRECOANTIGO
        }
    }));
};

export const obterEstoque = async (idProduto, idEmpresa, dtMov) => {
    const query = `
        SELECT TOP 1
            CASE WHEN tbi.DTBALANCO IS NOT NULL THEN tbi.QTDAJUSTEBALANCO ELSE IFNULL(tbi.QTDFINAL, 0) END AS QTDFINAL
        FROM "VAR_DB_NAME".INVENTARIOMOVIMENTO tbi
        WHERE tbi.IDPRODUTO = ?
        AND tbi.IDEMPRESA = ?
        AND tbi.DTMOVIMENTO <= ?
        ORDER BY tbi.DTMOVIMENTO DESC
    `;
    const params = [idProduto, idEmpresa, `${dtMov} 23:59:59`];
    const statement = await conn.prepare(query);
    const result = await statement.exec(params);
    return result.length > 0 ? result.map(det => ({
        prodestoque: {
            QTDFINAL: det.QTDFINAL
        }
    })) : [{
        prodestoque: {
            QTDFINAL: 0
        }
    }];
};

export const obterProdutos = async (idProduto, idLog, idEmpresa) => {
    const query = `
        SELECT
            hp."LogInstanc" AS LOGPRECO,
            hp."PriceList" AS LISTAPRECO,
            hp."BPLId" AS IDEMPRESA,
            hp."ListName" AS NOEMPRESA,
            hp."ItemCode" AS IDPRODUTO,
            oitm."ItemName" AS DSNOME,
            oitm."CodeBars" AS NUCODBARRAS,
            hp.DESCRICAOSUB AS DSSUBGRUPOESTRUTURA,
            hp."Price" AS PRECO_VENDA,
            TO_VARCHAR(hp."UpdateDate", 'YYYY-MM-DD') AS DTATUALIZACAO
        FROM "SBO_GTO_PRD"."TSD_HISTORICO_PRECO" hp
        INNER JOIN "SBO_GTO_PRD".OITM oitm ON hp."ItemCode" = oitm."ItemCode"
        WHERE hp."LogInstanc" = ?
        AND (UPPER(oitm."ItemName") LIKE UPPER(?) OR oitm."CodeBars" LIKE ?)
        AND hp."BPLId" = ?
    `;
    const params = [idLog, `%${idProduto}%`, `%${idProduto}%`, idEmpresa];
    const statement = await conn.prepare(query);
    const result = await statement.exec(params);

    const produtos = await Promise.all(result.map(async det => ({
        preco: {
            IDPRODUTO: det.IDPRODUTO,
            NOEMPRESA: det.NOEMPRESA,
            NUCODBARRAS: det.NUCODBARRAS,
            DSNOME: det.DSNOME,
            DSSUBGRUPOESTRUTURA: det.DSSUBGRUPOESTRUTURA,
            PRECO_VENDA: det.PRECO_VENDA
        },
        estoque: await obterEstoque(det.IDPRODUTO, det.IDEMPRESA, det.DTATUALIZACAO),
        precoantigo: await obterPrecoVendaAnterior(det.IDPRODUTO, det.IDEMPRESA)
    })));

    return produtos;
};

export const getAlteracaoPreco = async (idEmpresa, grupo, subgrupo, produto, codigobarras, dataInicio, dataFim, page, pageSize) => {
    var query = `
        SELECT MAX(hp."LogInstanc") AS LOGPRECO
        FROM "SBO_GTO_PRD"."TSD_HISTORICO_PRECO" hp
        INNER JOIN "SBO_GTO_PRD".OITM oitm ON hp."ItemCode" = oitm."ItemCode"
        WHERE 1 = 1
        ${id ? `AND hp."BPLId" = '${id}'` : ''}
        ${idEmpresa ? `AND hp."BPLId" = '${idEmpresa}'` : ''}
        ${subgrupo ? `AND hp."ItmsGrpCod" IN ('${subgrupo}')` : ''}
        ${produto ? `AND (UPPER(oitm."ItemName") LIKE UPPER('%${produto}%') OR oitm."CodeBars" LIKE '%${produto}%')` : ''}
        ${dataInicio ? `AND (hp."UpdateDate" = '${dataInicio}')` : ''}
    `;

    const params = [];
    
    if (idEmpresa) {
        query += ` AND hp."BPLId" = ?`;
        params.push(idEmpresa);
    }

    if (grupo) {
        query += ` AND hp."ItmsGrpCod" = ?`;
        params.push(grupo);
    }

    if (subgrupo) {
        query += ` AND hp."ItmsGrpCod" = ?`;
        params.push(subgrupo);
    }

    if (produto) {
        query += ` AND (UPPER(oitm."ItemName") LIKE UPPER(?) OR oitm."CodeBars" LIKE ?)`;
        params.push(`%${produto}%`);
        params.push(`%${produto}%`);
    }

    if (codigobarras) {
        query += ` AND oitm."CodeBars" = ?`;
        params.push(codigobarras);
    }

    if (dataInicio) {
        query += ` AND hp."UpdateDate" = ?`;
        params.push(dataInicio);
    }

    if (dataFim) {
        query += ` AND hp."UpdateDate" = ?`;
        params.push(dataFim);
    }

    query += ` GROUP BY hp."LogInstanc"`;

    if (page && !isNaN(page)) {
        query += ` OFFSET ${page}`;
    }

    if (pageSize && !isNaN(pageSize)) {
        query += ` LIMIT ${pageSize}`;
    }

    const statement = await conn.prepare(query);
    const result = await statement.exec(params);

    const produtos = await Promise.all(result.map(async det => ({
        produtos: await obterProdutos(det.LOGPRECO, idEmpresa)
    })));

    return produtos;
    
}