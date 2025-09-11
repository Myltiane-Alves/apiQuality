// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getProdutosAvulso = async (
    idDetalhePedidoProduto,
    descricao,
    codBarras,
    dataPesquisaFim,
    dataPesquisaInicio,
    page, 
    pageSize
) => {
    try {
       
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        
        var query = `
           SELECT 
            tbdp.IDDETALHEPRODUTOPEDIDO, 
            SE.IDGRUPOESTRUTURA, 
            tbdp.IDSUBGRUPOESTRUTURA, 
            SE.DSSUBGRUPOESTRUTURA, 
            tbdp.IDCOR, 
            TRIM(CR.DSCOR) AS DSCOR, 
            tbdp.IDTAMANHO, 
            tbdp.DSTAMANHO, 
            tbdp.IDCATEGORIAPEDIDO, 
            CP.TIPOPEDIDO, 
            tbdp.IDTIPOTECIDO, 
            TBT.DSTIPOTECIDO, 
            tbdp.IDESTILO, 
            ES.DSESTILO, 
            tbdp.IDFABRICANTE, 
            FB.DSFABRICANTE, 
            tbdp.IDLOCALEXPOSICAO, 
            LE.DSLOCALEXPOSICAO, 
            CS.IDCATEGORIAS, 
            CS.DSCATEGORIAS, 
            CS.TPCATEGORIAS, 
            tbdp.IDNCM, 
            tbdp.NUNCM, 
            tbdp.IDCEST, 
            tbdp.NUCEST, 
            tbdp.IDTIPOPRODUTOFISCAL, 
            TF.CODTIPOFISCALPRODUTO, 
            TF.DSTIPOFISCALPRODUTO, 
            tbdp.IDFONTEPRODUTOFISAL, 
            TPF.CODTIPOPRODUTO, 
            TPF.DSTIPOPRODUTO, 
            tbdp.IDPRODCADASTRO, 
            tbdp.NUREF, 
            tbdp.CODBARRAS, 
            tbdp.DSPRODUTO, 
            tbdp.QTDPRODUTO, 
            TRIM(tbdp.UND) AS UND, 
            tbdp.VRCUSTO, 
            tbdp.VRVENDA, 
            tbdp.VRTOTALCUSTO, 
            tbdp.VRTOTALVENDA, 
            TO_VARCHAR(tbdp.DTCADASTRO, 'DD-MM-YYYY') AS DTCADASTROFORMAT, 
            tbdp.DTCADASTRO, 
            tbdp.DTULTATUALIZACAO, 
            tbdp.STCADASTRADO, 
            tbdp.STRECEBIDO, 
            tbdp.OBSREF, 
            tbdp.IDDETALHEENTRADA, 
            tbdp.NUNF, 
            tbdp.QTDENTRADANF, 
            tbdp.DTENTRADANF, 
            tbdp.STECOMMERCE, 
            tbdp.STREDESOCIAL, 
            tbdp.STATIVO, 
            tbdp.STCANCELADO, 
            tbdp.STMIGRADOSAP, 
            tbdp.STAVULSO, 
            tbdp.IDGRUPOEMPRESARIAL,
            GE.DSGRUPOEMPRESARIAL,
            tbdp.IDFORNECEDOR, 
            FN.NORAZAOSOCIAL, 
            FN.NOFANTASIA,
            FN.NUCNPJ 
        FROM 
            "${databaseSchema}".DETALHEPRODUTOPEDIDO tbdp 
            LEFT JOIN "${databaseSchema}".COR CR ON tbdp.IDCOR = CR.IDCOR  
            LEFT JOIN "${databaseSchema}".TIPOTECIDOS TBT ON tbdp.IDTIPOTECIDO = TBT.IDTPTECIDO  
            LEFT JOIN "${databaseSchema}".CATEGORIAS CS ON tbdp.IDCATEGORIAS = CS.IDCATEGORIAS  
            LEFT JOIN "${databaseSchema}".CATEGORIAPEDIDO CP ON tbdp.IDCATEGORIAPEDIDO = CP.IDCATEGORIAPEDIDO  
            LEFT JOIN "${databaseSchema}".UNIDADEMEDIDA UN ON tbdp.UND = UN.DSSIGLA  
            LEFT JOIN "${databaseSchema}".ESTILOS ES ON tbdp.IDESTILO = ES.IDESTILO  
            LEFT JOIN "${databaseSchema}".LOCALEXPOSICAO LE ON tbdp.IDLOCALEXPOSICAO = LE.IDLOCALEXPOSICAO  
            LEFT JOIN "${databaseSchema}".SUBGRUPOESTRUTURA SE ON tbdp.IDSUBGRUPOESTRUTURA = SE.IDSUBGRUPOESTRUTURA  
            LEFT JOIN "${databaseSchema}".FABRICANTE FB ON tbdp.IDFABRICANTE = FB.IDFABRICANTE  
            LEFT JOIN "${databaseSchema}".FORNECEDOR FN ON tbdp.IDFORNECEDOR = FN.IDFORNECEDOR  
            LEFT JOIN "${databaseSchema}".GRUPOEMPRESARIAL GE ON tbdp.IDGRUPOEMPRESARIAL = GE.IDGRUPOEMPRESARIAL  
            LEFT JOIN "${databaseSchema}".TIPOFISCALPRODUTO TF ON tbdp.IDTIPOPRODUTOFISCAL = TF.IDTIPOFISCALPRODUTO  
            LEFT JOIN "${databaseSchema}".TIPOPRODUTO TPF ON tbdp.IDFONTEPRODUTOFISAL = TPF.IDTIPOPRODUTO  
        WHERE 
            1 = ?
            AND tbdp.STAVULSO = 'True'
        `;

        const params = [1];

        if(idDetalhePedidoProduto) {
            query += ' AND tbdp.IDDETALHEPRODUTOPEDIDO = ?';
            params.push(idDetalhePedidoProduto);
        }

        if(descricao) {
            query += ' AND tbdp.DSPRODUTO LIKE ?';
            params.push(`%${descricao}%`);
        }
     
        if(codBarras) {
            query += ' AND tbdp.CODBARRAS = ?';
            params.push(codBarras);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND tbdp.DTCADASTRO BETWEEN ? AND ?';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        query += ' ORDER BY tbdp.DTCADASTRO DESC';

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
        console.error('Error executar a consulta detalhe produtos de pedidos ', error);
        throw error;
    }
};

export const updateDetalheProdutoPedido = async (dados) => {
    try {
        const query = `
            UPDATE "${databaseSchema}"."DETALHEPRODUTOPEDIDO" SET 
                "IDCOR" = ?, 
                "IDTAMANHO" = ?, 
                "DSTAMANHO" = ?, 
                "IDCATEGORIAPEDIDO" = ?, 
                "IDTIPOTECIDO" = ?, 
                "IDLOCALEXPOSICAO" = ?, 
                "IDCATEGORIAS" = ?, 
                "NUNCM" = ?, 
                "IDTIPOPRODUTOFISCAL" = ?, 
                "IDFONTEPRODUTOFISAL" = ?, 
                "NUREF" = ?, 
                "DSPRODUTO" = ?, 
                "UND" = ?, 
                "QTDPRODUTO" = ?, 
                "VRCUSTO" = ?, 
                "VRVENDA" = ?, 
                "VRTOTALCUSTO" = ?, 
                "DTCADASTRO" = ?, 
                "DTULTATUALIZACAO" = ?, 
                "STECOMMERCE" = ?, 
                "STREDESOCIAL" = ? 
            WHERE "IDDETALHEPRODUTOPEDIDO" = ? 
        `;

        const statement = await conn.prepare(query);

        for (const dado of dados) {
            const params = [
                dado.IDCOR,
                dado.IDTAMANHO,
                dado.IDCATEGORIAPEDIDO,
                dado.IDTIPOTECIDO,
                dado.IDLOCALEXPOSICAO,
                dado.IDCATEGORIAS,
                dado.NUNCM,
                dado.IDTIPOPRODUTOFISCAL,
                dado.IDFONTEPRODUTOFISAL,
                dado.NUREF,
                dado.DSPRODUTO,
                dado.UND,
                dado.QTDPRODUTO,
                dado.VRCUSTO,
                dado.VRVENDA,
                dado.VRTOTALCUSTO,
                dado.DTCADASTRO,
                dado.DTULTATUALIZACAO,
                dado.STECOMMERCE,
                dado.STREDESOCIAL,
                dado.IDDETALHEPRODUTOPEDIDO
            ];
            
            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Detalhe Pedido Atualizado com sucesso',
        };
    } catch (e) {
        throw new Error(`Erro ao atualizar Detalhe Pedido: ${e.message}`);
    }
};



export const createDetalheProdutoPedido = async (dados) => {
    try {
        if (!Array.isArray(dados) || dados.length === 0) {
            throw new Error("O objeto enviado está vazio, verifique e tente novamente!");
        }


        const queryInsert = `
            INSERT INTO "${databaseSchema}"."DETALHEPRODUTOPEDIDO" (
                "IDDETALHEPRODUTOPEDIDO",
                "IDGRUPOESTRUTURA",
                "IDSUBGRUPOESTRUTURA",
                "IDCOR",
                "IDTAMANHO",
                "DSTAMANHO",
                "IDCATEGORIAPEDIDO",
                "IDTIPOTECIDO",
                "IDESTILO",
                "IDFABRICANTE",
                "IDLOCALEXPOSICAO",
                "IDCATEGORIAS",
                "IDNCM",
                "NUNCM",
                "IDTIPOPRODUTOFISCAL",
                "IDFONTEPRODUTOFISAL",
                "NUREF",
                "CODBARRAS",
                "DSPRODUTO",
                "UND",
                "QTDPRODUTO",
                "VRCUSTO",
                "VRVENDA",
                "VRTOTALCUSTO",
                "DTCADASTRO",
                "DTULTATUALIZACAO",
                "STCADASTRADO",
                "STECOMMERCE",
                "STREDESOCIAL",
                "STATIVO",
                "STCANCELADO",
                "QTDESTOQUEIDEAL",
                "STMIGRADOSAP",
                "STAVULSO",
                "IDGRUPOEMPRESARIAL",
                "IDFORNECEDOR"
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'False', ?, ?, ?, ?, ?, ?, ?
            )
        `;

        const statement = await conn.prepare(queryInsert);

        for (const registro of dados) {
            if (!registro.PRODUTOSDETALHE || registro.PRODUTOSDETALHE.length === 0) {
                throw new Error("O objeto que contém os detalhes dos produtos está vazio!");
            }

            // Query para verificar detalhe do pedido
            const queryDetPedido = `
                SELECT
                    TBR.IDRESUMOPEDIDO,
                    TBD.IDDETALHEPEDIDO,
                    TBR.IDFORNECEDOR,
                    TBD.IDSUBGRUPOESTRUTURA
                FROM
                    "${databaseSchema}".DETALHEPEDIDO TBD
                INNER JOIN "${databaseSchema}".RESUMOPEDIDO TBR 
                    ON TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
                WHERE
                    TBD.STCANCELADO <> 'True' 
                    AND TBR.STCANCELADO <> 'True'
                    AND TBD.IDRESUMOPEDIDO = ?
                    AND TBD.IDDETALHEPEDIDO = ?
            `;

            const detPedido = await conn.exec(queryDetPedido, [registro.IDRESUMOPEDIDO, registro.IDDETALHEPEDIDO]);

            if (detPedido.length === 0) {
                throw new Error(`Detalhe do pedido não encontrado ou cancelado | IDDETALHEPEDIDO: ${registro.IDDETALHEPEDIDO}`);
            }

            const { IDSUBGRUPOESTRUTURA: idSubgrupo, IDFORNECEDOR: idFornecedor } = detPedido[0];

            for (const detProd of registro.PRODUTOSDETALHE) {
                const codBarras = detProd.reposicao === 'True' ? detProd.codbarra : null;

                const params = [
                    registro.IDDETALHEPEDIDO,
                    registro.IDSUBGRUPOESTRUTURA,
                    registro.IDCOR,
                    Number(detProd.idtamanho),
                    detProd.tamanho,
                    registro.IDCATEGORIAPEDIDO,
                    registro.IDTIPOTECIDO,
                    registro.IDESTILO,
                    registro.IDFABRICANTE,
                    registro.IDLOCALEXPOSICAO,
                    registro.IDCATEGORIAS,
                    registro.IDNCM,
                    registro.NUNCM,
                    registro.IDTIPOPRODUTOFISCAL,
                    registro.IDFONTEPRODUTOFISAL,
                    detProd.idproduto,
                    registro.NUREF,
                    codBarras,
                    detProd.dsproduto,
                    detProd.unidade,
                    detProd.quantidade,
                    detProd.vrunitario,
                    detProd.vrvendas,
                    detProd.vrtotal,
                    registro.STECOMMERCE,
                    registro.STREDESOCIAL,
                    registro.STATIVO,
                    registro.STCANCELADO,
                    registro.QTDESTOQUEIDEAL,
                    registro.IDRESUMOPEDIDO,
                    registro.STMIGRADOSAP,
                    detProd.reposicao,
                    registro.IDRESPCADASTRO,
                    registro.IDRESPAUTORIZAEDITCAD,
                    idFornecedor,
                ];

                await statementInsert.exec(params);
            }
            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Detalhe Pedido Atualizado com sucesso',
        };
    } catch (e) {
        throw new Error(`Erro ao atualizar Detalhe Pedido: ${e.message}`);
    }
};
