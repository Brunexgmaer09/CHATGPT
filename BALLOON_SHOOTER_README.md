# 🎈 Balloon Shooter Game

Um jogo moderno e responsivo de balloon shooter criado com JavaScript, HTML5 Canvas e CSS, com suporte completo para dispositivos móveis e desktop.

## 🎮 Como Jogar

### Acesso ao Jogo
1. Com o servidor rodando, acesse: `http://localhost:3000/balloon-shooter.html`
2. Ou navegue até a pasta `public` e abra `balloon-shooter.html` diretamente no navegador

### Controles

#### Desktop:
- **Mouse**: Mova para mirar
- **Click esquerdo**: Atirar nos balões
- **Espaço/Enter**: Atirar nos balões (alternativo)
- **P**: Pausar/despausar o jogo
- **M**: Ligar/desligar som

#### Mobile:
- **Toque na tela**: Atirar nos balões na posição tocada
- **Botões na interface**: Pausar e controlar som

## 🎯 Objetivo

Estoure o máximo de balões possível antes que eles escapem pela parte superior da tela! Você possui 3 vidas e perde uma vida para cada balão que escapa.

## 🎈 Tipos de Balões

- **Balão Normal** (azul): 10 pontos
- **Balão Pequeno** (vermelho): 15 pontos - mais difícil de acertar
- **Balão Grande** (azul escuro): 25 pontos - mais fácil de acertar
- **Balão Bônus** (laranja com ⭐): 50 pontos - especial

## 🏆 Sistema de Pontuação e Níveis

- **Progressão de Nível**: A cada 1000 pontos, você avança um nível
- **Dificuldade Crescente**: Com cada nível, os balões aparecem mais rapidamente
- **Efeitos Visuais**: Partículas coloridas ao estourar balões
- **Pontuação Flutuante**: Textos animados mostram os pontos ganhos

## ✨ Características Técnicas

### 🏗️ Arquitetura do Código
- **Programação Orientada a Objetos**: Classes bem estruturadas
- **Padrão MVC**: Separação clara de responsabilidades
- **Sistema de Partículas**: Efeitos visuais avançados
- **Física Realista**: Movimento com gravidade e resistência do ar

### 🎨 Recursos Visuais
- **Gradientes Modernos**: Background e elementos com gradientes CSS
- **Animações Suaves**: Transições CSS e animações Canvas
- **Responsivo**: Adaptação automática para diferentes tamanhos de tela
- **Sombras e Profundidade**: Efeitos 3D nos balões
- **Partículas Dinâmicas**: Sistema de partículas para explosões

### 📱 Compatibilidade Mobile
- **Touch Events**: Suporte completo a eventos de toque
- **Interface Adaptativa**: UI otimizada para mobile
- **Performance**: Otimizado para dispositivos móveis
- **Orientação**: Funciona em portrait e landscape

### 🔊 Sistema de Áudio
- **Web Audio API**: Sons gerados programaticamente
- **Efeitos Sonoros**: Sons distintos para acertos e erros
- **Controle de Volume**: Botão para ligar/desligar som

## 🛠️ Estrutura do Projeto

```
public/
├── balloon-shooter.html    # Página principal do jogo
├── css/
│   └── balloon-shooter.css # Estilos modernos e responsivos
└── js/
    └── balloon-shooter.js  # Lógica principal do jogo
```

## 🎯 Classes Principais

### `Vector2`
- Gerenciamento de posições e velocidades 2D
- Operações matemáticas básicas para física

### `Particle`
- Sistema de partículas para efeitos visuais
- Física com gravidade e resistência do ar

### `Balloon`
- Lógica dos balões com diferentes tipos
- Renderização com gradientes e sombras
- Movimento com física realista

### `BalloonGame`
- Controlador principal do jogo
- Gerenciamento de estado e game loop
- Sistema de input para mouse e touch

## 🚀 Recursos Implementados

### ✅ Funcionalidades Básicas
- [x] Spawning automático de balões
- [x] Sistema de mira e tiro
- [x] Detecção de colisão
- [x] Sistema de vidas e pontuação
- [x] Tela de início e game over

### ✅ Recursos Avançados
- [x] Diferentes tipos de balões
- [x] Sistema de partículas
- [x] Efeitos sonoros procedurais
- [x] Suporte completo a mobile
- [x] Progressão de níveis
- [x] Física realista dos balões
- [x] Interface responsiva
- [x] Sistema de pause
- [x] Textos flutuantes animados

### ✅ Otimizações
- [x] Performance otimizada para 60 FPS
- [x] Limpeza automática de objetos
- [x] Redimensionamento automático do canvas
- [x] Detecção automática de dispositivo móvel

## 🎮 Dicas para Jogar

1. **Mire nos balões bônus** (⭐) - valem mais pontos!
2. **Balões pequenos** são mais difíceis mas valem mais
3. **Não deixe muitos balões escaparem** - você só tem 3 vidas
4. **Use o pause** quando precisar de uma pausa
5. **Em mobile**, toque diretamente onde quer atirar

## 🔧 Desenvolvimento

O jogo foi desenvolvido seguindo as melhores práticas de programação JavaScript:
- Código modular e reutilizável
- Gerenciamento eficiente de memória
- Padrões de design apropriados
- Comentários detalhados
- Performance otimizada

---

**Divirta-se jogando Balloon Shooter! 🎈🎯**