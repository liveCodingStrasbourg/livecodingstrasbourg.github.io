// main.js - Simplified version to fix audio issues

// Global state object
window.state = {
  // Products in the system, keyed by ID
  products: {},
  
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
  masterEffects: {}
};

// Main initialization function
function initializeApplication() {
  console.log("Initializing Retail Therapy: Market Soundscape...");
  
  try {
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
    /beer|salad|ham|milk|chips|pizza|oil|wine|soda|bread|cereal|chocolate|candy|energy_drink|huitsix|rotting/gi, 
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