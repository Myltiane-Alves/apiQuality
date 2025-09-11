// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getVendaTotalRecebidoPeriodo = async (idGrupo, idEmpresa, dataPesquisaInicio, dataPesquisaFim, idFuncionario, dsFormaPagamento, dsParcela, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                e.NOFANTASIA,
                cx.DSCAIXA,
                f.NOFUNCIONARIO,
                f.NOLOGIN,
                f.NUCPF,
                TO_VARCHAR(tbv.DTHORAFECHAMENTO, 'DD-mm-YYYY') AS DATAVENDA,
                IFNULL(SUM(tbvp.VALORRECEBIDO), 0) AS VALORRECEBIDO,
                CASE WHEN (tbvp.NPARCELAS IS NULL AND tbvp.DSTIPOPAGAMENTO = 'Rede Crédito') THEN 'Rede Débito'
                ELSE tbvp.DSTIPOPAGAMENTO 
                END AS DSTIPOPAGAMENTO,
                tbvp.DSTIPOPAGAMENTO AS DSPAG,
                tbvp.NOTEF,
                tbvp.NPARCELAS AS NUPARC,
                CASE WHEN (tbvp.NPARCELAS IS NULL) THEN 0
                ELSE tbvp.NPARCELAS 
                END AS NPARCELAS
            FROM 
                "${databaseSchema}".VENDA tbv
                INNER JOIN "${databaseSchema}".CAIXA cx ON tbv.IDCAIXAWEB = cx.IDCAIXAWEB
                INNER JOIN "${databaseSchema}".FUNCIONARIO f ON tbv.IDOPERADOR = f.IDFUNCIONARIO
                INNER JOIN "${databaseSchema}".VENDAPAGAMENTO tbvp ON tbv.IDVENDA = tbvp.IDVENDA
                INNER JOIN "${databaseSchema}".EMPRESA e ON tbv.IDEMPRESA = e.IDEMPRESA
            WHERE 
                1 = 1
                AND tbv.STCANCELADO = 'False'
                AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL)
        `;

        const params = [];

        if (idGrupo > 0) {
            query += ' AND e.IDSUBGRUPOEMPRESARIAL = ?';
            params.push(idGrupo);
        }

        if (idEmpresa > 0) {
            query += ' AND tbv.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (idFuncionario) {
            query += ' AND tbv.IDOPERADOR = ?';
            params.push(idFuncionario);
        }

        if (dsFormaPagamento) {
            query += ' AND UPPER(tbvp.DSTIPOPAGAMENTO) = ?';
            params.push(dsFormaPagamento.toUpperCase());
        }

        if (dsParcela > 0) {
            query += ' AND tbvp.NPARCELAS = ?';
            params.push(dsParcela);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND (tbv.DTHORAFECHAMENTO BETWEEN ? AND ?)';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        query += `
            GROUP BY tbvp.DSTIPOPAGAMENTO, tbvp.NOTEF, tbvp.NPARCELAS, e.NOFANTASIA, cx.DSCAIXA, TO_VARCHAR(tbv.DTHORAFECHAMENTO, 'DD-mm-YYYY'), f.NOFUNCIONARIO, f.NOLOGIN, f.NUCPF
            ORDER BY f.NOFUNCIONARIO
            LIMIT ? OFFSET ?
        `;

        const offset = (page - 1) * pageSize;
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

    
        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result,
        };
    } catch (error) {
        console.error('Erro ao executar a consulta venda forma pagamento:', error);
        throw error;
    }
};
