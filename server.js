require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json()); // Essencial para o req.body funcionar

// Garante que as pastas existam
const downloadsPath = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsPath)) fs.mkdirSync(downloadsPath);

app.use(express.static('public'));
app.use('/downloads', express.static('downloads'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Função para gerar o PDF
function criarPdfMissao(pergunta, resposta) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const fileName = `missao_${Date.now()}.pdf`;
        const filePath = path.join(downloadsPath, fileName);
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);
        doc.fillColor('red').fontSize(22).text("Relatório do Amigão da Vizinhança", { align: 'center' });
        doc.moveDown();
        doc.fillColor('black').fontSize(12).text(`Pergunta: ${pergunta}`);
        doc.moveDown();
        doc.text(`Resposta: ${resposta}`);
        doc.end();

        stream.on('finish', () => resolve(fileName));
        stream.on('error', reject);
    });
}

// --- ROTAS DA ATIVIDADE ---

// Desafio Extra: Rota de Status (GET)
app.get('/api/status', (req, res) => {
    res.json({ status: "Servidor da IA Operacional 🕸️" });
});

// Rota Principal: Chat (POST)
app.post('/api/chat', async (req, res) => {
    try {
        // 1. Recebe a 'pergunta' do corpo da requisição (Requisito da Atividade)
        const { pergunta } = req.body;

        // 2. Tratamento de erro (Requisito da Atividade)
        if (!pergunta) {
            return res.status(400).json({ erro: "Você precisa enviar uma 'pergunta' no formato JSON." });
        }

        console.log(`📩 Pergunta do cidadão: "${pergunta}"`);

        // 3. Configuração da IA (Usando gemini-1.5-flash conforme pedido)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const persona = "Você é o Homem-Aranha. Responda de forma heróica e engraçada, use gírias de teia.";
        
        const result = await model.generateContent(`${persona}\nPergunta: ${pergunta}`);
        const textoResposta = result.response.text();

        // 4. Gera o PDF (Mantendo seu recurso extra)
        const pdfFile = await criarPdfMissao(pergunta, textoResposta);

        // 5. Devolve o JSON no formato solicitado (Requisito: sucesso e resposta)
        return res.status(200).json({ 
            sucesso: true,
            resposta: textoResposta,
            pdfUrl: `/downloads/${pdfFile}` 
        });

    } catch (error) {
        console.error("❌ Erro:", error.message);
        return res.status(500).json({ erro: "Erro interno no servidor de IA." });
    }
});

// O Render define a porta automaticamente através de process.env.PORT
// Se não houver essa variável (ex: rodando no seu PC), ele usa a 3000
const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
    console.log(`🚀 O Aranha está patrulhando na porta ${PORTA}`);
});