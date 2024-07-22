document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const suggestionsContainer = document.getElementById('suggestions');

    let isSuggestionsVisible = true;
    let messageHistory = [];

    function copyCode(button, code) {
        navigator.clipboard.writeText(code).then(() => {
            button.textContent = 'Copiado!';
            setTimeout(() => {
                button.textContent = 'Copiar';
            }, 2000);
        }).catch(err => {
            console.error('Erro ao copiar: ', err);
        });
    }

    function escapeHTML(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    function scrollToBottom() {
        const scrollHeight = chatMessages.scrollHeight;
        const currentScroll = chatMessages.scrollTop;
        const targetScroll = scrollHeight - chatMessages.clientHeight;
        const distance = targetScroll - currentScroll;
        
        if (distance > 0) {
            const duration = 0.1; // Duração da animação em milissegundos
            const start = performance.now();
            
            function step(timestamp) {
                const elapsed = timestamp - start;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = easeOutCubic(progress);
                
                chatMessages.scrollTop = currentScroll + distance * easeProgress;
                
                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            }
            
            requestAnimationFrame(step);
        }
    }
    
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    const observer = new MutationObserver(scrollToBottom);
    observer.observe(chatMessages, { childList: true, subtree: true });

    function addMessage(message, isUser = false, existingElement = null) {
        let messageElement = existingElement || document.createElement('div');
        if (!existingElement) {
            messageElement.classList.add('message');
            messageElement.classList.add(isUser ? 'user-message' : 'bot-message');
            chatMessages.appendChild(messageElement);
        }

        if (!isUser) {
            const typingContainer = document.createElement('div');
            typingContainer.className = 'typing-container';
            const textSpan = document.createElement('span');
            textSpan.className = 'typing-text';
            const cursorSpan = document.createElement('span');
            cursorSpan.className = 'typing-cursor';
            typingContainer.appendChild(textSpan);
            typingContainer.appendChild(cursorSpan);
            messageElement.innerHTML = '';
            messageElement.appendChild(typingContainer);
        } else {
            messageElement.textContent = message;
        }

        scrollToBottom();
        return messageElement;
    }

    function parseMarkdown(text) {
        text = text.replace(/^### (.*$)/gim, '<span class="large-text">$1</span>');
        text = text.replace(/\*\*(.*?)\*\*/g, '<span class="bold-text">$1</span>');
        text = text.replace(/\n/g, '<br>');
        return text;
    }

    function hideSuggestions() {
        if (isSuggestionsVisible) {
            suggestionsContainer.classList.add('fade-out');
            setTimeout(() => {
                suggestionsContainer.style.display = 'none';
            }, 500);
            isSuggestionsVisible = false;
        }
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        userInput.value = '';

        hideSuggestions();

        messageHistory.push({ role: "user", content: message });

        let botMessageElement = addMessage('', false);
        let fullResponse = '';

        try {
            const response = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, history: messageHistory }),
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
                                scrollToBottom();
                                await new Promise(resolve => setTimeout(resolve, 0));
                            }
                        } catch (error) {
                            console.error('Error parsing JSON:', error);
                        }
                    }
                }
                scrollToBottom();
                await new Promise(resolve => setTimeout(resolve, 0));
            }

            // Remover o cursor após a mensagem estar completa
            const cursorElement = botMessageElement.querySelector('.typing-cursor');
            if (cursorElement) {
                cursorElement.remove();
            }

            messageHistory.push({ role: "assistant", content: fullResponse });

            if (messageHistory.length > 10) {
                messageHistory = messageHistory.slice(-10);
            }
        } catch (error) {
            console.error('Error:', error);
            updateBotMessage(botMessageElement, 'Desculpe, ocorreu um erro ao processar sua mensagem.');
        }

        applyHighlighting();
        scrollToBottom();
    }

    function updateBotMessage(element, content) {
        const typingContainer = element.querySelector('.typing-container');
        if (typingContainer) {
            const textSpan = typingContainer.querySelector('.typing-text');
            textSpan.innerHTML = '';
            
            if (content.includes('```')) {
                const parts = content.split(/(```[\s\S]*?```)/);
                parts.forEach(part => {
                    if (part.startsWith('```') && part.endsWith('```')) {
                        const codeBlockContainer = document.createElement('div');
                        codeBlockContainer.className = 'code-block-container';
        
                        const codeBlockHeader = document.createElement('div');
                        codeBlockHeader.className = 'code-block-header';
        
                        const language = part.split('\n')[0].replace('```', '').trim() || 'plaintext';
                        const languageSpan = document.createElement('span');
                        languageSpan.textContent = language;
                        codeBlockHeader.appendChild(languageSpan);
        
                        const copyButton = document.createElement('button');
                        copyButton.textContent = 'Copiar';
                        copyButton.onclick = () => copyCode(copyButton, codeContent);
                        codeBlockHeader.appendChild(copyButton);
        
                        codeBlockContainer.appendChild(codeBlockHeader);
        
                        const codeBlock = document.createElement('pre');
                        const codeElement = document.createElement('code');
                        const codeContent = part.replace(/```[\s\S]*?\n/, '').replace(/```$/, '');
        
                        codeElement.textContent = codeContent;
                        codeElement.className = `language-${language}`;
        
                        codeBlock.appendChild(codeElement);
                        codeBlockContainer.appendChild(codeBlock);
                        textSpan.appendChild(codeBlockContainer);
                    } else {
                        const parsedText = parseMarkdown(escapeHTML(part));
                        const textElement = document.createElement('div');
                        textElement.innerHTML = parsedText;
                        textSpan.appendChild(textElement);
                    }
                });
            } else {
                textSpan.innerHTML = parseMarkdown(escapeHTML(content));
            }
            
            // Aplica highlighting aos blocos de código
            textSpan.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        } else {
            element.innerHTML = '';
            addMessage(content, false, element);
        }
        scrollToBottom();
    }

    function addSuggestionButtons() {
        const suggestions = [
            { icon: '💡', text: 'História no meu gênero favorito' },
            { icon: '🍖', text: 'Chamar vizinhos pro churrasco' },
            { icon: '🌐', text: 'Crie um site pessoal para mim' },
            { icon: '🏛️', text: 'Pergunte sobre civilizações antigas' }
        ];

        suggestions.forEach(suggestion => {
            const button = document.createElement('button');
            button.innerHTML = `${suggestion.icon} ${suggestion.text}`;
            button.addEventListener('click', () => {
                userInput.value = suggestion.text;
                sendMessage();
            });
            suggestionsContainer.appendChild(button);
        });
    }

    function applyHighlighting() {
        document.querySelectorAll('pre code').forEach((block) => {
            if (!block.classList.contains('hljs')) {
                hljs.highlightElement(block);
            }
        });
        scrollToBottom();
    }

    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    } else {
        console.error('Send button not found');
    }

    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    } else {
        console.error('User input not found');
    }

    addSuggestionButtons();

    window.addEventListener('resize', scrollToBottom);
});

// Configuração do Highlight.js
hljs.configure({ ignoreUnescapedHTML: true });