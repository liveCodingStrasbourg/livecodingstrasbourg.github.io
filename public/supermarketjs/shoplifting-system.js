// shoplifting-system.js - Theft, security, and chaos management

window.shopliftingSystem = {
  // Security configuration
  security: {
    level: 0.5, // 0-1 (0 = no security, 1 = maximum security)
    guards: 0,
    cameras: false,
    alarmActive: false,
    chaseMode: false
  },
  
  // Stolen products tracking
  stolenProducts: {},
  caughtProducts: {},
  escapedProducts: {},
  
  // Stats
  stats: {
    totalThefts: 0,
    successful: 0,
    caught: 0,
    inProgress: 0
  },
  
  // Initialize the system
  init: function() {
    console.log("Initializing shoplifting system... 🚨");
    this.createSecurityEffects();
  },
  
  // Create security-related effects
  createSecurityEffects: function() {
    // Alarm sound - will be triggered when caught
    this.alarmInterval = null;
    
    // Security scanner beep
    this.scannerBeep = new Tone.Oscillator(2000, "sine").toDestination();
    this.scannerBeep.volume.value = -20;
  },
  
  // Attempt to shoplift a product
  shopliftProduct: function(productName) {
    // Find all instances of the product
    const products = Object.entries(window.state.products)
      .filter(([id, p]) => p.name === productName && !this.stolenProducts[id]);
    
    if (products.length === 0) {
      window.log(`❌ No ${productName} available to steal (or already stealing it)!`);
      return false;
    }
    
    // Pick a random instance
    const [productId, product] = products[Math.floor(Math.random() * products.length)];
    
    // Mark as being stolen
    this.stolenProducts[productId] = {
      product: product,
      startTime: Date.now(),
      status: 'attempting'
    };
    
    this.stats.totalThefts++;
    this.stats.inProgress++;
    
    // Make the product "nervous"
    this.makeProductNervous(productId, product);
    
    // Log the attempt
    window.log(`🏃 Attempting to shoplift ${productName}... (security level: ${Math.round(this.security.level * 100)}%)`);
    
    // Determine outcome after delay
    const escapeTime = Math.random() * 15000 + 5000; // 5-20 seconds
    
    setTimeout(() => {
      this.resolveTheft(productId, product);
    }, escapeTime);
    
    return true;
  },
  
  // Make product sound nervous while being stolen
  makeProductNervous: function(productId, product) {
    if (!product.synth) return;
    
    // Add tremolo for nervousness
    const tremolo = new Tone.Tremolo({
      frequency: 8 + Math.random() * 4, // 8-12 Hz
      depth: 0.6
    }).toDestination();
    
    // Disconnect from current destination and reconnect through tremolo
    product.synth.disconnect();
    product.synth.connect(tremolo);
    
    // Store effect for cleanup
    this.stolenProducts[productId].tremolo = tremolo;
    
    // Random volume ducks (hiding)
    this.stolenProducts[productId].hideInterval = setInterval(() => {
      if (product.synth && Math.random() < 0.3) {
        const originalVolume = product.synth.volume.value;
        product.synth.volume.rampTo(-30, 0.1);
        setTimeout(() => {
          product.synth.volume.rampTo(originalVolume, 0.2);
        }, 300);
      }
    }, 1000);
    
    // Occasional pitch bends (sneaking)
    this.stolenProducts[productId].sneakInterval = setInterval(() => {
      if (product.synth && Math.random() < 0.4) {
        product.synth.detune.rampTo(Math.random() * 200 - 100, 0.3);
        setTimeout(() => {
          product.synth.detune.rampTo(0, 0.3);
        }, 500);
      }
    }, 1500);
    
    // Visual feedback
    const element = document.querySelector(`#synth-${productId}`);
    if (element) {
      element.style.animation = 'shake 0.5s infinite';
      element.style.filter = 'hue-rotate(45deg)';
    }
  },
  
  // Resolve theft attempt
  resolveTheft: function(productId, product) {
    const theftData = this.stolenProducts[productId];
    if (!theftData) return;
    
    // Calculate success chance
    const successChance = 1 - this.security.level;
    const caught = Math.random() > successChance;
    
    // Clean up nervousness effects
    this.cleanupNervousEffects(productId);
    
    if (caught) {
      // CAUGHT!
      this.handleCaughtProduct(productId, product);
    } else {
      // SUCCESS!
      this.handleEscapedProduct(productId, product);
    }
    
    // Update stats
    this.stats.inProgress--;
    delete this.stolenProducts[productId];
  },
  
  // Handle caught product
  handleCaughtProduct: function(productId, product) {
    this.stats.caught++;
    this.caughtProducts[productId] = product;
    
    // Trigger alarm
    this.triggerAlarm();
    
    // Apply "caught" effects
    if (product.synth) {
      // Add distortion (roughed up by security)
      const distortion = new Tone.Distortion(0.8).toDestination();
      product.synth.disconnect();
      product.synth.connect(distortion);
      product.synth.volume.value = -5; // Louder when caught
      
      // Store for cleanup
      product._caughtDistortion = distortion;
      
      // Add compressor (detained)
      const compressor = new Tone.Compressor(-30, 10).toDestination();
      distortion.connect(compressor);
      product._caughtCompressor = compressor;
    }
    
    // Visual feedback
    const element = document.querySelector(`#synth-${productId}`);
    if (element) {
      element.style.animation = 'pulse 0.3s infinite';
      element.style.filter = 'hue-rotate(0deg) brightness(1.5)';
      element.style.border = '2px solid #ff0000';
    }
    
    window.log(`🚨 CAUGHT! ${product.name} was detained by security! ALARM TRIGGERED!`);
    
    // "Release" from detention after 30 seconds
    setTimeout(() => {
      this.releaseFromDetention(productId, product);
    }, 30000);
  },
  
  // Handle escaped product
  handleEscapedProduct: function(productId, product) {
    this.stats.successful++;
    this.escapedProducts[productId] = product;
    
    if (product.synth) {
      // Doppler effect as product escapes
      product.synth.volume.rampTo(-60, 3);
      
      // Pitch shift up (running away)
      if (product.synth.detune) {
        product.synth.detune.rampTo(1200, 3);
      }
      
      // Pan to simulate movement
      const panner = new Tone.Panner(0).toDestination();
      product.synth.disconnect();
      product.synth.connect(panner);
      panner.pan.rampTo(1, 3);
    }
    
    // Visual feedback
    const element = document.querySelector(`#synth-${productId}`);
    if (element) {
      element.style.transition = 'all 3s';
      element.style.transform = 'translateX(200%) rotate(360deg)';
      element.style.opacity = '0';
    }
    
    window.log(`🏃💨 SUCCESS! ${product.name} ESCAPED! The security didn't notice...`);
    
    // Remove from active products after escape
    setTimeout(() => {
      if (window.productManager) {
        window.productManager.removeProductById(productId);
      }
    }, 3000);
  },
  
  // Clean up nervousness effects
  cleanupNervousEffects: function(productId) {
    const theftData = this.stolenProducts[productId];
    if (!theftData) return;
    
    // Clear intervals
    if (theftData.hideInterval) clearInterval(theftData.hideInterval);
    if (theftData.sneakInterval) clearInterval(theftData.sneakInterval);
    
    // Remove tremolo
    if (theftData.tremolo) {
      theftData.tremolo.dispose();
    }
    
    // Reset visual
    const element = document.querySelector(`#synth-${productId}`);
    if (element) {
      element.style.animation = '';
      element.style.filter = '';
    }
  },
  
  // Trigger security alarm
  triggerAlarm: function() {
    if (this.alarmActive) return;
    
    this.alarmActive = true;
    let alarmHigh = true;
    
    // Create alarm sound
    this.alarmInterval = setInterval(() => {
      this.scannerBeep.frequency.value = alarmHigh ? 800 : 600;
      this.scannerBeep.start();
      setTimeout(() => this.scannerBeep.stop(), 100);
      alarmHigh = !alarmHigh;
    }, 200);
    
    // Flash the UI
    document.body.style.animation = 'alarm-flash 0.5s 5';
    
    // Stop alarm after 5 seconds
    setTimeout(() => {
      this.stopAlarm();
    }, 5000);
  },
  
  // Stop alarm
  stopAlarm: function() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
    this.alarmActive = false;
    document.body.style.animation = '';
  },
  
  // Release product from detention
  releaseFromDetention: function(productId, product) {
    delete this.caughtProducts[productId];
    
    if (product.synth) {
      // Remove distortion and compressor
      if (product._caughtDistortion) {
        product._caughtDistortion.dispose();
        delete product._caughtDistortion;
      }
      if (product._caughtCompressor) {
        product._caughtCompressor.dispose();
        delete product._caughtCompressor;
      }
      
      // Reconnect normally but quieter (reformed)
      product.synth.disconnect();
      product.synth.toDestination();
      product.synth.volume.value = -15;
    }
    
    // Reset visual
    const element = document.querySelector(`#synth-${productId}`);
    if (element) {
      element.style.animation = '';
      element.style.filter = 'brightness(0.7)';
      element.style.border = '1px solid #666';
    }
    
    window.log(`🔓 ${product.name} has been released from security detention (but they're watching...)`);
  },
  
  // Set security level
  setSecurityLevel: function(level) {
    this.security.level = Math.max(0, Math.min(1, level));
    const percentage = Math.round(this.security.level * 100);
    window.log(`🔒 Security level set to ${percentage}%`);
    
    // Add visual indicator
    if (this.security.level > 0.7) {
      document.body.style.borderColor = '#ff0000';
    } else if (this.security.level > 0.3) {
      document.body.style.borderColor = '#ffaa00';
    } else {
      document.body.style.borderColor = '';
    }
  },
  
  // Start security chase
  startChase: function() {
    if (this.security.chaseMode) return;
    
    this.security.chaseMode = true;
    window.log(`🚔 SECURITY CHASE MODE ACTIVATED! All stolen products are being pursued!`);
    
    // Make all currently stealing products extra nervous
    Object.entries(this.stolenProducts).forEach(([id, data]) => {
      if (data.product.synth) {
        // Speed up the tremolo
        if (data.tremolo) {
          data.tremolo.frequency.value = 15;
          data.tremolo.depth.value = 0.9;
        }
        // Rapid panning
        const autoPanner = new Tone.AutoPanner(10).toDestination().start();
        data.product.synth.connect(autoPanner);
        data.autoPanner = autoPanner;
      }
    });
    
    // Add chase beat
    this.chaseLoop = new Tone.Loop((time) => {
      // Police siren effect
      const osc = new Tone.Oscillator().toDestination();
      osc.frequency.rampTo(1200, 0.1);
      osc.start(time);
      osc.frequency.rampTo(800, 0.1, time + 0.1);
      osc.stop(time + 0.2);
    }, "4n").start();
    
    // Auto-stop after 20 seconds
    setTimeout(() => this.stopChase(), 20000);
  },
  
  // Stop security chase
  stopChase: function() {
    if (!this.security.chaseMode) return;
    
    this.security.chaseMode = false;
    
    if (this.chaseLoop) {
      this.chaseLoop.stop();
      this.chaseLoop.dispose();
      this.chaseLoop = null;
    }
    
    window.log(`🚔 Security chase ended.`);
  },
  
  // Get shoplifting stats
  getStats: function() {
    return {
      ...this.stats,
      securityLevel: Math.round(this.security.level * 100) + '%',
      currentlyStealing: Object.keys(this.stolenProducts).length,
      detained: Object.keys(this.caughtProducts).length,
      escaped: Object.keys(this.escapedProducts).length
    };
  }
};