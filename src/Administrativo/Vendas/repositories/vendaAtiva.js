// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getVendaAtiva = async (
    statusCancelado, 
    statusContingencia, 
    statusCanceladoWeb, 
    stCanceladoPDVEmitida, 
    stCanceladoPDVEmTela, 
    statusCanceladoDepois30Minutos, cpfCliente, idGrupo, idEmpresa, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(page) : 1000;

        let query = `SELECT 
            TEMP.NOFANTASIA, 
            TBC.IDCAIXAWEB, 
            TBC.DSCAIXA, 
            TBF.NOFUNCIONARIO, 
            TBFC.NOFUNCIONARIO AS NOFUNCIOCANCEL, 
            TBFC.DSFUNCAO AS NOFUNCAOCANCEL, 
            TBV.IDVENDA, 
            TBV.IDEMPRESA, 
            TBV.VRRECDINHEIRO, 
            TBV.VRRECCARTAO, 
            TBV.VRRECCONVENIO, 
            TBV.VRRECPOS, 
            TBV.VRRECVOUCHER, 
            TBV.NFE_INFNFE_IDE_SERIE, 
            TBV.NFE_INFNFE_IDE_NNF, 
            TO_VARCHAR(TBV.DTHORAFECHAMENTO,'DD-MM-YYYY HH24:MI:SS') AS DTHORAFECHAMENTO, 
            TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS VRTOTALPAGO, 
            TBV.NFE_INFNFE_TOTAL_ICMSTOT_VPROD AS VRTOTALVENDA, 
            TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC AS VRTOTALDESCONTO, 
            (SELECT IFNULL(SUM(tbvp.VRTOTALLIQUIDO),0) 
                FROM "${databaseSchema}".VENDADETALHE tbvp 
                WHERE tbvp.IDVENDA = TBV.IDVENDA 
                AND tbvp.STCANCELADO = '${statusCancelado}'
            ) AS TOTALVENDAPROD, 
            TBV.TXTMOTIVOCANCELAMENTO, 
            TBV.STCONTINGENCIA,
            MOVC.STCONFERIDO,
            TBV.PROTNFE_INFPROT_XMOTIVO
        FROM 
            "${databaseSchema}".VENDA TBV 
            INNER JOIN "${databaseSchema}".CAIXA TBC ON TBV.IDCAIXAWEB = TBC.IDCAIXAWEB 
            INNER JOIN "${databaseSchema}".FUNCIONARIO TBF ON TBV.IDOPERADOR = TBF.IDFUNCIONARIO 
            LEFT JOIN "${databaseSchema}".FUNCIONARIO TBFC ON TBV.IDUSUARIOCANCELAMENTO = TBFC.IDFUNCIONARIO 
            LEFT JOIN "${databaseSchema}".EMPRESA TEMP ON TBV.IDEMPRESA = TEMP.IDEMPRESA 
            LEFT JOIN "${databaseSchema}".MOVIMENTOCAIXA MOVC ON TBV.IDMOVIMENTOCAIXAWEB = MOVC.ID 
        WHERE 
            1 = 1`;

        const params = [];

        if (statusCancelado) {
            query += ' AND TBV.STCANCELADO = ?';
            params.push(statusCancelado);
        }

        if (statusContingencia) {
            query += ' AND TBV.STCONTINGENCIA = ?';
            params.push(statusContingencia);
        }

        if (statusCanceladoWeb) {
            query += ' AND TBV.STCANCELADOWEB = ?';
            params.push(statusCanceladoWeb);
        }

        if (stCanceladoPDVEmitida) {
            query += ' AND TBV.STCANCELADO = ? AND TBV.STCANCELADOWEB is null AND TBV.VRTOTALVENDA > 0';
            params.push(stCanceladoPDVEmitida);
        }

        if (stCanceladoPDVEmTela) {
            query += ' AND TBV.STCANCELADO = ? AND TBV.STCANCELADOWEB is null AND TBV.VRTOTALVENDA = 0';
            params.push(stCanceladoPDVEmTela);
        }

        if (statusCanceladoDepois30Minutos) {
            query += ' AND TBV.STCANCELADO = ? AND SECONDS_BETWEEN(TBV.DTHORAFECHAMENTO, TBV.DTULTALTERACAO) > 1800';
            params.push(statusCanceladoDepois30Minutos);
        }

        if (cpfCliente) {
            query += ' AND TBV.DEST_CPF = ?';
            params.push(cpfCliente);
        }

        if (idEmpresa > 0) {
            query += ' AND TBV.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (idGrupo > 0) {
            query += ' AND TEMP.IDGRUPOEMPRESARIAL = ?';
            params.push(idGrupo);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND (TBV.DTHORAFECHAMENTO BETWEEN ? AND ?)';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        query += ' ORDER BY DTHORAFECHAMENTO, TBV.IDEMPRESA ASC';

        const offset = (page - 1) * pageSize;
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);

        return {
            page,
            pageSize,
            rows: result.length,
            data: result,
        };

    } catch (error) {
        console.error('Erro ao executar a consulta venda forma pagamento:', error);
        throw error;
    }
};
