// renderer.js - Rendering functions for background, container, and UI
import { ORB_TYPES, GAME_CONFIG, CONTAINER_X, CONTAINER_Y, GAME_OVER_LINE } from './constants.js';
import { Orb } from './orb.js';

export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.animationTime = 0;
    }

    // Beautiful minimalistic background with neon theme
    drawBackground() {
        this.animationTime++;
        
        // Dark gradient background matching neon theme
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(0.3, '#1a1a3a');
        gradient.addColorStop(0.7, '#2a1a4a');
        gradient.addColorStop(1, '#1a0a2a');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Subtle animated orbs in background
        const time = this.animationTime * 0.01;
        const orbColors = ['#00ffff', '#ff0080', '#80ff00', '#ff4000', '#8000ff'];
        
        for (let i = 0; i < 8; i++) {
            const x = 100 + Math.sin(time + i * 0.8) * 50 + (i % 3) * 200;
            const y = 100 + Math.cos(time * 0.7 + i * 0.5) * 80 + Math.floor(i / 3) * 150;
            const size = 20 + Math.sin(time * 2 + i) * 5;
            const alpha = 0.05 + Math.sin(time + i) * 0.03;
            
            const color = orbColors[i % orbColors.length];
            
            // Outer glow
            const outerGlow = this.ctx.createRadialGradient(x, y, 0, x, y, size * 2);
            outerGlow.addColorStop(0, color + '00');
            outerGlow.addColorStop(0.5, color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
            outerGlow.addColorStop(1, color + '00');
            
            this.ctx.fillStyle = outerGlow;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Inner orb
            const innerGlow = this.ctx.createRadialGradient(x, y, 0, x, y, size);
            innerGlow.addColorStop(0, color + Math.floor(alpha * 100).toString(16).padStart(2, '0'));
            innerGlow.addColorStop(1, color + '00');
            
            this.ctx.fillStyle = innerGlow;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Subtle animated lines connecting some orbs
        this.ctx.strokeStyle = '#ffffff08';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            const x1 = 150 + Math.sin(time + i) * 100;
            const y1 = 150 + Math.cos(time + i) * 50;
            const x2 = 400 + Math.sin(time + i + 1) * 100;
            const y2 = 300 + Math.cos(time + i + 1) * 50;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
    }

    // Draw container/bowl - square shape without top
    drawContainer(gameOverTimer, animationTime) {
        this.ctx.save();
        
        // Container walls with enhanced glow
        const time = animationTime * 0.02;
        const glowIntensity = 0.8 + Math.sin(time) * 0.2;
        
        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.shadowColor = '#ffd700';
        this.ctx.shadowBlur = 15 * glowIntensity;
        
        // Left wall
        this.ctx.beginPath();
        this.ctx.moveTo(CONTAINER_X, CONTAINER_Y);
        this.ctx.lineTo(CONTAINER_X, CONTAINER_Y + GAME_CONFIG.CONTAINER_HEIGHT);
        this.ctx.stroke();
        
        // Right wall
        this.ctx.beginPath();
        this.ctx.moveTo(CONTAINER_X + GAME_CONFIG.CONTAINER_WIDTH, CONTAINER_Y);
        this.ctx.lineTo(CONTAINER_X + GAME_CONFIG.CONTAINER_WIDTH, CONTAINER_Y + GAME_CONFIG.CONTAINER_HEIGHT);
        this.ctx.stroke();
        
        // Bottom wall
        this.ctx.beginPath();
        this.ctx.moveTo(CONTAINER_X, CONTAINER_Y + GAME_CONFIG.CONTAINER_HEIGHT);
        this.ctx.lineTo(CONTAINER_X + GAME_CONFIG.CONTAINER_WIDTH, CONTAINER_Y + GAME_CONFIG.CONTAINER_HEIGHT);
        this.ctx.stroke();
        
        // No top wall - orbs need to drop in
        
        // Animated game over line (danger zone)
        const dangerIntensity = gameOverTimer > 0 ? 1 : 0.3;
        this.ctx.strokeStyle = `rgba(255, 68, 68, ${dangerIntensity})`;
        this.ctx.lineWidth = 2 + Math.sin(time * 3) * (gameOverTimer > 0 ? 2 : 0);
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(CONTAINER_X, GAME_OVER_LINE);
        this.ctx.lineTo(CONTAINER_X + GAME_CONFIG.CONTAINER_WIDTH, GAME_OVER_LINE);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        this.ctx.restore();
    }

    // Enhanced game over/win screen
    drawGameEndScreen(gameWon, score, animationTime) {
        this.ctx.save();
        
        // Dark overlay with animation
        const pulseAlpha = 0.8 + Math.sin(animationTime * 0.1) * 0.1;
        this.ctx.fillStyle = `rgba(0, 0, 0, ${pulseAlpha})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Main message with glow
        this.ctx.shadowColor = gameWon ? '#00ff00' : '#ff4444';
        this.ctx.shadowBlur = 20;
        this.ctx.fillStyle = gameWon ? '#00ff00' : '#ff4444';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        const message = gameWon ? 'VICTORY!' : 'GAME OVER';
        this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        // Sub message
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '24px Arial';
        if (gameWon) {
            this.ctx.fillText('You created the Cosmic Nexus!', this.canvas.width / 2, this.canvas.height / 2);
        } else {
            this.ctx.fillText('Orbs reached the danger zone!', this.canvas.width / 2, this.canvas.height / 2);
        }
        
        // Final score with glow
        this.ctx.shadowColor = '#ffd700';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillText(`Final Score: ${score}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
        
        // Restart instruction
        this.ctx.shadowBlur = 5;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Click "Restart Game" to play again', this.canvas.width / 2, this.canvas.height / 2 + 100);
        
        this.ctx.restore();
    }

    // Enhanced UI drawing with rules panel
    drawUI(nextOrbType, comboCount, comboMultiplier, comboTimer, gameOverTimer, animationTime) {
        this.ctx.save();
        
        // Left side - Next orb preview (proportionally positioned)
        const leftPanelX = 90; // Proportionally reduced from 120
        const leftPanelY = 100; // Proportionally reduced from 120
        
        // Left panel background - proportionally sized
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(leftPanelX - 25, leftPanelY - 30, 150, 320); // Proportionally smaller
        
        // Left panel border
        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#ffd700';
        this.ctx.shadowBlur = 10;
        this.ctx.strokeRect(leftPanelX - 25, leftPanelY - 30, 150, 320);
        
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        this.ctx.shadowBlur = 5;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = 'bold 16px Arial'; // Slightly smaller font
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Next Orb:', leftPanelX - 15, leftPanelY);
        
        // Draw preview of next orb type (smaller and better positioned)
        const nextPreviewOrb = new Orb(leftPanelX + 15, leftPanelY + 30, nextOrbType, false, this.ctx);
        // Scale down the preview orb to avoid interference
        nextPreviewOrb.radius = Math.min(nextPreviewOrb.radius, 22); // Slightly smaller
        nextPreviewOrb.draw(animationTime);
        
        // Enhanced combo display (positioned proportionally lower)
        if (comboCount > 1) {
            this.ctx.shadowColor = '#ff6b6b';
            this.ctx.shadowBlur = 10;
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.font = 'bold 14px Arial'; // Smaller font
            this.ctx.fillText(`Combo: ${comboCount}x`, leftPanelX - 15, leftPanelY + 100);
            
            this.ctx.shadowColor = '#ffd700';
            this.ctx.fillStyle = '#ffd700';
            this.ctx.font = '12px Arial'; // Smaller font
            this.ctx.fillText(`Multiplier: ×${comboMultiplier}`, leftPanelX - 15, leftPanelY + 120);
            
            // Enhanced combo timer bar
            const barWidth = 90; // Smaller bar
            const barHeight = 7;
            const barX = leftPanelX - 15;
            const barY = leftPanelY + 135;
            
            // Background
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Animated fill
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.shadowBlur = 5;
            const fillWidth = (comboTimer / 180) * barWidth;
            this.ctx.fillRect(barX, barY, fillWidth, barHeight);
            
            // Glow effect
            this.ctx.shadowColor = '#ff6b6b';
            this.ctx.shadowBlur = 10;
            this.ctx.strokeStyle = '#ff6b6b';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(barX, barY, barWidth, barHeight);
        }
        
        // Right side - Orb Evolution Rules (smaller and moved further right)
        const rulesX = this.canvas.width - 300; // Moved further right from 320
        const rulesY = 80; // Same vertical position
        
        // Rules panel background (smaller panel)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(rulesX - 20, rulesY - 15, 280, 420); // Smaller: 280x420 (was 340x480)
        
        // Rules panel border
        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#ffd700';
        this.ctx.shadowBlur = 15;
        this.ctx.strokeRect(rulesX - 20, rulesY - 15, 280, 420);
        
        // Rules title
        this.ctx.shadowColor = '#ffd700';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = 'bold 16px Arial'; // Smaller font
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ORB EVOLUTION GUIDE', rulesX + 120, rulesY + 10); // Centered in smaller panel
        
        // Draw orb evolution chain with tighter spacing
        this.ctx.font = '11px Arial'; // Smaller font
        this.ctx.textAlign = 'left';
        let currentY = rulesY + 35;
        
        for (let i = 0; i < ORB_TYPES.length - 1; i++) {
            // Current orb
            const currentOrb = new Orb(rulesX + 20, currentY, i, false, this.ctx);
            currentOrb.radius = Math.min(currentOrb.radius, 14); // Smaller orbs
            currentOrb.draw(animationTime);
            
            // Plus sign
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 12px Arial'; // Smaller font
            this.ctx.textAlign = 'center';
            this.ctx.fillText('+', rulesX + 55, currentY + 4);
            
            // Second orb (same type)
            const secondOrb = new Orb(rulesX + 80, currentY, i, false, this.ctx);
            secondOrb.radius = Math.min(secondOrb.radius, 14);
            secondOrb.draw(animationTime);
            
            // Arrow
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 14px Arial'; // Smaller font
            this.ctx.fillText('→', rulesX + 115, currentY + 4);
            
            // Result orb
            if (i + 1 < ORB_TYPES.length) {
                const resultOrb = new Orb(rulesX + 140, currentY, i + 1, false, this.ctx);
                resultOrb.radius = Math.min(resultOrb.radius, 14);
                resultOrb.draw(animationTime);
                
                // Orb name
                this.ctx.fillStyle = ORB_TYPES[i + 1].color;
                this.ctx.font = 'bold 10px Arial'; // Smaller font
                this.ctx.textAlign = 'left';
                this.ctx.fillText(ORB_TYPES[i + 1].name, rulesX + 165, currentY + 4);
            }
            
            currentY += 40; // Tighter spacing between rows
        }
        
        // Enhanced game title (positioned at top) - REMOVED since title is above canvas
        // this.ctx.shadowColor = '#ffd700';
        // this.ctx.shadowBlur = 15;
        // this.ctx.fillStyle = '#ffd700';
        // this.ctx.font = 'bold 24px Arial';
        // this.ctx.textAlign = 'center';
        // this.ctx.fillText('Core Fusion: Elemental Orbs', this.canvas.width / 2, 35);
        
        // Instructions with glow (positioned at bottom)
        this.ctx.shadowBlur = 5;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '14px Arial'; // Smaller font
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Move mouse to aim, click to drop • Merge same orbs! • Chain merges for combo bonus!', this.canvas.width / 2, this.canvas.height - 15);
        
        // Enhanced danger warning - only show for truly dangerous situations
        if (gameOverTimer > 0) {
            // Only show if timer has been running for a bit (not just started)
            if (gameOverTimer > 5) { // Reduced from 10 to 5 frames
                const pulseAlpha = 0.7 + Math.sin(animationTime * 0.3) * 0.3;
                this.ctx.shadowColor = '#ff4444';
                this.ctx.shadowBlur = 20;
                this.ctx.fillStyle = `rgba(255, 68, 68, ${pulseAlpha})`;
                this.ctx.font = 'bold 18px Arial'; // Smaller font
                this.ctx.fillText('⚠️ DANGER ZONE! ⚠️', this.canvas.width / 2, this.canvas.height - 40);
            }
        }
        
        this.ctx.restore();
    }

    // Draw enhanced drop line
    drawDropLine(currentOrb) {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
        this.ctx.shadowBlur = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(currentOrb.x, currentOrb.y + currentOrb.radius);
        this.ctx.lineTo(currentOrb.x, CONTAINER_Y + GAME_CONFIG.CONTAINER_HEIGHT);
        this.ctx.stroke();
        this.ctx.restore();
    }

    // Apply screen shake effect
    applyScreenShake(screenShake) {
        if (screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * screenShake;
            const shakeY = (Math.random() - 0.5) * screenShake;
            this.ctx.translate(shakeX, shakeY);
            return screenShake * 0.9 < 0.1 ? 0 : screenShake * 0.9;
        }
        return 0;
    }
} 