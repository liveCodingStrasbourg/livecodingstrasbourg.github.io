/**
 * WavetableSynth.js - Synthétiseur wavetable avec morphing et modulation
 * Sound Synthesis Explorer - TOPLAP Strasbourg
 */

class WavetableSynth {
  constructor() {
    this.isPlaying = false;
    this.components = [];
    this.activeNotes = new Map();
    
    // Tables d'ondes pré-calculées
    this.wavetables = new Map();
    this.currentWavetable = 'basic';
    
    // Configuration par défaut
    this.config = {
      // Wavetable
      wavetable: 'basic',
      position: 0,              // Position dans la wavetable (0-100%)
      tableSize: 256,           // Taille de chaque table
      tablesCount: 64,          // Nombre de tables dans une wavetable
      
      // Oscillateur
      frequency: 220,
      amplitude: 0.6,
      detune: 0,
      
      // Modulation de position
      positionModulation: {
        enabled: false,
        lfoRate: 2,             // Hz
        depth: 25,              // % de modulation
        waveform: 'triangle'
      },
      
      // Enveloppe
      envelope: {
        attack: 0.1,
        decay: 0.3,
        sustain: 0.8,
        release: 0.5
      },
      
      // Global
      masterVolume: 0.6,
      polyphony: 4,
      
      // Anti-aliasing
      antiAliasing: true,
      interpolation: 'linear'   // 'linear', 'cubic'
    };
    
    this.bindMethods();
    this.generateWavetables();
  }
  
  bindMethods() {
    this.cleanup = this.cleanup.bind(this);
    this.playNote = this.playNote.bind(this);
    this.stopNote = this.stopNote.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
    this.generateWavetables = this.generateWavetables.bind(this);
  }
  
  /**
   * Génère toutes les wavetables
   */
  generateWavetables() {
    try {
      console.log('[WavetableSynth] Generating wavetables...');
      
      // Générer chaque wavetable
      this.generateBasicWavetable();
      this.generateHarmonicsWavetable();
      this.generateEvolvingWavetable();
      this.generateDigitalWavetable();
      this.generateOrganicWavetable();
      this.generateMetallicWavetable();
      
      console.log(`[WavetableSynth] Generated ${this.wavetables.size} wavetables`);
      
    } catch (error) {
      console.error('[WavetableSynth] Failed to generate wavetables:', error);
    }
  }
  
  /**
   * Génère la wavetable Basic (sine → square)
   */
  generateBasicWavetable() {
    const tables = [];
    const tablesCount = this.config.tablesCount;
    const tableSize = this.config.tableSize;
    
    for (let t = 0; t < tablesCount; t++) {
      const table = new Float32Array(tableSize);
      const morphPosition = t / (tablesCount - 1); // 0 à 1
      
      for (let i = 0; i < tableSize; i++) {
        const phase = (i / tableSize) * 2 * Math.PI;
        
        // Interpolation entre sine et square
        const sineValue = Math.sin(phase);
        const squareValue = Math.sign(Math.sin(phase));
        
        table[i] = sineValue * (1 - morphPosition) + squareValue * morphPosition;
      }
      
      tables.push(table);
    }
    
    this.wavetables.set('basic', {
      name: 'Basic',
      description: 'Transition sine → square',
      tables: tables
    });
  }
  
  /**
   * Génère la wavetable Harmonics (ajout progressif harmoniques)
   */
  generateHarmonicsWavetable() {
    const tables = [];
    const tablesCount = this.config.tablesCount;
    const tableSize = this.config.tableSize;
    
    for (let t = 0; t < tablesCount; t++) {
      const table = new Float32Array(tableSize);
      const maxHarmonics = Math.floor(1 + t * 15 / tablesCount); // 1 à 16 harmoniques
      
      for (let i = 0; i < tableSize; i++) {
        const phase = (i / tableSize) * 2 * Math.PI;
        let sample = 0;
        
        // Additionner les harmoniques
        for (let h = 1; h <= maxHarmonics; h++) {
          const amplitude = 1 / h; // Amplitude décroissante
          sample += amplitude * Math.sin(phase * h);
        }
        
        table[i] = sample * 0.3; // Normaliser
      }
      
      tables.push(table);
    }
    
    this.wavetables.set('harmonics', {
      name: 'Harmonics',
      description: 'Ajout progressif harmoniques',
      tables: tables
    });
  }
  
  /**
   * Génère la wavetable Evolving (évolution complexe)
   */
  generateEvolvingWavetable() {
    const tables = [];
    const tablesCount = this.config.tablesCount;
    const tableSize = this.config.tableSize;
    
    for (let t = 0; t < tablesCount; t++) {
      const table = new Float32Array(tableSize);
      const evolution = t / (tablesCount - 1);
      
      for (let i = 0; i < tableSize; i++) {
        const phase = (i / tableSize) * 2 * Math.PI;
        
        // Combinaison évolutive de différentes formes
        const fundamental = Math.sin(phase);
        const third = Math.sin(phase * 3) * (0.5 * evolution);
        const fifth = Math.sin(phase * 5) * (0.3 * Math.sin(evolution * Math.PI));
        const noise = (Math.random() - 0.5) * 0.1 * evolution;
        
        table[i] = fundamental + third + fifth + noise;
      }
      
      tables.push(table);
    }
    
    this.wavetables.set('evolving', {
      name: 'Evolving',
      description: 'Évolution complexe 3ème/5ème harmoniques',
      tables: tables
    });
  }
  
  /**
   * Génère la wavetable Digital (réduction bits progressive)
   */
  generateDigitalWavetable() {
    const tables = [];
    const tablesCount = this.config.tablesCount;
    const tableSize = this.config.tableSize;
    
    for (let t = 0; t < tablesCount; t++) {
      const table = new Float32Array(tableSize);
      const bitDepth = Math.max(1, Math.floor(8 - (t * 7 / tablesCount))); // 8 à 1 bits
      const levels = Math.pow(2, bitDepth);
      
      for (let i = 0; i < tableSize; i++) {
        const phase = (i / tableSize) * 2 * Math.PI;
        let sample = Math.sin(phase);
        
        // Quantification (réduction de bits)
        sample = Math.round(sample * levels) / levels;
        
        table[i] = sample;
      }
      
      tables.push(table);
    }
    
    this.wavetables.set('digital', {
      name: 'Digital',
      description: 'Réduction bits progressive',
      tables: tables
    });
  }
  
  /**
   * Génère la wavetable Organic (harmoniques non-entières)
   */
  generateOrganicWavetable() {
    const tables = [];
    const tablesCount = this.config.tablesCount;
    const tableSize = this.config.tableSize;
    
    for (let t = 0; t < tablesCount; t++) {
      const table = new Float32Array(tableSize);
      const organicFactor = t / (tablesCount - 1);
      
      for (let i = 0; i < tableSize; i++) {
        const phase = (i / tableSize) * 2 * Math.PI;
        let sample = 0;
        
        // Harmoniques avec ratios organiques
        const ratios = [1, 1.414, 2.236, 3.162, 4.123]; // Ratios irrationnels
        
        ratios.forEach((ratio, index) => {
          const amplitude = 1 / (index + 1);
          const organicRatio = ratio * (1 + organicFactor * 0.1 * Math.sin(index));
          sample += amplitude * Math.sin(phase * organicRatio);
        });
        
        table[i] = sample * 0.3;
      }
      
      tables.push(table);
    }
    
    this.wavetables.set('organic', {
      name: 'Organic',
      description: 'Harmoniques non-entières organic',
      tables: tables
    });
  }
  
  /**
   * Génère la wavetable Metallic (harmoniques inharmoniques)
   */
  generateMetallicWavetable() {
    const tables = [];
    const tablesCount = this.config.tablesCount;
    const tableSize = this.config.tableSize;
    
    for (let t = 0; t < tablesCount; t++) {
      const table = new Float32Array(tableSize);
      const metallicness = t / (tablesCount - 1);
      
      for (let i = 0; i < tableSize; i++) {
        const phase = (i / tableSize) * 2 * Math.PI;
        let sample = 0;
        
        // Harmoniques inharmoniques (bell-like)
        const partials = [1, 2.76, 5.404, 8.933, 13.347];
        
        partials.forEach((partial, index) => {
          const amplitude = 1 / Math.pow(index + 1, 0.5);
          const inharmonic = partial * (1 + metallicness * 0.3);
          sample += amplitude * Math.sin(phase * inharmonic);
        });
        
        table[i] = sample * 0.25;
      }
      
      tables.push(table);
    }
    
    this.wavetables.set('metallic', {
      name: 'Metallic',
      description: 'Harmoniques inharmoniques metalliques',
      tables: tables
    });
  }
  
  /**
   * Joue une note avec wavetable
   */
  playNote(note, duration = null, velocity = 0.8) {
    try {
      if (!window.audioManager || !window.audioManager.isReady()) {
        console.warn('[WavetableSynth] AudioManager not ready');
        return false;
      }
      
      const frequency = window.audioManager.noteToFrequency(note);
      const noteId = note + '_' + Date.now();
      
      // Vérifier la limite de polyphonie
      if (this.activeNotes.size >= this.config.polyphony) {
        const oldestNote = this.activeNotes.keys().next().value;
        this.stopNote(oldestNote);
      }
      
      // Créer la voix wavetable
      const voice = this.createWavetableVoice(frequency, velocity);
      if (!voice) {
        return false;
      }
      
      this.activeNotes.set(noteId, voice);
      this.isPlaying = true;
      
      console.log(`[WavetableSynth] Playing wavetable note ${note} (${frequency.toFixed(1)}Hz), table: ${this.config.wavetable}, position: ${this.config.position}%`);
      
      // Arrêt automatique si durée spécifiée
      if (duration) {
        setTimeout(() => {
          this.stopNote(noteId);
        }, duration * 1000);
      }
      
      return true;
      
    } catch (error) {
      console.error('[WavetableSynth] Failed to play note:', error);
      return false;
    }
  }
  
  /**
   * Crée une voix wavetable
   */
  createWavetableVoice(frequency, velocity) {
    try {
      const voice = {
        components: [],
        frequency: frequency,
        velocity: velocity,
        oscillator: null,
        envelope: null,
        gain: null,
        positionLFO: null
      };
      
      // Obtenir la wavetable courante
      const wavetableData = this.wavetables.get(this.config.wavetable);
      if (!wavetableData) {
        throw new Error(`Wavetable not found: ${this.config.wavetable}`);
      }
      
      // Créer l'oscillateur avec la forme d'onde interpolée
      const waveform = this.getInterpolatedWaveform(wavetableData, this.config.position);
      voice.oscillator = this.createCustomOscillator(frequency, waveform);
      
      if (!voice.oscillator) {
        throw new Error('Failed to create wavetable oscillator');
      }
      
      voice.components.push(voice.oscillator);
      
      // Créer l'enveloppe
      voice.envelope = window.audioManager.createEnvelope(
        this.config.envelope.attack,
        this.config.envelope.decay,
        this.config.envelope.sustain,
        this.config.envelope.release
      );
      
      if (!voice.envelope) {
        throw new Error('Failed to create envelope');
      }
      
      voice.components.push(voice.envelope);
      
      // Créer le gain final
      voice.gain = new Tone.Gain(this.config.masterVolume * velocity);
      voice.components.push(voice.gain);
      
      // Ajouter la modulation de position si activée
      if (this.config.positionModulation.enabled) {
        voice.positionLFO = this.createPositionModulation(voice);
      }
      
      // Connexions : Oscillator → Envelope → Gain → Master
      voice.oscillator.connect(voice.envelope);
      voice.envelope.connect(voice.gain);
      voice.gain.connect(window.audioManager.masterGain);
      
      // Tracking des composants
      voice.components.forEach(comp => this.addComponent(comp));
      
      // Démarrer
      voice.oscillator.start();
      voice.envelope.triggerAttack();
      
      if (voice.positionLFO) {
        voice.positionLFO.start();
      }
      
      return voice;
      
    } catch (error) {
      console.error('[WavetableSynth] Failed to create wavetable voice:', error);
      return null;
    }
  }
  
  /**
   * Obtient une forme d'onde interpolée selon la position
   */
  getInterpolatedWaveform(wavetableData, position) {
    const tables = wavetableData.tables;
    const normalizedPosition = Math.max(0, Math.min(1, position / 100));
    const tableIndex = normalizedPosition * (tables.length - 1);
    
    const lowerIndex = Math.floor(tableIndex);
    const upperIndex = Math.min(lowerIndex + 1, tables.length - 1);
    const blend = tableIndex - lowerIndex;
    
    const lowerTable = tables[lowerIndex];
    const upperTable = tables[upperIndex];
    
    // Interpolation linéaire entre les deux tables
    const interpolatedTable = new Float32Array(this.config.tableSize);
    
    for (let i = 0; i < this.config.tableSize; i++) {
      if (this.config.interpolation === 'cubic' && blend > 0) {
        // Interpolation cubique (plus lisse)
        interpolatedTable[i] = this.cubicInterpolate(
          lowerIndex > 0 ? tables[lowerIndex - 1][i] : lowerTable[i],
          lowerTable[i],
          upperTable[i],
          upperIndex < tables.length - 1 ? tables[upperIndex + 1][i] : upperTable[i],
          blend
        );
      } else {
        // Interpolation linéaire
        interpolatedTable[i] = lowerTable[i] * (1 - blend) + upperTable[i] * blend;
      }
    }
    
    return interpolatedTable;
  }
  
  /**
   * Interpolation cubique
   */
  cubicInterpolate(y0, y1, y2, y3, mu) {
    const mu2 = mu * mu;
    const a0 = y3 - y2 - y0 + y1;
    const a1 = y0 - y1 - a0;
    const a2 = y2 - y0;
    const a3 = y1;
    
    return a0 * mu * mu2 + a1 * mu2 + a2 * mu + a3;
  }
  
  /**
   * Crée un oscillateur personnalisé avec une forme d'onde
   */
  createCustomOscillator(frequency, waveform) {
    try {
      // Créer une table d'onde périodique
      const real = new Float32Array(waveform.length);
      const imag = new Float32Array(waveform.length);
      
      // Convertir la forme d'onde en composantes de Fourier
      for (let i = 0; i < waveform.length; i++) {
        real[i] = waveform[i];
      }
      
      // Créer la PeriodicWave
      const periodicWave = Tone.context.createPeriodicWave(real, imag, {
        disableNormalization: false
      });
      
      // Créer l'oscillateur avec cette forme d'onde
      const osc = new Tone.Oscillator(frequency, 'custom');
      osc.setPeriodicWave(periodicWave);
      
      return osc;
      
    } catch (error) {
      console.error('[WavetableSynth] Failed to create custom oscillator:', error);
      // Fallback à un oscillateur sine
      return new Tone.Oscillator(frequency, 'sine');
    }
  }
  
  /**
   * Crée la modulation de position
   */
  createPositionModulation(voice) {
    try {
      const lfo = window.audioManager.createLFO(
        this.config.positionModulation.lfoRate,
        this.config.positionModulation.waveform,
        -1, 1
      );
      
      if (!lfo) {
        console.warn('[WavetableSynth] Failed to create position LFO');
        return null;
      }
      
      voice.components.push(lfo);
      
      // Créer un gain pour contrôler la profondeur
      const modGain = new Tone.Gain(this.config.positionModulation.depth / 100);
      voice.components.push(modGain);
      
      // Connecter le LFO au contrôle de position (simulation)
      lfo.connect(modGain);
      
      // Note: La modulation réelle de position nécessiterait
      // une implémentation plus complexe avec recalcul en temps réel
      // Pour cette démo, on simule l'effet
      
      return lfo;
      
    } catch (error) {
      console.error('[WavetableSynth] Failed to create position modulation:', error);
      return null;
    }
  }
  
  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig) {
    this.config = this.deepMerge(this.config, newConfig);
    console.log('[WavetableSynth] Configuration updated:', newConfig);
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
   * Change la wavetable active
   */
  setWavetable(wavetableName) {
    if (this.wavetables.has(wavetableName)) {
      this.config.wavetable = wavetableName;
      this.currentWavetable = wavetableName;
      console.log(`[WavetableSynth] Switched to wavetable: ${wavetableName}`);
      return true;
    } else {
      console.warn(`[WavetableSynth] Unknown wavetable: ${wavetableName}`);
      return false;
    }
  }
  
  /**
   * Met à jour la position dans la wavetable
   */
  updatePosition(position) {
    this.config.position = Math.max(0, Math.min(100, position));
    console.log(`[WavetableSynth] Position updated to ${this.config.position}%`);
  }
  
  /**
   * Met à jour la fréquence
   */
  updateFrequency(frequency) {
    this.config.frequency = Math.max(20, Math.min(20000, frequency));
    
    // Mettre à jour les voix actives
    this.activeNotes.forEach(voice => {
      if (voice.oscillator && !voice.oscillator.disposed) {
        voice.oscillator.frequency.rampTo(this.config.frequency, 0.1);
      }
    });
    
    console.log(`[WavetableSynth] Frequency updated to ${this.config.frequency}Hz`);
  }
  
  /**
   * Active/désactive la modulation de position
   */
  togglePositionModulation(enabled) {
    this.config.positionModulation.enabled = enabled;
    console.log(`[WavetableSynth] Position modulation ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Met à jour les paramètres de modulation
   */
  updatePositionModulation(params) {
    this.config.positionModulation = { ...this.config.positionModulation, ...params };
    console.log('[WavetableSynth] Position modulation updated:', params);
  }
  
  /**
   * Génère les données de la wavetable courante pour visualisation
   */
  generateWavetableVisualization() {
    const wavetableData = this.wavetables.get(this.config.wavetable);
    if (!wavetableData) {
      return null;
    }
    
    const currentWaveform = this.getInterpolatedWaveform(wavetableData, this.config.position);
    
    return {
      wavetableName: this.config.wavetable,
      position: this.config.position,
      waveform: Array.from(currentWaveform),
      tableSize: this.config.tableSize,
      tablesCount: this.config.tablesCount
    };
  }
  
  /**
   * Obtient la liste des wavetables disponibles
   */
  getAvailableWavetables() {
    return Array.from(this.wavetables.keys()).map(key => {
      const data = this.wavetables.get(key);
      return {
        id: key,
        name: data.name,
        description: data.description
      };
    });
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
      console.error('[WavetableSynth] Failed to trigger release:', error);
    }
  }
  
  /**
   * Relâche une voix
   */
  releaseVoice(voice) {
    try {
      if (voice.envelope && !voice.envelope.disposed) {
        voice.envelope.triggerRelease();
        
        // Programmer la suppression après le release
        const releaseTime = this.config.envelope.release;
        setTimeout(() => {
          this.disposeVoice(voice);
        }, (releaseTime + 0.1) * 1000);
      }
      
    } catch (error) {
      console.error('[WavetableSynth] Failed to release voice:', error);
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
          console.warn('[WavetableSynth] Error disposing voice component:', error);
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
      console.error('[WavetableSynth] Failed to dispose voice:', error);
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
      
      console.log(`[WavetableSynth] Stopped note(s), active voices: ${this.activeNotes.size}`);
      
    } catch (error) {
      console.error('[WavetableSynth] Failed to stop note:', error);
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
          console.warn('[WavetableSynth] Error disposing component:', error);
        }
      });
      
      this.components = [];
      this.activeNotes.clear();
      this.isPlaying = false;
      
      console.log('[WavetableSynth] Cleanup completed');
      
    } catch (error) {
      console.error('[WavetableSynth] Cleanup failed:', error);
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
      currentWavetable: this.config.wavetable,
      position: this.config.position,
      positionModulation: this.config.positionModulation.enabled,
      availableWavetables: this.getAvailableWavetables(),
      config: this.getConfig(),
      componentsCount: this.components.length
    };
  }
}

// Factory function
window.createWavetableSynth = function(config = {}) {
  const synth = new WavetableSynth();
  if (Object.keys(config).length > 0) {
    synth.updateConfig(config);
  }
  return synth;
};

// Instance globale pour l'onglet Wavetables
window.wavetableSynth = new WavetableSynth();

console.log('[WavetableSynth] Class loaded and global instance created');