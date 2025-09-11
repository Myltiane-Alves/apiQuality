// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const createAuthFuncionarioCreateVoucher = async (data) => {
    const { MATRICULA, SENHA, IDGRUPOEMPRESARIAL, IDEMPRESALOGADA, IDVENDA, STTIPOTROCA } = data[0] || {};

    
    const funcAutorizadasAcesso = [
        'TI',
        'SUPERVISOR',
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA',
        'OPERADORA DE CAIXA',
        'OPERADOR DE CAIXA',
        'OPERADOR(A) DE CAIXA'
    ];

    const funcAutorizadasCreateAte32Dias = [
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA',
        'OPERADORA DE CAIXA',
        'OPERADOR DE CAIXA',
        'OPERADOR(A) DE CAIXA'
    ];

    const funcAutorizadasCreate60Ate180Dias = [
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA'
    ];

    const funcAutorizadasCreateNaFCAte180Dias = [
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA'
    ];

    try {
        if (!MATRICULA) throw new Error('A MATRICULA é uma informação obrigatória');
        if (!SENHA) throw new Error('A SENHA é uma informação obrigatória');
        if (!IDEMPRESALOGADA) throw new Error('A identificação de Empresa Logada é uma informação obrigatória');
        if (!IDGRUPOEMPRESARIAL) throw new Error('A identificação do Grupo Empresarial é uma informação obrigatória');
        if (!IDVENDA) throw new Error('A identificação da Venda é uma informação obrigatória');

    let queryFunc = `
        SELECT
            tbf.IDFUNCIONARIO,
            TBE.IDGRUPOEMPRESARIAL,
            TBE.IDSUBGRUPOEMPRESARIAL,
            tbf.IDEMPRESA,
            tbf.NOFUNCIONARIO,
            tbf.IDPERFIL,
            tbf.NUCPF,
            UPPER(tbf.DSFUNCAO) as DSFUNCAO,
            tbf.STATIVO
        FROM
            "${databaseSchema}".FUNCIONARIO tbf
        INNER JOIN "${databaseSchema}".EMPRESA TBE ON
            TBF.IDEMPRESA = TBE.IDEMPRESA
        WHERE
            tbf.NOLOGIN = ?
            AND tbf.PWSENHA = ?
            AND tbf.STATIVO = 'True' 
    `;

    let queryVenda = `
        SELECT
            TBV.DTHORAFECHAMENTO,
            TBE.IDGRUPOEMPRESARIAL,
            TBE.IDEMPRESA
        FROM
            "${databaseSchema}".VENDA TBV
        INNER JOIN "${databaseSchema}".EMPRESA TBE ON
            TBV.IDEMPRESA = TBE.IDEMPRESA
        WHERE
            TBV.IDVENDA = ?
            AND TBV.STCANCELADO = 'False'
    `;

    let queryEmpresaLogada = `
        SELECT
            TBE.IDEMPRESA,
            TBE.IDGRUPOEMPRESARIAL
        FROM
            "${databaseSchema}".EMPRESA TBE
        WHERE
            TBE.IDEMPRESA = ?
    `;

        const statementFunc = await conn.prepare(queryFunc);
        const dataFunc = await statementFunc.exec([MATRICULA, SENHA]);
      
        const statementVenda = await conn.prepare(queryVenda);
        const dataVenda = await statementVenda.exec([IDVENDA]);
    
        const statementEmpresaLogada = await conn.prepare(queryEmpresaLogada);
        const dataEmpresaLogada = await statementEmpresaLogada.exec([IDEMPRESALOGADA]);
        
        if(!dataEmpresaLogada.length){
            throw {
                message: 'Empresa do Usuario Não Encontrada!'
            }
        }
        
        if(!dataVenda.length){
            throw {
                message: 'Venda Não Localizada'
            }
        }
        
        if(!dataFunc.length){
           throw {
                message: 'Matricula ou senha inválidos!'
           }
        }
      
        if(!funcAutorizadasAcesso.includes(dataFunc[0].DSFUNCAO.trim())){
            throw {
                message: 'ACESSO NEGADO! Usuário Sem Permissão!'
            }
        }

        if (IDGRUPOEMPRESARIAL !== dataVenda[0].IDGRUPOEMPRESARIAL) {
            throw new Error('ACESSO NEGADO! Esta Venda Não Pertence a Nenhuma Loja do Grupo!');
        }

        if (IDGRUPOEMPRESARIAL !== dataEmpresaLogada[0].IDGRUPOEMPRESARIAL) {
            throw new Error('ACESSO NEGADO! Grupo Empresarial da Loja Divergente, Entre Em Contato Com o Suporte!');
        }

        const dataHoraVenda = new Date(dataVenda[0].DTHORAFECHAMENTO);
        const dataHoraAtual = new Date();
        dataHoraVenda.setUTCHours(0, 0, 0, 0);
        dataHoraAtual.setUTCHours(0, 0, 0, 0);

        const diferencaEmDias = Math.ceil(Math.abs(dataHoraAtual - dataHoraVenda) / (1000 * 60 * 60 * 24));
        if (diferencaEmDias > 180) {
            throw new Error(`ACESSO NEGADO! Venda fora do Prazo de Troca! DIAS PASSADOS APÓS A VENDA: ${diferencaEmDias} Dias`);
        }


        if (dataFunc[0].DSFUNCAO.trim() !== 'TI') {

            if (dataFunc[0].DSFUNCAO.trim() !== 'SUPERVISOR') {
                if (IDEMPRESALOGADA !== dataFunc[0].IDEMPRESA) {
                    throw new Error('ACESSO NEGADO! Usuário Sem Permissão Nessa Loja, Fale Com o Gerente, Subgerente ou Líder de Loja!');

                }

                if (IDGRUPOEMPRESARIAL !== dataFunc[0].IDGRUPOEMPRESARIAL) {
                    throw new Error('ACESSO NEGADO! Usuário Sem Permissão Em Lojas Deste Grupo Empresarial, Fale Com o Gerente, Subgerente ou Líder de Loja!');
                }
            }
            if (diferencaEmDias > 32 && !funcAutorizadasCreate60Ate180Dias.includes(dataFunc[0].DSFUNCAO.trim())) {
                throw new Error(`Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja! DIAS PASSADOS APÓS A VENDA: ${diferencaEmDias} Dias`);
            }
            if (diferencaEmDias > 90 && STTIPOTROCA === 'DEFEITO') {

                throw new Error(`ACESSO NEGADO! Venda Fora do Prazo de Troca por DEFEITO! DIAS PASSADOS APÓS A VENDA: ${diferencaEmDias}, Fale Com o Suporte!`);
            }

            if ((dataFunc[0].IDGRUPOEMPRESARIAL == 4 || IDGRUPOEMPRESARIAL == 4)) {
                if (!funcAutorizadasCreateNaFCAte180Dias.includes(dataFunc[0].DSFUNCAO.trim())) {
                    throw new Error('Usuário Sem Permissão, Contate o Gerente');
                }

            }
        }

        conn.commit();
        return { data: dataFunc };


    } catch (error) {
        console.error('Erro ao executar a atualização de funcionários:', error);
        throw error;
    }
};


