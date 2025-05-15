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
  
  // Set cart wheel type
  setWheels: function(wheelType) {
    // Stop and dispose of any existing sequencer
    this.cleanup();
    
    // Update state
    window.state.cart.wheels = wheelType;
    
    // Return early if setting to none
    if (wheelType === "none") {
      window.log("Your cart has no wheels (silence...)");
      return;
    }
    
    try {
      // Create appropriate rhythm based on cart wheel type
      let pattern = cartWheelPatterns[wheelType] || cartWheelPatterns.square;
      
      // Create the drum set sounds
      this.createDrumSounds(wheelType);
      
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
      
      // Log the change to the user
      if (wheelType === "square") {
        window.log("Your cart now has square wheels (basic rhythm...)");
      } else if (wheelType === "broken") {
        window.log("Your cart now has broken wheels (irregular rhythm...)");
      } else if (wheelType === "premium") {
        window.log("Your cart now has premium wheels (tight, consistent rhythm...)");
      } else if (wheelType === "defective") {
        window.log("Your cart now has defective wheels (glitchy rhythm...)");
      } else if (wheelType === "bargain") {
        window.log("Your cart now has bargain wheels (fast but inconsistent...)");
      } else if (wheelType === "luxury") {
        window.log("Your cart now has luxury wheels (precise rhythm with subtle variations...)");
      }
      
      // Start the transport if it's not already started and we have wheels
      if (Tone.Transport.state !== "started") {
        Tone.Transport.start();
      }
    } catch (error) {
      console.error("Error setting cart wheels:", error);
      window.log("There was an error with your cart wheels. Try again.");
    }
  },
  
  // Create drum sounds based on wheel type
  createDrumSounds: function(wheelType) {
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
      
      // Modify sounds based on wheel type
      switch(wheelType) {
        case "broken":
          // Make sounds more distorted and irregular
          this.kickSynth.envelope.decay = 0.4;
          this.snareSynth.envelope.decay = 0.3;
          this.hihatSynth.envelope.decay = 0.05;
          break;
          
        case "premium":
          // Make sounds cleaner and more precise
          this.kickSynth.envelope.decay = 0.1;
          this.snareSynth.envelope.decay = 0.1;
          this.hihatSynth.envelope.decay = 0.05;
          this.kickSynth.volume.value = -6;
          this.snareSynth.volume.value = -10;
          this.hihatSynth.volume.value = -18;
          break;
          
        case "defective":
          // Make sounds more erratic
          this.kickSynth.envelope.decay = 0.3;
          this.kickSynth.envelope.release = 0.5;
          this.snareSynth.envelope.attack = 0.01;
          this.hihatSynth.envelope.decay = 0.08;
          break;
          
        case "bargain":
          // Make sounds cheaper and tinnier
          this.kickSynth.envelope.decay = 0.1;
          this.snareSynth.noise.type = "pink";
          this.hihatSynth.frequency = 300;
          break;
          
        case "luxury":
          // Make sounds fuller and richer
          this.kickSynth.envelope.decay = 0.15;
          this.kickSynth.envelope.release = 1.0;
          this.snareSynth.envelope.decay = 0.15;
          this.hihatSynth.envelope.decay = 0.07;
          this.kickSynth.volume.value = -5;
          this.snareSynth.volume.value = -8;
          this.hihatSynth.volume.value = -15;
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