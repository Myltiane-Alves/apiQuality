import { fileURLToPath } from 'url';
import path from 'path';
import { DANFe, DANFCe } from 'node-sped-pdf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ensureDestInXml(xml) {
    if (!xml.includes('<dest>')) {
        const destFake = `
<dest>
  <CPF>00000000000</CPF>
  <xNome>CONSUMIDOR NÃO IDENTIFICADO</xNome>
  <enderDest>
    <xLgr>NAO INFORMADO</xLgr>
    <nro>0</nro>
    <xBairro>NAO INFORMADO</xBairro>
    <cMun>5300108</cMun>
    <xMun>BRASILIA</xMun>
    <UF>DF</UF>
    <CEP>00000000</CEP>
    <cPais>1058</cPais>
    <xPais>BRASIL</xPais>
  </enderDest>
</dest>`;
        return xml.replace(/<\/emit>/, '</emit>' + destFake);
    }
    return xml;
}

function getModelo(xml) {
    // Extrai o modelo do XML (ex: <mod>65</mod> ou <mod>55</mod>)
    const match = xml.match(/<mod>(\d+)<\/mod>/);
    return match ? match[1] : null;
}

class DanfeControllers {
    async gerarDanfeLocal(req, res) {
        try {
            const { xml, idVenda } = req.body;
            if (!xml || !idVenda) {
                return res.status(400).json({ error: 'XML e ID da venda são obrigatórios.' });
            }

            const modelo = getModelo(xml);
            if (!modelo) {
                return res.status(400).json({ error: 'Não foi possível identificar o modelo do XML.' });
            }

            const xmlCorrigido = ensureDestInXml(xml);

            let pdfBuffer;
            if (modelo === '65') {
                pdfBuffer = await DANFCe({ xml: xmlCorrigido });
            } else if (modelo === '55') {
                pdfBuffer = await DANFe({ xml: xmlCorrigido });
            } else {
                return res.status(400).json({ error: 'Modelo de documento não suportado.' });
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="DANFE_${idVenda}.pdf"`);
            res.send(pdfBuffer);

        } catch (error) {
            console.error('Erro ao gerar DANFE:', error);
            res.status(500).json({ error: 'Erro ao gerar DANFE.' });
        }
    }
}

export default new DanfeControllers();