// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getDetalheBalanco = async (idResumo, numeroColetor, page, pageSize) => {
    try {

        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        if (!idResumo) {
            throw 'Favor informar o id do resumo';
        }


        let query = `
            SELECT 
                tbdetb.IDRESUMOBALANCO, 
                tbe.NOFANTASIA, 
                tbe.WAREHOUSECODE,
                tbdetb.IDPRODUTO, 
                tbdetb.CODIGODEBARRAS AS NUCODBARRAS, 
                tbdetb.DSPRODUTO AS DSNOME, 
                IFNULL(SUM(tbdetb.TOTALCONTAGEMGERAL), 0) AS TOTALCONTAGEMGERAL, 
                tbdetb.IDDETALHEBALANCO, 
                tbdetb.NUMEROCOLETOR, 
                tbres.STCONSOLIDADO 
            FROM 
                "${databaseSchema}".DETALHEBALANCO tbdetb 
                INNER JOIN "${databaseSchema}".RESUMOBALANCO tbres 
                    ON tbdetb.IDRESUMOBALANCO = tbres.IDRESUMOBALANCO
                INNER JOIN "${databaseSchema}".EMPRESA tbe 
                    ON tbe.IDEMPRESA = tbres.IDEMPRESA
            WHERE 1 = 1
        `;

        const params = [];


        if (idResumo) {
            query += ' AND tbdetb.IDRESUMOBALANCO = ?';
            params.push(idResumo);
        }
        if (numeroColetor) {
            query += ' AND tbdetb.NUMEROCOLETOR = ?';
            params.push(numeroColetor);
        }

        query += ' AND tbdetb.STCANCELADO = \'False\' ';
        query += `
            GROUP BY 
                tbdetb.IDPRODUTO, 
                tbdetb.CODIGODEBARRAS, 
                tbdetb.DSPRODUTO, 
                tbe.WAREHOUSECODE, 
                tbe.NOFANTASIA, 
                tbdetb.IDRESUMOBALANCO, 
                tbdetb.IDDETALHEBALANCO, 
                tbdetb.NUMEROCOLETOR, 
                tbres.STCONSOLIDADO
        `;


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
        };
    } catch (error) {
        console.error('Erro ao executar a consulta Detalhe Balanco:', error);
        throw error;
    }
};

export const putDetalheBalanco = async (detalhes) => {
    try {
        let query = `
            UPDATE "${databaseSchema}"."DETALHEBALANCO" 
            SET "TOTALCONTAGEMGERAL" = ? 
            WHERE "IDDETALHEBALANCO" = ? 
        `;

        const statement = await conn.prepare(query);

        for (const detalhe of detalhes) {
            if (!detalhe.IDDETALHEBALANCO) {
                console.warn('IDDETALHEBALANCO esta vazio:', detalhe);
                continue;
            }

            const params = [
                detalhe.TOTALCONTAGEMGERAL,
                detalhe.IDDETALHEBALANCO
            ];
            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Detalhes do balanço atualizados com sucesso'
        };
    } catch (error) {
        console.error('Erro ao executar a consulta Detalhe Balanco:', error);
        throw error;
    }
}