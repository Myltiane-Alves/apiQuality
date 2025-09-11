// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getNFPedido = async (idPedido, idResumoEntrada, dataPesquisaInicio, dataPesquisaFim, stTransformado, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query =  `
            SELECT
                "IDRESUMOENTRADA",
                "IDGRUPOEMPRESARIAL",
                "IDSUBGRUPOEMPRESARIAL",
                "IDEMPRESA",
                "IDFORNECEDOR",
                "IDRESUMOPEDIDO",
                "CUF",
                "CNF",
                "NATOP",
                "INDPAG",
                "XMOD",
                "SERIE",
                "NNF",
                "DEMI",
                "DSAIENT",
                "TPNF",
                "CMUNFG",
                "TPIMP",
                "TPEMIS",
                "CDV",
                "TPAMB",
                "FINNFE",
                "PROCEMI",
                "VERPROC",
                "XMOTIVO",
                "NPROT",
                "EMIT_CPF",
                "EMIT_CNPJ",
                "EMIT_XNOME",
                "EMIT_XFANT",
                "EMIT_XLGR",
                "EMIT_NRO",
                "EMIT_XBAIRRO",
                "EMIT_CMUN",
                "EMIT_XMUN",
                "EMIT_UF",
                "EMIT_CEP",
                "EMIT_CPAIS",
                "EMIT_XPAIS",
                "EMIT_FONE",
                "EMIT_IE",
                "EMIT_IM",
                "EMIT_CNAE",
                "EMIT_CRT",
                "DEST_CNPJ",
                "DEST_XNOME",
                "DEST_XLGR",
                "DEST_NRO",
                "DEST_XBAIRRO",
                "DEST_CMUN",
                "DEST_XMUN",
                "DEST_UF",
                "DEST_CEP",
                "DEST_CPAIS",
                "DEST_XPAIS",
                "DEST_IE",
                "VBC",
                "VICMS",
                "VBCST",
                "VST",
                "VPROD",
                "VNF",
                "VFRETE",
                "VSEG",
                "VDESC",
                "VIPI",
                "VPIS",
                "VCOFINS",
                "VOUTRO",
                "STDIVERGENCIA",
                "STCONCLUIDO",
                "NDUPLICATA",
                "VENCIDUPLICATADATE",
                "VALORDUPLICATA",
                "STNFE"
            FROM
                "${databaseSchema}"."RESUMOENTRADANFEPEDIDO"
            WHERE
                1 = ?
        `;

        const params = [1];

        if(idResumoEntrada) {
            query += ' And "IDRESUMOENTRADA" = ? ';
            params.push(idResumoEntrada);
        }

        if (idPedido) {
            query += ' And "IDRESUMOPEDIDO" ? ';
            params.push(idPedido);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' And "DEMI" BETWEEN ? AND ? ';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);


        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result,
        }

    } catch (error) {
        console.error('Erro ao consulta Cadastro NF Pedido :', error);
        throw error;
    }
}