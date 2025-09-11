// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getVendasContigencia = async (idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                TBC.IDCAIXAWEB, 
                tbe.NOFANTASIA,
                TBC.DSCAIXA, 
                TBF.NOFUNCIONARIO, 
                TBV.IDVENDA, 
                TBV.NFE_INFNFE_IDE_SERIE, 
                TBV.NFE_INFNFE_IDE_NNF, 
                TO_VARCHAR(TBV.DTHORAFECHAMENTO,'DD-MM-YYYY HH24:MI:SS') AS DTHORAFECHAMENTO, 
                TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS VRTOTALPAGO,
                TBV.STCONTINGENCIA,
                TBV.PROTNFE_INFPROT_XMOTIVO
            FROM 
                "${databaseSchema}".VENDA TBV 
                INNER JOIN "${databaseSchema}".CAIXA TBC ON TBV.IDCAIXAWEB = TBC.IDCAIXAWEB 
                INNER JOIN "${databaseSchema}".FUNCIONARIO TBF ON TBV.IDOPERADOR = TBF.IDFUNCIONARIO 
                INNER JOIN "${databaseSchema}".EMPRESA tbe ON TBV.IDEMPRESA = tbe.IDEMPRESA 
            WHERE 
                1 = ?
                AND TBV.STCANCELADO = 'False'
                AND TBV.STCONTINGENCIA = 'True'
          `;

        const params = [1];

        
        if(idEmpresa) {
            query += ' AND TBV.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND (TBV.DTHORAFECHAMENTO BETWEEN ? AND ?)';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        const statement = conn.prepare(query);
        const result = await statement.execute(params);
     
        return {
            page,
            pageSize,
            rows: result.length,
            data: result
        };
    } catch (e) {
        console.error('Erro ao executar a consulta de vendas contigencia:', e);
        throw new Error('Erro ao executar a consulta de vendas contigencia');
    }
};
