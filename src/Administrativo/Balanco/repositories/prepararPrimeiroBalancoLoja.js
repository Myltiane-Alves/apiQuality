// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getPrepararPrimeiroBalancoLoja = async (idEmpresa, page, pageSize) => {
    try {

        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;


        let query = ` SELECT 
            tbe.IDEMPRESA,
            tbe.STGRUPOEMPRESARIAL,
            tbe.IDGRUPOEMPRESARIAL,
            tbe.IDSUBGRUPOEMPRESARIAL,
            tbe.NORAZAOSOCIAL,
            tbe.NOFANTASIA,
            tbe.NUCNPJ,
            tbe.NUINSCESTADUAL,
            tbe.NUINSCMUNICIPAL,
            tbe.CNAE,
            tbe.EENDERECO,
            tbe.ECOMPLEMENTO,
            tbe.EBAIRRO,
            tbe.ECIDADE,
            tbe.SGUF,
            tbe.NUUF,
            tbe.NUCEP,
            tbe.NUIBGE,
            tbe.EEMAILPRINCIPAL,
            tbe.EEMAILCOMERCIAL,
            tbe.EEMAILFINANCEIRO,
            tbe.EEMAILCONTABILIDADE,
            tbe.NUTELPUBLICO,
            tbe.NUTELCOMERCIAL,
            tbe.NUTELFINANCEIRO,
            tbe.NUTELGERENCIA,
            tbe.EURL,
            tbe.PATHIMG,
            tbe.NUCNAE,
            tbe.STECOMMERCE,
            TO_VARCHAR(tbe.DTULTATUALIZACAO,'YYYY-MM-DD HH24:MI:SS') AS DTULTATUALIZACAO,
            tbe.STATIVO,
            tbe.ALIQPIS,
            tbe.ALIQCOFINS,
            tbc.IDCONFIGURACAO,
            tbc.DSNOMEPFX,
            TO_VARCHAR(tbc.DTVALIDADECERTIFICADO,'YYYY-MM-DD') AS DTVALIDADECERTIFICADO
        FROM 
            "${databaseSchema}".EMPRESA tbe
            LEFT JOIN "${databaseSchema}".CONFIGURACAO tbc on tbe.IDEMPRESA = tbc.IDEMPRESA
        WHERE 
             1 = 1 
    AND tbe.STATIVO='True' and tbe.IDEMPRESA NOT IN (SELECT "IDEMPRESA" FROM "QUALITY_CONC"."RESUMOBALANCO" where dtabertura >= '2022-04-01 00:00:00')`;

        const params = [];

        
        if (idEmpresa) {
            query += ' AND tbe.IDEMPRESA = ? ';
            params.push(idEmpresa);
        }

  
        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ? ';
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
        console.error('Erro ao executar a consulta preparar balanço:', error);
        throw error;
    }
};

export const updatePrepararPrimeiroBalancoLoja = async (balancos) => {
    try {
        
        let query = `UPDATE "${databaseSchema}"."INVENTARIOMOVIMENTO" SET 
            "QTDINICIO" = 0, 
            "QTDENTRADA" = 0, 
            "QTDENTRADAVOUCHER" = 0, 
            "QTDSAIDA" = 0, 
            "QTDSAIDATRANSFERENCIA" = 0, 
            "QTDRETORNOAJUSTEPEDIDO" = 0, 
            "QTDFINAL" = 0, 
            "QTDAJUSTEBALANCO" = 0, 
            "STATIVO" = 'False', 
            "STPROCESSADO" = 'False' 
            
            WHERE "IDEMPRESA" =  ? 
        `;
        const statement = await conn.prepare(query);

        for(const balanco of balancos) {
            const params = [
                balanco.IDEMPRESA
            ]
            await statement.exec(params);
        }
        
        conn.commit();
        return {
            status: 'success',
            message: 'preparação balanço alterada com sucesso'
        }
    } catch (error) {
        console.error('Erro ao executar a preparação balanço:', error);
        throw error;
    }
}