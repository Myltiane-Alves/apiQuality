// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getVendaFaturaPixPeriodo = async (idMarca, idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        var query = ` SELECT 
            tbe.IDEMPRESA,
            tbe.NOFANTASIA,
            tbe.IDGRUPOEMPRESARIAL, 
            tbe.CONTACREDITOSAP,
            tbf.DTPROCESSAMENTO,
            tbf.STCONFERIDO,
            tbf.IDDETALHEFATURA,
            IFNULL (TO_VARCHAR(tbv.DATA_COMPENSACAO, 'DD/mm/YYYY'),'NÃO INFORMADO') AS DATA_COMPENSACAO,
            (SELECT IFNULL(SUM(tbf.VRRECEBIDO),0) FROM "${databaseSchema}".DETALHEFATURA tbf INNER JOIN "${databaseSchema}".MOVIMENTOCAIXA tbmcf on tbf.IDMOVIMENTOCAIXAWEB = tbmcf.ID WHERE tbf.IDEMPRESA = tbe.IDEMPRESA AND tbf.STCANCELADO='False' AND (tbf.STPIX = 'False' OR tbf.STPIX IS NULL) AND (tbf.DTPROCESSAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59')) AS VALORTOTALFATURA,
            (SELECT IFNULL(SUM(tbf.VRRECEBIDO),0) FROM "${databaseSchema}".DETALHEFATURA tbf INNER JOIN "${databaseSchema}".MOVIMENTOCAIXA tbmcf on tbf.IDMOVIMENTOCAIXAWEB = tbmcf.ID WHERE tbf.IDEMPRESA = tbe.IDEMPRESA AND tbf.STCANCELADO='False' AND tbf.STPIX = 'True' AND (tbf.DTPROCESSAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59')) AS VALORTOTALFATURAPIX
            FROM
            "${databaseSchema}".VENDA tbv
            INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbe.IDEMPRESA = tbv.IDEMPRESA
            INNER JOIN "${databaseSchema}".DETALHEFATURA tbf ON tbf.IDEMPRESA = tbe.IDEMPRESA
            INNER JOIN "${databaseSchema}".MOVIMENTOCAIXA tbmcf ON tbf.IDMOVIMENTOCAIXAWEB = tbmcf.ID
            WHERE
            1 = ? AND tbv.STCANCELADO = 'False'
    
        `;

        const params = [1];


        if (idEmpresa) {
            query += ` AND tbe.IDEMPRESA = ?`;
            params.push(idEmpresa);
        }

        if (idMarca) {
            query += ` AND tbe.IDGRUPOEMPRESARIAL = ?`;
            params.push(idMarca);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ` AND (tbf.DTPROCESSAMENTO BETWEEN ? AND ?)`;
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }



        query += ` GROUP BY 
            tbe.IDEMPRESA, 
            tbe.NOFANTASIA, 
            tbe.IDGRUPOEMPRESARIAL, 
            tbe.CONTACREDITOSAP, 
            tbf.DTPROCESSAMENTO,
            tbv.DATA_COMPENSACAO, 
            tbf.STCONFERIDO,
            tbf.IDDETALHEFATURA
        `;
        query += ` ORDER BY tbf.DTPROCESSAMENTO DESC`;

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


export const getVendaFaturaPixPeriodoCompensada = async (idMarca, idEmpresa, dataCompInicio, dataCompFim, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
  
        let query = `
            SELECT 
            tbe.IDEMPRESA,
            tbe.NOFANTASIA,
            tbe.IDGRUPOEMPRESARIAL, 
            tbe.CONTACREDITOSAP,
            tbf.STCONFERIDO,
            tbf.IDDETALHEFATURA,
            IFNULL (TO_VARCHAR(tbf.DATA_COMPENSACAO, 'DD/mm/YYYY'),'NÃO INFORMADO') AS DATA_COMPENSACAO,
            IFNULL (TO_VARCHAR(tbf.DTPROCESSAMENTO, 'DD/mm/YYYY'),'NÃO INFORMADO') AS DTPROCESSAMENTO,
            (SELECT IFNULL(SUM(tbf.VRRECEBIDO),0) FROM "${databaseSchema}".DETALHEFATURA tbf INNER JOIN "${databaseSchema}".MOVIMENTOCAIXA tbmcf on tbf.IDMOVIMENTOCAIXAWEB = tbmcf.ID WHERE tbf.IDEMPRESA = tbe.IDEMPRESA AND tbf.STCANCELADO='False' AND (tbf.STPIX = 'False' OR tbf.STPIX IS NULL) AND (tbf.DATA_COMPENSACAO BETWEEN '${dataCompInicio} 00:00:00' AND '${dataCompFim} 23:59:59')) AS VALORTOTALFATURA,
            (SELECT IFNULL(SUM(tbf.VRRECEBIDO),0) FROM "${databaseSchema}".DETALHEFATURA tbf INNER JOIN "${databaseSchema}".MOVIMENTOCAIXA tbmcf on tbf.IDMOVIMENTOCAIXAWEB = tbmcf.ID WHERE tbf.IDEMPRESA = tbe.IDEMPRESA AND tbf.STCANCELADO='False' AND tbf.STPIX = 'True' AND (tbf.DATA_COMPENSACAO BETWEEN '${dataCompInicio} 00:00:00' AND '${dataCompFim} 23:59:59')) AS VALORTOTALFATURAPIX
            FROM
            "${databaseSchema}".VENDA tbv
            INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbe.IDEMPRESA = tbv.IDEMPRESA
            INNER JOIN "${databaseSchema}".DETALHEFATURA tbf ON tbf.IDEMPRESA = tbe.IDEMPRESA
            INNER JOIN "${databaseSchema}".MOVIMENTOCAIXA tbmcf ON tbf.IDMOVIMENTOCAIXAWEB = tbmcf.ID
            WHERE
            1 = ? AND tbv.STCANCELADO = 'False'
        `;
  
        const params = [1];
  
        if (idEmpresa) {
            query += ` AND tbe.IDEMPRESA = ?`;
            params.push(idEmpresa);
        }
  
        if (idMarca) {
            query += ` AND tbe.IDGRUPOEMPRESARIAL = ?`;
            params.push(idMarca);
        }
  
        if (dataCompInicio && dataCompFim) {
            query += ` AND (tbf.DATA_COMPENSACAO BETWEEN ? AND ?)`;
            params.push(`${dataCompInicio} 00:00:00`, `${dataCompFim} 23:59:59`);
        }
        query += ` GROUP BY
            tbe.IDEMPRESA,
            tbe.NOFANTASIA,
            tbe.IDGRUPOEMPRESARIAL,
            tbe.CONTACREDITOSAP,
            tbf.DATA_COMPENSACAO,
            tbf.DTPROCESSAMENTO,
            tbf.STCONFERIDO,
            tbf.IDDETALHEFATURA
            `;

   
        query += ` ORDER BY tbf.DATA_COMPENSACAO`;
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


export const putVendaPixStatusConferido = async (vendas) => {
    try {
        const query = `
            UPDATE "${databaseSchema}"."DETALHEFATURA" SET 
                STCONFERIDO = ?,
                DATA_COMPENSACAO = ?
            WHERE "IDDETALHEFATURA" = ?;
        `;

        const statement = await conn.prepare(query);

        for (const venda of vendas) {
            const params = [
                venda.STCONFERIDO,
                venda.DATA_COMPENSACAO,
                venda.IDDETALHEFATURA
            ];
            
            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Data Compensação Vendas atualizadas com sucesso!',
        };
    } catch (e) {
        throw new Error(`Erro ao atualizar vendas: ${e.message}`);
    }
};

