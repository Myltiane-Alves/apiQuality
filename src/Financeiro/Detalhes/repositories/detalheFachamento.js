
// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getLinhasDoMovimento = async (idMovimento) => {
    try {
        const query = `
            SELECT 
                IFNULL(SUM(tbmc.VRRECDINHEIRO), 0) AS VALORTOTALINFORMADODINHEIRO,
                IFNULL(SUM(tbmc.VRRECTEF + tbmc.VRRECPOS), 0) AS VALORTOTALINFORMADOCARTAO,
                IFNULL(SUM(tbmc.VRRECFATURA), 0) AS VALORTOTALINFORMADOFATURA,
                IFNULL(SUM(tbmc.VRAJUSTDINHEIRO), 0) AS VALORTOTALAJUSTEDINHEIRO,
                IFNULL(SUM(tbmc.VRRECPOS), 0) AS VALORTOTALINFORMADOPOS
            FROM 
                "${databaseSchema}".MOVIMENTOCAIXA tbmc
            WHERE 
                ID = ?
        `;

        const params = [idMovimento];
        const statement = await conn.prepare(query);
        const result = await statement.execute(params);

        if (!Array.isArray(result) || result.length === 0) return null;

        const det = result[0];
        const docLine = {
            "DINHEIRO": det.VALORTOTALINFORMADODINHEIRO,
            "CARTAO": det.VALORTOTALINFORMADOCARTAO,
            "FATURA": det.VALORTOTALINFORMADOFATURA,
            "DINHEIROAJUSTE": det.VALORTOTALAJUSTEDINHEIRO,
            "POS": det.VALORTOTALINFORMADOPOS
        };

        return docLine;
    } catch (error) {
        console.error('Erro ao executar a consulta de pagamentos da venda:', error);
        throw new Error('Erro ao obter as linhas do movimento');
    }
};

export const getLinhasDoDeposito = async (idEmpresa, dataPesquisa) => {
    try {
        const query = `
            SELECT 
                tbdl.VRDEPOSITO,
                CAST(tbdl.DSHISTORIO AS TEXT) AS DSHISTORIO,
                tbdl.NUDOCDEPOSITO
            FROM 
                "${databaseSchema}".DEPOSITOLOJA tbdl
            WHERE 
                tbdl.IDEMPRESA = ?
                AND tbdl.STCANCELADO = 'False'
                AND (tbdl.DTDEPOSITO BETWEEN '${dataPesquisa} 00:00:00' AND '${dataPesquisa} 23:59:59')
        `;

        const params = [idEmpresa];
        const statement = await conn.prepare(query);
        const result = await statement.execute(params);

        if (!Array.isArray(result) || result.length === 0) return [];

        const lines = result.map(det => ({
            "VRDEPOSITO": det.VRDEPOSITO,
            "DSHISTORIO": det.DSHISTORIO,
            "NUDOCDEPOSITO": det.NUDOCDEPOSITO
        }));

        return lines;
    } catch (error) {
        console.error('Erro ao executar a consulta de depósitos da loja:', error);
        throw new Error('Erro ao obter as linhas do depósito');
    }
};

export const getDetalheFechamento = async (idEmpresa, dataPesquisa, page = 1, pageSize = 1000) => {
    try {
        page = !isNaN(page) ? parseInt(page) : 1;
        pageSize = !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                tbe.IDEMPRESA, 
                tbe.NOFANTASIA, 
                tbv.IDCAIXAWEB, 
                tbv.IDMOVIMENTOCAIXAWEB, 
                tbc.DSCAIXA, 
                tbf.NOFUNCIONARIO,
                IFNULL(SUM(tbv.VRRECDINHEIRO), 0) AS VALORTOTALDINHEIRO, 
                IFNULL(SUM(tbv.VRRECCARTAO), 0) AS VALORTOTALCARTAO, 
                IFNULL(SUM(tbv.VRRECCONVENIO), 0) AS VALORTOTALCONVENIO, 
                IFNULL(SUM(tbv.VRRECPOS), 0) AS VALORTOTALPOS, 
                IFNULL(SUM(tbv.VRRECVOUCHER), 0) AS VALORTOTALVOUCHER, 
                (SELECT IFNULL(SUM(tbdf.VRRECEBIDO), 0) FROM "${databaseSchema}".DETALHEFATURA tbdf 
                 WHERE tbdf.IDEMPRESA = tbe.IDEMPRESA 
                 AND tbv.IDMOVIMENTOCAIXAWEB = tbdf.IDMOVIMENTOCAIXAWEB 
                 AND tbdf.STCANCELADO = 'False' 
                 AND tbdf.DTPROCESSAMENTO = ?) AS VALORTOTALFATURA,  
                (SELECT IFNULL(SUM(tbd.VRDESPESA), 0) FROM "${databaseSchema}".DESPESALOJA tbd 
                 WHERE tbd.IDEMPRESA = tbe.IDEMPRESA 
                 AND tbd.STCANCELADO = 'False' 
                 AND tbd.DTDESPESA = ?) AS VALORTOTALDESPESA,  
                (SELECT IFNULL(SUM(tbas.VRVALORDESCONTO), 0) FROM "${databaseSchema}".ADIANTAMENTOSALARIAL tbas 
                 WHERE tbas.IDEMPRESA = tbe.IDEMPRESA 
                 AND tbas.STATIVO = 'True' 
                 AND tbas.DTLANCAMENTO = ?) AS VALORTOTALADIANTAMENTOSALARIAL  
            FROM 
                "${databaseSchema}".VENDA tbv 
                INNER JOIN "${databaseSchema}".MOVIMENTOCAIXA tbmc ON tbmc.ID = tbv.IDMOVIMENTOCAIXAWEB 
                INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbe.IDEMPRESA = tbv.IDEMPRESA 
                INNER JOIN "${databaseSchema}".CAIXA tbc ON tbc.IDCAIXAWEB = tbv.IDCAIXAWEB 
                LEFT JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbf.IDFUNCIONARIO = tbv.IDOPERADOR 
            WHERE 
                tbv.STCANCELADO = 'False'
        `;

        const params = [dataPesquisa, dataPesquisa, dataPesquisa];

        if (idEmpresa) {
            query += ' AND tbv.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (dataPesquisa) {
            query += ' AND (tbv.DTHORAFECHAMENTO BETWEEN ? AND ?)';
            params.push(`${dataPesquisa} 00:00:00`, `${dataPesquisa} 23:59:59`);
        }

        query += ' GROUP BY tbe.IDEMPRESA, tbe.NOFANTASIA, tbv.IDCAIXAWEB, tbc.DSCAIXA, tbf.NOFUNCIONARIO, tbv.IDMOVIMENTOCAIXAWEB';

        query += ` LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;
        const result = await conn.execute(query, params);
        const rows = Array.isArray(result) ? result : [];

        const data = await Promise.all(rows.map(async (registro) => {
            const valorInformado = await getLinhasDoMovimento(registro.IDMOVIMENTOCAIXAWEB);
            const depositos = await getLinhasDoDeposito(registro.IDEMPRESA, dataPesquisa);

            return {
                "IDEMPRESA": registro.IDEMPRESA,
                "IDMOVIMENTOCAIXAWEB": registro.IDMOVIMENTOCAIXAWEB,
                "NOFANTASIA": registro.NOFANTASIA,
                "IDCAIXAWEB": registro.IDCAIXAWEB,
                "DSCAIXA": registro.DSCAIXA,
                "NOFUNCIONARIO": registro.NOFUNCIONARIO,
                "VALORTOTALDINHEIRO": registro.VALORTOTALDINHEIRO,
                "VALORTOTALCARTAO": registro.VALORTOTALCARTAO,
                "VALORTOTALCONVENIO": registro.VALORTOTALCONVENIO,
                "VALORTOTALPOS": registro.VALORTOTALPOS,
                "VALORTOTALVOUCHER": registro.VALORTOTALVOUCHER,
                "VALORTOTALFATURA": registro.VALORTOTALFATURA,
                "VALORTOTALDESPESA": registro.VALORTOTALDESPESA,
                "VALORTOTALADIANTAMENTOSALARIAL": registro.VALORTOTALADIANTAMENTOSALARIAL,
                "VALORINFORMADO": valorInformado,
                "DEPOSITOS": depositos
            };
        }));

        return {
            page,
            pageSize,
            rows: data.length,
            data,
        };
    } catch (error) {
        console.error('Erro ao executar a consulta de fechamento de caixa:', error);
        throw new Error('Erro ao obter o detalhe de fechamento');
    }
};
