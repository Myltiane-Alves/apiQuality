
// import conn from '../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getImpressaoEtiquetaOT = async (idResumoOT, stAtivo, pageSize, page) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        var query = `
            SELECT 
                cv.IDCONFEREVOLUMEOT, cv.IDRESUMOOT, cv.NUMEROVOLUME, cv.CODIGOBARRAS, cv.STATIVO,
                rot.IDEMPRESAORIGEM,
                (SELECT IFNULL(NOFANTASIA, '') FROM "${databaseSchema}".EMPRESA WHERE IDEMPRESA = rot.IDEMPRESAORIGEM) AS EMPRESAORIGEM,
                rot.IDEMPRESADESTINO,
                (SELECT IFNULL(NOFANTASIA, '') FROM "${databaseSchema}".EMPRESA WHERE IDEMPRESA = rot.IDEMPRESADESTINO) AS EMPRESADESTINO,
                IFNULL(TO_VARCHAR(rot.DATAEXPEDICAO,'DD/MM/YYYY'), 'Não Informado') AS DATAEXPEDICAOFORMATADA,
                rot.NUTOTALVOLUMES,
                rot.TPVOLUME
            FROM "${databaseSchema}".CONFEREVOLUMEOT cv
            INNER JOIN "${databaseSchema}".RESUMOORDEMTRANSFERENCIA rot ON rot.IDRESUMOOT = cv.IDRESUMOOT
            WHERE 1 = 1
        `; 
        const params = [1];

        if (idResumoOT) {
            query += 'AND IDRESUMOOT = ? ';
            params.push(idResumoOT);
        }

        if(stAtivo) {
            query += 'AND STATIVO = \'True\' ';
        }
        
        
        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);


        return {
            page,
            pageSize,
            rows: result.length,
            data: result
        };
    } catch (error) {
        console.error('Erro ao executar consulta Impressão entrega', error);
        throw error;
    }
};