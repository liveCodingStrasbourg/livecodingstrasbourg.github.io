/**
 * UIController.js - Contrôleur centralisé de l'interface utilisateur
 * Sound Synthesis Explorer - TOPLAP Strasbourg
 */

class UIController {
  constructor() {
    this.activeElements = new Map();
    this.eventListeners = new Map();
    this.currentValues = new Map();
    
    // Configuration
    this.config = {
      updateRate: 50, // ms entre les updates
      debounceTime: 100, // ms pour debounce des curseurs
      animationDuration: 300 // ms pour les transitions
    };
    
    // Timers pour debouncing
    this.debounceTimers = new Map();
    
    this.bindMethods();
  }
  
  bindMethods() {
    this.initialize = this.initialize.bind(this);
    this.setupControls = this.setupControls.bind(this);
    this.handleControlChange = this.handleControlChange.bind(this);
    this.handleTouchInteraction = this.handleTouchInteraction.bind(this);
    this.setupTouchInteractions = this.setupTouchInteractions.bind(this);
  }

  /**
   * Gère les interactions tactiles
   */
  handleTouchInteraction(event, control) {
    try {
      // Gérer les événements tactiles pour les curseurs
      if (control.type === 'slider') {
        this.setupSliderTouchInteraction(control);
      }
    } catch (error) {
      console.error('[UIController] Touch interaction error:', error);
    }
  }
  
  /**
   * Initialise l'UIController
   */
  initialize() {
    try {
      console.log('[UIController] Initializing...');
      
      // Setup des contrôles génériques
      this.setupControls();
      
      // Setup spécifique par onglet
      this.setupTabSpecificControls();
      
      // Setup des événements globaux
      this.setupGlobalEvents();
      
      console.log('[UIController] Initialization completed');
      return true;
      
    } catch (error) {
      console.error('[UIController] Initialization failed:', error);
      return false;
    }
  }
  
  /**
   * Configure tous les contrôles
   */
  setupControls() {
    // Curseurs
    this.setupSliders();
    
    // Boutons toggle
    this.setupToggleButtons();
    
    // Sélecteurs
    this.setupSelectors();
    
    // Boutons d'action
    this.setupActionButtons();
    
    // Claviers virtuels
    this.setupKeyboards();
  }
  
  /**
   * Configure les curseurs avec debouncing
   */
  setupSliders() {
    const sliders = document.querySelectorAll('.slider');
    
    sliders.forEach(slider => {
      const sliderId = slider.id;
      const valueDisplay = document.getElementById(sliderId + '-value');
      
      // Initialiser la valeur
      this.currentValues.set(sliderId, parseFloat(slider.value));
      this.updateSliderDisplay(slider, valueDisplay);
      
      // Event listener avec debouncing
      const handleInput = (event) => {
        const value = parseFloat(event.target.value);
        this.currentValues.set(sliderId, value);
        
        // Update immédiat de l'affichage
        this.updateSliderDisplay(slider, valueDisplay);
        
        // Debounce pour l'audio
        this.debounceAudioUpdate(sliderId, value);
      };
      
      slider.addEventListener('input', handleInput);
      this.eventListeners.set(sliderId, handleInput);
      
      console.log(`[UIController] Setup slider: ${sliderId}`);
    });
  }
  
  /**
   * Met à jour l'affichage d'un curseur
   */
  updateSliderDisplay(slider, valueDisplay) {
    if (!valueDisplay) return;
    
    const value = parseFloat(slider.value);
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const step = parseFloat(slider.step) || 1;
    
    let formattedValue = this.formatSliderValue(slider.id, value, step);
    valueDisplay.textContent = formattedValue;
    
    // Mettre à jour la couleur selon la valeur
    const percentage = (value - min) / (max - min);
    valueDisplay.style.color = this.getValueColor(percentage);
  }
  
  /**
   * Formate la valeur d'un curseur selon son type
   */
  formatSliderValue(sliderId, value, step) {
    if (sliderId.includes('freq')) {
      return `${value.toFixed(1)} Hz`;
    } else if (sliderId.includes('amp') || sliderId.includes('level') || sliderId.includes('sustain') || sliderId.includes('volume')) {
      return `${Math.round(value)}%`;
    } else if (sliderId.includes('time') || sliderId.includes('attack') || sliderId.includes('decay') || sliderId.includes('release')) {
      return `${value.toFixed(2)}s`;
    } else if (sliderId.includes('detune')) {
      return `${value > 0 ? '+' : ''}${value} cents`;
    } else if (sliderId.includes('rate')) {
      return `${value.toFixed(1)} Hz`;
    } else if (sliderId.includes('depth') || sliderId.includes('mod')) {
      return Math.round(value).toString();
    } else if (sliderId.includes('resonance') || sliderId.includes('Q')) {
      return value.toFixed(1);
    } else if (step < 1) {
      return value.toFixed(2);
    } else {
      return Math.round(value).toString();
    }
  }
  
  /**
   * Obtient une couleur selon le pourcentage de valeur
   */
  getValueColor(percentage) {
    if (percentage < 0.3) {
      return '#00ff41'; // Vert néon
    } else if (percentage < 0.7) {
      return '#00ffff'; // Cyan
    } else {
      return '#ff00ff'; // Magenta
    }
  }
  
  /**
   * Debounce pour les updates audio
   */
  debounceAudioUpdate(sliderId, value) {
    // Annuler le timer précédent
    if (this.debounceTimers.has(sliderId)) {
      clearTimeout(this.debounceTimers.get(sliderId));
    }
    
    // Créer un nouveau timer
    const timer = setTimeout(() => {
      this.handleControlChange(sliderId, value);
      this.debounceTimers.delete(sliderId);
    }, this.config.debounceTime);
    
    this.debounceTimers.set(sliderId, timer);
  }
  
  /**
   * Configure les boutons toggle
   */
  setupToggleButtons() {
    const buttonGroups = [
      { selector: '.wave-btn', groupName: 'waveform' },
      { selector: '.note-btn', groupName: 'note' },
      { selector: '.filter-btn', groupName: 'filterType' },
      { selector: '.source-btn', groupName: 'source' },
      { selector: '.mod-type-btn', groupName: 'modType' },
      { selector: '.lfo-wave-btn', groupName: 'lfoWave' },
      { selector: '.osc1-wave-btn', groupName: 'osc1Wave' },
      { selector: '.osc2-wave-btn', groupName: 'osc2Wave' },
      { selector: '.tb-wave-btn', groupName: 'tbWave' }
    ];
    
    buttonGroups.forEach(group => {
      const buttons = document.querySelectorAll(group.selector);
      
      buttons.forEach(button => {
        const handleClick = () => {
          // Désactiver les autres boutons du groupe
          buttons.forEach(btn => btn.classList.remove('active'));
          
          // Activer le bouton cliqué
          button.classList.add('active');
          
          // Obtenir la valeur
          const value = button.getAttribute('data-wave') || 
                       button.getAttribute('data-note') || 
                       button.getAttribute('data-type') || 
                       button.getAttribute('data-source') ||
                       button.textContent.toLowerCase();
          
          // Déclencher le changement
          this.handleControlChange(group.groupName, value);
        };
        
        button.addEventListener('click', handleClick);
        this.eventListeners.set(`${group.groupName}-${button.textContent}`, handleClick);
      });
    });
  }
  
  /**
   * Configure les sélecteurs (select)
   */
  setupSelectors() {
    const selectors = document.querySelectorAll('select');
    
    selectors.forEach(selector => {
      const handleChange = (event) => {
        const value = event.target.value;
        this.handleControlChange(selector.id, value);
      };
      
      selector.addEventListener('change', handleChange);
      this.eventListeners.set(selector.id, handleChange);
    });
  }
  
  /**
   * Configure les boutons d'action
   */
  setupActionButtons() {
    // Boutons Play/Stop
    const playButtons = document.querySelectorAll('[id$="-play"]');
    const stopButtons = document.querySelectorAll('[id$="-stop"]');
    
    playButtons.forEach(button => {
      const handleClick = () => {
        const tabName = this.getTabFromButtonId(button.id);
        this.handlePlayButton(tabName);
      };
      
      button.addEventListener('click', handleClick);
      this.eventListeners.set(button.id, handleClick);
    });
    
    stopButtons.forEach(button => {
      const handleClick = () => {
        const tabName = this.getTabFromButtonId(button.id);
        this.handleStopButton(tabName);
      };
      
      button.addEventListener('click', handleClick);
      this.eventListeners.set(button.id, handleClick);
    });
    
    // Boutons de presets
    this.setupPresetButtons();
  }
  
  /**
   * Configure les boutons de presets
   */
  setupPresetButtons() {
    const presetButtons = document.querySelectorAll('.preset-btn, .add-preset-btn, .pattern-btn');
    
    presetButtons.forEach(button => {
      const handleClick = () => {
        const presetName = button.getAttribute('data-preset') || 
                          button.getAttribute('data-pattern') ||
                          button.textContent.toLowerCase();
        
        this.handlePresetButton(presetName, button);
      };
      
      button.addEventListener('click', handleClick);
      this.eventListeners.set(button.id || button.textContent, handleClick);
    });
  }
  
  /**
   * Configure les claviers virtuels
   */
  setupKeyboards() {
    const keyboards = document.querySelectorAll('.virtual-keyboard');
    
    keyboards.forEach(keyboard => {
      const keys = keyboard.querySelectorAll('.key');
      
      keys.forEach(key => {
        const note = key.getAttribute('data-note');
        
        if (!note) return;
        
        // Utiliser les handlers du main.js
        const handleMouseDown = (e) => {
          e.preventDefault();
          if (window.handleKeyPress) {
            window.handleKeyPress(key);
          }
        };
        
        const handleMouseUp = (e) => {
          e.preventDefault();
          if (window.handleKeyRelease) {
            window.handleKeyRelease(key);
          }
        };
        
        key.addEventListener('mousedown', handleMouseDown);
        key.addEventListener('mouseup', handleMouseUp);
        key.addEventListener('mouseleave', handleMouseUp);
        
        // Touch events
        key.addEventListener('touchstart', handleMouseDown);
        key.addEventListener('touchend', handleMouseUp);
        
        this.eventListeners.set(`key-${note}`, { handleMouseDown, handleMouseUp });
      });
    });
  }
  
  /**
   * Configure les contrôles spécifiques à chaque onglet
   */
  setupTabSpecificControls() {
    // Onglet Fondamentaux
    this.setupFondamentauxControls();
    
    // Onglet Oscillateurs
    this.setupOscillateursControls();
    
    // Onglet Modulation
    this.setupModulationControls();
    
    // Onglet Filtres
    this.setupFiltresControls();
    
    // Onglet Enveloppes
    this.setupEnveloppesControls();
    
    // Onglet TB-303
    this.setupTB303Controls();
  }
  
  /**
   * Setup contrôles onglet Fondamentaux
   */
  setupFondamentauxControls() {
    // Les curseurs sont déjà configurés par setupSliders()
    // Ajouter ici des logiques spécifiques si nécessaire
    console.log('[UIController] Fondamentaux controls setup');
  }
  
  /**
   * Setup contrôles onglet Oscillateurs
   */
  setupOscillateursControls() {
    // Gestion du pulse width visibility
    const pulseWidthControl = document.getElementById('pulse-width-control');
    const waveButtons = document.querySelectorAll('#tab-oscillateurs .wave-btn');
    
    waveButtons.forEach(button => {
      button.addEventListener('click', () => {
        const waveType = button.getAttribute('data-wave');
        if (pulseWidthControl) {
          pulseWidthControl.style.display = waveType === 'pulse' ? 'flex' : 'none';
        }
      });
    });
    
    console.log('[UIController] Oscillateurs controls setup');
  }
  
  /**
   * Setup contrôles onglet Modulation
   */
  setupModulationControls() {
    console.log('[UIController] Modulation controls setup');
  }
  
  /**
   * Setup contrôles onglet Filtres
   */
  setupFiltresControls() {
    console.log('[UIController] Filtres controls setup');
  }
  
  /**
   * Setup contrôles onglet Enveloppes
   */
  setupEnveloppesControls() {
    // Les curseurs ADSR mettront à jour la visualisation
    const adsrSliders = ['env-attack', 'env-decay', 'env-sustain', 'env-release'];
    
    adsrSliders.forEach(sliderId => {
      const slider = document.getElementById(sliderId);
      if (slider) {
        slider.addEventListener('input', () => {
          this.updateADSRVisualization();
        });
      }
    });
    
    console.log('[UIController] Enveloppes controls setup');
  }
  
  /**
   * Setup contrôles onglet TB-303
   */
  setupTB303Controls() {
    // Piano roll interaction
    const stepCells = document.querySelectorAll('.step-cell');
    
    stepCells.forEach(cell => {
      cell.addEventListener('click', (e) => {
        this.handleTB303CellClick(cell, e);
      });
    });
    
    console.log('[UIController] TB-303 controls setup');
  }
  
  /**
   * Gère le clic sur une cellule du piano roll TB-303
   */
  handleTB303CellClick(cell, event) {
    const step = cell.getAttribute('data-step');
    const noteRow = cell.closest('.note-row');
    const note = noteRow ? noteRow.getAttribute('data-note') : null;
    
    if (!step || !note) return;
    
    if (event.shiftKey) {
      // Shift + clic = toggle accent
      cell.classList.toggle('accent');
    } else if (event.altKey) {
      // Alt + clic = toggle slide
      cell.classList.toggle('slide');
    } else {
      // Clic normal = toggle note
      const hasNote = cell.classList.contains('note');
      
      if (hasNote) {
        cell.classList.remove('note');
        cell.removeAttribute('data-note');
      } else {
        cell.classList.add('note');
        cell.setAttribute('data-note', note);
      }
    }
    
    console.log(`[UIController] TB-303 cell ${step} ${note} clicked`);
  }
  
  /**
   * Met à jour la visualisation ADSR
   */
  updateADSRVisualization() {
    const attack = parseFloat(document.getElementById('env-attack')?.value || 0.1);
    const decay = parseFloat(document.getElementById('env-decay')?.value || 0.3);
    const sustain = parseFloat(document.getElementById('env-sustain')?.value || 70) / 100;
    const release = parseFloat(document.getElementById('env-release')?.value || 0.5);
    
    if (window.visualUtils) {
      window.visualUtils.updateADSRDisplay('adsr-canvas', attack, decay, sustain, release);
    }
  }
  
  /**
   * Gère les changements de contrôles
   */
  handleControlChange(controlId, value) {
    try {
      // Dispatch selon l'onglet actuel
      const currentTab = window.appState?.currentTab || 'fondamentaux';
      
      switch (currentTab) {
        case 'fondamentaux':
          this.handleFondamentauxChange(controlId, value);
          break;
          
        case 'oscillateurs':
          this.handleOscillateursChange(controlId, value);
          break;
          
        case 'modulation':
          this.handleModulationChange(controlId, value);
          break;
          
        case 'filtres':
          this.handleFiltresChange(controlId, value);
          break;
          
        case 'enveloppes':
          this.handleEnveloppesChange(controlId, value);
          break;
          
        default:
          console.log(`[UIController] Unhandled control change: ${controlId} = ${value}`);
      }
      
    } catch (error) {
      console.error(`[UIController] Failed to handle control change ${controlId}:`, error);
    }
  }
  
  /**
   * Gère les changements pour l'onglet Fondamentaux
   */
  handleFondamentauxChange(controlId, value) {
    switch (controlId) {
      case 'fond-freq':
        if (window.basicSynth) {
          window.basicSynth.updateFrequency(parseFloat(value));
        }
        // Mettre à jour la visualisation
        this.updateFondamentauxVisualization();
        break;
        
      case 'fond-amp':
        if (window.basicSynth) {
          window.basicSynth.updateAmplitude(parseFloat(value) / 100);
        }
        this.updateFondamentauxVisualization();
        break;
        
      default:
        console.log(`[UIController] Fondamentaux: ${controlId} = ${value}`);
    }
  }
  
  /**
   * Gère les changements pour l'onglet Oscillateurs
   */
  handleOscillateursChange(controlId, value) {
    switch (controlId) {
      case 'waveform':
        if (window.basicSynth) {
          window.basicSynth.updateWaveform(value);
        }
        this.updateOscillateursVisualization();
        break;
        
      case 'osc-freq':
        if (window.basicSynth) {
          window.basicSynth.updateFrequency(parseFloat(value));
        }
        this.updateOscillateursVisualization();
        break;
        
      case 'osc-detune':
        if (window.basicSynth) {
          window.basicSynth.updateDetune(parseFloat(value));
        }
        break;
        
      case 'osc-pulse-width':
        if (window.basicSynth) {
          window.basicSynth.updatePulseWidth(parseFloat(value));
        }
        this.updateOscillateursVisualization();
        break;
        
      case 'note':
        const frequency = window.audioManager?.noteToFrequency(value);
        if (frequency) {
          const freqSlider = document.getElementById('osc-freq');
          if (freqSlider) {
            freqSlider.value = frequency;
            this.updateSliderDisplay(freqSlider, document.getElementById('osc-freq-value'));
          }
          if (window.basicSynth) {
            window.basicSynth.updateFrequency(frequency);
          }
          this.updateOscillateursVisualization();
        }
        break;
        
      default:
        console.log(`[UIController] Oscillateurs: ${controlId} = ${value}`);
    }
  }
  
  /**
   * Gère les changements pour l'onglet Modulation
   */
  handleModulationChange(controlId, value) {
    console.log(`[UIController] Modulation: ${controlId} = ${value}`);
    // TODO: Implémenter la logique de modulation
  }
  
  /**
   * Gère les changements pour l'onglet Filtres
   */
  handleFiltresChange(controlId, value) {
    switch (controlId) {
      case 'filter-cutoff':
      case 'filter-resonance':
      case 'filterType':
        this.updateFiltresVisualization();
        break;
        
      default:
        console.log(`[UIController] Filtres: ${controlId} = ${value}`);
    }
  }
  
  /**
   * Gère les changements pour l'onglet Enveloppes
   */
  handleEnveloppesChange(controlId, value) {
    if (controlId.startsWith('env-')) {
      this.updateADSRVisualization();
    }
  }
  
  /**
   * Met à jour la visualisation de l'onglet Fondamentaux
   */
  updateFondamentauxVisualization() {
    const frequency = parseFloat(document.getElementById('fond-freq')?.value || 440);
    const amplitude = parseFloat(document.getElementById('fond-amp')?.value || 50) / 100;
    
    if (window.visualUtils) {
      window.visualUtils.updateWaveformDisplay('waveform-canvas', 'sine', frequency, amplitude);
      window.visualUtils.updateSpectrumDisplay('spectrum-canvas');
    }
  }
  
  /**
   * Met à jour la visualisation de l'onglet Oscillateurs
   */
  updateOscillateursVisualization() {
    const waveform = this.getActiveWaveType('#tab-oscillateurs .wave-btn');
    const frequency = parseFloat(document.getElementById('osc-freq')?.value || 440);
    const amplitude = 0.8; // Amplitude fixe pour la visualisation
    
    if (window.visualUtils) {
      window.visualUtils.updateWaveformDisplay('osc-waveform-canvas', waveform, frequency, amplitude);
    }
  }
  
  /**
   * Met à jour la visualisation de l'onglet Filtres
   */
  updateFiltresVisualization() {
    const filterType = this.getActiveWaveType('#tab-filtres .filter-btn') || 'lowpass';
    const cutoff = parseFloat(document.getElementById('filter-cutoff')?.value || 1000);
    const resonance = parseFloat(document.getElementById('filter-resonance')?.value || 1);
    
    if (window.visualUtils) {
      window.visualUtils.updateFilterDisplay('filter-response-canvas', filterType, cutoff, resonance);
    }
  }
  
  /**
   * Obtient le type d'onde actif d'un groupe de boutons
   */
  getActiveWaveType(selector) {
    const activeButton = document.querySelector(`${selector}.active`);
    if (!activeButton) return null;
    
    return activeButton.getAttribute('data-wave') || 
           activeButton.getAttribute('data-type') || 
           activeButton.textContent.toLowerCase();
  }
  
  /**
   * Gère les boutons Play
   */
  handlePlayButton(tabName) {
    try {
      switch (tabName) {
        case 'fond':
          this.playFondamentaux();
          break;
          
        case 'osc':
          this.playOscillateurs();
          break;
          
        case 'mod':
          this.playModulation();
          break;
          
        case 'filter':
          this.playFiltres();
          break;
          
        default:
          console.log(`[UIController] Play button for ${tabName}`);
      }
      
    } catch (error) {
      console.error(`[UIController] Failed to handle play button ${tabName}:`, error);
    }
  }
  
  /**
   * Gère les boutons Stop
   */
  handleStopButton(tabName) {
    try {
      // Arrêter tout l'audio
      if (window.audioManager) {
        window.audioManager.stopAll();
      }
      
      if (window.basicSynth) {
        window.basicSynth.cleanup();
      }
      
      console.log(`[UIController] Stop button for ${tabName}`);
      
    } catch (error) {
      console.error(`[UIController] Failed to handle stop button ${tabName}:`, error);
    }
  }
  
  /**
   * Lecture pour l'onglet Fondamentaux
   */
  playFondamentaux() {
    if (!window.basicSynth) return;
    
    const frequency = parseFloat(document.getElementById('fond-freq')?.value || 440);
    const amplitude = parseFloat(document.getElementById('fond-amp')?.value || 50) / 100;
    
    window.basicSynth.updateFrequency(frequency);
    window.basicSynth.updateAmplitude(amplitude);
    window.basicSynth.playNote('A4', 2); // Jouer pendant 2 secondes
  }
  
  /**
   * Lecture pour l'onglet Oscillateurs
   */
  playOscillateurs() {
    if (!window.basicSynth) return;
    
    const waveform = this.getActiveWaveType('#tab-oscillateurs .wave-btn') || 'sine';
    const frequency = parseFloat(document.getElementById('osc-freq')?.value || 440);
    const detune = parseFloat(document.getElementById('osc-detune')?.value || 0);
    
    window.basicSynth.updateWaveform(waveform);
    window.basicSynth.updateFrequency(frequency);
    window.basicSynth.updateDetune(detune);
    
    if (waveform === 'pulse') {
      const pulseWidth = parseFloat(document.getElementById('osc-pulse-width')?.value || 0.5);
      window.basicSynth.updatePulseWidth(pulseWidth);
    }
    
    window.basicSynth.playNote('A4', 2);
  }
  
  /**
   * Lecture pour l'onglet Modulation
   */
  playModulation() {
    console.log('[UIController] Modulation play - TODO');
  }
  
  /**
   * Lecture pour l'onglet Filtres
   */
  playFiltres() {
    const sourceType = this.getActiveWaveType('#tab-filtres .source-btn') || 'sawtooth';
    const sourceFreq = parseFloat(document.getElementById('filter-source-freq')?.value || 220);
    
    if (sourceType.includes('noise')) {
      // Jouer du bruit
      const noiseType = sourceType.replace('noise', '').trim() || 'white';
      if (window.basicSynth) {
        window.basicSynth.playNoise(noiseType, 3);
      }
    } else {
      // Jouer une forme d'onde
      if (window.basicSynth) {
        window.basicSynth.updateWaveform(sourceType);
        window.basicSynth.updateFrequency(sourceFreq);
        window.basicSynth.playNote('A4', 3);
      }
    }
  }
  
  /**
   * Gère les boutons de presets
   */
  handlePresetButton(presetName, button) {
    try {
      const currentTab = window.appState?.currentTab;
      
      switch (currentTab) {
        case 'fm':
          if (window.presetUtils) {
            window.presetUtils.loadFMPreset(presetName);
          }
          break;
          
        case 'additive':
          if (window.presetUtils) {
            window.presetUtils.loadAdditivePreset(presetName);
          }
          break;
          
        case 'tb303':
          if (window.presetUtils) {
            window.presetUtils.loadTB303Pattern(presetName);
          }
          break;
          
        default:
          console.log(`[UIController] Preset ${presetName} for ${currentTab}`);
      }
      
      // Feedback visuel
      this.showPresetFeedback(button);
      
    } catch (error) {
      console.error(`[UIController] Failed to handle preset ${presetName}:`, error);
    }
  }
  
  /**
   * Affiche un feedback visuel pour les presets
   */
  showPresetFeedback(button) {
    const originalText = button.textContent;
    button.textContent = '✓ Chargé';
    button.style.background = 'var(--neon-green)';
    button.style.color = 'var(--dark-bg)';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.style.background = '';
      button.style.color = '';
    }, 1000);
  }
  
  /**
   * Extrait le nom de l'onglet depuis l'ID du bouton
   */
  getTabFromButtonId(buttonId) {
    const parts = buttonId.split('-');
    return parts[0] || 'unknown';
  }
  
  /**
   * Configure les événements globaux
   */
  setupGlobalEvents() {
    // Changement d'onglet
    document.addEventListener('tabChanged', (event) => {
      this.handleTabChange(event.detail.tabName);
    });
    
    // Redimensionnement
    window.addEventListener('resize', this.debounce(() => {
      this.handleResize();
    }, 250));
  }
  
  /**
   * Gère le changement d'onglet
   */
  handleTabChange(tabName) {
    // Arrêter tout l'audio lors du changement d'onglet
    if (window.audioManager) {
      window.audioManager.stopAll();
    }
    
    // Mettre à jour les visualisations si nécessaire
    setTimeout(() => {
      this.updateVisualizationsForTab(tabName);
    }, 100);
    
    console.log(`[UIController] Tab changed to: ${tabName}`);
  }
  
  /**
   * Met à jour les visualisations pour un onglet
   */
  updateVisualizationsForTab(tabName) {
    switch (tabName) {
      case 'fondamentaux':
        this.updateFondamentauxVisualization();
        break;
        
      case 'oscillateurs':
        this.updateOscillateursVisualization();
        break;
        
      case 'enveloppes':
        this.updateADSRVisualization();
        break;
        
      case 'filtres':
        this.updateFiltresVisualization();
        break;
    }
  }
  
  /**
   * Gère le redimensionnement
   */
  handleResize() {
    // Redimensionner les visualisations
    if (window.waveformRenderer) {
      window.waveformRenderer.resizeAllCanvases();
    }
    
    // Mettre à jour les visualisations
    const currentTab = window.appState?.currentTab;
    if (currentTab) {
      this.updateVisualizationsForTab(currentTab);
    }
  }
  
  /**
   * Configure les interactions tactiles optimisées
   */
  setupTouchInteractions() {
    const sliders = document.querySelectorAll('.slider');
    
    sliders.forEach(slider => {
      this.setupSliderTouchInteraction({ element: slider, type: 'slider' });
    });
  }
  
  /**
   * Configure l'interaction tactile pour un curseur
   */
  setupSliderTouchInteraction(control) {
    const element = control.element;
    let touchStartValue = null;
    let touchStartY = null;
    
    element.addEventListener('touchstart', (e) => {
      e.preventDefault();
      touchStartValue = parseFloat(element.value);
      touchStartY = e.touches[0].clientY;
      element.classList.add('touch-active');
    }, { passive: false });
    
    element.addEventListener('touchmove', (e) => {
      e.preventDefault();
      
      if (touchStartValue === null || touchStartY === null) return;
      
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY; // Inversé pour un mouvement naturel
      
      const sensitivity = 2; // Plus sensible au toucher
      const min = parseFloat(element.min) || 0;
      const max = parseFloat(element.max) || 100;
      const range = max - min;
      const deltaValue = (deltaY / 100) * range * sensitivity;
      
      const newValue = Math.max(min, Math.min(max, touchStartValue + deltaValue));
      element.value = newValue;
      
      // Déclencher l'événement input
      element.dispatchEvent(new Event('input'));
      
    }, { passive: false });
    
    element.addEventListener('touchend', (e) => {
      e.preventDefault();
      touchStartValue = null;
      touchStartY = null;
      element.classList.remove('touch-active');
    }, { passive: false });
  }
  
  /**
   * Utilitaire debounce
   */
  debounce(func, wait) {
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
   * Obtient la valeur actuelle d'un contrôle
   */
  getValue(controlId) {
    return this.currentValues.get(controlId);
  }
  
  /**
   * Définit la valeur d'un contrôle
   */
  setValue(controlId, value) {
    const control = document.getElementById(controlId);
    if (control) {
      control.value = value;
      
      // Déclencher les événements appropriés
      if (control.classList.contains('slider')) {
        control.dispatchEvent(new Event('input'));
      } else {
        control.dispatchEvent(new Event('change'));
      }
    }
  }
  
  /**
   * Active un bouton dans un groupe
   */
  setActiveButton(selector, value) {
    const buttons = document.querySelectorAll(selector);
    
    buttons.forEach(button => {
      button.classList.remove('active');
      
      const buttonValue = button.getAttribute('data-wave') || 
                         button.getAttribute('data-type') || 
                         button.textContent.toLowerCase();
      
      if (buttonValue === value) {
        button.classList.add('active');
      }
    });
  }
  
  /**
   * Nettoyage des event listeners
   */
  cleanup() {
    try {
      // Nettoyer tous les timers de debounce
      this.debounceTimers.forEach(timer => {
        clearTimeout(timer);
      });
      this.debounceTimers.clear();
      
      // Nettoyer les event listeners
      this.eventListeners.clear();
      this.currentValues.clear();
      this.activeElements.clear();
      
      console.log('[UIController] Cleanup completed');
      
    } catch (error) {
      console.error('[UIController] Cleanup failed:', error);
    }
  }
  
  /**
   * Obtient le statut de l'UIController
   */
  getStatus() {
    return {
      listenersCount: this.eventListeners.size,
      valuesCount: this.currentValues.size,
      activeTimers: this.debounceTimers.size,
      config: this.config
    };
  }
}

// Créer l'instance globale
window.uiController = new UIController();

console.log('[UIController] Class loaded and global instance created');