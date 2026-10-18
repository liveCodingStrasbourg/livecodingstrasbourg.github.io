/**
 * BasicSynth.js - Synthétiseur de base pour oscillateurs simples
 * Sound Synthesis Explorer - TOPLAP Strasbourg
 */

class BasicSynth {
  constructor() {
    this.isPlaying = false;
    this.components = [];
    this.currentOscillator = null;
    this.currentGain = null;
    
    // Configuration par défaut
    this.config = {
      waveform: 'sine',
      frequency: 440,
      amplitude: 0.5,
      detune: 0,
      pulseWidth: 0.5
    };
    
    this.bindMethods();
  }
  
  bindMethods() {
    this.cleanup = this.cleanup.bind(this);
    this.playNote = this.playNote.bind(this);
    this.stopNote = this.stopNote.bind(this);
    this.updateWaveform = this.updateWaveform.bind(this);
  }
  
  playNote(note, duration = null, velocity = 0.8) {
  try {
    if (!window.audioManager || !window.audioManager.isReady()) {
      console.warn('[BasicSynth] AudioManager not ready');
      return false;
    }
    
    // Arrêter la note précédente
    this.stopNote();
    
    // Handle both frequency numbers and note names
    let frequency;
    if (typeof note === 'number') {
      frequency = note;
    } else {
      frequency = window.audioManager.noteToFrequency(note);
    }
    
    // Store the target frequency
    this.config.frequency = frequency;
    
    // Handle pulse waveform specially
    let waveformToUse = this.config.waveform;
    if (this.config.waveform === 'pulse') {
      waveformToUse = 'square'; // Use square as base for pulse
    }
    
    // Créer l'oscillateur
    this.currentOscillator = window.audioManager.createOscillator(
      waveformToUse, 
      frequency
    );
    
    if (!this.currentOscillator) {
      console.error('[BasicSynth] Failed to create oscillator');
      return false;
    }
    
    // Handle pulse width for square wave
    if (this.config.waveform === 'pulse') {
      this.applyPulseWidth();
    }
    
    // Appliquer le détune
    if (this.config.detune !== 0) {
      this.currentOscillator.detune.value = this.config.detune;
    }
    
    // Créer le gain pour contrôler l'amplitude
    this.currentGain = new Tone.Gain(this.config.amplitude * velocity);
    this.addComponent(this.currentGain);
    
    // Connecter le signal
    this.currentOscillator.connect(this.currentGain);
    this.currentGain.connect(window.audioManager.masterGain);
    
    // Démarrer l'oscillateur
    this.currentOscillator.start();
    this.isPlaying = true;
    
    console.log(`[BasicSynth] Playing note ${note} (${frequency.toFixed(1)}Hz)`);
    
    // Arrêt automatique si durée spécifiée
    if (duration) {
      setTimeout(() => {
        this.stopNote();
      }, duration * 1000);
    }
    
    return true;
    
  } catch (error) {
    console.error('[BasicSynth] Failed to play note:', error);
    return false;
  }
}

// Add this new method after playNote:
applyPulseWidth() {
  try {
    // Create a simple pulse wave approximation using PeriodicWave
    const real = new Float32Array(32);
    const imag = new Float32Array(32);
    
    // Generate pulse wave harmonics
    const dutyCycle = this.config.pulseWidth;
    
    for (let i = 1; i < 32; i++) {
      // Pulse wave Fourier series
      const harmonic = (2 / (Math.PI * i)) * Math.sin(Math.PI * i * dutyCycle);
      real[i] = harmonic;
    }
    
    const wave = Tone.context.createPeriodicWave(real, imag);
    this.currentOscillator.setPeriodicWave(wave);
    
  } catch (error) {
    console.warn('[BasicSynth] Could not apply pulse width, using square wave');
  }
}
  /**
   * Arrête la note en cours
   */
  stopNote() {
    try {
      if (this.currentOscillator && !this.currentOscillator.disposed) {
        this.currentOscillator.stop();
        this.currentOscillator.dispose();
        this.currentOscillator = null;
      }
      
      if (this.currentGain && !this.currentGain.disposed) {
        this.currentGain.dispose();
        this.currentGain = null;
      }
      
      this.isPlaying = false;
      console.log('[BasicSynth] Note stopped');
      
    } catch (error) {
      console.error('[BasicSynth] Failed to stop note:', error);
    }
  }
  
// Replace updateWaveform method:
updateWaveform(waveform) {
  this.config.waveform = waveform;
  
  // Si un oscillateur est en cours, le mettre à jour
  if (this.currentOscillator && !this.currentOscillator.disposed) {
    try {
      if (waveform === 'pulse') {
        // For pulse, change to square and apply pulse width
        this.currentOscillator.type = 'square';
        this.applyPulseWidth();
      } else {
        this.currentOscillator.type = waveform;
      }
    } catch (error) {
      console.warn('[BasicSynth] Cannot update waveform on running oscillator');
    }
  }
  
  console.log(`[BasicSynth] Waveform updated to ${waveform}`);
}

  
// Replace updateFrequency method:
updateFrequency(frequency) {
  // Handle both numbers and note names
  if (typeof frequency === 'string') {
    frequency = window.audioManager.noteToFrequency(frequency);
  }
  
  this.config.frequency = Math.max(20, Math.min(20000, frequency));
  
  if (this.currentOscillator && !this.currentOscillator.disposed) {
    this.currentOscillator.frequency.value = this.config.frequency;
  }
  
  console.log(`[BasicSynth] Frequency updated to ${this.config.frequency.toFixed(1)}Hz`);
}

  
  /**
   * Met à jour l'amplitude
   */
  updateAmplitude(amplitude) {
    this.config.amplitude = Math.max(0, Math.min(1, amplitude));
    
    if (this.currentGain && !this.currentGain.disposed) {
      this.currentGain.gain.value = this.config.amplitude;
    }
    
    console.log(`[BasicSynth] Amplitude updated to ${(this.config.amplitude * 100).toFixed(0)}%`);
  }
  
  /**
   * Met à jour le détune
   */
  updateDetune(detune) {
    this.config.detune = Math.max(-1200, Math.min(1200, detune));
    
    if (this.currentOscillator && !this.currentOscillator.disposed) {
      this.currentOscillator.detune.value = this.config.detune;
    }
    
    console.log(`[BasicSynth] Detune updated to ${this.config.detune} cents`);
  }
  
// Update updatePulseWidth method:
updatePulseWidth(width) {
  this.config.pulseWidth = Math.max(0.01, Math.min(0.99, width));
  
  // If we're currently playing a pulse wave, update it
  if (this.config.waveform === 'pulse' && this.currentOscillator && !this.currentOscillator.disposed) {
    this.applyPulseWidth();
  }
  
  console.log(`[BasicSynth] Pulse width updated to ${(this.config.pulseWidth * 100).toFixed(0)}%`);
}
  /**
   * Crée une onde pulse personnalisée
   */
  createPulseWave(dutyCycle = 0.5) {
    try {
      // Créer une table d'onde pour l'impulsion
      const length = 1024;
      const real = new Float32Array(length);
      const imag = new Float32Array(length);
      
      // Générer les harmoniques pour une onde pulse
      for (let i = 1; i < length; i++) {
        const harmonic = (2 / (Math.PI * i)) * Math.sin(Math.PI * i * dutyCycle);
        real[i] = harmonic;
      }
      
      const wave = Tone.context.createPeriodicWave(real, imag);
      return wave;
      
    } catch (error) {
      console.error('[BasicSynth] Failed to create pulse wave:', error);
      return 'square'; // Fallback
    }
  }
  
  /**
   * Génère du bruit
   */
  playNoise(type = 'white', duration = null) {
    try {
      if (!window.audioManager || !window.audioManager.isReady()) {
        console.warn('[BasicSynth] AudioManager not ready');
        return false;
      }
      
      // Arrêter tout son en cours
      this.stopNote();
      
      // Créer le générateur de bruit
      const noise = window.audioManager.createNoise(type);
      
      if (!noise) {
        console.error('[BasicSynth] Failed to create noise generator');
        return false;
      }
      
      // Créer le gain
      this.currentGain = new Tone.Gain(this.config.amplitude);
      this.addComponent(this.currentGain);
      
      // Connecter
      noise.connect(this.currentGain);
      this.currentGain.connect(window.audioManager.masterGain);
      
      // Démarrer
      noise.start();
      this.isPlaying = true;
      
      console.log(`[BasicSynth] Playing ${type} noise`);
      
      // Arrêt automatique si durée spécifiée
      if (duration) {
        setTimeout(() => {
          if (noise && !noise.disposed) {
            noise.stop();
            noise.dispose();
          }
          this.isPlaying = false;
        }, duration * 1000);
      }
      
      // Stocker pour pouvoir l'arrêter
      this.currentOscillator = noise;
      
      return true;
      
    } catch (error) {
      console.error('[BasicSynth] Failed to play noise:', error);
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
   * Applique une configuration complète
   */
  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('[BasicSynth] Configuration updated:', this.config);
  }
  
  /**
   * Vérifie si le synthé est en train de jouer
   */
  isCurrentlyPlaying() {
    return this.isPlaying && this.currentOscillator && !this.currentOscillator.disposed;
  }
  
  /**
   * Ajoute un composant au tracking
   */
  addComponent(component) {
    if (component && !this.components.includes(component)) {
      this.components.push(component);
      
      // Ajouter aussi au tracking global
      if (window.audioManager) {
        window.audioManager.addComponent(component);
      }
    }
  }
  
  /**
   * Supprime un composant du tracking
   */
  removeComponent(component) {
    const index = this.components.indexOf(component);
    if (index > -1) {
      this.components.splice(index, 1);
      
      // Supprimer aussi du tracking global
      if (window.audioManager) {
        window.audioManager.removeComponent(component);
      }
    }
  }
  
  /**
   * Nettoyage de tous les composants
   */
  cleanup() {
    try {
      // Arrêter la lecture
      this.stopNote();
      
      // Dispose de tous les composants
      this.components.forEach(component => {
        try {
          if (component && typeof component.dispose === 'function') {
            component.dispose();
          }
        } catch (error) {
          console.warn('[BasicSynth] Error disposing component:', error);
        }
      });
      
      // Vider la liste
      this.components = [];
      this.currentOscillator = null;
      this.currentGain = null;
      this.isPlaying = false;
      
      console.log('[BasicSynth] Cleanup completed');
      
    } catch (error) {
      console.error('[BasicSynth] Cleanup failed:', error);
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
      hasOscillator: !!this.currentOscillator,
      hasGain: !!this.currentGain
    };
  }
}

// Factory function pour créer des instances
window.createBasicSynth = function(config = {}) {
  const synth = new BasicSynth();
  if (Object.keys(config).length > 0) {
    synth.setConfig(config);
  }
  return synth;
};

// Instance globale par défaut pour l'onglet Fondamentaux
window.basicSynth = new BasicSynth();

console.log('[BasicSynth] Class loaded and global instance created');