document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const suggestionsContainer = document.getElementById('suggestions');
    
    let isSuggestionsVisible = true;
    let messageHistory = [];
    
    function copyCode(button, code) {
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

        const lines = code.split('\n');

        const language = detectLanguage(code);
        
        const languageSpan = document.createElement('span');
        languageSpan.textContent = language || 'plaintext';
        codeBlockHeader.appendChild(languageSpan);

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copiar';
        copyButton.onclick = () => copyCode(copyButton, code);
        codeBlockHeader.appendChild(copyButton);

        codeBlockContainer.appendChild(codeBlockHeader);

        const codeBlock = document.createElement('pre');
        const codeElement = document.createElement('code');
        codeElement.className = `language-${language || 'plaintext'}`;

        const codeContent = lines.slice(lines.length > 1 && lines[1].trim() === 'Copiar' ? 2 : 1).join('\n').trim();

        // Use textContent para evitar injeção de HTML
        codeElement.textContent = codeContent;
        codeBlock.appendChild(codeElement);
        codeBlockContainer.appendChild(codeBlock);

        return { codeBlockContainer, codeElement };
    }

    function applyHighlightingToElement(element) {
        element.querySelectorAll('pre code').forEach((block) => {
            if (!block.classList.contains('hljs')) {
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
        if (actionsContainer) {
            actionsContainer.classList.add('hidden');
        }
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (message === "") return;

        userInput.value = "";
        addUserMessage(message);
        addBotMessage(); // Adiciona uma mensagem do bot com estado de carregamento

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.statusText}`);
            }

            const parsedData = await response.json();
            let fullResponse = parsedData.content;

            const botMessageElement = document.querySelector('.bot-message.current-message');
            if (botMessageElement) {
                updateBotMessage(botMessageElement, fullResponse);
                messageHistory.push({ role: "assistant", content: fullResponse });

                if (messageHistory.length > 10) {
                    messageHistory = messageHistory.slice(-10);
                }

                botMessageElement.classList.remove('current-message');
                hideIcons(botMessageElement);

                document.querySelectorAll('.message:not(.current-message)').forEach(hideIcons);
            }

        } catch (error) {
            console.error('Error:', error);
            const botMessageElement = document.querySelector('.bot-message.current-message');
            if (botMessageElement) {
                updateBotMessage(botMessageElement, 'Desculpe, ocorreu um erro ao processar sua mensagem.');
            }
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
            
            const parts = content.split('```');
            
            parts.forEach((part, index) => {
                if (index % 2 === 0) {
                    const textNode = document.createElement('span');
                    // Escape apenas as partes que não são código
                    textNode.innerHTML = parseMarkdown(escapeHTML(part));
                    textSpan.appendChild(textNode);
                } else {
                    const { codeBlockContainer, codeElement } = createCodeBlock(part.trim());
                    textSpan.appendChild(codeBlockContainer);
                }
            });

            const observer = new MutationObserver(() => {
                scrollToBottom();
                applyHighlightingToElement(textSpan);
            });

            observer.observe(textSpan, { childList: true, subtree: true, characterData: true });

            applyHighlightingToElement(textSpan);
        } else {
            // Para mensagens sem typing container, assegure que todo o conteúdo seja escapado
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
            // Utilize textContent ao invés de innerHTML para evitar injeção de HTML
            button.textContent = `${suggestion.icon} ${suggestion.text}`;
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
});
