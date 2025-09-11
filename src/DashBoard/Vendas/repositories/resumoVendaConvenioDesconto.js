// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getResumoVendaConvenioDesconto = async (statusCancelado, idVenda, idEmpresa, idFuncionario, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
  
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;


        let query = `
            SELECT
                TBE.NOFANTASIA,
                TBC.IDCAIXAWEB,
                TBC.DSCAIXA,
                TBV.IDVENDA,
                TBF.NOFUNCIONARIO,
                TBFC.NOFUNCIONARIO AS NOCONVENIADO,
                TBFC.NUCPF AS CPFCONVENIADO,
                TBV.DEST_CPF,
                TBV.IDMOVIMENTOCAIXAWEB,
                TBV.NFE_INFNFE_IDE_SERIE,
                TBV.NFE_INFNFE_TOTAL_ICMSTOT_VPROD AS VRBRUTOPAGO,
                TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC AS VRDESPAGO,
                TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS VRLIQPAGO,
                TBV.PROTNFE_INFPROT_CHNFE,
                TBV.PROTNFE_INFPROT_NPROT,
                TBV.NFE_INFNFE_IDE_NNF,
                TO_VARCHAR(TBV.DTHORAABERTURA, 'DD-MM-YYYY HH24:MI:SS') AS DTHORAABERTURA,
                TO_VARCHAR(TBV.DTHORAFECHAMENTO, 'DD-MM-YYYY HH24:MI:SS') AS DTHORAFECHAMENTO,
                TBV.STATIVO,
                TBV.STCANCELADO,
                TO_VARCHAR(TBV.TXTMOTIVODESCONTO) AS TXTMOTIVODESCONTO
            FROM
                "${databaseSchema}".VENDA TBV
                INNER JOIN "${databaseSchema}".CAIXA TBC ON TBV.IDCAIXAWEB = TBC.IDCAIXAWEB
                INNER JOIN "${databaseSchema}".FUNCIONARIO TBF ON TBV.IDOPERADOR = TBF.IDFUNCIONARIO
                INNER JOIN "${databaseSchema}".EMPRESA TBE ON TBV.IDEMPRESA = TBE.IDEMPRESA
                INNER JOIN "${databaseSchema}".FUNCIONARIO TBFC ON TBV.DEST_CPF = TBFC.NUCPF
            WHERE
                1 = 1
        `;

        const params = [];

        if (statusCancelado) {
            query += ' AND TBV.STCANCELADO = ?';
            params.push(statusCancelado);
        }

        if (idVenda) {
            query += ' AND TBV.IDVENDA = ?';
            params.push(idVenda);
        }

        if (idEmpresa > 0) {
            query += ' AND TBV.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (idFuncionario) {
            query += ' AND TBFC.IDFUNCIONARIO = ?';
            params.push(idFuncionario);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND (TBV.DTHORAFECHAMENTO BETWEEN ? AND ?) AND TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC > 0 AND TBV.DEST_CPF != \'\'';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

       
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
        console.error('Erro ao executar a consulta de vendas:', error);
        throw error;
    }
};
