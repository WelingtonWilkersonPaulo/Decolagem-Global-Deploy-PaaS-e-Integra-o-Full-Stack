require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// --- CONFIGURAÇÕES DE MIDDLEWARE (IMPORTANTE PARA PRODUÇÃO) ---
app.use(cors()); // Permite que seu Front-end (Vercel/GitHub Pages) acesse o Back-end (Render)
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Inicialização da IA com a chave que será configurada no Painel do Render
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- ROTA DE STATUS (GET) - Exigência do Professor para conferência ---
app.get('/api/status', (req, res) => {
    res.status(200).json({ 
        status: "Servidor da IA Operacional na Nuvem (Render)",
        agente: "Homem-Aranha 🕸️",
        modelo: "Gemini 2.5 Flash",
        ambiente: "Produção"
    });
});

// --- ROTA DE CHAT (POST) - A alma do Agente Inteligente ---
app.post('/api/chat', async (req, res) => {
    try {
        // 1. Validação dos dados de entrada (Critério de Aceite: Status 400)
        if (!req.body || !req.body.pergunta) {
            return res.status(400).json({ 
                erro: "Requisição inválida. Envie o campo 'pergunta' no formato JSON." 
            });
        }

        const { pergunta } = req.body;
        console.log(`📩 Pergunta recebida na nuvem: ${pergunta}`);

        // 2. Configuração do Modelo Atualizado (Gemini 2.5 Flash)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

        const persona = "Você é o Homem-Aranha. Responda de forma heróica, engraçada e use gírias de teia e sentido aranha.";
        
        const result = await model.generateContent(`${persona}\nPergunta: ${pergunta}`);
        const respostaDaIA = result.response.text();

        console.log("🤖 IA Respondeu com sucesso via Render!");

        // 3. Resposta de Sucesso (Critério de Aceite: Status 200 e campo 'resposta')
        return res.status(200).json({ 
            sucesso: true,
            resposta: respostaDaIA 
        });

    } catch (error) {
        console.error("❌ Erro no Servidor Cloud:", error.message);

        // Tratamento de limite de requisições (Status 429)
        if (error.message.includes("429")) {
            return res.status(429).json({ 
                erro: "O sentido aranha avisou: limite de requisições excedido. Tente em alguns instantes." 
            });
        }

        return res.status(500).json({ erro: "Erro interno ao processar a resposta da IA na nuvem." });
    }
});

// --- LIGANDO O SERVIDOR (DINÂMICO PARA PAAS) ---
// O Render define a porta automaticamente na variável process.env.PORT
const PORTA = process.env.PORT || 3000;

app.listen(PORTA, () => {
    console.log(`🚀 O Aranha está patrulhando globalmente na porta ${PORTA}`);
    console.log(`📡 Rota disponível para o Front-end: /api/chat`);
});