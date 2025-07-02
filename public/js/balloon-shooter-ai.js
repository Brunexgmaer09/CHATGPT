/**
 * Balloon Shooter Game with AI - Deep Q-Learning Implementation
 * Features: Advanced crosshair, AI agent with Brain.js, training system
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

    normalize() {
        const length = Math.sqrt(this.x * this.x + this.y * this.y);
        if (length > 0) {
            this.x /= length;
            this.y /= length;
        }
        return this;
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
        this.velocity.multiply(0.98);
        this.velocity.y += 0.1;
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
            (Math.random() - 0.5) * 0.5,
            -Math.random() * 2 - 1
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
        this.position.add(this.velocity.clone().multiply(deltaTime * 60));
        this.shadowOffset = Math.sin(gameTime * this.bobSpeed + this.bobOffset) * 3;
        
        const windStrength = 0.3;
        this.velocity.x += (Math.sin(gameTime * 0.5) * windStrength - this.velocity.x * 0.01) * deltaTime;
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

    // AI helper methods
    getStateVector() {
        return {
            x: this.position.x,
            y: this.position.y,
            vx: this.velocity.x,
            vy: this.velocity.y,
            radius: this.radius,
            value: this.value,
            type: this.type
        };
    }
}

// Deep Q-Learning Agent using Brain.js
class DQNAgent {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // Q-Network architecture
        this.network = new brain.NeuralNetwork({
            inputSize: 20, // State vector size
            hiddenLayers: [128, 64, 32],
            outputSize: 8, // Action space: 8 directions around screen
            learningRate: 0.001
        });
        
        // Experience replay buffer
        this.memory = [];
        this.memorySize = 10000;
        this.batchSize = 32;
        
        // Exploration parameters
        this.epsilon = 1.0;
        this.epsilonMin = 0.01;
        this.epsilonDecay = 0.995;
        
        // Learning parameters
        this.gamma = 0.95; // Discount factor
        this.targetUpdateFreq = 100;
        this.learningSteps = 0;
        
        // Performance tracking
        this.episodeRewards = [];
        this.totalExperiences = 0;
        this.lastAccuracy = 0;
        
        // Initialize network with random weights
        this.network.train([
            { input: Array(20).fill(0), output: Array(8).fill(0) }
        ], { iterations: 1 });
    }

    // Convert game state to neural network input
    getGameState(balloons, lives, score, canvasWidth, canvasHeight) {
        const state = Array(20).fill(0);
        
        // Normalize values
        const maxDistance = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
        
        // Game metrics (normalized)
        state[0] = lives / 3.0;
        state[1] = Math.min(score / 1000.0, 1.0);
        state[2] = balloons.length / 10.0; // Assume max 10 balloons
        
        // Closest balloon information
        if (balloons.length > 0) {
            const closest = this.findClosestBalloon(balloons, canvasWidth / 2, canvasHeight / 2);
            if (closest) {
                state[3] = closest.position.x / canvasWidth;
                state[4] = closest.position.y / canvasHeight;
                state[5] = closest.velocity.x / 5.0; // Normalize velocity
                state[6] = closest.velocity.y / 5.0;
                state[7] = closest.radius / 50.0; // Max radius 50
                state[8] = closest.value / 50.0; // Max value 50
                state[9] = this.getTypeValue(closest.type);
            }
        }
        
        // Threat analysis - balloons close to escaping
        const dangerBalloons = balloons.filter(b => b.position.y < canvasHeight * 0.3);
        state[10] = dangerBalloons.length / 5.0; // Max 5 danger balloons
        
        if (dangerBalloons.length > 0) {
            const mostDangerous = dangerBalloons.reduce((a, b) => 
                a.position.y < b.position.y ? a : b
            );
            state[11] = mostDangerous.position.x / canvasWidth;
            state[12] = mostDangerous.position.y / canvasHeight;
            state[13] = mostDangerous.value / 50.0;
        }
        
        // High-value targets
        const bonusBalloons = balloons.filter(b => b.type === 'bonus');
        state[14] = bonusBalloons.length / 3.0; // Max 3 bonus balloons
        
        if (bonusBalloons.length > 0) {
            const firstBonus = bonusBalloons[0];
            state[15] = firstBonus.position.x / canvasWidth;
            state[16] = firstBonus.position.y / canvasHeight;
        }
        
        // Spatial distribution of balloons
        const leftCount = balloons.filter(b => b.position.x < canvasWidth / 3).length;
        const rightCount = balloons.filter(b => b.position.x > canvasWidth * 2/3).length;
        const topCount = balloons.filter(b => b.position.y < canvasHeight / 3).length;
        
        state[17] = leftCount / 5.0;
        state[18] = rightCount / 5.0;
        state[19] = topCount / 5.0;
        
        return state;
    }

    getTypeValue(type) {
        const typeMap = { 'small': 0.25, 'normal': 0.5, 'large': 0.75, 'bonus': 1.0 };
        return typeMap[type] || 0.5;
    }

    findClosestBalloon(balloons, x, y) {
        if (balloons.length === 0) return null;
        
        return balloons.reduce((closest, balloon) => {
            const currentDist = Math.sqrt(
                Math.pow(balloon.position.x - x, 2) + 
                Math.pow(balloon.position.y - y, 2)
            );
            const closestDist = Math.sqrt(
                Math.pow(closest.position.x - x, 2) + 
                Math.pow(closest.position.y - y, 2)
            );
            return currentDist < closestDist ? balloon : closest;
        });
    }

    // Choose action using epsilon-greedy policy
    chooseAction(state) {
        if (Math.random() < this.epsilon) {
            // Random exploration
            return Math.floor(Math.random() * 8);
        } else {
            // Exploit learned policy
            const qValues = this.network.run(state);
            return this.argMax(qValues);
        }
    }

    argMax(array) {
        return array.indexOf(Math.max(...array));
    }

    // Convert action to screen coordinates
    actionToPosition(action, canvasWidth, canvasHeight) {
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const radius = Math.min(canvasWidth, canvasHeight) * 0.3;
        
        // 8 directions around center
        const angle = (action / 8) * 2 * Math.PI;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        return new Vector2(
            Math.max(0, Math.min(canvasWidth, x)),
            Math.max(0, Math.min(canvasHeight, y))
        );
    }

    // Calculate reward based on action outcome
    calculateReward(hit, balloon, livesLost, scoreGained) {
        let reward = 0;
        
        if (hit && balloon) {
            // Positive reward for hitting balloons
            reward += balloon.value * 0.1; // 1-5 points
            
            // Bonus for high-value targets
            if (balloon.type === 'bonus') {
                reward += 5;
            }
            
            // Bonus for hitting dangerous balloons (close to escaping)
            if (balloon.position.y < 200) {
                reward += 3;
            }
            
            // Bonus for difficult targets (small balloons)
            if (balloon.type === 'small') {
                reward += 2;
            }
        } else {
            // Small negative reward for missing
            reward -= 0.5;
        }
        
        // Large negative reward for losing lives
        if (livesLost > 0) {
            reward -= 10 * livesLost;
        }
        
        return reward;
    }

    // Store experience in replay buffer
    remember(state, action, reward, nextState, done) {
        const experience = {
            state: state,
            action: action,
            reward: reward,
            nextState: nextState,
            done: done
        };
        
        this.memory.push(experience);
        
        if (this.memory.length > this.memorySize) {
            this.memory.shift();
        }
        
        this.totalExperiences++;
    }

    // Train the network on a batch of experiences
    async replay() {
        if (this.memory.length < this.batchSize) {
            return;
        }
        
        // Sample random batch
        const batch = [];
        for (let i = 0; i < this.batchSize; i++) {
            const randomIndex = Math.floor(Math.random() * this.memory.length);
            batch.push(this.memory[randomIndex]);
        }
        
        // Prepare training data
        const trainingData = [];
        
        for (const experience of batch) {
            const { state, action, reward, nextState, done } = experience;
            
            // Current Q-values
            const currentQ = this.network.run(state);
            
            // Target Q-value
            let targetQ = reward;
            if (!done) {
                const nextQ = this.network.run(nextState);
                targetQ += this.gamma * Math.max(...nextQ);
            }
            
            // Update Q-value for taken action
            const target = [...currentQ];
            target[action] = targetQ;
            
            trainingData.push({
                input: state,
                output: target
            });
        }
        
        // Train network
        try {
            const result = this.network.train(trainingData, {
                iterations: 1,
                learningRate: 0.001
            });
            
            this.lastAccuracy = 1 - (result.error || 0);
        } catch (error) {
            console.warn('Training error:', error);
        }
        
        this.learningSteps++;
        
        // Decay epsilon
        if (this.epsilon > this.epsilonMin) {
            this.epsilon *= this.epsilonDecay;
        }
    }

    // Get AI statistics
    getStats() {
        return {
            epsilon: this.epsilon.toFixed(3),
            experiences: this.totalExperiences,
            accuracy: Math.round(this.lastAccuracy * 100),
            memorySize: this.memory.length
        };
    }

    // Reset agent
    reset() {
        this.memory = [];
        this.epsilon = 1.0;
        this.totalExperiences = 0;
        this.learningSteps = 0;
        this.episodeRewards = [];
        
        // Reinitialize network
        this.network = new brain.NeuralNetwork({
            inputSize: 20,
            hiddenLayers: [128, 64, 32],
            outputSize: 8,
            learningRate: 0.001
        });
        
        this.network.train([
            { input: Array(20).fill(0), output: Array(8).fill(0) }
        ], { iterations: 1 });
    }
}

// Main Game Class with AI Integration
class BalloonGameAI {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.crosshair = document.getElementById('crosshair');
        
        // Game state
        this.gameState = 'start';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.episode = 0;
        this.gameTime = 0;
        this.lastTime = 0;
        
        // Game objects
        this.balloons = [];
        this.particles = [];
        this.floatingTexts = [];
        
        // Game settings
        this.balloonSpawnRate = 2000;
        this.lastBalloonSpawn = 0;
        this.isMuted = false;
        this.gameSpeed = 1;
        
        // Input
        this.mousePosition = new Vector2();
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // AI settings
        this.aiMode = false;
        this.aiTraining = false;
        this.aiAgent = null;
        this.currentState = null;
        this.lastAction = null;
        this.lastLives = 3;
        this.aiTarget = null;
        this.aiTargetElement = null;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.initializeUI();
        this.gameLoop();
    }

    setupCanvas() {
        const resizeCanvas = () => {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            
            // Initialize AI agent when canvas is ready
            if (!this.aiAgent && this.canvas.width > 0 && this.canvas.height > 0) {
                this.aiAgent = new DQNAgent(this.canvas.width, this.canvas.height);
            }
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    setupEventListeners() {
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = e.clientX - rect.left;
            this.mousePosition.y = e.clientY - rect.top;
            this.updateCrosshair();
        });

        this.canvas.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing' && !this.aiMode) {
                const rect = this.canvas.getBoundingClientRect();
                const clickPos = new Vector2(e.clientX - rect.left, e.clientY - rect.top);
                this.handleShoot(clickPos);
            }
        });

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing' && !this.aiMode) {
                const rect = this.canvas.getBoundingClientRect();
                const touch = e.touches[0];
                const touchPos = new Vector2(touch.clientX - rect.left, touch.clientY - rect.top);
                this.handleShoot(touchPos);
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mousePosition.x = touch.clientX - rect.left;
            this.mousePosition.y = touch.clientY - rect.top;
            this.updateCrosshair();
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
        }, { passive: false });

        // Button events
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('muteBtn').addEventListener('click', () => this.toggleMute());
        
        // AI Control buttons
        document.getElementById('modeToggle').addEventListener('click', () => this.toggleAIMode());
        document.getElementById('trainBtn').addEventListener('click', () => this.toggleTraining());
        document.getElementById('speedBtn').addEventListener('click', () => this.toggleSpeed());
        document.getElementById('resetAiBtn').addEventListener('click', () => this.resetAI());

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                case 'Enter':
                    e.preventDefault();
                    if (this.gameState === 'playing' && !this.aiMode) {
                        this.handleShoot(this.mousePosition);
                    }
                    break;
                case 'KeyP':
                    this.togglePause();
                    break;
                case 'KeyM':
                    this.toggleMute();
                    break;
                case 'KeyA':
                    this.toggleAIMode();
                    break;
                case 'KeyT':
                    this.toggleTraining();
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
        if (this.gameState === 'playing') {
            if (!this.isMobile && !this.aiMode) {
                this.crosshair.style.left = this.mousePosition.x + 'px';
                this.crosshair.style.top = this.mousePosition.y + 'px';
                this.crosshair.style.display = 'block';
            } else if (this.aiMode && this.aiTarget) {
                this.crosshair.style.left = this.aiTarget.x + 'px';
                this.crosshair.style.top = this.aiTarget.y + 'px';
                this.crosshair.style.display = 'block';
            }
        }
    }

    // AI Control Methods
    toggleAIMode() {
        this.aiMode = !this.aiMode;
        const button = document.getElementById('modeToggle');
        
        if (this.aiMode) {
            button.textContent = '👤 Modo Humano';
            button.classList.add('active');
            this.crosshair.style.display = 'block';
        } else {
            button.textContent = '🤖 Modo IA';
            button.classList.remove('active');
            this.removeAITarget();
            if (this.isMobile) {
                this.crosshair.style.display = 'none';
            }
        }
    }

    toggleTraining() {
        this.aiTraining = !this.aiTraining;
        const button = document.getElementById('trainBtn');
        
        if (this.aiTraining) {
            button.textContent = '⏹️ Parar Treino';
            button.classList.add('active');
            // Auto-enable AI mode when training
            if (!this.aiMode) {
                this.toggleAIMode();
            }
        } else {
            button.textContent = '🧠 Treinar IA';
            button.classList.remove('active');
        }
    }

    toggleSpeed() {
        const speeds = [1, 2, 4, 8];
        const currentIndex = speeds.indexOf(this.gameSpeed);
        this.gameSpeed = speeds[(currentIndex + 1) % speeds.length];
        
        document.getElementById('speedBtn').textContent = `⚡ Velocidade: ${this.gameSpeed}x`;
    }

    resetAI() {
        if (this.aiAgent) {
            this.aiAgent.reset();
            this.episode = 0;
            this.updateUI();
        }
    }

    // AI Targeting Visual
    createAITarget(position) {
        this.removeAITarget();
        
        this.aiTargetElement = document.createElement('div');
        this.aiTargetElement.className = 'ai-target';
        this.aiTargetElement.style.left = position.x + 'px';
        this.aiTargetElement.style.top = position.y + 'px';
        document.getElementById('gameArea').appendChild(this.aiTargetElement);
        
        // Remove after short duration
        setTimeout(() => {
            this.removeAITarget();
        }, 300);
    }

    removeAITarget() {
        if (this.aiTargetElement) {
            this.aiTargetElement.remove();
            this.aiTargetElement = null;
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
        
        if (this.aiTraining) {
            this.episode++;
        }
        
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
        let hitBalloon = null;
        
        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const balloon = this.balloons[i];
            if (balloon.isClickedBy(position)) {
                this.popBalloon(balloon, i);
                hit = true;
                hitBalloon = balloon;
                break;
            }
        }

        this.createMuzzleFlash(position);
        
        if (!this.isMuted) {
            this.playSound(hit ? 'pop' : 'miss');
        }

        return { hit, balloon: hitBalloon };
    }

    // AI Decision Making
    processAI() {
        if (!this.aiMode || !this.aiAgent || this.gameState !== 'playing') {
            return;
        }

        // Get current game state
        const currentState = this.aiAgent.getGameState(
            this.balloons, this.lives, this.score, 
            this.canvas.width, this.canvas.height
        );

        // Store previous experience if available
        if (this.currentState && this.lastAction !== null && this.aiTraining) {
            const livesLost = this.lastLives - this.lives;
            const reward = this.aiAgent.calculateReward(
                false, null, livesLost, 0
            );
            
            this.aiAgent.remember(
                this.currentState,
                this.lastAction,
                reward,
                currentState,
                this.gameState === 'gameOver'
            );
        }

        // Choose action
        const action = this.aiAgent.chooseAction(currentState);
        const position = this.aiAgent.actionToPosition(action, this.canvas.width, this.canvas.height);
        
        // Execute action
        const result = this.handleShoot(position);
        
        // Store state and action for next iteration
        this.currentState = currentState;
        this.lastAction = action;
        this.lastLives = this.lives;
        
        // Store experience for successful hits
        if (result.hit && this.aiTraining) {
            const reward = this.aiAgent.calculateReward(
                true, result.balloon, 0, result.balloon.value
            );
            
            this.aiAgent.remember(
                currentState,
                action,
                reward,
                currentState, // Current state as next state for immediate reward
                false
            );
        }

        // Visual feedback
        this.aiTarget = position;
        this.createAITarget(position);
        
        // Train network periodically
        if (this.aiTraining && this.aiAgent.memory.length > this.aiAgent.batchSize) {
            this.aiAgent.replay();
        }
    }

    popBalloon(balloon, index) {
        this.score += balloon.value;
        this.createParticles(balloon.position, balloon.color);
        this.createFloatingText(balloon.position, '+' + balloon.value);
        this.balloons.splice(index, 1);
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
        document.getElementById('episode').textContent = this.episode;
        
        if (this.aiAgent) {
            const stats = this.aiAgent.getStats();
            document.getElementById('epsilon').textContent = stats.epsilon;
            document.getElementById('experiences').textContent = stats.experiences;
            document.getElementById('accuracy').textContent = stats.accuracy + '%';
        }
    }

    playSound(type) {
        try {
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
        } catch (error) {
            console.log('Audio not supported');
        }
    }

    update(deltaTime) {
        if (this.gameState !== 'playing') return;

        const effectiveDelta = deltaTime * this.gameSpeed;
        this.gameTime += effectiveDelta;

        // AI processing
        if (this.aiMode && this.gameTime % 200 < effectiveDelta) { // AI acts every 200ms
            this.processAI();
        }

        // Spawn balloons
        if (this.gameTime - this.lastBalloonSpawn > this.balloonSpawnRate / this.gameSpeed) {
            this.spawnBalloon();
            this.lastBalloonSpawn = this.gameTime;
        }

        // Update balloons
        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const balloon = this.balloons[i];
            balloon.update(effectiveDelta / 1000, this.gameTime / 1000);
            
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
            particle.update(effectiveDelta / 1000);
            
            if (!particle.isAlive()) {
                this.particles.splice(i, 1);
            }
        }

        // Update floating texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const text = this.floatingTexts[i];
            text.position.add(text.velocity.clone().multiply(effectiveDelta / 1000));
            text.life -= effectiveDelta;
            
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
        document.getElementById('finalEpisode').textContent = this.episode;
        document.getElementById('gameOverScreen').classList.remove('hidden');
        this.crosshair.style.display = 'none';
        
        // Auto-restart if training
        if (this.aiTraining) {
            setTimeout(() => {
                this.restartGame();
            }, 1000);
        }
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
    new BalloonGameAI();
});