// product-types.js - Defines all synth products available in the horror supermarket

// Product definitions (synths) - Making this globally available
window.productTypes = {
  beer: {
    create: () => new Tone.FMSynth({
      harmonicity: 3,
      modulationIndex: 10,
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.5 },
    }).toDestination(),
    note: "C4",
    pattern: "8n",
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
    artisanal: { effect: "tremolo", settings: { frequency: 10, depth: 0.8, wet: 0.7 } }
  },
  salad: {
    create: () => new Tone.AMSynth({
      oscillator: { type: "square" },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.5 },
    }).toDestination(),
    note: "E4",
    pattern: "16n",
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
    artisanal: { effect: "tremolo", settings: { frequency: 8, depth: 0.5, wet: 0.6 } }
  },
  ham: {
    create: () => new Tone.MonoSynth({
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 0.8 },
    }).toDestination(),
    note: "G4",
    pattern: "4n",
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
    artisanal: { effect: "tremolo", settings: { frequency: 6, depth: 0.6, wet: 0.5 } }
  },
  milk: {
    create: () => new Tone.PluckSynth({
      attackNoise: 1,
      dampening: 4000,
      resonance: 0.7,
    }).toDestination(),
    note: "A4",
    pattern: "16n",
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
    artisanal: { effect: "tremolo", settings: { frequency: 5, depth: 0.4, wet: 0.5 } }
  },
  chips: {
    create: () => new Tone.NoiseSynth({
      noise: { type: "white" },
      envelope: { attack: 0.001, decay: 0.2, sustain: 0.1, release: 0.3 },
    }).toDestination(),
    note: "C3", // For compatibility, not actually used
    pattern: "16t",
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
    artisanal: { effect: "tremolo", settings: { frequency: 12, depth: 1, wet: 0.6 } }
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
    }).toDestination(),
    note: "D4",
    pattern: "8n",
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
    artisanal: { effect: "tremolo", settings: { frequency: 7, depth: 0.7, wet: 0.6 } }
  },
  oil: {
    create: () => new Tone.MembraneSynth({
      pitchDecay: 0.1,
      octaves: 8,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
    }).toDestination(),
    note: "F2",
    pattern: "2n",
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
    artisanal: { effect: "tremolo", settings: { frequency: 3, depth: 0.9, wet: 0.7 } }
  },
  pinard: {
    create: () => new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.1, decay: 0.1, sustain: 0.8, release: 1.5 }
    }).toDestination(),
    note: ["B3", "D4", "F#4"], // Chord for wine
    pattern: "4n",
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
    artisanal: { effect: "tremolo", settings: { frequency: 4, depth: 0.5, wet: 0.6 } }
  },
  huitsix: {
    create: () => new Tone.AMSynth({
      harmonicity: 2.5,
      oscillator: { type: "square8" },
      envelope: { attack: 0.05, decay: 0.3, sustain: 0.5, release: 0.8 },
      modulation: { type: "sawtooth" }
    }).toDestination(),
    note: "G2",
    pattern: "8t",
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
    artisanal: { effect: "tremolo", settings: { frequency: 9, depth: 0.8, wet: 0.7 } }
  },
  rotting: {
    create: () => new Tone.MetalSynth({
      frequency: 60,
      envelope: { attack: 0.005, decay: 0.6, sustain: 0.3, release: 0.3 },
      harmonicity: 8.1,
      modulationIndex: 20,
      resonance: 2000,
      octaves: 1.5
    }).toDestination(),
    note: "C2", // Not used for MetalSynth but needed for compatibility
    pattern: "8n",
    fresh: { octave: 1, filter: "bandpass" },
    old: { octave: -1, filter: "lowpass" },
    strong: { octave: -1, filter: "lowpass" },
    flavorless: { octave: 1, filter: "highpass" },
    cheap: { effect: "bitcrusher", settings: { bits: 1, wet: 0.8 } },
    expensive: { effect: "reverb", settings: { decay: 8, wet: 0.9 } },
    processed: { effect: "chorus", settings: { frequency: 0.2, delayTime: 4, depth: 0.8, wet: 0.7 } },
    industrial: { effect: "distortion", settings: { distortion: 1, wet: 0.9 } },
    overpriced: { effect: "phaser", settings: { frequency: 0.1, octaves: 8, wet: 0.8 } },
    vomit: { effect: "chebyshev", settings: { order: 100, wet: 1 } },
    artisanal: { effect: "tremolo", settings: { frequency: 2, depth: 1, wet: 0.9 } }
  }
};