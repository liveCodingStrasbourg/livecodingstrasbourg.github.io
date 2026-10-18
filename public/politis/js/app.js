/**
 * Application Principale
 * Coordonne tous les modules et gère l'état global de l'application
 */

// État global de l'application
const AppState = {
    politicianStates: Array(CONFIG.politicians.length).fill('idle'),
    currentHash: 0,
    currentMelodySequence: [],
    questionCount: 0,
    audienceMetrics: {
      outrage: 12,
      support: 34,
      skepticism: 54,
      engagement: 23
    },
    
    /**
     * Initialise l'état de l'application
     */
    init() {
      this.politicianStates = Array(CONFIG.politicians.length).fill('idle');
      this.currentHash = 0;
      this.currentMelodySequence = [];
      this.questionCount = 0;
      this.audienceMetrics = {
        outrage: 12,
        support: 34,
        skepticism: 54,
        engagement: 23
      };
    },
    
    /**
     * Met à jour l'état d'un politicien
     * @param {number} index - Index du politicien
     * @param {string} state - Nouvel état
     */
    setPoliticianState(index, state) {
      if (index >= 0 && index < this.politicianStates.length) {
        this.politicianStates[index] = state;
        return true;
      }
      return false;
    },
    
    /**
     * Met à jour les métriques d'audience
     * @param {Object} newMetrics - Nouvelles métriques
     */
    setAudienceMetrics(newMetrics) {
      // Mettre à jour les métriques avec les nouvelles valeurs
      this.audienceMetrics = {
        ...this.audienceMetrics,
        ...newMetrics
      };
      
      // Limiter les valeurs entre 0 et 100
      Object.keys(this.audienceMetrics).forEach(key => {
        this.audienceMetrics[key] = Math.min(100, Math.max(0, this.audienceMetrics[key]));
      });
      
      // Mettre à jour l'interface
      UIManager.updateAudienceMetrics(this.audienceMetrics);
    },
    
    /**
     * Calcule les changements de métriques d'audience en fonction de l'émotion
     * @param {string} emotion - Émotion déclenchée
     */
    updateMetricsBasedOnEmotion(emotion) {
      // Si le mode chaos est actif, ne pas faire les calculs normaux
      if (ChaosManager.isActive()) return;
      
      // Calcul normal des changements de métriques
      const changes = {
        screaming: {
          outrage: Math.floor(Math.random() * 10) + 5,
          support: Math.floor(Math.random() * 5),
          skepticism: -Math.floor(Math.random() * 5),
          engagement: Math.floor(Math.random() * 15)
        },
        shouting: {
          outrage: Math.floor(Math.random() * 5) + 2,
          support: Math.floor(Math.random() * 10) + 3,
          skepticism: -Math.floor(Math.random() * 3),
          engagement: Math.floor(Math.random() * 10) + 5
        },
        sweating: {
          outrage: -Math.floor(Math.random() * 3),
          support: -Math.floor(Math.random() * 5),
          skepticism: Math.floor(Math.random() * 15) + 5,
          engagement: Math.floor(Math.random() * 7) + 3
        }
      };
      
      const change = changes[emotion] || {
        outrage: 0,
        support: 0,
        skepticism: 0,
        engagement: 0
      };
      
      // Appliquer les changements
      this.setAudienceMetrics({
        outrage: this.audienceMetrics.outrage + change.outrage,
        support: this.audienceMetrics.support + change.support,
        skepticism: this.audienceMetrics.skepticism + change.skepticism,
        engagement: this.audienceMetrics.engagement + change.engagement
      });
    }
  };
  
  /**
   * Fonctions principales de l'application
   */
  const App = {
    /**
     * Traite la question soumise par l'utilisateur
     */
    processQuestion() {
      const questionInput = document.getElementById('custom-question-input');
      const question = questionInput.value.trim();
      
      if (!question) {
        UIManager.setOutputMessage("Veuillez saisir une question.");
        return;
      }
      
      // Incrémenter le compteur de questions
      AppState.questionCount++;
      
      // Afficher la question posée
      UIManager.setOutputMessage(`Journaliste: "${question}"`);
      UIManager.addTerminalLine(CONFIG.terminalMessages.questionAsked + `"${question.substring(0, 30)}..."`);
      
      // Vérifier si on doit déclencher le mode chaos
      const chaosActivated = ChaosManager.checkAndInitialize(AppState.questionCount);
      
      // Générer le hash et la séquence mélodique
      AppState.currentHash = HashGenerator.generateHashFromText(question);
      AppState.currentMelodySequence = HashGenerator.hashToMelodySequence(AppState.currentHash);
      
      // Mettre à jour l'affichage du hash et de la mélodie
      UIManager.updateHashDisplay(AppState.currentHash, AppState.currentMelodySequence);
      
      UIManager.addTerminalLine(CONFIG.terminalMessages.hashGenerated
        .replace('{hash}', HashGenerator.formatHash(AppState.currentHash)));
      UIManager.addTerminalLine(CONFIG.terminalMessages.melodyGenerated);
      
      // Jouer la mélodie
      this.playMelody();
    },
    
    /**
     * Joue la mélodie actuelle
     */
    playMelody() {
      // Réinitialiser tous les politiciens
      for (let i = 0; i < AppState.politicianStates.length; i++) {
        AppState.setPoliticianState(i, 'idle');
        UIManager.updatePoliticianState(i, 'idle', ChaosManager.isActive());
      }
      
      // En mode chaos, utiliser la mélodie du chaos
      if (ChaosManager.isActive()) {
        ChaosManager.playChaosMelody(AppState.currentHash);
        return;
      }
      
      // Jouer la séquence mélodique normalement
      AudioManager.playMelodyFromHash(AppState.currentHash, (politicianIndex, emotion) => {
        // Mettre à jour l'état du politicien
        AppState.setPoliticianState(politicianIndex, emotion);
        UIManager.updatePoliticianState(politicianIndex, emotion, false);
        
        // Mettre à jour le terminal
        const message = CONFIG.terminalMessages.politicianReaction
          .replace('{index}', politicianIndex)
          .replace('{emotion}', emotion.toUpperCase());
        UIManager.addTerminalLine(message);
        
        // Mettre à jour les métriques d'audience
        AppState.updateMetricsBasedOnEmotion(emotion);
        
        // Réinitialiser ce politicien après un délai
setTimeout(() => {
  AppState.setPoliticianState(politicianIndex, 'idle');
  UIManager.updatePoliticianState(politicianIndex, 'idle', false);
}, CONFIG.audio.noteDuration * 1000 + 5000);
      });
    },
    
    /**
     * Initialise les animations d'inactivité
     */
    setupIdleAnimations() {
      setInterval(() => {
        // Ne pas faire d'animations aléatoires en mode chaos
        if (ChaosManager.isActive()) return;
        
        const randomIndex = Math.floor(Math.random() * CONFIG.politicians.length);
        const randomEmotion = Math.random() < 0.7 ? 'idle' : 'sweating';
        
        if (AppState.politicianStates[randomIndex] === 'idle') {
          // Mettre à jour l'état et l'interface
          AppState.setPoliticianState(randomIndex, randomEmotion);
          UIManager.updatePoliticianState(randomIndex, randomEmotion, false);
          
          // Jouer un son si c'est la sueur
          if (randomEmotion === 'sweating') {
            AudioManager.playSound(randomIndex, 'sweating', false);
          }
          
          // Réinitialiser après un délai
          setTimeout(() => {
            AppState.setPoliticianState(randomIndex, 'idle');
            UIManager.updatePoliticianState(randomIndex, 'idle', false);
          }, 1500);
        }
      }, 5000);
    },
    
    /**
     * Initialise l'application
     */
    init() {
      // Initialiser l'état
      AppState.init();
      
      // Initialiser les politiciens dans l'interface
      UIManager.initPoliticians();
      
      // Mettre à jour l'heure
      UIManager.updateTime();
      setInterval(UIManager.updateTime, 1000);
      
      // Configurer les écouteurs d'événements
      UIManager.setupEventListeners({
        onQuestionSubmit: this.processQuestion.bind(this)
      });
      
      // Initialisation des séquences d'inactivité
      this.setupIdleAnimations();
      
      // Lignes de terminal initiales
      CONFIG.terminalMessages.initialization.forEach(message => {
        UIManager.addTerminalLine(message);
      });
    }
  };
  
  // Initialiser l'application lorsque le DOM est chargé
  window.addEventListener('DOMContentLoaded', () => App.init());
