// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getLinhaDaVendaPagamento = async (idVenda) => {
    try {
        let query = `SELECT
            tbvp.DSTIPOPAGAMENTO,
            tbvp.NITEM,
            tbvp.NPARCELAS,
            tbvp.NUOPERACAO,
            tbvp.NSUTEF,
            tbvp.NSUAUTORIZADORA,
            tbvp.NUAUTORIZACAO,
            SUM(tbvp.VALORLIQUIDO) AS VALORLIQUIDO,
            SUM(tbvp.VALORRECEBIDO) AS VALORRECEBIDO
        FROM
            "${databaseSchema}".VENDAPAGAMENTO tbvp
        WHERE
            tbvp.IDVENDA = ?
        AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL)
        GROUP BY tbvp.IDVENDAPAGAMENTO, tbvp.DSTIPOPAGAMENTO, tbvp.NPARCELAS, tbvp.NUOPERACAO, tbvp.NSUTEF, tbvp.NSUAUTORIZADORA, tbvp.NUAUTORIZACAO, tbvp.NITEM
        ORDER BY tbvp.IDVENDAPAGAMENTO ASC`;

        const params = [idVenda];

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);
      
        if(!Array.isArray(result) || result.length === 0) return [];

        const lines = result.map((det, index) => ({
            "@nItem": index + 1,
            "pag": {
                "DSTIPOPAGAMENTO": det.DSTIPOPAGAMENTO,
                "NITEM": det.NITEM,
                "NPARCELAS": det.NPARCELAS,
                "NSUTEF": det.NSUTEF,
                "NUOPERACAO": det.NUOPERACAO,
                "NSUAUTORIZADORA": det.NSUAUTORIZADORA,
                "NUAUTORIZACAO": det.NUAUTORIZACAO,
                "VALORLIQUIDO": det.VALORLIQUIDO,
                "VALORRECEBIDO": det.VALORRECEBIDO
            }
        }));

        return lines;
    } catch (error) {
        console.error('Erro ao executar a consulta de pagamentos da venda:', error);
        throw error;
    }
};

export const getRecebimento = async (idVenda, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `SELECT
                tbv.IDVENDA,
                tbv.IDCAIXAWEB,
                tbv.IDOPERADOR,
                tbv.IDEMPRESA,
                TO_VARCHAR(tbv.DTHORAFECHAMENTO,'YYYY-MM-DD HH:MM:SS') AS DTHORAFECHAMENTO,
                TO_VARCHAR(tbv.DTHORAFECHAMENTO,'YYYY-MM-DD') AS DTHORAFECHAMENTOFORMATADA,
                tbv.VRTOTALVENDA,
                (tbv.VRRECDINHEIRO) AS VRDINHEIRO,
                tbv.VRRECDINHEIRO,
                tbv.VRRECCARTAO,
                tbv.VRRECPOS,
                tbv.VRRECCONVENIO,
                tbv.VRRECCHEQUE,
                tbv.VRRECVOUCHER,
                (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "${databaseSchema}".VENDAPAGAMENTO tbvp WHERE tbvp.IDVENDA = tbv.IDVENDA AND tbvp.NOTEF = 'POS' AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) AND (tbvp.DSTIPOPAGAMENTO!='PIX')) AS TOTALVENDIDOPOS,
                (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "${databaseSchema}".VENDAPAGAMENTO tbvp WHERE tbvp.IDVENDA = tbv.IDVENDA AND tbvp.NOTEF = 'PIX' AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) AND (tbvp.DSTIPOPAGAMENTO ='PIX')) AS TOTALVENDIDOPIX,
                (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "${databaseSchema}".VENDAPAGAMENTO tbvp WHERE tbvp.IDVENDA = tbv.IDVENDA AND tbvp.NOTEF = 'POS' AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) AND (tbvp.DSTIPOPAGAMENTO ='MoovPay')) AS TOTALVENDIDOMOOVPAY,
                (SELECT IFNULL(max(NITEM),0) FROM "${databaseSchema}".VENDAPAGAMENTO WHERE IDVENDA = tbv.IDVENDA) AS ULTNITEM
            FROM
                "${databaseSchema}".VENDA tbv
            WHERE
                1 = ?
        `;

        const params = [];

        if (idVenda) {
            query = query + ' And  tbv.IDVENDA = ?';
            params.push(idVenda);
        }

        const result = await conn.execute(query, [1, ...params]);
        const rows = Array.isArray(result) ? result : [];
        
        const lines = await Promise.all(rows.map(async (registro) => {
            try {
                const vendaPagamento = await getLinhaDaVendaPagamento(registro.IDVENDA)
                return {
                    "venda": {
                        "IDVENDA": registro.IDVENDA,
                        "IDEMPRESA": registro.IDEMPRESA,
                        "IDCAIXAWEB": registro.IDCAIXAWEB,
                        "IDOPERADOR": registro.IDOPERADOR,
                        "DTHORAFECHAMENTO": registro.DTHORAFECHAMENTO,
                        "DTHORAFECHAMENTOFORMATADA": registro.DTHORAFECHAMENTOFORMATADA,
                        "VRTOTALVENDA": registro.VRTOTALVENDA,
                        "VRDINHEIRO": registro.VRDINHEIRO,
                        "VRRECDINHEIRO": registro.VRRECDINHEIRO,
                        "VRRECCARTAO": registro.VRRECCARTAO,
                        "VRRECPOSVENDA": registro.VRRECPOS,
                        "VRRECPOS": registro.TOTALVENDIDOPOS,
                        "VRRECPIX": registro.TOTALVENDIDOPIX,
                        "VRRECMOOVPAY": registro.TOTALVENDIDOMOOVPAY,
                        "VRRECCONVENIO": registro.VRRECCONVENIO,
                        "VRRECCHEQUE": registro.VRRECCHEQUE,
                        "VRRECVOUCHER": registro.VRRECVOUCHER,
                        "ULTNITEM":registro.ULTNITEM
                    },
                    
                    vendaPagamento
                }

            } catch (error) {
                console.error('Erro ao executar a consulta de pagamentos da venda:', error);
                throw error;
            }
        }));

        return {
            page,
            pageSize,
            rows: lines.length,
            data: lines
        };
    } catch (error) {
        console.error('Erro ao executar a consulta de pagamentos da venda:', error);
        throw error;
    }
};
