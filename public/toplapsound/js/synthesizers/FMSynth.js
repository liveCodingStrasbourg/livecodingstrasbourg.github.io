/**
 * FMSynth.js - Synthétiseur FM avancé avec algorithmes multiples
 * Sound Synthesis Explorer - TOPLAP Strasbourg
 */

class FMSynth {
  constructor() {
    this.isPlaying = false;
    this.components = [];
    this.activeNotes = new Map();
    
    // Composants audio
    this.carrier = null;          // Oscillateur porteur
    this.modulator = null;        // Oscillateur modulateur
    this.modulatorEnvelope = null; // Enveloppe du modulateur
    this.carrierEnvelope = null;   // Enveloppe du porteur
    this.modulationGain = null;    // Gain de modulation
    this.finalGain = null;         // Gain final
    
    // Configuration par défaut
    this.config = {
      // Porteur
      carrier: {
        waveform: 'sine',
        frequency: 440,
        amplitude: 0.7,
        detune: 0
      },
      
      // Modulateur
      modulator: {
        waveform: 'sine',
        ratio: 1,              // Ratio harmonique (modulateur freq = carrier freq * ratio)
        index: 5,              // Index de modulation (profondeur)
        detune: 0
      },
      
      // Enveloppe modulateur
      modulatorEnvelope: {
        attack: 0.01,
        decay: 0.8,
        sustain: 0.2,
        release: 0.5
      },
      
      // Enveloppe porteur
      carrierEnvelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.8,
        release: 0.5
      },
      
      // Algorithme FM
      algorithm: 'simple',       // 'simple', 'feedback', 'parallel', 'complex'
      feedback: 0,              // Rétroaction du modulateur (0-1)
      
      // Global
      masterVolume: 0.6,
      polyphony: 4
    };
    
    // Définitions des algorithmes FM
    this.algorithms = {
      'simple': this.createSimpleAlgorithm.bind(this),
      'feedback': this.createFeedbackAlgorithm.bind(this),
      'parallel': this.createParallelAlgorithm.bind(this),
      'complex': this.createComplexAlgorithm.bind(this)
    };
    
    this.bindMethods();
  }
  
  bindMethods() {
    this.cleanup = this.cleanup.bind(this);
    this.playNote = this.playNote.bind(this);
    this.stopNote = this.stopNote.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
    this.triggerAttack = this.triggerAttack.bind(this);
    this.triggerRelease = this.triggerRelease.bind(this);
  }
  

      
  /**
   * Joue une note FM
   */
  playNote(note, duration = null, velocity = 0.8) {
    try {
      if (!window.audioManager || !window.audioManager.isReady()) {
        console.warn('[FMSynth] AudioManager not ready');
        return false;
      }
      
      const frequency = window.audioManager.noteToFrequency(note);
      const noteId = note + '_' + Date.now();
      
      // Vérifier la limite de polyphonie
      if (this.activeNotes.size >= this.config.polyphony) {
        const oldestNote = this.activeNotes.keys().next().value;
        this.stopNote(oldestNote);
      }
      
      // Créer la voix FM
      const voice = this.createFMVoice(frequency, velocity);
      if (!voice) {
        return false;
      }
      
      this.activeNotes.set(noteId, voice);
      this.isPlaying = true;
      
      console.log(`[FMSynth] Playing FM note ${note} (${frequency.toFixed(1)}Hz), ratio: ${this.config.modulator.ratio}, index: ${this.config.modulator.index}`);
      
      // Arrêt automatique si durée spécifiée
      if (duration) {
        setTimeout(() => {
          this.stopNote(noteId);
        }, duration * 1000);
      }
      
      return true;
      
    } catch (error) {
      console.error('[FMSynth] Failed to play note:', error);
      return false;
    }
  }
  
  /**
   * Crée une voix FM selon l'algorithme sélectionné
   */
  createFMVoice(frequency, velocity = 0.8) {
    try {
      const algorithmFunction = this.algorithms[this.config.algorithm];
      if (!algorithmFunction) {
        throw new Error(`Unknown algorithm: ${this.config.algorithm}`);
      }
      
      return algorithmFunction(frequency, velocity);
      
    } catch (error) {
      console.error('[FMSynth] Failed to create FM voice:', error);
      return null;
    }
  }
  
  /**
   * Algorithme FM simple : Modulateur → Porteur
   */
  createSimpleAlgorithm(frequency, velocity) {
    const voice = {
      components: [],
      frequency: frequency,
      velocity: velocity,
      algorithm: 'simple'
    };
    
    // Créer le porteur
    voice.carrier = window.audioManager.createOscillator(
      this.config.carrier.waveform,
      frequency
    );
    
    // Créer le modulateur
    const modulatorFreq = frequency * this.config.modulator.ratio;
    voice.modulator = window.audioManager.createOscillator(
      this.config.modulator.waveform,
      modulatorFreq
    );
    
    if (!voice.carrier || !voice.modulator) {
      throw new Error('Failed to create carrier or modulator');
    }
    
    voice.components.push(voice.carrier, voice.modulator);
    
    // Créer le gain de modulation (index de modulation)
    voice.modulationGain = new Tone.Gain(this.config.modulator.index * modulatorFreq);
    voice.components.push(voice.modulationGain);
    
    // Créer les enveloppes
    voice.modulatorEnvelope = window.audioManager.createEnvelope(
      this.config.modulatorEnvelope.attack,
      this.config.modulatorEnvelope.decay,
      this.config.modulatorEnvelope.sustain,
      this.config.modulatorEnvelope.release
    );
    
    voice.carrierEnvelope = window.audioManager.createEnvelope(
      this.config.carrierEnvelope.attack,
      this.config.carrierEnvelope.decay,
      this.config.carrierEnvelope.sustain,
      this.config.carrierEnvelope.release
    );
    
    if (!voice.modulatorEnvelope || !voice.carrierEnvelope) {
      throw new Error('Failed to create envelopes');
    }
    
    voice.components.push(voice.modulatorEnvelope, voice.carrierEnvelope);
    
    // Gain final
    voice.finalGain = new Tone.Gain(this.config.masterVolume * velocity);
    voice.components.push(voice.finalGain);
    
    // Connexions : Modulateur → ModulationGain → Carrier.frequency
    voice.modulator.connect(voice.modulatorEnvelope);
    voice.modulatorEnvelope.connect(voice.modulationGain);
    voice.modulationGain.connect(voice.carrier.frequency);
    
    // Porteur → CarrierEnvelope → FinalGain → Master
    voice.carrier.connect(voice.carrierEnvelope);
    voice.carrierEnvelope.connect(voice.finalGain);
    voice.finalGain.connect(window.audioManager.masterGain);
    
    // Tracking des composants
    voice.components.forEach(comp => this.addComponent(comp));
    
    // Démarrer
    voice.carrier.start();
    voice.modulator.start();
    voice.modulatorEnvelope.triggerAttack();
    voice.carrierEnvelope.triggerAttack();
    
    return voice;
  }
  
  /**
   * Algorithme FM avec feedback : Modulateur se module lui-même
   */
  createFeedbackAlgorithm(frequency, velocity) {
    const voice = this.createSimpleAlgorithm(frequency, velocity);
    voice.algorithm = 'feedback';
    
    if (this.config.feedback > 0) {
      // Créer le gain de feedback
      voice.feedbackGain = new Tone.Gain(this.config.feedback * frequency);
      voice.components.push(voice.feedbackGain);
      
      // Connexion feedback : Modulateur → FeedbackGain → Modulateur.frequency
      voice.modulator.connect(voice.feedbackGain);
      voice.feedbackGain.connect(voice.modulator.frequency);
      
      this.addComponent(voice.feedbackGain);
    }
    
    return voice;
  }
  
  /**
   * Algorithme parallèle : 2 modulateurs indépendants
   */
  createParallelAlgorithm(frequency, velocity) {
    const voice = {
      components: [],
      frequency: frequency,
      velocity: velocity,
      algorithm: 'parallel'
    };
    
    // Créer le porteur
    voice.carrier = window.audioManager.createOscillator(
      this.config.carrier.waveform,
      frequency
    );
    
    // Créer deux modulateurs
    const modulatorFreq1 = frequency * this.config.modulator.ratio;
    const modulatorFreq2 = frequency * (this.config.modulator.ratio * 1.5); // Ratio différent
    
    voice.modulator1 = window.audioManager.createOscillator(
      this.config.modulator.waveform,
      modulatorFreq1
    );
    
    voice.modulator2 = window.audioManager.createOscillator(
      'triangle', // Forme d'onde différente
      modulatorFreq2
    );
    
    if (!voice.carrier || !voice.modulator1 || !voice.modulator2) {
      throw new Error('Failed to create oscillators for parallel algorithm');
    }
    
    voice.components.push(voice.carrier, voice.modulator1, voice.modulator2);
    
    // Gains de modulation
    voice.modulationGain1 = new Tone.Gain(this.config.modulator.index * modulatorFreq1 * 0.7);
    voice.modulationGain2 = new Tone.Gain(this.config.modulator.index * modulatorFreq2 * 0.3);
    voice.components.push(voice.modulationGain1, voice.modulationGain2);
    
    // Enveloppes
    voice.modulatorEnvelope = window.audioManager.createEnvelope(
      this.config.modulatorEnvelope.attack,
      this.config.modulatorEnvelope.decay,
      this.config.modulatorEnvelope.sustain,
      this.config.modulatorEnvelope.release
    );
    
    voice.carrierEnvelope = window.audioManager.createEnvelope(
      this.config.carrierEnvelope.attack,
      this.config.carrierEnvelope.decay,
      this.config.carrierEnvelope.sustain,
      this.config.carrierEnvelope.release
    );
    
    voice.components.push(voice.modulatorEnvelope, voice.carrierEnvelope);
    
    // Gain final
    voice.finalGain = new Tone.Gain(this.config.masterVolume * velocity);
    voice.components.push(voice.finalGain);
    
    // Connexions parallèles
    voice.modulator1.connect(voice.modulationGain1);
    voice.modulator2.connect(voice.modulationGain2);
    voice.modulationGain1.connect(voice.carrier.frequency);
    voice.modulationGain2.connect(voice.carrier.frequency);
    
    // Enveloppe sur les modulateurs
    voice.modulatorEnvelope.connect(voice.modulationGain1.gain);
    voice.modulatorEnvelope.connect(voice.modulationGain2.gain);
    
    // Sortie
    voice.carrier.connect(voice.carrierEnvelope);
    voice.carrierEnvelope.connect(voice.finalGain);
    voice.finalGain.connect(window.audioManager.masterGain);
    
    // Tracking
    voice.components.forEach(comp => this.addComponent(comp));
    
    // Démarrer
    voice.carrier.start();
    voice.modulator1.start();
    voice.modulator2.start();
    voice.modulatorEnvelope.triggerAttack();
    voice.carrierEnvelope.triggerAttack();
    
    return voice;
  }
  
  /**
   * Algorithme complexe : Chaîne de modulateurs
   */
  createComplexAlgorithm(frequency, velocity) {
    const voice = {
      components: [],
      frequency: frequency,
      velocity: velocity,
      algorithm: 'complex'
    };
    
    // Créer une chaîne de 3 oscillateurs
    voice.carrier = window.audioManager.createOscillator('sine', frequency);
    voice.modulator1 = window.audioManager.createOscillator('sine', frequency * this.config.modulator.ratio);
    voice.modulator2 = window.audioManager.createOscillator('triangle', frequency * this.config.modulator.ratio * 2);
    
    if (!voice.carrier || !voice.modulator1 || !voice.modulator2) {
      throw new Error('Failed to create oscillators for complex algorithm');
    }
    
    voice.components.push(voice.carrier, voice.modulator1, voice.modulator2);
    
    // Gains de modulation en cascade
    voice.modulationGain1 = new Tone.Gain(this.config.modulator.index * frequency * 0.5);
    voice.modulationGain2 = new Tone.Gain(this.config.modulator.index * frequency * 0.3);
    voice.components.push(voice.modulationGain1, voice.modulationGain2);
    
    // Enveloppes
    voice.modulatorEnvelope = window.audioManager.createEnvelope(
      this.config.modulatorEnvelope.attack,
      this.config.modulatorEnvelope.decay,
      this.config.modulatorEnvelope.sustain,
      this.config.modulatorEnvelope.release
    );
    
    voice.carrierEnvelope = window.audioManager.createEnvelope(
      this.config.carrierEnvelope.attack,
      this.config.carrierEnvelope.decay,
      this.config.carrierEnvelope.sustain,
      this.config.carrierEnvelope.release
    );
    
    voice.components.push(voice.modulatorEnvelope, voice.carrierEnvelope);
    
    // Gain final
    voice.finalGain = new Tone.Gain(this.config.masterVolume * velocity);
    voice.components.push(voice.finalGain);
    
    // Connexions en cascade : Mod2 → Mod1 → Carrier
    voice.modulator2.connect(voice.modulationGain2);
    voice.modulationGain2.connect(voice.modulator1.frequency);
    
    voice.modulator1.connect(voice.modulationGain1);
    voice.modulationGain1.connect(voice.carrier.frequency);
    
    // Enveloppe sur la modulation
    voice.modulatorEnvelope.connect(voice.modulationGain1.gain);
    voice.modulatorEnvelope.connect(voice.modulationGain2.gain);
    
    // Sortie
    voice.carrier.connect(voice.carrierEnvelope);
    voice.carrierEnvelope.connect(voice.finalGain);
    voice.finalGain.connect(window.audioManager.masterGain);
    
    // Tracking
    voice.components.forEach(comp => this.addComponent(comp));
    
    // Démarrer
    voice.carrier.start();
    voice.modulator1.start();
    voice.modulator2.start();
    voice.modulatorEnvelope.triggerAttack();
    voice.carrierEnvelope.triggerAttack();
    
    return voice;
  }
  
  /**
   * Déclenche l'attaque d'une note
   */
  triggerAttack(note, velocity = 0.8) {
    return this.playNote(note, null, velocity);
  }
  
  /**
   * Déclenche le relâchement d'une note
   */
  triggerRelease(noteId = null) {
    try {
      if (noteId && this.activeNotes.has(noteId)) {
        const voice = this.activeNotes.get(noteId);
        this.releaseVoice(voice);
      } else {
        // Relâcher toutes les notes
        this.activeNotes.forEach(voice => {
          this.releaseVoice(voice);
        });
      }
      
    } catch (error) {
      console.error('[FMSynth] Failed to trigger release:', error);
    }
  }
  
  /**
   * Relâche une voix
   */
  releaseVoice(voice) {
    try {
      if (voice.modulatorEnvelope && !voice.modulatorEnvelope.disposed) {
        voice.modulatorEnvelope.triggerRelease();
      }
      
      if (voice.carrierEnvelope && !voice.carrierEnvelope.disposed) {
        voice.carrierEnvelope.triggerRelease();
        
        // Programmer la suppression après le release
        const releaseTime = Math.max(
          this.config.modulatorEnvelope.release,
          this.config.carrierEnvelope.release
        );
        
        setTimeout(() => {
          this.disposeVoice(voice);
        }, (releaseTime + 0.1) * 1000);
      }
      
    } catch (error) {
      console.error('[FMSynth] Failed to release voice:', error);
    }
  }
  
  /**
   * Supprime une voix
   */
  disposeVoice(voice) {
    try {
      voice.components.forEach(component => {
        try {
          if (component && typeof component.dispose === 'function' && !component.disposed) {
            component.dispose();
          }
        } catch (error) {
          console.warn('[FMSynth] Error disposing voice component:', error);
        }
      });
      
      // Retirer de la liste des notes actives
      for (const [noteId, activeVoice] of this.activeNotes.entries()) {
        if (activeVoice === voice) {
          this.activeNotes.delete(noteId);
          break;
        }
      }
      
      this.isPlaying = this.activeNotes.size > 0;
      
    } catch (error) {
      console.error('[FMSynth] Failed to dispose voice:', error);
    }
  }
  
  /**
   * Arrête une note
   */
  stopNote(noteId = null) {
    try {
      if (noteId && this.activeNotes.has(noteId)) {
        const voice = this.activeNotes.get(noteId);
        this.disposeVoice(voice);
      } else {
        // Arrêter toutes les notes
        this.activeNotes.forEach(voice => {
          this.disposeVoice(voice);
        });
        this.activeNotes.clear();
        this.isPlaying = false;
      }
      
      console.log(`[FMSynth] Stopped note(s), active voices: ${this.activeNotes.size}`);
      
    } catch (error) {
      console.error('[FMSynth] Failed to stop note:', error);
    }
  }
  
  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig) {
    this.config = this.deepMerge(this.config, newConfig);
    console.log('[FMSynth] Configuration updated:', newConfig);
  }
  
  /**
   * Deep merge pour objets imbriqués
   */
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
  
  /**
   * Met à jour le ratio de modulation
   */
  updateRatio(ratio) {
    this.config.modulator.ratio = Math.max(0.1, Math.min(20, ratio));
    console.log(`[FMSynth] Modulator ratio updated to ${this.config.modulator.ratio}`);
  }
  
  /**
   * Met à jour l'index de modulation
   */
  updateIndex(index) {
    this.config.modulator.index = Math.max(0, Math.min(50, index));
    console.log(`[FMSynth] Modulation index updated to ${this.config.modulator.index}`);
  }
  
  /**
   * Met à jour l'algorithme FM
   */
  updateAlgorithm(algorithm) {
    if (this.algorithms[algorithm]) {
      this.config.algorithm = algorithm;
      console.log(`[FMSynth] Algorithm updated to ${algorithm}`);
    } else {
      console.warn(`[FMSynth] Unknown algorithm: ${algorithm}`);
    }
  }
  
  /**
   * Charge un preset FM
   */
  loadPreset(presetName) {
    const presets = {
      'bell': {
        modulator: { ratio: 3, index: 2 },
        modulatorEnvelope: { attack: 0.01, decay: 2, sustain: 0, release: 0.1 },
        carrierEnvelope: { attack: 0.01, decay: 1.5, sustain: 0.2, release: 1 },
        algorithm: 'simple'
      },
      
      'bass': {
        modulator: { ratio: 1, index: 8 },
        modulatorEnvelope: { attack: 0.05, decay: 0.3, sustain: 0.7, release: 0.2 },
        carrierEnvelope: { attack: 0.05, decay: 0.2, sustain: 0.9, release: 0.3 },
        algorithm: 'feedback',
        feedback: 0.3
      },
      
      'metallic': {
        modulator: { ratio: 7.3, index: 15 },
        modulatorEnvelope: { attack: 0.01, decay: 1.5, sustain: 0.1, release: 0.8 },
        carrierEnvelope: { attack: 0.01, decay: 0.8, sustain: 0.3, release: 1.2 },
        algorithm: 'parallel'
      },
      
      'epiano': {
        modulator: { ratio: 1.5, index: 3 },
        modulatorEnvelope: { attack: 0.02, decay: 0.8, sustain: 0.3, release: 0.6 },
        carrierEnvelope: { attack: 0.02, decay: 0.6, sustain: 0.6, release: 0.8 },
        algorithm: 'simple'
      },
      
      'organ': {
        modulator: { ratio: 2, index: 1.5 },
        modulatorEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.1 },
        carrierEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.1 },
        algorithm: 'complex'
      },
      
      'brass': {
        modulator: { ratio: 1, index: 6 },
        modulatorEnvelope: { attack: 0.2, decay: 0.4, sustain: 0.8, release: 0.3 },
        carrierEnvelope: { attack: 0.2, decay: 0.3, sustain: 0.9, release: 0.4 },
        algorithm: 'feedback',
        feedback: 0.2
      }
    };
    
    const preset = presets[presetName];
    if (preset) {
      this.updateConfig(preset);
      console.log(`[FMSynth] Loaded preset: ${presetName}`);
      return true;
    } else {
      console.warn(`[FMSynth] Unknown preset: ${presetName}`);
      return false;
    }
  }
  
  /**
   * Génère des données pour visualisation du spectre FM
   */
  generateFMSpectrum(duration = 1, sampleRate = 44100) {
    const samples = Math.floor(duration * sampleRate);
    const data = [];
    const freq = this.config.carrier.frequency;
    const modFreq = freq * this.config.modulator.ratio;
    const modIndex = this.config.modulator.index;
    
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      
      // Signal FM : carrier = sin(2πfct + I*sin(2πfmt))
      const modulator = Math.sin(2 * Math.PI * modFreq * t);
      const carrier = Math.sin(2 * Math.PI * freq * t + modIndex * modulator);
      
      data.push({
        time: t,
        modulator: modulator,
        carrier: carrier,
        output: carrier
      });
    }
    
    return data;
  }
  
  /**
   * Obtient la configuration actuelle
   */
  getConfig() {
    return JSON.parse(JSON.stringify(this.config));
  }
  
  /**
   * Vérifie si le synthé joue
   */
  isCurrentlyPlaying() {
    return this.isPlaying && this.activeNotes.size > 0;
  }
  
  /**
   * Obtient le nombre de voix actives
   */
  getActiveVoiceCount() {
    return this.activeNotes.size;
  }
  
  /**
   * Ajoute un composant au tracking
   */
  addComponent(component) {
    if (component && !this.components.includes(component)) {
      this.components.push(component);
      
      if (window.audioManager) {
        window.audioManager.addComponent(component);
      }
    }
  }
  
  /**
   * Nettoyage complet
   */
  cleanup() {
    try {
      // Arrêter toutes les notes
      this.stopNote();
      
      // Nettoyer les composants
      this.components.forEach(component => {
        try {
          if (component && typeof component.dispose === 'function' && !component.disposed) {
            component.dispose();
          }
        } catch (error) {
          console.warn('[FMSynth] Error disposing component:', error);
        }
      });
      
      this.components = [];
      this.activeNotes.clear();
      this.isPlaying = false;
      
      console.log('[FMSynth] Cleanup completed');
      
    } catch (error) {
      console.error('[FMSynth] Cleanup failed:', error);
    }
  }
  
  /**
   * Obtient des informations de statut
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      activeVoices: this.activeNotes.size,
      polyphony: this.config.polyphony,
      algorithm: this.config.algorithm,
      ratio: this.config.modulator.ratio,
      index: this.config.modulator.index,
      config: this.getConfig(),
      componentsCount: this.components.length
    };
  }
}

// Factory function
window.createFMSynth = function(config = {}) {
  const synth = new FMSynth();
  if (Object.keys(config).length > 0) {
    synth.updateConfig(config);
  }
  return synth;
};

// Instance globale pour l'onglet FM
window.fmSynth = new FMSynth();

// Presets globaux
window.fmPresets = {
  loadPreset: (presetName) => {
    if (window.fmSynth) {
      return window.fmSynth.loadPreset(presetName);
    }
    return false;
  },
  
  getAvailablePresets: () => {
    return ['bell', 'bass', 'metallic', 'epiano', 'organ', 'brass'];
  }
};

console.log('[FMSynth] Class loaded and global instance created');