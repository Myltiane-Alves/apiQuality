// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getQuebraCaixaID = async (idQuebraCaixa, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT TOP 1 
                tbqc.IDQUEBRACAIXA, 
                tbqc.IDCAIXAWEB, 
                tbc.DSCAIXA, 
                tbqc.IDMOVIMENTOCAIXA, 
                tbqc.IDGERENTE, 
                tbqc.IDFUNCIONARIO, 
                TO_VARCHAR(tbqc.DTLANCAMENTO,'DD-MM-YYYY') AS DTLANCAMENTO, 
                tbqc.VRQUEBRASISTEMA, 
                tbqc.VRQUEBRAEFETIVADO, 
                tbqc.TXTHISTORICO, 
                tbqc.STATIVO, 
                tbe.NORAZAOSOCIAL,
                tbe.NOFANTASIA,
                tbe.NUCNPJ,
                tbe.EENDERECO,
                tbe.EBAIRRO,
                tbe.ECIDADE,
                tbe.SGUF,
                tbf.NOFUNCIONARIO AS NOMEOPERADOR,
                tbf.DSFUNCAO,
                tbf.NUCPF AS CPFOPERADOR,
                tbf1.NOFUNCIONARIO AS NOMEGERENTE
            FROM 
                "${databaseSchema}".QUEBRACAIXA tbqc
                LEFT JOIN "${databaseSchema}".MOVIMENTOCAIXA tbmc ON tbqc.IDMOVIMENTOCAIXA = tbmc.ID
                LEFT JOIN "${databaseSchema}".EMPRESA tbe ON tbmc.IDEMPRESA = tbe.IDEMPRESA
                LEFT JOIN "${databaseSchema}".CAIXA tbc ON tbqc.IDCAIXAWEB = tbc.IDCAIXAWEB
                LEFT JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbqc.IDFUNCIONARIO = tbf.IDFUNCIONARIO
                LEFT JOIN "${databaseSchema}".FUNCIONARIO tbf1 ON tbqc.IDGERENTE = tbf1.IDFUNCIONARIO
            WHERE 
                1 = ? 
            `;

        const params = [1];

        if (idQuebraCaixa) {
            query += ' AND tbqc.IDQUEBRACAIXA';
            params.push(idQuebraCaixa);
        }

        

        const statement = await conn.prepare(query);
        const result = await statement.exec(params); 

        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result
        };
    } catch (error) {
        console.error('Error executing query', error);
        throw error;
    }
};