// import conn from "../../../config/dbConnection.js";
const databaseSchema = process.env.HANA_DATABASE;

export const getFuncionarioRecebimento = async (idEmpresa, page, pageSize) => {
    try {
        
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        
        if (!idEmpresa) {
            throw new Error("O Campo ID da Empresa é um parametro obrigatório!");
        }

    
        let query = `
            SELECT 
                tbf.IDFUNCIONARIO,
                tbf.IDEMPRESA,
                tbf.NOFUNCIONARIO,
                tbf.NOLOGIN,
                tbf.NUCPF,
                tbf.STATIVO,
                tbe.NOFANTASIA
            FROM 
                "${databaseSchema}".FUNCIONARIO tbf 
                INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbf.IDEMPRESA = tbe.IDEMPRESA
            WHERE 
                1 = ?
                AND tbf.STATIVO = 'True'
        `;

        
        const params = [1];

        if (idEmpresa) {
            query += ' AND tbf.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

      
        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

       
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        
        let countQuery = `
            SELECT COUNT(*) AS TOTAL
            FROM 
                "${databaseSchema}".FUNCIONARIO tbf 
                INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbf.IDEMPRESA = tbe.IDEMPRESA
            WHERE 
                1 = ?
                AND tbf.STATIVO = 'True'
        `;
        const countParams = [1];

        if (idEmpresa) {
            countQuery += ' AND tbf.IDEMPRESA = ?';
            countParams.push(idEmpresa);
        }

        const countStatement = await conn.prepare(countQuery);
        const countResult = await countStatement.exec(countParams);
        const totalRows = countResult[0].TOTAL;

        
        return {
            page: page,     
            pageSize: pageSize, 
            rows: totalRows, 
            data: result,   
        };
    } catch (error) {
        console.error('Erro ao executar a consulta de funcionários:', error);
        throw error;
    }
};
