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
        // Python
        if (code.includes('print(') || code.startsWith('import ') || code.includes('def ') || code.includes('class ')) return 'python';
        // JavaScript
        if (code.includes('console.log(') || code.includes('function ') || code.includes('const ') || code.includes('let ') || code.includes('var ')) return 'javascript';        
        // HTML
        if (code.includes('<html>') || code.includes('<!DOCTYPE html>') || code.includes('<body>') || code.includes('<div>')) return 'html';
        // C++
        if (code.includes('#include') || code.includes('int main(') || code.includes('std::') || code.includes('using namespace std')) return 'cpp';
        // Bash
        if (code.startsWith('#!/bin/bash') || code.includes('echo ') ||  code.includes('npm ') || code.includes('fi') || code.includes('for ') || code.includes('while ')) return 'bash';
        // C#
        if (code.includes('using System;') || code.includes('namespace ') || code.includes('class ') || code.includes('public static void Main(')) return 'csharp';        
        // Java
        if (code.includes('public static void main(') || code.includes('import java.') || code.includes('class ') || code.includes('System.out.println(')) return 'java';        
        // Ruby
        if (code.includes('puts ') || code.includes('def ') || code.includes('end') || code.includes('class ')) return 'ruby';       
        // PHP
        if (code.includes('<?php') || code.includes('echo ') || code.includes('$') || code.includes('->')) return 'php';       
        // Swift
        if (code.includes('import Foundation') || code.includes('class ') || code.includes('func ') || code.includes('let ') || code.includes('var ')) return 'swift';   
        // Rust
        if (code.includes('fn main(') || code.includes('let ') || code.includes('extern crate') || code.includes('use ')) return 'rust';
        // Go
        if (code.includes('package main') || code.includes('import ') || code.includes('func main(') || code.includes('fmt.')) return 'go';
        // TypeScript
        if (code.includes('console.log(') || code.includes('function ') || code.includes('const ') || code.includes('let ') || code.includes('var ') || code.includes('import ') || code.includes('export ')) return 'typescript';
        // SQL
        if (code.includes('SELECT ') || code.includes('FROM ') || code.includes('INSERT INTO ') || code.includes('UPDATE ') || code.includes('DELETE FROM ')) return 'sql'; 
        // JSON
        if (code.trim().startsWith('{') && code.trim().endsWith('}') && code.includes(':')) return 'json';  
        // Markdown
        if (code.includes('# ') || code.includes('## ') || code.includes('### ') || code.includes('- ') || code.includes('* ') || code.includes('[') && code.includes('](')) return 'markdown';
        return '<html>'; // default
    }

    function createCodeBlock(code) {
        const codeBlockContainer = document.createElement('div');
        codeBlockContainer.className = 'code-block-container';
    
        const codeBlockHeader = document.createElement('div');
        codeBlockHeader.className = 'code-block-header';
    
        // Verifique se o código não é undefined antes de tentar dividi-lo
        const lines = code && typeof code === 'string' ? code.split('\n') : [];
        const languageIdentifier = lines.length > 0 ? lines[0].trim() : '';
        const language = detectLanguage(code || '');
    
        const languageSpan = document.createElement('span');
        languageSpan.textContent = languageIdentifier;
        codeBlockHeader.appendChild(languageSpan);
    
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copiar';
        copyButton.onclick = () => copyCode(copyButton, code || '');
        codeBlockHeader.appendChild(copyButton);
    
        codeBlockContainer.appendChild(codeBlockHeader);
    
        const codeBlock = document.createElement('pre');
        const codeElement = document.createElement('code');
        codeElement.className = `language-${language} hljs`;
        
        // Remova a primeira linha (identificador de linguagem) e a segunda linha (se for "Copiar")
        const codeContent = lines.slice(lines.length > 1 && lines[1].trim() === 'Copiar' ? 2 : 1).join('\n').trim();
        codeElement.textContent = codeContent;
    
        codeBlock.appendChild(codeElement);
        codeBlockContainer.appendChild(codeBlock);
    
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
    
    function scrollToBottom() {
        const scrollHeight = chatMessages.scrollHeight;
        const currentScroll = chatMessages.scrollTop;
        const targetScroll = scrollHeight - chatMessages.clientHeight;
        const distance = targetScroll - currentScroll;
        
        if (distance > 0) {
            const duration = 0;
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
                    body: JSON.stringify({ message, history: messageHistory }),
                });
        
                if (!response.ok) {
                    console.error("Erro na resposta da API:", response.statusText); // Debug
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
                                    // Rolar para baixo a cada atualização da mensagem
                                    scrollToBottom(); 
                                    await new Promise(resolve => setTimeout(resolve, 0));
                                }
                            } catch (error) {
                                console.error('Error parsing JSON:', error);
                            }
                        }
                    }
                    // Chamada de rolagem para baixo após a conclusão do recebimento de dados
                    scrollToBottom();
                    await new Promise(resolve => setTimeout(resolve, 0));
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
            scrollToBottom(); // Aqui está novamente, garantindo que ele role para baixo ao final da mensagem.
         }
         
        
        function updateBotMessage(element, content) {
            const typingContainer = element.querySelector('.typing-container');
            if (typingContainer) {
                const textSpan = typingContainer.querySelector('.typing-text');
                
                // Divide o conteúdo em partes de código e texto normal
                const parts = content.split('```');
                
                // Limpa o conteúdo existente
                textSpan.innerHTML = '';
                
                parts.forEach((part, index) => {
                    if (index % 2 === 0) {
                        // Texto normal
                        const textNode = document.createElement('span');
                        textNode.innerHTML = parseMarkdown(escapeHTML(part));
                        textSpan.appendChild(textNode);
                    } else {
                        // Bloco de código
                        const { codeBlockContainer, codeElement } = createCodeBlock(part.trim());
                        hljs.highlightElement(codeElement);
                        textSpan.appendChild(codeBlockContainer);
                    }
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
        
        // Configuração do Highlight.js
        document.addEventListener('DOMContentLoaded', (event) => {
            document.querySelectorAll('pre code').forEach((el) => {
                hljs.highlightElement(el);
            });
        });