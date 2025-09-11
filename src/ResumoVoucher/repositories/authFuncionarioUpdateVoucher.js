// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const createAuthFuncionarioUpdateVoucher = async (data) => {
    const { MATRICULA, SENHA, IDGRUPOEMPRESARIAL, IDEMPRESALOGADA, IDVOUCHER, STSTATUS } = data[0] || {};

    
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
    
    const funcAutorizadasUpdateAte32Dias = [
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA',
        'OPERADORA DE CAIXA',
        'OPERADOR DE CAIXA',
        'OPERADOR(A) DE CAIXA'
    ];
    
    const funcAutorizadasUpdateAte60Dias = [
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA',
    ];
    
    const funcAutorizadasUpdateAte180Dias = [
        'TI',
        'SUPERVISOR',
    ];
    
    const statusVoucherNaoAutorizados = [
        'NOVO',
        'LIBERADO PARA O CLIENTE',
        'FINALIZADO',
        'NEGADO',
        'CANCELADO',
    ]

    try {
        if (!MATRICULA) throw new Error('A MATRICULA é uma informação obrigatória');
        if (!SENHA) throw new Error('A SENHA é uma informação obrigatória');
        if (!IDGRUPOEMPRESARIAL) throw new Error('A identificação do Grupo Empresarial é uma informação obrigatória');
        if (!IDEMPRESALOGADA) throw new Error('A identificação de Empresa Logada é uma informação obrigatória');
        if (!IDVOUCHER) throw new Error('A identificação do Voucher é uma informação obrigatória');

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

    let queryVoucher = `
          SELECT 
            TBR.IDRESUMOVENDAWEB,
            (SELECT DTHORAFECHAMENTO FROM "${databaseSchema}".VENDA WHERE IDVENDA = TBR.IDRESUMOVENDAWEB AND STCANCELADO = 'False') AS DTHORAFECHAMENTO,
            TBR.STSTATUS,
            TBR.STTIPOTROCA,
            TBR.STDEVOLUCAOSAP,
            TO_DATE(TBR.DTINVOUCHER) AS DTINVOUCHER,
            ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(TBR.DTINVOUCHER))) AS DIAS_APOS_CRIACAO
        FROM
            "${databaseSchema}".RESUMOVOUCHER TBR
        WHERE 
            TBR.IDVOUCHER = ?
    `;


        const statementFunc = await conn.prepare(queryFunc);
        const dataFunc = await statementFunc.exec([MATRICULA, SENHA]);
      
        const statementVenda = await conn.prepare(queryVoucher);
        const dadosVoucher = await statementVenda.exec([IDVOUCHER]);
    
  

        if(!dadosVoucher.length){
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

        const dataHoraVenda = new Date(dadosVoucher[0].DTHORAFECHAMENTO);
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
       
            if(diferencaEmDias > 32 && diferencaEmDias <= 60 && !funcAutorizadasUpdateAte60Dias.includes(dataFunc[0].DSFUNCAO.toUpperCase().trim())){
                throw {
                    message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja!'
                }
            }
       
            if(dadosVoucher[0].STTIPOTROCA !== 'DEFEITO') {
            
                if(diferencaEmDias > 60 && !funcAutorizadasUpdateAte180Dias.includes(dataFunc[0].DSFUNCAO.toUpperCase().trim())) {
                    throw {
                        message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com a Supervisão!'
                    }
                }
            }

            if((dataFunc[0].IDGRUPOEMPRESARIAL == 4 || IDGRUPOEMPRESARIAL == 4)){
                if(!funcAutorizadasUpdateAte60Dias.includes(dataFunc[0].DSFUNCAO.toUpperCase().trim())) {
                    throw {
                        message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja!'
                    }
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


