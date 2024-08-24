document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const suggestionsContainer = document.getElementById('suggestions');
    
    
    let isSuggestionsVisible = true;
    let messageHistory = [];
    
    function copyCode(button, code) {
        // Remover a primeira linha (identificador de linguagem) e a segunda linha (se for "Copiar")
        const lines = code.split('\n');
        const codeContent = lines.slice(lines[1].trim() === 'Copiar' ? 2 : 1).join('\n').trim();
        
        navigator.clipboard.writeText(codeContent).then(() => {
            button.textContent = 'Copiado!';
            setTimeout(() => {
                button.textContent = 'Copiar';
            }, 2000);
        }).catch(err => {
            console.error('Erro ao copiar: ', err);
        });
    }
    
function detectLanguage(code) {
    // Normaliza o código removendo comentários e strings
    const cleanCode = code.replace(/\/\/.*|\/\*[\s\S]*?\*\/|'(?:\\.|[^\\'])*'|"(?:\\.|[^\\"])*"/g, '');

    // Map de expressões regulares para identificar as linguagens
    const languagePatterns = new Map([
        ['html', /<!DOCTYPE html>|<html>/],
        ['cpp', /(?:#include\b.*|int\s+main\s*\(\s*\))/],
        ['csharp', /(?:using\s+System;|namespace\s+\w+|class\s+\w+|public\s+static\s+void\s+Main\s*\()/],
        ['javascript', /\b(?:const|let|var|function|=>|console\.log|if|for|while)\b/],
        ['python', /\b(?:def|import|class|print|if)\b.*:/],
        ['css', /(?:\{|\}):|[a-z-]+:/],
        ['java', /\b(?:public\s+class|void\s+main|System\.out\.println)\b/],
        ['php', /(?:<\?php|\$\w+|\becho\b|function\s+\w+)/],
        ['ruby', /\b(?:def|class|puts|require|attr_accessor)\b/],
        ['go', /\b(?:func\s+\w+|package\s+\w+|import\s+\(\s*fmt\s*\.\s*)\b/],
        ['rust', /\b(?:fn\s+\w+|let\s+mut|struct\s+\w+|impl\s+|use\s+\w+)\b/],
        ['swift', /\b(?:func|var|let|class|import\s+Foundation)\b/],
        ['kotlin', /\b(?:fun|val|var|class|package)\b/],
        ['typescript', /\b(?:interface|type|export|import\s+.*from)\b/],
        ['sql', /\b(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|CREATE\s+TABLE)\b/i],
        ['powershell', /\$\w+\s*=|\$PSVersionTable|Write-Host|Get-\w+/],
        ['markdown', /(^#{1,6}\s|^\*\s|\[.*\]\(.*\))/m]
    ]);

    // Itera sobre o Map e retorna a primeira linguagem detectada
    for (const [language, pattern] of languagePatterns) {
        if (pattern.test(cleanCode)) {
            return language;
        }
    }

    // Retorna 'plaintext' se nenhuma linguagem específica for identificada
    return 'plaintext';
    }
    
    function createCodeBlock(code) {
        const codeBlockContainer = document.createElement('div');
        codeBlockContainer.className = 'code-block-container';
    
        const codeBlockHeader = document.createElement('div');
        codeBlockHeader.className = 'code-block-header';
    
        const lines = code.split('\n');
        const languageIdentifier = lines[0].trim();
        const language = detectLanguage(code);
    
        const languageSpan = document.createElement('span');
        languageSpan.textContent = languageIdentifier;
        codeBlockHeader.appendChild(languageSpan);
    
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copiar';
        copyButton.onclick = () => copyCode(copyButton, code);
        codeBlockHeader.appendChild(copyButton);
    
        codeBlockContainer.appendChild(codeBlockHeader);
    
        const codeBlock = document.createElement('pre');
        const codeElement = document.createElement('code');
        codeElement.className = `language-${language}`;
        
        // Remove a primeira linha (identificador de linguagem) e a segunda linha (se for "Copiar")
        const codeContent = lines.slice(lines.length > 1 && lines[1].trim() === 'Copiar' ? 2 : 1).join('\n').trim();
        
        // Escape de caracteres especiais
        const escapedContent = codeContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    
        codeElement.innerHTML = escapedContent;
    
        codeBlock.appendChild(codeElement);
        codeBlockContainer.appendChild(codeBlock);
    
        return { codeBlockContainer, codeElement };
    }

    function applyHighlightingToElement(element) {
        element.querySelectorAll('pre code').forEach((block) => {
            if (!block.classList.contains('hljs') && !block.classList.contains('language-html')) {
                hljs.highlightElement(block);
            }
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
    
    function isNearBottom() {
        const threshold = 100; // pixels
        const position = chatMessages.scrollTop + chatMessages.clientHeight;
        const height = chatMessages.scrollHeight;
        return height - position <= threshold;
    }

    function scrollToBottom() {
        if (isNearBottom()) {
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 10);
        }
    }
    
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    const observer = new MutationObserver(scrollToBottom);
    observer.observe(chatMessages, { childList: true, subtree: true });
    
    function showIcons(messageElement) {
        const actionsContainer = messageElement.querySelector('.message-actions');
        if (actionsContainer) {
            actionsContainer.classList.remove('hidden');
        }
    }
    
    function hideIcons(messageElement) {
        const actionsContainer = messageElement.querySelector('.message-actions');
        if (actionsContainer && !messageElement.classList.contains('current-message')) {
            actionsContainer.classList.add('hidden');
        }
    }
    
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
    
            // Adiciona os botões de ação
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'message-actions';
    
            const copyButton = createActionButton('copy', 'Copiar mensagem');
            const regenerateButton = createActionButton('redo', 'Regenerar resposta');
            const likeButton = createActionButton('thumbs-up', 'Gostei');
    
            actionsContainer.appendChild(copyButton);
            actionsContainer.appendChild(regenerateButton);
            actionsContainer.appendChild(likeButton);
    
            messageElement.appendChild(actionsContainer);
    
            // Adiciona eventos de mouse para mostrar/ocultar ícones
            messageElement.addEventListener('mouseenter', () => showIcons(messageElement));
            messageElement.addEventListener('mouseleave', () => hideIcons(messageElement));
        } else {
            messageElement.textContent = message;
        }
    
        scrollToBottom();
        return messageElement;
    }
    
    function createActionButton(iconName, title) {
        const button = document.createElement('button');
        button.className = 'action-button';
        button.title = title;
        
        const icon = document.createElement('i');
        icon.className = `fas fa-${iconName}`;
        
        button.appendChild(icon);
        
        button.addEventListener('click', () => handleActionClick(iconName, button));
        
        return button;
    }
    
    function handleActionClick(action, button) {
        const messageElement = button.closest('.message');
        const messageContent = messageElement.querySelector('.typing-text').textContent;
    
        switch (action) {
            case 'copy':
                navigator.clipboard.writeText(messageContent).then(() => {
                    button.querySelector('i').className = 'fas fa-check';
                    setTimeout(() => {
                        button.querySelector('i').className = 'fas fa-copy';
                    }, 2000);
                });
                break;
            case 'redo':
                regenerateResponse(messageElement);
                break;
            case 'thumbs-up':
                likeAnimation(button);
                break;
        }
    }
    
    function regenerateResponse(messageElement) {
        // Encontre a última mensagem do usuário
        const userMessages = Array.from(chatMessages.querySelectorAll('.user-message'));
        const lastUserMessage = userMessages[userMessages.length - 1];
        
        if (lastUserMessage) {
            const lastUserMessageContent = lastUserMessage.textContent;
            
            // Remove a mensagem atual do bot
            messageElement.remove();
    
            // Remove a última mensagem do histórico (que é a resposta do bot)
            messageHistory.pop();
    
            // Chama a função para gerar nova resposta
            sendMessage(lastUserMessageContent);
        }
    }
    
    function likeAnimation(button) {
        button.classList.add('liked');
        setTimeout(() => {
            button.classList.remove('liked');
        }, 1000);
    }
    
    function parseMarkdown(text) {
        // Links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="markdown-link">$1</a>');
        
        // Cabeçalhos
        text = text.replace(/^### (.*$)/gim, '<span class="large-text">$1</span>');
        
        // Negrito
        text = text.replace(/\*\*(.*?)\*\*/g, '<span class="bold-text">$1</span>');
        
        // Quebras de linha
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
    
    let currentModel = 'chatgpt-4o-latest';

    function updateModel() {
        currentModel = document.getElementById('model-select').value;
        document.getElementById('current-model').textContent = `Modelo atual: ${currentModel}`;
        console.log('Modelo atualizado para:', currentModel);
        
        // Limpar o histórico
        messageHistory = [];
        document.getElementById('chat-messages').innerHTML = '';
    }
    
    document.getElementById('model-select').addEventListener('change', updateModel);
    
    async function sendMessage(overrideMessage = null) {
        const message = overrideMessage || userInput.value.trim();
        if (!message) return;
    
        addMessage(message, true);
        userInput.value = '';
    
        hideSuggestions();
    
        messageHistory.push({ role: "user", content: message });
    
        let botMessageElement = addMessage('', false);
        botMessageElement.classList.add('current-message');
        let fullResponse = '';
    
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message, 
                    history: messageHistory,
                    model: currentModel
                }),
            });
    
            if (!response.ok) {
                console.error("Erro na resposta da API:", response.statusText);
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
            }
    
            const cursorElement = botMessageElement.querySelector('.typing-cursor');
            if (cursorElement) {
                cursorElement.remove();
            }
    
            messageHistory.push({ role: "assistant", content: fullResponse });
    
            if (messageHistory.length > 10) {
                messageHistory = messageHistory.slice(-10);
            }
    
            botMessageElement.classList.remove('current-message');
            hideIcons(botMessageElement);
    
            document.querySelectorAll('.message:not(.current-message)').forEach(hideIcons);
    
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
            
            // Limpa o conteúdo existente
            textSpan.innerHTML = '';
            
            // Divide o conteúdo em partes de código e texto normal
            const parts = content.split('```');
            
            parts.forEach((part, index) => {
                if (index % 2 === 0) {
                    // Texto normal
                    const textNode = document.createElement('span');
                    textNode.innerHTML = parseMarkdown(escapeHTML(part));
                    textSpan.appendChild(textNode);
                } else {
                    // Bloco de código
                    const { codeBlockContainer, codeElement } = createCodeBlock(part.trim());
                    textSpan.appendChild(codeBlockContainer);
                }
            });
    
            // Cria um MutationObserver para detectar mudanças no conteúdo
            const observer = new MutationObserver(() => {
                scrollToBottom();
                applyHighlightingToElement(textSpan);
            });
    
            // Configura o observer para observar mudanças no conteúdo
            observer.observe(textSpan, { childList: true, subtree: true, characterData: true });
    
            // Aplica o highlighting inicial
            applyHighlightingToElement(textSpan);
        } else {
            element.innerHTML = parseMarkdown(escapeHTML(content));
        }
        scrollToBottom();
    }
        
    function applyHighlightingToElement(element) {
        element.querySelectorAll('pre code').forEach((block) => {
            if (!block.classList.contains('hljs')) {
                hljs.highlightElement(block);
            }
        });
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
            sendButton.addEventListener('click', () => sendMessage());
        } else {
            console.error('Send button not found');
        }
        
        if (userInput) {
            userInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault(); // Previne a ação padrão (nova linha)
                    sendMessage();
                }
            });
        } else {
            console.error('User input not found');
        }
        
        addSuggestionButtons();
        
        window.addEventListener('resize', scrollToBottom);
        });
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            node.querySelectorAll('pre code').forEach((block) => {
                                hljs.highlightElement(block);
                            });
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });

        // Configuração do Highlight.js
        document.addEventListener('DOMContentLoaded', (event) => {
            hljs.configure({ ignoreUnescapedHTML: true });
            hljs.highlightAll();
        });
