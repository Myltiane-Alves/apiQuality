// import conn from "../../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getDescontoMotivoVendas = async (idEmpresa, idMarca, dsMotivoDesconto, dataPesquisaInicio, dataPesquisaFim, page, pageSize) => {
    try {
        page = page && !isNaN(page) ? parseInt(page) : 1;
        pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize) : 1000;
        let query = ` 
            SELECT
            FC.NOLOGIN AS MATOPERADORFECHAMENTO,
            FC.NOFUNCIONARIO AS OPERADORFECHAMENTO, 
            E.NOFANTASIA, 
            V.IDVENDA,
            V.VRRECCONVENIO,
            IFNULL(F.NUCPF, null) as NUCPF,
            V.DEST_CPF,
            V.IDEMPRESA, 
            CASE
                    WHEN VRRECCONVENIO > 0 THEN 'Convenio Funcionario'
                    ELSE TO_VARCHAR(V.TXTMOTIVODESCONTO) 
                END AS TXTMOTIVODESCONTO, 
            TO_DECIMAL(V.VRTOTALPAGO,12,2) as VRTOTALPAGO, 
            TO_VARCHAR(V.DTHORAFECHAMENTO, 'DD-MM-YYYY HH24:MI:SS') AS DTHORAFECHAMENTO, 
            TO_DECIMAL(V.NFE_INFNFE_TOTAL_ICMSTOT_VPROD,12,2) as ValorTotalProdutoBruto,
            TO_DECIMAL(V.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,12,2) as VrDesconto, 
            TO_DECIMAL(V.NFE_INFNFE_TOTAL_ICMSTOT_VNF,12,2) as TotalLiquido 
            FROM
                "${databaseSchema}"."VENDA" V 
        `;
       
        const params = [1];

        if(dsMotivoDesconto == 'Desconto efetuado por Colaborador CPF' ||!dsMotivoDesconto || (dsMotivoDesconto != 'Desconto Funcionario' && dsMotivoDesconto != 'Convenio')){
            query += `   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO F ON V.DEST_CPF = F.NUCPF`;
            params.push(dsMotivoDesconto);
        }
        
        if(dsMotivoDesconto == 'Desconto Funcionario' || dsMotivoDesconto == 'Convenio') {
            query += `   LEFT JOIN (SELECT * FROM "VAR_DB_NAME".FUNCIONARIO LIMIT 1 ) F ON V.DEST_CPF IN (F.NUCPF)`;
            params.push(dsMotivoDesconto);
        }
        
        query += `   
            LEFT JOIN "VAR_DB_NAME".FUNCIONARIO FC ON 
                V.IDOPERADOR = FC.IDFUNCIONARIO
            INNER JOIN "VAR_DB_NAME".EMPRESA E ON 
                E.IDEMPRESA = V.IDEMPRESA  
            WHERE 
                1 = ?
               AND V."NFE_INFNFE_TOTAL_ICMSTOT_VDESC">0 
               AND V."STCANCELADO"='False' 
        `;

        if (idEmpresa > 0) {
            query += ' AND V.IDEMPRESA = ?';
            params.push(idEmpresa);
        }

        if (idMarca > 0) {
            query += ' AND E.IDGRUPOEMPRESARIAL = ?';
            params.push(idMarca);
        }


        if (dataPesquisaInicio && dataPesquisaFim) {
            query += ' AND (V.DTHORAABERTURA BETWEEN ? AND ?)';
            params.push(dataPesquisaInicio + ' 00:00:00', dataPesquisaFim + ' 23:59:59');
        }

        if(dsMotivoDesconto !== '' && dsMotivoDesconto !== 'Outros' && dsMotivoDesconto !== 'Convenio' && dsMotivoDesconto !== 'Desconto Funcionario' && dsMotivoDesconto !== 'Desconto efetuado por Colaborador CPF') {
            query += ` AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) LIKE '${dsMotivoDesconto}' AND (V.VRRECCONVENIO IS NULL OR V.VRRECCONVENIO = 0)`;
            params.push(dsMotivoDesconto);
        }
        
        if(dsMotivoDesconto == 'Desconto efetuado por Colaborador CPF'){
            query += `  
                AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) LIKE 'Desconto efetuado por Colaborador%'
                AND (V.VRRECCONVENIO IS NULL OR V.VRRECCONVENIO = 0)
                AND F.NUCPF IS NULL
            `;
            params.push(dsMotivoDesconto);
        }
        
        if(dsMotivoDesconto == 'Convenio') {
            query += ` AND (V.VRRECCONVENIO > 0 OR V.VRRECCONVENIO IS NULL)`;
            params.push(dsMotivoDesconto);
        }
        
        if(dsMotivoDesconto == 'Desconto Funcionario') {
            query += ` 
                AND (V.VRRECCONVENIO IS NULL OR V.VRRECCONVENIO = 0) 
                AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) LIKE 'Desconto efetuado por Colaborador%'
            `;
            params.push(dsMotivoDesconto);
        }
        
        if(dsMotivoDesconto == 'Outros') {
            query += ` 
                AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) NOT LIKE 'Ação Comercial' 
                AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) NOT LIKE 'Alçada Gerente' 
                AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) NOT LIKE 'Cartão PL - Ativação Novos' 
                AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) NOT LIKE 'Produtos - Defeitos' 
                AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) NOT LIKE 'Produtos - Divergência de Preço' 
                AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) NOT LIKE 'Desconto efetuado por Colaborador%'
                AND (V.VRRECCONVENIO IS NULL OR V.VRRECCONVENIO = 0)
            `;
            params.push(dsMotivoDesconto);
        }

       
        query += 'ORDER BY  V.IDEMPRESA, V.DTHORAFECHAMENTO '
        
        query += ' LIMIT ? OFFSET ?';
        params.push(pageSize, (page - 1) * pageSize);
        
        const statement = conn.prepare(query);
        const result = statement.exec(params);

        // for (let i = 0; i < response.data.length; i++) {
        //     let registro = response.data[i];
        //     let tipoDesconto = '';
        
        //     if (Number(registro.VRRECCONVENIO)) {
        //         tipoDesconto = 'Desconto Convenio Por Colaborador';
        //     } else if (registro.TXTMOTIVODESCONTO.includes('Desconto efetuado por Colaborador') && !Number(registro.VRRECCONVENIO) && !registro.NUCPF) {
        //         tipoDesconto = 'Desconto efetuado por Colaborador';
        //     } else if (registro.TXTMOTIVODESCONTO.includes('Desconto efetuado por Colaborador') && !Number(registro.VRRECCONVENIO) && registro.NUCPF) {
        //         tipoDesconto = 'Desconto Funcionario';
        //     } else if (registro.TXTMOTIVODESCONTO.includes('Ação Comercial') && !Number(registro.VRRECCONVENIO)) {
        //         tipoDesconto = 'Ação Comercial';
        //     } else if (registro.TXTMOTIVODESCONTO.includes('Alçada Gerente') && !Number(registro.VRRECCONVENIO)) {
        //         tipoDesconto = 'Alçada Gerente';
        //     } else if (registro.TXTMOTIVODESCONTO.includes('Cartão PL - Ativação Novos') && !Number(registro.VRRECCONVENIO)) {
        //         tipoDesconto = 'Cartão PL - Ativação Novos';
        //     } else if (registro.TXTMOTIVODESCONTO.includes('Produtos - Defeitos') && !Number(registro.VRRECCONVENIO)) {
        //         tipoDesconto = 'Produtos - Defeitos';
        //     } else if (registro.TXTMOTIVODESCONTO.includes('Produtos - Divergência de Preço') && !Number(registro.VRRECCONVENIO)) {
        //         tipoDesconto = 'Produtos - Divergência de Preço';
        //     } else {
        //         tipoDesconto = 'Outros';
        //     }
        
        //     let listaVendas = {
        //         "IDVENDA": registro.IDVENDA,
        //         "MATOPERADORFECHAMENTO": registro.MATOPERADORFECHAMENTO,
        //         "OPERADORFECHAMENTO": registro.OPERADORFECHAMENTO,
        //         "NOFANTASIA": registro.NOFANTASIA,
        //         "IDEMPRESA": registro.IDEMPRESA,
        //         "TIPODESCONTO": tipoDesconto,
        //         "TXTMOTIVODESCONTO": registro.TXTMOTIVODESCONTO,
        //         "VRTOTALPAGO": registro.VRTOTALPAGO,
        //         "DTHORAFECHAMENTO": registro.DTHORAFECHAMENTO,
        //         "VALORTOTALPRODUTOBRUTO": registro.VALORTOTALPRODUTOBRUTO,
        //         "VRDESCONTO": registro.VRDESCONTO,
        //         "TOTALLIQUIDO": registro.TOTALLIQUIDO
        //     };
        
        //     data.push(listaVendas);
        // }
        
        // result.data = data;

        return result;

        
    } catch (e) {
        throw new Error(e.message);
    }
}