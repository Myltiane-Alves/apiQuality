// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getLinhasDoTotalVendido = async (numeroMatricula, idEmpresa, dataPesquisaInicio, dataPesquisaFim) => {
    try {
        const query = `
            SELECT 
            SUM(tbvd.VRTOTALLIQUIDO) AS TOTALVENDIDOVENDEDOR, 
            SUM(tbvd.QTD) AS QTDVENDIDOVENDEDOR 
            FROM 
            "${databaseSchema}".VENDADETALHE tbvd 
            LEFT JOIN "${databaseSchema}".VENDA tbv ON tbvd.IDVENDA = tbv.IDVENDA 
            WHERE 
            tbvd.VENDEDOR_MATRICULA = ? 
            AND tbv.STCANCELADO = 'False'  
            AND tbvd.STCANCELADO = 'False'  
            AND tbv.IDEMPRESA = ? 
            AND (tbv.DTHORAFECHAMENTO BETWEEN ? AND ?)
        `;

        const params = [numeroMatricula, idEmpresa, `${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`];
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        if (!Array.isArray(result) || result.length === 0) {
            return [];
        }

        return [{
            TOTALVENDIDOVENDEDOR: result[0].TOTALVENDIDOVENDEDOR || 0,
            QTDVENDIDOVENDEDOR: result[0].QTDVENDIDOVENDEDOR || 0
        }];
    } catch (error) {
        console.error('Erro ao executar a consulta de vendas:', error);
        throw error;
    }
};

export const getLinhasDoTotalVoucher = async (numeroMatricula, idEmpresa, dataPesquisaInicio, dataPesquisaFim) => {
    try {
        const query = ` 
            SELECT DISTINCT 
                tbv.IDVENDA,
                tbv.VRRECVOUCHER AS TOTALVOUCHERVENDEDOR 
            FROM 
                "${databaseSchema}".VENDADETALHE tbvd 
                INNER JOIN "${databaseSchema}".VENDA tbv ON tbvd.IDVENDA = tbv.IDVENDA 
            WHERE 
                tbvd.VENDEDOR_MATRICULA = ?
                AND tbv.STCANCELADO = 'False'  
                AND tbvd.STCANCELADO = 'False'  
                AND tbv.VRRECVOUCHER > 0 
                AND tbv.IDEMPRESA = ? 
                AND (tbv.DTHORAFECHAMENTO BETWEEN ? AND ?)
        `;

        const params = [numeroMatricula, idEmpresa, `${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`];
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        let vrTotalVoucher = 0;
        for (const det of result) {
            vrTotalVoucher += parseFloat(det.TOTALVOUCHERVENDEDOR);
        }

        return vrTotalVoucher;
    } catch (error) {
        console.error('Erro ao executar a consulta de vouchers:', error);
        throw error;
    }
};

export const getVendaVendedor = async (idEmpresa, byId, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = `
            SELECT 
                DISTINCT tbvd.VENDEDOR_MATRICULA, 
                TRIM(tbvd.VENDEDOR_NOME) AS VENDEDOR_NOME, 
                tbvd.VENDEDOR_CPF, 
                TBE.IDEMPRESA, 
                TBE.NOFANTASIA 
            FROM 
                "${databaseSchema}".VENDADETALHE tbvd 
                INNER JOIN "${databaseSchema}".VENDA tbv ON tbvd.IDVENDA = tbv.IDVENDA 
                INNER JOIN "${databaseSchema}"."EMPRESA" TBE ON tbv.IDEMPRESA = TBE.IDEMPRESA 
            WHERE 
                tbv.STCANCELADO = 'False' 
                AND tbvd.STCANCELADO = 'False'
        `;

        const params = [];

        if (byId) {
            query += ' AND tbv.IDVENDA = ?';
            params.push(byId);
        }

        if (idEmpresa > 0) {
            query += ' AND tbv.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND (tbv.DTHORAFECHAMENTO BETWEEN ? AND ?)';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        query += `
            GROUP BY 
                tbvd.VENDEDOR_MATRICULA, 
                tbvd.VENDEDOR_NOME, 
                tbvd.VENDEDOR_CPF, 
                TBE.IDEMPRESA,
                TBE.NOFANTASIA
            ORDER BY 
                TBE.IDEMPRESA, 
                TBE.NOFANTASIA, 
                tbvd.VENDEDOR_MATRICULA 
        `;

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        const data = await Promise.all(result.map(async (registro) => {
            try {
                const totalVendido = await getLinhasDoTotalVendido(
                    registro.VENDEDOR_MATRICULA, 
                    registro.IDEMPRESA, 
                    dataPesquisaInicio, 
                    dataPesquisaFim
                );

                const totalVoucher = await getLinhasDoTotalVoucher(
                    registro.VENDEDOR_MATRICULA, 
                    registro.IDEMPRESA, 
                    dataPesquisaInicio, 
                    dataPesquisaFim
                );

                return {
                    vendedor: {
                        VENDEDOR_MATRICULA: registro.VENDEDOR_MATRICULA,
                        VENDEDOR_NOME: registro.VENDEDOR_NOME,
                        VENDEDOR_CPF: registro.VENDEDOR_CPF,
                        NOFANTASIA: registro.NOFANTASIA
                    },
                    totalVendido: totalVendido,
                    Vouchers: totalVoucher
                };
            } catch (error) {
                console.error('Erro ao processar dados do vendedor:', error);
                throw error;
            }
        }));

        return {
            page,
            pageSize,
            rows: data.length,
            data,
        };
    } catch (error) {
        console.error('Erro ao executar a consulta:', error);
        throw error;
    }
};
