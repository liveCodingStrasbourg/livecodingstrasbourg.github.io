// main.js - Simplified version to fix audio issues

// Global state object
window.state = {
  // Synth slots [0-9], keyed by slot number string
  slots: {},

  // Pending slot changes (for beat-sync transitions)
  pendingChanges: {},

  // Backward compatibility alias (points to slots)
  get products() { return this.slots; },
  set products(val) { this.slots = val; },

  // Cart wheel state
  cart: {
    wheels: "none"
  },

  // Active special modes
  modes: {
    discount: false,
    inflation: false,
    consumerism: false,
    black_friday: false,
    aisle_7: false,
    fluorescent_lights: false,
    apocalypse: false
  },

  // Master effects
  masterEffects: {},

  // Slot constants
  MAX_SLOTS: 10,
  VALID_SLOTS: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
};

// Main initialization function
function initializeApplication() {
  console.log("Initializing Retail Therapy: Market Soundscape...");

  try {
    // Initialize processing chain FIRST (frequency buses)
    if (window.processingChain && typeof window.processingChain.init === 'function') {
      window.processingChain.init();
    } else {
      console.warn("Processing chain not available - init skipped");
    }

    // Initialize voice manager (synth pools)
    if (window.voiceManager && typeof window.voiceManager.init === 'function') {
      window.voiceManager.init();
    } else {
      console.warn("Voice manager not available - init skipped");
    }

    // Initialize performance manager
    if (window.performanceManager && typeof window.performanceManager.init === 'function') {
      window.performanceManager.init();
    } else {
      console.warn("Performance manager not available - init skipped");
    }

    // Set up global audio effects
    if (window.audioEngine && typeof window.audioEngine.setupGlobalEffects === 'function') {
      window.audioEngine.setupGlobalEffects();
    } else {
      console.warn("Audio engine not available - setupGlobalEffects skipped");
    }
    
    // Initialize UI components
    if (window.uiHandlers && typeof window.uiHandlers.init === 'function') {
      window.uiHandlers.init();
    } else {
      console.warn("UI handlers not available - init skipped");
    }
    
    // Initialize visualization
    if (window.visualization && typeof window.visualization.init === 'function') {
      window.visualization.init();
    } else {
      console.warn("Visualization not available - init skipped");
    }
    
    // Initialize UI effects
    if (window.uiEffects && typeof window.uiEffects.init === 'function') {
      window.uiEffects.init();
    } else {
      console.warn("UI effects not available - init skipped");
    }
    
    // Initialize shoplifting system
    if (window.shopliftingSystem && typeof window.shopliftingSystem.init === 'function') {
      window.shopliftingSystem.init();
    } else {
      console.warn("Shoplifting system not available - init skipped");
    }
    
    // Initialize story mode
    if (window.storyMode && typeof window.storyMode.init === 'function') {
      window.storyMode.init();
    } else {
      console.warn("Story mode not available - init skipped");
    }
    
    // Initialize settings manager
    if (window.settingsManager && typeof window.settingsManager.init === 'function') {
      window.settingsManager.init();
    } else {
      console.warn("Settings manager not available - init skipped");
    }
    
    // Initialize store layout
    if (window.storeLayout && typeof window.storeLayout.init === 'function') {
      window.storeLayout.init();
    } else {
      console.warn("Store layout not available - init skipped");
    }

    // Initialize autocomplete
    if (window.autocomplete && typeof window.autocomplete.init === 'function') {
      window.autocomplete.init();
    } else {
      console.warn("Autocomplete not available - init skipped");
    }

    console.log("Application initialization complete.");
  } catch (error) {
    console.error("Error during application initialization:", error);
  }
}

// Helper function for logging to output
window.log = function(message) {
  const time = new Date().toLocaleTimeString();
  
  // Format product names with highlighting
  const formattedMessage = message.replace(
    /beer|salad|ham|milk|chips|pizza|oil|wine|cheese|soda|bread|cereal|chocolate|candy|energy_drink|coffee|butter|eggs|pasta|rice|huitsix|rotting/gi,
    match => `<span class="product">${match}</span>`
  );
  
  // Get output element
  const outputEl = document.getElementById("output");
  if (outputEl) {
    // Add the message
    outputEl.innerHTML += `[${time}] ${formattedMessage}<br>`;
    
    // Scroll to bottom
    outputEl.scrollTop = outputEl.scrollHeight;
  } else {
    // Fallback to console
    console.log(message);
  }
};

// Expose initialization function globally
window.initializeApplication = initializeApplication;