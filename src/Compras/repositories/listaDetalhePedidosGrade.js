// import conn from '../../config/dbConnection.js';
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getObterLinhasDoDetalheGrade = async (idDetalhePedido) => {
  try {

    let query = `
		SELECT DETGRADE.IDDETALHEPEDIDOGRADE, DETGRADE.IDDETALHEPEDIDO, DETGRADE.IDTAMANHO, DETGRADE.INDICETAMANHO, DETGRADE.QTD, DETGRADE.STATIVO, TAM.DSTAMANHO
		FROM "${databaseSchema}".DETALHEPEDIDOGRADE DETGRADE
		INNER JOIN "${databaseSchema}".TAMANHO TAM ON DETGRADE.IDTAMANHO = TAM.IDTAMANHO
		WHERE DETGRADE.STATIVO = 'True'
		AND DETGRADE.IDDETALHEPEDIDO = ?
	`;

    query += 'ORDER BY TO_ALPHANUM(TAM.DSABREVIACAO)';
    
    const params = [idDetalhePedido];


    const statement = conn.prepare(query);
    const result = await statement.exec(params);

    if (!Array.isArray(result) || result.length === 0) return null;
    const det = result[0];
    const docLine = {
        "IDDETALHEPEDIDOGRADE": det.IDDETALHEPEDIDOGRADE,
        "IDDETALHEPEDIDO": det.IDDETALHEPEDIDO,
        "IDTAMANHO": det.IDTAMANHO,
        "DSTAMANHO": det.DSTAMANHO,
        "INDICETAMANHO": det.INDICETAMANHO,
        "QTD": det.QTD,
        "STATIVO": det.STATIVO
    }

    return docLine;
  } catch (error) {
    console.error("Erro ao consulta Detalhe Grade", error);
    throw error;
  }
};

export const getDetalhePedido = async (idPedido, idDetalhePedido, dataPesquisaInicio, dataPesquisaFim,  page, pageSize) => {
  try {
    page = page && !isNaN(page) ? parseInt(page) : 1;
    pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

    let query = `
        SELECT 
			tbdp.IDDETALHEPEDIDO AS IDDETPEDIDO, 
			tbdp.IDRESUMOPEDIDO AS IDPEDIDO, 
			tbdp.IDCOR, 
			tbdp.IDSUBGRUPOESTRUTURA, 
			SE.DSSUBGRUPOESTRUTURA, 
			GE.DSGRUPOESTRUTURA, 
			tbdp.IDCATEGORIAPEDIDO, 
			CP.DSCATEGORIAPEDIDO, 
			CR.DSCOR, 
			LE.IDLOCALEXPOSICAO, 
			LE.DSLOCALEXPOSICAO, 
			ES.IDESTILO, 
			ES.DSESTILO, 
			TT.IDTPTECIDO, 
			TT.DSTIPOTECIDO, 
			tbdp.NUREF, 
			tbdp.DSPRODUTO, 
			tbdp.QTDTOTAL, 
			tbdp.NUCAIXA, 
			UN.DSSIGLA, 
			(tbdp.VRUNITBRUTO) AS VRUNITBRUTODETALHEPEDIDO, 
			IFNULL(tbdp.DESC01, 0) AS DESC01, 
			IFNULL(tbdp.DESC02, 0) AS DESC02, 
			IFNULL(tbdp.DESC03, 0) AS DESC03, 
			IFNULL(tbdp.VRUNITLIQUIDO, 0) AS VRUNITLIQDETALHEPEDIDO, 
			IFNULL(tbdp.VRVENDA, 0) AS VRVENDADETALHEPEDIDO, 
			IFNULL(tbdp.VRTOTAL, 0) AS VRTOTALDETALHEPEDIDO, 
			tbdp.STRECEBIDO, 
			tbdp.STCANCELADO, 
			tbdp.STECOMMERCE, 
			tbdp.STREDESOCIAL, 
			tbdp.OBSPRODUTO, 
			tbrp.MODPEDIDO, 
			TO_VARCHAR(tbrp.DTPEDIDO, 'DD-MM-YYYY HH24:MI:SS') AS DTPEDIDO 
		FROM 
			"${databaseSchema}".DETALHEPEDIDO tbdp 
			INNER JOIN "${databaseSchema}".RESUMOPEDIDO tbrp ON tbdp.IDRESUMOPEDIDO = tbrp.IDRESUMOPEDIDO  
			INNER JOIN "${databaseSchema}".COR CR ON tbdp.IDCOR = CR.IDCOR  
			INNER JOIN "${databaseSchema}".ESTILOS ES ON tbdp.IDESTILO = ES.IDESTILO  
			INNER JOIN "${databaseSchema}".TIPOTECIDOS TT ON tbdp.IDTIPOTECIDO = TT.IDTPTECIDO  
			INNER JOIN "${databaseSchema}".LOCALEXPOSICAO LE ON tbdp.IDLOCALEXPOSICAO = LE.IDLOCALEXPOSICAO  
			INNER JOIN "${databaseSchema}".CATEGORIAPEDIDO CP ON tbdp.IDCATEGORIAPEDIDO = CP.IDCATEGORIAPEDIDO  
			INNER JOIN "${databaseSchema}".UNIDADEMEDIDA UN ON tbdp.UND = UN.IDUNIDADEMEDIDA  
			INNER JOIN "${databaseSchema}".SUBGRUPOESTRUTURA SE ON tbdp.IDSUBGRUPOESTRUTURA = SE.IDSUBGRUPOESTRUTURA  
			INNER JOIN "${databaseSchema}".GRUPOESTRUTURA GE ON SE.IDGRUPOESTRUTURA = GE.IDGRUPOESTRUTURA  
		WHERE 
			1 = ? 
			AND tbrp.STCANCELADO = 'False' 
			AND tbdp.STCANCELADO = 'False'
    `;

    const params = [1];

    if (idDetalhePedido) {
      query += ` AND tbdp.IDDETALHEPEDIDO = ? `;
      params.push(idDetalhePedido);
    }

    if (idPedido) {
      query += ` AND tbrp.IDRESUMOPEDIDO  = ? `;
      params.push(idPedido);
    }

    if (dataPesquisaInicio && dataPesquisaFim) {
      query += ` AND (tbrp.DTPEDIDO  BETWEEN ? AND ?) `;
      params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
    }

    query += ` ORDER BY tbdp.IDSUBGRUPOESTRUTURA,tbdp.NUREF, tbdp.DSPRODUTO `;
    const statement = conn.prepare(query);
    const result = await statement.exec(params);

    const data = await Promise.all(result.map(async (registro) => {
      const detalheGrade = await getDetalhePedido(registro.IDDETPEDIDO);
      return {
        "detpedido": {
            "IDDETPEDIDO": registro.IDDETPEDIDO,
            "IDPEDIDO": registro.IDPEDIDO,
            "IDCOR": registro.IDCOR,
            "IDESTRUTURAMERCADOLOGICA": registro.IDESTRUTURAMERCADOLOGICA,
            "DSSUBGRUPOESTRUTURA": registro.DSSUBGRUPOESTRUTURA,
            "DSGRUPOESTRUTURA": registro.DSGRUPOESTRUTURA,
            "IDCATEGORIAPEDIDO": registro.IDCATEGORIAPEDIDO,
            "DSCATEGORIAPEDIDO": registro.DSCATEGORIAPEDIDO,
            "DSCOR": registro.DSCOR,
            "DSLOCALEXPOSICAO": registro.DSLOCALEXPOSICAO,
            "DSESTILO": registro.DSESTILO,
            "DSTIPOTECIDO": registro.DSTIPOTECIDO,
            "NUREF": registro.NUREF,
            "DSPRODUTO": registro.DSPRODUTO,
            "QTDTOTAL": registro.QTDTOTAL,
            "NUCAIXA": registro.NUCAIXA,
            "DSSIGLA": registro.DSSIGLA,
            "VRUNITBRUTODETALHEPEDIDO": registro.VRUNITBRUTODETALHEPEDIDO,
            "DESC01": registro.DESC01,
            "DESC02": registro.DESC02,
            "DESC03": registro.DESC03,
            "VRUNITLIQDETALHEPEDIDO": registro.VRUNITLIQDETALHEPEDIDO,
            "VRVENDADETALHEPEDIDO": registro.VRVENDADETALHEPEDIDO,
            "VRTOTALDETALHEPEDIDO": registro.VRTOTALDETALHEPEDIDO,
            "STRECEBIDO": registro.STRECEBIDO,
            "STCANCELADO": registro.STCANCELADO,
            "STREDESOCIAL": registro.STREDESOCIAL,
            "STECOMMERCE" : registro.STECOMMERCE,
            "OBSPRODUTO": registro.OBSPRODUTO,
            "DTPEDIDO": registro.DTPEDIDO
        },
        "detalheGrade": detalheGrade
      };
    }));

    return {
        page,
        pageSize,
        rows: data.length,
        data: data,
    };
  } catch (error) {
    console.error("erro ao consultar detalhe pedido:", error);
    throw error;
  }
};
