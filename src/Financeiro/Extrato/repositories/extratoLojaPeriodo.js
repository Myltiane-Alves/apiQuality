import 'dotenv/config';
// import conn from '../../../config/dbConnection.js';
const databaseSchema = process.env.HANA_DATABASE;


export const getPrimeiraVendaSaldoAtual = async (idEmpresa, dataPesquisa) => {
    try {
        if (!dataPesquisa) {
            dataPesquisa = new Date().toISOString().slice(0, 10);
        }

        const query1 = `
            SELECT 
                TO_VARCHAR(MIN(VENDA.DTHORAFECHAMENTO), 'DD-MM-YYYY') AS DTPRIMEIRAVENDAFORMATADA,
                TO_VARCHAR(MIN(VENDA.DTHORAFECHAMENTO), 'YYYY-MM-DD') AS DTPRIMEIRAVENDA
            FROM "${databaseSchema}".VENDA
            WHERE VENDA.STCANCELADO = 'False' AND VENDA.IDEMPRESA = ?
        `;

        const params1 = [idEmpresa];
        const statement1 = await conn.prepare(query1);
        const result1 = await statement1.exec(params1);

        if (!result1 || result1.length === 0) {
            return { error: "Nenhum registro encontrado para a primeira venda." };
        }

        const dataPrimeiraVenda = result1[0].DTPRIMEIRAVENDA || '2020-12-11';

        const partes = dataPesquisa.split("-");
        const ano = partes[0];
        const mes = partes[1] - 1;
        const dia = partes[2];

        const dataFinal = new Date(ano, mes, dia);
        dataFinal.setDate(dataFinal.getDate() - 1);

        const dd = ("0" + dataFinal.getDate()).slice(-2);
        const mm = ("0" + (dataFinal.getMonth() + 1)).slice(-2);
        const y = dataFinal.getFullYear();
        const dataPesquisaFim = `${y}-${mm}-${dd}`;

        const query2 = `
            SELECT 
                IFNULL(SUM(VRDESPESA), 0) AS VALORTOTALDESPESA,
                (SELECT IFNULL(SUM(VRRECDINHEIRO - VRTROCO), 0) 
                 FROM "${databaseSchema}".VENDA 
                 WHERE STCANCELADO = 'False' 
                   AND (DTHORAFECHAMENTO BETWEEN '${dataPrimeiraVenda} 00:00:00' AND '${dataPesquisaFim} 23:59:59') 
                   AND IDEMPRESA = ${idEmpresa}) AS VALORTOTALDINHEIRO,
                (SELECT IFNULL(SUM(VRRECEBIDO), 0) 
                 FROM "${databaseSchema}".DETALHEFATURA 
                 WHERE STCANCELADO = 'False' 
                   AND (STPIX = 'False' OR STPIX IS NULL) 
                   AND (DTPROCESSAMENTO BETWEEN '${dataPrimeiraVenda}' AND '${dataPesquisaFim}') 
                   AND IDEMPRESA = ${idEmpresa}) AS VALORTOTALFATURA,
                (SELECT IFNULL(SUM(VRVALORDESCONTO), 0) 
                 FROM "${databaseSchema}".ADIANTAMENTOSALARIAL 
                 WHERE STATIVO = 'True' 
                   AND (DTLANCAMENTO BETWEEN '${dataPrimeiraVenda} 00:00:00' AND '${dataPesquisaFim} 23:59:59') 
                   AND IDEMPRESA = ${idEmpresa}) AS VALORTOTALADIANTAMENTOSAL,
                (SELECT IFNULL(SUM(VRDEPOSITO), 0) 
                 FROM "${databaseSchema}".DEPOSITOLOJA 
                 WHERE STCANCELADO = 'False' 
                   AND (DTDEPOSITO BETWEEN '${dataPrimeiraVenda} 00:00:00' AND '${dataPesquisaFim} 23:59:59') 
                   AND IDEMPRESA = ${idEmpresa}) AS VALORTOTALDEPOSITO,
                (SELECT IFNULL(SUM(VRDEBITO), 0) 
                 FROM "${databaseSchema}".AJUSTEEXTRATO 
                 WHERE STCANCELADO = 'False' 
                   AND (DATACADASTRO BETWEEN '${dataPrimeiraVenda} 00:00:00' AND '${dataPesquisaFim} 23:59:59') 
                   AND IDEMPRESA = ${idEmpresa}) AS VALORTOTALDEBITOAJUSTE,
                (SELECT IFNULL(SUM(VRCREDITO), 0) 
                 FROM "${databaseSchema}".AJUSTEEXTRATO 
                 WHERE STCANCELADO = 'False' 
                   AND (DATACADASTRO BETWEEN '${dataPrimeiraVenda} 00:00:00' AND '${dataPesquisaFim} 23:59:59') 
                   AND IDEMPRESA = ${idEmpresa}) AS VALORTOTALCREDITOAJUSTE
            FROM "${databaseSchema}".DESPESALOJA
            WHERE STCANCELADO = 'False' 
              AND (DTDESPESA BETWEEN '${dataPrimeiraVenda} 00:00:00' AND '${dataPesquisaFim} 23:59:59') 
              AND IDEMPRESA = ?
        `;

        const params2 = [idEmpresa];
        const statement2 = await conn.prepare(query2);
        const result2 = await statement2.exec(params2);

        const det2 = result2[0];

        const saldoPositivo = parseFloat(det2.VALORTOTALDINHEIRO) + parseFloat(det2.VALORTOTALFATURA);
        const saldoNegativo = parseFloat(det2.VALORTOTALDESPESA) + parseFloat(det2.VALORTOTALDEPOSITO) + parseFloat(det2.VALORTOTALADIANTAMENTOSAL);
        const ajuste = parseFloat(det2.VALORTOTALDEBITOAJUSTE) - parseFloat(det2.VALORTOTALCREDITOAJUSTE);
        const saldoAtualizadoAtual = saldoPositivo - saldoNegativo + ajuste;

        const query3 = `
            SELECT 
                CAST(tbmc.VRFISICODINHEIRO AS DECIMAL) AS VRFISICODINHEIRO,
                CAST(tbmc.VRRECDINHEIRO AS DECIMAL) AS VRRECDINHEIRO,
                CAST(tbmc.VRAJUSTDINHEIRO AS DECIMAL) AS VRAJUSTDINHEIRO
            FROM "${databaseSchema}".MOVIMENTOCAIXA tbmc
            WHERE tbmc.IDEMPRESA = ? 
              AND tbmc.DTABERTURA BETWEEN '${dataPrimeiraVenda} 00:00:00' AND '${dataPesquisaFim} 23:59:59'
        `;

        const params3 = [idEmpresa];
        const statement3 = await conn.prepare(query3);
        const result3 = await statement3.exec(params3);

        let totalQuebra = 0;

        result3.forEach(row => {
            const totalInformado = row.VRAJUSTDINHEIRO > 0 ? row.VRAJUSTDINHEIRO : row.VRRECDINHEIRO;
            totalQuebra += totalInformado - row.VRFISICODINHEIRO;
        });

        return {
            DTPRIMEIRAVENDA: result1[0].DTPRIMEIRAVENDAFORMATADA,
            DTULTIMAPESQ: dataPesquisaFim,
            VALORTOTALDESPESA: det2.VALORTOTALDESPESA,
            VALORTOTALDINHEIRO: det2.VALORTOTALDINHEIRO,
            VALORTOTALFATURA: det2.VALORTOTALFATURA,
            VALORTOTALDEPOSITO: det2.VALORTOTALDEPOSITO,
            VALORCREDITO: saldoPositivo.toFixed(2),
            VALORDEBITO: saldoNegativo.toFixed(2),
            SALDO: saldoAtualizadoAtual.toFixed(2),
            TOTALQUEBRA: totalQuebra.toFixed(2),
            dataPrimeiraVenda,
            dataPesquisaFim
        };

    } catch (error) {
        console.error("Erro ao buscar saldo:", error);
        throw new Error("Erro ao buscar saldo.");
    }
};

export const getVenda = async (idEmpresa, dataPesquisa) => {
    try {
        let partes = dataPesquisa.split("-");
        let ano = partes[0];
        let mes = partes[1] - 1;  
        let dia = partes[2];

        let dataFinal = new Date(ano, mes, dia);
        dataFinal.setDate(dataFinal.getDate() - 1); 

        let dd = ("0" + dataFinal.getDate()).slice(-2);
        let mm = ("0" + (dataFinal.getMonth() + 1)).slice(-2);
        let y = dataFinal.getFullYear();

        let dataPesquisaFormatada = `${dd}-${mm}-${y}`;

        let query = `SELECT 
            TO_VARCHAR(tbv.DTHORAFECHAMENTO,'YYYY-MM-DD') AS DTHORAFECHAMENTO,
            TO_VARCHAR(tbv.DTHORAFECHAMENTO,'DD-MM-YYYY') AS DTHORAFECHAMENTOFORMATADA,
            SUM(tbv.VRRECDINHEIRO - VRTROCO) AS VRRECDINHEIRO
        FROM 
            "${databaseSchema}".VENDA tbv
        WHERE 
            IDEMPRESA = ? AND tbv.STCANCELADO = 'False'
        `;

        const params = [idEmpresa];
        if (dataPesquisa) {
            query += ` AND tbv.DTHORAFECHAMENTO BETWEEN ? AND ?`;
            params.push(`${dataPesquisa} 00:00:00`, `${dataPesquisa} 23:59:59`);
        }

        query += `
        GROUP BY 
            TO_VARCHAR(tbv.DTHORAFECHAMENTO, 'YYYY-MM-DD'), 
            TO_VARCHAR(tbv.DTHORAFECHAMENTO, 'DD-MM-YYYY')
        ORDER BY 
            TO_VARCHAR(tbv.DTHORAFECHAMENTO, 'YYYY-MM-DD')`;

        const rows = await conn.exec(query, params);
        
        if (!Array.isArray(rows)) {
            throw new Error('O retorno da consulta SQL não é um array.');
        }
        if (rows.length > 0) {
            const result = rows.map(row => ({
                VRRECDINHEIRO: row.VRRECDINHEIRO,
                DTHORAFECHAMENTO: row.DTHORAFECHAMENTO,
                DTHORAFECHAMENTOFORMATADA: row.DTHORAFECHAMENTOFORMATADA
            }));
            return result;
        } else {
            return {
                VRRECDINHEIRO: "0",
                DTHORAFECHAMENTO: dataPesquisa,
                DTHORAFECHAMENTOFORMATADA: dataPesquisaFormatada
            };
        }

    } catch (error) {
        console.error('Error executing query', error);
        throw error;
    }
};

export const getObterFaturas = async (idEmpresa, dataPesquisa) => {
    try {
     
        const query = `
            SELECT 
                DTPROCESSAMENTO, 
                TO_VARCHAR(DTPROCESSAMENTO, 'DD-MM-YYYY') AS DTPROCESSAMENTOFORMATADA, 
                SUM(VRRECEBIDO) AS VRRECEBIDO 
            FROM "${databaseSchema}".DETALHEFATURA 
            WHERE 
                IDEMPRESA = ? 
                AND DTPROCESSAMENTO = ? 
                AND STCANCELADO = 'False' 
                AND (STPIX = 'False' OR STPIX IS NULL) 
            GROUP BY DTPROCESSAMENTO 
            ORDER BY DTPROCESSAMENTO
        `;

        const params = [idEmpresa, dataPesquisa];

        const statement = await conn.prepare(query);
        const rows = await statement.exec(params);

        if (!Array.isArray(rows)) {
            throw new Error('O retorno da consulta SQL não é um array.');
        }

        const results = rows.map(row => ({
            "DTPROCESSAMENTO": row.DTPROCESSAMENTO,
            "VRRECEBIDO": row.VRRECEBIDO,
            "DTPROCESSAMENTOFORMATADA": row.DTPROCESSAMENTOFORMATADA,
        }));

        return results;
    } catch (error) {
        console.error('Erro ao executar a consulta:', error);
        throw new Error('Erro ao buscar as faturas.');
    }
};


export const getObterDepositos = async (idEmpresa, dataPesquisa) => {
    try {
        let query = `
            SELECT 
                tbdl.IDDEPOSITOLOJA, 
                tbdl.DTDEPOSITO, 
                tbdl.DTMOVIMENTOCAIXA,
                tbdl.STCANCELADO, 
                tbdl.STCONFERIDO, 
                tbdl.NUDOCDEPOSITO, 
                TO_VARCHAR(tbdl.DTDEPOSITO, 'DD-MM-YYYY') AS DTDEPOSITOFORMATADA, 
                TO_VARCHAR(tbdl.DTMOVIMENTOCAIXA, 'DD-MM-YYYY') AS DTMOVIMENTOCAIXAFORMATADA, 
                CONCAT(CONCAT(tbb.DSBANCO, ' - '), tbcb.DSCONTABANCO) AS DSBANCO, 
                CONCAT(CONCAT(tbF.IDFUNCIONARIO, ' - '), tbF.NOFUNCIONARIO) AS FUNCIONARIO, 
                tbdl.VRDEPOSITO AS VRDEPOSITO 
            FROM 
                "${databaseSchema}".DEPOSITOLOJA tbdl  
                LEFT JOIN "${databaseSchema}".CONTABANCO tbcb ON tbdl.IDCONTABANCO = tbcb.IDCONTABANCO 
                LEFT JOIN "${databaseSchema}".BANCO tbb ON tbcb.IDBANCO = tbb.IDBANCO 
                LEFT JOIN "${databaseSchema}".FUNCIONARIO tbF ON tbdl.IDUSR = tbF.IDFUNCIONARIO 
            WHERE 
                tbdl.IDEMPRESA = ? 
                AND tbdl.DTDEPOSITO BETWEEN ? AND ?
                AND tbdl.STCANCELADO = 'False'
            ORDER BY 
                tbdl.DTDEPOSITO
                
        `;

        const params = [idEmpresa, `${dataPesquisa} 00:00:00`, `${dataPesquisa} 23:59:59`];
        const statement = await conn.prepare(query);
        const rows = await statement.exec(params);
        
        if (!Array.isArray(rows)) {
            throw new Error('O retorno da consulta deposito não é um array.');
        }

        const lines = rows.map(row => ({
            IDDEPOSITOLOJA: row.IDDEPOSITOLOJA,
            DTDEPOSITO: row.DTDEPOSITO,
            DTMOVIMENTOCAIXA: row.DTMOVIMENTOCAIXA,
            STCANCELADO: row.STCANCELADO,
            STCONFERIDO: row.STCONFERIDO,
            NUDOCDEPOSITO: row.NUDOCDEPOSITO,
            VRDEPOSITO: row.VRDEPOSITO,
            FUNCIONARIO: row.FUNCIONARIO,
            DTDEPOSITOFORMATADA: row.DTDEPOSITOFORMATADA,
            DTMOVIMENTOCAIXAFORMATADA: row.DTMOVIMENTOCAIXAFORMATADA,
            DSBANCO: row.DSBANCO
        }));


        return lines;
    } catch (error) {
        console.error('Erro ao executar a consulta obter deposito', error);
        throw error;
    }
};

export const getObterDespesas = async (idEmpresa, dataPesquisa) => {
    try {
        let query = `
            SELECT 
                tbdl.DTDESPESA, 
                TO_VARCHAR(tbdl.DTDESPESA, 'DD-MM-YYYY') AS DTDESPESAFORMATADA, 
                tbdl.VRDESPESA, 
                tbdl.DSPAGOA, 
                tbdl.STCANCELADO, 
                tbcd.DSCATEGORIA, 
                CAST(tbdl.DSHISTORIO AS TEXT) AS DSHISTORIO
            FROM 
                "${databaseSchema}".DESPESALOJA tbdl 
                INNER JOIN "${databaseSchema}".CATEGORIARECEITADESPESA tbcd 
                ON tbdl.IDCATEGORIARECEITADESPESA = tbcd.IDCATEGORIARECDESP
            WHERE 
                tbdl.IDEMPRESA = ? 
                AND tbdl.DTDESPESA BETWEEN ? AND ? 
                AND tbdl.STCANCELADO = 'False'
            ORDER BY 
                tbdl.DTDESPESA
        `;

        const params = [idEmpresa, `${dataPesquisa} 00:00:00`, `${dataPesquisa} 23:59:59`];

        const statement = await conn.prepare(query);
        const rows = await statement.exec(params);

        if (!Array.isArray(rows)) {
            throw new Error('O retorno da consulta despesas não é um array.');
        }

        const lines = rows.map(row => ({
            DTDESPESA: row.DTDESPESA,
            VRDESPESA: row.VRDESPESA,
            DSHISTORIO: row.DSHISTORIO,
            DTDESPESAFORMATADA: row.DTDESPESAFORMATADA,
            DSPAGOA: row.DSPAGOA,
            DSCATEGORIA: row.DSCATEGORIA,
            STCANCELADO: row.STCANCELADO
        }));

        return lines;
    } catch (error) {
        console.error('Erro ao executar a consulta obter despesas', error);
        throw error;
    }
};

export const getObterQuebra = async (idEmpresa, dataPesquisa) => {
    try {
        let query = `
            SELECT 
                TO_VARCHAR(tbmc.DTABERTURA, 'DD-MM-YYYY') AS DTMOVCAIXA,
                tbmc.ID, 
                tbmc.VRFISICODINHEIRO, 
                tbmc.VRRECDINHEIRO, 
                tbmc.VRAJUSTDINHEIRO, 
                CONCAT(CONCAT(tbF.IDFUNCIONARIO, ' - '), tbF.NOFUNCIONARIO) AS FUNCIONARIOMOV
            FROM 
                "${databaseSchema}".MOVIMENTOCAIXA tbmc
            LEFT JOIN 
                "${databaseSchema}".FUNCIONARIO tbF 
            ON 
                tbmc.IDOPERADOR = tbF.IDFUNCIONARIO
            WHERE 
                tbmc.IDEMPRESA = ? 
            AND 
                tbmc.DTABERTURA BETWEEN ? AND ?`;

        const params = [
            idEmpresa, 
            `${dataPesquisa} 00:00:00`, 
            `${dataPesquisa} 23:59:59`
        ];

        const statement = await conn.prepare(query);
        const rows = await statement.exec(params);
        if (!Array.isArray(rows)) {
            throw new Error('O retorno da consultaobter quebra não é um array.');
        }
        const lines = rows.map(row => ({
            DTMOVCAIXA: row.DTMOVCAIXA,
            IDMOV: row.ID,
            VRFISICODINHEIRO: row.VRFISICODINHEIRO,
            VRRECDINHEIRO: row.VRRECDINHEIRO,
            VRAJUSTDINHEIRO: row.VRAJUSTDINHEIRO,
            FUNCIONARIOMOV: row.FUNCIONARIOMOV
        }));

        return lines;
    } catch (error) {
        console.error('Erro ao executar a consulta', error);
        throw error;
    }
};

export const getObterQuebraDiaAnterior = async (idEmpresa, dataPesquisa) => {
    try {
     
        const [ano, mes, dia] = dataPesquisa.split("-");
        const dataFinal = new Date(ano, mes - 1, dia);
        dataFinal.setDate(dataFinal.getDate() - 1);

        const dd = ("0" + dataFinal.getDate()).slice(-2);
        const mm = ("0" + (dataFinal.getMonth() + 1)).slice(-2);
        const y = dataFinal.getFullYear();

        const dataPesquisaFim = `${y}-${mm}-${dd}`;

        let TOTALQUEBRA = 0;

        const query = `
            SELECT 
                CAST(tbmc.VRFISICODINHEIRO AS DECIMAL) AS VRFISICODINHEIRO, 
                CAST(tbmc.VRRECDINHEIRO AS DECIMAL) AS VRRECDINHEIRO,
                CAST(tbmc.VRAJUSTDINHEIRO AS DECIMAL) AS VRAJUSTDINHEIRO
            FROM 
                "${databaseSchema}".MOVIMENTOCAIXA tbmc
            WHERE 
                tbmc.IDEMPRESA = ? 
            AND 
                tbmc.DTABERTURA BETWEEN ? AND ?
        `;

        const params = [
            idEmpresa, 
            `${dataPesquisaFim} 00:00:00`, 
            `${dataPesquisaFim} 23:59:59`
        ];

        const statement = await conn.prepare(query);
        const rows = await statement.exec(params);

        if (!Array.isArray(rows)) {
            throw new Error('O retorno da consulta Quebra Anterior não é um array.');
        }

        for (const det of rows) {
            let TOTALINFORMADO;
            if (det.VRAJUSTDINHEIRO > 0) {
                TOTALINFORMADO = det.VRAJUSTDINHEIRO;
            } else {
                TOTALINFORMADO = det.VRRECDINHEIRO;
            }

            TOTALQUEBRA += (TOTALINFORMADO - det.VRFISICODINHEIRO);
        }

        const docLine = {
            "TOTALQUEBRAANTERIOR": TOTALQUEBRA.toFixed(2),
            "DATAFIM": dataPesquisaFim
        };

        return docLine;

    } catch (error) {
        console.error('Erro ao executar a consulta', error);
        throw error;
    }
};

export const getObterAjusteExtrato = async (idEmpresa, dataPesquisa) => {
    try {
        const query = `
            SELECT 
                tbae.IDAJUSTEEXTRATO,
                tbae.DATACADASTRO,
                TO_VARCHAR(tbae.DATACADASTRO,'DD-MM-YYYY') AS DTCADASTROFORMATADA,
                tbae.VRDEBITO,
                tbae.VRCREDITO,
                tbae.STCANCELADO,
                tbae.HISTORICO
            FROM 
                "${databaseSchema}".AJUSTEEXTRATO tbae
            WHERE 
                tbae.IDEMPRESA = ?
            AND 
                tbae.DATACADASTRO BETWEEN ? AND ?
            ORDER BY 
                tbae.DATACADASTRO
        `;

        const params = [
            idEmpresa, 
            `${dataPesquisa} 00:00:00`, 
            `${dataPesquisa} 23:59:59`
        ];

        const statement = await conn.prepare(query);
        const rows = await statement.exec(params);

        if (!Array.isArray(rows)) {
            throw new Error('O retorno da consulta Ajuste Extrato não é um array.');
        }

        const lines = rows.map(det => ({
            "IDAJUSTEEXTRATO": det.IDAJUSTEEXTRATO,
            "DATACADASTRO": det.DATACADASTRO,
            "VRDEBITO": det.VRDEBITO,
            "VRCREDITO": det.VRCREDITO,
            "HISTORICO": det.HISTORICO,
            "DTCADASTROFORMATADA": det.DTCADASTROFORMATADA,
            "STCANCELADO": det.STCANCELADO
        }));

        return lines;

    } catch (error) {
        console.error('Erro ao executar a consulta', error);
        throw error;
    }
};

export const getObterAdiantamentos = async (idEmpresa, dataPesquisa) => {
    try {
        const query = `
            SELECT 
                tbas.DTLANCAMENTO,
                TO_VARCHAR(tbas.DTLANCAMENTO,'DD-MM-YYYY') AS DTLANCAMENTOADIANTAMENTO,
                tbas.VRVALORDESCONTO,
                tbf.NOFUNCIONARIO,
                tbas.STATIVO,
                CAST(tbas.TXTMOTIVO AS TEXT) AS DSMOTIVO
            FROM 
                "${databaseSchema}".ADIANTAMENTOSALARIAL tbas
            INNER JOIN 
                "${databaseSchema}".FUNCIONARIO tbf ON tbf.IDFUNCIONARIO = tbas.IDFUNCIONARIO
            WHERE 
                tbas.IDEMPRESA = ?
            AND 
                tbas.DTLANCAMENTO BETWEEN ? AND ?
            AND 
                tbas.STATIVO = 'True'
            ORDER BY 
                tbas.DTLANCAMENTO
        `;

        const params = [
            idEmpresa, 
            `${dataPesquisa} 00:00:00`, 
            `${dataPesquisa} 23:59:59`
        ];

        const statement = await conn.prepare(query);
        const rows = await statement.exec(params);

        if (!Array.isArray(rows)) {
            throw new Error('O retorno da consulta Obter Adiantamentos não é um array.');
        }

        const lines = rows.map(det => ({
            "DTLANCAMENTO": det.DTLANCAMENTO,
            "VRVALORDESCONTO": det.VRVALORDESCONTO,
            "NOFUNCIONARIO": det.NOFUNCIONARIO,
            "DTLANCAMENTOADIANTAMENTO": det.DTLANCAMENTOADIANTAMENTO,
            "STATIVO": det.STATIVO,
            "DSMOTIVO": det.DSMOTIVO
        }));

        return lines;

    } catch (error) {
        console.error('Erro ao executar a consulta', error);
        throw error;
    }
};

export const getExtratoLojaPeriodo = async (idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        let data = [];
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        const date1 = new Date(dataPesquisaInicio);
        const date2 = new Date(dataPesquisaFim);
        const timeDiff = Math.abs(date2.getTime() - date1.getTime());
        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
        
        for (let i = 0; i <= diffDays; i++) {
            const dInicio = new Date(dataPesquisaInicio);
            const dFim = new Date(dInicio.getTime() + (i * 24 * 60 * 60 * 1000));
            const dataPesquisaFormatada = `${dFim.getFullYear()}-${String(dFim.getMonth() + 1).padStart(2, '0')}-${String(dFim.getDate()).padStart(2, '0')}`;
            
            const venda = {
                "venda": await getVenda(idEmpresa, dataPesquisaFormatada),
                "totalFaturas": await getObterFaturas(idEmpresa, dataPesquisaFormatada),
                "totalDepositos": await getObterDepositos(idEmpresa, dataPesquisaFormatada),
                "despesas": await getObterDespesas(idEmpresa, dataPesquisaFormatada),
                "quebracaixa": await getObterQuebra(idEmpresa, dataPesquisaFormatada),
                "quebracaixaanterior": await getObterQuebraDiaAnterior(idEmpresa, dataPesquisaFormatada),
                "ajusteextrato": await getObterAjusteExtrato(idEmpresa, dataPesquisaFormatada),
                "primeiraVendaSaldo": await getPrimeiraVendaSaldoAtual(idEmpresa, dataPesquisaInicio),
                "adiantamentos": await getObterAdiantamentos(idEmpresa, dataPesquisaFormatada)
            };

            data.push(venda);
        }
        
        return { 
            page, 
            pageSize,
            rows: data.length,
            data: data,
         };

    } catch (error) {
        console.error('Erro ao executar a consulta', error);
        throw error;
    }
};