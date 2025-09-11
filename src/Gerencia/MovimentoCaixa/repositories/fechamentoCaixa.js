// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getFechamentoCaixa = async (idEmpresa, idMovimentoCaixa, idCaixa, dataPesquisa,  page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                tbmc.ID, 
                tbmc.IDCAIXA AS IDCAIXAFECHAMENTO, 
                tbc.DSCAIXA AS DSCAIXAFECHAMENTO, 
                TO_VARCHAR(tbmc.DTFECHAMENTO,'DD-MM-YYYY HH:MM:SS') AS DTHORAFECHAMENTOCAIXA, 
                TO_VARCHAR(tbmc.DTABERTURA,'DD-MM-YYYY HH:MM:SS') AS DTABERTURA, 
                TO_VARCHAR(tbmc.DTABERTURA,'YYYY-MM-DD ') AS DTABERTURAMOVCAIXA, 
                tbf.NOLOGIN, 
                tbf.IDFUNCIONARIO AS IDOPERADORFECHAMENTO, 
                tbf.NUCPF AS NUCPF, 
                tbf.NOFUNCIONARIO AS OPERADORFECHAMENTO, 
                tbmc.VRFISICODINHEIRO AS TOTALFECHAMENTODINHEIROFISICO, 
                tbmc.VRRECDINHEIRO AS TOTALFECHAMENTODINHEIRO, 
                tbmc.VRRECFATURA AS TOTALFECHAMENTOFATURA, 
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
                tbqc.IDQUEBRACAIXA, 
                tbqc.TXTHISTORICO, 
                tbqc.VRQUEBRAEFETIVADO 
            FROM 
                "QUALITY_CONC_HML".MOVIMENTOCAIXA tbmc 
                LEFT JOIN "QUALITY_CONC_HML".CAIXA tbc ON tbmc.IDCAIXA = tbc.IDCAIXAWEB 
                LEFT JOIN "QUALITY_CONC_HML".FUNCIONARIO tbf ON tbmc.IDOPERADOR = tbf.IDFUNCIONARIO 
                LEFT JOIN "QUALITY_CONC_HML".QUEBRACAIXA tbqc ON tbmc.ID = tbqc.IDMOVIMENTOCAIXA 
            WHERE 
                1 = ?
                AND tbmc.STCANCELADO = 'False'
                and tbmc.STFECHADO = 'False'
        `;

        const params = [1];

        if (idEmpresa) {
            query += ' AND tbc.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (idMovimentoCaixa) {
            query += ' AND tbmc.ID = ?';
            params.push(idMovimentoCaixa);
        }

        if(idCaixa) {
            query += ' AND tbmc.IDCAIXA = ?';
            params.push(idCaixa);
        }

        if (dataPesquisa) {
            query += ' AND (tbmc.DTABERTURA BETWEEN ? AND ?)';
            params.push(dataPesquisa + ' 00:00:00', dataPesquisa + ' 23:59:59');
        }

  
        query += ' LIMIT ? OFFSET ?';
        const offset = (page - 1) * pageSize;
        params.push(pageSize, offset);

        const statement = conn.prepare(query);
        const result = await statement.exec(params);
        return {
            page,
            pageSize,
            rows: result.length,
            data: result
        };
    } catch (e) {
        throw new Error(e.message);
    }
};
