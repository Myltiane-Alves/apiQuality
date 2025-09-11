

// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getAlteracaoPreco = async (
    idMarca,
    idEmpresa,
    grupo,
    subGrupo,
    descProduto,
    codBarras,
    estoque,
    dataPesquisaInicio,
    dataPesquisaFim,
    page,
    pageSize
) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        var query = `
        SELECT 
          h.IDHISTORICOALTERACAOPRECOPRODUTOEMPRESA,
          h.IDRESUMOALTERACAOPRECOPRODUTO, 
          e.IDEMPRESA, 
          e.IDGRUPOEMPRESARIAL, 
          h.PRECOVENDAANTERIOR, 
          h.PRECOVENDA,  
          h.DTHORAEXECUTADO, 
          h.DTHORAATUALIZADO, 
          h.STATIVO,
          h.STEXECUTADO, 
          h.STEXCLUIDO, 
          p.NUCODBARRAS, 
          p.DSNOME,
          p.PRECOCUSTO,
          s.IDSUBGRUPOESTRUTURA, 
          s.DSSUBGRUPOESTRUTURA,
          g.DSGRUPOESTRUTURA, 
          g.IDGRUPOESTRUTURA, 
          i.QTDFINAL,
          h.IDPRODUTO 
        FROM ${databaseSchema}.HISTORICOALTERACAOPRECOPRODUTOEMPRESA h
        INNER JOIN ${databaseSchema}.RESUMOALTERACAOPRECOPRODUTO r ON 
          h.IDRESUMOALTERACAOPRECOPRODUTO = r.IDRESUMOALTERACAOPRECOPRODUTO
        INNER JOIN ${databaseSchema}.PRODUTO p ON 
          h.IDPRODUTO = p.IDPRODUTO
        LEFT JOIN ${databaseSchema}.PRODUTO_PRECO pp ON 
          h.IDPRODUTO = pp.IDPRODUTO AND h.IDEMPRESA = pp.IDEMPRESA AND pp.STATIVO = 'True'
        LEFT JOIN  ${databaseSchema}.EMPRESA e ON
            h.IDEMPRESA = e.IDEMPRESA
        INNER JOIN ${databaseSchema}.SUBGRUPOESTRUTURA s ON  
          p.IDSUBGRUPO = s.IDSUBGRUPOESTRUTURA
        INNER JOIN ${databaseSchema}.GRUPOESTRUTURA g ON 
          s.IDGRUPOESTRUTURA = g.IDGRUPOESTRUTURA 
        LEFT JOIN ${databaseSchema}.INVENTARIOMOVIMENTO i ON
          h.IDEMPRESA = i.IDEMPRESA AND h.IDPRODUTO = i.IDPRODUTO 
        WHERE 1 = ? 
      `;

        const params = [1];

        
        if(idMarca > 0) {
            query += ` AND e.IDGRUPOEMPRESARIAL = ?`;
            params.push(idMarca);
        }

        if (idEmpresa > 0) {
            query += ` AND e.IDEMPRESA = ?`;
            params.push(idEmpresa);
        }


        if (grupo > 0) {
            query += ` AND g.IDGRUPOESTRUTURA  = ?`;
            params.push(grupo);
        }

        if (subGrupo > 0) {
            query += ` AND s.IDSUBGRUPOESTRUTURA =  ?`;
            params.push(subGrupo);
        }

        if (descProduto) {
            query += ` AND p.DSNOME LIKE ?`;
            params.push(`%${descProduto}%`);
        }

        if (codBarras) {
            query += ` AND p.NUCODBARRAS = ?`;
            params.push(codBarras);
        }

        if (estoque == 'false') {
          query += ` AND COALESCE(pp.STATIVO, i.STATIVO) = 'True' `;
        } else if (estoque == 'true') {
            query += ` `;
        }
        
        if (dataPesquisaInicio && dataPesquisaFim) {
            query += 'AND h.DTHORAEXECUTADO BETWEEN ? AND ?';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        const offset = (page - 1) * pageSize;
        query += ' ORDER BY h.DTHORAEXECUTADO DESC LIMIT ? OFFSET ?';
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
        console.error('Erro ao executar a consulta de Alteração de Preço:', error);
        throw error;
    }
};