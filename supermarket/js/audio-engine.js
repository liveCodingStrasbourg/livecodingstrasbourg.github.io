// Full implementation with fixes for "open" and "shelflife" parameters

// Define the shelf life mappings for product repetition rate
const shelfLifeDurations = {
  'today': '32n',     // Very fast repetition - expires today
  'week': '16n',      // Fast repetition - expires this week
  'month': '8n',      // Medium repetition - expires this month  
  'year': '4n',       // Slow repetition - expires this year
  'decade': '2n',     // Very slow repetition - expires in a decade
  'forever': '1n'     // Extremely slow - never expires
};

// Modified addProduct function to handle open products and shelflife
function addProduct(name, modifier) {
  // Check if product exists in our catalog
  if (!productTypes[name]) {
    log(`Product ${name} not available in this supermarket!`);
    return;
  }

  // Create a unique ID for this product instance
  const id = `${name}_${Date.now()}`;
  
  // Create the base synth
  const synth = productTypes[name].create();
  let note = productTypes[name].note;
  let filter = null;
  let effect = null;
  
  // Check for nutriscore in the modifier
  let nutriscoreMatch = modifier.match(/nutriscore\s+([A-E])/i);
  let nutriscoreKey = null;
  
  if (nutriscoreMatch) {
    nutriscoreKey = nutriscoreMatch[1].toUpperCase();
    // Remove the nutriscore part from the modifier
    modifier = modifier.replace(/nutriscore\s+[A-E]/i, '').trim();
    
    log(`Setting ${name} to key of ${nutriscoreKey}`);
  }
  
  // Check for shelflife in the modifier
  let shelfLifeMatch = modifier.match(/shelflife\s+(today|week|month|year|decade|forever)/i);
  let shelfLifeDuration = null;
  
  if (shelfLifeMatch) {
    let shelfLifeValue = shelfLifeMatch[1].toLowerCase();
    shelfLifeDuration = shelfLifeDurations[shelfLifeValue];
    
    // Remove the shelflife part from the modifier
    modifier = modifier.replace(/shelflife\s+(today|week|month|year|decade|forever)/i, '').trim();
    
    log(`Setting ${name}'s shelf life to expire in: ${shelfLifeValue}`);
  }
  
  // Check if this is an open product (adds randomness to triggering)
  let isOpenProduct = modifier.includes("open");
  if (isOpenProduct) {
    // Remove the open part from the modifier
    modifier = modifier.replace(/open/i, '').trim();
    
    log(`⚠️ Warning: This ${name} has been opened... <span style="color: #ff00ff;">it behaves unpredictably!</span>`);
  }

  // Apply modifiers
  if (modifier) {
    // Apply fresh/old modifiers
    if (modifier.includes("fresh")) {
      // Higher octave for fresh products
      if (Array.isArray(note)) {
        note = note.map(n => Tone.Frequency(n).transpose(12 * productTypes[name].fresh.octave).toNote());
      } else {
        note = Tone.Frequency(note).transpose(12 * productTypes[name].fresh.octave).toNote();
      }
      log(`Added fresh ${name} (suspiciously bright and vibrant...)`);
    }
    else if (modifier.includes("old")) {
      // Lower octave for old products
      if (Array.isArray(note)) {
        note = note.map(n => Tone.Frequency(n).transpose(12 * productTypes[name].old.octave).toNote());
      } else {
        note = Tone.Frequency(note).transpose(12 * productTypes[name].old.octave).toNote();
      }
      log(`Added old ${name} (expired decades ago...)`);
    }
    
    // Apply filter modifiers
    if (modifier.includes("strong")) {
      // Add low-pass filter for "strong" products
      filter = new Tone.Filter({
        type: "lowpass",
        frequency: 500,
        Q: 1
      }).toDestination();
      synth.disconnect();
      synth.connect(filter);
      log(`Made it strong (unnaturally so...)`);
    }
    else if (modifier.includes("flavorless")) {
      // Add high-pass filter for "flavorless" products
      filter = new Tone.Filter({
        type: "highpass",
        frequency: 1500,
        Q: 1
      }).toDestination();
      synth.disconnect();
      synth.connect(filter);
      log(`Made it flavorless (it tastes like nothing at all...)`);
    }

    // Apply effect modifiers
    effect = applyEffectModifier(synth, filter, name, modifier, "cheap", effect);
    effect = applyEffectModifier(synth, filter, name, modifier, "expensive", effect);
    effect = applyEffectModifier(synth, filter, name, modifier, "processed", effect);
    effect = applyEffectModifier(synth, filter, name, modifier, "industrial", effect);
    effect = applyEffectModifier(synth, filter, name, modifier, "overpriced", effect);
    effect = applyEffectModifier(synth, filter, name, modifier, "vomit", effect);
    effect = applyEffectModifier(synth, filter, name, modifier, "artisanal", effect);
  } else {
    log(`Added regular ${name} (as regular as anything can be here...)`);
  }
  
  // Apply Nutriscore key change if specified
  if (nutriscoreKey) {
    // Get base note without octave to determine interval
    const getNoteWithoutOctave = noteStr => {
      if (!noteStr) return null;
      return noteStr.replace(/\d+$/, '');
    };
    
    // For array of notes (chords)
    if (Array.isArray(note)) {
      note = note.map(n => {
        const baseNote = getNoteWithoutOctave(n);
        const octave = n.match(/\d+$/)[0];
        // Calculate semitone difference to move to the new key
        const currentKeyIndex = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(baseNote);
        const targetKeyIndex = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(nutriscoreKey);
        const semitones = (targetKeyIndex - currentKeyIndex + 12) % 12;
        
        // Transpose to new key
        return Tone.Frequency(n).transpose(semitones).toNote();
      });
    } else {
      // For single notes
      const baseNote = getNoteWithoutOctave(note);
      const octave = note.match(/\d+$/)[0];
      // Calculate semitone difference to move to the new key
      const currentKeyIndex = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(baseNote);
      const targetKeyIndex = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].indexOf(nutriscoreKey);
      const semitones = (targetKeyIndex - currentKeyIndex + 12) % 12;
      
      // Transpose to new key
      note = Tone.Frequency(note).transpose(semitones).toNote();
    }
    
    // Update the UI with nutriscore info - with color based on rating
    const nutriscoreColors = {
      'A': '#2d7f25', // green
      'B': '#8ebe21', // light green
      'C': '#f7ae00', // yellow
      'D': '#e87b21', // orange
      'E': '#e62e18'  // red
    };
    
    log(`🏷️ Nutriscore ${nutriscoreKey} applied to ${name} <span style="color: ${nutriscoreColors[nutriscoreKey]}; font-weight: bold;">(${nutriscoreKey})</span>`);
  }

  // Store the product in our state
  state.products[id] = {
    name,
    synth,
    note,
    filter,
    effect,
    nutriscoreKey,
    shelfLifeDuration,
    isOpenProduct,
    loop: null
  };

  // Create a loop for this product with the correct pattern
  // Use shelfLifeDuration if specified, otherwise use the default pattern
  const pattern = shelfLifeDuration || productTypes[name].pattern;
  
  // Create visual feedback for shelf life (emoji and color)
  let shelfLifeEmoji = '';
  let shelfLifeColor = '';
  
  if (shelfLifeDuration) {
    // Determine emoji and color based on shelf life
    switch(shelfLifeDuration) {
      case '32n':
        shelfLifeEmoji = '⚡';
        shelfLifeColor = '#ff0000'; // Red for very fast/expires today
        break;
      case '16n':
        shelfLifeEmoji = '🔥';
        shelfLifeColor = '#ff6600'; // Orange for fast/expires this week
        break;
      case '8n':
        shelfLifeEmoji = '⏱️';
        shelfLifeColor = '#ffcc00'; // Yellow for medium/expires this month
        break;
      case '4n':
        shelfLifeEmoji = '📅';
        shelfLifeColor = '#66cc00'; // Light green for slow/expires this year
        break;
      case '2n':
        shelfLifeEmoji = '🧊';
        shelfLifeColor = '#0099cc'; // Blue for very slow/expires in a decade
        break;
      case '1n':
        shelfLifeEmoji = '⌛';
        shelfLifeColor = '#9900cc'; // Purple for extremely slow/never expires
        break;
    }
    
    log(`${shelfLifeEmoji} Shelf life set - product repetition: <span style="color: ${shelfLifeColor}; font-weight: bold;">${pattern}</span>`);
  }
  
  const loop = new Tone.Loop(time => {
    // For open products, randomly decide whether to trigger sound
    if (isOpenProduct && Math.random() > 0.6) { // 60% chance to skip triggering
      return; // Skip this trigger
    }
    
    // Apply random variations if discount mode is on
    let playNote = note;
    if (state.modes.discount) {
      if (Array.isArray(playNote)) {
        // For chord-based products like pinard
        playNote = playNote.map(n => {
          const cents = (Math.random() * 100) - 50; // Random detune +/- 50 cents
          return Tone.Frequency(n).transpose(cents/100).toNote();
        });
      } else {
        const cents = (Math.random() * 100) - 50; // Random detune +/- 50 cents
        playNote = Tone.Frequency(note).transpose(cents/100).toNote();
      }
    }
    
    // Handle array-type notes (chords) vs single notes
    if (Array.isArray(playNote)) {
      synth.triggerAttackRelease(playNote, pattern, time);
    } else {
      synth.triggerAttackRelease(playNote, pattern, time);
    }
  }, pattern).start(0);

  // Store the loop
  state.products[id].loop = loop;

  // Apply inflation mode if active
  if (state.modes.inflation) {
    applyInflationToProduct(id);
  }
  
  // Apply apocalypse mode if active
  if (state.modes.apocalypse) {
    // Random pitch fluctuations
    const fluctuationInterval = setInterval(() => {
      if (!state.products[id]) {
        clearInterval(fluctuationInterval);
        return;
      }
      
      const randomDetune = (Math.random() * 200) - 100; // +/- 100 cents
      synth.detune.rampTo(randomDetune, 0.2);
    }, 1000 + Math.random() * 2000);
    
    // Store the interval for cleanup
    state.products[id].apocalypseInterval = fluctuationInterval;
  }
  
  // Randomly trigger a spooky message
  showRandomSpookyMessage();
}

// Updated command parser and executor
function executeCommand(cmd) {
  cmd = cmd.toLowerCase().trim();
  log(`> ${cmd}`);

  // Cart wheels commands (rhythm section)
  if (cmd.startsWith("my cart has")) {
    const wheelText = cmd.replace("my cart has", "").trim();
    // Extract the wheel type from the full text
    let wheelType;
    if (wheelText.includes("square wheels")) wheelType = "square";
    else if (wheelText.includes("bad wheels")) wheelType = "bad";
    else if (wheelText.includes("no wheels")) wheelType = "none";
    else if (wheelText.includes("3 wheels")) wheelType = "3";
    else wheelType = wheelText; // fallback
    
    setWheels(wheelType);
    return;
  }

  // Product commands with nutriscore, shelflife, and open support
  if (cmd.startsWith("add")) {
    const addParts = cmd.replace("add", "").trim();
    
    // Extract the product name (last word before special parameters if present)
    let productName, modifier;
    
    // Find the position of product name by checking for special parameters
    const nutriscorePos = addParts.toLowerCase().indexOf("nutriscore");
    const shelfLifePos = addParts.toLowerCase().indexOf("shelflife");
    const openProductPos = addParts.toLowerCase().indexOf("open");
    
    // Determine where to look for the product name
    let cutoffPos = addParts.length;
    
    // Find the earliest special parameter
    if (nutriscorePos !== -1) {
      cutoffPos = nutriscorePos;
    }
    
    if (shelfLifePos !== -1 && shelfLifePos < cutoffPos) {
      cutoffPos = shelfLifePos;
    }
    
    if (openProductPos !== -1 && openProductPos < cutoffPos) {
      cutoffPos = openProductPos;
    }
    
    // Get the part before any special parameters
    const beforeSpecials = addParts.substring(0, cutoffPos).trim();
    
    // Last word is the product name
    const parts = beforeSpecials.split(" ");
    if (parts.length > 0) {
      productName = parts.pop();
      // Everything else before the product name is the modifier
      modifier = parts.join(" ");
      
      // Add the special parameters back to the modifier
      if (cutoffPos < addParts.length) {
        modifier = (modifier + " " + addParts.substring(cutoffPos)).trim();
      }
      
      if (productTypes[productName]) {
        addProduct(productName, modifier);
      } else {
        log(`Unknown product: ${productName}. This market has been abandoned for decades.`);
      }
    } else {
      log("Invalid command format. Try 'add [product]'.");
    }
    return;
  }

  if (cmd.startsWith("remove")) {
    const productName = cmd.replace("remove", "").trim();
    removeProduct(productName);
    return;
  }

  // Mode commands
  if (cmd === "discount mode on") {
    toggleDiscountMode(true);
    showRandomSpookyMessage();
    return;
  }

  if (cmd === "discount mode off") {
    toggleDiscountMode(false);
    return;
  }

  if (cmd === "inflation mode on") {
    toggleInflationMode(true);
    showRandomSpookyMessage();
    return;
  }

  if (cmd === "inflation mode off") {
    toggleInflationMode(false);
    return;
  }
  
  if (cmd === "apocalypse mode on") {
    toggleApocalypseMode(true);
    return;
  }
  
  if (cmd === "apocalypse mode off") {
    toggleApocalypseMode(false);
    return;
  }

  log("Unknown command - the register won't accept that.");
}

// Helper function to apply an effect modifier
function applyEffectModifier(synth, filter, name, modifier, effectName, effect) {
  if (modifier.includes(effectName)) {
    const effectConfig = productTypes[name][effectName];
    if (!effectConfig) return effect;
    
    let newEffect;
    
    switch (effectConfig.effect) {
      case "bitcrusher":
        newEffect = new Tone.BitCrusher(effectConfig.settings.bits).toDestination();
        newEffect.wet.value = effectConfig.settings.wet;
        break;
      case "reverb":
        newEffect = new Tone.Reverb({
          decay: effectConfig.settings.decay,
          wet: effectConfig.settings.wet
        }).toDestination();
        break;
      case "chorus":
        newEffect = new Tone.Chorus({
          frequency: effectConfig.settings.frequency,
          delayTime: effectConfig.settings.delayTime,
          depth: effectConfig.settings.depth,
          wet: effectConfig.settings.wet
        }).toDestination();
        break;
      case "distortion":
        newEffect = new Tone.Distortion({
          distortion: effectConfig.settings.distortion,
          wet: effectConfig.settings.wet
        }).toDestination();
        break;
      case "phaser":
        newEffect = new Tone.Phaser({
          frequency: effectConfig.settings.frequency,
          octaves: effectConfig.settings.octaves,
          wet: effectConfig.settings.wet
        }).toDestination();
        break;
      case "chebyshev":
        newEffect = new Tone.Chebyshev(effectConfig.settings.order).toDestination();
        newEffect.wet.value = effectConfig.settings.wet;
        break;
      case "tremolo":
        newEffect = new Tone.Tremolo({
          frequency: effectConfig.settings.frequency,
          depth: effectConfig.settings.depth,
          wet: effectConfig.settings.wet
        }).start().toDestination();
        break;
    }
    
    if (newEffect) {
      // Connect to the effect
      if (filter) {
        filter.disconnect();
        filter.connect(newEffect);
      } else {
        synth.disconnect();
        synth.connect(newEffect);
      }
      
      effect = newEffect;
      log(`Made it ${effectName} (${getEffectDescription(effectName)})`);
    }
  }
  
  return effect;
}

// Get descriptions for effects
function getEffectDescription(effectName) {
  const descriptions = {
    cheap: "suspiciously so...",
    expensive: "not worth the price of your soul...",
    processed: "full of chemicals and additives...",
    industrial: "mass-produced in forgotten factories...",
    overpriced: "costs more than your sanity...",
    vomit: "something moves inside the package...",
    artisanal: "handcrafted by something not quite human..."
  };
  
  return descriptions[effectName] || "";
}