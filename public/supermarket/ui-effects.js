// ui-effects.js - Handles visual effects and UI animations

// Spooky messages for random appearance
const spookyMessages = [
    "The expired products are watching you...",
    "Something is crawling in aisle 7...",
    "Did that can just move on its own?",
    "The milk spoiled decades ago...",
    "The checkout attendant has been missing since 1983...",
    "Price check on a soul... price check...",
    "The meat doesn't come from animals...",
    "Listen closely to the scanner beeps... they're saying something...",
    "That's not ketchup on the floor...",
    "The store never closes. The store never opened.",
    "Every product has an expiration date. Even you.",
    "The cart wheels squeak in harmony with the screams.",
    "The store manager will see you... soon.",
    "Buy more to fill the void inside...",
    "Your receipt is longer than your life expectancy...",
    "Retail therapy won't cure what you have...",
    "The rewards program costs more than points...",
    "Your loyalty card has been rejected...",
    "Products vanish when you're not looking...",
    "Items in your cart may be closer than they appear..."
  ];
  
  // Consumerism messages for ads
  const consumerismMessages = [
    "CONSUME MORE",
    "YOU NEED THIS",
    "BUY BUY BUY",
    "DON'T THINK, JUST BUY",
    "FULFILLMENT THROUGH PURCHASE",
    "HAPPINESS = CONSUMPTION",
    "MORE IS BETTER",
    "EMPTY INSIDE? FILL WITH PRODUCTS",
    "YOUR WORTH IS WHAT YOU OWN",
    "SHOP UNTIL THE PAIN STOPS"
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
      // Create initial horror elements
      this.addHorrorElements();
      
      // Set up periodic spooky messages
      this.setupPeriodicMessages();
    },
    
    // Add horror visual elements (blood stains, mold, etc.)
    addHorrorElements: function() {
      // Clear previous elements
      this.elements.horrorElements.innerHTML = '';
      
      // Add blood stains
      for (let i = 0; i < CONFIG.ui.maxBloodstains; i++) {
        const stain = document.createElement("div");
        stain.className = "bloodstain";
        stain.style.width = `${20 + Math.random() * 100}px`;
        stain.style.height = `${20 + Math.random() * 100}px`;
        stain.style.top = `${Math.random() * 100}%`;
        stain.style.left = `${Math.random() * 100}%`;
        this.elements.horrorElements.appendChild(stain);
      }
      
      // Add mold spots
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
    
    // Set up periodic spooky messages
    setupPeriodicMessages: function() {
      // Show messages periodically
      setInterval(() => {
        if (Math.random() < 0.2) { // 20% chance each interval
          this.showRandomSpookyMessage();
        }
      }, CONFIG.ui.spookyMessageInterval);
    },
    
    // Show a random spooky message
    showRandomSpookyMessage: function() {
      if (spookyMessages.length === 0) return;
      
      const message = spookyMessages[Math.floor(Math.random() * spookyMessages.length)];
      this.showCustomSpookyMessage(message);
    },
    
    // Show a custom spooky message
    showCustomSpookyMessage: function(message) {
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
    
    // Show a random consumerism message
    showRandomConsumerismMessage: function() {
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
    
    // Intensify flickering effect
    intensifyFlicker: function() {
      this.flickerIntensity = 3.0;
      
      // Increase animation speed of all flicker animations
      document.documentElement.style.setProperty('--flicker-speed', '0.5s');
      
      // Add flicker class to more elements
      document.querySelectorAll('.neon-title, .synth-item, .neon-button').forEach(el => {
        el.classList.add('flicker-fast');
      });
      
      // Make neon flicker more visible
      if (this.elements.neonFlicker) {
        this.elements.neonFlicker.style.opacity = '0.3';
      }
    },
    
    // Reset flickering effect
    resetFlicker: function() {
      this.flickerIntensity = 1.0;
      
      // Reset animation speed
      document.documentElement.style.setProperty('--flicker-speed', '8s');
      
      // Remove flicker class from elements
      document.querySelectorAll('.flicker-fast').forEach(el => {
        el.classList.remove('flicker-fast');
      });
      
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
          <span>Ctrl+Enter = Execute current line</span>
          <span>Ctrl+Shift+Enter = Execute all</span>
          <span>Ctrl+R = Random command</span>
          <span>Esc = Stop all</span>
        </div>
      `;
      document.body.appendChild(shortcutInfo);
    },
    
    // Shake effect for the screen
    shakeScreen: function(intensity = 1.0) {
      document.body.classList.add('shake-effect');
      
      // Adjust the intensity based on parameter
      document.documentElement.style.setProperty('--shake-intensity', `${intensity * 5}px`);
      
      // Remove after a short time
      setTimeout(() => {
        document.body.classList.remove('shake-effect');
      }, 500);
    },
    
    // Flash effect for success feedback
    flashSuccess: function(element) {
      if (!element) return;
      
      // Add success flash class
      element.classList.add('success-flash');
      
      // Remove after animation completes
      setTimeout(() => {
        element.classList.remove('success-flash');
      }, 500);
    },
    
    // Flash effect for error feedback
    flashError: function(element) {
      if (!element) return;
      
      // Add error flash class
      element.classList.add('error-flash');
      
      // Remove after animation completes
      setTimeout(() => {
        element.classList.remove('error-flash');
      }, 500);
    },
    
    // Add dynamic blood drips
    addBloodDrip: function() {
      // Create blood drip element
      const drip = document.createElement("div");
      drip.className = "blood-drip";
      drip.style.left = `${Math.random() * 100}%`;
      document.body.appendChild(drip);
      
      // Remove after animation completes
      setTimeout(() => {
        drip.remove();
      }, 3000);
    }
  };