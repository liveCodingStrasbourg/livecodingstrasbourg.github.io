/**
 * ModulatedSynth.js - Synthétiseur avec modulation LFO (vibrato/trémolo)
 * Sound Synthesis Explorer - TOPLAP Strasbourg
 */

class ModulatedSynth {
  constructor() {
    this.isPlaying = false;
    this.components = [];
    
    // Composants audio
    this.carrier = null;           // Oscillateur principal
    this.lfo = null;              // Low Frequency Oscillator
    this.gain = null;             // Contrôle d'amplitude
    this.modulationGain = null;   // Gain pour modulation d'amplitude
    
    // Configuration par défaut
    this.config = {
      // Oscillateur porteur
      carrierWaveform: 'sine',
      carrierFrequency: 440,
      carrierAmplitude: 0.6,
      
      // LFO
      lfoRate: 5,              // Hz
      lfoWaveform: 'sine',
      lfoDepth: 20,            // Profondeur de modulation
      
      // Type de modulation
      modulationType: 'frequency', // 'frequency' (vibrato) ou 'amplitude' (trémolo)
      
      // Paramètres avancés
      detune: 0,
      phase: 0
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
   * Joue une note avec modulation
   */
  playNote(note, duration = null, velocity = 0.8) {
    try {
      if (!window.audioManager || !window.audioManager.isReady()) {
        console.warn('[ModulatedSynth] AudioManager not ready');
        return false;
      }
      
      // Arrêter la note précédente
      this.stopNote();
      
      const frequency = window.audioManager.noteToFrequency(note);
      
      // Créer l'oscillateur porteur
      this.carrier = window.audioManager.createOscillator(
        this.config.carrierWaveform,
        frequency
      );
      
      if (!this.carrier) {
        console.error('[ModulatedSynth] Failed to create carrier oscillator');
        return false;
      }
      
      // Appliquer le détune
      if (this.config.detune !== 0) {
        this.carrier.detune.value = this.config.detune;
      }
      
      // Créer le LFO
      this.lfo = window.audioManager.createLFO(
        this.config.lfoRate,
        this.config.lfoWaveform,
        -1, // Min value
        1   // Max value
      );
      
      if (!this.lfo) {
        console.error('[ModulatedSynth] Failed to create LFO');
        return false;
      }
      
      // Créer le gain principal
      this.gain = new Tone.Gain(this.config.carrierAmplitude * velocity);
      this.addComponent(this.gain);
      
      // Setup de la modulation selon le type
      if (this.config.modulationType === 'frequency') {
        this.setupFrequencyModulation(frequency);
      } else if (this.config.modulationType === 'amplitude') {
        this.setupAmplitudeModulation();
      }
      
      // Connecter au master
      this.gain.connect(window.audioManager.masterGain);
      
      // Démarrer
      this.carrier.start();
      this.lfo.start();
      this.isPlaying = true;
      
      console.log(`[ModulatedSynth] Playing modulated note ${note} (${frequency.toFixed(1)}Hz)`);
      console.log(`[ModulatedSynth] LFO: ${this.config.lfoRate}Hz ${this.config.lfoWaveform}, Type: ${this.config.modulationType}`);
      
      // Arrêt automatique si durée spécifiée
      if (duration) {
        setTimeout(() => {
          this.stopNote();
        }, duration * 1000);
      }
      
      return true;
      
    } catch (error) {
      console.error('[ModulatedSynth] Failed to play note:', error);
      return false;
    }
  }
  
  /**
   * Configure la modulation de fréquence (vibrato)
   */
  setupFrequencyModulation(baseFrequency) {
    try {
      // Calculer la profondeur en Hz
      const modulationDepthHz = (this.config.lfoDepth / 100) * baseFrequency * 0.1;
      
      // Créer un gain pour contrôler la profondeur de modulation
      const modulationGain = new Tone.Gain(modulationDepthHz);
      this.addComponent(modulationGain);
      
      // Connecter : LFO → modulationGain → carrier.frequency
      this.lfo.connect(modulationGain);
      modulationGain.connect(this.carrier.frequency);
      
      // Connecter le carrier au gain principal
      this.carrier.connect(this.gain);
      
      console.log(`[ModulatedSynth] Frequency modulation setup: ±${modulationDepthHz.toFixed(1)}Hz`);
      
    } catch (error) {
      console.error('[ModulatedSynth] Failed to setup frequency modulation:', error);
      // Fallback: connexion directe
      this.carrier.connect(this.gain);
    }
  }
  
  /**
   * Configure la modulation d'amplitude (trémolo)
   */
  setupAmplitudeModulation() {
    try {
      // Créer un gain modulé pour l'amplitude
      this.modulationGain = new Tone.Gain(1);
      this.addComponent(this.modulationGain);
      
      // Créer un gain pour contrôler la profondeur de modulation
      const depthGain = new Tone.Gain(this.config.lfoDepth / 200); // Divisé par 200 pour avoir une modulation subtile
      this.addComponent(depthGain);
      
      // Créer un offset pour éviter que l'amplitude devienne négative
      const offsetGain = new Tone.Gain(0.5);
      this.addComponent(offsetGain);
      
      // Connecter : carrier → modulationGain → gain → master
      this.carrier.connect(this.modulationGain);
      this.modulationGain.connect(this.gain);
      
      // Connecter la modulation : LFO → depthGain → modulationGain.gain
      this.lfo.connect(depthGain);
      depthGain.connect(this.modulationGain.gain);
      
      // Ajouter un offset pour centrer la modulation autour de 1
      offsetGain.connect(this.modulationGain.gain);
      
      console.log(`[ModulatedSynth] Amplitude modulation setup: depth ${this.config.lfoDepth}%`);
      
    } catch (error) {
      console.error('[ModulatedSynth] Failed to setup amplitude modulation:', error);
      // Fallback: connexion directe
      this.carrier.connect(this.gain);
    }
  }
  
  /**
   * Arrête la note en cours
   */
  stopNote() {
    try {
      if (this.carrier && !this.carrier.disposed) {
        this.carrier.stop();
        this.carrier.dispose();
        this.carrier = null;
      }
      
      if (this.lfo && !this.lfo.disposed) {
        this.lfo.stop();
        this.lfo.dispose();
        this.lfo = null;
      }
      
      if (this.gain && !this.gain.disposed) {
        this.gain.dispose();
        this.gain = null;
      }
      
      if (this.modulationGain && !this.modulationGain.disposed) {
        this.modulationGain.dispose();
        this.modulationGain = null;
      }
      
      // Nettoyer tous les composants auxiliaires
      this.cleanupComponents();
      
      this.isPlaying = false;
      console.log('[ModulatedSynth] Note stopped');
      
    } catch (error) {
      console.error('[ModulatedSynth] Failed to stop note:', error);
    }
  }
  
  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig) {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };
    
    // Si une note est en cours, appliquer les changements dynamiquement
    if (this.isPlaying) {
      this.applyConfigChanges(oldConfig, this.config);
    }
    
    console.log('[ModulatedSynth] Configuration updated:', newConfig);
  }
  
  /**
   * Applique les changements de configuration en temps réel
   */
  applyConfigChanges(oldConfig, newConfig) {
    try {
      // Changement de forme d'onde du porteur
      if (oldConfig.carrierWaveform !== newConfig.carrierWaveform && this.carrier) {
        this.carrier.type = newConfig.carrierWaveform;
      }
      
      // Changement de fréquence du porteur
      if (oldConfig.carrierFrequency !== newConfig.carrierFrequency && this.carrier) {
        this.carrier.frequency.value = newConfig.carrierFrequency;
      }
      
      // Changement d'amplitude
      if (oldConfig.carrierAmplitude !== newConfig.carrierAmplitude && this.gain) {
        this.gain.gain.rampTo(newConfig.carrierAmplitude, 0.1);
      }
      
      // Changement de détune
      if (oldConfig.detune !== newConfig.detune && this.carrier) {
        this.carrier.detune.value = newConfig.detune;
      }
      
      // Changements LFO
      if (this.lfo) {
        if (oldConfig.lfoRate !== newConfig.lfoRate) {
          this.lfo.frequency.value = newConfig.lfoRate;
        }
        
        if (oldConfig.lfoWaveform !== newConfig.lfoWaveform) {
          this.lfo.type = newConfig.lfoWaveform;
        }
      }
      
      // Changement de profondeur de modulation
      if (oldConfig.lfoDepth !== newConfig.lfoDepth) {
        this.updateModulationDepth();
      }
      
      // Changement de type de modulation (nécessite reconstruction)
      if (oldConfig.modulationType !== newConfig.modulationType) {
        console.log('[ModulatedSynth] Modulation type changed, reconstruction needed');
        // Pour un changement de type, il faudrait reconstruire, 
        // mais on laisse ça pour la prochaine note
      }
      
    } catch (error) {
      console.error('[ModulatedSynth] Failed to apply config changes:', error);
    }
  }
  
  /**
   * Met à jour la profondeur de modulation
   */
  updateModulationDepth() {
    // Cette méthode est complexe car elle dépend du type de modulation
    // et de la façon dont les connexions sont établies
    // Pour simplifier, on note le changement pour la prochaine note
    console.log(`[ModulatedSynth] Modulation depth will be updated to ${this.config.lfoDepth}% on next note`);
  }
  
  /**
   * Met à jour le taux du LFO
   */
  updateLFORate(rate) {
    this.config.lfoRate = Math.max(0.1, Math.min(50, rate));
    
    if (this.lfo && !this.lfo.disposed) {
      this.lfo.frequency.value = this.config.lfoRate;
    }
    
    console.log(`[ModulatedSynth] LFO rate updated to ${this.config.lfoRate}Hz`);
  }
  
  /**
   * Met à jour la profondeur de modulation
   */
  updateLFODepth(depth) {
    this.config.lfoDepth = Math.max(0, Math.min(100, depth));
    this.updateModulationDepth();
    
    console.log(`[ModulatedSynth] LFO depth updated to ${this.config.lfoDepth}%`);
  }
  
  /**
   * Met à jour le type de modulation
   */
  updateModulationType(type) {
    if (type === 'frequency' || type === 'amplitude') {
      this.config.modulationType = type;
      console.log(`[ModulatedSynth] Modulation type updated to ${type}`);
      
      // Si une note est en cours, noter qu'un redémarrage est nécessaire
      if (this.isPlaying) {
        console.log('[ModulatedSynth] Restart note to apply modulation type change');
      }
    }
  }
  
  /**
   * Met à jour la forme d'onde du LFO
   */
  updateLFOWaveform(waveform) {
    this.config.lfoWaveform = waveform;
    
    if (this.lfo && !this.lfo.disposed) {
      this.lfo.type = waveform;
    }
    
    console.log(`[ModulatedSynth] LFO waveform updated to ${waveform}`);
  }
  
  /**
   * Met à jour la forme d'onde du porteur
   */
  updateCarrierWaveform(waveform) {
    this.config.carrierWaveform = waveform;
    
    if (this.carrier && !this.carrier.disposed) {
      this.carrier.type = waveform;
    }
    
    console.log(`[ModulatedSynth] Carrier waveform updated to ${waveform}`);
  }
  
  /**
   * Met à jour la fréquence du porteur
   */
  updateCarrierFrequency(frequency) {
    this.config.carrierFrequency = Math.max(20, Math.min(20000, frequency));
    
    if (this.carrier && !this.carrier.disposed) {
      this.carrier.frequency.value = this.config.carrierFrequency;
    }
    
    console.log(`[ModulatedSynth] Carrier frequency updated to ${this.config.carrierFrequency}Hz`);
  }
  
  /**
   * Crée une visualisation de la modulation
   */
  generateModulationData(duration = 1, sampleRate = 100) {
    const samples = Math.floor(duration * sampleRate);
    const data = [];
    
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      
      // Signal LFO
      let lfoValue;
      switch (this.config.lfoWaveform) {
        case 'sine':
          lfoValue = Math.sin(2 * Math.PI * this.config.lfoRate * t);
          break;
        case 'triangle':
          lfoValue = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * this.config.lfoRate * t));
          break;
        case 'square':
          lfoValue = Math.sign(Math.sin(2 * Math.PI * this.config.lfoRate * t));
          break;
        default:
          lfoValue = Math.sin(2 * Math.PI * this.config.lfoRate * t);
      }
      
      // Signal porteur
      let carrierValue = Math.sin(2 * Math.PI * this.config.carrierFrequency * t);
      
      // Appliquer la modulation
      let modulatedValue;
      if (this.config.modulationType === 'frequency') {
        // Modulation de fréquence
        const modulatedFreq = this.config.carrierFrequency + 
                            (lfoValue * this.config.lfoDepth * this.config.carrierFrequency * 0.001);
        modulatedValue = Math.sin(2 * Math.PI * modulatedFreq * t);
      } else {
        // Modulation d'amplitude
        const modulationFactor = 1 + (lfoValue * this.config.lfoDepth * 0.01);
        modulatedValue = carrierValue * modulationFactor;
      }
      
      data.push({
        time: t,
        lfo: lfoValue,
        carrier: carrierValue,
        modulated: modulatedValue
      });
    }
    
    return data;
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
    return this.isPlaying && this.carrier && !this.carrier.disposed;
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
        console.warn('[ModulatedSynth] Error disposing component:', error);
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
      
      console.log('[ModulatedSynth] Cleanup completed');
      
    } catch (error) {
      console.error('[ModulatedSynth] Cleanup failed:', error);
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
      hasCarrier: !!this.carrier,
      hasLFO: !!this.lfo,
      hasGain: !!this.gain
    };
  }
}

// Factory function
window.createModulatedSynth = function(config = {}) {
  const synth = new ModulatedSynth();
  if (Object.keys(config).length > 0) {
    synth.updateConfig(config);
  }
  return synth;
};

// Instance globale pour l'onglet Modulation
window.modulatedSynth = new ModulatedSynth();

console.log('[ModulatedSynth] Class loaded and global instance created');