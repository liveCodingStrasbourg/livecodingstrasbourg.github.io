/**
 * Gestionnaire Audio pour l'interface politique
 * Gère toutes les fonctionnalités audio de l'application
 */

const AudioManager = {
    audioContext: null,
    oscillators: {},
    initialized: false,
    formantFilters: [],
    
    /**
     * Initialise le contexte audio
     */
    init() {
      try {
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          this.initialized = true;
          
          // Créer les filtres formants pour les voix synthétiques
          this.createFormantFilters();
        }
        document.getElementById('audio-warning').style.display = 'none';
      } catch (error) {
        console.error("Échec de l'initialisation du gestionnaire audio:", error);
        document.getElementById('audio-warning').style.display = 'block';
      }
      return this.initialized;
    },
    
    /**
     * Crée les filtres formants pour simuler des voix
     */
    createFormantFilters() {
      // Réinitialiser les filtres existants
      this.formantFilters = [];
      
      // Créer différents ensembles de filtres formants pour chaque politicien
      for (let i = 0; i < CONFIG.politicians.length; i++) {
        const formantSet = [];
        
        // Chaque voix a 3 filtres formants principaux
        for (let j = 0; j < 3; j++) {
          const filter = this.audioContext.createBiquadFilter();
          filter.type = 'bandpass';
          
          // Fréquences des formants variées par politicien (légèrement aléatoires mais déterministes)
          const baseCenterFreq = [500, 1500, 2500][j];
          // Utiliser l'index du politicien pour rendre la voix unique mais déterministe
          const centerFreq = baseCenterFreq * (0.8 + (0.4 * (i / CONFIG.politicians.length)));
          
          filter.frequency.value = centerFreq;
          filter.Q.value = 10 + (i * 2); // Largeur de bande différente pour chaque politicien
          
          formantSet.push(filter);
        }
        
        this.formantFilters.push(formantSet);
      }
    },
    
    /**
     * Joue un son pour un politicien et une émotion donnés avec effets de voix
     * @param {number} index - Index du politicien
     * @param {string} emotion - Émotion à exprimer
     * @param {boolean} useVoiceEffect - Utiliser l'effet de voix
     */
    playSound(index, emotion, useVoiceEffect = false) {
      if (!this.initialized) {
        const initialized = this.init();
        if (!initialized) return;
      }
      
      // Arrête tout son existant
      this.stopSound(index);
      
      // Obtient la fréquence pour cette émotion et ce politicien
      const frequencies = CONFIG.audio.frequencies;
      const frequency = frequencies[emotion][index % frequencies[emotion].length];
      
      try {
        // Crée l'oscillateur
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Type d'oscillateur selon l'émotion
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        // Enveloppe de volume
        const volume = useVoiceEffect ? 0.6 : 0.3;
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
        
        // Déclin plus long pour l'effet de voix
        const releaseDuration = useVoiceEffect ? 
          CONFIG.audio.noteDuration * 1.5 : 
          CONFIG.audio.noteDuration;
        
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + releaseDuration);
        
        // Ajouter des filtres pour les effets de voix
        if (useVoiceEffect && this.formantFilters[index]) {
          // Créer un noeud d'onde modulante pour simuler une vibration vocale
          const vibrato = this.audioContext.createOscillator();
          const vibratoGain = this.audioContext.createGain();
          vibrato.frequency.value = 8 + (Math.random() * 3); // Augmenté de 6 à 8
          vibratoGain.gain.value = 5 + (Math.random() * 3); 
          vibrato.connect(vibratoGain);
          vibratoGain.connect(oscillator.frequency);
          vibrato.start();
          vibrato.stop(this.audioContext.currentTime + releaseDuration);
          
          // Ajouter du bruit pour les consonnes
          let noiseGain = null;
          if (Math.random() < 0.4) { // 40% de chance d'ajouter du bruit
            const noiseBuffer = this.createNoiseBuffer();
            const noise = this.audioContext.createBufferSource();
            noise.buffer = noiseBuffer;
            noiseGain = this.audioContext.createGain();
            noiseGain.gain.setValueAtTime(0.03, this.audioContext.currentTime);
            noiseGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.2);
            noise.connect(noiseGain);
            noiseGain.connect(this.audioContext.destination);
            noise.start();
            noise.stop(this.audioContext.currentTime + 0.2);
          }
          
          // Appliquer les filtres formants
          let currentNode = oscillator;
          this.formantFilters[index].forEach(filter => {
            currentNode.connect(filter);
            currentNode = filter;
          });
          currentNode.connect(gainNode);
          
          // Enregistrer tous les noeuds pour pouvoir les arrêter
          this.oscillators[index] = { 
            oscillator, gainNode, vibrato, vibratoGain, formants: this.formantFilters[index], noiseGain 
          };
        } else {
          // Connecter directement sans filtres formants
          oscillator.connect(gainNode);
          this.oscillators[index] = { oscillator, gainNode };
        }
        
        // Connecter à la destination
        gainNode.connect(this.audioContext.destination);
        
        // Démarrer l'oscillateur
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + releaseDuration);
        
        // Nettoie après la fin
        oscillator.onended = () => {
          if (this.oscillators[index]) {
            delete this.oscillators[index];
          }
        };
      } catch (error) {
        console.error(`Échec de lecture du son pour le politicien ${index}:`, error);
      }
    },
    
    /**
     * Crée un buffer de bruit pour les effets de voix
     * @returns {AudioBuffer} - Buffer de bruit blanc
     */
    createNoiseBuffer() {
      const bufferSize = this.audioContext.sampleRate * 2.0; // 2 secondes de bruit
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const output = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      return buffer;
    },
    
    /**
     * Arrête le son d'un politicien
     * @param {number} index - Index du politicien à silencer
     */
    stopSound(index) {
      if (this.oscillators[index]) {
        try {
          const nodes = this.oscillators[index];
          
          // Réduire progressivement le gain pour éviter les clics
          if (nodes.gainNode) {
            nodes.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.05);
          }
          
          // Arrêter tous les oscillateurs et nettoyage
          setTimeout(() => {
            if (nodes.oscillator) nodes.oscillator.stop();
            if (nodes.vibrato) nodes.vibrato.stop();
            delete this.oscillators[index];
          }, 100);
          
        } catch (error) {
          console.error(`Échec de l'arrêt du son pour le politicien ${index}:`, error);
        }
      }
    },
    
    /**
     * Joue une séquence mélodique basée sur un hash
     * @param {number} hash - Valeur de hash pour générer la mélodie
     * @param {function} onNoteCallback - Fonction de rappel pour chaque note jouée
     * @param {boolean} chaosModeActive - Si le mode chaos est actif
     */
    playMelodyFromHash(hash, onNoteCallback, chaosModeActive = false) {
      if (!this.initialized) {
        const initialized = this.init();
        if (!initialized) return;
      }
      
      // Convertir le hash en une séquence d'émotions
      const sequence = HashGenerator.hashToMelodySequence(hash);
      console.log("Séquence mélodique:", sequence);
      
      // Déterminer le timing des notes (plus rapide en mode chaos)
      const noteSpacing = chaosModeActive ? 
        CONFIG.audio.noteSpacing / 2 : // Deux fois plus rapide en mode chaos
        CONFIG.audio.noteSpacing;
      
      // Jouer la séquence en planifiant chaque note
      sequence.forEach((item, index) => {
        const { politicianIndex, emotion } = item;
        
        // En mode chaos, tous les politiciens sont en colère et hurlent
        const finalEmotion = chaosModeActive ? 'screaming' : emotion;
        
        setTimeout(() => {
          // 30% de chance d'utiliser l'effet de voix pour les hurlements
          // 100% en mode chaos
          const useVoiceEffect = (finalEmotion === 'screaming' && (Math.random() < 0.3 || chaosModeActive));
          
          this.playSound(politicianIndex, finalEmotion, useVoiceEffect);
         
         
          if (this.audioContext && this.oscillators[politicianIndex]) {
            const variation = (Math.random() * 50) - 25; // +/- 25 Hz
            const nodes = this.oscillators[politicianIndex];
            if (nodes.oscillator) {
              const currentFreq = nodes.oscillator.frequency.value;
              nodes.oscillator.frequency.setValueAtTime(
                currentFreq + variation, 
                this.audioContext.currentTime + 0.1
              );
            }
          } 
          

          if (onNoteCallback) {
            onNoteCallback(politicianIndex, finalEmotion);
          }
        }, index * noteSpacing);
      });
      
      return sequence;
    }
  };
