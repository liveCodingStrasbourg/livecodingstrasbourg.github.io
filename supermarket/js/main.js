// main.js - Core application logic for the Horror Supermarket

// Global state management
window.state = {
  products: {}, // Stored products with their synths and loops
  cart: {
    wheels: "none" // Type of shopping cart wheels
  },
  modes: {
    discount: false,
    inflation: false,
    apocalypse: false
  }
};

// Global variables
let drumSequencer = null; // For cart wheels rhythm
let apocalypseInterval = null; // For random effects in apocalypse mode

// Initialize audio context and start transports when user interacts
async function startAudio() {
  // Only start audio on first user interaction
  if (Tone.context.state !== "running") {
    await Tone.start();
    console.log("Audio context started");
    
    // Initialize with default BPM
    Tone.Transport.bpm.value = 120;
    log("🔊 Audio engine initialized... the supermarket comes to life.");
  }
  
  return Tone.context.state === "running";
}

// Set cart wheel type
function setWheels(wheelType) {
  // If there's an existing sequencer, dispose it
  if (drumSequencer) {
    drumSequencer.dispose();
    drumSequencer = null;
  }
  
  // Update state
  state.cart.wheels = wheelType;
  
  // Create appropriate rhythm based on cart wheel type
  switch (wheelType) {
    case "square":
      // Square wheels - uneven, irregular pattern
      const squarePattern = [
        { time: "0:0", note: "C1" },
        { time: "0:0:3", note: "C1" },
        { time: "0:1:2", note: "C1" },
        { time: "0:2:0", note: "C1" },
        { time: "0:3:1", note: "C1" }
      ];
      
      drumSequencer = createDrumSequence(squarePattern);
      log("Your cart now has square wheels (they grind irregularly...)");
      break;
      
    case "bad":
      // Bad wheels - regular but squeaky pattern
      const badPattern = [
        { time: "0:0", note: "C1" },
        { time: "0:1", note: "C1" },
        { time: "0:2", note: "C1" },
        { time: "0:3", note: "C1" }
      ];
      
      drumSequencer = createDrumSequence(badPattern, true); // true for squeaky
      log("Your cart now has bad wheels (they squeak on every turn...)");
      break;
      
    case "3":
      // Three wheels - limping pattern
      const threePattern = [
        { time: "0:0", note: "C1" },
        { time: "0:1", note: "C1" },
        { time: "0:2", note: "C1" }
      ];
      
      drumSequencer = createDrumSequence(threePattern);
      log("Your cart now has 3 wheels (it limps along...)");
      break;
      
    case "none":
    default:
      log("Your cart has no wheels (silence...)");
      break;
  }
  
  // Start the transport if it's not already started and we have wheels
  if (wheelType !== "none" && Tone.Transport.state !== "started") {
    Tone.Transport.start();
  }
}

// Create a drum sequence for cart wheels
function createDrumSequence(pattern, squeaky = false) {
  // Create a drum sound for the wheels
  const drumSound = new Tone.NoiseSynth({
    noise: { type: squeaky ? "pink" : "white" },
    envelope: { 
      attack: 0.005, 
      decay: 0.1, 
      sustain: 0.1, 
      release: 0.1 
    }
  }).toDestination();
  
  // Apply effects for squeaky wheels
  if (squeaky) {
    const filter = new Tone.Filter({
      type: "bandpass",
      frequency: 2000,
      Q: 3
    }).toDestination();
    
    drumSound.disconnect();
    drumSound.connect(filter);
  }
  
  // Create a sequence for the wheels
  const sequence = new Tone.Part((time, event) => {
    drumSound.triggerAttackRelease("16n", time);
  }, pattern).start(0);
  
  // Set loop parameters
  sequence.loop = true;
  sequence.loopEnd = "1:0"; // Loop every measure
  
  return sequence;
}

// Remove product by name
function removeProduct(productName) {
  const ids = Object.keys(state.products).filter(id => 
    state.products[id].name === productName);
  
  if (ids.length > 0) {
    ids.forEach(id => {
      // Stop and dispose of the loop
      if (state.products[id].loop) {
        state.products[id].loop.dispose();
      }
      
      // Dispose the synth
      if (state.products[id].synth) {
        state.products[id].synth.dispose();
      }
      
      // Dispose the filter if it exists
      if (state.products[id].filter) {
        state.products[id].filter.dispose();
      }
      
      // Dispose the effect if it exists
      if (state.products[id].effect) {
        state.products[id].effect.dispose();
      }
      
      // Clear any intervals for apocalypse mode
      if (state.products[id].apocalypseInterval) {
        clearInterval(state.products[id].apocalypseInterval);
      }
      
      // Remove from state
      delete state.products[id];
    });
    
    log(`Removed all ${productName} from your cart (did it crawl away?)...`);
  } else {
    log(`No ${productName} in your cart. (Did it disappear on its own?)...`);
  }
}

// Toggle discount mode
function toggleDiscountMode(enabled) {
  state.modes.discount = enabled;
  
  if (enabled) {
    document.body.classList.add('discount-mode');
    document.body.classList.add('discount-active');
    log("💸 DISCOUNT MODE ACTIVATED (everything's cheap for a reason...)");
    
    // Add random detuning to all synths
    Object.keys(state.products).forEach(id => {
      if (state.products[id].synth) {
        state.products[id].synth.detune.value = Math.random() * 50 - 25; // Random detune
      }
    });
  } else {
    document.body.classList.remove('discount-mode');
    document.body.classList.remove('discount-active');
    log("Discount mode deactivated (prices return to normal...)");
    
    // Reset detuning
    Object.keys(state.products).forEach(id => {
      if (state.products[id].synth) {
        state.products[id].synth.detune.value = 0;
      }
    });
  }
}

// Toggle inflation mode
function toggleInflationMode(enabled) {
  state.modes.inflation = enabled;
  
  if (enabled) {
    document.body.classList.add('inflation-mode');
    document.body.classList.add('inflation-active');
    log("📈 INFLATION MODE ACTIVATED (prices and pitches rising uncontrollably...)");
    
    // Apply to all current products
    Object.keys(state.products).forEach(id => {
      applyInflationToProduct(id);
    });
  } else {
    document.body.classList.remove('inflation-mode');
    document.body.classList.remove('inflation-active');
    log("Inflation mode deactivated (prices stabilize...)");
    
    // Stop all inflation effects
    Object.keys(state.products).forEach(id => {
      if (state.products[id].inflationInterval) {
        clearInterval(state.products[id].inflationInterval);
        state.products[id].inflationInterval = null;
      }
      
      // Reset detune
      if (state.products[id].synth) {
        state.products[id].synth.detune.value = 0;
      }
    });
  }
}

// Apply inflation effect to a product
function applyInflationToProduct(id) {
  if (!state.products[id]) return;
  
  // Clear any existing inflation interval
  if (state.products[id].inflationInterval) {
    clearInterval(state.products[id].inflationInterval);
  }
  
  // Create gradually increasing pitch
  let detuneAmount = 0;
  state.products[id].inflationInterval = setInterval(() => {
    if (!state.products[id]) {
      clearInterval(state.products[id].inflationInterval);
      return;
    }
    
    detuneAmount += 2; // Increase by 2 cents every interval
    if (detuneAmount > 1200) {
      detuneAmount = 0; // Reset after going up an octave
      log(`${state.products[id].name} price has doubled! (Reset to base level...)`);
    }
    
    state.products[id].synth.detune.value = detuneAmount;
  }, 500); // Update every 500ms
}

// Toggle apocalypse mode
function toggleApocalypseMode(enabled) {
  state.modes.apocalypse = enabled;
  
  if (enabled) {
    document.body.classList.add('apocalypse-mode');
    log("☢️ APOCALYPSE MODE ACTIVATED (reality breaks down...)", true);
    
    // Affect global effects
    const distortion = new Tone.Distortion({
      distortion: 0.4,
      wet: 0.2
    }).toDestination();
    
    Tone.Destination.connect(distortion);
    
    // Randomize BPM
    Tone.Transport.bpm.value = 80 + Math.random() * 100;
    
    // Random global effects over time
    apocalypseInterval = setInterval(() => {
      // Randomly change BPM
      Tone.Transport.bpm.rampTo(80 + Math.random() * 100, 2);
      
      // Random master volume fluctuations
      Tone.Destination.volume.rampTo(Math.random() * -10, 0.5);
      
      // Apply to all products
      Object.keys(state.products).forEach(id => {
        // Random pitch fluctuations
        if (state.products[id].synth) {
          const randomDetune = (Math.random() * 400) - 200; // +/- 200 cents
          state.products[id].synth.detune.rampTo(randomDetune, 0.5);
        }
      });
    }, 3000); // Every 3 seconds
    
    // Show spooky messages more frequently
    showRandomSpookyMessage();
    showRandomSpookyMessage();
  } else {
    document.body.classList.remove('apocalypse-mode');
    log("Apocalypse mode deactivated (relative stability returns...)");
    
    // Reset global effects
    Tone.Destination.disconnect();
    Tone.Destination.volume.value = 0;
    
    // Reset BPM
    Tone.Transport.bpm.value = 120;
    
    // Clear interval
    if (apocalypseInterval) {
      clearInterval(apocalypseInterval);
      apocalypseInterval = null;
    }
    
    // Reset all products
    Object.keys(state.products).forEach(id => {
      if (state.products[id].synth) {
        state.products[id].synth.detune.value = 0;
      }
      
      if (state.products[id].apocalypseInterval) {
        clearInterval(state.products[id].apocalypseInterval);
        state.products[id].apocalypseInterval = null;
      }
    });
  }
}

// When DOM content is loaded, initialize the UI
document.addEventListener('DOMContentLoaded', () => {
  initializeUI();
});