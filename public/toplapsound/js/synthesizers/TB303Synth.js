/**
 * TB303Synth.js - Émulation complète du Roland TB-303 avec séquenceur
 * Sound Synthesis Explorer - TOPLAP Strasbourg
 */

class TB303Synth {
  constructor() {
    this.isPlaying = false;
    this.components = [];
    this.isSequencerPlaying = false;
    
    // Composants audio du TB-303
    this.vco = null;              // Oscillateur principal
    this.filter = null;           // Filtre 18dB/octave caractéristique
    this.vca = null;              // Amplificateur final
    this.envelope = null;         // Générateur d'enveloppe simple
    this.distortion = null;       // Distortion subtile
    
    // Séquenceur
    this.sequencer = null;
    this.currentStep = 0;
    this.sequence = new Array(16).fill(null);
    this.accents = new Set();     // Steps avec accent
    this.slides = new Set();      // Steps avec slide
    
    // Configuration par défaut du TB-303
    this.config = {
      // VCO
      vco: {
        waveform: 'sawtooth',     // TB-303 utilise principalement saw
        tuning: 100,              // 50-200% (tuning global)
        pulseWidth: 0.5           // Pour l'onde square
      },
      
      // Filtre caractéristique 18dB
      filter: {
        cutoff: 600,              // Plus fermé par défaut
        resonance: 15,            // Résonance maximale pour le son acid
        envMod: 75,               // Plus de modulation par défaut
        decay: 0.3,               // Decay plus court
        accent: 2.0               // Plus d'accent
      },
      
      // Séquenceur
      sequencer: {
        tempo: 120,               // 80-160 BPM typique
        swing: 0,                 // 0-50% swing
        pattern: 'A',             // Pattern A ou B
        shuffle: false            // Shuffle actif/inactif
      },
      
      // Configuration globale
      masterVolume: 0.8,
      distortionAmount: 0.3,      // Plus de distortion pour l'authenticité
      
      // Notes disponibles (gamme TB-303)
      noteRange: ['C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
                  'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4']
    };
    
    this.bindMethods();
    this.initializeSequence();
  }
  
  bindMethods() {
    this.cleanup = this.cleanup.bind(this);
    this.playNote = this.playNote.bind(this);
    this.stopNote = this.stopNote.bind(this);
    this.updateConfig = this.updateConfig.bind(this);
    this.startSequencer = this.startSequencer.bind(this);
    this.stopSequencer = this.stopSequencer.bind(this);
    this.stepSequencer = this.stepSequencer.bind(this);
  }
  
  /**
   * Initialise la séquence par défaut
   */
  initializeSequence() {
    // Pattern acid classique par défaut
    this.sequence = [
      'C3', null, 'E3', null, 'G3', null, 'C4', null,
      'G3', null, 'E3', null, 'C3', null, null, null
    ];
    
    // Quelques accents et slides par défaut
    this.accents.add(0);
    this.accents.add(4);
    this.accents.add(8);
    
    this.slides.add(2);
    this.slides.add(6);
    
    console.log('[TB303Synth] Default sequence initialized');
  }
  
 playNote(note, duration = null, velocity = 0.8) {
  try {
    if (!window.audioManager || !window.audioManager.isReady()) {
      console.warn('[TB303Synth] AudioManager not ready');
      return false;
    }
    
    // Arrêter la note précédente en mode mono
    this.stopNote();
    
    // Convertir note en fréquence
    let frequency;
    if (typeof note === 'number') {
      frequency = note;
    } else {
      frequency = window.audioManager.noteToFrequency(note);
    }
    
    if (!frequency || frequency < 20 || frequency > 20000) {
      console.error('[TB303Synth] Invalid frequency:', frequency);
      return false;
    }
    
    // Créer la voix TB-303
    const voice = this.createTB303Voice(frequency, velocity, false);
    if (!voice) {
      return false;
    }
    
    this.currentVoice = voice;
    this.isPlaying = true;
    
    console.log(`[TB303Synth] Playing TB-303 note ${note} (${frequency.toFixed(1)}Hz)`);
    
    // Arrêt automatique si durée spécifiée
    if (duration) {
      setTimeout(() => {
        this.stopNote();
      }, duration * 1000);
    }
    
    return true;
    
  } catch (error) {
    console.error('[TB303Synth] Failed to play note:', error);
    return false;
  }
}
//////lapin

testTB303Audio() {
  try {
    console.log('[TB303Synth] Testing TB-303 audio chain...');
    
    // Test 1: Vérifier AudioManager
    if (!window.audioManager || !window.audioManager.isReady()) {
      console.error('[TB303Synth] AudioManager not ready');
      return false;
    }
    
    // Test 2: Créer un oscillateur simple direct
    const testOsc = new Tone.Oscillator(220, 'sawtooth');
    const testGain = new Tone.Gain(0.3);
    
    testOsc.connect(testGain);
    testGain.connect(window.audioManager.masterGain);
    
    testOsc.start();
    
    console.log('[TB303Synth] Direct oscillator test - should hear 220Hz sawtooth');
    
    setTimeout(() => {
      testOsc.stop();
      testOsc.dispose();
      testGain.dispose();
      console.log('[TB303Synth] Direct test completed');
    }, 1000);
    
    return true;
    
  } catch (error) {
    console.error('[TB303Synth] Audio test failed:', error);
    return false;
  }
}

// 4. AJOUTER une méthode de diagnostic complet
diagnoseTB303() {
  console.log('=== TB-303 DIAGNOSTIC ===');
  
  // Vérifications de base
  console.log('AudioManager ready:', window.audioManager?.isReady());
  console.log('Tone.context state:', Tone.context.state);
  console.log('Master gain:', window.audioManager?.masterGain?.gain?.value);
  
  // Configuration TB-303
  console.log('TB-303 config:', this.config);
  console.log('TB-303 playing:', this.isPlaying);
  console.log('Current voice:', this.currentVoice);
  
  // Test de séquence
  console.log('Sequence:', this.sequence);
  console.log('Sequencer playing:', this.isSequencerPlaying);
  
  // Test audio simple
  console.log('Starting audio test...');
  this.testTB303Audio();
  
  return {
    audioManager: !!window.audioManager,
    toneReady: Tone.context.state === 'running',
    tb303Ready: this.isReady(),
    config: this.config
  };
}

////lapin

createTB303Voice(frequency, velocity, hasAccent = false, hasSlide = false) {
  try {
    const voice = {
      components: [],
      frequency: frequency,
      velocity: velocity,
      hasAccent: hasAccent,
      hasSlide: hasSlide
    };
    
    // Appliquer le tuning global
    const tunedFrequency = frequency * (this.config.vco.tuning / 100);
    
    // Créer le VCO
    voice.vco = new Tone.Oscillator({
      frequency: tunedFrequency,
      type: this.config.vco.waveform
    });
    voice.components.push(voice.vco);
    
    // Créer le filtre
    voice.filter = new Tone.Filter({
      type: 'lowpass',
      frequency: this.config.filter.cutoff,
      Q: this.config.filter.resonance,
      rolloff: -24
    });
    voice.components.push(voice.filter);
    
    // Créer les enveloppes AMÉLIORÉES
    const envelopes = this.createTB303VoiceEnvelopes(voice, hasAccent);
    
    // Créer le VCA
    const baseGain = this.config.masterVolume * velocity * 0.5;
    const accentGain = hasAccent ? 2.0 : 1.0;
    voice.vca = new Tone.Gain(baseGain * accentGain);
    voice.components.push(voice.vca);
    
    // Créer la distortion TB-303 authentique (plus agressive)
    voice.distortion = new Tone.Distortion({
      distortion: this.config.distortionAmount * 2, // Plus de distortion
      oversample: '4x'
    });
    voice.components.push(voice.distortion);
    
    // Ajouter un compresseur pour l'impact TB-303
    voice.compressor = new Tone.Compressor({
      threshold: -24,
      ratio: 4,
      attack: 0.003,
      release: 0.1
    });
    voice.components.push(voice.compressor);
    
    // CONNEXIONS OPTIMISÉES TB-303
    voice.vco.connect(voice.filter);
    voice.filter.connect(voice.distortion);
    voice.distortion.connect(voice.compressor);
    voice.compressor.connect(voice.vca);
    voice.vca.connect(window.audioManager.masterGain);
    
    // Modulation du filtre par l'enveloppe
    const envMod = this.config.filter.envMod / 100;
    if (envMod > 0) {
      const modGain = new Tone.Gain(envMod * this.config.filter.cutoff * 0.8);
      voice.components.push(modGain);
      envelopes.filterEnvelope.connect(modGain);
      modGain.connect(voice.filter.frequency);
    }
    
    // Modulation de l'amplitude par l'enveloppe
    envelopes.amplitudeEnvelope.connect(voice.vca.gain);
    
    // Tracking des composants
    voice.components.forEach(comp => this.addComponent(comp));
    
    // Démarrer
    voice.vco.start();
    envelopes.filterEnvelope.triggerAttack();
    envelopes.amplitudeEnvelope.triggerAttack();
    
    // Stocker les enveloppes pour accès facile
    voice.envelope = envelopes.amplitudeEnvelope;
    voice.filterEnv = envelopes.filterEnvelope;
    
    return voice;
    
  } catch (error) {
    console.error('[TB303Synth] Failed to create TB-303 voice:', error);
    return null;
  }
}
  /**
   * Crée les enveloppes pour une voix TB-303
   */
  createTB303VoiceEnvelopes(voice, hasAccent) {
    try {
      // Enveloppe pour le filtre - Comportement TB-303 authentique
      const baseDecay = this.config.filter.decay;
      const filterEnvelope = new Tone.Envelope({
        attack: 0.001,
        decay: baseDecay * (hasAccent ? 0.6 : 1),
        sustain: 0,
        release: 0.05
      });
      voice.components.push(filterEnvelope);
      
      // Enveloppe pour l'amplitude - Gate fixe TB-303
      const amplitudeEnvelope = new Tone.Envelope({
        attack: 0.001,
        decay: 0.01,  // Très court
        sustain: 1,   // Sustain plein pour gate
        release: 0.05 // Release très court
      });
      voice.components.push(amplitudeEnvelope);
      
      return {
        filterEnvelope: filterEnvelope,
        amplitudeEnvelope: amplitudeEnvelope
      };
      
    } catch (error) {
      console.error('[TB303Synth] Failed to create envelopes:', error);
      return {
        filterEnvelope: new Tone.Envelope(),
        amplitudeEnvelope: new Tone.Envelope()
      };
    }
  }

  /**
   * Crée le filtre caractéristique du TB-303
   */
  createTB303Filter() {
    try {
      // Le TB-303 utilise un filtre passe-bas avec pente de 18dB/octave
      const filter = new Tone.Filter({
        type: 'lowpass',
        frequency: this.config.filter.cutoff,
        Q: this.config.filter.resonance,
        rolloff: -24  // Approximation de 18dB avec -24dB
      });
      
      return filter;
      
    } catch (error) {
      console.error('[TB303Synth] Failed to create TB-303 filter:', error);
      return window.audioManager.createFilter('lowpass', this.config.filter.cutoff, this.config.filter.resonance);
    }
  }
  

  
  /**
   * Crée l'enveloppe simple du TB-303
   */
  createTB303Envelope(hasAccent) {
    try {
      // Le TB-303 a une enveloppe simple : attaque rapide, decay variable, pas de sustain
      const baseDecay = this.config.filter.decay;
      const accentDecay = hasAccent ? baseDecay * 0.7 : baseDecay; // Accent raccourcit le decay
      
      const envelope = new Tone.Envelope({
        attack: 0.003,        // Attaque très rapide
        decay: accentDecay,   // Decay variable
        sustain: 0,           // Pas de sustain (caractéristique TB-303)
        release: 0.1          // Release court
      });
      
      // Moduler l'amplitude de l'enveloppe selon envMod
      const envMod = this.config.filter.envMod / 100;
      const modGain = new Tone.Gain(envMod * this.config.filter.cutoff);
      
      envelope.connect(modGain);
      
      return envelope;
      
    } catch (error) {
      console.error('[TB303Synth] Failed to create TB-303 envelope:', error);
      return window.audioManager.createEnvelope(0.003, this.config.filter.decay, 0, 0.1);
    }
  }
  
  /**
   * Configure le slide (glissement de fréquence)
   */
  setupSlide(voice) {
    try {
      // Le slide du TB-303 crée un glissement de fréquence vers la note suivante
      // Pour la démo, on simule un slide court
      const slideTime = 0.1; // 100ms de slide
      const slideFactor = 0.95; // Glisse vers le bas puis remonte
      
      setTimeout(() => {
        if (voice.vco && !voice.vco.disposed) {
          voice.vco.frequency.rampTo(voice.frequency * slideFactor, slideTime / 2);
          
          setTimeout(() => {
            if (voice.vco && !voice.vco.disposed) {
              voice.vco.frequency.rampTo(voice.frequency, slideTime / 2);
            }
          }, slideTime * 500);
        }
      }, 10);
      
    } catch (error) {
      console.error('[TB303Synth] Failed to setup slide:', error);
    }
  }
  
  /**
   * Démarre le séquenceur
   */
startSequencer() {
  try {
    if (this.isSequencerPlaying) {
      console.log('[TB303Synth] Sequencer already playing');
      return true;
    }
    
    if (!window.audioManager || !window.audioManager.isReady()) {
      console.warn('[TB303Synth] AudioManager not ready');
      return false;
    }
    
    // Vérifier que Tone.Transport est prêt
    if (Tone.context.state !== 'running') {
      console.warn('[TB303Synth] Tone context not running');
      return false;
    }
    
    // Configurer le tempo
    Tone.Transport.bpm.value = this.config.sequencer.tempo;
    console.log(`[TB303Synth] Set tempo to ${this.config.sequencer.tempo} BPM`);
    
    // Créer la séquence
    this.sequencer = new Tone.Sequence((time, step) => {
      this.stepSequencer(time, step);
    }, Array.from({length: 16}, (_, i) => i), '16n');
    
    this.addComponent(this.sequencer);
    
    // Démarrer le transport et la séquence
    this.sequencer.start(0);
    Tone.Transport.start();
    
    this.isSequencerPlaying = true;
    this.currentStep = 0;
    
    console.log(`[TB303Synth] Sequencer started successfully at ${this.config.sequencer.tempo} BPM`);
    console.log(`[TB303Synth] Sequence pattern:`, this.sequence);
    
    return true;
    
  } catch (error) {
    console.error('[TB303Synth] Failed to start sequencer:', error);
    return false;
  }
}
  
  /**
   * Arrête le séquenceur
   */
  stopSequencer() {
    try {
      if (!this.isSequencerPlaying) {
        return;
      }
      
      // Arrêter la séquence
      if (this.sequencer) {
        this.sequencer.stop();
        this.sequencer.dispose();
        this.sequencer = null;
      }
      
      // Arrêter le transport
      Tone.Transport.stop();
      
      // Arrêter toute note en cours
      this.stopNote();
      
      this.isSequencerPlaying = false;
      this.currentStep = 0;
      
      console.log('[TB303Synth] Sequencer stopped');
      
    } catch (error) {
      console.error('[TB303Synth] Failed to stop sequencer:', error);
    }
  }
  
  /**
   * Exécute un pas du séquenceur
   */
  stepSequencer(time, step) {
    try {
      this.currentStep = step;
      
      // Mettre à jour l'indicateur visuel
      this.updateStepIndicator(step);
      
      // Vérifier s'il y a une note à ce pas
      const note = this.sequence[step];
      if (!note) {
        return; // Pas de note, continuer
      }
      
      // Vérifier les modificateurs
      const hasAccent = this.accents.has(step);
      const hasSlide = this.slides.has(step);
      
      // Arrêter la note précédente si pas de slide
      if (!hasSlide) {
        this.stopNote();
      }
      
      // Jouer la nouvelle note
      const frequency = window.audioManager.noteToFrequency(note);
      const velocity = hasAccent ? 1.0 : 0.8;
      
      const voice = this.createTB303Voice(frequency, velocity, hasAccent, hasSlide);
      if (voice) {
        this.currentVoice = voice;
        this.isPlaying = true;
        
        // Programmer l'arrêt de la note selon la longueur de gate
        const gateLength = hasSlide ? '8n' : '16n';
        const gateTime = Tone.Time(gateLength).toSeconds();
        
        setTimeout(() => {
          if (this.currentVoice === voice) {
            this.stopNote();
          }
        }, gateTime * 800); // 80% de la durée du pas
      }
      
    } catch (error) {
      console.error('[TB303Synth] Failed to execute sequencer step:', error);
    }
  }
  

  // 2. AJOUTER une méthode pour arrêter proprement la note courante
stopCurrentNote() {
  if (this.currentVoice) {
    try {
      // Déclencher le release si l'enveloppe existe
      if (this.currentVoice.envelope && !this.currentVoice.envelope.disposed) {
        this.currentVoice.envelope.triggerRelease();
      }
      
      // Programmer la suppression des composants après le release
      setTimeout(() => {
        if (this.currentVoice) {
          this.disposeCurrentVoice();
        }
      }, 200); // 200ms pour le release
      
    } catch (error) {
      console.warn('[TB303Synth] Error stopping current note:', error);
      this.disposeCurrentVoice();
    }
  }
}

// 3. AJOUTER une méthode pour disposer proprement la voix courante
disposeCurrentVoice() {
  if (this.currentVoice) {
    try {
      this.currentVoice.components.forEach(component => {
        try {
          if (component && typeof component.dispose === 'function' && !component.disposed) {
            component.dispose();
          }
        } catch (error) {
          console.warn('[TB303Synth] Error disposing voice component:', error);
        }
      });
      
      this.currentVoice = null;
      this.isPlaying = false;
      
    } catch (error) {
      console.error('[TB303Synth] Error disposing current voice:', error);
    }
  }
}

  /**
   * Met à jour l'indicateur visuel du pas courant
   */
  updateStepIndicator(step) {
    // Retirer l'indicateur précédent
    document.querySelectorAll('.step-cell.current').forEach(cell => {
      cell.classList.remove('current');
    });
    
    // Ajouter l'indicateur au pas courant
    const stepCells = document.querySelectorAll('.step-cell');
    if (stepCells[step]) {
      stepCells[step].classList.add('current');
    }
  }
  
setSequenceStep(step, note) {
  if (step >= 0 && step < 16) {
    this.sequence[step] = note;
    console.log(`[TB303Synth] Step ${step} set to ${note || 'empty'}`);
    
    // Mettre à jour l'affichage visuel immédiatement
    this.updateStepVisual(step);
  }
}
updateStepVisual(step) {
  // Trouver toutes les cellules pour ce pas
  const stepCells = document.querySelectorAll(`[data-step="${step}"]`);
  
  stepCells.forEach(cell => {
    const noteRow = cell.closest('.note-row');
    const rowNote = noteRow ? noteRow.getAttribute('data-note') : null;
    
    // Reset classes
    cell.classList.remove('note', 'accent', 'slide');
    
    // Ajouter les classes selon l'état
    if (this.sequence[step] === rowNote) {
      cell.classList.add('note');
    }
    if (this.accents.has(step)) {
      cell.classList.add('accent');
    }
    if (this.slides.has(step)) {
      cell.classList.add('slide');
    }
  });
}
  /**
   * Efface une note de la séquence
   */
  clearSequenceStep(step) {
    if (step >= 0 && step < 16) {
      this.sequence[step] = null;
      this.accents.delete(step);
      this.slides.delete(step);
      console.log(`[TB303Synth] Step ${step} cleared`);
    }
  }
  
  /**
   * Toggle accent sur un pas
   */
  toggleAccent(step) {
    if (step >= 0 && step < 16) {
      if (this.accents.has(step)) {
        this.accents.delete(step);
        console.log(`[TB303Synth] Accent removed from step ${step}`);
      } else {
        this.accents.add(step);
        console.log(`[TB303Synth] Accent added to step ${step}`);
      }
    }
  }
  
  /**
   * Toggle slide sur un pas
   */
  toggleSlide(step) {
    if (step >= 0 && step < 16) {
      if (this.slides.has(step)) {
        this.slides.delete(step);
        console.log(`[TB303Synth] Slide removed from step ${step}`);
      } else {
        this.slides.add(step);
        console.log(`[TB303Synth] Slide added to step ${step}`);
      }
    }
  }
  
  /**
   * Efface toute la séquence
   */
  clearSequence() {
    this.sequence = new Array(16).fill(null);
    this.accents.clear();
    this.slides.clear();
    
    // Update all step visuals
    for (let step = 0; step < 16; step++) {
      this.updateStepVisual(step);
    }
    
    console.log('[TB303Synth] Sequence cleared');
  }
  
  /**
   * Charge un pattern prédéfini
   */
  loadPattern(patternName) {
    const patterns = {
      'classic1': {
        sequence: ['C3', null, 'E3', null, 'G3', null, 'C4', null,
                  'G3', null, 'E3', null, 'C3', null, null, null],
        accents: [0, 8],
        slides: [4, 12]
      },
      
      'classic2': {
        sequence: ['A3', null, 'C4', null, null, null, 'E3', null,
                  null, null, 'G3', null, null, null, 'A3', null],
        accents: [0, 6, 14],
        slides: [2, 10]
      },
      
      'acid1': {
        sequence: ['C3', 'D3', null, 'F3', null, null, 'A3', null,
                  'C4', null, 'A3', null, 'F3', null, 'D3', null],
        accents: [0, 3, 8, 12],
        slides: [1, 6, 10, 14]
      },
      
      'acid2': {
        sequence: ['E3', null, null, null, 'G3', null, 'B3', null,
                  'D4', null, null, null, 'B3', null, null, null],
        accents: [0, 4, 8, 12],
        slides: [4, 8]
      }
    };
    
    const pattern = patterns[patternName];
    if (pattern) {
      this.sequence = [...pattern.sequence];
      this.accents = new Set(pattern.accents);
      this.slides = new Set(pattern.slides);
      
      // Update all step visuals
      for (let step = 0; step < 16; step++) {
        this.updateStepVisual(step);
      }
      
      console.log(`[TB303Synth] Loaded pattern: ${patternName}`);
      return true;
    } else {
      console.warn(`[TB303Synth] Unknown pattern: ${patternName}`);
      return false;
    }
  }
  
  /**
   * Génère un pattern aléatoire
   */
  generateRandomPattern() {
    this.clearSequence();
    
    const notes = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4'];
    const density = 0.6; // 60% de chance d'avoir une note
    
    for (let i = 0; i < 16; i++) {
      if (Math.random() < density) {
        const note = notes[Math.floor(Math.random() * notes.length)];
        this.sequence[i] = note;
        
        // Chance d'accent
        if (Math.random() < 0.3) {
          this.accents.add(i);
        }
        
        // Chance de slide
        if (Math.random() < 0.2) {
          this.slides.add(i);
        }
      }
    }
    
    // Update all step visuals
    for (let step = 0; step < 16; step++) {
      this.updateStepVisual(step);
    }
    
    console.log('[TB303Synth] Random pattern generated');
  }
  
  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig) {
    this.config = this.deepMerge(this.config, newConfig);
    
    // Appliquer certains changements en temps réel
    if (this.currentVoice) {
      this.applyConfigToVoice(this.currentVoice, newConfig);
    }
    
    console.log('[TB303Synth] Configuration updated:', newConfig);
  }
  
  /**
   * Applique la configuration à une voix active
   */
  applyConfigToVoice(voice, config) {
    try {
      if (config.filter && voice.filter) {
        if (config.filter.cutoff !== undefined) {
          voice.filter.frequency.rampTo(config.filter.cutoff, 0.1);
        }
        if (config.filter.resonance !== undefined) {
          voice.filter.Q.rampTo(config.filter.resonance, 0.1);
        }
      }
      
      if (config.vco && voice.vco) {
        if (config.vco.tuning !== undefined) {
          const newFreq = voice.frequency * (config.vco.tuning / 100);
          voice.vco.frequency.rampTo(newFreq, 0.1);
        }
        if (config.vco.waveform !== undefined) {
          voice.vco.type = config.vco.waveform;
        }
      }
      
    } catch (error) {
      console.error('[TB303Synth] Failed to apply config to voice:', error);
    }
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
   * Met à jour le tempo
   */
  updateTempo(bpm) {
    this.config.sequencer.tempo = Math.max(60, Math.min(200, bpm));
    
    if (this.isSequencerPlaying) {
      Tone.Transport.bpm.value = this.config.sequencer.tempo;
    }
    
    console.log(`[TB303Synth] Tempo updated to ${this.config.sequencer.tempo} BPM`);
  }
  
  /**
   * Arrête la note en cours avec release approprié
   */
  stopNote() {
    try {
      if (this.currentVoice) {
        // Déclencher le release des enveloppes d'abord
        if (this.currentVoice.envelope && !this.currentVoice.envelope.disposed) {
          this.currentVoice.envelope.triggerRelease();
        }
        if (this.currentVoice.filterEnv && !this.currentVoice.filterEnv.disposed) {
          this.currentVoice.filterEnv.triggerRelease();
        }
        
        // Programmer la suppression après le release
        setTimeout(() => {
          if (this.currentVoice) {
            this.currentVoice.components.forEach(component => {
              try {
                if (component && typeof component.dispose === 'function' && !component.disposed) {
                  component.dispose();
                }
              } catch (error) {
                console.warn('[TB303Synth] Error disposing voice component:', error);
              }
            });
            
            this.currentVoice = null;
          }
        }, 100); // 100ms pour le release
      }
      
      this.isPlaying = false;
      
    } catch (error) {
      console.error('[TB303Synth] Failed to stop note:', error);
    }
  }
  
  /**
   * Obtient l'état de la séquence
   */
  getSequenceState() {
    return {
      sequence: [...this.sequence],
      accents: Array.from(this.accents),
      slides: Array.from(this.slides),
      currentStep: this.currentStep,
      isPlaying: this.isSequencerPlaying,
      tempo: this.config.sequencer.tempo
    };
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
    return this.isPlaying || this.isSequencerPlaying;
  }
  
  /**
   * Vérifie si le TB303 est prêt
   */
  isReady() {
    return window.audioManager && window.audioManager.isReady();
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
      // Arrêter le séquenceur
      this.stopSequencer();
      
      // Arrêter toute note en cours
      this.stopNote();
      
      // Nettoyer les composants
      this.components.forEach(component => {
        try {
          if (component && typeof component.dispose === 'function' && !component.disposed) {
            component.dispose();
          }
        } catch (error) {
          console.warn('[TB303Synth] Error disposing component:', error);
        }
      });
      
      this.components = [];
      this.currentVoice = null;
      this.sequencer = null;
      this.isPlaying = false;
      this.isSequencerPlaying = false;
      
      console.log('[TB303Synth] Cleanup completed');
      
    } catch (error) {
      console.error('[TB303Synth] Cleanup failed:', error);
    }
  }
  
  /**
   * Obtient des informations de statut
   */
  getStatus() {
    return {
      isPlaying: this.isPlaying,
      isSequencerPlaying: this.isSequencerPlaying,
      currentStep: this.currentStep,
      tempo: this.config.sequencer.tempo,
      sequenceLength: this.sequence.filter(note => note !== null).length,
      accentsCount: this.accents.size,
      slidesCount: this.slides.size,
      config: this.getConfig(),
      componentsCount: this.components.length
    };
  }
}

// Factory function
window.createTB303Synth = function(config = {}) {
  const synth = new TB303Synth();
  if (Object.keys(config).length > 0) {
    synth.updateConfig(config);
  }
  return synth;
};

// Instance globale pour l'onglet TB-303
window.tb303Synth = new TB303Synth();

// Utilitaires pour l'interface TB-303
window.tb303Utils = {
  // Charge un pattern
  loadPattern: (patternName) => {
    if (window.tb303Synth) {
      return window.tb303Synth.loadPattern(patternName);
    }
    return false;
  },
  
  // Démarre/arrête le séquenceur
  toggleSequencer: () => {
    if (window.tb303Synth) {
      if (window.tb303Synth.isSequencerPlaying) {
        window.tb303Synth.stopSequencer();
      } else {
        window.tb303Synth.startSequencer();
      }
    }
  },
  
  // Efface la séquence
  clearSequence: () => {
    if (window.tb303Synth) {
      window.tb303Synth.clearSequence();
    }
  },
  
  // Génère un pattern aléatoire
  randomPattern: () => {
    if (window.tb303Synth) {
      window.tb303Synth.generateRandomPattern();
    }
  },
  
  // Gère les interactions avec le piano roll
  handleCellClick: (step, note, event) => {
    if (!window.tb303Synth || step < 0 || step >= 16) {
      return;
    }
    
    if (event.shiftKey) {
      // Shift + clic = toggle accent
      window.tb303Synth.toggleAccent(step);
    } else if (event.altKey) {
      // Alt + clic = toggle slide
      window.tb303Synth.toggleSlide(step);
    } else {
      // Clic normal = toggle note
      const currentNote = window.tb303Synth.sequence[step];
      if (currentNote) {
        window.tb303Synth.clearSequenceStep(step);
      } else {
        window.tb303Synth.setSequenceStep(step, note);
      }
    }
  }
};

// Ajouter les styles CSS pour l'indicateur de pas courant
const tb303Styles = document.createElement('style');
tb303Styles.textContent = `
  .step-cell.current {
    background: var(--neon-cyan) !important;
    box-shadow: 0 0 15px var(--neon-cyan) !important;
    animation: tb303-pulse 0.5s ease-in-out;
  }
  
  @keyframes tb303-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(tb303Styles);

// Fonction de test globale pour TB303
window.testTB303 = function() {
  console.log('=== TB303 TEST ===');
  
  if (!window.tb303Synth) {
    console.error('TB303Synth not found');
    return false;
  }
  
  if (!window.audioManager || !window.audioManager.isReady()) {
    console.error('AudioManager not ready');
    return false;
  }
  
  // Test basique d'abord - oscillateur direct
  console.log('Testing direct Tone.js oscillator...');
  try {
    const testOsc = new Tone.Oscillator(440, 'sawtooth');
    const testGain = new Tone.Gain(0.3);
    
    testOsc.connect(testGain);
    testGain.toDestination();
    
    testOsc.start();
    
    setTimeout(() => {
      testOsc.stop();
      testOsc.dispose();
      testGain.dispose();
      console.log('Direct oscillator test completed');
    }, 1000);
    
    console.log('Direct oscillator started successfully');
  } catch (error) {
    console.error('Direct oscillator test failed:', error);
    return false;
  }
  
  // Test TB303
  setTimeout(() => {
    console.log('Testing TB303 synth...');
    const success = window.tb303Synth.playNote('A3', 2);
    
    if (success) {
      console.log('TB303 test note played successfully');
    } else {
      console.error('TB303 test note failed');
    }
  }, 1500);
  
  return true;
};

console.log('[TB303Synth] Class loaded and global instance created');