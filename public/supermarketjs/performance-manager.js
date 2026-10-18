// performance-manager.js - Audio performance optimization and resource management

window.performanceManager = {
  // Configuration
  config: {
    maxPolyphony: 8, // Maximum simultaneous voices (reduced for performance)
    maxEffectsPerType: 8, // Maximum effects per type in pool
    synthPoolSize: 16, // Pre-allocated synth pool size
    voiceStealingEnabled: true,
    effectReuseEnabled: true,
    performanceMode: 'balanced', // 'balanced', 'quality', 'performance'
    
    // Performance mode specific settings
    performanceModes: {
      quality: {
        maxPolyphony: 16,
        effectQuality: 'high',
        lookAhead: 0.05,
        updateInterval: 0.02,
        simplifyEffects: false,
        limitReverb: false
      },
      balanced: {
        maxPolyphony: 8,
        effectQuality: 'medium',
        lookAhead: 0.1,
        updateInterval: 0.05,
        simplifyEffects: true,
        limitReverb: true
      },
      performance: {
        maxPolyphony: 8,
        effectQuality: 'low',
        lookAhead: 0.2,
        updateInterval: 0.1,
        simplifyEffects: true,
        limitReverb: true
      }
    }
  },
  
  // Voice management
  activeVoices: [],
  voiceTimestamps: new Map(),
  
  // Cleanup interval
  cleanupInterval: null,
  
  // Effect pool
  effectPool: {
    reverb: [],
    delay: [],
    chorus: [],
    distortion: [],
    filter: [],
    phaser: [],
    tremolo: [],
    vibrato: [],
    bitCrusher: [],
    chebyshev: [],
    pingPongDelay: [],
    feedbackDelay: []
  },
  
  // Synth pool
  synthPool: {
    available: [],
    inUse: new Map()
  },
  
  // Performance metrics
  metrics: {
    droppedVoices: 0,
    effectReuses: 0,
    synthReuses: 0,
    lastCleanup: Date.now()
  },
  
  // Initialize performance manager
  init: function() {
    console.log("Initializing performance manager...");
    
    // Configure audio context for low latency
    if (Tone.context.rawContext) {
      // Request low latency hint
      if (Tone.context.rawContext.baseLatency) {
        console.log("Base latency:", Tone.context.rawContext.baseLatency);
      }
    }
    
    // Pre-allocate synth pool
    this.initializeSynthPool();
    
    // Set up performance monitoring
    this.startPerformanceMonitoring();
    
    // Start periodic cleanup
    this.startPeriodicCleanup();
    
    // Optimize Tone.js settings
    this.optimizeToneSettings();
  },
  
  // Initialize synth pool
  initializeSynthPool: function() {
    console.log("Pre-allocating synth pool...");
    
    // Pre-create synths for common types
    const synthTypes = ['FMSynth', 'AMSynth', 'Synth', 'PluckSynth', 'DuoSynth'];
    
    for (let i = 0; i < this.config.synthPoolSize; i++) {
      const type = synthTypes[i % synthTypes.length];
      const synth = this.createPooledSynth(type);
      synth.volume.value = -Infinity; // Mute until needed
      this.synthPool.available.push({
        type: type,
        synth: synth,
        lastUsed: 0
      });
    }
  },
  
  // Create a pooled synth
  createPooledSynth: function(type) {
    const synthConfigs = {
      FMSynth: {
        harmonicity: 3,
        modulationIndex: 10,
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.5 }
      },
      AMSynth: {
        harmonicity: 3,
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.5 }
      },
      Synth: {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.5 }
      },
      PluckSynth: {
        attackNoise: 1,
        dampening: 4000,
        resonance: 0.9
      },
      DuoSynth: {
        vibratoAmount: 0.5,
        vibratoRate: 5,
        harmonicity: 1.5
      }
    };
    
    return new Tone[type](synthConfigs[type] || {});
  },
  
  // Get or create effect from pool
  getPooledEffect: function(type, config) {
    if (!this.config.effectReuseEnabled) {
      return null; // Fall back to creating new effects
    }
    
    const pool = this.effectPool[type];
    if (!pool) return null;
    
    // Try to find an available effect
    for (let effect of pool) {
      if (!effect.inUse) {
        effect.inUse = true;
        this.metrics.effectReuses++;
        
        // Update effect parameters if provided
        if (config) {
          Object.keys(config).forEach(key => {
            if (effect[key] && effect[key].value !== undefined) {
              effect[key].value = config[key];
            } else if (effect[key] !== undefined) {
              effect[key] = config[key];
            }
          });
        }
        
        return effect;
      }
    }
    
    // Create new effect if pool not full
    if (pool.length < this.config.maxEffectsPerType) {
      const effect = this.createPooledEffectInstance(type, config);
      if (effect) {
        effect.inUse = true;
        pool.push(effect);
        return effect;
      }
    }
    
    return null; // Pool is full
  },
  
  // Create pooled effect instance
  createPooledEffectInstance: function(type, config) {
    const effectMap = {
      reverb: () => new Tone.Reverb(config || 3),
      delay: () => new Tone.Delay(config || 0.25),
      chorus: () => new Tone.Chorus(config || { frequency: 1.5, delayTime: 3.5, depth: 0.7 }),
      distortion: () => new Tone.Distortion(config || 0.8),
      filter: () => new Tone.Filter(config || { frequency: 2000, type: 'lowpass' }),
      phaser: () => new Tone.Phaser(config || { frequency: 0.5, octaves: 3 }),
      tremolo: () => new Tone.Tremolo(config || { frequency: 10, depth: 0.5 }),
      vibrato: () => new Tone.Vibrato(config || { frequency: 5, depth: 0.1 }),
      bitCrusher: () => new Tone.BitCrusher(config || 4),
      chebyshev: () => new Tone.Chebyshev(config || 50),
      pingPongDelay: () => new Tone.PingPongDelay(config || '8n'),
      feedbackDelay: () => new Tone.FeedbackDelay(config || '8n')
    };
    
    const createFn = effectMap[type];
    return createFn ? createFn() : null;
  },
  
  // Release effect back to pool
  releasePooledEffect: function(effect, type) {
    const pool = this.effectPool[type];
    if (!pool) return;
    
    const pooledEffect = pool.find(e => e === effect);
    if (pooledEffect) {
      pooledEffect.inUse = false;
      // Reset effect to default state
      if (effect.wet) effect.wet.value = 1;
    }
  },
  
  // Request a synth from pool
  requestSynth: function(productId, preferredType) {
    // Try to find a matching type first
    let availableIndex = this.synthPool.available.findIndex(s => s.type === preferredType);
    
    // If no matching type, use any available
    if (availableIndex === -1) {
      availableIndex = this.synthPool.available.findIndex(s => true);
    }
    
    if (availableIndex !== -1) {
      const synthEntry = this.synthPool.available.splice(availableIndex, 1)[0];
      synthEntry.lastUsed = Date.now();
      this.synthPool.inUse.set(productId, synthEntry);
      this.metrics.synthReuses++;
      
      // Reset and unmute
      synthEntry.synth.volume.value = -10;
      return synthEntry.synth;
    }
    
    // No available synths, need to steal or create
    if (this.config.voiceStealingEnabled) {
      return this.stealOldestSynth(productId, preferredType);
    }
    
    return null;
  },
  
  // Release synth back to pool
  releaseSynth: function(productId) {
    const synthEntry = this.synthPool.inUse.get(productId);
    if (synthEntry) {
      // Mute and return to pool
      synthEntry.synth.volume.value = -Infinity;
      synthEntry.synth.triggerRelease();
      
      this.synthPool.inUse.delete(productId);
      this.synthPool.available.push(synthEntry);
    }
  },
  
  // Steal oldest synth
  stealOldestSynth: function(productId, preferredType) {
    let oldest = null;
    let oldestTime = Infinity;
    let oldestId = null;
    
    for (const [id, entry] of this.synthPool.inUse) {
      if (entry.lastUsed < oldestTime) {
        oldest = entry;
        oldestTime = entry.lastUsed;
        oldestId = id;
      }
    }
    
    if (oldest) {
      // Remove from old product
      this.synthPool.inUse.delete(oldestId);
      
      // Assign to new product
      oldest.lastUsed = Date.now();
      this.synthPool.inUse.set(productId, oldest);
      
      // Reset synth
      oldest.synth.triggerRelease();
      oldest.synth.volume.value = -10;
      
      this.metrics.droppedVoices++;
      return oldest.synth;
    }
    
    return null;
  },
  
  // Voice management - check if we can play a new voice
  canPlayVoice: function(priority = 0) {
    if (this.activeVoices.length < this.config.maxPolyphony) {
      return true;
    }
    
    if (!this.config.voiceStealingEnabled) {
      return false;
    }
    
    // Find lowest priority voice to steal
    const lowestPriority = Math.min(...this.activeVoices.map(v => v.priority || 0));
    return priority > lowestPriority;
  },
  
  // Register active voice
  registerVoice: function(id, priority = 0) {
    this.activeVoices.push({ id, priority, timestamp: Date.now() });
    this.voiceTimestamps.set(id, Date.now());
    
    // Clean up old voices
    if (this.activeVoices.length > this.config.maxPolyphony) {
      this.stealOldestVoice();
    }
  },
  
  // Remove voice
  unregisterVoice: function(id) {
    this.activeVoices = this.activeVoices.filter(v => v.id !== id);
    this.voiceTimestamps.delete(id);
  },
  
  // Steal oldest voice
  stealOldestVoice: function() {
    if (this.activeVoices.length === 0) return;
    
    // Sort by priority then timestamp
    this.activeVoices.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority; // Lower priority first
      }
      return a.timestamp - b.timestamp; // Older first
    });
    
    const victim = this.activeVoices.shift();
    this.metrics.droppedVoices++;
    
    // Notify product manager to stop this voice
    if (window.productManager && victim) {
      const product = Object.values(window.state.products || {}).find(p => p.id === victim.id);
      if (product && product.synth) {
        product.synth.triggerRelease();
      }
    }
  },
  
  // Optimize Tone.js settings
  optimizeToneSettings: function() {
    // Set lookahead time based on performance mode
    switch (this.config.performanceMode) {
      case 'performance':
        Tone.context.lookAhead = 0.01; // 10ms - lower latency, may cause glitches
        Tone.context.updateInterval = 0.02; // 20ms
        break;
      case 'balanced':
        Tone.context.lookAhead = 0.03; // 30ms - good balance
        Tone.context.updateInterval = 0.03; // 30ms
        break;
      case 'quality':
        Tone.context.lookAhead = 0.1; // 100ms - higher latency, smoother
        Tone.context.updateInterval = 0.05; // 50ms
        break;
    }
    
    // Set latency hint if available
    if (Tone.context.rawContext && Tone.context.rawContext.baseLatency) {
      console.log("Audio context latency:", Tone.context.rawContext.baseLatency);
    }
  },
  
  // Performance monitoring
  startPerformanceMonitoring: function() {
    // Clear any existing monitor
    if (this.performanceMonitor) {
      clearInterval(this.performanceMonitor);
    }
    
    // Monitor every 5 seconds
    this.performanceMonitor = setInterval(() => {
      this.checkPerformance();
    }, 5000);
  },
  
  // Check performance and adjust if needed
  checkPerformance: function() {
    const now = Date.now();
    
    // Check if we're dropping too many voices
    if (this.metrics.droppedVoices > 10) {
      console.warn("High voice stealing detected, consider reducing polyphony");
      // Could automatically adjust polyphony here
    }
    
    // Clean up unused effects periodically
    if (now - this.metrics.lastCleanup > 30000) { // Every 30 seconds
      this.cleanupEffectPool();
      this.metrics.lastCleanup = now;
    }
    
    // Log metrics if in debug mode
    if (window.enableAudioDebug) {
      console.log("Performance metrics:", {
        activeVoices: this.activeVoices.length,
        droppedVoices: this.metrics.droppedVoices,
        effectReuses: this.metrics.effectReuses,
        synthReuses: this.metrics.synthReuses,
        synthsInUse: this.synthPool.inUse.size,
        synthsAvailable: this.synthPool.available.length
      });
    }
  },
  
  // Clean up effect pool
  cleanupEffectPool: function() {
    Object.keys(this.effectPool).forEach(type => {
      const pool = this.effectPool[type];
      // Remove unused effects beyond minimum
      while (pool.length > 2) {
        const unusedIndex = pool.findIndex(e => !e.inUse);
        if (unusedIndex !== -1) {
          const effect = pool.splice(unusedIndex, 1)[0];
          effect.dispose();
        } else {
          break;
        }
      }
    });
  },
  
  // Get performance stats
  getStats: function() {
    return {
      activeVoices: this.activeVoices.length,
      maxPolyphony: this.config.maxPolyphony,
      droppedVoices: this.metrics.droppedVoices,
      effectReuses: this.metrics.effectReuses,
      synthReuses: this.metrics.synthReuses,
      performanceMode: this.config.performanceMode,
      synthPoolUsage: {
        inUse: this.synthPool.inUse.size,
        available: this.synthPool.available.length
      }
    };
  },
  
  // Set performance mode
  setPerformanceMode: function(mode) {
    if (['performance', 'balanced', 'quality'].includes(mode)) {
      const previousMode = this.config.performanceMode;
      this.config.performanceMode = mode;
      
      // Apply mode-specific settings
      const modeSettings = this.config.performanceModes[mode];
      if (modeSettings) {
        // Apply polyphony limit
        this.config.maxPolyphony = modeSettings.maxPolyphony;
        
        // Update Tone.js settings if available
        if (Tone && Tone.context) {
          Tone.context.lookAhead = modeSettings.lookAhead;
          Tone.context.updateInterval = modeSettings.updateInterval;
        }
        
        // Apply effect simplification if needed
        if (modeSettings.simplifyEffects && !this.config.performanceModes[previousMode].simplifyEffects) {
          this.simplifyAllEffects();
        }
        
        // Apply reverb limiting
        if (modeSettings.limitReverb) {
          this.limitReverbEffects();
        }
      }
      
      this.optimizeToneSettings();
      console.log(`Performance mode changed from ${previousMode} to ${mode}`);
      console.log(`Max polyphony: ${this.config.maxPolyphony}`);
      
      // Trim voices if needed
      if (this.activeVoices.length > this.config.maxPolyphony) {
        this.trimActiveVoices();
      }
    }
  },
  
  // Simplify all active effects
  simplifyAllEffects: function() {
    console.log("Simplifying all effects for performance mode");
    
    // Simplify effects in the pool
    Object.keys(this.effectPool).forEach(effectType => {
      this.effectPool[effectType].forEach(effect => {
        if (effect && !effect.disposed) {
          // Reduce quality settings
          if (effect.wet) effect.wet.value = Math.min(effect.wet.value, 0.5);
          if (effect.decay) effect.decay = Math.min(effect.decay, 2);
          if (effect.delayTime && effect.delayTime.value) {
            effect.delayTime.value = Math.min(effect.delayTime.value, 0.1);
          }
        }
      });
    });
    
    // Call audio engine's simplify function too
    if (window.audioEngine && window.audioEngine.simplifyGlobalEffects) {
      window.audioEngine.simplifyGlobalEffects();
    }
  },
  
  // Limit reverb effects to improve performance
  limitReverbEffects: function() {
    console.log("Limiting reverb effects");
    
    // Check reverb pool
    if (this.effectPool.reverb) {
      this.effectPool.reverb.forEach(reverb => {
        if (reverb && !reverb.disposed) {
          reverb.decay = Math.min(reverb.decay, 1.5);
          if (reverb.wet) reverb.wet.value = Math.min(reverb.wet.value, 0.3);
        }
      });
    }
  },
  
  // Trim active voices to match polyphony limit
  trimActiveVoices: function() {
    const toRemove = this.activeVoices.length - this.config.maxPolyphony;
    if (toRemove > 0) {
      console.log(`Trimming ${toRemove} voices to match polyphony limit`);
      
      // Remove oldest voices
      const removed = this.activeVoices.splice(0, toRemove);
      removed.forEach(voice => {
        if (voice.synth && voice.synth.dispose) {
          voice.synth.triggerRelease();
          setTimeout(() => voice.synth.dispose(), 100);
        }
      });
    }
  },
  
  // Adjust max polyphony
  setMaxPolyphony: function(max) {
    this.config.maxPolyphony = Math.max(4, Math.min(24, max));
    console.log(`Max polyphony set to: ${this.config.maxPolyphony}`);
  },
  
  // Start periodic cleanup
  startPeriodicCleanup: function() {
    // Clear any existing cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Run cleanup every 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanupOrphaned();
    }, 30000);
  },
  
  // Clean up orphaned resources
  cleanupOrphaned: function() {
    const now = Date.now();
    let cleaned = 0;
    
    // Clean up old voice timestamps
    for (const [id, timestamp] of this.voiceTimestamps.entries()) {
      if (now - timestamp > 10000 && !window.state.products[id]) {
        this.voiceTimestamps.delete(id);
        cleaned++;
      }
    }
    
    // Clean up disposed synths from pool
    if (this.synthPool.available && Array.isArray(this.synthPool.available)) {
      this.synthPool.available = this.synthPool.available.filter(synth => {
        if (synth && synth.disposed) {
          cleaned++;
          return false;
        }
        return true;
      });
    }
    
    // Clean up inUse synths
    if (this.synthPool.inUse && this.synthPool.inUse instanceof Map) {
      for (const [id, synth] of this.synthPool.inUse.entries()) {
        if (synth && synth.disposed) {
          this.synthPool.inUse.delete(id);
          cleaned++;
        }
      }
    }
    
    // Clean up disposed effects from pool
    Object.keys(this.effectPool).forEach(type => {
      if (Array.isArray(this.effectPool[type])) {
        this.effectPool[type] = this.effectPool[type].filter(effect => {
          if (effect && effect.disposed) {
            cleaned++;
            return false;
          }
          return true;
        });
      }
    });
    
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} orphaned resources`);
    }
  },
  
  // Clean up all resources
  cleanup: function() {
    console.log("Cleaning up performance manager resources...");
    
    // Clear monitoring interval
    if (this.performanceMonitor) {
      clearInterval(this.performanceMonitor);
      this.performanceMonitor = null;
    }
    
    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    // Dispose all pooled synths
    if (this.synthPool.available && Array.isArray(this.synthPool.available)) {
      this.synthPool.available.forEach(synth => {
        if (synth && !synth.disposed && synth.dispose) {
          synth.disconnect();
          synth.dispose();
        }
      });
    }
    
    if (this.synthPool.inUse && this.synthPool.inUse instanceof Map) {
      for (const [id, synth] of this.synthPool.inUse.entries()) {
        if (synth && !synth.disposed && synth.dispose) {
          synth.disconnect();
          synth.dispose();
        }
      }
    }
    
    this.synthPool = {
      available: [],
      inUse: new Map()
    };
    
    // Dispose all pooled effects
    Object.values(this.effectPool).forEach(pool => {
      if (Array.isArray(pool)) {
        pool.forEach(effect => {
          if (effect && !effect.disposed && effect.dispose) {
            effect.disconnect();
            effect.dispose();
          }
        });
      }
    });
    this.effectPool = {};
    
    // Clear active voices
    this.activeVoices = [];
    this.voiceTimestamps.clear();
  }
};