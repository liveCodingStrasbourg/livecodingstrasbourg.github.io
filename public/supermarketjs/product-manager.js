// product-manager.js - Manages the addition, modification, and removal of products

// Main product manager module functionality
window.productManager = {
  // Add a product with optional modifiers
  addProduct: function(name, modifier = "") {
    // Check if product exists in our catalog
    if (!productTypes[name]) {
      window.log(`Product ${name} not available in this supermarket!`);
      return null;
    }
    
    // Check if we've reached the maximum number of products
    const totalProducts = Object.keys(window.state.products).length;
    if (totalProducts >= CONFIG.audio.maxProducts) {
      window.log(`Maximum number of products reached. Remove some products first.`);
      return null;
    }
    
    // Count instances of this product
    const productInstances = Object.values(window.state.products).filter(p => p.name === name).length;
    
    // Check if we've reached the maximum instances of this product
    if (productInstances >= CONFIG.product.maxInstances) {
      window.log(`Maximum number of ${name} instances reached. Remove some ${name} first.`);
      return null;
    }

    // Create a unique ID for this product instance
    const id = `${name}_${Date.now()}`;
    
    // Create the base synth
    const synth = productTypes[name].create();
    synth.volume.value = CONFIG.product.baseVolume; // Set base volume
    
    // Initialize product parameters
    let note = productTypes[name].note;
    let filter = null;
    let effect = null;
    let modifiers = {};
    
    // Parse modifier string to extract special parameters and core modifiers
    const {
      nutriscoreKey,
      shelfLifeDuration,
      isOpenProduct,
      cleanModifier
    } = this.parseModifiers(modifier, name);
    
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
          const octaveShift = productTypes[name][currentModifier].octave || 0;
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
    
    // Store the product in state
    window.state.products[id] = {
      id,
      name,
      synth,
      note,
      filter,
      effect,
      color: productTypes[name].color || "#ffffff",
      modifiers: modifiers,
      loop: null,
      nutriscoreKey,
      shelfLifeDuration,
      isOpenProduct,
      lastTriggerTime: 0,
      visualAmplitude: 0
    };
    
    // Create a loop for this product with the right pattern
    // Use shelfLifeDuration if specified, otherwise use the default pattern
    const pattern = shelfLifeDuration || productTypes[name].pattern;
    
    // Create audio loop
    const loop = window.audioEngine.createProductLoop(
      synth, 
      note, 
      pattern, 
      id, 
      { isOpenProduct }
    );
    
    // Store the loop
    window.state.products[id].loop = loop;
    
    // Apply any active global modes
    this.applyActiveModes(id);
    
    // Add product to visualization
    if (window.visualization && window.visualization.addProductVisualizer) {
      window.visualization.addProductVisualizer(id);
    }
    
    // Random advertisement messages
    if (CONFIG.ui.showAds && Math.random() < CONFIG.ui.adProbability) {
      this.showRandomAd(name);
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
    
    const product = window.state.products[id];
    
    // Remove from visualization with fade out animation
    if (window.visualization && window.visualization.removeProductVisualizer) {
      window.visualization.removeProductVisualizer(id);
    }
    
    // Cleanup audio resources
    try {
      // Stop and dispose of the loop
      if (product.loop) {
        product.loop.dispose();
      }
      
      // Fade out volume and then dispose the synth
      if (product.synth) {
        // Ramp down volume over 3 seconds before disposing
        product.synth.volume.rampTo(-60, 3);
        
        // Schedule disposal after fade-out completes
        setTimeout(() => {
          if (product.synth) {
            product.synth.dispose();
          }
          
          // Dispose the filter if it exists
          if (product.filter) {
            product.filter.dispose();
          }
          
          // Dispose the effect if it exists
          if (product.effect) {
            product.effect.dispose();
          }
          
          // Remove from state after the fade-out
          if (window.state.products[id]) {
            delete window.state.products[id];
          }
        }, 3000); // Wait for 3 seconds to match the volume ramp time
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
      cleanModifier: modifier
    };
    
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
    
    // Check for open product
    result.isOpenProduct = modifier.includes("open");
    if (result.isOpenProduct) {
      // Remove from modifier string
      result.cleanModifier = result.cleanModifier.replace(/open/i, '').trim();
    }
    
    return result;
  },
  
  // Apply pitch modifier (fresh/old)
  applyPitchModifier: function(synth, productName, note, modifierName) {
    const config = productTypes[productName][modifierName];
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