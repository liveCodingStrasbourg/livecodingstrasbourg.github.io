/**
 * SubtractiveSynth.js - Synthétiseur soustractif complet (2 VCO + VCF + VCA)
 * Sound Synthesis Explorer - TOPLAP Strasbourg
 */

class SubtractiveSynth {
  constructor() {
    this.isPlaying = false;
    this.components = [];
    this.activeNotes = new Map(); // Pour la polyphonie
    
    // Composants audio
    this.vco1 = null;             // Oscillateur 1
    this.vco2 = null;             // Oscillateur 2
    this.mixer = null;            // Mixeur des VCO
    this.filter = null;           // VCF (Voltage Controlled Filter)
    this.filterEnvelope = null;   // Enveloppe pour le filtre
    this.amplitudeEnvelope = null; // Enveloppe pour l'amplitude
    this.lfo = null;              // LFO pour modulations
    this.finalGain = null;        // VCA final
    
    // Configuration par défaut
    this.config = {
      // VCO 1
      vco1: {
        waveform: 'sawtooth',
        detune: 0,           // En octaves
        level: 0.8,          // 0-1
        enabled: true
      },
      
      // VCO 2
      vco2: {
        waveform: 'square',
        detune: -1.0,        // En octaves (une octave plus bas)
        level: 0.6,          // 0-1
        enabled: true
      },
      
      // Filtre (VCF)
      filter: {
        type: 'lowpass',
        cutoff: 1200,        // Hz
        resonance: 5,        // Q factor
        envAmount: 50,       // Modulation par enveloppe (-100 à +100%)
        keyboardTracking: 0.3 // Suivi du clavier (0-1)
      },
      
      // Enveloppe filtre
      filterEnvelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.1,        // Niveau de sustain bas pour effet classique
        release: 0.5
      },
      
      // Enveloppe amplitude
      amplitudeEnvelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.7,
        release: 0.5
      },
      
      // LFO
      lfo: {
        rate: 3,             // Hz
        waveform: 'triangle',
        filterAmount: 0,     // Modulation du filtre
        amplitudeAmount: 0,  // Modulation de l'amplitude
        vco1Amount: 0,       // Modulation VCO1
        vco2Amount: 0        // Modulation VCO2
      },
      
      // Global
      masterVolume: 0.6,
      polyphony: 1,        // 1 = mono, >1 = poly
      glide: 0             // Portamento en secondes
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
   * Joue une note (mode mono/poly selon config)
   */
  playNote(note, duration = null, velocity = 0.8) {
    if (this.config.polyphony === 1) {
      return this.playMonoNote(note, duration, velocity);
    } else {
      return this.playPolyNote(note, duration, velocity);
    }
  }
  
  /**
   * Joue une note en mode mono
   */
  playMonoNote(note, duration = null, velocity = 0.8) {
    try {
      if (!window.audioManager || !window.audioManager.isReady()) {
        console.warn('[SubtractiveSynth] AudioManager not ready');
        return false;
      }
      
      // Arrêter la note précédente en mode mono
      this.stopNote();
      
      const frequency = window.audioManager.noteToFrequency(note);
      const noteId = 'mono';
      
      // Créer la voix
      const voice = this.createVoice(frequency, velocity);
      if (!voice) {
        return false;
      }
      
      this.activeNotes.set(noteId, voice);
      this.isPlaying = true;
      
      console.log(`[SubtractiveSynth] Playing mono note ${note} (${frequency.toFixed(1)}Hz)`);
      
      // Arrêt automatique si durée spécifiée
      if (duration) {
        setTimeout(() => {
          this.stopNote(noteId);
        }, duration * 1000);
      }
      
      return true;
      
    } catch (error) {
      console.error('[SubtractiveSynth] Failed to play mono note:', error);
      return false;
    }
  }
  
  /**
   * Joue une note en mode poly
   */
  playPolyNote(note, duration = null, velocity = 0.8) {
    try {
      if (!window.audioManager || !window.audioManager.isReady()) {
        console.warn('[SubtractiveSynth] AudioManager not ready');
        return false;
      }
      
      const frequency = window.audioManager.noteToFrequency(note);
      const noteId = note + '_' + Date.now(); // ID unique
      
      // Vérifier la limite de polyphonie
      if (this.activeNotes.size >= this.config.polyphony) {
        // Arrêter la note la plus ancienne
        const oldestNote = this.activeNotes.keys().next().value;
        this.stopNote(oldestNote);
      }
      
      // Créer la voix
      const voice = this.createVoice(frequency, velocity);
      if (!voice) {
        return false;
      }
      
      this.activeNotes.set(noteId, voice);
      this.isPlaying = this.activeNotes.size > 0;
      
      console.log(`[SubtractiveSynth] Playing poly note ${note} (${frequency.toFixed(1)}Hz), voices: ${this.activeNotes.size}`);
      
      // Arrêt automatique si durée spécifiée
      if (duration) {
        setTimeout(() => {
          this.stopNote(noteId);
        }, duration * 1000);
      }
      
      return true;
      
    } catch (error) {
      console.error('[SubtractiveSynth] Failed to play poly note:', error);
      return false;
    }
  }
  
  /**
   * Crée une voix complète (VCO + VCF + VCA)
   */
  createVoice(frequency, velocity = 0.8) {
    try {
      const voice = {
        components: [],
        frequency: frequency,
        velocity: velocity
      };
      
      // Créer VCO1
      if (this.config.vco1.enabled) {
        voice.vco1 = window.audioManager.createOscillator(
          this.config.vco1.waveform,
          frequency * Math.pow(2, this.config.vco1.detune)
        );
        
        if (!voice.vco1) {
          throw new Error('Failed to create VCO1');
        }
        
        voice.components.push(voice.vco1);
      }
      
      // Créer VCO2
      if (this.config.vco2.enabled) {
        voice.vco2 = window.audioManager.createOscillator(
          this.config.vco2.waveform,
          frequency * Math.pow(2, this.config.vco2.detune)
        );
        
        if (!voice.vco2) {
          throw new Error('Failed to create VCO2');
        }
        
        voice.components.push(voice.vco2);
      }
      
      // Créer le mixeur des VCO
      voice.mixer = new Tone.Gain(1);
      voice.components.push(voice.mixer);
      
      // Connecter les VCO au mixeur avec leurs niveaux
      if (voice.vco1) {
        const vco1Gain = new Tone.Gain(this.config.vco1.level);
        voice.components.push(vco1Gain);
        voice.vco1.connect(vco1Gain);
        vco1Gain.connect(voice.mixer);
      }
      
      if (voice.vco2) {
        const vco2Gain = new Tone.Gain(this.config.vco2.level);
        voice.components.push(vco2Gain);
        voice.vco2.connect(vco2Gain);
        vco2Gain.connect(voice.mixer);
      }
      
      // Créer le filtre (VCF)
      voice.filter = window.audioManager.createFilter(
        this.config.filter.type,
        this.config.filter.cutoff,
        this.config.filter.resonance
      );
      
      if (!voice.filter) {
        throw new Error('Failed to create filter');
      }
      
      voice.components.push(voice.filter);
      
      // Appliquer le keyboard tracking au filtre
      if (this.config.filter.keyboardTracking > 0) {
        const keyboardOffset = (frequency - 440) * this.config.filter.keyboardTracking;
        voice.filter.frequency.value = Math.max(20, 
          this.config.filter.cutoff + keyboardOffset
        );
      }
      
      // Créer l'enveloppe du filtre
      voice.filterEnvelope = window.audioManager.createEnvelope(
        this.config.filterEnvelope.attack,
        this.config.filterEnvelope.decay,
        this.config.filterEnvelope.sustain,
        this.config.filterEnvelope.release
      );
      
      if (!voice.filterEnvelope) {
        throw new Error('Failed to create filter envelope');
      }
      
      voice.components.push(voice.filterEnvelope);
      
      // Connecter l'enveloppe au filtre si envAmount > 0
      if (this.config.filter.envAmount !== 0) {
        const envGain = new Tone.Gain(
          (this.config.filter.envAmount / 100) * this.config.filter.cutoff
        );
        voice.components.push(envGain);
        voice.filterEnvelope.connect(envGain);
        envGain.connect(voice.filter.frequency);
      }
      
      // Créer l'enveloppe d'amplitude
      voice.amplitudeEnvelope = window.audioManager.createEnvelope(
        this.config.amplitudeEnvelope.attack,
        this.config.amplitudeEnvelope.decay,
        this.config.amplitudeEnvelope.sustain,
        this.config.amplitudeEnvelope.release
      );
      
      if (!voice.amplitudeEnvelope) {
        throw new Error('Failed to create amplitude envelope');
      }
      
      voice.components.push(voice.amplitudeEnvelope);
      
      // Gain final (VCA)
      voice.finalGain = new Tone.Gain(this.config.masterVolume * velocity);
      voice.components.push(voice.finalGain);
      
      // Chaîne de signal : Mixer → Filter → AmplitudeEnvelope → FinalGain → Master
      voice.mixer.connect(voice.filter);
      voice.filter.connect(voice.amplitudeEnvelope);
      voice.amplitudeEnvelope.connect(voice.finalGain);
      voice.finalGain.connect(window.audioManager.masterGain);
      
      // Ajouter tous les composants au tracking global
      voice.components.forEach(comp => {
        this.addComponent(comp);
      });
      
      // Démarrer les oscillateurs
      if (voice.vco1) voice.vco1.start();
      if (voice.vco2) voice.vco2.start();
      
      // Déclencher les enveloppes
      voice.filterEnvelope.triggerAttack();
      voice.amplitudeEnvelope.triggerAttack();
      
      return voice;
      
    } catch (error) {
      console.error('[SubtractiveSynth] Failed to create voice:', error);
      return null;
    }
  }
  
  /**
   * Déclenche l'attaque d'une note (pour claviers)
   */
  triggerAttack(note, velocity = 0.8) {
    return this.playNote(note, null, velocity);
  }
  
  /**
   * Déclenche le relâchement d'une note
   */
  triggerRelease(noteId = null) {
    try {
      if (noteId) {
        // Relâcher une note spécifique
        const voice = this.activeNotes.get(noteId);
        if (voice) {
          this.releaseVoice(voice);
        }
      } else {
        // Relâcher toutes les notes (mode mono principalement)
        this.activeNotes.forEach(voice => {
          this.releaseVoice(voice);
        });
      }
      
    } catch (error) {
      console.error('[SubtractiveSynth] Failed to trigger release:', error);
    }
  }
  
  /**
   * Relâche une voix (déclenche les enveloppes de release)
   */
  releaseVoice(voice) {
    try {
      if (voice.filterEnvelope && !voice.filterEnvelope.disposed) {
        voice.filterEnvelope.triggerRelease();
      }
      
      if (voice.amplitudeEnvelope && !voice.amplitudeEnvelope.disposed) {
        voice.amplitudeEnvelope.triggerRelease();
        
        // Programmer l'arrêt complet après le release
        const releaseTime = this.config.amplitudeEnvelope.release;
        setTimeout(() => {
          this.disposeVoice(voice);
        }, (releaseTime + 0.1) * 1000); // +0.1s de marge
      }
      
    } catch (error) {
      console.error('[SubtractiveSynth] Failed to release voice:', error);
    }
  }
  
  /**
   * Supprime complètement une voix
   */
  disposeVoice(voice) {
    try {
      voice.components.forEach(component => {
        try {
          if (component && typeof component.dispose === 'function' && !component.disposed) {
            component.dispose();
          }
        } catch (error) {
          console.warn('[SubtractiveSynth] Error disposing voice component:', error);
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
      console.error('[SubtractiveSynth] Failed to dispose voice:', error);
    }
  }
  
  /**
   * Arrête une note ou toutes les notes
   */
  stopNote(noteId = null) {
    try {
      if (noteId && this.activeNotes.has(noteId)) {
        // Arrêter une note spécifique
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
      
      console.log(`[SubtractiveSynth] Stopped note(s), active voices: ${this.activeNotes.size}`);
      
    } catch (error) {
      console.error('[SubtractiveSynth] Failed to stop note:', error);
    }
  }
  
  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig) {
    const oldConfig = JSON.parse(JSON.stringify(this.config));
    
    // Merge de la configuration (deep merge pour les objets imbriqués)
    this.config = this.deepMerge(this.config, newConfig);
    
    console.log('[SubtractiveSynth] Configuration updated:', newConfig);
    
    // Appliquer les changements en temps réel si possible
    this.applyConfigChanges(oldConfig, this.config);
  }
  
  /**
   * Deep merge de deux objets
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
   * Applique les changements de configuration aux voix actives
   */
  applyConfigChanges(oldConfig, newConfig) {
    try {
      this.activeNotes.forEach(voice => {
        // Changements de filtre
        if (voice.filter && !voice.filter.disposed) {
          if (oldConfig.filter.cutoff !== newConfig.filter.cutoff) {
            voice.filter.frequency.rampTo(newConfig.filter.cutoff, 0.1);
          }
          
          if (oldConfig.filter.resonance !== newConfig.filter.resonance) {
            voice.filter.Q.rampTo(newConfig.filter.resonance, 0.1);
          }
          
          if (oldConfig.filter.type !== newConfig.filter.type) {
            voice.filter.type = newConfig.filter.type;
          }
        }
        
        // Changements de volume global
        if (voice.finalGain && !voice.finalGain.disposed) {
          if (oldConfig.masterVolume !== newConfig.masterVolume) {
            voice.finalGain.gain.rampTo(newConfig.masterVolume * voice.velocity, 0.1);
          }
        }
      });
      
    } catch (error) {
      console.error('[SubtractiveSynth] Failed to apply config changes:', error);
    }
  }
  
  /**
   * Met à jour les paramètres VCO1
   */
  updateVCO1(params) {
    this.updateConfig({ vco1: params });
  }
  
  /**
   * Met à jour les paramètres VCO2
   */
  updateVCO2(params) {
    this.updateConfig({ vco2: params });
  }
  
  /**
   * Met à jour les paramètres du filtre
   */
  updateFilter(params) {
    this.updateConfig({ filter: params });
  }
  
  /**
   * Met à jour l'enveloppe du filtre
   */
  updateFilterEnvelope(params) {
    this.updateConfig({ filterEnvelope: params });
  }
  
  /**
   * Met à jour l'enveloppe d'amplitude
   */
  updateAmplitudeEnvelope(params) {
    this.updateConfig({ amplitudeEnvelope: params });
  }
  
  /**
   * Charge un preset de synthé soustractif
   */
  loadPreset(presetName) {
    const presets = {
      'classic-lead': {
        vco1: { waveform: 'sawtooth', detune: 0, level: 0.8 },
        vco2: { waveform: 'square', detune: 0.01, level: 0.4 },
        filter: { type: 'lowpass', cutoff: 1800, resonance: 8, envAmount: 60 },
        filterEnvelope: { attack: 0.01, decay: 0.4, sustain: 0.3, release: 0.3 },
        amplitudeEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.8, release: 0.4 }
      },
      
      'fat-bass': {
        vco1: { waveform: 'sawtooth', detune: 0, level: 0.9 },
        vco2: { waveform: 'square', detune: -1, level: 0.7 },
        filter: { type: 'lowpass', cutoff: 400, resonance: 12, envAmount: 80 },
        filterEnvelope: { attack: 0.01, decay: 0.8, sustain: 0.1, release: 0.2 },
        amplitudeEnvelope: { attack: 0.01, decay: 0.3, sustain: 0.9, release: 0.3 }
      },
      
      'string-pad': {
        vco1: { waveform: 'sawtooth', detune: 0, level: 0.6 },
        vco2: { waveform: 'sawtooth', detune: 0.02, level: 0.6 },
        filter: { type: 'lowpass', cutoff: 2000, resonance: 2, envAmount: 20 },
        filterEnvelope: { attack: 0.8, decay: 1.0, sustain: 0.6, release: 1.5 },
        amplitudeEnvelope: { attack: 0.8, decay: 0.5, sustain: 0.8, release: 1.5 }
      },
      
      'acid-squelch': {
        vco1: { waveform: 'sawtooth', detune: 0, level: 1.0 },
        vco2: { waveform: 'square', detune: 0, level: 0, enabled: false },
        filter: { type: 'lowpass', cutoff: 300, resonance: 18, envAmount: 90 },
        filterEnvelope: { attack: 0.01, decay: 0.15, sustain: 0.05, release: 0.1 },
        amplitudeEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.1 }
      }
    };
    
    const preset = presets[presetName];
    if (preset) {
      this.updateConfig(preset);
      console.log(`[SubtractiveSynth] Loaded preset: ${presetName}`);
      return true;
    } else {
      console.warn(`[SubtractiveSynth] Unknown preset: ${presetName}`);
      return false;
    }
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
          console.warn('[SubtractiveSynth] Error disposing component:', error);
        }
      });
      
      this.components = [];
      this.activeNotes.clear();
      this.isPlaying = false;
      
      console.log('[SubtractiveSynth] Cleanup completed');
      
    } catch (error) {
      console.error('[SubtractiveSynth] Cleanup failed:', error);
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
      config: this.getConfig(),
      componentsCount: this.components.length
    };
  }
}

// Factory function
window.createSubtractiveSynth = function(config = {}) {
  const synth = new SubtractiveSynth();
  if (Object.keys(config).length > 0) {
    synth.updateConfig(config);
  }
  return synth;
};

// Instance globale pour l'onglet Synthèse Soustractive
window.subtractiveSynth = new SubtractiveSynth();

// Presets globaux
window.subtractivePresets = {
  loadPreset: (presetName) => {
    if (window.subtractiveSynth) {
      return window.subtractiveSynth.loadPreset(presetName);
    }
    return false;
  },
  
  getAvailablePresets: () => {
    return ['classic-lead', 'fat-bass', 'string-pad', 'acid-squelch'];
  }
};

console.log('[SubtractiveSynth] Class loaded and global instance created');