
// import conn from '../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getDetalheOrdemTransferencia = async (idResumoOT, idTipoFiltro, pageSize, page) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        var query = `
            SELECT 
                rot.IDRESUMOOT,
                rot.IDEMPRESAORIGEM,
                (SELECT IFNULL(NOFANTASIA, '') FROM "${databaseSchema}".EMPRESA WHERE IDEMPRESA = rot.IDEMPRESAORIGEM) AS EMPRESAORIGEM,
                rot.IDEMPRESADESTINO,
                (SELECT IFNULL(NOFANTASIA, '') FROM "${databaseSchema}".EMPRESA WHERE IDEMPRESA = rot.IDEMPRESADESTINO) AS EMPRESADESTINO,
                IFNULL(TO_VARCHAR(rot.DATAEXPEDICAO,'YYYY-MM-DD HH24:MI:SS'), '') AS DATAEXPEDICAO,
                IFNULL(TO_VARCHAR(rot.DATAEXPEDICAO,'DD/MM/YYYY'), 'Não Informado') AS DATAEXPEDICAOFORMATADA,
                rot.IDOPERADOREXPEDICAO,
                rot.NUTOTALITENS,
                rot.QTDTOTALITENS,
                rot.QTDTOTALITENSRECEPCIONADO,
                rot.QTDTOTALITENSDIVERGENCIA,
                rot.NUTOTALVOLUMES,
                rot.TPVOLUME,
                rot.VRTOTALCUSTO,
                rot.VRTOTALVENDA,
                IFNULL(TO_VARCHAR(rot.DTRECEPCAO,'YYYY-MM-DD HH24:MI:SS'), '') AS DTRECEPCAO,
                IFNULL(TO_VARCHAR(rot.DTRECEPCAO,'DD/MM/YYYY'), 'Não Informado') AS DTRECEPCAOFORMATADA,
                rot.IDOPERADORRECEPTOR,
                rot.DSOBSERVACAO,
                rot.IDUSRCANCELAMENTO,
                IFNULL(TO_VARCHAR(rot.DTULTALTERACAO,'YYYY-MM-DD HH24:MI:SS'), '') AS DTULTALTERACAO,
                IFNULL(TO_VARCHAR(rot.DTULTALTERACAO,'DD/MM/YYYY'), 'Não Informado') AS DTULTALTERACAOFORMATADA,
                rot.IDSTDIVERGENCIA,
                rot.OBSDIVERGENCIA,
                rot.STEMISSAONFE,
                IFNULL(rot.NUMERONFE, '') AS NUMERONFE,
                rot.STENTRADAINVENTARIO,
                IFNULL(rot.QTDCONFERENCIA, 0) AS QTDCONFERENCIA,
                rot.IDSTATUSOT,
                rot.IDUSRAJUSTE,
                IFNULL(TO_VARCHAR(rot.DTAJUSTE,'YYYY-MM-DD HH24:MI:SS'), '') AS DTAJUSTE,
                IFNULL(TO_VARCHAR(rot.DTAJUSTE,'DD/MM/YYYY'), 'Não Informado') AS DTAJUSTEFORMATADA,
                rot.QTDTOTALITENSAJUSTE,
                sot.DESCRICAOOT,
                dot.IDDETALHEOT,
                dot.IDPRODUTO,
                dot.QTDEXPEDICAO,
                dot.QTDRECEPCAO,
                dot.QTDDIFERENCA,
                dot.QTDAJUSTE,
                dot.VLRUNITVENDA,
                dot.VLRUNITCUSTO,
                dot.STCONFERIDO,
                dot.IDUSRAJUSTE,
                dot.STATIVO AS STATIVODETALHEOT,
                dot.STFALTA,
                dot.STSOBRA,
                p.NUCODBARRAS,
                p.DSNOME
            FROM "${databaseSchema}".RESUMOORDEMTRANSFERENCIA rot
                JOIN "${databaseSchema}".DETALHEORDEMTRANSFERENCIA dot ON dot.IDRESUMOOT = rot.IDRESUMOOT
                JOIN "${databaseSchema}".PRODUTO p ON p.IDPRODUTO = dot.IDPRODUTO
                JOIN "${databaseSchema}".STATUSORDEMTRANSFERENCIA sot ON sot.IDSTATUSOT = rot.IDSTATUSOT
            WHERE 1 = 1
        `;

        const params = [];
        
        if(idResumoOT) {
            query += ' AND rot.IDRESUMOOT = ?';
            params.push(idResumoOT);
        }
        
        if (idTipoFiltro === 1) {
            query += 'AND (((dot.QTDDIFERENCA != 0 OR dot.QTDAJUSTE > 0) AND rot.IDSTATUSOT = 6) OR (rot.IDSTATUSOT != 6))'
            
        } 


        query += ' ORDER BY rot.DATAEXPEDICAO DESC';

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
        console.error('Erro ao executar consulta detalhe ordem de transferencia', error);
        throw error;
    }
};