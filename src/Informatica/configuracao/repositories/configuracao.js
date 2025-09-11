// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getConfiguracoes = async (idConfiguracao, idEmpresa, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        // tbc.TXTDADOSPFX,--
        // CAST(tbc.TXTDADOSPFX AS TEXT) AS TXTDADOSPFX, --

        var query = `
            SELECT 
                tbc.IDCONFIGURACAO,
                tbc.IDEMPRESA,
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
                tbc.ST_SAP_ONLINE
            FROM 
                "${databaseSchema}".CONFIGURACAO tbc
            WHERE 
            1 = ?
      `;

        const params = [1];

        if (idEmpresa) {
            query += ' AND tbc.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (idConfiguracao) {
            query += ' AND tbc.IDCONFIGURACAO = ?';
            params.push(idConfiguracao);
        }


        // Adiciona paginação
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, (page - 1) * pageSize);

        const statement = conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page,
            pageSize,
            rows: result.length,
            data: result,
        }
    } catch (error) {
        console.error('Error executar a consulta a configuração', error);
        throw error;
    }
};

export const updateConfiguracao = async (dados) => {
    try {


        var query = `
            UPDATE "${databaseSchema}"."CONFIGURACAO" SET 
                "IDEMPRESA" = ?, 
                "UF" = ?, 
                "TPFORMAEMISSAO" = ?, 
                "TPMODELODOCFISCAL" = ?, 
                "TPVERSAOMODFISCAL" = ?, 
                "TPEMISSAO" = ?, 
                "TPAMBIENTE" = ?, 
                "PATHCERTIFICADO" = ?, 
                "NUCERTIFICADO" = ?, 
                "PWSENHA" = ?, 
                "TXTDADOSPFX" = ?, 
                "NULOTEPROD" = ?, 
                "NUULTNFPROD" = ?, 
                "NULOTHOM" = ?, 
                "NUULTNFHOM" = ?, 
                "DSCRT" = ?, 
                "STATUALIZA_XML" = ?, 
                "STEXIBIRERROSCHEMA" = ?, 
                "ST_CRIARPASTAMENSALMENTE" = ?, 
                "ST_SEPARARARQ_CNPJCERTIFICADO" = ?, 
                "DSFORMATOALERTA" = ?, 
                "IDTOKEN" = ?, 
                "TOKENCSC" = ?, 
                "STRETIRARACENTOSXML" = ?, 
                "STSALVARARQUIVOENVIORESPOSTA" = ?, 
                "PATHSALVARARQUIVOSENVIORESP" = ?, 
                "PATHARQXDS_SCHEMA" = ?, 
                "PATH_ARQNFE" = ?, 
                "PATH_ARQCANCELADO" = ?, 
                "PATH_ARQ_CARTACORRECAO" = ?, 
                "PATH_ARQINUTILIZACAO" = ?, 
                "PATH_ARQ_DPEC" = ?, 
                "PATH_ARQ_EVENTO" = ?, 
                "PATH_LOGO" = ?, 
                "DTULTALTERACAO" = ?, 
                "DSNOMEPFX" = ?, 
                "STCERTIFICADO" = ?, 
                "DTVALIDADECERTIFICADO" = ?, 
                "CNPJ_AUTXML" = ?, 
                "DSPATHNFCE" = ?, 
                "ST_SAP_ONLINE" = ? 
            WHERE "IDCONFIGURACAO" = ? 
        `;

        const statement = await conn.prepare(query);

        for (const registro of dados) {

            const params = [
                registro.IDEMPRESA,
                registro.UF,
                registro.TPFORMAEMISSAO,
                registro.TPMODELODOCFISCAL,
                registro.TPVERSAOMODFISCAL,
                registro.TPEMISSAO,
                registro.TPAMBIENTE,
                registro.PATHCERTIFICADO,
                registro.NUCERTIFICADO,
                registro.PWSENHA,
                registro.TXTDADOSPFX,
                registro.NULOTEPROD,
                registro.NUULTNFPROD,
                registro.NULOTHOM,
                registro.NUULTNFHOM,
                registro.DSCRT,
                registro.STATUALIZA_XML,
                registro.STEXIBIRERROSCHEMA,
                registro.ST_CRIARPASTAMENSALMENTE,
                registro.ST_SEPARARARQ_CNPJCERTIFICADO,
                registro.DSFORMATOALERTA,
                registro.IDTOKEN,
                registro.TOKENCSC,
                registro.STRETIRARACENTOSXML,
                registro.STSALVARARQUIVOENVIORESPOSTA,
                registro.PATHSALVARARQUIVOSENVIORESP,
                registro.PATHARQXDS_SCHEMA,
                registro.PATH_ARQNFE,
                registro.PATH_ARQCANCELADO,
                registro.PATH_ARQ_CARTACORRECAO,
                registro.PATH_ARQINUTILIZACAO,
                registro.PATH_ARQ_DPEC,
                registro.PATH_ARQ_EVENTO,
                registro.PATH_LOGO,
                registro.DTULTALTERACAO,
                registro.DSNOMEPFX,
                registro.STCERTIFICADO,
                registro.DTVALIDADECERTIFICADO,
                registro.CNPJ_AUTXML,
                registro.DSPATHNFCE,
                registro.ST_SAP_ONLINE,
                registro.IDCONFIGURACAO
            ]
            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Atualização de Certificado com sucesso'
        }
    } catch (error) {
        console.error('Erro ao executar a atualização do certificado:', error);
        throw error;
    }
}

export const createConfiguracao = async (dados) => {
    try {


        var query = `
            INSERT INTO "${databaseSchema}"."CONFIGURACAO" 
            ( 
                "IDCONFIGURACAO", 
                "IDEMPRESA", 
                "UF", 
                "TPFORMAEMISSAO", 
                "TPMODELODOCFISCAL", 
                "TPVERSAOMODFISCAL", 
                "TPEMISSAO", 
                "TPAMBIENTE", 
                "PATHCERTIFICADO", 
                "NUCERTIFICADO", 
                "PWSENHA", 
                "TXTDADOSPFX", 
                "NULOTEPROD", 
                "NUULTNFPROD", 
                "NULOTHOM", 
                "NUULTNFHOM", 
                "DSCRT", 
                "STATUALIZA_XML", 
                "STEXIBIRERROSCHEMA", 
                "ST_CRIARPASTAMENSALMENTE", 
                "ST_SEPARARARQ_CNPJCERTIFICADO", 
                "DSFORMATOALERTA", 
                "IDTOKEN", 
                "TOKENCSC", 
                "STRETIRARACENTOSXML", 
                "STSALVARARQUIVOENVIORESPOSTA", 
                "PATHSALVARARQUIVOSENVIORESP", 
                "PATHARQXDS_SCHEMA", 
                "PATH_ARQNFE", 
                "PATH_ARQCANCELADO", 
                "PATH_ARQ_CARTACORRECAO", 
                "PATH_ARQINUTILIZACAO", 
                "PATH_ARQ_DPEC", 
                "PATH_ARQ_EVENTO", 
                "PATH_LOGO", 
                "DTULTALTERACAO", 
                "DSNOMEPFX", 
                "STCERTIFICADO", 
                "DTVALIDADECERTIFICADO", 
                "CNPJ_AUTXML", 
                "DSPATHNFCE", 
                "ST_SAP_ONLINE" 
            ) 
            VALUES(
                QUALITY_CONC.SEQ_CONFIGURACAO.NEXTVAL,
                ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
            )
        `;

        const statement = await conn.prepare(query);

        for (const registro of dados) {

            const params = [
                registro.IDEMPRESA,
                registro.UF,
                registro.TPFORMAEMISSAO,
                registro.TPMODELODOCFISCAL,
                registro.TPVERSAOMODFISCAL,
                registro.TPEMISSAO,
                registro.TPAMBIENTE,
                registro.PATHCERTIFICADO,
                registro.NUCERTIFICADO,
                registro.PWSENHA,
                registro.TXTDADOSPFX,
                registro.NULOTEPROD,
                registro.NUULTNFPROD,
                registro.NULOTHOM,
                registro.NUULTNFHOM,
                registro.DSCRT,
                registro.STATUALIZA_XML,
                registro.STEXIBIRERROSCHEMA,
                registro.ST_CRIARPASTAMENSALMENTE,
                registro.ST_SEPARARARQ_CNPJCERTIFICADO,
                registro.DSFORMATOALERTA,
                registro.IDTOKEN,
                registro.TOKENCSC,
                registro.STRETIRARACENTOSXML,
                registro.STSALVARARQUIVOENVIORESPOSTA,
                registro.PATHSALVARARQUIVOSENVIORESP,
                registro.PATHARQXDS_SCHEMA,
                registro.PATH_ARQNFE,
                registro.PATH_ARQCANCELADO,
                registro.PATH_ARQ_CARTACORRECAO,
                registro.PATH_ARQINUTILIZACAO,
                registro.PATH_ARQ_DPEC,
                registro.PATH_ARQ_EVENTO,
                registro.PATH_LOGO,
                registro.DTULTALTERACAO,
                registro.DSNOMEPFX,
                registro.STCERTIFICADO,
                registro.DTVALIDADECERTIFICADO,
                registro.CNPJ_AUTXML,
                registro.DSPATHNFCE,
                registro.ST_SAP_ONLINE

            ]
            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Criação de Certificado com sucesso'
        }
    } catch (error) {
        console.error('Erro ao executar a Criação do certificado:', error);
        throw error;
    }
}