/**
 * KeyboardHandler.js - Gestionnaire complet des claviers virtuels et physiques
 * Sound Synthesis Explorer - TOPLAP Strasbourg
 */

class KeyboardHandler {
  constructor() {
    this.keyboards = new Map();
    this.activeKeys = new Set();
    this.physicalKeyMapping = new Map();
    this.sustainPedal = false;
    this.sustainedNotes = new Set();
    
    // Configuration
    this.config = {
      velocity: 0.8,           // Vélocité par défaut
      velocityCurve: 'linear', // 'linear', 'exponential', 'logarithmic'
      enableVelocity: true,    // Sensibilité à la vélocité
      polyphony: 8,           // Limite de polyphonie
      octaveRange: 3,         // Nombre d'octaves sur clavier physique
      baseOctave: 4,          // Octave de base (C4 = middle C)
      sustainBehavior: 'hold', // 'hold', 'release'
      enableAftertouch: false, // Support aftertouch (futur)
      keyRepeat: false        // Répétition de touches
    };
    
    // Mapping clavier QWERTY vers notes
    this.setupPhysicalKeyMapping();
    
    this.bindMethods();
  }
  
  bindMethods() {
    this.initialize = this.initialize.bind(this);
    this.registerKeyboard = this.registerKeyboard.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleKeyRelease = this.handleKeyRelease.bind(this);
    this.handlePhysicalKeyDown = this.handlePhysicalKeyDown.bind(this);
    this.handlePhysicalKeyUp = this.handlePhysicalKeyUp.bind(this);
  }
  
  /**
   * Initialise le gestionnaire de claviers
   */
  initialize() {
    try {
      console.log('[KeyboardHandler] Initializing...');
      
      // Scanner et enregistrer tous les claviers virtuels
      this.scanKeyboards();
      
      // Setup des event listeners globaux
      this.setupGlobalEventListeners();
      
      // Setup du clavier physique
      this.setupPhysicalKeyboard();
      
      console.log(`[KeyboardHandler] Initialized with ${this.keyboards.size} virtual keyboards`);
      return true;
      
    } catch (error) {
      console.error('[KeyboardHandler] Initialization failed:', error);
      return false;
    }
  }
  
  /**
   * Scanne et enregistre tous les claviers virtuels
   */
  scanKeyboards() {
    const keyboardElements = document.querySelectorAll('.virtual-keyboard');
    
    keyboardElements.forEach((keyboardEl, index) => {
      const keyboardId = keyboardEl.id || `keyboard-${index}`;
      this.registerKeyboard(keyboardId, keyboardEl);
    });
  }
  
  /**
   * Enregistre un clavier virtuel
   */
  registerKeyboard(keyboardId, keyboardElement) {
    try {
      const keys = keyboardElement.querySelectorAll('.key');
      const keyboardData = {
        id: keyboardId,
        element: keyboardElement,
        keys: new Map(),
        activeNotes: new Set(),
        octave: this.config.baseOctave,
        enabled: true
      };
      
      // Enregistrer chaque touche
      keys.forEach(keyEl => {
        const note = keyEl.getAttribute('data-note');
        if (note) {
          const keyData = {
            element: keyEl,
            note: note,
            isActive: false,
            velocity: this.config.velocity,
            pressTime: null
          };
          
          keyboardData.keys.set(note, keyData);
          
          // Setup des event listeners pour cette touche
          this.setupKeyEvents(keyData, keyboardData);
        }
      });
      
      this.keyboards.set(keyboardId, keyboardData);
      console.log(`[KeyboardHandler] Registered keyboard: ${keyboardId} with ${keyboardData.keys.size} keys`);
      
    } catch (error) {
      console.error(`[KeyboardHandler] Failed to register keyboard ${keyboardId}:`, error);
    }
  }
  
  /**
   * Configure les événements pour une touche
   */
  setupKeyEvents(keyData, keyboardData) {
    const { element, note } = keyData;
    
    // Événements souris
    element.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.handleKeyPress(note, keyboardData.id, this.calculateVelocity(e));
    });
    
    element.addEventListener('mouseup', (e) => {
      e.preventDefault();
      this.handleKeyRelease(note, keyboardData.id);
    });
    
    element.addEventListener('mouseleave', (e) => {
      this.handleKeyRelease(note, keyboardData.id);
    });
    
    // Événements tactiles
    element.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.handleKeyPress(note, keyboardData.id, this.calculateVelocity(e, touch));
    }, { passive: false });
    
    element.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.handleKeyRelease(note, keyboardData.id);
    }, { passive: false });
    
    element.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      this.handleKeyRelease(note, keyboardData.id);
    }, { passive: false });
    
    // Gestion du context menu (clic droit)
    element.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.handleKeySpecialAction(note, keyboardData.id, 'sustain');
    });
  }
  
  /**
   * Configure le mapping du clavier physique
   */
  setupPhysicalKeyMapping() {
    // Rangée du bas (touches blanches)
    const whiteKeys = [
      { key: 'KeyA', note: 'C' },
      { key: 'KeyS', note: 'D' },
      { key: 'KeyD', note: 'E' },
      { key: 'KeyF', note: 'F' },
      { key: 'KeyG', note: 'G' },
      { key: 'KeyH', note: 'A' },
      { key: 'KeyJ', note: 'B' },
      { key: 'KeyK', note: 'C', octaveOffset: 1 }
    ];
    
    // Rangée du haut (touches noires)
    const blackKeys = [
      { key: 'KeyW', note: 'C#' },
      { key: 'KeyE', note: 'D#' },
      { key: 'KeyT', note: 'F#' },
      { key: 'KeyY', note: 'G#' },
      { key: 'KeyU', note: 'A#' },
      { key: 'KeyI', note: 'C#', octaveOffset: 1 }
    ];
    
    // Contrôles
    const controlKeys = [
      { key: 'Space', action: 'sustain' },
      { key: 'KeyZ', action: 'octaveDown' },
      { key: 'KeyX', action: 'octaveUp' },
      { key: 'KeyC', action: 'velocityDown' },
      { key: 'KeyV', action: 'velocityUp' }
    ];
    
    // Enregistrer le mapping
    [...whiteKeys, ...blackKeys].forEach(mapping => {
      const octave = this.config.baseOctave + (mapping.octaveOffset || 0);
      const fullNote = mapping.note + octave;
      
      this.physicalKeyMapping.set(mapping.key, {
        note: fullNote,
        type: blackKeys.includes(mapping) ? 'black' : 'white'
      });
    });
    
    // Enregistrer les contrôles
    controlKeys.forEach(mapping => {
      this.physicalKeyMapping.set(mapping.key, {
        action: mapping.action,
        type: 'control'
      });
    });
  }
  
  /**
   * Configure les event listeners globaux
   */
  setupGlobalEventListeners() {
    // Prévenir la sélection de texte pendant l'interaction
    document.addEventListener('selectstart', (e) => {
      if (e.target.closest('.virtual-keyboard')) {
        e.preventDefault();
      }
    });
    
    // Prévenir le scroll sur mobile lors du touch
    document.addEventListener('touchmove', (e) => {
      if (e.target.closest('.virtual-keyboard')) {
        e.preventDefault();
      }
    }, { passive: false });
  }
  
  /**
   * Configure le clavier physique
   */
  setupPhysicalKeyboard() {
    document.addEventListener('keydown', this.handlePhysicalKeyDown);
    document.addEventListener('keyup', this.handlePhysicalKeyUp);
    
    // Gérer la perte de focus pour éviter les notes coincées
    window.addEventListener('blur', () => {
      this.releaseAllKeys();
    });
    
    // Gérer la visibilité de la page
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.releaseAllKeys();
      }
    });
  }
  
  /**
   * Gère l'appui sur une touche physique
   */
  handlePhysicalKeyDown(event) {
    // Ignorer si focus sur un input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }
    
    // Éviter la répétition de touches si désactivée
    if (event.repeat && !this.config.keyRepeat) {
      return;
    }
    
    const mapping = this.physicalKeyMapping.get(event.code);
    if (!mapping) {
      return;
    }
    
    event.preventDefault();
    
    if (mapping.type === 'control') {
      this.handleControlAction(mapping.action, true);
    } else {
      const velocity = this.config.enableVelocity ? 
        this.calculatePhysicalVelocity(event) : this.config.velocity;
      
      this.handleKeyPress(mapping.note, 'physical', velocity);
    }
  }
  
  /**
   * Gère le relâchement d'une touche physique
   */
  handlePhysicalKeyUp(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }
    
    const mapping = this.physicalKeyMapping.get(event.code);
    if (!mapping) {
      return;
    }
    
    event.preventDefault();
    
    if (mapping.type === 'control') {
      this.handleControlAction(mapping.action, false);
    } else {
      this.handleKeyRelease(mapping.note, 'physical');
    }
  }
  
  /**
   * Gère l'appui sur une touche (virtuelle ou physique)
   */
  handleKeyPress(note, keyboardId, velocity = null) {
    try {
      if (this.activeKeys.has(note)) {
        return; // Déjà enfoncée
      }
      
      velocity = velocity || this.config.velocity;
      
      // Vérifier la limite de polyphonie
      if (this.activeKeys.size >= this.config.polyphony) {
        console.warn('[KeyboardHandler] Polyphony limit reached');
        return;
      }
      
      // Marquer la touche comme active
      this.activeKeys.add(note);
      
      // Mettre à jour l'interface
      this.updateKeyVisual(note, true);
      
      // Jouer la note selon l'onglet actuel
      this.playNoteForCurrentSynth(note, velocity);
      
      // Enregistrer l'activation
      const keyboard = this.keyboards.get(keyboardId);
      if (keyboard) {
        keyboard.activeNotes.add(note);
        
        const keyData = keyboard.keys.get(note);
        if (keyData) {
          keyData.isActive = true;
          keyData.velocity = velocity;
          keyData.pressTime = Date.now();
        }
      }
      
      // Événement personnalisé
      this.dispatchKeyEvent('keypress', note, velocity);
      
      console.log(`[KeyboardHandler] Key pressed: ${note} (vel: ${(velocity * 127).toFixed(0)})`);
      
    } catch (error) {
      console.error(`[KeyboardHandler] Failed to handle key press ${note}:`, error);
    }
  }
  
  /**
   * Gère le relâchement d'une touche
   */
  handleKeyRelease(note, keyboardId) {
    try {
      if (!this.activeKeys.has(note)) {
        return; // Pas enfoncée
      }
      
      // Vérifier si la note est soutenue
      if (this.sustainPedal && this.sustainedNotes.has(note)) {
        return; // Maintenir la note
      }
      
      // Marquer la touche comme inactive
      this.activeKeys.delete(note);
      
      // Mettre à jour l'interface
      this.updateKeyVisual(note, false);
      
      // Arrêter la note selon l'onglet actuel
      this.stopNoteForCurrentSynth(note);
      
      // Mettre à jour les données du clavier
      const keyboard = this.keyboards.get(keyboardId);
      if (keyboard) {
        keyboard.activeNotes.delete(note);
        
        const keyData = keyboard.keys.get(note);
        if (keyData) {
          keyData.isActive = false;
          keyData.pressTime = null;
        }
      }
      
      // Supprimer du sustain si présent
      this.sustainedNotes.delete(note);
      
      // Événement personnalisé
      this.dispatchKeyEvent('keyrelease', note);
      
      console.log(`[KeyboardHandler] Key released: ${note}`);
      
    } catch (error) {
      console.error(`[KeyboardHandler] Failed to handle key release ${note}:`, error);
    }
  }
  
  /**
   * Gère les actions de contrôle (sustain, octave, etc.)
   */
  handleControlAction(action, pressed) {
    switch (action) {
      case 'sustain':
        this.handleSustainPedal(pressed);
        break;
        
      case 'octaveUp':
        if (pressed) this.changeOctave(1);
        break;
        
      case 'octaveDown':
        if (pressed) this.changeOctave(-1);
        break;
        
      case 'velocityUp':
        if (pressed) this.changeVelocity(0.1);
        break;
        
      case 'velocityDown':
        if (pressed) this.changeVelocity(-0.1);
        break;
    }
  }
  
  /**
   * Gère la pédale de sustain
   */
  handleSustainPedal(pressed) {
    this.sustainPedal = pressed;
    
    if (pressed) {
      // Ajouter toutes les notes actives au sustain
      this.activeKeys.forEach(note => {
        this.sustainedNotes.add(note);
      });
      console.log('[KeyboardHandler] Sustain pedal ON');
    } else {
      // Relâcher toutes les notes en sustain
      this.sustainedNotes.forEach(note => {
        if (!this.activeKeys.has(note)) {
          this.handleKeyRelease(note, 'sustain');
        }
      });
      this.sustainedNotes.clear();
      console.log('[KeyboardHandler] Sustain pedal OFF');
    }
    
    // Mettre à jour l'indicateur visuel
    this.updateSustainIndicator(pressed);
  }
  
  /**
   * Change l'octave du clavier physique
   */
  changeOctave(direction) {
    const newOctave = Math.max(0, Math.min(8, this.config.baseOctave + direction));
    
    if (newOctave !== this.config.baseOctave) {
      this.config.baseOctave = newOctave;
      this.setupPhysicalKeyMapping(); // Reconfigurer le mapping
      
      console.log(`[KeyboardHandler] Octave changed to ${newOctave}`);
      this.showOctaveIndicator(newOctave);
    }
  }
  
  /**
   * Change la vélocité par défaut
   */
  changeVelocity(delta) {
    const newVelocity = Math.max(0.1, Math.min(1.0, this.config.velocity + delta));
    
    if (newVelocity !== this.config.velocity) {
      this.config.velocity = newVelocity;
      
      console.log(`[KeyboardHandler] Velocity changed to ${(newVelocity * 127).toFixed(0)}`);
      this.showVelocityIndicator(newVelocity);
    }
  }
  
  /**
   * Calcule la vélocité selon l'événement
   */
  calculateVelocity(event, touch = null) {
    if (!this.config.enableVelocity) {
      return this.config.velocity;
    }
    
    let intensity = 1.0;
    
    // Pour les événements tactiles, utiliser la force si disponible
    if (touch && touch.force !== undefined) {
      intensity = touch.force;
    } else if (event.pressure !== undefined) {
      intensity = event.pressure;
    } else {
      // Fallback : utiliser la position Y comme approximation
      const rect = event.target.getBoundingClientRect();
      const y = (event.clientY - rect.top) / rect.height;
      intensity = Math.max(0.1, Math.min(1.0, 1.0 - y * 0.5));
    }
    
    // Appliquer la courbe de vélocité
    switch (this.config.velocityCurve) {
      case 'exponential':
        intensity = Math.pow(intensity, 2);
        break;
      case 'logarithmic':
        intensity = Math.sqrt(intensity);
        break;
      default: // linear
        break;
    }
    
    return Math.max(0.1, Math.min(1.0, intensity));
  }
  
  /**
   * Calcule la vélocité pour le clavier physique
   */
  calculatePhysicalVelocity(event) {
    // Simulation basique : les touches modifieront la vélocité
    let velocity = this.config.velocity;
    
    if (event.shiftKey) {
      velocity = Math.min(1.0, velocity * 1.3); // Plus fort
    }
    if (event.ctrlKey) {
      velocity = Math.max(0.1, velocity * 0.7); // Plus doux
    }
    
    return velocity;
  }
  
  /**
   * Met à jour l'affichage visuel d'une touche
   */
  updateKeyVisual(note, pressed) {
    this.keyboards.forEach(keyboard => {
      const keyData = keyboard.keys.get(note);
      if (keyData) {
        if (pressed) {
          keyData.element.classList.add('active');
        } else {
          keyData.element.classList.remove('active');
        }
      }
    });
  }
  
  /**
   * Joue une note selon le synthé actuel
   */
  playNoteForCurrentSynth(note, velocity) {
    if (!window.audioManager || !window.audioManager.isReady()) {
      return;
    }
    
    try {
      const currentTab = window.appState?.currentTab || 'fondamentaux';
      
      switch (currentTab) {
        case 'fondamentaux':
        case 'oscillateurs':
          if (window.basicSynth) {
            window.basicSynth.playNote(note, null, velocity);
          }
          break;
          
        case 'modulation':
          if (window.modulatedSynth) {
            window.modulatedSynth.playNote(note, null, velocity);
          }
          break;
          
        case 'filtres':
          if (window.filteredSynth) {
            window.filteredSynth.playNote(note, null, velocity);
          }
          break;
          
        case 'enveloppes':
        case 'soustractive':
          if (window.subtractiveSynth) {
            window.subtractiveSynth.triggerAttack(note, velocity);
          }
          break;
          
        case 'fm':
          if (window.fmSynth) {
            window.fmSynth.triggerAttack(note, velocity);
          }
          break;
          
        case 'additive':
          if (window.additiveSynth) {
            window.additiveSynth.playNote(note, null, velocity);
          }
          break;
          
        default:
          // Fallback au synthé de base
          if (window.basicSynth) {
            window.basicSynth.playNote(note, 1, velocity);
          }
      }
      
    } catch (error) {
      console.error('[KeyboardHandler] Failed to play note:', error);
    }
  }
  
  /**
   * Arrête une note selon le synthé actuel
   */
  stopNoteForCurrentSynth(note) {
    try {
      const currentTab = window.appState?.currentTab || 'fondamentaux';
      
      switch (currentTab) {
        case 'enveloppes':
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
          
        default:
          // Pour les autres synthés, arrêt simple
          if (window.basicSynth) {
            window.basicSynth.stopNote();
          }
      }
      
    } catch (error) {
      console.error('[KeyboardHandler] Failed to stop note:', error);
    }
  }
  
  /**
   * Relâche toutes les touches actives
   */
  releaseAllKeys() {
    const activeKeysCopy = new Set(this.activeKeys);
    
    activeKeysCopy.forEach(note => {
      this.handleKeyRelease(note, 'emergency');
    });
    
    this.activeKeys.clear();
    this.sustainedNotes.clear();
    this.sustainPedal = false;
    
    console.log('[KeyboardHandler] All keys released');
  }
  
  /**
   * Gère une action spéciale sur une touche
   */
  handleKeySpecialAction(note, keyboardId, action) {
    switch (action) {
      case 'sustain':
        if (this.activeKeys.has(note)) {
          this.sustainedNotes.add(note);
          console.log(`[KeyboardHandler] Note ${note} sustained`);
        }
        break;
    }
  }
  
  /**
   * Affiche l'indicateur d'octave
   */
  showOctaveIndicator(octave) {
    this.showIndicator(`Octave: ${octave}`, 'octave');
  }
  
  /**
   * Affiche l'indicateur de vélocité
   */
  showVelocityIndicator(velocity) {
    this.showIndicator(`Velocity: ${(velocity * 127).toFixed(0)}`, 'velocity');
  }
  
  /**
   * Met à jour l'indicateur de sustain
   */
  updateSustainIndicator(active) {
    this.showIndicator(active ? 'Sustain ON' : 'Sustain OFF', 'sustain');
  }
  
  /**
   * Affiche un indicateur temporaire
   */
  showIndicator(text, type) {
    // Supprimer l'indicateur précédent
    const existingIndicator = document.getElementById(`keyboard-indicator-${type}`);
    if (existingIndicator) {
      existingIndicator.remove();
    }
    
    // Créer le nouvel indicateur
    const indicator = document.createElement('div');
    indicator.id = `keyboard-indicator-${type}`;
    indicator.className = 'keyboard-indicator';
    indicator.textContent = text;
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--glass-bg);
      color: var(--neon-green);
      padding: 0.5rem 1rem;
      border: 1px solid var(--neon-green);
      border-radius: 5px;
      font-size: 0.9rem;
      z-index: 10000;
      backdrop-filter: blur(10px);
      box-shadow: var(--glow-green);
      animation: fadeInOut 2s ease-in-out;
    `;
    
    document.body.appendChild(indicator);
    
    // Auto-suppression après 2 secondes
    setTimeout(() => {
      indicator.remove();
    }, 2000);
  }
  
  /**
   * Dispatch un événement de clavier
   */
  dispatchKeyEvent(type, note, velocity = null) {
    const event = new CustomEvent(`keyboard${type}`, {
      detail: {
        note: note,
        velocity: velocity,
        timestamp: Date.now(),
        activeKeys: Array.from(this.activeKeys)
      }
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Active/désactive un clavier
   */
  setKeyboardEnabled(keyboardId, enabled) {
    const keyboard = this.keyboards.get(keyboardId);
    if (keyboard) {
      keyboard.enabled = enabled;
      keyboard.element.style.opacity = enabled ? '1' : '0.5';
      keyboard.element.style.pointerEvents = enabled ? 'auto' : 'none';
    }
  }
  
  /**
   * Change l'octave d'un clavier spécifique
   */
  setKeyboardOctave(keyboardId, octave) {
    const keyboard = this.keyboards.get(keyboardId);
    if (keyboard) {
      keyboard.octave = Math.max(0, Math.min(8, octave));
      console.log(`[KeyboardHandler] Keyboard ${keyboardId} octave set to ${keyboard.octave}`);
    }
  }
  
  /**
   * Obtient l'état d'un clavier
   */
  getKeyboardState(keyboardId) {
    const keyboard = this.keyboards.get(keyboardId);
    if (!keyboard) {
      return null;
    }
    
    return {
      id: keyboard.id,
      enabled: keyboard.enabled,
      octave: keyboard.octave,
      activeNotes: Array.from(keyboard.activeNotes),
      keyCount: keyboard.keys.size
    };
  }
  
  /**
   * Obtient l'état global des claviers
   */
  getGlobalState() {
    return {
      activeKeys: Array.from(this.activeKeys),
      sustainPedal: this.sustainPedal,
      sustainedNotes: Array.from(this.sustainedNotes),
      baseOctave: this.config.baseOctave,
      velocity: this.config.velocity,
      polyphony: this.activeKeys.size,
      maxPolyphony: this.config.polyphony
    };
  }
  
  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Reconfigurer le mapping si l'octave a changé
    if (newConfig.baseOctave !== undefined) {
      this.setupPhysicalKeyMapping();
    }
    
    console.log('[KeyboardHandler] Configuration updated:', newConfig);
  }
  
  /**
   * Nettoyage des ressources
   */
  cleanup() {
    try {
      // Relâcher toutes les touches
      this.releaseAllKeys();
      
      // Supprimer les event listeners globaux
      document.removeEventListener('keydown', this.handlePhysicalKeyDown);
      document.removeEventListener('keyup', this.handlePhysicalKeyUp);
      
      // Vider les collections
      this.keyboards.clear();
      this.activeKeys.clear();
      this.physicalKeyMapping.clear();
      this.sustainedNotes.clear();
      
      console.log('[KeyboardHandler] Cleanup completed');
      
    } catch (error) {
      console.error('[KeyboardHandler] Cleanup failed:', error);
    }
  }
  
  /**
   * Obtient des informations de statut
   */
  getStatus() {
    return {
      keyboardsCount: this.keyboards.size,
      activeKeysCount: this.activeKeys.size,
      sustainPedal: this.sustainPedal,
      sustainedNotesCount: this.sustainedNotes.size,
      baseOctave: this.config.baseOctave,
      velocity: this.config.velocity,
      config: { ...this.config }
    };
  }
}

// Ajouter les styles CSS pour les animations
const keyboardStyles = document.createElement('style');
keyboardStyles.textContent = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-10px); }
    20% { opacity: 1; transform: translateY(0); }
    80% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }
  
  .keyboard-indicator {
    font-family: 'Courier New', monospace;
    user-select: none;
    pointer-events: none;
  }
`;
document.head.appendChild(keyboardStyles);

// Créer l'instance globale
window.keyboardHandler = new KeyboardHandler();

console.log('[KeyboardHandler] Class loaded and global instance created');