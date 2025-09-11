// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;


export const getCampanhaCliente = async (cpf,telefone, idCampanha, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        var query = `
            SELECT 
                tbcc.ID,
                tbcc.IDCAMPANHA,
                tbcc.NUCPFCNPJ,
                tbcc.NOME,
                tbcc.EENDERECO,
                tbcc.NUENDERECO,
                tbcc.ECOMPLEMENTO,
                tbcc.EBAIRRO,
                tbcc.ECIDADE,
                tbcc.SGUF,
                tbcc.NUCEP,
                tbcc.EEMAIL,
                tbcc.NUTELEFONE,
                tbc.DSCAMPANHA
            FROM 
            "${databaseSchema}".CAMPANHA_CLIENTE tbcc
                LEFT JOIN "${databaseSchema}".CAMPANHA tbc ON tbc.IDCAMPANHA = tbcc.IDCAMPANHA
            WHERE 
            1 = ?
        `;

        const params = [1];

        if(idCampanha) {
            query += `AND tbcc.ID = ?`;
            params.push(idCampanha);
        }

        if(cpf || telefone) {
            query += `AND (tbcc.NUCPFCNPJ = ? OR tbcc.NUTELEFONE = ?)`;
            params.push(cpf, telefone);
        }

        query += ` ORDER BY tbcc.ID`;

        query += ` LIMIT ? OFFSET ?`;
        params.push(pageSize, (page - 1) * pageSize);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page,
            pageSize,
            rows: result.length,
            data: result,
        }
    } catch(error) {
        console.error('Erro ao executar a consulta Lista Campanha Cliente', error);
        throw error;
    }
}

export const updateCampanhaCLiente = async (dados) => {
    try {
        
        const query = `
            UPDATE "${databaseSchema}".CAMPANHA_CLIENTE SET 
            "IDCAMPANHA" = ?, 
            "NUCPFCNPJ" = ?, 
            "EENDERECO" = ?, 
            "NUENDERECO" = ?, 
            "ECOMPLEMENTO" = ?, 
            "EBAIRRO" = ?, 
            "ECIDADE" = ?, 
            "SGUF" = ?, 
            "NUCEP" = ?, 
            "EEMAIL" = ?, 
            "NUTELEFONE" = ?, 
            "NOME" = ? 
            WHERE "ID" = ? 
        `;

        const statement = await conn.prepare(query);

        for(const registro of dados) {
          
            const params = [
                registro.IDCAMPANHA,
                registro.NUCPFCNPJ,
                registro.EENDERECO,
                registro.NUENDERECO,
                registro.ECOMPLEMENTO,
                registro.EBAIRRO,
                registro.ECIDADE,
                registro.SGUF,
                registro.NUCEP,
                registro.EEMAIL,
                registro.NUTELEFONE,
                registro.NOME,
                registro.ID,
            ]
            await statement.exec(params);
        }
        
        conn.commit();
        return {
            status: 'success',
            message: 'Campanha Cliente atualizadas com sucesso'
        }
    } catch (error) {
        console.error('Erro ao executar a atualização da Camapnha Cliente:', error);
        throw error;
    }
}
export const createCampanhaCLiente = async (dados) => {
    try {
        
        const query = `
            INSERT INTO "${databaseSchema}".CAMPANHA_CLIENTE 
            ( 
                "ID", 
                "IDCAMPANHA", 
                "NUCPFCNPJ", 
                "NOME", 
                "EENDERECO", 
                "NUENDERECO", 
                "ECOMPLEMENTO", 
                "EBAIRRO", 
                "ECIDADE", 
                "SGUF", 
                "NUCEP", 
                "EEMAIL", 
                "NUTELEFONE" 
            ) 
            VALUES (QUALITY_CONC.SEQ_CAMPANHA_CLIENTE.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

        const statement = await conn.prepare(query);

        for(const registro of dados) {
          
            const params = [
                registro.IDCAMPANHA,
                registro.NUCPFCNPJ,
                registro.NOME,
                registro.EENDERECO,
                registro.NUENDERECO,
                registro.ECOMPLEMENTO,
                registro.EBAIRRO,
                registro.ECIDADE,
                registro.SGUF,
                registro.NUCEP,
                registro.EEMAIL,
                registro.NUTELEFONE,
            ]
            await statement.exec(params);
        }
        
        conn.commit();
        return {
            status: 'success',
            message: 'Campanha Cliente cadastrada com sucesso'
        }
    } catch (error) {
        console.error('Erro ao executar a cadastro da Camapnha Cliente:', error);
        throw error;
    }
}