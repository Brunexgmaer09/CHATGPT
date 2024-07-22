document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const suggestionsContainer = document.getElementById('suggestions');

    let isScrollEnabled = true;
    let isUserScrolling = false;

    function enableScroll() {
        isScrollEnabled = true;
        checkScrollPosition();
    }

    function disableScroll() {
        isScrollEnabled = false;
    }

    function checkScrollPosition() {
        const scrollBottom = chatMessages.scrollHeight - chatMessages.clientHeight <= chatMessages.scrollTop + 50;
        if (scrollBottom) {
            scrollToBottom();
        } else {
            showNewMessageIndicator();
        }
    }

    function showNewMessageIndicator() {
        // Exibir um indicador de nova mensagem aqui para o usuário
        console.log('Nova mensagem recebida. Clique para rolar para baixo.'); // Você pode substituir por uma UI adequada.
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatMessages.addEventListener('scroll', () => {
        if (chatMessages.scrollTop + chatMessages.clientHeight < chatMessages.scrollHeight - 50) {
            disableScroll();
            isUserScrolling = true;
        } else {
            enableScroll();
            isUserScrolling = false;
        }
    });

    function addMessage(message, isUser = false, existingElement = null) {
        let messageElement = existingElement || document.createElement('div');
        if (!existingElement) {
            messageElement.classList.add('message');
            messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
            chatMessages.appendChild(messageElement);
        }

        messageElement.innerHTML = isUser ? message : parseMarkdown(message);
        checkScrollPosition(); // Verifica se devemos rolar após adicionar a nova mensagem
        return messageElement;
    }

    //... (restante do seu código)

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        userInput.value = '';
        hideSuggestions();

        let botMessageElement = addMessage('<span class="typing-animation"></span>', false);
        let fullResponse = '';

        try {
            const response = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            break;
                        }
                        try {
                            const parsedData = JSON.parse(data);
                            if (parsedData.content) {
                                fullResponse += parsedData.content;
                                updateBotMessage(botMessageElement, fullResponse);
                            }
                        } catch (error) {
                            console.error('Error parsing JSON:', error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
            updateBotMessage(botMessageElement, 'Desculpe, ocorreu um erro ao processar sua mensagem.');
        }
    }

    //... (restante do seu código, incluindo o botão de enviar e eventos de detecção, etc.)
});
