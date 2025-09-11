// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getEstabelecimentos = async (idGrupo, idEstabelecimento, idEmpresa,  page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                A.IDESTABELECIMENTO, 
                A.IDEMPRESA, 
                A.NUESTABELECIMENTO, 
                A.CODESTABELECIMENTO, 
                EMP.NOFANTASIA 
            FROM 
                "${databaseSchema}".ESTABELECIMENTO A 
            INNER JOIN 
                "${databaseSchema}".EMPRESA EMP ON A.IDEMPRESA = EMP.IDEMPRESA 
            WHERE 
                1 = ?
        `;

        const params = [1];

        if(idGrupo>0){
            query += ' And  EMP.IDSUBGRUPOEMPRESARIAL IN (?)  ';
            params.push(idGrupo);
        }
        
        if (idEstabelecimento ) {
            query += ' And  A.IDESTABELECIMENTO = ?';
            params.push(idEstabelecimento);
        }
        
        if (idEmpresa > 0) {
            query += ' AND EMP.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

    
        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize);
        params.push(offset);
        
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

       
        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result
        }
    } catch (error) {
        throw new Error(error.message);
    }
};