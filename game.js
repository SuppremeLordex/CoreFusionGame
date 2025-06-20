// Core Fusion: Elemental Orbs Game - Main Entry Point
// Refactored modular version

import { AudioManager } from './audioManager.js';
import { GameState } from './gameState.js';
import { Renderer } from './renderer.js';

class CoreFusionGame {
    constructor() {
        try {
            console.log('CoreFusionGame constructor starting...');
            
            // Initialize canvas and context
            this.canvas = document.getElementById('gameCanvas');
            this.ctx = this.canvas.getContext('2d');
            
            if (!this.canvas) {
                throw new Error('Canvas element not found!');
            }
            if (!this.ctx) {
                throw new Error('Canvas context not available!');
            }
            
            console.log('Canvas initialized:', this.canvas.width, 'x', this.canvas.height);
            
            // Initialize core systems
            console.log('Initializing AudioManager...');
            this.audioManager = new AudioManager();
            
            console.log('Initializing Renderer...');
            this.renderer = new Renderer(this.canvas, this.ctx);
            
            console.log('Initializing GameState...');
            this.gameState = new GameState(this.canvas, this.ctx, this.audioManager, this.renderer);
            
            // Initialize audio on first user interaction
            this.setupAudioInitialization();
            
            console.log('Core Fusion: Elemental Orbs - Modular Version Loaded!');
        } catch (error) {
            console.error('Error in CoreFusionGame constructor:', error);
            throw error;
        }
    }

    setupAudioInitialization() {
        document.addEventListener('click', async () => {
            try {
                await this.audioManager.init();
                console.log('Audio initialized, starting background music...');
                // Start background music after audio is initialized
                setTimeout(() => {
                    if (this.audioManager.audioContext && this.audioManager.audioContext.state === 'running') {
                        this.audioManager.startBackgroundMusic();
                        console.log('Background music started successfully');
                    } else {
                        console.log('Audio context not ready, retrying...');
                        // Try to resume audio context if suspended
                        if (this.audioManager.audioContext && this.audioManager.audioContext.state === 'suspended') {
                            this.audioManager.audioContext.resume().then(() => {
                                this.audioManager.startBackgroundMusic();
                                console.log('Background music started after resume');
                            });
                        }
                    }
                }, 1000); // Increased delay to ensure audio context is ready
            } catch (error) {
                console.error('Error initializing audio:', error);
            }
        }, { once: true });
    }

    gameLoop() {
        try {
            // Update game state
            this.gameState.update();
            
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Apply screen shake
            this.ctx.save();
            
            // Apply screen shake transformation if active
            if (this.gameState.screenShake > 0) {
                const shakeX = (Math.random() - 0.5) * this.gameState.screenShake;
                const shakeY = (Math.random() - 0.5) * this.gameState.screenShake;
                this.ctx.translate(shakeX, shakeY);
            }
            
            // Draw background
            this.renderer.drawBackground();
            
            // Draw container
            this.renderer.drawContainer(this.gameState.gameOverTimer, this.gameState.animationTime);
            
            if (this.gameState.gameRunning) {
                // Draw all orbs
                this.gameState.orbs.forEach(orb => {
                    orb.draw(this.gameState.animationTime);
                });
                
                // Draw effects
                this.gameState.drawEffects();
                
                // Draw preview orb and drop line
                if (this.gameState.currentOrb && !this.gameState.isDropping) {
                    this.gameState.currentOrb.draw(this.gameState.animationTime);
                    this.renderer.drawDropLine(this.gameState.currentOrb);
                }
                
                // Draw UI
                this.renderer.drawUI(
                    this.gameState.nextOrbType,
                    this.gameState.comboCount,
                    this.gameState.comboMultiplier,
                    this.gameState.comboTimer,
                    this.gameState.gameOverTimer,
                    this.gameState.animationTime
                );
            } else {
                // Game is over, just draw existing orbs without updating
                this.gameState.orbs.forEach(orb => orb.draw(this.gameState.animationTime));
                
                // Continue drawing effects
                this.gameState.drawEffects();
                
                // Draw game end screen
                this.renderer.drawGameEndScreen(
                    this.gameState.gameWon, 
                    this.gameState.score, 
                    this.gameState.animationTime
                );
            }
            
            this.ctx.restore(); // Restore from screen shake
            
            requestAnimationFrame(() => this.gameLoop());
        } catch (error) {
            console.error('Error in game loop:', error);
            // Try to continue anyway
            requestAnimationFrame(() => this.gameLoop());
        }
    }

    start() {
        try {
            console.log('Starting game...');
            
            // Initialize game state
            this.gameState.init();
            console.log('Game state initialized');
            
            // Setup music toggle button
            this.setupMusicToggle();
            
            // Start the game loop
            this.gameLoop();
            
            console.log('Core Fusion: Elemental Orbs - Game Started!');
        } catch (error) {
            console.error('Error starting game:', error);
        }
    }
    
    setupMusicToggle() {
        const musicBtn = document.getElementById('musicBtn');
        if (musicBtn) {
            musicBtn.addEventListener('click', async () => {
                try {
                    // Ensure audio is initialized
                    if (!this.audioManager.initialized) {
                        console.log('Initializing audio...');
                        await this.audioManager.init();
                    }
                    
                    // Test audio first
                    console.log('Testing audio...');
                    this.audioManager.testAudio();
                    
                    // Resume audio context if suspended
                    if (this.audioManager.audioContext && this.audioManager.audioContext.state === 'suspended') {
                        console.log('Resuming suspended audio context...');
                        await this.audioManager.audioContext.resume();
                    }
                    
                    // Wait a moment then toggle background music
                    setTimeout(() => {
                        console.log('Toggling background music...');
                        const isPlaying = this.audioManager.toggleBackgroundMusic();
                        musicBtn.textContent = isPlaying ? '🎵 Music: ON' : '🔇 Music: OFF';
                        musicBtn.className = isPlaying ? 'music-btn' : 'music-btn off';
                        
                        console.log('Music toggled:', isPlaying ? 'ON' : 'OFF');
                    }, 100);
                } catch (error) {
                    console.error('Error toggling music:', error);
                    musicBtn.textContent = '🔇 Music: ERROR';
                    musicBtn.className = 'music-btn off';
                }
            });
        }
    }
}

// Initialize and start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM loaded, creating game...');
        const game = new CoreFusionGame();
        game.start();
    } catch (error) {
        console.error('Error creating game:', error);
        
        // Fallback: Show error on canvas
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ff0000';
                ctx.font = '20px Arial';
                ctx.fillText('Game Error - Check Console', 50, 50);
                ctx.fillText(error.message, 50, 80);
            }
        }
    }
}); 