import { fileURLToPath } from 'url';
import path from 'path';
import { DANFe, DANFCe } from 'node-sped-pdf';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import axios from 'axios';


class DanfeControllers {
    async gerarDanfeLocal(req, res) {
        try {
            const { xml, consulta, idVenda } = req.body;
            if (!xml) {
                return res.status(400).json({ error: 'XML não enviado' });
            }

            // Detecta o modelo pelo XML
            let modelo = '55';
            const match = xml.match(/<mod>(\d+)<\/mod>/);
            if (match && match[1] === '65') modelo = '65';
            console.log(modelo)

            // Extrai apenas o conteúdo <NFe>...</NFe>
            const nfeMatch = xml.match(/<NFe[\s\S]*<\/NFe>/);
            const xmlNFe = nfeMatch ? nfeMatch[0] : xml;

            let pdfBuffer;
            if (modelo === '65') {
                pdfBuffer = await DANFCe({
                    xml: xmlNFe,
                    consulta: consulta || '',
                });
                console.log('DANFCe gerado');
            } else {
                pdfBuffer = await DANFe({
                    xml: xmlNFe,
                    consulta: consulta || '',
                });
                console.log('DANFe gerado');
            }
            // fs.writeFileSync(`DANFE_${idVenda || 'nfe'}.pdf`, pdfBuffer);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="DANFE_${idVenda || 'nfe'}.pdf"`);
            res.end(pdfBuffer);
        } catch (error) {
            console.error('Erro no processo:', error.stack);
            res.status(500).json({ error: error.message });
        }
    }
}

export default new DanfeControllers();