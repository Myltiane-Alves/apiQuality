import axios from "axios";
// import { getFuncionarios  } from "../repositories/funcionario.js";
// import { getTodosFuncionarios } from "../repositories/todos.js";
import 'dotenv/config';
const url = process.env.API_URL;



class FuncionariosControllers {
    async buscarTodosFuncionario(req, res) {
        try {
          const { byId, cpf, empresa, matricula, senha } = req.body; 
        //   const result = await getFuncionarios();
          
          return res.json(result);
        } catch (err) {
          console.error('Erro ao buscar funcionário:', err);
          return res.status(500).json({ message: 'Erro ao buscar funcionário' });
        }
    }

    async createFuncionarios(req, res) {

    }

    async getAllFuncionarios(req, res,) {

        try {
            const funcionariosResponse = await axios.get(`${url}/api/funcionario/todos.xsjs`)

            const funcionarios = funcionariosResponse.data;

            if (!funcionarios) {
                return res.status(401).json({ error: 'Credenciais inválidas ou token não recebido' });
            }

            return res.json(funcionarios); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; // Lança o erro para tratamento posterior, se necessário
        }
    }

    async getListaTodosFuncionarios(req, res,) {
        let { byId, idEmpresa, cpf, matricula, senha, page, pageSize } = req.query;
        try {
            byId = byId ? byId : '';
            idEmpresa = idEmpresa ? idEmpresa : '';
            cpf = cpf ? cpf : '';
            matricula = matricula ? matricula : '';
            senha = senha ? senha : '';
            page = page ? page : '';
            pageSize = pageSize ? pageSize : '';

            const apiUrl = `${url}/api/funcionario/todos.xsjs?idEmpresa=${idEmpresa}&page=${page}&pageSize=${pageSize}`
            const response = await axios.get(apiUrl);
            // const response = await getTodosFuncionarios(byId, idEmpresa, cpf, matricula, senha, page, pageSize);

            return res.json(response.data); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; // Lança o erro para tratamento posterior, se necessário
        }
    }

    async getListaFuncionariosAtivos(req, res,) {
        let { idEmpresa } = req.query;
        try {
            const apiUrl = `${url}/api/funcionario/funcionario-ativo-por-empresa.xsjs?idEmpresa=${idEmpresa}`
            const response = await axios.get(apiUrl);

            return res.json(response.data); 
        } catch (error) {
            console.error("Erro no FuncionariosControllers getListaFuncionariosAtivos:", error);
            return res.status(500).json({ error: 'Erro ao buscar funcionários ativos' });
            
        }
    }

    async getAutorizacaoVoucherFuncionarios(req, res,) {
        let { matricula, senha } = req.query;
        
        try {
            const funcionariosResponse = await axios.get(`${url}/api/funcionario/todos.xsjs?matricula=${matricula}&senha=${senha}`)

            const funcionarios = funcionariosResponse.data;

            if (!funcionarios) {
                return res.status(401).json({ error: 'Credenciais inválidas ou token não recebido' });
            }

            return res.json(funcionarios); // Retorna
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; // Lança o erro para tratamento posterior, se necessário
        }
    }
    async getAdiantamentoFuncionario(req, res,) {
        let { idFuncionario } = req.query;
        
        try {
            const funcionariosResponse = await axios.get(`${url}/api/adiantamento-salarial.xsjs?id=${idFuncionario}`)

            const funcionarios = funcionariosResponse.data;

            if (!funcionarios) {
                return res.status(401).json({ error: 'Credenciais inválidas ou token não recebido' });
            }

            return res.json(funcionarios); 
        } catch (error) {
            console.error("Unable to connect to the database:", error);
            throw error; 
        }
    }

}

export default new FuncionariosControllers();