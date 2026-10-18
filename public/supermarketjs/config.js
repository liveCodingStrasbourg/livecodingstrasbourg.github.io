// config.js - Configuration settings for the CONSUME Soundscape Generator

// Global configuration object
window.CONFIG = {
    // Audio settings
    audio: {
      defaultBPM: 120,
      maxProducts: 20,
      masterVolume: -6, // in dB
      fadeInTime: 0.01, // in seconds
      fadeOutTime: 0.1, // in seconds
      visualizerUpdateInterval: 100, // in milliseconds
      // Performance settings - balance between stability and responsiveness
      defaultLatencyHint: "balanced", // Good balance
      defaultLookAhead: 0.1, // 100ms lookahead - responsive
      defaultUpdateInterval: 0.05, // 50ms updates
      reducedQualityThreshold: 0.7, // Quality reduction threshold
      bufferSize: 2048, // Moderate buffer size
      workletEnabled: true // Use AudioWorklet for better performance
    },
    
    // Cart wheel types
    cartWheels: {
      types: ["square", "broken", "premium", "defective", "bargain", "luxury",
              "heavy", "iron", "steel", "chrome", "turbo", "plastic", "wobbly",
              "squeaky", "rubber", "smooth", "rusty", "vintage", "stolen", "golden", "none"],
      defaultType: "none",
    },
    
    // Special modes durations (in milliseconds)
    modes: {
      discount: {
        autoDuration: 10000,
        effectIntensity: 0.5
      },
      inflation: {
        autoDuration: 8000,
        effectIntensity: 0.7
      },
      consumerism: {
        autoDuration: 15000,
        effectIntensity: 0.8
      },
      black_friday: {
        autoDuration: 12000,
        effectIntensity: 1.0
      },
      aisle_7: {
        autoDuration: 20000,
        effectIntensity: 0.6
      },
      fluorescent_lights: {
        autoDuration: 25000,
        effectIntensity: 0.4
      },
      apocalypse: {
        autoDuration: 30000,
        effectIntensity: 1.0
      }
    },
    
    // Product parameters
    product: {
      maxModifiers: 3, // Maximum number of modifiers allowed per product
      baseVolume: -10, // Base volume for all products in dB
      defaultOctaveShift: 0, // Default octave shift for products
      maxInstances: 5, // Maximum instances of the same product allowed
    },
    
    // Visualization settings
    visualization: {
      maxBarHeight: 100, // Maximum height of visualizer bars in %
      minBarHeight: 5, // Minimum height of visualizer bars in %
      smoothingFactor: 0.3, // Smoothing factor for visualizer animations (0-1)
    },
    
    // Messages and UI effects
    ui: {
      showAds: true, // Show random advertisement messages
      adProbability: 0.15, // Probability of showing an ad when adding a product
      spookyMessageInterval: 15000, // Interval for showing spooky messages in ms
      maxBloodstains: 5, // Maximum number of bloodstains to display
      maxMoldSpots: 8, // Maximum number of mold spots to display
      maxProductSpills: 3, // Maximum number of product spills to display
    },
    
    // Keyboard shortcuts
    keyboardShortcuts: {
      runCurrentLine: { key: 'Enter', ctrl: true, shift: false },
      runAllLines: { key: 'Enter', ctrl: true, shift: true },
      toggleRandomCommand: { key: 'r', ctrl: true, shift: false },
      stopAll: { key: 'Escape', ctrl: false, shift: false },
    }
  };