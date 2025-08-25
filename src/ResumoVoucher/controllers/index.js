
import axios from 'axios';
import { getDetalheVoucherDados } from '../repositories/detalheVoucherDados.js';
import { getDetalheVoucher } from '../repositories/detalheVoucher.js';
import { createAuthFuncionarioCreateVoucher } from '../repositories/authFuncionarioCreateVoucher.js';
import { getEmpresasVoucher } from '../repositories/empresa.js';
import { createAuthFuncionarioPrintVoucher } from '../repositories/authFuncionarioPrintVoucher.js';
import { createAuthFuncionarioUpdateVoucher } from '../repositories/authFuncionarioUpdateVoucher.js';
import 'dotenv/config';
const url = process.env.API_URL;


class ResumoVoucherControllers {

    async getResumoDetalheVoucher(req, res) {
        let { numeroVoucher, dataPesquisaInicio, dataPesquisaFim } = req.query;

    
        numeroVoucher = numeroVoucher ? numeroVoucher : ''
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : ''
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : ''
    
        try {
            // ${url}/api/resumo-voucher/detalhe-voucher-dados.xsjs?page=1&dataPesquisaInicio=2024-01-03&dataPesquisaFim=2024-01-03&subgrupoEmpresa=1&idEmpresa=1
            const apiUrl = `${url}/api/resumo-voucher/detalhe-voucher.xsjs?id=${numeroVoucher}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}`
            const response = await axios.get(apiUrl)
    
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        }
        
    
    }
    async getListaVoucherGerencia(req, res) {
        let { idVoucher, dataPesquisaInicio, dataPesquisaFim, page, pageSize } = req.query;

        if(idVoucher) {
        
            try {
                idVoucher = idVoucher ? idVoucher : ''
                dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : ''
                dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : '' 
                page = page ? page : '' 
                pageSize = pageSize ? pageSize : ''
                const apiUrl = `${url}/api/resumo-voucher/detalhe-voucher.xsjs?id=${idVoucher}`
                const response = await axios.get(apiUrl)
                // const response = await getDetalheVoucher(idVoucher)
        
                if (response.data && response.data.error) {
                    return res.status(400).json({ error: response.data.error });
                }
                return res.json(response.data);
            } catch (error) {
                console.error("Erro no ResumoVoucherControllers.getListaVoucherGerencia:", error);
                throw error;
            }
        }
    
    }

    async getListaDetalheVoucherDados(req, res) {
        let { idSubGrupoEmpresa, idEmpresa, idVoucher, dataPesquisaInicio, dataPesquisaFim, dadosVoucher, stStatus, stTipoTroca, page, pageSize} = req.query;
        
        idSubGrupoEmpresa = idSubGrupoEmpresa ? idSubGrupoEmpresa : ''
        idEmpresa = idEmpresa ? idEmpresa : ''
        idVoucher = idVoucher ? idVoucher : ''
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : ''
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : ''
        dadosVoucher = dadosVoucher ? dadosVoucher : ''
        stStatus = stStatus ? stStatus : ''
        stTipoTroca = stTipoTroca ? stTipoTroca : ''
        page = page ? page : ''
        pageSize = pageSize ? pageSize : ''
        try {
            // ${url}/api/resumo-voucher/detalhe-voucher-dados.xsjs?page=1&dataPesquisaInicio=2024-01-03&dataPesquisaFim=2024-01-03&subgrupoEmpresa=1&idEmpresa=1
            const apiUrl = `${url}/api/resumo-voucher/detalhe-voucher-dados.xsjs?id=${idVoucher}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&dadosVoucher=${dadosVoucher}&subgrupoEmpresa=${idSubGrupoEmpresa}&idEmpresa=${idEmpresa}&stStatus=${stStatus}&page=${page}&pageSize=${pageSize}`
            const response = await axios.get(apiUrl)
            // const response = await getDetalheVoucherDados(idSubGrupoEmpresa, idEmpresa, idVoucher, dataPesquisaInicio, dataPesquisaFim, dadosVoucher, stStatus, stTipoTroca, page, pageSize)
           
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Error in ResumoVoucherControllers.getListaDetalheVoucherDados:", error);
            throw error;
        }
    }

      async getListaVoucherCompleto(req, res) {
        let { idVoucher, numeroVoucher, idSubGrupoEmpresa, idEmpresa, dataPesquisaInicio, dataPesquisaFim, dadosVoucher, stStatus, page, pageSize} = req.query;
        
        idVoucher = idVoucher ? idVoucher : ''
        numeroVoucher = numeroVoucher ? numeroVoucher : ''
        idSubGrupoEmpresa = idSubGrupoEmpresa ? idSubGrupoEmpresa : ''
        idEmpresa = idEmpresa ? idEmpresa : ''
        dataPesquisaInicio = dataPesquisaInicio ? dataPesquisaInicio : ''
        dataPesquisaFim = dataPesquisaFim ? dataPesquisaFim : ''
        dadosVoucher = dadosVoucher ? dadosVoucher : ''
        stStatus = stStatus ? stStatus : ''
        page = page ? page : ''
        pageSize = pageSize ? pageSize : ''
        try {
            // ${url}/api/resumo-voucher/detalhe-voucher-dados.xsjs?page=1&dataPesquisaInicio=2024-01-03&dataPesquisaFim=2024-01-03&subgrupoEmpresa=1&idEmpresa=1
            const apiUrl = `${url}/api/administrativo/voucher-completo.xsjs?id=${idVoucher}&dataPesquisaInicio=${dataPesquisaInicio}&dataPesquisaFim=${dataPesquisaFim}&dadosVoucher=${dadosVoucher}&subgrupoEmpresa=${idSubGrupoEmpresa}&idEmpresa=${idEmpresa}&stStatus=${stStatus}&page=${page}&pageSize=${pageSize}`
            const response = await axios.get(apiUrl)
            // const response = await getVoucherCompleto(idVoucher, numeroVoucher, idSubGrupoEmpresa, idEmpresa, dataPesquisaInicio, dataPesquisaFim, dadosVoucher, stStatus, page, pageSize)
           
            return res.json(response.data); 
        } catch (error) {
            console.error("erro no ResumoVoucherControllers getListaVouchercOMPLETO:", error);
            throw error;
        }
    }

    async getListaEmpresasVoucher(req, res) {
        let { idEmpresa, idSubGrupoEmpresa, page, pageSize } = req.query;

        idEmpresa = idEmpresa ? idEmpresa : '';
        idSubGrupoEmpresa = idSubGrupoEmpresa ? idSubGrupoEmpresa : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';

        try {
            const apiUrl = `${url}/api/resumo-voucher/empresa.xsjs?idEmpresa=${idEmpresa}&idSubGrupoEmpresa=${idSubGrupoEmpresa}&page=${page}&pageSize=${pageSize}`;

            const response = await axios.get(apiUrl);
            // const response = await getEmpresasVoucher(idEmpresa, idSubGrupoEmpresa, page, pageSize);
            
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Error in ResumoVoucherControllers.getListaEmpresasVoucher:", error);
            throw error;    
        
        }
    }

    async getDetalheNumeroVoucherDados(req, res) {
        let { numeroVoucher, idSubGrupoEmpresa } = req.query;

        if(!isNaN(numeroVoucher)) {

            idSubGrupoEmpresa = ''
          
            try {
                
                const apiUrl = `${url}/api/resumo-voucher/detalhe-voucher-dados.xsjs?dadosVoucher=${numeroVoucher}&subgrupoEmpresa=${idSubGrupoEmpresa}`
                const response = await axios.get(apiUrl)
        
                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error)
                throw error;
            }
        }
    
    }
    async getDetalheIDVoucherDados(req, res) {
        let { idVoucher, idSubGrupoEmpresa } = req.query;

        
        idVoucher = idVoucher ? idVoucher : ''
        idSubGrupoEmpresa = idSubGrupoEmpresa ? idSubGrupoEmpresa : ''        
    
        try {
            //api/resumo-voucher/detalhe-voucher-dados.xsjs?id=${idVoucher}&subgrupoEmpresa=${grupoEmpresa}
            const apiUrl = `${url}/api/resumo-voucher/detalhe-voucher-dados.xsjs?id=${idVoucher}&subgrupoEmpresa=${idSubGrupoEmpresa}`
            const response = await axios.get(apiUrl)
    
            return res.json(response.data); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error;
        } 
    
    }
    async getDetalheIDVoucherDadosModal(req, res) {
        let { idVoucher } = req.query;

        if(!isNaN(idVoucher) ) {
            idVoucher = Number(idVoucher)
                    
        
            try {
               
                const apiUrl = `${url}/api/resumo-voucher/detalhe-voucher-dados.xsjs?id=${idVoucher}`
                const response = await axios.get(apiUrl)
        
                return res.json(response.data); // Retorna
            } catch (error) {
                console.error("Unable to connect to the database:", error);
                throw error;
            }
        }
    
    }

      async getListaTodosClientes(req, res) {
        let { idCliente, numeroCpfCnpj, pageSize, page } = req.query;

        idCliente = idCliente ? idCliente : '';
        numeroCpfCnpj = numeroCpfCnpj ? numeroCpfCnpj : '';
        page = page ? page : '';
        pageSize = pageSize ? pageSize : '';

        try {
            const apiUrl = `${url}/api/gerencia/cliente.xsjs?id=${idCliente}&numeroCpfCnpj=${numeroCpfCnpj}&page=${page}&pageSize=${pageSize}`
            const response = await axios.get(apiUrl);


            return res.json(response.data);
        } catch (error) {
            console.error("erro no ResumoVoucherControllers getListaTodosClientes:", error);
            throw error;
        }
    }

    async autorizacaoEditarStatusVoucher(req, res) {
        let {
            MATRICULA,
            SENHA
        } = req.body;

        try {
            const response = await axios.post(`${url}/api/resumo-voucher/autFuncionario.xsjs`, {
                MATRICULA,
                SENHA
            })

            return res.status(200).json({message: 'Usuário autorizado com sucesso!'})
        } catch (error) {
            console.error("Erro Verifique os campos do formulário:", error);
            throw error;
        }
    }

    async postAuthFuncionarioCreateVoucher(req, res) {
        try {
             let {MATRICULA, SENHA, IDEMPRESALOGADA, IDGRUPOEMPRESARIAL, IDVENDA, STTIPOTROCA} = req.body;  
            const response = await axios.post(`${url}/api/resumo-voucher/auth-funcionario-create-voucher.xsjs`, {
                MATRICULA,
                SENHA,
                IDEMPRESALOGADA,
                IDGRUPOEMPRESARIAL,
                IDVENDA,
                STTIPOTROCA
            })

            return res.json(response.data);
        } catch (error) {
            console.error("Error no ResumoVoucherControllers.postAuthFuncionarioCreateVoucher:", error);
            throw error;
        }
    }

    async postAuthFuncionarioPrintVoucher(req, res) {
        try {
            let {MATRICULA, SENHA, IDEMPRESALOGADA, IDGRUPOEMPRESARIAL, IDVOUCHER} = req.body;  
            // const response = await createAuthFuncionarioUpdateVoucher(dados)
            if (!MATRICULA || !SENHA || !IDEMPRESALOGADA || !IDGRUPOEMPRESARIAL || !IDVOUCHER) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
            }
            // const response = await createAuthFuncionarioPrintVoucher(dados)
            const response = await axios.post(`${url}/api/resumo-voucher/auth-funcionario-print-voucher.xsjs`, {
                MATRICULA, 
                SENHA, 
                IDEMPRESALOGADA, 
                IDGRUPOEMPRESARIAL, 
                IDVOUCHER
            })
            
            return res.json(response.data);
        } catch (error) {
            console.error("Error no ResumoVoucherControllers.postAuthFuncionarioPrintVoucher:", error);
            throw error;
        }
    }

    async postAuthFuncionarioUpdateVoucher(req, res) {
        try {
            let { MATRICULA, SENHA, IDEMPRESALOGADA, IDGRUPOEMPRESARIAL, IDVOUCHER } = req.body;
            if (!MATRICULA || !SENHA || !IDEMPRESALOGADA || !IDGRUPOEMPRESARIAL || !IDVOUCHER) {
                return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
            }
            const response = await axios.post(`${url}/api/resumo-voucher/auth-funcionario-update-voucher.xsjs`, {
                MATRICULA,
                SENHA,
                IDEMPRESALOGADA,
                IDGRUPOEMPRESARIAL,
                IDVOUCHER
            });
            return res.json(response.data);
        } catch (error) {
            console.error("Error no ResumoVoucherControllers.postAuthFuncionarioUpdateVoucher:", error);
            // Retorna mensagem de erro mas não lança exceção, permitindo que a API continue rodando normalmente
            return res.status(500).json({ 
                error: error.response?.data || null
            });
        }
    }

    async putCliente(req, res) {
        try {
            let { 
                IDCLIENTE,
                IDEMPRESA,
                DSNOMERAZAOSOCIAL,
                DSAPELIDONOMEFANTASIA,
                TPCLIENTE,
                NUCPFCNPJ,
                NURGINSCESTADUAL,
                NUINSCMUNICIPAL,
                NUCEP,
                NUIBGE,
                EENDERECO,
                NUENDERECO,
                ECOMPLEMENTO,
                EBAIRRO,
                ECIDADE,
                SGUF,
                EEMAIL,
                NUTELCOMERCIAL,
                NUTELCELULAR,
                DTNASCFUNDACAO,
                IDINDICACAOIE,
                DSINDICACAOIE,
                IDFUNCIONARIO 
            } = req.body
   
               if(!IDCLIENTE) {
                return res.status(400).json({ error: 'IDCLIENTE é obrigatório.' });
            }   

            if(!IDFUNCIONARIO) {
                return res.status(400).json({ error: 'IDFUNCIONARIO é obrigatório.' });
            }

            if(!NUCPFCNPJ) {
                return res.status(400).json({ error: 'NUCPFCNPJ é obrigatório.' });
            }

            const response = await axios.put(`${url}/api/gerencia/cliente.xsjs`, {
                IDCLIENTE,
                IDEMPRESA,
                DSNOMERAZAOSOCIAL,
                DSAPELIDONOMEFANTASIA,
                TPCLIENTE,
                NUCPFCNPJ,
                NURGINSCESTADUAL,
                NUINSCMUNICIPAL,
                NUCEP,
                NUIBGE,
                EENDERECO,
                NUENDERECO,
                ECOMPLEMENTO,
                EBAIRRO,
                ECIDADE,
                SGUF,
                EEMAIL,
                NUTELCOMERCIAL,
                NUTELCELULAR,
                DTNASCFUNDACAO,
                IDINDICACAOIE,
                DSINDICACAOIE,
                IDFUNCIONARIO 
            });
    
            return res.status(200).json({ message: 'Cliente atualizado com sucesso!' });
    
        } catch (error) {
            console.error("Erro no ResumoVoucherControllers.putCliente:", error);
            return res.status(400).json({ error: error.message });
        }
    }
    
    async postCliente(req, res) {
        try {
           
            let { 
                IDCLIENTE,
                IDEMPRESA,
                DSNOMERAZAOSOCIAL,
                DSAPELIDONOMEFANTASIA,
                TPCLIENTE,
                NUCPFCNPJ,
                NURGINSCESTADUAL,
                NUINSCMUNICIPAL,
                NUCEP,
                NUIBGE,
                EENDERECO,
                NUENDERECO,
                ECOMPLEMENTO,
                EBAIRRO,
                ECIDADE,
                SGUF,
                EEMAIL,
                NUTELCOMERCIAL,
                NUTELCELULAR,
                DTNASCFUNDACAO,
                IDINDICACAOIE,
                DSINDICACAOIE,
                IDFUNCIONARIO 
            } = req.body
   
            // const response = await createCliente(dados);

            // if(!IDCLIENTE) {
            //     return res.status(400).json({ error: 'IDCLIENTE é obrigatório.' });
            // }   

            // if(!IDFUNCIONARIO) {
            //     return res.status(400).json({ error: 'IDFUNCIONARIO é obrigatório.' });
            // }

            if(!NUCPFCNPJ) {
                return res.status(400).json({ error: 'NUCPFCNPJ é obrigatório.' });
            }

            const response = await axios.post(`${url}/api/gerencia/cliente.xsjs`, {
                IDEMPRESA,
                DSNOMERAZAOSOCIAL,
                DSAPELIDONOMEFANTASIA,
                TPCLIENTE,
                NUCPFCNPJ,
                NURGINSCESTADUAL,
                NUINSCMUNICIPAL,
                NUCEP,
                NUIBGE,
                EENDERECO,
                NUENDERECO,
                ECOMPLEMENTO,
                EBAIRRO,
                ECIDADE,
                SGUF,
                EEMAIL,
                NUTELCOMERCIAL,
                NUTELCELULAR,
                DTNASCFUNDACAO,
                IDINDICACAOIE,
                DSINDICACAOIE,
                IDFUNCIONARIO 
            });
    
            return res.status(200).json(response.data);
        } catch (error) {
            console.error("Erro no ResumoVoucherControllers.postCliente:", error);
            return res.status(400).json({ error: error.message });
        }
    }
    async postResumoVoucher(req, res) {
        try {
            let { 
                IDGRUPOEMPRESARIAL,
                IDEMPRESAORIGEM,
                IDCAIXAORIGEM,
                IDNFEDEVOLUCAO,
                IDUSRINVOUCHER,
                IDVENDEDOR,
                IDCLIENTE,
                NUCPF,
                VRVOUCHER,
                IDRESUMOVENDAWEB,
                STTIPOTROCA,
                MOTIVOTROCA,
                IDUSRLIBERACAOCRIACAO,
                detVoucher,
                produtosVoucher
            } = req.body;

      
            const response = await axios.post(`${url}/api/resumo-voucher/todos-web.xsjs`, {
                IDGRUPOEMPRESARIAL,
                IDEMPRESAORIGEM,
                IDCAIXAORIGEM,
                IDNFEDEVOLUCAO,
                IDUSRINVOUCHER,
                IDVENDEDOR,
                IDCLIENTE,
                NUCPF,
                VRVOUCHER,
                IDRESUMOVENDAWEB,
                STTIPOTROCA,
                MOTIVOTROCA,
                IDUSRLIBERACAOCRIACAO,
                detVoucher,
                produtosVoucher
            });
            console.log(response.data);
            return res.status(200).json(response.data);
        } catch (error) {
            console.error("Erro no ResumoVoucherControllers.postResumoVoucher:", error);
            return res.status(400).json({ error: error.message });
        }
    }
    async putResumoVoucher(req, res) {
        try {
          
            let { STATIVO, STCANCELADO, DSMOTIVOTROCASTATUS, IDFUNCIONARIO, STSTATUS, STTIPOTROCA, IDVOUCHER, IDEMPRESALOGADA, IDGRUPOEMPRESARIAL } = req.body;
   
            // const response = await updateResumoVoucher(dados);

            // if(!IDVOUCHER) {
            //     return res.status(400).json({ error: 'IDVOUCHER é obrigatório.' });
            // }

            // if(!IDEMPRESALOGADA) {
            //     return res.status(400).json({ error: 'IDEMPRESALOGADA é obrigatório.' });
            // }

            // if(!IDFUNCIONARIO) {
            //     return res.status(400).json({ error: 'IDFUNCIONARIO é obrigatório.' });
            // }

            const response = await axios.put(`${url}/api/resumo-voucher/todos-web.xsjs`, {
                STATIVO,
                STCANCELADO,
                DSMOTIVOTROCASTATUS,
                IDFUNCIONARIO,
                STSTATUS,
                STTIPOTROCA,
                IDVOUCHER,
                IDEMPRESALOGADA,
                IDGRUPOEMPRESARIAL
            })

            return res.status(200).json(response.data);
        } catch (error) {
            console.error("Erro no ResumoVoucherControllers.putResumoVoucher:", error);
            return res.status(400).json({ error: error.message });
        }
    }
}


export default new ResumoVoucherControllers();
