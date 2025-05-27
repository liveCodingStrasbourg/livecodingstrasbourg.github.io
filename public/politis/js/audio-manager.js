/**
 * Gestionnaire Audio pour l'interface politique
 * Version simplifiée mais compatible avec le nouveau CONFIG
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
      
      // Utiliser les profils vocaux du CONFIG si disponibles, sinon utiliser des valeurs par défaut
      const formantProfile = CONFIG.audio.voiceParams.formantFreqs[i] || [500, 1500, 2500];
      
      // Chaque voix a 3 filtres formants principaux
      for (let j = 0; j < 3; j++) {
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        
        filter.frequency.value = formantProfile[j];
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
      if (emotion === 'screaming' || emotion === 'chaos') {
        oscillator.type = 'sawtooth'; // Plus riche en harmoniques
      } else if (emotion === 'shouting') {
        oscillator.type = 'square'; // Ton plus agressif
      } else {
        oscillator.type = 'triangle'; // Plus doux
      }
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      
      // Enveloppe de volume - Volume plus fort pour le chaos et les cris
      let volume = 0.3;
      if (useVoiceEffect) {
        volume = emotion === 'chaos' ? 0.7 : 0.5;
      }
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      
      // Obtenir la durée de la note depuis CONFIG
      const noteDuration = typeof CONFIG.audio.noteDuration === 'object' 
        ? (CONFIG.audio.noteDuration[emotion] || 0.5)
        : CONFIG.audio.noteDuration;
      
      // Déclin plus long pour l'effet de voix
      const releaseDuration = useVoiceEffect ? 
        noteDuration * 1.5 : 
        noteDuration;
      
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + releaseDuration);
      
      // Ajouter des filtres pour les effets de voix
      if (useVoiceEffect && this.formantFilters[index]) {
        // Créer un noeud d'onde modulante pour simuler une vibration vocale
        const vibrato = this.audioContext.createOscillator();
        const vibratoGain = this.audioContext.createGain();
        
        // Obtenir les paramètres de vibrato depuis CONFIG
        let vibratoSpeed, vibratoDepth;
        
        if (typeof CONFIG.audio.voiceParams.vibratoSpeed === 'object' && 
            CONFIG.audio.voiceParams.vibratoSpeed[emotion]) {
          const range = CONFIG.audio.voiceParams.vibratoSpeed[emotion];
          vibratoSpeed = range[0] + (Math.random() * (range[1] - range[0]));
        } else {
          vibratoSpeed = 6 + (Math.random() * 3);
        }
        
        if (typeof CONFIG.audio.voiceParams.vibratoDepth === 'object' && 
            CONFIG.audio.voiceParams.vibratoDepth[emotion]) {
          const range = CONFIG.audio.voiceParams.vibratoDepth[emotion];
          vibratoDepth = range[0] + (Math.random() * (range[1] - range[0]));
        } else {
          vibratoDepth = 5 + (Math.random() * 3);
        }
        
        vibrato.frequency.value = vibratoSpeed;
        vibratoGain.gain.value = vibratoDepth; 
        
        vibrato.connect(vibratoGain);
        vibratoGain.connect(oscillator.frequency);
        vibrato.start();
        vibrato.stop(this.audioContext.currentTime + releaseDuration);
        
        // Ajouter du bruit pour les consonnes
        let noiseGain = null;
        if (emotion === 'chaos' || Math.random() < 0.4) { // 40% de chance d'ajouter du bruit, toujours en chaos
          const noiseBuffer = this.createNoiseBuffer();
          const noise = this.audioContext.createBufferSource();
          noise.buffer = noiseBuffer;
          noiseGain = this.audioContext.createGain();
          
          // Niveau de bruit plus élevé en mode chaos
          const noiseLevel = emotion === 'chaos' ? 0.1 : 0.03;
          noiseGain.gain.setValueAtTime(noiseLevel, this.audioContext.currentTime);
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
    let baseNoteSpacing;
    
    if (typeof CONFIG.audio.noteSpacing === 'object') {
      baseNoteSpacing = chaosModeActive 
        ? CONFIG.audio.noteSpacing.chaos || 180
        : CONFIG.audio.noteSpacing.standard || 400;
    } else {
      baseNoteSpacing = chaosModeActive 
        ? CONFIG.audio.noteSpacing / 2 
        : CONFIG.audio.noteSpacing;
    }
    
    // Jouer la séquence en planifiant chaque note
    let cumulativeDelay = 0;
    
    sequence.forEach((item, index) => {
      const { politicianIndex, emotion, timing } = item;
      
      // Utiliser le timing personnalisé pour cette note (si disponible)
      const noteDelay = timing ? timing * baseNoteSpacing : baseNoteSpacing;
      
      // En mode chaos, tous les politiciens sont en colère et hurlent
      const finalEmotion = chaosModeActive ? 'chaos' : emotion;
      
      setTimeout(() => {
        // Probabilité plus élevée d'utiliser l'effet de voix pour les hurlements
        const useVoiceEffect = (finalEmotion === 'screaming' && (Math.random() < 0.5 || chaosModeActive)) ||
                              (finalEmotion === 'chaos');
        
        this.playSound(politicianIndex, finalEmotion, useVoiceEffect);
       
        // Ajouter des variations de fréquence pour un effet plus naturel
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
      }, cumulativeDelay);
      
      cumulativeDelay += noteDelay;
    });
    
    return sequence;
  }
};