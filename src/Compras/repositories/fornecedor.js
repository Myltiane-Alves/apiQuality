// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getFornecedores = async (idFornecedor, descFornecedor, CNPJFornecedor,  page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT
                tbf.IDFORNECEDOR,
                tbf.IDFORNECEDORSAP,
                tbf.IDGRUPOEMPRESARIAL,
                tbf.IDSUBGRUPOEMPRESARIAL,
                tbf.MODPEDIDO,
                tbf.NORAZAOSOCIAL,
                tbf.NOFANTASIA,
                tbf.NUCNPJ,
                tbf.NUINSCESTADUAL,
                tbf.NUINSCMUNICIPAL,
                tbf.NUIBGE,
                tbf.EENDERECO,
                tbf.ENUMERO,
                tbf.ECOMPLEMENTO,
                tbf.EBAIRRO,
                tbf.ECIDADE,
                tbf.SGUF,
                tbf.NUCEP,
                tbf.EEMAIL,
                tbf.NUTELEFONE1,
                tbf.NUTELEFONE2,
                tbf.NUTELEFONE3,
                tbf.NOREPRESENTANTE,
                tbf.DTCADASTRO,
                tbf.DTULTATUALIZACAO,
                tbf.STATIVO,
                IFNULL(tbf.IDCONDPAGPADRAO,0) AS IDCONDPAGPADRAO,
                IFNULL(tbf.IDTRANSPORTADORAPADRAO,0) AS IDTRANSPORTADORAPADRAO,
                tbf.TPPEDIDOPADRAO,
                tbf.NOVENDEDORPADRAO,
                tbf.TPFRETEPADRAO,
                tbf.TPARQUIVOPADRAO,
                tbf.TPFISCALPADRAO,
                tbf.EMAILVENDEDORPADRAO,
                tbf.STMIGRADOSAP,
                TO_VARCHAR(tbf.DTCADASTRO,'YYYY-MM-DD HH24:MI:SS') AS DTCADASTROFORMAT,
                IFNULL(CDP.IDCONDICAOPAGAMENTO,0) AS IDCONDICAOPAGAMENTO,
                CDP.DSCONDICAOPAG,
                IFNULL(TP.IDTRANSPORTADORA,0) AS IDTRANSPORTADORA,
                TP.NOFANTASIA AS NOMETRANSPORTADORA,
                TBO."CardCode" AS IDSAP,
                TBO."validFor" as STATIVOSAP
            FROM
                "${databaseSchema}".FORNECEDOR tbf
                LEFT JOIN "${databaseSchema}".TRANSPORTADORA TP ON tbf.IDTRANSPORTADORAPADRAO = TP.IDTRANSPORTADORA
                LEFT JOIN "${databaseSchema}".CONDICAOPAGAMENTO CDP ON tbf.IDCONDPAGPADRAO = CDP.IDCONDICAOPAGAMENTO
                LEFT JOIN SBO_GTO_PRD.OCRD TBO ON TBF.IDFORNECEDORSAP = TBO."CardCode"
            WHERE
                1 = ?
                AND tbf.STATIVO = 'True'
        `;
        const params = [1];

        if (idFornecedor) {
            query += ' And  tbf.IDFORNECEDOR = ? ';
            params.push(idFornecedor);
        }
    
        if (descFornecedor) {
            query += ` And  CONTAINS((tbf.NORAZAOSOCIAL, tbf.NOFANTASIA), '%${descFornecedor}%') `;
            
        }
    
        if (CNPJFornecedor) {
            query = query + ' And  tbf.NUCNPJ = ?';
            params.push(CNPJFornecedor);
        }

        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);
        

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);


        return result;

    } catch (error) {
        console.error('Erro ao cunsulta fornecedores:', error);
        throw error;
    }
}