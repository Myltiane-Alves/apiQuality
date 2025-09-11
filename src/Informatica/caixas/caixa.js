// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;


export const getCaixa = async (idEmpresa, idCaixaWeb, dataUltimaAtualizacao,   page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT DISTINCT
                tbc.IDCAIXAWEB,
                tbc.IDEMPRESA,
                tbc.DSCAIXA,
                tbc.NUULTNFCE,
                tbc.NUSERIE,
                tbc.TBEMISSAOFISCAL,
                tbc.NOIMPRESSORA,
                tbc.NULINHAIMPRESSORA,
                tbc.DSPORTACOMUNICACAO,
                tbc.NUBAUD,
                tbc.NULINHAENTRECUPOM,
                tbc.STIMPRIMIRUMITEMPORLINHA,
                tbc.STDANFCERESUMIDO,
                tbc.STIGNORARTAGFORMATACAO,
                tbc.STIMPRIMIRDESCACRESITEM,
                tbc.STVIACONSUMIDOR,
                tbc.STTEF,
                tbc.STBALANCA,
                tbc.STGAVETEIRO,
                tbc.STSANGRIA,
                tbc.VRMAXSANGRIA,
                tbc.STCONTROLAHORARIO,
                tbc.HRINICIOLOGIN,
                tbc.HRFIMLOGIN,
                tbc.STSTATUS,
                TO_VARCHAR(tbc.DTULTALTERACAO,'DD-MM-YYYY HH24:MI:SS') AS DTULTALTERACAO,
                tbc.NUSERIEPROD,
                tbc.NUNFCEPROD,
                tbc.NUSERIEHOM,
                tbc.NUNFCEHOM,
                tbc.STATIVO,
                tbc.STTEF,
                tbc.STATUALIZA,
                tbc.STLIMPA,
                tbc.TIPOTEF,
                (SELECT FIRST_VALUE(tbcv.VERSAO ORDER BY dtversao DESC) FROM ${databaseSchema}.CAIXA_VERSAO tbcv WHERE tbc.IDCAIXAWEB = tbcv.IDCAIXAWEB) AS VERSAO,
                tbe.IDEMPRESA,
                tbe.NOFANTASIA,
                tbe.NUCNPJ
            FROM
            "${databaseSchema}".CAIXA tbc
                INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbc.IDEMPRESA = tbe.IDEMPRESA
            WHERE
            1 = ?
        `;

        const params = [1];

        if(idCaixaWeb) {
            query += `AND tbc.IDCAIXAWEB = ?`;
            params.push(idCaixaWeb);
        }

        if(idEmpresa) {
            query += `AND tbc.IDEMPRESA = ?`;
            params.push(idEmpresa);
        }
        
        if(dataUltimaAtualizacao) {
            query += ` AND TBV.DTHORAFECHAMENTO >= ?`;
            params.push(dataUltimaAtualizacao);
        }

        query += ` ORDER BY tbc.IDCAIXAWEB`;

        query += ` LIMIT ? OFFSET ?`;
        params.push(pageSize, (page - 1) * pageSize);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page,
            pageSize,
            rows: result.length,
            data: result,
        }
    } catch(error) {
        console.error('Erro ao executar a consulta Lista Caixas', error);
        throw error;
    }
}

export const updateCaixa = async (dados) => {
    try {
        
        
        let query = `
            UPDATE "${databaseSchema}"."CAIXA" SET
                "DSCAIXA" = ?,
                "TBEMISSAOFISCAL" = ?,
                "NOIMPRESSORA" = ?,
                "DSPORTACOMUNICACAO" = ?,
                "DTULTALTERACAO" = ?,
                "NUSERIEPROD" = ?,
                "NUNFCEPROD" = ?,
                "STTEF" = ?,
                "STATUALIZA" = ?,
                "STLIMPA" = ?
            WHERE "IDCAIXAWEB" = ?
        `;

        const statement = await conn.prepare(query);

        for(const registro of dados) {
          
            const params = [
                registro.DSCAIXAWEB,
                registro.TBEMISSAOFISCAL,
                registro.NOIMPRESSORA,
                registro.DSPORTACOMUNICACAO,
                registro.DTULTALTERACAO,
                registro.NUSERIEPROD,
                registro.NUNFCEPROD,
                registro.STTEF,
                registro.STATUALIZA,
                registro.STLIMPA,
                registro.IDCAIXAWEB
                
            ]
            await statement.exec(params);
        }
        
        conn.commit();
        return {
            status: 'success',
            message: 'Caixa atualizadas com sucesso'
        }
    } catch (error) {
        console.error('Erro ao executar a atualização do Caixa:', error);
        throw error;
    }
}

export const createCaixa = async (dados) => {
    try {
        
        
        let query = `
            INSERT INTO "${databaseSchema}"."CAIXA" (
                "IDCAIXAWEB",
                "IDEMPRESA",
                "DSCAIXA",
                "NUULTNFCE",
                "NUSERIE",
                "TBEMISSAOFISCAL",
                "NOIMPRESSORA",
                "NULINHAIMPRESSORA",
                "DSPORTACOMUNICACAO",
                "NUBAUD",
                "NULINHAENTRECUPOM",
                "STIMPRIMIRUMITEMPORLINHA",
                "STDANFCERESUMIDO",
                "STIGNORARTAGFORMATACAO",
                "STIMPRIMIRDESCACRESITEM",
                "STVIACONSUMIDOR",
                "STTEF",
                "STBALANCA",
                "STGAVETEIRO",
                "STSANGRIA",
                "VRMAXSANGRIA",
                "STCONTROLAHORARIO",
                "HRINICIOLOGIN",
                "HRFIMLOGIN",
                "STSTATUS",
                "DTULTALTERACAO",
                "NUSERIEPROD",
                "NUNFCEPROD",
                "NUSERIEHOM",
                "NUNFCEHOM",
                "STATIVO",
                "VSSISTEMA",
                "STATUALIZA",
                "STLIMPA"
            ) VALUES (
                ${databaseSchema}.SEQ_CAIXA.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
            )
        `;

        const statement = await conn.prepare(query);

        for(const registro of dados) {
          
            const params = [
                registro.IDEMPRESA,
                registro.DSCAIXA,
                registro.NUULTNFCE,
                registro.NUSERIE,
                registro.TBEMISSAOFISCAL,
                registro.NOIMPRESSORA,
                registro.NULINHAIMPRESSORA,
                registro.DSPORTACOMUNICACAO,
                registro.NUBAUD,
                registro.NULINHAENTRECUPOM,
                registro.STIMPRIMIRUMITEMPORLINHA,
                registro.STDANFCERESUMIDO,
                registro.STIGNORARTAGFORMATACAO,
                registro.STIMPRIMIRDESCACRESITEM,
                registro.STVIACONSUMIDOR,
                registro.STTEF,
                registro.STBALANCA,
                registro.STGAVETEIRO,
                registro.STSANGRIA,
                registro.VRMAXSANGRIA,
                registro.STCONTROLAHORARIO,
                registro.HRINICIOLOGIN,
                registro.HRFIMLOGIN,
                registro.STSTATUS,
                registro.DTULTALTERACAO,
                registro.NUSERIEPROD,
                registro.NUNFCEPROD,
                registro.NUSERIEHOM,
                registro.NUNFCEHOM,
                registro.STATIVO,
                registro.VSSISTEMA,
                registro.STATUALIZA,
                registro.STLIMPA
                
            ]
            await statement.exec(params);
        }
        
        conn.commit();
        return {
            status: 'success',
            message: 'Caixa criado com sucesso'
        }
    } catch (error) {
        console.error('Erro ao executar o cadastro do Caixa:', error);
        throw error;
    }
}