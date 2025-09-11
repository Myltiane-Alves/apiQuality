// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getDescontoVendas = async (idEmpresa, idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        let query
        if (dataPesquisaInicio < '2022-11-01' || dataPesquisaFim < '2022-11-01') {
            query = ` 
                SELECT 
                    CX.DSCAIXA AS DSCAIXAFECHAMENTO, 
                    FC.NOLOGIN AS MATOPERADORFECHAMENTO, 
                    FC.NOFUNCIONARIO AS OPERADORFECHAMENTO, 
                    E.NOFANTASIA, 
                    V.IDVENDA, 
                    V.IDCAIXAWEB, 
                    V.IDEMPRESA, 
                    TO_DECIMAL(V.VRRECDINHEIRO,12,2) as VRRECDINHEIRO, 
                    TO_DECIMAL(V.VRRECCARTAO,12,2) as VRRECCARTAO, 
                    TO_DECIMAL(V.VRRECCONVENIO,12,2) as VRRECCONVENIO, 
                    TO_DECIMAL(V.VRRECPOS,12,2) as VRRECPOS, 
                    TO_DECIMAL(V.VRRECVOUCHER,12,2) as VRRECVOUCHER, 
                    TO_DECIMAL(V.VRTOTALPAGO,12,2) as VRTOTALPAGO, 
                    TO_VARCHAR( V.DTHORAFECHAMENTO, 'DD-MM-YYYY HH24:MI:SS') AS DTHORAFECHAMENTO, 
                    TO_DECIMAL(V.NFE_INFNFE_TOTAL_ICMSTOT_VPROD,12,2) as ValorTotalProdutoBruto,
                    TO_DECIMAL(V.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,12,2) as VrDesconto, 
                    TO_DECIMAL(V.NFE_INFNFE_TOTAL_ICMSTOT_VNF,12,2) as TotalLiquido, 
                    (SELECT IFNULL(ROUND(SUM(S1.NFE_INFNFE_TOTAL_ICMSTOT_VDESC),12,2),0)
                        FROM
                            ${databaseSchema}.VENDA S1
                        WHERE S1.IDVENDA = V.IDVENDA AND S1.NFE_INFNFE_TOTAL_ICMSTOT_VDESC > 0 AND (((S1.NFE_INFNFE_TOTAL_ICMSTOT_VDESC/S1.NFE_INFNFE_TOTAL_ICMSTOT_VPROD)*100)>=20)
                    GROUP BY S1.IDVENDA
                    ) AS VLTOTALDESCONTOFUNCIONARIO,
                    (SELECT IFNULL(ROUND(SUM(S2.NFE_INFNFE_TOTAL_ICMSTOT_VDESC),12,2),0)
                        FROM
                            ${databaseSchema}.VENDA S2
                        WHERE S2.IDVENDA = V.IDVENDA AND S2.NFE_INFNFE_TOTAL_ICMSTOT_VDESC > 0 AND (((S2.NFE_INFNFE_TOTAL_ICMSTOT_VDESC/S2.NFE_INFNFE_TOTAL_ICMSTOT_VPROD)*100)<=19)
                    GROUP BY S2.IDVENDA
                    )AS VLTOTALDESCONTOCLIENTE,
                    (SELECT IFNULL(SUM(S3.NFE_INFNFE_TOTAL_ICMSTOT_VPROD),0)
                        FROM
                            ${databaseSchema}.VENDA S3
                        WHERE (S3.DTHORAABERTURA BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59') AND S3."STCANCELADO"='False' 
                    )AS VLTOTALVENDIDO
                FROM 
                    "${databaseSchema}"."VENDA" V 
                    LEFT JOIN "${databaseSchema}".CAIXA CX ON V.IDCAIXAWEB = CX.IDCAIXAWEB  
                    LEFT JOIN "${databaseSchema}".FUNCIONARIO FC ON V.IDOPERADOR = FC.IDFUNCIONARIO  
                    INNER JOIN "${databaseSchema}".EMPRESA E ON E.IDEMPRESA = V.IDEMPRESA  
                WHERE 
                    1 = ?
                    AND V."NFE_INFNFE_TOTAL_ICMSTOT_VDESC">0 
                    AND V."STCANCELADO"='False' 
            `;
        } else {
            query = `
                SELECT DISTINCT
                    CX.DSCAIXA AS DSCAIXAFECHAMENTO,
                    FC.NOFUNCIONARIO AS OPERADORFECHAMENTO,
                    E.NOFANTASIA,
                    V.IDVENDA,
                    V.IDCAIXAWEB,
                    V.IDEMPRESA,
                    TO_DECIMAL(V.VRRECDINHEIRO,12,2) as VRRECDINHEIRO,
                    TO_DECIMAL(V.VRRECCARTAO,12,2) as VRRECCARTAO,
                    TO_DECIMAL(V.VRRECCONVENIO,12,2) as VRRECCONVENIO,
                    TO_DECIMAL(V.VRRECPOS,12,2) as VRRECPOS,
                    TO_DECIMAL(V.VRRECVOUCHER,12,2) as VRRECVOUCHER,
                    TO_DECIMAL(V.VRTOTALPAGO,12,2) as VRTOTALPAGO,
                    TO_VARCHAR(V.DTHORAFECHAMENTO, 'DD-MM-YYYY HH24:MI:SS') AS DTHORAFECHAMENTO,
                    TO_DECIMAL(V.NFE_INFNFE_TOTAL_ICMSTOT_VPROD,12,2) as ValorTotalProdutoBruto,
                    TO_DECIMAL(V.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,12,2) as VrDesconto,
                    TO_DECIMAL(V.NFE_INFNFE_TOTAL_ICMSTOT_VNF,12,2) as TotalLiquido,
                    (SELECT SUM(total_desconto)
                        FROM (
                            SELECT DISTINCT
                                tbd.IDRESUMOVENDAWEB,
                                ROUND(SUM(IFNULL(tbv.NFE_INFNFE_TOTAL_ICMSTOT_VDESC, 0)), 2) AS total_desconto
                            FROM
                                (SELECT IDRESUMOVENDAWEB, NRCPF FROM "${databaseSchema}".DETLANCCONVENIO GROUP BY IDRESUMOVENDAWEB, NRCPF) as tbd
                            INNER JOIN "${databaseSchema}".VENDA tbv ON
                                tbd.IDRESUMOVENDAWEB = tbv.IDVENDA
                            INNER JOIN "${databaseSchema}".EMPRESA tbe ON
                                tbe.IDEMPRESA = tbv.IDEMPRESA
                            INNER JOIN (SELECT NUCPF FROM "${databaseSchema}".FUNCIONARIO GROUP BY NUCPF) AS tbf ON tbf.NUCPF = tbd.NRCPF
                            WHERE
                                tbv.IDVENDa = V.IDVENDA
                                AND tbv.DTHORAFECHAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59'
                                AND (tbv.NFE_INFNFE_TOTAL_ICMSTOT_VDESC > 0 OR tbv.VRTOTALDESCONTO > 0)
                                AND tbv.STCANCELADO = 'False'
                            GROUP BY
                                tbd.IDRESUMOVENDAWEB
                    UNION ALL
                            SELECT (tbv.IDVENDA),
                                ROUND(SUM(IFNULL(tbv.NFE_INFNFE_TOTAL_ICMSTOT_VDESC, 0)), 2) AS total_desconto
                            FROM
                                "${databaseSchema}".VENDA tbv
                                INNER JOIN (SELECT NUCPF FROM "${databaseSchema}".FUNCIONARIO GROUP BY NUCPF) AS tbf ON tbf.NUCPF = tbv.DEST_CPF
                                INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbv.IDEMPRESA = tbe.IDEMPRESA
                                LEFT JOIN "${databaseSchema}".DETLANCCONVENIO tbdet ON tbdet.IDRESUMOVENDAWEB = tbv.IDVENDA
                            WHERE
                                tbv.IDVENDa = V.IDVENDA
                                AND tbv.DTHORAFECHAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59'
                                AND tbv.STCANCELADO = 'False'
                                AND tbv.NFE_INFNFE_TOTAL_ICMSTOT_VDESC > 0
                                AND (SUBSTRING( tbv.TXTMOTIVODESCONTO, 0, 37) = 'Desconto efetuado por Colaborador CPF')
                                AND tbdet.IDRESUMOVENDAWEB IS NULL
                        GROUP BY
                                tbv.idvenda
                        )) AS VLTOTALDESCONTOFUNCIONARIO,
                    (SELECT IFNULL(ROUND(SUM(S2.NFE_INFNFE_TOTAL_ICMSTOT_VDESC),2),0)
                    FROM
                        QUALITY_CONC.VENDA S2
                    WHERE S2.IDVENDA = V.IDVENDA AND S2.NFE_INFNFE_TOTAL_ICMSTOT_VDESC > 0 AND SUBSTRING(S2.TXTMOTIVODESCONTO,0,37)!='Desconto efetuado por Colaborador CPF' AND TO_VARCHAR(S2.TXTMOTIVODESCONTO)!=''
                GROUP BY S2.IDVENDA
                )AS VLTOTALDESCONTOCLIENTE,
                    (SELECT IFNULL(SUM(S3.NFE_INFNFE_TOTAL_ICMSTOT_VPROD),0)
                    FROM
                        QUALITY_CONC.VENDA S3
                    WHERE (S3.DTHORAFECHAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59') AND S3."STCANCELADO"='False'
                )AS VLTOTALVENDIDO
                FROM
                    "${databaseSchema}"."VENDA" V
                LEFT JOIN "${databaseSchema}".CAIXA CX ON V.IDCAIXAWEB = CX.IDCAIXAWEB
                LEFT JOIN "${databaseSchema}".FUNCIONARIO FC ON V.IDOPERADOR = FC.IDFUNCIONARIO
                INNER JOIN "${databaseSchema}".EMPRESA E ON E.IDEMPRESA = V.IDEMPRESA
                WHERE
                    1 = ?
                AND V."NFE_INFNFE_TOTAL_ICMSTOT_VDESC">0
                AND V."STCANCELADO"='False'
            `;
        }
        const params = [1];

        if (idEmpresa > 0) {
            query += ' AND V.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (idMarca > 0) {
            query += ' AND E.IDGRUPOEMPRESARIAL = ?';
            params.push(idMarca);
        }


        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND (V.DTHORAFECHAMENTO  BETWEEN ? AND ?)';
            params.push(dataPesquisaInicio + ' 00:00:00', dataPesquisaFim + ' 23:59:59');
        }

        query += `GROUP BY CX.DSCAIXA,FC.NOLOGIN, V.IDOPERADOR,FC.NOFUNCIONARIO,E.NOFANTASIA, V."IDVENDA",V."IDCAIXAWEB",V."IDEMPRESA",V."NFE_INFNFE_TOTAL_ICMSTOT_VPROD",V."NFE_INFNFE_TOTAL_ICMSTOT_VDESC",V."NFE_INFNFE_TOTAL_ICMSTOT_VNF",V."VRRECDINHEIRO",V."VRRECCARTAO",V."VRRECCONVENIO",V."VRRECPOS",V."VRRECVOUCHER",V."VRTOTALPAGO",V."DTHORAFECHAMENTO"`
        query += 'ORDER BY  V.IDEMPRESA, V.DTHORAFECHAMENTO'

        const statement = conn.prepare(query);
        const result = statement.exec(params);

        return {
            page,
            pageSize,
            rows: result.length,
            data: result
        }
    } catch (e) {
        throw new Error(e.message);
    }
}