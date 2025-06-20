// constants.js - Game constants and configuration
export const GAME_CONFIG = {
    GRAVITY: 0.3,
    FRICTION: 0.99,
    CONTAINER_WIDTH: 500,  // Made square - same as height
    CONTAINER_HEIGHT: 500, // Made square - same as width
    CANVAS_WIDTH: 1400, // Reduced from 2000 to 1400 (more reasonable width)
    CANVAS_HEIGHT: 600, // Reduced from 700 to 600 (fits better on screens)
    DROP_COOLDOWN: 30,
    COMBO_TIMEOUT: 3000, // 3 seconds
    COMBO_TIMER_FRAMES: 180, // 3 seconds at 60fps
    MAX_COMBO_MULTIPLIER: 5,
    GAME_OVER_GRACE_PERIOD: 60 // Reduced from 120 to 60 (1 second instead of 2)
};

export const ORB_TYPES = [
    { name: 'Spark', radius: 32, color: '#00ffff', points: 10 },        // Neon Cyan (reduced by 3%)
    { name: 'Flame', radius: 43, color: '#ff0080', points: 25 },        // Neon Pink
    { name: 'Ember', radius: 53, color: '#80ff00', points: 50 },        // Neon Lime
    { name: 'Fireball', radius: 64, color: '#ff4000', points: 100 },    // Neon Orange
    { name: 'Blaze', radius: 75, color: '#8000ff', points: 200 },       // Neon Purple
    { name: 'Inferno', radius: 85, color: '#ff0040', points: 400 },     // Neon Red
    { name: 'Core Fragment', radius: 96, color: '#0080ff', points: 800 }, // Neon Blue
    { name: 'Primal Core', radius: 107, color: '#ffff00', points: 1600 }, // Neon Yellow
    { name: 'Quantum Essence', radius: 117, color: '#ff00ff', points: 3200 }, // Neon Magenta
    { name: 'Cosmic Nexus', radius: 128, color: '#00ff00', points: 6400 }  // Neon Green
];

// Calculate container position (centered in the smaller canvas)
export const CONTAINER_X = (GAME_CONFIG.CANVAS_WIDTH - GAME_CONFIG.CONTAINER_WIDTH) / 2;
export const CONTAINER_Y = GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.CONTAINER_HEIGHT - 70; // Adjusted for smaller height
export const GAME_OVER_LINE = CONTAINER_Y + 20; // Moved higher up (was +50, now +20) 