async function sendMessage() {
    const input = document.getElementById('user-input');
    const msgDiv = document.getElementById('messages');
    const text = input.value;

    if (!text) return;

    msgDiv.innerHTML += `<div class="msg user"><b>Você:</b> ${text}</div>`;
    input.value = '';
    
    const loadingId = "loading-" + Date.now();
    msgDiv.innerHTML += `<div class="msg ai" id="${loadingId}"><i>🕸️ O Aranha está pensando...</i></div>`;
    msgDiv.scrollTop = msgDiv.scrollHeight;

    try {
        // ATENÇÃO: Mudamos para /api/chat
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pergunta: text }) // Mudamos de message para pergunta
        });

        const data = await response.json();
        
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.remove();

        if (data.sucesso) {
            msgDiv.innerHTML += `
                <div class="msg ai">
                    <b>Aranha:</b> ${data.resposta}
                </div>
            `;
        } else {
            msgDiv.innerHTML += `<div class="msg ai"><b>Erro:</b> ${data.erro}</div>`;
        }
        
        msgDiv.scrollTop = msgDiv.scrollHeight;
    } catch (e) {
        console.error(e);
        document.getElementById(loadingId).innerHTML = "<b>Erro:</b> Falha na conexão com o servidor.";
    }
}