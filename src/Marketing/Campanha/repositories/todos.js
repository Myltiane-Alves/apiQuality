// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;


export const getCampanhaEmpresa = async (idCampanha, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
            tbc.IDCAMPANHA,
            tbc.DSCAMPANHA,
            tbc.IDOPERADOR,
            TO_VARCHAR(tbc.DTINICIO, 'DD-MM-YYYY') AS DTINICIO,
            TO_VARCHAR(tbc.DTFINAL, 'DD-MM-YYYY') AS DTFINAL,
            tbc.VRPERCDESCONTO,
            tbe.NOFANTASIA
            FROM 
            "${databaseSchema}".CAMPANHA tbc
            INNER JOIN "${databaseSchema}".CAMPANHA_EMPRESA tbce ON tbce.IDCAMPANHA = tbc.IDCAMPANHA
            INNER JOIN "${databaseSchema}".EMPRESA tbe ON tbce.IDEMPRESA = tbe.IDEMPRESA
            WHERE 
            1 = 1
        `;

        const params = [];

        if(idCampanha) {
            query += `AND tbc.IDCAMPANHA  = ?`;
            params.push(idCampanha);
        }


        query += ` ORDER BY tbc.IDCAMPANHA`;

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
        console.error('Erro ao executar a consulta Lista Campanha Empresa', error);
        throw error;
    }
}

export const updateCampanhaEmpresa = async (dados) => {
    try {
        
        const query = `
            UPDATE "${databaseSchema}".CAMPANHA SET 
            "DSCAMPANHA" = ?, 
            "IDOPERADOR" = ?, 
            "DTINICIO" = ?, 
            "DTFINAL" = ?, 
            "VRPERCDESCONTO" = ? 
            WHERE "IDCAMPANHA" = ?
        `;

        const statement = await conn.prepare(query);

        for(const registro of dados) {
          
            const params = [
                registro.IDCAMPANHA,
                registro.DSCAMPANHA,
                registro.IDOPERADOR,
                registro.DTINICIO,
                registro.DTFINAL,
                registro.VRPERCDESCONTO,
             
            ]
            await statement.exec(params);
        }
        
        conn.commit();
        return {
            status: 'success',
            message: 'Campanha Empresa atualizadas com sucesso'
        }
    } catch (error) {
        console.error('Erro ao executar a atualização da Camapnha Empresa:', error);
        throw error;
    }
}


export const incluirEmpresa = async (dados, idCampanha) => {
    try {
        const query = `
            INSERT INTO "${databaseSchema}".CAMPANHA_EMPRESA 
            (
                "ID",
                "IDCAMPANHA", 
                "IDEMPRESA"
            ) 
            VALUES(${databaseSchema}.SEQ_CAMPANHA_EMPRESA.NEXTVAL, ?, ?)
        `;

        const statement = await conn.prepare(query);

        if (Array.isArray(dados)) {
            for (const idEmpresa of dados) {
                const params = [
                    idCampanha,
                    idEmpresa
                ];
                await statement.exec(params);
            }
        } else {
            console.error("Erro: 'dados' não é uma lista de empresas.");
            throw new TypeError("'dados' precisa ser um array de empresas.");
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Empresa(s) incluída(s) com sucesso'
        };
    } catch (error) {
        console.error('Erro ao executar a inclusão da Empresa:', error);
        throw error;
    }
};


export const createCampanhaEmpresa = async (dados) => {
    try {
        const queryId = `SELECT ${databaseSchema}.SEQ_CAMPANHA.NEXTVAL AS IDCAMPANHA FROM DUMMY WHERE 1 = 1`;
        
        const query = `
            INSERT INTO "${databaseSchema}".CAMPANHA 
            (
                "IDCAMPANHA", 
                "DSCAMPANHA", 
                "IDOPERADOR", 
                "DTINICIO", 
                "DTFINAL", 
                "VRPERCDESCONTO"
            ) 
            VALUES(?, ?, ?, ?, ?, ?)
        `;

        const statement = await conn.prepare(query);

        for(const registro of dados) {
            const idCampanhaResult = await conn.exec(queryId);
            const idCampanha = idCampanhaResult[0].IDCAMPANHA;

            const params = [
                idCampanha,
                registro.DSCAMPANHA,
                registro.IDOPERADOR,
                registro.DTINICIO,
                registro.DTFINAL,
                registro.VRPERCDESCONTO
            ];
            await statement.exec(params);
            await incluirEmpresa(Array.isArray(registro.EMPRESAS) ? registro.EMPRESAS : [], idCampanha);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Campanha e empresas associadas cadastradas com sucesso'
        };
    } catch (error) {
        console.error('Erro ao executar o cadastro da Campanha e associar Empresas:', error);
        throw error;
    }
};

