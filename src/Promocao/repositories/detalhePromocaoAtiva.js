// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getDetalheEmpresaPromocaoAtiva = async (idResumoPromocao) =>  {
    try {

        let query = `
            SELECT 
            IDEMPRESAPROMOCAOMARKETING, 
            IDRESUMOPROMOCAOMARKETING, 
            IDEMPRESA, 
            STATIVO
        FROM ${databaseSchema}.EMPRESAPROMOCAOMARKETING
        WHERE IDRESUMOPROMOCAOMARKETING = ?

        `;

        const params = [idResumoPromocao];

        query += ` ORDER BY  IDRESUMOPROMOCAOMARKETING`;
    
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);
        if(!Array.isArray(result) || result.length === 0) {
            return [];
        }

        const data = result.map(row => ({
            idEmpresaPromocaoMarketing: row.IDEMPRESAPROMOCAOMARKETING,
            idResumoPromocaoMarketing: row.IDRESUMOPROMOCAOMARKETING,
            idEmpresa: row.IDEMPRESA,
            statusAtivo: row.STATIVO
        }));
        return data;
        
    } catch (error) {
        console.log('Erro ao consultar Empresas Promoções Ativas', error);
    }
}

export const getDetalhePromocao = async (idResumoPromocao) =>  {
    try {

        let query = `
            SELECT 
                IDDETALHEPROMO,
                IDRESUMOPROMO, 
                IDPRODUTO     
            FROM "${databaseSchema}".DETALHEPROMOCAO
            WHERE 
            1 = ?

        `;

        const params = [idResumoPromocao];

        query += ` ORDER BY  IDRESUMOPROMOCAOMARKETING`;
    
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);
        if(!Array.isArray(result) || result.length === 0) {
            return [];
        }

        const data =  await Promise.all(result.map(async (row) => ({
            detalhe: {
                idResumoPromocao: row.IDRESUMOPROMO,
                idDetalhePromocao: row.IDDETALHEPROMO,
                idProduto: row.IDPRODUTO
            },
        })));
        return {
            page,
            pageSize,
            rows: data.length,
            data: data
        }
        
    } catch (error) {
        console.log('Erro ao consultar Detalhe Promoções ', error);
    }
}

export const getDetalhePromocaoAtiva = async (idResumoPromocao, dataPesquisaFim, page, pageSize) =>  {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                IDRESUMOPROMOCAOMARKETING, 
                DSPROMOCAOMARKETING, 
                DTHORAINICIO, 
                DTHORAFIM, 
                TPAPLICADOA, 
                APARTIRDEQTD, 
                APARTIRDOVLR, 
                TPFATORPROMO, 
                FATORPROMOVLR, 
                FATORPROMOPERC, 
                TPAPARTIRDE, 
                VLPRECOPRODUTO, 
                IDMECANICARESUMOPROMOCAOMARKETING
            FROM "${databaseSchema}".RESUMOPROMOCAOMARKETING
            WHERE 
                1 = ?

        `;

        const params = [];

        if(idResumoPromocao) {
            query += ` AND IDRESUMOPROMOCAOMARKETING = ?`;
            params.push(idResumoPromocao);
        }

        if(dataPesquisaFim) {
            query += ` AND DTHORAFIM >= ?`;
            params.push(dataPesquisaFim + ' 23:59:59');
        }

        // if (dataPesquisaInicio && dataPesquisaFim) {
        //     query += ` AND DTHORAINICIO BETWEEN ? AND ?`;
        //     params.push(dataPesquisaInicio + ' 00:00:00', dataPesquisaFim + ' 23:59:59');
        // }

        query += ` ORDER BY  IDRESUMOPROMOCAOMARKETING`;
    
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);
        if(!Array.isArray(result) || result.length === 0) {
            return [];
        }

        const data =  await Promise.all(result.map(async (row) => ({
            detalhe: {
                idResumoPromocao: row.IDRESUMOPROMO,
                idDetalhePromocao: row.IDDETALHEPROMO,
                idProduto: row.IDPRODUTO
            },
            empresaspromocaoAtiva: await getDetalheEmpresaPromocaoAtiva(row.IDRESUMOPROMO),
            detalhePromocao: await getDetalhePromocao(row.IDRESUMOPROMO),

        })));
        return {
            page,
            pageSize,
            rows: data.length,
            data: data
        }
        
    } catch (error) {
        console.log('Erro ao consultar Promoções Ativas', error);
    }
}