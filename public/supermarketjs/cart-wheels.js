// cart-wheels.js - Defines and manages shopping cart wheel sounds for rhythm section

// Cart wheel patterns - More like a drum kit with kick, snare, hi-hat patterns
const cartWheelPatterns = {
  // Square wheels - Basic beat pattern
  square: [
    { time: "0:0", note: "kick" },   // Kick on downbeat
    { time: "0:1", note: "snare" },  // Snare on upbeat
    { time: "0:2", note: "kick" },   // Kick on downbeat
    { time: "0:3", note: "snare" },  // Snare on upbeat
    { time: "0:0:2", note: "hihat" }, // Hi-hat in between
    { time: "0:1:2", note: "hihat" }, // Hi-hat in between
    { time: "0:2:2", note: "hihat" }, // Hi-hat in between
    { time: "0:3:2", note: "hihat" }  // Hi-hat in between
  ],
  
  // Broken wheels - Irregular pattern
  broken: [
    { time: "0:0", note: "kick" },
    { time: "0:1:2", note: "snare" },
    { time: "0:2:3", note: "kick" },
    { time: "0:3", note: "snare" },
    { time: "0:0:2", note: "hihat" },
    { time: "0:2:0", note: "hihat" },
    { time: "0:3:2", note: "hihat" }
  ],
  
  // Premium wheels - Tight, consistent pattern
  premium: [
    { time: "0:0", note: "kick" },
    { time: "0:1", note: "snare" },
    { time: "0:2", note: "kick" },
    { time: "0:3", note: "snare" },
    { time: "0:0:2", note: "hihat" },
    { time: "0:0:3", note: "hihat" },
    { time: "0:1:2", note: "hihat" },
    { time: "0:1:3", note: "hihat" },
    { time: "0:2:2", note: "hihat" },
    { time: "0:2:3", note: "hihat" },
    { time: "0:3:2", note: "hihat" },
    { time: "0:3:3", note: "hihat" }
  ],
  
  // Defective wheels - Glitchy pattern
  defective: [
    { time: "0:0", note: "kick" },
    { time: "0:2:2", note: "kick" },
    { time: "0:1", note: "snare" },
    { time: "0:3:2", note: "snare" },
    { time: "0:0:2", note: "hihat" },
    { time: "0:2:3", note: "hihat" }
  ],
  
  // Bargain wheels - Fast but inconsistent
  bargain: [
    { time: "0:0", note: "kick" },
    { time: "0:0:3", note: "hihat" },
    { time: "0:1", note: "snare" },
    { time: "0:1:2", note: "hihat" },
    { time: "0:2", note: "kick" },
    { time: "0:2:3", note: "hihat" },
    { time: "0:3", note: "snare" },
    { time: "0:3:2", note: "hihat" },
    { time: "0:3:3", note: "kick" }
  ],
  
  // Luxury wheels - Precise pattern with subtle variations
  luxury: [
    { time: "0:0", note: "kick" },
    { time: "0:1", note: "snare" },
    { time: "0:2", note: "kick" },
    { time: "0:3", note: "snare" },
    { time: "0:0:2", note: "hihat" },
    { time: "0:1:1", note: "hihat" },
    { time: "0:1:3", note: "hihat" },
    { time: "0:2:2", note: "hihat" },
    { time: "0:3:1", note: "hihat" },
    { time: "0:3:3", note: "hihat" }
  ],
  
  // Heavy wheels - Techno beat pattern with emphasis on kick
  heavy: [
    { time: "0:0", note: "kick" },
    { time: "0:0:2", note: "kick" },
    { time: "0:1", note: "snare" },
    { time: "0:1:2", note: "kick" },
    { time: "0:2", note: "kick" },
    { time: "0:2:2", note: "kick" },
    { time: "0:3", note: "snare" },
    { time: "0:3:2", note: "kick" },
    { time: "0:0:1", note: "hihat" },
    { time: "0:0:3", note: "hihat" },
    { time: "0:1:1", note: "hihat" },
    { time: "0:1:3", note: "hihat" },
    { time: "0:2:1", note: "hihat" },
    { time: "0:2:3", note: "hihat" },
    { time: "0:3:1", note: "hihat" },
    { time: "0:3:3", note: "hihat" }
  ],
  
  // Iron wheels - Industrial pattern with metallic sounds
  iron: [
    { time: "0:0", note: "kick" },
    { time: "0:0:3", note: "kick" },
    { time: "0:1:1", note: "snare" },
    { time: "0:2", note: "kick" },
    { time: "0:2:3", note: "kick" },
    { time: "0:3:1", note: "snare" },
    { time: "0:0:1", note: "hihat" },
    { time: "0:0:2", note: "hihat" },
    { time: "0:1:0", note: "hihat" },
    { time: "0:1:2", note: "hihat" },
    { time: "0:2:1", note: "hihat" },
    { time: "0:2:2", note: "hihat" },
    { time: "0:3:0", note: "hihat" },
    { time: "0:3:2", note: "hihat" }
  ],
  
  // Steel wheels - Hard industrial pattern with heavy kicks and accents
  steel: [
    { time: "0:0", note: "kick" },
    { time: "0:0:2", note: "kick" },
    { time: "0:1", note: "snare" },
    { time: "0:1:3", note: "kick" },
    { time: "0:2", note: "kick" },
    { time: "0:2:2", note: "snare" },
    { time: "0:3", note: "kick" },
    { time: "0:3:2", note: "snare" },
    { time: "0:0:1", note: "hihat" },
    { time: "0:0:3", note: "hihat" },
    { time: "0:1:1", note: "hihat" },
    { time: "0:1:2", note: "hihat" },
    { time: "0:2:1", note: "hihat" },
    { time: "0:2:3", note: "hihat" },
    { time: "0:3:1", note: "hihat" },
    { time: "0:3:3", note: "hihat" }
  ]
};

// Main cart wheel module functionality
window.cartWheels = {
  // Current active sequencer
  sequencer: null,
  
  // Sound generators
  kickSynth: null,
  snareSynth: null,
  hihatSynth: null,
  
  // Wheel attributes
  attributes: {
    material: null, // iron, steel, heavy or null
    type: null      // square, broken, premium, etc.
  },
  
  // Set cart wheel type
  setWheels: function(wheelType, wheelAttributes = {}) {
    // Stop and dispose of any existing sequencer
    this.cleanup();
    
    // Parse the wheel type and attributes
    const { type, attributes } = this.parseWheelInput(wheelType);
    
    // Store attributes for later reference
    this.attributes = attributes;
    
    // Update state with the primary wheel type
    window.state.cart.wheels = type;
    
    // Return early if setting to none
    if (type === "none") {
      window.log("Your cart has no wheels (silence...)");
      return;
    }
    
    try {
      // Create appropriate rhythm based on cart wheel type
      let pattern = cartWheelPatterns[type] || cartWheelPatterns.square;
      
      // If we have a material attribute, it overrides the basic pattern
      if (attributes.material && cartWheelPatterns[attributes.material]) {
        pattern = cartWheelPatterns[attributes.material];
      }
      
      // Create the drum set sounds
      this.createDrumSounds(type, attributes);
      
      // Create a sequence for the wheels
      this.sequencer = new Tone.Part((time, event) => {
        try {
          // Play the appropriate drum sound based on the note
          this.playDrumSound(event.note, time);
          
          // If we're in apocalypse mode, add random variations
          if (window.state.modes.apocalypse) {
            this.applyApocalypseEffects();
          }
        } catch (error) {
          console.error("Error in wheel sequence callback:", error);
        }
      }, pattern);
      
      // Set loop parameters
      this.sequencer.loop = true;
      this.sequencer.loopEnd = "1:0"; // Loop every measure
      
      // Start the sequence
      this.sequencer.start(0);
      
      // Generate the log message
      this.logWheelChange(type, attributes);
      
      // Start the transport if it's not already started and we have wheels
      if (Tone.Transport.state !== "started") {
        Tone.Transport.start();
      }
    } catch (error) {
      console.error("Error setting cart wheels:", error);
      window.log("There was an error with your cart wheels. Try again.");
    }
  },
  
  // Parse wheel input to extract type and attributes
  parseWheelInput: function(wheelInput) {
    // Default result
    const result = {
      type: "square",  // Default wheel type
      attributes: {
        material: null
      }
    };
    
    // If input is a simple string, it's just the wheel type
    if (typeof wheelInput === 'string') {
      result.type = wheelInput;
      return result;
    }
    
    // Check if it's "no wheels"
    if (wheelInput.toLowerCase().includes("no wheels")) {
      result.type = "none";
      return result;
    }
    
    // Parse the input to extract wheel type and attributes
    const parts = wheelInput.toLowerCase().split(" ");
    
    // Find material attributes
    const materialTypes = ['heavy', 'iron', 'steel'];
    for (const material of materialTypes) {
      if (parts.includes(material)) {
        result.attributes.material = material;
        // Remove this attribute from parts
        const index = parts.indexOf(material);
        if (index !== -1) {
          parts.splice(index, 1);
        }
      }
    }
    
    // Find wheel type (square, broken, premium, etc.)
    const wheelTypes = ["square", "broken", "premium", "defective", "bargain", "luxury"];
    for (const type of wheelTypes) {
      if (parts.includes(type)) {
        result.type = type;
        break;
      }
    }
    
    return result;
  },
  
  // Log wheel change with appropriate message
  logWheelChange: function(type, attributes) {
    let message = "";
    
    // Build a descriptive message based on wheel type and attributes
    if (attributes.material) {
      switch(attributes.material) {
        case "heavy":
          message = `Your cart now has heavy ${type} wheels (aggressive techno rhythm...)`;
          break;
        case "iron":
          message = `Your cart now has iron ${type} wheels (metallic industrial beat...)`;
          break;
        case "steel":
          message = `Your cart now has steel ${type} wheels (hard industrial rhythm...)`;
          break;
      }
    } else {
      // Standard messages for regular wheel types
      switch(type) {
        case "square":
          message = "Your cart now has square wheels (basic rhythm...)";
          break;
        case "broken":
          message = "Your cart now has broken wheels (irregular rhythm...)";
          break;
        case "premium":
          message = "Your cart now has premium wheels (tight, consistent rhythm...)";
          break;
        case "defective":
          message = "Your cart now has defective wheels (glitchy rhythm...)";
          break;
        case "bargain":
          message = "Your cart now has bargain wheels (fast but inconsistent...)";
          break;
        case "luxury":
          message = "Your cart now has luxury wheels (precise rhythm with subtle variations...)";
          break;
      }
    }
    
    // Log the message
    window.log(message);
  },
  
  // Create drum sounds based on wheel type and attributes
  createDrumSounds: function(wheelType, attributes) {
    try {
      // Create kick drum (bass drum)
      this.kickSynth = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 6,
        oscillator: { type: "sine" },
        envelope: {
          attack: 0.001,
          decay: 0.2,
          sustain: 0.01,
          release: 0.8,
          attackCurve: "exponential"
        }
      }).toDestination();
      this.kickSynth.volume.value = -8;
      
      // Create snare drum
      this.snareSynth = new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: {
          attack: 0.001,
          decay: 0.2,
          sustain: 0,
          release: 0.2
        }
      }).toDestination();
      this.snareSynth.volume.value = -12;
      
      // Add a filter to the snare to make it snappier
      this.snareFilter = new Tone.Filter({
        type: "highpass",
        frequency: 1000,
        Q: 1.5
      }).toDestination();
      this.snareSynth.disconnect();
      this.snareSynth.connect(this.snareFilter);
      
      // Create hi-hat
      this.hihatSynth = new Tone.MetalSynth({
        frequency: 200,
        envelope: {
          attack: 0.001,
          decay: 0.1,
          sustain: 0,
          release: 0.1
        },
        harmonicity: 5.1,
        modulationIndex: 40,
        resonance: 4000,
        octaves: 1.5
      }).toDestination();
      this.hihatSynth.volume.value = -20;
      
      // Apply material-specific modifications first
      if (attributes.material) {
        switch(attributes.material) {
          case "heavy":
            // Stronger kick, heavier snare, faster hihat
            this.kickSynth.volume.value = -4;
            this.kickSynth.envelope.decay = 0.3;
            this.kickSynth.envelope.sustain = 0.05;
            this.snareSynth.volume.value = -8;
            this.snareSynth.envelope.decay = 0.25;
            this.hihatSynth.volume.value = -18;
            this.hihatSynth.envelope.decay = 0.04;
            // Increase BPM for techno feel
            Tone.Transport.bpm.value = Math.min(200, Tone.Transport.bpm.value * 1.2);
            break;
            
          case "iron":
            // Metallic sounds with industrial character
            this.kickSynth.volume.value = -6;
            this.kickSynth.envelope.decay = 0.15;
            this.snareSynth.volume.value = -9;
            this.snareFilter.frequency.value = 1500;
            this.hihatSynth.volume.value = -15;
            this.hihatSynth.frequency = 300;
            this.hihatSynth.resonance = 6000;
            break;
            
          case "steel":
            // Hard industrial sound with metallic accents
            this.kickSynth.volume.value = -5;
            this.kickSynth.envelope.decay = 0.1;
            this.kickSynth.octaves = 4;
            this.snareSynth.volume.value = -8;
            this.snareSynth.envelope.decay = 0.15;
            this.hihatSynth.volume.value = -14;
            this.hihatSynth.frequency = 350;
            this.hihatSynth.resonance = 8000;
            break;
        }
      }
      
      // Then apply wheel type specific modifications
      switch(wheelType) {
        case "broken":
          // Make sounds more distorted and irregular
          this.kickSynth.envelope.decay = Math.max(0.4, this.kickSynth.envelope.decay);
          this.snareSynth.envelope.decay = Math.max(0.3, this.snareSynth.envelope.decay);
          this.hihatSynth.envelope.decay = Math.min(0.05, this.hihatSynth.envelope.decay);
          break;
          
        case "premium":
          // Make sounds cleaner and more precise
          this.kickSynth.envelope.decay = Math.min(0.1, this.kickSynth.envelope.decay);
          this.snareSynth.envelope.decay = Math.min(0.1, this.snareSynth.envelope.decay);
          this.hihatSynth.envelope.decay = Math.min(0.05, this.hihatSynth.envelope.decay);
          this.kickSynth.volume.value = Math.max(-6, this.kickSynth.volume.value);
          this.snareSynth.volume.value = Math.max(-10, this.snareSynth.volume.value);
          this.hihatSynth.volume.value = Math.max(-18, this.hihatSynth.volume.value);
          break;
          
        case "defective":
          // Make sounds more erratic
          this.kickSynth.envelope.decay = Math.max(0.3, this.kickSynth.envelope.decay);
          this.kickSynth.envelope.release = Math.max(0.5, this.kickSynth.envelope.release);
          this.snareSynth.envelope.attack = Math.max(0.01, this.snareSynth.envelope.attack);
          this.hihatSynth.envelope.decay = Math.max(0.08, this.hihatSynth.envelope.decay);
          break;
          
        case "bargain":
          // Make sounds cheaper and tinnier
          this.kickSynth.envelope.decay = Math.min(0.1, this.kickSynth.envelope.decay);
          this.snareSynth.noise.type = "pink";
          this.hihatSynth.frequency = Math.max(300, this.hihatSynth.frequency);
          break;
          
        case "luxury":
          // Make sounds fuller and richer
          this.kickSynth.envelope.decay = Math.max(0.15, this.kickSynth.envelope.decay);
          this.kickSynth.envelope.release = Math.max(1.0, this.kickSynth.envelope.release);
          this.snareSynth.envelope.decay = Math.max(0.15, this.snareSynth.envelope.decay);
          this.hihatSynth.envelope.decay = Math.max(0.07, this.hihatSynth.envelope.decay);
          this.kickSynth.volume.value = Math.max(-5, this.kickSynth.volume.value);
          this.snareSynth.volume.value = Math.max(-8, this.snareSynth.volume.value);
          this.hihatSynth.volume.value = Math.max(-15, this.hihatSynth.volume.value);
          break;
          
        case "square":
        default:
          // Default sound, no modifications
          break;
      }
      
    } catch (error) {
      console.error("Error creating drum sounds:", error);
    }
  },
  
  // Play a specific drum sound
  playDrumSound: function(note, time) {
    try {
      switch(note) {
        case "kick":
          this.kickSynth.triggerAttackRelease("C1", "8n", time);
          break;
        case "snare":
          this.snareSynth.triggerAttackRelease("8n", time);
          break;
        case "hihat":
          this.hihatSynth.triggerAttackRelease("32n", time);
          break;
        default:
          console.warn("Unknown drum sound:", note);
      }
    } catch (error) {
      console.error("Error playing drum sound:", error);
    }
  },
  
  // Apply random effects when in apocalypse mode
  applyApocalypseEffects: function() {
    // Randomly vary the volume
    if (this.kickSynth) this.kickSynth.volume.value = -8 + (Math.random() * 6 - 3);
    if (this.snareSynth) this.snareSynth.volume.value = -12 + (Math.random() * 8 - 4);
    if (this.hihatSynth) this.hihatSynth.volume.value = -20 + (Math.random() * 10 - 5);
    
    // Randomly vary decay times
    if (this.kickSynth) this.kickSynth.envelope.decay = Math.random() * 0.5;
    if (this.snareSynth) this.snareSynth.envelope.decay = Math.random() * 0.5;
    if (this.hihatSynth) this.hihatSynth.envelope.decay = Math.random() * 0.2;
  },
  
  // Clean up current audio nodes
  cleanup: function() {
    // Dispose of the sequencer
    if (this.sequencer) {
      this.sequencer.dispose();
      this.sequencer = null;
    }
    
    // Dispose of the synths
    if (this.kickSynth) {
      this.kickSynth.dispose();
      this.kickSynth = null;
    }
    
    if (this.snareFilter) {
      this.snareFilter.dispose();
      this.snareFilter = null;
    }
    
    if (this.snareSynth) {
      this.snareSynth.dispose();
      this.snareSynth = null;
    }
    
    if (this.hihatSynth) {
      this.hihatSynth.dispose();
      this.hihatSynth = null;
    }
  },
  
  // Update cart wheel parameters based on active modes
  updateEffects: function() {
    try {
      if (window.state.modes.discount) {
        // Make wheels faster but less precise
        Tone.Transport.bpm.value = Tone.Transport.bpm.value * 1.2;
        
        if (this.snareSynth) this.snareSynth.envelope.decay = 0.3;
        if (this.kickSynth) this.kickSynth.envelope.decay = 0.3;
      }
      
      if (window.state.modes.inflation) {
        // Gradually increase tempo
        Tone.Transport.bpm.rampTo(Tone.Transport.bpm.value * 1.5, 5);
      }
      
      if (window.state.modes.consumerism) {
        // Add more beats and make them louder
        this.setWheels("bargain");
        
        if (this.kickSynth) this.kickSynth.volume.value += 3;
        if (this.snareSynth) this.snareSynth.volume.value += 3;
        if (this.hihatSynth) this.hihatSynth.volume.value += 3;
      }
      
      if (window.state.modes.black_friday) {
        // Create chaotic pattern
        this.setWheels("defective");
        Tone.Transport.bpm.value = Tone.Transport.bpm.value * 2;
        
        // Make everything louder
        if (this.kickSynth) this.kickSynth.volume.value += 5;
        if (this.snareSynth) this.snareSynth.volume.value += 5;
        if (this.hihatSynth) this.hihatSynth.volume.value += 5;
      }
    } catch (error) {
      console.error("Error updating cart wheel effects:", error);
    }
  },
  
  // Reset cart wheels to normal
  resetEffects: function() {
    try {
      // Reset tempo
      Tone.Transport.bpm.value = CONFIG.audio.defaultBPM;
      
      // Reset volumes if synths exist
      if (this.kickSynth) this.kickSynth.volume.value = -8;
      if (this.snareSynth) this.snareSynth.volume.value = -12;
      if (this.hihatSynth) this.hihatSynth.volume.value = -20;
    } catch (error) {
      console.error("Error resetting cart wheel effects:", error);
    }
  }
};