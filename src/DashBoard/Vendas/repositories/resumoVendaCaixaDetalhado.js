// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getResumoVendaCaixaDetalhado = async (statusCancelado, idVenda, idEmpresa, dataFechamento, page, pageSize) => {
    try {
       
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

       
        let query = `SELECT DISTINCT
                TBV.IDVENDA,
                TBE.NOFANTASIA,
                TBC.IDCAIXAWEB,
                TBC.DSCAIXA,
                TBF.NOFUNCIONARIO,
                TBLC.IDCONVENIADO,
                TBFC.NOFUNCIONARIO AS NOCONVENIADO,
                TBFD.NOFUNCIONARIO AS NOFUNDESCONTO,
                TBFC.NUCPF AS CPFCONVENIADO,
                TBCON.DSCONVENIO,
                TBCLIV.DSNOMERAZAOSOCIAL AS NOMECLIENTE,
                TBLC.VRBRUTO AS VRBRUTOCONVENIADO,
                TBLC.VRDESCONTO AS VRDESCONTOCONVENIADO,
                TBLC.VRLIQUIDO AS VRLIQUIDOCONVENIADO,
                TO_VARCHAR(TBLC.DTVENCIMENTO, 'DD-MM-YYYY HH24:MI:SS') AS DTVENCIMENTOCONVENIADO,
                TBV.IDMOVIMENTOCAIXAWEB,
                TBV.NFE_INFNFE_IDE_SERIE,
                TBV.NFE_INFNFE_TOTAL_ICMSTOT_VPROD,
                TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,
                TBV.VRTOTALVENDA,
                TBV.PROTNFE_INFPROT_CHNFE,
                TBV.PROTNFE_INFPROT_NPROT,
                TBV.NFE_INFNFE_IDE_NNF,
                TBV.DEST_CPF,
                TBV.VRRECCONVENIO,
                TBV.VRRECVOUCHER,
                TBV.VRTOTALDESCONTO,
                TBRVOU.NUVOUCHER,
                TBCLIVOU.DSNOMERAZAOSOCIAL AS CLIENTEVOUCHER,
                TBCLIVOU.NUCPFCNPJ AS CPFCLIENTEVOUCHER,
                TO_VARCHAR(TBV.DTHORAABERTURA, 'DD-MM-YYYY HH24:MI:SS') AS DTHORAABERTURA,
                TO_VARCHAR(TBV.DTHORAFECHAMENTO, 'DD-MM-YYYY HH24:MI:SS') AS DTHORAFECHAMENTO,
                TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS VRTOTALPAGO,
                TO_VARCHAR(TBV.TXTMOTIVOCANCELAMENTO) AS TXTMOTIVOCANCELAMENTO,
                TBV.STATIVO,
                TBV.STCANCELADO,
                TO_VARCHAR(TBV.TXTMOTIVODESCONTO) AS TXTMOTIVODESCONTO,
                TBV.STCONTINGENCIA
            FROM
                "${databaseSchema}".VENDA TBV
                INNER JOIN "${databaseSchema}".CAIXA TBC ON TBV.IDCAIXAWEB = TBC.IDCAIXAWEB
                INNER JOIN "${databaseSchema}".FUNCIONARIO TBF ON TBV.IDOPERADOR = TBF.IDFUNCIONARIO
                INNER JOIN "${databaseSchema}".EMPRESA TBE ON TBV.IDEMPRESA = TBE.IDEMPRESA
                LEFT JOIN "${databaseSchema}".DETLANCCONVENIO TBLC ON TBV.IDVENDA = TBLC.IDRESUMOVENDAWEB
                LEFT JOIN "${databaseSchema}".FUNCIONARIO TBFC ON TBLC.IDCONVENIADO = TBFC.IDFUNCIONARIO
                LEFT JOIN "${databaseSchema}".CONVENIO TBCON ON TBLC.IDCONVENIO = TBCON.IDCONVENIO
                LEFT JOIN "${databaseSchema}".RESUMOVOUCHER TBRVOU ON TBV.IDVENDA = TBRVOU.IDRESUMOVENDAWEB
                LEFT JOIN "${databaseSchema}".CLIENTE TBCLIVOU ON TBRVOU.IDCLIENTE = TBCLIVOU.IDCLIENTE
                LEFT JOIN "${databaseSchema}".CLIENTE TBCLIV ON TBV.DEST_CPF = TBCLIV.NUCPFCNPJ AND TBCLIV.NUCPFCNPJ != '' AND TBCLIV.NUCPFCNPJ IS NOT NULL
                LEFT JOIN "${databaseSchema}".FUNCIONARIO TBFD ON TBV.DEST_CPF = TBFD.NUCPF AND TBFD.NUCPF != '' AND TBFD.NUCPF IS NOT NULL AND TBFD.STATIVO = 'True'
            WHERE
                1 = 1`;

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

        
        if (dataFechamento) {
            query += ' AND (TBV.DTHORAFECHAMENTO BETWEEN ? AND ?)';
            params.push(`${dataFechamento} 00:00:00`, `${dataFechamento} 23:59:59`);
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
            data: result,
        };

    } catch (error) {
        console.error('Erro ao executar a consulta de vendas:', error);
        throw error;
    }
};
