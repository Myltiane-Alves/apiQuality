// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const incluirInventarioMovimentoEntrada = async (idEmpresa, lstProd) => {
    try {
        const date = new Date();
        const dd = ("0" + date.getDate()).slice(-2);
        const mm = ("0" + (date.getMonth() + 1)).slice(-2);
        const y = date.getFullYear();
        const dataVoucher = `${y}-${mm}-${dd}`;
  
        for (let i = 0; i < lstProd.length; i++) {
            const registro = lstProd[i];
  
            let queryExistsMov = `
                SELECT * FROM ${databaseSchema}.INVENTARIOMOVIMENTO 
                WHERE IDPRODUTO = ? 
                AND (DTMOVIMENTO BETWEEN '${dataVoucher} 00:00:00' AND '${dataVoucher} 23:59:59') 
                AND IDEMPRESA = ? AND STATIVO = 'True'`;
  
            const paramsExistsMov = [registro.IDPRODUTO, parseInt(idEmpresa)];
            const statementExistsMov = await conn.prepare(queryExistsMov);
            const idMovExists = await statementExistsMov.exec(paramsExistsMov);
  
            let qtdInicio = 0;
            let qtdEntradaVoucher = parseInt(registro.QTD);
            let qtdFinal = 0;
  
            if (idMovExists.length === 0) {
                // Não existe movimento anterior
                let queryMovAnt = `
                    SELECT * FROM ${databaseSchema}.INVENTARIOMOVIMENTO 
                    WHERE STATIVO = 'True' 
                    AND IDPRODUTO = ? AND IDEMPRESA = ?`;
  
                const paramsMovAnt = [registro.IDPRODUTO, parseInt(idEmpresa)];
                const statementMovAnt = await conn.prepare(queryMovAnt);
                const UltMovimentoProduto = await statementMovAnt.exec(paramsMovAnt);
  
                if (UltMovimentoProduto.length > 0) {
                    qtdInicio = parseInt(UltMovimentoProduto[0].QTDFINAL);
                    qtdFinal = qtdInicio + qtdEntradaVoucher;
  
                    // Atualiza o status do último movimento para 'False'
                    let queryAtualizaStatus = `
                        UPDATE ${databaseSchema}.INVENTARIOMOVIMENTO 
                        SET "STATIVO" = 'False' 
                        WHERE "IDINVMOVIMENTO" = ?`;
  
                    const paramsAtualizaStatus = [UltMovimentoProduto[0].IDINVMOVIMENTO];
                    const statementAtualizaStatus = await conn.prepare(queryAtualizaStatus);
                    await statementAtualizaStatus.exec(paramsAtualizaStatus);
                    await conn.commit();
                } else {
                    qtdFinal = qtdInicio + qtdEntradaVoucher;
                }
  
                // Inserir novo movimento
                let queryInsertMov = `
                    INSERT INTO ${databaseSchema}.INVENTARIOMOVIMENTO (
                        "IDINVMOVIMENTO", 
                        "IDEMPRESA", 
                        "DTMOVIMENTO", 
                        "IDPRODUTO", 
                        "QTDINICIO", 
                        "QTDENTRADAVOUCHER", 
                        "QTDENTRADA", 
                        "QTDSAIDA", 
                        "QTDSAIDATRANSFERENCIA", 
                        "QTDRETORNOAJUSTEPEDIDO", 
                        "QTDFINAL", 
                        "QTDAJUSTEBALANCO", 
                        "STATIVO"
                    ) 
                    VALUES (${databaseSchema}.SEQ_INVENTARIOMOVIMENTO.NEXTVAL, ?, now(), ?, ?, ?, 0, 0, 0, 0, ?, 0, 'True')`;
  
                const paramsInsertMov = [parseInt(idEmpresa), registro.IDPRODUTO, qtdInicio, qtdEntradaVoucher, qtdFinal];
                const statementInsertMov = await conn.prepare(queryInsertMov);
                await statementInsertMov.exec(paramsInsertMov);
                await conn.commit();
            } else {
                // Movimento já existe, atualizar
                qtdEntradaVoucher += parseInt(idMovExists[0].QTDENTRADAVOUCHER);
                qtdFinal = parseInt(idMovExists[0].QTDINICIO) + parseInt(idMovExists[0].QTDENTRADA) + qtdEntradaVoucher - parseInt(idMovExists[0].QTDSAIDA) + parseInt(idMovExists[0].QTDSAIDATRANSFERENCIA);
  
                let queryAtualizaMovimento = `
                    UPDATE ${databaseSchema}.INVENTARIOMOVIMENTO 
                    SET "QTDENTRADAVOUCHER" = ?, "QTDFINAL" = ? 
                    WHERE "IDINVMOVIMENTO" = ?`;
  
                const paramsAtualizaMovimento = [qtdEntradaVoucher, qtdFinal, idMovExists[0].IDINVMOVIMENTO];
                const statementAtualizaMovimento = await conn.prepare(queryAtualizaMovimento);
                await statementAtualizaMovimento.exec(paramsAtualizaMovimento);
                await conn.commit();
            }
        }
    } catch (error) {
        console.error('Erro ao incluir movimentação de inventário', error);
        throw error;
    }
};


export const incluirInventarioMovimentoSaida = async (idEmpresa, lstProdMov) => {
    try {
        const date = new Date();
        const dd = ("0" + date.getDate()).slice(-2);
        const mm = ("0" + (date.getMonth() + 1)).slice(-2);
        const y = date.getFullYear();
        const data = `${y}-${mm}-${dd}`;

        for (let i = 0; i < lstProdMov.length; i++) {
            const registro = lstProdMov[i];

            // Verifica se já existe movimento no dia
            const queryExistsMov = `
                SELECT * FROM ${databaseSchema}.INVENTARIOMOVIMENTO 
                WHERE IDPRODUTO = ? 
                AND (DTMOVIMENTO BETWEEN '${data} 00:00:00' AND '${data} 23:59:59') 
                AND IDEMPRESA = ? AND STATIVO = 'True'`;

            const paramsExistsMov = [registro.IDPRODUTO, idEmpresa];
            const statementExistsMov = await conn.prepare(queryExistsMov);
            const idMovExists = await statementExistsMov.exec(paramsExistsMov);

            let qtdInicio = 0;
            let qtdEntradaVoucher = -parseInt(registro.QTD);
            let qtdFinal = 0;

            if (idMovExists.length === 0) {
                // Não existe movimento no dia
                const queryMovAnt = `
                    SELECT * FROM ${databaseSchema}.INVENTARIOMOVIMENTO 
                    WHERE STATIVO = 'True' 
                    AND IDPRODUTO = ? AND IDEMPRESA = ?`;

                const paramsMovAnt = [registro.IDPRODUTO, idEmpresa];
                const statementMovAnt = await conn.prepare(queryMovAnt);
                const UltMovimentoProduto = await statementMovAnt.exec(paramsMovAnt);

                if (UltMovimentoProduto.length > 0) {
                    qtdInicio = parseInt(UltMovimentoProduto[0].QTDFINAL);
                    qtdFinal = qtdInicio + qtdEntradaVoucher;

                    // Atualiza o status do último movimento para 'False'
                    const queryAtualizaStatus = `
                        UPDATE ${databaseSchema}.INVENTARIOMOVIMENTO 
                        SET "STATIVO" = 'False' 
                        WHERE "IDINVMOVIMENTO" = ?`;

                    const paramsAtualizaStatus = [UltMovimentoProduto[0].IDINVMOVIMENTO];
                    const statementAtualizaStatus = await conn.prepare(queryAtualizaStatus);
                    await statementAtualizaStatus.exec(paramsAtualizaStatus);
                    await conn.commit();
                } else {
                    qtdInicio = 0;
                    qtdFinal = qtdInicio + qtdEntradaVoucher;
                }

                // Inserir novo movimento de saída
                const queryInsertMov = `
                    INSERT INTO ${databaseSchema}.INVENTARIOMOVIMENTO (
                        "IDINVMOVIMENTO", 
                        "IDEMPRESA", 
                        "DTMOVIMENTO", 
                        "IDPRODUTO", 
                        "QTDINICIO", 
                        "QTDENTRADAVOUCHER", 
                        "QTDENTRADA", 
                        "QTDSAIDA", 
                        "QTDSAIDATRANSFERENCIA", 
                        "QTDRETORNOAJUSTEPEDIDO", 
                        "QTDFINAL", 
                        "QTDAJUSTEBALANCO", 
                        "STATIVO"
                    ) 
                    VALUES (${databaseSchema}.SEQ_INVENTARIOMOVIMENTO.NEXTVAL, ?, now(), ?, ?, ?, 0, 0, 0, 0, ?, 0, 'True')`;

                const paramsInsertMov = [idEmpresa, registro.IDPRODUTO, qtdInicio, qtdEntradaVoucher, qtdFinal];
                const statementInsertMov = await conn.prepare(queryInsertMov);
                await statementInsertMov.exec(paramsInsertMov);
                await conn.commit();
            } else {
                // Movimento já existe, atualizar
                qtdInicio = parseInt(idMovExists[0].QTDINICIO);
                const qtdSaida = parseInt(idMovExists[0].QTDSAIDA);
                qtdEntradaVoucher = parseInt(idMovExists[0].QTDENTRADAVOUCHER) - parseInt(registro.QTD);
                qtdFinal = qtdInicio + parseInt(idMovExists[0].QTDENTRADA) + qtdEntradaVoucher - qtdSaida + parseInt(idMovExists[0].QTDSAIDATRANSFERENCIA);

                const queryAtualizaMovimento = `
                    UPDATE ${databaseSchema}.INVENTARIOMOVIMENTO 
                    SET "QTDFINAL" = ?, "QTDENTRADAVOUCHER" = ? 
                    WHERE "IDINVMOVIMENTO" = ?`;

                const paramsAtualizaMovimento = [qtdFinal, qtdEntradaVoucher, idMovExists[0].IDINVMOVIMENTO];
                const statementAtualizaMovimento = await conn.prepare(queryAtualizaMovimento);
                await statementAtualizaMovimento.exec(paramsAtualizaMovimento);
                await conn.commit();
            }
        }
    } catch (error) {
        console.error('Erro ao incluir movimentação de saída do inventário', error);
        throw error;
    }
};


export const getAtualizaStatusProdutosOrigemVoucher = async (idVoucher, stAtivo, stCancelado, stStatus,  page, pageSize) => {
    try {
        let stTroca = 'False'    
        
        if(stCancelado === 'False') {
            stTroca = 'True'
            let queryProdVoucher = `
                SELECT
                    TBRV."IDEMPRESAORIGEM",
                    TBDV."IDVOUCHER",
                    TBDV."IDPRODUTO",
                    TBDV."QTD",
                    TBRV."STATIVO",
                    TBRV."STCANCELADO",
                    TBRV."STSTATUS"
                FROM
                    ${databaseSchema}.RESUMOVOUCHER TBRV
                INNER JOIN ${databaseSchema}.DETALHEVOUCHER TBDV ON
                    TBRV."IDVOUCHER" = TBDV."IDVOUCHER"
                WHERE
                    TBDV."IDVOUCHER" = ?
                ORDER BY
                    IDVOUCHER
            `;
            
            const params = [idVoucher];
            const statement = await conn.prepare(queryProdVoucher);
            const result = await statement.exec(params);
            if((stStatus === 'NOVO' || stStatus === 'EM ANALISE' || stStatus === 'LIBERADO PARA O CLIENTE' || stStatus === 'FINALIZADO') && 
            (!detalheProdVoucher[0].STSTATUS || detalheProdVoucher[0].STSTATUS === 'CANCELADO' || detalheProdVoucher[0].STSTATUS === 'NEGADO')) {
                await incluirInventarioMovimentoEntrada(detalheProdVoucher[0].IDEMPRESAORIGEM, detalheProdVoucher);
            }
        } else {
            let queryProdVoucher = `
                SELECT
                    TBRV."IDEMPRESAORIGEM",
                    TBDV."IDVOUCHER",
                    TBDV."IDPRODUTO",
                    TBDV."QTD",
                    TBRV."STATIVO",
                    TBRV."STCANCELADO",
                    TBRV."STSTATUS"
                FROM
                    ${databaseSchema}.RESUMOVOUCHER TBRV
                INNER JOIN ${databaseSchema}.DETALHEVOUCHER TBDV ON
                    TBRV."IDVOUCHER" = TBDV."IDVOUCHER"
                WHERE
                    TBDV."IDVOUCHER" = ?
                ORDER BY
                    IDVOUCHER
            `;
            const params = [idVoucher];
            const statement = await conn.prepare(queryProdVoucher);
            const result = await statement.exec(params);
            if ((stStatus === 'CANCELADO' || stStatus === 'NEGADO') &&
            (!detalheProdVoucher[0].STSTATUS || detalheProdVoucher[0].STSTATUS === 'NOVO' || detalheProdVoucher[0].STSTATUS === 'EM ANALISE' || detalheProdVoucher[0].STSTATUS === 'LIBERADO PARA O CLIENTE' || detalheProdVoucher[0].STSTATUS === 'FINALIZADO')) {
                // Chamar função para inclusão de movimentação de saída
                await incluirInventarioMovimentoSaida(detalheProdVoucher[0].IDEMPRESAORIGEM, detalheProdVoucher);
            }
        }
        
    
        // Atualizar detalhe voucher
        let queryDetalheVoucher = `
            UPDATE ${databaseSchema}.DETALHEVOUCHER 
            SET "STATIVO" = ?, "STCANCELADO" = ? 
            WHERE "IDVOUCHER" = ?`;

        let detalheParams = [stAtivo, stCancelado, idVoucher];
        let statementDetalheVoucher = await conn.prepare(queryDetalheVoucher);
        await statementDetalheVoucher.exec(detalheParams);

        await conn.commit();

        return { msg: "Atualização realizada com sucesso!" };
    } catch (error) {
        console.error('Error executing query', error);
        throw error;
    }
};

export const updateResumoVoucher = async (data) => {
    try {
      const query = `
        UPDATE "${databaseSchema}"."RESUMOVOUCHER" 
        SET 
          "STATIVO" = ?,
          "STCANCELADO" = ?,
          "DSMOTIVOCANCELAMENTO" = ?,
          "IDUSRCANCELAMENTO" = ?,
          "STSTATUS" = ?,
          "STTIPOTROCA" = ?,
        WHERE 
          "IDVOUCHER" = ?`;
  
      const statement = conn.prepare(query);
  
      for (const registro of data) {
   
  
        const params = [
          registro.STATIVO,
            registro.STCANCELADO,
            registro.DSMOTIVOCANCELAMENTO,
            registro.IDUSRCANCELAMENTO,
            registro.STSTATUS,
            registro.STTIPOTROCA,
            registro.IDVOUCHER
        ];
  
        await statement.exec(params);
      }
  
      statement.close();
      conn.commit();
  
      return { msg: "Atualização realizada com sucesso!" };
    } catch (error) {
      console.error('Erro ao executar a atualização de funcionários:', error);
      throw error;
    }
};