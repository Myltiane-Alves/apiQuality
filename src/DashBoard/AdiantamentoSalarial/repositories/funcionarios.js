// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getAdiantamentosFuncionarios = async (idEmpresa, dataPesquisaInicio, dataPesquisaFim, pageSize, page) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        
        if(!idEmpresa) {
            throw new Error('idEmpresa é um parâmetro obrigatório');
        }

        var query = ` 
            SELECT 
                tbas.IDADIANTAMENTOSALARIO, 
                tbas.IDFUNCIONARIO, 
                TO_VARCHAR(tbas.DTLANCAMENTO,'DD-MM-YYYY') AS DTLANCAMENTO, 
                tbas.TXTMOTIVO, 
                tbas.VRVALORDESCONTO, 
                tbas.STATIVO, 
                tbf.NOFUNCIONARIO 
            FROM 
                "${databaseSchema}".ADIANTAMENTOSALARIAL tbas 
            INNER JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbas.IDFUNCIONARIO = tbf.IDFUNCIONARIO 
            WHERE 
                1 = ?
        `;


        const params = [1];

        

        if (idEmpresa > 0) {
            query += ' AND tbas.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND (tbas.DTLANCAMENTO BETWEEN ? AND ?)';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        
        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        const statement = conn.prepare(query);
        const result = statement.exec(params);

     
        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result,
        };
    } catch (error) {
        console.error('Error executing query', error);
        throw error;
    }
};