// processing-chain.js - Shared audio processing buses for better sound and performance

window.processingChain = {
  // Pre-created chains, always running
  chains: {},

  // Track if initialized
  initialized: false,

  // Product to bus routing
  routing: {
    // Bass products (low-frequency dominant)
    oil: 'bass',
    ham: 'bass',
    soda: 'bass',
    butter: 'bass',

    // Mid products (most melodic content)
    beer: 'mid',
    pizza: 'mid',
    wine: 'mid',
    cheese: 'mid',
    bread: 'mid',
    chocolate: 'mid',
    pasta: 'mid',
    eggs: 'mid',
    milk: 'mid',
    coffee: 'mid',
    energy_drink: 'mid',

    // High products (textural, percussive)
    salad: 'high',
    chips: 'high',
    candy: 'high',
    cereal: 'high',
    rice: 'high'
  },

  init: function() {
    if (this.initialized) {
      console.log("Processing chain already initialized");
      return;
    }

    console.log("Initializing processing chain...");

    try {
      // Create frequency-specific chains
      this.chains.bass = this.createBassChain();
      this.chains.mid = this.createMidChain();
      this.chains.high = this.createHighChain();
      this.chains.master = this.createMasterChain();

      // Connect bands to master
      this.chains.bass.output.connect(this.chains.master.input);
      this.chains.mid.output.connect(this.chains.master.input);
      this.chains.high.output.connect(this.chains.master.input);

      // Master to destination
      this.chains.master.output.connect(Tone.Destination);

      this.initialized = true;
      console.log("Processing chain initialized successfully");
    } catch (error) {
      console.error("Error initializing processing chain:", error);
    }
  },

  createBassChain: function() {
    const input = new Tone.Gain(1);

    // Simple compression only - saves CPU
    const comp = new Tone.Compressor({
      threshold: -18,
      ratio: 3,
      attack: 0.01,
      release: 0.15
    });

    // Output gain
    const output = new Tone.Gain(0.85);

    // Simple chain
    input.connect(comp);
    comp.connect(output);

    return { input, output, comp };
  },

  createMidChain: function() {
    const input = new Tone.Gain(1);

    // Simple compression only - no chorus (saves CPU)
    const comp = new Tone.Compressor({
      threshold: -15,
      ratio: 2.5,
      attack: 0.02,
      release: 0.2
    });

    // Output gain
    const output = new Tone.Gain(0.9);

    // Simple chain: input -> compression -> output
    input.connect(comp);
    comp.connect(output);

    return { input, output, comp };
  },

  createHighChain: function() {
    const input = new Tone.Gain(1);

    // Just a limiter to prevent harshness - minimal CPU
    const limiter = new Tone.Limiter(-10);

    // Output gain - quieter than other buses
    const output = new Tone.Gain(0.5);

    // Simple chain
    input.connect(limiter);
    limiter.connect(output);

    return { input, output, limiter };
  },

  createMasterChain: function() {
    const input = new Tone.Gain(1);

    // Just a final limiter - minimal CPU, prevents clipping
    const limiter = new Tone.Limiter(-1);

    // Final output gain
    const output = new Tone.Gain(0.85);

    // Simple chain
    input.connect(limiter);
    limiter.connect(output);

    return { input, output, limiter };
  },

  // Route a synth to appropriate chain based on product name
  route: function(synth, productName) {
    if (!this.initialized) {
      console.warn("Processing chain not initialized, routing to destination");
      synth.toDestination();
      return;
    }

    const chainName = this.routing[productName] || 'mid';
    const chain = this.chains[chainName];

    if (!chain) {
      console.warn(`Chain ${chainName} not found, routing to destination`);
      synth.toDestination();
      return;
    }

    try {
      // Disconnect from current destination
      synth.disconnect();
      // Connect to appropriate chain input
      synth.connect(chain.input);
      console.log(`Routed ${productName} to ${chainName} bus`);
    } catch (error) {
      console.error("Error routing synth:", error);
      // Fallback to destination
      synth.toDestination();
    }
  },

  // Get the chain input for direct connection
  getInput: function(productName) {
    if (!this.initialized) {
      return Tone.Destination;
    }

    const chainName = this.routing[productName] || 'mid';
    return this.chains[chainName]?.input || Tone.Destination;
  },

  // Cleanup all chains
  cleanup: function() {
    console.log("Cleaning up processing chain...");

    Object.values(this.chains).forEach(chain => {
      Object.values(chain).forEach(node => {
        if (node && node.dispose) {
          try {
            node.disconnect();
            node.dispose();
          } catch (e) {
            // Ignore disposal errors
          }
        }
      });
    });

    this.chains = {};
    this.initialized = false;
  },

  // Adjust bus levels dynamically
  setBusLevel: function(busName, level) {
    const chain = this.chains[busName];
    if (chain && chain.output) {
      chain.output.gain.rampTo(level, 0.1);
    }
  },

  // Get current stats
  getStats: function() {
    return {
      initialized: this.initialized,
      buses: Object.keys(this.chains),
      routing: this.routing
    };
  }
};

console.log("Processing chain module loaded");
