// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

// Bloco Fecha Balanço
export const getBlocoFecharBalanco = async (alista, pIdResumoBalanco, pDataAbertura) => {
    const connection = await conn.getConnection();
    try {
        for (let i = 0; i < alista.length; i++) {
            const { IDPRODUTO, QTD, IDEMPRESA } = alista[i];
            
            
            const qryUpdInv = `
                UPDATE "${databaseSchema}".INVENTARIOMOVIMENTO
                SET STATIVO = 'False', DTBALANCO = ?
                WHERE IDEMPRESA = ? AND IDPRODUTO = ? AND STATIVO = 'True'
            `;
            await connection.execute(qryUpdInv, [pDataAbertura, IDEMPRESA, IDPRODUTO]);

            
            const qryInsInv = `
                INSERT INTO "${databaseSchema}".INVENTARIOMOVIMENTO (
                    IDINVMOVIMENTO, IDEMPRESA, DTMOVIMENTO, IDPRODUTO, QTDINICIO, QTDENTRADA, QTDENTRADAVOUCHER, 
                    QTDSAIDA, QTDSAIDATRANSFERENCIA, QTDRETORNOAJUSTEPEDIDO, QTDFINAL, QTDAJUSTEBALANCO, STATIVO
                ) VALUES (
                    QUALITY_CONC.SEQ_INVENTARIOMOVIMENTO.NEXTVAL, ?, CURRENT_TIMESTAMP, ?, ?, 0, 0, 0, 0, 0, ?, ?, 'True'
                )
            `;
            await connection.execute(qryInsInv, [
                IDEMPRESA, IDPRODUTO, QTD, QTD, QTD, QTD
            ]);
        }

        await connection.commit();

        return {
            msg: "Inclusão de Bloco Realizada com Sucesso!"
        };
    } catch (error) {
        await connection.rollback();
        console.error('Erro ao executar fnBlocoFecharBalanco:', error);
        throw error;
    } finally {
        await connection.release();
    }
};

// Fecha Balanço
export const getFechaBalanco = async (pIdResumoBalanco, pDataAbertura) => {
    const connection = await conn.getConnection();
    const ncorte = 5000;

    try {
        
        const query = `
            SELECT 
                IDPRODUTO, IDRESUMOBALANCO, IDEMPRESA, QTD, QTDFINAL, QTDFALTA, QTDSOBRA, PRECOVENDA 
            FROM 
                "${databaseSchema}".PREVIABALANCO 
            WHERE 
                IDRESUMOBALANCO = ?
        `;

        const [listar] = await connection.execute(query, [pIdResumoBalanco]);

        for (let ct = 0; ct < listar.length; ct += ncorte) {
            const chunk = listar.slice(ct, ct + ncorte);
            await getBlocoFecharBalanco(chunk, pIdResumoBalanco, pDataAbertura); 
        }

        return {
            msg: "Fechamento de Balanço Realizado com Sucesso!"
        };
    } catch (error) {
        console.error('Erro ao executar fnFechaBalanco:', error);
        throw error;
    } finally {
        await connection.release();
    }
};

// SAÍDA => Desconto e Venda de Caixa
export const getSaidaVenda = async (idEmpresa, dataAbertura, dataEstoqueAnterior) => {
    try {
        let query = `
              SELECT 
                IFNULL(SUM("NFE_INFNFE_TOTAL_ICMSTOT_VDESC"), 0) AS VLRDESCONTOCAIXA,
                IFNULL(SUM("NFE_INFNFE_TOTAL_ICMSTOT_VNF"), 0) AS VLRVENDACAIXA
            FROM 
                "${databaseSchema}".VENDA 
            WHERE 
                "IDEMPRESA" = ? 
                AND "STCANCELADO" = 'False' 
                AND "DTHORAFECHAMENTO" BETWEEN ? AND ?
       `;
        const params = [idEmpresa, dataAbertura, dataEstoqueAnterior];

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        if(!Array.isArray(result) || result.length === 0) return [];
       
        const data = result.map((det) => ({
            docLine: {
                "VLRDESCONTOCAIXA": det.VLRDESCONTOCAIXA,
			    "VLRVENDACAIXA": det.VLRVENDACAIXA
            }
        }))

        return  data;

    } catch (error) {
        console.error('Erro ao executar a consulta Saida Venda:', error);
        throw error;
    }
}

// SAÍDA => Devolução Mercadoria
export const getSaidaDevolucaoMercadoria = async (idEmpresa, dataAbertura, dataEstoqueAnterior) => {
    try {
        let query = `
            SELECT 
                -- IFNULL(SUM("Saidas" * "PrecoUnitario"), 0) AS VLRTOTALDEVOLUCAO 
                IFNULL(SUM("Saidas" * "PrecoVendaNaData"), 0) AS VLRTOTALDEVOLUCAO,
                IFNULL(SUM("Saidas"), 0) AS QTDTOTALDEVOLUCAO 
            FROM 
                "SBO_GTO_PRD".IS_ENT_SAI_DETALHADO 
            WHERE 
                "Cod.Filial" = ? 
                -- AND "Origem" = 'Dev. Nota de Entrada' 
                AND "Origem" = 'Nota de Saida' 
                AND "StatusTransferencia" <> 'Ajuste de Falta' 
                AND "Data" BETWEEN ? AND '?'
        `;
        const params = [idEmpresa,  dataEstoqueAnterior, dataAbertura,];

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        if(!Array.isArray(result) || result.length === 0) return [];
       
        const data = result.map((det) => ({
            docLine: {
               "VLRTOTALDEVOLUCAO": det.VLRTOTALDEVOLUCAO,
			    "QTDTOTALDEVOLUCAO": det.QTDTOTALDEVOLUCAO
            }
        }))

        return  data;

    } catch (error) {
        console.error('Erro ao executar a consulta Saida Devolução Mercadoria:', error);
        throw error;
    }
}

// SAÍDA => Falta de Mercadoria
export const getSaidaFaltaMercadoria = async (idEmpresa, dataAbertura, dataEstoqueAnterior) => {
    try {

        let query = `
            SELECT 
                -- IFNULL(SUM("Saidas" * "PrecoUnitario"), 0) AS VLRTOTALFALTA 
                IFNULL(SUM("Saidas" * "PrecoVendaNaData"), 0) AS VLRTOTALFALTA 
            FROM 
                "SBO_GTO_PRD".IS_ENT_SAI_DETALHADO 
            WHERE 
                "Cod.Filial" = ? 
                AND "Origem" = 'Nota de Saida' 
                AND "StatusTransferencia" = 'Ajuste de Falta' 
                AND "Data" BETWEEN ? AND ?
        `;
        const params = [idEmpresa,  dataEstoqueAnterior, dataAbertura,];

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        if(!Array.isArray(result) || result.length === 0) return [];
       
        const data = result.map((det) => ({
            docLine: {
               "VLRTOTALFALTA": det.VLRTOTALFALTA
            }
        }))

        return  data;

    } catch (error) {
        console.error('Erro ao executar a consulta Saida Devolução Mercadoria:', error);
        throw error;
    }
}

// SAÍDA => Baixa de Mercadoria
export const getSaidaBaixaMercadoria = async (idEmpresa, dataAbertura, dataEstoqueAnterior) => {
    try {

        let query = `
            SELECT 
                IFNULL(SUM(VALORDIFERENCA), 0) AS VLRTOTALBAIXA 
            FROM 
                "${databaseSchema}".DETALHEALTERACAOPRECO 
            WHERE 
                IDRESUMOALTERACAOPRECO IN (
                    SELECT IDRESUMOALTERACAOPRECO 
                    FROM "${databaseSchema}".RESUMOALTERACAOPRECO 
                    WHERE 
                        IDFILIAL = ? 
                        AND DATAALTERACAO BETWEEN ? AND ? 
                        AND STCONCLUIDO = 'True' 
                        AND STCANCELADO = 'False'
                ) 
                AND VALORDIFERENCA < 0
        `;
        const params = [idEmpresa,  dataEstoqueAnterior, dataAbertura,];

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        if(!Array.isArray(result) || result.length === 0) return [];
       
        const data = result.map((det) => ({
            docLine: {
               "VLRTOTALBAIXA": det.VLRTOTALBAIXA
            }
        }))

        return  data;

    } catch (error) {
        console.error('Erro ao executar a consulta Saida Devolução Mercadoria:', error);
        throw error;
    }
}

// ENTRADA => Voucher
export const getEntradaVoucher = async (idEmpresa, dataAbertura, dataEstoqueAnterior) => {
    try {

        let query = `
            SELECT 
                IFNULL(SUM(VRVOUCHER), 0) AS VLRTOTALVOUCHER 
            FROM 
                "${databaseSchema}".RESUMOVOUCHER 
            WHERE 
                IDEMPRESAORIGEM = ? 
                AND STCANCELADO = 'False' 
                AND DTINVOUCHER BETWEEN ? AND ?
        `;
        const params = [idEmpresa,  dataEstoqueAnterior, dataAbertura,];

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        if(!Array.isArray(result) || result.length === 0) return [];
       
        const data = result.map((det) => ({
            docLine: {
               "VLRTOTALVOUCHER": det.VLRTOTALVOUCHER
            }
        }))

        return  data;

    } catch (error) {
        console.error('Erro ao executar a consulta Entrada voucher:', error);
        throw error;
    }
}

// ENTRADA => Alta de Mercadoria
export const getEntradaAltaMercadoria = async (idEmpresa, dataAbertura, dataEstoqueAnterior) => {
    try {

        let query = `
            SELECT 
                IFNULL(SUM(VALORDIFERENCA), 0) AS VLRTOTALALTA 
            FROM 
                "${databaseSchema}".DETALHEALTERACAOPRECO 
            WHERE 
                IDRESUMOALTERACAOPRECO IN (
                    SELECT IDRESUMOALTERACAOPRECO 
                    FROM "${databaseSchema}".RESUMOALTERACAOPRECO 
                    WHERE 
                        IDFILIAL = ? 
                        AND DATAALTERACAO BETWEEN ? AND ? 
                        AND STCONCLUIDO = 'True' 
                        AND STCANCELADO = 'False'
                ) 
                AND VALORDIFERENCA > 0
        `;
        const params = [idEmpresa,  dataEstoqueAnterior, dataAbertura,];

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        if(!Array.isArray(result) || result.length === 0) return [];
       
        const data = result.map((det) => ({
            docLine: {
               "VLRTOTALALTA": det.VLRTOTALALTA
            }
        }))

        return  data;

    } catch (error) {
        console.error('Erro ao executar a consulta Entrada Alta Mercadoria:', error);
        throw error;
    }
}

// ENTRADA => Sobra de Mercadoria
export const getSobraMercadoria = async (idEmpresa, dataAbertura, dataEstoqueAnterior) => {
    try {

        let query = `
            SELECT 
                -- IFNULL(SUM("Saidas" * "PrecoUnitario"), 0) AS VLRTOTALSOBRA 
                IFNULL(SUM("Saidas" * "PrecoVendaNaData"), 0) AS VLRTOTALSOBRA 
            FROM 
                "SBO_GTO_PRD".IS_ENT_SAI_DETALHADO 
            WHERE 
                "Cod.Filial" = ? 
                AND "Origem" = 'Nota de Entrada' 
                AND "StatusTransferencia" = 'Ajuste de Sobra' 
                AND "Data" BETWEEN ? AND ?
        `;
        const params = [idEmpresa,  dataEstoqueAnterior, dataAbertura,];

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        if(!Array.isArray(result) || result.length === 0) return [];
       
        const data = result.map((det) => ({
            docLine: {
               "VLRTOTALSOBRA": det.VLRTOTALSOBRA
            }
        }))

        return  data;

    } catch (error) {
        console.error('Erro ao executar a consulta Entrada Alta Mercadoria:', error);
        throw error;
    }
}

// ENTRADA => Mercadorias Recebidas (Romaneios)
export const getEntradaMercadoriaRecebida = async (idEmpresa, dataAbertura, dataEstoqueAnterior) => {
    try {

        let query = `
            SELECT 
                -- IFNULL(SUM("Entradas" * "PrecoUnitario"), 0) AS VLRTOTALENTRADA 
                IFNULL(SUM("Entradas" * "PrecoVendaNaData"), 0) AS VLRTOTALENTRADA,
                IFNULL(SUM("Entradas"), 0) AS QTDTOTALENTRADA 
            FROM 
                "SBO_GTO_PRD".IS_ENT_SAI_DETALHADO 
            WHERE 
                "Cod.Filial" = ? 
                AND "Origem" = 'Nota de Entrada' 
                AND "StatusTransferencia" <> 'Ajuste de Sobra' 
                AND "Data" BETWEEN ? AND ?
        `;
        const params = [idEmpresa,  dataEstoqueAnterior, dataAbertura,];

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        if(!Array.isArray(result) || result.length === 0) return [];
       
        const data = result.map((det) => ({
            docLine: {
               "VLRTOTALENTRADA": det.VLRTOTALENTRADA,
			    "QTDTOTALENTRADA": det.QTDTOTALENTRADA
            }
        }))

        return  data;

    } catch (error) {
        console.error('Erro ao executar a consulta Entrada Mercadoria Recebida:', error);
        throw error;
    }
}


export const getPrestacaoContasBalanco = async (
    idResumoBalanco,
    page,
    pageSize
) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        var query = `
            SELECT 
            TO_VARCHAR(rb.DTABERTURA,'YYYY-MM-DD HH24:MI:SS') AS DTABERTURA,
            TO_VARCHAR(rb.DTABERTURA,'DD/MM/YYYY') AS DTABERTURAFORMATADA,
            IFNULL(rb.VRESTOQUEANTERIOR, 0) AS VRESTOQUEANTERIOR,
            IFNULL(TO_VARCHAR(rb.DTESTOQUEANTERIOR,'YYYY-MM-DD HH24:MI:SS'), '') AS DTESTOQUEANTERIOR,
            IFNULL(TO_VARCHAR(rb.DTESTOQUEANTERIOR,'DD/MM/YYYY'), 'Não Informado') AS DTESTOQUEANTERIORFORMATADA,
            rb.IDEMPRESA,
            IFNULL(rb.VRESTOQUEATUAL, 0) AS VRESTOQUEATUAL,
            e.NOFANTASIA,
            rb.IDRESUMOBALANCO,
            rb.STCONCLUIDO
            FROM "${databaseSchema}".RESUMOBALANCO rb
            INNER JOIN "${databaseSchema}".EMPRESA e ON e.IDEMPRESA = rb.IDEMPRESA
            WHERE 1 = ?
        `;

        const params = [];

        if(idResumoBalanco) {
            query += 'AND rb.IDRESUMOBALANCO = ? ';
            params.push(idResumoBalanco);
        }

        const offset = (page - 1) * pageSize;
        query += 'LIMIT ? OFFSET ? ';
        params.push(pageSize, offset);

      
        const result = await conn.execute(query, [1, ...params]);
        const rows = Array.isArray(result) ? result : [];

        const data = await Promise.all(rows.map(async (registro) => ({
            listagem: {
                "DTABERTURA": registro.DTABERTURA,
                "DTABERTURAFORMATADA": registro.DTABERTURAFORMATADA,
                "VRESTOQUEANTERIOR": registro.VRESTOQUEANTERIOR,
                "DTESTOQUEANTERIOR": registro.DTESTOQUEANTERIOR,
                "DTESTOQUEANTERIORFORMATADA": registro.DTESTOQUEANTERIORFORMATADA,
                "VRESTOQUEATUAL": registro.VRESTOQUEATUAL,
                "NOFANTASIA": registro.NOFANTASIA,
                "IDEMPRESA": registro.IDEMPRESA,
                "IDRESUMOBALANCO": registro.IDRESUMOBALANCO,
                "STCONCLUIDO": registro.STCONCLUIDO
            },
            saivenda: await getSaidaVenda(registro.IDEMPRESA, registro.DTABERTURA, registro.DTESTOQUEANTERIOR),
            saidevmer: await getSaidaDevolucaoMercadoria(registro.IDEMPRESA, registro.DTABERTURA, registro.DTESTOQUEANTERIOR),
            saifalmer: await getSaidaFaltaMercadoria(registro.IDEMPRESA, registro.DTABERTURA, registro.DTESTOQUEANTERIOR),
            saibaimer: await getSaidaBaixaMercadoria(registro.IDEMPRESA, registro.DTABERTURA, registro.DTESTOQUEANTERIOR),
            entvoucher: await getEntradaVoucher(registro.IDEMPRESA, registro.DTABERTURA, registro.DTESTOQUEANTERIOR)
        })))

        return  data;

    } catch (error) {
        console.error('Erro ao executar a consulta Prestação de Contas Balanco Loja Bloco Fechar Balanco:', error);
        throw error;
    }
}

