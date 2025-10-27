export class caixaServices {

    constructor(client) {
        this.client = client;
    }
    async createCaixa({
        IDEMPRESA,
        DSCAIXA,
        NUULTNFCE,
        NUSERIE,
        TBEMISSAOFISCAL,
        NOIMPRESSORA,
        NULINHAIMPRESSORA,
        DSPORTACOMUNICACAO,
        NUBAUD,
        NULINHAENTRECUPOM,
        STIMPRIMIRUMITEMPORLINHA,
        STDANFCERESUMIDO,
        STIGNORARTAGFORMATACAO,
        STIMPRIMIRDESCACRESITEM,
        STVIACONSUMIDOR,
        STTEF,
        STBALANCA,
        STGAVETEIRO,
        STSANGRIA,
        VRMAXSANGRIA,
        STCONTROLAHORARIO,
        HRINICIOLOGIN,
        HRFIMLOGIN,
        STSTATUS,
        DTULTALTERACAO,
        NUSERIEPROD,
        NUNFCEPROD,
        NUSERIEHOM,
        NUNFCEHOM,
        STATIVO,
        VSSISTEMA,
        STATUALIZA,
        STLIMPA
    }) {
        //console.log('NUNFCEPROD no service:', NUNFCEPROD);
        if (!IDEMPRESA) {
            throw new Error('IDEMPRESA obrigatorio');
        }
        if (!DSCAIXA) {
            throw new Error('DSCAIXA obrigatorio');
        }
        if (!TBEMISSAOFISCAL) {
            throw new Error('TBEMISSAOFISCAL obrigatorio');
        }
        if (!NOIMPRESSORA) {
            throw new Error('NOIMPRESSORA obrigatorio');
        }
        if (!DSPORTACOMUNICACAO) {
            throw new Error('DSPORTACOMUNICACAO obrigatorio');
        }
        if (!NUSERIEPROD) {
            throw new Error('NUSERIEPROD obrigatorio e maior que 0');
        }
        if (!NUNFCEPROD) {
            throw new Error('NUNFCEPROD obrigatorio e maior que 0');
        }
        if (!STATUALIZA) {
            throw new Error('STATUALIZA obrigatorio');
        }
        if (!STLIMPA) {
            throw new Error('STLIMPA obrigatorio');
        }

        const result = await this.client.criarCaixa(
            IDEMPRESA,
            DSCAIXA,
            NUULTNFCE,
            NUSERIE,
            TBEMISSAOFISCAL,
            NOIMPRESSORA,
            NULINHAIMPRESSORA,
            DSPORTACOMUNICACAO,
            NUBAUD,
            NULINHAENTRECUPOM,
            STIMPRIMIRUMITEMPORLINHA,
            STDANFCERESUMIDO,
            STIGNORARTAGFORMATACAO,
            STIMPRIMIRDESCACRESITEM,
            STVIACONSUMIDOR,
            STTEF,
            STBALANCA,
            STGAVETEIRO,
            STSANGRIA,
            VRMAXSANGRIA,
            STCONTROLAHORARIO,
            HRINICIOLOGIN,
            HRFIMLOGIN,
            STSTATUS,
            DTULTALTERACAO,
            NUSERIEPROD,
            NUNFCEPROD,
            NUSERIEHOM,
            NUNFCEHOM,
            STATIVO,
            VSSISTEMA,
            STATUALIZA,
            STLIMPA

        );
        return result
    }

    async updateCaixa({
        DSCAIXAWEB,
        TBEMISSAOFISCAL,
        NOIMPRESSORA,
        DSPORTACOMUNICACAO,
        DTULTALTERACAO,
        NUSERIEPROD,
        NUNFCEPROD,
        STTEF,
        STATUALIZA,
        STLIMPA,
        IDCAIXAWEB
    }
    ) {
        if (!DSCAIXAWEB) {
            throw new Error('DSCAIXAWEB obrigatorio');
        }
        if (!TBEMISSAOFISCAL) {
            throw new Error('TBEMISSAOFISCAL obrigatorio');
        }
        if (!NOIMPRESSORA) {
            throw new Error('NOIMPRESSORA obrigatorio');
        }
        if (!DSPORTACOMUNICACAO) {
            throw new Error('DSPORTACOMUNICACAO obrigatorio');
        }
        if (!DTULTALTERACAO) {
            throw new Error('DTULTALTERACAO obrigatorio');
        }
        if (!NUSERIEPROD) {
            throw new Error('NUSERIEPROD obrigatorio');
        }
        if (!NUNFCEPROD) {
            throw new Error('NUNFCEPROD obrigatorio');
        }
        if (!STTEF) {
            throw new Error('STTEF obrigatorio');
        }
        if (!STATUALIZA) {
            throw new Error('STATUALIZA obrigatorio');
        }
        if (!STLIMPA) {
            throw new Error('STLIMPA obrigatorio');
        }
        if (!IDCAIXAWEB) {
            throw new Error('IDCAIXAWEB obrigatorio');
        }

        const result = await this.client.atualizarCaixa(
            DSCAIXAWEB,
            TBEMISSAOFISCAL,
            NOIMPRESSORA,
            DSPORTACOMUNICACAO,
            DTULTALTERACAO,
            NUSERIEPROD,
            NUNFCEPROD,
            STTEF,
            STATUALIZA,
            STLIMPA,
            IDCAIXAWEB
        );

        //console.log(IDCAIXAWEB, 'idcaixaweb');
        return result
    }


    async updateEmpresaDiario({
        IDEMPRESA,
        HORAATUALIZA,
        STATUALIZADIARIO,
        STLOJAABERTA,
        IDFUNCIONARIOSUPERVISOR,
    }
    ) {
        if (!IDEMPRESA) {
            throw new Error('DSCAIXAWEB obrigatorio');
        }
        if (!HORAATUALIZA) {
            throw new Error('DSCAIXAWEB obrigatorio');
        }
        if (!STATUALIZADIARIO) {
            throw new Error('DSCAIXAWEB obrigatorio');
        }
        if (!STLOJAABERTA) {
            throw new Error('DSCAIXAWEB obrigatorio');
        }
        if (!IDFUNCIONARIOSUPERVISOR) {
            throw new Error('DSCAIXAWEB obrigatorio');
        }
        const result = await this.client.atualizarCaixa(
            IDEMPRESA,
            HORAATUALIZA,
            STATUALIZADIARIO,
            STLOJAABERTA,
            IDFUNCIONARIOSUPERVISOR,
        );

        //console.log(IDCAIXAWEB, 'idcaixaweb');
        return result
    }

    async updateEmpresaDiario({
        IDEMPRESA,
        HORAATUALIZA,
        STATUALIZADIARIO,
        STLOJAABERTA,
        IDFUNCIONARIOSUPERVISOR,
    }
    ) {
        if (!IDEMPRESA) {
            throw new Error('IDEMPRESA obrigatorio');
        }
        if (!HORAATUALIZA) {
            throw new Error('HORAATUALIZA obrigatorio');
        }
        if (!STATUALIZADIARIO) {
            throw new Error('STATUALIZADIARIO obrigatorio');
        }
        if (!STLOJAABERTA) {
            throw new Error('STLOJAABERTA obrigatorio');
        }
 
        const result = await this.client.atualizarEmpresaDiario(
            IDEMPRESA,
            HORAATUALIZA,
            STATUALIZADIARIO,
            STLOJAABERTA,
            IDFUNCIONARIOSUPERVISOR,
        );

        //console.log(IDCAIXAWEB, 'idcaixaweb');
        return result
    }

    async updaterTodosCaixas({
        STATUALIZA,
        STLIMPAR,
    }
    ) {

        const result = await this.client.atualizarTodosCaixas(
            STATUALIZA,
            STLIMPAR,
        );
        //console.log(IDCAIXAWEB, 'idcaixaweb');
        return result
    }

}
