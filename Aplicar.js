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
        const cleanCode = code.replace(/\/\/.*|\/\*[\s\S]*?\*\/|'(?:\\.|[^\\'])*'|"(?:\\.|[^\\"])*"/g, '');
        
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
        
        for (const [language, pattern] of languagePatterns) {
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
        const languageIdentifier = lines[0].trim();
        let language = hljs.getLanguage(languageIdentifier) ? languageIdentifier : detectLanguage(code);
    
        const languageSpan = document.createElement('span');
        languageSpan.textContent = language;
        codeBlockHeader.appendChild(languageSpan);
    
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copiar';
        copyButton.onclick = () => copyCode(copyButton, code);
        codeBlockHeader.appendChild(copyButton);
    
        codeBlockContainer.appendChild(codeBlockHeader);
    
        const codeBlock = document.createElement('pre');
        const codeElement = document.createElement('code');
        codeElement.className = `language-${language}`;
        
        const codeContent = lines.slice(lines.length > 1 && lines[1].trim() === 'Copiar' ? 2 : 1).join('\n').trim();
        
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
            if (!block.classList.contains('hljs')) {
                hljs.highlightElement(block);
            }
        });
    }

    // Resto do seu código permanece igual...

    // Funções de parsing, eventos, e lógica de chat

});
