/**
 * AdditiveSynth.js - Synthétiseur additif avec contrôle précis des harmoniques
 * Sound Synthesis Explorer - TOPLAP Strasbourg
 */

class AdditiveSynth {
  constructor() {
    this.isPlaying = false;
    this.components = [];
    this.activeNotes = new Map();
    
    // Configuration par défaut
    this.config = {
      // Fondamentale
      fundamentalFrequency: 220,
      
      // Harmoniques (8 harmoniques contrôlables)
      harmonics: [
        { number: 1, amplitude: 1.0, phase: 0, enabled: true },    // Fondamentale
        { number: 2, amplitude: 0.5, phase: 0, enabled: true },   // Octave
        { number: 3, amplitude: 0.33, phase: 0, enabled: true },  // Quinte
        { number: 4, amplitude: 0.25, phase: 0, enabled: true },  // Double octave
        { number: 5, amplitude: 0.2, phase: 0, enabled: true },   // Tierce majeure
        { number: 6, amplitude: 0.17, phase: 0, enabled: true },  // Quinte + octave
        { number: 7, amplitude: 0.14, phase: 0, enabled: true },  // 7ème
        { number: 8, amplitude: 0.12, phase: 0, enabled: true }   // Triple octave
      ],
      
      // Enveloppe globale
      envelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.8,
        release: 0.5
      },
      
      // Enveloppes par harmonique (optionnel)
      harmonicEnvelopes: {
        enabled: false,
        envelopes: [] // Array d'enveloppes pour chaque harmonique
      },
      
      // Modulation des harmoniques
      harmonicModulation: {
        enabled: false,
        lfoRate: 2,
        lfoDepth: 0.1,
        targetHarmonics: [2, 3, 4] // Harmoniques à moduler
      },
      
      // Global
      masterVolume: 0.3, // Plus bas car additive peut être forte
      polyphony: 4,
      
      // Options avancées
      inharmonicity: 0,  // Facteur d'inharmonicité (0 = harmonique parfait)
      spectralTilt: 0    // Inclinaison spectrale (-1 à 1)
    };
    
    this.bindMethods();
  }
  
  bindMethods() {
    this.cleanup = this.cleanup.bind(this);
    this.playNote = this.playNote.bind(this);
    this.stopNote = this.stopNote.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
    this.updateHarmonic = this.updateHarmonic.bind(this);
  }
  
  /**
   * Joue une note additive
   */
  playNote(note, duration = null, velocity = 0.8) {
    try {
      if (!window.audioManager || !window.audioManager.isReady()) {
        console.warn('[AdditiveSynth] AudioManager not ready');
        return false;
      }
      
      const frequency = window.audioManager.noteToFrequency(note);
      const noteId = note + '_' + Date.now();
      
      // Vérifier la limite de polyphonie
      if (this.activeNotes.size >= this.config.polyphony) {
        const oldestNote = this.activeNotes.keys().next().value;
        this.stopNote(oldestNote);
      }
      
      // Créer la voix additive
      const voice = this.createAdditiveVoice(frequency, velocity);
      if (!voice) {
        return false;
      }
      
      this.activeNotes.set(noteId, voice);
      this.isPlaying = true;
      
      console.log(`[AdditiveSynth] Playing additive note ${note} (${frequency.toFixed(1)}Hz) with ${voice.harmonics.length} harmonics`);
      
      // Arrêt automatique si durée spécifiée
      if (duration) {
        setTimeout(() => {
          this.stopNote(noteId);
        }, duration * 1000);
      }
      
      return true;
      
    } catch (error) {
      console.error('[AdditiveSynth] Failed to play note:', error);
      return false;
    }
  }
  
  /**
   * Crée une voix additive avec toutes les harmoniques
   */
  createAdditiveVoice(fundamentalFreq, velocity = 0.8) {
    try {
      const voice = {
        components: [],
        harmonics: [],
        mixer: null,
        envelope: null,
        finalGain: null,
        frequency: fundamentalFreq,
        velocity: velocity
      };
      
      // Créer le mixeur principal
      voice.mixer = new Tone.Gain(1);
      voice.components.push(voice.mixer);
      
      // Créer chaque harmonique
      this.config.harmonics.forEach((harmonic, index) => {
        if (!harmonic.enabled || harmonic.amplitude <= 0) {
          return;
        }
        
        // Calculer la fréquence de l'harmonique
        let harmonicFreq = fundamentalFreq * harmonic.number;
        
        // Appliquer l'inharmonicité si configurée
        if (this.config.inharmonicity !== 0) {
          const inharmonicFactor = 1 + (this.config.inharmonicity * harmonic.number * harmonic.number * 0.001);
          harmonicFreq *= inharmonicFactor;
        }
        
        // Créer l'oscillateur pour cette harmonique
        const oscillator = window.audioManager.createOscillator('sine', harmonicFreq);
        
        if (!oscillator) {
          console.warn(`[AdditiveSynth] Failed to create oscillator for harmonic ${harmonic.number}`);
          return;
        }
        
        // Calculer l'amplitude avec inclinaison spectrale
        let amplitude = harmonic.amplitude;
        if (this.config.spectralTilt !== 0) {
          const tiltFactor = Math.pow(harmonic.number, this.config.spectralTilt);
          amplitude *= tiltFactor;
        }
        
        // Créer le gain pour cette harmonique
        const harmonicGain = new Tone.Gain(amplitude * velocity);
        
        // Créer l'enveloppe individuelle si activée
        let harmonicEnvelope = null;
        if (this.config.harmonicEnvelopes.enabled) {
          // Enveloppe légèrement différente pour chaque harmonique
          const envVariation = 1 + (index * 0.1); // Variation légère
          harmonicEnvelope = window.audioManager.createEnvelope(
            this.config.envelope.attack * envVariation,
            this.config.envelope.decay * envVariation,
            this.config.envelope.sustain,
            this.config.envelope.release * envVariation
          );
          
          if (harmonicEnvelope) {
            voice.components.push(harmonicEnvelope);
            
            // Connexion avec enveloppe : Oscillator → HarmonicEnvelope → HarmonicGain → Mixer
            oscillator.connect(harmonicEnvelope);
            harmonicEnvelope.connect(harmonicGain);
            harmonicGain.connect(voice.mixer);
            
            // Déclencher l'enveloppe individuelle
            harmonicEnvelope.triggerAttack();
          } else {
            // Fallback sans enveloppe individuelle
            oscillator.connect(harmonicGain);
            harmonicGain.connect(voice.mixer);
          }
        } else {
          // Connexion directe : Oscillator → HarmonicGain → Mixer
          oscillator.connect(harmonicGain);
          harmonicGain.connect(voice.mixer);
        }
        
        // Stocker les références
        voice.harmonics.push({
          oscillator: oscillator,
          gain: harmonicGain,
          envelope: harmonicEnvelope,
          number: harmonic.number,
          frequency: harmonicFreq
        });
        
        voice.components.push(oscillator, harmonicGain);
        
        // Démarrer l'oscillateur
        oscillator.start();
      });
      
      // Créer l'enveloppe globale
      voice.envelope = window.audioManager.createEnvelope(
        this.config.envelope.attack,
        this.config.envelope.decay,
        this.config.envelope.sustain,
        this.config.envelope.release
      );
      
      if (!voice.envelope) {
        throw new Error('Failed to create global envelope');
      }
      
      voice.components.push(voice.envelope);
      
      // Créer le gain final
      voice.finalGain = new Tone.Gain(this.config.masterVolume);
      voice.components.push(voice.finalGain);
      
      // Connexion finale : Mixer → Envelope → FinalGain → Master
      voice.mixer.connect(voice.envelope);
      voice.envelope.connect(voice.finalGain);
      voice.finalGain.connect(window.audioManager.masterGain);
      
      // Ajouter la modulation des harmoniques si activée
      if (this.config.harmonicModulation.enabled) {
        this.addHarmonicModulation(voice);
      }
      
      // Tracking des composants
      voice.components.forEach(comp => this.addComponent(comp));
      
      // Déclencher l'enveloppe globale
      voice.envelope.triggerAttack();
      
      return voice;
      
    } catch (error) {
      console.error('[AdditiveSynth] Failed to create additive voice:', error);
      return null;
    }
  }
  
  /**
   * Ajoute la modulation des harmoniques
   */
  addHarmonicModulation(voice) {
    try {
      const lfo = window.audioManager.createLFO(
        this.config.harmonicModulation.lfoRate,
        'sine',
        -1, 1
      );
      
      if (!lfo) {
        console.warn('[AdditiveSynth] Failed to create LFO for harmonic modulation');
        return;
      }
      
      voice.components.push(lfo);
      
      // Moduler les harmoniques spécifiées
      this.config.harmonicModulation.targetHarmonics.forEach(harmonicNumber => {
        const harmonic = voice.harmonics.find(h => h.number === harmonicNumber);
        
        if (harmonic) {
          // Créer un gain de modulation
          const modGain = new Tone.Gain(this.config.harmonicModulation.lfoDepth);
          voice.components.push(modGain);
          
          // Connecter : LFO → ModGain → HarmonicGain
          lfo.connect(modGain);
          modGain.connect(harmonic.gain.gain);
        }
      });
      
      // Démarrer le LFO
      lfo.start();
      
    } catch (error) {
      console.error('[AdditiveSynth] Failed to add harmonic modulation:', error);
    }
  }
  
  /**
   * Met à jour une harmonique spécifique
   */
  updateHarmonic(harmonicNumber, amplitude) {
    amplitude = Math.max(0, Math.min(1, amplitude));
    
    const harmonicConfig = this.config.harmonics.find(h => h.number === harmonicNumber);
    if (harmonicConfig) {
      harmonicConfig.amplitude = amplitude;
      
      // Mettre à jour les voix actives
      this.activeNotes.forEach(voice => {
        const harmonic = voice.harmonics.find(h => h.number === harmonicNumber);
        if (harmonic && harmonic.gain) {
          harmonic.gain.gain.rampTo(amplitude * voice.velocity, 0.1);
        }
      });
      
      console.log(`[AdditiveSynth] Harmonic ${harmonicNumber} updated to ${(amplitude * 100).toFixed(0)}%`);
    }
  }
  
  /**
   * Active/désactive une harmonique
   */
  toggleHarmonic(harmonicNumber, enabled) {
    const harmonicConfig = this.config.harmonics.find(h => h.number === harmonicNumber);
    if (harmonicConfig) {
      harmonicConfig.enabled = enabled;
      
      if (!enabled) {
        // Mettre l'amplitude à 0 pour les voix actives
        this.activeNotes.forEach(voice => {
          const harmonic = voice.harmonics.find(h => h.number === harmonicNumber);
          if (harmonic && harmonic.gain) {
            harmonic.gain.gain.rampTo(0, 0.1);
          }
        });
      } else {
        // Restaurer l'amplitude configurée
        this.updateHarmonic(harmonicNumber, harmonicConfig.amplitude);
      }
      
      console.log(`[AdditiveSynth] Harmonic ${harmonicNumber} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }
  
  /**
   * Met à jour la fréquence fondamentale
   */
  updateFundamentalFrequency(frequency) {
    this.config.fundamentalFrequency = Math.max(20, Math.min(2000, frequency));
    console.log(`[AdditiveSynth] Fundamental frequency updated to ${this.config.fundamentalFrequency}Hz`);
  }
  
  /**
   * Met à jour l'inharmonicité
   */
  updateInharmonicity(factor) {
    this.config.inharmonicity = Math.max(-1, Math.min(1, factor));
    console.log(`[AdditiveSynth] Inharmonicity updated to ${this.config.inharmonicity}`);
  }
  
  /**
   * Met à jour l'inclinaison spectrale
   */
  updateSpectralTilt(tilt) {
    this.config.spectralTilt = Math.max(-1, Math.min(1, tilt));
    console.log(`[AdditiveSynth] Spectral tilt updated to ${this.config.spectralTilt}`);
  }
  
  /**
   * Charge un preset d'harmoniques
   */
  loadPreset(presetName) {
    const presets = {
      'sawtooth': [1.0, 0.5, 0.33, 0.25, 0.2, 0.17, 0.14, 0.12],
      'square': [1.0, 0, 0.33, 0, 0.2, 0, 0.14, 0],
      'organ': [1.0, 0.8, 0.6, 0.4, 0.3, 0.2, 0.15, 0.1],
      'flute': [1.0, 0.1, 0.05, 0.02, 0.01, 0, 0, 0],
      'violin': [1.0, 0.7, 0.4, 0.3, 0.2, 0.15, 0.1, 0.08],
      'brass': [1.0, 0.6, 0.8, 0.3, 0.4, 0.2, 0.3, 0.1],
      'bell': [1.0, 0.3, 0.7, 0.2, 0.5, 0.15, 0.25, 0.1],
      'clarinet': [1.0, 0.2, 0.6, 0.1, 0.4, 0.08, 0.2, 0.05]
    };
    
    const preset = presets[presetName];
    if (preset) {
      // Appliquer les amplitudes du preset
      preset.forEach((amplitude, index) => {
        if (index < this.config.harmonics.length) {
          this.config.harmonics[index].amplitude = amplitude;
          this.config.harmonics[index].enabled = amplitude > 0;
        }
      });
      
      // Mettre à jour les voix actives
      this.activeNotes.forEach(voice => {
        voice.harmonics.forEach((harmonic, index) => {
          if (index < preset.length) {
            const amplitude = preset[index];
            harmonic.gain.gain.rampTo(amplitude * voice.velocity, 0.2);
          }
        });
      });
      
      console.log(`[AdditiveSynth] Loaded preset: ${presetName}`);
      return true;
    } else {
      console.warn(`[AdditiveSynth] Unknown preset: ${presetName}`);
      return false;
    }
  }
  
  /**
   * Génère un spectre harmonique pour visualisation
   */
  generateHarmonicSpectrum() {
    const spectrum = [];
    
    this.config.harmonics.forEach(harmonic => {
      if (harmonic.enabled && harmonic.amplitude > 0) {
        spectrum.push({
          frequency: this.config.fundamentalFrequency * harmonic.number,
          amplitude: harmonic.amplitude,
          harmonicNumber: harmonic.number,
          phase: harmonic.phase
        });
      }
    });
    
    return spectrum;
  }
  
  /**
   * Calcule la forme d'onde résultante
   */
  generateResultingWaveform(duration = 0.01, sampleRate = 44100) {
    const samples = Math.floor(duration * sampleRate);
    const waveform = [];
    
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      // Additionner toutes les harmoniques
      this.config.harmonics.forEach(harmonic => {
        if (harmonic.enabled && harmonic.amplitude > 0) {
          const freq = this.config.fundamentalFrequency * harmonic.number;
          const phase = harmonic.phase * Math.PI / 180; // Convertir en radians
          sample += harmonic.amplitude * Math.sin(2 * Math.PI * freq * t + phase);
        }
      });
      
      waveform.push(sample);
    }
    
    return waveform;
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
      console.error('[AdditiveSynth] Failed to trigger release:', error);
    }
  }
  
  /**
   * Relâche une voix
   */
  releaseVoice(voice) {
    try {
      // Déclencher le release de l'enveloppe globale
      if (voice.envelope && !voice.envelope.disposed) {
        voice.envelope.triggerRelease();
      }
      
      // Déclencher le release des enveloppes individuelles
      if (this.config.harmonicEnvelopes.enabled) {
        voice.harmonics.forEach(harmonic => {
          if (harmonic.envelope && !harmonic.envelope.disposed) {
            harmonic.envelope.triggerRelease();
          }
        });
      }
      
      // Programmer la suppression après le release
      const releaseTime = this.config.envelope.release;
      setTimeout(() => {
        this.disposeVoice(voice);
      }, (releaseTime + 0.1) * 1000);
      
    } catch (error) {
      console.error('[AdditiveSynth] Failed to release voice:', error);
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
          console.warn('[AdditiveSynth] Error disposing voice component:', error);
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
      console.error('[AdditiveSynth] Failed to dispose voice:', error);
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
      
      console.log(`[AdditiveSynth] Stopped note(s), active voices: ${this.activeNotes.size}`);
      
    } catch (error) {
      console.error('[AdditiveSynth] Failed to stop note:', error);
    }
  }
  
  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig) {
    this.config = this.deepMerge(this.config, newConfig);
    console.log('[AdditiveSynth] Configuration updated:', newConfig);
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
          console.warn('[AdditiveSynth] Error disposing component:', error);
        }
      });
      
      this.components = [];
      this.activeNotes.clear();
      this.isPlaying = false;
      
      console.log('[AdditiveSynth] Cleanup completed');
      
    } catch (error) {
      console.error('[AdditiveSynth] Cleanup failed:', error);
    }
  }
  
  /**
   * Obtient des informations de statut
   */
  getStatus() {
    const enabledHarmonics = this.config.harmonics.filter(h => h.enabled).length;
    
    return {
      isPlaying: this.isPlaying,
      activeVoices: this.activeNotes.size,
      polyphony: this.config.polyphony,
      enabledHarmonics: enabledHarmonics,
      fundamentalFreq: this.config.fundamentalFrequency,
      inharmonicity: this.config.inharmonicity,
      spectralTilt: this.config.spectralTilt,
      config: this.getConfig(),
      componentsCount: this.components.length
    };
  }
}

// Factory function
window.createAdditiveSynth = function(config = {}) {
  const synth = new AdditiveSynth();
  if (Object.keys(config).length > 0) {
    synth.updateConfig(config);
  }
  return synth;
};

// Instance globale pour l'onglet Synthèse Additive
window.additiveSynth = new AdditiveSynth();

// Presets globaux
window.additivePresets = {
  loadPreset: (presetName) => {
    if (window.additiveSynth) {
      return window.additiveSynth.loadPreset(presetName);
    }
    return false;
  },
  
  getAvailablePresets: () => {
    return ['sawtooth', 'square', 'organ', 'flute', 'violin', 'brass', 'bell', 'clarinet'];
  }
};

console.log('[AdditiveSynth] Class loaded and global instance created');