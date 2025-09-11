// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;


export const getCadastroClienteCredSystem = async (idEmpresa, dataPesquisaInicio, dataPesquisaFim,  page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT
                TBC.NUCPFCNPJ AS CPF_CLIENTE,
                TBC.DSNOMERAZAOSOCIAL AS NOME_CLIENTE,
                NULL AS NOME_MAE,
                NULL AS SEXO_CLIENTE,
                TBC.NUCEP AS CEP_RESIDNCL,
                TBC.SGUF AS RESIDNCL,
                TBC.ECIDADE AS CIDADE_RESIDNCL,
                TBC.EBAIRRO AS BAIRRO_RESIDNCL,
                NULL AS TP_END_RESIDNCL,
                TBC.EENDERECO AS END_RESIDNCL,
                TBC.ECOMPLEMENTO AS COMPL_RESIDNCL,
                NULL AS DDD_RESIDNCL,
                TBC.NUTELCOMERCIAL AS NUM_TEL_RESIDNCL,
                TBC.NUTELCELULAR AS NUM_CELULAR,
                NULL AS DDD_CELULAR,
                NULL AS DDD_CMRCL,
                IFNULL(TBC.FONECONTATOCLIENTE01, TBC.NUTELCELULAR) AS NUM_CMRCL,
                TBC.EEMAIL AS EMAIL_CLI_PRTCLR,
                IFNULL(TBC.EEMAILCONTATOCLIENTE01, TBC.EEMAIL) AS EMAIL_CLI_CMRCL,
                TBE.NOFANTASIA AS NOME_EMP_FIELDD,
                NULL AS NOME_PARC_CRED,
                TBC.DTNASCFUNDACAO AS DT_NASCIMENTO,
                NULL AS NUM_RESIDNCL,
                TBC.DTULTALTERACAO AS DT_CADASTRO,
                TBC.DTULTALTERACAO AS DT_ALTERACAO,
                NULL AS COD_LOJA_PRC_CRD,
                TBC.DTULTALTERACAO AS DT_INCLUSAO_DW
            FROM
                "${databaseSchema}".CLIENTE TBC 
            INNER JOIN "${databaseSchema}".EMPRESA TBE ON 
                TBC.IDEMPRESA = TBE.IDEMPRESA 
            WHERE
                1 = ? AND LENGTH(TBC.NUCPFCNPJ) <= 11
            `;

        const params = [1];

        if(idEmpresa) {
            query += `AND TBC.IDEMPRESA = ?`;
            params.push(idEmpresa);
        }
        
        if(dataPesquisaInicio && dataPesquisaFim) {
            query += ` AND TBC.DTULTALTERACAO BETWEEN ? AND ?`;
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        query += ` ORDER BY TBC.DTULTALTERACAO DESC LIMIT ? OFFSET ?`;
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
        console.error('Erro ao executar a consulta Cadastro de Clientes CredSystem:', error);
        throw error;
    }
}
