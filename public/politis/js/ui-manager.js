/**
 * Gestionnaire d'Interface Utilisateur
 * Gère la manipulation du DOM et les interactions avec l'interface utilisateur
 */

const UIManager = {
    /**
     * Initialise la grille des politiciens
     */
    initPoliticians() {
      const grid = document.getElementById('politicians-grid');
      
      // Effacer tout sauf l'overlay
      const overlay = grid.querySelector('.grid-overlay');
      grid.innerHTML = '';
      grid.appendChild(overlay);
      
      // Ajouter les portraits des politiciens
      for (let i = 0; i < CONFIG.politicians.length; i++) {
        const politicianDiv = document.createElement('div');
        politicianDiv.className = 'politician-face';
        politicianDiv.id = `politician-${i}`;
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'name';
        nameDiv.textContent = CONFIG.politicians[i];
        
        const faceDiv = document.createElement('div');
        faceDiv.className = 'ascii-face';
        faceDiv.textContent = CONFIG.faces.idle[i];
        
        politicianDiv.appendChild(nameDiv);
        politicianDiv.appendChild(faceDiv);
        
        grid.appendChild(politicianDiv);
      }
    },
    
    /**
     * Met à jour l'état d'un politicien
     * @param {number} index - Index du politicien
     * @param {string} state - Nouvel état émotionnel
     * @param {boolean} chaosModeActive - Si le mode chaos est actif
     * @returns {boolean} - Si la mise à jour a réussi
     */
    updatePoliticianState(index, state, chaosModeActive = false) {
      const politicianDiv = document.getElementById(`politician-${index}`);
      
      if (!politicianDiv) return false;
      
      // Déterminer le visage à utiliser (en mode chaos, on utilise les visages chaos)
      let faceState = state;
      if (chaosModeActive && state === 'screaming') {
        faceState = 'chaos';
      }
      

      if (state !== 'idle') {
        let responseArray;
        if (chaosModeActive && state === 'screaming') {
          responseArray = CONFIG.responses.chaos;
        } else {
          responseArray = CONFIG.responses[state] || [];
        }
        
        if (responseArray.length > 0) {
          const response = responseArray[Math.floor(Math.random() * responseArray.length)];
          const politicianName = CONFIG.politicians[index];
          
          // Ajouter au terminal
          this.addTerminalLine(`${politicianName}: "${response}"`, state === 'screaming');
        }
      }

      // Mettre à jour le visage
      const faceDiv = politicianDiv.querySelector('.ascii-face');
      faceDiv.textContent = CONFIG.faces[faceState] ? CONFIG.faces[faceState][index] : CONFIG.faces.idle[index];
      
      // Ajouter ou supprimer la classe d'animation
      if (state === 'idle') {
        politicianDiv.classList.remove('animate');
        politicianDiv.classList.remove('chaos-animate');
        
        // Supprimer la réponse si elle existe
        const existingResponse = politicianDiv.querySelector('.response');
        if (existingResponse) {
          politicianDiv.removeChild(existingResponse);
        }
      } else {
        // Ajouter une classe spéciale pour le chaos
        if (chaosModeActive && state === 'screaming') {
          politicianDiv.classList.add('animate', 'chaos-animate');
        } else {
          politicianDiv.classList.add('animate');
          politicianDiv.classList.remove('chaos-animate');
        }
        
        // Ajouter une réponse
        let responseDiv = politicianDiv.querySelector('.response');
        
        if (!responseDiv) {
          responseDiv = document.createElement('div');
          responseDiv.className = `response ${state}`;
          politicianDiv.appendChild(responseDiv);
        } else {
          responseDiv.className = `response ${state}`;
        }
        
        // Obtenir une réponse appropriée pour l'émotion
        let responseArray;
        if (chaosModeActive && state === 'screaming') {
          responseArray = CONFIG.responses.chaos;
        } else {
          responseArray = CONFIG.responses[state] || [];
        }
        
        if (responseArray.length > 0) {
          const randomResponse = responseArray[Math.floor(Math.random() * responseArray.length)];
          responseDiv.innerHTML = randomResponse; // Utiliser innerHTML pour supporter les textes avec glitch
        }
      }
      
      return true;
    },
    
    /**
     * Ajoute une ligne au terminal
     * @param {string} text - Texte à ajouter
     * @param {boolean} isError - Si c'est un message d'erreur
     */
    addTerminalLine(text, isError = false) {
      const terminal = document.getElementById('terminal-box');
      const lineDiv = document.createElement('div');
      lineDiv.className = 'terminal-line';
      if (isError) lineDiv.classList.add('error');
      lineDiv.innerHTML = `> ${text}`;
      
      terminal.insertBefore(lineDiv, terminal.lastElementChild);
      
      // Garder seulement les 6 dernières lignes + ligne curseur
      while (terminal.children.length > 7) {
        terminal.removeChild(terminal.firstElementChild);
      }
      
      // Défiler vers le bas
      terminal.scrollTop = terminal.scrollHeight;
    },
    
    /**
     * Met à jour les métriques d'audience
     * @param {Object} metrics - Nouvelles valeurs des métriques
     */
    updateAudienceMetrics(metrics) {
      // Mettre à jour l'interface
      document.getElementById('outrage-value').textContent = `${metrics.outrage}%`;
      document.getElementById('support-value').textContent = `${metrics.support}%`;
      document.getElementById('skepticism-value').textContent = `${metrics.skepticism}%`;
      document.getElementById('engagement-value').textContent = `${metrics.engagement}%`;
      
      // Mettre à jour les tendances
      const outrageTrend = document.getElementById('outrage-value').nextElementSibling.nextElementSibling;
      outrageTrend.className = `stat-trend ${metrics.outrage > 50 ? 'trend-up' : 'trend-down'}`;
      outrageTrend.textContent = metrics.outrage > 50 ? '▲' : '▼';
      
      const supportTrend = document.getElementById('support-value').nextElementSibling.nextElementSibling;
      supportTrend.className = `stat-trend ${metrics.support > 40 ? 'trend-up' : 'trend-down'}`;
      supportTrend.textContent = metrics.support > 40 ? '▲' : '▼';
      
      const skepticismTrend = document.getElementById('skepticism-value').nextElementSibling.nextElementSibling;
      skepticismTrend.className = `stat-trend ${metrics.skepticism > 45 ? 'trend-up' : 'trend-down'}`;
      skepticismTrend.textContent = metrics.skepticism > 45 ? '▲' : '▼';
      
      const engagementTrend = document.getElementById('engagement-value').nextElementSibling.nextElementSibling;
      engagementTrend.className = `stat-trend ${metrics.engagement > 30 ? 'trend-up' : 'trend-down'}`;
      engagementTrend.textContent = metrics.engagement > 30 ? '▲' : '▼';
    },
    
    /**
     * Met à jour les barres de métriques
     * @param {boolean} chaosModeActive - Si le mode chaos est actif
     * @param {Object} settings - Paramètres pour les barres en mode chaos
     */
    updateMetricBars(chaosModeActive = false, settings = null) {
      if (chaosModeActive) {
        document.querySelector('.metric:nth-child(1) .metric-value').style.width = '0%';
        document.querySelector('.metric:nth-child(2) .metric-value').style.width = '0%';
        const supportBarValue = settings ? 
          settings.supportBarValue : 
          CONFIG.chaosMode.publicSupportRange[0] + 
            Math.random() * (CONFIG.chaosMode.publicSupportRange[1] - CONFIG.chaosMode.publicSupportRange[0]);
        
        document.querySelector('.metric:nth-child(3) .metric-value').style.width = `${supportBarValue}%`;
      } else {
        // Restaurer les valeurs normales
        document.querySelector('.metric:nth-child(1) .metric-value').style.width = '23%';
        document.querySelector('.metric:nth-child(2) .metric-value').style.width = '17%';
        document.querySelector('.metric:nth-child(3) .metric-value').style.width = '65%';
      }
    },
    
    /**
     * Met à jour l'affichage du hash et de la mélodie
     * @param {number} hash - Valeur du hash
     * @param {Array} sequence - Séquence mélodique
     */
    updateHashDisplay(hash, sequence) {
      const formattedHash = HashGenerator.formatHash(hash);
      document.getElementById('question-hash').textContent = 
        `${CONFIG.interface.hashValueLabel} ${formattedHash}`;
      
      const melodyPreview = HashGenerator.generateMelodyPreview(sequence);
      document.getElementById('melody-preview').textContent = 
        `${CONFIG.interface.melodyPreviewLabel} ${melodyPreview}`;
    },
    
    /**
     * Mise à jour de l'heure
     */
    updateTime() {
      document.getElementById('system-time').textContent = new Date().toLocaleTimeString();
    },
    
    /**
     * Configure les événements de l'interface utilisateur
     * @param {Object} handlers - Fonctions de gestion des événements
     */
    setupEventListeners(handlers) {
      // Configurer les écouteurs d'événements
      document.getElementById('run-button').addEventListener('click', handlers.onQuestionSubmit);
      document.getElementById('custom-question-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          handlers.onQuestionSubmit();
        }
      });
      
      // Gérer l'initialisation audio avec un clic
      document.body.addEventListener('click', function() {
        AudioManager.init();
      });
      
      // Afficher l'avertissement audio initialement
      document.getElementById('audio-warning').style.display = 'block';
    },
    
    /**
     * Affiche un message de sortie dans la zone de réponse
     * @param {string} message - Message à afficher
     */
    setOutputMessage(message) {
      document.getElementById('output').textContent = message;
    },
    
    /**
     * Modifie l'interface pour le mode chaos
     * @param {boolean} active - Si le mode chaos est actif
     */
    setChaosMode(active) {
      if (active) {
        document.body.classList.add('chaos-mode');
        document.querySelector('.header-title').textContent = CONFIG.interface.chaos.title;
        document.querySelector('.system-warning').textContent = CONFIG.interface.chaos.warning;
        document.querySelector('.system-status').textContent = CONFIG.interface.chaos.unstable;
      } else {
        document.body.classList.remove('chaos-mode');
        document.querySelector('.header-title').textContent = CONFIG.interface.headerTitle;
        document.querySelector('.system-warning').textContent = CONFIG.interface.systemWarning;
        document.querySelector('.system-status').textContent = CONFIG.interface.systemStatus;
      }
    }
  };