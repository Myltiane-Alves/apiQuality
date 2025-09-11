// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getAtualizaEmpresaDiario = async (idEmpresa) => {
    try {

        let query = `
            SELECT 
                tbe.IDEMPRESA, 
                tbe.NOFANTASIA, 
                TO_VARCHAR(tbe.HORAATUALIZA, 'HH24:MI:SS') AS HRATUALIZACAO, 
                tbe.STATUALIZADIARIO, 
                tbe.STLOJAABERTA, 
                tbe.IDFUNCIONARIOSUPERVISOR 
            FROM "${databaseSchema}".EMPRESA tbe 
                WHERE 1 = ? 
            AND tbe.STATIVO = 'True'
        `;

        const params = [1];

        if (idEmpresa) {
            query += ' AND tbe.IDEMPRESA = ?';
            params.push(idEmpresa);
        }


        const statement = conn.prepare(query);
        const result = await statement.exec(params);

        return {
            rows: result.length,
            data: result,
        }
    } catch (error) {
        throw new Error(error, 'Erro ao buscar empresas');
    }
};


export const updateAtualizaEmpresaDiario = async (empresas) => {
    try {
        
        
        var query = `
            UPDATE "${databaseSchema}"."EMPRESA" SET 
            "STATUALIZADIARIO" = ?, 
            "HORAATUALIZA" = ?, 
            "IDFUNCIONARIOSUPERVISOR" = ?, 
            "STLOJAABERTA" = ? 
            WHERE "IDEMPRESA" = ?
        `;

        const statement = await conn.prepare(query);

        for(const registro of empresas) {
          
            const params = [
                registro.STATUALIZADIARIO,
                registro.HORAATUALIZA,
                registro.IDFUNCIONARIOSUPERVISOR,
                registro.STLOJAABERTA,
                registro.IDEMPRESA
            ]
            await statement.exec(params);
        }
        
        conn.commit();
        return {
            status: 'success',
            message: 'Empresa atualizadas com sucesso'
        }
    } catch (error) {
        console.error('Erro ao executar a atualização da empresa:', error);
        throw error;
    }
}