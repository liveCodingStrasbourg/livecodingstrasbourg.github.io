/**
 * AdvancedSynth.js - Techniques avancées: Granulaire, Gendy, Chaos
 * Sound Synthesis Explorer - TOPLAP Strasbourg
 */

class AdvancedSynth {
  constructor() {
    this.isPlaying = false;
    this.components = [];
    this.activeVoices = new Map();
    
    // Configuration par défaut
    this.config = {
      // Synthèse Granulaire
      granular: {
        baseNote: 'A4',
        grainSize: 50,        // ms (5-200)
        density: 20,          // grains/sec (1-100)
        pitchSpread: 200,     // cents (0-1200)
        timeSpread: 10,       // ms (0-100)
        grainShape: 'gaussian', // 'gaussian', 'triangular', 'rectangular'
        reverse: false,       // Grains inversés
        feedback: 0           // Rétroaction (0-0.5)
      },
      
      // Synthèse Gendy (Xenakis)
      gendy: {
        amplitudeVariation: 0.3,    // Variation d'amplitude (0-1)
        durationVariation: 0.3,     // Variation de durée (0-1)
        points: 8,                  // Nombre de points de contrôle (3-20)
        frequency: 220,             // Fréquence de base
        interpolation: 'linear',    // 'linear', 'cubic'
        seed: 12345                 // Graine pour reproductibilité
      },
      
      // Synthèse Chaotique
      chaos: {
        type: 'lorenz',      // 'lorenz', 'chua', 'duffing'
        factor: 1.0,         // Facteur d'échelle (0.1-10)
        speed: 1.0,          // Vitesse d'évolution (0.1-10)
        frequency: 440,      // Fréquence porteuse
        modulation: 'fm',    // 'fm', 'am', 'ring'
        chaos: {
          // Paramètres système chaotique
          sigma: 10,         // Paramètre σ (Lorenz)
          rho: 28,          // Paramètre ρ (Lorenz)
          beta: 8/3         // Paramètre β (Lorenz)
        }
      },
      
      // Global
      masterVolume: 0.5,
      currentEngine: 'granular' // 'granular', 'gendy', 'chaos'
    };
    
    this.bindMethods();
  }
  
  bindMethods() {
    this.cleanup = this.cleanup.bind(this);
    this.playNote = this.playNote.bind(this);
    this.stopNote = this.stopNote.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
    this.switchEngine = this.switchEngine.bind(this);
  }
  
  /**
   * Joue une note avec le moteur sélectionné
   */
  playNote(note, duration = null, velocity = 0.8) {
    try {
      if (!window.audioManager || !window.audioManager.isReady()) {
        console.warn('[AdvancedSynth] AudioManager not ready');
        return false;
      }
      
      const frequency = window.audioManager.noteToFrequency(note);
      const noteId = note + '_' + Date.now();
      
      // Créer la voix selon le moteur actuel
      let voice = null;
      
      switch (this.config.currentEngine) {
        case 'granular':
          voice = this.createGranularVoice(frequency, velocity);
          break;
        case 'gendy':
          voice = this.createGendyVoice(frequency, velocity);
          break;
        case 'chaos':
          voice = this.createChaosVoice(frequency, velocity);
          break;
        default:
          console.warn(`[AdvancedSynth] Unknown engine: ${this.config.currentEngine}`);
          return false;
      }
      
      if (!voice) {
        return false;
      }
      
      this.activeVoices.set(noteId, voice);
      this.isPlaying = true;
      
      console.log(`[AdvancedSynth] Playing ${this.config.currentEngine} note ${note} (${frequency.toFixed(1)}Hz)`);
      
      // Arrêt automatique si durée spécifiée
      if (duration) {
        setTimeout(() => {
          this.stopNote(noteId);
        }, duration * 1000);
      }
      
      return true;
      
    } catch (error) {
      console.error('[AdvancedSynth] Failed to play note:', error);
      return false;
    }
  }
  
  /**
   * Crée une voix granulaire
   */
  createGranularVoice(frequency, velocity) {
    try {
      const voice = {
        type: 'granular',
        components: [],
        grains: [],
        frequency: frequency,
        velocity: velocity
      };
      
      // Créer le gain principal
      voice.gain = new Tone.Gain(this.config.masterVolume * velocity);
      voice.components.push(voice.gain);
      
      // Connecter au master
      voice.gain.connect(window.audioManager.masterGain);
      
      // Démarrer la génération de grains
      this.startGranularGeneration(voice);
      
      return voice;
      
    } catch (error) {
      console.error('[AdvancedSynth] Failed to create granular voice:', error);
      return null;
    }
  }
  
  /**
   * Démarre la génération de grains
   */
  startGranularGeneration(voice) {
    const config = this.config.granular;
    const grainInterval = 1000 / config.density; // ms entre grains
    
    const generateGrain = () => {
      if (!voice.gain || voice.gain.disposed) {
        return; // Voix supprimée
      }
      
      try {
        // Calculer les variations aléatoires
        const pitchVariation = (Math.random() - 0.5) * 2 * config.pitchSpread;
        const timeVariation = (Math.random() - 0.5) * 2 * config.timeSpread;
        const grainFreq = voice.frequency * Math.pow(2, pitchVariation / 1200);
        
        // Créer l'oscillateur du grain
        const grainOsc = window.audioManager.createOscillator('sine', grainFreq);
        if (!grainOsc) return;
        
        // Créer l'enveloppe du grain
        const grainEnv = this.createGrainEnvelope(config.grainSize, config.grainShape);
        if (!grainEnv) {
          grainOsc.dispose();
          return;
        }
        
        // Créer le gain du grain
        const grainGain = new Tone.Gain(0.1); // Amplitude faible par grain
        
        // Connexions
        grainOsc.connect(grainEnv);
        grainEnv.connect(grainGain);
        grainGain.connect(voice.gain);
        
        // Démarrer le grain
        const startTime = Tone.now() + Math.max(0, timeVariation / 1000);
        grainOsc.start(startTime);
        grainEnv.triggerAttack(startTime);
        
        // Programmer l'arrêt
        const stopTime = startTime + (config.grainSize / 1000);
        grainOsc.stop(stopTime);
        
        // Cleanup après le grain
        setTimeout(() => {
          try {
            grainOsc.dispose();
            grainEnv.dispose();
            grainGain.dispose();
          } catch (error) {
            console.warn('[AdvancedSynth] Error disposing grain:', error);
          }
        }, (config.grainSize + 100));
        
        // Programmer le prochain grain
        setTimeout(generateGrain, grainInterval + timeVariation);
        
      } catch (error) {
        console.error('[AdvancedSynth] Error generating grain:', error);
      }
    };
    
    // Démarrer la génération
    generateGrain();
  }
  
  /**
   * Crée l'enveloppe d'un grain
   */
  createGrainEnvelope(duration, shape) {
    try {
      const durationSec = duration / 1000;
      
      switch (shape) {
        case 'gaussian':
          // Enveloppe gaussienne approximée
          return window.audioManager.createEnvelope(
            durationSec * 0.3,
            durationSec * 0.4,
            0.7,
            durationSec * 0.3
          );
          
        case 'triangular':
          // Enveloppe triangulaire
          return window.audioManager.createEnvelope(
            durationSec * 0.5,
            0.001,
            0,
            durationSec * 0.5
          );
          
        case 'rectangular':
          // Enveloppe rectangulaire
          return window.audioManager.createEnvelope(
            0.001,
            0.001,
            1.0,
            0.001
          );
          
        default:
          return window.audioManager.createEnvelope(
            durationSec * 0.3,
            durationSec * 0.4,
            0.7,
            durationSec * 0.3
          );
      }
      
    } catch (error) {
      console.error('[AdvancedSynth] Failed to create grain envelope:', error);
      return null;
    }
  }

  /**
   * Crée une voix Gendy
   */
  createGendyVoice(frequency, velocity) {
    try {
      const voice = {
        type: 'gendy',
        components: [],
        frequency: frequency,
        velocity: velocity,
        gendyOscillator: null
      };
      
      // Générer la table d'onde Gendy
      const gendyWaveform = this.generateGendyWaveform();
      
      // Créer l'oscillateur avec la forme d'onde Gendy
      voice.gendyOscillator = this.createCustomOscillator(frequency, gendyWaveform);
      if (!voice.gendyOscillator) {
        throw new Error('Failed to create Gendy oscillator');
      }
      
      voice.components.push(voice.gendyOscillator);
      
      // Créer l'enveloppe
      voice.envelope = window.audioManager.createEnvelope(0.1, 0.3, 0.8, 0.5);
      if (voice.envelope) {
        voice.components.push(voice.envelope);
      }
      
      // Créer le gain
      voice.gain = new Tone.Gain(this.config.masterVolume * velocity);
      voice.components.push(voice.gain);
      
      // Connexions
      if (voice.envelope) {
        voice.gendyOscillator.connect(voice.envelope);
        voice.envelope.connect(voice.gain);
      } else {
        voice.gendyOscillator.connect(voice.gain);
      }
      
      voice.gain.connect(window.audioManager.masterGain);
      
      // Démarrer l'évolution Gendy
      this.startGendyEvolution(voice);
      
      // Démarrer l'oscillateur
      voice.gendyOscillator.start();
      if (voice.envelope) {
        voice.envelope.triggerAttack();
      }
      
      return voice;
      
    } catch (error) {
      console.error('[AdvancedSynth] Failed to create Gendy voice:', error);
      return null;
    }
  }
  
  /**
   * Génère une forme d'onde Gendy stochastique
   */
  generateGendyWaveform() {
    const config = this.config.gendy;
    const points = config.points;
    const waveform = new Float32Array(256);
    
    // Générer les points de contrôle avec marche aléatoire
    const controlPoints = [];
    let currentAmplitude = 0;
    let currentDuration = 0;
    
    // Initialiser le générateur de nombres pseudo-aléatoires
    let seed = config.seed;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % Math.pow(2, 32);
      return seed / Math.pow(2, 32);
    };
    
    for (let i = 0; i < points; i++) {
      // Variation stochastique de l'amplitude
      const amplitudeChange = (random() - 0.5) * 2 * config.amplitudeVariation;
      currentAmplitude = Math.max(-1, Math.min(1, currentAmplitude + amplitudeChange));
      
      // Variation stochastique de la durée
      const durationChange = (random() - 0.5) * 2 * config.durationVariation;
      currentDuration = Math.max(0.1, currentDuration + durationChange + 1);
      
      controlPoints.push({
        amplitude: currentAmplitude,
        duration: currentDuration,
        phase: (i / points) * 2 * Math.PI
      });
    }
    
    // Interpoler entre les points de contrôle
    for (let i = 0; i < waveform.length; i++) {
      const phase = (i / waveform.length) * 2 * Math.PI;
      
      // Trouver les points de contrôle adjacents
      let point1 = controlPoints[controlPoints.length - 1];
      let point2 = controlPoints[0];
      
      for (let j = 0; j < controlPoints.length - 1; j++) {
        if (phase >= controlPoints[j].phase && phase <= controlPoints[j + 1].phase) {
          point1 = controlPoints[j];
          point2 = controlPoints[j + 1];
          break;
        }
      }
      
      // Interpolation (linéaire ou cubique)
      const t = (phase - point1.phase) / (point2.phase - point1.phase + 0.001);
      
      if (config.interpolation === 'cubic') {
        // Interpolation cubique (plus lisse)
        const t2 = t * t;
        const t3 = t2 * t;
        waveform[i] = point1.amplitude * (2 * t3 - 3 * t2 + 1) + 
                     point2.amplitude * (3 * t2 - 2 * t3);
      } else {
        // Interpolation linéaire
        waveform[i] = point1.amplitude * (1 - t) + point2.amplitude * t;
      }
    }
    
    return waveform;
  }
  
  /**
   * Démarre l'évolution continue de Gendy
   */
  startGendyEvolution(voice) {
    const evolve = () => {
      if (!voice.gendyOscillator || voice.gendyOscillator.disposed) {
        return;
      }
      
      try {
        // Générer une nouvelle forme d'onde
        const newWaveform = this.generateGendyWaveform();
        const newOscillator = this.createCustomOscillator(voice.frequency, newWaveform);
        
        if (newOscillator) {
          // Transition douce vers la nouvelle forme d'onde
          const oldOscillator = voice.gendyOscillator;
          
          // Connecter le nouvel oscillateur
          if (voice.envelope) {
            newOscillator.connect(voice.envelope);
          } else {
            newOscillator.connect(voice.gain);
          }
          
          // Démarrer le nouveau
          newOscillator.start();
          
          // Faire un crossfade
          setTimeout(() => {
            try {
              oldOscillator.volume.rampTo(-60, 0.1); // Fade out
              setTimeout(() => {
                oldOscillator.stop();
                oldOscillator.dispose();
              }, 100);
            } catch (error) {
              console.warn('[AdvancedSynth] Error during Gendy crossfade:', error);
            }
          }, 10);
          
          voice.gendyOscillator = newOscillator;
        }
        
        // Programmer la prochaine évolution
        const nextEvolution = 100 + Math.random() * 200; // 100-300ms
        setTimeout(evolve, nextEvolution);
        
      } catch (error) {
        console.error('[AdvancedSynth] Error in Gendy evolution:', error);
      }
    };
    
    // Démarrer l'évolution après un délai initial
    setTimeout(evolve, 200);
  }
  
  /**
   * Crée une voix chaotique
   */
  createChaosVoice(frequency, velocity) {
    try {
      const voice = {
        type: 'chaos',
        components: [],
        frequency: frequency,
        velocity: velocity,
        chaosState: this.initializeChaosState()
      };
      
      // Créer l'oscillateur porteur
      voice.carrier = window.audioManager.createOscillator('sine', frequency);
      if (!voice.carrier) {
        throw new Error('Failed to create chaos carrier');
      }
      
      voice.components.push(voice.carrier);
      
      // Créer le modulateur chaotique
      voice.chaosModulator = this.createChaosModulator();
      if (voice.chaosModulator) {
        voice.components.push(voice.chaosModulator);
      }
      
      // Créer l'enveloppe
      voice.envelope = window.audioManager.createEnvelope(0.1, 0.3, 0.8, 0.5);
      if (voice.envelope) {
        voice.components.push(voice.envelope);
      }
      
      // Créer le gain
      voice.gain = new Tone.Gain(this.config.masterVolume * velocity);
      voice.components.push(voice.gain);
      
      // Setup de la modulation chaotique
      this.setupChaosModulation(voice);
      
      // Connexions finales
      if (voice.envelope) {
        voice.carrier.connect(voice.envelope);
        voice.envelope.connect(voice.gain);
      } else {
        voice.carrier.connect(voice.gain);
      }
      
      voice.gain.connect(window.audioManager.masterGain);
      
      // Démarrer
      voice.carrier.start();
      if (voice.chaosModulator) {
        voice.chaosModulator.start();
      }
      if (voice.envelope) {
        voice.envelope.triggerAttack();
      }
      
      // Démarrer l'évolution chaotique
      this.startChaosEvolution(voice);
      
      return voice;
      
    } catch (error) {
      console.error('[AdvancedSynth] Failed to create chaos voice:', error);
      return null;
    }
  }
  
  /**
   * Initialise l'état du système chaotique
   */
  initializeChaosState() {
    const config = this.config.chaos;
    
    switch (config.type) {
      case 'lorenz':
        return {
          x: 1.0,
          y: 1.0,
          z: 1.0,
          dt: 0.01
        };
        
      case 'chua':
        return {
          x: 0.1,
          y: 0.1,
          z: 0.1,
          dt: 0.01
        };
        
      case 'duffing':
        return {
          x: 0.1,
          y: 0.1,
          dt: 0.01
        };
        
      default:
        return { x: 1.0, y: 1.0, z: 1.0, dt: 0.01 };
    }
  }
  
  /**
   * Crée un modulateur chaotique
   */
  createChaosModulator() {
    try {
      // Créer un oscillateur simple pour la modulation
      return window.audioManager.createOscillator('sine', 1); // 1Hz de base
    } catch (error) {
      console.error('[AdvancedSynth] Failed to create chaos modulator:', error);
      return null;
    }
  }
  
  /**
   * Configure la modulation chaotique
   */
  setupChaosModulation(voice) {
    const config = this.config.chaos;
    
    if (!voice.chaosModulator) return;
    
    // Créer le gain de modulation
    const modGain = new Tone.Gain(config.factor * voice.frequency * 0.1);
    voice.components.push(modGain);
    
    // Connecter selon le type de modulation
    switch (config.modulation) {
      case 'fm':
        voice.chaosModulator.connect(modGain);
        modGain.connect(voice.carrier.frequency);
        break;
        
      case 'am':
        voice.chaosModulator.connect(modGain);
        modGain.connect(voice.gain.gain);
        break;
        
      case 'ring':
        // Ring modulation simple
        const ringMod = new Tone.Multiply();
        voice.components.push(ringMod);
        voice.carrier.connect(ringMod);
        voice.chaosModulator.connect(ringMod);
        break;
    }
  }

  /**
   * Démarre l'évolution du système chaotique
   */
  startChaosEvolution(voice) {
    const evolve = () => {
      if (!voice.chaosModulator || voice.chaosModulator.disposed) {
        return;
      }
      
      try {
        // Calculer le prochain état du système chaotique
        this.updateChaosState(voice.chaosState);
        
        // Appliquer l'état à la modulation
        const chaosValue = this.getChaosOutput(voice.chaosState);
        const newFreq = 0.5 + chaosValue * 10; // 0.5-10.5 Hz
        
        if (voice.chaosModulator && !voice.chaosModulator.disposed) {
          voice.chaosModulator.frequency.rampTo(newFreq, 0.05);
        }
        
        // Programmer la prochaine évolution
        setTimeout(evolve, 50); // 20Hz d'évolution
        
      } catch (error) {
        console.error('[AdvancedSynth] Error in chaos evolution:', error);
      }
    };
    
    // Démarrer l'évolution
    evolve();
  }
  
  /**
   * Met à jour l'état du système chaotique
   */
  updateChaosState(state) {
    const config = this.config.chaos;
    const speed = config.speed;
    
    switch (config.type) {
      case 'lorenz':
        this.updateLorenzState(state, speed);
        break;
      case 'chua':
        this.updateChuaState(state, speed);
        break;
      case 'duffing':
        this.updateDuffingState(state, speed);
        break;
    }
  }
  
  /**
   * Met à jour l'attracteur de Lorenz
   */
  updateLorenzState(state, speed) {
    const { sigma, rho, beta } = this.config.chaos.chaos;
    const dt = state.dt * speed;
    
    const dx = sigma * (state.y - state.x) * dt;
    const dy = (state.x * (rho - state.z) - state.y) * dt;
    const dz = (state.x * state.y - beta * state.z) * dt;
    
    state.x += dx;
    state.y += dy;
    state.z += dz;
  }
  
  /**
   * Met à jour le circuit de Chua
   */
  updateChuaState(state, speed) {
    const alpha = 9;
    const beta = 14.286;
    const dt = state.dt * speed;
    
    // Fonction non-linéaire de Chua
    const f = (x) => {
      const m0 = -1/7;
      const m1 = 2/7;
      return m1 * x + 0.5 * (m0 - m1) * (Math.abs(x + 1) - Math.abs(x - 1));
    };
    
    const dx = alpha * (state.y - state.x - f(state.x)) * dt;
    const dy = (state.x - state.y + state.z) * dt;
    const dz = (-beta * state.y) * dt;
    
    state.x += dx;
    state.y += dy;
    state.z += dz;
  }
  
  /**
   * Met à jour l'oscillateur de Duffing
   */
  updateDuffingState(state, speed) {
    const gamma = 0.3;
    const alpha = 1;
    const beta = -1;
    const delta = 0.2;
    const omega = 1;
    const dt = state.dt * speed;
    
    const time = Date.now() / 1000;
    const forcing = gamma * Math.cos(omega * time);
    
    const dx = state.y * dt;
    const dy = (-delta * state.y - alpha * state.x - beta * Math.pow(state.x, 3) + forcing) * dt;
    
    state.x += dx;
    state.y += dy;
  }
  
  /**
   * Obtient la sortie du système chaotique
   */
  getChaosOutput(state) {
    // Normaliser la sortie entre -1 et 1
    switch (this.config.chaos.type) {
      case 'lorenz':
        return Math.tanh(state.x / 10);
      case 'chua':
        return Math.tanh(state.x / 2);
      case 'duffing':
        return Math.tanh(state.x);
      default:
        return Math.tanh(state.x / 10);
    }
  }
  
  /**
   * Crée un oscillateur personnalisé avec une forme d'onde
   */
  createCustomOscillator(frequency, waveform) {
    try {
      const real = new Float32Array(waveform.length);
      const imag = new Float32Array(waveform.length);
      
      for (let i = 0; i < waveform.length; i++) {
        real[i] = waveform[i];
      }
      
      const periodicWave = Tone.context.createPeriodicWave(real, imag, {
        disableNormalization: false
      });
      
      const osc = new Tone.Oscillator(frequency, 'custom');
      osc.setPeriodicWave(periodicWave);
      
      return osc;
      
    } catch (error) {
      console.error('[AdvancedSynth] Failed to create custom oscillator:', error);
      return new Tone.Oscillator(frequency, 'sine');
    }
  }
  
  /**
   * Change le moteur de synthèse
   */
  switchEngine(engineName) {
    if (['granular', 'gendy', 'chaos'].includes(engineName)) {
      this.config.currentEngine = engineName;
      console.log(`[AdvancedSynth] Switched to ${engineName} engine`);
      return true;
    } else {
      console.warn(`[AdvancedSynth] Unknown engine: ${engineName}`);
      return false;
    }
  }
  
  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig) {
    this.config = this.deepMerge(this.config, newConfig);
    console.log('[AdvancedSynth] Configuration updated:', newConfig);
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
   * Arrête une note
   */
  stopNote(noteId = null) {
    try {
      if (noteId && this.activeVoices.has(noteId)) {
        const voice = this.activeVoices.get(noteId);
        this.disposeVoice(voice);
        this.activeVoices.delete(noteId);
      } else {
        // Arrêter toutes les notes
        this.activeVoices.forEach((voice, id) => {
          this.disposeVoice(voice);
        });
        this.activeVoices.clear();
      }
      
      this.isPlaying = this.activeVoices.size > 0;
      
      console.log(`[AdvancedSynth] Stopped note(s), active voices: ${this.activeVoices.size}`);
      
    } catch (error) {
      console.error('[AdvancedSynth] Failed to stop note:', error);
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
          console.warn('[AdvancedSynth] Error disposing voice component:', error);
        }
      });
      
    } catch (error) {
      console.error('[AdvancedSynth] Failed to dispose voice:', error);
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
    return this.isPlaying && this.activeVoices.size > 0;
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
          console.warn('[AdvancedSynth] Error disposing component:', error);
        }
      });
      
      this.components = [];
      this.activeVoices.clear();
      this.isPlaying = false;
      
      console.log('[AdvancedSynth] Cleanup completed');
      
    } catch (error) {
      console.error('[AdvancedSynth] Cleanup failed:', error);
    }
  }
  
  /**
   * Obtient des informations de statut
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      activeVoices: this.activeVoices.size,
      currentEngine: this.config.currentEngine,
      config: this.getConfig(),
      componentsCount: this.components.length
    };
  }
}

// Factory function
window.createAdvancedSynth = function(config = {}) {
  const synth = new AdvancedSynth();
  if (Object.keys(config).length > 0) {
    synth.updateConfig(config);
  }
  return synth;
};

// Instance globale pour l'onglet Techniques Avancées
window.advancedSynth = new AdvancedSynth();

console.log('[AdvancedSynth] Class loaded and global instance created');