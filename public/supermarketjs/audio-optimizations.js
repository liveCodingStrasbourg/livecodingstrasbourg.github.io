// audio-optimizations.js - Additional audio performance optimizations

window.audioOptimizations = {
  // Throttle function to limit update frequency
  throttle: function(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  },
  
  // Debounce function to delay execution
  debounce: function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Optimize loop pattern to use Transport subdivision
  createOptimizedLoop: function(callback, subdivision = "8n") {
    // Instead of using Tone.Loop, use Transport.scheduleRepeat
    // This is more efficient for many simultaneous loops
    const eventId = Tone.Transport.scheduleRepeat((time) => {
      // Execute callback with precise timing
      callback(time);
    }, subdivision);
    
    // Return an object that mimics Tone.Loop interface
    return {
      start: function(time) {
        // Already scheduled, just ensure Transport is running
        if (Tone.Transport.state !== "started") {
          Tone.Transport.start(time);
        }
      },
      stop: function(time) {
        Tone.Transport.clear(eventId);
      },
      dispose: function() {
        Tone.Transport.clear(eventId);
      },
      _eventId: eventId
    };
  },
  
  // Batch audio parameter updates
  batchParameterUpdates: function(updates) {
    // Use requestAnimationFrame to batch updates
    requestAnimationFrame(() => {
      updates.forEach(update => {
        if (update.param && update.value !== undefined) {
          if (update.ramp) {
            update.param.rampTo(update.value, update.ramp);
          } else {
            update.param.value = update.value;
          }
        }
      });
    });
  },
  
  // Create lightweight synth wrapper
  createLightweightSynth: function(type, options) {
    const synth = new Tone[type](options);
    
    // Add a simple envelope gate to reduce CPU when not playing
    let isPlaying = false;
    const originalTriggerAttack = synth.triggerAttack.bind(synth);
    const originalTriggerRelease = synth.triggerRelease.bind(synth);
    
    synth.triggerAttack = function(note, time, velocity) {
      isPlaying = true;
      return originalTriggerAttack(note, time, velocity);
    };
    
    synth.triggerRelease = function(time) {
      isPlaying = false;
      return originalTriggerRelease(time);
    };
    
    synth.isPlaying = () => isPlaying;
    
    return synth;
  },
  
  // Optimize effect chain
  createOptimizedEffectChain: function(effects) {
    // Connect effects in series with minimal nodes
    let previousNode = null;
    
    effects.forEach((effect, index) => {
      if (previousNode) {
        previousNode.connect(effect);
      }
      previousNode = effect;
    });
    
    // Return first and last nodes for easy connection
    return {
      input: effects[0],
      output: effects[effects.length - 1],
      effects: effects
    };
  },
  
  // Simple voice allocator
  voiceAllocator: {
    maxVoices: 12,
    voices: [],
    
    allocate: function(id, priority = 0) {
      if (this.voices.length < this.maxVoices) {
        this.voices.push({ id, priority, timestamp: Date.now() });
        return true;
      }
      
      // Find lowest priority voice
      const lowestPriority = this.voices.reduce((min, v) => 
        v.priority < min.priority ? v : min, this.voices[0]);
      
      if (priority > lowestPriority.priority) {
        // Replace lowest priority
        const index = this.voices.indexOf(lowestPriority);
        this.voices[index] = { id, priority, timestamp: Date.now() };
        return lowestPriority.id; // Return ID to stop
      }
      
      return false;
    },
    
    deallocate: function(id) {
      this.voices = this.voices.filter(v => v.id !== id);
    }
  },
  
  // Simplified pattern generator
  generateEfficientPattern: function(basePattern, escalator) {
    if (!escalator) return basePattern;
    
    // Pre-calculate pattern instead of generating on each trigger
    const patterns = {
      up: ["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4"],
      down: ["C4", "B3", "A3", "G3", "F3", "E3", "D3", "C3"],
      bounce: ["C3", "E3", "G3", "C4", "G3", "E3"],
      zigzag: ["C3", "G3", "E3", "A3", "F3", "B3"],
      express: ["C3", "E3", "G3", "C4"].sort(() => Math.random() - 0.5),
      checkout: ["C4", "C4", "G3", "C4", null, "G3", null, "C3"]
    };
    
    return patterns[escalator] || basePattern;
  },
  
  // Optimized BPM change
  changeBPMSmooth: function(delta) {
    const currentBPM = Tone.Transport.bpm.value;
    const newBPM = Math.max(60, Math.min(200, currentBPM + delta));
    
    // Use ramp for smooth transition
    Tone.Transport.bpm.rampTo(newBPM, 2);
  },
  
  // Cleanup helper
  cleanupAudioNode: function(node) {
    if (!node) return;
    
    try {
      // Disconnect all connections
      node.disconnect();
      
      // Dispose if available
      if (typeof node.dispose === 'function') {
        node.dispose();
      }
    } catch (e) {
      // Silent fail - node might already be disposed
    }
  }
};