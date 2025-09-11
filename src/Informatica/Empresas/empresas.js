// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getEmpresas = async (idMarca, idEmpresa, ufProd, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        let query = `
            SELECT 
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
                tbe.STATIVO='True'
        `;

        const params = [];

        if (idEmpresa) {
            query += ' AND tbe.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (idMarca > 0) {
            query += ' AND tbe.IDGRUPOEMPRESARIAL = ?';
            params.push(idMarca);
        }

        if (ufProd && ufProd !== '0' && ufProd !== 'undefined') {
            query += ' AND tbe.SGUF = ?';
            params.push(ufProd);
        }

        query += ' ORDER BY tbe.IDEMPRESA';

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
        console.error('Error executing query', error);
        throw error;
    }
};
