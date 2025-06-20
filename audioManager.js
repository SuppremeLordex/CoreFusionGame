// AudioManager.js - Handle all audio functionality
export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.initialized = false;
        this.backgroundMusic = {
            playing: false,
            oscillators: [],
            gainNodes: [],
            volume: 0.15 // Increased volume further for better audibility
        };
    }
    
    async init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('Audio system initialized');
        } catch (error) {
            console.log('Audio not supported:', error);
        }
    }
    
    // Start ambient background music
    startBackgroundMusic() {
        console.log('startBackgroundMusic called');
        console.log('audioContext:', this.audioContext);
        console.log('backgroundMusic.playing:', this.backgroundMusic.playing);
        
        if (!this.audioContext) {
            console.error('No audio context available');
            return;
        }
        
        if (this.backgroundMusic.playing) {
            console.log('Background music already playing');
            return;
        }
        
        console.log('Audio context state:', this.audioContext.state);
        
        this.backgroundMusic.playing = true;
        
        try {
            // Create a softer, more organic space ambient track
            const now = this.audioContext.currentTime;
            console.log('Creating ambient layers at time:', now);
            
            // Softer base drone layer (warm, organic)
            this.createAmbientLayer(55, 'sine', 0.006, 8, now); // Softer sine wave
            this.createAmbientLayer(82.4, 'sine', 0.005, 12, now); // Pure sine for warmth
            
            // Gentle mid layer (ethereal, soft pads)
            this.createAmbientLayer(220, 'sine', 0.003, 6, now); // Soft sine instead of triangle
            this.createAmbientLayer(329.6, 'sine', 0.0025, 10, now); // Reduced volume
            
            // Subtle high layer (gentle sparkles)
            this.createAmbientLayer(880, 'sine', 0.0015, 4, now); // Much softer
            this.createAmbientLayer(1318.5, 'sine', 0.001, 7, now); // Pure sine, very soft
            
            // Very gentle rhythmic pulse layer
            this.createPulseLayer(110, 'sine', 0.003, 2, now); // Slower, softer pulse
            
            console.log('Background music layers created successfully');
            console.log('Total oscillators:', this.backgroundMusic.oscillators.length);
            console.log('Total gain nodes:', this.backgroundMusic.gainNodes.length);
        } catch (error) {
            console.error('Error creating background music:', error);
            this.backgroundMusic.playing = false;
        }
    }
    
    // Create an ambient layer with slow modulation
    createAmbientLayer(baseFreq, waveType, volume, modSpeed, startTime) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const lfoOscillator = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        
        // Setup main oscillator
        oscillator.type = waveType;
        oscillator.frequency.setValueAtTime(baseFreq, startTime);
        
        // Setup gentler LFO for subtle frequency modulation
        lfoOscillator.type = 'sine';
        lfoOscillator.frequency.setValueAtTime(0.05 + Math.random() * 0.1, startTime); // Slower modulation
        lfoGain.gain.setValueAtTime(baseFreq * 0.005, startTime); // Much gentler modulation
        
        // Connect LFO to main oscillator frequency
        lfoOscillator.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        
        // Setup gain with very slow fade in
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume * this.backgroundMusic.volume, startTime + 4); // Slower fade-in
        
        // Add very subtle volume modulation
        const volumeLfo = this.audioContext.createOscillator();
        const volumeLfoGain = this.audioContext.createGain();
        volumeLfo.type = 'sine';
        volumeLfo.frequency.setValueAtTime(0.02 + Math.random() * 0.03, startTime); // Much slower
        volumeLfoGain.gain.setValueAtTime(volume * 0.15, startTime); // Much gentler
        
        volumeLfo.connect(volumeLfoGain);
        volumeLfoGain.connect(gainNode.gain);
        
        // Connect audio chain
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Start all oscillators
        oscillator.start(startTime);
        lfoOscillator.start(startTime);
        volumeLfo.start(startTime);
        
        // Store references for cleanup
        this.backgroundMusic.oscillators.push(oscillator, lfoOscillator, volumeLfo);
        this.backgroundMusic.gainNodes.push(gainNode, lfoGain, volumeLfoGain);
    }
    
    // Create a subtle rhythmic pulse layer
    createPulseLayer(baseFreq, waveType, volume, pulseSpeed, startTime) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = waveType;
        oscillator.frequency.setValueAtTime(baseFreq, startTime);
        
        // Create pulsing effect
        gainNode.gain.setValueAtTime(0, startTime);
        
        const pulseDuration = 60 / pulseSpeed; // Convert BPM to seconds
        let currentTime = startTime;
        
        // Schedule pulses for the next 60 seconds (will be renewed)
        for (let i = 0; i < 60 * pulseSpeed; i++) {
            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(volume * this.backgroundMusic.volume, currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + pulseDuration * 0.8);
            currentTime += pulseDuration;
        }
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start(startTime);
        
        this.backgroundMusic.oscillators.push(oscillator);
        this.backgroundMusic.gainNodes.push(gainNode);
        
        // Schedule renewal of pulses
        setTimeout(() => {
            if (this.backgroundMusic.playing) {
                this.renewPulseLayer(oscillator, gainNode, baseFreq, volume, pulseSpeed);
            }
        }, 55000); // Renew before the scheduled pulses end
    }
    
    // Renew pulse layer to continue indefinitely
    renewPulseLayer(oscillator, gainNode, baseFreq, volume, pulseSpeed) {
        if (!this.backgroundMusic.playing) return;
        
        const now = this.audioContext.currentTime;
        const pulseDuration = 60 / pulseSpeed;
        let currentTime = now;
        
        for (let i = 0; i < 60 * pulseSpeed; i++) {
            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(volume * this.backgroundMusic.volume, currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + pulseDuration * 0.8);
            currentTime += pulseDuration;
        }
        
        setTimeout(() => {
            if (this.backgroundMusic.playing) {
                this.renewPulseLayer(oscillator, gainNode, baseFreq, volume, pulseSpeed);
            }
        }, 55000);
    }
    
    // Stop background music
    stopBackgroundMusic() {
        if (!this.backgroundMusic.playing) return;
        
        this.backgroundMusic.playing = false;
        
        const now = this.audioContext.currentTime;
        
        // Fade out all gain nodes
        this.backgroundMusic.gainNodes.forEach(gainNode => {
            try {
                gainNode.gain.linearRampToValueAtTime(0, now + 1);
            } catch (e) {
                // Ignore errors for already disconnected nodes
            }
        });
        
        // Stop all oscillators after fade out
        setTimeout(() => {
            this.backgroundMusic.oscillators.forEach(osc => {
                try {
                    osc.stop();
                } catch (e) {
                    // Ignore errors for already stopped oscillators
                }
            });
            
            // Clear arrays
            this.backgroundMusic.oscillators = [];
            this.backgroundMusic.gainNodes = [];
        }, 1100);
        
        console.log('Background music stopped');
    }
    
    // Toggle background music
    toggleBackgroundMusic() {
        if (this.backgroundMusic.playing) {
            this.stopBackgroundMusic();
        } else {
            this.startBackgroundMusic();
        }
        return this.backgroundMusic.playing;
    }
    
    // Set background music volume
    setBackgroundVolume(volume) {
        this.backgroundMusic.volume = Math.max(0, Math.min(0.1, volume)); // Limit to reasonable range
        
        if (this.backgroundMusic.playing) {
            this.backgroundMusic.gainNodes.forEach(gainNode => {
                try {
                    gainNode.gain.setValueAtTime(gainNode.gain.value * (volume / 0.03), this.audioContext.currentTime);
                } catch (e) {
                    // Ignore errors
                }
            });
        }
    }
    
    // Test if audio is working with a simple beep
    testAudio() {
        console.log('Testing audio...');
        if (!this.audioContext) {
            console.error('No audio context for test');
            return;
        }
        
        console.log('Audio context state:', this.audioContext.state);
        
        try {
            // Create a simple test tone
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4 note
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.5);
            
            console.log('Test audio played successfully');
        } catch (error) {
            console.error('Error playing test audio:', error);
        }
    }

    createTone(frequency, duration, type = 'sine', volume = 0.1) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playMergeSound(orbType) {
        const frequencies = [220, 261, 329, 392, 466, 523, 587, 659]; // Musical notes
        const frequency = frequencies[orbType] || 220;
        this.createTone(frequency, 0.2, 'triangle', 0.08);
    }
    
    playComboSound(comboCount) {
        // Ascending chord for combos
        const baseFreq = 261; // C note
        for (let i = 0; i < Math.min(comboCount, 4); i++) {
            setTimeout(() => {
                this.createTone(baseFreq * Math.pow(1.25, i), 0.15, 'sawtooth', 0.06);
            }, i * 50);
        }
    }
    
    playDropSound() {
        this.createTone(150, 0.1, 'triangle', 0.04);
    }
    
    playGameOverSound() {
        // Descending tone
        const frequencies = [392, 349, 311, 261];
        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                this.createTone(freq, 0.4, 'sawtooth', 0.1);
            }, i * 200);
        });
    }
    
    playWinSound() {
        // Victory fanfare
        const melody = [261, 329, 392, 523];
        melody.forEach((freq, i) => {
            setTimeout(() => {
                this.createTone(freq, 0.3, 'triangle', 0.1);
            }, i * 150);
        });
    }
} 