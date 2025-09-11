// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getDescontoVendaSimplificado = async (idEmpresa, idMarca, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        let query
        if (dataPesquisaInicio < '2022-11-01' || dataPesquisaFim < '2022-11-01') {
            query = ` 
                SELECT 
                    E.NOFANTASIA, 
                    V.IDEMPRESA, 
                    TO_DECIMAL(sum(V.VRRECDINHEIRO),12,2) as VRRECDINHEIRO, 
                    TO_DECIMAL(sum(V.VRRECCARTAO),12,2) as VRRECCARTAO, 
                    TO_DECIMAL(sum(V.VRRECCONVENIO),12,2) as VRRECCONVENIO, 
                    TO_DECIMAL(sum(V.VRRECPOS),12,2) as VRRECPOS, 
                    TO_DECIMAL(sum(V.VRRECVOUCHER),12,2) as VRRECVOUCHER, 
                    TO_DECIMAL(sum(V.VRTOTALPAGO),12,2) as VRTOTALPAGO, 
                    TO_DECIMAL(V.NFE_INFNFE_TOTAL_ICMSTOT_VPROD,12,2) as ValorTotalProdutoBruto,
                    TO_DECIMAL(V.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,12,2) as VrDesconto, 
                    TO_DECIMAL(V.NFE_INFNFE_TOTAL_ICMSTOT_VNF,12,2) as TotalLiquido, 
                    (SELECT IFNULL(ROUND(SUM(S1.NFE_INFNFE_TOTAL_ICMSTOT_VDESC),12,2),0)
                        FROM
                            ${databaseSchema}.VENDA S1
                        WHERE S1.IDEMPRESA = V.IDEMPRESA AND S1.NFE_INFNFE_TOTAL_ICMSTOT_VDESC > 0 AND (((S1.NFE_INFNFE_TOTAL_ICMSTOT_VDESC/S1.NFE_INFNFE_TOTAL_ICMSTOT_VPROD)*100)>=20)
                        AND (S1.DTHORAABERTURA BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59')
                    GROUP BY S1.IDEMPRESA
                    ) AS VLTOTALDESCONTOFUNCIONARIO,
                    (SELECT IFNULL(ROUND(SUM(S2.NFE_INFNFE_TOTAL_ICMSTOT_VDESC),12,2),0)
                        FROM
                            ${databaseSchema}.VENDA S2
                        WHERE S2.IDEMPRESA = V.IDEMPRESA AND S2.NFE_INFNFE_TOTAL_ICMSTOT_VDESC > 0 AND (((S2.NFE_INFNFE_TOTAL_ICMSTOT_VDESC/S2.NFE_INFNFE_TOTAL_ICMSTOT_VPROD)*100)<19)
                        AND (S2.DTHORAABERTURA BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59')
                    GROUP BY S2.IDEMPRESA
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
                SELECT
                    E.NOFANTASIA,
                    V.IDEMPRESA,
                    TO_DECIMAL(sum(V.VRRECDINHEIRO),12,2) as VRRECDINHEIRO,
                    TO_DECIMAL(sum(V.VRRECCARTAO),12,2) as VRRECCARTAO,
                    TO_DECIMAL(sum(V.VRRECCONVENIO),12,2) as VRRECCONVENIO,
                    TO_DECIMAL(sum(V.VRRECPOS),12,2) as VRRECPOS,
                    TO_DECIMAL(sum(V.VRRECVOUCHER),12,2) as VRRECVOUCHER,
                    TO_DECIMAL(sum(V.VRTOTALPAGO),12,2) as VRTOTALPAGO,
                    TO_DECIMAL(sum(V.NFE_INFNFE_TOTAL_ICMSTOT_VPROD),12,2) as ValorTotalProdutoBruto,
                    TO_DECIMAL(sum(V.NFE_INFNFE_TOTAL_ICMSTOT_VDESC),12,2) as VrDesconto,
                    TO_DECIMAL(sum(V.NFE_INFNFE_TOTAL_ICMSTOT_VNF),12,2) as TotalLiquido,
                    (SELECT SUM(total_desconto)
                        FROM (
                            SELECT
                                ROUND(SUM(IFNULL(tbv.NFE_INFNFE_TOTAL_ICMSTOT_VDESC, 0)), 2) AS total_desconto
                            FROM
                                (SELECT IDRESUMOVENDAWEB, NRCPF FROM "${databaseSchema}".DETLANCCONVENIO GROUP BY IDRESUMOVENDAWEB, NRCPF) as tbd
                            INNER JOIN "${databaseSchema}".VENDA tbv ON
                                tbd.IDRESUMOVENDAWEB = tbv.IDVENDA
                            INNER JOIN "${databaseSchema}".EMPRESA tbe ON
                                tbe.IDEMPRESA = tbv.IDEMPRESA
                            INNER JOIN (SELECT NUCPF FROM "${databaseSchema}".FUNCIONARIO GROUP BY NUCPF) AS tbf ON tbf.NUCPF = tbd.NRCPF
                            WHERE
                                tbv.IDEMPRESA = V.IDEMPRESA
                                AND tbv.DTHORAFECHAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59'
                                AND (tbv.NFE_INFNFE_TOTAL_ICMSTOT_VDESC > 0 OR tbv.VRTOTALDESCONTO > 0)
                                AND tbv.STCANCELADO = 'False'
                            UNION ALL
                            SELECT
                                ROUND(SUM(IFNULL(tbv.NFE_INFNFE_TOTAL_ICMSTOT_VDESC, 0)), 2) AS total_desconto
                            FROM
                                "${databaseSchema}".VENDA tbv
                                INNER JOIN (SELECT NUCPF FROM "${databaseSchema}".FUNCIONARIO GROUP BY NUCPF) AS tbf ON tbf.NUCPF = tbv.DEST_CPF
                                INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbv.IDEMPRESA = tbe.IDEMPRESA
                                LEFT JOIN "${databaseSchema}".DETLANCCONVENIO tbdet ON tbdet.IDRESUMOVENDAWEB = tbv.IDVENDA
                            WHERE
                                tbv.IDEMPRESA = V.IDEMPRESA
                                AND tbv.DTHORAFECHAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59'
                                AND tbv.STCANCELADO = 'False'
                                AND tbv.NFE_INFNFE_TOTAL_ICMSTOT_VDESC > 0
                                AND (SUBSTRING(tbv.TXTMOTIVODESCONTO, 0, 37) = 'Desconto efetuado por Colaborador CPF')
                                AND tbdet.IDRESUMOVENDAWEB IS NULL
                        )) AS VLTOTALDESCONTOFUNCIONARIO,
                    (SELECT IFNULL(ROUND(SUM(S2.NFE_INFNFE_TOTAL_ICMSTOT_VDESC),2),0)
                        FROM
                            ${databaseSchema}.VENDA S2
                        WHERE S2.IDEMPRESA = V.IDEMPRESA AND S2.NFE_INFNFE_TOTAL_ICMSTOT_VDESC > 0 AND SUBSTRING(S2.TXTMOTIVODESCONTO,0,37)!='Desconto efetuado por Colaborador CPF' AND TO_VARCHAR(S2.TXTMOTIVODESCONTO)!=''
                        AND (S2.DTHORAABERTURA BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59')  AND S2."STCANCELADO"='False'
                    GROUP BY S2.IDEMPRESA
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
            query += ' AND (V.DTHORAABERTURA BETWEEN ? AND ?)';
            params.push(dataPesquisaInicio + ' 00:00:00', dataPesquisaFim + ' 23:59:59');
        }

       
        query += 'GROUP BY E.NOFANTASIA, V."IDEMPRESA"'
        query += 'ORDER BY  V.IDEMPRESA'
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, (page - 1) * pageSize);
        
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