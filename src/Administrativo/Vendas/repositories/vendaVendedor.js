// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getLinhasDoTotalVendido = async (numeroMatricula, idEmpresa, dataPesquisaInicio, dataPesquisaFim) => {
    try {
        let query = ` 
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

      
        return result.length > 0 ? result[0] : { TOTALVENDIDOVENDEDOR: 0, QTDVENDIDOVENDEDOR: 0 };
    } catch (error) {
        console.error('Erro ao executar a consulta de vendas:', error);
        throw error;
    }
};

export const getLinhasDoTotalVoucher = async (numeroMatricula, idEmpresa, dataPesquisaInicio, dataPesquisaFim) => {
    try {
        let query = ` 
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

export const getVendaVendedor = async (idGrupo, idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize, byId) => {
    page = page && !isNaN(page) ? parseInt(page) : 1;
    pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

    let query = `
        SELECT 
            DISTINCT tbvd.VENDEDOR_MATRICULA, 
            tbf.NOLOGIN, 
            TRIM(tbvd.VENDEDOR_NOME) AS VENDEDOR_NOME, 
            TRIM(tbvd.VENDEDOR_CPF) AS VENDEDOR_CPF, 
            TBE.IDEMPRESA, 
            TBE.NOFANTASIA 
        FROM 
            "${databaseSchema}".VENDADETALHE tbvd 
            INNER JOIN "${databaseSchema}".FUNCIONARIO tbf ON tbvd.VENDEDOR_MATRICULA = tbf.IDFUNCIONARIO 
            INNER JOIN "${databaseSchema}".VENDA tbv ON tbvd.IDVENDA = tbv.IDVENDA 
            INNER JOIN "${databaseSchema}"."EMPRESA" TBE on tbv.IDEMPRESA=TBE.IDEMPRESA 
        WHERE 
            1 = 1 
            AND tbv.STCANCELADO = 'False' 
            AND tbvd.STCANCELADO = 'False'
    `;

    const params = [];

    if (byId) {
        query += ' AND tbv.IDVENDA = ?';
        params.push(byId);
    }

    if (idGrupo > 0) {
        query += ' AND TBE.IDGRUPOEMPRESARIAL = ?';
        params.push(idGrupo);
    }

    if (idEmpresa > 0) {
        query += ' AND tbv.IDEMPRESA IN (?)';
        params.push(idEmpresa);
    }

    if (dataPesquisaInicio && dataPesquisaFim) {
        query += ' AND (tbv.DTHORAFECHAMENTO BETWEEN ? AND ?)';
        params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
    }

    query += `
        GROUP BY 
            tbvd.VENDEDOR_MATRICULA, 
            tbf.NOLOGIN, 
            tbvd.VENDEDOR_NOME, 
            tbvd.VENDEDOR_CPF, 
            TBE.IDEMPRESA, 
            TBE.NOFANTASIA 
        ORDER BY 
            TBE.IDEMPRESA, 
            TBE.NOFANTASIA, 
            tbvd.VENDEDOR_MATRICULA
    `;

    try {
        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        const totalRows = result.length;
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalRows);
        const paginatedResult = result.slice(startIndex, endIndex);

        const data = await Promise.all(paginatedResult.map(async (registro) => {
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
                        VENDEDOR_MATRICULA: registro.NOLOGIN,
                        VENDEDOR_NOME: registro.VENDEDOR_NOME,
                        VENDEDOR_CPF: registro.VENDEDOR_CPF,
                        NOFANTASIA: registro.NOFANTASIA
                    },
                    totalVendido: totalVendido,
                    Vouchers: totalVoucher
                };
            } catch (error) {
                console.error('Erro ao processar dados do vendedor:', registro.NOLOGIN, error);
                throw error;
            }
        }));

        return {
            data,
            rows: totalRows,
            page,
            pageSize
        };
    } catch (error) {
        console.error('Erro ao executar a consulta:', error);
        throw error;
    }
};


export const updateVendaVendedor = async (vendas) => {

    try {
        let matFuncionario = '';
        let nomeFuncionario = '';
        let cpfFuncionario = '';
    
        if(vendas.IDVENDEDOR === 0) {
            matFuncionario = 0;
            nomeFuncionario = 'LOJA';
            cpfFuncionario = '00000000000';
        } else {
            const queryFuncionario = ` SELECT IDFUNCIONARIO, NOFUNCIONARIO, NUCPF 
              FROM  
                "${databaseSchema}".FUNCIONARIO  
              WHERE  
                ID = ?  
              ORDER BY ID  `;
            const statement = await conn.prepare(queryFuncionario);
            const result = await statement.exec([vendas.IDVENDEDOR]);
            return result;
        }
        const query = `
           UPDATE "${databaseSchema}"."VENDADETALHE" SET 
              "VENDEDOR_MATRICULA" = ?, 
              "VENDEDOR_NOME" = ?, 
              "VENDEDOR_CPF" = ? 
              WHERE "IDVENDADETALHE" = ?
        `;

        const statement = await conn.prepare(query);

        for (const venda of vendas) {
            const params = [
                venda.IDVENDADETALHE,
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


// export const updateVendaVendedor = async (vendas) => {
//     try {
//         let matFuncionario = '';
//         let nomeFuncionario = '';
//         let cpfFuncionario = '';

//         // Se o ID do vendedor for 0, atribuir valores padrão
//         if (vendas.IDVENDEDOR === 0) {
//             matFuncionario = 0;
//             nomeFuncionario = 'LOJA';
//             cpfFuncionario = '00000000000';
//         } else {
//             // Buscar os dados do funcionário na tabela FUNCIONARIO com base no IDVENDEDOR
//             const queryFuncionario = `
//                 SELECT IDFUNCIONARIO, NOFUNCIONARIO, NUCPF 
//                 FROM "${databaseSchema}".FUNCIONARIO 
//                 WHERE ID = ? 
//                 ORDER BY ID
//             `;
//             const statementFunc = await conn.prepare(queryFuncionario);
//             const resultFunc = await statementFunc.exec([vendas.IDVENDEDOR]);

//             // Se houver resultado, atribuir os valores do funcionário
//             if (resultFunc.length > 0) {
//                 matFuncionario = parseInt(resultFunc[0].IDFUNCIONARIO);
//                 nomeFuncionario = resultFunc[0].NOFUNCIONARIO;
//                 cpfFuncionario = resultFunc[0].NUCPF;
//             } else {
//                 throw new Error("Vendedor não encontrado");
//             }
//         }

//         // Preparar a query de atualização de detalhes da venda
//         const queryUpdate = `
//             UPDATE "${databaseSchema}"."VENDADETALHE" SET 
//                 "VENDEDOR_MATRICULA" = ?, 
//                 "VENDEDOR_NOME" = ?, 
//                 "VENDEDOR_CPF" = ? 
//             WHERE "IDVENDADETALHE" = ?
//         `;
//         const statementUpdate = await conn.prepare(queryUpdate);

//         // Iterar sobre as vendas e realizar a atualização
//         for (const vendaDetalhe of vendas.IDVENDADETALHE) {
//             const params = [matFuncionario, nomeFuncionario, cpfFuncionario, vendaDetalhe];
//             await statementUpdate.exec(params);
//         }

//         // Confirmar a transação
//         await conn.commit();

//         return {
//             status: 'success',
//             message: 'Atualização realizada com sucesso!',
//         };
//     } catch (e) {
//         // Tratar erros
//         throw new Error(`Erro ao atualizar vendas: ${e.message}`);
//     }
// };
