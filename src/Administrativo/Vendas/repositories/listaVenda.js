// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getListaVendaDetalhe = async (idVenda) => {
    try {

        let query = `SELECT IDVENDADETALHE, IDVENDA, NITEM, CPROD, CEAN, XPROD, NCM, CFOP, UCOM, QCOM,
        VUNCOM, VPROD, CEANTRIB, UTRIB, QTRIB, VUNTRIB, INDTOT, ICMS_ORIG, ICMS_CST, ICMS_MODBC, ICMS_VBC,
        ICMS_PICMS, ICMS_VICMS, PIS_CST, PIS_VBC, PIS_PPIS, PIS_VPIS, COFINS_CST, COFINS_VBC, COFINS_PCOFINS,
        COFINS_VCOFINS, VENDEDOR_MATRICULA, VENDEDOR_NOME, VENDEDOR_CPF, tbp.NUCODBARRAS, QTD
        FROM
        "${databaseSchema}".VENDADETALHE tbvd
        INNER JOIN "${databaseSchema}".PRODUTO tbp ON tbp.IDPRODUTO = tbvd.CPROD
        WHERE
        IDVENDA = ?
        ORDER BY IDVENDADETALHE`;

        const params = [idVenda];

        const statement = await conn.prepare(query);
        const result = await statement.execute(params);

        if (!Array.isArray(result) || result.length === 0) return [];

        const data = result.map((det, index) => ({
            "@nItem": index + 1,
            det: {
                "IDVENDADETALHE": det.IDVENDADETALHE,
                "IDVENDA": det.IDVENDA,
                "NITEM": det.NITEM,
                "CPROD": det.CPROD,
                "CEAN": det.CEAN,
                "XPROD": det.XPROD,
                "NCM": det.NCM,
                "CFOP": det.CFOP,
                "UCOM": det.UCOM,
                "QCOM": det.QCOM,
                "VUNCOM": det.VUNCOM,
                "VPROD": det.VPROD,
                "CEANTRIB": det.CEANTRIB,
                "UTRIB": det.UTRIB,
                "QTRIB": det.QTRIB,
                "VUNTRIB": det.VUNTRIB,
                "INDTOT": det.INDTOT,
                "ICMS_ORIG": det.ICMS_ORIG,
                "ICMS_CST": det.ICMS_CST,
                "ICMS_MODBC": det.ICMS_MODBC,
                "ICMS_VBC": det.ICMS_VBC,
                "ICMS_PICMS": det.ICMS_PICMS,
                "ICMS_VICMS": det.ICMS_VICMS,
                "PIS_CST": det.PIS_CST,
                "PIS_VBC": det.PIS_VBC,
                "PIS_PPIS": det.PIS_PPIS,
                "PIS_VPIS": det.PIS_VPIS,
                "COFINS_CST": det.COFINS_CST,
                "COFINS_VBC": det.COFINS_VBC,
                "COFINS_PCOFINS": det.COFINS_PCOFINS,
                "COFINS_VCOFINS": det.COFINS_VCOFINS,
                "VENDEDOR_MATRICULA": det.VENDEDOR_MATRICULA,
                "VENDEDOR_NOME": det.VENDEDOR_NOME,
                "VENDEDOR_CPF": det.VENDEDOR_CPF,
                "STCANCELADO": det.STCANCELADO,
                "VRTOTALLIQUIDO": det.VRTOTALLIQUIDO,
                "QTD": det.QTD,
                "NUCODBARRAS": det.NUCODBARRAS
            }
        }))

        return data;

    } catch (error) {
        console.error('Erro ao executar a consulta vendas:', error);
        throw error;
    }
};

export const getListaPagamento = async (idVenda) => {
    try {
        let query = `SELECT IDVENDAPAGAMENTO, IDVENDA, NITEM, TPAG, DSTIPOPAGAMENTO, VALORRECEBIDO, VALORDEDUZIDO, VALORLIQUIDO,
    DTPROCESSAMENTO, TO_VARCHAR(DTVENCIMENTO,'DD-MM-YYYY') AS DTVENCIMENTO, NPARCELAS, NOTEF, NOAUTORIZADOR, NOCARTAO, NUOPERACAO, NSUTEF, NSUAUTORIZADORA, NUAUTORIZACAO, CPF, NOME
    FROM
    "${databaseSchema}".VENDAPAGAMENTO
    WHERE
    IDVENDA = ?
    ORDER BY IDVENDAPAGAMENTO`;

        const params = [idVenda];
        const statement = await conn.prepare(query);
        const result = await statement.execute(params);


        if (!Array.isArray(result) || result.length === 0) return [];

        const data = result.map((det, index) => ({
            "@nItem": index + 1,
            pag: {
                "IDVENDAPAGAMENTO": det.IDVENDAPAGAMENTO,
                "IDVENDA": det.IDVENDA,
                "NITEM": det.NITEM,
                "TPAG": det.TPAG,
                "DSTIPOPAGAMENTO": det.DSTIPOPAGAMENTO,
                "VALORRECEBIDO": det.VALORRECEBIDO,
                "VALORDEDUZIDO": det.VALORDEDUZIDO,
                "VALORLIQUIDO": det.VALORLIQUIDO,
                "DTPROCESSAMENTO": det.DTPROCESSAMENTO,
                "DTVENCIMENTO": det.DTVENCIMENTO,
                "NPARCELAS": det.NPARCELAS,
                "NOTEF": det.NOTEF,
                "NOAUTORIZADOR": det.NOAUTORIZADOR,
                "NOCARTAO": det.NOCARTAO,
                "NUOPERACAO": det.NUOPERACAO,
                "NSUTEF": det.NSUTEF,
                "NSUAUTORIZADORA": det.NSUAUTORIZADORA,
                "CPF": det.CPF,
                "NOME": det.NOME
            }
        }));

        return data
    } catch (error) {
        console.error('Erro ao executar a consulta vendas pagamentos:', error);
        throw error;
    }
}

export const getListaVenda = async (nnf, serie, idEmpresa, idVenda, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `SELECT
        tbv.IDVENDA,
        tbv."NFE_INFNFE_IDE_NNF",
        tbv.IDCAIXAWEB,
        tbc.DSCAIXA,
        tbv.IDOPERADOR,
        tbf.NOFUNCIONARIO,
        tbv.IDEMPRESA,
        tbe.NOFANTASIA,
        TO_VARCHAR(tbv.DTHORAABERTURA,'DD-MM-YYYY HH24:MI:SS') AS DTHORAABERTURA,
        tbv.VRRECDINHEIRO,
        tbv.VRRECCARTAO,
        tbv.VRRECCONVENIO,
        tbv.VRRECCHEQUE,
        tbv.VRRECPOS,
        tbv.VRRECVOUCHER,
        tbv.VRTOTALPAGO,
        tbv.VRTROCO,
        TO_VARCHAR(tbv.DTHORAFECHAMENTO,'DD-mm-YYYY HH24:MI:SS') AS DTHORAFECHAMENTO,
        tbv.STATIVO,
        tbv.STCANCELADO,
        tbv.IDUSUARIOCANCELAMENTO,
        tbv.TXTMOTIVOCANCELAMENTO,
        tbv.STCONTINGENCIA,
        tbv.DTENVIOONTINGENCIA
      FROM
        "${databaseSchema}".VENDA tbv
        INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbe.IDEMPRESA = tbv.IDEMPRESA
        INNER JOIN "${databaseSchema}".CAIXA tbc ON tbc.IDCAIXAWEB = tbv.IDCAIXAWEB
        INNER JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbf.IDFUNCIONARIO = tbv.IDOPERADOR
      WHERE
        1 = ?`;

        const params = [1];

        if (idVenda) {
            query += ' AND tbv.IDVENDA = ?';
            params.push(idVenda);
        }

        if (nnf && serie && idEmpresa) {
            query += ' AND tbv."NFE_INFNFE_IDE_NNF" = ? AND tbv."NFE_INFNFE_IDE_SERIE" = ? AND tbv.IDEMPRESA = ?';
            params.push(nnf, serie, idEmpresa);
        }

        const statement = await conn.prepare(query);
        const result = await statement.execute(params);

        const rows = result.rows || result; 

        if (!Array.isArray(rows) || rows.length === 0) return [];

        const data = await Promise.all(rows.map(async (registro) => {
            const detalhe = await getListaVendaDetalhe(registro.IDVENDA);
            const pagamento = await getListaPagamento(registro.IDVENDA);
        
            return {
                venda: {
                    "IDVENDA": registro.IDVENDA,
                    "NRNOTA": registro.NFE_INFNFE_IDE_NNF,
                    "IDCAIXAWEB": registro.IDCAIXAWEB,
                    "DSCAIXA": registro.DSCAIXA,
                    "IDOPERADOR": registro.IDOPERADOR,
                    "NOFUNCIONARIO": registro.NOFUNCIONARIO,
                    "IDEMPRESA": registro.IDEMPRESA,
                    "NOFANTASIA": registro.NOFANTASIA,
                    "DTHORAABERTURA": registro.DTHORAABERTURA,
                    "VRRECDINHEIRO": registro.VRRECDINHEIRO,
                    "VRRECCARTAO": registro.VRRECCARTAO,
                    "VRRECCONVENIO": registro.VRRECCONVENIO,
                    "VRRECCHEQUE": registro.VRRECCHEQUE,
                    "VRRECPOS": registro.VRRECPOS,
                    "VRRECVOUCHER": registro.VRRECVOUCHER,
                    "VRTOTALPAGO": registro.VRTOTALPAGO,
                    "VRTROCO": registro.VRTROCO,
                    "DTHORAFECHAMENTO": registro.DTHORAFECHAMENTO,
                    "STATIVO": registro.STATIVO,
                    "STCANCELADO": registro.STCANCELADO,
                    "IDUSUARIOCANCELAMENTO": registro.IDUSUARIOCANCELAMENTO,
                    "TXTMOTIVOCANCELAMENTO": registro.TXTMOTIVOCANCELAMENTO,
                    "STCONTINGENCIA": registro.STCONTINGENCIA,
                    "DTENVIOONTINGENCIA": registro.DTENVIOONTINGENCIA
                },
                detalhe,
                pagamento
            }
        }));
        
        return {
            page,
            pageSize,
            rows: data.length,
            data: data
        }
    } catch (error) {
        console.error('Erro ao executar a consulta vendas:', error);
        throw error;
    }
}