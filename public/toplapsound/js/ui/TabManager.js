/**
 * TabManager.js - Gestionnaire avancé des onglets avec navigation et état
 * Sound Synthesis Explorer - TOPLAP Strasbourg
 */

class TabManager {
  constructor() {
    this.activeTab = 'fondamentaux';
    this.tabs = new Map();
    this.tabHistory = [];
    this.maxHistory = 10;
    
    // Configuration des onglets
    this.tabConfig = {
      'fondamentaux': { 
        title: 'Fondamentaux', 
        icon: '〜', 
        description: 'Bases du signal audio',
        requires: []
      },
      'oscillateurs': { 
        title: 'Oscillateurs', 
        icon: '◊', 
        description: 'Générateurs de formes d\'ondes',
        requires: ['fondamentaux']
      },
      'modulation': { 
        title: 'Modulation', 
        icon: '⟰', 
        description: 'LFO et modulation AM/FM',
        requires: ['oscillateurs']
      },
      'filtres': { 
        title: 'Filtres', 
        icon: '▲', 
        description: 'Filtrage fréquentiel',
        requires: ['oscillateurs']
      },
      'enveloppes': { 
        title: 'Enveloppes', 
        icon: '⟋', 
        description: 'Contrôle temporel ADSR',
        requires: ['oscillateurs']
      },
      'soustractive': { 
        title: 'Synthèse Soustractive', 
        icon: '◈', 
        description: 'VCO + VCF + VCA',
        requires: ['oscillateurs', 'filtres', 'enveloppes']
      },
      'fm': { 
        title: 'Synthèse FM', 
        icon: '◎', 
        description: 'Modulation de fréquence',
        requires: ['modulation']
      },
      'additive': { 
        title: 'Synthèse Additive', 
        icon: '◉', 
        description: 'Addition d\'harmoniques',
        requires: ['fondamentaux']
      },
      'wavetables': { 
        title: 'Wavetables', 
        icon: '⟿', 
        description: 'Tables d\'ondes avec morphing',
        requires: ['oscillateurs']
      },
      'classiques': { 
        title: 'Synthés Classiques', 
        icon: '⟐', 
        description: 'Émulations Moog, ARP, Prophet',
        requires: ['soustractive']
      },
      'tb303': { 
        title: 'TB-303', 
        icon: '▣', 
        description: 'Séquenceur acid house',
        requires: ['soustractive']
      },
      'avancees': { 
        title: 'Techniques Avancées', 
        icon: '◐', 
        description: 'Granulaire, Gendy, Chaos',
        requires: ['soustractive', 'fm']
      }
    };
    
    this.bindMethods();
  }
  
  bindMethods() {
    this.initialize = this.initialize.bind(this);
    this.switchToTab = this.switchToTab.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.updateTabStates = this.updateTabStates.bind(this);
  }
  
  /**
   * Initialise le gestionnaire d'onglets
   */
  initialize() {
    try {
      console.log('[TabManager] Initializing...');
      
      // Enregistrer tous les onglets
      this.registerTabs();
      
      // Setup des event listeners
      this.setupEventListeners();
      
      // Setup des raccourcis clavier
      this.setupKeyboardShortcuts();
      
      // Mettre à jour l'état initial
      this.updateTabStates();
      
      // Activer l'onglet par défaut
      this.switchToTab(this.activeTab, false);
      
      console.log('[TabManager] Initialized successfully');
      return true;
      
    } catch (error) {
      console.error('[TabManager] Initialization failed:', error);
      return false;
    }
  }
  
  /**
   * Enregistre tous les onglets trouvés dans le DOM
   */
  registerTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
      const tabId = button.getAttribute('data-tab');
      const tabContent = document.getElementById(`tab-${tabId}`);
      
      if (tabId && tabContent) {
        this.tabs.set(tabId, {
          id: tabId,
          button: button,
          content: tabContent,
          config: this.tabConfig[tabId] || {},
          isActive: false,
          isEnabled: true,
          lastVisited: null
        });
        
        console.log(`[TabManager] Registered tab: ${tabId}`);
      }
    });
    
    console.log(`[TabManager] Registered ${this.tabs.size} tabs`);
  }
  
  /**
   * Configure les event listeners
   */
  setupEventListeners() {
    this.tabs.forEach((tab, tabId) => {
      tab.button.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleTabClick(tabId);
      });
      
      // Gestion du hover pour info tooltip
      tab.button.addEventListener('mouseenter', (e) => {
        this.showTabTooltip(tab, e);
      });
      
      tab.button.addEventListener('mouseleave', (e) => {
        this.hideTabTooltip();
      });
    });
    
    // Navigation clavier global
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        this.handleKeyboardNavigation(e);
      }
    });
  }
  
  /**
   * Configure les raccourcis clavier
   */
  setupKeyboardShortcuts() {
    const shortcuts = {
      'Digit1': 'fondamentaux',
      'Digit2': 'oscillateurs',
      'Digit3': 'modulation',
      'Digit4': 'filtres',
      'Digit5': 'enveloppes',
      'Digit6': 'soustractive',
      'Digit7': 'fm',
      'Digit8': 'additive',
      'Digit9': 'wavetables',
      'Digit0': 'classiques'
    };
    
    this.keyboardShortcuts = shortcuts;
  }
  
  /**
   * Gère la navigation clavier
   */
  handleKeyboardNavigation(event) {
    // Ctrl/Cmd + Numéro = Aller à l'onglet
    if (this.keyboardShortcuts[event.code]) {
      event.preventDefault();
      const targetTab = this.keyboardShortcuts[event.code];
      this.switchToTab(targetTab);
      return;
    }
    
    // Ctrl/Cmd + Flèches = Navigation séquentielle
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
      event.preventDefault();
      this.navigateSequential(event.code === 'ArrowRight' ? 1 : -1);
      return;
    }
    
    // Ctrl/Cmd + Tab = Historique
    if (event.code === 'Tab') {
      event.preventDefault();
      this.navigateHistory(event.shiftKey ? -1 : 1);
      return;
    }
  }
  
  /**
   * Navigation séquentielle entre onglets
   */
  navigateSequential(direction) {
    const tabIds = Array.from(this.tabs.keys());
    const currentIndex = tabIds.indexOf(this.activeTab);
    
    let nextIndex = currentIndex + direction;
    
    // Boucler si nécessaire
    if (nextIndex >= tabIds.length) {
      nextIndex = 0;
    } else if (nextIndex < 0) {
      nextIndex = tabIds.length - 1;
    }
    
    const nextTabId = tabIds[nextIndex];
    this.switchToTab(nextTabId);
  }
  
  /**
   * Navigation dans l'historique
   */
  navigateHistory(direction) {
    if (this.tabHistory.length < 2) {
      return;
    }
    
    // Trouver l'onglet précédent dans l'historique
    const currentHistoryIndex = this.tabHistory.indexOf(this.activeTab);
    let targetIndex = currentHistoryIndex + direction;
    
    if (targetIndex >= 0 && targetIndex < this.tabHistory.length) {
      const targetTab = this.tabHistory[targetIndex];
      this.switchToTab(targetTab, false); // false = ne pas ajouter à l'historique
    }
  }
  
  /**
   * Gère le clic sur un onglet
   */
  handleTabClick(tabId) {
    const tab = this.tabs.get(tabId);
    
    if (!tab) {
      console.warn(`[TabManager] Tab not found: ${tabId}`);
      return;
    }
    
    if (!tab.isEnabled) {
      console.warn(`[TabManager] Tab disabled: ${tabId}`);
      this.showTabRequirements(tab);
      return;
    }
    
    this.switchToTab(tabId);
  }
  
  /**
   * Bascule vers un onglet spécifique
   */
  switchToTab(tabId, addToHistory = true) {
    try {
      const tab = this.tabs.get(tabId);
      
      if (!tab) {
        console.warn(`[TabManager] Tab not found: ${tabId}`);
        return false;
      }
      
      if (!tab.isEnabled) {
        console.warn(`[TabManager] Tab disabled: ${tabId}`);
        return false;
      }
      
      // Désactiver l'onglet actuel
      if (this.activeTab) {
        const currentTab = this.tabs.get(this.activeTab);
        if (currentTab) {
          currentTab.button.classList.remove('active');
          currentTab.content.classList.remove('active');
          currentTab.isActive = false;
          
          // Cleanup de l'onglet sortant
          this.cleanupTab(this.activeTab);
        }
      }
      
      // Activer le nouvel onglet
      tab.button.classList.add('active');
      tab.content.classList.add('active');
      tab.isActive = true;
      tab.lastVisited = Date.now();
      
      // Mettre à jour l'état
      const previousTab = this.activeTab;
      this.activeTab = tabId;
      
      // Ajouter à l'historique
      if (addToHistory && previousTab !== tabId) {
        this.addToHistory(tabId);
      }
      
      // Initialiser le nouvel onglet
      this.initializeTab(tabId);
      
      // Mettre à jour l'URL sans rechargement
      this.updateURL(tabId);
      
      // Événement personnalisé
      this.dispatchTabChangeEvent(tabId, previousTab);
      
      console.log(`[TabManager] Switched to tab: ${tabId}`);
      return true;
      
    } catch (error) {
      console.error(`[TabManager] Failed to switch to tab ${tabId}:`, error);
      return false;
    }
  }
  
  /**
   * Ajoute un onglet à l'historique
   */
  addToHistory(tabId) {
    // Supprimer les occurrences précédentes
    this.tabHistory = this.tabHistory.filter(id => id !== tabId);
    
    // Ajouter au début
    this.tabHistory.unshift(tabId);
    
    // Limiter la taille de l'historique
    if (this.tabHistory.length > this.maxHistory) {
      this.tabHistory = this.tabHistory.slice(0, this.maxHistory);
    }
  }
  
  /**
   * Initialise un onglet lors de l'activation
   */
  initializeTab(tabId) {
    try {
      // Initialisation spécifique par onglet
      switch (tabId) {
        case 'fondamentaux':
          this.initializeFondamentaux();
          break;
          
        case 'oscillateurs':
          this.initializeOscillateurs();
          break;
          
        case 'modulation':
          this.initializeModulation();
          break;
          
        case 'filtres':
          this.initializeFiltres();
          break;
          
        case 'enveloppes':
          this.initializeEnveloppes();
          break;
          
        case 'soustractive':
          this.initializeSoustractive();
          break;
          
        case 'fm':
          this.initializeFM();
          break;
          
        case 'additive':
          this.initializeAdditive();
          break;
          
        case 'wavetables':
          this.initializeWavetables();
          break;
          
        case 'classiques':
          this.initializeClassiques();
          break;
          
        case 'tb303':
          this.initializeTB303();
          break;
          
        case 'avancees':
          this.initializeAvancees();
          break;
      }
      
      // Mettre à jour les visualisations si nécessaire
      setTimeout(() => {
        this.updateTabVisualizations(tabId);
      }, 100);
      
    } catch (error) {
      console.error(`[TabManager] Failed to initialize tab ${tabId}:`, error);
    }
  }
  
  /**
   * Nettoyage d'un onglet lors de la désactivation
   */
  cleanupTab(tabId) {
    try {
      // Arrêter tout l'audio de l'onglet sortant
      if (window.audioManager) {
        window.audioManager.stopAll();
      }
      
      // Cleanup spécifique par synthé
      switch (tabId) {
        case 'modulation':
          if (window.modulatedSynth) {
            window.modulatedSynth.cleanup();
          }
          break;
          
        case 'soustractive':
          if (window.subtractiveSynth) {
            window.subtractiveSynth.cleanup();
          }
          break;
          
        case 'fm':
          if (window.fmSynth) {
            window.fmSynth.cleanup();
          }
          break;
          
        case 'additive':
          if (window.additiveSynth) {
            window.additiveSynth.cleanup();
          }
          break;
      }
      
    } catch (error) {
      console.error(`[TabManager] Failed to cleanup tab ${tabId}:`, error);
    }
  }
  
  /**
   * Méthodes d'initialisation spécifiques par onglet
   */
  initializeFondamentaux() {
    if (window.visualUtils) {
      window.visualUtils.updateWaveformDisplay('waveform-canvas', 'sine', 440, 0.8);
    }
  }
  
  initializeOscillateurs() {
    if (window.visualUtils) {
      window.visualUtils.updateWaveformDisplay('osc-waveform-canvas', 'sine', 440, 0.8);
    }
  }
  
  initializeModulation() {
    // La modulation sera initialisée par les contrôles
  }
  
  initializeFiltres() {
    if (window.visualUtils) {
      window.visualUtils.updateFilterDisplay('filter-response-canvas', 'lowpass', 1000, 1);
    }
  }
  
  initializeEnveloppes() {
    if (window.visualUtils) {
      window.visualUtils.updateADSRDisplay('adsr-canvas', 0.1, 0.3, 0.7, 0.5);
    }
  }
  
  initializeSoustractive() {
    // Le synthé soustractif sera initialisé par les contrôles
  }
  
  initializeFM() {
    // Le synthé FM sera initialisé par les contrôles
  }
  
  initializeAdditive() {
    // Le synthé additif sera initialisé par les contrôles
  }
  
  initializeWavetables() {
    // Les wavetables seront initialisées par les contrôles
  }
  
  initializeClassiques() {
    // Les synthés classiques seront initialisés par les contrôles
  }
  
  initializeTB303() {
    // Le TB-303 sera initialisé par les contrôles
  }
  
  initializeAvancees() {
    // Les techniques avancées seront initialisées par les contrôles
  }
  
  /**
   * Met à jour les visualisations d'un onglet
   */
  updateTabVisualizations(tabId) {
    if (!window.waveformRenderer) {
      return;
    }
    
    // Redimensionner les canvas si nécessaire
    window.waveformRenderer.resizeAllCanvases();
    
    // Redessiner les visualisations statiques
    switch (tabId) {
      case 'fondamentaux':
        this.initializeFondamentaux();
        break;
        
      case 'oscillateurs':
        this.initializeOscillateurs();
        break;
        
      case 'filtres':
        this.initializeFiltres();
        break;
        
      case 'enveloppes':
        this.initializeEnveloppes();
        break;
    }
  }
  
  /**
   * Met à jour l'URL sans rechargement
   */
  updateURL(tabId) {
    try {
      const url = new URL(window.location);
      url.searchParams.set('tab', tabId);
      window.history.replaceState({ tab: tabId }, '', url);
    } catch (error) {
      console.warn('[TabManager] Failed to update URL:', error);
    }
  }
  
  /**
   * Dispatch un événement de changement d'onglet
   */
  dispatchTabChangeEvent(newTabId, previousTabId) {
    const event = new CustomEvent('tabChanged', {
      detail: {
        tabName: newTabId,
        previousTab: previousTabId,
        timestamp: Date.now()
      }
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Met à jour l'état de tous les onglets (activé/désactivé)
   */
  updateTabStates() {
    this.tabs.forEach((tab, tabId) => {
      const config = this.tabConfig[tabId];
      
      if (config && config.requires && config.requires.length > 0) {
        // Vérifier si les prérequis sont satisfaits
        const requirementsMet = config.requires.every(reqTab => {
          const reqTabData = this.tabs.get(reqTab);
          return reqTabData && reqTabData.lastVisited;
        });
        
        tab.isEnabled = requirementsMet;
        
        if (requirementsMet) {
          tab.button.classList.remove('disabled');
          tab.button.removeAttribute('disabled');
        } else {
          tab.button.classList.add('disabled');
          tab.button.setAttribute('disabled', 'true');
        }
      } else {
        // Pas de prérequis, toujours activé
        tab.isEnabled = true;
        tab.button.classList.remove('disabled');
        tab.button.removeAttribute('disabled');
      }
    });
  }
  
  /**
   * Affiche les prérequis d'un onglet
   */
  showTabRequirements(tab) {
    const config = this.tabConfig[tab.id];
    
    if (config && config.requires) {
      const requirementNames = config.requires.map(reqId => {
        const reqConfig = this.tabConfig[reqId];
        return reqConfig ? reqConfig.title : reqId;
      }).join(', ');
      
      // Créer un tooltip temporaire
      this.showTemporaryMessage(
        `Prérequis manquants: ${requirementNames}`,
        tab.button,
        'warning'
      );
    }
  }
  
  /**
   * Affiche un tooltip pour un onglet
   */
  showTabTooltip(tab, event) {
    const config = this.tabConfig[tab.id];
    
    if (!config) return;
    
    let tooltipText = `${config.icon} ${config.title}`;
    if (config.description) {
      tooltipText += `\n${config.description}`;
    }
    
    if (!tab.isEnabled && config.requires) {
      const requirementNames = config.requires.map(reqId => {
        const reqConfig = this.tabConfig[reqId];
        return reqConfig ? reqConfig.title : reqId;
      }).join(', ');
      
      tooltipText += `\n\nPrérequis: ${requirementNames}`;
    }
    
    this.createTooltip(tooltipText, event.clientX, event.clientY);
  }
  
  /**
   * Masque le tooltip
   */
  hideTabTooltip() {
    const tooltip = document.getElementById('tab-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  }
  
  /**
   * Crée un tooltip
   */
  createTooltip(text, x, y) {
    this.hideTabTooltip(); // Supprimer le précédent
    
    const tooltip = document.createElement('div');
    tooltip.id = 'tab-tooltip';
    tooltip.className = 'tab-tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
      position: fixed;
      left: ${x + 10}px;
      top: ${y - 10}px;
      background: var(--glass-bg);
      color: var(--neon-green);
      padding: 0.5rem;
      border: 1px solid var(--neon-green);
      border-radius: 5px;
      font-size: 0.8rem;
      z-index: 10000;
      pointer-events: none;
      white-space: pre-line;
      backdrop-filter: blur(10px);
      box-shadow: var(--glow-green);
    `;
    
    document.body.appendChild(tooltip);
    
    // Auto-suppression après 3 secondes
    setTimeout(() => {
      tooltip.remove();
    }, 3000);
  }
  
  /**
   * Affiche un message temporaire
   */
  showTemporaryMessage(message, nearElement, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `temporary-message ${type}`;
    messageDiv.textContent = message;
    
    const rect = nearElement.getBoundingClientRect();
    messageDiv.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.bottom + 10}px;
      background: ${type === 'warning' ? 'var(--neon-magenta)' : 'var(--neon-green)'};
      color: var(--dark-bg);
      padding: 0.5rem;
      border-radius: 5px;
      font-size: 0.8rem;
      z-index: 10000;
      pointer-events: none;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }
  
  /**
   * Obtient l'onglet actuel
   */
  getCurrentTab() {
    return this.activeTab;
  }
  
  /**
   * Obtient la liste de tous les onglets
   */
  getAllTabs() {
    return Array.from(this.tabs.keys());
  }
  
  /**
   * Obtient l'historique des onglets
   */
  getTabHistory() {
    return [...this.tabHistory];
  }
  
  /**
   * Vérifie si un onglet est activé
   */
  isTabEnabled(tabId) {
    const tab = this.tabs.get(tabId);
    return tab ? tab.isEnabled : false;
  }
  
  /**
   * Active/désactive un onglet manuellement
   */
  setTabEnabled(tabId, enabled) {
    const tab = this.tabs.get(tabId);
    if (tab) {
      tab.isEnabled = enabled;
      this.updateTabStates();
    }
  }
  
  /**
   * Nettoyage des ressources
   */
  cleanup() {
    try {
      // Supprimer les event listeners
      this.tabs.forEach(tab => {
        // Les event listeners seront automatiquement supprimés
        // quand les éléments DOM sont supprimés
      });
      
      // Vider les collections
      this.tabs.clear();
      this.tabHistory = [];
      
      console.log('[TabManager] Cleanup completed');
      
    } catch (error) {
      console.error('[TabManager] Cleanup failed:', error);
    }
  }
  
  /**
   * Obtient des informations de statut
   */
  getStatus() {
    const enabledTabs = Array.from(this.tabs.values()).filter(tab => tab.isEnabled).length;
    
    return {
      activeTab: this.activeTab,
      totalTabs: this.tabs.size,
      enabledTabs: enabledTabs,
      historyLength: this.tabHistory.length,
      lastSwitchTime: this.tabs.get(this.activeTab)?.lastVisited || null
    };
  }
}

// Créer l'instance globale
window.tabManager = new TabManager();

console.log('[TabManager] Class loaded and global instance created');