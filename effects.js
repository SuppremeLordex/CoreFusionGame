// effects.js - Visual effects classes
import { ORB_TYPES } from './constants.js';

export class MergeEffect {
    constructor(x, y, type, ctx) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.ctx = ctx;
        this.particles = [];
        this.lifetime = 60; // frames
        this.age = 0;
        
        // Create more particles for better effect
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                size: Math.random() * 6 + 3,
                color: ORB_TYPES[type].color,
                life: 1
            });
        }
    }
    
    update() {
        this.age++;
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.95;
            particle.vy *= 0.95;
            particle.size *= 0.98;
            particle.life -= 0.02;
        });
    }
    
    draw() {
        this.particles.forEach(particle => {
            if (particle.life > 0) {
                this.ctx.save();
                this.ctx.globalAlpha = particle.life;
                this.ctx.shadowColor = particle.color;
                this.ctx.shadowBlur = 5;
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        });
    }
    
    isDead() {
        return this.age >= this.lifetime;
    }
}

export class ComboEffect {
    constructor(x, y, comboCount, multiplier, ctx) {
        this.x = x;
        this.y = y;
        this.comboCount = comboCount;
        this.multiplier = multiplier;
        this.ctx = ctx;
        this.age = 0;
        this.lifetime = 120; // 2 seconds
        this.vy = -1;
        this.scale = 1;
    }
    
    update() {
        this.age++;
        this.y += this.vy;
        this.vy *= 0.98;
        this.scale = 1 + Math.sin(this.age * 0.1) * 0.1;
    }
    
    draw() {
        const alpha = Math.max(0, 1 - (this.age / this.lifetime));
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.scale(this.scale, this.scale);
        
        // Combo text with glow
        this.ctx.shadowColor = '#ff6b6b';
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${this.comboCount}x COMBO!`, this.x / this.scale, (this.y - 20) / this.scale);
        
        // Multiplier text
        this.ctx.shadowColor = '#ffd700';
        this.ctx.fillStyle = '#ffd700';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText(`×${this.multiplier} Multiplier`, this.x / this.scale, this.y / this.scale);
        
        this.ctx.restore();
    }
    
    isDead() {
        return this.age >= this.lifetime;
    }
}

export class ScorePopup {
    constructor(x, y, points, isCombo = false, ctx) {
        this.x = x;
        this.y = y;
        this.points = points;
        this.isCombo = isCombo;
        this.ctx = ctx;
        this.age = 0;
        this.lifetime = 60;
        this.vy = -2;
        this.scale = isCombo ? 1.5 : 1;
    }
    
    update() {
        this.age++;
        this.y += this.vy;
        this.vy *= 0.95;
        if (this.isCombo) {
            this.scale = 1.5 + Math.sin(this.age * 0.2) * 0.2;
        }
    }
    
    draw() {
        const alpha = Math.max(0, 1 - (this.age / this.lifetime));
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.scale(this.scale, this.scale);
        
        // Add glow effect
        this.ctx.shadowColor = this.isCombo ? '#ff6b6b' : '#ffd700';
        this.ctx.shadowBlur = 10;
        
        this.ctx.fillStyle = this.isCombo ? '#ff6b6b' : '#ffd700';
        this.ctx.font = this.isCombo ? 'bold 24px Arial' : 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`+${this.points}`, this.x / this.scale, this.y / this.scale);
        
        this.ctx.restore();
    }
    
    isDead() {
        return this.age >= this.lifetime;
    }
} 