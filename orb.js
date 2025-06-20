// orb.js - Orb class with physics and merging logic
import { ORB_TYPES, GAME_CONFIG, CONTAINER_X, CONTAINER_Y } from './constants.js';

export class Orb {
    constructor(x, y, type, isDropping = false, ctx) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.type = type;
        this.radius = ORB_TYPES[type].radius;
        this.color = ORB_TYPES[type].color;
        this.mass = this.radius * this.radius; // Mass proportional to area
        this.merged = false;
        this.isDropping = isDropping;
        this.settled = false;
        this.justMerged = false;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.ctx = ctx;
        this.wasDroppedFromTop = isDropping; // Track if this orb was dropped from top
        this.hasBeenBelowDangerLine = !isDropping; // Track if orb has been below danger line
        
        // Particle system for neon effects
        this.particles = [];
        this.particleTimer = 0;
        this.glowIntensity = 0.5 + Math.random() * 0.5;
        this.energyPulse = Math.random() * Math.PI * 2;
        
        // Initialize particles
        this.initializeParticles();
    }

    initializeParticles() {
        const particleCount = Math.floor(this.radius / 8) + 3; // More particles for bigger orbs
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: (Math.random() - 0.5) * this.radius * 0.6,
                y: (Math.random() - 0.5) * this.radius * 0.6,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                life: Math.random() * 100 + 50,
                maxLife: 150,
                size: Math.random() * 3 + 1,
                alpha: Math.random() * 0.8 + 0.2
            });
        }
    }

    updateParticles() {
        this.particleTimer++;
        this.energyPulse += 0.05;
        
        // Update existing particles
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.alpha = (particle.life / particle.maxLife) * 0.8;
            
            // Keep particles within orb bounds with some drift
            const distance = Math.sqrt(particle.x * particle.x + particle.y * particle.y);
            if (distance > this.radius * 0.7) {
                particle.vx *= -0.5;
                particle.vy *= -0.5;
            }
        });
        
        // Remove dead particles and add new ones
        this.particles = this.particles.filter(p => p.life > 0);
        
        // Add new particles occasionally
        if (this.particleTimer % 20 === 0 && this.particles.length < 15) {
            this.particles.push({
                x: (Math.random() - 0.5) * this.radius * 0.4,
                y: (Math.random() - 0.5) * this.radius * 0.4,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                life: Math.random() * 100 + 50,
                maxLife: 150,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.6 + 0.4
            });
        }
    }

    update(orbs, gameRunning, animationTime) {
        if (!this.merged && this.isDropping && gameRunning) {
            // Apply gravity
            this.vy += GAME_CONFIG.GRAVITY;
            
            // Apply friction
            this.vx *= GAME_CONFIG.FRICTION;
            this.vy *= GAME_CONFIG.FRICTION;
            
            // Update position
            this.x += this.vx;
            this.y += this.vy;
            
            // Track if orb has been below danger line - but only if settled or moving slowly
            if ((this.y - this.radius) > (CONTAINER_Y + 20)) { // GAME_OVER_LINE equivalent
                // Only mark as having been below if not falling fast (settled behavior)
                if (Math.abs(this.vy) < 3) {
                    this.hasBeenBelowDangerLine = true;
                }
            }
            
            // Container collision detection with stronger containment
            if (this.x - this.radius < CONTAINER_X) {
                this.x = CONTAINER_X + this.radius;
                this.vx = Math.abs(this.vx) * 0.6; // Force outward, reduce speed
            }
            if (this.x + this.radius > CONTAINER_X + GAME_CONFIG.CONTAINER_WIDTH) {
                this.x = CONTAINER_X + GAME_CONFIG.CONTAINER_WIDTH - this.radius;
                this.vx = -Math.abs(this.vx) * 0.6; // Force inward, reduce speed
            }
            if (this.y + this.radius > CONTAINER_Y + GAME_CONFIG.CONTAINER_HEIGHT) {
                this.y = CONTAINER_Y + GAME_CONFIG.CONTAINER_HEIGHT - this.radius;
                this.vy = Math.min(this.vy * -0.3, 0); // Bounce up or stop, reduce speed
                this.vx *= 0.8; // Ground friction
                
                // Mark as settled if moving slowly and has been on ground for a bit
                if (Math.abs(this.vy) < 0.4 && Math.abs(this.vx) < 0.4) {
                    if (!this.settlementTimer) {
                        this.settlementTimer = 0;
                    }
                    this.settlementTimer++;
                    
                    // Only mark as settled after being slow for 15 frames (0.25 seconds)
                    if (this.settlementTimer > 15) {
                        this.settled = true;
                        this.wasDroppedFromTop = false; // Clear the dropped flag once settled
                    }
                } else {
                    this.settlementTimer = 0;
                    this.settled = false;
                }
            }
            
            // Additional containment check - force orbs back if they somehow get outside
            const margin = 5; // Extra margin for safety
            if (this.x < CONTAINER_X - margin || this.x > CONTAINER_X + GAME_CONFIG.CONTAINER_WIDTH + margin ||
                this.y > CONTAINER_Y + GAME_CONFIG.CONTAINER_HEIGHT + margin) {
                console.warn('Orb escaped container bounds, forcing back in:', this.x, this.y);
                // Force orb back to safe position
                this.x = Math.max(CONTAINER_X + this.radius, Math.min(CONTAINER_X + GAME_CONFIG.CONTAINER_WIDTH - this.radius, this.x));
                this.y = Math.min(CONTAINER_Y + GAME_CONFIG.CONTAINER_HEIGHT - this.radius, this.y);
                this.vx *= 0.5;
                this.vy *= 0.5;
            }
            
            // Check collision with other orbs (only physics, not merging)
            this.checkCollisions(orbs);
        }
        
        // Update pulse animation
        this.pulsePhase += 0.1;
        
        // Update particle system
        this.updateParticles();
        
        // Reset merge flag after a short time
        if (this.justMerged) {
            setTimeout(() => {
                this.justMerged = false;
            }, 100);
        }
    }

    checkCollisions(orbs) {
        orbs.forEach(otherOrb => {
            if (otherOrb !== this && !otherOrb.merged && otherOrb.isDropping) {
                const dx = this.x - otherOrb.x;
                const dy = this.y - otherOrb.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = this.radius + otherOrb.radius;
                
                // Physics collision when orbs are close to touching (more responsive)
                const collisionThreshold = minDistance * 1.05; // Slightly more forgiving
                if (distance < collisionThreshold && distance > 0) {
                    this.handlePhysicsCollision(otherOrb, dx, dy, distance, minDistance);
                }
            }
        });
    }

    handlePhysicsCollision(otherOrb, dx, dy, distance, minDistance) {
        // Normalize collision vector
        const nx = dx / distance;
        const ny = dy / distance;
        
        // More forceful separation to prevent overlap
        const overlap = minDistance - distance;
        if (overlap > 0) {
            const totalMass = this.mass + otherOrb.mass;
            // Increase separation force to prevent overlapping
            const separation1 = overlap * (otherOrb.mass / totalMass) * 0.8;
            const separation2 = overlap * (this.mass / totalMass) * 0.8;
            
            this.x += nx * separation1;
            this.y += ny * separation1;
            otherOrb.x -= nx * separation2;
            otherOrb.y -= ny * separation2;
            
            // Additional separation if still overlapping
            const newDx = this.x - otherOrb.x;
            const newDy = this.y - otherOrb.y;
            const newDistance = Math.sqrt(newDx * newDx + newDy * newDy);
            
            if (newDistance < minDistance) {
                const additionalSeparation = (minDistance - newDistance) * 0.5;
                const newNx = newDx / newDistance;
                const newNy = newDy / newDistance;
                
                this.x += newNx * additionalSeparation;
                this.y += newNy * additionalSeparation;
                otherOrb.x -= newNx * additionalSeparation;
                otherOrb.y -= newNy * additionalSeparation;
            }
        }
        
        // Collision response
        const relativeVelX = this.vx - otherOrb.vx;
        const relativeVelY = this.vy - otherOrb.vy;
        const relativeSpeed = relativeVelX * nx + relativeVelY * ny;
        
        // Do not resolve if velocities are separating
        if (relativeSpeed > 0) return;
        
        // Collision impulse calculation
        const restitution = 0.2; // Reduced bounciness to prevent escaping
        const impulse = -(1 + restitution) * relativeSpeed;
        const totalMass = this.mass + otherOrb.mass;
        const impulsePerMass = impulse / totalMass;
        
        // Apply impulse based on mass ratios (reduced to prevent excessive bouncing)
        const impulse1 = impulsePerMass * otherOrb.mass * 0.6; // Reduced from 0.8
        const impulse2 = impulsePerMass * this.mass * 0.6; // Reduced from 0.8
        
        this.vx += impulse1 * nx;
        this.vy += impulse1 * ny;
        otherOrb.vx -= impulse2 * nx;
        otherOrb.vy -= impulse2 * ny;
        
        // Cap velocities to prevent excessive speed
        const maxVelocity = 8; // Maximum velocity to prevent escaping
        this.vx = Math.max(-maxVelocity, Math.min(maxVelocity, this.vx));
        this.vy = Math.max(-maxVelocity, Math.min(maxVelocity, this.vy));
        otherOrb.vx = Math.max(-maxVelocity, Math.min(maxVelocity, otherOrb.vx));
        otherOrb.vy = Math.max(-maxVelocity, Math.min(maxVelocity, otherOrb.vy));
        
        // Small random factor to prevent perfect stacking (reduced)
        const randomFactor = 0.02; // Reduced from 0.03
        this.vx += (Math.random() - 0.5) * randomFactor;
        otherOrb.vx += (Math.random() - 0.5) * randomFactor;
    }

    prepareMergeData(otherOrb) {
        const mergeX = (this.x + otherOrb.x) / 2;
        const mergeY = (this.y + otherOrb.y) / 2;
        const newType = this.type + 1;
        
        return {
            mergeX,
            mergeY,
            newType,
            oldType: this.type,
            vx: (this.vx + otherOrb.vx) / 2,
            vy: Math.min((this.vy + otherOrb.vy) / 2, -1)
        };
    }

    draw(animationTime) {
        if (!this.merged) {
            this.ctx.save();
            
            // Pulsing animation for preview orbs
            const pulseScale = this.isDropping ? 1 : 1 + Math.sin(this.pulsePhase) * 0.05;
            const energyGlow = 1 + Math.sin(this.energyPulse) * 0.3;
            
            this.ctx.scale(pulseScale, pulseScale);
            const drawX = this.x / pulseScale;
            const drawY = this.y / pulseScale;
            const drawRadius = this.radius / pulseScale;
            
            // Outer neon glow
            const outerGlow = this.ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, drawRadius * 1.5);
            outerGlow.addColorStop(0, this.color + '00');
            outerGlow.addColorStop(0.7, this.color + '40');
            outerGlow.addColorStop(1, this.color + '10');
            
            this.ctx.fillStyle = outerGlow;
            this.ctx.beginPath();
            this.ctx.arc(drawX, drawY, drawRadius * 1.5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Main orb body with neon gradient
            const mainGradient = this.ctx.createRadialGradient(
                drawX - drawRadius * 0.3, drawY - drawRadius * 0.3, 0,
                drawX, drawY, drawRadius
            );
            mainGradient.addColorStop(0, '#ffffff');
            mainGradient.addColorStop(0.3, this.color);
            mainGradient.addColorStop(0.7, this.color + 'CC');
            mainGradient.addColorStop(1, this.color + '44');
            
            this.ctx.fillStyle = mainGradient;
            this.ctx.beginPath();
            this.ctx.arc(drawX, drawY, drawRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw particles inside the orb
            this.particles.forEach(particle => {
                this.ctx.save();
                this.ctx.globalAlpha = particle.alpha * energyGlow;
                this.ctx.fillStyle = this.color;
                this.ctx.shadowColor = this.color;
                this.ctx.shadowBlur = particle.size * 2;
                
                this.ctx.beginPath();
                this.ctx.arc(
                    drawX + particle.x / pulseScale,
                    drawY + particle.y / pulseScale,
                    particle.size / pulseScale,
                    0, Math.PI * 2
                );
                this.ctx.fill();
                this.ctx.restore();
            });
            
            // Neon border with energy pulse
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = 3 * energyGlow;
            this.ctx.shadowColor = this.color;
            this.ctx.shadowBlur = 15 * energyGlow;
            this.ctx.beginPath();
            this.ctx.arc(drawX, drawY, drawRadius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Extra glow for preview orb
            if (!this.isDropping) {
                this.ctx.shadowColor = this.color;
                this.ctx.shadowBlur = 25;
                this.ctx.strokeStyle = this.color + '88';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
            
            // Extra effect for newly merged orbs
            if (this.justMerged) {
                this.ctx.shadowColor = '#ffffff';
                this.ctx.shadowBlur = 40;
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 4;
                this.ctx.stroke();
            }
            
            // Special effect for high-tier orbs
            if (this.type >= 7) {
                const time = animationTime * 0.05;
                this.ctx.shadowColor = '#ffffff';
                this.ctx.shadowBlur = 60 + Math.sin(time) * 30;
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 5 + Math.sin(time * 2) * 3;
                this.ctx.stroke();
                
                // Energy rings for highest tiers
                if (this.type >= 8) {
                    for (let i = 0; i < 3; i++) {
                        const ringRadius = drawRadius * (1.2 + i * 0.3);
                        const ringAlpha = (Math.sin(time + i) + 1) * 0.3;
                        this.ctx.strokeStyle = this.color + Math.floor(ringAlpha * 255).toString(16).padStart(2, '0');
                        this.ctx.lineWidth = 2;
                        this.ctx.beginPath();
                        this.ctx.arc(drawX, drawY, ringRadius, 0, Math.PI * 2);
                        this.ctx.stroke();
                    }
                }
            }
            
            this.ctx.restore();
        }
    }
} 