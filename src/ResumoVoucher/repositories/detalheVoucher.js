// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getListaDetalhe = async (idVoucher) => {
    try {

        let query = ` SELECT 
            tbdv.IDVOUCHER,
            tbdv.IDDETALHEVOUCHER,
            tbdv.IDPRODUTO,
            tbp.DSNOME AS DSPRODUTO,
            tbp.NUCODBARRAS,
            tbdv.QTD,
            tbdv.VRUNIT,
            tbdv.VRTOTALBRUTO,
            tbdv.VRDESCONTO,
            tbdv.VRTOTALLIQUIDO,
            tbdv.STATIVO,
            tbdv.STCANCELADO
        FROM
            "${databaseSchema}".DETALHEVOUCHER tbdv
        INNER JOIN
            "${databaseSchema}".PRODUTO tbp ON tbp.IDPRODUTO = tbdv.IDPRODUTO
        WHERE
            tbdv.IDVOUCHER = ?`;

        const params = [idVoucher];
        const statement = await conn.prepare(query);
        const rows = await statement.exec(params);

        if (!Array.isArray(rows) || rows.length === 0) return [];

        const data = rows.map((det, index) => ({
            "@nItem": index + 1,
            "det": {
                "IDDETALHEVOUCHER": det.IDDETALHEVOUCHER,
                "IDVOUCHER": det.IDVOUCHER,
                "IDPRODUTO": det.IDPRODUTO,
                "DSPRODUTO": det.DSPRODUTO,
                "NUCODBARRAS": det.NUCODBARRAS,
                "QTD": det.QTD,
                "VRUNIT": det.VRUNIT,
                "VRTOTALBRUTO": det.VRTOTALBRUTO,
                "VRDESCONTO": det.VRDESCONTO,
                "VRTOTALLIQUIDO": det.VRTOTALLIQUIDO,
                "STATIVO": det.STATIVO,
                "STCANCELADO": det.STCANCELADO
            }
        }))

        return data


    } catch (error) {
        console.error('Erro ao executar a consulta lista detalhe voucher:', error);
        throw error;
    }
};

export const getListaDetalheResumoVenda = async (idResumoVendaDestino) => {
    try {
        var query = `
        SELECT 
            tbvd.IDVENDADETALHE,
            tbvd.IDVENDA, 
            tbvd.CPROD, 
            tbvd.CEAN, 
            tbvd.XPROD AS DSPRODUTO, 
            tbvd.QTD, 
            tbvd.VRTOTALLIQUIDO, 
            tbvd.VENDEDOR_NOME 
        FROM 
            "${databaseSchema}".VENDADETALHE tbvd 
        WHERE 
            tbvd.IDVENDA = ?
    `;

        const params = [idResumoVendaDestino];
        const statement = await conn.prepare(query);
        const rows = await statement.exec(params);

        const data = rows.map((det, index) => ({
            "@nItem": index + 1,
            vendadet: {
                "IDVENDADETALHE": det.IDVENDADETALHE,
                "IDVENDA": det.IDVENDA,
                "CPROD": det.CPROD,
                "CEAN": det.CEAN,
                "DSPRODUTO": det.DSPRODUTO,
                "QTD": det.QTD,
                "VRTOTALLIQUIDO": det.VRTOTALLIQUIDO,
                "VENDEDOR_NOME": det.VENDEDOR_NOME
            }
        }));

        return data
    } catch (error) {
        console.error('Erro ao executar a consulta detalhe resumo venda:', error);
        throw error;
    }
}

export const getDetalheVoucher = async (idVoucher, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        var query = `
            SELECT 
                tbrv.IDVOUCHER,  
                tbrv.IDRESUMOVENDAWEB,  
                IFNULL(TO_VARCHAR(tbrv.DTINVOUCHER,'DD-MM-YYYY'),'') AS DTINVOUCHER,  
                IFNULL(TO_VARCHAR(tbrv.DTOUTVOUCHER,'DD-MM-YYYY'),'') AS DTOUTVOUCHER,  
                tbcorigem.DSCAIXA AS DSCAIXAORIGEM,  
                tbcdestino.DSCAIXA AS DSCAIXADESTINO,  
                tbrv.NUVOUCHER,  
                tbrv.VRVOUCHER,  
                tbrv.STATIVO,  
                tbrv.STCANCELADO,  
                tbemporigem.NOFANTASIA AS EMPORIGEM, 
                IFNULL(tbempdestino.NOFANTASIA,'') AS EMPDESTINO
            FROM 
                "${databaseSchema}".RESUMOVOUCHER tbrv 
                LEFT JOIN "${databaseSchema}".CAIXA tbcorigem ON tbrv.IDCAIXAORIGEM = tbcorigem.IDCAIXAWEB 
                LEFT JOIN "${databaseSchema}".CAIXA tbcdestino ON tbrv.IDCAIXAORIGEM = tbcdestino.IDCAIXAWEB 
                LEFT JOIN "${databaseSchema}".EMPRESA tbemporigem ON tbrv.IDEMPRESAORIGEM = tbemporigem.IDEMPRESA 
                LEFT JOIN "${databaseSchema}".EMPRESA tbempdestino ON tbrv.IDEMPRESADESTINO = tbempdestino.IDEMPRESA 
            WHERE 
                1 = ?
        `;

        const params = [1];

        if (idVoucher) {
            query += ' AND tbrv.NUVOUCHER = ?';
            params.push(idVoucher);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ` AND tbrv.DTINVOUCHER BETWEEN ? AND ?`;
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);
        const rows = Array.isArray(result) ? result : [];

        const data = await Promise.all(rows.map(async (registro) => ({
            voucher: {
                "IDVOUCHER": registro.IDVOUCHER,
                "IDRESUMOVENDAWEB": registro.IDRESUMOVENDAWEB,
                "DTINVOUCHER": registro.DTINVOUCHER,
                "DTOUTVOUCHER": registro.DTOUTVOUCHER,
                "DSCAIXAORIGEM": registro.DSCAIXAORIGEM,
                "DSCAIXADESTINO": registro.DSCAIXADESTINO,
                "NUVOUCHER": registro.NUVOUCHER,
                "VRVOUCHER": registro.VRVOUCHER,
                "STATIVO": registro.STATIVO,
                "STCANCELADO": registro.STCANCELADO,
                "EMPORIGEM": registro.EMPORIGEM,
                "EMPDESTINO": registro.EMPDESTINO
            },
            detalhe: await getListaDetalheResumoVenda(registro.IDRESUMOVENDAWEB),
            detalhevoucher: await getListaDetalhe(registro.IDVOUCHER)
        })))

        return {
            page,
            pageSize,
            rows: data.length,
            data: data
        }
    } catch (error) {
        console.error('Erro ao executar a consulta detalhes vouchers:', error);
        throw error;
    }
}