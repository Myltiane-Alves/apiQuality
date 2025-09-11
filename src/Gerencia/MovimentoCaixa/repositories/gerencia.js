

// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getMovimentoCaixaGerencia = async (idEmpresa, idMovimentoCaixa, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                tbmc.ID, 
                tbmc.IDCAIXA AS IDCAIXAFECHAMENTO, 
                tbc.DSCAIXA AS DSCAIXAFECHAMENTO, 
                TO_VARCHAR(tbmc.DTFECHAMENTO,'DD-MM-YYYY HH:MM:SS') AS DTHORAFECHAMENTOCAIXA, 
                TO_VARCHAR(tbmc.DTFECHAMENTO,'YYYY-MM-DD') AS DTFECHAMENTO,
                TO_VARCHAR(tbmc.DTABERTURA,'DD-MM-YYYY HH:MM:SS') AS DTABERTURA, 
                TO_VARCHAR(tbmc.DTABERTURA,'YYYY-MM-DD ') AS DTABERTURAMOVCAIXA, 
                tbf.NOLOGIN, 
                tbf.IDFUNCIONARIO AS IDOPERADORFECHAMENTO, 
                tbf.NOFUNCIONARIO AS OPERADORFECHAMENTO, 
                tbmc.VRFISICODINHEIRO AS TOTALFECHAMENTODINHEIROFISICO, 
                tbmc.VRRECDINHEIRO AS TOTALFECHAMENTODINHEIRO, 
                IFNULL(tbmc.VRRECFATURA,0) AS TOTALFECHAMENTOFATURA, 
                IFNULL(tbmc.VRAJUSTDINHEIRO,0) AS TOTALAJUSTEDINHEIRO, 
                IFNULL(tbmc.VRAJUSTFATURA,0) AS TOTALAJUSTEFATURA, 
                IFNULL(tbmc.VRAJUSTTEF,0) AS TOTALAJUSTTEF, 
                IFNULL(tbmc.VRAJUSTPOS,0) AS TOTALAJUSTPOS, 
                IFNULL(tbmc.VRAJUSTCONVENIO,0) AS TOTALAJUSTCONVENIO, 
                IFNULL(tbmc.VRAJUSTVOUCHER,0) AS TOTALAJUSTVOUCHER, 
                IFNULL(tbmc.VRAJUSTPIX,0) AS TOTALAJUSTPIX, 
                IFNULL(tbmc.VRAJUSTPL,0) AS TOTALAJUSTPL, 
                tbmc.VRRECTEF AS TOTALFECHAMENTOTEF, 
                tbmc.VRRECPOS AS TOTALFECHAMENTOPOS, 
                tbmc.VRRECCONVENIO AS TOTALFECHAMENTOCONVENIO, 
                tbmc.VRRECVOUCHER AS TOTALFECHAMENTOVOUCHER, 
                tbmc.VRRECPIX AS TOTALFECHAMENTOPIX, 
                tbmc.VRRECPL AS TOTALFECHAMENTOCPL, 
                tbmc.VRQUEBRACAIXA AS TOTALFECHAMENTOVRQUEBRACAIXA, 
                tbmc.STCONFERIDO AS STCONFERIDOMOVIMENTO, 
                tbmc.STFECHADO AS STFECHADOMOVIMENTO, 
                tbmc.TXT_OBS, 
                (SELECT IFNULL (SUM(tbqc.VRQUEBRAEFETIVADO),0) FROM "${databaseSchema}".QUEBRACAIXA tbqc WHERE tbqc.IDMOVIMENTOCAIXA = tbmc.ID AND tbqc.STATIVO='True' ) AS VRQUEBRAEFETIVADO
            FROM 
            "${databaseSchema}".MOVIMENTOCAIXA tbmc 
                LEFT JOIN "${databaseSchema}".CAIXA tbc ON tbmc.IDCAIXA = tbc.IDCAIXAWEB 
                LEFT JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbmc.IDOPERADOR = tbf.IDFUNCIONARIO 
            WHERE 
            1 = ?
            AND tbmc.STCANCELADO = 'False'
      `;

        const params = [1];

        if(idMovimentoCaixa) {
            query += ` AND tbmc.ID = ?`;
            params.push(idMovimentoCaixa);
        }

        if (idEmpresa) {
            query += ` AND tbmc.IDEMPRESA  = ?`;
            params.push(idEmpresa);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += 'AND tbmc.DTABERTURA BETWEEN ? AND ?';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result,
        };
    } catch (error) {
        console.error('Erro ao executar a consulta de Alteração de Preço:', error);
        throw error;
    }
};