document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const suggestionsContainer = document.getElementById('suggestions');
    
    let isSuggestionsVisible = true;
    let messageHistory = [];
    
    function copyCode(button, code) {
        navigator.clipboard.writeText(code).then(() => {
            const originalIcon = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                button.innerHTML = originalIcon;
            }, 2000);
        });
    }

    function detectLanguage(code) {
        if (code.includes('<!DOCTYPE html>') || code.includes('<html>')) {
            return 'html';
        }

        if (code.includes('#include') || code.includes('int main()')) return 'cpp';
        if (code.includes('using System;') || code.includes('namespace ') || code.includes('class ') || code.includes('public static void Main(')) return 'csharp';

        const cleanCode = code.replace(/\/\/.*|\/\*[\s\S]*?\*\/|'(?:\\.|[^\\'])*'|"(?:\\.|[^\\"])*"/g, '');

        const languagePatterns = {
            javascript: /\b(const|let|var|function|=>|console\.log)\b/,
            python: /\b(def|import|class|print)\b/,
            css: /\{\s*[a-z-]+\s*:\s*[^}]+\}/,
            java: /\b(public\s+class|System\.out\.println)\b/,
            php: /\b(<\?php|\$[a-zA-Z_\x7f-\xff])\b/,
            ruby: /\b(def\s+\w+|class\s+\w+|puts)\b/,
            go: /\b(func|package|fmt\.)\b/,
            rust: /\b(fn|let\s+mut|struct|impl)\b/,
            swift: /\b(func|var|let|class|import)\b/,
            kotlin: /\b(fun|val|var|class|package)\b/,
            typescript: /\b(interface|type|export|import)\b/,
            sql: /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|CREATE)\b/i,
            powershell: /\b(\$\w+\s*=|\$PSVersionTable|Get-)\b/,
            markdown: /(^#{1,6}\s|\*|\[.*\]\(.*\))/m
        };

        for (const [language, pattern] of Object.entries(languagePatterns)) {
            if (pattern.test(cleanCode)) {
                return language;
            }
        }

        return 'plaintext';
    }

    function createCodeBlock(code) {
        const codeBlockContainer = document.createElement('div');
        codeBlockContainer.className = 'code-block-container';

        const codeBlockHeader = document.createElement('div');
        codeBlockHeader.className = 'code-block-header';

        const codeBlockTabs = document.createElement('div');
        codeBlockTabs.className = 'code-block-tabs';

        // Mapeamento de aliases de linguagem
        const languageAliases = {
            'assembly': 'x86asm',
            'asm': 'x86asm'
        };

        const lines = code.split('\n');
        const firstLine = lines[0].trim().toLowerCase();
        
        // Verifica se é um alias e usa o mapeamento correspondente
        let language = languageAliases[firstLine] || firstLine;

        const supportedLanguages = [
            'javascript', 'python', 'html', 'css', 'java', 'cpp', 'csharp', 
            'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'typescript', 
            'sql', 'bash', 'plaintext', 'shell', 'powershell', 'x86asm'
        ];

        if (!supportedLanguages.includes(language)) {
            language = 'plaintext';
        }

        const tab = document.createElement('div');
        tab.className = 'code-block-tab active';
        tab.textContent = language.charAt(0).toUpperCase() + language.slice(1);
        codeBlockTabs.appendChild(tab);

        const codeBlockActions = document.createElement('div');
        codeBlockActions.className = 'code-block-actions';
        const copyButton = document.createElement('button');
        copyButton.className = 'code-block-action';
        copyButton.innerHTML = '<i class="fas fa-copy"></i>';
        copyButton.onclick = () => copyCode(copyButton, code);
        codeBlockActions.appendChild(copyButton);

        codeBlockHeader.appendChild(codeBlockTabs);
        codeBlockHeader.appendChild(codeBlockActions);

        const codeBlockContent = document.createElement('div');
        codeBlockContent.className = 'code-block-content';

        const lineNumbers = document.createElement('div');
        lineNumbers.className = 'line-numbers';

        const codeElement = document.createElement('code');
        codeElement.className = `hljs language-${language}`;
        codeElement.textContent = lines.slice(1).join('\n').trim();

        for (let i = 1; i < lines.length; i++) {
            const lineNumber = document.createElement('div');
            lineNumber.textContent = i;
            lineNumbers.appendChild(lineNumber);
        }

        const pre = document.createElement('pre');
        pre.appendChild(codeElement);

        codeBlockContent.appendChild(lineNumbers);
        codeBlockContent.appendChild(pre);

        codeBlockContainer.appendChild(codeBlockHeader);
        codeBlockContainer.appendChild(codeBlockContent);

        return { codeBlockContainer, codeElement };
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
            const messageContainer = document.createElement('div');
            messageContainer.className = 'message-container';
            
            const iconContainer = document.createElement('div');
            iconContainer.className = 'bot-icon';
            const iconImg = document.createElement('img');
            iconImg.src = 'favicon.ico';
            iconImg.alt = 'ChatGPT Icon';
            iconContainer.appendChild(iconImg);
            
            const typingContainer = document.createElement('div');
            typingContainer.className = 'typing-container';
            const textSpan = document.createElement('span');
            textSpan.className = 'typing-text';
            const cursorSpan = document.createElement('span');
            cursorSpan.className = 'typing-cursor';
            typingContainer.appendChild(textSpan);
            typingContainer.appendChild(cursorSpan);
            
            messageContainer.appendChild(iconContainer);
            messageContainer.appendChild(typingContainer);
            messageElement.innerHTML = '';
            messageElement.appendChild(messageContainer);

            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'message-actions hidden';

            const copyButton = createActionButton('copy', 'Copiar mensagem');
            const regenerateButton = createActionButton('redo', 'Regenerar resposta');
            const likeButton = createActionButton('thumbs-up', 'Gostei');

            actionsContainer.appendChild(copyButton);
            actionsContainer.appendChild(regenerateButton);
            actionsContainer.appendChild(likeButton);

            messageElement.appendChild(actionsContainer);

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
        const userMessages = Array.from(chatMessages.querySelectorAll('.user-message'));
        const lastUserMessage = userMessages[userMessages.length - 1];
        
        if (lastUserMessage) {
            const lastUserMessageContent = lastUserMessage.textContent;
            
            messageElement.remove();

            messageHistory.pop();

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
        // Primeiro, escape o HTML
        let escapedText = escapeHTML(text);
    
        // Conversão de Markdown para HTML
        return escapedText
            // Links: [Texto](URL)
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="markdown-link">$1</a>')
            // Cabeçalhos: ### Título
            .replace(/^### (.*)$/gim, '<span class="large-text">$1</span>')
            // Cabeçalhos: ## Título
            .replace(/^## (.*)$/gim, '<h2>$1</h2>')
            // Cabeçalho 1: # Título
            .replace(/^# (.*)$/gim, '<h1>$1</h1>')
            // Negrito: **texto**
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Itálico: *texto*
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Citações: > texto
            .replace(/^> (.*)$/gim, '<blockquote>$1</blockquote>')
            // Listas não ordenadas: * item
            .replace(/^\* (.*)$/gim, '<ul><li>$1</li></ul>')
            // Listas ordenadas: 1. item
            .replace(/^\d+\. (.*)$/gim, '<li class="ordered-list-item">$1</li>')
            // Código em linha: `código`
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Quebras de linha
            .replace(/\n/g, '<br>');
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

    let currentModel = 'gpt-4o-mini-2024-07-18';

    function updateModel() {
        currentModel = document.getElementById('model-select').value;
        console.log('Modelo atualizado para:', currentModel);
        
        // Objeto com informações dos modelos
        const modelInfo = {
            // OpenAI Models
            'gpt-4-turbo': {
                provider: 'OpenAI',
                contextWindow: '128,000 tokens',
                maxOutput: '4,096 tokens',
                trainingData: 'Up to Dec 2023'
            },
            'gpt-4-turbo-2024-04-09': {
                provider: 'OpenAI',
                contextWindow: '128,000 tokens',
                maxOutput: '4,096 tokens',
                trainingData: 'Up to Dec 2023'
            },
            'gpt-4-turbo-preview': {
                provider: 'OpenAI',
                contextWindow: '128,000 tokens',
                maxOutput: '4,096 tokens',
                trainingData: 'Up to Dec 2023'
            },
            'gpt-4-0125-preview': {
                provider: 'OpenAI',
                contextWindow: '128,000 tokens',
                maxOutput: '4,096 tokens',
                trainingData: 'Up to Dec 2023'
            },
            'o1-preview': {
                provider: 'OpenAI',
                contextWindow: '128,000 tokens',
                maxOutput: '32,768 tokens',
                trainingData: 'Up to Oct 2023'
            },
            'o1-preview-2024-09-12': {
                provider: 'OpenAI',
                contextWindow: '128,000 tokens',
                maxOutput: '32,768 tokens',
                trainingData: 'Up to Oct 2023'
            },
            'o1-mini': {
                provider: 'OpenAI',
                contextWindow: '128,000 tokens',
                maxOutput: '65,536 tokens',
                trainingData: 'Up to Oct 2023'
            },
            'o1-mini-2024-09-12': {
                provider: 'OpenAI',
                contextWindow: '128,000 tokens',
                maxOutput: '65,536 tokens',
                trainingData: 'Up to Oct 2023'
            },
            'gpt-4o-mini': {
                provider: 'OpenAI',
                contextWindow: '128,000 tokens',
                maxOutput: '16,384 tokens',
                trainingData: 'Up to Oct 2023'
            },
            'gpt-4o-mini-2024-07-18': {
                provider: 'OpenAI',
                contextWindow: '128,000 tokens',
                maxOutput: '16,384 tokens',
                trainingData: 'Up to Oct 2023'
            },
            // Gemini Models
            'gemini-pro': {
                provider: 'Google',
                contextWindow: '32,000 tokens',
                maxOutput: '8,192 tokens',
                trainingData: 'Up to Feb 2024'
            },
            'gemini-pro-vision': {
                provider: 'Google',
                contextWindow: '32,000 tokens',
                maxOutput: '8,192 tokens',
                trainingData: 'Up to Feb 2024'
            },
            'gemini-1.5-pro': {
                provider: 'Google',
                contextWindow: '1,000,000 tokens',
                maxOutput: '8,192 tokens',
                trainingData: 'Up to Feb 2024'
            },
            'gemini-1.5-flash': {
                provider: 'Google',
                contextWindow: '1,000,000 tokens',
                maxOutput: '8,192 tokens',
                trainingData: 'Up to Feb 2024'
            }
        };

        // Atualiza informações do modelo na interface (opcional)
        const info = modelInfo[currentModel];
        if (info) {
            console.log(`Modelo: ${currentModel}`);
            console.log(`Provedor: ${info.provider}`);
            console.log(`Contexto: ${info.contextWindow}`);
            console.log(`Saída máxima: ${info.maxOutput}`);
            console.log(`Dados de treinamento: ${info.trainingData}`);
        }
        
        // Limpa o histórico ao trocar de modelo
        messageHistory = [];
        document.getElementById('chat-messages').innerHTML = '';
    }

    document.getElementById('model-select').addEventListener('change', updateModel);

    async function sendMessage(overrideMessage = null) {
        const message = overrideMessage || userInput.value.trim();
        if (!message) return;

        console.log('Enviando mensagem:', message);
        console.log('Modelo atual:', currentModel);

        addMessage(message, true);
        userInput.value = '';

        hideSuggestions();

        messageHistory.push({ role: "user", content: message });

        let botMessageElement = addMessage('', false);
        botMessageElement.classList.add('current-message');
        let fullResponse = '';

        try {
            console.log('Fazendo request para /chat...');
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
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                console.error("Erro na resposta da API:", response.statusText);
                const errorText = await response.text();
                console.error("Erro detalhado:", errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
     
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
     
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    // Remove o cursor SVG quando a mensagem estiver completa
                    const cursorSvg = botMessageElement.querySelector('.typing-cursor-svg');
                    if (cursorSvg) {
                        cursorSvg.remove();
                    }
                    break;
                }
    
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
                            } else if (parsedData.error) {
                                console.error('API Error:', parsedData.error);
                                updateBotMessage(botMessageElement, 'Erro: ' + parsedData.error);
                                break;
                            }
                        } catch (error) {
                            console.error('Error parsing JSON:', error, 'Data:', data);
                            // Continua a execução sem interromper o fluxo
                            continue;
                        }
                    }
                }
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
            // Também remove o cursor em caso de erro
            const cursorSvg = botMessageElement.querySelector('.typing-cursor-svg');
            if (cursorSvg) {
                cursorSvg.remove();
            }
        }

        applyHighlighting();
        scrollToBottom();
    }

    function updateBotMessage(element, content) {
        const typingContainer = element.querySelector('.typing-container');
        if (typingContainer) {
            const textSpan = typingContainer.querySelector('.typing-text');
            const cursor = typingContainer.querySelector('.typing-cursor');
            
            // Remove o cursor antigo se existir
            if (cursor) cursor.remove();
            
            textSpan.innerHTML = '';
            
            const parts = content.split('```');
            
            parts.forEach((part, index) => {
                if (index % 2 === 0) {
                    const textNode = document.createElement('span');
                    textNode.innerHTML = parseMarkdown(part);
                    textSpan.appendChild(textNode);
                } else {
                    const { codeBlockContainer, codeElement } = createCodeBlock(part.trim());
                    textSpan.appendChild(codeBlockContainer);
                }
            });

            // Adiciona o novo cursor SVG
            const cursorSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            cursorSvg.setAttribute("class", "typing-cursor-svg");
            cursorSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            cursorSvg.setAttribute("viewBox", "0 0 20 30");
            cursorSvg.innerHTML = `
                <line 
                    x1="4" y1="4"           /* Ajustado de 2 para 4 */
                    x2="4" y2="28"          /* Ajustado de 2 para 4 */
                    stroke="${document.body.classList.contains('light-theme') ? '#444444' : '#ffffff'}"
                    stroke-width="6"        /* Aumentado de 4 para 6 */
                    stroke-linecap="round">
                    <animate
                        attributeName="opacity"
                        values="1;0;1"
                        dur="1.4s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="y2"
                        values="28;24;28"
                        dur="1.4s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="stroke-width"
                        values="6;4;6"      /* Aumentado de 4;3;4 para 6;4;6 */
                        dur="1.4s"
                        repeatCount="indefinite"
                    />
                </line>
                <line 
                    x1="4" y1="4"          /* Ajustado de 2 para 4 */
                    x2="4" y2="28"         /* Ajustado de 2 para 4 */
                    stroke="${document.body.classList.contains('light-theme') ? '#444444' : '#ffffff'}"
                    stroke-width="3"       /* Aumentado de 2 para 3 */
                    stroke-linecap="round"
                    filter="url(#glow)"
                    opacity="0.5">
                    <animate
                        attributeName="opacity"
                        values="0.5;0;0.5"
                        dur="1.4s"
                        repeatCount="indefinite"
                    />
                </line>
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>  /* Aumentado de 1 para 2 */
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
            `;
            textSpan.appendChild(cursorSvg);
        } else {
            element.innerHTML = parseMarkdown(escapeHTML(content));
        }
        scrollToBottom();
    }

    function applyHighlighting() {
        document.querySelectorAll('pre code').forEach((block) => {
            if (!block.classList.contains('hljs')) {
                hljs.highlightElement(block);
            }
        });
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
            button.className = 'suggestion-button';
            button.innerHTML = `${suggestion.icon} ${suggestion.text}`;
            button.addEventListener('click', () => {
                userInput.value = suggestion.text;
                sendMessage();
            });
            suggestionsContainer.appendChild(button);
        });
    }
    
    if (sendButton) {
        sendButton.addEventListener('click', () => sendMessage());
    } else {
        console.error('Send button not found');
    }
    
    if (userInput) {
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    } else {
        console.error('User input not found');
    }
    
    addSuggestionButtons();
    
    window.addEventListener('resize', scrollToBottom);
    
    const mutationObserver = new MutationObserver((mutations) => {
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
    
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    
    document.addEventListener('DOMContentLoaded', (event) => {
        hljs.configure({ ignoreUnescapedHTML: true });
        hljs.highlightAll();
    });

    const menuButton = document.querySelector('.menu-button');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (menuButton && sidebar && overlay) {
        menuButton.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });

        // Fechar sidebar quando pressionar ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            }
        });
    }

    document.querySelector('.new-chat-button').addEventListener('click', () => {
        // Limpar o histórico de mensagens
        document.getElementById('chat-messages').innerHTML = '';
        messageHistory = [];
        
        // Fechar a sidebar
        document.querySelector('.sidebar').classList.remove('active');
        document.querySelector('.sidebar-overlay').classList.remove('active');
    });

    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    let currentTheme = localStorage.getItem('theme') || 'dark';

    // Função para atualizar o tema
    function updateTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            document.documentElement.style.colorScheme = 'light';
        } else {
            document.body.classList.remove('light-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            document.documentElement.style.colorScheme = 'dark';
        }
        localStorage.setItem('theme', theme);
        currentTheme = theme;
    }

    // Aplicar tema inicial
    updateTheme(currentTheme);

    // Adicionar evento de clique no botão
    themeToggle.addEventListener('click', () => {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        updateTheme(newTheme);
    });
});

