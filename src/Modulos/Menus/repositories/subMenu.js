// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getSubMenuUsuario = async (idSubMenus, idMenu, idPerfil, idModulo, dsModulo) => {
    try {
    
        let query = `
           SELECT 
                MP.ID AS IDMODULO,
                MP.DSMODULO,
                MP.IDPERFIL,
                MP.IDMENU,
                Men.IDMENU AS IDMENUPAI,
                Men.DSMENU,
                Mn.DSNOME,
                Mn.URL
            FROM 
                "${databaseSchema}".MODULOPRINCIPAL AS MP
            INNER JOIN 
                "${databaseSchema}".MENUPAI AS Men ON MP.IDMENU = Men.IDMENU
            INNER JOIN 
                "${databaseSchema}".MENUFILHO AS Mn ON Men.IDMENU = Mn.IDMENUPAI
            WHERE 
                1 = 1
        `;

        const params = [];

        if (idModulo) {
            query += ' AND MP.ID = ?';
            params.push(idModulo);    
        }

        if (idPerfil) {
            query += ' AND MP.IDPERFIL = ?';
            params.push(idPerfil);
        }
        
        if (idMenu) {
            query += ' AND Men.IDMENU = ?';
            params.push(idMenu);
        }

        if (dsModulo) {
            query += ' AND UPPER(MP.DSMODULO) LIKE UPPER(?)';
            params.push(`%${dsModulo}%`);
        }

        query += ' ORDER BY MP.ID';
        
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

     
        return {
            rows: result.length,
            data: result
        };
    } catch (error) {
        console.error('Erro ao execultar a consulta de modulos', error);
        throw error;
    } finally {
        conn.close();
    }
};


export const updateModulo = async (dados) => {
    try {
        
        const query = `
            UPDATE "${databaseSchema}"."MODULO" SET 
            "IDMODULO" = ?, 
            "DSMODULO" = ?
            WHERE "IDMODULO" = ?
        `;

        const statement = await conn.prepare(query);

        for(const registro of dados) {
          
            const params = [
                registro.IDMODULO,
                registro.DSMODULO,
            ]
            await statement.exec(params);
        }
        
        conn.commit();
        return {
            status: 'success',
            message: 'Modulo atualizado com sucesso'
        }
    } catch (error) {
        console.error('Erro ao executar a atualização do Modulo:', error);
        throw error;
    }
}

export const createModulo = async (dados) => {
    try {
        const query = `
            INSERT INTO "${databaseSchema}"."MODULO" 
            (
                "IDMODULO", 
                "DSMODULO"
            )
            VALUES (?, ?)
        `;

        const statement = await conn.prepare(query);

        for (const registro of dados) {
            // Gera o próximo IDMODULO, caso necessário
            const idQuery = `SELECT IFNULL(MAX(TO_INT("IDMODULO")), 0) + 1 AS novoId FROM "${databaseSchema}"."MODULO"`;
            const idResult = await conn.exec(idQuery);
            const novoId = idResult[0].NOVOID || registro.IDMODULO;

            const params = [
                novoId,  // IDMODULO gerado ou o fornecido em `registro.IDMODULO`
                registro.DSMODULO
            ];

            await statement.exec(params);
        }

        await conn.commit();
        return {
            status: 'success',
            message: 'Módulo(s) atualizado(s) com sucesso'
        };
    } catch (error) {
        console.error('Erro ao executar a atualização do Módulo:', error);
        throw error;
    } finally {
        conn.close(); // Libera a conexão de volta ao pool
    }
}