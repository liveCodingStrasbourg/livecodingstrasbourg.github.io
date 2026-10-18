/**
 * FilteredSynth.js - Synthétiseur avec filtrage audio avancé
 * Sound Synthesis Explorer - TOPLAP Strasbourg
 */

class FilteredSynth {
  constructor() {
    this.isPlaying = false;
    this.components = [];
    
    // Composants audio
    this.source = null;           // Source audio (oscillateur ou bruit)
    this.filter = null;           // Filtre principal
    this.gain = null;             // Contrôle d'amplitude
    this.analyser = null;         // Pour visualisations
    
    // Configuration par défaut
    this.config = {
      // Source
      sourceType: 'oscillator',    // 'oscillator' ou 'noise'
      waveform: 'sawtooth',        // Pour oscillateur
      noiseType: 'white',          // Pour bruit
      frequency: 220,              // Fréquence de l'oscillateur
      amplitude: 0.6,
      
      // Filtre
      filterType: 'lowpass',       // lowpass, highpass, bandpass, notch
      cutoffFrequency: 1000,       // Hz
      Q: 1,                        // Résonance
      gain: 0,                     // Gain du filtre (pour certains types)
      
      // Paramètres avancés
      rolloff: -12,                // Pente du filtre (-12, -24, -48 dB/octave)
      detune: 0
    };
    
    this.bindMethods();
  }
  
  bindMethods() {
    this.cleanup = this.cleanup.bind(this);
    this.playNote = this.playNote.bind(this);
    this.stopNote = this.stopNote.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
  }
  
  /**
   * Joue une note avec filtrage
   */
  playNote(note, duration = null, velocity = 0.8) {
    try {
      if (!window.audioManager || !window.audioManager.isReady()) {
        console.warn('[FilteredSynth] AudioManager not ready');
        return false;
      }
      
      // Arrêter la note précédente
      this.stopNote();
      
      // Créer la source selon le type
      if (this.config.sourceType === 'oscillator') {
        const frequency = window.audioManager.noteToFrequency(note);
        this.source = window.audioManager.createOscillator(
          this.config.waveform,
          frequency
        );
        
        if (this.config.detune !== 0) {
          this.source.detune.value = this.config.detune;
        }
      } else {
        this.source = window.audioManager.createNoise(this.config.noiseType);
      }
      
      if (!this.source) {
        console.error('[FilteredSynth] Failed to create source');
        return false;
      }
      
      // Créer le filtre
      this.filter = window.audioManager.createFilter(
        this.config.filterType,
        this.config.cutoffFrequency,
        this.config.Q
      );
      
      if (!this.filter) {
        console.error('[FilteredSynth] Failed to create filter');
        return false;
      }
      
      // Configurer le filtre avancé
      this.setupFilterAdvanced();
      
      // Créer le gain
      this.gain = new Tone.Gain(this.config.amplitude * velocity);
      this.addComponent(this.gain);
      
      // Créer l'analyseur pour visualisations
      this.analyser = new Tone.Analyser('fft', 1024);
      this.addComponent(this.analyser);
      
      // Chaîne de signal : source → filtre → gain → analyseur → master
      this.source.connect(this.filter);
      this.filter.connect(this.gain);
      this.gain.connect(this.analyser);
      this.analyser.connect(window.audioManager.masterGain);
      
      // Démarrer
      this.source.start();
      this.isPlaying = true;
      
      console.log(`[FilteredSynth] Playing filtered note ${note}`);
      console.log(`[FilteredSynth] Filter: ${this.config.filterType} @ ${this.config.cutoffFrequency}Hz, Q=${this.config.Q}`);
      
      // Arrêt automatique si durée spécifiée
      if (duration) {
        setTimeout(() => {
          this.stopNote();
        }, duration * 1000);
      }
      
      return true;
      
    } catch (error) {
      console.error('[FilteredSynth] Failed to play note:', error);
      return false;
    }
  }
  
  /**
   * Configure le filtre avec paramètres avancés
   */
  setupFilterAdvanced() {
    try {
      // Définir la pente (rolloff) si supporté
      if (this.filter.rolloff !== undefined) {
        this.filter.rolloff = this.config.rolloff;
      }
      
      // Définir le gain si le filtre le supporte (ex: peaking, shelving)
      if (this.filter.gain !== undefined && this.config.gain !== 0) {
        this.filter.gain.value = this.config.gain;
      }
      
      console.log(`[FilteredSynth] Advanced filter config applied: rolloff=${this.config.rolloff}dB/oct`);
      
    } catch (error) {
      console.warn('[FilteredSynth] Some advanced filter features not available:', error);
    }
  }
  
  /**
   * Joue du bruit filtré
   */
  playNoise(noiseType = 'white', duration = null) {
    try {
      // Mettre à jour la configuration temporairement
      const originalSourceType = this.config.sourceType;
      const originalNoiseType = this.config.noiseType;
      
      this.config.sourceType = 'noise';
      this.config.noiseType = noiseType;
      
      const result = this.playNote('A4', duration);
      
      // Restaurer la configuration
      this.config.sourceType = originalSourceType;
      this.config.noiseType = originalNoiseType;
      
      return result;
      
    } catch (error) {
      console.error('[FilteredSynth] Failed to play noise:', error);
      return false;
    }
  }
  
  /**
   * Arrête la note en cours
   */
  stopNote() {
    try {
      if (this.source && !this.source.disposed) {
        this.source.stop();
        this.source.dispose();
        this.source = null;
      }
      
      if (this.filter && !this.filter.disposed) {
        this.filter.dispose();
        this.filter = null;
      }
      
      if (this.gain && !this.gain.disposed) {
        this.gain.dispose();
        this.gain = null;
      }
      
      if (this.analyser && !this.analyser.disposed) {
        this.analyser.dispose();
        this.analyser = null;
      }
      
      // Nettoyer tous les composants auxiliaires
      this.cleanupComponents();
      
      this.isPlaying = false;
      console.log('[FilteredSynth] Note stopped');
      
    } catch (error) {
      console.error('[FilteredSynth] Failed to stop note:', error);
    }
  }
  
  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig) {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };
    
    // Appliquer les changements en temps réel si possible
    if (this.isPlaying) {
      this.applyConfigChanges(oldConfig, this.config);
    }
    
    console.log('[FilteredSynth] Configuration updated:', newConfig);
  }
  
  /**
   * Applique les changements de configuration en temps réel
   */
  applyConfigChanges(oldConfig, newConfig) {
    try {
      // Changements de source (nécessitent redémarrage)
      if (oldConfig.sourceType !== newConfig.sourceType ||
          oldConfig.waveform !== newConfig.waveform ||
          oldConfig.noiseType !== newConfig.noiseType) {
        console.log('[FilteredSynth] Source changes require restart');
        return;
      }
      
      // Changements de fréquence
      if (oldConfig.frequency !== newConfig.frequency && 
          this.source && this.source.frequency) {
        this.source.frequency.value = newConfig.frequency;
      }
      
      // Changements d'amplitude
      if (oldConfig.amplitude !== newConfig.amplitude && this.gain) {
        this.gain.gain.rampTo(newConfig.amplitude, 0.1);
      }
      
      // Changements de détune
      if (oldConfig.detune !== newConfig.detune && 
          this.source && this.source.detune) {
        this.source.detune.value = newConfig.detune;
      }
      
      // Changements de filtre
      if (this.filter) {
        if (oldConfig.cutoffFrequency !== newConfig.cutoffFrequency) {
          this.filter.frequency.rampTo(newConfig.cutoffFrequency, 0.1);
        }
        
        if (oldConfig.Q !== newConfig.Q) {
          this.filter.Q.rampTo(newConfig.Q, 0.1);
        }
        
        if (oldConfig.filterType !== newConfig.filterType) {
          this.filter.type = newConfig.filterType;
        }
      }
      
    } catch (error) {
      console.error('[FilteredSynth] Failed to apply config changes:', error);
    }
  }
  
  /**
   * Met à jour le type de filtre
   */
  updateFilterType(type) {
    const validTypes = ['lowpass', 'highpass', 'bandpass', 'notch', 'allpass', 'peaking'];
    
    if (validTypes.includes(type)) {
      this.config.filterType = type;
      
      if (this.filter && !this.filter.disposed) {
        this.filter.type = type;
      }
      
      console.log(`[FilteredSynth] Filter type updated to ${type}`);
    } else {
      console.warn(`[FilteredSynth] Invalid filter type: ${type}`);
    }
  }
  
  /**
   * Met à jour la fréquence de coupure
   */
  updateCutoffFrequency(frequency) {
    this.config.cutoffFrequency = Math.max(20, Math.min(20000, frequency));
    
    if (this.filter && !this.filter.disposed) {
      this.filter.frequency.rampTo(this.config.cutoffFrequency, 0.05);
    }
    
    console.log(`[FilteredSynth] Cutoff frequency updated to ${this.config.cutoffFrequency}Hz`);
  }
  
  /**
   * Met à jour la résonance (Q)
   */
  updateResonance(Q) {
    this.config.Q = Math.max(0.1, Math.min(50, Q));
    
    if (this.filter && !this.filter.disposed) {
      this.filter.Q.rampTo(this.config.Q, 0.05);
    }
    
    console.log(`[FilteredSynth] Resonance updated to ${this.config.Q}`);
  }
  
  /**
   * Met à jour le type de source
   */
  updateSourceType(type) {
    if (type === 'oscillator' || type === 'noise') {
      this.config.sourceType = type;
      console.log(`[FilteredSynth] Source type updated to ${type} (restart needed)`);
    }
  }
  
  /**
   * Met à jour la forme d'onde de l'oscillateur
   */
  updateWaveform(waveform) {
    this.config.waveform = waveform;
    
    if (this.source && this.source.type !== undefined) {
      this.source.type = waveform;
    }
    
    console.log(`[FilteredSynth] Waveform updated to ${waveform}`);
  }
  
  /**
   * Met à jour le type de bruit
   */
  updateNoiseType(noiseType) {
    this.config.noiseType = noiseType;
    console.log(`[FilteredSynth] Noise type updated to ${noiseType} (restart needed)`);
  }
  
  /**
   * Met à jour la fréquence de la source
   */
  updateSourceFrequency(frequency) {
    this.config.frequency = Math.max(20, Math.min(20000, frequency));
    
    if (this.source && this.source.frequency) {
      this.source.frequency.value = this.config.frequency;
    }
    
    console.log(`[FilteredSynth] Source frequency updated to ${this.config.frequency}Hz`);
  }
  
  /**
   * Effectue un balayage du filtre (sweep)
   */
  sweepFilter(startFreq, endFreq, duration = 2) {
    if (!this.filter || this.filter.disposed) {
      console.warn('[FilteredSynth] No active filter for sweep');
      return false;
    }
    
    try {
      console.log(`[FilteredSynth] Starting filter sweep: ${startFreq}Hz → ${endFreq}Hz over ${duration}s`);
      
      // Démarrer le sweep
      this.filter.frequency.value = startFreq;
      this.filter.frequency.rampTo(endFreq, duration);
      
      // Mettre à jour la config à la fin
      setTimeout(() => {
        this.config.cutoffFrequency = endFreq;
      }, duration * 1000);
      
      return true;
      
    } catch (error) {
      console.error('[FilteredSynth] Failed to perform filter sweep:', error);
      return false;
    }
  }
  
  /**
   * Effectue un sweep de résonance
   */
  sweepResonance(startQ, endQ, duration = 2) {
    if (!this.filter || this.filter.disposed) {
      console.warn('[FilteredSynth] No active filter for resonance sweep');
      return false;
    }
    
    try {
      console.log(`[FilteredSynth] Starting resonance sweep: Q${startQ} → Q${endQ} over ${duration}s`);
      
      this.filter.Q.value = startQ;
      this.filter.Q.rampTo(endQ, duration);
      
      setTimeout(() => {
        this.config.Q = endQ;
      }, duration * 1000);
      
      return true;
      
    } catch (error) {
      console.error('[FilteredSynth] Failed to perform resonance sweep:', error);
      return false;
    }
  }
  
  /**
   * Obtient les données du spectre filtré
   */
  getFilteredSpectrum() {
    if (!this.analyser || this.analyser.disposed) {
      return null;
    }
    
    try {
      return this.analyser.getValue();
    } catch (error) {
      console.error('[FilteredSynth] Failed to get filtered spectrum:', error);
      return null;
    }
  }
  
  /**
   * Calcule la réponse théorique du filtre
   */
  calculateFilterResponse(frequencies = null) {
    if (!frequencies) {
      // Générer des fréquences logarithmiques de 20Hz à 20kHz
      frequencies = [];
      for (let i = 0; i < 1000; i++) {
        const freq = 20 * Math.pow(1000, i / 999); // 20Hz à 20kHz
        frequencies.push(freq);
      }
    }
    
    const response = frequencies.map(freq => {
      const magnitude = this.calculateFilterMagnitude(freq);
      const phase = this.calculateFilterPhase(freq);
      
      return {
        frequency: freq,
        magnitude: magnitude,
        magnitudeDB: 20 * Math.log10(Math.abs(magnitude)),
        phase: phase
      };
    });
    
    return response;
  }
  
  /**
   * Calcule la magnitude du filtre pour une fréquence
   */
  calculateFilterMagnitude(frequency) {
    const omega = 2 * Math.PI * frequency;
    const omegaC = 2 * Math.PI * this.config.cutoffFrequency;
    const Q = this.config.Q;
    
    // Normaliser la fréquence
    const s = omega / omegaC;
    
    switch (this.config.filterType) {
      case 'lowpass':
        return 1 / Math.sqrt(1 + Math.pow(s * Q, 2));
        
      case 'highpass':
        return (s * Q) / Math.sqrt(1 + Math.pow(s * Q, 2));
        
      case 'bandpass':
        return 1 / Math.sqrt(1 + Math.pow(Q * (s - 1/s), 2));
        
      case 'notch':
        const numerator = Math.pow(s, 2) + 1;
        const denominator = Math.sqrt(Math.pow(s, 4) + Math.pow(1 + s*s/Q, 2));
        return numerator / denominator;
        
      case 'allpass':
        return 1; // Magnitude constante pour all-pass
        
      default:
        return 1;
    }
  }
  
  /**
   * Calcule la phase du filtre pour une fréquence
   */
  calculateFilterPhase(frequency) {
    const omega = 2 * Math.PI * frequency;
    const omegaC = 2 * Math.PI * this.config.cutoffFrequency;
    const Q = this.config.Q;
    const s = omega / omegaC;
    
    switch (this.config.filterType) {
      case 'lowpass':
        return -Math.atan(s * Q);
        
      case 'highpass':
        return Math.PI/2 - Math.atan(s * Q);
        
      case 'bandpass':
        return -Math.atan(Q * (s - 1/s));
        
      case 'notch':
        return -Math.atan((2 * s) / (s*s - 1));
        
      case 'allpass':
        return -2 * Math.atan(s / Q);
        
      default:
        return 0;
    }
  }
  
  /**
   * Crée un preset de filtre
   */
  loadFilterPreset(presetName) {
    const presets = {
      'low-warm': {
        filterType: 'lowpass',
        cutoffFrequency: 800,
        Q: 2,
        rolloff: -12
      },
      'high-bright': {
        filterType: 'highpass',
        cutoffFrequency: 1200,
        Q: 1.5,
        rolloff: -12
      },
      'band-vocal': {
        filterType: 'bandpass',
        cutoffFrequency: 1000,
        Q: 8,
        rolloff: -12
      },
      'notch-radio': {
        filterType: 'notch',
        cutoffFrequency: 3000,
        Q: 10,
        rolloff: -24
      },
      'resonant-acid': {
        filterType: 'lowpass',
        cutoffFrequency: 600,
        Q: 15,
        rolloff: -24
      }
    };
    
    const preset = presets[presetName];
    if (preset) {
      this.updateConfig(preset);
      console.log(`[FilteredSynth] Loaded preset: ${presetName}`);
      return true;
    } else {
      console.warn(`[FilteredSynth] Unknown preset: ${presetName}`);
      return false;
    }
  }
  
  /**
   * Obtient la configuration actuelle
   */
  getConfig() {
    return { ...this.config };
  }
  
  /**
   * Vérifie si le synthé joue
   */
  isCurrentlyPlaying() {
    return this.isPlaying && this.source && !this.source.disposed;
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
   * Nettoie les composants auxiliaires
   */
  cleanupComponents() {
    this.components.forEach(component => {
      try {
        if (component && typeof component.dispose === 'function' && !component.disposed) {
          component.dispose();
        }
      } catch (error) {
        console.warn('[FilteredSynth] Error disposing component:', error);
      }
    });
    
    this.components = [];
  }
  
  /**
   * Nettoyage complet
   */
  cleanup() {
    try {
      this.stopNote();
      this.cleanupComponents();
      
      console.log('[FilteredSynth] Cleanup completed');
      
    } catch (error) {
      console.error('[FilteredSynth] Cleanup failed:', error);
    }
  }
  
  /**
   * Obtient des informations de statut
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      config: this.getConfig(),
      componentsCount: this.components.length,
      hasSource: !!this.source,
      hasFilter: !!this.filter,
      hasGain: !!this.gain,
      hasAnalyser: !!this.analyser,
      filterResponse: this.filter ? {
        frequency: this.filter.frequency.value,
        Q: this.filter.Q.value,
        type: this.filter.type
      } : null
    };
  }
}

// Factory function
window.createFilteredSynth = function(config = {}) {
  const synth = new FilteredSynth();
  if (Object.keys(config).length > 0) {
    synth.updateConfig(config);
  }
  return synth;
};

// Instance globale pour l'onglet Filtres
window.filteredSynth = new FilteredSynth();

// Presets globaux pour l'interface
window.filterPresets = {
  loadPreset: (presetName) => {
    if (window.filteredSynth) {
      return window.filteredSynth.loadFilterPreset(presetName);
    }
    return false;
  },
  
  getAvailablePresets: () => {
    return ['low-warm', 'high-bright', 'band-vocal', 'notch-radio', 'resonant-acid'];
  }
};

console.log('[FilteredSynth] Class loaded and global instance created');