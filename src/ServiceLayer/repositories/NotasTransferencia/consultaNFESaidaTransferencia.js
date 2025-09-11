import { get } from "http";
// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;


export const getAtualizaCamposNota = async (idSapOrigem, dados) => {
    try {
        
        const query = `
            UPDATE "QUALITY_CONC_HML"."RESUMOORDEMTRANSFERENCIA"
                SET IDSTATUSSEFAZ = ?,
                CODIGORETORNOSEFAZ = ?,
                CHAVESEFAZ = ?,
                PROTOCOLOSEFAZ = ?,
                MSGSEFAZ = ?,
                DATAEMISSAOSEFAZ = ?,
                NUMERONOTASEFAZ = ?,
                IDSTATUSOT = ?
            WHERE IDSAPORIGEM = ?    
        `;

        const statement = await conn.prepare(query);

        for(const dado of dados) {
            const params = [
                dado.IDSTATUSSEFAZ,
                dado.CODIGOERRO,
                dado.CHAVE,
                dado.PROTOCOLO,
                dado.MSGSEFAZ,
                dado.DATAEMISSAO,
                dado.NUMERONOTA,
                dado.IDSTATUS,
                idSapOrigem
            ]

            await statement.exec(params);
        }

        conn.commit();
        return 'True';
    } catch (error) {
        console.error('Erro ao executar a consulta Empresas Vouchers:', error);
        throw error;
    }
};

export const getNFESaidaTransferencia = async (idSapOrigem, page, pageSize) => {
    try {
        
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT TOP 1
                a."U_inStatus" AS "IDSTATUS",
                a."U_cdErro" AS "CODIGOERRO",
                a."U_ChaveAcesso" AS "CHAVE",
                COALESCE(a."U_ProtAut", '0') AS "PROTOCOLO",
                a."U_msgSEFAZ" AS "MSGSEFAZ",
                TO_VARCHAR(a."U_CreateDate", 'YYYY-MM-DD HH24:MI:SS') AS "DATAEMISSAO",
                SUBSTRING(a."U_ChaveAcesso", 26, 9) AS "NUMERONOTA"
            FROM "SBO_GTO_TESTE1"."@SKL25NFE" a
                INNER JOIN "SBO_GTO_TESTE1"."OINV" b ON b."DocEntry" = a."U_DocEntry"
                WHERE 1 = ? AND a."U_tipoDocumento" = 'NS'
            AND b."DocNum" = ${idSapOrigem}
        `;

        const params = [1];      

        query += 'ORDER BY a."Code" DESC';


        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const rows = await statement.exec(params);

        if(!Array.isArray(rows) || rows.length === 0) return [];
        
        const data = await Promise.all(rows.map(async (registro) => ({
            IDSTATUSSEFAZ: registro.IDSTATUS,
            CODIGOERRO: registro.CODIGOERRO,
            CHAVE: registro.CHAVE,
            PROTOCOLO: registro.PROTOCOLO,
            MSGSEFAZ: registro.MSGSEFAZ,
            DATAEMISSAO: registro.DATAEMISSAO,
            NUMERONOTA: registro.NUMERONOTA,
            IDSTATUS: 8,
        })))
        
        
          await getAtualizaCamposNota(idSapOrigem, data)
        return {
            page,
            pageSize,
            rows: data.length,
            data: data,
        };
    } catch (error) {
        console.error('Erro ao executar a consulta NFE Saida Transferencia:', error);
        throw error;
    }
};