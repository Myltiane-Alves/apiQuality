// import conn from '../../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getDetalheFatura = async (idEmpresa, dataPesquisaInicio, dataPesquisaFim, codigoFatura, idDetalheFatura, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

       
        let query = `
            SELECT 
                tbdf.IDDETALHEFATURA,
                tbdf.IDEMPRESA,
                EMP.NOFANTASIA,
                tbdf.IDFUNCIONARIO,
                tbdf.IDDETALHEFATURALOCAL,
                tbdf.IDCAIXAWEB,
                tbdf.IDCAIXALOCAL,
                tbdf.NUESTABELECIMENTO,
                tbdf.NUCARTAO,
                TO_VARCHAR(tbdf.DTPROCESSAMENTO, 'DD-MM-YYYY') AS DTPROCESSAMENTO,
                TO_VARCHAR(tbdf.HRPROCESSAMENTO, 'HH24:MI:SS') AS HRPROCESSAMENTO,
                tbdf.NUNSU,
                tbdf.NUNSUHOST,
                tbdf.NUCODAUTORIZACAO,
                tbdf.VRRECEBIDO,
                TO_VARCHAR(tbdf.DTHRMIGRACAO, 'YYYY-MM-DD HH24:MI:SS') AS DTHRMIGRACAO,
                tbdf.STCANCELADO,
                tbdf.IDUSRCACELAMENTO,
                tbf.NOFUNCIONARIO,
                tbc.DSCAIXA,
                tbdf.IDMOVIMENTOCAIXAWEB,
                tbdf.TXTMOTIVOCANCELAMENTO,
                tbdf.STPIX,
                tbdf.NUAUTORIZACAO,
                tbmc.ID AS IDMOVCAIXA,
                tbmc.STCONFERIDO
               
            FROM 
                "${databaseSchema}".DETALHEFATURA tbdf
                INNER JOIN "${databaseSchema}".CAIXA tbc ON tbc.IDCAIXAWEB = tbdf.IDCAIXAWEB
                LEFT JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbdf.IDFUNCIONARIO = tbf.IDFUNCIONARIO
                LEFT JOIN "${databaseSchema}".MOVIMENTOCAIXA tbmc ON tbdf.IDMOVIMENTOCAIXAWEB = tbmc.ID
                LEFT JOIN "${databaseSchema}".EMPRESA EMP ON tbdf.IDEMPRESA = EMP.IDEMPRESA
            WHERE 
                1 = 1
        `;

        const params = [];
        
       
        if (idDetalheFatura) {
            query += ` AND tbdf.IDDETALHEFATURA = ?`;
            params.push(idDetalheFatura);
        }
        
        
        if (idEmpresa && idEmpresa > 0) {
            query += ` AND tbdf.IDEMPRESA = ?`;
            params.push(idEmpresa);
        }
        
        
        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ` AND (tbdf.DTPROCESSAMENTO BETWEEN ? AND ?)`;
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }
        
        
        if (codigoFatura) {
            query += ` AND tbdf.NUCODAUTORIZACAO = ?`;
            params.push(codigoFatura);
        }

        
        const offset = (page - 1) * pageSize;
        query += ` LIMIT ? OFFSET ?`;
        params.push(pageSize);  
        params.push(offset);  

        
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        
        return {
            page,
            pageSize,
            rows: result.length,
            data: result
        };
    } catch (error) {
        throw new Error(`Erro ao buscar os detalhes da fatura: ${error.message}`);
    }
};

export const getDetalheFaturaId = async (idFatura) => {
    try {
        const query = `
            SELECT 
                tbdf.IDDETALHEFATURA,
                tbdf.IDEMPRESA,
                EMP.NOFANTASIA,
                tbdf.IDFUNCIONARIO,
                tbdf.IDDETALHEFATURALOCAL,
                tbdf.IDCAIXAWEB,
                tbdf.IDCAIXALOCAL,
                tbdf.NUESTABELECIMENTO,
                tbdf.NUCARTAO,
                TO_VARCHAR(tbdf.DTPROCESSAMENTO,'DD-MM-YYYY') AS DTPROCESSAMENTO,
                TO_VARCHAR(tbdf.HRPROCESSAMENTO,'HH24:MI:SS') AS HRPROCESSAMENTO,
                tbdf.NUNSU,
                tbdf.NUNSUHOST,
                tbdf.NUCODAUTORIZACAO,
                tbdf.VRRECEBIDO,
                TO_VARCHAR(tbdf.DTHRMIGRACAO,'YYYY-MM-DD HH24:MI:SS') AS DTHRMIGRACAO,
                tbdf.STCANCELADO,
                tbdf.IDUSRCACELAMENTO,
                tbf.NOFUNCIONARIO,
                tbc.DSCAIXA,
                tbdf.IDMOVIMENTOCAIXAWEB,
                tbdf.TXTMOTIVOCANCELAMENTO,
                tbdf.STPIX,
                tbdf.NUAUTORIZACAO,
                tbmc.ID AS IDMOVCAIXA,
                tbmc.STCONFERIDO,
                tbdf.STRECOMPRA
            FROM 
                "${databaseSchema}".DETALHEFATURA tbdf
                INNER JOIN "${databaseSchema}".CAIXA tbc ON tbc.IDCAIXAWEB = tbdf.IDCAIXAWEB
                LEFT JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbdf.IDFuncionario = tbf.IDFuncionario
                LEFT JOIN "${databaseSchema}".MOVIMENTOCAIXA tbmc ON tbdf.IDMOVIMENTOCAIXAWEB = tbmc.ID
                LEFT JOIN "${databaseSchema}".EMPRESA EMP ON tbdf.IDEMPRESA = EMP.IDEMPRESA
            WHERE 
                tbdf.IDDETALHEFATURA = ?
        `;

        const statement = await conn.prepare(query);
        const result = await statement.exec([idFatura]);

        return result;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const putDetalheFatura = async (detalhes) => {
    try {
        

        const query = `
            UPDATE "${databaseSchema}"."DETALHEFATURA" SET 
                "IDEMPRESA" = ?, 
                "IDFUNCIONARIO" = ?, 
                "IDDETALHEFATURALOCAL" = ?, 
                "IDCAIXAWEB" = ?, 
                "IDCAIXALOCAL" = ?, 
                "NUESTABELECIMENTO" = ?, 
                "NUCARTAO" = ?, 
                "DTPROCESSAMENTO" = ?, 
                "HRPROCESSAMENTO" = ?, 
                "NUNSU" = ?, 
                "NUNSUHOST" = ?, 
                "NUCODAUTORIZACAO" = ?, 
                "VRRECEBIDO" = ?, 
                "DTHRMIGRACAO" = ?, 
                "STCANCELADO" = ?, 
                "IDUSRCACELAMENTO" = ?,
                "IDMOVIMENTOCAIXAWEB" = ?,
                "STPIX" = ?,
                "NUAUTORIZACAO" = ?
            WHERE "IDDETALHEFATURA" = ?
        `;

        const statement = await conn.prepare(query);

        for (const registro of detalhes) {
          

            
            await statement.exec([
                registro.IDEMPRESA,
                registro.IDFUNCIONARIO,
                registro.IDDETALHEFATURALOCAL,
                registro.IDCAIXAWEB,
                registro.IDCAIXALOCAL,
                registro.NUESTABELECIMENTO,
                registro.NUCARTAO,
                registro.DTPROCESSAMENTO,
                registro.HRPROCESSAMENTO,
                registro.NUNSU,
                registro.NUNSUHOST,
                registro.NUCODAUTORIZACAO,
                registro.VRRECEBIDO,
                registro.DTHRMIGRACAO,
                registro.STCANCELADO,
                registro.IDUSRCACELAMENTO,
                registro.IDMOVIMENTOCAIXAWEB,
                registro.STPIX,
                registro.NUAUTORIZACAO,
                registro.IDDETALHEFATURA
            ]);


        }

        conn.commit();
    
        return {
            status: 'success',
            msg: 'Atualização realizada com sucesso!',
            data: detalhes
        
        }
      
    } catch (error) {
        console.error("um erro ao executar :", error);
        res.status(500).json({ error: error.message });
    }
};


export const createDetalheFatura = async (detalhes) => {
    try {
        
        let checkQuery = `
            SELECT 
            "IDDETALHEFATURA" FROM "${databaseSchema}"."DETALHEFATURA" 
            WHERE IDEMPRESA = ? 
            AND "VRRECEBIDO" = ? 
            AND "STCANCELADO" = 'False' 
            AND "DTPROCESSAMENTO" = ? 
            AND "NUCODAUTORIZACAO" = ?  
        
        `;

        const registro = detalhes[0];
        const result = await conn.exec(checkQuery, [
            registro.IDEMPRESA,
            registro.VRRECEBIDO,
            registro.DTPROCESSAMENTO,
            registro.NUCODAUTORIZACAO
        ]);

        if(result.length > 0){
            return {
                status: 'info',
                msg: 'Já existe um registro com os mesmos dados!'
            }
        }

        let insertQuery = `
            INSERT INTO "${databaseSchema}"."DETALHEFATURA" 
            (
                "IDDETALHEFATURA", 
                "IDEMPRESA", 
                "IDFUNCIONARIO", 
                "IDDETALHEFATURALOCAL", 
                "IDCAIXAWEB", 
                "IDCAIXALOCAL", 
                "NUESTABELECIMENTO", 
                "NUCARTAO", 
                "DTPROCESSAMENTO", 
                "HRPROCESSAMENTO", 
                "NUNSU", 
                "NUNSUHOST", 
                "NUCODAUTORIZACAO", 
                "VRRECEBIDO", 
                "DTHRMIGRACAO", 
                "STCANCELADO", 
                "IDUSRCACELAMENTO", 
                "IDMOVIMENTOCAIXAWEB", 
                "STPIX", 
                "NUAUTORIZACAO"
            ) 
            VALUES(${databaseSchema}.SEQ_DETALHEFATURA.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

        const statement = await conn.prepare(insertQuery);

        for (const registro of detalhes) {       
            await statement.exec([
                registro.IDEMPRESA,
                registro.IDFUNCIONARIO,
                registro.IDDETALHEFATURALOCAL,
                registro.IDCAIXAWEB,
                registro.IDCAIXALOCAL,
                registro.NUESTABELECIMENTO,
                registro.NUCARTAO,
                registro.DTPROCESSAMENTO,
                registro.HRPROCESSAMENTO,
                registro.NUNSU,
                registro.NUNSUHOST,
                registro.NUCODAUTORIZACAO,
                registro.VRRECEBIDO,
                registro.DTHRMIGRACAO,
                registro.STCANCELADO,
                registro.IDUSRCACELAMENTO,
                registro.IDMOVIMENTOCAIXAWEB,
                registro.STPIX,
                registro.NUAUTORIZACAO,
                
            ]);
        }

        conn.commit();
    
        return {
            status: 'success',
            msg: 'Cadastro realizado com sucesso!',
            data: detalhes
        
        }
      
    } catch (error) {
        console.error("um erro ao executar cadastro detalhe fatura:", error);
        throw new Error(error.message);
    }
};
