import axios from "axios";
import menuFilhoSchema from "../schema/schemaMenuFIlho.js";
import { menuFilhoServices } from "../service/serviceMenuFilho.js";
import { MenuFilhoClient } from "../client/clientMenuFilho.js";

const menuFilhoClient = new MenuFilhoClient(process.env.API_URL);
const mFilhoServices = new menuFilhoServices(menuFilhoClient);
class MenuFilhoController {

    async getMenuPai(req, res) {
        let {
            idModulo
        } = req.query;
        idModulo = idModulo ? idModulo : '';
        try {
            const apiUrl = `http://164.152.245.77:8000/quality/concentrador_node/api/perfilUsuario/menuPai.xsjs?id=${idModulo}`

            const response = await axios.get(apiUrl)
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error)
            throw error;
        }
    }

    async getMenuFilho(req, res) {
        let {
            idMenuPai
        } = req.query;
        idMenuPai = idMenuPai ? idMenuPai : '';
        try {
            const apiUrl = `http://164.152.245.77:8000/quality/concentrador_node/api/perfilUsuario/menuFilhos.xsjs?id=${idMenuPai}`

            const response = await axios.get(apiUrl)
            return res.json(response.data);
        } catch (error) {
            console.error("Unable to connect to the database:", error)
            throw error;
        }
    }

    async postMenuFilho(req, res) {

        try {
            const { error, value } = menuFilhoSchema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                return res.status(400).json({
                    message: 'Dados inválidos',
                    errors: error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message
                    }))
                });
            }
            const response = await mFilhoServices.creatMenuFilho({
                DSNOME: value.DSNOME,
                IDMENUPAI: value.IDMENUPAI,
                URL: value.URL,
            });
            return res.status(200).json(response);

        } catch (error) {
            console.error("Erro no MenuFilhoController.postMenuFilho", error);
            return res.status(500).json({ error: "Erro no servidor" });
        }
    }
}

export default new MenuFilhoController();