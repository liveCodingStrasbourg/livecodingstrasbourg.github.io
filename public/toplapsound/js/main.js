/**
 * main.js - Initialisation principale de Sound Synthesis Explorer
 * TOPLAP Strasbourg - VERSION COMPLÈTE CORRIGÉE
 */

// Variables globales pour l'état de l'application
window.appState = {
  initialized: false,
  currentTab: 'fondamentaux',
  audioContext: null,
  isPlaying: false,
  activeNotes: new Set(),
  currentSynth: null
};

// Configuration globale
window.appConfig = {
  defaultVolume: 0.3,
  maxPolyphony: 8,
  uiUpdateRate: 60, // FPS pour les animations
  audioUpdateRate: 50 // ms pour les updates audio
};

/**
 * Point d'entrée principal de l'application
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('[Main] DOM loaded, initializing Sound Synthesis Explorer...');
  
  try {
    initializeApplication();
  } catch (error) {
    console.error('[Main] Failed to initialize application:', error);
    showErrorMessage('Erreur d\'initialisation de l\'application');
  }
});

/**
 * Initialise l'application complète
 */
async function initializeApplication() {
  console.log('[Main] Starting application initialization...');
  
  try {
    // 1. Vérifier que toutes les dépendances sont chargées
    if (!checkDependencies()) {
      throw new Error('Missing required dependencies');
    }
    
    // 2. Initialiser l'interface utilisateur
    initializeUI();
    
    // 3. Configurer les événements globaux
    setupGlobalEvents();
    
    // 4. Préparer l'overlay d'initialisation audio
    setupAudioInitOverlay();
    
    // 5. Initialiser les synthétiseurs avec valeurs par défaut
    initializeSynthesizers();
    
    // 6. Initialiser les valeurs UI par défaut
    initializeUIDefaults();
    
    // 7. Démarrer la boucle de visualisation
    startVisualizationLoop();
    
    console.log('[Main] Application initialization completed');
    window.appState.initialized = true;
    
  } catch (error) {
    console.error('[Main] Application initialization failed:', error);
    throw error;
  }
}

/**
 * Vérifie que toutes les dépendances sont chargées
 */
function checkDependencies() {
  const requiredGlobals = [
    'Tone',
    'audioManager',
    'waveformRenderer'
  ];
  
  const missingDeps = requiredGlobals.filter(dep => !window[dep]);
  
  if (missingDeps.length > 0) {
    console.error('[Main] Missing dependencies:', missingDeps);
    return false;
  }
  
  console.log('[Main] All dependencies loaded successfully');
  return true;
}

/**
 * Initialise l'interface utilisateur de base
 */
function initializeUI() {
  console.log('[Main] Initializing UI...');
  
  try {
    // Setup des onglets
    setupTabNavigation();
    
    // Setup des contrôles de base
    setupBasicControls();
    
    // Setup des claviers virtuels
    setupVirtualKeyboards();
    
    // Setup responsive
    setupResponsiveUI();
    
    console.log('[Main] UI initialization completed');
    
  } catch (error) {
    console.error('[Main] UI initialization failed:', error);
    throw error;
  }
}

/**
 * Configure la navigation par onglets
 */
function setupTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetTab = this.getAttribute('data-tab');
      
      if (targetTab) {
        switchToTab(targetTab);
      }
    });
  });
  
  // Onglet par défaut
  switchToTab('fondamentaux');
  
  console.log('[Main] Tab navigation setup completed');
}

/**
 * Initialise tous les synthétiseurs avec leurs valeurs par défaut
 */
function initializeSynthesizers() {
  try {
    // BasicSynth
    if (window.basicSynth) {
      window.basicSynth.setConfig({
        waveform: 'sine',
        frequency: 440,
        amplitude: 0.5,
        detune: 0,
        pulseWidth: 0.5
      });
    }
    
    // ModulatedSynth
    if (window.modulatedSynth) {
      window.modulatedSynth.updateConfig({
        carrier: { waveform: 'sine', frequency: 440 },
        modulator: { ratio: 1, index: 5, waveform: 'sine' },
        modulationType: 'frequency'
      });
    }
    
    // FilteredSynth
    if (window.filteredSynth) {
      window.filteredSynth.updateConfig({
        sourceType: 'oscillator',
        waveform: 'sawtooth',
        frequency: 220,
        filterType: 'lowpass',
        cutoffFrequency: 1200,
        Q: 1
      });
    }
    
    // FMSynth
    if (window.fmSynth) {
      window.fmSynth.updateConfig({
        modulator: { ratio: 1, index: 5 },
        carrier: { frequency: 440 }
      });
    }
    
    // AdditiveSynth - charger preset par défaut
    if (window.additiveSynth) {
      window.additiveSynth.loadPreset('sawtooth');
    }
    
    // WavetableSynth
    if (window.wavetableSynth) {
      window.wavetableSynth.setWavetable('basic');
      window.wavetableSynth.updatePosition(0);
    }
    
    // TB303Synth - charger pattern par défaut
    if (window.tb303Synth) {
      window.tb303Synth.loadPattern('classic1');
    }
    
    // AdvancedSynth
    if (window.advancedSynth) {
      window.advancedSynth.switchEngine('granular');
    }
    
    console.log('[Main] Synthesizers initialized with defaults');
    
  } catch (error) {
    console.error('[Main] Failed to initialize synthesizers:', error);
  }
}

/**
 * Initialise les valeurs par défaut de l'interface
 */
function initializeUIDefaults() {
  try {
    // Activer les boutons par défaut pour chaque onglet

        // Onglet Fondamentaux - Sine wave par défaut
    const fondSineBtn = document.querySelector('#tab-fondamentaux .wave-btn[data-wave="sine"]');
    if (fondSineBtn) fondSineBtn.classList.add('active');
    
    // Onglet Oscillateurs - Sine wave par défaut
    const sineBtn = document.querySelector('#tab-oscillateurs .wave-btn[data-wave="sine"]');
    if (sineBtn) sineBtn.classList.add('active');
    
    // Onglet Modulation - Types par défaut
    const freqModBtn = document.querySelector('.mod-type-btn[data-type="frequency"]');
    if (freqModBtn) freqModBtn.classList.add('active');
    
    const sineCarrierBtn = document.querySelector('#tab-modulation .wave-btn[data-wave="sine"]');
    if (sineCarrierBtn) sineCarrierBtn.classList.add('active');
    
    const sineLFOBtn = document.querySelector('.lfo-wave-btn[data-wave="sine"]');
    if (sineLFOBtn) sineLFOBtn.classList.add('active');
    
    // Onglet Filtres
    const lowpassBtn = document.querySelector('.filter-btn[data-type="lowpass"]');
    if (lowpassBtn) lowpassBtn.classList.add('active');
    
    const sawSourceBtn = document.querySelector('.source-btn[data-source="sawtooth"]');
    if (sawSourceBtn) sawSourceBtn.classList.add('active');
    
    // Onglet Soustractif
    const sawOsc1Btn = document.querySelector('.osc1-wave-btn[data-wave="sawtooth"]');
    if (sawOsc1Btn) sawOsc1Btn.classList.add('active');
    
    const squareOsc2Btn = document.querySelector('.osc2-wave-btn[data-wave="square"]');
    if (squareOsc2Btn) squareOsc2Btn.classList.add('active');
    
    // Onglet Wavetables
    const basicWTCard = document.querySelector('.wavetable-card[data-wavetable="basic"]');
    if (basicWTCard) basicWTCard.classList.add('active');
    
    // Onglet TB-303
    const sawTBBtn = document.querySelector('.tb-wave-btn[data-wave="sawtooth"]');
    if (sawTBBtn) sawTBBtn.classList.add('active');
    
    console.log('[Main] UI defaults initialized');
    
  } catch (error) {
    console.error('[Main] Failed to initialize UI defaults:', error);
  }
}



/**
 * Configure les contrôles de base (curseurs, boutons) - VERSION AMÉLIORÉE
 */
function setupBasicControls() {
  // Setup des curseurs avec update en temps réel
  const sliders = document.querySelectorAll('.slider');
  
  sliders.forEach(slider => {
    const valueDisplay = document.getElementById(slider.id + '-value');
    
    slider.addEventListener('input', function() {
      updateSliderValue(this, valueDisplay);
      // Add real-time audio updates pour TOUS les onglets
      handleSliderAudioUpdate(this.id, parseFloat(this.value));
    });
    
    // Initialiser la valeur affichée
    updateSliderValue(slider, valueDisplay);
  });
  
  // Setup des boutons toggle with proper audio integration
  setupToggleButtons();
  
  // Setup play/stop buttons
  setupPlayStopButtons();
  
  // Setup des contrôles spécifiques par onglet
  setupFundamentalsControls(); // New unified fundamentals tab
  setupModulationControls();
  setupFilterControls();
  setupEnvelopeControls();
  setupSubtractiveControls();
  setupFMControls();
  setupAdditiveControls();
  setupWavetableControls();
  setupTB303Controls();
  setupAdvancedControls();
  setupWaveformCards();
  
  console.log('[Main] Basic controls setup completed');
}

/**
 * Gestion améliorée des sliders audio pour tous les onglets
 */
function handleSliderAudioUpdate(sliderId, value) {
  const currentTab = window.appState?.currentTab || 'fondamentaux';
  
  switch (currentTab) {
    case 'fondamentaux':
      handleFondamentauxSliders(sliderId, value);
      break;
      
    case 'oscillateurs':
      handleOscillateursSliders(sliderId, value);
      break;
      
    case 'modulation':
      handleModulationSliders(sliderId, value);
      break;
      
    case 'filtres':
      handleFiltresSliders(sliderId, value);
      break;
      
    case 'enveloppes':
      handleEnveloppesSliders(sliderId, value);
      break;
      
    case 'soustractive':
      handleSubtractiveSliders(sliderId, value);
      break;
      
    case 'fm':
      handleFMSliders(sliderId, value);
      break;
      
    case 'additive':
      handleAdditiveSliders(sliderId, value);
      break;
      
    case 'wavetables':
      handleWavetableSliders(sliderId, value);
      break;
      
    case 'tb303':
      handleTB303Sliders(sliderId, value);
      break;
      
    case 'avancees':
      handleAdvancedSliders(sliderId, value);
      break;
  }
}

// Handlers spécifiques par onglet
function handleFondamentauxSliders(sliderId, value) {
  if (sliderId === 'fond-freq' && window.basicSynth) {
    window.basicSynth.updateFrequency(value);
  } else if (sliderId === 'fond-amp' && window.basicSynth) {
    window.basicSynth.updateAmplitude(value / 100);
  }
}

function handleOscillateursSliders(sliderId, value) {
  if (!window.basicSynth) return;
  
  switch (sliderId) {
    case 'osc-freq':
      window.basicSynth.updateFrequency(value);
      break;
    case 'osc-detune':
      window.basicSynth.updateDetune(value);
      break;
    case 'osc-pulse-width':
      window.basicSynth.updatePulseWidth(value);
      break;
  }
}

function handleModulationSliders(sliderId, value) {
  if (!window.modulatedSynth) return;
  
  switch (sliderId) {
    case 'mod-carrier-freq':
      window.modulatedSynth.updateCarrierFrequency(value);
      break;
    case 'mod-lfo-rate':
      window.modulatedSynth.updateLFORate(value);
      break;
    case 'mod-lfo-depth':
      window.modulatedSynth.updateLFODepth(value);
      break;
  }
}

function handleFiltresSliders(sliderId, value) {
  if (!window.filteredSynth) return;
  
  switch (sliderId) {
    case 'filter-cutoff':
      window.filteredSynth.updateCutoffFrequency(value);
      break;
    case 'filter-resonance':
      window.filteredSynth.updateResonance(value);
      break;
    case 'filter-source-freq':
      window.filteredSynth.updateSourceFrequency(value);
      break;
  }
}

function handleEnveloppesSliders(sliderId, value) {
  // Les enveloppes sont gérées par le système global pour maintenant
  console.log(`[Main] Envelope slider: ${sliderId} = ${value}`);
  
  // Mettre à jour la visualisation ADSR
  updateADSRVisualization();
}

function handleSubtractiveSliders(sliderId, value) {
  if (!window.subtractiveSynth) return;
  
  // VCO1 controls
  if (sliderId.startsWith('sub-osc1-')) {
    const param = sliderId.replace('sub-osc1-', '');
    switch (param) {
      case 'detune':
        window.subtractiveSynth.updateVCO1({ detune: value });
        break;
      case 'level':
        window.subtractiveSynth.updateVCO1({ level: value / 100 });
        break;
    }
  }
  // VCO2 controls
  else if (sliderId.startsWith('sub-osc2-')) {
    const param = sliderId.replace('sub-osc2-', '');
    switch (param) {
      case 'detune':
        window.subtractiveSynth.updateVCO2({ detune: value });
        break;
      case 'level':
        window.subtractiveSynth.updateVCO2({ level: value / 100 });
        break;
    }
  }
  // Filter controls
  else if (sliderId.startsWith('sub-filter-')) {
    const param = sliderId.replace('sub-filter-', '');
    switch (param) {
      case 'cutoff':
        window.subtractiveSynth.updateFilter({ cutoff: value });
        break;
      case 'resonance':
        window.subtractiveSynth.updateFilter({ resonance: value });
        break;
      case 'env-amount':
        window.subtractiveSynth.updateFilter({ envAmount: value });
        break;
      case 'attack':
        window.subtractiveSynth.updateFilterEnvelope({ attack: value });
        break;
      case 'decay':
        window.subtractiveSynth.updateFilterEnvelope({ decay: value });
        break;
      case 'sustain':
        window.subtractiveSynth.updateFilterEnvelope({ sustain: value / 100 });
        break;
      case 'release':
        window.subtractiveSynth.updateFilterEnvelope({ release: value });
        break;
    }
  }
  // Amplitude envelope controls
  else if (sliderId.startsWith('sub-amp-')) {
    const param = sliderId.replace('sub-amp-', '');
    switch (param) {
      case 'attack':
        window.subtractiveSynth.updateAmplitudeEnvelope({ attack: value });
        break;
      case 'decay':
        window.subtractiveSynth.updateAmplitudeEnvelope({ decay: value });
        break;
      case 'sustain':
        window.subtractiveSynth.updateAmplitudeEnvelope({ sustain: value / 100 });
        break;
      case 'release':
        window.subtractiveSynth.updateAmplitudeEnvelope({ release: value });
        break;
    }
  }
}

function handleFMSliders(sliderId, value) {
  if (!window.fmSynth) return;
  
  switch (sliderId) {
    case 'fm-carrier-freq':
      window.fmSynth.updateConfig({ carrier: { frequency: value } });
      break;
    case 'fm-index':
      window.fmSynth.updateIndex(value);
      break;
    case 'fm-mod-attack':
      window.fmSynth.updateConfig({ modulatorEnvelope: { attack: value } });
      break;
    case 'fm-mod-decay':
      window.fmSynth.updateConfig({ modulatorEnvelope: { decay: value } });
      break;
    case 'fm-mod-sustain':
      window.fmSynth.updateConfig({ modulatorEnvelope: { sustain: value / 100 } });
      break;
  }
}

function handleAdditiveSliders(sliderId, value) {
  if (!window.additiveSynth) return;
  
  if (sliderId.startsWith('add-h')) {
    const harmonicNumber = parseInt(sliderId.replace('add-h', ''));
    window.additiveSynth.updateHarmonic(harmonicNumber, value / 100);
  } else {
    switch (sliderId) {
      case 'add-base-freq':
        window.additiveSynth.updateFundamentalFrequency(value);
        break;
      case 'add-volume':
        window.additiveSynth.updateConfig({ masterVolume: value / 100 });
        break;
    }
  }
}

function handleWavetableSliders(sliderId, value) {
  if (!window.wavetableSynth) return;
  
  switch (sliderId) {
    case 'wav-position':
      window.wavetableSynth.updatePosition(value);
      break;
    case 'wav-frequency':
      window.wavetableSynth.updateFrequency(value);
      break;
    case 'wav-mod-depth':
      window.wavetableSynth.updatePositionModulation({ depth: value });
      break;
    case 'wav-mod-speed':
      window.wavetableSynth.updatePositionModulation({ lfoRate: value });
      break;
  }
}

function handleTB303Sliders(sliderId, value) {
  if (!window.tb303Synth) return;
  
  switch (sliderId) {
    case 'tb-tuning':
      window.tb303Synth.updateConfig({ vco: { tuning: value } });
      break;
    case 'tb-cutoff':
      window.tb303Synth.updateConfig({ filter: { cutoff: value } });
      break;
    case 'tb-resonance':
      window.tb303Synth.updateConfig({ filter: { resonance: value } });
      break;
    case 'tb-env-mod':
      window.tb303Synth.updateConfig({ filter: { envMod: value } });
      break;
    case 'tb-decay':
      window.tb303Synth.updateConfig({ filter: { decay: value } });
      break;
    case 'tb-tempo':
      window.tb303Synth.updateTempo(value);
      break;
  }
}

function handleAdvancedSliders(sliderId, value) {
  if (!window.advancedSynth) return;
  
  // Granular controls
  if (sliderId.startsWith('gran-')) {
    const param = sliderId.replace('gran-', '');
    switch (param) {
      case 'size':
        window.advancedSynth.updateConfig({ granular: { grainSize: value } });
        break;
      case 'density':
        window.advancedSynth.updateConfig({ granular: { density: value } });
        break;
      case 'pitch':
        window.advancedSynth.updateConfig({ granular: { pitchSpread: value } });
        break;
      case 'time':
        window.advancedSynth.updateConfig({ granular: { timeSpread: value } });
        break;
    }
  }
  // Gendy controls
  else if (sliderId.startsWith('gendy-')) {
    const param = sliderId.replace('gendy-', '');
    switch (param) {
      case 'amp':
        window.advancedSynth.updateConfig({ gendy: { amplitudeVariation: value } });
        break;
      case 'dur':
        window.advancedSynth.updateConfig({ gendy: { durationVariation: value } });
        break;
      case 'points':
        window.advancedSynth.updateConfig({ gendy: { points: Math.round(value) } });
        break;
      case 'freq':
        window.advancedSynth.updateConfig({ gendy: { frequency: value } });
        break;
    }
  }
  // Chaos controls
  else if (sliderId.startsWith('chaos-')) {
    const param = sliderId.replace('chaos-', '');
    switch (param) {
      case 'factor':
        window.advancedSynth.updateConfig({ chaos: { factor: value } });
        break;
      case 'speed':
        window.advancedSynth.updateConfig({ chaos: { speed: value } });
        break;
    }
  }
}

/**
 * Met à jour la valeur affichée d'un curseur
 */
function updateSliderValue(slider, valueDisplay) {
  if (!valueDisplay) return;
  
  const value = parseFloat(slider.value);
  const step = parseFloat(slider.step) || 1;
  
  // Formatage selon le type de curseur
  let formattedValue;
  
  if (slider.id.includes('freq')) {
    formattedValue = `${value.toFixed(1)} Hz`;
  } else if (slider.id.includes('amp') || slider.id.includes('level') || slider.id.includes('sustain')) {
    formattedValue = `${Math.round(value)}%`;
  } else if (slider.id.includes('time') || slider.id.includes('attack') || slider.id.includes('decay') || slider.id.includes('release')) {
    formattedValue = `${value.toFixed(2)}s`;
  } else if (slider.id.includes('detune')) {
    formattedValue = `${value > 0 ? '+' : ''}${value} cents`;
  } else if (step < 1) {
    formattedValue = value.toFixed(2);
  } else {
    formattedValue = Math.round(value).toString();
  }
  
  valueDisplay.textContent = formattedValue;
}

/**
 * Setup des contrôles de modulation
 */
function setupModulationControls() {
  console.log('[Main] Setting up modulation controls...');
  
  // Contrôles de l'oscillateur principal (modulation)
  const modCarrierButtons = document.querySelectorAll('#tab-modulation .wave-btn');
  modCarrierButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Désactiver les autres boutons du groupe
      modCarrierButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const waveform = this.getAttribute('data-wave');
      if (window.modulatedSynth) {
        window.modulatedSynth.updateCarrierWaveform(waveform);
      }
    });
  });
  
  // Types de modulation
  const modTypeButtons = document.querySelectorAll('.mod-type-btn');
  modTypeButtons.forEach(button => {
    button.addEventListener('click', function() {
      modTypeButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const type = this.getAttribute('data-type');
      if (window.modulatedSynth) {
        window.modulatedSynth.updateModulationType(type);
      }
    });
  });
  
  // Formes d'onde LFO
  const lfoWaveButtons = document.querySelectorAll('.lfo-wave-btn');
  lfoWaveButtons.forEach(button => {
    button.addEventListener('click', function() {
      lfoWaveButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const waveform = this.getAttribute('data-wave');
      if (window.modulatedSynth) {
        window.modulatedSynth.updateLFOWaveform(waveform);
      }
    });
  });
  
  console.log('[Main] Modulation controls setup completed');
}

/**
 * Setup des contrôles de filtres
 */
function setupFilterControls() {
  console.log('[Main] Setting up filter controls...');
  
  // Types de filtres
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const type = this.getAttribute('data-type');
      if (window.filteredSynth) {
        window.filteredSynth.updateFilterType(type);
      }
    });
  });
  
  // Types de source
  const sourceButtons = document.querySelectorAll('.source-btn');
  sourceButtons.forEach(button => {
    button.addEventListener('click', function() {
      sourceButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const source = this.getAttribute('data-source');
      if (window.filteredSynth) {
        if (source.includes('noise')) {
          window.filteredSynth.updateSourceType('noise');
          window.filteredSynth.updateNoiseType(source.replace('noise', ''));
        } else {
          window.filteredSynth.updateSourceType('oscillator');
          window.filteredSynth.updateWaveform(source);
        }
      }
    });
  });
  
  console.log('[Main] Filter controls setup completed');
}

/**
 * Setup des contrôles d'enveloppes
 */
function setupEnvelopeControls() {
  console.log('[Main] Setting up envelope controls...');
  
  // Les sliders ADSR sont déjà gérés par handleSliderAudioUpdate
  // Ici on peut ajouter des visualisations en temps réel
  
  const adsrSliders = ['env-attack', 'env-decay', 'env-sustain', 'env-release'];
  adsrSliders.forEach(sliderId => {
    const slider = document.getElementById(sliderId);
    if (slider) {
      slider.addEventListener('input', function() {
        updateADSRVisualization();
      });
    }
  });
  
  console.log('[Main] Envelope controls setup completed');
}

/**
 * Setup des contrôles soustractifs
 */
function setupSubtractiveControls() {
  console.log('[Main] Setting up subtractive controls...');
  
  // Formes d'onde VCO1
  const osc1WaveButtons = document.querySelectorAll('.osc1-wave-btn');
  osc1WaveButtons.forEach(button => {
    button.addEventListener('click', function() {
      osc1WaveButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const waveform = this.getAttribute('data-wave');
      if (window.subtractiveSynth) {
        window.subtractiveSynth.updateVCO1({ waveform: waveform });
      }
    });
  });
  
  // Formes d'onde VCO2
  const osc2WaveButtons = document.querySelectorAll('.osc2-wave-btn');
  osc2WaveButtons.forEach(button => {
    button.addEventListener('click', function() {
      osc2WaveButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const waveform = this.getAttribute('data-wave');
      if (window.subtractiveSynth) {
        window.subtractiveSynth.updateVCO2({ waveform: waveform });
      }
    });
  });
  
  // Note base VCO1
  const osc1NoteSelect = document.getElementById('sub-osc1-note');
  if (osc1NoteSelect) {
    osc1NoteSelect.addEventListener('change', function() {
      // La note base sera utilisée lors du playNote
      console.log(`[Main] VCO1 base note set to ${this.value}`);
    });
  }
  
  // Presets soustractifs
  const presetButtons = document.querySelectorAll('#tab-soustractive .preset-btn');
  presetButtons.forEach(button => {
    button.addEventListener('click', function() {
      const preset = this.getAttribute('data-preset');
      if (window.subtractiveSynth) {
        window.subtractiveSynth.loadPreset(preset);
      }
      updateSubtractiveUIFromConfig();
    });
  });
  
  console.log('[Main] Subtractive controls setup completed');
}

/**
 * Setup des contrôles FM
 */
function setupFMControls() {
  console.log('[Main] Setting up FM controls...');
  
  // Sélecteur de ratio FM
  const ratioSelect = document.getElementById('fm-ratio');
  if (ratioSelect) {
    ratioSelect.addEventListener('change', function() {
      const ratio = parseFloat(this.value);
      if (window.fmSynth) {
        window.fmSynth.updateRatio(ratio);
      }
    });
  }
  
  // Note porteur
  const carrierNoteSelect = document.getElementById('fm-carrier-note');
  if (carrierNoteSelect) {
    carrierNoteSelect.addEventListener('change', function() {
      const note = this.value;
      const frequency = window.audioManager?.noteToFrequency(note);
      if (frequency && window.fmSynth) {
        window.fmSynth.updateConfig({ carrier: { frequency: frequency } });
        
        // Mettre à jour le slider de fréquence
        const freqSlider = document.getElementById('fm-carrier-freq');
        if (freqSlider) {
          freqSlider.value = frequency;
          updateSliderValue(freqSlider, document.getElementById('fm-carrier-freq-value'));
        }
      }
    });
  }
  
  // Presets FM
  const fmPresetButtons = document.querySelectorAll('#tab-fm .preset-btn');
  fmPresetButtons.forEach(button => {
    button.addEventListener('click', function() {
      const preset = this.getAttribute('data-preset');
      if (window.fmSynth) {
        window.fmSynth.loadPreset(preset);
      }
      updateFMUIFromConfig();
    });
  });
  
  console.log('[Main] FM controls setup completed');
}

/**
 * Setup des contrôles additifs
 */
function setupAdditiveControls() {
  console.log('[Main] Setting up additive controls...');
  
  // Presets additifs
  const addPresetButtons = document.querySelectorAll('.add-preset-btn');
  addPresetButtons.forEach(button => {
    button.addEventListener('click', function() {
      const preset = this.getAttribute('data-preset');
      if (window.additiveSynth) {
        window.additiveSynth.loadPreset(preset);
      }
      updateAdditiveUIFromConfig();
    });
  });
  
  console.log('[Main] Additive controls setup completed');
}

/**
 * Setup des contrôles wavetables
 */
function setupWavetableControls() {
  console.log('[Main] Setting up wavetable controls...');
  
  // Sélection de wavetables
  const wavetableCards = document.querySelectorAll('.wavetable-card');
  wavetableCards.forEach(card => {
    card.addEventListener('click', function() {
      wavetableCards.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      
      const wavetableName = this.getAttribute('data-wavetable');
      if (window.wavetableSynth) {
        window.wavetableSynth.setWavetable(wavetableName);
      }
    });
  });
  
  console.log('[Main] Wavetable controls setup completed');
}

function setupTB303Controls() {
  console.log('[Main] Setting up TB-303 controls...');
  
  // Formes d'onde TB-303
  const tbWaveButtons = document.querySelectorAll('.tb-wave-btn');
  tbWaveButtons.forEach(button => {
    button.addEventListener('click', function() {
      tbWaveButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      const waveform = this.getAttribute('data-wave');
      if (window.tb303Synth) {
        window.tb303Synth.updateConfig({ vco: { waveform: waveform } });
      }
    });
  });
  
  // Transport TB-303 - CORRIGÉ
  const tbSeqPlay = document.getElementById('tb-seq-play');
  if (tbSeqPlay) {
    tbSeqPlay.addEventListener('click', function() {
      if (!window.tb303Synth) {
        console.warn('[Main] TB303Synth not available');
        return;
      }
      
      try {
        if (window.tb303Synth.isSequencerPlaying) {
          window.tb303Synth.stopSequencer();
          this.textContent = 'Play';
          this.classList.remove('playing');
          console.log('[Main] TB-303 sequencer stopped');
        } else {
          const success = window.tb303Synth.startSequencer();
          if (success) {
            this.textContent = 'Stop';
            this.classList.add('playing');
            console.log('[Main] TB-303 sequencer started');
          } else {
            console.error('[Main] Failed to start TB-303 sequencer');
          }
        }
      } catch (error) {
        console.error('[Main] Error with TB-303 sequencer:', error);
      }
    });
  }
  
  const tbSeqStop = document.getElementById('tb-seq-stop');
  if (tbSeqStop) {
    tbSeqStop.addEventListener('click', function() {
      if (window.tb303Synth) {
        window.tb303Synth.stopSequencer();
        const playBtn = document.getElementById('tb-seq-play');
        if (playBtn) {
          playBtn.textContent = 'Play';
          playBtn.classList.remove('playing');
        }
        console.log('[Main] TB-303 sequencer stopped via stop button');
      }
    });
  }
  
  const tbSeqClear = document.getElementById('tb-seq-clear');
  if (tbSeqClear) {
    tbSeqClear.addEventListener('click', function() {
      if (window.tb303Synth) {
        window.tb303Synth.clearSequence();
        console.log('[Main] TB-303 sequence cleared');
      }
      clearTB303UI();
    });
  }
  
  // Bouton pour générer un pattern aléatoire
  const tbRandomBtn = document.getElementById('tb-random');
  if (tbRandomBtn) {
    tbRandomBtn.addEventListener('click', function() {
      if (window.tb303Synth) {
        window.tb303Synth.generateRandomPattern();
        updateTB303UIFromSequence();
        console.log('[Main] TB-303 random pattern generated');
      }
    });
  }
  
  // Patterns TB-303
  const patternButtons = document.querySelectorAll('.pattern-btn');
  patternButtons.forEach(button => {
    button.addEventListener('click', function() {
      const pattern = this.getAttribute('data-pattern');
      if (window.tb303Synth) {
        const success = window.tb303Synth.loadPattern(pattern);
        if (success) {
          updateTB303UIFromSequence();
          console.log(`[Main] TB-303 pattern "${pattern}" loaded`);
        }
      }
    });
  });
  
  // Piano roll TB-303
  setupTB303PianoRoll();
  
  // Test button TB-303
  const tbTestBtn = document.getElementById('tb-test');
  if (tbTestBtn) {
    tbTestBtn.addEventListener('click', function() {
      if (window.testTB303) {
        window.testTB303();
      } else {
        console.error('[Main] testTB303 function not found');
      }
    });
  }
  
  // Setup TB-303 visualizations
  setupTB303Visualizations();
  
  console.log('[Main] TB-303 controls setup completed');
}

/**
 * Setup des contrôles fondamentaux (nouvel onglet unifié)
 */
function setupFundamentalsControls() {
  console.log('[Main] Setting up fundamentals controls...');
  
  // Variables d'état
  let currentSourceType = 'oscillator'; // 'oscillator' ou 'noise'
  let currentWaveform = 'sine';
  let currentNoise = null;
  let isPlaying = false;
  
  // Toggle source type (oscillator/noise)
  const sourceTypeBtns = document.querySelectorAll('.source-type-btn');
  sourceTypeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      sourceTypeBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      const sourceType = this.getAttribute('data-type');
      currentSourceType = sourceType;
      
      // Show/hide sections
      const oscSection = document.getElementById('oscillator-section');
      const noiseSection = document.getElementById('noise-section');
      
      if (sourceType === 'oscillator') {
        oscSection.style.display = 'block';
        noiseSection.style.display = 'none';
        currentNoise = null;
      } else {
        oscSection.style.display = 'none';
        noiseSection.style.display = 'block';
        currentWaveform = null;
      }
      
      // Stop any current sound
      if (isPlaying) {
        stopFundamentalsSound();
      }
      
      updateFundamentalsVisualization();
    });
  });
  
  // Waveform cards selection
  const waveformCards = document.querySelectorAll('.waveform-card');
  waveformCards.forEach(card => {
    card.addEventListener('click', function() {
      waveformCards.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      
      currentWaveform = this.getAttribute('data-waveform');
      currentNoise = null;
      
      if (isPlaying) {
        playFundamentalsSound();
      }
      updateFundamentalsVisualization();
    });
  });
  
  // Noise cards selection
  const noiseCards = document.querySelectorAll('.noise-card');
  noiseCards.forEach(card => {
    card.addEventListener('click', function() {
      noiseCards.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      
      currentNoise = this.getAttribute('data-noise');
      currentWaveform = null;
      
      if (isPlaying) {
        playFundamentalsSound();
      }
      updateFundamentalsVisualization();
    });
  });
  
  // Play/Stop controls
  const playBtn = document.getElementById('fund-play');
  const stopBtn = document.getElementById('fund-stop');
  
  if (playBtn) {
    playBtn.addEventListener('click', function() {
      playFundamentalsSound();
    });
  }
  
  if (stopBtn) {
    stopBtn.addEventListener('click', function() {
      stopFundamentalsSound();
    });
  }
  
  // Parameter controls
  const freqSlider = document.getElementById('fund-freq');
  const ampSlider = document.getElementById('fund-amp');
  
  if (freqSlider) {
    freqSlider.addEventListener('input', function() {
      updateSliderValue(this, document.getElementById('fund-freq-value'));
      if (isPlaying) {
        updateFundamentalsParameters();
      }
    });
  }
  
  if (ampSlider) {
    ampSlider.addEventListener('input', function() {
      updateSliderValue(this, document.getElementById('fund-amp-value'));
      if (isPlaying) {
        updateFundamentalsParameters();
      }
    });
  }
  
  // Fonctions audio
  function playFundamentalsSound() {
    if (!window.audioManager || !window.audioManager.isReady()) {
      console.warn('[Main] AudioManager not ready');
      return;
    }
    
    stopFundamentalsSound();
    
    try {
      if (currentSourceType === 'oscillator' && currentWaveform) {
        if (window.basicSynth) {
          const freq = parseFloat(freqSlider?.value || 440);
          window.basicSynth.updateWaveform(currentWaveform);
          window.basicSynth.updateFrequency(freq);
          window.basicSynth.playNote(freq, null);
          isPlaying = true;
        }
      } else if (currentSourceType === 'noise' && currentNoise) {
        // Play noise using basicSynth noise functionality
        if (window.basicSynth) {
          window.basicSynth.playNoise(currentNoise);
          isPlaying = true;
        }
      }
      
      updateFundamentalsVisualization();
      
    } catch (error) {
      console.error('[Main] Failed to play fundamentals sound:', error);
    }
  }
  
  function stopFundamentalsSound() {
    try {
      if (window.basicSynth) {
        window.basicSynth.stopNote();
      }
      isPlaying = false;
      
    } catch (error) {
      console.error('[Main] Failed to stop fundamentals sound:', error);
    }
  }
  
  function updateFundamentalsParameters() {
    if (!isPlaying) return;
    
    try {
      const freq = parseFloat(freqSlider?.value || 440);
      const amp = parseFloat(ampSlider?.value || 50) / 100;
      
      if (window.basicSynth) {
        window.basicSynth.updateFrequency(freq);
        window.basicSynth.updateAmplitude(amp);
      }
      
    } catch (error) {
      console.error('[Main] Failed to update fundamentals parameters:', error);
    }
  }
  
  function updateFundamentalsVisualization() {
    if (!window.waveformRenderer) return;
    
    try {
      const canvas = document.getElementById('main-visualization-canvas');
      const description = document.getElementById('viz-description');
      
      if (!canvas) return;
      
      if (currentSourceType === 'oscillator' && currentWaveform) {
        const freq = parseFloat(freqSlider?.value || 440);
        window.waveformRenderer.drawWaveform('main-visualization-canvas', currentWaveform, freq);
        if (description) {
          description.textContent = `Forme d'onde ${currentWaveform} à ${freq}Hz`;
        }
      } else if (currentSourceType === 'noise' && currentNoise) {
        window.waveformRenderer.drawNoise('main-visualization-canvas', currentNoise, 1);
        if (description) {
          description.textContent = `Bruit ${currentNoise}`;
        }
      } else {
        window.waveformRenderer.clearCanvas('main-visualization-canvas');
        if (description) {
          description.textContent = 'Sélectionnez une source pour voir sa visualisation';
        }
      }
      
    } catch (error) {
      console.error('[Main] Failed to update fundamentals visualization:', error);
    }
  }
  
  // Initialiser les mini-visualisations dans les cartes
  setTimeout(() => {
    initFundamentalsCardVisualizations();
  }, 100);
  
  function initFundamentalsCardVisualizations() {
    try {
      // Dessiner les formes d'onde dans les cartes
      waveformCards.forEach(card => {
        const canvas = card.querySelector('canvas');
        const waveform = card.getAttribute('data-waveform');
        if (canvas && waveform && window.waveformRenderer) {
          window.waveformRenderer.drawMiniWaveform(canvas, waveform);
        }
      });
      
      // Dessiner les bruits dans les cartes
      noiseCards.forEach(card => {
        const canvas = card.querySelector('canvas');
        const noise = card.getAttribute('data-noise');
        if (canvas && noise && window.waveformRenderer) {
          window.waveformRenderer.drawMiniNoise(canvas, noise);
        }
      });
      
    } catch (error) {
      console.error('[Main] Failed to init card visualizations:', error);
    }
  }
  
  console.log('[Main] Fundamentals controls setup completed');
}

/**
 * Setup des visualisations TB-303
 */
function setupTB303Visualizations() {
  console.log('[Main] Setting up TB-303 visualizations...');
  
  // Fonction pour mettre à jour les visualisations TB-303
  function updateTB303Visuals() {
    if (!window.waveformRenderer || !window.tb303Synth) {
      return;
    }
    
    try {
      // Mise à jour du spectre en temps réel
      window.waveformRenderer.drawSpectrum('tb303-waveform-canvas');
      
      // Mise à jour de la réponse de filtre
      const config = window.tb303Synth.getConfig();
      window.waveformRenderer.drawFilterResponse(
        'tb303-filter-canvas',
        config.filter.cutoff,
        config.filter.resonance / 15, // Normaliser 0-15 vers 0-1
        'lowpass'
      );
      
    } catch (error) {
      console.warn('[Main] TB-303 visualization update failed:', error);
    }
  }
  
  // Démarrer les animations si on est sur l'onglet TB-303
  if (window.appState?.currentTab === 'tb303') {
    setInterval(updateTB303Visuals, 100); // 10 FPS
  }
  
  // Observer les changements de slider TB-303 pour mettre à jour les visualisations
  const tbSliders = document.querySelectorAll('#tab-tb303 .slider');
  tbSliders.forEach(slider => {
    slider.addEventListener('input', function() {
      setTimeout(updateTB303Visuals, 50); // Délai pour laisser le time de mise à jour
    });
  });
  
  console.log('[Main] TB-303 visualizations setup completed');
}

/**
 * Setup des contrôles avancés
 */
function setupAdvancedControls() {
  console.log('[Main] Setting up advanced controls...');
  
  // Sélecteurs pour types chaos
  const chaosTypeSelect = document.getElementById('chaos-type');
  if (chaosTypeSelect) {
    chaosTypeSelect.addEventListener('change', function() {
      if (window.advancedSynth) {
        window.advancedSynth.updateConfig({ chaos: { type: this.value } });
      }
    });
  }
  
  
  // Sélecteurs pour notes granulaires
  const granNoteSelect = document.getElementById('gran-note');
  if (granNoteSelect) {
    granNoteSelect.addEventListener('change', function() {
      if (window.advancedSynth) {
        window.advancedSynth.updateConfig({ granular: { baseNote: this.value } });
      }
    });
  }
  
  console.log('[Main] Advanced controls setup completed');
}

/**
 * Fonction corrigée pour gérer les cartes de bruit
 */
function setupWaveformCards() {
  console.log('[Main] Setting up interactive waveform cards...');
  
  // Sélectionner les cartes de formes d'onde dans l'onglet fondamentaux
  const waveformCards = document.querySelectorAll('#tab-fondamentaux .waveform-card');
  const noiseCards = document.querySelectorAll('#tab-fondamentaux .noise-card');
  
  // Variable pour tracker le type actuel
  let currentType = 'waveform'; // 'waveform' ou 'noise'
  let currentSelection = 'sine';
  
  // Setup des cartes de formes d'onde
  waveformCards.forEach(card => {
    card.style.cursor = 'pointer';
    card.style.transition = 'all 0.2s ease';
    
    card.addEventListener('click', function() {
      // Désactiver toutes les cartes (waveform ET noise)
      waveformCards.forEach(c => c.classList.remove('active'));
      noiseCards.forEach(c => c.classList.remove('active'));
      
      // Activer la carte cliquée
      this.classList.add('active');
      currentType = 'waveform';
      
      // Déterminer la forme d'onde selon le titre
      const title = this.querySelector('h4').textContent;
      let waveform = 'sine';
      
      if (title.includes('Sinusoïdale')) {
        waveform = 'sine';
      } else if (title.includes('Carrée')) {
        waveform = 'square';
      } else if (title.includes('Scie')) {
        waveform = 'sawtooth';
      } else if (title.includes('Triangulaire')) {
        waveform = 'triangle';
      }
      
      currentSelection = waveform;
      
      // Mettre à jour le synthé
      if (window.basicSynth) {
        window.basicSynth.updateWaveform(waveform);
        console.log(`[Main] Waveform changed to: ${waveform}`);
      }
    });
    
    setupCardHover(card);
  });
  
  // Setup des cartes de bruit
  noiseCards.forEach(card => {
    card.style.cursor = 'pointer';
    card.style.transition = 'all 0.2s ease';
    
    card.addEventListener('click', function() {
      // Désactiver toutes les cartes (waveform ET noise)
      waveformCards.forEach(c => c.classList.remove('active'));
      noiseCards.forEach(c => c.classList.remove('active'));
      
      // Activer la carte cliquée
      this.classList.add('active');
      currentType = 'noise';
      
      // Déterminer le type de bruit selon le titre
      const title = this.querySelector('h4').textContent;
      let noiseType = 'white';
      
      if (title.includes('Blanc')) {
        noiseType = 'white';
      } else if (title.includes('Rose')) {
        noiseType = 'pink';
      } else if (title.includes('Brun')) {
        noiseType = 'brown';
      }
      
      currentSelection = noiseType;
      
      console.log(`[Main] Noise type changed to: ${noiseType}`);
    });
    
    setupCardHover(card);
  });
  
  // Fonction helper pour les effets hover
  function setupCardHover(card) {
    card.addEventListener('mouseenter', function() {
      if (!this.classList.contains('active')) {
        this.style.transform = 'scale(1.02)';
        this.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.3)';
      }
    });
    
    card.addEventListener('mouseleave', function() {
      if (!this.classList.contains('active')) {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = 'none';
      }
    });
  }
  
  // Activer la première carte de waveform par défaut (Sine)
  if (waveformCards.length > 0) {
    waveformCards[0].classList.add('active');
    waveformCards[0].style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.5)';
    waveformCards[0].style.borderColor = 'var(--neon-cyan)';
    currentType = 'waveform';
    currentSelection = 'sine';
  }
  
  // Exposer les variables pour le bouton play
  window.fondamentauxState = {
    getCurrentType: () => currentType,
    getCurrentSelection: () => currentSelection
  };
  
  console.log('[Main] Waveform and noise cards setup completed');
}

/**
 * CSS à ajouter pour les cartes actives
 */
const waveformCardsCSS = `
.waveform-card {
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.waveform-card.active {
  border-color: var(--neon-cyan) !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5) !important;
  background: rgba(0, 255, 255, 0.1);
}

.waveform-card:hover {
  cursor: pointer;
}
`;

/**
 * CSS amélioré pour les cartes actives
 */
const enhancedCardsCSS = `
.waveform-card, .noise-card {
  transition: all 0.2s ease;
  border: 2px solid transparent;
  position: relative;
}

.waveform-card.active, .noise-card.active {
  border-color: var(--neon-cyan) !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.5) !important;
  background: rgba(0, 255, 255, 0.1);
}

.waveform-card.active::before, .noise-card.active::before {
  content: "ACTIF";
  position: absolute;
  top: 5px;
  right: 5px;
  background: var(--neon-cyan);
  color: #000;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
}

.waveform-card:hover, .noise-card:hover {
  cursor: pointer;
}
`;

// Appliquer le CSS amélioré
if (!document.getElementById('enhanced-cards-css')) {
  const style = document.createElement('style');
  style.id = 'enhanced-cards-css';
  style.textContent = enhancedCardsCSS;
  document.head.appendChild(style);
}

// Ajouter le CSS
const style = document.createElement('style');
style.textContent = waveformCardsCSS;
document.head.appendChild(style);

/**
 * Setup du piano roll TB-303
 */
function setupTB303PianoRoll() {
  const stepCells = document.querySelectorAll('.step-cell');
  
  stepCells.forEach(cell => {
    cell.addEventListener('click', function(event) {
      const step = parseInt(this.getAttribute('data-step'));
      const noteRow = this.closest('.note-row');
      const note = noteRow ? noteRow.getAttribute('data-note') : null;
      
      if (step !== null && note && window.tb303Utils) {
        window.tb303Utils.handleCellClick(step, note, event);
        updateTB303CellVisual(this, step);
      }
    });
  });
}

/**
 * Met à jour l'affichage visuel d'une cellule TB-303
 */
function updateTB303CellVisual(cell, step) {
  if (!window.tb303Synth) return;
  
  const sequence = window.tb303Synth.sequence;
  const accents = window.tb303Synth.accents;
  const slides = window.tb303Synth.slides;
  
  // Reset classes
  cell.classList.remove('note', 'accent', 'slide');
  
  // Ajouter les classes selon l'état
  if (sequence[step]) {
    cell.classList.add('note');
  }
  if (accents.has(step)) {
    cell.classList.add('accent');
  }
  if (slides.has(step)) {
    cell.classList.add('slide');
  }
}

/**
 * Efface l'UI TB-303
 */
function clearTB303UI() {
  const stepCells = document.querySelectorAll('.step-cell');
  stepCells.forEach(cell => {
    cell.classList.remove('note', 'accent', 'slide');
  });
}

/**
 * Met à jour l'UI TB-303 depuis la séquence
 */
function updateTB303UIFromSequence() {
  if (!window.tb303Synth) return;
  
  const stepCells = document.querySelectorAll('.step-cell');
  stepCells.forEach((cell, index) => {
    updateTB303CellVisual(cell, index);
  });
}

/**
 * Configure les boutons toggle (formes d'ondes, etc.) - VERSION AMÉLIORÉE
 */
function setupToggleButtons() {
  const buttonGroups = [
    { selector: '.wave-btn', handler: handleWaveformToggle },
    { selector: '.note-btn', handler: handleNoteToggle },
    { selector: '.filter-btn', handler: handleFilterToggle },
    { selector: '.source-btn', handler: handleSourceToggle },
    { selector: '.mod-type-btn', handler: handleModTypeToggle },
    { selector: '.lfo-wave-btn', handler: handleLFOWaveToggle },
    { selector: '.osc1-wave-btn', handler: handleOsc1WaveToggle },
    { selector: '.osc2-wave-btn', handler: handleOsc2WaveToggle },
    { selector: '.tb-wave-btn', handler: handleTBWaveToggle },
    { selector: '.preset-btn', handler: handlePresetToggle },
    { selector: '.add-preset-btn', handler: handleAdditivePresetToggle },
    { selector: '.pattern-btn', handler: handlePatternToggle },
    { selector: '.wavetable-card', handler: handleWavetableToggle }
  ];
  
  buttonGroups.forEach(({ selector, handler }) => {
    const buttons = document.querySelectorAll(selector);
    
    buttons.forEach(button => {
      button.addEventListener('click', function() {
        // Désactiver les autres boutons du même groupe dans le même onglet
        const currentTab = this.closest('.tab-content');
        if (currentTab) {
          currentTab.querySelectorAll(selector).forEach(btn => btn.classList.remove('active'));
        } else {
          buttons.forEach(btn => btn.classList.remove('active'));
        }
        
        // Activer le bouton cliqué
        this.classList.add('active');
        
        // Appeler le handler spécifique
        if (handler) {
          handler(this);
        }
      });
    });
  });
}

// Handlers spécifiques pour chaque type de toggle
function handleWaveformToggle(button) {
  const waveform = button.getAttribute('data-wave');
  const currentTab = window.appState?.currentTab || 'fondamentaux';
  
  // Ajouter la gestion pour l'onglet fondamentaux
  if ((currentTab === 'oscillateurs' || currentTab === 'fondamentaux') && window.basicSynth) {
    window.basicSynth.updateWaveform(waveform);
    
    // Show/hide pulse width control (seulement pour oscillateurs)
    if (currentTab === 'oscillateurs') {
      const pulseControl = document.getElementById('pulse-width-control');
      if (pulseControl) {
        pulseControl.style.display = waveform === 'pulse' ? 'flex' : 'none';
      }
    }
  } else if (currentTab === 'modulation' && window.modulatedSynth) {
    window.modulatedSynth.updateCarrierWaveform(waveform);
  }
  
  console.log(`[Main] Waveform updated: ${waveform} for tab: ${currentTab}`);
}


function handleNoteToggle(button) {
  const note = button.getAttribute('data-note');
  const currentTab = window.appState?.currentTab || 'fondamentaux';
  
  if (currentTab === 'oscillateurs') {
    const frequency = window.audioManager?.noteToFrequency(note);
    if (frequency) {
      // Update frequency slider
      const freqSlider = document.getElementById('osc-freq');
      if (freqSlider) {
        freqSlider.value = frequency;
        updateSliderValue(freqSlider, document.getElementById('osc-freq-value'));
      }
      
      // Update synth
      if (window.basicSynth) {
        window.basicSynth.updateFrequency(frequency);
      }
    }
  }
  
  console.log(`[Main] Note selected: ${note}`);
}

function handleFilterToggle(button) {
  const filterType = button.getAttribute('data-type');
  
  if (window.filteredSynth) {
    window.filteredSynth.updateFilterType(filterType);
  }
  
  console.log(`[Main] Filter type: ${filterType}`);
}

function handleSourceToggle(button) {
  const source = button.getAttribute('data-source');
  
  if (window.filteredSynth) {
    if (source.includes('noise')) {
      window.filteredSynth.updateSourceType('noise');
      window.filteredSynth.updateNoiseType(source.replace('noise', ''));
    } else {
      window.filteredSynth.updateSourceType('oscillator');
      window.filteredSynth.updateWaveform(source);
    }
  }
  
  console.log(`[Main] Source type: ${source}`);
}

function handleModTypeToggle(button) {
  const modType = button.getAttribute('data-type');
  
  if (window.modulatedSynth) {
    window.modulatedSynth.updateModulationType(modType);
  }
  
  console.log(`[Main] Modulation type: ${modType}`);
}

function handleLFOWaveToggle(button) {
  const waveform = button.getAttribute('data-wave');
  
  if (window.modulatedSynth) {
    window.modulatedSynth.updateLFOWaveform(waveform);
  }
  
  console.log(`[Main] LFO waveform: ${waveform}`);
}

function handleOsc1WaveToggle(button) {
  const waveform = button.getAttribute('data-wave');
  
  if (window.subtractiveSynth) {
    window.subtractiveSynth.updateVCO1({ waveform: waveform });
  }
  
  console.log(`[Main] VCO1 waveform: ${waveform}`);
}

function handleOsc2WaveToggle(button) {
  const waveform = button.getAttribute('data-wave');
  
  if (window.subtractiveSynth) {
    window.subtractiveSynth.updateVCO2({ waveform: waveform });
  }
  
  console.log(`[Main] VCO2 waveform: ${waveform}`);
}

function handleTBWaveToggle(button) {
  const waveform = button.getAttribute('data-wave');
  
  if (window.tb303Synth) {
    window.tb303Synth.updateConfig({ vco: { waveform: waveform } });
  }
  
  console.log(`[Main] TB-303 waveform: ${waveform}`);
}

function handlePresetToggle(button) {
  const preset = button.getAttribute('data-preset');
  const currentTab = window.appState?.currentTab || '';
  
  if (currentTab === 'soustractive' && window.subtractiveSynth) {
    window.subtractiveSynth.loadPreset(preset);
    updateSubtractiveUIFromConfig();
  } else if (currentTab === 'fm' && window.fmSynth) {
    window.fmSynth.loadPreset(preset);
    updateFMUIFromConfig();
  }
  
  console.log(`[Main] Preset loaded: ${preset}`);
}

function handleAdditivePresetToggle(button) {
  const preset = button.getAttribute('data-preset');
  
  if (window.additiveSynth) {
    window.additiveSynth.loadPreset(preset);
    updateAdditiveUIFromConfig();
  }
  
  console.log(`[Main] Additive preset loaded: ${preset}`);
}

function handlePatternToggle(button) {
  const pattern = button.getAttribute('data-pattern');
  
  if (window.tb303Synth) {
    window.tb303Synth.loadPattern(pattern);
    updateTB303UIFromSequence();
  }
  
  console.log(`[Main] TB-303 pattern loaded: ${pattern}`);
}

function handleWavetableToggle(button) {
  const wavetable = button.getAttribute('data-wavetable');
  
  if (window.wavetableSynth) {
    window.wavetableSynth.setWavetable(wavetable);
  }
  
  console.log(`[Main] Wavetable selected: ${wavetable}`);
}

/**
 * Gestion améliorée des boutons play/stop
 */
function setupPlayStopButtons() {
  // Play buttons pour tous les onglets
  const playButtons = [
    { id: 'fond-play', handler: playFondamentauxTest },
    { id: 'osc-play', handler: playOscillateursTest },
    { id: 'mod-play', handler: playModulationTest },
    { id: 'filter-play', handler: playFilterTest },
    { id: 'sub-play', handler: playSubtractiveTest },
    { id: 'add-play', handler: playAdditiveTest },
    { id: 'wav-play', handler: playWavetableTest },
    { id: 'gran-play', handler: playGranularTest },
    { id: 'gendy-play', handler: playGendyTest },
    { id: 'chaos-play', handler: playChaosTest },
        { id: 'tb-play-note', handler: playTB303NoteTest },
    { id: 'moog-play', handler: playMoogTest },
    { id: 'arp-play', handler: playArpTest }
  ];
  
  playButtons.forEach(({ id, handler }) => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', handler);
    }
  });
  
  // Stop buttons pour tous les onglets
  const stopButtons = [
    'fond-stop', 'osc-stop', 'mod-stop', 'filter-stop', 'sub-stop', 
    'add-stop', 'wav-stop', 'gran-stop', 'gendy-stop', 'chaos-stop',
    'moog-stop', 'arp-stop'
  ];
  
  stopButtons.forEach(id => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', handleStopButton);
    }
  });
}

function handleStopButton() {
  // Arrêter tous les synthés
  if (window.audioManager) {
    window.audioManager.stopAll();
  }
  
  const synths = [
    window.basicSynth,
    window.modulatedSynth,
    window.filteredSynth,
    window.subtractiveSynth,
    window.fmSynth,
    window.additiveSynth,
    window.wavetableSynth,
    window.tb303Synth,
    window.advancedSynth
  ];
  
  synths.forEach(synth => {
    if (synth && typeof synth.stopNote === 'function') {
      synth.stopNote();
    }
  });
}

function playFondamentauxTest() {
  const freq = parseFloat(document.getElementById('fond-freq')?.value || 440);
  const amp = parseFloat(document.getElementById('fond-amp')?.value || 50) / 100;
  
  if (!window.basicSynth) return;
  
  // Vérifier le type sélectionné
  const state = window.fondamentauxState;
  
  if (state && state.getCurrentType() === 'noise') {
    // Jouer du bruit
    const noiseType = state.getCurrentSelection();
    console.log(`[Main] Playing ${noiseType} noise`);
    window.basicSynth.playNoise(noiseType, 2);
  } else {
    // Jouer une forme d'onde normale
    const waveform = state ? state.getCurrentSelection() : 'sine';
    window.basicSynth.updateWaveform(waveform);
    window.basicSynth.updateFrequency(freq);
    window.basicSynth.updateAmplitude(amp);
    window.basicSynth.playNote(freq, 2);
  }
}


function playOscillateursTest() {
  const freq = parseFloat(document.getElementById('osc-freq')?.value || 440);
  const waveform = document.querySelector('#tab-oscillateurs .wave-btn.active')?.getAttribute('data-wave') || 'sine';
  
  if (window.basicSynth) {
    window.basicSynth.updateFrequency(freq);
    window.basicSynth.updateWaveform(waveform);
    window.basicSynth.playNote(freq, 2);
  }
}

function playModulationTest() {
  if (!window.audioManager || !window.audioManager.isReady()) {
    console.warn('[Main] Audio not ready for modulation');
    return;
  }
  
  const freq = parseFloat(document.getElementById('mod-carrier-freq')?.value || 440);
  const note = window.audioManager?.frequencyToNote(freq) || 'A4';
  
  if (window.modulatedSynth) {
    window.modulatedSynth.playNote(note, 5);
  }
}


function playTB303NoteTest() {
  if (!window.tb303Synth) {
    console.warn('[Main] TB303Synth not available');
    return;
  }
  
  try {
    // Arrêter le séquenceur s'il tourne
    if (window.tb303Synth.isSequencerPlaying) {
      window.tb303Synth.stopSequencer();
    }
    
    // Jouer une note de test TB-303
    const testNote = 'A3'; // Note typique TB-303
    console.log('[Main] Playing TB-303 test note:', testNote);
    
    window.tb303Synth.playNote(testNote, 2); // 2 secondes
    
  } catch (error) {
    console.error('[Main] Failed to play TB-303 test note:', error);
  }
}


function playFilterTest() {
  if (!window.filteredSynth) return;
  
  const freq = parseFloat(document.getElementById('filter-source-freq')?.value || 220);
  const note = window.audioManager?.frequencyToNote(freq) || 'A3';
  
  window.filteredSynth.playNote(note, 3);
}

function playSubtractiveTest() {
  if (!window.subtractiveSynth) return;
  
  const baseNote = document.getElementById('sub-osc1-note')?.value || 'A4';
  window.subtractiveSynth.playNote(baseNote, 3);
}

function playAdditiveTest() {
  if (!window.additiveSynth) return;
  
  const freq = parseFloat(document.getElementById('add-base-freq')?.value || 220);
  const note = window.audioManager?.frequencyToNote(freq) || 'A3';
  
  window.additiveSynth.playNote(note, 3);
}

function playWavetableTest() {
  if (!window.wavetableSynth) return;
  
  const freq = parseFloat(document.getElementById('wav-frequency')?.value || 220);
  const note = window.audioManager?.frequencyToNote(freq) || 'A3';
  
  window.wavetableSynth.playNote(note, 3);
}

function playGranularTest() {
  if (!window.advancedSynth) return;
  
  window.advancedSynth.switchEngine('granular');
  const note = document.getElementById('gran-note')?.value || 'A4';
  window.advancedSynth.playNote(note, 5);
}

function playGendyTest() {
  if (!window.advancedSynth) return;
  
  window.advancedSynth.switchEngine('gendy');
  const freq = parseFloat(document.getElementById('gendy-freq')?.value || 220);
  const note = window.audioManager?.frequencyToNote(freq) || 'A3';
  window.advancedSynth.playNote(note, 5);
}

function playChaosTest() {
  if (!window.advancedSynth) return;
  
  window.advancedSynth.switchEngine('chaos');
  window.advancedSynth.playNote('A4', 5);
}

function playMoogTest() {
  // Simulation Moog avec synthé soustractif
  if (!window.subtractiveSynth) return;
  
  // Charger un preset Moog-like
  window.subtractiveSynth.loadPreset('classic-lead');
  window.subtractiveSynth.playNote('A4', 3);
}

function playArpTest() {
  // Simulation ARP avec effets spéciaux
  if (!window.subtractiveSynth) return;
  
  window.subtractiveSynth.loadPreset('fat-bass');
  window.subtractiveSynth.playNote('A3', 3);
}

/**
 * Fonctions de mise à jour UI depuis les configurations
 */
function updateSubtractiveUIFromConfig() {
  if (!window.subtractiveSynth) return;
  
  const config = window.subtractiveSynth.getConfig();
  
  // Mettre à jour les sliders VCO1
  updateSliderFromConfig('sub-osc1-detune', config.vco1.detune);
  updateSliderFromConfig('sub-osc1-level', config.vco1.level * 100);
  
  // Mettre à jour les sliders VCO2
  updateSliderFromConfig('sub-osc2-detune', config.vco2.detune);
  updateSliderFromConfig('sub-osc2-level', config.vco2.level * 100);
  
  // Mettre à jour les sliders de filtre
  updateSliderFromConfig('sub-filter-cutoff', config.filter.cutoff);
  updateSliderFromConfig('sub-filter-resonance', config.filter.resonance);
  updateSliderFromConfig('sub-filter-env-amount', config.filter.envAmount);
  
  // Mettre à jour les enveloppes
  updateSliderFromConfig('sub-filter-attack', config.filterEnvelope.attack);
  updateSliderFromConfig('sub-filter-decay', config.filterEnvelope.decay);
  updateSliderFromConfig('sub-filter-sustain', config.filterEnvelope.sustain * 100);
  updateSliderFromConfig('sub-filter-release', config.filterEnvelope.release);
  
  updateSliderFromConfig('sub-amp-attack', config.amplitudeEnvelope.attack);
  updateSliderFromConfig('sub-amp-decay', config.amplitudeEnvelope.decay);
  updateSliderFromConfig('sub-amp-sustain', config.amplitudeEnvelope.sustain * 100);
  updateSliderFromConfig('sub-amp-release', config.amplitudeEnvelope.release);
}

function updateFMUIFromConfig() {
  if (!window.fmSynth) return;
  
  const config = window.fmSynth.getConfig();
  
  updateSliderFromConfig('fm-carrier-freq', config.carrier.frequency);
  updateSliderFromConfig('fm-index', config.modulator.index);
  updateSliderFromConfig('fm-mod-attack', config.modulatorEnvelope.attack);
  updateSliderFromConfig('fm-mod-decay', config.modulatorEnvelope.decay);
  updateSliderFromConfig('fm-mod-sustain', config.modulatorEnvelope.sustain * 100);
  
  // Mettre à jour le sélecteur de ratio
  const ratioSelect = document.getElementById('fm-ratio');
  if (ratioSelect) {
    ratioSelect.value = config.modulator.ratio;
  }
}

function updateAdditiveUIFromConfig() {
  if (!window.additiveSynth) return;
  
  const config = window.additiveSynth.getConfig();
  
  // Mettre à jour les harmoniques
  config.harmonics.forEach((harmonic, index) => {
    updateSliderFromConfig(`add-h${index + 1}`, harmonic.amplitude * 100);
  });
  
  updateSliderFromConfig('add-base-freq', config.fundamentalFrequency);
  updateSliderFromConfig('add-volume', config.masterVolume * 100);
}

function updateSliderFromConfig(sliderId, value) {
  const slider = document.getElementById(sliderId);
  const valueDisplay = document.getElementById(sliderId + '-value');
  
  if (slider) {
    slider.value = value;
    if (valueDisplay) {
      updateSliderValue(slider, valueDisplay);
    }
  }
}

/**
 * Mise à jour de la visualisation ADSR
 */
function updateADSRVisualization() {
  const attack = parseFloat(document.getElementById('env-attack')?.value || 0.1);
  const decay = parseFloat(document.getElementById('env-decay')?.value || 0.3);
  const sustain = parseFloat(document.getElementById('env-sustain')?.value || 70) / 100;
  const release = parseFloat(document.getElementById('env-release')?.value || 0.5);
  
  if (window.visualUtils) {
    window.visualUtils.updateADSRDisplay('adsr-canvas', attack, decay, sustain, release);
  }
}


/**
 * Gestion améliorée des changements d'onglet
 */
function switchToTab(tabName) {
  try {
    // Arrêter tout audio en cours AVANT le changement d'onglet
    if (window.audioManager) {
      window.audioManager.stopAll();
    }
    
    // Arrêter tous les synthés individuellement
    const synths = [
      window.basicSynth,
      window.modulatedSynth,
      window.filteredSynth,
      window.subtractiveSynth,
      window.fmSynth,
      window.additiveSynth,
      window.wavetableSynth,
      window.tb303Synth,
      window.advancedSynth
    ];
    
    synths.forEach(synth => {
      if (synth && typeof synth.stopNote === 'function') {
        synth.stopNote();
      }
    });
    
    // Désactiver tous les boutons et contenus
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    // Activer le bouton et contenu sélectionnés
    const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
    const targetContent = document.getElementById(`tab-${tabName}`);
    
    if (targetButton && targetContent) {
      targetButton.classList.add('active');
      targetContent.classList.add('active');
      
      window.appState.currentTab = tabName;
      
      // Initialiser les paramètres par défaut pour l'onglet
      initializeTabDefaults(tabName);
      
      console.log(`[Main] Switched to tab: ${tabName}`);
      return true;
    } else {
      console.warn(`[Main] Tab ${tabName} not found`);
      return false;
    }
    
  } catch (error) {
    console.error(`[Main] Failed to switch to tab ${tabName}:`, error);
    return false;
  }
}

/**
 * Initialise les paramètres par défaut pour chaque onglet
 */
function initializeTabDefaults(tabName) {
  switch (tabName) {
case 'fondamentaux':
  if (window.basicSynth) {
    window.basicSynth.updateWaveform('sine');
    window.basicSynth.updateFrequency(440);
    window.basicSynth.updateAmplitude(0.5);
  }
  // Activer la première carte de forme d'onde
  const firstCard = document.querySelector('#tab-fondamentaux .waveform-card');
  if (firstCard) {
    firstCard.classList.add('active');
  }
  break;
      
    case 'oscillateurs':
      if (window.basicSynth) {
        window.basicSynth.updateWaveform('sine');
        window.basicSynth.updateFrequency(440);
      }
      break;
      
    case 'modulation':
      if (window.modulatedSynth) {
        window.modulatedSynth.updateCarrierWaveform('sine');
        window.modulatedSynth.updateCarrierFrequency(440);
        window.modulatedSynth.updateLFORate(2);
        window.modulatedSynth.updateLFODepth(10);
        window.modulatedSynth.updateModulationType('frequency');
      }
      break;
      
    case 'filtres':
      if (window.filteredSynth) {
        window.filteredSynth.updateFilterType('lowpass');
        window.filteredSynth.updateCutoffFrequency(1200);
        window.filteredSynth.updateResonance(1);
        window.filteredSynth.updateSourceType('oscillator');
        window.filteredSynth.updateWaveform('sawtooth');
      }
      break;
      
    case 'soustractive':
      if (window.subtractiveSynth) {
        // Les valeurs par défaut sont déjà dans la classe
      }
      break;
      
    case 'fm':
      if (window.fmSynth) {
        window.fmSynth.updateRatio(1);
        window.fmSynth.updateIndex(5);
      }
      break;
      
    case 'additive':
      if (window.additiveSynth) {
        // Charger un preset par défaut
        window.additiveSynth.loadPreset('sawtooth');
      }
      break;
      
    case 'wavetables':
      if (window.wavetableSynth) {
        window.wavetableSynth.setWavetable('basic');
        window.wavetableSynth.updatePosition(0);
      }
      break;
      
    case 'tb303':
      if (window.tb303Synth) {
        // Charger un pattern par défaut
        window.tb303Synth.loadPattern('classic1');
        updateTB303UIFromSequence();
      }
      break;
      
    case 'avancees':
      if (window.advancedSynth) {
        window.advancedSynth.switchEngine('granular');
      }
      break;
  }
  
  console.log(`[Main] Initialized defaults for tab: ${tabName}`);
}

/**
 * Joue une note selon l'onglet actuel - VERSION AMÉLIORÉE
 */
function playNoteForCurrentTab(note) {
  if (!window.audioManager || !window.audioManager.isReady()) {
    return;
  }
  
  try {
    switch (window.appState.currentTab) {
      case 'fondamentaux':
      case 'oscillateurs':
        if (window.basicSynth) {
          window.basicSynth.playNote(note, 1);
        }
        break;
        
      case 'modulation':
        if (window.modulatedSynth) {
          window.modulatedSynth.playNote(note, 1);
        }
        break;
        
      case 'filtres':
        if (window.filteredSynth) {
          window.filteredSynth.playNote(note, 1);
        }
        break;
        
      case 'enveloppes':
        playEnvelopeNote(note);
        break;
        
      case 'soustractive':
        if (window.subtractiveSynth) {
          window.subtractiveSynth.triggerAttack(note);
        }
        break;
        
      case 'fm':
        if (window.fmSynth) {
          window.fmSynth.triggerAttack(note);
        }
        break;
        
      case 'additive':
        if (window.additiveSynth) {
          window.additiveSynth.playNote(note, 1);
        }
        break;
        
      case 'wavetables':
        if (window.wavetableSynth) {
          window.wavetableSynth.playNote(note, 1);
        }
        break;
        
      case 'tb303':
        if (window.tb303Synth) {
          window.tb303Synth.playNote(note, 1);
        }
        break;
        
      case 'avancees':
        if (window.advancedSynth) {
          window.advancedSynth.playNote(note, 1);
        }
        break;
        
      default:
        playBasicNote(note);
    }
    
  } catch (error) {
    console.error(`[Main] Failed to play note ${note}:`, error);
  }
}

/**
 * Arrête une note selon l'onglet actuel - VERSION AMÉLIORÉE
 */
function stopNoteForCurrentTab(note) {
  if (!window.audioManager) {
    return;
  }
  
  try {
    switch (window.appState.currentTab) {
      case 'fondamentaux':
      case 'oscillateurs':
        if (window.basicSynth) {
          window.basicSynth.stopNote();
        }
        break;
        
      case 'modulation':
        if (window.modulatedSynth) {
          window.modulatedSynth.stopNote();
        }
        break;
        
      case 'filtres':
        if (window.filteredSynth) {
          window.filteredSynth.stopNote();
        }
        break;
        
      case 'soustractive':
        if (window.subtractiveSynth) {
          window.subtractiveSynth.triggerRelease();
        }
        break;
        
      case 'fm':
        if (window.fmSynth) {
          window.fmSynth.triggerRelease();
        }
        break;
        
      case 'additive':
        if (window.additiveSynth) {
          window.additiveSynth.triggerRelease();
        }
        break;
        
      case 'wavetables':
        if (window.wavetableSynth) {
          window.wavetableSynth.triggerRelease();
        }
        break;
        
      case 'tb303':
        if (window.tb303Synth) {
          window.tb303Synth.stopNote();
        }
        break;
        
      case 'avancees':
        if (window.advancedSynth) {
          window.advancedSynth.stopNote();
        }
        break;
        
      default:
        if (window.audioManager) {
          window.audioManager.stopAll();
        }
    }
    
  } catch (error) {
    console.error(`[Main] Failed to stop note ${note}:`, error);
  }
}

/**
 * Configure les claviers virtuels
 */
function setupVirtualKeyboards() {
  const keyboards = document.querySelectorAll('.virtual-keyboard');
  
  keyboards.forEach(keyboard => {
    const keys = keyboard.querySelectorAll('.key');
    
    keys.forEach(key => {
      // Mouse events
      key.addEventListener('mousedown', function(e) {
        e.preventDefault();
        handleKeyPress(this);
      });
      
      key.addEventListener('mouseup', function(e) {
        e.preventDefault();
        handleKeyRelease(this);
      });
      
      key.addEventListener('mouseleave', function(e) {
        handleKeyRelease(this);
      });
      
      // Touch events pour mobile
      key.addEventListener('touchstart', function(e) {
        e.preventDefault();
        handleKeyPress(this);
      });
      
      key.addEventListener('touchend', function(e) {
        e.preventDefault();
        handleKeyRelease(this);
      });
    });
  });
  
  console.log('[Main] Virtual keyboards setup completed');
}

/**
 * Gère l'appui sur une touche du clavier virtuel
 */
function handleKeyPress(keyElement) {
  const note = keyElement.getAttribute('data-note');
  
  if (!note || window.appState.activeNotes.has(note)) {
    return;
  }
  
  keyElement.classList.add('active');
  window.appState.activeNotes.add(note);
  
  // Déclencher la note audio selon l'onglet actif
  playNoteForCurrentTab(note);
  
  console.log(`[Main] Key pressed: ${note}`);
}

/**
 * Gère le relâchement d'une touche du clavier virtuel
 */
function handleKeyRelease(keyElement) {
  const note = keyElement.getAttribute('data-note');
  
  if (!note) {
    return;
  }
  
  keyElement.classList.remove('active');
  window.appState.activeNotes.delete(note);
  
  // Arrêter la note audio selon l'onglet actif
  stopNoteForCurrentTab(note);
  
  console.log(`[Main] Key released: ${note}`);
}

/**
 * Joue une note basique (oscillateur simple)
 */
function playBasicNote(note) {
  const freq = window.audioManager.noteToFrequency(note);
  const osc = window.audioManager.createOscillator('sine', freq);
  
  if (osc) {
    osc.connect(window.audioManager.masterGain);
    osc.start();
    
    // Arrêter automatiquement après 1 seconde
    setTimeout(() => {
      if (osc && !osc.disposed) {
        osc.stop();
        osc.dispose();
      }
    }, 1000);
  }
}

/**
 * Joue une note avec enveloppe
 */
function playEnvelopeNote(note) {
  const freq = window.audioManager.noteToFrequency(note);
  const osc = window.audioManager.createOscillator('sawtooth', freq);
  const env = window.audioManager.createEnvelope(0.1, 0.3, 0.7, 0.5);
  
  if (osc && env) {
    osc.connect(env);
    env.connect(window.audioManager.masterGain);
    
    osc.start();
    env.triggerAttack();
    
    window.appState.currentSynth = { osc, env };
  }
}

/**
 * Configure l'overlay d'initialisation audio
 */
function setupAudioInitOverlay() {
  const overlay = document.getElementById('audio-init-overlay');
  const initButton = document.getElementById('init-audio-btn');
  
  if (!overlay || !initButton) {
    console.error('[Main] Audio init overlay elements not found');
    return;
  }
  
  initButton.addEventListener('click', async function() {
    this.textContent = 'Initialisation...';
    this.disabled = true;
    
    try {
      const success = await window.audioManager.initialize();
      
      if (success) {
        // Masquer l'overlay avec animation
        overlay.classList.add('hidden');
        
        // Démarrer les visualisations
        if (window.waveformRenderer) {
          window.waveformRenderer.startAnimation();
        }
        
        console.log('[Main] Audio initialized successfully');
        
        // Supprimer l'overlay du DOM après l'animation
        setTimeout(() => {
          overlay.remove();
        }, 500);
        
      } else {
        throw new Error('Audio initialization failed');
      }
      
    } catch (error) {
      console.error('[Main] Audio initialization error:', error);
      this.textContent = 'Erreur - Réessayer';
      this.disabled = false;
      showErrorMessage('Impossible d\'initialiser l\'audio. Vérifiez vos permissions.');
    }
  });
}

/**
 * Configure les événements globaux
 */
function setupGlobalEvents() {
  // Gestion du redimensionnement
  window.addEventListener('resize', debounce(() => {
    if (window.waveformRenderer) {
      window.waveformRenderer.resizeAllCanvases();
    }
  }, 250));
  
  // Gestion de la visibilité de la page
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      // Arrêter l'audio quand la page n'est pas visible
      if (window.audioManager) {
        window.audioManager.stopAll();
      }
    }
  });
  
  // Raccourcis clavier
  document.addEventListener('keydown', handleGlobalKeydown);
  document.addEventListener('keyup', handleGlobalKeyup);
  
  console.log('[Main] Global events setup completed');
}

/**
 * Configure l'interface responsive
 */
function setupResponsiveUI() {
  // Gestion du menu mobile si nécessaire
  const tabNavigation = document.querySelector('.tab-navigation');
  
  if (window.innerWidth <= 768) {
    tabNavigation?.classList.add('mobile');
  }
  
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
      tabNavigation?.classList.add('mobile');
    } else {
      tabNavigation?.classList.remove('mobile');
    }
  });
}

/**
 * Gestion des touches du clavier physique
 */
function handleGlobalKeydown(event) {
  // Mapping clavier QWERTY vers notes
  const keyToNote = {
    'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4',
    'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4',
    'u': 'A#4', 'j': 'B4'
  };
  
  const note = keyToNote[event.key.toLowerCase()];
  
  if (note && !event.repeat) {
    // Simuler l'appui sur la touche virtuelle
    const keyElement = document.querySelector(`[data-note="${note}"]`);
    if (keyElement) {
      handleKeyPress(keyElement);
    }
  }
  
  // Raccourcis globaux
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case ' ':
        event.preventDefault();
        togglePlayback();
        break;
    }
  }
}

/**
 * Gestion du relâchement des touches du clavier physique
 */
function handleGlobalKeyup(event) {
  const keyToNote = {
    'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4',
    'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4',
    'u': 'A#4', 'j': 'B4'
  };
  
  const note = keyToNote[event.key.toLowerCase()];
  
  if (note) {
    const keyElement = document.querySelector(`[data-note="${note}"]`);
    if (keyElement) {
      handleKeyRelease(keyElement);
    }
  }
}

/**
 * Toggle lecture/pause global
 */
function togglePlayback() {
  if (window.appState.isPlaying) {
    if (window.audioManager) {
      window.audioManager.stopAll();
    }
    window.appState.isPlaying = false;
  } else {
    // Démarrer la lecture selon l'onglet actuel
    startPlaybackForCurrentTab();
    window.appState.isPlaying = true;
  }
}

/**
 * Démarre la lecture selon l'onglet actuel
 */
function startPlaybackForCurrentTab() {
  switch (window.appState.currentTab) {
    case 'tb303':
      // Démarrer le séquenceur TB-303
      if (window.tb303Synth) {
        window.tb303Synth.startSequencer();
      }
      break;
      
    default:
      // Jouer une note de test
      playBasicNote('A4');
  }
}

/**
 * Boucle d'animation pour les visualisations
 */
function startVisualizationLoop() {
  function updateVisualizations() {
    if (!window.waveformRenderer) {
      requestAnimationFrame(updateVisualizations);
      return;
    }
    
    try {
      const currentTab = window.appState?.currentTab;
      
      switch (currentTab) {
        case 'fondamentaux':
          // Mettre à jour les visualisations des fondamentaux
          if (window.basicSynth?.isPlaying) {
            window.waveformRenderer.drawSpectrum('spectrum-canvas');
          }
          break;
          
        case 'modulation':
          // Mettre à jour les visualisations de modulation
          if (document.getElementById('mod-canvas')) {
            window.waveformRenderer.drawSpectrum('mod-canvas');
          }
          break;
          
        case 'filtres':
          // Mettre à jour les visualisations de filtres
          if (window.filteredSynth?.isPlaying) {
            window.waveformRenderer.drawSpectrum('filter-spectrum-canvas');
          }
          break;
          
        case 'tb303':
          // Mettre à jour les visualisations TB-303
          if (window.tb303Synth?.isCurrentlyPlaying()) {
            window.waveformRenderer.drawSpectrum('tb303-waveform-canvas');
            
            const config = window.tb303Synth.getConfig();
            window.waveformRenderer.drawFilterResponse(
              'tb303-filter-canvas',
              config.filter.cutoff,
              config.filter.resonance / 15,
              'lowpass'
            );
          }
          break;
      }
      
    } catch (error) {
      console.warn('[Main] Visualization update error:', error);
    }
    
    requestAnimationFrame(updateVisualizations);
  }
  
  // Démarrer la boucle
  updateVisualizations();
  console.log('[Main] Visualization loop started');
}

/**
 * Utilitaire debounce pour optimiser les events
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Affiche un message d'erreur à l'utilisateur
 */
function showErrorMessage(message) {
  // Créer un toast d'erreur temporaire
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-toast';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff3333;
    color: white;
    padding: 1rem;
    border-radius: 5px;
    z-index: 10000;
    font-family: 'Courier New', monospace;
    max-width: 300px;
    box-shadow: 0 0 20px rgba(255, 51, 51, 0.5);
  `;
  
  document.body.appendChild(errorDiv);
  
  // Supprimer après 5 secondes
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

//////



/**
 * Gestion des erreurs globales
 */
window.addEventListener('error', function(event) {
  console.error('[Main] Global error:', event.error);
  
  // Ne pas afficher d'erreur pour les erreurs de script externe
  if (event.filename && !event.filename.includes(window.location.origin)) {
    return;
  }
  
  showErrorMessage('Une erreur inattendue s\'est produite');
});

/**
 * Gestion des promesses rejetées
 */
window.addEventListener('unhandledrejection', function(event) {
  console.error('[Main] Unhandled promise rejection:', event.reason);
  
  // Empêcher l'affichage de l'erreur dans la console par défaut
  event.preventDefault();
  
  showErrorMessage('Erreur de traitement audio');
});

/**
 * Nettoyage avant fermeture de la page
 */
window.addEventListener('beforeunload', function() {
  console.log('[Main] Cleaning up before page unload...');
  
  try {
    // Arrêter tout l'audio
    if (window.audioManager) {
      window.audioManager.cleanup();
    }
    
    // Arrêter les animations
    if (window.waveformRenderer) {
      window.waveformRenderer.cleanup();
    }
    
  } catch (error) {
    console.error('[Main] Cleanup error:', error);
  }
});

// Expose des fonctions utiles globalement pour debug
window.debugUtils = {
  getAppState: () => window.appState,
  getAudioStatus: () => window.audioManager?.getStatus(),
  switchTab: switchToTab,
  playNote: playNoteForCurrentTab,
  stopAll: () => window.audioManager?.stopAll()
};

console.log('[Main] Main.js loaded successfully');
console.log('[Main] Available debug utils:', Object.keys(window.debugUtils));