import { console } from "inspector";
// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getListaDetalhe = async (idVoucher) => {
    try {

        let query = ` SELECT 
            tbdv.IDVOUCHER,
            tbdv.IDDETALHEVOUCHER,
            tbdv.IDPRODUTO,
            tbp.DSNOME AS DSPRODUTO,
            tbp.NUCODBARRAS,
            tbdv.QTD,
            tbdv.VRUNIT,
            tbdv.VRTOTALBRUTO,
            tbdv.VRDESCONTO,
            tbdv.VRTOTALLIQUIDO,
            tbdv.STATIVO,
            tbdv.STCANCELADO
        FROM
            "${databaseSchema}".DETALHEVOUCHER tbdv
        INNER JOIN
            "${databaseSchema}".PRODUTO tbp ON tbp.IDPRODUTO = tbdv.IDPRODUTO
        WHERE
            tbdv.IDVOUCHER = ?`;

        const params = [idVoucher];
        const statement = await conn.prepare(query);
        const rows = await statement.exec(params);

        if(!Array.isArray(rows) || rows.length === 0) return [];
        const data = rows.map((det, index) => ({
            "@nItem": index + 1,
            "det": {
                "IDDETALHEVOUCHER": det.IDDETALHEVOUCHER,
            	"IDVOUCHER": det.IDVOUCHER,
            	"IDPRODUTO": det.IDPRODUTO,
            	"DSPRODUTO": det.DSPRODUTO,
            	"NUCODBARRAS": det.NUCODBARRAS,
            	"QTD": det.QTD,
            	"VRUNIT": det.VRUNIT,
            	"VRTOTALBRUTO": det.VRTOTALBRUTO,
            	"VRDESCONTO": det.VRDESCONTO,
            	"VRTOTALLIQUIDO": det.VRTOTALLIQUIDO,
            	"STATIVO": det.STATIVO,
            	"STCANCELADO": det.STCANCELADO
            }
        }))

        return data
        
        
    } catch (error) {
        console.error('Erro ao executar a consulta Lista Detalhe:', error);
        throw error;
    }
};

export const getListaDetalheResumoVenda = async (idResumoVendaDestino) => {
 try {
    var query = ` 
        SELECT
            tbvd.IDVENDADETALHE,
            tbvd.IDVENDA,
            tbvd.CPROD,
            tbvd.CEAN,
            tbpd.NUCODBARRAS,
            tbvd.XPROD AS DSPRODUTO,
            tbvd.QTD,
            tbvd.VUNCOM,
            tbvd.VPROD,
            tbvd.VDESC,
            tbvd.VRTOTALLIQUIDO,
            tbvd.VENDEDOR_NOME
        FROM
            "${databaseSchema}".VENDADETALHE tbvd
        LEFT JOIN 
            "${databaseSchema}".PRODUTO tbpd ON
            tbvd.CPROD = tbpd.IDPRODUTO
        WHERE
            tbvd.IDVENDA = ?
    `
        const params = [idResumoVendaDestino];
        const statement = await conn.prepare(query);
        const rows = await statement.exec(params);
        console.log('rows', rows)
    const data = rows.map((det, index) => ({
        "@nItem": index + 1,
        vendadetdestino: {
            "IDVENDADETALHE": det.IDVENDADETALHE,
            "IDVENDA": det.IDVENDA,
            "CPROD": det.CPROD,
            "CEAN": det.CEAN,
            "NUCODBARRAS": det.NUCODBARRAS,
            "DSPRODUTO": det.DSPRODUTO,
            "QTD": det.QTD,
            "VUNCOM": det.VUNCOM,
            "VPROD": det.VPROD,
            "VDESC": det.VDESC,
            "VRTOTALLIQUIDO": det.VRTOTALLIQUIDO,
            "VENDEDOR_NOME": det.VENDEDOR_NOME
        }
    }));
    console.log('data', data)
    return data
 } catch (error) {
     console.error('Erro ao executar a consulta detalhe resumo venda:', error);
     throw error;
 }
}

export const getDetalheVoucherDados = async (idSubGrupoEmpresa, idEmpresa, idVoucher, dataPesquisaInicio, dataPesquisaFim, dadosVoucher, stStatus, stTipoTroca, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        let query =`
	        SELECT 
                tbrv.IDVOUCHER,  
                tbrv.IDEMPRESAORIGEM,  
                tbrv.IDCAIXAORIGEM,  
                tbrv.IDVENDEDOR,  
                tbrv.IDNFEDEVOLUCAO,  
                tbrv.IDRESUMOVENDAWEB,  
                tbcliente.IDCLIENTE,  
                tbcliente.DSNOMERAZAOSOCIAL, 
                tbcliente.DSAPELIDONOMEFANTASIA,  
                tbcliente.NUCPFCNPJ,  
                tbrv.IDRESUMOVENDAWEBDESTINO,  
                tbrv.STSTATUS,  
                tbrv.STTIPOTROCA,  
                tbrv.MOTIVOTROCA,  
                tbrv.IDUSRLIBERACAOCRIACAO,
                tbrv.IDUSRINVOUCHER,
                tbfuncionario.NOFUNCIONARIO AS NOFUNCIONARIOLIBERACAOCRIACAO, 
                tbrv.IDUSRLIBERACAOCONSUMO, 
                (SELECT NOFUNCIONARIO FROM  "${databaseSchema}".FUNCIONARIO WHERE IDFUNCIONARIO = tbrv.IDUSRLIBERACAOCONSUMO) AS NOFUNCIONARIOLIBERACAOCONSUMO, 
                TO_VARCHAR(tbrv.DTINVOUCHER, 'DD/MM/YYYY HH24:MI:SS') AS DTINVOUCHER,  
                TO_VARCHAR(tbrv.DTOUTVOUCHER, 'DD/MM/YYYY HH24:MI:SS') AS DTOUTVOUCHER,  
                tbcorigem.DSCAIXA AS DSCAIXAORIGEM,  
                tbcdestino.DSCAIXA AS DSCAIXADESTINO,  
                tbrv.NUVOUCHER,  
                tbrv.VRVOUCHER,  
                tbrv.STATIVO,  
                tbrv.STCANCELADO,  
                CAST(tbrv.DSMOTIVOCANCELAMENTO AS VARCHAR(255)) AS DSMOTIVOCANCELAMENTO,
                tbemporigem.IDSUBGRUPOEMPRESARIAL AS SUBGRUPOEMPORIGEM, 
                tbemporigem.NORAZAOSOCIAL AS RAZAOEMPORIGEM, 
                tbemporigem.NOFANTASIA AS EMPORIGEM, 
                tbemporigem.NUCNPJ AS CNPJEMPORIGEM, 
                tbemporigem.EENDERECO AS ENDEMPORIGEM, 
                tbemporigem.EBAIRRO AS BAIRROEMPORIGEM, 
                tbemporigem.ECIDADE AS CIDADEEMPORIGEM, 
                tbemporigem.SGUF AS SGUFEMPORIGEM, 
                tbemporigem.EEMAILCOMERCIAL AS EMAILEMPORIGEM, 
                tbemporigem.NUTELCOMERCIAL AS NUTELEMPORIGEM, 
                tbempdestino.NOFANTASIA AS EMPDESTINO
                FROM 
            "${databaseSchema}".RESUMOVOUCHER as tbrv 
                LEFT JOIN "${databaseSchema}".CAIXA as tbcorigem ON tbrv.IDCAIXAORIGEM = tbcorigem.IDCAIXAWEB 
                LEFT JOIN "${databaseSchema}".CAIXA as tbcdestino ON tbrv.IDCAIXADESTINO = tbcdestino.IDCAIXAWEB 
                LEFT JOIN "${databaseSchema}".EMPRESA as tbemporigem ON tbrv.IDEMPRESAORIGEM = tbemporigem.IDEMPRESA 
                LEFT JOIN "${databaseSchema}".EMPRESA as tbempdestino ON tbrv.IDEMPRESADESTINO = tbempdestino.IDEMPRESA 
                LEFT JOIN "${databaseSchema}".CLIENTE as tbcliente ON tbrv.IDCLIENTE = tbcliente.IDCLIENTE 
                LEFT JOIN "${databaseSchema}".FUNCIONARIO as tbfuncionario ON tbrv.IDUSRLIBERACAOCRIACAO = tbfuncionario.IDFUNCIONARIO 
            WHERE 1 = 1
        `;

        const params = [];

        if(idVoucher) {
            query += ' AND tbrv.IDVOUCHER = ?';
            params.push(idVoucher);
        }

        if(stStatus) {
            query += `AND tbrv.STSTATUS = ?  `;
            params.push(stStatus);
        }
        
        if(stTipoTroca) {
            query += ` AND tbrv.STTIPOTROCA = ?`;
            params.push(stTipoTroca);
        }
        if(dataPesquisaInicio && dataPesquisaFim) {
            query += ` AND tbrv.DTINVOUCHER BETWEEN ? AND ?`;
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }

        if(idSubGrupoEmpresa) {
            query += ` AND tbemporigem.IDSUBGRUPOEMPRESARIAL = ?`;
            params.push(idSubGrupoEmpresa);
        }


        if (idEmpresa) {
            query += ' AND (tbrv.IDEMPRESAORIGEM = ? OR tbrv.IDEMPRESADESTINO = ?)';
            params.push(idEmpresa, idEmpresa);
        }

        
        if(dadosVoucher) {
            query += idSubGrupoEmpresa ? `AND CONTAINS((tbrv.IDVOUCHER, tbcliente.NUCPFCNPJ, tbrv.NUVOUCHER, tbrv.IDRESUMOVENDAWEBDESTINO, tbrv.IDRESUMOVENDAWEB), '${dadosVoucher}') AND tbemporigem.IDSUBGRUPOEMPRESARIAL = ${idSubGrupoEmpresa}` : ` AND CONTAINS((tbrv.IDVOUCHER, tbcliente.NUCPFCNPJ, tbrv.NUVOUCHER, tbrv.IDRESUMOVENDAWEBDESTINO, tbrv.IDRESUMOVENDAWEB), '${dadosVoucher}')`;;
            params.push(dadosVoucher);
        }

        
        query += `ORDER BY tbrv.DTINVOUCHER`

        const statement = await conn.prepare(query);
        const rows = await statement.exec(params)
        if(!Array.isArray(rows) || rows.length === 0) return [];
 
        const data = await Promise.all(rows.map(async (registro) => ({
            voucher: {
                "IDVOUCHER": registro.IDVOUCHER,
				"IDEMPRESAORIGEM": registro.IDEMPRESAORIGEM,
				"IDSUBGRUPOEMPRESARIAL": registro.SUBGRUPOEMPORIGEM,
				"IDRESUMOVENDAWEB": registro.IDRESUMOVENDAWEB,
				"NUCPFCNPJ": registro.NUCPFCNPJ,
				"DSNOMERAZAOSOCIAL": registro.DSNOMERAZAOSOCIAL,
				"DSAPELIDONOMEFANTASIA": registro.DSAPELIDONOMEFANTASIA,
				"IDRESUMOVENDAWEBDESTINO": registro.IDRESUMOVENDAWEBDESTINO,
        	    "DTINVOUCHER": registro.DTINVOUCHER,
        	    "DTOUTVOUCHER": registro.DTOUTVOUCHER,
            	"DSCAIXAORIGEM": registro.DSCAIXAORIGEM,
            	"DSCAIXADESTINO": registro.DSCAIXADESTINO,
            	"NUVOUCHER": registro.NUVOUCHER,
            	"VRVOUCHER": registro.VRVOUCHER,
            	"STATIVO": registro.STATIVO,
            	"STCANCELADO": registro.STCANCELADO,
            	"RAZAOEMPORIGEM": registro.RAZAOEMPORIGEM,
        	    "EMPORIGEM": registro.EMPORIGEM,
        	    "CNPJEMPORIGEM": registro.CNPJEMPORIGEM,
        	    "ENDEMPORIGEM": registro.ENDEMPORIGEM,
        	    "BAIRROEMPORIGEM": registro.BAIRROEMPORIGEM,
        	    "CIDADEEMPORIGEM": registro.CIDADEEMPORIGEM,
        	    "SGUFEMPORIGEM": registro.SGUFEMPORIGEM,
        	    "NUTELEMPORIGEM": registro.NUTELEMPORIGEM,
        	    "EMAILEMPORIGEM": registro.EMAILEMPORIGEM,
        	    "EMPDESTINO": registro.EMPDESTINO,
        	    "IDCAIXAORIGEM": registro.IDCAIXAORIGEM,
        	    "IDVENDEDOR": registro.IDVENDEDOR,
        	    "IDNFEDEVOLUCAO": registro.IDNFEDEVOLUCAO,
        	    "STSTATUS": registro.STSTATUS,
                "STTIPOTROCA": registro.STTIPOTROCA,
                "MOTIVOTROCA": registro.MOTIVOTROCA,
                "DSMOTIVOCANCELAMENTO": registro.DSMOTIVOCANCELAMENTO,
                "IDUSRLIBERACAOCRIACAO": registro.IDUSRLIBERACAOCRIACAO,
                "NOFUNCIONARIOLIBERACAOCRIACAO": registro.NOFUNCIONARIOLIBERACAOCRIACAO,
                "IDUSRLIBERACAOCONSUMO": registro.IDUSRLIBERACAOCONSUMO,
                "NOFUNCIONARIOLIBERACAOCONSUMO": registro.NOFUNCIONARIOLIBERACAOCONSUMO
            },
            detalhedestino: await getListaDetalheResumoVenda(registro.IDRESUMOVENDAWEBDESTINO),
            detalhevoucher: await getListaDetalhe(registro.IDVOUCHER)
        })))
        console.log('data', data)
        return {
            page,
            pageSize,
            rows: data.length,
            data: data
        }
    } catch(error) {
        console.error('Erro ao executar a consulta vendas:', error);
        throw error;
    }
}