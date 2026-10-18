// ui-effects.js - Handles visual effects and UI animations

// Subtle messages for random appearance
const spookyMessages = [
    "Something doesn't feel right in aisle 7...",
    "That product wasn't there a moment ago...",
    "Did you hear that scanner beep?",
    "The milk expired long ago...",
    "The checkout attendant hasn't been seen today...",
    "There's an unusual silence in the frozen section...",
    "The meat department is closed indefinitely...",
    "The scanner sounds are becoming rhythmic...",
    "There's a stain on the floor near the checkout...",
    "The store never seems to close...",
    "Every product has an expiration date...",
    "The cart wheels need maintenance...",
    "The manager's office has been vacant for weeks...",
    "The store loyalty card feels heavier today...",
    "Your receipt seems longer than usual...",
    "The shopping list keeps growing...",
    "Your membership has been flagged for review...",
    "Items shift positions when not observed...",
    "The products in your cart have changed...",
    "The store layout is different today..."
  ];
  
  // Consumerism messages for ads
  const consumerismMessages = [
    "Limited Time Offer",
    "Member Exclusive",
    "You Deserve This",
    "Special Deal Today",
    "Trending Product",
    "Top Seller",
    "Exclusive Collection",
    "Value Purchase",
    "Premium Selection",
    "Recommended For You"
  ];
  
  // Main UI effects module functionality
  window.uiEffects = {
    // Store for UI elements
    elements: {
      horrorElements: document.getElementById("horror-elements"),
      neonFlicker: document.getElementById("neon-flicker")
    },
    
    // Current flicker intensity
    flickerIntensity: 1.0,
    
    // Initialize UI effects
    init: function() {
      // Create initial subtle elements
      this.addAtmosphericElements();
      
      // Set up periodic ambient messages
      this.setupPeriodicMessages();
      
      // Start status bar updates
      this.startStatusUpdates();
    },
    
    // Add atmospheric visual elements
    addAtmosphericElements: function() {
      // Clear previous elements
      this.elements.horrorElements.innerHTML = '';
      
      // Add subtle stains
      for (let i = 0; i < CONFIG.ui.maxBloodstains; i++) {
        const stain = document.createElement("div");
        stain.className = "bloodstain";
        stain.style.width = `${20 + Math.random() * 100}px`;
        stain.style.height = `${20 + Math.random() * 100}px`;
        stain.style.top = `${Math.random() * 100}%`;
        stain.style.left = `${Math.random() * 100}%`;
        this.elements.horrorElements.appendChild(stain);
      }
      
      // Add subtle spots
      for (let i = 0; i < CONFIG.ui.maxMoldSpots; i++) {
        const mold = document.createElement("div");
        mold.className = "mold-spot";
        mold.style.width = `${10 + Math.random() * 40}px`;
        mold.style.height = `${10 + Math.random() * 40}px`;
        mold.style.top = `${Math.random() * 100}%`;
        mold.style.left = `${Math.random() * 100}%`;
        this.elements.horrorElements.appendChild(mold);
      }
      
      // Add product spills
      for (let i = 0; i < CONFIG.ui.maxProductSpills; i++) {
        const spill = document.createElement("div");
        spill.className = "product-spill";
        spill.style.width = `${50 + Math.random() * 150}px`;
        spill.style.height = `${50 + Math.random() * 150}px`;
        spill.style.top = `${Math.random() * 100}%`;
        spill.style.left = `${Math.random() * 100}%`;
        this.elements.horrorElements.appendChild(spill);
      }
    },
    
    // Set up periodic ambient messages
    setupPeriodicMessages: function() {
      // Show messages periodically
      setInterval(() => {
        if (Math.random() < 0.2) { // 20% chance each interval
          this.showRandomAmbientMessage();
        }
      }, CONFIG.ui.spookyMessageInterval);
    },
    
    // Show a random ambient message
    showRandomAmbientMessage: function() {
      if (spookyMessages.length === 0) return;
      
      const message = spookyMessages[Math.floor(Math.random() * spookyMessages.length)];
      this.showCustomAmbientMessage(message);
    },
    
    // Show a custom ambient message
    showCustomAmbientMessage: function(message) {
      // Create message element
      const messageEl = document.createElement("div");
      messageEl.className = "spooky-message";
      messageEl.textContent = message;
      messageEl.style.top = `${50 + (Math.random() * 40 - 20)}%`;
      messageEl.style.left = `${50 + (Math.random() * 40 - 20)}%`;
      document.body.appendChild(messageEl);
      
      // Remove after animation completes
      setTimeout(() => {
        messageEl.remove();
      }, 5000);
    },
    
    // Show a random marketing message
    showRandomMarketingMessage: function() {
      if (consumerismMessages.length === 0) return;
      
      // Get a random message
      const message = consumerismMessages[Math.floor(Math.random() * consumerismMessages.length)];
      
      // Create message element
      const messageEl = document.createElement("div");
      messageEl.className = "ad-message";
      messageEl.textContent = message;
      messageEl.style.top = `${30 + (Math.random() * 40)}%`;
      messageEl.style.left = `${20 + (Math.random() * 60)}%`;
      document.body.appendChild(messageEl);
      
      // Remove after animation completes
      setTimeout(() => {
        messageEl.remove();
      }, 4000);
    },
    
    // Intensify lighting effect
    intensifyFlicker: function() {
      this.flickerIntensity = 2.0;
      
      // Make neon flicker more visible
      if (this.elements.neonFlicker) {
        this.elements.neonFlicker.style.opacity = '0.3';
      }
    },
    
    // Reset lighting effect
    resetFlicker: function() {
      this.flickerIntensity = 1.0;
      
      // Reset neon flicker opacity
      if (this.elements.neonFlicker) {
        this.elements.neonFlicker.style.opacity = '0';
      }
    },
    
    // Create keyboard shortcut info display
    createShortcutTooltip: function() {
      // Create shortcut info element
      const shortcutInfo = document.createElement("div");
      shortcutInfo.className = "shortcut-info";
      shortcutInfo.innerHTML = `
        <div class="shortcut-tooltip">
          <span>⌨️ Shortcuts:</span>
          <span>Ctrl+Enter = Run line / New [slot] add</span>
          <span>Ctrl+Shift+Enter = Execute all</span>
          <span>Ctrl+R = Random command</span>
          <span>Esc = Stop all</span>
        </div>
      `;
      document.body.appendChild(shortcutInfo);
    },
    
    // Screen effect for feedback
    shakeScreen: function(intensity = 1.0) {
      document.body.style.transition = "transform 0.1s";
      document.body.style.transform = `translateX(${(Math.random() * 2 - 1) * intensity * 3}px)`;
      
      // Reset after a short time
      setTimeout(() => {
        document.body.style.transform = "translateX(0)";
      }, 100);
    },
    
    // Flash effect for success feedback
    flashSuccess: function(element) {
      if (!element) return;
      
      const originalBg = element.style.backgroundColor;
      element.style.backgroundColor = "rgba(102, 187, 106, 0.3)";
      
      // Reset after a short time
      setTimeout(() => {
        element.style.backgroundColor = originalBg;
      }, 300);
    },
    
    // Flash effect for error feedback
    flashError: function(element) {
      if (!element) return;
      
      const originalBg = element.style.backgroundColor;
      element.style.backgroundColor = "rgba(239, 83, 80, 0.3)";
      
      // Reset after a short time
      setTimeout(() => {
        element.style.backgroundColor = originalBg;
      }, 300);
    },
    
    // Create snow effect for Christmas
    createSnowEffect: function() {
      // Remove any existing snow
      document.querySelectorAll('.snow-particle').forEach(el => el.remove());
      
      // Create snow particles
      for (let i = 0; i < 50; i++) {
        setTimeout(() => {
          const snowflake = document.createElement('div');
          snowflake.className = 'snow-particle';
          snowflake.textContent = '❄';
          snowflake.style.left = Math.random() * 100 + '%';
          snowflake.style.animationDuration = (Math.random() * 10 + 10) + 's';
          snowflake.style.animationDelay = Math.random() * 10 + 's';
          snowflake.style.fontSize = (Math.random() * 10 + 10) + 'px';
          snowflake.style.opacity = Math.random() * 0.8 + 0.2;
          document.body.appendChild(snowflake);
          
          // Remove after animation completes
          setTimeout(() => {
            snowflake.remove();
          }, 20000);
        }, i * 200);
      }
    },

    // Spawn random themed elements (used for seasons like Halloween)
    spawnRandomElements: function(count, theme) {
      const themeConfigs = {
        spooky: {
          emojis: ['🎃', '👻', '🦇', '🕷️', '💀', '🕸️', '🌙', '⚰️'],
          colors: ['#ff6600', '#800080', '#000000', '#2d2d2d'],
          className: 'spooky-element'
        },
        hearts: {
          emojis: ['❤️', '💕', '💖', '💗', '💝', '💘'],
          colors: ['#ff1493', '#ff69b4', '#ff0000'],
          className: 'heart-element'
        },
        easter: {
          emojis: ['🐰', '🥚', '🌸', '🌷', '🐣', '🦋'],
          colors: ['#ffb6c1', '#98fb98', '#87ceeb', '#dda0dd'],
          className: 'easter-element'
        },
        summer: {
          emojis: ['☀️', '🌴', '🏖️', '🌊', '🍹', '🕶️'],
          colors: ['#ffd700', '#00bfff', '#ff6347'],
          className: 'summer-element'
        }
      };

      const config = themeConfigs[theme] || themeConfigs.spooky;

      // Remove existing elements of this theme
      document.querySelectorAll(`.${config.className}`).forEach(el => el.remove());

      // Spawn new elements
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const element = document.createElement('div');
          element.className = `floating-element ${config.className}`;
          element.textContent = config.emojis[Math.floor(Math.random() * config.emojis.length)];
          element.style.position = 'fixed';
          element.style.left = Math.random() * 90 + 5 + '%';
          element.style.top = Math.random() * 90 + 5 + '%';
          element.style.fontSize = (Math.random() * 20 + 20) + 'px';
          element.style.opacity = Math.random() * 0.5 + 0.3;
          element.style.pointerEvents = 'none';
          element.style.zIndex = '1000';
          element.style.animation = `float ${Math.random() * 5 + 5}s ease-in-out infinite`;
          element.style.filter = `drop-shadow(0 0 10px ${config.colors[Math.floor(Math.random() * config.colors.length)]})`;
          document.body.appendChild(element);

          // Remove after some time
          setTimeout(() => {
            element.style.opacity = '0';
            element.style.transition = 'opacity 2s';
            setTimeout(() => element.remove(), 2000);
          }, 30000 + Math.random() * 30000);
        }, i * 500);
      }
    },

    // Show temporary message
    showMessage: function(text, duration, colorClass) {
      // Check if popup messages are enabled (default to true if not set)
      if (window.popupMessagesEnabled === false) {
        return;
      }

      const message = document.createElement('div');
      message.className = `spooky-message ${colorClass || ''}`;
      message.textContent = text;
      message.style.left = '50%';
      message.style.top = '50%';
      message.style.transform = 'translate(-50%, -50%)';
      message.style.fontSize = '24px';
      message.style.fontWeight = 'bold';
      document.body.appendChild(message);

      setTimeout(() => {
        message.remove();
      }, duration || 3000);
    },
    
    // Update status bar
    updateStatusBar: function() {
      // Update BPM
      const bpmElement = document.getElementById('status-bpm');
      if (bpmElement && Tone && Tone.Transport) {
        bpmElement.textContent = Math.round(Tone.Transport.bpm.value);
      }
      
      // Update product count
      const productsElement = document.getElementById('status-products');
      if (productsElement && window.state && window.state.products) {
        productsElement.textContent = Object.keys(window.state.products).length;
      }
      
      // Update active mode
      const modeElement = document.getElementById('status-mode');
      if (modeElement && window.state && window.state.modes) {
        const activeModes = [];
        if (window.state.modes.discount) activeModes.push('Discount');
        if (window.state.modes.inflation) activeModes.push('Inflation');
        if (window.state.modes.consumerism) activeModes.push('Consumerism');
        if (window.state.modes.black_friday) activeModes.push('Black Friday');
        if (window.state.modes.apocalypse) activeModes.push('Apocalypse');
        if (window.storeFeatures && window.storeFeatures.rushHour && window.storeFeatures.rushHour.active) {
          activeModes.push('Rush Hour');
        }
        if (window.storeFeatures && window.storeFeatures.currentSeason !== 'normal') {
          activeModes.push(window.storeFeatures.currentSeason);
        }
        
        modeElement.textContent = activeModes.length > 0 ? activeModes.join(', ') : 'Normal';
      }
    },
    
    // Start status bar updates
    startStatusUpdates: function() {
      // Update immediately
      this.updateStatusBar();
      
      // Update every second
      setInterval(() => {
        this.updateStatusBar();
      }, 1000);
    }
  };