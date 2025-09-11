// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getAlterarVendaPagamento = async (idVenda, byId, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(page) : 1000;

        let query = ` SELECT IDVENDAPAGAMENTO, IDVENDA, NITEM, TPAG, DSTIPOPAGAMENTO, VALORRECEBIDO, VALORDEDUZIDO, VALORLIQUIDO, 
            DTPROCESSAMENTO, DTVENCIMENTO, IFNULL(NPARCELAS,0)AS NPARCELAS, NOTEF, NOAUTORIZADOR, NOCARTAO, NUOPERACAO, NSUTEF, NSUAUTORIZADORA, NUAUTORIZACAO 
            FROM  
            "${databaseSchema}".VENDAPAGAMENTO  
            WHERE  
            1 = ?  
        `;

        const params = [];

        if(byId) {
            query += ' AND IDVENDAPAGAMENTO = ?';
            params.push(byId);
        }

        if(idVenda) {
            query += ' AND IDVENDA = ?';
            params.push(idVenda);
        }

        query += 'ORDER BY IDVENDAPAGAMENTO';

        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page,
            pageSize,
            rows: result.length,
            data: result
        };

    } catch (error) {
        console.error('Erro ao executar a consulta venda forma pagamento:', error);
        throw error;
    }
};

export const updateAlterarVendaPagamento = async (vendas) => {
    try {
        let query = `UPDATE "${databaseSchema}"."VENDAPAGAMENTO" SET 
            "STCANCELADO" = ?, 
            "DTULTIMAALTERACAO" = ?, 
            "IDFUNCIONARIOCANCELA" = ?, 
            "TXTMOTIVOCANCELA" = ? 
            WHERE "IDVENDA" = ?
        `;
        const statement = await conn.prepare(query);

        for(const venda of vendas) {
            const params = [
                venda.STCANCELADO,
                venda.DTULTIMAALTERACAO,
                venda.IDFUNCIONARIOCANCELA,
                venda.TXTMOTIVOCANCELA,
                venda.IDVENDA
            ]
            await statement.exec(params);
        }
        
        conn.commit();
        return {
            status: 'success',
            message: 'Venda forma pagamento alterada com sucesso'
        }
    } catch (error) {
        console.error('Erro ao executar a alteração da venda forma pagamento:', error);
        throw error;
    }
}

export const createAlterarVendaPagamento = async (dados) => {
    try {
        const query = `INSERT INTO "${databaseSchema}"."VENDAPAGAMENTO" (
            "IDVENDAPAGAMENTO", 
            "IDVENDA", 
            "NITEM", 
            "TPAG", 
            "DSTIPOPAGAMENTO", 
            "VALORRECEBIDO", 
            "VALORDEDUZIDO", 
            "VALORLIQUIDO", 
            "DTPROCESSAMENTO", 
            "DTVENCIMENTO", 
            "NPARCELAS", 
            "NOTEF", 
            "NOAUTORIZADOR", 
            "NOCARTAO", 
            "NUOPERACAO", 
            "NSUTEF", 
            "NSUAUTORIZADORA", 
            "NUAUTORIZACAO", 
            "STCANCELADO", 
            "IDFUNCIONARIO", 
            "DTULTIMAALTERACAO"
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now())`;

        const statement = await conn.prepare(query);

        for(const dado of dados) {
            const params = [
                dado.IDVENDAPAGAMENTO,
                dado.IDVENDA,
                dado.NITEM,
                dado.TPAG,
                dado.DSTIPOPAGAMENTO,
                dado.VALORRECEBIDO,
                dado.VALORDEDUZIDO || 0.0,
                dado.VALORLIQUIDO || 0.0,
                dado.DTPROCESSAMENTO,
                dado.DTVENCIMENTO,
                dado.NPARCELAS,
                dado.NOTEF,
                dado.NOAUTORIZADOR,
                dado.NOCARTAO,
                dado.NUOPERACAO,
                dado.NSUTEF,
                dado.NSUAUTORIZADORA,
                dado.NUAUTORIZACAO,
                dado.STCANCELADO,
                dado.IDFUNCIONARIO
            ]
           console.log('create alterar venda pagamento', params);
            await statement.exec(params);
        }
        
        conn.commit();
        return {
            status: 'success',
            message: 'Venda forma pagamento criada com sucesso'
        }
    } catch (error) {
        console.error('Erro ao executar a criação forma pagamento:', error);
        throw error;
    }
}