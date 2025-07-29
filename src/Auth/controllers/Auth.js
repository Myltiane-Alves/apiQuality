import axios from "axios";
import { autenticacaoUsuario } from "../../Usuarios/repositories/autenticacaoUsuario.js";

class AuthentiCationController {
  async login(req, res) {
    const { usuario, senha, modulo, empusuario } = req.body;
    
    try {
      const loginResponse = await axios.post(
        "http://164.152.245.77:8000/quality/concentrador_homologacao/api/login-tst.xsjs",
        {
          timeout: 10000,
          usuario: usuario,
          senha: senha,
          modulo: modulo,
          empusuario: empusuario,
        }
      );
      // const loginResponse = await autenticacaoUsuario(
     
      //   {
      //     timeout: 10000,
      //     usuario: usuario,
      //     senha: senha,
      //     modulo: modulo,
      //     empusuario: empusuario,
      //   }
      // );

      const token = loginResponse.data;
 
      // console.log(loginResponse.data, 'loginResponse.data');

      if (!token) {
        return res
          .status(401)
          .json({ error: "Credenciais inválidas ou token não recebido" });
      }

    
      return res.json(token);
    } catch (error) {
      console.error("Erro ao se conectar à API externa:", error);
      return res
        .status(500)
        .json({ error: "Erro ao se conectar à API externa" });
    }
  }


  // async login2(req, res) {
  //   const { usuario, senha, modulo, empusuario } = req.body;
    
  //   try {
  //     // const loginResponse = await axios.post(
  //     //   "http://164.152.245.77:8000/quality/concentrador_react_node/api/login.xsjs",
  //     //   {
  //     //     timeout: 10000,
  //     //     usuario: usuario,
  //     //     senha: senha,
  //     //     modulo: modulo,
  //     //     empusuario: empusuario,
  //     //   }
  //     // );

  //     const loginResponse = await autenticacaoUsuario(
     
  //       {
  //         timeout: 10000,
  //         usuario: usuario,
  //         senha: senha,
  //         modulo: modulo,
  //         empusuario: empusuario,
  //       }
  //     );

  //     const token = loginResponse;
 


  //     if (!token) {
  //       return res
  //         .status(401)
  //         .json({ error: "Credenciais inválidas ou token não recebido" });
  //     }

  //     // localStorage.setItem("token", JSON.stringify(token));
  //     return res.json(token);
  //   } catch (error) {
  //     console.error("Erro ao se conectar à API externa:", error);
  //     return res
  //       .status(500)
  //       .json({ error: "Erro ao se conectar à API externa" });
  //   }
  // }
}

export default new AuthentiCationController();
