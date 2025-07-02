// Game.js - Balloon Shooter Game
// Arquitetura orientada a objetos com suporte para mobile e desktop

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }

    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    distance(vector) {
        const dx = this.x - vector.x;
        const dy = this.y - vector.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class Particle {
    constructor(x, y, color = '#FF6B6B', size = 3, velocity = null) {
        this.position = new Vector2(x, y);
        this.velocity = velocity || new Vector2(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
        );
        this.color = color;
        this.size = size;
        this.life = 1.0;
        this.decay = 0.02;
        this.gravity = 0.1;
    }

    update() {
        this.position = this.position.add(this.velocity);
        this.velocity.y += this.gravity;
        this.life -= this.decay;
        this.size *= 0.98;
        return this.life > 0;
    }

    draw(ctx) {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Balloon {
    constructor(x, y, gameWidth, gameHeight) {
        this.position = new Vector2(x, y);
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.radius = 25 + Math.random() * 15;
        this.speed = 1 + Math.random() * 2;
        this.color = this.getRandomColor();
        this.stringLength = 40 + Math.random() * 20;
        this.sway = 0;
        this.swaySpeed = 0.02 + Math.random() * 0.03;
        this.points = Math.floor(this.radius / 5) * 10;
        this.destroyed = false;
        
        // Animação de balanceio
        this.swayAmplitude = 15 + Math.random() * 10;
        this.originalX = x;
    }

    getRandomColor() {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FFEAA7', '#DDA0DD', '#FF7F50', '#98D8C8',
            '#FFA07A', '#87CEEB', '#DEB887', '#FFB6C1'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        if (this.destroyed) return false;

        // Movimento para cima
        this.position.y -= this.speed;
        
        // Movimento de balanceio
        this.sway += this.swaySpeed;
        this.position.x = this.originalX + Math.sin(this.sway) * this.swayAmplitude;
        
        // Verifica se saiu da tela
        if (this.position.y + this.radius < 0) {
            return false; // Balão escapou
        }
        
        return true;
    }

    draw(ctx) {
        if (this.destroyed) return;

        // Desenha a linha do balão
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y + this.radius);
        ctx.lineTo(this.position.x, this.position.y + this.radius + this.stringLength);
        ctx.stroke();

        // Desenha o balão com gradiente
        const gradient = ctx.createRadialGradient(
            this.position.x - this.radius * 0.3,
            this.position.y - this.radius * 0.3,
            0,
            this.position.x,
            this.position.y,
            this.radius
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, this.darkenColor(this.color, 0.3));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Destaque do balão
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(
            this.position.x - this.radius * 0.3,
            this.position.y - this.radius * 0.3,
            this.radius * 0.3,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // Bordinha do balão
        ctx.strokeStyle = this.darkenColor(this.color, 0.4);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - factor));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - factor));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - factor));
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }

    isHit(x, y) {
        const distance = this.position.distance(new Vector2(x, y));
        return distance < this.radius;
    }

    explode() {
        this.destroyed = true;
        return this.points;
    }
}

class Cloud {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = 0.2 + Math.random() * 0.3;
        this.opacity = 0.3 + Math.random() * 0.4;
    }

    update(gameWidth) {
        this.x += this.speed;
        if (this.x > gameWidth + this.size) {
            this.x = -this.size;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#FFFFFF';
        
        // Desenha nuvem com círculos sobrepostos
        for (let i = 0; i < 5; i++) {
            const offsetX = (i - 2) * this.size * 0.3;
            const offsetY = Math.sin(i) * this.size * 0.1;
            const radius = this.size * (0.4 + Math.random() * 0.3);
            
            ctx.beginPath();
            ctx.arc(this.x + offsetX, this.y + offsetY, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

class InputManager {
    constructor(canvas, crosshair) {
        this.canvas = canvas;
        this.crosshair = crosshair;
        this.mousePos = new Vector2();
        this.isMobile = this.detectMobile();
        this.onShoot = null;
        
        this.setupEventListeners();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    }

    setupEventListeners() {
        if (this.isMobile) {
            this.setupTouchEvents();
        } else {
            this.setupMouseEvents();
        }
    }

    setupMouseEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            this.mousePos.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            this.updateCrosshair();
        });

        this.canvas.addEventListener('click', (e) => {
            if (this.onShoot) {
                this.onShoot(this.mousePos.x, this.mousePos.y);
            }
        });
    }

    setupTouchEvents() {
        // Previne o zoom e outros comportamentos padrão
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (e.changedTouches.length > 0) {
                const touch = e.changedTouches[0];
                const rect = this.canvas.getBoundingClientRect();
                const x = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
                const y = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
                
                this.mousePos.x = x;
                this.mousePos.y = y;
                this.updateCrosshair();
                
                if (this.onShoot) {
                    this.onShoot(x, y);
                }
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                this.mousePos.x = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
                this.mousePos.y = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
                this.updateCrosshair();
            }
        }, { passive: false });
    }

    updateCrosshair() {
        const rect = this.canvas.getBoundingClientRect();
        const x = (this.mousePos.x / this.canvas.width) * rect.width + rect.left;
        const y = (this.mousePos.y / this.canvas.height) * rect.height + rect.top;
        
        this.crosshair.style.left = x + 'px';
        this.crosshair.style.top = y + 'px';
        this.crosshair.style.display = 'block';
    }
}

class SoundManager {
    constructor() {
        this.enabled = true;
        this.sounds = {};
        this.createSounds();
    }

    createSounds() {
        // Cria sons usando Web Audio API para compatibilidade
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    playPop() {
        if (!this.enabled) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Som não disponível');
        }
    }

    playGameOver() {
        if (!this.enabled) return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Som não disponível');
        }
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.crosshair = document.getElementById('crosshair');
        
        this.balloons = [];
        this.particles = [];
        this.clouds = [];
        
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.balloonsPopped = 0;
        
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.balloonSpawnTimer = 0;
        this.balloonSpawnRate = 120; // frames
        this.levelProgressTimer = 0;
        
        this.inputManager = new InputManager(this.canvas, this.crosshair);
        this.soundManager = new SoundManager();
        
        this.setupCanvas();
        this.createClouds();
        this.setupEventListeners();
        this.setupInputManager();
        
        this.gameLoop();
    }

    setupCanvas() {
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    createClouds() {
        for (let i = 0; i < 5; i++) {
            this.clouds.push(new Cloud(
                Math.random() * this.canvas.width,
                50 + Math.random() * 200,
                30 + Math.random() * 20
            ));
        }
    }

    setupEventListeners() {
        // Menu buttons
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('instructionsButton').addEventListener('click', () => this.showInstructions());
        document.getElementById('backButton').addEventListener('click', () => this.showMainMenu());
        document.getElementById('restartButton').addEventListener('click', () => this.startGame());
        document.getElementById('menuButton').addEventListener('click', () => this.showMainMenu());
        document.getElementById('pauseButton').addEventListener('click', () => this.togglePause());
        document.getElementById('resumeButton').addEventListener('click', () => this.togglePause());
        document.getElementById('pauseMenuButton').addEventListener('click', () => this.showMainMenu());
    }

    setupInputManager() {
        this.inputManager.onShoot = (x, y) => {
            if (this.gameState === 'playing') {
                this.shoot(x, y);
            }
        };
    }

    showMainMenu() {
        this.gameState = 'menu';
        this.hideAllScreens();
        document.getElementById('mainMenu').classList.remove('hidden');
        this.crosshair.style.display = 'none';
    }

    showInstructions() {
        this.hideAllScreens();
        document.getElementById('instructionsMenu').classList.remove('hidden');
    }

    showGameScreen() {
        this.hideAllScreens();
        document.getElementById('gameScreen').classList.remove('hidden');
    }

    showGameOver() {
        this.gameState = 'gameOver';
        this.hideAllScreens();
        document.getElementById('gameOverMenu').classList.remove('hidden');
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('balloonsPopped').textContent = this.balloonsPopped;
        this.crosshair.style.display = 'none';
        this.soundManager.playGameOver();
    }

    showPauseMenu() {
        this.hideAllScreens();
        document.getElementById('pauseMenu').classList.remove('hidden');
        this.crosshair.style.display = 'none';
    }

    hideAllScreens() {
        const screens = ['mainMenu', 'instructionsMenu', 'gameScreen', 'gameOverMenu', 'pauseMenu'];
        screens.forEach(screen => {
            document.getElementById(screen).classList.add('hidden');
        });
    }

    startGame() {
        this.gameState = 'playing';
        this.showGameScreen();
        this.resetGame();
        this.updateHUD();
    }

    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.balloonsPopped = 0;
        this.balloons = [];
        this.particles = [];
        this.balloonSpawnTimer = 0;
        this.balloonSpawnRate = 120;
        this.levelProgressTimer = 0;
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showPauseMenu();
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.showGameScreen();
        }
    }

    shoot(x, y) {
        let hit = false;
        
        // Verifica colisão com balões
        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const balloon = this.balloons[i];
            if (balloon.isHit(x, y)) {
                const points = balloon.explode();
                this.score += points;
                this.balloonsPopped++;
                
                // Cria partículas de explosão
                this.createExplosionParticles(balloon.position.x, balloon.position.y, balloon.color);
                
                this.balloons.splice(i, 1);
                this.soundManager.playPop();
                hit = true;
                break;
            }
        }
        
        // Cria partículas do tiro
        this.createShotParticles(x, y, hit);
        this.updateHUD();
        this.checkLevelUp();
    }

    createExplosionParticles(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(
                x + (Math.random() - 0.5) * 20,
                y + (Math.random() - 0.5) * 20,
                color,
                3 + Math.random() * 5
            ));
        }
    }

    createShotParticles(x, y, hit) {
        const color = hit ? '#FFD700' : '#87CEEB';
        for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(
                x + (Math.random() - 0.5) * 10,
                y + (Math.random() - 0.5) * 10,
                color,
                2 + Math.random() * 3
            ));
        }
    }

    spawnBalloon() {
        const x = 50 + Math.random() * (this.canvas.width - 100);
        const y = this.canvas.height + 50;
        this.balloons.push(new Balloon(x, y, this.canvas.width, this.canvas.height));
    }

    checkLevelUp() {
        this.levelProgressTimer++;
        if (this.levelProgressTimer >= 600) { // 10 segundos a 60fps
            this.level++;
            this.balloonSpawnRate = Math.max(30, this.balloonSpawnRate - 10);
            this.levelProgressTimer = 0;
            this.updateHUD();
        }
    }

    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        
        let livesDisplay = '';
        for (let i = 0; i < this.lives; i++) {
            livesDisplay += '❤️';
        }
        document.getElementById('lives').textContent = livesDisplay;
    }

    update() {
        if (this.gameState !== 'playing') return;

        // Spawn balões
        this.balloonSpawnTimer++;
        if (this.balloonSpawnTimer >= this.balloonSpawnRate) {
            this.spawnBalloon();
            this.balloonSpawnTimer = 0;
        }

        // Atualiza balões
        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const balloon = this.balloons[i];
            if (!balloon.update()) {
                // Balão escapou
                this.balloons.splice(i, 1);
                this.lives--;
                this.updateHUD();
                
                if (this.lives <= 0) {
                    this.showGameOver();
                    return;
                }
            }
        }

        // Atualiza partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            if (!particle.update()) {
                this.particles.splice(i, 1);
            }
        }

        // Atualiza nuvens
        this.clouds.forEach(cloud => cloud.update(this.canvas.width));
        
        this.checkLevelUp();
    }

    draw() {
        // Limpa o canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenha fundo gradiente
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Desenha nuvens
        this.clouds.forEach(cloud => cloud.draw(this.ctx));
        
        // Desenha balões
        this.balloons.forEach(balloon => balloon.draw(this.ctx));
        
        // Desenha partículas
        this.particles.forEach(particle => particle.draw(this.ctx));
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Inicialização do jogo
window.addEventListener('DOMContentLoaded', () => {
    new Game();
});

// Previne comportamentos padrão em dispositivos móveis
document.addEventListener('touchstart', function(e) {
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchend', function(e) {
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchmove', function(e) {
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
    }
}, { passive: false });