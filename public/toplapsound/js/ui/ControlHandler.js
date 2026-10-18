/**
 * ControlHandler.js - Gestionnaire avancé des contrôles d'interface
 * Sound Synthesis Explorer - TOPLAP Strasbourg
 */

class ControlHandler {
  constructor() {
    this.controls = new Map();
    this.controlGroups = new Map();
    this.presets = new Map();
    this.automation = new Map();
    
    // Configuration
    this.config = {
      updateRate: 50,        // ms entre les updates
      smoothing: 0.1,        // Facteur de lissage
      sensitivity: 1.0,      // Sensibilité globale
      snapToValues: true,    // Snap sur des valeurs spécifiques
      midiLearn: false,      // MIDI learn (futur)
      touchSupport: true     // Support tactile optimisé
    };
    
    // Mappage des types de contrôles
    this.controlTypes = {
      'frequency': { min: 20, max: 20000, scale: 'log', unit: 'Hz', precision: 1 },
      'amplitude': { min: 0, max: 100, scale: 'linear', unit: '%', precision: 0 },
      'time': { min: 0.001, max: 10, scale: 'linear', unit: 's', precision: 3 },
      'detune': { min: -1200, max: 1200, scale: 'linear', unit: 'cents', precision: 0 },
      'ratio': { min: 0.1, max: 20, scale: 'linear', unit: '', precision: 2 },
      'Q': { min: 0.1, max: 50, scale: 'log', unit: '', precision: 1 },
      'index': { min: 0, max: 50, scale: 'linear', unit: '', precision: 1 },
      'rate': { min: 0.1, max: 50, scale: 'log', unit: 'Hz', precision: 1 },
      'percentage': { min: 0, max: 100, scale: 'linear', unit: '%', precision: 0 }
    };
    
    // Valeurs de snap communes
    this.snapValues = {
      'ratio': [0.5, 1, 1.5, 2, 3, 4, 5, 7, 8],
      'detune': [-1200, -700, -500, -200, 0, 200, 500, 700, 1200],
      'time': [0.001, 0.01, 0.1, 0.25, 0.5, 1, 2, 5, 10]
    };
    
    this.bindMethods();
  }
  
bindMethods() {
    this.registerControl = this.registerControl.bind(this);
    this.handleControlChange = this.handleControlChange.bind(this);
    this.updateControlDisplay = this.updateControlDisplay.bind(this);
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
      console.error('[ControlHandler] Touch interaction error:', error);
    }
  }
  
  /**
   * Initialise le gestionnaire de contrôles
   */
  initialize() {
    try {
      console.log('[ControlHandler] Initializing...');
      
      // Scanner et enregistrer tous les contrôles
      this.scanAndRegisterControls();
      
      // Setup des groupes de contrôles
      this.setupControlGroups();
      
      // Setup des interactions tactiles
      if (this.config.touchSupport) {
        this.setupTouchInteractions();
      }
      
      // Setup des presets
      this.setupPresets();
      
      console.log(`[ControlHandler] Initialized ${this.controls.size} controls`);
      return true;
      
    } catch (error) {
      console.error('[ControlHandler] Initialization failed:', error);
      return false;
    }
  }
  
  /**
   * Scanne et enregistre tous les contrôles de l'interface
   */
  scanAndRegisterControls() {
    // Curseurs
    document.querySelectorAll('.slider').forEach(slider => {
      this.registerControl(slider, 'slider');
    });
    
    // Boutons toggle
    document.querySelectorAll('.wave-btn, .note-btn, .filter-btn, .source-btn').forEach(button => {
      this.registerControl(button, 'toggle');
    });
    
    // Sélecteurs
    document.querySelectorAll('select').forEach(select => {
      this.registerControl(select, 'select');
    });
    
    // Boutons d'action
    document.querySelectorAll('.control-btn').forEach(button => {
      this.registerControl(button, 'button');
    });
    
    // Claviers virtuels
    document.querySelectorAll('.virtual-keyboard .key').forEach(key => {
      this.registerControl(key, 'key');
    });
  }
  
  /**
   * Enregistre un contrôle
   */
  registerControl(element, type) {
    const controlId = element.id || `${type}_${Date.now()}`;
    
    const control = {
      id: controlId,
      element: element,
      type: type,
      value: this.getElementValue(element, type),
      previousValue: null,
      config: this.getControlConfig(element, type),
      callbacks: [],
      automation: null,
      group: null
    };
    
    // Déterminer le groupe du contrôle
    control.group = this.determineControlGroup(element);
    
    // Setup des event listeners
    this.setupControlEvents(control);
    
    // Enregistrer le contrôle
    this.controls.set(controlId, control);
    
    console.log(`[ControlHandler] Registered ${type} control: ${controlId}`);
  }
  
  /**
   * Obtient la valeur actuelle d'un élément
   */
  getElementValue(element, type) {
    switch (type) {
      case 'slider':
        return parseFloat(element.value);
      case 'select':
        return element.value;
      case 'toggle':
        return element.classList.contains('active');
      case 'button':
        return false; // Les boutons n'ont pas de valeur persistante
      case 'key':
        return element.classList.contains('active');
      default:
        return element.value || null;
    }
  }
  
  /**
   * Obtient la configuration d'un contrôle selon son type
   */
  getControlConfig(element, type) {
    const config = {
      min: 0,
      max: 100,
      step: 1,
      scale: 'linear',
      unit: '',
      precision: 0,
      snap: false
    };
    
    if (type === 'slider') {
      config.min = parseFloat(element.min) || 0;
      config.max = parseFloat(element.max) || 100;
      config.step = parseFloat(element.step) || 1;
      
      // Détecter le type selon l'ID
      const id = element.id.toLowerCase();
      for (const [typeName, typeConfig] of Object.entries(this.controlTypes)) {
        if (id.includes(typeName)) {
          Object.assign(config, typeConfig);
          break;
        }
      }
      
      // Détecter si snap est nécessaire
      if (this.snapValues[config.unit] || id.includes('ratio') || id.includes('detune')) {
        config.snap = true;
      }
    }
    
    return config;
  }
  
  /**
   * Détermine le groupe d'un contrôle
   */
  determineControlGroup(element) {
    const tabContent = element.closest('.tab-content');
    if (tabContent) {
      return tabContent.id.replace('tab-', '');
    }
    
    const section = element.closest('.controls-section, .oscillator-section, .filter-section');
    if (section) {
      return section.className.split(' ')[0];
    }
    
    return 'global';
  }
  
  /**
   * Configure les événements d'un contrôle
   */
  setupControlEvents(control) {
    const { element, type } = control;
    
    switch (type) {
      case 'slider':
        element.addEventListener('input', (e) => {
          this.handleControlChange(control, parseFloat(e.target.value));
        });
        
        element.addEventListener('change', (e) => {
          this.handleControlChange(control, parseFloat(e.target.value), true);
        });
        
        // Support de la molette de souris
        element.addEventListener('wheel', (e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -control.config.step : control.config.step;
            const newValue = this.clampValue(control.value + delta, control.config);
            this.setControlValue(control.id, newValue);
          }
        });
        break;
        
      case 'toggle':
        element.addEventListener('click', (e) => {
          // Désactiver les autres boutons du même groupe
          const group = element.closest('.button-group');
          if (group) {
            group.querySelectorAll('.active').forEach(btn => {
              btn.classList.remove('active');
            });
          }
          
          element.classList.add('active');
          const value = element.dataset.wave || element.dataset.type || 
                       element.dataset.note || element.textContent.toLowerCase();
          this.handleControlChange(control, value, true);
        });
        break;
        
      case 'select':
        element.addEventListener('change', (e) => {
          this.handleControlChange(control, e.target.value, true);
        });
        break;
        
      case 'button':
        element.addEventListener('click', (e) => {
          this.handleControlChange(control, true, true);
        });
        break;
        
      case 'key':
        // Les touches du clavier sont gérées par le KeyboardHandler
        break;
    }
  }
  
  /**
   * Gère le changement d'un contrôle
   */
  handleControlChange(control, newValue, immediate = false) {
    try {
      const oldValue = control.value;
      
      // Appliquer le snap si configuré
      if (control.config.snap && control.type === 'slider') {
        newValue = this.applySnap(newValue, control);
      }
      
      // Appliquer le lissage si pas immédiat
      if (!immediate && control.type === 'slider') {
        newValue = this.applySmoothingFilter(oldValue, newValue);
      }
      
      // Clamper la valeur
      if (control.type === 'slider') {
        newValue = this.clampValue(newValue, control.config);
      }
      
      // Mettre à jour la valeur
      control.previousValue = oldValue;
      control.value = newValue;
      
      // Mettre à jour l'affichage
      this.updateControlDisplay(control);
      
      // Exécuter les callbacks
      control.callbacks.forEach(callback => {
        try {
          callback(newValue, oldValue, control.id);
        } catch (error) {
          console.error(`[ControlHandler] Callback error for ${control.id}:`, error);
        }
      });
      
      // Notification globale
      this.notifyControlChange(control, newValue, oldValue);
      
    } catch (error) {
      console.error(`[ControlHandler] Failed to handle control change for ${control.id}:`, error);
    }
  }
  
  /**
   * Applique le snap à une valeur
   */
  applySnap(value, control) {
    const snapThreshold = (control.config.max - control.config.min) * 0.02; // 2% de la plage
    
    // Snap sur les valeurs prédéfinies
    const snapValues = this.snapValues[control.config.unit] || 
                      this.snapValues[control.element.id] || [];
    
    for (const snapValue of snapValues) {
      if (Math.abs(value - snapValue) <= snapThreshold) {
        return snapValue;
      }
    }
    
    // Snap sur les valeurs rondes pour certains types
    if (control.config.unit === 'Hz' && value >= 100) {
      const rounded = Math.round(value / 10) * 10;
      if (Math.abs(value - rounded) <= snapThreshold) {
        return rounded;
      }
    }
    
    return value;
  }
  
  /**
   * Applique un filtre de lissage
   */
  applySmoothingFilter(oldValue, newValue) {
    if (oldValue === null) return newValue;
    
    const smoothing = this.config.smoothing;
    return oldValue + (newValue - oldValue) * smoothing;
  }
  
  /**
   * Clamp une valeur selon la configuration
   */
  clampValue(value, config) {
    return Math.max(config.min, Math.min(config.max, value));
  }
  
  /**
   * Met à jour l'affichage d'un contrôle
   */
  updateControlDisplay(control) {
    const { element, value, config, type } = control;
    
    if (type === 'slider') {
      // Mettre à jour la valeur du slider
      element.value = value;
      
      // Mettre à jour l'affichage de la valeur
      const valueDisplay = document.getElementById(element.id + '-value');
      if (valueDisplay) {
        const formattedValue = this.formatValue(value, config);
        valueDisplay.textContent = formattedValue;
        
        // Couleur dynamique selon la valeur
        const percentage = (value - config.min) / (config.max - config.min);
        valueDisplay.style.color = this.getValueColor(percentage);
      }
    }
  }
  
  /**
   * Formate une valeur selon sa configuration
   */
  formatValue(value, config) {
    let formatted;
    
    if (config.precision === 0) {
      formatted = Math.round(value).toString();
    } else {
      formatted = value.toFixed(config.precision);
    }
    
    if (config.unit) {
      formatted += ' ' + config.unit;
    }
    
    return formatted;
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
   * Définit la valeur d'un contrôle
   */
  setControlValue(controlId, value, triggerCallbacks = true) {
    const control = this.controls.get(controlId);
    if (!control) {
      console.warn(`[ControlHandler] Control not found: ${controlId}`);
      return false;
    }
    
    if (triggerCallbacks) {
      this.handleControlChange(control, value, true);
    } else {
      control.value = value;
      this.updateControlDisplay(control);
    }
    
    return true;
  }
  
  /**
   * Obtient la valeur d'un contrôle
   */
  getControlValue(controlId) {
    const control = this.controls.get(controlId);
    return control ? control.value : null;
  }
  
  /**
   * Ajoute un callback à un contrôle
   */
  addControlCallback(controlId, callback) {
    const control = this.controls.get(controlId);
    if (control && typeof callback === 'function') {
      control.callbacks.push(callback);
      return true;
    }
    return false;
  }
  
  /**
   * Supprime un callback d'un contrôle
   */
  removeControlCallback(controlId, callback) {
    const control = this.controls.get(controlId);
    if (control) {
      const index = control.callbacks.indexOf(callback);
      if (index > -1) {
        control.callbacks.splice(index, 1);
        return true;
      }
    }
    return false;
  }
  
  /**
   * Configure les groupes de contrôles
   */
  setupControlGroups() {
    // Grouper les contrôles par onglet/section
    this.controls.forEach(control => {
      const groupName = control.group;
      
      if (!this.controlGroups.has(groupName)) {
        this.controlGroups.set(groupName, []);
      }
      
      this.controlGroups.get(groupName).push(control);
    });
    
    console.log(`[ControlHandler] Setup ${this.controlGroups.size} control groups`);
  }
  
  /**
   * Configure les interactions tactiles optimisées
   */
  setupTouchInteractions() {
    this.controls.forEach(control => {
      if (control.type === 'slider') {
        this.setupSliderTouchInteraction(control);
      }
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
      touchStartValue = control.value;
      touchStartY = e.touches[0].clientY;
      element.classList.add('touch-active');
    }, { passive: false });
    
    element.addEventListener('touchmove', (e) => {
      e.preventDefault();
      
      if (touchStartValue === null || touchStartY === null) return;
      
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY; // Inversé pour un mouvement naturel
      
      const sensitivity = this.config.sensitivity * 2; // Plus sensible au toucher
      const range = control.config.max - control.config.min;
      const deltaValue = (deltaY / 100) * range * sensitivity;
      
      const newValue = this.clampValue(touchStartValue + deltaValue, control.config);
      this.setControlValue(control.id, newValue);
      
    }, { passive: false });
    
    element.addEventListener('touchend', (e) => {
      e.preventDefault();
      touchStartValue = null;
      touchStartY = null;
      element.classList.remove('touch-active');
    }, { passive: false });
  }
  
  /**
   * Configure les presets pour les groupes de contrôles
   */
  setupPresets() {
    // Presets pour les différents onglets
    this.presets.set('fondamentaux', {
      'sine-440': { 'fond-freq': 440, 'fond-amp': 50 },
      'square-220': { 'fond-freq': 220, 'fond-amp': 75 },
      'saw-880': { 'fond-freq': 880, 'fond-amp': 60 }
    });
    
    this.presets.set('filtres', {
      'lowpass-warm': { 'filter-cutoff': 800, 'filter-resonance': 2 },
      'highpass-bright': { 'filter-cutoff': 1200, 'filter-resonance': 1.5 },
      'bandpass-vocal': { 'filter-cutoff': 1000, 'filter-resonance': 8 }
    });
    
    console.log(`[ControlHandler] Setup ${this.presets.size} preset groups`);
  }
  
  /**
   * Charge un preset pour un groupe
   */
  loadPreset(groupName, presetName) {
    const presetGroup = this.presets.get(groupName);
    if (!presetGroup) {
      console.warn(`[ControlHandler] Preset group not found: ${groupName}`);
      return false;
    }
    
    const preset = presetGroup[presetName];
    if (!preset) {
      console.warn(`[ControlHandler] Preset not found: ${presetName} in ${groupName}`);
      return false;
    }
    
    // Appliquer les valeurs du preset
    Object.entries(preset).forEach(([controlId, value]) => {
      this.setControlValue(controlId, value);
    });
    
    console.log(`[ControlHandler] Loaded preset ${presetName} for group ${groupName}`);
    return true;
  }
  
  /**
   * Sauvegarde un preset pour un groupe
   */
  savePreset(groupName, presetName) {
    const groupControls = this.controlGroups.get(groupName);
    if (!groupControls) {
      console.warn(`[ControlHandler] Control group not found: ${groupName}`);
      return false;
    }
    
    const preset = {};
    groupControls.forEach(control => {
      if (control.type === 'slider' || control.type === 'select') {
        preset[control.id] = control.value;
      }
    });
    
    if (!this.presets.has(groupName)) {
      this.presets.set(groupName, {});
    }
    
    this.presets.get(groupName)[presetName] = preset;
    
    console.log(`[ControlHandler] Saved preset ${presetName} for group ${groupName}`);
    return true;
  }
  
  /**
   * Démarre l'automation d'un contrôle
   */
  startAutomation(controlId, automationType, config = {}) {
    const control = this.controls.get(controlId);
    if (!control) return false;
    
    const automation = {
      type: automationType,
      config: config,
      startTime: Date.now(),
      active: true
    };
    
    control.automation = automation;
    this.automation.set(controlId, automation);
    
    // Démarrer la boucle d'automation
    this.runAutomation(controlId);
    
    console.log(`[ControlHandler] Started ${automationType} automation for ${controlId}`);
    return true;
  }
  
  /**
   * Exécute l'automation d'un contrôle
   */
  runAutomation(controlId) {
    const control = this.controls.get(controlId);
    const automation = this.automation.get(controlId);
    
    if (!control || !automation || !automation.active) return;
    
    const elapsed = (Date.now() - automation.startTime) / 1000;
    let newValue = control.value;
    
    switch (automation.type) {
      case 'sine':
        const frequency = automation.config.frequency || 1;
        const amplitude = automation.config.amplitude || 0.1;
        const offset = automation.config.offset || 0.5;
        const range = control.config.max - control.config.min;
        
        newValue = control.config.min + (offset + amplitude * Math.sin(2 * Math.PI * frequency * elapsed)) * range;
        break;
        
      case 'ramp':
        const duration = automation.config.duration || 5;
        const targetValue = automation.config.target || control.config.max;
        const progress = Math.min(elapsed / duration, 1);
        
        newValue = control.value + (targetValue - control.value) * progress;
        
        if (progress >= 1) {
          automation.active = false;
        }
        break;
        
      case 'random':
        const changeRate = automation.config.changeRate || 0.1;
        if (Math.random() < changeRate) {
          const randomFactor = (Math.random() - 0.5) * 2; // -1 à 1
          const maxChange = (control.config.max - control.config.min) * 0.05;
          newValue = this.clampValue(control.value + randomFactor * maxChange, control.config);
        }
        break;
    }
    
    if (automation.active) {
      this.setControlValue(controlId, newValue, false);
      
      setTimeout(() => {
        this.runAutomation(controlId);
      }, this.config.updateRate);
    }
  }
  
  /**
   * Arrête l'automation d'un contrôle
   */
  stopAutomation(controlId) {
    const automation = this.automation.get(controlId);
    if (automation) {
      automation.active = false;
      this.automation.delete(controlId);
      
      const control = this.controls.get(controlId);
      if (control) {
        control.automation = null;
      }
      
      console.log(`[ControlHandler] Stopped automation for ${controlId}`);
      return true;
    }
    return false;
  }
  
  /**
   * Notifie le changement d'un contrôle
   */
  notifyControlChange(control, newValue, oldValue) {
    // Événement personnalisé pour les autres modules
    const event = new CustomEvent('controlChanged', {
      detail: {
        controlId: control.id,
        type: control.type,
        value: newValue,
        previousValue: oldValue,
        group: control.group
      }
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Obtient tous les contrôles d'un groupe
   */
  getControlGroup(groupName) {
    return this.controlGroups.get(groupName) || [];
  }
  
  /**
   * Obtient les noms de tous les groupes
   */
  getGroupNames() {
    return Array.from(this.controlGroups.keys());
  }
  
  /**
   * Reset tous les contrôles d'un groupe
   */
  resetGroup(groupName) {
    const groupControls = this.controlGroups.get(groupName);
    if (!groupControls) return false;
    
    groupControls.forEach(control => {
      // Reset à la valeur par défaut ou au minimum
      const defaultValue = control.type === 'slider' ? 
        ((control.config.max + control.config.min) / 2) : 
        control.config.min;
      
      this.setControlValue(control.id, defaultValue);
    });
    
    console.log(`[ControlHandler] Reset group ${groupName}`);
    return true;
  }
  
  /**
   * Nettoyage des ressources
   */
  cleanup() {
    try {
      // Arrêter toutes les automations
      this.automation.forEach((automation, controlId) => {
        this.stopAutomation(controlId);
      });
      
      // Vider les maps
      this.controls.clear();
      this.controlGroups.clear();
      this.presets.clear();
      this.automation.clear();
      
      console.log('[ControlHandler] Cleanup completed');
      
    } catch (error) {
      console.error('[ControlHandler] Cleanup failed:', error);
    }
  }
  
  /**
   * Obtient des informations de statut
   */
  getStatus() {
    return {
      controlsCount: this.controls.size,
      groupsCount: this.controlGroups.size,
      presetsCount: Array.from(this.presets.values()).reduce((total, group) => total + Object.keys(group).length, 0),
      activeAutomations: this.automation.size,
      config: { ...this.config }
    };
  }
}

// Créer l'instance globale
window.controlHandler = new ControlHandler();

console.log('[ControlHandler] Class loaded and global instance created');