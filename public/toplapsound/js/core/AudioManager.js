/**
 * AudioManager.js - Gestion centralisée de l'audio avec Tone.js
 * Sound Synthesis Explorer - TOPLAP Strasbourg
 */

class AudioManager {
  constructor() {
    this.isInitialized = false;
    this.isPlaying = false;
    this.currentSources = [];
    this.masterGain = null;
    this.analyser = null;
    this.context = null;
    
    // Stockage des instances audio actives
    this.activeOscillators = new Map();
    this.activeFilters = new Map();
    this.activeEnvelopes = new Map();
    this.activeLFOs = new Map();
    
    // Configuration par défaut
    this.defaultVolume = 0.3;
    this.maxPolyphony = 8;
    
    // Notes et fréquences
    this.noteFrequencies = {
      'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56,
      'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00,
      'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
      'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
      'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
      'C5': 523.25
    };
    
    this.bindMethods();
  }
  
  bindMethods() {
    this.initialize = this.initialize.bind(this);
    this.cleanup = this.cleanup.bind(this);
    this.noteToFrequency = this.noteToFrequency.bind(this);
  }
  
  /**
   * Initialise le contexte audio et Tone.js
   */
  async initialize() {
    try {
      if (this.isInitialized) {
        console.warn('[AudioManager] Already initialized');
        return true;
      }
      
      // Démarrer Tone.js
      await Tone.start();
      console.log('[AudioManager] Tone.js started');
      
      // Créer le gain maître
      this.masterGain = new Tone.Gain(this.defaultVolume).toDestination();
      
      // Créer l'analyseur pour les visualisations
      this.analyser = new Tone.Analyser('waveform', 1024);
      this.masterGain.connect(this.analyser);
      
      // Référence au contexte audio
      this.context = Tone.context;
      
      this.isInitialized = true;
      console.log('[AudioManager] Initialized successfully');
      return true;
      
    } catch (error) {
      console.error('[AudioManager] Initialization failed:', error);
      return false;
    }
  }
  
  /**
   * Convertit une note en fréquence
   */
  noteToFrequency(note) {
    if (typeof note === 'number') {
      return Math.max(20, Math.min(20000, note));
    }
    
    if (typeof note === 'string') {
      const freq = this.noteFrequencies[note];
      if (freq) {
        return freq;
      }
      
      // Parse note format like "A4", "C#3"
      const match = note.match(/([A-G]#?)(\d+)/);
      if (match) {
        const [, noteName, octave] = match;
        const noteNumber = this.noteNameToNumber(noteName);
        const freq = 440 * Math.pow(2, (noteNumber + (parseInt(octave) - 4) * 12 - 9) / 12);
        return Math.round(freq * 100) / 100;
      }
    }
    
    return 440; // Default to A4
  }
  
  /**
   * Convertit un nom de note en numéro MIDI relatif
   */
  noteNameToNumber(noteName) {
    const noteMap = {
      'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
      'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
    };
    return noteMap[noteName] || 9; // Default to A
  }
  
createOscillator(waveform, frequency) {
  try {
    if (!this.isReady()) {
      console.warn('[AudioManager] Not ready to create oscillator');
      return null;
    }
    
    // Convertir note en fréquence si nécessaire
    const freq = this.noteToFrequency(frequency);
    
    // Valider la fréquence
    if (typeof freq !== 'number' || freq < 20 || freq > 20000) {
      console.warn('[AudioManager] Invalid frequency:', freq);
      return null;
    }
    
    // Valider la forme d'onde
    const validWaveforms = ['sine', 'square', 'sawtooth', 'triangle'];
    if (!validWaveforms.includes(waveform)) {
      console.warn('[AudioManager] Invalid waveform:', waveform);
      waveform = 'sine';
    }
    
    // Créer l'oscillateur
    const oscillator = new Tone.Oscillator(freq, waveform);
    
    // Tracking pour cleanup
    this.addComponent(oscillator);
    
    console.log(`[AudioManager] Created ${waveform} oscillator at ${freq.toFixed(1)}Hz`);
    return oscillator;
    
  } catch (error) {
    console.error('[AudioManager] Failed to create oscillator:', error);
    return null;
  }
}
  
  /**
   * Crée un générateur de bruit
   */
  createNoise(type = 'white') {
    try {
      const noise = new Tone.Noise(type);
      this.addComponent(noise);
      return noise;
      
    } catch (error) {
      console.error('[AudioManager] Failed to create noise:', error);
      return null;
    }
  }
  
  /**
   * Crée un filtre
   */
  createFilter(type = 'lowpass', frequency = 1000, Q = 1) {
    try {
      frequency = Math.max(20, Math.min(20000, frequency));
      Q = Math.max(0.1, Math.min(30, Q));
      
      const filter = new Tone.Filter({
        type: type,
        frequency: frequency,
        Q: Q
      });
      
      this.addComponent(filter);
      return filter;
      
    } catch (error) {
      console.error('[AudioManager] Failed to create filter:', error);
      return null;
    }
  }
  
  /**
   * Crée une enveloppe ADSR
   */
  createEnvelope(attack = 0.1, decay = 0.3, sustain = 0.7, release = 0.5) {
    try {
      // Validation des paramètres
      attack = Math.max(0.001, Math.min(5, attack));
      decay = Math.max(0.001, Math.min(5, decay));
      sustain = Math.max(0, Math.min(1, sustain));
      release = Math.max(0.001, Math.min(10, release));
      
      const envelope = new Tone.AmplitudeEnvelope({
        attack: attack,
        decay: decay,
        sustain: sustain,
        release: release
      });
      
      this.addComponent(envelope);
      return envelope;
      
    } catch (error) {
      console.error('[AudioManager] Failed to create envelope:', error);
      return null;
    }
  }
  
  /**
   * Crée un LFO (Low Frequency Oscillator)
   */
  createLFO(frequency = 2, type = 'sine', min = 0, max = 1) {
    try {
      frequency = Math.max(0.01, Math.min(50, frequency));
      
      const lfo = new Tone.LFO({
        frequency: frequency,
        type: type,
        min: min,
        max: max
      });
      
      this.addComponent(lfo);
      return lfo;
      
    } catch (error) {
      console.error('[AudioManager] Failed to create LFO:', error);
      return null;
    }
  }
  
/**
 * Fonctions manquantes à ajouter dans AudioManager.js
 * Ajoutez ces fonctions dans la classe AudioManager
 */

/**
 * Convertit une fréquence en nom de note
 * @param {number} frequency - Fréquence en Hz
 * @returns {string} - Nom de la note (ex: "A4", "C#3")
 */
frequencyToNote(frequency) {
  try {
    // Référence A4 = 440 Hz
    const A4 = 440;
    const A4_INDEX = 57; // Index de A4 dans le système MIDI (C0 = 0)
    
    // Calculer le nombre de demi-tons par rapport à A4
    const semitones = Math.round(12 * Math.log2(frequency / A4));
    const noteIndex = A4_INDEX + semitones;
    
    // Noms des notes
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // Calculer l'octave et la note
    const octave = Math.floor(noteIndex / 12);
    const noteNameIndex = noteIndex % 12;
    
    // Gérer les indices négatifs
    const adjustedNoteIndex = noteNameIndex < 0 ? noteNameIndex + 12 : noteNameIndex;
    const adjustedOctave = noteNameIndex < 0 ? octave - 1 : octave;
    
    return noteNames[adjustedNoteIndex] + adjustedOctave;
    
  } catch (error) {
    console.error('[AudioManager] Error converting frequency to note:', error);
    return 'A4'; // Valeur par défaut
  }
}

/**
 * Convertit un nom de note en fréquence - VERSION CORRIGÉE
 * @param {string|number} note - Nom de la note (ex: "A4", "C#3") ou fréquence directe
 * @returns {number} - Fréquence en Hz
 */
noteToFrequency(note) {
  try {
    // Si c'est déjà un nombre, le retourner directement
    if (typeof note === 'number') {
      return note;
    }
    
    // Si ce n'est pas une chaîne, essayer de convertir
    if (typeof note !== 'string') {
      console.warn('[AudioManager] Note must be string or number, got:', typeof note, note);
      return 440; // A4 par défaut
    }
    
    // Parse la note
    const noteRegex = /^([A-G])(#|b)?(\d+)$/;
    const match = note.match(noteRegex);
    
    if (!match) {
      console.warn('[AudioManager] Invalid note format:', note);
      return 440; // A4 par défaut
    }
    
    const [, noteName, accidental, octaveStr] = match;
    const octave = parseInt(octaveStr);
    
    // Table des notes
    const noteOffsets = {
      'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
    };
    
    let noteOffset = noteOffsets[noteName];
    
    // Appliquer les altérations
    if (accidental === '#') {
      noteOffset += 1;
    } else if (accidental === 'b') {
      noteOffset -= 1;
    }
    
    // Calculer l'index MIDI (C4 = 60)
    const midiNumber = (octave + 1) * 12 + noteOffset;
    
    // Convertir en fréquence (A4 = 440 Hz = MIDI 69)
    const frequency = 440 * Math.pow(2, (midiNumber - 69) / 12);
    
    return frequency;
    
  } catch (error) {
    console.error('[AudioManager] Error converting note to frequency:', error);
    return 440; // A4 par défaut
  }
}

/**
 * Obtient une liste de notes dans une gamme
 * @param {string} startNote - Note de début
 * @param {string} endNote - Note de fin
 * @returns {Array<string>} - Array des noms de notes
 */
getNoteRange(startNote = 'C3', endNote = 'C5') {
  try {
    const startFreq = this.noteToFrequency(startNote);
    const endFreq = this.noteToFrequency(endNote);
    
    const notes = [];
    const startMidi = this.frequencyToMidi(startFreq);
    const endMidi = this.frequencyToMidi(endFreq);
    
    for (let midi = startMidi; midi <= endMidi; midi++) {
      const freq = this.midiToFrequency(midi);
      const note = this.frequencyToNote(freq);
      notes.push(note);
    }
    
    return notes;
    
  } catch (error) {
    console.error('[AudioManager] Error getting note range:', error);
    return ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']; // Gamme par défaut
  }
}

/**
 * Convertit une fréquence en numéro MIDI
 * @param {number} frequency - Fréquence en Hz
 * @returns {number} - Numéro MIDI
 */
frequencyToMidi(frequency) {
  return Math.round(69 + 12 * Math.log2(frequency / 440));
}

/**
 * Convertit un numéro MIDI en fréquence
 * @param {number} midiNumber - Numéro MIDI
 * @returns {number} - Fréquence en Hz
 */
midiToFrequency(midiNumber) {
  return 440 * Math.pow(2, (midiNumber - 69) / 12);
}

/**
 * Valide si une chaîne est une note valide
 * @param {string} note - Note à valider
 * @returns {boolean} - True si valide
 */
isValidNote(note) {
  const noteRegex = /^([A-G])(#|b)?(\d+)$/;
  return noteRegex.test(note);
}

/**
 * Obtient la note la plus proche d'une fréquence
 * @param {number} frequency - Fréquence en Hz
 * @returns {object} - {note: string, cents: number}
 */
getClosestNote(frequency) {
  try {
    const note = this.frequencyToNote(frequency);
    const noteFreq = this.noteToFrequency(note);
    const cents = Math.round(1200 * Math.log2(frequency / noteFreq));
    
    return {
      note: note,
      cents: cents,
      frequency: noteFreq
    };
    
  } catch (error) {
    console.error('[AudioManager] Error getting closest note:', error);
    return { note: 'A4', cents: 0, frequency: 440 };
  }
}

  /**
   * Crée un synthétiseur FM
   */
  createFMSynth(config = {}) {
    try {
      const defaultConfig = {
        harmonicity: 1,
        modulationIndex: 5,
        detune: 0,
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.01,
          decay: 0.8,
          sustain: 0.2,
          release: 0.5
        },
        modulation: { type: 'sine' },
        modulationEnvelope: {
          attack: 0.01,
          decay: 0.8,
          sustain: 0.2,
          release: 0.5
        }
      };
      
      const fmConfig = { ...defaultConfig, ...config };
      const fmSynth = new Tone.FMSynth(fmConfig);
      
      this.addComponent(fmSynth);
      return fmSynth;
      
    } catch (error) {
      console.error('[AudioManager] Failed to create FM synth:', error);
      return null;
    }
  }
  
  /**
   * Crée un synthétiseur soustractif (Mono)
   */
  createMonoSynth(config = {}) {
    try {
      const defaultConfig = {
        oscillator: { type: 'sawtooth' },
        filter: {
          Q: 5,
          type: 'lowpass',
          rolloff: -24
        },
        envelope: {
          attack: 0.1,
          decay: 0.3,
          sustain: 0.7,
          release: 0.5
        },
        filterEnvelope: {
          attack: 0.1,
          decay: 0.3,
          sustain: 0.1,
          release: 0.5,
          baseFrequency: 200,
          octaves: 4
        }
      };
      
      const monoConfig = { ...defaultConfig, ...config };
      const monoSynth = new Tone.MonoSynth(monoConfig);
      
      this.addComponent(monoSynth);
      return monoSynth;
      
    } catch (error) {
      console.error('[AudioManager] Failed to create mono synth:', error);
      return null;
    }
  }
  
  /**
   * Crée un séquenceur
   */
  createSequence(callback, events, subdivision = '8n') {
    try {
      const sequence = new Tone.Sequence(callback, events, subdivision);
      this.addComponent(sequence);
      return sequence;
      
    } catch (error) {
      console.error('[AudioManager] Failed to create sequence:', error);
      return null;
    }
  }
  
  /**
   * Crée un délai/écho
   */
  createDelay(delayTime = 0.3, feedback = 0.4, wet = 0.3) {
    try {
      const delay = new Tone.FeedbackDelay({
        delayTime: delayTime,
        feedback: feedback,
        wet: wet
      });
      
      this.addComponent(delay);
      return delay;
      
    } catch (error) {
      console.error('[AudioManager] Failed to create delay:', error);
      return null;
    }
  }
  
  /**
   * Crée une reverb
   */
  createReverb(roomSize = 0.7, dampening = 0.8, wet = 0.3) {
    try {
      const reverb = new Tone.Reverb({
        decay: roomSize * 4,
        wet: wet
      });
      
      this.addComponent(reverb);
      return reverb;
      
    } catch (error) {
      console.error('[AudioManager] Failed to create reverb:', error);
      return null;
    }
  }
  
  /**
   * Crée un compresseur/limiteur
   */
  createCompressor(threshold = -24, ratio = 8, attack = 0.01, release = 0.1) {
    try {
      const compressor = new Tone.Compressor({
        threshold: threshold,
        ratio: ratio,
        attack: attack,
        release: release
      });
      
      this.addComponent(compressor);
      return compressor;
      
    } catch (error) {
      console.error('[AudioManager] Failed to create compressor:', error);
      return null;
    }
  }
  
  /**
   * Joue une note avec un synthétiseur
   */
  playNote(synth, note, duration = '8n', velocity = 0.8, time = Tone.now()) {
    try {
      if (!synth || !synth.triggerAttackRelease) {
        console.warn('[AudioManager] Invalid synth for playNote');
        return false;
      }
      
      const frequency = this.noteToFrequency(note);
      synth.triggerAttackRelease(frequency, duration, time, velocity);
      return true;
      
    } catch (error) {
      console.error('[AudioManager] Failed to play note:', error);
      return false;
    }
  }
  
  /**
   * Démarre une note (sans release automatique)
   */
  triggerAttack(synth, note, velocity = 0.8, time = Tone.now()) {
    try {
      if (!synth || !synth.triggerAttack) {
        console.warn('[AudioManager] Invalid synth for triggerAttack');
        return false;
      }
      
      const frequency = this.noteToFrequency(note);
      synth.triggerAttack(frequency, time, velocity);
      return true;
      
    } catch (error) {
      console.error('[AudioManager] Failed to trigger attack:', error);
      return false;
    }
  }
  
  /**
   * Arrête une note
   */
  triggerRelease(synth, time = Tone.now()) {
    try {
      if (!synth || !synth.triggerRelease) {
        console.warn('[AudioManager] Invalid synth for triggerRelease');
        return false;
      }
      
      synth.triggerRelease(time);
      return true;
      
    } catch (error) {
      console.error('[AudioManager] Failed to trigger release:', error);
      return false;
    }
  }
  
  /**
   * Démarre le transport (pour les séquences)
   */
  startTransport() {
    try {
      Tone.Transport.start();
      console.log('[AudioManager] Transport started');
      return true;
      
    } catch (error) {
      console.error('[AudioManager] Failed to start transport:', error);
      return false;
    }
  }
  
  /**
   * Arrête le transport
   */
  stopTransport() {
    try {
      Tone.Transport.stop();
      console.log('[AudioManager] Transport stopped');
      return true;
      
    } catch (error) {
      console.error('[AudioManager] Failed to stop transport:', error);
      return false;
    }
  }
  
  /**
   * Définit le tempo du transport
   */
  setTempo(bpm) {
    try {
      bpm = Math.max(60, Math.min(200, bpm));
      Tone.Transport.bpm.value = bpm;
      console.log(`[AudioManager] Tempo set to ${bpm} BPM`);
      return true;
      
    } catch (error) {
      console.error('[AudioManager] Failed to set tempo:', error);
      return false;
    }
  }
  
  /**
   * Obtient les données de l'analyseur pour visualisations
   */
  getAnalyserData() {
    try {
      if (!this.analyser) {
        return null;
      }
      
      return this.analyser.getValue();
      
    } catch (error) {
      console.error('[AudioManager] Failed to get analyser data:', error);
      return null;
    }
  }
  
  /**
   * Obtient les données FFT pour spectre
   */
  getFFTData(size = 1024) {
    try {
      if (!this.analyser) {
        // Créer un analyseur FFT temporaire si nécessaire
        const fftAnalyser = new Tone.Analyser('fft', size);
        this.masterGain.connect(fftAnalyser);
        const data = fftAnalyser.getValue();
        fftAnalyser.dispose();
        return data;
      }
      
      return this.analyser.getValue();
      
    } catch (error) {
      console.error('[AudioManager] Failed to get FFT data:', error);
      return null;
    }
  }
  
  /**
   * Ajoute un composant à la liste de tracking
   */
  addComponent(component) {
    if (component && !this.currentSources.includes(component)) {
      this.currentSources.push(component);
    }
  }
  
  /**
   * Supprime un composant du tracking
   */
  removeComponent(component) {
    const index = this.currentSources.indexOf(component);
    if (index > -1) {
      this.currentSources.splice(index, 1);
    }
  }
  
  /**
   * Définit le volume maître
   */
  setMasterVolume(volume) {
    try {
      volume = Math.max(0, Math.min(1, volume));
      if (this.masterGain) {
        this.masterGain.gain.value = volume;
        console.log(`[AudioManager] Master volume set to ${volume}`);
      }
      return true;
      
    } catch (error) {
      console.error('[AudioManager] Failed to set master volume:', error);
      return false;
    }
  }
  
  /**
   * Obtient le volume maître actuel
   */
  getMasterVolume() {
    try {
      return this.masterGain ? this.masterGain.gain.value : 0;
    } catch (error) {
      console.error('[AudioManager] Failed to get master volume:', error);
      return 0;
    }
  }
  
  /**
   * Arrête tous les sons en cours
   */
  stopAll() {
    try {
      // Arrêter le transport
      this.stopTransport();
      
      // Dispose de tous les composants trackés
      this.currentSources.forEach(source => {
        try {
          if (source && typeof source.dispose === 'function') {
            source.dispose();
          } else if (source && typeof source.stop === 'function') {
            source.stop();
          }
        } catch (error) {
          console.warn('[AudioManager] Error disposing component:', error);
        }
      });
      
      // Vider la liste
      this.currentSources = [];
      
      // Reset des maps
      this.activeOscillators.clear();
      this.activeFilters.clear();
      this.activeEnvelopes.clear();
      this.activeLFOs.clear();
      
      console.log('[AudioManager] All audio stopped and cleaned up');
      return true;
      
    } catch (error) {
      console.error('[AudioManager] Failed to stop all audio:', error);
      return false;
    }
  }
  
  /**
   * Nettoyage complet des ressources
   */
  cleanup() {
    try {
      this.stopAll();
      
      // Dispose des composants principaux
      if (this.analyser) {
        this.analyser.dispose();
        this.analyser = null;
      }
      
      if (this.masterGain) {
        this.masterGain.dispose();
        this.masterGain = null;
      }
      
      this.isInitialized = false;
      this.isPlaying = false;
      this.context = null;
      
      console.log('[AudioManager] Cleanup completed');
      return true;
      
    } catch (error) {
      console.error('[AudioManager] Cleanup failed:', error);
      return false;
    }
  }
  
  /**
   * Vérifie si l'AudioManager est prêt
   */
  isReady() {
    return this.isInitialized && this.masterGain && Tone.context.state === 'running';
  }
  
  /**
   * Obtient des informations de statut
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      playing: this.isPlaying,
      contextState: Tone.context?.state || 'unknown',
      activeComponents: this.currentSources.length,
      masterVolume: this.getMasterVolume(),
      sampleRate: Tone.context?.sampleRate || 0,
      currentTime: Tone.now()
    };
  }
}

// Créer l'instance globale
window.audioManager = new AudioManager();

console.log('[AudioManager] Class loaded and global instance created');