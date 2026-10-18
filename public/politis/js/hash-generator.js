/**
 * Générateur de Hash pour l'interface politique
 * Convertit les questions en valeurs de hash déterministes et en séquences mélodiques
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
      
      // Motifs spécifiques (questions, mots-clés, etc.)
      if (normalizedText.includes('pourquoi')) hash += 257;
      if (normalizedText.includes('comment')) hash += 173;
      if (normalizedText.includes('quand')) hash += 119;
      if (normalizedText.includes('politique')) hash += 433;
      if (normalizedText.includes('gouvernement')) hash += 367;
      if (normalizedText.includes('economie')) hash += 283;
      
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
     * Convertit un hash en séquence mélodique
     * @param {number} hash - Valeur du hash
     * @return {Array} - Séquence d'émotions et de politiciens
     */
    hashToMelodySequence(hash) {
      const sequence = [];
      const emotionMap = CONFIG.hashAlgorithm.emotionMap;
      const sequenceLength = CONFIG.hashAlgorithm.defaultSequenceLength;
      const numPoliticians = CONFIG.politicians.length;
      
      // Utiliser le hash pour générer une séquence déterministe
      let seedValue = hash;
      
      for (let i = 0; i < sequenceLength; i++) {
        // Utiliser différentes parties du hash pour chaque itération
        seedValue = (seedValue * 1664525 + 1013904223) % 4294967296;
        
        // Dériver l'indice du politicien (0-5)
        const politicianIndex = seedValue % numPoliticians;
        
        // Dériver l'émotion
        const emotionIndex = Math.floor((seedValue / numPoliticians) % emotionMap.length);
        const emotion = emotionMap[emotionIndex];
        
        sequence.push({
          politicianIndex,
          emotion
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
      
      return sequence.map(item => {
        const politicianAbbr = `P${item.politicianIndex + 1}`;
        let emotionSymbol = '?';
        
        switch (item.emotion) {
          case 'screaming': emotionSymbol = '!!'; break;
          case 'shouting': emotionSymbol = '!'; break;
          case 'sweating': emotionSymbol = '~'; break;
          case 'idle': emotionSymbol = '-'; break;
        }
        
        return `${politicianAbbr}${emotionSymbol}`;
      }).join(' → ');
    }
  };