# 🤖 ChatGPT Interface Moderna - Multi-API

Uma interface de chat ultra-moderna com **glassmorphism** que suporta tanto **OpenAI GPT** quanto **Google Gemini**. Criado com design contemporâneo e experiência de usuário premium.

## 👨‍💻 Desenvolvido por Brunex

---

## 🎨 Screenshots

### Interface com Glassmorphism
![Interface Moderna](Captura%20de%20tela%202025-07-09%20172754.png)

### Sugestões e Layout Responsivo  
![Sugestões Modernizadas](Captura%20de%20tela%202025-07-09%20172817.png)

---

## ✨ Características Principais

### 🎯 **Interface Modernizada**
- **Glassmorphism** em toda a interface
- Gradientes dinâmicos no background
- Efeitos **backdrop-filter** e **blur** 
- Animações suaves e micro-interações
- Design **responsivo** e **acessível**

### 🚀 **Suporte Multi-API**
- **OpenAI Models**: GPT-4 Turbo, O1 Preview, GPT-4o Mini
- **Google Gemini**: Gemini Pro, Gemini 1.5 Pro/Flash
- Seleção inteligente de provedores
- Streaming de resposta em tempo real

### 🎛️ **Funcionalidades Avançadas**
- Histórico de conversas persistente
- Sugestões inteligentes contextuais
- Blocos de código com syntax highlighting
- Temas **claro/escuro** com transições suaves
- Sidebar com navegação moderna

### 🔧 **Componentes Modernos**
- Header com efeitos glass
- Botões com gradientes e hover effects
- Scrollbars personalizadas
- Sistema de notificações
- Indicadores de typing em tempo real

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- **HTML5** + **CSS3** moderno
- **JavaScript ES6+** com async/await
- **Glassmorphism** e **CSS Grid/Flexbox**
- **Inter** e **Fira Code** typography
- **Highlight.js** para código

### **Backend**
- **Node.js** + **Express.js**
- **OpenAI API** (GPT-4, O1, GPT-4o)
- **Google Generative AI** (Gemini)
- **Streaming** de respostas
- **Middleware** de validação

### **Dependências**
```json
{
  \"openai\": \"^4.52.7\",
  \"@google/generative-ai\": \"^0.1.3\",
  \"express\": \"^4.19.2\",
  \"cors\": \"^2.8.5\",
  \"dotenv\": \"^16.4.5\"
}
```

---

## 🚀 Instalação e Configuração

### **1. Clone o Repositório**
```bash
git clone https://github.com/Brunexgmaer09/CHATGPT.git
cd CHATGPT
```

### **2. Instale as Dependências**
```bash
npm install
```

### **3. Configure as APIs**
Copie o arquivo de exemplo e configure suas chaves:
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
# OpenAI Configuration
OPENAI_API_KEY=sua_chave_openai_aqui

# Google Gemini Configuration  
GEMINI_API_KEY=sua_chave_gemini_aqui

# Server Configuration
PORT=3000
```

### **4. Obter Chaves de API**
- **OpenAI**: https://platform.openai.com/api-keys
- **Google Gemini**: https://makersuite.google.com/app/apikey

### **5. Executar o Projeto**
```bash
npm start
```

Acesse: `http://localhost:3000`

---

## 📁 Estrutura do Projeto

```
CHATGPT/
├── public/
│   ├── css/
│   │   ├── base.css           # Estilos base e variáveis
│   │   ├── header.css         # Header com glassmorphism
│   │   ├── chat.css           # Interface principal do chat
│   │   ├── buttons.css        # Botões com efeitos modernos
│   │   ├── suggestions.css    # Sistema de sugestões
│   │   ├── animations.css     # Animações e transições
│   │   ├── modern-layout.css  # Layout contemporâneo
│   │   └── code-block-modern.css # Blocos de código
│   ├── js/
│   │   └── script.js          # Lógica do frontend
│   └── index.html             # Estrutura HTML
├── server.js                  # Servidor Express multi-API
├── package.json              # Configurações e dependências
├── .env.example              # Template de configuração
└── README.md                 # Este arquivo
```

---

## 🎨 Recursos Visuais

### **Glassmorphism**
- Transparência com `backdrop-filter: blur()`
- Bordas sutis com `rgba()`
- Shadows em camadas
- Efeitos de hover elevados

### **Animações**
- Transições `cubic-bezier(0.4, 0, 0.2, 1)`
- Animações de entrada `fadeInUp`
- Hover effects com `transform`
- Loading states suaves

### **Tipografia**
- **Inter** para textos
- **Fira Code** para código
- Font-smoothing otimizado
- Pesos dinâmicos (300-700)

---

## 🔮 Funcionalidades Futuras

- [ ] Suporte para **Claude** (Anthropic)
- [ ] **Upload de arquivos** e imagens
- [ ] **Markdown** avançado
- [ ] **Plugins** customizáveis
- [ ] **PWA** (Progressive Web App)
- [ ] **Modo offline**
- [ ] **Exportação** de conversas

---

## 🤝 Contribuindo

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. Abra um **Pull Request**

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## ⚠️ Aviso Legal

Este projeto utiliza APIs de terceiros (OpenAI e Google) e deve ser usado de acordo com seus respectivos termos de serviço:

- [OpenAI Terms of Service](https://openai.com/terms/)
- [Google AI Terms of Service](https://ai.google.dev/terms)

---

## 🎯 Suporte

Se você gostou do projeto, considere dar uma ⭐ no repositório!

**Brunex** - [GitHub](https://github.com/Brunexgmaer09) - brunooliveiirah@gmail.com

---

<div align=\"center\">
  <strong>Desenvolvido com ❤️ usando tecnologias modernas</strong>
</div>