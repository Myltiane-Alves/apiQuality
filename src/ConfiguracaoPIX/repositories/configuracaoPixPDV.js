// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getConfiguracaoPixPDV = async (idConfiguracao, idEmpresa, idPixPgtoVenda, idPixPgtoFatura, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT
                tbc.IDCONFIGURACAO,
                tbc.IDEMPRESA,
                tbe.NOFANTASIA,
                tbc.UF,
                tbc.TPFORMAEMISSAO,
                tbc.TPMODELODOCFISCAL,
                tbc.TPVERSAOMODFISCAL,
                tbc.TPEMISSAO,
                tbc.TPAMBIENTE,
                tbc.PATHCERTIFICADO,
                tbc.NUCERTIFICADO,
                tbc.PWSENHA,
                tbc.NULOTEPROD,
                tbc.NUULTNFPROD,
                tbc.NULOTHOM,
                tbc.NUULTNFHOM,
                tbc.DSCRT,
                tbc.STATUALIZA_XML,
                tbc.STEXIBIRERROSCHEMA,
                tbc.ST_CRIARPASTAMENSALMENTE,
                tbc.ST_SEPARARARQ_CNPJCERTIFICADO,
                tbc.DSFORMATOALERTA,
                tbc.IDTOKEN,
                tbc.TOKENCSC,
                tbc.STRETIRARACENTOSXML,
                tbc.STSALVARARQUIVOENVIORESPOSTA,
                CAST(tbc.PATHSALVARARQUIVOSENVIORESP AS VARCHAR) AS PATHSALVARARQUIVOSENVIORESP,
                tbc.PATHARQXDS_SCHEMA,
                tbc.PATH_ARQNFE,
                tbc.PATH_ARQCANCELADO,
                tbc.PATH_ARQ_CARTACORRECAO,
                tbc.PATH_ARQINUTILIZACAO,
                tbc.PATH_ARQ_DPEC,
                tbc.PATH_ARQ_EVENTO,
                tbc.PATH_LOGO,
                tbc.DTULTALTERACAO,
                tbc.DSNOMEPFX,
                tbc.STCERTIFICADO,
                tbc.DTVALIDADECERTIFICADO,
                tbc.CNPJ_AUTXML,
                tbc.DSPATHNFCE,
                tbc.ST_SAP_ONLINE,
                tbc.IDPSPPIX,
                tbc.IDPSPPIXFATURA
            FROM
                "${databaseSchema}".CONFIGURACAO tbc
            INNER JOIN "${databaseSchema}".EMPRESA tbe ON
                tbc.IDEMPRESA = tbe.IDEMPRESA
            WHERE
                1 = ?
        `;

        const params = [];


        if (idConfiguracao) {
            query += ' And  tbc.IDCONFIGURACAO = ? ';
            params.push(idConfiguracao);
        }
        
        if(idEmpresa){
            query = query + ' and tbc.IDEMPRESA = ' + idEmpresa;
            params.push(idEmpresa);
        }
        
        if(idPixPgtoVenda){
            query += ' and tbc.IDPSPPIX = ? ';
            params.push(idPixPgtoVenda);
        }
        
        if(idPixPgtoFatura){
            query += ' and tbc.IDPSPPIXFATURA = ? ';
            params.push(idPixPgtoFatura);
        }

        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

    
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        return result;
    } catch(e) {
        console.error('Erro ao buscar dados:', e);
        throw e;
    }
}


export const putConfiguracaoPixPDV = async (req) => {
    try {

        let queryFuncionario = `
            SELECT
                tbf.IDFUNCIONARIO
            FROM
                "${databaseSchema}".FUNCIONARIO tbf
            WHERE
                tbf.IDFUNCIONARIO = ?
        `;

        const statementFuncionario = await conn.prepare(queryFuncionario);
        const resultFuncionario = await statementFuncionario.exec([req[0].USER]);

        
        if (resultFuncionario[0].IDFUNCIONARIO !== 2010) {
            return {
                typemsg: 'error',
                msg: 'Usuario sem permissão para realizar a operação'
            };
        }

        const query = `
            UPDATE "${databaseSchema}".CONFIGURACAO
            SET IDPSPPIX = ?,
                IDPSPPIXFATURA = ?
            WHERE IDEMPRESA = ?
        `;


        const statement = conn.prepare(query);

        for (const registro of req) {
            statement.exec([registro.IDPSPPIX, registro.IDPSPPIXFATURA, registro.IDEMPRESA]);
        }

        conn.commit();

        const result = {
            typemsg: 'success',
            msg: 'Atualização realizada com sucesso!'
        };

        return result;
    } catch (error) {
        console.log('Erro ao atualizar configuração: ', error.message);
        console.error('Erro ao atualizar configuração: ', error.message);
        throw new Error(error.message);
    }
};
