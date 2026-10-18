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

          // Démarrer l'ambiance sonore du studio
          setTimeout(() => this.startAmbiance(), 500);
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

      // Obtient la fréquence de base pour cette émotion et ce politicien
      const frequencies = CONFIG.audio.frequencies;
      const baseFrequency = frequencies[emotion] ?
        frequencies[emotion][index % frequencies[emotion].length] :
        frequencies['idle'][index % frequencies['idle'].length];

      // Obtient le type d'oscillateur pour cette émotion
      const waveform = CONFIG.audio.waveforms[emotion] || 'sine';

      // Obtient le temps d'attaque pour cette émotion
      const attackTime = CONFIG.audio.attackTime[emotion] || 0.05;

      // Obtient la fréquence de coupure du filtre passe-bas
      const lowpassCutoff = CONFIG.audio.lowpassCutoff[emotion] || 3000;

      // Obtient les intervalles d'accord pour cette émotion
      const chordIntervals = CONFIG.audio.chordIntervals[emotion] || [1];

      // Volume de base (plus élevé pour chaos, réduit par le nombre de voix)
      let baseVolume;
      if (emotion === 'chaos') {
        baseVolume = CONFIG.audio.chaosVolume || 0.5;
      } else if (useVoiceEffect) {
        baseVolume = CONFIG.audio.voiceEffectVolume;
      } else {
        baseVolume = CONFIG.audio.baseVolume;
      }
      const voiceVolume = baseVolume / chordIntervals.length;

      try {
        const oscillators = [];
        const gainNodes = [];
        const vibratos = [];

        // Durée de la note
        const releaseDuration = useVoiceEffect ?
          CONFIG.audio.noteDuration * 1.5 :
          CONFIG.audio.noteDuration;

        // Créer un filtre passe-bas global pour adoucir le son
        const lowpassFilter = this.audioContext.createBiquadFilter();
        lowpassFilter.type = 'lowpass';
        lowpassFilter.frequency.value = lowpassCutoff;
        lowpassFilter.Q.value = 1; // Q bas pour une transition douce

        // Gain master pour tous les oscillateurs
        const masterGain = this.audioContext.createGain();
        masterGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        masterGain.gain.linearRampToValueAtTime(baseVolume, this.audioContext.currentTime + attackTime);
        masterGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + releaseDuration);

        // Créer un oscillateur pour chaque note de l'accord
        chordIntervals.forEach((interval, voiceIndex) => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();

          // Type d'oscillateur selon l'émotion
          oscillator.type = waveform;

          // Fréquence avec l'intervalle d'accord
          const freq = baseFrequency * interval;
          oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);

          // Volume individuel
          gainNode.gain.setValueAtTime(voiceVolume, this.audioContext.currentTime);

          // Ajouter un léger désaccord pour plus de richesse (sauf pour la fondamentale)
          if (voiceIndex > 0) {
            const detune = (Math.random() - 0.5) * 10; // ±5 cents
            oscillator.detune.setValueAtTime(detune, this.audioContext.currentTime);
          }

          oscillators.push(oscillator);
          gainNodes.push(gainNode);
        });

        // Ajouter vibrato pour les effets de voix
        let vibrato = null;
        let vibratoGain = null;
        if (useVoiceEffect) {
          vibrato = this.audioContext.createOscillator();
          vibratoGain = this.audioContext.createGain();
          // Vibrato plus subtil
          vibrato.frequency.value = 5 + (Math.random() * 2); // 5-7 Hz
          vibratoGain.gain.value = 2 + (Math.random() * 2);  // 2-4 Hz de profondeur
          vibrato.connect(vibratoGain);

          // Connecter le vibrato à tous les oscillateurs
          oscillators.forEach(osc => {
            vibratoGain.connect(osc.frequency);
          });

          vibrato.start();
          vibrato.stop(this.audioContext.currentTime + releaseDuration);
          vibratos.push(vibrato);
        }

        // Ajouter du bruit filtré pour les consonnes (effets de voix uniquement)
        let noiseGain = null;
        if (useVoiceEffect && Math.random() < 0.3) { // 30% de chance
          const noiseBuffer = this.createNoiseBuffer();
          const noise = this.audioContext.createBufferSource();
          noise.buffer = noiseBuffer;

          // Filtre le bruit pour le rendre moins strident
          const noiseFilter = this.audioContext.createBiquadFilter();
          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.value = 2000;
          noiseFilter.Q.value = 2;

          noiseGain = this.audioContext.createGain();
          noiseGain.gain.setValueAtTime(0.02, this.audioContext.currentTime);
          noiseGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.15);

          noise.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(masterGain);
          noise.start();
          noise.stop(this.audioContext.currentTime + 0.15);
        }

        // Connecter la chaîne audio
        if (useVoiceEffect && this.formantFilters[index]) {
          // Avec filtres formants
          oscillators.forEach((osc, i) => {
            osc.connect(gainNodes[i]);

            // Appliquer les filtres formants
            let currentNode = gainNodes[i];
            this.formantFilters[index].forEach(filter => {
              currentNode.connect(filter);
              currentNode = filter;
            });
            currentNode.connect(lowpassFilter);
          });
        } else {
          // Sans filtres formants
          oscillators.forEach((osc, i) => {
            osc.connect(gainNodes[i]);
            gainNodes[i].connect(lowpassFilter);
          });
        }

        // Connecter le filtre passe-bas au gain master puis à la destination
        lowpassFilter.connect(masterGain);
        masterGain.connect(this.audioContext.destination);

        // Démarrer tous les oscillateurs
        oscillators.forEach(osc => {
          osc.start();
          osc.stop(this.audioContext.currentTime + releaseDuration);
        });

        // Enregistrer tous les noeuds pour pouvoir les arrêter
        this.oscillators[index] = {
          oscillators,
          gainNodes,
          masterGain,
          lowpassFilter,
          vibrato,
          vibratoGain,
          vibratos,
          formants: useVoiceEffect ? this.formantFilters[index] : null,
          noiseGain
        };

        // Nettoie après la fin
        oscillators[0].onended = () => {
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

          // Réduire progressivement le gain master pour éviter les clics
          if (nodes.masterGain) {
            nodes.masterGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.05);
          }

          // Arrêter tous les oscillateurs et nettoyage
          setTimeout(() => {
            // Arrêter tous les oscillateurs d'accord
            if (nodes.oscillators) {
              nodes.oscillators.forEach(osc => {
                try { osc.stop(); } catch (e) { /* déjà arrêté */ }
              });
            }
            // Arrêter le vibrato
            if (nodes.vibrato) {
              try { nodes.vibrato.stop(); } catch (e) { /* déjà arrêté */ }
            }
            if (nodes.vibratos) {
              nodes.vibratos.forEach(v => {
                try { v.stop(); } catch (e) { /* déjà arrêté */ }
              });
            }
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
        
        // En mode chaos, utiliser l'émotion 'chaos' pour des sons plus intenses
        const finalEmotion = chaosModeActive ? 'chaos' : emotion;
        
        setTimeout(() => {
          // 60% de chance d'utiliser l'effet de voix pour les hurlements
          // 100% en mode chaos
          const useVoiceEffect = ((finalEmotion === 'screaming' || finalEmotion === 'chaos') &&
            (Math.random() < 0.6 || chaosModeActive));

          this.playSound(politicianIndex, finalEmotion, useVoiceEffect);

          // Ajouter une légère variation de fréquence pour plus de naturel
          if (this.audioContext && this.oscillators[politicianIndex]) {
            const variation = (Math.random() * 20) - 10; // +/- 10 Hz (réduit de 25)
            const nodes = this.oscillators[politicianIndex];
            if (nodes.oscillators && nodes.oscillators.length > 0) {
              nodes.oscillators.forEach(osc => {
                const currentFreq = osc.frequency.value;
                osc.frequency.setValueAtTime(
                  currentFreq + variation,
                  this.audioContext.currentTime + 0.1
                );
              });
            }
          }

          if (onNoteCallback) {
            onNoteCallback(politicianIndex, finalEmotion);
          }
        }, index * noteSpacing);
      });

      return sequence;
    },

    // ==========================================
    // AMBIANCE ET SONS D'ATMOSPHÈRE
    // ==========================================

    ambianceInterval: null,

    /**
     * Démarre l'ambiance sonore du studio TV
     * Sons occasionnels subtils (pas de drone constant)
     */
    startAmbiance() {
      if (!this.initialized || this.ambianceInterval) return;

      // Jouer des sons d'ambiance occasionnels
      this.ambianceInterval = setInterval(() => {
        if (Math.random() < 0.3) { // 30% de chance toutes les 4-8 secondes
          this.playAmbianceSound();
        }
      }, 4000 + Math.random() * 4000);
    },

    /**
     * Joue un son d'ambiance aléatoire
     */
    playAmbianceSound() {
      if (!this.initialized) return;

      const sounds = ['camera', 'paper', 'cough'];
      const sound = sounds[Math.floor(Math.random() * sounds.length)];

      try {
        const gain = this.audioContext.createGain();
        gain.connect(this.audioContext.destination);

        switch (sound) {
          case 'camera':
            // Flash/clic d'appareil photo - bruit court et net
            const clickBuffer = this.createNoiseBuffer();
            const click = this.audioContext.createBufferSource();
            click.buffer = clickBuffer;

            const clickFilter = this.audioContext.createBiquadFilter();
            clickFilter.type = 'highpass';
            clickFilter.frequency.value = 3000;

            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.04, this.audioContext.currentTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);

            click.connect(clickFilter);
            clickFilter.connect(gain);
            click.start();
            click.stop(this.audioContext.currentTime + 0.1);
            break;

          case 'paper':
            // Bruissement de papier
            const paperBuffer = this.createNoiseBuffer();
            const paper = this.audioContext.createBufferSource();
            paper.buffer = paperBuffer;

            const paperFilter = this.audioContext.createBiquadFilter();
            paperFilter.type = 'bandpass';
            paperFilter.frequency.value = 4000;
            paperFilter.Q.value = 1;

            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.02, this.audioContext.currentTime + 0.05);
            gain.gain.linearRampToValueAtTime(0.015, this.audioContext.currentTime + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

            paper.connect(paperFilter);
            paperFilter.connect(gain);
            paper.start();
            paper.stop(this.audioContext.currentTime + 0.3);
            break;

          case 'cough':
            // Toussotement distant - bruit grave court
            const coughBuffer = this.createNoiseBuffer();
            const cough = this.audioContext.createBufferSource();
            cough.buffer = coughBuffer;

            const coughFilter = this.audioContext.createBiquadFilter();
            coughFilter.type = 'lowpass';
            coughFilter.frequency.value = 800;

            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.025, this.audioContext.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

            cough.connect(coughFilter);
            coughFilter.connect(gain);
            cough.start();
            cough.stop(this.audioContext.currentTime + 0.2);
            break;
        }
      } catch (error) {
        // Silencieux en cas d'erreur
      }
    },

    /**
     * Arrête l'ambiance sonore
     */
    stopAmbiance() {
      if (this.ambianceInterval) {
        clearInterval(this.ambianceInterval);
        this.ambianceInterval = null;
      }
    },

    /**
     * Joue une réaction de la foule
     * @param {string} type - Type de réaction: 'gasp', 'murmur', 'applause'
     */
    playCrowdReaction(type) {
      if (!this.initialized) return;

      try {
        const noiseBuffer = this.createNoiseBuffer();
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();

        switch (type) {
          case 'gasp':
            // Hoquet de surprise - bruit court et aigu
            filter.type = 'bandpass';
            filter.frequency.value = 1500;
            filter.Q.value = 3;
            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);
            noise.start();
            noise.stop(this.audioContext.currentTime + 0.3);
            break;

          case 'murmur':
            // Murmure de désapprobation - bruit grave et long
            filter.type = 'lowpass';
            filter.frequency.value = 300;
            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.04, this.audioContext.currentTime + 0.2);
            gain.gain.linearRampToValueAtTime(0.03, this.audioContext.currentTime + 0.8);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.5);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);
            noise.start();
            noise.stop(this.audioContext.currentTime + 1.5);
            break;

          case 'applause':
            // Applaudissements - bruit filtré rythmique
            filter.type = 'highpass';
            filter.frequency.value = 2000;
            gain.gain.setValueAtTime(0, this.audioContext.currentTime);

            // Créer un effet de vagues d'applaudissements
            for (let i = 0; i < 5; i++) {
              const t = this.audioContext.currentTime + i * 0.15;
              gain.gain.linearRampToValueAtTime(0.06, t);
              gain.gain.linearRampToValueAtTime(0.03, t + 0.1);
            }
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1.2);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);
            noise.start();
            noise.stop(this.audioContext.currentTime + 1.2);
            break;
        }
      } catch (error) {
        console.error("Échec de la réaction de foule:", error);
      }
    }
  };
