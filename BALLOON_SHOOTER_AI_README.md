# 🎈🤖 Balloon Shooter AI - Deep Q-Learning

Um jogo avançado de balloon shooter com **Inteligência Artificial** que aprende a jogar usando **Deep Q-Learning** com Brain.js!

## 🚀 Novidades desta Versão

### ✨ Mira Avançada
- **Crosshair profissional** com animações
- **Indicadores visuais** para modo IA
- **Efeitos de targeting** em tempo real

### 🧠 Inteligência Artificial
- **Deep Q-Learning** usando Brain.js
- **Rede neural** com arquitetura personalizada
- **Experience Replay** para aprendizado eficiente
- **Epsilon-greedy exploration** balanceada

### 📊 Sistema de Treinamento
- **Episódios automáticos** para treinamento
- **Métricas em tempo real** (epsilon, acurácia, experiências)
- **Velocidade ajustável** (1x, 2x, 4x, 8x)
- **Reinicialização automática** no modo treino

## 🎮 Como Usar

### 🌐 Acesso
**URL:** http://localhost:8080/public/balloon-shooter-ai.html

### 🎯 Controles

#### 🤖 Modo IA vs 👤 Modo Humano
- **Botão "🤖 Modo IA"**: Alterna entre controle humano e IA
- **No modo IA**: A mira se move automaticamente para onde a IA decide atirar

#### 🧠 Treinamento
- **"🧠 Treinar IA"**: Inicia treinamento automático
- **"⚡ Velocidade"**: Acelera o jogo para treino rápido (1x-8x)
- **"🔄 Reset IA"**: Reinicia a rede neural

#### ⌨️ Atalhos do Teclado
- **A**: Alternar modo IA
- **T**: Alternar treinamento
- **P**: Pausar
- **M**: Mute

## 🏗️ Arquitetura da IA

### 🧩 Estado do Jogo (Input da Rede Neural)
A IA analisa **20 variáveis** normalizadas:

**Métricas Gerais:**
- Vidas restantes (0-1)
- Pontuação atual (0-1)
- Número de balões na tela (0-1)

**Balão Mais Próximo:**
- Posição X, Y (0-1)
- Velocidade X, Y (-1 a 1)
- Raio e valor (0-1)
- Tipo do balão (0-1)

**Análise de Ameaças:**
- Balões próximos ao topo (risco de escape)
- Posição do balão mais perigoso
- Valor do balão mais perigoso

**Alvos de Alto Valor:**
- Quantidade de balões bônus
- Posição do primeiro balão bônus

**Distribuição Espacial:**
- Balões na esquerda, direita e topo

### 🎯 Ações (Output da Rede Neural)
A IA pode escolher entre **8 direções** ao redor do centro da tela:
- Norte, Nordeste, Leste, Sudeste
- Sul, Sudoeste, Oeste, Noroeste

### 🏆 Sistema de Recompensas
- **+1-5 pontos**: Por acertar balões (baseado no valor)
- **+5 pontos**: Balões bônus (⭐)
- **+3 pontos**: Balões em risco de escape
- **+2 pontos**: Balões pequenos (difíceis)
- **-0.5 pontos**: Por errar tiros
- **-10 pontos**: Por perder vidas

### 🧠 Arquitetura da Rede Neural
```
Input: 20 neurônios (estado do jogo)
Hidden Layer 1: 128 neurônios
Hidden Layer 2: 64 neurônios  
Hidden Layer 3: 32 neurônios
Output: 8 neurônios (ações possíveis)
```

**Parâmetros de Aprendizado:**
- Learning Rate: 0.001
- Discount Factor (γ): 0.95
- Epsilon inicial: 1.0 → 0.01
- Epsilon Decay: 0.995
- Batch Size: 32
- Memory Size: 10.000 experiências

## 📈 Métricas de Performance

### 📊 Interface de Monitoramento
- **Epsilon**: Nível de exploração vs. exploitação
- **Experiências**: Total de ações aprendidas
- **Acurácia**: Precisão da rede neural
- **Episódio**: Número de jogos completados

### 🎯 Como Interpretar
- **Epsilon alto (1.0)**: IA explorando aleatoriamente
- **Epsilon baixo (0.01)**: IA usando conhecimento aprendido
- **Acurácia crescente**: IA melhorando progressivamente
- **Experiências altas**: Mais dados para aprendizado

## 🔧 Recursos Técnicos

### 💻 Tecnologias Utilizadas
- **Brain.js**: Biblioteca de redes neurais
- **HTML5 Canvas**: Renderização do jogo
- **CSS3**: Animações e estilos modernos
- **JavaScript ES6+**: Lógica do jogo e IA

### 🎨 Recursos Visuais
- **Crosshair animado** com múltiplas camadas
- **Indicador de alvo da IA** (círculo verde)
- **Partículas coloridas** nos acertos
- **Interface responsiva** para mobile

### 📱 Compatibilidade
- ✅ **Desktop**: Mouse + teclado
- ✅ **Mobile**: Touch otimizado
- ✅ **Navegadores**: Chrome, Firefox, Safari, Edge

## 🎓 Como a IA Aprende

### 🔄 Processo de Aprendizado
1. **Observação**: IA analisa estado atual do jogo
2. **Decisão**: Escolhe ação (exploração vs. exploitação)
3. **Execução**: Realiza tiro na posição escolhida
4. **Feedback**: Recebe recompensa baseada no resultado
5. **Armazenamento**: Guarda experiência na memória
6. **Treinamento**: Treina rede neural com batch de experiências

### 📚 Experience Replay
- **Buffer circular** de 10.000 experiências
- **Amostragem aleatória** para evitar correlações
- **Treinamento incremental** a cada ação

### 🎯 Estratégias Desenvolvidas
Com o tempo, a IA aprende a:
- **Priorizar balões bônus** (maior recompensa)
- **Focar em ameaças** (balões prestes a escapar)
- **Otimizar precisão** (reduzir tiros perdidos)
- **Gerenciar risco** (balancear pontos vs. vidas)

## 🚀 Dicas de Uso

### 🎮 Para Jogar
1. **Início**: Clique "Começar Jogo"
2. **Modo Humano**: Use mouse/toque para atirar
3. **Modo IA**: Observe a IA jogar e aprender

### 🧠 Para Treinar a IA
1. **Ative o treinamento**: Clique "🧠 Treinar IA"
2. **Acelere**: Use "⚡ Velocidade" para treino rápido
3. **Monitore**: Observe as métricas melhorando
4. **Reinicie**: Use "🔄 Reset IA" para começar do zero

### 📊 Interpretando Resultados
- **Primeiros episódios**: IA joga aleatoriamente (epsilon alto)
- **~50-100 episódios**: IA começa a formar estratégias
- **200+ episódios**: IA desenvolve habilidades avançadas
- **500+ episódios**: IA pode superar jogadores humanos

## 🎯 Comparando Versões

| Característica | Versão Original | Versão AI |
|----------------|-----------------|-----------|
| **Mira** | Simples (+) | Avançada com animações |
| **Jogabilidade** | Só humano | Humano + IA |
| **Aprendizado** | ❌ | Deep Q-Learning |
| **Métricas** | Básicas | Completas + IA stats |
| **Velocidade** | 1x fixo | 1x-8x ajustável |
| **Treinamento** | ❌ | Sistema automático |

---

**🎈 Divirta-se explorando como a IA aprende a jogar Balloon Shooter! 🤖**