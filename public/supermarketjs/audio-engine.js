// audio-engine.js - Core audio functionality - Modified with new effects

// Define the shelf life mappings for product repetition rate
window.shelfLifeDurations = {
  'today': '32n',     // Very fast repetition - expires today
  'week': '16n',      // Fast repetition - expires this week
  'month': '8n',      // Medium repetition - expires this month  
  'year': '4n',       // Slow repetition - expires this year
  'decade': '2n',     // Very slow repetition - expires in a decade
  'forever': '1n'     // Extremely slow - never expires
};

// Create effect processors based on effect type and configuration
function createEffect(effectType, settings = {}) {
  console.log("Creating effect:", effectType, settings);
  
  let effect;
  
  try {
    switch (effectType) {
      case "bitcrusher":
        effect = new Tone.BitCrusher(settings.bits || 4);
        if (settings.wet !== undefined) effect.wet.value = settings.wet;
        break;
        
      case "reverb":
        effect = new Tone.Reverb({
          decay: settings.decay || 3,
          wet: settings.wet || 0.5
        });
        break;
        
      case "chorus":
        effect = new Tone.Chorus({
          frequency: settings.frequency || 2,
          delayTime: settings.delayTime || 3,
          depth: settings.depth || 0.7,
          wet: settings.wet || 0.5
        });
        break;
        
      case "distortion":
        effect = new Tone.Distortion({
          distortion: settings.distortion || 0.5,
          wet: settings.wet || 0.5
        });
        break;
        
      case "phaser":
        effect = new Tone.Phaser({
          frequency: settings.frequency || 0.5,
          octaves: settings.octaves || 3,
          wet: settings.wet || 0.5
        });
        break;
        
      case "chebyshev":
        effect = new Tone.Chebyshev(settings.order || 30);
        if (settings.wet !== undefined) effect.wet.value = settings.wet;
        break;
        
      case "tremolo":
        effect = new Tone.Tremolo({
          frequency: settings.frequency || 5,
          depth: settings.depth || 0.5,
          wet: settings.wet || 0.5
        }).start();
        break;
        
      case "feedback-delay":
        effect = new Tone.FeedbackDelay({
          delayTime: settings.delayTime || 0.25,
          feedback: settings.feedback || 0.5,
          wet: settings.wet || 0.5
        });
        break;
        
      case "ping-pong-delay":
        effect = new Tone.PingPongDelay({
          delayTime: settings.delayTime || 0.25,
          feedback: settings.feedback || 0.5,
          wet: settings.wet || 0.5
        });
        break;
        
      case "vibrato":
        effect = new Tone.Vibrato({
          frequency: settings.frequency || 5,
          depth: settings.depth || 0.5,
          wet: settings.wet || 0.5
        });
        break;
        
      // New "glass" effect - a specialized echo effect
      case "glass":
        // Create a custom echo effect using multiple delays for a shimmering glass sound
        const delay1 = new Tone.FeedbackDelay({
          delayTime: settings.delayTime || 0.2,
          feedback: settings.feedback || 0.3,
          wet: 0.7
        });
        
        const filter = new Tone.Filter({
          frequency: settings.filterFreq || 3000,
          type: "highpass",
          Q: 1
        });
        
        const delay2 = new Tone.FeedbackDelay({
          delayTime: (settings.delayTime || 0.2) * 1.5, // Slightly offset
          feedback: (settings.feedback || 0.3) * 0.7,
          wet: 0.5
        });
        
        // Connect the effects in series
        delay1.connect(filter);
        filter.connect(delay2);
        
        // Return the first element in the chain
        effect = delay1;
        
        // Store the chain so we don't lose references (prevents garbage collection)
        effect._chain = {filter, delay2};
        
        if (settings.wet !== undefined) effect.wet.value = settings.wet;
        break;
        
      // New "packaged" effect - an arpeggiator-like effect
      case "packaged":
        // For the packaged effect, we'll create a tremolo with a filter
        // that simulates the rhythmic pattern of an arpeggiator
        const tremolo = new Tone.Tremolo({
          frequency: settings.frequency || 8, // Fast rhythmic pattern
          depth: settings.depth || 0.9,      // Deep modulation
          wet: 0.8
        }).start();
        
        const filterMod = new Tone.Filter({
          frequency: settings.filterFreq || 1000,
          type: "bandpass",
          Q: 2
        });
        
        // Connect tremolo to filter
        tremolo.connect(filterMod);
        
        // Create an automation for the filter frequency
        if (Tone.Transport.state === "started") {
          const autoFilter = new Tone.AutoFilter({
            frequency: settings.modFrequency || 0.5,
            depth: 0.6,
            baseFrequency: 400,
            octaves: 3,
            wet: 0.5
          }).start();
          
          filterMod.connect(autoFilter);
          effect = tremolo;
          effect._chain = {filterMod, autoFilter};
        } else {
          effect = tremolo;
          effect._chain = {filterMod};
        }
        
        if (settings.wet !== undefined) effect.wet.value = settings.wet;
        break;
        
      default:
        console.warn("Unknown effect type:", effectType);
        return null;
    }
    
    console.log("Effect created successfully:", effectType);
    return effect;
  } catch (error) {
    console.error("Error creating effect:", error);
    return null;
  }
}

// Main audio engine module functionality
window.audioEngine = {
  // Performance monitoring
  performanceMonitor: null,
  performanceMetrics: {
    dropouts: 0,
    highLoadEvents: 0,
    lastCheck: Date.now()
  },
  
  // Initialize audio context and start transports
  startAudio: async function() {
    console.log("Starting audio engine...");
    
    try {
      // Check if Tone.js is available
      if (!Tone) {
        console.error("Tone.js not available!");
        return false;
      }
      
      // Configure audio context for better performance
      this.configureAudioContext();
      
      // Set master volume even if context isn't running yet
      Tone.Destination.volume.value = CONFIG.audio.masterVolume;
      
      // Set default BPM
      Tone.Transport.bpm.value = CONFIG.audio.defaultBPM;
      
      // Configure transport for better performance
      Tone.Transport.PPQ = 48; // Lower PPQ for less CPU usage
      Tone.Transport.latencyHint = "playback";
      
      console.log("Audio parameters set. Audio context state:", Tone.context.state);
      
      // Start performance monitoring
      this.startPerformanceMonitoring();
      
      // Log initialization
      window.log("🔊 Audio engine initialized... the supermarket comes to life.");
      return true;
    } catch (error) {
      console.error("Error starting audio:", error);
      window.log("❌ Failed to start audio. Please try refreshing the page.");
      return false;
    }
  },
  
  // Configure audio context for optimal performance
  configureAudioContext: function() {
    try {
      // Balance between stability and responsiveness
      const context = new Tone.Context({
        latencyHint: "balanced", // Good balance of latency and stability
        lookAhead: 0.1, // 100ms lookahead - responsive but stable
        updateInterval: 0.05, // 50ms updates
        clockSource: "worker" // Use worker for timing
      });

      // Set the context
      Tone.setContext(context);

      // Log the configuration
      console.log("Audio Context configured for balanced performance:");
      console.log("- Latency hint: balanced");
      console.log("- Look ahead: 0.1s");
      console.log("- Update interval: 0.05s");
      
      // Additional context optimizations
      if (context.rawContext) {
        const ctx = context.rawContext;
        console.log("- Sample rate:", ctx.sampleRate);
        console.log("- Base latency:", ctx.baseLatency);
      }
    } catch (error) {
      console.warn("Could not configure custom audio context:", error);
    }
  },
  
  // Monitor audio performance
  startPerformanceMonitoring: function() {
    if (this.performanceMonitor) return;
    
    this.performanceMonitor = setInterval(() => {
      if (Tone.context && Tone.context.rawContext) {
        const ctx = Tone.context.rawContext;
        const now = Date.now();
        
        // Check for audio dropouts
        if (ctx.currentTime > 0) {
          const expectedTime = (now - this.performanceMetrics.lastCheck) / 1000;
          const actualTime = ctx.currentTime;
          
          // If actual time is significantly less than expected, we had dropouts
          if (actualTime < expectedTime * 0.9) {
            this.performanceMetrics.dropouts++;
            console.warn("Audio dropout detected");
            
            // Automatically reduce quality if too many dropouts
            if (this.performanceMetrics.dropouts > 3) {
              this.reduceAudioQuality();
            }
          }
        }
        
        this.performanceMetrics.lastCheck = now;
      }
    }, 2000); // Check every 2 seconds
  },
  
  // Reduce audio quality to improve performance
  reduceAudioQuality: function() {
    console.log("Reducing audio quality to improve performance");
    
    // Use performance manager if available
    if (window.performanceManager) {
      window.performanceManager.setPerformanceMode('performance');
    }
    
    // Reduce polyphony
    if (window.performanceManager && window.performanceManager.config) {
      window.performanceManager.config.maxPolyphony = 8; // Reduce from 12
    }
    
    // Simplify effects
    this.simplifyGlobalEffects();
    
    // Log the change
    window.log("⚡ Audio quality reduced for better performance");
    
    // Reset dropout counter
    this.performanceMetrics.dropouts = 0;
  },
  
  // Simplify global effects for better performance
  simplifyGlobalEffects: function() {
    console.log("Simplifying global effects...");
    
    // Disconnect complex master effects if any
    if (window.state && window.state.masterEffects) {
      Object.keys(window.state.masterEffects).forEach(key => {
        const effect = window.state.masterEffects[key];
        if (effect && effect.dispose) {
          effect.dispose();
        }
      });
      window.state.masterEffects = {};
    }
    
    // Reduce reverb quality on all products
    if (window.state && window.state.products) {
      Object.keys(window.state.products).forEach(id => {
        const product = window.state.products[id];
        if (product && product.effects) {
          // Find and simplify reverb effects
          Object.keys(product.effects).forEach(effectKey => {
            const effect = product.effects[effectKey];
            if (effect && effect.name === "Reverb") {
              effect.decay = Math.min(effect.decay, 1); // Limit reverb decay
              effect.wet.value = Math.min(effect.wet.value, 0.3); // Reduce wet signal
            }
          });
        }
      });
    }
  },
  
  // Apply a filter modification to a synth
  applyFilter: function(synth, filterType, frequency) {
    console.log("Applying filter:", filterType, "to synth");
    
    try {
      // Create filter with specified type and frequency
      const filter = new Tone.Filter({
        type: filterType,
        frequency: frequency || (filterType === "lowpass" ? 500 : 1500),
        Q: 1
      }).toDestination();
      
      // Connect synth to filter
      synth.disconnect();
      synth.connect(filter);
      
      console.log("Filter applied successfully");
      return filter;
    } catch (error) {
      console.error("Error applying filter:", error);
      
      // Ensure synth is connected to destination even if filter fails
      synth.toDestination();
      return null;
    }
  },
  
  // Apply an effect modifier to a synth or filter
  applyEffectModifier: function(source, productName, modifierName, existingEffect) {
    console.log("Applying effect modifier:", modifierName, "to", productName);
    
    // Skip if there's no modifier or it doesn't exist in the product config
    if (!modifierName || !window.productTypes[productName] || !window.productTypes[productName][modifierName]) {
      console.warn("Invalid modifier or product config:", modifierName, productName);
      return existingEffect;
    }

    // Get effect configuration from product type
    const effectConfig = window.productTypes[productName][modifierName];
    
    // Skip if no effect is defined for this modifier
    if (!effectConfig || !effectConfig.effect) {
      console.warn("No effect defined for modifier:", modifierName);
      return existingEffect;
    }
    
    // Create new effect
    const newEffect = createEffect(effectConfig.effect, effectConfig.settings);
    
    // Skip if effect creation failed
    if (!newEffect) {
      console.warn("Effect creation failed for:", effectConfig.effect);
      return existingEffect;
    }
    
    try {
      // Connect source to new effect
      source.disconnect();
      source.connect(newEffect);
      
      // Connect effect to destination
      newEffect.toDestination();
      
      // Log the effect application
      window.log(`Made it ${modifierName} (${this.getEffectDescription(modifierName)})`);
      console.log("Effect modifier applied successfully:", modifierName);
      
      return newEffect;
    } catch (error) {
      console.error("Error connecting effect:", error);
      
      // Clean up and ensure source is connected to destination
      try {
        source.disconnect();
        source.toDestination();
      } catch(e) {
        console.error("Error in cleanup:", e);
      }
      
      return existingEffect;
    }
  },
  
  // Get a descriptive message for each effect type
  getEffectDescription: function(effectName) {
    const descriptions = {
      cheap: "suspiciously so...",
      expensive: "not worth the price of your soul...",
      processed: "full of chemicals and additives...",
      industrial: "mass-produced in forgotten factories...",
      overpriced: "costs more than your sanity...",
      vomit: "something moves inside the package...",
      artisanal: "handcrafted by something not quite human...",
      bargain: "discounted for a reason...",
      luxury: "unnecessarily extravagant...",
      artificial: "synthesized in a lab...",
      "mass-produced": "identical to millions of others...",
      addictive: "you'll keep coming back for more...",
      // New effect descriptions
      "packaged": "wrapped in layer upon layer of plastic...",
      "glass": "fragile and transparent, the contents shimmer..."
    };
    
    return descriptions[effectName] || "altered in some way...";
  },
  
  // Create visual feedback for shelf life (emoji and color)
  getShelfLifeVisual: function(shelfLifeDuration) {
    if (!shelfLifeDuration) return { emoji: '', color: '' };
    
    // Default values
    let emoji = '';
    let color = '';
    
    // Determine emoji and color based on shelf life
    switch(shelfLifeDuration) {
      case '32n':
        emoji = '⚡';
        color = '#ff0000'; // Red for very fast/expires today
        break;
      case '16n':
        emoji = '🔥';
        color = '#ff6600'; // Orange for fast/expires this week
        break;
      case '8n':
        emoji = '⏱️';
        color = '#ffcc00'; // Yellow for medium/expires this month
        break;
      case '4n':
        emoji = '📅';
        color = '#66cc00'; // Light green for slow/expires this year
        break;
      case '2n':
        emoji = '🧊';
        color = '#0099cc'; // Blue for very slow/expires in a decade
        break;
      case '1n':
        emoji = '⌛';
        color = '#9900cc'; // Purple for extremely slow/never expires
        break;
    }
    
    return { emoji, color };
  },
  
  // Create a synth loop for a product
  createProductLoop: function(synth, note, pattern, productId, options = {}) {
    console.log("Creating product loop:", productId, "with pattern:", pattern);
    console.log("Note:", note, "Options:", options);
    
    try {
      // Initialize escalator/arpeggiator state
      let arpIndex = 0;
      let arpDirection = 1; // 1 for up, -1 for down
      let arpNotes = [];
      
      // If escalator is active, prepare arpeggiator notes
      if (options.escalatorPattern) {
        // Convert single note to array if needed
        const baseNotes = Array.isArray(note) ? note : [note];
        
        // Create arpeggio notes based on pattern
        switch (options.escalatorPattern) {
          case 'up':
          case 'down':
          case 'bounce':
          case 'zigzag':
            // Create a 2-octave arpeggio
            arpNotes = [];
            baseNotes.forEach(n => {
              const freq = Tone.Frequency(n);
              arpNotes.push(n); // Root
              arpNotes.push(freq.transpose(3).toNote()); // Minor third
              arpNotes.push(freq.transpose(7).toNote()); // Fifth
              arpNotes.push(freq.transpose(12).toNote()); // Octave
              arpNotes.push(freq.transpose(15).toNote()); // Octave + minor third
              arpNotes.push(freq.transpose(19).toNote()); // Octave + fifth
            });
            if (options.escalatorPattern === 'down') {
              arpNotes.reverse();
            }
            break;
            
          case 'express':
            // Random fast pattern
            arpNotes = [];
            baseNotes.forEach(n => {
              const freq = Tone.Frequency(n);
              for (let i = 0; i < 8; i++) {
                const semitones = Math.floor(Math.random() * 24) - 12;
                arpNotes.push(freq.transpose(semitones).toNote());
              }
            });
            break;
            
          case 'checkout':
            // Repeating pattern like a barcode scanner
            arpNotes = [];
            baseNotes.forEach(n => {
              const freq = Tone.Frequency(n);
              arpNotes.push(n);
              arpNotes.push(freq.transpose(12).toNote());
              arpNotes.push(n);
              arpNotes.push(freq.transpose(7).toNote());
            });
            break;
        }
        
        // Adjust pattern timing based on escalator speed
        const speedMultipliers = {
          slow: 2,
          normal: 1,
          fast: 0.5,
          rush: 0.25,
          broken: 1 // Will be handled differently
        };
        
        const speedMult = speedMultipliers[options.escalatorSpeed] || 1;
        if (options.escalatorSpeed !== 'broken') {
          // Parse pattern and adjust for speed
          const patternMatch = pattern.match(/(\d+)([ntr])/);
          if (patternMatch) {
            const [_, value, unit] = patternMatch;
            const newValue = Math.max(1, Math.round(parseFloat(value) * speedMult));
            pattern = newValue + unit;
          }
        }
      }
      
      // Create loop that triggers the synth with a specific pattern
      const loop = new Tone.Loop(time => {
        // Skip trigger randomly if product is marked as "open"
        if (options.isOpenProduct && Math.random() > 0.6) {
          return; // Skip this trigger (60% chance)
        }
        
        // Add broken escalator random timing
        if (options.escalatorSpeed === 'broken' && Math.random() > 0.7) {
          return; // Skip some notes randomly
        }
        
        // Determine note to play
        let playNote = note;
        
        // Handle escalator/arpeggiator pattern
        if (options.escalatorPattern && arpNotes.length > 0) {
          // Update arp index based on pattern
          switch (options.escalatorPattern) {
            case 'up':
            case 'checkout':
              playNote = arpNotes[arpIndex];
              arpIndex = (arpIndex + 1) % arpNotes.length;
              break;
              
            case 'down':
              playNote = arpNotes[arpIndex];
              arpIndex = (arpIndex + 1) % arpNotes.length;
              break;
              
            case 'bounce':
              playNote = arpNotes[arpIndex];
              arpIndex += arpDirection;
              if (arpIndex >= arpNotes.length - 1) {
                arpIndex = arpNotes.length - 1;
                arpDirection = -1;
              } else if (arpIndex <= 0) {
                arpIndex = 0;
                arpDirection = 1;
              }
              break;
              
            case 'zigzag':
              // Alternating pattern - jump between low and high notes
              if (arpIndex % 2 === 0) {
                playNote = arpNotes[Math.floor(arpIndex / 2)];
              } else {
                playNote = arpNotes[arpNotes.length - 1 - Math.floor(arpIndex / 2)];
              }
              arpIndex = (arpIndex + 1) % (arpNotes.length * 2);
              break;
              
            case 'express':
              // Random
              arpIndex = Math.floor(Math.random() * arpNotes.length);
              playNote = arpNotes[arpIndex];
              break;
          }
        }
        
        // Apply random variations if discount mode is on
        if (window.state.modes.discount) {
          if (Array.isArray(playNote)) {
            // For chord-based products like wine
            playNote = playNote.map(n => {
              const cents = (Math.random() * 100) - 50; // Random detune +/- 50 cents
              return Tone.Frequency(n).transpose(cents/100).toNote();
            });
          } else {
            const cents = (Math.random() * 100) - 50; // Random detune +/- 50 cents
            playNote = Tone.Frequency(playNote).transpose(cents/100).toNote();
          }
        }
        
        try {
          // Helper to detect synth type (constructor.name may be mangled in bundles)
          const isNoiseSynth = synth.noise !== undefined && synth.envelope !== undefined && !synth.oscillator;
          const isPluckSynth = synth.attackNoise !== undefined && synth.resonance !== undefined;

          // Cut off any lingering previous note to prevent overlap accumulation
          // This is critical for preventing CPU buildup over time
          if (synth.triggerRelease && !isPluckSynth) {
            try {
              synth.triggerRelease(time);
            } catch (e) {
              // Ignore release errors - synth might not have active note
            }
          }

          // Special handling for NoiseSynth which doesn't use notes
          if (isNoiseSynth || playNote === null) {
            synth.triggerAttackRelease(pattern, time);
          }
          // Special handling for PluckSynth which only has triggerAttack (no release)
          else if (isPluckSynth) {
            synth.triggerAttack(playNote, time);
          } else if (Array.isArray(playNote)) {
            synth.triggerAttackRelease(playNote, pattern, time);
          } else {
            synth.triggerAttackRelease(playNote, pattern, time);
          }
        } catch (error) {
          console.error("Error triggering synth:", error);
        }
      }, pattern);
      
      // Start the loop
      loop.start(0);
      console.log("Loop created and started successfully");
      
      return loop;
    } catch (error) {
      console.error("Error creating product loop:", error);
      return null;
    }
  },
  
  // Apply global effects and prepare audio environment
  setupGlobalEffects: function() {
    console.log("Setting up global audio effects...");
    
    try {
      // Set master volume directly
      Tone.Destination.volume.value = CONFIG.audio.masterVolume;
      console.log("Master volume set to:", Tone.Destination.volume.value, "dB");
      
      // We're not using complex effects to avoid the connection error
      console.log("Global effects set up successfully");
      return {};
    } catch (error) {
      console.error("Error setting up global effects:", error);
      return {};
    }
  },
  
  // Stop all audio and reset
  stopAllAudio: function() {
    console.log("Stopping all audio...");
    
    // Clear performance monitor interval
    if (this.performanceMonitor) {
      clearInterval(this.performanceMonitor);
      this.performanceMonitor = null;
    }
    
    try {
      // Stop transport
      Tone.Transport.stop();
      console.log("Transport stopped");
      
      // Dispose all cart wheel sequences
      if (window.cartWheels) {
        if (window.cartWheels.cleanup) {
          window.cartWheels.cleanup();
        }
        console.log("Cart wheels cleaned up");
      }
      
      // Hide the pattern display
      const patternDiv = document.getElementById('wheel-pattern');
      if (patternDiv) {
        patternDiv.style.display = 'none';
      }
      
      // Reset state
      if (window.state) {
        window.state.cart.wheels = "none";
        console.log("State reset");
      }
      
      // Clean up performance manager resources
      if (window.performanceManager && window.performanceManager.cleanup) {
        window.performanceManager.cleanup();
      }
      
      // Reset BPM
      Tone.Transport.bpm.value = CONFIG.audio.defaultBPM;
      console.log("BPM reset to:", CONFIG.audio.defaultBPM);
      
      window.log("Everything stopped. The supermarket is silent again... for now.");
    } catch (error) {
      console.error("Error stopping audio:", error);
    }
  },
  
  // Change BPM by a specified amount
  changeBPM: function(amount) {
    try {
      const currentBPM = Tone.Transport.bpm.value;
      const newBPM = Math.max(20, Math.min(500, currentBPM + amount)); // Limit between 20-500 BPM
      
      // Apply the change
      Tone.Transport.bpm.rampTo(newBPM, 2); // Gradually change over 2 seconds
      
      // Log the change
      window.log(`BPM changing from ${currentBPM} to ${newBPM}...`);
      console.log(`BPM changed: ${currentBPM} -> ${newBPM}`);
      
      return newBPM;
    } catch (error) {
      console.error("Error changing BPM:", error);
      return null;
    }
  }
};

// Expose createEffect globally for reference by other modules
window.createEffect = createEffect;

console.log("Audio engine module loaded");