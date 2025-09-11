// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';

const databaseSchema = process.env.HANA_DATABASE;

export const getVendaTotal = async (dataPesquisa, page, pageSize) => {
    try {

        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        const offset = (page - 1) * pageSize;


        let query = `
            SELECT 
                IFNULL(SUM(tbv.VRRECDINHEIRO), 0) AS VALORTOTALDINHEIRO,
                IFNULL(SUM(tbv.VRRECCARTAO), 0) AS VALORTOTALCARTAO, 
                IFNULL(SUM(tbv.VRRECCONVENIO), 0) AS VALORTOTALCONVENIO, 
                IFNULL(SUM(tbv.VRRECPOS), 0) AS VALORTOTALPOS, 
                IFNULL(SUM(tbv.VRRECVOUCHER), 0) AS VALORTOTALVOUCHER, 
                (SELECT IFNULL(SUM(tbdf.VRRECEBIDO), 0) 
                 FROM "${databaseSchema}".DETALHEFATURA tbdf 
                 WHERE tbdf.DTPROCESSAMENTO = ? AND tbdf.STCANCELADO = 'False') AS VALORTOTALFATURA,  
                (SELECT IFNULL(SUM(tbd.VRDESPESA), 0) 
                 FROM "${databaseSchema}".DESPESALOJA tbd 
                 WHERE tbd.DTDESPESA = ? AND tbd.STCANCELADO = 'False') AS VALORTOTALDESPESA,  
                (SELECT IFNULL(SUM(tbas.VRVALORDESCONTO), 0) 
                 FROM "${databaseSchema}".ADIANTAMENTOSALARIAL tbas 
                 WHERE tbas.DTLANCAMENTO = ? AND tbas.STATIVO = 'True') AS VALORTOTALADIANTAMENTOSALARIAL  
            FROM "${databaseSchema}".VENDA tbv 
            WHERE tbv.STCANCELADO = 'False'
        `;

  
        const params = [dataPesquisa, dataPesquisa, dataPesquisa];
        
        if (dataPesquisa) {
            query += ' AND (tbv.DTHORAFECHAMENTO BETWEEN ? AND ?)';
            params.push(`${dataPesquisa} 00:00:00`, `${dataPesquisa} 23:59:59`);
        }

        query += ` LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`;
        const statement = conn.prepare(query);
        const result = await statement.execute(params);

        return {
            page,
            pageSize,
            rows: result.length,
            data: result
        };
    } catch (e) {
        console.error('Erro ao executar a consulta de vendas:', e);
        throw new Error('Erro ao executar a consulta de vendas');
    } 
};
