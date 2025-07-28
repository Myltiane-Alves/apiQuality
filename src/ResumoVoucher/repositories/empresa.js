import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getEmpresasVoucher = async (idEmpresa, idSubGrupoEmpresa, page, pageSize) => {
    try {
        let idsOutlets = ['31', '51', '67', '70', '76', '89', '104', '109', '113', '116'];
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        var query = `
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
                tbe.ALIQCOFINS
            FROM 
                "${databaseSchema}".EMPRESA tbe
            WHERE 
            1 = ?
        `;

        const params = [1];


        if (idsOutlets.includes(idEmpresa)) {
            const idsOutletsStr = idsOutlets.join(',');
            query += ` AND tbe.IDEMPRESA IN (${idsOutletsStr})`;
        } else {
            if (idEmpresa) {
                query += ` AND tbe.IDEMPRESA = ?`;
                params.push(idEmpresa);
            }

            if (idSubGrupoEmpresa) {
                const idsOutletsStr = idsOutlets.join(',');
                query += ` AND tbe.IDSUBGRUPOEMPRESARIAL = ? AND tbe.IDEMPRESA NOT IN (${idsOutletsStr})`;
                params.push(idSubGrupoEmpresa);
            }
        }


        query += 'ORDER BY IDEMPRESA';


        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page,
            pageSize,
            rows: result.length,
            data: result,
        };
    } catch (error) {
        console.error('Erro ao executar a consulta Empresas Vouchers:', error);
        throw error;
    }
};
