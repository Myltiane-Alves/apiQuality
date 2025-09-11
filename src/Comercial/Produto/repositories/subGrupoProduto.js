// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getSubGrupoProduto = async (
    idGrupo,
    page,
    pageSize
) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT A."IDGRUPOESTRUTURA" ID_GRUPO, 
                    B."DSGRUPOESTRUTURA" DS_GRUPO, 
                    A."IDSUBGRUPOESTRUTURA" ID_ESTRUTURA, 
                    A."DSSUBGRUPOESTRUTURA" ESTRUTURA 
            FROM "${databaseSchema}"."SUBGRUPOESTRUTURA" A 
             INNER JOIN "${databaseSchema}"."GRUPOESTRUTURA" B 
             ON A.IDGRUPOESTRUTURA = B.IDGRUPOESTRUTURA 
            WHERE A.STATIVO='True' AND 1=1
        `;
        const params = [];

        if (idGrupo) {
            query += `AND A.IDGRUPOESTRUTURA = (${idGrupo}) `;
        }

        query += ` ORDER BY A."IDGRUPOESTRUTURA", A."DSSUBGRUPOESTRUTURA" `;

        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);
   
        
        return {
            data: result,
            page: page,
            pageSize: pageSize
        };
    } catch (error) {
        console.error('Erro ao executar a consulta de Sub Grupo Estrutura:', error);
        throw error;
    }
}