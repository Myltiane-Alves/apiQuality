// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getListaPCJ = async (idMovimento) => {
    try {
        let query = `
            SELECT 
            SUM(tbv.VRRECCARTAO) AS TOTALVENDIDOCARTAO, 
            (
                SELECT IFNULL(SUM(tbvp.VALORRECEBIDO), 0) 
                FROM "${databaseSchema}".VENDAPAGAMENTO tbvp 
                INNER JOIN "${databaseSchema}".VENDA tbv1 
                ON tbvp.IDVENDA = tbv1.IDVENDA 
                WHERE tbv1.IDMOVIMENTOCAIXAWEB = ?
                AND tbv1.STCANCELADO = 'False' 
                AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) 
                AND (tbvp.NOAUTORIZADOR = 'Credsystem' OR tbvp.NOAUTORIZADOR = 'CREDSYSTEM' OR tbvp.NOAUTORIZADOR = 'PL') 
                AND (tbvp.DSTIPOPAGAMENTO != 'GIRO PREMIADO') 
                AND (tbvp.NPARCELAS = 7 OR tbvp.NPARCELAS = 8)
            ) AS TOTALPCJ78, 
            (
                SELECT IFNULL(SUM(tbvp.VALORRECEBIDO), 0) 
                FROM "${databaseSchema}".VENDAPAGAMENTO tbvp 
                INNER JOIN "${databaseSchema}".VENDA tbv1 
                ON tbvp.IDVENDA = tbv1.IDVENDA 
                WHERE tbv1.IDMOVIMENTOCAIXAWEB = ? 
                AND tbv1.STCANCELADO = 'False' 
                AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) 
                AND (tbvp.NOAUTORIZADOR = 'Credsystem' OR tbvp.NOAUTORIZADOR = 'CREDSYSTEM' OR tbvp.NOAUTORIZADOR = 'PL') 
                AND (tbvp.DSTIPOPAGAMENTO != 'GIRO PREMIADO')
            ) AS TOTALPCJ18 
            FROM 
            "${databaseSchema}".VENDA tbv 
            WHERE 
            tbv.IDMOVIMENTOCAIXAWEB = ? 
            AND tbv.STCANCELADO = 'False'
        `;

        const params = [idMovimento, idMovimento, idMovimento];
        const statement = await conn.prepare(query);
        const rows = await statement.exec(params);
        if(!Array.isArray(rows) || rows.length === 0) return [];
        const lines = rows.map((det, index) => ({
            "@nItem": index + 1,
            "venda-pcj": {
                "TOTALPCJ78": det.TOTALPCJ78,
                "TOTALPCJ18": det.TOTALPCJ18
            }
        }));

        return lines;

    } catch (e) {
        throw new Error('Erro ao consultar lista de PCJ: ' + e.message);
    }
};

export const getObterVenda = async (idMovimento) => {
    try {
        let query = `
            SELECT 
                SUM(tbv.VRRECDINHEIRO) AS TOTALVENDIDODINHEIRO, 
                SUM(tbv.VRRECCARTAO) AS TOTALVENDIDOCARTAO, 
                (
                    SELECT IFNULL(SUM(tbvp.VALORRECEBIDO), 0) 
                    FROM "${databaseSchema}".VENDAPAGAMENTO tbvp 
                    INNER JOIN "${databaseSchema}".VENDA tbv1 
                    ON tbvp.IDVENDA = tbv1.IDVENDA 
                    WHERE tbv1.IDMOVIMENTOCAIXAWEB = ? 
                    AND tbv1.STCANCELADO = 'False' 
                    AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) 
                    AND tbvp.NOTEF = 'POS' 
                    AND (tbvp.DSTIPOPAGAMENTO != 'PIX')
                ) AS TOTALVENDIDOPOS, 
                (
                    SELECT IFNULL(SUM(tbvp.VALORRECEBIDO), 0) 
                    FROM "${databaseSchema}".VENDAPAGAMENTO tbvp 
                    INNER JOIN "${databaseSchema}".VENDA tbv1 
                    ON tbvp.IDVENDA = tbv1.IDVENDA 
                    WHERE tbv1.IDMOVIMENTOCAIXAWEB = ? 
                    AND tbv1.STCANCELADO = 'False' 
                    AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) 
                    AND tbvp.NOTEF = 'PIX' 
                    AND (tbvp.DSTIPOPAGAMENTO = 'PIX')
                ) AS TOTALVENDIDOPIX, 
                (
                    SELECT IFNULL(SUM(tbvp.VALORRECEBIDO), 0) 
                    FROM "${databaseSchema}".VENDAPAGAMENTO tbvp 
                    INNER JOIN "${databaseSchema}".VENDA tbv1 
                    ON tbvp.IDVENDA = tbv1.IDVENDA 
                    WHERE tbv1.IDMOVIMENTOCAIXAWEB = ? 
                    AND tbv1.STCANCELADO = 'False' 
                    AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) 
                    AND tbvp.NOTEF = 'POS' 
                    AND (tbvp.DSTIPOPAGAMENTO = 'MoovPay')
                ) AS TOTALVENDIDOMOOVPAY, 
                SUM(tbv.VRRECVOUCHER) AS TOTALVENDIDOVOUCHER, 
                SUM(tbv.VRTOTALPAGO) AS TOTALVENDIDO,  
                SUM(tbv.VRRECCONVENIO) AS TOTALVENDIDOCONVENIO,  
                SUM(tbv.NFE_INFNFE_TOTAL_ICMSTOT_VNF) AS TOTALNOTA  
            FROM 
                "${databaseSchema}".VENDA tbv 
            WHERE 
                tbv.IDMOVIMENTOCAIXAWEB = ? 
                AND tbv.STCANCELADO = 'False'
        `;

        const params = [idMovimento, idMovimento, idMovimento, idMovimento];
        const statement = await conn.prepare(query);
        const rows = await statement.exec(params);

        if(!Array.isArray(rows) || rows.length === 0) return [];
        const lines = rows.map((det, index) => ({
            "@nItem": index + 1,
            "venda-movimento": {
				"TOTALVENDIDODINHEIRO":det.TOTALVENDIDODINHEIRO,
        		"TOTALVENDIDOCARTAO":det.TOTALVENDIDOCARTAO,
        		"TOTALVENDIDOPOS":det.TOTALVENDIDOPOS,
        		"TOTALVENDIDOPIX":det.TOTALVENDIDOPIX,
        		"TOTALVENDIDOMOOVPAY":det.TOTALVENDIDOMOOVPAY,
        		"TOTALVENDIDOVOUCHER":det.TOTALVENDIDOVOUCHER,
        		"TOTALVENDIDO":det.TOTALVENDIDO,
        		"TOTALVENDIDOCONVENIO":det.TOTALVENDIDOCONVENIO,
        		"TOTALNOTA":det.TOTALNOTA
        	}
        }));

        return lines;

    } catch (e) {
        throw new Error('Erro ao consultar obter venda: ' + e.message);
    }
};

export const getObterFatura = async (idEmpresa, idMovimento) => {
    try {
        let query = `
            SELECT 
                IFNULL(SUM(tbdf.VRRECEBIDO), 0) AS TOTALRECEBIDO 
            FROM 
                "${databaseSchema}".DETALHEFATURA tbdf 
            WHERE 
                tbdf.IDEMPRESA = ? 
                AND tbdf.STCANCELADO = 'False'
                AND (tbdf.STPIX = 'False' OR tbdf.STPIX IS NULL)
                AND tbdf.IDMOVIMENTOCAIXAWEB = ?
        `;

        const params = [idEmpresa, idMovimento];
        const statement = await conn.prepare(query);
        const rows = await statement.exec(params);
        if(!Array.isArray(rows) || rows.length === 0) return [];
        const lines = rows.map((det, index) => ({
            "@nItem": index + 1,
            "fatura-movimento": {
				"TOTALRECEBIDOFATURA":det.TOTALRECEBIDO
        	}
        }));

        return lines;

    } catch (e) {
        throw new Error('Erro ao consultar obter fatura: ' + e.message);
    }
};

export const getObterFaturaPIX = async (idEmpresa, idMovimento) => {
    try {
        var query = `
            SELECT 
             IFNULL(SUM(tbdf.VRRECEBIDO), 0) AS TOTALRECEBIDOPIX 
            FROM 
                "${databaseSchema}".DETALHEFATURA tbdf 
            WHERE 
                tbdf.IDEMPRESA = ? 
                AND tbdf.STCANCELADO = 'False'
                AND tbdf.STPIX = 'True'
                AND tbdf.IDMOVIMENTOCAIXAWEB = ?
        `;
        const params = [idEmpresa, idMovimento];
        const statement = await conn.prepare(query);
        const rows = await statement.exec(params);
        if(!Array.isArray(rows) || rows.length === 0) return [];
     
        const lines = rows.map((det, index) => ({
            "@nItem": index + 1,
            "fatura-movimento-pix": {
				"TOTALRECEBIDOFATURAPIX":det.TOTALRECEBIDOPIX
        	}
        }));

        return lines;

    } catch (e) {
        throw new Error('Erro ao consultar obter fatura pix: ' + e.message);
    }
};

export const getCaixasMovimentos = async (byId, idEmpresa, dataFechamento, page, pageSize) => {
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
                tbmc.STCONFERIDO, 
                TO_VARCHAR(tbmc.DTABERTURA, 'DD-MM-YYYY HH24:MI:SS') AS DTABERTURA 
            FROM 
                "${databaseSchema}".MOVIMENTOCAIXA tbmc 
                INNER JOIN "${databaseSchema}".CAIXA tbc ON tbmc.IDCAIXA = tbc.IDCAIXAWEB 
                LEFT JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbmc.IDOPERADOR = tbf.IDFUNCIONARIO  
            WHERE 
                1 = ? 
                AND tbmc.STCANCELADO = 'False'
        `;
            
        const params = [1];

        if(byId)  {
            query += ' AND tbmc.ID = ?';
            params.push(byId);
        }

        if(idEmpresa > 0) {
            query += ' AND tbmc.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if(dataFechamento) {
            query += ' AND (tbmc.DTABERTURA BETWEEN ? AND ?)';
            params.push(`${dataFechamento} 00:00:00`, `${dataFechamento} 23:59:59`);
        }

        query += `
            GROUP BY tbmc.ID, tbc.IDCAIXAWEB, tbmc.IDOPERADOR,tbf.NUCPF, tbc.DSCAIXA, tbf.NOFUNCIONARIO, tbc.IDEMPRESA, tbmc.STFECHADO, tbmc.DTABERTURA, tbmc.VRRECDINHEIRO, tbmc.STCONFERIDO
        `;


        const result = await conn.exec(query, params); 
        const rows = Array.isArray(result) ? result : [];
       
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
                STFECHADO: registro.STFECHADO,
                STCONFERIDO: registro.STCONFERIDO
            },
            venda: await getObterVenda(registro.ID),
            fatura: await getObterFatura(idEmpresa, registro.ID),
            faturapix: await getObterFaturaPIX(idEmpresa, registro.ID),
            vendapcj: await getListaPCJ(registro.ID)
        })));
        
        return {
            page: page,  
            pageSize: pageSize, 
            rows: data.length,
            data: data
        };
    } catch (error) {
        throw new Error(`Error executar consulta get Movimentos Caixa: ${error.message}`);
    }
};

