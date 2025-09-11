// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;


export const getVendasPorEstrutura = async (
    idEmpresa,
    idGrupoEmpresarial,
    idGrupo,
    idSubGrupo,
    idMarca,
    idFornecedor,
    descricaoProduto,
    uf,
    dataPesquisaInicio,
    dataPesquisaFim,
    page,
    pageSize
) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;

        var query = `
            SELECT DISTINCT 
                v2.IDEMPRESA,
                v2.NOFANTASIA,
                v2.GRUPO,
                v2.SUBGRUPO,
                v2.MARCA,
                v3.NUCODBARRAS,
                v3.DSNOME,
                SUM(v2.QTD) AS QTD,
                SUM(v2.VRTOTALLIQUIDO) AS VRTOTALLIQUIDO,
                SUM((v2.QTD*v2.PRECO_COMPRA)) AS TOTALCUSTO,
                SUM((v2.QTD*v2.VUNCOM)) AS TOTALBRUTO,
                SUM((v2.VDESC)) AS TOTALDESCONTO,
                SUM(v2.VRRECVOUCHER) AS VRRECVOUCHER
            FROM 
                "${databaseSchema}".VW_VENDAS_PRODUTO_GRUPO_SUBGRUPO v2
                LEFT JOIN "${databaseSchema}".PRODUTO v3 ON V2.CPROD = V3.IDPRODUTO
            WHERE 
            1 = 1
        `;

        const params = [];

        if (idEmpresa) {
            query += 'AND   v2.IDEMPRESA = ? ';
            params.push(idEmpresa);
        }
        
        if(idGrupoEmpresarial > 0) {
            query += 'AND v2.IDGRUPOEMPRESARIAL IN (?) ';
            params.push(idGrupoEmpresarial);
        }

        if (dataPesquisaInicio && dataPesquisaFim) {
            query += 'AND v2.DTHORAFECHAMENTO BETWEEN ? AND ? ';
            params.push(`${dataPesquisaInicio} 00:00:00`, `${dataPesquisaFim} 23:59:59`);
        }



        if (descricaoProduto) {
            query += 'AND (UPPER(v3.DSNOME) LIKE UPPER(?) OR v3.NUCODBARRAS LIKE ?) ';
            params.push(`%${descricaoProduto}%`, `%${descricaoProduto}%`);
        }

        if(uf > 0) {
            query += 'AND v2.SGUF = ? ';
            params.push(uf);
        }

        if (idFornecedor) {
            query += 'AND v2.IDRAZAO_SOCIAL_FORNECEDOR IN (?) ';
            params.push(idFornecedor);
        }

        if (idGrupo) {
            const listarIdGrupo = idGrupo.split(',');
            let descGrupo = '';
            let listarDescGrupo = '';

            for (let i = 0; i < listarIdGrupo.length; i++) {
                switch (listarIdGrupo[i]) {
                    case '1':
                        descGrupo = 'Verão';
                        break;
                    case '2':
                        descGrupo = 'Calçados/Acessórios';
                        break;
                    case '3':
                        descGrupo = 'Cama/Mesa/Banho';
                        break;
                    case '4':
                        descGrupo = 'Utilidades Do Lar';
                        break;
                    case '5':
                        descGrupo = 'Diversos';
                        break;
                    case '6':
                        descGrupo = 'Artigos Esportivos';
                        break;
                    case '7':
                        descGrupo = 'Cosméticos';
                        break;
                    case '8':
                        descGrupo = 'Acessórios';
                        break;
                    case '9':
                        descGrupo = 'Peças Íntimas';
                        break;
                    case '10':
                        descGrupo = 'Inverno';
                        break;
                }

                listarDescGrupo += i === 0 ? `'${descGrupo}'` : `,'${descGrupo}'`;
            }
            query += `AND v2.GRUPO IN (${listarDescGrupo}) `;
        }

        if (idSubGrupo) {
            query += 'AND v2.IDSUBGRUPO IN (?) ';
            params.push(idSubGrupo);
        }

        if (idMarca) {
            query += 'AND v2.IDMARCA IN (?) ';
            params.push(idMarca);
        }

        query += 'GROUP BY v2.IDEMPRESA, v2.NOFANTASIA, v2.GRUPO, v2.SUBGRUPO, v2.MARCA, v3.NUCODBARRAS, v3.DSNOME';
        query += 'ORDER BY v2.IDEMPRESA, v3.NUCODBARRAS ';

        const offset = (page - 1) * pageSize;
        query += 'LIMIT ? OFFSET ? ';
        params.push(pageSize, offset);

        const statement = await conn.prepare(query);
        const result = await statement.exec(params);
        return {
            page: page,
            pageSize: pageSize,
            rows: result.length,
            data: result,
        }
    } catch (error) {
        console.error('Erro ao executar a consulta Vendas Por Estrutura:', error);
        throw error;
    }
};
