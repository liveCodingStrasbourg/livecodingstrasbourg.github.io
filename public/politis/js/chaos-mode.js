/**
 * Gestionnaire du Mode Chaos
 * Gère le déclenchement et le comportement du mode chaos
 */

const ChaosManager = {
    active: false,
    pending: false,
    timeout: null,
    randomVoiceTimeout: null,
    
    /**
     * Vérifie si le mode chaos doit être activé et l'initialise si nécessaire
     * @param {number} questionCount - Nombre de questions posées
     * @returns {boolean} - Si le mode chaos est activé
     */
    checkAndInitialize(questionCount) {
      const { minQuestions, maxQuestions } = CONFIG.chaosMode;
      
      // Si déjà en mode chaos, ne rien faire
      if (this.active) return true;
      
      // Déterminer si on active le mode chaos
      if (questionCount >= minQuestions) {
        // Chance croissante d'activer le mode chaos à mesure qu'on approche du max
        const chanceOfChaos = (questionCount - minQuestions) / (maxQuestions - minQuestions);
        
        if (questionCount >= maxQuestions || Math.random() < chanceOfChaos) {
          this.pending = true;
          this.activate();
          return true;
        }
      }
      
      return false;
    },
    
    /**
     * Active le mode chaos
     */
    activate() {
      // Ne déclencher que si en attente
      if (!this.pending) return;
      
      // Activer le mode chaos
      this.active = true;
      this.pending = false;
      
      // Modifier l'interface
      UIManager.setChaosMode(true);
      
      document.querySelectorAll('.politician-face').forEach(face => {
        face.style.animation = 'shake 0.1s infinite, glitch 0.1s infinite';
        face.style.filter = 'hue-rotate(' + (Math.random() * 360) + 'deg)';
      });

      const originalVolume = AudioManager.audioContext.createGain();
originalVolume.gain.value = 1.0;
AudioManager.audioContext.destination.connect(originalVolume);

      // Afficher des messages d'alerte
      UIManager.addTerminalLine(CONFIG.terminalMessages.chaosMode.warning, true);
      UIManager.addTerminalLine(CONFIG.terminalMessages.chaosMode.activated, true);
      UIManager.addTerminalLine(CONFIG.terminalMessages.chaosMode.metrics, true);
      UIManager.addTerminalLine(CONFIG.terminalMessages.chaosMode.system, true);
      
      // Mettre à jour les métriques pour le chaos
      AppState.setAudienceMetrics({
        outrage: 100,
        support: Math.floor(Math.random() * 100),
        skepticism: 100,
        engagement: 100
      });
      
      // Mettre à jour les barres de métriques
      UIManager.updateMetricBars(true);
      
      // Programmer des hurlements aléatoires
      this.scheduleRandomVoices();
      
      // Programmer la fin du mode chaos
      this.timeout = setTimeout(() => {
        this.deactivate();
      }, CONFIG.chaosMode.chaosDuration);
    },
    
    /**
     * Programme des voix aléatoires pendant le mode chaos
     */
    scheduleRandomVoices() {
      if (!this.active) return;
      
      // Choisir un politicien aléatoire pour hurler
      const randomIndex = Math.floor(Math.random() * CONFIG.politicians.length);
      
      // Mettre à jour l'interface et jouer le son
      UIManager.updatePoliticianState(randomIndex, 'screaming', true);
      AudioManager.playSound(randomIndex, 'screaming', true);
      
      // Programmer le prochain hurlement
      const delay = 300 + Math.random() * 1000; // Entre 300ms et 1300ms
      this.randomVoiceTimeout = setTimeout(() => this.scheduleRandomVoices(), delay);
    },
    
    /**
     * Joue une mélodie de chaos
     * @param {number} hash - Hash utilisé pour générer la mélodie
     */
    playChaosMelody(hash) {
      // Jouer la séquence de chaos
      return AudioManager.playMelodyFromHash(hash, (politicianIndex, emotion) => {
        // Mettre à jour l'interface
        UIManager.updatePoliticianState(politicianIndex, emotion, true);
        
        // Mettre à jour le terminal
        const message = CONFIG.terminalMessages.politicianReaction
          .replace('{index}', politicianIndex)
          .replace('{emotion}', emotion.toUpperCase());
        UIManager.addTerminalLine(message);
        
      }, true);
    },
    
    /**
     * Désactive le mode chaos
     */
    deactivate() {
      // Désactiver le mode chaos
      this.active = false;
      
      // Nettoyer les timeouts
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      
      if (this.randomVoiceTimeout) {
        clearTimeout(this.randomVoiceTimeout);
        this.randomVoiceTimeout = null;
      }
      
      // Restaurer l'interface
      UIManager.setChaosMode(false);
      
      // Réinitialiser tous les politiciens
      for (let i = 0; i < CONFIG.politicians.length; i++) {
        UIManager.updatePoliticianState(i, 'idle', false);
      }
      
      // Réinitialiser les métriques
      AppState.setAudienceMetrics({
        outrage: 12,
        support: 34,
        skepticism: 54,
        engagement: 23
      });
      
      // Rétablir les barres de métriques
      UIManager.updateMetricBars(false);
      
      // Ajouter un message dans le terminal
      UIManager.addTerminalLine("Système redémarré...");
      UIManager.addTerminalLine("Retour à la normale.");
    },
    
    /**
     * Vérifie si le mode chaos est actif
     * @returns {boolean} - État du mode chaos
     */
    isActive() {
      return this.active;
    }
  };