
// import conn from '../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getDepositosLoja = async (idDeposito,  pageSize, page) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 10;

        const query = `
            SELECT 
                tbdl.IDDEPOSITOLOJA,
                tbdl.DTDEPOSITO,
                tbdl.DTMOVIMENTOCAIXA,
                tbdl.IDEMPRESA,
                tbdl.IDUSR,
                tbdl.IDCONTABANCO,
                tbdl.VRDEPOSITO,
                tbdl.DSHISTORIO,
                tbdl.NUDOCDEPOSITO,
                tbdl.DSPATHDOCDEPOSITO,
                tbdl.STATIVO,
                tbdl.STCANCELADO,
                tbdl.IDUSRCACELAMENTO,
                tbdl.DSMOTIVOCANCELAMENTO
            FROM 
                "${databaseSchema}".DEPOSITOLOJA tbdl
            WHERE 
                1 = ?
        `;

        const params = [];

        if (idDeposito > 0) {
            query += ' AND tbdl.IDDEPOSITOLOJA = ?';
            params.push(idDeposito);
        }

        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);


        return {
            page,
            pageSize,
            rows,
            data: result
        };
    } catch (error) {
        console.error('Error executing query', error);
        throw error;
    }
};

export const updateDepositoLoja = async (depositos) => {
    try {
        const query = `
            UPDATE "${databaseSchema}"."DEPOSITOLOJA" SET 
                "DTDEPOSITO" = ?, 
                "DTMOVIMENTOCAIXA" = ?, 
                "IDEMPRESA" = ?, 
                "IDUSR" = ?, 
                "IDCONTABANCO" = ?, 
                "VRDEPOSITO" = ?, 
                "DSHISTORIO" = ?, 
                "NUDOCDEPOSITO" = ?, 
                "STATIVO" = ?, 
                "STCANCELADO" = ? 
            WHERE "IDDEPOSITOLOJA" = ?
        `;

        const statement = await conn.prepare(query);

        for (const deposito of depositos) {
            const params = [
                deposito.DTDEPOSITO,
                deposito.DTMOVIMENTOCAIXA,
                deposito.IDEMPRESA,
                deposito.IDUSR,
                deposito.IDCONTABANCO,
                deposito.VRDEPOSITO,
                deposito.DSHISTORIO,
                deposito.NUDOCDEPOSITO,
                deposito.STATIVO,
                deposito.STCANCELADO,
                deposito.IDDEPOSITOLOJA
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

const ensureCorrectTypes = (deposito) => {
    return {
        DTDEPOSITO: new Date(deposito.DTDEPOSITO),  
        DTMOVIMENTOCAIXA: new Date(deposito.DTMOVIMENTOCAIXA),  
        IDEMPRESA: parseInt(deposito.IDEMPRESA) ? parseInt(deposito.IDEMPRESA) : null,  
        IDUSR: parseInt(deposito.IDUSR) ? parseInt(deposito.IDUSR) : null,  
        IDCONTABANCO: parseInt(deposito.IDCONTABANCO) ? parseInt(deposito.IDCONTABANCO) : null,  
        VRDEPOSITO: parseFloat(deposito.VRDEPOSITO),  
        DSHISTORIO: String(deposito.DSHISTORIO || ""),  
        NUDOCDEPOSITO: String(deposito.NUDOCDEPOSITO || ""),  
        DSPATHDOCDEPOSITO: String(deposito.DSPATHDOCDEPOSITO || ""),  
        STATIVO: String(deposito.STATIVO || ""),  
        STCANCELADO: String(deposito.STCANCELADO || ""),  
        IDUSRCACELAMENTO: deposito.IDUSRCACELAMENTO ? parseInt(deposito.IDUSRCACELAMENTO) : null,
        DSMOTIVOCANCELAMENTO: String(deposito.DSMOTIVOCANCELAMENTO || "")  
    };

};

export const createDepositoLoja = async (depositos) => {
    try {
        const query = `
            INSERT INTO "${databaseSchema}"."DEPOSITOLOJA" 
            ( 
                "IDDEPOSITOLOJA", 
                "DTDEPOSITO", 
                "DTMOVIMENTOCAIXA", 
                "IDEMPRESA", 
                "IDUSR", 
                "IDCONTABANCO", 
                "VRDEPOSITO", 
                "DSHISTORIO", 
                "NUDOCDEPOSITO", 
                "DSPATHDOCDEPOSITO", 
                "STATIVO", 
                "STCANCELADO", 
                "IDUSRCACELAMENTO", 
                "DSMOTIVOCANCELAMENTO" 
            ) 
            VALUES(${databaseSchema}.SEQ_DEPOSITOLOJA.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

        const statement = await conn.prepare(query);

        for (const deposito of depositos) {

            const params = [
                deposito.DTDEPOSITO,
                deposito.DTMOVIMENTOCAIXA,
                deposito.IDEMPRESA,
                deposito.IDUSR,
                deposito.IDCONTABANCO,
                deposito.VRDEPOSITO,
                deposito.DSHISTORIO,
                deposito.NUDOCDEPOSITO,
                null,
                deposito.STATIVO,
                deposito.STCANCELADO,
                deposito.IDUSRCACELAMENTO || null,
                deposito.DSMOTIVOCANCELAMENTO || null
            ];
            
            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Cadastro Deposito com sucesso!',
        };
    } catch (e) {
        throw new Error(`Erro ao Cadastrar Deposito: ${e.message}`);
    }
};


