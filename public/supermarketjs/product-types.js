// product-types.js - Complete file

// Product definitions (synths) - Make this globally available
window.productTypes = {
    // Beverages
    beer: {
      create: () => new Tone.FMSynth({
        harmonicity: 2,
        modulationIndex: 4,
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.3, sustain: 0.3, release: 0.6 },
      }),
      note: "C3",
      pattern: "8n",
      color: "#f28e1c", // Amber
      description: "FM synth with harmonics",
      category: "beverage",
      // Modifiers
      fresh: { octave: 1, filter: null },
      old: { octave: -1, filter: null },
      strong: { octave: -2, filter: "lowpass" },
      flavorless: { octave: 1, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 4, wet: 1 } },
      expensive: { effect: "reverb", settings: { decay: 4, wet: 0.6 } },
      processed: { effect: "chorus", settings: { frequency: 4, delayTime: 2.5, depth: 0.9, wet: 0.7 } },
      industrial: { effect: "distortion", settings: { distortion: 0.8, wet: 0.6 } },
      overpriced: { effect: "phaser", settings: { frequency: 0.5, octaves: 3, wet: 0.6 } },
      vomit: { effect: "chebyshev", settings: { order: 50, wet: 0.5 } },
      artisanal: { effect: "tremolo", settings: { frequency: 10, depth: 0.8, wet: 0.7 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.25, feedback: 0.5, wet: 0.2 } },
      luxury: { effect: "reverb", settings: { decay: 8, wet: 0.8 } },
      artificial: { effect: "vibrato", settings: { frequency: 5, depth: 0.5, wet: 0.6 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 3, wet: 0.7 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.25, feedback: 0.6, wet: 0.3 } },
      // New effects
      packaged: { effect: "packaged", settings: { frequency: 8, depth: 0.8, wet: 0.7 } },
      glass: { effect: "glass", settings: { delayTime: 0.2, feedback: 0.4, wet: 0.6 } }
    },
    
    
salad: {
  create: () => new Tone.MonoSynth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.2 },
    filter: { Q: 1.5, frequency: 1200, type: "bandpass" },
    filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2, baseFrequency: 600, octaves: 2 }
  }),
  note: "E3",
  pattern: "8n",
  color: "#7fb800",        // Green
  description: "Crisp pluck synth for fresh texture",
  category: "vegetable",
      // Modifiers (same structure as beer, modified for salad)
      fresh: { octave: 1, filter: null },
      old: { octave: -1, filter: null },
      strong: { octave: -1, filter: "lowpass" },
      flavorless: { octave: 1, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 3, wet: 0.8 } },
      expensive: { effect: "reverb", settings: { decay: 3, wet: 0.5 } },
      processed: { effect: "chorus", settings: { frequency: 2.5, delayTime: 3, depth: 0.7, wet: 0.5 } },
      industrial: { effect: "distortion", settings: { distortion: 0.5, wet: 0.4 } },
      overpriced: { effect: "phaser", settings: { frequency: 0.8, octaves: 2, wet: 0.7 } },
      vomit: { effect: "chebyshev", settings: { order: 30, wet: 0.4 } },
      artisanal: { effect: "tremolo", settings: { frequency: 8, depth: 0.5, wet: 0.6 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.16, feedback: 0.4, wet: 0.2 } },
      luxury: { effect: "reverb", settings: { decay: 6, wet: 0.6 } },
      artificial: { effect: "vibrato", settings: { frequency: 6, depth: 0.6, wet: 0.7 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 2, wet: 0.6 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.3, feedback: 0.5, wet: 0.2 } }
    },
    
    ham: {
      create: () => new Tone.MonoSynth({
        oscillator: { type: "fatsawtooth", count: 2, spread: 20 },
        envelope: { attack: 0.02, decay: 0.4, sustain: 0.6, release: 0.5 },
        filter: { Q: 1.5, frequency: 600, type: "lowpass" },
        filterEnvelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 0.5, baseFrequency: 500, octaves: 2 }
      }),
      note: "C2",
      pattern: "4n.",
      color: "#ff6b6b", // Pink
      description: "Rich fat sawtooth with filter movement",
      category: "meat",
      // Modifiers
      fresh: { octave: 1, filter: null },
      old: { octave: -1, filter: null },
      strong: { octave: -1, filter: "lowpass" },
      flavorless: { octave: 1, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 2, wet: 0.7 } },
      expensive: { effect: "reverb", settings: { decay: 5, wet: 0.8 } },
      processed: { effect: "chorus", settings: { frequency: 3, delayTime: 4, depth: 0.8, wet: 0.6 } },
      industrial: { effect: "distortion", settings: { distortion: 0.9, wet: 0.7 } },
      overpriced: { effect: "phaser", settings: { frequency: 0.3, octaves: 4, wet: 0.5 } },
      vomit: { effect: "chebyshev", settings: { order: 40, wet: 0.6 } },
      artisanal: { effect: "tremolo", settings: { frequency: 6, depth: 0.6, wet: 0.5 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.2, feedback: 0.3, wet: 0.15 } },
      luxury: { effect: "reverb", settings: { decay: 7, wet: 0.7 } },
      artificial: { effect: "vibrato", settings: { frequency: 4, depth: 0.4, wet: 0.5 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 1, wet: 0.8 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.2, feedback: 0.7, wet: 0.25 } }
    },
    
// Fixed milk synth configuration in product-types.js

milk: {
  create: () => new Tone.MonoSynth({
    oscillator: { type: "sine" },
    envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.6 },
    filter: { Q: 1, frequency: 1200, type: "lowpass" },
    filterEnvelope: { attack: 0.02, decay: 0.2, sustain: 0.3, release: 0.4, baseFrequency: 800, octaves: 1.5 }
  }),
  note: "A3",
  pattern: "8n",
  color: "#ffffff", // White
  description: "Smooth liquid synth with gentle filtering",
  category: "dairy",
 
      // Modifiers
      fresh: { octave: 1, filter: null },
      old: { octave: -1, filter: "lowpass" },
      strong: { octave: 0, filter: "lowpass" },
      flavorless: { octave: 1, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 5, wet: 0.5 } },
      expensive: { effect: "reverb", settings: { decay: 2, wet: 0.4 } },
      processed: { effect: "chorus", settings: { frequency: 1.5, delayTime: 2, depth: 0.5, wet: 0.4 } },
      industrial: { effect: "distortion", settings: { distortion: 0.4, wet: 0.3 } },
      overpriced: { effect: "phaser", settings: { frequency: 1, octaves: 2, wet: 0.4 } },
      vomit: { effect: "chebyshev", settings: { order: 20, wet: 0.3 } },
      artisanal: { effect: "tremolo", settings: { frequency: 5, depth: 0.4, wet: 0.5 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.3, feedback: 0.2, wet: 0.1 } },
      luxury: { effect: "reverb", settings: { decay: 4, wet: 0.5 } },
      artificial: { effect: "vibrato", settings: { frequency: 3, depth: 0.3, wet: 0.4 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 4, wet: 0.4 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.15, feedback: 0.4, wet: 0.2 } }
    },
    
    chips: {
  create: () => new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.001, decay: 0.1, sustain: 0.3, release: 0.1 },
    filter: { Q: 1.5, frequency: 1000, type: "bandpass" },
    filterEnvelope: { attack: 0.001, decay: 0.2, sustain: 0.5, release: 0.2, baseFrequency: 400, octaves: 2 }
  }),
  note: "C3",
  pattern: "8n",
  color: "#ffd700", // Gold
  description: "Crispy sawtooth synth with filter sweep",
  category: "snack",
      // Modifiers
      fresh: { octave: 0, filter: "bandpass" },
      old: { octave: 0, filter: "lowpass" },
      strong: { octave: 0, filter: "lowpass" },
      flavorless: { octave: 0, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 2, wet: 1 } },
      expensive: { effect: "reverb", settings: { decay: 1, wet: 0.3 } },
      processed: { effect: "chorus", settings: { frequency: 5, delayTime: 1, depth: 1, wet: 0.8 } },
      industrial: { effect: "distortion", settings: { distortion: 1, wet: 0.9 } },
      overpriced: { effect: "phaser", settings: { frequency: 2, octaves: 5, wet: 0.8 } },
      vomit: { effect: "chebyshev", settings: { order: 60, wet: 0.7 } },
      artisanal: { effect: "tremolo", settings: { frequency: 12, depth: 1, wet: 0.6 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.1, feedback: 0.6, wet: 0.3 } },
      luxury: { effect: "reverb", settings: { decay: 2.5, wet: 0.6 } },
      artificial: { effect: "vibrato", settings: { frequency: 8, depth: 0.8, wet: 0.7 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 1, wet: 0.9 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.1, feedback: 0.8, wet: 0.4 } }
    },
    
    pizza: {
      create: () => new Tone.DuoSynth({
        vibratoAmount: 0.5,
        vibratoRate: 5,
        harmonicity: 1.5,
        voice0: {
          oscillator: { type: "triangle" },
          envelope: { attack: 0.01, decay: 0.5, sustain: 0.3, release: 1 }
        },
        voice1: {
          oscillator: { type: "sine" },
          envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 0.8 }
        }
      }),
      note: "D3",
      pattern: "8n",
      color: "#ff4500", // Red-Orange
      description: "Layered duo synth",
      category: "fastfood",
      // Modifiers
      fresh: { octave: 1, filter: null },
      old: { octave: -1, filter: "lowpass" },
      strong: { octave: -1, filter: "lowpass" },
      flavorless: { octave: 1, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 3, wet: 0.6 } },
      expensive: { effect: "reverb", settings: { decay: 3.5, wet: 0.7 } },
      processed: { effect: "chorus", settings: { frequency: 3.5, delayTime: 3.5, depth: 0.8, wet: 0.6 } },
      industrial: { effect: "distortion", settings: { distortion: 0.6, wet: 0.5 } },
      overpriced: { effect: "phaser", settings: { frequency: 0.7, octaves: 3, wet: 0.6 } },
      vomit: { effect: "chebyshev", settings: { order: 35, wet: 0.5 } },
      artisanal: { effect: "tremolo", settings: { frequency: 7, depth: 0.7, wet: 0.6 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.2, feedback: 0.5, wet: 0.25 } },
      luxury: { effect: "reverb", settings: { decay: 5, wet: 0.7 } },
      artificial: { effect: "vibrato", settings: { frequency: 6, depth: 0.6, wet: 0.5 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 2, wet: 0.7 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.15, feedback: 0.6, wet: 0.35 } }
    },
    
    oil: {
      create: () => new Tone.MembraneSynth({
        pitchDecay: 0.1,
        octaves: 8,
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
      }),
      note: "F2",
      pattern: "2n",
      color: "#8b4513", // Brown
      description: "Deep bass drum synth",
      category: "ingredient",
      // Modifiers
      fresh: { octave: 1, filter: null },
      old: { octave: -1, filter: "lowpass" },
      strong: { octave: -2, filter: "lowpass" },
      flavorless: { octave: 2, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 2, wet: 0.8 } },
      expensive: { effect: "reverb", settings: { decay: 6, wet: 0.9 } },
      processed: { effect: "chorus", settings: { frequency: 0.5, delayTime: 5, depth: 1, wet: 0.7 } },
      industrial: { effect: "distortion", settings: { distortion: 1, wet: 0.8 } },
      overpriced: { effect: "phaser", settings: { frequency: 0.2, octaves: 6, wet: 0.7 } },
      vomit: { effect: "chebyshev", settings: { order: 70, wet: 0.8 } },
      artisanal: { effect: "tremolo", settings: { frequency: 3, depth: 0.9, wet: 0.7 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.4, feedback: 0.6, wet: 0.3 } },
      luxury: { effect: "reverb", settings: { decay: 10, wet: 0.9 } },
      artificial: { effect: "vibrato", settings: { frequency: 2, depth: 0.9, wet: 0.7 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 1, wet: 0.9 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.5, feedback: 0.7, wet: 0.4 } }
    },
    
    wine: {
      create: () => new Tone.DuoSynth({
        vibratoAmount: 0.3,
        vibratoRate: 3,
        harmonicity: 1.5,
        voice0: {
          oscillator: { type: "sine" },
          envelope: { attack: 0.15, decay: 0.3, sustain: 0.5, release: 0.8 }
        },
        voice1: {
          oscillator: { type: "triangle" },
          envelope: { attack: 0.2, decay: 0.25, sustain: 0.4, release: 0.9 }
        }
      }),
      note: "D3",
      pattern: "2n",
      color: "#722f37", // Burgundy
      description: "Rich warm duo synth",
      category: "beverage",
      // Modifiers
      fresh: { octave: 1, filter: null },
      old: { octave: -1, filter: null },
      strong: { octave: -1, filter: "lowpass" },
      flavorless: { octave: 1, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 4, wet: 0.4 } },
      expensive: { effect: "reverb", settings: { decay: 5, wet: 0.8 } },
      processed: { effect: "chorus", settings: { frequency: 2, delayTime: 3, depth: 0.6, wet: 0.5 } },
      industrial: { effect: "distortion", settings: { distortion: 0.3, wet: 0.4 } },
      overpriced: { effect: "phaser", settings: { frequency: 0.4, octaves: 2, wet: 0.9 } },
      vomit: { effect: "chebyshev", settings: { order: 25, wet: 0.4 } },
      artisanal: { effect: "tremolo", settings: { frequency: 4, depth: 0.5, wet: 0.6 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.3, feedback: 0.3, wet: 0.2 } },
      luxury: { effect: "reverb", settings: { decay: 8, wet: 0.9 } },
      artificial: { effect: "vibrato", settings: { frequency: 3, depth: 0.3, wet: 0.5 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 3, wet: 0.5 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.25, feedback: 0.5, wet: 0.3 } }
    },

    cheese: {
      create: () => new Tone.FMSynth({
        harmonicity: 2,
        modulationIndex: 5,
        oscillator: { type: "sine" },
        envelope: { attack: 0.2, decay: 0.3, sustain: 0.7, release: 1.2 },
        modulation: { type: "triangle" },
        modulationEnvelope: { attack: 0.3, decay: 0.2, sustain: 0.5, release: 0.8 }
      }),
      note: "E3",
      pattern: "2n",
      color: "#f4d03f", // Cheese yellow
      description: "Smooth FM synth with warm harmonics",
      category: "dairy",
      // Modifiers
      fresh: { octave: 1, filter: null },
      old: { octave: -1, filter: "lowpass" },
      strong: { octave: -1, filter: "lowpass" },
      flavorless: { octave: 1, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 5, wet: 0.3 } },
      expensive: { effect: "reverb", settings: { decay: 6, wet: 0.7 } },
      processed: { effect: "chorus", settings: { frequency: 1.5, delayTime: 4, depth: 0.5, wet: 0.4 } },
      industrial: { effect: "distortion", settings: { distortion: 0.4, wet: 0.3 } },
      overpriced: { effect: "phaser", settings: { frequency: 0.3, octaves: 2, wet: 0.7 } },
      vomit: { effect: "chebyshev", settings: { order: 40, wet: 0.5 } },
      artisanal: { effect: "tremolo", settings: { frequency: 3, depth: 0.4, wet: 0.5 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.35, feedback: 0.25, wet: 0.2 } },
      luxury: { effect: "reverb", settings: { decay: 10, wet: 0.85 } },
      artificial: { effect: "vibrato", settings: { frequency: 2, depth: 0.25, wet: 0.4 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 4, wet: 0.4 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.3, feedback: 0.4, wet: 0.25 } }
    },

    soda: {
      create: () => new Tone.AMSynth({
        harmonicity: 2.5,
        oscillator: { type: "square8" },
        envelope: { attack: 0.05, decay: 0.3, sustain: 0.5, release: 0.8 },
        modulation: { type: "sawtooth" }
      }),
      note: "G2",
      pattern: "8t",
      color: "#e4000f", // Coca-Cola Red
      description: "Harsh AM synth",
      category: "beverage",
      // Modifiers
      fresh: { octave: 1, filter: "bandpass" },
      old: { octave: -1, filter: "lowpass" },
      strong: { octave: -2, filter: "lowpass" },
      flavorless: { octave: 2, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 1, wet: 1 } },
      expensive: { effect: "reverb", settings: { decay: 7, wet: 0.6 } },
      processed: { effect: "chorus", settings: { frequency: 4, delayTime: 2.5, depth: 0.9, wet: 0.8 } },
      industrial: { effect: "distortion", settings: { distortion: 0.9, wet: 1 } },
      overpriced: { effect: "phaser", settings: { frequency: 1, octaves: 5, wet: 0.6 } },
      vomit: { effect: "chebyshev", settings: { order: 80, wet: 0.9 } },
      artisanal: { effect: "tremolo", settings: { frequency: 9, depth: 0.8, wet: 0.7 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.1, feedback: 0.7, wet: 0.3 } },
      luxury: { effect: "reverb", settings: { decay: 6, wet: 0.7 } },
      artificial: { effect: "vibrato", settings: { frequency: 7, depth: 0.7, wet: 0.8 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 1, wet: 1 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.1, feedback: 0.9, wet: 0.5 } }
    },
    
    bread: {
      create: () => new Tone.DuoSynth({
        vibratoAmount: 0.2,
        vibratoRate: 3,
        harmonicity: 1.005, // Slight detuning for warmth
        voice0: {
          oscillator: { type: "fatsine", count: 2, spread: 10 },
          envelope: { attack: 0.1, decay: 0.3, sustain: 0.7, release: 1.0 },
          filter: { Q: 1, frequency: 800, type: "lowpass" }
        },
        voice1: {
          oscillator: { type: "sine" },
          envelope: { attack: 0.15, decay: 0.3, sustain: 0.6, release: 1.2 }
        }
      }),
      note: "E3",
      pattern: "4n",
      color: "#deb887", // Tan
      description: "Warm duo synth with slight detuning",
      category: "bakery",
      // Modifiers
      fresh: { octave: 1, filter: null },
      old: { octave: -1, filter: "lowpass" },
      strong: { octave: -1, filter: "lowpass" },
      flavorless: { octave: 1, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 5, wet: 0.4 } },
      expensive: { effect: "reverb", settings: { decay: 3, wet: 0.5 } },
      processed: { effect: "chorus", settings: { frequency: 1, delayTime: 3, depth: 0.5, wet: 0.4 } },
      industrial: { effect: "distortion", settings: { distortion: 0.4, wet: 0.3 } },
      overpriced: { effect: "phaser", settings: { frequency: 0.5, octaves: 2, wet: 0.5 } },
      vomit: { effect: "chebyshev", settings: { order: 20, wet: 0.3 } },
      artisanal: { effect: "tremolo", settings: { frequency: 4, depth: 0.4, wet: 0.5 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.25, feedback: 0.2, wet: 0.15 } },
      luxury: { effect: "reverb", settings: { decay: 5, wet: 0.6 } },
      artificial: { effect: "vibrato", settings: { frequency: 2, depth: 0.3, wet: 0.4 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 4, wet: 0.5 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.2, feedback: 0.4, wet: 0.2 } }
    },
    
        cereal: {
      create: () => new Tone.MonoSynth({
        oscillator: { type: "fatsawtooth", count: 2, spread: 15 },
        envelope: { attack: 0.002, decay: 0.08, sustain: 0.2, release: 0.1 },
        filter: { Q: 1, frequency: 1200, type: "lowpass" },
        filterEnvelope: { attack: 0.001, decay: 0.1, sustain: 0.5, release: 0.2, baseFrequency: 400, octaves: 2 }
      }),
      note: "G3",
      pattern: "8n",
      color: "#ffdb58", // Mustard
      description: "Crunchy granular synth with filter modulation",
      category: "breakfast",
      // Modifiers
      fresh: { octave: 1, filter: null },
      old: { octave: -1, filter: null },
      strong: { octave: -1, filter: "lowpass" },
      flavorless: { octave: 1, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 3, wet: 0.6 } },
      expensive: { effect: "reverb", settings: { decay: 2, wet: 0.5 } },
      processed: { effect: "chorus", settings: { frequency: 3, delayTime: 2, depth: 0.6, wet: 0.5 } },
      industrial: { effect: "distortion", settings: { distortion: 0.5, wet: 0.4 } },
      overpriced: { effect: "phaser", settings: { frequency: 0.6, octaves: 3, wet: 0.5 } },
      vomit: { effect: "chebyshev", settings: { order: 30, wet: 0.4 } },
      artisanal: { effect: "tremolo", settings: { frequency: 6, depth: 0.6, wet: 0.5 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.16, feedback: 0.4, wet: 0.2 } },
      luxury: { effect: "reverb", settings: { decay: 4, wet: 0.6 } },
      artificial: { effect: "vibrato", settings: { frequency: 5, depth: 0.5, wet: 0.5 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 2, wet: 0.7 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.12, feedback: 0.8, wet: 0.4 } }
    },
    
    chocolate: {
      create: () => new Tone.MonoSynth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.08, decay: 0.4, sustain: 0.5, release: 1 },
        filterEnvelope: { attack: 0.1, decay: 0.5, sustain: 0.5, release: 1, baseFrequency: 300, octaves: 3 }
      }),
      note: "D3",
      pattern: "8n",
      color: "#6b4226", // Chocolate
      description: "Smooth filtered mono synth",
      category: "sweets",
      // Modifiers
      fresh: { octave: 1, filter: null },
      old: { octave: -1, filter: "lowpass" },
      strong: { octave: -1, filter: "lowpass" },
      flavorless: { octave: 1, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 3, wet: 0.5 } },
      expensive: { effect: "reverb", settings: { decay: 4, wet: 0.7 } },
      processed: { effect: "chorus", settings: { frequency: 2, delayTime: 2.5, depth: 0.7, wet: 0.6 } },
      industrial: { effect: "distortion", settings: { distortion: 0.4, wet: 0.4 } },
      overpriced: { effect: "phaser", settings: { frequency: 0.6, octaves: 3, wet: 0.6 } },
      vomit: { effect: "chebyshev", settings: { order: 25, wet: 0.4 } },
      artisanal: { effect: "tremolo", settings: { frequency: 5, depth: 0.5, wet: 0.6 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.2, feedback: 0.4, wet: 0.2 } },
      luxury: { effect: "reverb", settings: { decay: 6, wet: 0.8 } },
      artificial: { effect: "vibrato", settings: { frequency: 4, depth: 0.4, wet: 0.5 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 3, wet: 0.6 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.18, feedback: 0.6, wet: 0.3 } },
      // New effects - perfect for chocolate's smooth character
      packaged: { effect: "packaged", settings: { frequency: 7, depth: 0.6, wet: 0.5 } },
      glass: { effect: "glass", settings: { delayTime: 0.2, feedback: 0.35, wet: 0.45 } }
    },
    
    candy: {
      create: () => new Tone.AMSynth({
        oscillator: { type: "square" },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.3 },
        modulation: { type: "sine" },
        modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 }
      }),
      note: "G4",
      pattern: "8n",
      color: "#ff69b4", // Hot Pink
      description: "High-pitched AM synth",
      category: "sweets",
      // Modifiers
      fresh: { octave: 1, filter: null },
      old: { octave: -1, filter: "lowpass" },
      strong: { octave: -1, filter: "lowpass" },
      flavorless: { octave: 1, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 2, wet: 0.9 } },
      expensive: { effect: "reverb", settings: { decay: 2, wet: 0.4 } },
      processed: { effect: "chorus", settings: { frequency: 4, delayTime: 1, depth: 0.9, wet: 0.7 } },
      industrial: { effect: "distortion", settings: { distortion: 0.7, wet: 0.6 } },
      overpriced: { effect: "phaser", settings: { frequency: 1.2, octaves: 4, wet: 0.7 } },
      vomit: { effect: "chebyshev", settings: { order: 30, wet: 0.6 } },
      artisanal: { effect: "tremolo", settings: { frequency: 10, depth: 0.9, wet: 0.8 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.08, feedback: 0.8, wet: 0.4 } },
      luxury: { effect: "reverb", settings: { decay: 3, wet: 0.5 } },
      artificial: { effect: "vibrato", settings: { frequency: 8, depth: 0.8, wet: 0.7 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 1, wet: 0.9 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.05, feedback: 0.9, wet: 0.5 } }
    },
    
energy_drink: {
      create: () => new Tone.FMSynth({
        harmonicity: 2,
        modulationIndex: 5,
        oscillator: { type: "sine" },
        envelope: { attack: 0.005, decay: 0.2, sustain: 0.4, release: 0.3 },
        modulation: { type: "sine" },
        modulationEnvelope: { attack: 0.005, decay: 0.1, sustain: 0.5, release: 0.2 }
      }),
      note: "G3",
      pattern: "8n",
      color: "#39ff14", // Neon Green
      description: "Buzzy FM synth with energy",
      category: "beverage",
      // Modifiers
      fresh: { octave: 1, filter: "bandpass" },
      old: { octave: -1, filter: "lowpass" },
      strong: { octave: -1, filter: "lowpass" },
      flavorless: { octave: 1, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 1, wet: 0.9 } },
      expensive: { effect: "reverb", settings: { decay: 4, wet: 0.6 } },
      processed: { effect: "chorus", settings: { frequency: 6, delayTime: 1, depth: 1, wet: 0.9 } },
      industrial: { effect: "distortion", settings: { distortion: 1, wet: 1 } },
      overpriced: { effect: "phaser", settings: { frequency: 2, octaves: 5, wet: 0.8 } },
      vomit: { effect: "chebyshev", settings: { order: 100, wet: 0.8 } },
      artisanal: { effect: "tremolo", settings: { frequency: 15, depth: 1, wet: 0.8 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.06, feedback: 0.9, wet: 0.4 } },
      luxury: { effect: "reverb", settings: { decay: 5, wet: 0.7 } },
      artificial: { effect: "vibrato", settings: { frequency: 10, depth: 1, wet: 0.9 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 1, wet: 1 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.05, feedback: 0.95, wet: 0.6 } },
      // New effects - perfect for energy drink's intense character
      packaged: { effect: "packaged", settings: { frequency: 16, depth: 1, wet: 0.9 } },
      glass: { effect: "glass", settings: { delayTime: 0.06, feedback: 0.9, wet: 0.6 } }
    },
    
    // New products for more variety
    coffee: {
      create: () => new Tone.MonoSynth({
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.4 },
        filter: { Q: 3, frequency: 800, type: "bandpass" },
        filterEnvelope: { attack: 0.005, decay: 0.2, sustain: 0.5, release: 0.3, baseFrequency: 600, octaves: 3 }
      }),
      note: "Bb2",
      pattern: "8n",
      color: "#6f4e37", // Coffee brown
      description: "Dark, filtered sawtooth with bite",
      category: "beverage",
      // Modifiers
      fresh: { octave: 1, filter: null },
      old: { octave: -1, filter: "lowpass" },
      strong: { octave: -1, filter: "lowpass" },
      flavorless: { octave: 1, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 3, wet: 0.7 } },
      expensive: { effect: "reverb", settings: { decay: 3, wet: 0.5 } },
      processed: { effect: "chorus", settings: { frequency: 2, delayTime: 2, depth: 0.6, wet: 0.5 } },
      industrial: { effect: "distortion", settings: { distortion: 0.6, wet: 0.5 } },
      overpriced: { effect: "phaser", settings: { frequency: 0.8, octaves: 3, wet: 0.6 } },
      vomit: { effect: "chebyshev", settings: { order: 30, wet: 0.5 } },
      artisanal: { effect: "tremolo", settings: { frequency: 6, depth: 0.7, wet: 0.6 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.125, feedback: 0.5, wet: 0.3 } },
      luxury: { effect: "reverb", settings: { decay: 5, wet: 0.7 } },
      artificial: { effect: "vibrato", settings: { frequency: 4, depth: 0.5, wet: 0.5 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 2, wet: 0.8 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.1, feedback: 0.7, wet: 0.4 } }
    },
    
    butter: {
      create: () => new Tone.DuoSynth({
        vibratoAmount: 0.3,
        vibratoRate: 2,
        harmonicity: 0.99, // Very slight detuning for creaminess
        voice0: {
          oscillator: { type: "sine" },
          envelope: { attack: 0.2, decay: 0.5, sustain: 0.8, release: 1.5 },
          filter: { Q: 0.5, frequency: 600, type: "lowpass" }
        },
        voice1: {
          oscillator: { type: "triangle" },
          envelope: { attack: 0.3, decay: 0.4, sustain: 0.7, release: 1.8 }
        }
      }),
      note: "F3",
      pattern: "2n",
      color: "#fffacd", // Light yellow
      description: "Creamy detuned duo synth",
      category: "dairy",
      // Modifiers
      fresh: { octave: 0, filter: null },
      old: { octave: -1, filter: "lowpass" },
      strong: { octave: -1, filter: "lowpass" },
      flavorless: { octave: 1, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 6, wet: 0.3 } },
      expensive: { effect: "reverb", settings: { decay: 4, wet: 0.6 } },
      processed: { effect: "chorus", settings: { frequency: 1, delayTime: 4, depth: 0.4, wet: 0.4 } },
      industrial: { effect: "distortion", settings: { distortion: 0.3, wet: 0.3 } },
      overpriced: { effect: "phaser", settings: { frequency: 0.3, octaves: 2, wet: 0.5 } },
      vomit: { effect: "chebyshev", settings: { order: 15, wet: 0.3 } },
      artisanal: { effect: "tremolo", settings: { frequency: 3, depth: 0.4, wet: 0.5 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.5, feedback: 0.2, wet: 0.15 } },
      luxury: { effect: "reverb", settings: { decay: 6, wet: 0.7 } },
      artificial: { effect: "vibrato", settings: { frequency: 2, depth: 0.3, wet: 0.4 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 5, wet: 0.4 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.33, feedback: 0.3, wet: 0.2 } }
    },
    
    eggs: {
      create: () => {
        const synth = new Tone.PluckSynth({
          attackNoise: 4,
          dampening: 4000,
          resonance: 0.98
        });
        // PluckSynth is quieter by default, boost its volume
        synth.volume.value = 6;
        return synth;
      },
      note: "C4",
      pattern: "4n",
      color: "#ffd700", // Golden yellow
      description: "Plucked string with bright attack",
      category: "dairy",
      // Modifiers
      fresh: { octave: 1, filter: null },
      old: { octave: -1, filter: "lowpass" },
      strong: { octave: 0, filter: "lowpass" },
      flavorless: { octave: 1, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 4, wet: 0.5 } },
      expensive: { effect: "reverb", settings: { decay: 3, wet: 0.5 } },
      processed: { effect: "chorus", settings: { frequency: 3, delayTime: 2, depth: 0.7, wet: 0.5 } },
      industrial: { effect: "distortion", settings: { distortion: 0.5, wet: 0.4 } },
      overpriced: { effect: "phaser", settings: { frequency: 0.7, octaves: 3, wet: 0.5 } },
      vomit: { effect: "chebyshev", settings: { order: 25, wet: 0.4 } },
      artisanal: { effect: "tremolo", settings: { frequency: 7, depth: 0.6, wet: 0.5 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.2, feedback: 0.4, wet: 0.2 } },
      luxury: { effect: "reverb", settings: { decay: 5, wet: 0.6 } },
      artificial: { effect: "vibrato", settings: { frequency: 5, depth: 0.5, wet: 0.5 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 3, wet: 0.6 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.16, feedback: 0.5, wet: 0.3 } }
    },
    
    pasta: {
      create: () => new Tone.DuoSynth({
        vibratoAmount: 0.15,
        vibratoRate: 2,
        harmonicity: 1.01,
        voice0: {
          oscillator: { type: "triangle" },
          envelope: { attack: 0.02, decay: 0.25, sustain: 0.4, release: 0.6 }
        },
        voice1: {
          oscillator: { type: "sine" },
          envelope: { attack: 0.03, decay: 0.2, sustain: 0.35, release: 0.5 }
        }
      }),
      note: "G3",
      pattern: "4n",
      color: "#ffd966", // Pasta yellow
      description: "Soft warm duo synth",
      category: "ingredient",
      // Modifiers
      fresh: { octave: 0, filter: null },
      old: { octave: -1, filter: "lowpass" },
      strong: { octave: -1, filter: "lowpass" },
      flavorless: { octave: 1, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 5, wet: 0.4 } },
      expensive: { effect: "reverb", settings: { decay: 4, wet: 0.6 } },
      processed: { effect: "chorus", settings: { frequency: 1.5, delayTime: 3, depth: 0.5, wet: 0.4 } },
      industrial: { effect: "distortion", settings: { distortion: 0.4, wet: 0.3 } },
      overpriced: { effect: "phaser", settings: { frequency: 0.5, octaves: 2, wet: 0.5 } },
      vomit: { effect: "chebyshev", settings: { order: 20, wet: 0.3 } },
      artisanal: { effect: "tremolo", settings: { frequency: 4, depth: 0.5, wet: 0.5 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.25, feedback: 0.3, wet: 0.2 } },
      luxury: { effect: "reverb", settings: { decay: 6, wet: 0.7 } },
      artificial: { effect: "vibrato", settings: { frequency: 3, depth: 0.4, wet: 0.4 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 4, wet: 0.5 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.2, feedback: 0.4, wet: 0.25 } }
    },
    
    rice: {
      create: () => new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0.01, release: 0.1 }
      }),
      note: null, // NoiseSynth doesn't use notes
      pattern: "16n",
      color: "#f5f5dc", // Beige
      description: "Short noise bursts like grains",
      category: "ingredient",
      // Modifiers
      fresh: { octave: 0, filter: "bandpass" },
      old: { octave: 0, filter: "lowpass" },
      strong: { octave: 0, filter: "lowpass" },
      flavorless: { octave: 0, filter: "highpass" },
      cheap: { effect: "bitcrusher", settings: { bits: 2, wet: 0.8 } },
      expensive: { effect: "reverb", settings: { decay: 2, wet: 0.4 } },
      processed: { effect: "chorus", settings: { frequency: 5, delayTime: 1, depth: 0.8, wet: 0.6 } },
      industrial: { effect: "distortion", settings: { distortion: 0.7, wet: 0.5 } },
      overpriced: { effect: "phaser", settings: { frequency: 1, octaves: 4, wet: 0.6 } },
      vomit: { effect: "chebyshev", settings: { order: 40, wet: 0.5 } },
      artisanal: { effect: "tremolo", settings: { frequency: 8, depth: 0.7, wet: 0.6 } },
      bargain: { effect: "feedback-delay", settings: { delayTime: 0.08, feedback: 0.6, wet: 0.3 } },
      luxury: { effect: "reverb", settings: { decay: 3, wet: 0.5 } },
      artificial: { effect: "vibrato", settings: { frequency: 6, depth: 0.6, wet: 0.6 } },
      "mass-produced": { effect: "bitcrusher", settings: { bits: 1, wet: 0.9 } },
      addictive: { effect: "ping-pong-delay", settings: { delayTime: 0.06, feedback: 0.7, wet: 0.4 } }
    }
  };