import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import danfe from 'danfe-pdf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DanfeControllers {
    // Função para gerar DANFE a partir do XML (usando danfe-pdf localmente)
    async gerarDanfeLocal(xml, idVenda) {
        console.log(xml, idVenda, 'xml, idVenda');
        try {
            if (!xml || typeof xml !== 'string' || xml.trim() === '') {
                throw new Error('XML inválido ou vazio');
            }

            return new Promise((resolve, reject) => {
                danfe(xml, {}, (err, pdfBuffer) => {
                    if (err) {
                        console.error('Erro ao gerar DANFE:', err);
                        return reject(new Error('Falha na geração do DANFE'));
                    }

                    // Opcional: salvar o arquivo em disco
                    const nomeArquivo = `danfe_venda_${idVenda}.pdf`;
                    const caminho = path.join(__dirname, '../danfes', nomeArquivo);
                    
                    
                    // Certifique-se que a pasta /danfes existe
                    fs.writeFileSync(caminho, pdfBuffer);

                    // Retorna o caminho ou o buffer
                    resolve({
                        nome: nomeArquivo,
                        buffer: pdfBuffer,
                        caminho
                    });
                });
            });
        } catch (error) {
            console.error('Erro ao gerar DANFE:', error);
            throw new Error(`Erro ao gerar DANFE: ${error.message}`);
        }
    }
}

export default new DanfeControllers();
