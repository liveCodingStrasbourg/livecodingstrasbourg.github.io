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
  ],
  
  // Chrome wheels - Crisp digital pattern with metallic hi-hats
  chrome: [
    { time: "0:0", note: "kick" },
    { time: "0:1", note: "snare" },
    { time: "0:2", note: "kick" },
    { time: "0:3", note: "snare" },
    { time: "0:0:1", note: "hihat" },
    { time: "0:0:2", note: "hihat" },
    { time: "0:0:3", note: "hihat" },
    { time: "0:1:1", note: "hihat" },
    { time: "0:1:2", note: "hihat" },
    { time: "0:1:3", note: "hihat" },
    { time: "0:2:1", note: "hihat" },
    { time: "0:2:2", note: "hihat" },
    { time: "0:2:3", note: "hihat" },
    { time: "0:3:1", note: "hihat" },
    { time: "0:3:2", note: "hihat" },
    { time: "0:3:3", note: "hihat" }
  ],
  
  // Turbo wheels - Fast breakbeat/drum'n'bass pattern
  turbo: [
    { time: "0:0", note: "kick" },
    { time: "0:0:3", note: "kick" },
    { time: "0:1", note: "snare" },
    { time: "0:1:2", note: "kick" },
    { time: "0:2:2", note: "snare" },
    { time: "0:3", note: "kick" },
    { time: "0:3:2", note: "snare" },
    { time: "0:0:1", note: "hihat" },
    { time: "0:0:2", note: "hihat" },
    { time: "0:1:1", note: "hihat" },
    { time: "0:1:3", note: "hihat" },
    { time: "0:2:0", note: "hihat" },
    { time: "0:2:1", note: "hihat" },
    { time: "0:2:3", note: "hihat" },
    { time: "0:3:1", note: "hihat" },
    { time: "0:3:3", note: "hihat" }
  ],
  
  // Plastic wheels - Synthetic, artificial drum pattern
  plastic: [
    { time: "0:0", note: "kick" },
    { time: "0:0:2", note: "kick" },
    { time: "0:1:1", note: "snare" },
    { time: "0:2", note: "kick" },
    { time: "0:2:2", note: "kick" },
    { time: "0:3:1", note: "snare" },
    { time: "0:0:1", note: "hihat" },
    { time: "0:0:3", note: "hihat" },
    { time: "0:1:2", note: "hihat" },
    { time: "0:2:1", note: "hihat" },
    { time: "0:2:3", note: "hihat" },
    { time: "0:3:2", note: "hihat" }
  ],
  
  // Wobbly wheels - Dubstep-like pattern with swing
  wobbly: [
    { time: "0:0", note: "kick" },
    { time: "0:1:2", note: "snare" },
    { time: "0:2:1", note: "kick" },
    { time: "0:3:2", note: "snare" },
    { time: "0:0:3", note: "hihat" },
    { time: "0:1:1", note: "hihat" },
    { time: "0:1:3", note: "hihat" },
    { time: "0:2:2", note: "hihat" },
    { time: "0:3:0", note: "hihat" },
    { time: "0:3:3", note: "hihat" }
  ],
  
  // Squeaky wheels - Hi-hat focused pattern with shuffle
  squeaky: [
    { time: "0:0", note: "kick" },
    { time: "0:1", note: "snare" },
    { time: "0:2", note: "kick" },
    { time: "0:3", note: "snare" },
    { time: "0:0:1", note: "hihat" },
    { time: "0:0:2", note: "hihat" },
    { time: "0:0:3", note: "hihat" },
    { time: "0:0:3.5", note: "hihat" },
    { time: "0:1:1", note: "hihat" },
    { time: "0:1:2", note: "hihat" },
    { time: "0:1:3", note: "hihat" },
    { time: "0:1:3.5", note: "hihat" },
    { time: "0:2:1", note: "hihat" },
    { time: "0:2:2", note: "hihat" },
    { time: "0:2:3", note: "hihat" },
    { time: "0:2:3.5", note: "hihat" },
    { time: "0:3:1", note: "hihat" },
    { time: "0:3:2", note: "hihat" },
    { time: "0:3:3", note: "hihat" },
    { time: "0:3:3.5", note: "hihat" }
  ],
  
  // Rubber wheels - Bouncy funk rhythm
  rubber: [
    { time: "0:0", note: "kick" },
    { time: "0:0:3", note: "kick" },
    { time: "0:1", note: "snare" },
    { time: "0:1:3", note: "kick" },
    { time: "0:2", note: "kick" },
    { time: "0:2:2", note: "kick" },
    { time: "0:3", note: "snare" },
    { time: "0:3:3", note: "kick" },
    { time: "0:0:2", note: "hihat" },
    { time: "0:1:1", note: "hihat" },
    { time: "0:1:2", note: "hihat" },
    { time: "0:2:1", note: "hihat" },
    { time: "0:2:3", note: "hihat" },
    { time: "0:3:1", note: "hihat" },
    { time: "0:3:2", note: "hihat" }
  ],
  
  // Smooth wheels - Liquid drum'n'bass flow
  smooth: [
    { time: "0:0", note: "kick" },
    { time: "0:0:2.5", note: "kick" },
    { time: "0:1", note: "snare" },
    { time: "0:2:1", note: "kick" },
    { time: "0:2:3", note: "kick" },
    { time: "0:3", note: "snare" },
    { time: "0:0:1", note: "hihat" },
    { time: "0:0:2", note: "hihat" },
    { time: "0:0:3", note: "hihat" },
    { time: "0:1:0.5", note: "hihat" },
    { time: "0:1:1", note: "hihat" },
    { time: "0:1:2", note: "hihat" },
    { time: "0:1:3", note: "hihat" },
    { time: "0:2:0.5", note: "hihat" },
    { time: "0:2:1", note: "hihat" },
    { time: "0:2:2", note: "hihat" },
    { time: "0:2:3", note: "hihat" },
    { time: "0:3:0.5", note: "hihat" },
    { time: "0:3:1", note: "hihat" },
    { time: "0:3:2", note: "hihat" },
    { time: "0:3:3", note: "hihat" }
  ],
  
  // Rusty wheels - Industrial pattern with metallic percussion
  rusty: [
    { time: "0:0", note: "kick" },
    { time: "0:0:3", note: "snare" },
    { time: "0:1:1", note: "kick" },
    { time: "0:1:2", note: "snare" },
    { time: "0:2", note: "kick" },
    { time: "0:2:3", note: "snare" },
    { time: "0:3:1", note: "kick" },
    { time: "0:3:2", note: "snare" },
    { time: "0:0:1", note: "hihat" },
    { time: "0:0:2", note: "hihat" },
    { time: "0:1:0", note: "hihat" },
    { time: "0:1:3", note: "hihat" },
    { time: "0:2:1", note: "hihat" },
    { time: "0:2:2", note: "hihat" },
    { time: "0:3:0", note: "hihat" },
    { time: "0:3:3", note: "hihat" }
  ],
  
  // Vintage wheels - Classic 808/909 pattern
  vintage: [
    { time: "0:0", note: "kick" },
    { time: "0:0:2", note: "kick" },
    { time: "0:1", note: "snare" },
    { time: "0:2", note: "kick" },
    { time: "0:2:3", note: "kick" },
    { time: "0:3", note: "snare" },
    { time: "0:0:2", note: "hihat" },
    { time: "0:1:2", note: "hihat" },
    { time: "0:2:2", note: "hihat" },
    { time: "0:3:2", note: "hihat" }
  ],
  
  // Stolen wheels - Erratic, constantly changing pattern
  stolen: [
    { time: "0:0", note: "kick" },
    { time: "0:0:1.5", note: "kick" },
    { time: "0:1:0.5", note: "snare" },
    { time: "0:1:3", note: "kick" },
    { time: "0:2:0.5", note: "kick" },
    { time: "0:2:2.5", note: "snare" },
    { time: "0:3:1", note: "kick" },
    { time: "0:3:3.5", note: "snare" },
    { time: "0:0:0.5", note: "hihat" },
    { time: "0:0:3", note: "hihat" },
    { time: "0:1:1.5", note: "hihat" },
    { time: "0:2:1", note: "hihat" },
    { time: "0:2:3.5", note: "hihat" },
    { time: "0:3:0.5", note: "hihat" },
    { time: "0:3:2.5", note: "hihat" }
  ],
  
  // Golden wheels - Luxurious trap-style hi-hats
  golden: [
    { time: "0:0", note: "kick" },
    { time: "0:0:3", note: "kick" },
    { time: "0:1", note: "snare" },
    { time: "0:2", note: "kick" },
    { time: "0:2:2", note: "kick" },
    { time: "0:3", note: "snare" },
    { time: "0:0:1", note: "hihat" },
    { time: "0:0:1.5", note: "hihat" },
    { time: "0:0:2", note: "hihat" },
    { time: "0:0:2.5", note: "hihat" },
    { time: "0:0:3", note: "hihat" },
    { time: "0:0:3.5", note: "hihat" },
    { time: "0:1:1", note: "hihat" },
    { time: "0:1:1.5", note: "hihat" },
    { time: "0:1:2", note: "hihat" },
    { time: "0:1:2.5", note: "hihat" },
    { time: "0:1:3", note: "hihat" },
    { time: "0:1:3.5", note: "hihat" },
    { time: "0:2:1", note: "hihat" },
    { time: "0:2:1.5", note: "hihat" },
    { time: "0:2:2", note: "hihat" },
    { time: "0:2:2.5", note: "hihat" },
    { time: "0:2:3", note: "hihat" },
    { time: "0:2:3.5", note: "hihat" },
    { time: "0:3:1", note: "hihat" },
    { time: "0:3:1.5", note: "hihat" },
    { time: "0:3:2", note: "hihat" },
    { time: "0:3:2.5", note: "hihat" },
    { time: "0:3:3", note: "hihat" },
    { time: "0:3:3.5", note: "hihat" }
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
  
  // Current pattern
  currentPattern: null,
  
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

    // Track for story mode
    if (window.storyMode && window.storyMode.tracking && type !== "none") {
      window.storyMode.tracking.wheelTypesUsed.add(type);
    }

    // Debug log
    console.log("Setting cart wheels to:", type, "with attributes:", attributes);
    
    // Return early if setting to none
    if (type === "none") {
      window.log("Your cart has no wheels (silence...)");
      // Hide the pattern display
      const patternDiv = document.getElementById('wheel-pattern');
      if (patternDiv) {
        patternDiv.style.display = 'none';
      }
      // Update cart visualizer
      if (window.updateCartVisualizer) {
        window.updateCartVisualizer('none');
      }
      return;
    }
    
    try {
      // Create appropriate rhythm based on cart wheel type
      let pattern = cartWheelPatterns[type] || cartWheelPatterns.square;
      this.currentPattern = pattern;
      
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

      // Update cart visualizer
      if (window.updateCartVisualizer) {
        window.updateCartVisualizer(type);
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
  
  // Parse wheel input to extract type and attributes
  parseWheelInput: function(wheelInput) {
    // Default result
    const result = {
      type: "square",  // Default wheel type
      attributes: {
        material: null
      }
    };
    
    // Convert to string and check if it's "no wheels"
    const inputStr = String(wheelInput).toLowerCase();
    if (inputStr.includes("no wheels")) {
      result.type = "none";
      return result;
    }
    
    // Parse the input to extract wheel type and attributes
    const parts = inputStr.split(" ");

    // Find wheel type (square, broken, premium, etc.)
    // Note: heavy, iron, steel are treated as wheel types that have their own patterns
    const wheelTypes = ["square", "broken", "premium", "defective", "bargain", "luxury", 
                       "heavy", "iron", "steel", "chrome", "turbo", "plastic", "wobbly", 
                       "squeaky", "rubber", "smooth", "rusty", "vintage", "stolen", "golden"];
    for (const type of wheelTypes) {
      if (parts.includes(type)) {
        result.type = type;
        break;
      }
    }
    
    return result;
  },
  
  // Convert pattern to visual sequencer format
  patternToSequencer: function(pattern) {
    // Create a 16-step grid for one measure
    const grid = {
      kick: Array(16).fill('-'),
      snare: Array(16).fill('-'),
      hihat: Array(16).fill('-')
    };
    
    // Map Tone.js time notation to grid positions
    pattern.forEach(event => {
      const timeParts = event.time.split(':');
      const bar = parseInt(timeParts[0]);
      const beat = parseInt(timeParts[1]);
      const subdivision = parseFloat(timeParts[2] || 0);
      
      // Calculate position in 16-step grid (4 beats * 4 subdivisions)
      let position = beat * 4;
      if (subdivision >= 3.5) position += 3.5;
      else if (subdivision >= 3) position += 3;
      else if (subdivision >= 2.5) position += 2.5;
      else if (subdivision >= 2) position += 2;
      else if (subdivision >= 1.5) position += 1.5;
      else if (subdivision >= 1) position += 1;
      else if (subdivision >= 0.5) position += 0.5;
      
      position = Math.round(position);
      if (position >= 0 && position < 16) {
        grid[event.note][position] = 'x';
      }
    });
    
    // Format as visual string
    const kickPattern = 'K: ' + grid.kick.join('');
    const snarePattern = 'S: ' + grid.snare.join('');
    const hihatPattern = 'H: ' + grid.hihat.join('');
    
    return `[${kickPattern} | ${snarePattern} | ${hihatPattern}]`;
  },
  
  // Log wheel change with appropriate message
  logWheelChange: function(type, attributes) {
    let message = "";
    
    // Build a descriptive message based on wheel type
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
        case "heavy":
          message = "Your cart now has heavy wheels (aggressive techno rhythm...)";
          break;
        case "iron":
          message = "Your cart now has iron wheels (metallic industrial beat...)";
          break;
        case "steel":
          message = "Your cart now has steel wheels (hard industrial rhythm...)";
          break;
        case "chrome":
          message = "Your cart now has chrome wheels (crisp digital beats with metallic shine...)";
          break;
        case "turbo":
          message = "Your cart now has turbo wheels (fast breakbeat rhythm, hold on tight...)";
          break;
        case "plastic":
          message = "Your cart now has plastic wheels (synthetic artificial beats...)";
          break;
        case "wobbly":
          message = "Your cart now has wobbly wheels (dubstep wobble bass rhythm...)";
          break;
        case "squeaky":
          message = "Your cart now has squeaky wheels (hi-hat heavy shuffle rhythm...)";
          break;
        case "rubber":
          message = "Your cart now has rubber wheels (bouncy funk rhythm...)";
          break;
        case "smooth":
          message = "Your cart now has smooth wheels (liquid drum'n'bass flow...)";
          break;
        case "rusty":
          message = "Your cart now has rusty wheels (industrial metallic percussion...)";
          break;
        case "vintage":
          message = "Your cart now has vintage wheels (classic 808/909 pattern...)";
          break;
        case "stolen":
          message = "Your cart now has stolen wheels (erratic unpredictable rhythm...)";
          break;
        case "golden":
          message = "Your cart now has golden wheels (luxurious trap-style hi-hats...)";
          break;
    }
    
    // Add pattern visualization
    const pattern = cartWheelPatterns[type];
    if (pattern) {
      const sequencerView = this.patternToSequencer(pattern);
      message += `<br><span style="font-family: monospace; font-size: 0.9em; color: #00ff00;">${sequencerView}</span>`;
    }
    
    // Log the message
    window.log(message);
    
    // Update the wheel pattern display
    const patternDiv = document.getElementById('wheel-pattern');
    if (patternDiv && pattern) {
      const sequencerView = this.patternToSequencer(pattern);
      patternDiv.innerHTML = `<strong>Current Rhythm Pattern:</strong><br>${sequencerView}`;
      patternDiv.style.display = 'block';
    }
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
      
      // Determine hi-hat frequency based on wheel type
      let hihatFrequency = 200; // default
      switch(wheelType) {
        case "bargain":
        case "iron":
        case "golden":
          hihatFrequency = 300;
          break;
        case "steel":
          hihatFrequency = 350;
          break;
        case "chrome":
          hihatFrequency = 400;
          break;
        case "plastic":
          hihatFrequency = 500;
          break;
        case "squeaky":
          hihatFrequency = 600;
          break;
        case "rusty":
          hihatFrequency = 800;
          break;
        case "vintage":
          hihatFrequency = 200;
          break;
      }
      
      // Create hi-hat with appropriate frequency
      this.hihatSynth = new Tone.MetalSynth({
        frequency: hihatFrequency,
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
      
      // Apply wheel type specific modifications
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
          // this.hihatSynth.frequency = Math.max(300, this.hihatSynth.frequency);
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
          // MetalSynth frequency is set during creation, not modifiable
          // this.hihatSynth.frequency = 300;
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
          // this.hihatSynth.frequency = 350;
          this.hihatSynth.resonance = 8000;
          break;
          
        case "chrome":
          // Crisp, metallic sounds with bright hi-hats
          this.kickSynth.envelope.decay = 0.08;
          this.kickSynth.envelope.sustain = 0;
          this.snareSynth.envelope.decay = 0.08;
          this.snareSynth.envelope.attack = 0.0001;
          this.hihatSynth.envelope.decay = 0.03;
          // this.hihatSynth.frequency = 400;
          this.hihatSynth.resonance = 10000;
          this.hihatSynth.volume.value = -16;
          break;
          
        case "turbo":
          // Fast breakbeat style
          this.kickSynth.envelope.decay = 0.12;
          this.kickSynth.pitchDecay = 0.03;
          this.snareSynth.envelope.decay = 0.15;
          this.snareFilter.frequency.value = 2000;
          this.hihatSynth.envelope.decay = 0.05;
          this.hihatSynth.volume.value = -17;
          // Increase tempo for breakbeat feel
          Tone.Transport.bpm.value = Math.min(180, Tone.Transport.bpm.value * 1.4);
          break;
          
        case "plastic":
          // Synthetic, artificial sounds
          this.kickSynth.oscillator.type = "square";
          this.kickSynth.envelope.decay = 0.05;
          this.snareSynth.noise.type = "pink";
          this.snareSynth.envelope.decay = 0.05;
          // this.hihatSynth.frequency = 500;
          this.hihatSynth.harmonicity = 8;
          this.hihatSynth.envelope.decay = 0.02;
          break;
          
        case "wobbly":
          // Dubstep-like wobble
          this.kickSynth.envelope.decay = 0.5;
          this.kickSynth.envelope.sustain = 0.1;
          this.kickSynth.octaves = 8;
          this.snareSynth.envelope.decay = 0.3;
          this.hihatSynth.envelope.decay = 0.1;
          // Slower tempo for dubstep
          Tone.Transport.bpm.value = Math.max(70, Tone.Transport.bpm.value * 0.5);
          break;
          
        case "squeaky":
          // Hi-hat focused with high frequencies
          this.kickSynth.volume.value = -10;
          this.snareSynth.volume.value = -14;
          this.hihatSynth.volume.value = -12;
          // this.hihatSynth.frequency = 600;
          this.hihatSynth.resonance = 12000;
          this.hihatSynth.envelope.decay = 0.04;
          this.hihatSynth.envelope.attack = 0.0001;
          break;
          
        case "rubber":
          // Bouncy funk rhythm
          this.kickSynth.envelope.decay = 0.2;
          this.kickSynth.envelope.release = 0.5;
          this.kickSynth.pitchDecay = 0.08;
          this.snareSynth.envelope.decay = 0.12;
          this.snareFilter.Q.value = 3;
          this.hihatSynth.envelope.decay = 0.06;
          break;
          
        case "smooth":
          // Liquid drum'n'bass
          this.kickSynth.envelope.decay = 0.15;
          this.kickSynth.envelope.attack = 0.002;
          this.snareSynth.envelope.decay = 0.1;
          this.snareSynth.envelope.attack = 0.002;
          this.hihatSynth.envelope.decay = 0.05;
          this.hihatSynth.volume.value = -18;
          // Fast tempo for DnB
          Tone.Transport.bpm.value = Math.min(175, Tone.Transport.bpm.value * 1.3);
          break;
          
        case "rusty":
          // Industrial metallic sounds
          this.kickSynth.envelope.decay = 0.08;
          this.kickSynth.oscillator.type = "triangle";
          this.snareSynth.noise.type = "brown";
          this.snareSynth.envelope.decay = 0.2;
          this.snareFilter.frequency.value = 3000;
          // this.hihatSynth.frequency = 800;
          this.hihatSynth.resonance = 15000;
          this.hihatSynth.modulationIndex = 60;
          break;
          
        case "vintage":
          // Classic 808/909 sounds
          this.kickSynth.envelope.decay = 0.5;
          this.kickSynth.envelope.sustain = 0;
          this.kickSynth.pitchDecay = 0.01;
          this.snareSynth.envelope.decay = 0.2;
          this.snareSynth.envelope.sustain = 0;
          this.hihatSynth.envelope.decay = 0.1;
          // this.hihatSynth.frequency = 200;
          break;
          
        case "stolen":
          // Erratic, glitchy sounds
          this.kickSynth.envelope.decay = Math.random() * 0.3 + 0.1;
          this.snareSynth.envelope.decay = Math.random() * 0.3 + 0.1;
          this.hihatSynth.envelope.decay = Math.random() * 0.1 + 0.02;
          this.kickSynth.volume.value = -8 + Math.random() * 4;
          this.snareSynth.volume.value = -12 + Math.random() * 4;
          this.hihatSynth.volume.value = -20 + Math.random() * 6;
          break;
          
        case "golden":
          // Luxurious trap-style
          this.kickSynth.envelope.decay = 0.3;
          this.kickSynth.envelope.release = 1;
          this.kickSynth.octaves = 10;
          this.snareSynth.envelope.decay = 0.15;
          this.snareSynth.envelope.attack = 0.005;
          this.hihatSynth.envelope.decay = 0.02;
          this.hihatSynth.envelope.attack = 0.0001;
          this.hihatSynth.volume.value = -14;
          // this.hihatSynth.frequency = 300;
          // Trap tempo
          Tone.Transport.bpm.value = Math.min(140, Tone.Transport.bpm.value * 0.9);
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
          if (this.kickSynth) {
            this.kickSynth.triggerAttackRelease("C1", "8n", time);
          }
          break;
        case "snare":
          if (this.snareSynth) {
            this.snareSynth.triggerAttackRelease("8n", time);
          }
          break;
        case "hihat":
          if (this.hihatSynth) {
            // MetalSynth doesn't take a note parameter
            this.hihatSynth.triggerAttackRelease("32n", time);
          }
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
    console.log("Cleaning up cart wheels audio nodes...");
    
    // Stop the sequencer first
    if (this.sequencer) {
      this.sequencer.stop();
      this.sequencer.dispose();
      this.sequencer = null;
    }
    
    // Disconnect and dispose of the synths
    if (this.kickSynth) {
      this.kickSynth.disconnect();
      this.kickSynth.dispose();
      this.kickSynth = null;
    }
    
    if (this.snareFilter) {
      this.snareFilter.disconnect();
      this.snareFilter.dispose();
      this.snareFilter = null;
    }
    
    if (this.snareSynth) {
      this.snareSynth.disconnect();
      this.snareSynth.dispose();
      this.snareSynth = null;
    }
    
    if (this.hihatSynth) {
      try {
        this.hihatSynth.disconnect();
        this.hihatSynth.dispose();
      } catch (e) {
        console.warn("Error disposing hihat synth:", e);
      }
      this.hihatSynth = null;
    }
    
    // Reset BPM to default
    Tone.Transport.bpm.value = CONFIG.audio.defaultBPM;
  },

  // Stop wheels without full cleanup (for breaks/pauses)
  stopWheels: function() {
    console.log("Stopping cart wheels...");

    // Stop the sequencer
    if (this.sequencer) {
      this.sequencer.stop();
    }

    // Mute all drum sounds
    if (this.kickSynth) {
      this.kickSynth.volume.rampTo(-Infinity, 0.5);
    }
    if (this.snareSynth) {
      this.snareSynth.volume.rampTo(-Infinity, 0.5);
    }
    if (this.hihatSynth) {
      this.hihatSynth.volume.rampTo(-Infinity, 0.5);
    }

    window.log("🛒 Cart wheels stopped...");
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