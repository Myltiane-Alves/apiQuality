// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getAdiantamentoSalarialDashBoard = async (idEmpresa, dataPesquisa, pageSize, page) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        
        var query = `
            SELECT 
                ifnull(SUM(tbas.VRVALORDESCONTO), 0) AS VRADIANTAMENTO
            FROM 
                "${databaseSchema}".ADIANTAMENTOSALARIAL tbas
            WHERE 
                1 = ?
                AND tbas.STATIVO = 'True'
        `;


        const params = [1];

        if (idEmpresa) {
            query += ' AND tbas.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (dataPesquisa) {
            query += ' AND (tbas.DTLANCAMENTO BETWEEN ? AND ?)';
            params.push(`${dataPesquisa} 00:00:00`, `${dataPesquisa} 23:59:59`);
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
        console.error('Erro ao executar consulta adiantamento salarial DashBoard', error);
        throw error;
    }
};

export const getAdiantamentoSalaria = async (idEmpresa, idAdiantamentoSalarial, dataFechamento, pageSize, page) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        

        let query = `
            SELECT 
                tbas.IDADIANTAMENTOSALARIO,
                tbas.IDEMPRESA,
                tbas.IDFUNCIONARIO,
                tbas.TXTMOTIVO,
                tbas.VRVALORDESCONTO,
                TO_VARCHAR(tbas.DTLANCAMENTO, 'DD/mm/YYYY') AS DTLANCAMENTO,
                tbas.STATIVO,
                tbe.NORAZAOSOCIAL,
                tbe.NOFANTASIA,
                tbe.NUCNPJ,
                tbf.NOFUNCIONARIO,
                tbf.NUCPF,
                IFNULL(tbf1.NOFUNCIONARIO, '') AS NOMEGERENTE
            FROM 
                "${databaseSchema}".ADIANTAMENTOSALARIAL tbas
                INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbe.IDEMPRESA = tbas.IDEMPRESA
                INNER JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbf.IDFUNCIONARIO = tbas.IDFUNCIONARIO
                LEFT JOIN "${databaseSchema}".FUNCIONARIO tbf1 ON tbas.IDUSR = tbf1.IDFUNCIONARIO
            WHERE 
                1 = ? 
        `;


        const params = [1];

        if(idAdiantamentoSalarial) {
            query += ' AND tbas.IDADIANTAMENTOSALARIO = ?';
            params.push(idAdiantamentoSalarial);
        }

        if (idEmpresa) {
            query += ' AND tbas.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (dataFechamento) {
            query += ' AND (tbas.DTLANCAMENTO BETWEEN ? AND ?)';
            params.push(`${dataFechamento} 00:00:00`, `${dataFechamento} 23:59:59`);
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
        console.error('Erro ao executar consulta adiantamento salarial', error);
        throw error;
    }
};

export const updateAdiantamentoSalarial = async (data) => {
    try {
        var query = `
            UPDATE "${databaseSchema}"."ADIANTAMENTOSALARIAL" SET 
                "IDEMPRESA" = ?, 
                "IDFUNCIONARIO" = ?, 
                "TXTMOTIVO" = ?, 
                "VRVALORDESCONTO" = ?, 
                "DTLANCAMENTO" = ?, 
                "STATIVO" = ?, 
                "IDUSR" = ? 
            WHERE "IDADIANTAMENTOSALARIO" = ?
        `;
  
      const statement = conn.prepare(query);
  
      for (const registro of data) {
  
        const params = [
            registro.IDEMPRESA,
            registro.IDFUNCIONARIO,
            registro.TXTMOTIVO,
            registro.VRVALORDESCONTO,
            registro.DTLANCAMENTO,
            registro.STATIVO,
            registro.IDUSR,
            registro.IDADIANTAMENTOSALARIO
        ];
  
        await statement.exec(params);
      }
  
      statement.close();
      conn.commit();
  
      return { msg: "Atualizção realizada com sucesso!" };
    } catch (error) {
      console.error('Erro ao executar a alteração de adiantamento de funcionario:', error);
      throw error;
    }
};

export const createAdiantamentoSalarial = async (data) => {
    try {
        let query = `
            INSERT INTO "${databaseSchema}"."ADIANTAMENTOSALARIAL" 
            (
                "IDADIANTAMENTOSALARIO", 
                "IDEMPRESA", 
                "IDFUNCIONARIO", 
                "TXTMOTIVO", 
                "VRVALORDESCONTO", 
                "DTLANCAMENTO", 
                "STATIVO", 
                "IDUSR"
            ) 
            VALUES (QUALITY_CONC.SEQ_ADIANTAMENTOSALARIAL.NEXTVAL, ?, ?, ?, ?, ?, ?, ?)
        `;
  
      const statement = conn.prepare(query);
  
      for (const registro of data) {
  
        const params = [
            registro.IDEMPRESA,
            registro.IDFUNCIONARIO,
            registro.TXTMOTIVO,
            registro.VRVALORDESCONTO,
            registro.DTLANCAMENTO,
            registro.STATIVO,
            registro.IDUSR
        ];
  
        await statement.exec(params);
      }
      conn.commit();
  
      return { msg: "Cadastro realizado com sucesso!" };
    } catch (error) {
      console.error('Erro ao executar a cadastro de adiantamento de Salário:', error);
      throw error;
    }
};