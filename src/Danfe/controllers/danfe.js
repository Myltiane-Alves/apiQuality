import axios from "axios";
import { dataFormatada } from "../utils/dataFormatada.js";
let url = `http://164.152.245.77:8000/quality/concentrador_homologacao`;

class DanfeControllers {

    async generateDANFE(req, res) {
        try {
            const xmlData = req.body.xmlData; // Assuming XML data is sent in the request body
            if (!xmlData) {
                return res.status(400).json({ error: 'XML data is required' });
            }

            const danfeService = new DanfeService();
            const pdfBuffer = await danfeService.convertXMLToDANFE(xmlData);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="danfe.pdf"',
            });
            res.send(pdfBuffer);
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while generating the DANFE' });
        }
    }
}

export default new DanfeControllers()