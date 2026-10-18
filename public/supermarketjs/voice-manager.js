// voice-manager.js - Pool of pre-configured synths for better performance

window.voiceManager = {
  // Pre-create voices by type
  pools: {
    bass: [],      // MembraneSynth pool for bass products
    pad: [],       // DuoSynth pool for sustained products
    lead: [],      // MonoSynth pool for melodic products
    texture: []    // NoiseSynth + Synth hybrid for percussive products
  },

  // Pool configuration
  poolSize: 4,  // 4 of each type = 16 total voices max

  // Track initialization
  initialized: false,

  // Product to voice type mapping
  typeMapping: {
    // Bass voices
    oil: 'bass',
    ham: 'bass',
    soda: 'bass',

    // Pad voices (sustained, warm)
    wine: 'pad',
    cheese: 'pad',
    bread: 'pad',
    butter: 'pad',
    pasta: 'pad',

    // Lead voices (melodic, plucky)
    beer: 'lead',
    pizza: 'lead',
    coffee: 'lead',
    milk: 'lead',
    energy_drink: 'lead',
    chocolate: 'lead',
    eggs: 'lead',

    // Texture voices (percussive, noisy)
    salad: 'texture',
    chips: 'texture',
    candy: 'texture',
    cereal: 'texture',
    rice: 'texture'
  },

  init: function() {
    if (this.initialized) {
      console.log("Voice manager already initialized");
      return;
    }

    console.log("Initializing voice manager...");

    try {
      // Pre-allocate all voices
      for (let i = 0; i < this.poolSize; i++) {
        this.pools.bass.push(this.createBassVoice());
        this.pools.pad.push(this.createPadVoice());
        this.pools.lead.push(this.createLeadVoice());
        this.pools.texture.push(this.createTextureVoice());
      }

      // Connect to processing chains if available
      if (window.processingChain && window.processingChain.initialized) {
        this.connectToChains();
      } else {
        // Connect directly to destination as fallback
        this.connectToDestination();
      }

      // Mute all initially
      this.muteAll();

      this.initialized = true;
      console.log("Voice manager initialized with", this.getTotalVoices(), "voices");
    } catch (error) {
      console.error("Error initializing voice manager:", error);
    }
  },

  connectToChains: function() {
    console.log("Connecting voice pools to processing chains...");

    this.pools.bass.forEach(v => {
      if (v && v.connect) {
        v.disconnect();
        v.connect(window.processingChain.chains.bass.input);
      }
    });

    this.pools.pad.forEach(v => {
      if (v && v.connect) {
        v.disconnect();
        v.connect(window.processingChain.chains.mid.input);
      }
    });

    this.pools.lead.forEach(v => {
      if (v && v.connect) {
        v.disconnect();
        v.connect(window.processingChain.chains.mid.input);
      }
    });

    this.pools.texture.forEach(v => {
      if (v && v.connect) {
        v.disconnect();
        v.connect(window.processingChain.chains.high.input);
      }
    });
  },

  connectToDestination: function() {
    console.log("Connecting voice pools to destination (fallback)...");

    Object.values(this.pools).flat().forEach(v => {
      if (v && v.toDestination) {
        v.toDestination();
      }
    });
  },

  muteAll: function() {
    Object.values(this.pools).flat().forEach(v => {
      if (v && v.volume) {
        v.volume.value = -Infinity;
      }
    });
  },

  // Get a voice from pool
  acquire: function(productName, productId) {
    const type = this.getVoiceType(productName);
    const pool = this.pools[type];

    if (!pool || pool.length === 0) {
      console.warn(`No pool for type: ${type}`);
      return null;
    }

    // Find unused voice
    let voice = pool.find(v => !v._inUse);

    if (voice) {
      voice._inUse = true;
      voice._productId = productId;
      voice._productName = productName;
      voice._acquiredAt = Date.now();
      voice.volume.value = -10;  // Unmute to reasonable level
      console.log(`Acquired ${type} voice for ${productName}`);
      return voice;
    }

    // No free voice - steal oldest
    voice = this.stealOldest(pool);
    if (voice) {
      voice._inUse = true;
      voice._productId = productId;
      voice._productName = productName;
      voice._acquiredAt = Date.now();
      voice.volume.value = -10;
      console.log(`Stole ${type} voice for ${productName}`);
      return voice;
    }

    return null;
  },

  // Release voice back to pool
  release: function(voice) {
    if (!voice) return;

    // Fade out and mark as unused
    voice.volume.rampTo(-Infinity, 0.3);

    setTimeout(() => {
      voice._inUse = false;
      voice._productId = null;
      voice._productName = null;
    }, 350);
  },

  // Release by product ID
  releaseById: function(productId) {
    Object.values(this.pools).flat().forEach(v => {
      if (v._productId === productId) {
        this.release(v);
      }
    });
  },

  // Steal oldest voice from pool
  stealOldest: function(pool) {
    if (!pool || pool.length === 0) return null;

    // Find the voice acquired longest ago
    let oldest = pool[0];
    pool.forEach(v => {
      if (v._acquiredAt < oldest._acquiredAt) {
        oldest = v;
      }
    });

    // Release it first
    if (oldest._productId) {
      // Notify product manager if available
      console.log(`Stealing voice from ${oldest._productName || oldest._productId}`);
    }

    return oldest;
  },

  // Get voice type for a product
  getVoiceType: function(productName) {
    return this.typeMapping[productName] || 'lead';
  },

  // Create bass voice
  createBassVoice: function() {
    const synth = new Tone.MembraneSynth({
      pitchDecay: 0.08,
      octaves: 4,
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.01,
        decay: 0.5,
        sustain: 0.1,
        release: 0.8
      }
    });
    synth._voiceType = 'bass';
    return synth;
  },

  // Create pad voice
  createPadVoice: function() {
    const synth = new Tone.DuoSynth({
      vibratoAmount: 0.2,
      vibratoRate: 2,
      harmonicity: 1.01,  // Subtle detune for warmth
      voice0: {
        oscillator: { type: "sine" },
        envelope: { attack: 0.1, decay: 0.4, sustain: 0.6, release: 1.0 }
      },
      voice1: {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.15, decay: 0.35, sustain: 0.5, release: 1.2 }
      }
    });
    synth._voiceType = 'pad';
    return synth;
  },

  // Create lead voice
  createLeadVoice: function() {
    const synth = new Tone.MonoSynth({
      oscillator: {
        type: "fatsawtooth",
        count: 2,
        spread: 15
      },
      filter: {
        type: "lowpass",
        frequency: 1200,
        Q: 1
      },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.4,
        release: 0.4,
        baseFrequency: 300,
        octaves: 2
      },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.5,
        release: 0.6
      }
    });
    synth._voiceType = 'lead';
    return synth;
  },

  // Create texture voice (noise + tone hybrid)
  createTextureVoice: function() {
    // Noise component
    const noise = new Tone.NoiseSynth({
      noise: { type: "pink" },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.02,
        release: 0.1
      }
    });

    // Tone component
    const tone = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.001,
        decay: 0.08,
        sustain: 0.1,
        release: 0.15
      }
    });

    // Filter for noise
    const noiseLPF = new Tone.Filter({
      frequency: 1000,
      type: "lowpass"
    });

    // Mixer and volume control
    const mixer = new Tone.Gain();
    const noiseGain = new Tone.Gain(0.2);
    const toneGain = new Tone.Gain(0.8);
    const volumeNode = new Tone.Volume(0); // Proper dB volume control

    noise.connect(noiseLPF);
    noiseLPF.connect(noiseGain);
    noiseGain.connect(mixer);
    tone.connect(toneGain);
    toneGain.connect(mixer);
    mixer.connect(volumeNode);

    // Create wrapper that behaves like a synth
    const wrapper = {
      _voiceType: 'texture',
      _noise: noise,
      _tone: tone,
      _mixer: mixer,
      _volumeNode: volumeNode,
      volume: volumeNode.volume, // Proper Tone.Param in dB

      triggerAttackRelease: function(note, duration, time) {
        noise.triggerAttackRelease(duration, time);
        if (note) {
          tone.triggerAttackRelease(note, duration, time);
        }
      },

      triggerAttack: function(note, time) {
        noise.triggerAttack(time);
        if (note) {
          tone.triggerAttack(note, time);
        }
      },

      triggerRelease: function(time) {
        noise.triggerRelease(time);
        tone.triggerRelease(time);
      },

      connect: function(dest) {
        volumeNode.connect(dest);
        return this;
      },

      disconnect: function() {
        volumeNode.disconnect();
        return this;
      },

      toDestination: function() {
        volumeNode.toDestination();
        return this;
      },

      dispose: function() {
        noise.dispose();
        tone.dispose();
        noiseLPF.dispose();
        noiseGain.dispose();
        volumeNode.dispose();
        toneGain.dispose();
        mixer.dispose();
      }
    };

    return wrapper;
  },

  // Get total voices in pools
  getTotalVoices: function() {
    return Object.values(this.pools).reduce((sum, pool) => sum + pool.length, 0);
  },

  // Get active voice count
  getActiveVoices: function() {
    return Object.values(this.pools).flat().filter(v => v._inUse).length;
  },

  // Get stats
  getStats: function() {
    const stats = {
      initialized: this.initialized,
      totalVoices: this.getTotalVoices(),
      activeVoices: this.getActiveVoices(),
      pools: {}
    };

    Object.keys(this.pools).forEach(type => {
      stats.pools[type] = {
        total: this.pools[type].length,
        active: this.pools[type].filter(v => v._inUse).length
      };
    });

    return stats;
  },

  // Cleanup all voices
  cleanup: function() {
    console.log("Cleaning up voice manager...");

    Object.values(this.pools).flat().forEach(voice => {
      if (voice && voice.dispose) {
        try {
          voice.disconnect();
          voice.dispose();
        } catch (e) {
          // Ignore disposal errors
        }
      }
    });

    this.pools = {
      bass: [],
      pad: [],
      lead: [],
      texture: []
    };

    this.initialized = false;
  }
};

console.log("Voice manager module loaded");
