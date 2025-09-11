import { get } from "http";
// import conn from "../../config/dbConnection.js";
import 'dotenv/config';
const databaseSchema = process.env.HANA_DATABASE;

export const getAtualizaQTDImpressaoVoucher = async (IDFUNCIONARIO, IDVOUCHER) => {
    try {
      const sql = `
       UPDATE 
            "${databaseSchema}"."RESUMOVOUCHER" 
        SET
            QTDIMPRESSAO = (QTDIMPRESSAO + 1),
            USRULTIMPRESSAO = ?
        WHERE 
            "IDVOUCHER" =  ?
          `;
  
        const params = [IDFUNCIONARIO, IDVOUCHER];
      const statement = conn.prepare(sql);
      const result = await statement.exec(params);
  
  
      return {
        rows: result.length,
        data: result
      };
    } catch (error) {
      console.error('Erro ao executar a consulta Atualização de quantidade de impressão de voucher:', error);
      throw error;
    }
};

export const createAuthFuncionarioPrintVoucher = async (data) => {
    const { MATRICULA, SENHA, IDGRUPOEMPRESARIAL, IDEMPRESALOGADA, IDVOUCHER,  } = data[0] || {};

    
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
    
    const stStatusNãoAutorizadosImprimir = [
        'EM ANALISE',
        'NEGADO',
        'CANCELADO',
    ];

    try {
        if (!MATRICULA) throw new Error('A MATRICULA é uma informação obrigatória');
        if (!SENHA) throw new Error('A SENHA é uma informação obrigatória');
        if (!IDEMPRESALOGADA) throw new Error('A identificação de Empresa Logada é uma informação obrigatória');
        if (!IDGRUPOEMPRESARIAL) throw new Error('A identificação do Grupo Empresarial é uma informação obrigatória');
        if(!IDVOUCHER) {
            throw new Error('A identificação do Voucher é uma informação obrigatória');
        }

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
            (SELECT DTHORAFECHAMENTO FROM "${databaseSchema}".VENDA WHERE IDVENDA = TBR.IDRESUMOVENDAWEB AND STCANCELADO = 'False') AS DTHORAFECHAMENTO,
            TBR.*
        FROM
            "${databaseSchema}".RESUMOVOUCHER TBR
        WHERE 
            TBR.IDVOUCHER = ?
    `;
    



        const statementFunc = await conn.prepare(queryFunc);
        const dataFunc = await statementFunc.exec([MATRICULA, SENHA]);
      
        const statementVoucher = await conn.prepare(queryVoucher);
        console.log('IDVOUCHER', IDVOUCHER);
        const dadosVoucher = await statementVoucher.exec([IDVOUCHER]);
        console.log('dadosVoucher', dadosVoucher);

        
        
        if(!dataFunc.length){
           throw {
                message: 'Matricula ou senha inválidos!'
           }
        }

        if(!dadosVoucher.length){
            throw {
                message: 'Voucher não encontrado!'
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


        if(dataFunc[0].DSFUNCAO !== 'TI'){
            if(dataFunc[0].DSFUNCAO.trim() !== 'SUPERVISOR'){
                if(IDEMPRESALOGADA !== dataFunc[0].IDEMPRESA){
                    throw {
                        message: 'ACESSO NEGADO! Usuário Sem Permissão Nessa Loja, Fale Com o Gerente, Subgerente ou Líder de Loja!'
                    }
                }
                
                if(IDGRUPOEMPRESARIAL !== dataFunc[0].IDGRUPOEMPRESARIAL){
                    throw {
                        message: 'ACESSO NEGADO! Usuário Sem Permissão Em Lojas Deste Grupo Empresarial, Fale Com o Gerente, Subgerente ou Líder de Loja!'
                    }
                }
                
                if(dadosVoucher[0].IDEMPRESAORIGEM !== IDEMPRESALOGADA){
                    throw {
                        message: 'ACESSO NEGADO! Este Voucher só Pode Ser Impresso Na Loja de Criação!'
                    }
                }
            }
            
            if(dadosVoucher[0].QTDIMPRESSAO >= 1 && !funcAutorizadasUpdateAte60Dias.includes(dataFunc[0].DSFUNCAO.trim())){
                throw {
                    message: 'ACESSO NEGADO! Somente o Gerente, Subgerente ou Líder de Loja Podem Imprimir a 2ª Via do Voucher!'
                }
            }
             
            if((dataFunc[0].IDGRUPOEMPRESARIAL == 4 || IDGRUPOEMPRESARIAL == 4)){
                if(!funcAutorizadasUpdateAte60Dias.includes(dataFunc[0].DSFUNCAO.trim())) {
                    throw {
                        message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja!'
                    }
                }
            }
            
            if(diferencaEmDias <= 32 && !funcAutorizadasUpdateAte32Dias.includes(dataFunc[0].DSFUNCAO.trim())){
                throw {
                    message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja !'
                }
            }
            
            if(stStatusNãoAutorizadosImprimir.includes(dadosVoucher[0].STSTATUS) || dadosVoucher[0].STCANCELADO == 'True'){
                let stStatus = dadosVoucher[0].STCANCELADO == 'True' && (dadosVoucher[0].STSTATUS !== 'NEGADO' ||  dadosVoucher[0].STSTATUS !== 'CANCELADO') ? 'CANCELADO' : dadosVoucher[0].STSTATUS;
                throw {
                    message: `ACESSO NEGADO! Não é Permitida a Impressão De Voucher Com Status: ${stStatus}!`
                }
            }
        }
        
        getAtualizaQTDImpressaoVoucher(IDVOUCHER, dataFunc[0].IDFUNCIONARIO);
        conn.commit();
        return { data: dataFunc };


    } catch (error) {
        console.error('Erro ao executar a autorização de impressão do voucher:', error);
        throw error;
    }
};


