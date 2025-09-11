// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getListaPCJ = async (idMovimento, limit, offset) => {
    try {
        const query = `
            SELECT 
                SUM(tbv.VRRECCARTAO) AS TOTALVENDIDOCARTAO, 
                SUM(CASE WHEN tbvp.NPARCELAS IN (7, 8) THEN tbvp.VALORRECEBIDO ELSE 0 END) AS TOTALPCJ78,
                SUM(tbvp.VALORRECEBIDO) AS TOTALPCJ18
            FROM 
                "${databaseSchema}".VENDA tbv 
                LEFT JOIN "${databaseSchema}".VENDAPAGAMENTO tbvp 
                ON tbv.IDVENDA = tbvp.IDVENDA
            WHERE 
                tbv.IDMOVIMENTOCAIXAWEB = ? 
                AND tbv.STCANCELADO = 'False'
            LIMIT ? OFFSET ?
        `;

        const [rows] = await conn.execute(query, [idMovimento, limit, offset]);

        if(!Array.isArray(rows) || rows.length === 0) return [];
        const lines = rows.map((row, index) => ({
            "@nItem": index + 1,
            "venda-pcj": {
                "TOTALPCJ78": row.TOTALPCJ78 || 0,
                "TOTALPCJ18": row.TOTALPCJ18 || 0
            }
        }));

        return lines;

    } catch (error) {
        throw new Error(error.message);
    }
};

export const getVenda = async (idMovimento) => {
    try {
        
        const query = `
            SELECT 
                SUM(tbv.VRRECDINHEIRO) AS TOTALVENDIDODINHEIRO, 
                SUM(tbv.VRRECCARTAO) AS TOTALVENDIDOCARTAO, 
                SUM(CASE WHEN tbvp.NOTEF = 'POS' AND tbvp.DSTIPOPAGAMENTO != 'PIX' THEN tbvp.VALORRECEBIDO ELSE 0 END) AS TOTALVENDIDOPOS,
                SUM(CASE WHEN tbvp.NOTEF = 'PIX' AND tbvp.DSTIPOPAGAMENTO = 'PIX' THEN tbvp.VALORRECEBIDO ELSE 0 END) AS TOTALVENDIDOPIX,
                SUM(CASE WHEN tbvp.NOTEF = 'POS' AND tbvp.DSTIPOPAGAMENTO = 'MoovPay' THEN tbvp.VALORRECEBIDO ELSE 0 END) AS TOTALVENDIDOMOOVPAY,
                SUM(tbv.VRRECVOUCHER) AS TOTALVENDIDOVOUCHER,
                SUM(tbv.VRTOTALPAGO) AS TOTALVENDIDO,
                SUM(tbv.VRRECCONVENIO) AS TOTALVENDIDOCONVENIO,
                SUM(tbv.NFE_INFNFE_TOTAL_ICMSTOT_VNF) AS TOTALNOTA
            FROM 
                "${databaseSchema}".VENDA tbv 
                LEFT JOIN "${databaseSchema}".VENDAPAGAMENTO tbvp 
                ON tbv.IDVENDA = tbvp.IDVENDA
            WHERE 
                tbv.IDMOVIMENTOCAIXAWEB = ? 
                AND tbv.STCANCELADO = 'False'
        `;

        const [rows] = await conn.execute(query, [idMovimento]);
   
        if(!Array.isArray(rows) || rows.length === 0) return [];

        const lines = rows.map((row, index) => ({
            "@nItem": index + 1,
            "venda-movimento": {
                "TOTALVENDIDODINHEIRO": row.TOTALVENDIDODINHEIRO || 0,
                "TOTALVENDIDOCARTAO": row.TOTALVENDIDOCARTAO || 0,
                "TOTALVENDIDOPOS": row.TOTALVENDIDOPOS || 0,
                "TOTALVENDIDOPIX": row.TOTALVENDIDOPIX || 0,
                "TOTALVENDIDOMOOVPAY": row.TOTALVENDIDOMOOVPAY  || 0,
                "TOTALVENDIDOVOUCHER": row.TOTALVENDIDOVOUCHER || 0,
                "TOTALVENDIDO": row.TOTALVENDIDO || 0,
                "TOTALVENDIDOCONVENIO": row.TOTALVENDIDOCONVENIO || 0,
                "TOTALNOTA": row.TOTALNOTA || 0
            }
        }));

        return lines;

    } catch (error) {
        throw new Error(error.message);
    }
};

export const getFatura = async (idEmpresa, idMovimento) => {
    try {
        const query = `
            SELECT 
                SUM(tbdf.VRRECEBIDO) AS TOTALRECEBIDO 
            FROM 
                "${databaseSchema}".DETALHEFATURA tbdf 
            WHERE 
                tbdf.IDEMPRESA = ? 
                AND tbdf.STCANCELADO = 'False'
                AND (tbdf.STPIX = 'False' OR tbdf.STPIX IS NULL)
                AND tbdf.IDMOVIMENTOCAIXAWEB = ?
        `;

        const [rows] = await conn.execute(query, [idEmpresa, idMovimento]);
  
        if(!Array.isArray(rows) || rows.length === 0) return [];
        const lines = rows.map((row, index) => ({
            "@nItem": index + 1,
            "fatura-movimento": {
                "TOTALRECEBIDOFATURA": row.TOTALRECEBIDO || 0
            }
        }));

        return lines;

    } catch (error) {
        console.error("Error:", error);
        throw new Error(error.message);
    }
};

export const getFaturaPIX = async (idEmpresa, idMovimento) => {
    try {
        const query = `
            SELECT 
                SUM(tbdf.VRRECEBIDO) AS TOTALRECEBIDOPIX 
            FROM 
                "${databaseSchema}".DETALHEFATURA tbdf 
            WHERE 
                tbdf.IDEMPRESA = ? 
                AND tbdf.STCANCELADO = 'False'
                AND tbdf.STPIX = 'True'
                AND tbdf.IDMOVIMENTOCAIXAWEB = ?
        `;

        const params = [idEmpresa, idMovimento];

        const [rows] = await conn.execute(query, params);
       
        if(!Array.isArray(rows) || rows.length === 0) return [];
        const lines = rows.map((row, index) => ({
            "@nItem": index + 1,
            "fatura-movimento-pix": {
                "TOTALRECEBIDOFATURAPIX": row.TOTALRECEBIDOPIX || 0
            }
        }));

        return lines;

    } catch (error) {
        console.error("Error:", error);
        throw new Error(error.message);
    }
};

export const getListaMovimentoCaixa = async (idEmpresa, dataFechamento, page = 1, pageSize = 1000) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                tbmc.ID, 
                tbmc.IDOPERADOR, 
                tbmc.VRRECDINHEIRO, 
                tbc.IDCAIXAWEB, 
                tbc.DSCAIXA, 
                tbc.IDEMPRESA, 
                tbf.NOFUNCIONARIO, 
                tbf.NUCPF, 
                tbmc.STFECHADO, 
                TO_VARCHAR(tbmc.DTABERTURA,'DD-MM-YYYY HH24:MI:SS') AS DTABERTURA 
            FROM 
                "${databaseSchema}".MOVIMENTOCAIXA tbmc 
                INNER JOIN "${databaseSchema}".CAIXA tbc ON tbmc.IDCAIXA = tbc.IDCAIXAWEB 
                LEFT JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbmc.IDOPERADOR = tbf.IDFUNCIONARIO  
            WHERE 
                1 = 1
        `;

        const params = [];

        if (idEmpresa) {
            query += ` AND tbmc.IDEMPRESA IN (${Array.isArray(idEmpresa) ? idEmpresa.map(() => '?').join(',') : '?'})`;
            params.push(...[].concat(idEmpresa));
        }

        if (dataFechamento) {
            query += ' AND (tbmc.DTABERTURA BETWEEN ? AND ?)';
            params.push(`${dataFechamento} 00:00:00`, `${dataFechamento} 23:59:59`);
        }

        query += ' GROUP BY tbmc.ID, tbc.IDCAIXAWEB, tbmc.IDOPERADOR, tbf.NUCPF, tbc.DSCAIXA, tbf.NOFUNCIONARIO, tbc.IDEMPRESA, tbmc.STFECHADO, tbmc.DTABERTURA, tbmc.VRRECDINHEIRO';
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, (page - 1) * pageSize);

        const result = await conn.execute(query, params);

        const rows = Array.isArray(result) ? result :  [];
      
        const data = await Promise.all(rows.map(async (registro) => ({
            
            caixa: {
                ID: registro.ID,
                IDOPERADOR: registro.IDOPERADOR,
                VRRECDINHEIRO: registro.VRRECDINHEIRO,
                IDCAIXAWEB: registro.IDCAIXAWEB,
                DSCAIXA: registro.DSCAIXA,
                NOFUNCIONARIO: registro.NOFUNCIONARIO,
                NUCPF: registro.NUCPF,
                DTABERTURA: registro.DTABERTURA,
                STFECHADO: registro.STFECHADO
            },
            venda: await getVenda(registro.ID),
            fatura: await getFatura(idEmpresa, registro.ID),
            faturaPIX: await getFaturaPIX(idEmpresa, registro.ID),
            pcj: await getListaPCJ(registro.ID)
        })));

        return {
            page,
            pageSize,
            rows: data.length,
            data: data
        };
    } catch (e) {
        console.error("Error in getListaMovimentoCaixa:", e);
        return {
            status: 400,
            body: JSON.stringify({ message: e.toString() })
        };
    }
};


