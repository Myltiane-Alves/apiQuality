
// import conn from '../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getDespesasEmpresa = async (idEmpresa, dataPesquisaInicio, dataPesquisaFim,  pageSize, page) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                tbdl.IDDESPESASLOJA,  
                TO_VARCHAR(tbdl.DTDESPESA,'DD-MM-YYYY') AS DTDESPESA,  
                tbdl.DSHISTORIO,  
                tbdl.DSPAGOA,  
                tbdl.VRDESPESA,  
                tbdl.NUNOTAFISCAL,  
                tbdl.STATIVO,  
                tbdl.STCANCELADO,  
                tbcrd.IDCATEGORIARECDESP,  
                tbcrd.DSCATEGORIA,  
                tbf.NOFUNCIONARIO,   
                tbfv.NOFUNCIONARIO AS NOFUNCVALE   
            FROM 
                "${databaseSchema}".DESPESALOJA tbdl 
                LEFT JOIN "${databaseSchema}".CATEGORIARECEITADESPESA tbcrd ON tbdl.IDCATEGORIARECEITADESPESA = tbcrd.IDCATEGORIARECDESP 
                LEFT JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbdl.IDUSR = tbf.IDFUNCIONARIO  
                LEFT JOIN "${databaseSchema}".FUNCIONARIO tbfv ON tbdl.IDFUNCIONARIO = tbfv.IDFUNCIONARIO  
            WHERE 
            1 = ?
          `;

        const params = [1];

        if (idEmpresa) {
            query += 'AND tbdl.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if(dataPesquisaInicio && dataPesquisaFim){
            query += ' AND tbdl.DTDESPESA  BETWEEN ? AND ?';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);


        return {
            page,
            pageSize,
            rows: result.length,
            data: result
        };
    } catch (error) {
        console.error('Erro ao executar consulta deposito loja empresa', error);
        throw error;
    }
};