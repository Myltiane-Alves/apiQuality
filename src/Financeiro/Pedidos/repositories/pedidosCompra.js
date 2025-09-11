// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getPedidosCompras = async (id, idContaPagar, idPedido, idMarca, idFornecedor, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query = ` 
            SELECT 
                CP.IDCONTAPAGAR, 
                CP.IDGRUPOEMPRESARIAL, 
                CP.IDSUBGRUPOEMPRESARIAL, 
                SUBEMP.DSSUBGRUPOEMPRESARIAL, 
                CP.IDEMPRESAPAGADORA, 
                EMP.NOFANTASIA AS NOEMPESAPAG, 
                CP.TPCONTA, 
                CP.IDRESUMOENTRADANFE, 
                CP.IDRESUMOPEDIDO, 
                CP.IDFORNECEDOR, 
                FN.NOFANTASIA AS NOFORNECEDOR, 
                CP.IDCATEGORIADESP, 
                CD.DSCATEGORIA, 
                RP.MODPEDIDO, 
                IFNULL (RP.STMIGRADOSAP,'False') ASSTMIGRADOSAP, 
                CP.IDANDAMENTO, 
                AD.DSANDAMENTO, 
                CP.DSDESCRICAOCONTA, 
                CP.NOBENEFICIARIO, 
                TO_VARCHAR( RP.DTPEDIDO, 'DD-MM-YYYY') AS DTPEDIDOFORMATADA, 
                TO_VARCHAR( RP.DTPREVENTREGA, 'DD-MM-YYYY') AS DTPREVENTREGAFORMATADA, 
                CP.DTCADASTRO, 
                TO_VARCHAR( CP.DTCADASTRO, 'DD-MM-YYYY') AS DTCADASTROFORMATADA, 
                CP.DTCOMPETENCIA, 
                TO_VARCHAR( CP.DTCOMPETENCIA, 'DD-MM-YYYY') AS DTCOMPETENCIAFORMATADA, 
                CP.DTVENCIMENTO, 
                TO_VARCHAR( CP.DTVENCIMENTO, 'DD-MM-YYYY') AS DTVENCIMENTOFORMATADA, 
                CP.VRNOMINAL, 
                CP.VRDESCONTO, 
                CP.VRJUROS, 
                CP.VRMULTA, 
                CP.VROUTROS, 
                CP.VRTOTALLIQUIDO, 
                CP.DSFORMAPAGCONTA, 
                CP.NUVEZESPARCELA, 
                CP.QTDDIASPAGAMENTO, 
                CP.DTPAGAMENTO, 
                CP.VRPAGO, 
                CP.NUDOCORIGEM, 
                CP.STCHEQUEPRE, 
                CP.NUCHEQUE, 
                CP.DTCHEQUECOMP, 
                CP.OBSERVACAOPAGAMENTO, 
                CP.STCONCLUIDO, 
                CP.STCONCILIADO, 
                CP.STCANCELADO, 
                CP.DTULTALTERACAO 
            FROM 
                "${databaseSchema}".CONTASPAGAR CP 
                INNER JOIN "${databaseSchema}".RESUMOPEDIDO RP ON CP.IDRESUMOPEDIDO = RP.IDRESUMOPEDIDO  
                INNER JOIN "${databaseSchema}".EMPRESA EMP ON CP.IDEMPRESAPAGADORA = EMP.IDEMPRESA  
                INNER JOIN "${databaseSchema}".SUBGRUPOEMPRESARIAL SUBEMP ON CP.IDSUBGRUPOEMPRESARIAL = SUBEMP.IDSUBGRUPOEMPRESARIAL  
                INNER JOIN "${databaseSchema}".FORNECEDOR FN ON CP.IDFORNECEDOR = FN.IDFORNECEDOR  
                INNER JOIN "${databaseSchema}".CATEGORIARECEITADESPESA CD ON CP.IDCATEGORIADESP = CD.IDCATEGORIARECDESP  
                INNER JOIN "${databaseSchema}".ANDAMENTOS AD ON CP.IDANDAMENTO = AD.IDANDAMENTO  
            WHERE 
                1 = ?
                AND CP.STCANCELADO = 'False'
    `;

        const params = [1];

        if (id) {
            query += ' And  CP.IDCONTAPAGAR = ? ';
            params.push(id);
        }
        if (idContaPagar) {
            query += ' And  CP.IDCONTAPAGAR = ? ';
            params.push(idContaPagar);
        }
        if (idPedido) {
            query += ' And  CP.IDRESUMOPEDIDO = ? ';
            params.push(idPedido);
        }
        if (idMarca) {
            query += ' And  CP.IDSUBGRUPOEMPRESARIAL = ? ';
            params.push(idMarca);
        }
        if (idFornecedor) {
            query += ' And  CP.IDFORNECEDOR = ? ';
            params.push(idFornecedor);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND (CP.DTCADASTRO  BETWEEN ? AND ?) ';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
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
            data: result,
        }
    } catch (error) {
        throw new Error(error.message);
    }
};