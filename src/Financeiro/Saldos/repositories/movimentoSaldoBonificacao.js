// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getMovimentoSaldoBonificacaoById = async (idFuncionario, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = ` 
            SELECT 
                tbmsb.IDMOVIMENTOSALDO,
                tbmsb.IDFUNCIONARIO,
                tbf.NOFUNCIONARIO,
                tbmsb.IDFUNCIONARIORESP,
                IFNULL(tbmsb.IDVENDA,'-') AS IDVENDA,
                tbmsb.TIPOMOVIMENTO,
                tbmsb.VRANTERIOR,
                tbmsb.VRMOVIMENTO,
                tbmsb.VRATUAL,
                TO_VARCHAR(tbmsb.DTMOVIMENTO,'DD-MM-YYYY HH24:MI:SS') AS DTMOVIMENTO,
                tbmsb.OBSERVACAO,
                tbmsb.NUCPF
            FROM 
                "${databaseSchema}".MOVIMENTOSALDOBONIFICACAO tbmsb
                INNER JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbf.IDFUNCIONARIO = tbmsb.IDFUNCIONARIO 
            WHERE 
                1 = ?
        `;

        const params = [1];


        if (idFuncionario) {
            query += ' AND tbmsb.IDFUNCIONARIO  = ?';
            params.push(idFuncionario);
        }

        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        const statement = conn.prepare(query);
        const result = statement.exec(params);

        return result;
    } catch (error) {
        console.error('Error executing query', error);
        throw error;
    }
};

export const postMovimentoSaldoBonificacao = async (bodyJson) => {
    try {
        const queryValor = `
            SELECT TOP 1 VRATUAL, DTMOVIMENTO
            FROM "${databaseSchema}".MOVIMENTOSALDOBONIFICACAO
            WHERE IDFUNCIONARIO = ?
            ORDER BY DTMOVIMENTO DESC
        `;

        const queryCPF = `
            SELECT NUCPF
            FROM "${databaseSchema}".FUNCIONARIO
            WHERE IDFUNCIONARIO = ?
        `;

        const query = `
            INSERT INTO "${databaseSchema}".MOVIMENTOSALDOBONIFICACAO 
            (IDMOVIMENTOSALDO, IDFUNCIONARIO, IDFUNCIONARIORESP, IDVENDA, TIPOMOVIMENTO, VRANTERIOR, VRMOVIMENTO, VRATUAL, DTMOVIMENTO, OBSERVACAO, NUCPF)
            VALUES (${databaseSchema}.SEQ_MOVIMENTOSALDOBONIFICACAO.NEXTVAL, ?, ?, ?, ?, ?, ?, ?, now(), ?, ?)
        `;

        const pStmt = conn.prepare(query);

        for (const registro of bodyJson) {
            const linhaValor = conn.prepare(queryValor).exec([registro.IDFUNCIONARIO]);
            const linhaCpf = conn.prepare(queryCPF).exec([registro.IDFUNCIONARIO]);

            let valorAnterior = 0;
            let valorAtual = 0;

            if (linhaValor.length > 0) {
                valorAnterior = parseFloat(linhaValor[0].VRATUAL);

                if (registro.TIPOMOVIMENTO === 'Credito') {
                    valorAtual = registro.VRMOVIMENTO + valorAnterior;
                } else {
                    valorAtual = valorAnterior - registro.VRMOVIMENTO;
                }
            } else {
                valorAtual = registro.VRMOVIMENTO;
            }

            const params = [
                registro.IDFUNCIONARIO,
                registro.IDFUNCIONARIORESP,
                registro.IDVENDA,
                registro.TIPOMOVIMENTO,
                valorAnterior,
                registro.VRMOVIMENTO,
                valorAtual,
                registro.OBSERVACAO,
                linhaCpf[0].NUCPF
            ];

            pStmt.exec(params);
        }

        pStmt.close();
        conn.commit();

        return {
            msg: "Bonificação ao Funcionario Cadastrada realizada com sucesso!"
        };
    } catch (error) {
        conn.rollback();
        console.error('Error executing query', error);
        throw error;
    } finally {
        conn.close();
    }
};