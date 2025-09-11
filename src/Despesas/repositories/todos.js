
// import conn from '../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getDespesasTodos = async (idDespesas, pageSize, page) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                tbdl.IDDESPESASLOJA,
                tbdl.DTDESPESA,
                TO_VARCHAR(tbdl.DTDESPESA,'YYYY-MM-DD') AS DTDESPESAUPDATE,
                TO_VARCHAR(tbdl.DTDESPESA, 'HH24:MI:SS') AS HRDESPESAUPDATE,
                tbdl.IDEMPRESA,
                tbdl.IDUSR,
                tbdl.IDCATEGORIARECEITADESPESA,
                tbcrd.DSCATEGORIA AS DSCATEGORIARECDESP,
                tbdl.IDFUNCIONARIO,
                tbdl.DTDESCONTOFUNCIONARIO,
                tbdl.VRDESPESA,
                tbdl.DSPAGOA,
                CAST(tbdl.DSHISTORIO AS TEXT) AS DSHISTORICO,
                tbdl.TPNOTA,
                tbdl.NUNOTAFISCAL,
                tbdl.DSPATHDOCFISCAL,
                tbdl.STATIVO,
                tbdl.STCANCELADO,
                tbdl.IDUSRCACELAMENTO,
                tbdl.DSMOTIVOCANCELAMENTO,
                tbe.NORAZAOSOCIAL,
                tbe.NOFANTASIA,
                tbe.NUCNPJ,
                tbf.NOFUNCIONARIO,
                tbf.NUCPF,
                tbf1.NOFUNCIONARIO AS NOMEGERENTE
            FROM 
            "${databaseSchema}".DESPESALOJA tbdl
                LEFT JOIN "${databaseSchema}".EMPRESA tbe ON tbdl.IDEMPRESA = tbe.IDEMPRESA
                LEFT JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbdl.IDFUNCIONARIO = tbf.IDFUNCIONARIO
                LEFT JOIN "${databaseSchema}".FUNCIONARIO tbf1 ON tbdl.IDUSR = tbf1.IDFUNCIONARIO
                LEFT JOIN "${databaseSchema}".CATEGORIARECEITADESPESA tbcrd ON tbdl.IDCATEGORIARECEITADESPESA = tbcrd.IDCATEGORIARECDESP
                WHERE 1 = ?
          `;

        const params = [1];

        if (idDespesas) {
            query += ' AND tbdl.IDDESPESASLOJA = ?';
            params.push(idDespesas);
        }
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
        console.error('Erro ao executar consulta deposito loja empresa', error);
        throw error;
    }
};

export const createDespesaTodos = async (despesas) => {
    try {

        const query = `
            INSERT INTO "${databaseSchema}"."DESPESALOJA" (
            "IDDESPESASLOJA",
            "DTDESPESA",
            "IDEMPRESA",
            "IDUSR",
            "IDCATEGORIARECEITADESPESA",
            "IDFUNCIONARIO",
            "DTDESCONTOFUNCIONARIO",
            "VRDESPESA",
            "DSPAGOA",
            "DSHISTORIO",
            "TPNOTA",
            "NUNOTAFISCAL",
            "DSPATHDOCFISCAL",
            "STATIVO",
            "STCANCELADO",
            "IDUSRCACELAMENTO",
            "DSMOTIVOCANCELAMENTO"
        ) VALUES (
            QUALITY_CONC.SEQ_DESPESALOJA.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
        )
          `

        const statement = await conn.prepare(query);
        
        for(const despesa of despesas) {
            const params = [
                despesa.DTDESPESA,
                despesa.IDEMPRESA,
                despesa.IDUSR,
                despesa.IDCATEGORIARECEITADESPESA,
                despesa.IDFUNCIONARIO,
                despesa.DTDESCONTOFUNCIONARIO,
                despesa.VRDESPESA,
                despesa.DSPAGOA,
                despesa.DSHISTORIO,
                despesa.TPNOTA,
                despesa.NUNOTAFISCAL,
                despesa.DSPATHDOCFISCAL,
                despesa.STATIVO,
                despesa.STCANCELADO,
                despesa.IDUSRCACELAMENTO,
                despesa.DSMOTIVOCANCELAMENTO
            ];

            await statement.exec(params);
        }

        conn.commit();
        return {
            status: 'success',
            message: 'Despesas cadastradas com sucesso'
        };
    } catch (error) {
        console.error('Erro ao Cadastrar Despesas', error);
        throw error;
    }
};