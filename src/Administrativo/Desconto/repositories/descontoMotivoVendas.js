// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getDescontoMotivoVendas = async (idEmpresa, idGrupo, dataPesquisaInicio, dataPesquisaFim, dsMotivoDesc, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        var query = ` 
            SELECT
                V.IDVENDA as "NumeroVenda",
                V.IDEMPRESA,
                E.NOFANTASIA,
                E.IDSUBGRUPOEMPRESARIAL,
                V.DTHORAFECHAMENTO,
                TO_VARCHAR( V.DTHORAFECHAMENTO,'DD/MM/YYYY HH24:MI:SS') AS DTLANCAMENTO,
                (select FIRST_VALUE(T1.NOFUNCIONARIO ORDER BY T1.NOFUNCIONARIO) FROM QUALITY_CONC.FUNCIONARIO T1 WHERE T1.NUCPF = V.DEST_CPF) AS NOFUNCIONARIO, 
                IFNULL (F.NUCPF,V.DEST_CPF) AS NUCPF,
                V.NFE_INFNFE_TOTAL_ICMSTOT_VPROD AS VPROD,
                V.NFE_INFNFE_TOTAL_ICMSTOT_VDESC AS VDESC,
                V.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS VNF,
                V.VRRECDINHEIRO,
                V.VRRECCARTAO,
                V.VRRECPOS,
                V.VRRECCHEQUE,
                V.VRRECVOUCHER,
                V.VRRECCONVENIO,
                V.NFE_INFNFE_TOTAL_ICMSTOT_VPROD AS VRBRUTO,
                V.NFE_INFNFE_TOTAL_ICMSTOT_VDESC AS VRDESCONTO,
                V.VRTOTALPAGO AS VRLIQUIDO,
                V.DEST_CPF
            FROM
                "QUALITY_CONC_HML"."VENDA" V 
        `;

        const params = [];

        if (dsMotivoDesc == 'Convenio') {
            query = `
            SELECT DISTINCT 
                V.IDVENDA as "NumeroVenda",
                V.IDEMPRESA, 
                tbe.NOFANTASIA, 
                tbe.IDSUBGRUPOEMPRESARIAL, 
                V.DTHORAFECHAMENTO,
                TO_VARCHAR( V.DTHORAFECHAMENTO,'DD/MM/YYYY HH24:MI:SS') AS DTLANCAMENTO,
                (select FIRST_VALUE(T1.NOFUNCIONARIO ORDER BY T1.NOFUNCIONARIO) FROM "QUALITY_CONC_HML".FUNCIONARIO T1 WHERE T1.NUCPF = TBDET.NRCPF) AS NOFUNCIONARIO,  
                IFNULL (tbf.NUCPF,tbdet.NRCPF) AS NUCPF, 
                tbdet.IDLOJA,
                V.NFE_INFNFE_TOTAL_ICMSTOT_VPROD AS VPROD,
                V.NFE_INFNFE_TOTAL_ICMSTOT_VDESC AS VDESC,
                V.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS VNF,
                V.VRRECDINHEIRO,
                V.VRRECCARTAO,
                V.VRRECPOS,
                V.VRRECCHEQUE,
                V.VRRECVOUCHER,
                V.VRRECCONVENIO,
                V.NFE_INFNFE_TOTAL_ICMSTOT_VPROD AS VRBRUTO,
                Round(V.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,2) AS VRDESCONTO,
                (select LAST_VALUE(T1.VRLIQUIDO ORDER BY T1.VRLIQUIDO) FROM  "QUALITY_CONC_HML".DETLANCCONVENIO T1 WHERE T1.IDRESUMOVENDAWEB = V.IDVENDA) AS VRLIQUIDO 
            FROM
            	(SELECT IDRESUMOVENDAWEB, NRCPF, VRLIQUIDO, IDLOJA, VRBRUTO FROM  "QUALITY_CONC_HML".DETLANCCONVENIO WHERE STCANCELADO = 'False' GROUP BY IDRESUMOVENDAWEB, NRCPF, VRLIQUIDO, IDLOJA, VRBRUTO) tbdet
            	INNER JOIN (SELECT NUCPF FROM  "QUALITY_CONC_HML".FUNCIONARIO GROUP BY NUCPF) tbf ON tbdet.NRCPF = tbf.NUCPF
            	INNER JOIN  "QUALITY_CONC_HML".VENDA V  ON tbdet.IDRESUMOVENDAWEB =  V.IDVENDA
            	INNER JOIN  "QUALITY_CONC_HML".EMPRESA tbe ON V.IDEMPRESA =  tbe.IDEMPRESA  
        `;
            params.push(dsMotivoDesc);
        }

        

        if (dsMotivoDesc == 'Desconto Funcionario') {
            query += ` LEFT JOIN (SELECT * FROM "QUALITY_CONC_HML".FUNCIONARIO LIMIT 1 ) F ON V.DEST_CPF IN (F.NUCPF) `;
            params.push(dsMotivoDesc);
        }

        query += `   
            LEFT JOIN "QUALITY_CONC_HML".FUNCIONARIO FC ON 
            V.IDOPERADOR = FC.IDFUNCIONARIO
        INNER JOIN "QUALITY_CONC_HML".EMPRESA E ON 
            E.IDEMPRESA = V.IDEMPRESA   
        `;

        query += `
             WHERE 
            1 = ?
           AND V."NFE_INFNFE_TOTAL_ICMSTOT_VDESC">0 
           AND V."STCANCELADO"='False'
        `;

        if (idEmpresa > 0) {
            query += ' AND V.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (idGrupo > 0) {
            query += ' AND E.IDGRUPOEMPRESARIAL = ?';
            params.push(idGrupo);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND (V.DTHORAFECHAMENTO BETWEEN ? AND ?)';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        if (dsMotivoDesc === 'Desconto Funcionario') {
            query += ` 
                AND (V.VRRECCONVENIO IS NULL OR V.VRRECCONVENIO = 0) 
                AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) LIKE 'Desconto efetuado por Colaborador%'
            `;

            params.push(dsMotivoDesc);
        }

        query += ' ORDER BY V.IDEMPRESA, V.DTHORAFECHAMENTO ';
        
        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        

        return {
            page, 
            pageSize,
            rows: result.length, 
            data: result, 
        };
    } catch (error) {
        console.error('Erro ao executar a consulta venda forma pagamento:', error);
        throw error;
    }
};

