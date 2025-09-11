

// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getCliente = async (idCliente, cpfoucnpj,  page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                IDCLIENTE,
                IDEMPRESA,
                DSNOMERAZAOSOCIAL,
                DSAPELIDONOMEFANTASIA,
                TPCLIENTE,
                NUCPFCNPJ,
                NURGINSCESTADUAL,
                NUINSCMUNICIPAL,
                NUCEP,
                NUIBGE,
                EENDERECO,
                NUENDERECO,
                ECOMPLEMENTO,
                EBAIRRO,
                ECIDADE,
                SGUF,
                EEMAIL,
                NUTELCOMERCIAL,
                NUTELCELULAR,
                DTNASCFUNDACAO,
                IDINDICACAOIE,
                DSINDICACAOIE,
                IDUSERCADASTRO,
                NUCNAE,
                STATIVO,
                TO_VARCHAR(IFNULL(DTCADASTRO, DTULTALTERACAO), 'YYYY-MM-DD') as DTCADASTRO 
            FROM 
                "${databaseSchema}".CLIENTE
            WHERE
                1 = ? 
      `;

        const params = [1];

       if(idCliente) {
            query += ` AND IDCLIENTE = ?`;
            params.push(idCliente);
        }

        if(cpfoucnpj) {
            query += ` AND NUCPFCNPJ = ?`;
            params.push(cpfoucnpj);
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

export const updateCliente = async (dados) => {
    try {
        
        let query = `
            UPDATE
            "${databaseSchema}"."CLIENTE"
            SET
                "DSNOMERAZAOSOCIAL" = ?,
                "DSAPELIDONOMEFANTASIA" = ?,
                "TPCLIENTE" = ?,
                "NUCPFCNPJ" = ?,
                "NURGINSCESTADUAL" = ?  ,
                "NUINSCMUNICIPAL" = ?,
                "NUCEP" = ?,
                "NUIBGE" = ?,
                "EENDERECO" = ?,
                "NUENDERECO" = ?,
                "ECOMPLEMENTO" = ?,
                "EBAIRRO" = ?,
                "ECIDADE" = ?,
                "SGUF" = ?,
                "EEMAIL" = ?,
                "NUTELCOMERCIAL" = ?,
                "NUTELCELULAR" = ?,
                "DTNASCFUNDACAO" = ?,
                "IDINDICACAOIE" = ?,
                "DSINDICACAOIE" = ?,
                "IDUSERULTALTERACAO" = ?,
                "NUCNAE" = ?,
                "STATIVO" = 'True',
                "STATUALIZARCADASTROSAP" = 'True',
                "DTULTALTERACAO" = CURRENT_TIMESTAMP
            WHERE
                "IDCLIENTE" =  ? 
        `;

        const statement = await conn.prepare(query);

        for (const registro of dados) {
         
            await statement.exec([
                registro.DSNOMERAZAOSOCIAL,
                registro.DSAPELIDONOMEFANTASIA,
                registro.NUCPFCNPJ.length > 11 ? 'JURIDICA' : 'FISICA',
                registro.NUCPFCNPJ,
                registro.NURGINSCESTADUAL,
                registro.NUINSCMUNICIPAL,
                registro.NUCEP,
                registro.NUIBGE,
                registro.EENDERECO,
                registro.NUENDERECO,
                registro.ECOMPLEMENTO,
                registro.EBAIRRO,
                registro.ECIDADE,
                registro.SGUF,
                registro.EEMAIL,
                registro.NUTELCOMERCIAL,
                registro.NUTELCELULAR,
                registro.DTNASCFUNDACAO,
                registro.IDINDICACAOIE,
                registro.DSINDICACAOIE,
                registro.IDFUNCIONARIO,
                registro.NUCNAE,
                registro.IDCLIENTE
            ]);
        }

        conn.commit();
    
        return {
            status: 'success',
            msg: 'Atualização Cliente realizada com sucesso!',
            
        }
      
    } catch (error) {
        console.error("um erro ao executar atualização cliente:", error);
        res.status(500).json({ error: error.message });
    }
};

export const createCliente = async (dados) => {
    try {
        
        let query = `
            INSERT INTO 
                "${databaseSchema}"."CLIENTE"
            (
                "IDCLIENTE",
                "IDEMPRESA",
                "DSNOMERAZAOSOCIAL",
                "DSAPELIDONOMEFANTASIA",
                "TPCLIENTE",
                "NUCPFCNPJ",
                "NURGINSCESTADUAL"  ,
                "NUINSCMUNICIPAL",
                "NUCEP",
                "NUIBGE",
                "EENDERECO",
                "NUENDERECO",
                "ECOMPLEMENTO",
                "EBAIRRO",
                "ECIDADE",
                "SGUF",
                "EEMAIL",
                "NUTELCOMERCIAL",
                "NUTELCELULAR",
                "DTNASCFUNDACAO",
                "IDINDICACAOIE",
                "DSINDICACAOIE",
                "IDUSERCADASTRO",
                "NUCNAE",
                "STATIVO",
                "DTCADASTRO"
            )
            VALUES(QUALITY_CONC.SEQ_CLIENTE.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'True', CURRENT_TIMESTAMP) 
        `;

        const statement = await conn.prepare(query);

        for (const registro of dados) {
         
            await statement.exec([
                registro.IDEMPRESA,
                registro.DSNOMERAZAOSOCIAL,
                registro.DSAPELIDONOMEFANTASIA,
                registro.NUCPFCNPJ.length > 11 ? 'JURIDICA' : 'FISICA',
                registro.NUCPFCNPJ,
                registro.NURGINSCESTADUAL,
                registro.NUINSCMUNICIPAL,
                registro.NUCEP,
                registro.NUIBGE,
                registro.EENDERECO,
                registro.NUENDERECO,
                registro.ECOMPLEMENTO,
                registro.EBAIRRO,
                registro.ECIDADE,
                registro.SGUF,
                registro.EEMAIL,
                registro.NUTELCOMERCIAL,
                registro.NUTELCELULAR,
                registro.DTNASCFUNDACAO,
                registro.IDINDICACAOIE,
                registro.DSINDICACAOIE,
                registro.IDFUNCIONARIO,
                registro.NUCNAE
            ]);
        }

        conn.commit();
    
        return {
            status: 'success',
            msg: 'Cadastro do Cliente realizada com sucesso!',
            
        }
      
    } catch (error) {
        console.error("um erro ao executar cadastro do cliente:", error);
        res.status(500).json({ error: error.message });
    }
};
