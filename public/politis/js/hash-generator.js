/**
 * Générateur de Hash pour l'interface politique
 * Version simplifiée mais compatible avec le nouveau CONFIG
 */

const HashGenerator = {
  /**
   * Génère un hash numérique à partir d'une chaîne de texte
   * Le même texte produira toujours le même hash
   * @param {string} text - Texte à convertir en hash
   * @return {number} - Valeur numérique du hash
   */
  generateHashFromText(text) {
    if (!text) return 0;
    
    // Normaliser le texte (minuscules, sans accents, sans espaces)
    const normalizedText = text.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9]/g, ''); // Supprimer les caractères non alphanumériques
    
    let hash = 0;
    
    // Analyse des fréquences de lettres
    const letterCounts = {};
    for (let i = 0; i < normalizedText.length; i++) {
      const char = normalizedText[i];
      letterCounts[char] = (letterCounts[char] || 0) + 1;
    }
    
    // Calcul du hash basé sur divers facteurs
    hash += normalizedText.length * 37; // Longueur du texte
    
    // Fréquences de lettres
    Object.keys(letterCounts).forEach((char, index) => {
      const count = letterCounts[char];
      const charCode = char.charCodeAt(0);
      hash += (charCode * count * (index + 1)) % 1000;
    });
    
    // Analyse des n-grammes (paires de lettres consécutives) pour plus de diversité
    let ngramValue = 0;
    for (let i = 0; i < normalizedText.length - 1; i++) {
      const ngram = normalizedText.substring(i, i + 2);
      const ngramCode = ngram.charCodeAt(0) * 26 + ngram.charCodeAt(1);
      ngramValue += ngramCode * (i + 1);
    }
    hash += ngramValue % 2000;
    
    // Motifs spécifiques (questions, mots-clés, etc.)
    if (normalizedText.includes('pourquoi')) hash += 257;
    if (normalizedText.includes('comment')) hash += 173;
    if (normalizedText.includes('quand')) hash += 119;
    if (normalizedText.includes('politique')) hash += 433;
    if (normalizedText.includes('gouvernement')) hash += 367;
    if (normalizedText.includes('economie')) hash += 283;
    if (normalizedText.includes('immigration')) hash += 521;
    if (normalizedText.includes('scandale')) hash += 631;
    if (normalizedText.includes('corruption')) hash += 713;
    if (normalizedText.includes('france')) hash += 191;
    
    // Utilisation de caractères spécifiques pour ajouter de la variété
    const specialChars = ['?', '!', '.', ',', ':', ';', '-', '_', '\'', '"'];
    specialChars.forEach((char, index) => {
      const count = (text.match(new RegExp('\\' + char, 'g')) || []).length;
      hash += count * (index + 1) * 13;
    });
    
    // Limiter à la plage définie dans la configuration
    hash = hash % CONFIG.hashAlgorithm.maxHashValue;
    
    return hash;
  },
  
  /**
   * Convertit un hash en une représentation visuelle
   * @param {number} hash - Valeur du hash
   * @return {string} - Représentation formatée du hash
   */
  formatHash(hash) {
    return hash.toString().padStart(4, '0');
  },
  
  /**
   * Analyse le texte pour déterminer un pattern mélodique approprié
   * @param {string} text - Texte à analyser
   * @param {number} hash - Valeur de hash pour la randomisation
   * @return {string} - Type de pattern à utiliser
   */
  determinePatternType(text, hash) {
    if (!text) return 'standard';
    
    const normalizedText = text.toLowerCase();
    
    // Déterminer le type de pattern en fonction du contenu
    if (normalizedText.includes('?') || 
        normalizedText.includes('pourquoi') || 
        normalizedText.includes('comment')) {
      return 'question';
    }
    
    if (normalizedText.includes('!') || 
        normalizedText.includes('inacceptable') || 
        normalizedText.includes('scandale') ||
        normalizedText.includes('honte')) {
      return 'crescendo';
    }
    
    if (normalizedText.length > 100 || 
        (normalizedText.match(/[,;:]/) || []).length > 3) {
      return 'syncopé';
    }
    
    if (hash % 3 === 0) {
      return 'contrepoint';
    }
    
    return 'standard';
  },
  
  /**
   * Convertit un hash en séquence mélodique
   * @param {number} hash - Valeur du hash
   * @return {Array} - Séquence d'émotions et de politiciens
   */
  hashToMelodySequence(hash) {
    const sequence = [];
    const emotionMap = CONFIG.hashAlgorithm.emotionMap;
    
    // Utiliser la nouvelle configuration pour le pattern, si elle existe
    const patternTypes = CONFIG.hashAlgorithm.patternTypes || ['standard'];
    const patternType = patternTypes[hash % patternTypes.length];
    
    // Déterminer la longueur de séquence (plus variable maintenant)
    const sequenceLength = CONFIG.hashAlgorithm.defaultSequenceLength;
    
    const numPoliticians = CONFIG.politicians.length;
    
    // Utiliser le hash pour générer une séquence déterministe
    let seedValue = hash;
    
    // Obtenir les patterns de timing, s'ils existent
    const patternTimings = CONFIG.hashAlgorithm.patternTimings && 
                           CONFIG.hashAlgorithm.patternTimings[patternType];
    
    for (let i = 0; i < sequenceLength; i++) {
      // Utiliser différentes parties du hash pour chaque itération
      seedValue = (seedValue * 1664525 + 1013904223) % 4294967296;
      
      // Dériver l'indice du politicien (0-5)
      const politicianIndex = seedValue % numPoliticians;
      
      // Dériver l'émotion
      const emotionIndex = Math.floor((seedValue / numPoliticians) % emotionMap.length);
      const emotion = emotionMap[emotionIndex];
      
      // Calculer le timing en fonction du pattern
      let timing = 1.0; // Timing par défaut
      
      if (patternTimings && patternTimings.length > 0) {
        timing = patternTimings[i % patternTimings.length];
      } else {
        // Patterns de timing de base si les configurations modernes ne sont pas disponibles
        switch (patternType) {
          case 'question':
            timing = i % 2 === 0 ? 1.0 : 0.8;
            break;
          case 'crescendo':
            timing = 1.2 - (i * 0.1);
            break;
          case 'syncopé':
            timing = i % 2 === 0 ? 0.6 : 1.3;
            break;
          case 'contrepoint':
            timing = i % 2 === 0 ? 1.0 : 0.9;
            break;
        }
      }
      
      sequence.push({
        politicianIndex,
        emotion,
        timing
      });
    }
    
    return sequence;
  },
  
  /**
   * Génère une prévisualisation texte de la mélodie
   * @param {Array} sequence - Séquence mélodique
   * @return {string} - Représentation textuelle de la mélodie
   */
  generateMelodyPreview(sequence) {
    if (!sequence || sequence.length === 0) return '...';
    
    // Essayer de détecter le type de pattern en fonction des timings
    let patternType = "Standard";
    if (sequence.length >= 3 && sequence[0].timing) {
      const timings = sequence.map(item => item.timing || 1.0);
      
      if (timings[0] > timings[timings.length-1]) {
        patternType = "Crescendo";
      } else if (Math.abs(timings[0] - timings[1]) > 0.3) {
        patternType = "Syncopé";
      } else if (timings[0] === 1.0 && timings[1] === 0.8) {
        patternType = "Question";
      }
    }
    
    // Créer la représentation visuelle
    const preview = sequence.map(item => {
      const politicianAbbr = `P${item.politicianIndex + 1}`;
      let emotionSymbol = '?';
      
      switch (item.emotion) {
        case 'screaming': emotionSymbol = '!!'; break;
        case 'shouting': emotionSymbol = '!'; break;
        case 'sweating': emotionSymbol = '~'; break;
        case 'idle': emotionSymbol = '-'; break;
      }
      
      // Ajouter des indicateurs de timing si disponible
      if (item.timing) {
        if (item.timing < 0.8) {
          return `${politicianAbbr}${emotionSymbol}►`; // Rapide
        } else if (item.timing > 1.2) {
          return `${politicianAbbr}${emotionSymbol}▻▻`; // Lent
        }
      }
      
      return `${politicianAbbr}${emotionSymbol}`;
    }).join(' → ');
    
    return `[${patternType}] ${preview}`;
  }
};