// import conn from "../../config/dbConnection.js";
import 'dotenv/config';

const databaseSchema = process.env.HANA_DATABASE;

export const getProdutoPromocao = async (idProduto, codeBarsOuNome, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT DISTINCT
                tbp.IDPRODUTO,
                tbp.NUCODBARRAS,
                tbp.DSNOME,
                tbp.PRECOCUSTO,
                (CASE WHEN IFNULL(tbpp.PRECO_VENDA, 0) = 0 THEN tbp.PRECOVENDA ELSE tbpp.PRECO_VENDA END) AS PRECOVENDA
            FROM 
                "${databaseSchema}".EMPRESA tbe
                INNER JOIN "${databaseSchema}".PRODUTO tbp 
                    ON tbe.IDGRUPOEMPRESARIAL = tbp.IDGRUPOEMPRESARIAL 
                    OR tbp.IDGRUPOEMPRESARIAL IS NULL 
                    OR tbp.IDGRUPOEMPRESARIAL = 0
                INNER JOIN "${databaseSchema}".NCM tbn 
                    ON tbp.NUNCM = tbn.NUNCM AND tbe.SGUF = tbn.SGUF
                LEFT JOIN "${databaseSchema}".PRODUTO_PRECO tbpp 
                    ON tbpp.IDPRODUTO = tbp.IDPRODUTO
            WHERE 1 = 1
        `;

        const params = [];


        if (idProduto) {
            query += ` AND tbp.IDPRODUTO = ?`;
            params.push(idProduto);
        }

        if (codeBarsOuNome) {
            query += ` AND (tbp.NUCODBARRAS = ? OR tbp.DSNOME LIKE ?)`;
            params.push(codeBarsOuNome, `%${codeBarsOuNome}%`);
        }


        query += ` ORDER BY tbp.IDPRODUTO LIMIT ? OFFSET ?`;
        const offset = (page - 1) * pageSize;
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
        console.error('Erro ao executar a consulta produto promoção', error);
        throw error;
    }
};

export const updateProdutoPromocao = async (dados) => {
    try {
        
        const query = `
            UPDATE "${databaseSchema}"."PRODUTO" SET 
            "IDPRODUTO" = ?, 
            "IDGRUPOEMPRESARIAL" = ?, 
            "NUNCM" = ?, 
            "NUCEST" = ?, 
            "NUCST_ICMS" = ?, 
            "NUCFOP" = ?, 
            "PERC_OUT" = ?, 
            "NUCODBARRAS" = ?, 
            "DSNOME" = ?, 
            "STGRADE" = ?, 
            "UND" = ?, 
            "PRECOCUSTO" = ?, 
            "PRECOVENDA" = ?, 
            "QTDENTRADA" = ?, 
            "QTDCOMERCIALIZADA" = ?, 
            "QTDPERDA" = ?, 
            "QTDDISPONIVEL" = ?, 
            "PERCICMS" = ?, 
            "PERCISS" = ?, 
            "PERCPIS" = ?, 
            "PERCCOFINS" = ?, 
            "COD_CSOSN" = ?, 
            "PERCCSOSC" = ?, 
            "NUCST_IPI" = ?, 
            "NUCST_PIS" = ?, 
            "NUCST_COFINS" = ?, 
            "PERCIPI" = ?, 
            "DTULTALTERACAO" = ?, 
            "STPESAVEL" = ?, 
            "GRP_MATERIAIS" = ? 
            WHERE "ID" = ? 
        `;

        const statement = await conn.prepare(query);

        for(const registro of dados) {
          
            const params = [
                registro.IDPRODUTO,
                registro.IDGRUPOEMPRESARIAL,
                registro.NUNCM,
                registro.NUCEST,
                registro.NUCST_ICMS,
                registro.NUCFOP,
                registro.PERC_OUT,
                registro.NUCODBARRAS,
                registro.DSNOME,
                registro.STGRADE,
                registro.UND,
                registro.PRECOCUSTO,
                registro.PRECOVENDA,
                registro.QTDENTRADA,
                registro.QTDCOMERCIALIZADA,
                registro.QTDPERDA,
                registro.QTDDISPONIVEL,
                registro.PERCICMS,
                registro.PERCISS,
                registro.PERCPIS,
                registro.PERCCOFINS,
                registro.COD_CSOSN,
                registro.PERCCSOSC,
                registro.NUCST_IPI,
                registro.NUCST_PIS,
                registro.NUCST_COFINS,
                registro.PERCIPI,
                registro.DTULTALTERACAO,
                registro.STPESAVEL,
                registro.GRP_MATERIAIS,
                registro.ID
            ]
            await statement.exec(params);
        }
        
        conn.commit();
        return {
            status: 'success',
            message: 'Produto Promoção atualizadas com sucesso'
        }
    } catch (error) {
        console.error('Erro ao executar a atualização do produto promoção:', error);
        throw error;
    }
}

export const incluirDetalhePromocao = async (dados, idPromocao) => {
    try {
        const query = `
            INSERT INTO "${databaseSchema}"."DETALHEPROMOCAO" 
            (
            "IDDETALHEPROMO", 
            "IDRESUMOPROMO", 
            "IDPRODUTO"
            ) 
            VALUES (?, ?, ?)
        `;


        const statement = await conn.prepare(query);

        if (Array.isArray(dados)) {
            for (const idProduto of dados) {
                const idQuery = `SELECT IFNULL(MAX(TO_INT("IDDETALHEPROMO")),0) + 1 AS novoId FROM "${databaseSchema}"."DETALHEPROMOCAO" WHERE 1 = 1`;
                const idResult = await conn.exec(idQuery);
                const novoId = idResult[0].NOVOID;

                const params = [
                    novoId,
                    idPromocao,
                    idProduto
                ];
     
                await statement.exec(params);
            }
        } else {
            console.error("Erro: 'dados' não é uma lista de detalhe promoção.");
            throw new TypeError("dados precisa ser um array .");
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Produto(s) incluído(s) com sucesso na promoção'
        };
    } catch (error) {
        console.error('Erro ao executar a inclusão do Produto na Promoção:', error);
        throw error;
    }
};

export const incluirDetalheEmpresaPromocao = async (idPromocao, idGrupo, listEmpresas) => {
    try {
        const query = `
            INSERT INTO "${databaseSchema}"."DETALHEEMPPROMO" 
            (
                "IDDETALHEEMPPROMO", 
                "IDRESUMOPROMO", 
                "IDGRUPO", 
                "IDEMPRESA", 
                "STATIVO"
            ) 
            VALUES (?, ?, ?, ?, 'True')
        `;

        const statement = await conn.prepare(query);


        if (Array.isArray(listEmpresas)) {
            for (const idEmpresa of listEmpresas) {
                const idQuery = `SELECT IFNULL(MAX(TO_INT("IDDETALHEEMPPROMO")),0) + 1 AS novoId FROM "${databaseSchema}"."DETALHEEMPPROMO" WHERE 1 = 1`;
                const idResult = await conn.exec(idQuery);
                const novoId = idResult[0].NOVOID;

         
                const params = [
                    novoId,         
                    idPromocao,    
                    idGrupo,       
                    idEmpresa       
                ];

                
                await statement.exec(params);
            }
        } else {
            console.error("Erro: 'listEmpresas' não é uma lista de empresas.");
            throw new TypeError("listEmpresas precisa ser um array de IDs de empresas.");
        }

     
        conn.commit();
        return {
            status: 'success',
            message: 'Empresa(s) incluída(s) com sucesso na promoção'
        };
    } catch (error) {
        console.error('Erro ao executar a inclusão de Empresa na Promoção:', error);
        throw error;
    } finally {
        conn.close();
    }
};

export const createProdutoPromocao = async (dados) => {
    try {
        const queryId = `SELECT IFNULL(MAX(TO_INT("IDRESUMOPROMO")),0) + 1 AS novoId FROM "${databaseSchema}"."RESUMOPROMOCAO" WHERE 1 = 1`;
        const idResult = await conn.exec(queryId);

        if (!idResult || !Array.isArray(idResult) || !idResult.length) {
            throw new Error('Erro ao gerar o ID para IDRESUMOPROMO.');
        }

        const idPromocao = idResult[0].NOVOID;

        const query = `
            INSERT INTO "${databaseSchema}"."RESUMOPROMOCAO" 
            (
                "IDRESUMOPROMO", 
                "DSPROMO", 
                "VRPERCDESCONTO", 
                "VRPRECODESCONTO", 
                "VRAPARTIRDE", 
                "VRLIMITEDE", 
                "QTDAPARTIRDE", 
                "QTDLIMITEDE", 
                "DTINICIOPROMO", 
                "DTFIMPROMO", 
                "STATIVO"
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const statement = await conn.prepare(query);

        for (const registro of dados) {
            const params = [
                idPromocao,
                registro.DSPROMO,
                registro.VRPERCDESCONTO,
                registro.VRPRECODESCONTO,
                registro.VRAPARTIRDE,
                registro.VRLIMITEDE,
                registro.QTDAPARTIRDE,
                registro.QTDLIMITEDE,
                registro.DTINICIOPROMO,
                registro.DTFIMPROMO,
                registro.STATIVO
            ];
            await statement.exec(params);

            // if (Array.isArray(registro.PRODUTOS) && registro.PRODUTOS.length > 0) {
            //     await incluirDetalhePromocao(registro.PRODUTOS, idPromocao);
            // } 

            // if (Array.isArray(registro.EMPRESAS) && registro.EMPRESAS.length > 0) {
            //     await incluirDetalheEmpresaPromocao(idPromocao, registro.IDGRUPO, registro.EMPRESAS);
            // } 
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Produto Promoção incluída com sucesso'
        };
    } catch (error) {
        console.error('Erro ao executar a inclusão do Produto Promoção:', error);
        throw error;
    } finally {
        conn.close(); // Fechar a conexão aqui
    }
};

// IDRESUMOPROMO: undefined
// Novo ID para IDRESUMOPROMO: undefined

