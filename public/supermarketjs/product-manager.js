// product-manager.js - Manages the addition, modification, and removal of products

// Main product manager module functionality
window.productManager = {

  // ============================================
  // SLOT-BASED API (Primary interface)
  // ============================================

  // Add or update a product in a specific slot
  addProductToSlot: function(slot, name, modifier = "") {
    // Validate slot
    if (!window.state.VALID_SLOTS.includes(slot)) {
      window.log(`❌ Invalid slot [${slot}]! Use [0] through [9]`);
      return null;
    }

    // Check if slot already has a product - if so, schedule update on next beat
    if (window.state.slots[slot]) {
      return this.updateSlot(slot, name, modifier);
    }

    // Empty slot - create product immediately
    return this.createProductInSlot(slot, name, modifier);
  },

  // Update an existing slot (replaces immediately or beat-synced if Transport running)
  updateSlot: function(slot, name, modifier = "") {
    const existingProduct = window.state.slots[slot];

    if (!existingProduct) {
      // No existing product, just create
      return this.createProductInSlot(slot, name, modifier);
    }

    const self = this;
    const oldName = existingProduct.name;

    // If Transport is running, schedule for next beat; otherwise replace immediately
    if (Tone.Transport.state === "started") {
      // Schedule the update for next half note (much faster than waiting for full bar)
      window.state.pendingChanges[slot] = {
        name: name,
        modifier: modifier,
        scheduledTime: Tone.Transport.nextSubdivision("2n") // Next half note (~0.5-1s)
      };

      window.log(`🔄 Slot [${slot}] update queued: ${oldName} → ${name} (next beat)`);

      // Schedule the actual update
      Tone.Transport.scheduleOnce(function(time) {
        self.executeSlotUpdate(slot);
      }, window.state.pendingChanges[slot].scheduledTime);
    } else {
      // Transport not running - replace immediately
      window.log(`🔄 Slot [${slot}]: ${oldName} → ${name}`);
      this.removeSlotImmediate(slot, 0.05);
      setTimeout(function() {
        self.createProductInSlot(slot, name, modifier);
      }, 60);
    }

    return slot;
  },

  // Execute a pending slot update (called on beat)
  executeSlotUpdate: function(slot) {
    const pending = window.state.pendingChanges[slot];
    if (!pending) return;

    const self = this;

    // Remove old product from slot (quick fade)
    if (window.state.slots[slot]) {
      this.removeSlotImmediate(slot, 0.05); // 50ms fade for smooth transition
    }

    // Small delay to let old synth fade, then create new
    setTimeout(function() {
      self.createProductInSlot(slot, pending.name, pending.modifier);
      delete window.state.pendingChanges[slot];
    }, 60);
  },

  // Create a product in a slot (internal - use addProductToSlot externally)
  createProductInSlot: function(slot, name, modifier = "") {
    // Delegate to the main addProduct logic but use slot as ID
    return this.addProduct(name, modifier, slot);
  },

  // Remove a specific slot
  removeSlot: function(slot) {
    if (!window.state.slots[slot]) {
      window.log(`❌ Slot [${slot}] is already empty`);
      return false;
    }

    const productName = window.state.slots[slot].name;

    // Remove from both products and slots state
    this.removeProductById(slot);
    delete window.state.slots[slot];

    window.log(`🗑️ Slot [${slot}] cleared (${productName} removed)`);
    return true;
  },

  // Remove slot with custom fade time (for transitions)
  removeSlotImmediate: function(slot, fadeTime = 0.1) {
    if (!window.state.slots[slot]) return false;

    const product = window.state.slots[slot];

    // Quick cleanup
    if (product.loop) {
      product.loop.stop();
      product.loop.dispose();
    }

    if (product.synth) {
      product.synth.volume.rampTo(-60, fadeTime);
      setTimeout(() => {
        if (product.filter) {
          product.filter.disconnect();
          product.filter.dispose();
        }
        if (product.effect) {
          product.effect.disconnect();
          product.effect.dispose();
        }
        product.synth.disconnect();
        product.synth.dispose();
      }, fadeTime * 1000 + 50);
    }

    // Remove from visualization
    if (window.visualization && window.visualization.removeProductVisualizer) {
      window.visualization.removeProductVisualizer(slot);
    }

    // Unregister voice
    if (window.performanceManager) {
      window.performanceManager.unregisterVoice(slot);
    }

    delete window.state.slots[slot];
    return true;
  },

  // Remove all slots
  removeAll: function() {
    const slots = Object.keys(window.state.slots);

    if (slots.length === 0) {
      window.log("No products to remove.");
      return false;
    }

    const count = slots.length;
    slots.forEach(slot => {
      // Remove from both products and slots state
      this.removeProductById(slot);
      delete window.state.slots[slot];
    });

    window.log(`🧹 All ${count} slots cleared`);
    return true;
  },

  // Get slot info for display
  getSlotInfo: function() {
    const info = {};
    for (let i = 0; i <= 9; i++) {
      const slot = String(i);
      if (window.state.slots[slot]) {
        info[slot] = {
          name: window.state.slots[slot].name,
          modifiers: Object.keys(window.state.slots[slot].modifiers || {})
        };
      } else {
        info[slot] = null;
      }
    }
    return info;
  },

  // ============================================
  // CORE PRODUCT LOGIC (modified to use slot ID)
  // ============================================

  // Add a product with optional modifiers (now accepts optional slot parameter)
  addProduct: function(name, modifier = "", slotId = null) {
    // Check if product exists in our catalog
    if (!window.productTypes[name]) {
      window.log(`Product ${name} not available in this supermarket!`);
      return null;
    }

    // Use slot ID if provided, otherwise generate legacy ID (for backward compat)
    const id = slotId !== null ? slotId : `${name}_${Date.now()}`;

    // If using slot system, check we have valid slot
    if (slotId !== null && !window.state.VALID_SLOTS.includes(slotId)) {
      window.log(`❌ Invalid slot [${slotId}]!`);
      return null;
    }

    // Check if we can play a new voice
    if (window.performanceManager && !window.performanceManager.canPlayVoice(1)) {
      window.log("The supermarket is too crowded with sounds... try removing some products.");
      return null;
    }

    // Create the base synth
    const synth = window.productTypes[name].create();
    synth.volume.value = CONFIG.product.baseVolume; // Set base volume

    // Route through processing chain or fallback to destination
    if (window.processingChain && window.processingChain.initialized) {
      window.processingChain.route(synth, name);
    } else {
      // Fallback: connect directly to destination
      synth.toDestination();
    }

    // Register this voice
    if (window.performanceManager) {
      window.performanceManager.registerVoice(id, 1);
    }
    
    // Initialize product parameters
    let note = window.productTypes[name].note;
    let filter = null;
    let effect = null;
    let modifiers = {};
    
    // Parse modifier string to extract special parameters and core modifiers
    const {
      nutriscoreKey,
      shelfLifeDuration,
      isOpenProduct,
      escalatorPattern,
      escalatorSpeed,
      volumeLevel,
      shelfOctave,
      cleanModifier
    } = this.parseModifiers(modifier, name);

    // Apply shelf octave shift (from crouch/reach/grab verbs)
    if (shelfOctave !== 0) {
      if (Array.isArray(note)) {
        note = note.map(n => Tone.Frequency(n).transpose(12 * shelfOctave).toNote());
      } else if (note) {
        note = Tone.Frequency(note).transpose(12 * shelfOctave).toNote();
      }
    }

    // Apply modifiers (fresh/old, strong/flavorless, etc.)
    if (cleanModifier) {
      const modifierList = cleanModifier.split(' ');
      
      // Apply up to maximum allowed modifiers
      for (let i = 0; i < Math.min(modifierList.length, CONFIG.product.maxModifiers); i++) {
        const currentModifier = modifierList[i];
        
        // Skip empty modifiers
        if (!currentModifier) continue;
        
        // Store modifier for visualization
        modifiers[currentModifier] = true;
        
        // Apply pitch modifiers (fresh/old)
        if (currentModifier === "fresh" || currentModifier === "old") {
          this.applyPitchModifier(synth, name, note, currentModifier);
          
          // Update note for future modifications
          const octaveShift = window.productTypes[name][currentModifier].octave || 0;
          if (Array.isArray(note)) {
            note = note.map(n => Tone.Frequency(n).transpose(12 * octaveShift).toNote());
          } else {
            note = Tone.Frequency(note).transpose(12 * octaveShift).toNote();
          }
          
          // Log the modification
          window.log(`Added ${currentModifier} ${name} (${currentModifier === "fresh" ? "suspiciously bright and vibrant" : "expired decades ago"}...)`);
        }
        
        // Apply filter modifiers (strong/flavorless)
        else if (currentModifier === "strong" || currentModifier === "flavorless") {
          const filterType = currentModifier === "strong" ? "lowpass" : "highpass";
          filter = window.audioEngine.applyFilter(synth, filterType);
          
          // Log the modification
          window.log(`Made it ${currentModifier} (${currentModifier === "strong" ? "unnaturally so" : "it tastes like nothing at all"}...)`);
        }
        
        // Apply effect modifiers (all others)
        else {
          effect = window.audioEngine.applyEffectModifier(
            filter || synth, // Source to apply effect to
            name,            // Product name for config lookup
            currentModifier, // Modifier name
            effect           // Existing effect (null on first run)
          );
        }
      }
    } else {
      // If no modifiers, log a standard message
      window.log(`Added regular ${name} (as regular as anything can be here...)`);
    }
    
    // Apply Nutriscore key change if specified
    if (nutriscoreKey) {
      note = this.applyNutriscoreKeyChange(note, nutriscoreKey);
      
      // Log with colored indicator
      const nutriscoreColors = {
        'A': '#2d7f25', // green
        'B': '#8ebe21', // light green
        'C': '#f7ae00', // yellow
        'D': '#e87b21', // orange
        'E': '#e62e18'  // red
      };
      
      window.log(`🏷️ Nutriscore ${nutriscoreKey} applied to ${name} <span style="color: ${nutriscoreColors[nutriscoreKey]}; font-weight: bold;">(${nutriscoreKey})</span>`);
    }
    
    // Log shelf life information if specified
    if (shelfLifeDuration) {
      const { emoji, color } = window.audioEngine.getShelfLifeVisual(shelfLifeDuration);
      window.log(`${emoji} Shelf life set - product repetition: <span style="color: ${color}; font-weight: bold;">${shelfLifeDuration}</span>`);
    }
    
    // Log if product is open
    if (isOpenProduct) {
      window.log(`⚠️ Warning: This ${name} has been opened... <span style="color: #ff00ff;">it behaves unpredictably!</span>`);
    }
    
    // Log if escalator is active
    if (escalatorPattern) {
      window.log(`🛗 Escalator mode: ${escalatorPattern} at ${escalatorSpeed} speed`);
    }

    // Apply custom volume if specified
    if (volumeLevel !== null) {
      synth.volume.value = volumeLevel;
      const volumePercent = Math.round(((volumeLevel + 40) / 40) * 100);
      window.log(`🔊 Volume set to ${volumePercent}%`);
    }

    // Store the product in state
    window.state.products[id] = {
      id,
      name,
      synth,
      note,
      filter,
      effect,
      color: window.productTypes[name].color || "#ffffff",
      modifiers: modifiers,
      loop: null,
      nutriscoreKey,
      shelfLifeDuration,
      isOpenProduct,
      escalatorPattern,
      escalatorSpeed,
      lastTriggerTime: 0,
      visualAmplitude: 0
    };
    
    // Create a loop for this product with the right pattern
    // Use shelfLifeDuration if specified, otherwise use the default pattern
    const pattern = shelfLifeDuration || window.productTypes[name].pattern;
    
    // Create audio loop
    const loop = window.audioEngine.createProductLoop(
      synth, 
      note, 
      pattern, 
      id, 
      { 
        isOpenProduct,
        escalatorPattern,
        escalatorSpeed
      }
    );
    
    // Store the loop
    window.state.products[id].loop = loop;
    
    // Apply any active global modes
    this.applyActiveModes(id);
    
    // Apply seasonal effects if a season is active
    if (window.storeFeatures && window.storeFeatures.currentSeason !== 'normal') {
      window.storeFeatures.applySeasonalEffects(id);
    }
    
    // Add product to visualization
    if (window.visualization && window.visualization.addProductVisualizer) {
      window.visualization.addProductVisualizer(id);
    }
    
    // Random advertisement messages
    if (CONFIG.ui.showAds && Math.random() < CONFIG.ui.adProbability) {
      this.showRandomAd(name);
    }
    
    // Check for product combos
    if (window.storeFeatures && window.storeFeatures.checkProductCombos) {
      window.storeFeatures.checkProductCombos();
    }
    
    return id;
  },
  
  // Remove a product by name (all instances)
  removeProduct: function(productName) {
    const ids = Object.keys(window.state.products).filter(id => 
      window.state.products[id].name === productName);
    
    if (ids.length > 0) {
      ids.forEach(id => this.removeProductById(id));
      window.log(`Removed all ${productName} from your cart (did it crawl away?)...`);
      return true;
    } else {
      window.log(`No ${productName} in your cart. (Did it disappear on its own?)...`);
      return false;
    }
  },
  
  // Remove a single product instance by ID
  removeProductById: function(id) {
    if (!window.state.products[id]) return false;

    // Track for story mode
    if (window.storyMode && window.storyMode.tracking) {
      window.storyMode.tracking.productsRemoved++;
    }

    const product = window.state.products[id];

    // Remove from state IMMEDIATELY so slot is freed
    delete window.state.products[id];

    // Unregister voice
    if (window.performanceManager) {
      window.performanceManager.unregisterVoice(id);
    }

    // Remove from visualization with fade out animation
    if (window.visualization && window.visualization.removeProductVisualizer) {
      window.visualization.removeProductVisualizer(id);
    }

    // Cleanup audio resources (continues in background)
    try {
      // Clear all intervals first to prevent memory leaks
      if (product.inflationInterval) {
        clearInterval(product.inflationInterval);
        product.inflationInterval = null;
      }
      if (product.blackFridayInterval) {
        clearInterval(product.blackFridayInterval);
        product.blackFridayInterval = null;
      }
      if (product.apocalypseInterval) {
        clearInterval(product.apocalypseInterval);
        product.apocalypseInterval = null;
      }
      if (product.decayTimeout) {
        clearTimeout(product.decayTimeout);
        product.decayTimeout = null;
      }

      // Stop the loop immediately
      if (product.loop) {
        product.loop.stop();
        product.loop.dispose();
      }

      // Fade out volume and then dispose the synth
      if (product.synth) {
        // Ramp down volume over 0.5 seconds for quick fade
        product.synth.volume.rampTo(-60, 0.5);

        // Schedule disposal after fade-out completes
        setTimeout(function() {
          // Dispose the filter if it exists
          if (product.filter) {
            product.filter.disconnect();
            product.filter.dispose();
          }

          // Dispose all effects properly
          if (product.effect) {
            product.effect.disconnect();
            product.effect.dispose();
          }

          // Dispose complex effect chains
          if (product.effects) {
            Object.values(product.effects).forEach(function(effect) {
              if (effect) {
                // Dispose effect chains if they exist
                if (effect._chain && Array.isArray(effect._chain)) {
                  effect._chain.forEach(function(node) {
                    if (node && node.dispose) {
                      node.disconnect();
                      node.dispose();
                    }
                  });
                }
                // Dispose the effect itself
                if (effect.dispose) {
                  effect.disconnect();
                  effect.dispose();
                }
              }
            });
          }

          // Dispose the synth
          if (product.synth) {
            product.synth.disconnect();
            product.synth.dispose();
          }
        }, 600); // Wait 600ms to match the quick volume fade
      }
    } catch (error) {
      console.error("Error removing product:", error);
    }

    return true;
  },
  
  // Parse modifier string to extract special parameters
  parseModifiers: function(modifier, productName) {
    // Initialize result
    const result = {
      nutriscoreKey: null,
      shelfLifeDuration: null,
      isOpenProduct: false,
      escalatorPattern: null,
      escalatorSpeed: null,
      volumeLevel: null,
      shelfOctave: 0,  // Shelf height octave shift (from crouch/reach/grab verbs)
      cleanModifier: modifier
    };

    // Extract shelf octave (from verb-based shelf height: crouch=-2, grab=-1, reach=+1)
    const shelfMatch = modifier.match(/shelf:(-?\d+)/i);
    if (shelfMatch) {
      result.shelfOctave = parseInt(shelfMatch[1]);
      result.cleanModifier = result.cleanModifier.replace(/shelf:-?\d+/i, '').trim();
    }
    
    // Extract Nutriscore
    const nutriscoreMatch = modifier.match(/nutriscore\s+([A-E])/i);
    if (nutriscoreMatch) {
      result.nutriscoreKey = nutriscoreMatch[1].toUpperCase();
      // Remove from modifier string
      result.cleanModifier = result.cleanModifier.replace(/nutriscore\s+[A-E]/i, '').trim();
    }
    
    // Extract shelf life
    const shelfLifeMatch = modifier.match(/shelflife\s+(today|week|month|year|decade|forever)/i);
    if (shelfLifeMatch) {
      const shelfLifeValue = shelfLifeMatch[1].toLowerCase();
      // Use shelfLifeDurations from audio-engine.js
      result.shelfLifeDuration = window.shelfLifeDurations[shelfLifeValue];
      // Remove from modifier string
      result.cleanModifier = result.cleanModifier.replace(/shelflife\s+(today|week|month|year|decade|forever)/i, '').trim();
    }
    
    // Extract escalator (arpeggiator) - flexible word order
    // Patterns: up, down, bounce, zigzag, express, checkout
    // Speeds: slow, normal, fast, rush, broken
    const escalatorMatch = modifier.match(/escalator/i);
    if (escalatorMatch) {
      // Look for pattern
      const patternMatch = modifier.match(/(up|down|bounce|zigzag|express|checkout)/i);
      if (patternMatch) {
        result.escalatorPattern = patternMatch[1].toLowerCase();
      } else {
        result.escalatorPattern = 'up'; // default pattern
      }
      
      // Look for speed
      const speedMatch = modifier.match(/(slow|normal|fast|rush|broken)/i);
      if (speedMatch) {
        result.escalatorSpeed = speedMatch[1].toLowerCase();
      } else {
        result.escalatorSpeed = 'normal'; // default speed
      }
      
      // Remove escalator-related words from modifier string
      result.cleanModifier = result.cleanModifier
        .replace(/escalator/i, '')
        .replace(/(up|down|bounce|zigzag|express|checkout)/i, '')
        .replace(/(slow|normal|fast|rush|broken)/i, '')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    // Check for open product
    result.isOpenProduct = modifier.includes("open");
    if (result.isOpenProduct) {
      // Remove from modifier string
      result.cleanModifier = result.cleanModifier.replace(/open/i, '').trim();
    }

    // Extract volume level
    // Can be: volume 0-100, volume loud/soft/quiet/max/min/mute
    const volumeNumMatch = modifier.match(/volume\s+(\d+)/i);
    const volumeWordMatch = modifier.match(/volume\s+(loud|soft|quiet|max|min|mute|whisper)/i);

    if (volumeNumMatch) {
      // Numeric volume 0-100 maps to -40 to 0 dB
      const numVal = Math.max(0, Math.min(100, parseInt(volumeNumMatch[1])));
      result.volumeLevel = (numVal / 100) * 40 - 40;
      result.cleanModifier = result.cleanModifier.replace(/volume\s+\d+/i, '').trim();
    } else if (volumeWordMatch) {
      const word = volumeWordMatch[1].toLowerCase();
      const volumeWords = {
        'max': 0,
        'loud': -6,
        'soft': -20,
        'quiet': -25,
        'whisper': -30,
        'min': -35,
        'mute': -60
      };
      result.volumeLevel = volumeWords[word];
      result.cleanModifier = result.cleanModifier.replace(/volume\s+(loud|soft|quiet|max|min|mute|whisper)/i, '').trim();
    }

    return result;
  },
  
  // Apply pitch modifier (fresh/old)
  applyPitchModifier: function(synth, productName, note, modifierName) {
    const config = window.productTypes[productName][modifierName];
    if (!config) return;
    
    // Apply octave shift if defined
    if (config.octave !== undefined) {
      const octaveShift = config.octave;
      
      // Detune the synth if possible
      if (synth.detune) {
        synth.detune.value = octaveShift * 1200; // 1200 cents per octave
      }
    }
  },
  
  // Apply Nutriscore key change
  applyNutriscoreKeyChange: function(note, nutriscoreKey) {
    const getNoteWithoutOctave = noteStr => {
      if (!noteStr) return null;
      return noteStr.replace(/\d+$/, '');
    };
    
    // For array of notes (chords)
    if (Array.isArray(note)) {
      return note.map(n => {
        const baseNote = getNoteWithoutOctave(n);
        const octave = n.match(/\d+$/)[0];
        // Calculate semitone difference to move to the new key
        const currentKeyIndex = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(baseNote);
        const targetKeyIndex = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(nutriscoreKey);
        const semitones = (targetKeyIndex - currentKeyIndex + 12) % 12;
        
        // Transpose to new key
        return Tone.Frequency(n).transpose(semitones).toNote();
      });
    } else {
      // For single notes
      const baseNote = getNoteWithoutOctave(note);
      const octave = note.match(/\d+$/)[0];
      // Calculate semitone difference to move to the new key
      const currentKeyIndex = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(baseNote);
      const targetKeyIndex = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(nutriscoreKey);
      const semitones = (targetKeyIndex - currentKeyIndex + 12) % 12;
      
      // Transpose to new key
      return Tone.Frequency(note).transpose(semitones).toNote();
    }
  },
  
  // Apply active modes to a product
  applyActiveModes: function(id) {
    const product = window.state.products[id];
    if (!product) return;
    
    if (window.state.modes.discount) {
      // Apply random detuning
      if (product.synth && product.synth.detune) {
        product.synth.detune.value += (Math.random() * 100) - 50; // +/- 50 cents
      }
    }
    
    if (window.state.modes.inflation) {
      this.applyInflationToProduct(id);
    }
    
    if (window.state.modes.consumerism) {
      this.applyConsumerismToProduct(id);
    }
    
    if (window.state.modes.black_friday) {
      this.applyBlackFridayToProduct(id);
    }
    
    if (window.state.modes.apocalypse) {
      this.applyApocalypseToProduct(id);
    }
  },
  
  // Apply inflation effect to a product
  applyInflationToProduct: function(id) {
    const product = window.state.products[id];
    if (!product || !product.synth) return;

    // Clear any existing inflation interval
    if (product.inflationInterval) {
      clearInterval(product.inflationInterval);
    }

    // Store original volume to restore later
    if (product._originalVolume === undefined) {
      product._originalVolume = product.synth.volume.value;
    }

    // Reduce volume slightly to compensate for perceived loudness increase from rising pitch
    product.synth.volume.value = product._originalVolume - 6;

    // Create gradually increasing pitch
    let detuneAmount = 0;
    product.inflationInterval = setInterval(() => {
      if (!window.state.products[id] || !window.state.products[id].synth) {
        clearInterval(product.inflationInterval);
        return;
      }

      detuneAmount += 2; // Increase by 2 cents every interval
      if (detuneAmount > 1200) {
        detuneAmount = 0; // Reset after going up an octave
        window.log(`${product.name} price has doubled! (Reset to base level...)`);
      }

      product.synth.detune.value = detuneAmount;
    }, 500); // Update every 500ms
  },
  
  // Apply consumerism effect to a product
  applyConsumerismToProduct: function(id) {
    const product = window.state.products[id];
    if (!product || !product.synth) return;
    
    // Make the product more addictive
    if (product.effect) {
      product.effect.dispose();
    }
    
    // Create new effect - always a delay-based effect to create repetition
    if (window.createEffect) {
      product.effect = window.createEffect("ping-pong-delay", { 
        delayTime: 0.16 + (Math.random() * 0.2),
        feedback: 0.7,
        wet: 0.5
      });
      
      // Connect synth to effect
      if (product.filter) {
        product.filter.disconnect();
        product.filter.connect(product.effect);
      } else {
        product.synth.disconnect();
        product.synth.connect(product.effect);
      }
      
      // Connect to destination
      product.effect.toDestination();
      
      // Increase volume to make it more noticeable
      product.synth.volume.value = CONFIG.product.baseVolume + 3;
    }
  },
  
  // Apply black friday effect to a product
  applyBlackFridayToProduct: function(id) {
    const product = window.state.products[id];
    if (!product || !product.synth) return;
    
    // Create chaotic distortion
    if (product.effect) {
      product.effect.dispose();
    }
    
    // Create new effect - always distortion-based for chaos
    if (window.createEffect) {
      product.effect = window.createEffect("distortion", { 
        distortion: 0.8 + (Math.random() * 0.2),
        wet: 0.8
      });
      
      // Connect synth to effect
      if (product.filter) {
        product.filter.disconnect();
        product.filter.connect(product.effect);
      } else {
        product.synth.disconnect();
        product.synth.connect(product.effect);
      }
      
      // Connect to destination
      product.effect.toDestination();
      
      // Random volume fluctuations
      product.synth.volume.value = CONFIG.product.baseVolume + (Math.random() * 10 - 5);
      
      // Create chaotic interval
      if (product.blackFridayInterval) {
        clearInterval(product.blackFridayInterval);
      }
      
      product.blackFridayInterval = setInterval(() => {
        if (!window.state.products[id] || !window.state.products[id].synth) {
          clearInterval(product.blackFridayInterval);
          return;
        }
        
        // Random volume changes
        product.synth.volume.rampTo(
          CONFIG.product.baseVolume + (Math.random() * 10 - 5),
          0.2
        );
        
        // Random detuning
        if (product.synth.detune) {
          product.synth.detune.rampTo(
            Math.random() * 200 - 100, // +/- 100 cents
            0.1
          );
        }
      }, 500);
    }
  },
  
  // Apply apocalypse effect to a product
  applyApocalypseToProduct: function(id) {
    const product = window.state.products[id];
    if (!product || !product.synth) return;
    
    // Create apocalyptic effects
    if (product.effect) {
      product.effect.dispose();
    }
    
    if (window.createEffect) {
      // Create new effect chain - combination of distortion and delay
      const distortion = window.createEffect("distortion", { 
        distortion: 0.5 + (Math.random() * 0.5),
        wet: 0.7
      });
      
      const delay = window.createEffect("ping-pong-delay", { 
        delayTime: 0.1 + (Math.random() * 0.3),
        feedback: 0.6,
        wet: 0.4
      });
      
      // Connect synth to first effect
      if (product.filter) {
        product.filter.disconnect();
        product.filter.connect(distortion);
      } else {
        product.synth.disconnect();
        product.synth.connect(distortion);
      }
      
      // Connect distortion to delay
      distortion.connect(delay);
      
      // Connect delay to destination
      delay.toDestination();
      
      // Store the main effect for later disposal
      product.effect = distortion;
      
      // Create chaotic interval
      if (product.apocalypseInterval) {
        clearInterval(product.apocalypseInterval);
      }
      
      product.apocalypseInterval = setInterval(() => {
        if (!window.state.products[id] || !window.state.products[id].synth) {
          clearInterval(product.apocalypseInterval);
          return;
        }
        
        // Random extreme detuning
        if (product.synth.detune) {
          product.synth.detune.rampTo(
            Math.random() * 400 - 200, // +/- 200 cents
            0.2
          );
        }
        
        // Randomly change the pattern
        if (product.loop) {
          // Chance to change the pattern rate
          if (Math.random() < 0.3) {
            const patternTypes = ['32n', '16n', '8n', '4n', '2n', '1n'];
            const randomPattern = patternTypes[Math.floor(Math.random() * patternTypes.length)];
            product.loop.interval = randomPattern;
          }
        }
      }, 2000 + Math.random() * 2000);
    }
  },
  
  // Show random advertisement message
  showRandomAd: function(productName) {
    const ads = [
      `BUY MORE ${productName.toUpperCase()}!`,
      `${productName.toUpperCase()} - 50% OFF TODAY ONLY!`,
      `NEW! IMPROVED! ${productName.toUpperCase()}!`,
      `${productName.toUpperCase()} - CONSUME NOW!`,
      `YOU DESERVE ${productName.toUpperCase()}!`,
      `LIMITED EDITION ${productName.toUpperCase()}!`,
      `${productName.toUpperCase()} - AS SEEN ON TV!`,
      `ARE YOU COOL ENOUGH FOR ${productName.toUpperCase()}?`,
      `${productName.toUpperCase()} - SATISFY YOUR CRAVINGS!`,
      `EVERYONE ELSE IS BUYING ${productName.toUpperCase()}!`
    ];
    
    const randomAd = ads[Math.floor(Math.random() * ads.length)];
    
    // Create ad message element
    const messageEl = document.createElement("div");
    messageEl.className = "ad-message";
    messageEl.textContent = randomAd;
    messageEl.style.top = `${30 + (Math.random() * 40)}%`;
    messageEl.style.left = `${20 + (Math.random() * 60)}%`;
    document.body.appendChild(messageEl);
    
    // Remove after animation completes
    setTimeout(() => {
      messageEl.remove();
    }, 4000);
  }
};