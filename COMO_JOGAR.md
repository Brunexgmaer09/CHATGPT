# 🎈 Como Executar o Balloon Shooter

## 🚀 Execução Rápida

### ⭐ VERSÃO MOBILE RECOMENDADA (resolve erro no celular)
```bash
cd public
python3 -m http.server 8080
```
**Depois acesse:** http://localhost:8080/balloon-shooter-mobile.html

**💡 Esta versão standalone não depende de arquivos externos e funciona perfeitamente no mobile!**

### Opção 2: Versão Original (Desktop)
**Acesse:** http://localhost:8080/balloon-shooter.html

### Opção 3: Servidor Node.js
```bash
npm install
npm start
```
**Depois acesse:** http://localhost:3000/balloon-shooter.html

### Opção 4: Arquivo Local
- Abra diretamente o arquivo `public/balloon-shooter-mobile.html` no navegador

## 🎮 Como Jogar

**Desktop:**
- Move o mouse para mirar
- Clique para atirar
- Use P para pausar, M para silenciar

**Mobile:**
- Toque na tela onde quer atirar
- Use os botões da interface

## 🎯 Objetivo
Estoure os balões antes que escapem! Você tem 3 vidas.

**Tipos de Balões:**
- 🔴 Pequeno (15 pts) - difícil
- 🔵 Normal (10 pts) - médio  
- 🔵 Grande (25 pts) - fácil
- ⭐ Bônus (50 pts) - especial

## 🐛 Problemas Resolvidos

### ❌ "Unexpected token '<'" no Mobile
**SOLUÇÃO:** Use a versão `balloon-shooter-mobile.html` que inclui todo o código inline.

---
**Divirta-se! 🎈**