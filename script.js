async function sendMessage() {
    const input = document.getElementById('user-input');
    const msgDiv = document.getElementById('messages');
    const text = input.value;

    if (!text) return;

    msgDiv.innerHTML += `<div class="msg user"><b>Você:</b> ${text}</div>`;
    input.value = '';
    
    const loadingId = "loading-" + Date.now();
    msgDiv.innerHTML += `<div class="msg ai" id="${loadingId}"><i>🕸️ Sentido aranha captando...</i></div>`;
    msgDiv.scrollTop = msgDiv.scrollHeight;

    try {
        const response = await fetch('/api/chat', { // Rota atualizada
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pergunta: text }) // Chave 'pergunta' atualizada
        });

        const data = await response.json();
        
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();

        // Agora usamos data.resposta em vez de data.text
        msgDiv.innerHTML += `
            <div class="msg ai">
                <b>Aranha:</b> ${data.resposta}
                <br>
                <a href="${data.pdfUrl}" target="_blank" class="pdf-link">📥 Baixar Relatório (PDF)</a>
            </div>
        `;
        msgDiv.scrollTop = msgDiv.scrollHeight;
    } catch (e) {
        console.error(e);
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.innerHTML = "<b>Erro:</b> O Duende Verde derrubou o servidor!";
    }
}