// store-features.js - Additional store features like checkout, announcements, and seasons

window.storeFeatures = {
  // Current recording state
  recording: {
    isRecording: false,
    recorder: null,
    chunks: [],
    startTime: null
  },
  
  // Current season
  currentSeason: 'normal',
  
  // Announcement system
  announcements: {
    isPlaying: false,
    speechSynth: null
  },
  
  // Decay system state
  decay: {
    active: false,
    interval: null
  },
  
  // Checkout Scanner - Record performance
  startCheckout: function() {
    if (this.recording.isRecording) {
      window.log("⏹️ Already recording! Use 'finish checkout' to stop.");
      return;
    }
    
    try {
      // Create a MediaRecorder
      const dest = Tone.context.createMediaStreamDestination();
      Tone.Destination.connect(dest);
      
      this.recording.recorder = new MediaRecorder(dest.stream);
      this.recording.chunks = [];
      
      this.recording.recorder.ondataavailable = (evt) => {
        this.recording.chunks.push(evt.data);
      };
      
      this.recording.recorder.onstop = () => {
        const blob = new Blob(this.recording.chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        a.download = `supermarket-checkout-${timestamp}.webm`;
        a.href = url;
        a.click();
        
        // Clean up
        URL.revokeObjectURL(url);
        this.recording.chunks = [];
        
        const duration = Math.round((Date.now() - this.recording.startTime) / 1000);
        window.log(`🧾 Checkout complete! Receipt saved (${duration}s of audio)`);
      };
      
      // Start recording
      this.recording.recorder.start();
      this.recording.isRecording = true;
      this.recording.startTime = Date.now();
      
      window.log("🛒 Scanning items... Recording started!");
      
      // Visual indicator
      if (window.uiEffects && window.uiEffects.showMessage) {
        window.uiEffects.showMessage("RECORDING IN PROGRESS", 2000, 'error-red');
      }
      
    } catch (error) {
      console.error("Error starting checkout:", error);
      window.log("❌ Checkout scanner malfunction! (Check browser permissions)");
    }
  },
  
  // Stop checkout recording
  finishCheckout: function() {
    if (!this.recording.isRecording) {
      window.log("🛒 No checkout in progress!");
      return;
    }
    
    try {
      this.recording.recorder.stop();
      this.recording.isRecording = false;
      window.log("⏸️ Processing your items...");
    } catch (error) {
      console.error("Error stopping checkout:", error);
      window.log("❌ Checkout error! Please try again.");
    }
  },
  
  // Scan barcode - Generate pattern from number
  scanBarcode: function(barcode) {
    if (!barcode || barcode.length < 3) {
      window.log("❌ Invalid barcode! Use at least 3 digits.");
      return;
    }

    // Validate barcode contains only digits
    if (!/^\d+$/.test(barcode)) {
      window.log("❌ Invalid barcode! Use only numeric digits (0-9).");
      return;
    }

    // Convert barcode to rhythm pattern
    const digits = barcode.split('').map(d => parseInt(d, 10));
    const productMap = ['beer', 'salad', 'ham', 'milk', 'chips', 'pizza', 'oil', 'wine', 'soda', 'bread'];
    
    // Add products based on digits
    digits.forEach((digit, index) => {
      const product = productMap[digit % productMap.length];
      const modifier = digit > 5 ? 'expensive' : 'cheap';
      
      setTimeout(() => {
        if (window.productManager) {
          window.productManager.addProduct(product, modifier);
        }
      }, index * 200);
    });
    
    window.log(`📊 Scanned barcode ${barcode} - Generating product sequence...`);
  },
  
  // Seasonal Events System
  setSeason: function(season) {
    const validSeasons = ['normal', 'halloween', 'christmas', 'summer', 'winter', 'easter', 'valentines'];
    
    if (!validSeasons.includes(season)) {
      window.log(`❌ Unknown season! Try: ${validSeasons.join(', ')}`);
      return;
    }
    
    this.currentSeason = season;
    
    // Apply seasonal effects to all products
    Object.keys(window.state.products).forEach(productId => {
      this.applySeasonalEffects(productId);
    });
    
    // Change visual theme
    this.applySeasonalTheme(season);
    
    // Log seasonal message
    const seasonMessages = {
      halloween: "🎃 Spooky season activated! Products sound haunted...",
      christmas: "🎄 Ho ho ho! Festive mode engaged...",
      summer: "☀️ Summer vibes! Everything sounds brighter...",
      winter: "❄️ Winter chill! Sounds are crisp and cold...",
      easter: "🐰 Easter mode! Bouncy and colorful sounds...",
      valentines: "💕 Love is in the air! Romantic ambience...",
      normal: "📅 Back to regular shopping..."
    };
    
    window.log(seasonMessages[season]);
    
    // Update UI indicator
    this.updateSeasonIndicator(season);
  },
  
  // Apply seasonal effects to a product
  applySeasonalEffects: function(productId) {
    const product = window.state.products[productId];
    if (!product || !product.synth) return;
    
    // Remove any existing seasonal effects
    if (product.seasonalEffect) {
      product.seasonalEffect.dispose();
      product.seasonalEffect = null;
    }
    
    switch (this.currentSeason) {
      case 'halloween':
        // Spooky tremolo and pitch wobble
        if (window.createEffect) {
          const tremolo = window.createEffect('tremolo', {
            frequency: 6.66,
            depth: 0.666,
            wet: 0.5
          });
          
          if (tremolo) {
            product.synth.disconnect();
            product.synth.connect(tremolo);
            tremolo.toDestination();
            product.seasonalEffect = tremolo;
          }
        }
        
        // Random pitch bends for spookiness
        if (product.synth.detune) {
          const spookyInterval = setInterval(() => {
            if (!window.state.products[productId]) {
              clearInterval(spookyInterval);
              return;
            }
            product.synth.detune.rampTo(
              Math.random() * 100 - 50,
              0.2
            );
          }, 666);
          product.spookyInterval = spookyInterval;
        }
        break;
        
      case 'christmas':
        // Festive reverb and bells
        if (window.createEffect) {
          const reverb = window.createEffect('reverb', {
            decay: 5,
            wet: 0.4
          });
          
          if (reverb) {
            product.synth.disconnect();
            product.synth.connect(reverb);
            reverb.toDestination();
            product.seasonalEffect = reverb;
          }
        }
        
        // Add slight detuning for choir effect
        if (product.synth.detune) {
          product.synth.detune.value = Math.random() * 20 - 10;
        }
        break;
        
      case 'summer':
        // Bright filter and chorus
        if (window.createEffect) {
          const chorus = window.createEffect('chorus', {
            frequency: 2,
            delayTime: 2,
            depth: 0.5,
            wet: 0.3
          });
          
          if (chorus) {
            product.synth.disconnect();
            product.synth.connect(chorus);
            chorus.toDestination();
            product.seasonalEffect = chorus;
          }
        }
        break;
        
      case 'winter':
        // Cold, crisp delay
        if (window.createEffect) {
          const delay = window.createEffect('ping-pong-delay', {
            delayTime: 0.125,
            feedback: 0.3,
            wet: 0.2
          });
          
          if (delay) {
            product.synth.disconnect();
            product.synth.connect(delay);
            delay.toDestination();
            product.seasonalEffect = delay;
          }
        }
        break;
        
      case 'easter':
        // Bouncy spring reverb
        if (window.createEffect) {
          const vibrato = window.createEffect('vibrato', {
            frequency: 4,
            depth: 0.3,
            wet: 0.5
          });
          
          if (vibrato) {
            product.synth.disconnect();
            product.synth.connect(vibrato);
            vibrato.toDestination();
            product.seasonalEffect = vibrato;
          }
        }
        break;
        
      case 'valentines':
        // Romantic phaser
        if (window.createEffect) {
          const phaser = window.createEffect('phaser', {
            frequency: 0.5,
            octaves: 4,
            wet: 0.4
          });
          
          if (phaser) {
            product.synth.disconnect();
            product.synth.connect(phaser);
            phaser.toDestination();
            product.seasonalEffect = phaser;
          }
        }
        break;
        
      default:
        // Normal - reconnect to destination
        product.synth.disconnect();
        product.synth.toDestination();
        
        // Clear any seasonal intervals
        if (product.spookyInterval) {
          clearInterval(product.spookyInterval);
          product.spookyInterval = null;
        }
        
        // Reset detune
        if (product.synth.detune) {
          product.synth.detune.value = 0;
        }
    }
  },
  
  // Apply visual seasonal theme
  applySeasonalTheme: function(season) {
    const body = document.body;
    
    // Remove all seasonal classes
    body.classList.remove('halloween-theme', 'christmas-theme', 'summer-theme', 
                         'winter-theme', 'easter-theme', 'valentines-theme');
    
    // Add new seasonal class
    if (season !== 'normal') {
      body.classList.add(`${season}-theme`);
    }
    
    // Special effects for certain seasons
    if (season === 'halloween' && window.uiEffects) {
      window.uiEffects.spawnRandomElements(5, 'spooky');
    } else if (season === 'christmas' && window.uiEffects) {
      window.uiEffects.createSnowEffect();
    }
  },
  
  // Update season indicator in UI
  updateSeasonIndicator: function(season) {
    let indicator = document.getElementById('season-indicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'season-indicator';
      indicator.className = 'mode-indicator';
      indicator.style.top = '60px';
      document.body.appendChild(indicator);
    }
    
    const seasonEmojis = {
      halloween: '🎃',
      christmas: '🎄',
      summer: '☀️',
      winter: '❄️',
      easter: '🐰',
      valentines: '💕',
      normal: ''
    };
    
    if (season === 'normal') {
      indicator.style.display = 'none';
    } else {
      indicator.style.display = 'block';
      indicator.textContent = `${seasonEmojis[season]} ${season.toUpperCase()} MODE`;
    }
  },
  
  // Store Announcements
  makeAnnouncement: function(message) {
    if (this.announcements.isPlaying) {
      window.log("📢 Please wait for current announcement to finish...");
      return;
    }
    
    // Predefined announcements
    const presetAnnouncements = {
      'cleanup': 'Cleanup on aisle 3. Customer assistance needed.',
      'closing': 'Attention shoppers, the store will be closing in 15 minutes.',
      'sale': 'Special offer in the frozen food section. Buy one get one free.',
      'fresh': 'Fresh bread now available in the bakery department.',
      'security': 'Security to checkout 5 please. Security to checkout 5.',
      'test': 'This is a test of the store announcement system.'
    };
    
    // Check if it's a preset or custom message
    const announcement = presetAnnouncements[message.toLowerCase()] || message;
    
    try {
      // Check if speech synthesis is available
      if (!('speechSynthesis' in window)) {
        window.log("📢 Using electronic PA system...");
        
        // Fallback: Create announcement beeps with Tone.js
        this.playAnnouncementBeeps(announcement);
        return;
      }
      
      // Cancel any pending speech
      window.speechSynthesis.cancel();
      
      // Store original volume
      const originalVolume = Tone.Destination.volume.value;
      
      // Lower music volume during announcement
      Tone.Destination.volume.rampTo(-20, 0.5);
      
      // Small delay to ensure speech synthesis is ready
      setTimeout(() => {
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(announcement);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        utterance.lang = 'en-US';
        
        // Set playing flag
        this.announcements.isPlaying = true;
        
        // Set up event handlers
        utterance.onstart = () => {
          console.log("Announcement started");
        };
        
        utterance.onend = () => {
          console.log("Announcement ended");
          // Restore music volume
          Tone.Destination.volume.rampTo(originalVolume, 0.5);
          this.announcements.isPlaying = false;
          window.log("📢 Announcement complete.");
        };
        
        utterance.onerror = (event) => {
          // Only log real errors, not interruptions
          if (event.error && event.error !== 'interrupted' && event.error !== 'canceled') {
            console.error("Speech synthesis error:", event.error);
            window.log("❌ PA system error!");
          }
          // Restore music volume
          Tone.Destination.volume.rampTo(originalVolume, 0.5);
          this.announcements.isPlaying = false;
        };

        // Play announcement
        window.speechSynthesis.speak(utterance);
        window.log(`📢 "Attention shoppers: ${announcement}"`);
        
        // Visual effect
        if (window.uiEffects && window.uiEffects.showMessage) {
          window.uiEffects.showMessage("📢 ANNOUNCEMENT IN PROGRESS", 3000, 'accent-color');
        }
      }, 100);
      
    } catch (error) {
      console.error("Error making announcement:", error);
      window.log("❌ PA system malfunction!");
      this.announcements.isPlaying = false;
      
      // Restore volume on error
      if (originalVolume !== undefined) {
        Tone.Destination.volume.rampTo(originalVolume, 0.5);
      }
    }
  },
  
  // Fallback announcement using Tone.js
  playAnnouncementBeeps: function(announcement) {
    this.announcements.isPlaying = true;
    const originalVolume = Tone.Destination.volume.value;
    
    // Lower music volume
    Tone.Destination.volume.rampTo(-20, 0.5);
    
    // Create PA system sound
    const paSynth = new Tone.MonoSynth({
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 0.3
      }
    });
    
    const reverb = new Tone.Reverb({
      decay: 2,
      wet: 0.6
    }).toDestination();
    
    paSynth.connect(reverb);
    
    // Play attention beeps
    const beepPattern = [
      { time: "0:0", note: "G4" },
      { time: "0:0:2", note: "C5" },
      { time: "0:1", note: "G4" }
    ];
    
    const beepPart = new Tone.Part((time, note) => {
      paSynth.triggerAttackRelease(note.note, "8n", time);
    }, beepPattern);
    
    beepPart.start(0);
    
    // Play once
    Tone.Transport.scheduleOnce(() => {
      beepPart.stop();
      beepPart.dispose();
      paSynth.dispose();
      reverb.dispose();
      
      // Restore volume
      Tone.Destination.volume.rampTo(originalVolume, 0.5);
      this.announcements.isPlaying = false;
      window.log("📢 Announcement complete.");
    }, "0:2");
    
    // Log and show visual
    window.log(`📢 [ANNOUNCEMENT]: "${announcement}"`);
    if (window.uiEffects && window.uiEffects.showMessage) {
      window.uiEffects.showMessage(`📢 ${announcement}`, 5000, 'accent-color');
    }
    
    // Make sure transport is running
    if (Tone.Transport.state !== "started") {
      Tone.Transport.start();
    }
  },
  
  // Rush Hour System
  rushHour: {
    active: false,
    intensity: 0,
    interval: null
  },
  
  startRushHour: function() {
    if (this.rushHour.active) {
      window.log("🏃 Rush hour already in progress!");
      return;
    }
    
    this.rushHour.active = true;
    this.rushHour.intensity = 0;
    
    window.log("🏃 RUSH HOUR BEGINS! The store fills with frantic shoppers...");
    
    // Visual indicator
    let indicator = document.getElementById('rush-hour-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'rush-hour-indicator';
      indicator.className = 'mode-indicator';
      indicator.style.top = '100px';
      indicator.style.backgroundColor = '#ff5722';
      document.body.appendChild(indicator);
    }
    indicator.style.display = 'block';
    indicator.textContent = '🏃 RUSH HOUR';
    
    // Gradually increase tempo and add more products
    this.rushHour.interval = setInterval(() => {
      if (!this.rushHour.active) {
        clearInterval(this.rushHour.interval);
        return;
      }
      
      this.rushHour.intensity = Math.min(1.0, this.rushHour.intensity + 0.1);
      
      // Increase tempo
      const currentBPM = Tone.Transport.bpm.value;
      const targetBPM = 120 + (this.rushHour.intensity * 80); // Up to 200 BPM
      Tone.Transport.bpm.rampTo(targetBPM, 2);
      
      // Add random products occasionally
      if (Math.random() < this.rushHour.intensity * 0.3) {
        const products = ['beer', 'chips', 'soda', 'candy', 'energy_drink'];
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        if (window.productManager) {
          window.productManager.addProduct(randomProduct, 'cheap');
        }
      }
      
      // Show frantic messages
      if (Math.random() < 0.2) {
        const messages = [
          "WHERE'S THE MILK?!",
          "EXCUSE ME, COMING THROUGH!",
          "IS THIS THE EXPRESS LANE?",
          "SOLD OUT ALREADY?!",
          "MOVE YOUR CART!"
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        if (window.uiEffects && window.uiEffects.showMessage) {
          window.uiEffects.showMessage(msg, 2000, 'error-red');
        }
      }
      
      // Update indicator
      indicator.textContent = `🏃 RUSH HOUR (${Math.round(this.rushHour.intensity * 100)}%)`;
      
    }, 3000);
  },
  
  endRushHour: function() {
    if (!this.rushHour.active) {
      window.log("🏃 No rush hour to end.");
      return;
    }
    
    this.rushHour.active = false;
    clearInterval(this.rushHour.interval);
    
    // Gradually return to normal
    Tone.Transport.bpm.rampTo(120, 5);
    
    // Hide indicator
    const indicator = document.getElementById('rush-hour-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
    
    window.log("😌 Rush hour ended. The store returns to normal pace...");
  },
  
  // Product Recipes/Combos
  productCombos: {
    'beer+chips': {
      name: 'Friday Night',
      effect: 'party',
      message: '🎉 FRIDAY NIGHT MODE! Party vibes activated!'
    },
    'milk+cereal': {
      name: 'Morning Routine',
      effect: 'morning',
      message: '🌅 MORNING MODE! Gentle wake-up sounds...'
    },
    'wine+cheese': {
      name: 'Sophisticated Jazz',
      effect: 'jazz',
      message: '🍷 SOPHISTICATED MODE! Smooth jazz ambience...'
    },
    'bread+ham': {
      name: 'Lunch Break',
      effect: 'lunch',
      message: '🥪 LUNCH BREAK! Midday energy boost...'
    },
    'energy_drink+candy': {
      name: 'Sugar Rush',
      effect: 'hyperactive',
      message: '⚡ SUGAR RUSH! Maximum energy overload!'
    },
    'oil+salad': {
      name: 'Health Conscious',
      effect: 'zen',
      message: '🥗 HEALTHY MODE! Calm and balanced...'
    }
  },
  
  checkProductCombos: function() {
    // Check if auto-combos are enabled (default to true if not set)
    if (window.autoCombosEnabled === false) {
      return;
    }

    const activeProducts = Object.values(window.state.products).map(p => p.name);
    const uniqueProducts = [...new Set(activeProducts)];

    // Check each combo
    for (const [combo, config] of Object.entries(this.productCombos)) {
      const required = combo.split('+');
      const hasCombo = required.every(product => uniqueProducts.includes(product));

      if (hasCombo && !window.state.activeCombo) {
        this.activateCombo(combo, config);
        break;
      }
    }
  },
  
  activateCombo: function(combo, config) {
    window.state.activeCombo = combo;
    window.log(config.message);
    
    // Apply combo effects
    switch (config.effect) {
      case 'party':
        // Friday night party mode
        Tone.Transport.bpm.rampTo(128, 2);
        if (window.cartWheels && window.cartWheels.setWheels) {
          window.cartWheels.setWheels('turbo');
        }
        document.body.classList.add('party-mode');
        break;
        
      case 'morning':
        // Gentle morning mode
        Tone.Transport.bpm.rampTo(90, 2);
        this.setSeason('summer');
        break;
        
      case 'jazz':
        // Sophisticated jazz mode
        Tone.Transport.bpm.rampTo(100, 2);
        if (window.cartWheels && window.cartWheels.setWheels) {
          window.cartWheels.setWheels('smooth');
        }
        // Add jazz reverb to all products
        Object.keys(window.state.products).forEach(id => {
          const product = window.state.products[id];
          if (product.synth && !product.jazzEffect) {
            const reverb = window.createEffect('reverb', { decay: 4, wet: 0.3 });
            if (reverb) {
              product.synth.disconnect();
              product.synth.connect(reverb);
              reverb.toDestination();
              product.jazzEffect = reverb;
            }
          }
        });
        break;

      case 'lunch':
        // Lunch break - relaxed midday vibes
        Tone.Transport.bpm.rampTo(95, 2);
        if (window.cartWheels && window.cartWheels.setWheels) {
          window.cartWheels.setWheels('rubber');
        }
        // Add a warm, mellow effect to all products
        Object.keys(window.state.products).forEach(id => {
          const product = window.state.products[id];
          if (product.synth && !product.lunchEffect) {
            const chorus = window.createEffect('chorus', { frequency: 2, delayTime: 3, depth: 0.5, wet: 0.4 });
            if (chorus) {
              product.synth.disconnect();
              product.synth.connect(chorus);
              chorus.toDestination();
              product.lunchEffect = chorus;
            }
          }
        });
        break;

      case 'hyperactive':
        // Sugar rush chaos
        this.startRushHour();
        window.modeManager.toggleBlackFridayMode(true);
        break;

      case 'zen':
        // Calm healthy mode
        Tone.Transport.bpm.rampTo(80, 2);
        this.setSeason('easter');
        break;
    }
    
    // Clear combo after 30 seconds
    setTimeout(() => {
      if (window.state.activeCombo === combo) {
        window.state.activeCombo = null;
        window.log(`${config.name} mode fading...`);
        document.body.classList.remove('party-mode');
      }
    }, 30000);
  },
  
  // Coupon System
  applyCoupon: function(code) {
    const coupons = {
      'BOGO': {
        name: 'Buy One Get One',
        action: 'duplicate',
        message: '🎫 BOGO ACTIVATED! All products duplicated!'
      },
      '50OFF': {
        name: '50% Off',
        action: 'halfspeed',
        message: '🎫 50% OFF! Everything at half speed...'
      },
      'FREESHIP': {
        name: 'Free Shipping',
        action: 'reverb',
        message: '🎫 FREE SHIPPING! Spacious delivery sound...'
      },
      'VIP': {
        name: 'VIP Access',
        action: 'luxury',
        message: '🎫 VIP ACCESS! Premium effects enabled!'
      }
    };
    
    const coupon = coupons[code.toUpperCase()];
    
    if (!coupon) {
      window.log("❌ Invalid coupon code!");
      this.expiredCoupon();
      return;
    }
    
    window.log(coupon.message);
    
    switch (coupon.action) {
      case 'duplicate':
        // Duplicate all current products
        const currentProducts = Object.values(window.state.products).map(p => ({
          name: p.name,
          modifiers: Object.keys(p.modifiers).join(' ')
        }));
        
        currentProducts.forEach((product, index) => {
          setTimeout(() => {
            if (window.productManager) {
              window.productManager.addProduct(product.name, product.modifiers);
            }
          }, index * 100);
        });
        break;
        
      case 'halfspeed':
        // Half speed everything
        const originalBPM = Tone.Transport.bpm.value;
        Tone.Transport.bpm.rampTo(originalBPM * 0.5, 2);

        // Lower pitch of all products
        Object.values(window.state.products).forEach(product => {
          if (product.synth && product.synth.detune) {
            product.originalDetune = product.synth.detune.value;
            product.synth.detune.rampTo(-1200, 2); // One octave down
          }
        });

        // Restore after coupon expires
        setTimeout(() => {
          Tone.Transport.bpm.rampTo(originalBPM, 2);
          Object.values(window.state.products).forEach(product => {
            if (product.synth && product.synth.detune && product.originalDetune !== undefined) {
              product.synth.detune.rampTo(product.originalDetune, 2);
            }
          });
        }, 15000);
        break;
        
      case 'reverb':
        // Add spacious reverb to all products
        const reverbEffects = [];
        Object.values(window.state.products).forEach(product => {
          if (product.synth) {
            const reverb = new Tone.Reverb({ decay: 8, wet: 0.5 }).toDestination();
            product.synth.disconnect();
            product.synth.connect(reverb);
            reverbEffects.push({ product, reverb });
          }
        });

        // Remove reverb after 20 seconds
        setTimeout(() => {
          reverbEffects.forEach(({ product, reverb }) => {
            if (product.synth && window.state.products[product.id]) {
              product.synth.disconnect();
              product.synth.toDestination();
            }
            reverb.dispose();
          });
        }, 20000);
        break;
        
      case 'luxury':
        // Make everything expensive
        Object.keys(window.state.products).forEach(id => {
          const product = window.state.products[id];
          if (!product.modifiers.expensive) {
            window.audioEngine.applyEffectModifier(
              product.filter || product.synth,
              product.name,
              'expensive',
              product.effect
            );
            product.modifiers.expensive = true;
          }
        });
        break;
    }
    
    // Coupon expires after 15 seconds
    setTimeout(() => {
      window.log(`🎫 Coupon "${coupon.name}" has expired.`);
    }, 15000);
  },
  
  expiredCoupon: function() {
    window.log("💥 EXPIRED COUPON! System glitching...");
    
    // Glitch all products
    Object.values(window.state.products).forEach(product => {
      if (product.synth) {
        // Random glitches
        const glitchInterval = setInterval(() => {
          if (!window.state.products[product.id]) {
            clearInterval(glitchInterval);
            return;
          }
          
          // Random parameter changes
          if (product.synth.volume) {
            product.synth.volume.value = -20 + Math.random() * 15;
          }
          if (product.synth.detune) {
            product.synth.detune.value = Math.random() * 200 - 100;
          }
        }, 200);
        
        // Stop glitching after 3 seconds
        setTimeout(() => {
          clearInterval(glitchInterval);
          if (product.synth.volume) {
            product.synth.volume.value = -12;
          }
          if (product.synth.detune) {
            product.synth.detune.value = 0;
          }
        }, 3000);
      }
    });
  },
  
  // Product Decay System
  startProductDecay: function() {
    if (this.decay.active || window.state.decayActive) {
      window.log("🦠 Decay already active!");
      return;
    }
    
    // Set both flags for compatibility
    this.decay.active = true;
    window.state.decayActive = true;
    window.state.preservedProducts = new Set();
    
    window.log("🦠 PRODUCT DECAY INITIATED! Products will gradually expire...");
    
    // Check story mode goals after enabling decay
    if (window.storyMode && window.storyMode.storyActive) {
      setTimeout(() => {
        window.storyMode.checkGoal();
      }, 100);
    }
    
    // Decay interval
    const interval = setInterval(() => {
      Object.entries(window.state.products).forEach(([id, product]) => {
        if (!window.state.preservedProducts.has(id)) {
          this.decayProduct(id);
        }
      });
    }, 5000);
    
    // Store interval references
    this.decay.interval = interval;
    window.state.decayInterval = interval;
  },
  
  decayProduct: function(productId) {
    const product = window.state.products[productId];
    if (!product) return;
    
    // Initialize decay level
    if (!product.decayLevel) {
      product.decayLevel = 0;
    }
    
    product.decayLevel = Math.min(1.0, product.decayLevel + 0.1);
    
    // Apply decay effects
    if (product.synth) {
      // Add noise and distortion
      const decayAmount = product.decayLevel;
      
      if (product.synth.volume) {
        product.synth.volume.value = -12 - (decayAmount * 8); // Get quieter
      }
      
      if (product.synth.detune) {
        product.synth.detune.value = (Math.random() - 0.5) * 100 * decayAmount;
      }
      
      // Visual decay indicator
      const visualizer = document.querySelector(`#synth-${productId}`);
      if (visualizer) {
        visualizer.style.opacity = 1 - (decayAmount * 0.5);
        visualizer.style.filter = `hue-rotate(${decayAmount * 90}deg) saturate(${1 - decayAmount})`;
      }
    }
    
    // Product expires completely
    if (product.decayLevel >= 1.0) {
      window.log(`💀 ${product.name} has expired!`);
      window.productManager.removeProductById(productId);
    }
  },
  
  preserveProduct: function(productName) {
    const products = Object.entries(window.state.products)
      .filter(([id, p]) => p.name === productName);
    
    if (products.length === 0) {
      window.log(`❌ No ${productName} to preserve!`);
      return;
    }
    
    products.forEach(([id, product]) => {
      window.state.preservedProducts.add(id);
      product.decayLevel = 0;
      
      // Restore normal parameters
      if (product.synth) {
        if (product.synth.volume) product.synth.volume.value = -12;
        if (product.synth.detune) product.synth.detune.value = 0;
      }
    });
    
    window.log(`🧊 ${productName} preserved! It won't decay.`);
  },
  
  spoilAll: function() {
    window.log("☠️ SPOILING ALL PRODUCTS!");
    
    Object.entries(window.state.products).forEach(([id, product]) => {
      product.decayLevel = 0.9; // Almost expired
      this.decayProduct(id);
    });
  },
  
  stopDecay: function() {
    if (!this.decay.active && !window.state.decayActive) {
      window.log("🦠 No decay to stop.");
      return;
    }
    
    // Clear both flags
    this.decay.active = false;
    window.state.decayActive = false;
    clearInterval(window.state.decayInterval);
    clearInterval(this.decay.interval);
    
    // Reset all products
    Object.values(window.state.products).forEach(product => {
      product.decayLevel = 0;
      if (product.synth) {
        if (product.synth.volume) product.synth.volume.value = -12;
        if (product.synth.detune) product.synth.detune.value = 0;
      }
    });
    
    window.log("🧼 Decay stopped. Products restored to freshness.");
  }
};