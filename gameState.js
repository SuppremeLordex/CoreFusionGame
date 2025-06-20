// gameState.js - Game state management and core logic
import { ORB_TYPES, GAME_CONFIG, CONTAINER_X, CONTAINER_Y, GAME_OVER_LINE } from './constants.js';
import { Orb } from './orb.js';
import { MergeEffect, ComboEffect, ScorePopup } from './effects.js';

export class GameState {
    constructor(canvas, ctx, audioManager, renderer) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.audioManager = audioManager;
        this.renderer = renderer;
        
        // Game state variables
        this.gameRunning = true;
        this.gameWon = false;
        this.gameOver = false;
        this.score = 0;
        this.orbs = [];
        this.currentOrb = null;
        this.nextOrbType = 0;
        this.mouseX = canvas.width / 2;
        this.isDropping = false;
        this.dropCooldown = 0;
        this.gameOverTimer = 0;
        this.animationTime = 0;
        this.screenShake = 0;
        
        // Combo system
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboMultiplier = 1;
        this.lastMergeTime = 0;
        
        // Effects arrays
        this.mergeEffects = [];
        this.scorePopups = [];
        this.comboEffects = [];
        
        // UI elements
        this.scoreElement = document.getElementById('score');
        this.restartBtn = document.getElementById('restartBtn');
        
        this.setupEventListeners();
    }

    init() {
        this.gameRunning = true;
        this.gameWon = false;
        this.gameOver = false;
        this.score = 0;
        this.orbs = [];
        this.currentOrb = null;
        this.nextOrbType = Math.floor(Math.random() * 3);
        this.dropCooldown = 0;
        this.isDropping = false;
        this.gameOverTimer = 0;
        this.animationTime = 0;
        this.screenShake = 0;
        
        // Reset combo system
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboMultiplier = 1;
        this.lastMergeTime = 0;
        
        // Clear effects
        this.mergeEffects = [];
        this.scorePopups = [];
        this.comboEffects = [];
        
        this.updateScore();
        this.createPreviewOrb();
    }

    createPreviewOrb() {
        if (this.gameRunning && !this.currentOrb) {
            const constrainedX = Math.max(
                CONTAINER_X + ORB_TYPES[this.nextOrbType].radius,
                Math.min(CONTAINER_X + GAME_CONFIG.CONTAINER_WIDTH - ORB_TYPES[this.nextOrbType].radius, this.mouseX)
            );
            
            this.currentOrb = new Orb(constrainedX, CONTAINER_Y - 30, this.nextOrbType, false, this.ctx);
        }
    }

    dropOrb() {
        if (this.gameRunning && this.currentOrb && this.dropCooldown <= 0) {
            // Convert preview orb to dropping orb
            this.currentOrb.isDropping = true;
            this.currentOrb.y = CONTAINER_Y - 20;
            this.orbs.push(this.currentOrb);
            
            // Play drop sound
            this.audioManager.playDropSound();
            
            // Generate next orb type - expanded range for new orbs
            const maxOrbType = Math.min(5, Math.max(3, Math.floor(this.score / 400) + 3));
            this.nextOrbType = Math.floor(Math.random() * maxOrbType);
            
            // Reset for next orb
            this.currentOrb = null;
            this.isDropping = true;
            this.dropCooldown = GAME_CONFIG.DROP_COOLDOWN;
            
            // Create new preview orb after a short delay
            setTimeout(() => {
                this.createPreviewOrb();
                this.isDropping = false;
            }, 500);
        }
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    handleMerge(orb1, orb2) {
        const currentTime = Date.now();
        const mergeData = orb1.prepareMergeData(orb2);
        
        // Create merge effect
        this.mergeEffects.push(new MergeEffect(mergeData.mergeX, mergeData.mergeY, mergeData.oldType, this.ctx));
        
        // Create new merged orb
        const newOrb = new Orb(mergeData.mergeX, mergeData.mergeY, mergeData.newType, true, this.ctx);
        newOrb.justMerged = true;
        newOrb.vx = mergeData.vx;
        newOrb.vy = mergeData.vy;
        newOrb.hasBeenBelowDangerLine = orb1.hasBeenBelowDangerLine || orb2.hasBeenBelowDangerLine; // Inherit tracking
        
        this.orbs.push(newOrb);
        
        // Mark orbs for removal
        orb1.merged = true;
        orb2.merged = true;
        
        // Update combo system
        this.updateComboSystem(currentTime);
        
        // Calculate points with combo multiplier
        const basePoints = ORB_TYPES[mergeData.newType].points;
        const totalPoints = basePoints * this.comboMultiplier;
        this.score += totalPoints;
        this.updateScore();
        
        // Screen shake for big merges
        if (mergeData.newType >= 5) {
            this.screenShake = Math.min(10, mergeData.newType * 2);
        }
        
        // Show effects
        this.scorePopups.push(new ScorePopup(mergeData.mergeX, mergeData.mergeY, totalPoints, this.comboMultiplier > 1, this.ctx));
        
        if (this.comboCount > 1) {
            this.comboEffects.push(new ComboEffect(mergeData.mergeX, mergeData.mergeY - 40, this.comboCount, this.comboMultiplier, this.ctx));
            this.audioManager.playComboSound(this.comboCount);
        } else {
            this.audioManager.playMergeSound(mergeData.newType);
        }
        
        // Check for win condition
        if (mergeData.newType === ORB_TYPES.length - 1) {
            this.triggerWin();
        }
        
        console.log(`Merged ${ORB_TYPES[mergeData.oldType].name} -> ${ORB_TYPES[mergeData.newType].name} (+${totalPoints} points) ${this.comboCount > 1 ? `[${this.comboCount}x COMBO!]` : ''}`);
    }

    updateComboSystem(currentTime) {
        if (currentTime - this.lastMergeTime < GAME_CONFIG.COMBO_TIMEOUT) {
            this.comboCount++;
            this.comboTimer = GAME_CONFIG.COMBO_TIMER_FRAMES;
            this.comboMultiplier = Math.min(this.comboCount, GAME_CONFIG.MAX_COMBO_MULTIPLIER);
        } else {
            this.comboCount = 1;
            this.comboTimer = GAME_CONFIG.COMBO_TIMER_FRAMES;
            this.comboMultiplier = 1;
        }
        this.lastMergeTime = currentTime;
    }

    updateCombo() {
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) {
                this.comboCount = 0;
                this.comboMultiplier = 1;
            }
        }
    }

    checkGameOver() {
        // Simple and reliable: only count orbs that are moving very slowly above the danger line
        const orbsAboveLine = this.orbs.filter(orb => 
            !orb.merged && 
            (orb.y - orb.radius) < GAME_OVER_LINE &&
            Math.abs(orb.vy) < 1.5 // Key: only slow-moving orbs (not fast-falling drops)
        );
        
        if (orbsAboveLine.length > 0) {
            this.gameOverTimer++;
            console.log('🚨 DANGER! Game over timer:', this.gameOverTimer, '/', GAME_CONFIG.GAME_OVER_GRACE_PERIOD, 'Slow orbs above line:', orbsAboveLine.length);
            console.log('Dangerous orbs:', orbsAboveLine.map(orb => `${orb.type}@(${Math.round(orb.x)},${Math.round(orb.y-orb.radius)}) vy:${Math.round(orb.vy*10)/10}`));
            
            if (this.gameOverTimer > GAME_CONFIG.GAME_OVER_GRACE_PERIOD) {
                this.triggerGameOver();
            }
        } else {
            if (this.gameOverTimer > 0) {
                console.log('✅ Safe zone - resetting game over timer');
            }
            this.gameOverTimer = 0;
        }
    }

    triggerGameOver() {
        this.gameRunning = false;
        this.gameOver = true;
        this.audioManager.playGameOverSound();
        console.log('Game Over! Final Score:', this.score);
    }

    triggerWin() {
        this.gameRunning = false;
        this.gameWon = true;
        this.audioManager.playWinSound();
        this.screenShake = 20;
        console.log('You Win! Primal Core achieved! Final Score:', this.score);
    }

    checkForMerges() {
        for (let i = 0; i < this.orbs.length; i++) {
            const orb = this.orbs[i];
            if (orb.merged || !orb.isDropping) continue;
            
            for (let j = i + 1; j < this.orbs.length; j++) {
                const otherOrb = this.orbs[j];
                if (otherOrb.merged || !otherOrb.isDropping) continue;
                
                if (orb.type === otherOrb.type && orb.type < ORB_TYPES.length - 1 && 
                    !orb.justMerged && !otherOrb.justMerged) {
                    
                    const dx = orb.x - otherOrb.x;
                    const dy = orb.y - otherOrb.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = orb.radius + otherOrb.radius;
                    
                    // More forgiving merge threshold - merge when orbs are touching or close
                    const mergeThreshold = minDistance * 1.1; // 110% of full contact for easier merging
                    
                    if (distance < mergeThreshold) {
                        this.handleMerge(orb, otherOrb);
                        return; // Handle one merge per frame
                    }
                }
            }
        }
    }

    cleanupMergedOrbs() {
        this.orbs = this.orbs.filter(orb => !orb.merged);
    }

    updateEffects() {
        // Update and filter merge effects
        this.mergeEffects.forEach(effect => effect.update());
        this.mergeEffects = this.mergeEffects.filter(effect => !effect.isDead());
        
        // Update and filter combo effects
        this.comboEffects.forEach(effect => effect.update());
        this.comboEffects = this.comboEffects.filter(effect => !effect.isDead());
        
        // Update and filter score popups
        this.scorePopups.forEach(popup => popup.update());
        this.scorePopups = this.scorePopups.filter(popup => !popup.isDead());
    }

    drawEffects() {
        this.mergeEffects.forEach(effect => effect.draw());
        this.comboEffects.forEach(effect => effect.draw());
        this.scorePopups.forEach(popup => popup.draw());
    }

    update() {
        this.animationTime++;
        
        // Update cooldowns
        if (this.dropCooldown > 0) this.dropCooldown--;
        
        // Update combo system
        this.updateCombo();
        
        if (this.gameRunning) {
            // Update orbs
            this.orbs.forEach(orb => orb.update(this.orbs, this.gameRunning, this.animationTime));
            
            // Mark orbs in danger zone for visual indication
            this.orbs.forEach(orb => {
                orb.inDangerZone = !orb.merged && (orb.y - orb.radius) < GAME_OVER_LINE;
            });
            
            // Check for merges
            this.checkForMerges();
            
            // Clean up merged orbs
            this.cleanupMergedOrbs();
            
            // Check game over condition
            this.checkGameOver();
            
            // Update preview orb position
            if (this.currentOrb && !this.isDropping) {
                const constrainedX = Math.max(
                    CONTAINER_X + this.currentOrb.radius,
                    Math.min(CONTAINER_X + GAME_CONFIG.CONTAINER_WIDTH - this.currentOrb.radius, this.mouseX)
                );
                this.currentOrb.x = constrainedX;
            }
        }
        
        // Update effects
        this.updateEffects();
        
        // Update screen shake (just decay it, don't apply transform here)
        if (this.screenShake > 0) {
            this.screenShake *= 0.9;
            if (this.screenShake < 0.1) {
                this.screenShake = 0;
            }
        }
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
        });

        this.canvas.addEventListener('click', () => {
            this.dropOrb();
        });

        // Touch events
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mouseX = touch.clientX - rect.left;
        });

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.dropOrb();
        });

        // Restart button
        this.restartBtn.addEventListener('click', () => {
            this.init();
        });
    }
} 