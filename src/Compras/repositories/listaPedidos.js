// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getPedidos = async (
    idPedido,
    dataPesquisaFim,
    dataPesquisaInicio,
    idMarca, 
    idFornecedor,
    idFabricante,
    idComprador,
    stSituacaoSap,
    page, 
    pageSize
) => {
    try {
       
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        if(idPedido) {
            var querydetpedido = `
                SELECT 
                    IFNULL(COUNT(DETPED.IDDETALHEPEDIDO), 0) AS TOTALITENS, 
                    IFNULL(SUM(DETPED.QTDTOTAL), 0) AS QTDTOTAL, 
                    IFNULL(SUM(DETPED.VRTOTAL), 0) AS VRTOTAL
                FROM 
                    "${databaseSchema}".DETALHEPEDIDO DETPED
                WHERE 
                    DETPED."STCANCELADO" = 'False' 
                    AND DETPED.IDRESUMOPEDIDO = ?
            `;
            const statement = await conn.prepare(querydetpedido);
            const result = await statement.exec([idPedido]);

            let query2 = `
                 UPDATE "${databaseSchema}"."RESUMOPEDIDO" SET 
                    "NUTOTALITENS" = ?, 
                    "QTDTOTPRODUTOS" = ?, 
                    "VRTOTALBRUTO" = ?, 
                    "VRTOTALLIQUIDO" = ? 
                    WHERE "IDRESUMOPEDIDO" = ?
            `;

            const statement2 = await conn.prepare(query2);
            await statement2.exec([result[0].TOTALITENS, result[0].QTDTOTAL, result[0].VRTOTAL, result[0].VRTOTAL, idPedido]);
        }

        var query =  `
            SELECT
                tbrp.IDRESUMOPEDIDO AS IDPEDIDO,
                tbrp.IDGRUPOEMPRESARIAL AS IDGRUPOPEDIDO,
                tbrp.IDSUBGRUPOEMPRESARIAL AS IDSUBGRUPOPEDIDO,
                IFNULL((SELECT 
                        STRING_AGG(TBD.IDFABRICANTE, ' // ' ORDER BY TBD.IDFABRICANTE) AS IDSFABRICANTE
                    FROM (
                            SELECT 
                                DISTINCT 
                                    FAB.IDFABRICANTE
                            FROM 
                                "${databaseSchema}".DETALHEPEDIDO tbds
                            LEFT JOIN 
                                "${databaseSchema}".FABRICANTE FAB ON FAB.IDFABRICANTE = tbds.IDFABRICANTE
                            WHERE 
                                tbds.IDRESUMOPEDIDO = TBRP.IDRESUMOPEDIDO  
                                AND tbds.STCANCELADO = 'False'
                        ) AS TBD
                ), '') AS IDFABRICANTE,
                IFNULL((SELECT 
                        STRING_AGG(TBD.DSFABRICANTE, ' // ' ORDER BY TBD.IDFABRICANTE) AS DSFABRICANTE
                    FROM (
                            SELECT 
                                DISTINCT 
                                    FAB.IDFABRICANTE,
                                    FAB.DSFABRICANTE
                            FROM 
                                "${databaseSchema}".DETALHEPEDIDO tbds
                            LEFT JOIN 
                                "${databaseSchema}".FABRICANTE FAB ON FAB.IDFABRICANTE = tbds.IDFABRICANTE
                            WHERE 
                                tbds.IDRESUMOPEDIDO = TBRP.IDRESUMOPEDIDO  
                                AND tbds.STCANCELADO = 'False'
                        ) AS TBD
                ), '') AS FABRICANTE,
                EMP.DSSUBGRUPOEMPRESARIAL AS NOFANTASIA,
                EMP.EEMAILFATURAMENTO,
                EMP.NUTELFATURAMENTO,
                EMP.EEMAILCOBRANCA,
                EMP.NUTELCOBRANCA,
                EMP.EEMAILFINANCEIRO,
                EMP.NUTELFINANCEIRO,
                EMP.EEMAILCOMPRAS,
                EMP.NUTELCOMPRAS,
                EMP.EEMAILCADASTRO,
                EMP.NUTELCADASTRO,
                FC.IDFUNCIONARIO AS IDCOMPRADOR,
                FC.NOFUNCIONARIO AS NOMECOMPRADOR,
                CDP.IDCONDICAOPAGAMENTO,
                CDP.DSCONDICAOPAG,
                FN.IDFORNECEDOR AS IDFORNECEDOR,
                FN.NOFANTASIA AS NOFANTASIAFORNECEDOR,
                FN.NORAZAOSOCIAL AS NOFORNECEDOR,
                FN.NUCNPJ AS CNPJFORN,
                FN.NUINSCESTADUAL AS INSCESTFORN,
                FN.EEMAIL AS EMAILFORN,
                FN.NUTELEFONE1 AS FONEFORN,
                FN.EENDERECO AS ENDFORN,
                FN.ENUMERO AS NUMEROFORN,
                FN.ECOMPLEMENTO AS COMPFORN,
                FN.EBAIRRO AS BAIRROFORN,
                FN.ECIDADE AS CIDADEFORN,
                FN.SGUF AS UFFORN,
                FN.NUCEP AS CEPFORN,
                TP.IDTRANSPORTADORA,
                TP.NOFANTASIA AS NOMETRANSPORTADORA,
                AD.IDANDAMENTO,
                AD.DSANDAMENTO,
                AD.DSSETOR,
                tbrp.MODPEDIDO,
                tbrp.NOVENDEDOR,
                tbrp.EEMAILVENDEDOR,
                tbrp.DTPEDIDO AS DTPEDIDONORMAL,
                tbrp.DTPREVENTREGA,
                TO_VARCHAR( tbrp.DTPREVENTREGA, 'YYYY-MM-DD') AS DTPREVENTREGAFORMATADA,
                TO_VARCHAR( tbrp.DTPREVENTREGA, 'DD-MM-YYYY HH24:MI:SS') AS DTENTREGAFORMATADA2,
                tbrp.TPFRETE,
                tbrp.OBSPEDIDO,
                tbrp.OBSPEDIDO2,
                tbrp.DTFECHAMENTOPEDIDO,
                TO_VARCHAR( tbrp.DTFECHAMENTOPEDIDO, 'YYYY-MM-DD') AS DTFECHAMENTOFORMATADA,
                tbrp.DTCADASTRO,
                tbrp.TPARQUIVO,
                tbrp.STDISTRIBUIDO,
                tbrp.STAGRUPAPRODUTO,
                tbrp.STMIGRADOSAP,
                tbrp.LOGSAP,
                TO_VARCHAR( tbrp.DTPEDIDO, 'DD-MM-YYYY HH24:MI:SS') AS DTPEDIDO, 
                TO_VARCHAR( tbrp.DTPEDIDO, 'YYYY-MM-DD') AS DTPEDIDOFORMATADA,
                TO_VARCHAR( tbrp.DTPEDIDO, 'DD/MM/YYYY HH24:MI:SS') AS DTPEDIDOFORMATADABR,
                IFNULL( tbrp.NUTOTALITENS,0) AS NUTOTALITENS,
                IFNULL( tbrp.QTDTOTPRODUTOS,0) AS QTDTOTPRODUTOS,
                IFNULL( tbrp.VRTOTALBRUTO,0) AS VRTOTALBRUTO,
                IFNULL( tbrp.VRTOTALLIQUIDO,0) AS VRTOTALLIQUIDO,
                IFNULL( tbrp.DESCPERC01,0) AS DESCPERC01,
                IFNULL( tbrp.DESCPERC02,0) AS DESCPERC02,
                IFNULL( tbrp.DESCPERC03,0) AS DESCPERC03,
                IFNULL( tbrp.PERCCOMISSAO,0) AS PERCCOMISSAO,
                ( tbrp.TPFISCAL) AS TPFISCAL,
                tbrp.STRASCUNHO,
                tbrp.STCANCELADO
            FROM
                "${databaseSchema}".RESUMOPEDIDO tbrp
            /*INNER JOIN (
                SELECT 
                    *
                FROM
                    "${databaseSchema}".DETALHEPEDIDO 
            ) AS DETP ON DETP.IDRESUMOPEDIDO = TBRP.IDRESUMOPEDIDO*/
            INNER JOIN "${databaseSchema}".SUBGRUPOEMPRESARIAL EMP ON 
                tbrp.IDSUBGRUPOEMPRESARIAL = EMP.IDSUBGRUPOEMPRESARIAL 
            INNER JOIN "${databaseSchema}".ANDAMENTOS AD ON 
                tbrp.IDANDAMENTO = AD.IDANDAMENTO 
            LEFT JOIN "${databaseSchema}".FORNECEDOR FN ON 
                tbrp.IDFORNECEDOR = FN.IDFORNECEDOR 
            INNER JOIN "${databaseSchema}".FUNCIONARIO FC ON 
                tbrp.IDCOMPRADOR = FC.IDFUNCIONARIO 
            LEFT JOIN "${databaseSchema}".TRANSPORTADORA TP ON 
                tbrp.IDTRANSPORTADORA = TP.IDTRANSPORTADORA 
            INNER JOIN "${databaseSchema}".CONDICAOPAGAMENTO CDP ON 
                tbrp.IDCONDICAOPAGAMENTO = CDP.IDCONDICAOPAGAMENTO 
            WHERE
                1 = ? 
        `;
        const params = [1];

        if(idPedido) {
            query += ' AND tbrp.IDRESUMOPEDIDO = ?';
            params.push(idPedido);
        }

        if (idMarca) {
            query += ' AND tbrp.IDSUBGRUPOEMPRESARIAL = ?';
            params.push(idMarca);
        }

        if (idFornecedor) {
            query += ' AND tbrp.IDFORNECEDOR = ?';
            params.push(idFornecedor);
        }

        if (idFabricante) {
            query += `
                 AND tbrp.IDRESUMOPEDIDO IN
                (
                    SELECT DISTINCT
                        IDRESUMOPEDIDO
                    FROM
                        "${databaseSchema}".DETALHEPEDIDO 
                    WHERE 
                        IDFABRICANTE = ? AND STCANCELADO = 'False'
                )
            `;
            params.push(idFabricante);
        }

        if(idComprador) {
            query += ' AND FC.IDFUNCIONARIO = ?';
            params.push(idComprador);
        }

        if(stSituacaoSap === 'False') {
            query += 'And tbrp.STMIGRADOSAP IS NULL And AD.IDANDAMENTO = 5';
        } else if(stSituacaoSap === 'True') {
            query =+ 'And tbrp.STMIGRADOSAP = ? And AD.IDANDAMENTO = 5';
            params.push(stSituacaoSap);
        }

        if (!idPedido && dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND tbrp.DTPEDIDO BETWEEN ? AND ?';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }


        query += ' ORDER BY tbrp.IDRESUMOPEDIDO DESC';
       
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
        console.error('Error executar a consulta lista de pedidos ', error);
        throw error;
    }
};
