// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;


export const getCliente = async (idEmpresa, idCliente, idMarca, cpf, descCliente, tpCliente, status,  page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
        c.IDCLIENTE, c.IDEMPRESA, LTRIM(RTRIM(c.DSNOMERAZAOSOCIAL)) AS DSNOMERAZAOSOCIAL, c.DSAPELIDONOMEFANTASIA, c.TPCLIENTE,
        c.NUCPFCNPJ, c.NURGINSCESTADUAL, c.NUINSCMUNICIPAL, c.NUINSCRICAOSUFRAMA, c.TPINDICADORINSCESTADUAL,
        c.STOPTANTESIMPLES, c.NUCEP, c.NUIBGE, c.EENDERECO, c.NUENDERECO,
        c.ECOMPLEMENTO, c.EBAIRRO, c.ECIDADE, c.SGUF, LTRIM(RTRIM(c.EEMAIL)) AS EEMAIL,
        c.NUTELCOMERCIAL, c.NUTELCELULAR, c.DSOBSERVACAO, c.NOCONTATOCLIENTE01, c.EEMAILCONTATOCLIENTE01,
        c.FONECONTATOCLIENTE01, c.DSCARGOCONTATOCLIENTE01, c.NOCONTATOCLIENTE02, c.EEMAILCONTATOCLIENTE02, c.FONECONTATOCLIENTE02,
        c.DSCARGOCONTATOCLIENTE02, c.STATIVO,
        IFNULL(TO_VARCHAR(c.DTULTALTERACAO,'YYYY-MM-DD HH24:MI:SS'), '') AS DTULTALTERACAO,
        IFNULL(TO_VARCHAR(c.DTULTALTERACAO,'DD/MM/YYYY'), 'Não Informado') AS DTULTALTERACAOFORMATADA,
        IFNULL(TO_VARCHAR(c.DTNASCFUNDACAO,'YYYY-MM-DD HH24:MI:SS'), '') AS DTNASCFUNDACAO,
        IFNULL(TO_VARCHAR(c.DTNASCFUNDACAO,'DD/MM/YYYY'), 'Não Informado') AS DTNASCFUNDACAOFORMATADA,
        e.NOFANTASIA
      FROM "QUALITY_CONC_TST".CLIENTE c
      INNER JOIN "QUALITY_CONC_TST".EMPRESA e ON e.IDEMPRESA = c.IDEMPRESA
      WHERE 1 = ?
        `;

        const params = [1];

        if(idCliente) {
            query += ` AND c.IDCLIENTE = ?`;
            params.push(idCliente);
        }

        if(idEmpresa) {
            query += `AND c.IDEMPRESA = ?`;
            params.push(idEmpresa);
        }
        
        if(idMarca) {
            query += `And e.IDGRUPOEMPRESARIAL = ? `;
            params.push(idMarca);
        }
        

        if (cpf) {
            query += ` AND c.NUCPFCNPJ LIKE ?`;
            params.push(`%${cpf}%`);
        }


        if(descCliente) {
            query += ' AND (c.DSNOMERAZAOSOCIAL LIKE ? OR c.DSAPELIDONOMEFANTASIA LIKE ?)';
            params.push(`%${descCliente}%`, `%${descCliente}%`);
        }

        if(tpCliente) {
            query += ' AND c.TPCLIENTE = ?';
            params.push(tpCliente);
        }

        if(status) {
            query += ' AND c.STATIVO = ?';
            params.push(status);
        }

        query += ` ORDER BY c.DSNOMERAZAOSOCIAL LIMIT ? OFFSET ?`;
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
        console.error('Erro ao executar a consulta Clientes:', error);
        throw error;
    }
}
