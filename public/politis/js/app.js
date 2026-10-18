/**
 * Application Principale
 * Coordonne tous les modules et gère l'état global de l'application
 */

/**
 * Sélectionne aléatoirement 3 personnages parmi les 16 disponibles
 * et configure les tableaux CONFIG correspondants
 */
function selectRandomCharacters() {
  const totalCharacters = CONFIG.allCharacters.length;
  const numToSelect = 3;

  // Générer 3 indices uniques aléatoires
  const indices = [];
  while (indices.length < numToSelect) {
    const randomIndex = Math.floor(Math.random() * totalCharacters);
    if (!indices.includes(randomIndex)) {
      indices.push(randomIndex);
    }
  }

  // Stocker les indices sélectionnés
  CONFIG.selectedIndices = indices;

  // Remplir le tableau des politiciens avec les noms sélectionnés
  CONFIG.politicians = indices.map(i => CONFIG.allCharacters[i]);

  // Remplir les profils (mapping local 0,1,2 vers les profils globaux)
  CONFIG.politicianProfiles = {};
  indices.forEach((globalIndex, localIndex) => {
    CONFIG.politicianProfiles[localIndex] = CONFIG.allProfiles[globalIndex];
  });

  // Remplir les réponses (mapping local 0,1,2 vers les réponses globales)
  CONFIG.politicianResponses = {};
  indices.forEach((globalIndex, localIndex) => {
    CONFIG.politicianResponses[localIndex] = CONFIG.allResponses[globalIndex];
  });

  // Créer les tableaux de visages pour les 3 sélectionnés
  CONFIG.selectedFaces = {
    idle: indices.map(i => CONFIG.faces.idle[i]),
    screaming: indices.map(i => CONFIG.faces.screaming[i]),
    shouting: indices.map(i => CONFIG.faces.shouting[i]),
    sweating: indices.map(i => CONFIG.faces.sweating[i]),
    chaos: indices.map(i => CONFIG.faces.chaos[i])
  };

  console.log("Personnages sélectionnés:", CONFIG.politicians);

  // Créer le mapping des poids pour les personnages sélectionnés
  CONFIG.selectedBarWeights = {};
  indices.forEach((globalIndex, localIndex) => {
    CONFIG.selectedBarWeights[localIndex] = CONFIG.characterBarWeights[globalIndex];
  });
}

/**
 * Gestionnaire des barres de métriques (Véracité, Transpiration, Foutage)
 */
const BarManager = {
  // Valeurs actuelles des barres
  values: {
    veracite: 45,
    transpiration: 20,
    foutage: 35
  },

  // États des seuils déjà déclenchés (pour éviter les répétitions)
  triggeredThresholds: {
    veracite: { critical: false, low: false, high: false },
    transpiration: { high: false, critical: false },
    foutage: { high: false, critical: false }
  },

  // Intervalle de récupération passive
  recoveryInterval: null,

  /**
   * Initialise les barres avec les valeurs de départ
   */
  init() {
    this.values = { ...CONFIG.barMetrics.initial };
    this.resetThresholds();
    this.updateDisplay();
    this.startPassiveRecovery();
  },

  /**
   * Réinitialise les seuils déclenchés
   */
  resetThresholds() {
    this.triggeredThresholds = {
      veracite: { critical: false, low: false, high: false },
      transpiration: { high: false, critical: false },
      foutage: { high: false, critical: false }
    };
  },

  /**
   * Démarre la récupération passive
   */
  startPassiveRecovery() {
    if (this.recoveryInterval) {
      clearInterval(this.recoveryInterval);
    }

    this.recoveryInterval = setInterval(() => {
      // Ne pas récupérer en mode chaos
      if (ChaosManager.isActive()) return;

      const recovery = CONFIG.barMetrics.passiveRecovery;
      this.values.veracite = this.clamp(this.values.veracite + recovery.veracite);
      this.values.transpiration = this.clamp(this.values.transpiration + recovery.transpiration);
      this.values.foutage = this.clamp(this.values.foutage + recovery.foutage);

      this.updateDisplay();
    }, 1000);
  },

  /**
   * Met à jour les barres suite à une réaction d'un politicien
   * @param {number} localIndex - Index local du politicien (0, 1, 2)
   * @param {string} emotion - Type d'émotion (screaming, shouting, sweating, idle)
   */
  applyReaction(localIndex, emotion) {
    const baseEffects = CONFIG.barMetrics.baseEffects[emotion];
    if (!baseEffects) return;

    // Obtenir les poids du personnage
    const weights = CONFIG.selectedBarWeights[localIndex] || { veracite: 1, transpiration: 1, foutage: 1 };

    // Calculer les effets avec randomisation et poids du personnage
    const veraciteChange = this.randomInRange(baseEffects.veracite) * weights.veracite;
    const transpirationChange = this.randomInRange(baseEffects.transpiration) * weights.transpiration;
    const foutageChange = this.randomInRange(baseEffects.foutage) * weights.foutage;

    // Appliquer les changements
    this.values.veracite = this.clamp(this.values.veracite + veraciteChange);
    this.values.transpiration = this.clamp(this.values.transpiration + transpirationChange);
    this.values.foutage = this.clamp(this.values.foutage + foutageChange);

    // Mettre à jour l'affichage
    this.updateDisplay();

    // Vérifier les seuils
    this.checkThresholds();
  },

  /**
   * Génère une valeur aléatoire dans une plage [min, max]
   */
  randomInRange([min, max]) {
    return min + Math.random() * (max - min);
  },

  /**
   * Limite une valeur entre 0 et 100
   */
  clamp(value) {
    return Math.min(100, Math.max(0, value));
  },

  /**
   * Met à jour l'affichage des barres dans le DOM
   */
  updateDisplay() {
    const bars = document.querySelectorAll('.data-metrics .metric');
    if (bars.length >= 3) {
      bars[0].querySelector('.metric-value').style.width = `${this.values.veracite}%`;
      bars[1].querySelector('.metric-value').style.width = `${this.values.transpiration}%`;
      bars[2].querySelector('.metric-value').style.width = `${this.values.foutage}%`;
    }
  },

  /**
   * Vérifie les seuils et déclenche les événements appropriés
   */
  checkThresholds() {
    const thresholds = CONFIG.barMetrics.thresholds;

    // Véracité critique (< 10%)
    if (this.values.veracite < thresholds.veracite.critical && !this.triggeredThresholds.veracite.critical) {
      this.triggeredThresholds.veracite.critical = true;
      this.triggerEvent('veracite_critical');
    }
    // Véracité basse (< 25%)
    else if (this.values.veracite < thresholds.veracite.low && !this.triggeredThresholds.veracite.low) {
      this.triggeredThresholds.veracite.low = true;
      this.triggerEvent('veracite_low');
    }
    // Véracité haute (> 75%) - rare!
    if (this.values.veracite > thresholds.veracite.high && !this.triggeredThresholds.veracite.high) {
      this.triggeredThresholds.veracite.high = true;
      this.triggerEvent('veracite_high');
    }

    // Transpiration haute (> 70%)
    if (this.values.transpiration > thresholds.transpiration.high && !this.triggeredThresholds.transpiration.high) {
      this.triggeredThresholds.transpiration.high = true;
      this.triggerEvent('transpiration_high');
    }
    // Transpiration critique (> 90%)
    if (this.values.transpiration > thresholds.transpiration.critical && !this.triggeredThresholds.transpiration.critical) {
      this.triggeredThresholds.transpiration.critical = true;
      this.triggerEvent('transpiration_critical');
    }

    // Foutage haut (> 80%)
    if (this.values.foutage > thresholds.foutage.high && !this.triggeredThresholds.foutage.high) {
      this.triggeredThresholds.foutage.high = true;
      this.triggerEvent('foutage_high');
    }
    // Foutage critique (> 95%)
    if (this.values.foutage > thresholds.foutage.critical && !this.triggeredThresholds.foutage.critical) {
      this.triggeredThresholds.foutage.critical = true;
      this.triggerEvent('foutage_critical');
    }

    // Réinitialiser les seuils si les valeurs reviennent à la normale
    if (this.values.veracite >= thresholds.veracite.low + 10) {
      this.triggeredThresholds.veracite.low = false;
      this.triggeredThresholds.veracite.critical = false;
    }
    if (this.values.veracite <= thresholds.veracite.high - 10) {
      this.triggeredThresholds.veracite.high = false;
    }
    if (this.values.transpiration <= thresholds.transpiration.high - 10) {
      this.triggeredThresholds.transpiration.high = false;
      this.triggeredThresholds.transpiration.critical = false;
    }
    if (this.values.foutage <= thresholds.foutage.high - 10) {
      this.triggeredThresholds.foutage.high = false;
      this.triggeredThresholds.foutage.critical = false;
    }
  },

  /**
   * Déclenche un événement de seuil
   * @param {string} eventType - Type d'événement
   */
  triggerEvent(eventType) {
    const events = {
      veracite_critical: {
        message: "⚠ ALERTE: NIVEAU DE VÉRITÉ CRITIQUE",
        effect: () => {
          UIManager.triggerShake();
          AudioManager.playCrowdReaction('gasp');
        }
      },
      veracite_low: {
        message: "⚠ ATTENTION: CRÉDIBILITÉ EN CHUTE",
        effect: () => {
          AudioManager.playCrowdReaction('murmur');
        }
      },
      veracite_high: {
        message: "✓ INCROYABLE: MOMENT DE VÉRITÉ DÉTECTÉ",
        effect: () => {
          AudioManager.playCrowdReaction('applause');
        }
      },
      transpiration_high: {
        message: "💧 SUEUR VISIBLE SUR LE PLATEAU",
        effect: () => {
          document.body.classList.add('sweat-effect');
          setTimeout(() => document.body.classList.remove('sweat-effect'), 3000);
        }
      },
      transpiration_critical: {
        message: "💧💧 PANIQUE TOTALE - TRANSPIRATION MAXIMALE",
        effect: () => {
          UIManager.triggerShake();
          document.body.classList.add('sweat-effect');
          AudioManager.playCrowdReaction('gasp');
        }
      },
      foutage_high: {
        message: "🎭 INSOLENCE MAXIMALE DÉTECTÉE",
        effect: () => {
          AudioManager.playCrowdReaction('murmur');
        }
      },
      foutage_critical: {
        message: "🎭🎭 FOUTAGE DE GUEULE INSOUTENABLE",
        effect: () => {
          // Mini-chaos de 3 secondes
          UIManager.triggerShake();
          document.body.classList.add('mini-chaos');
          AudioManager.playCrowdReaction('gasp');
          setTimeout(() => document.body.classList.remove('mini-chaos'), 3000);
        }
      }
    };

    const event = events[eventType];
    if (event) {
      UIManager.addTerminalLine(event.message, true);
      if (event.effect) event.effect();
    }
  },

  /**
   * Arrête la récupération passive
   */
  stop() {
    if (this.recoveryInterval) {
      clearInterval(this.recoveryInterval);
      this.recoveryInterval = null;
    }
  }
};

/**
 * Normalise le texte pour la détection de mots-clés
 * @param {string} text - Texte à normaliser
 * @returns {string} - Texte normalisé (minuscules, sans accents)
 */
function normalizeText(text) {
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s]/g, ' ');   // Remplacer la ponctuation par des espaces
}

/**
 * Récupère une cross-response entre deux politiciens
 * @param {number} fromLocalIndex - Index local du politicien qui réagit
 * @param {number} toLocalIndex - Index local du politicien ciblé
 * @returns {string|null} - Une réponse ou null si pas de relation
 */
function getCrossResponse(fromLocalIndex, toLocalIndex) {
  // Convertir les indices locaux en indices globaux
  const fromGlobalIndex = CONFIG.selectedIndices[fromLocalIndex];
  const toGlobalIndex = CONFIG.selectedIndices[toLocalIndex];

  // Vérifier si une relation existe
  const fromRelations = CONFIG.crossResponses[fromGlobalIndex];
  if (!fromRelations) return null;

  const responses = fromRelations[toGlobalIndex];
  if (!responses || responses.length === 0) return null;

  // Retourner une réponse aléatoire
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Détecte les mots-clés dans une question et renvoie les modificateurs d'émotion
 * @param {string} question - Question à analyser
 * @returns {Object} - Modificateurs par politicien { index: 'screaming' | 'sweating' | null }
 */
function detectKeywords(question) {
  const normalized = normalizeText(question);
  const words = normalized.split(/\s+/);
  const modifiers = {};

  Object.entries(CONFIG.politicianProfiles).forEach(([index, profile]) => {
    // Vérifier les mots-clés déclencheurs (colère)
    for (const keyword of profile.triggerKeywords) {
      if (words.some(word => word.includes(keyword) || keyword.includes(word))) {
        // Appliquer avec probabilité basée sur la volatilité
        if (Math.random() < profile.volatility) {
          modifiers[index] = 'screaming';
        }
        break;
      }
    }

    // Vérifier les mots-clés de faiblesse (sueur) si pas déjà déclenché
    if (!modifiers[index]) {
      for (const keyword of profile.weakKeywords) {
        if (words.some(word => word.includes(keyword) || keyword.includes(word))) {
          if (Math.random() < profile.volatility) {
            modifiers[index] = 'sweating';
          }
          break;
        }
      }
    }
  });

  return modifiers;
}

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

      // Détecter les mots-clés pour les réactions personnalisées
      AppState.keywordModifiers = detectKeywords(question);

      // Log des mots-clés détectés
      const triggeredPoliticians = Object.keys(AppState.keywordModifiers);
      if (triggeredPoliticians.length > 0) {
        console.log("Mots-clés détectés:", AppState.keywordModifiers);
      }

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

      // Espacement entre les réactions (en ms)
      const reactionSpacing = 1800;
      let currentDelay = 300; // Délai initial

      // Collecter les réactions à jouer
      const reactions = [];

      // D'abord, ajouter les réactions basées sur les mots-clés
      const keywordModifiers = AppState.keywordModifiers || {};
      Object.entries(keywordModifiers).forEach(([indexStr, emotion]) => {
        const politicianIndex = parseInt(indexStr);
        reactions.push({
          politicianIndex,
          emotion,
          isKeyword: true
        });
      });

      // Ensuite, ajouter quelques réactions de la séquence mélodique (pas toutes)
      const sequence = AppState.currentMelodySequence || [];
      // Ne garder que 2-3 réactions de la séquence pour éviter la cacophonie
      const filteredSequence = sequence
        .filter(item => !keywordModifiers[item.politicianIndex]) // Exclure ceux déjà déclenchés par mot-clé
        .slice(0, 3); // Maximum 3 réactions supplémentaires

      filteredSequence.forEach(item => {
        reactions.push({
          politicianIndex: item.politicianIndex,
          emotion: item.emotion,
          isKeyword: false
        });
      });

      // Jouer les réactions une par une avec espacement
      let extraDelay = 0; // Pour les cross-responses ajoutées

      reactions.forEach((reaction, index) => {
        const delay = currentDelay + (index * reactionSpacing) + extraDelay;

        setTimeout(() => {
          const { politicianIndex, emotion, isKeyword, isCrossResponse, crossResponseText } = reaction;

          // Mettre à jour l'état du politicien
          AppState.setPoliticianState(politicianIndex, emotion);
          UIManager.updatePoliticianState(politicianIndex, emotion, false, crossResponseText);
          AudioManager.playSound(politicianIndex, emotion, emotion === 'screaming');

          // Mettre à jour le terminal
          let prefix = isKeyword ? '[MOT-CLÉ] ' : '';
          if (isCrossResponse) prefix = '[INTERPELLATION] ';
          const politicianName = CONFIG.politicians[politicianIndex];
          const displayText = crossResponseText
            ? `${prefix}${politicianName}: "${crossResponseText}"`
            : `${prefix}${politicianName}: ${emotion.toUpperCase()}`;
          UIManager.addTerminalLine(displayText);

          // Mettre à jour les métriques d'audience
          AppState.updateMetricsBasedOnEmotion(emotion);

          // Mettre à jour les barres (Véracité, Transpiration, Foutage)
          BarManager.applyReaction(politicianIndex, emotion);

          // Réinitialiser après un délai
          setTimeout(() => {
            AppState.setPoliticianState(politicianIndex, 'idle');
            UIManager.updatePoliticianState(politicianIndex, 'idle', false);
          }, 5000);
        }, delay);

        // Vérifier si un autre politicien doit réagir à celui-ci (cross-response)
        if (!reaction.isCrossResponse && Math.random() < (CONFIG.crossResponseChance || 0.2)) {
          // Trouver un autre politicien qui peut réagir
          const otherIndices = [0, 1, 2].filter(i => i !== reaction.politicianIndex);
          const randomOther = otherIndices[Math.floor(Math.random() * otherIndices.length)];

          const crossText = getCrossResponse(randomOther, reaction.politicianIndex);
          if (crossText) {
            // Ajouter une cross-response après cette réaction
            extraDelay += reactionSpacing / 2; // Petit délai supplémentaire
            const crossDelay = delay + reactionSpacing / 2;

            setTimeout(() => {
              // Cross-response - le politicien réagit au premier
              AppState.setPoliticianState(randomOther, 'shouting');
              UIManager.updatePoliticianState(randomOther, 'shouting', false, crossText);
              AudioManager.playSound(randomOther, 'shouting', false);

              const otherName = CONFIG.politicians[randomOther];
              UIManager.addTerminalLine(`[INTERPELLATION] ${otherName}: "${crossText}"`);

              AppState.updateMetricsBasedOnEmotion('shouting');
              BarManager.applyReaction(randomOther, 'shouting');

              setTimeout(() => {
                AppState.setPoliticianState(randomOther, 'idle');
                UIManager.updatePoliticianState(randomOther, 'idle', false);
              }, 2000);
            }, crossDelay);
          }
        }
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
          }, 5000);
        }
      }, 5000);
    },
    
    /**
     * Affiche l'écran de démarrage avec les personnages sélectionnés
     */
    showStartScreen() {
      // Sélectionner 3 personnages aléatoires
      selectRandomCharacters();

      // Afficher les personnages sur l'écran de démarrage
      this.updateStartScreenCharacters();

      // Configurer les boutons de l'écran de démarrage
      document.getElementById('reroll-button').addEventListener('click', () => {
        this.rerollCharacters();
      });

      document.getElementById('start-button').addEventListener('click', () => {
        this.startSession();
      });
    },

    /**
     * Met à jour l'affichage des personnages sur l'écran de démarrage
     */
    updateStartScreenCharacters() {
      const container = document.getElementById('start-characters');
      container.innerHTML = '';

      for (let i = 0; i < CONFIG.politicians.length; i++) {
        const charDiv = document.createElement('div');
        charDiv.className = 'start-character';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'name';
        nameDiv.textContent = CONFIG.politicians[i];

        const faceDiv = document.createElement('div');
        faceDiv.className = 'ascii-face';
        faceDiv.textContent = CONFIG.selectedFaces.idle[i];

        charDiv.appendChild(nameDiv);
        charDiv.appendChild(faceDiv);
        container.appendChild(charDiv);
      }
    },

    /**
     * Reroll: sélectionne 3 nouveaux personnages aléatoires
     */
    rerollCharacters() {
      selectRandomCharacters();
      this.updateStartScreenCharacters();
    },

    /**
     * Démarre la session de jeu (appelé quand on clique sur COMMENCER)
     */
    startSession() {
      // Cacher l'écran de démarrage
      document.getElementById('start-screen').classList.add('hidden');

      // Afficher le conteneur principal
      document.querySelector('.container').classList.remove('hidden');

      // Initialiser l'état
      AppState.init();

      // Initialiser les barres de métriques
      BarManager.init();

      // Initialiser les effets CRT
      UIManager.initCRTEffects();

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
  window.addEventListener('DOMContentLoaded', () => App.showStartScreen());
