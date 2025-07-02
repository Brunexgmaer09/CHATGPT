/**
 * Balloon Shooter Game
 * A modern, responsive balloon shooting game with beautiful visuals
 */

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    distance(vector) {
        const dx = this.x - vector.x;
        const dy = this.y - vector.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    clone() {
        return new Vector2(this.x, this.y);
    }
}

class Particle {
    constructor(x, y, color, velocity, life) {
        this.position = new Vector2(x, y);
        this.velocity = velocity;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = Math.random() * 3 + 2;
    }

    update(deltaTime) {
        this.position.add(this.velocity.clone().multiply(deltaTime));
        this.life -= deltaTime;
        this.velocity.multiply(0.98); // Air resistance
        this.velocity.y += 0.1; // Gravity
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isAlive() {
        return this.life > 0;
    }
}

class Balloon {
    constructor(x, y, type = 'normal') {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(
            (Math.random() - 0.5) * 0.5, // Slight horizontal drift
            -Math.random() * 2 - 1 // Upward speed
        );
        this.type = type;
        this.radius = this.getRadiusByType();
        this.color = this.getColorByType();
        this.value = this.getValueByType();
        this.bobOffset = Math.random() * Math.PI * 2;
        this.bobSpeed = 2 + Math.random() * 2;
        this.isDestroyed = false;
        this.scale = 1;
        this.shadowOffset = 0;
    }

    getRadiusByType() {
        const sizes = {
            'small': 25,
            'normal': 35,
            'large': 50,
            'bonus': 30
        };
        return sizes[this.type] || sizes['normal'];
    }

    getColorByType() {
        const colors = {
            'small': '#ff6b6b',
            'normal': '#4ecdc4',
            'large': '#45b7d1',
            'bonus': '#ffa726'
        };
        return colors[this.type] || colors['normal'];
    }

    getValueByType() {
        const values = {
            'small': 15,
            'normal': 10,
            'large': 25,
            'bonus': 50
        };
        return values[this.type] || values['normal'];
    }

    update(deltaTime, gameTime) {
        // Basic movement
        this.position.add(this.velocity.clone().multiply(deltaTime * 60));
        
        // Bobbing motion
        this.shadowOffset = Math.sin(gameTime * this.bobSpeed + this.bobOffset) * 3;
        
        // Wind effect
        const windStrength = 0.3;
        this.velocity.x += (Math.sin(gameTime * 0.5) * windStrength - this.velocity.x * 0.01) * deltaTime;
        
        // Speed up over time
        this.velocity.y -= 0.05 * deltaTime;
    }

    draw(ctx) {
        if (this.isDestroyed) return;

        ctx.save();
        
        // Shadow
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(
            this.position.x + 5, 
            this.position.y + this.radius + 5 + this.shadowOffset, 
            this.radius * 0.8, 
            this.radius * 0.3, 
            0, 0, Math.PI * 2
        );
        ctx.fill();
        ctx.restore();

        // Balloon body
        const gradient = ctx.createRadialGradient(
            this.position.x - this.radius * 0.3,
            this.position.y - this.radius * 0.3,
            0,
            this.position.x,
            this.position.y,
            this.radius
        );
        gradient.addColorStop(0, this.lightenColor(this.color, 0.4));
        gradient.addColorStop(0.7, this.color);
        gradient.addColorStop(1, this.darkenColor(this.color, 0.3));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * this.scale, 0, Math.PI * 2);
        ctx.fill();

        // Balloon highlight
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(
            this.position.x - this.radius * 0.3,
            this.position.y - this.radius * 0.3,
            this.radius * 0.3,
            this.radius * 0.5,
            -0.3, 0, Math.PI * 2
        );
        ctx.fill();
        ctx.restore();

        // String
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.position.x, this.position.y + this.radius);
        ctx.lineTo(this.position.x + 2, this.position.y + this.radius + 40);
        ctx.stroke();

        // Bonus indicator
        if (this.type === 'bonus') {
            ctx.save();
            ctx.font = 'bold 12px Arial';
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.fillText('★', this.position.x, this.position.y + 4);
            ctx.restore();
        }

        ctx.restore();
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace("#",""), 16);
        const amt = Math.round(2.55 * percent * 100);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace("#",""), 16);
        const amt = Math.round(2.55 * percent * 100);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }

    isOutOfBounds(canvasHeight) {
        return this.position.y + this.radius < -50;
    }

    isClickedBy(clickPosition) {
        const distance = this.position.distance(clickPosition);
        return distance <= this.radius && !this.isDestroyed;
    }

    destroy() {
        this.isDestroyed = true;
    }
}

class BalloonGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.crosshair = document.getElementById('crosshair');
        
        // Game state
        this.gameState = 'start'; // 'start', 'playing', 'paused', 'gameOver'
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameTime = 0;
        this.lastTime = 0;
        
        // Game objects
        this.balloons = [];
        this.particles = [];
        this.floatingTexts = [];
        
        // Game settings
        this.balloonSpawnRate = 2000; // milliseconds
        this.lastBalloonSpawn = 0;
        this.isMuted = false;
        
        // Input
        this.mousePosition = new Vector2();
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        this.setupCanvas();
        this.setupEventListeners();
        this.initializeUI();
        
        // Start game loop
        this.gameLoop();
    }

    setupCanvas() {
        const resizeCanvas = () => {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = e.clientX - rect.left;
            this.mousePosition.y = e.clientY - rect.top;
            this.updateCrosshair();
        });

        this.canvas.addEventListener('click', (e) => {
            if (this.gameState === 'playing') {
                const rect = this.canvas.getBoundingClientRect();
                const clickPos = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
                this.handleShoot(clickPos);
            }
        });

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                const rect = this.canvas.getBoundingClientRect();
                const touch = e.touches[0];
                const touchPos = new Vector2(touch.clientX - rect.left, touch.clientY - rect.top);
                this.handleShoot(touchPos);
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mousePosition.x = touch.clientX - rect.left;
            this.mousePosition.y = touch.clientY - rect.top;
            this.updateCrosshair();
        });

        // Button events
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('muteBtn').addEventListener('click', () => this.toggleMute());

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                case 'Enter':
                    if (this.gameState === 'playing') {
                        this.handleShoot(this.mousePosition);
                    }
                    break;
                case 'KeyP':
                    this.togglePause();
                    break;
                case 'KeyM':
                    this.toggleMute();
                    break;
            }
        });
    }

    initializeUI() {
        this.updateUI();
        if (this.isMobile) {
            this.crosshair.style.display = 'none';
        }
    }

    updateCrosshair() {
        if (!this.isMobile && this.gameState === 'playing') {
            this.crosshair.style.left = this.mousePosition.x + 'px';
            this.crosshair.style.top = this.mousePosition.y + 'px';
            this.crosshair.style.display = 'block';
        }
    }

    startGame() {
        this.gameState = 'playing';
        document.getElementById('startScreen').classList.add('hidden');
        this.updateCrosshair();
    }

    restartGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameTime = 0;
        this.balloons = [];
        this.particles = [];
        this.floatingTexts = [];
        this.balloonSpawnRate = 2000;
        this.lastBalloonSpawn = 0;
        
        this.gameState = 'playing';
        document.getElementById('gameOverScreen').classList.add('hidden');
        this.updateUI();
        this.updateCrosshair();
    }

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseBtn').textContent = '▶️ Continuar';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseBtn').textContent = '⏸️ Pausar';
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        document.getElementById('muteBtn').textContent = this.isMuted ? '🔇 Som' : '🔊 Som';
    }

    handleShoot(position) {
        let hit = false;
        
        // Check for balloon hits
        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const balloon = this.balloons[i];
            if (balloon.isClickedBy(position)) {
                this.popBalloon(balloon, i);
                hit = true;
                break; // Only hit one balloon per shot
            }
        }

        // Create muzzle flash effect
        this.createMuzzleFlash(position);
        
        // Play sound effect
        if (!this.isMuted) {
            this.playSound(hit ? 'pop' : 'miss');
        }
    }

    popBalloon(balloon, index) {
        // Add score
        this.score += balloon.value;
        
        // Create particles
        this.createParticles(balloon.position, balloon.color);
        
        // Create floating score text
        this.createFloatingText(balloon.position, '+' + balloon.value);
        
        // Remove balloon
        this.balloons.splice(index, 1);
        
        // Check for level progression
        this.checkLevelProgression();
        
        this.updateUI();
    }

    createParticles(position, color) {
        const particleCount = 8 + Math.random() * 12;
        for (let i = 0; i < particleCount; i++) {
            const velocity = new Vector2(
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200
            );
            const particle = new Particle(
                position.x,
                position.y,
                color,
                velocity,
                1000 + Math.random() * 1000
            );
            this.particles.push(particle);
        }
    }

    createMuzzleFlash(position) {
        const flashCount = 5;
        for (let i = 0; i < flashCount; i++) {
            const velocity = new Vector2(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50
            );
            const particle = new Particle(
                position.x,
                position.y,
                '#ffff00',
                velocity,
                200 + Math.random() * 300
            );
            this.particles.push(particle);
        }
    }

    createFloatingText(position, text) {
        const floatingText = {
            position: position.clone(),
            text: text,
            life: 2000,
            maxLife: 2000,
            velocity: new Vector2(0, -50)
        };
        this.floatingTexts.push(floatingText);
    }

    spawnBalloon() {
        const x = Math.random() * this.canvas.width;
        const y = this.canvas.height + 50;
        
        // Determine balloon type based on random chance
        let type = 'normal';
        const rand = Math.random();
        if (rand < 0.1) type = 'bonus';
        else if (rand < 0.3) type = 'small';
        else if (rand < 0.5) type = 'large';
        
        const balloon = new Balloon(x, y, type);
        this.balloons.push(balloon);
    }

    checkLevelProgression() {
        const balloonsPoppedThisLevel = Math.floor(this.score / 100);
        const newLevel = Math.floor(balloonsPoppedThisLevel / 10) + 1;
        
        if (newLevel > this.level) {
            this.level = newLevel;
            this.balloonSpawnRate = Math.max(800, this.balloonSpawnRate - 100);
            this.createFloatingText(
                new Vector2(this.canvas.width / 2, this.canvas.height / 2),
                'Level ' + this.level + '!'
            );
        }
    }

    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }

    playSound(type) {
        // Create audio context for sound effects
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        if (type === 'pop') {
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } else if (type === 'miss') {
            oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.05);
        }
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;

        this.gameTime += deltaTime;

        // Spawn balloons
        if (this.gameTime - this.lastBalloonSpawn > this.balloonSpawnRate) {
            this.spawnBalloon();
            this.lastBalloonSpawn = this.gameTime;
        }

        // Update balloons
        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const balloon = this.balloons[i];
            balloon.update(deltaTime / 1000, this.gameTime / 1000);
            
            if (balloon.isOutOfBounds(this.canvas.height)) {
                this.balloons.splice(i, 1);
                this.lives--;
                this.updateUI();
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime / 1000);
            
            if (!particle.isAlive()) {
                this.particles.splice(i, 1);
            }
        }

        // Update floating texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const text = this.floatingTexts[i];
            text.position.add(text.velocity.clone().multiply(deltaTime / 1000));
            text.life -= deltaTime;
            
            if (text.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    draw() {
        // Clear canvas with gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw clouds
        this.drawClouds();

        // Draw balloons
        this.balloons.forEach(balloon => balloon.draw(this.ctx));

        // Draw particles
        this.particles.forEach(particle => particle.draw(this.ctx));

        // Draw floating texts
        this.drawFloatingTexts();

        // Draw pause overlay
        if (this.gameState === 'paused') {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSADO', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.restore();
        }
    }

    drawClouds() {
        const cloudCount = 3;
        for (let i = 0; i < cloudCount; i++) {
            const x = (this.canvas.width / cloudCount) * i + 50;
            const y = 50 + Math.sin(this.gameTime / 2000 + i) * 20;
            
            this.ctx.save();
            this.ctx.globalAlpha = 0.7;
            this.ctx.fillStyle = '#ffffff';
            
            // Simple cloud shape
            this.ctx.beginPath();
            this.ctx.arc(x, y, 30, 0, Math.PI * 2);
            this.ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
            this.ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
            this.ctx.arc(x + 25, y - 25, 25, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    drawFloatingTexts() {
        this.floatingTexts.forEach(text => {
            this.ctx.save();
            const alpha = text.life / text.maxLife;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#ff4757';
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeText(text.text, text.position.x, text.position.y);
            this.ctx.fillText(text.text, text.position.x, text.position.y);
            this.ctx.restore();
        });
    }

    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverScreen').classList.remove('hidden');
        this.crosshair.style.display = 'none';
    }

    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BalloonGame();
});