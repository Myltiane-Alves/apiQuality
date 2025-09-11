// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getVendasLoja = async (idEmpresa, status, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        var query = `
            SELECT 
                TBC.IDCAIXAWEB, 
                TBC.DSCAIXA, 
                TBC.VSSISTEMA,
                TBF.NOFUNCIONARIO, 
                TBV.IDVENDA, 
                TBV.NFE_INFNFE_IDE_SERIE, 
                TBV.NFE_INFNFE_IDE_NNF, 
                TO_VARCHAR(TBV.DTHORAFECHAMENTO,'DD-MM-YYYY HH24:MI:SS') AS DTHORAFECHAMENTO, 
                TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS VRTOTALPAGO,
                TBV.TXTMOTIVOCANCELAMENTO, 
                TBV.STCONTINGENCIA,
                TBV.IDMOVIMENTOCAIXAWEB,
                TMC.STCONFERIDO
            FROM 
                "${databaseSchema}".VENDA TBV 
                INNER JOIN "${databaseSchema}".CAIXA TBC ON TBV.IDCAIXAWEB = TBC.IDCAIXAWEB 
                INNER JOIN "${databaseSchema}".FUNCIONARIO TBF ON TBV.IDOPERADOR = TBF.IDFUNCIONARIO 
                LEFT JOIN "${databaseSchema}".MOVIMENTOCAIXA TMC ON TBV.IDMOVIMENTOCAIXAWEB = TMC.ID 
            WHERE 
                1 = ?
        `;

        const params = [1];
        
        if(status) {
            query += ' AND TBV.STCANCELADO = ?';
            params.push(status);
        }

        if(idEmpresa) {
            query += ' AND TBV.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND (TBV.DTHORAFECHAMENTO BETWEEN ? AND ?)';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, (page - 1) * pageSize);

        const statement = await conn.prepare(query);
        const result = await statement.execute(params);
      
        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result
        };
    } catch (e) {
        console.error('Erro ao executar a consulta de vendas:', e);
        throw new Error('Erro ao executar a consulta de vendas');
    }
};