// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getVendaTotalFormaPagamento = async (idGrupo, idEmpresa, dataPesquisaInicio, dataPesquisaFim, idFuncionario, dsFormaPagamento, dsParcela, page, pageSize) => {
    try {
        
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                tbv.IDEMPRESA,
                e.NOFANTASIA,
                tbv.IDVENDA,
                TO_VARCHAR(tbv.DTHORAFECHAMENTO, 'DD-MM-YYYY') AS DATAVENDA,
                IFNULL(tbv.VRRECDINHEIRO, 0) AS VRRECDINHEIRO,
                IFNULL(tbv.VRRECCARTAO, 0) AS VRRECCARTAO,
                IFNULL(tbv.VRRECPOS, 0) AS VRRECPOS,
                IFNULL(tbv.VRRECVOUCHER, 0) AS VRRECVOUCHER,
                IFNULL(tbv.VRRECCONVENIO, 0) AS VRRECCONVENIO,
                tbvp.DSTIPOPAGAMENTO AS DSPAG,
                tbvp.NUAUTORIZACAO,
                tbvp.NOTEF,
                CASE WHEN tbvp.NPARCELAS IS NULL THEN 0 ELSE tbvp.NPARCELAS END AS NPARCELAS,
                tbv.NFE_INFNFE_IDE_SERIE AS SERIENF,
                tbv.PROTNFE_INFPROT_CHNFE AS CHAVENF,
                tbv.NFE_INFNFE_IDE_NNF AS NUMERONF
            FROM 
                "${databaseSchema}".VENDA tbv
                INNER JOIN "${databaseSchema}".VENDAPAGAMENTO tbvp ON tbv.IDVENDA = tbvp.IDVENDA
                INNER JOIN "${databaseSchema}".EMPRESA e ON tbv.IDEMPRESA = e.IDEMPRESA
            WHERE 
                tbv.STCANCELADO = 'False'
                AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL)
        `;

        const params = [];

        
        if (idGrupo > 0) {
            query += ' AND e.IDSUBGRUPOEMPRESARIAL = ?';
            params.push(idGrupo);
        }

        if (idEmpresa > 0) {
            query += ' AND tbv.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (dsFormaPagamento) {
            const dsFormaPagArray = dsFormaPagamento.split(',');
            if (dsFormaPagArray.length > 1) {
                query += ` AND UPPER(tbvp.DSTIPOPAGAMENTO) IN (${dsFormaPagArray.map(() => '?').join(',')})`;
                dsFormaPagArray.forEach(value => params.push(value.toUpperCase()));
            } else {
                query += ' AND UPPER(tbvp.DSTIPOPAGAMENTO) = ?';
                params.push(dsFormaPagamento.toUpperCase());
            }
        }

        if (dsParcela) {
            const dsParcelaArray = dsParcela.split(',');
            if (dsParcelaArray.length > 1) {
                query += ` AND tbvp.NPARCELAS IN (${dsParcelaArray.map(() => '?').join(',')})`;
                dsParcelaArray.forEach(value => params.push(value));
            } else {
                query += ' AND tbvp.NPARCELAS = ?';
                params.push(dsParcela);
            }
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND tbv.DTHORAFECHAMENTO BETWEEN ? AND ?';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        
        query += `
            GROUP BY 
                tbvp.DSTIPOPAGAMENTO, tbvp.NUAUTORIZACAO, tbvp.NPARCELAS, tbvp.NOTEF,
                TO_VARCHAR(tbv.DTHORAFECHAMENTO, 'DD-MM-YYYY'), tbv.IDVENDA, tbv.IDEMPRESA,
                tbv.VRRECDINHEIRO, tbv.VRRECCARTAO, tbv.VRRECPOS, tbv.VRRECVOUCHER, tbv.VRRECCONVENIO,
                e.NOFANTASIA, tbv.NFE_INFNFE_IDE_SERIE, tbv.PROTNFE_INFPROT_CHNFE, tbv.NFE_INFNFE_IDE_NNF
            ORDER BY 
                tbv.IDEMPRESA, TO_VARCHAR(tbv.DTHORAFECHAMENTO, 'DD-MM-YYYY')
        `;

        
        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

       
        return {
            page,
            pageSize,
            rows: result.length,
            data: result,
        };
    } catch (error) {
        console.error('Erro ao executar a consulta venda forma pagamento:', error);
        throw error;
    }
};
