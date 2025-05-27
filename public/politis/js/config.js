/**
 * Configuration de l'application d'Interface Politique
 * Version améliorée avec des réactions plus variées
 */

const CONFIG = {
  // Noms des politiciens
  politicians: [
    "JORDAN BARDELLA",
    "LAURENT WAUQUIEZ", 
    "PHILIPPE DE VILLIERS",
    "MARINE LE PEN",
    "GERALD DARMANIN",
    "BRUNO RETAILLEAU"
  ],
  
  // Visages ASCII pour différentes émotions
  faces: {
    idle: [
      "⟨ ⦾_⦾ ⟩",
      "⟪ ·_· ⟫",
      "【 -_- 】",
      "〔 •_• 〕",
      "『 $_$ 』",
      "《 0_0 》"
    ],
    screaming: [
      "⟨ O̲_O̲ ⟩",
      "⟪ @̲_@̲ ⟫",
      "【 D̲:̲<̲ 】",
      "〔 ◉̲_◉̲ 〕",
      "『 д̲_д̲ 』",
      "《 ☉̲_☉̲ 》"
    ],
    shouting: [
      "⟨ >:O ⟩",
      "⟪ ò̷_ó̷ ⟫",
      "【 ಠ̷_ಠ̷ 】",
      "〔 ಠ̷益̷ಠ̷ 〕",
      "『 ͠°̷ ͟ʖ̷ ͡°̷ 』",
      "《 ꐦ̷°̷᷄д̷°̷᷅ 》"
    ],
    sweating: [
      "⟨ o_o;; ⟩",
      "⟪ ⊙﹏⊙;; ⟫",
      "【 ╥﹏╥;; 】",
      "〔 ⊙︿⊙;; 〕",
      "『 ﾟ﹏ﾟ;; 』",
      "《 ﾟдﾟ;; 》"
    ],
    chaos: [
      "⟨ Ö̴̤̯͔̫͉͘_̷̨̱̺̳̩̔̈Ö̶̟̼̰̽̚ ⟩",
      "⟪ @̶̢̰̹̮̂̎̓͠_̸̝̦̔́̏͘@̸̧͎͚̀̐̃̎̒ ⟫",
      "【 D̶̛̜̬̬̝̍̈́:̸̫̯̞̃́̕:̴̺͠≮̙̯̋̈́̾̐͜<̶̺̱̲͓̙̄͛ 】",
      "〔 ◉̶̜̱̏̐̕͜_̴̼̰̀̈̃͛◉̸̨͚̯̖͊̆̿ 〕",
      "『 д̴̱̼̦̎̾̎̿_̵̲̬͒д̶̡̯̳̥̄̆͒̽ 』",
      "《 ☉̷̧̭͊_̸̳̀̀̐☉̴͓̤̯̌ 》"
    ]
  },
  
  // Réponses des politiciens pour chaque émotion - AMÉLIORÉ avec plus de variété
  responses: {
    screaming: [
      "PRÉJUGÉ MÉDIATIQUE HONTEUX!",
      "C'EST DE LA CENSURE!",
      "ILS VOUS MENTENT!",
      "C'EST LA FAUTE DE LA GAUCHE",
      "PROPAGANDE PURE!",
      "AGENDA RADICAL!",
      "IMMIGRATIONNISTE!",
      "FAKE NEWS ABSOLUE!",
      "MANIPULATION DES MASSES!",
      "COMPLOT MÉDIATIQUE!",
      "PENSÉE UNIQUE INSUPPORTABLE!",
      "DICTATURE INTELLECTUELLE!",
      "DÉMAGO SCANDALEUSE!",
      "INACCEPTABLE IDÉOLOGIE!",
      "LES FRANCAIS SOUFFRENT!",
      "ANTI-FRANCE!",
      "WOKISME EN MARCHE!",
      "PERSÉCUTION SYSTÉMATIQUE!",
      "TRAHISON DE LA RÉPUBLIQUE!",
      "MANIPULATION DANGEREUSE!"
    ],
    shouting: [
      "JE N'AI JAMAIS DIT ÇA!",
      "MÉDIAS MENSONGERS!",
      "LE PAPE EST WOKE",
      "ON PEUT PARLER DE RACISME ANTIBLANC",
      "NOS CHIFFRES DISENT LE CONTRAIRE",
      "FAITES PAYER LES PRISONNIERS",
      "ALLEZ AU BAGNE !",
      "RACISME ANTI BLANC!",
      "FAITES VOS RECHERCHES!",
      "L'IMMIGRATION NOUS COÛTE!",
      "LA FRANCE DISPARAÎT!",
      "NOS TRADITIONS SONT MENACÉES!",
      "GRAND REMPLACEMENT!",
      "REGARDEZ LES CHIFFRES RÉELS!",
      "JE L'AI DIT ET RÉPÉTÉ!",
      "SONDAGES TRUQUÉS!",
      "L'ÉTAT NOUS MENT!",
      "LES COMPLICES DU DÉSORDRE!",
      "PRISE D'OTAGE PAR LES SYNDICATS!",
      "ON NOUS CACHE LA VÉRITÉ!",
      "L'INSÉCURITÉ EXPLOSE!",
      "TOUT ÇA C'EST SOROS!",
      "BILL GATES VEUT NOUS PISTER!",
      "LES FONCTIONNAIRES SONT TROP PAYÉS!",
      "L'EUROPE NOUS DICTE TOUT!"
    ],
    sweating: [
      "LFI doit être dissolu...",
      "mais j'ai déclaré mes impôts...",
      "A l'époque...",
      "Mais ce lundi, j'étais chez moi...",
      "ma femme peut en témoigner...",
      "j'étais bourré...",
      "le contexte était différent...",
      "ce n'est pas ce que j'ai voulu dire...",
      "mes propos ont été déformés...",
      "il faut replacer dans le contexte...",
      "les médias ont mal compris...",
      "c'était une plaisanterie...",
      "le micro était coupé...",
      "je n'avais pas tous les éléments...",
      "j'ai été mal conseillé...",
      "c'était un lapsus regrettable...",
      "mes financements sont légaux...",
      "ce n'est pas moi sur la photo...",
      "je ne connaissais pas cette personne...",
      "c'était un déjeuner de travail...",
      "l'appartement de fonction est justifié...",
      "je n'ai pas fait exprès...",
      "mais c'était pour la France...",
      "c'est un complot contre moi...",
      "ce n'était pas dans ma circonscription..."
    ],
    chaos: [
      "CHAOS! CHAOS! CHAOS!",
      "L̵̡̺̗͍̤͚̥̩̩͙̥̣̞̙̂͆͊̀̈́͆̍̓̽̽͋̂̚͘Ȅ̵̛̼̣̗̲̼̞͙̜̦̟̞̄̽̌̐͗̌̚͜͠ ̵̡̥͈̪͓͔̺̰̗̙̜̼̳̹̊̓̑P̷̧̨̰͖̞̟͕͈̺̊͌̏́̅̒͆́̍̈́́̕Ȩ̴̳̠̬̞͖͐̐̏̒͋͋͒͋̓̚U̵͍̗̦̖̯͊̌̃̋͌̇͒̓̈́̕͘͝͝P̴̡͕̟̮̜̟̟̣̫̣̑̾͑̽̔̀͘͜ͅL̴͚̮̤̭̤̞̺͉̾̅̐͐̈́̄̽͋̍̕̕E̸̢̡̨̯̺̠̻̠̘̭̞̓̒ ̵̢̛̖͚̻̩̥̰̈́̐͂̈́̿̅̑͝A̵̻̤̱̦̗̫̮̪̭̘̙̓̾̑͆͆͊̋͜͠ ̸̬̪̼̼̗̞̗͙̺̱͎̒͝F̴̧̗͇̯̳̠̮̪̙̟͙̟͚̆̿̌̓̍̾̍͛̓͝͝A̶̡̯̬̠̻̰̘̺̥̭̻͐͆͜͜I̵̡̨̧̛̞̬̫͓̓̉̓̈̌̐̅̔̈́̄͘͝Ṃ̸̨̨̨̧͎̺̩̦̩̮͚̖̰̏̋̑̐̇̌͗̈!",
      "TOUT BRÛLERA!",
      "SOCIÉTÉ CORROMPUE!",
      "LA FAUTE AUX IMMIGRES",
      "MARINE, SAUVE NOUS",
      "RIEN A FOUTRE",
      "NON NON MAIS NOOOONN",
      "V̷̖̲̑̐Ø̵̻̱͝Ų̴̖͊̽͜Ṣ̵̯̋̅̕ ̷͙͑̄́Ņ̵͇̑̾̿'̴̪̻̏Ę̸̮̑̌̚C̶̰̯̀̔H̷̜̑̿͝Ā̷̭͔̽P̵̯̘̦̈́P̸̗͑Ȅ̴̖̙͠R̵̬͓̾̾̕E̵̢̳̱͒̀Z̵̘̤̐ ̴̦͂͑͝P̷̳̠̌͆͂A̷͍̿S̴̡̀̂̎!̶̥̕",
      "Ȩ̵̭̀̄̔̒͌̀̏̇̽̽̎̀̚͠Ň̵̡̧̯̪̭̰̟̗͙̹̦̆ͅͅ ̶̨̧̧̛͔̳̪̙̺͓̞̂͒̉̓͌̂̔͊̆͜͝M̵̢̟̮̘̯͎̣̪͎̪̈́́͌́̀̌́͌̑͌̒̈́̂̑ͅA̴̳̼̣̩̳͉̬̖̐́R̸͇̯̥̠̪̦̪̥̄̉̔̇͗̏̓̎̌͐̉͆C̸̢̞̖̘̘̦̦̼̦̹̰̪͋ͅH̴̢̢̻̙̺̣͖͓̩̲̞̠̥͆͐̕͜Ë̵͍͈̇",
      "Ö̵̞́N̸̫̈́ ̸̙̍Ḻ̶̉E̶̢̐Š̵͈ ̸̧̎Ä̶̲́Ú̷̲R̶̦̓A̵̤͠!̶̫̈́",
      "F̶̟̄R̸͖̓A̵̧̚N̸̹̎C̶͎̆E̶̪͂ ̸̦̿D̷̜͠'̵̮̽A̴̜̽B̶̡̑O̸̙̾R̸̥̋D̵̙̎!̵͉̍",
      "W̷O̸K̷I̵S̸M̵E̵ ̶C̴U̷L̸T̶U̷R̸E̵L̸!̶",
      "L̴E̵S̶ ̷É̴L̴I̷T̷E̸S̸ ̴N̴O̷U̶S̴ ̸M̵É̶P̷R̸I̵S̸E̴N̸T̵!̴",
      "L̸O̴B̷B̵Y̴S̸ ̸T̶O̷U̸T̸ ̸P̵U̵I̷S̷S̵A̷N̵T̸S̴!̶",
      "M̴̨̧̟̙̬͉̎͗̌̿̇̽̏̍͠Ǫ̵̧͙̠͇̘͖̞̦̠̪̯̓̃̐́̎̉̀̌̒̈̈́͐̒͋̋̈́͘͝R̸̛̥̠̼̼̬̻̻̯̹̩̈̂̓͗͒̽̐̊̚͘̕͜Ţ̵̨̟̤͎̰̳͇̯͉̹̫͇̦̈͌̎͗̊̅͆̌͊̀͂̑̾̚̚͠ ̸̤̝̯͛͐̊̍͒͂̀̑̒̍̍̀̑̏͝͝A̷̡̧̛̙̬̞̬̮̞̦̭̟̤̻̞̠̠̪̻̾͊̈́̒̇̊̐͂̌͜͝͝ͅU̸̩͇̰̯̜̹̠̦̫̜̭̥͎̭̬̠̇̐̂̍̓͐͂̑͝͠ͅẊ̴̘̮͔̖̹͎̹̼̙̘͔͍͔̜̫͐͊̏̒̎́̈͗̏͊͝ ̶̛̯͚͚̼̘̙̑̅̀̀̐̊̃͑̊̃̔̔͘͘T̵̡̛̲̝̞̠͚͓͙̗͖̯̩̜̱̅̋̀͆͝ͅͅŖ̴̛̟̪̩̻̲͗̇̓́͊̈́̔̉͂͂̾̊̚͜͠A̸̡̢̦̞͎̘̮̳̹̱̺̱̙̮̞̯͆͒̊̽̒͑͒̈̊̇́̎̀̔̍̈́̒̕͜ͅḮ̶̫͕̗̰̯̀̊̑̓̃͋T̶̛̛̼͎̭͒̈́̓̒͑̃̃̾̒̍̽͠R̶̦̮͈̦̻̆̔̀̀͑̐E̶̢̢̨̜̲̪̙͕͓̫̞̠̤͈̩̋͜S̴̤̞̰̟̫͌͌͗̕ͅ!̸̲̗͓͖͚̘͓̀̈́̿̈̌̽̊̃̉̀̿͘͝͠",
      "D̴̯̣̱͉̖͙̑͑́͋͂́́̾͌̃͊̑̑͘̚É̴̝̲̞̻̖̫̪̗̗̲̥͕͋́̉̀̂̀͗̊̔̎̕͝S̴̢̳̻̠̲̭̯̙̞̣̦͕̀Ö̴͚̰̩̦͚̲̣͚̤̺͕̯͓͈͙̤́̓́̑͗̌͗̀̈́̃̌́̄͑̉̚B̵̡̮́̃̉́́̀̎͆́̂̈́É̶̡̢̧̛̛̜̮͕͇̩̼͖̽̌͒̂́̊͛͐̽͋̚͜͠͝I̸̱̥̜͎̪̖̩͕̹̼̥̼̿͊̓͊́̑̾̀̄̓͑́̓̏̏̎͐ͅS̸̨̱̘̦̫̥̘͉̱̥̥̞̱̯̑̌̂̐̌̅͗͛̾̀̽̐̍̇̚S̸̛͖͇̘̜̣̦̝̥̞̗̹̦͚̿̾̒͛̆̍̍̍͐͒̕̕͘͝͝A̶̯̼̭̭̥̭͋̎́͛͊̊̄̈̅̽̽̾̕̚̚͝͝ͅŇ̶̨̛̳̹̠͓̯͙̼̗̼͈͚̗̔̑͒͂̎͑͂̊̒͐̚̚͠͝ͅͅC̷̡̧̗̝̗̹͖̦̲̳̏̅̓͒̔͑̒̓̿͋̽̊͆͜͝ͅE̴̲̠͇̥͚̘͖̰͔̳̋̂̈̽ ̸̠̖̱̺̈́̿̓̈́̅̈̆̿͂̓̉̐̈́̎̚͝C̸̨̧̨̡͈̦̘̙̯̝̜̝̮̳̈́͌Į̴̧̡̨̛̙͎̗̹̯̮̜̲͊̔̔̈́̿̄̓͛̄̄́̓͗̒V̸̧̡̢̻̞̭̦̰̗̻̈̔͛̐̈̿̉̇̐̒̆͑̆͘͝I̵̧̥̤̪̖̫̺̫̥̿̈̌̀̋̎́̐̋͝Ļ̸̢̛̳̣̼̮͓̬̮̞̰̺̱͇̻͔̉̈́̑̋͝ͅͅE̴̢̥̣̟̻̠̱͉̖̺̐͋̎͗!̴̼̟̹̬͉̯̊̍̉̾́͌̀͐̊̀͌͗̽̕͘̚̚"
    ]
  },
  
  // Messages du terminal
  terminalMessages: {
    initialization: [
      "Système initialisé...",
      "Chargement des profils politiques...",
      "Système de réaction en ligne.",
      "Conférence de presse prête."
    ],
    questionAsked: "Question posée: ",
    reactionSequence: "Séquence de réaction en cours...",
    politicianReaction: "Politique {index}: réaction {emotion}",
    error: "ERREUR: {message}",
    invalidEmotion: "Émotion invalide: {emotion}",
    hashGenerated: "Valeur de hachage générée: {hash}",
    melodyGenerated: "Séquence mélodique créée",
    chaosMode: {
      warning: "ATTENTION: INSTABILITÉ DÉTECTÉE",
      activated: "MODE CHAOS ACTIVÉ",
      metrics: "MÉTRIQUES DE VÉRITÉ CORROMPUES",
      system: "SYSTÈME COMPROMIS"
    }
  },
  
  // Paramètres audio
  audio: {
    // Fréquences pour chaque émotion (en Hz) - AMÉLIORÉ avec plus de variation
    frequencies: {
      'idle': [262, 294, 330, 349, 392, 440, 466, 494], // C4 à B4
      'screaming': [659, 698, 784, 880, 988, 1047, 1109, 1175], // E5 à D6
      'shouting': [523, 554, 587, 622, 659, 698, 740, 784], // C5 à G5
      'sweating': [196, 208, 220, 233, 247, 262, 277, 294], // G3 à D4
      'chaos': [830, 932, 1046, 1108, 1244, 1396, 1568, 1760] // Fréquences dissonantes
    },
    
    // Durée des notes (en secondes) - AMÉLIORÉ avec plus de précision
    noteDuration: {
      'idle': 0.4,
      'screaming': 0.6,
      'shouting': 0.5,
      'sweating': 0.3,
      'chaos': 0.7
    },
    
    // Temps entre les notes (en millisecondes)
    noteSpacing: {
      'standard': 400,
      'rapide': 250,
      'lent': 600,
      'chaos': 180
    },
    
    // Paramètres des formants vocaux - AMÉLIORÉ pour des voix plus réalistes
    voiceParams: {
      formantFreqs: [
        [400, 1000, 2300], // Voix masculine profonde
        [450, 1350, 2450], // Voix masculine médium
        [350, 950, 2200],  // Voix masculine grave
        [500, 1700, 2700], // Voix féminine
        [420, 1200, 2400], // Voix autoritaire
        [480, 1400, 2600]  // Voix nasillarde
      ],
      vibratoSpeed: {
        'idle': [4, 6],     // Plage de vitesse du vibrato (Hz)
        'screaming': [7, 12],
        'shouting': [6, 9],
        'sweating': [5, 8],
        'chaos': [8, 15]
      },
      vibratoDepth: {
        'idle': [2, 4],     // Plage de profondeur du vibrato (Hz)
        'screaming': [5, 10],
        'shouting': [4, 8],
        'sweating': [2, 5],
        'chaos': [10, 20]
      },
      distortion: {
        'idle': 0,
        'screaming': 30,
        'shouting': 15,
        'sweating': 5,
        'chaos': 80
      }
    },
    
    // Effets sonores additionnels pour le mode chaos
    chaosEffects: {
      echoDelay: 0.3,        // Délai d'écho en secondes
      echoFeedback: 0.4,     // Rétroaction de l'écho (0-1)
      noiseLevel: 0.15,      // Niveau de bruit (0-1)
      filterResonance: 15,   // Résonance des filtres (Q)
      pitchJump: 0.3         // Sauts de hauteur aléatoires (octaves)
    }
  },
  
  // Paramètres de l'algorithme de hachage - AMÉLIORÉ avec plus de variété
  hashAlgorithm: {
    maxHashValue: 10000, // Valeur maximale du hash
    emotionMap: ['idle', 'screaming', 'shouting', 'sweating'],
    defaultSequenceLength: 8, // Nombre de notes dans la mélodie
    patternTypes: [
      'standard',   // Motif aléatoire équilibré
      'question',   // Motif question-réponse
      'crescendo',  // Intensité progressive
      'syncopé',    // Rythme irrégulier
      'contrepoint' // Voix entrecroisées
    ],
    // Nouveaux paramètres de timing pour les motifs
    patternTimings: {
      'standard': [1.0, 1.0, 1.0, 1.0],
      'question': [1.0, 1.0, 0.8, 0.8],
      'crescendo': [1.2, 1.1, 0.9, 0.7],
      'syncopé': [0.6, 1.3, 0.6, 1.3],
      'contrepoint': [1.0, 0.9, 1.0, 0.9]
    },
    // Force avec laquelle les caractéristiques sémantiques influencent le motif
    semanticInfluence: 0.7
  },
  
  // Paramètres du mode chaos - AMÉLIORÉ pour des expériences plus intenses
  chaosMode: {
    minQuestions: 5,  // Minimum de questions avant déclenchement possible
    maxQuestions: 20,  // Maximum de questions avant déclenchement garanti
    chaosDuration: 15000, // Durée du mode chaos en ms (augmentée)
    chaosSequenceLength: 15, // Longueur de la séquence en mode chaos (augmentée)
    publicSupportRange: [0, 100], // Plage du soutien public en mode chaos
    chaosIntensity: {
      glitchFrequency: 200,      // Fréquence des glitches visuels (ms)
      voiceDistortion: 0.8,      // Niveau de distorsion vocale (0-1)
      screenShakeIntensity: 0.6  // Intensité des secousses d'écran (0-1)
    },
    // Probabilités d'émotions en mode chaos
    emotionProbabilities: {
      'screaming': 0.7,
      'shouting': 0.25,
      'sweating': 0.05
    }
  },
  
  // Textes d'interface
  interface: {
    warning: "CLIQUEZ POUR DEMARRER LE PLATEAU TV",
    systemStatus: "SYS.STATUS: [ACTIF]",
    systemWarning: "AVERTISSEMENT: VOLATILITÉ/INSTABILITE DÉTECTÉE",
    systemCode: "CODE: OVERTON",
    headerTitle: "CONFERENCE DE PRESSE",
    questionLabel: "Écrivez votre question :",
    questionPlaceholder: "Tapez votre question ici...",
    hashValueLabel: "Valeur de question:",
    melodyPreviewLabel: "Mélodie:",
    askButton: "Poser la Question",
    emotionsReference: "Référence des Émotions:",
    emotions: {
      screaming: {
        name: "hurlement",
        description: "Réaction d'indignation extrême"
      },
      shouting: {
        name: "cri",
        description: "Réponse défensive agressive"
      },
      sweating: {
        name: "sueur",
        description: "Réaction évasive nerveuse"
      },
      idle: {
        name: "neutre",
        description: "État neutre par défaut"
      },
      chaos: {
        name: "chaos",
        description: "Désordre total"
      }
    },
    metrics: {
      truthfulness: "Véracité",
      consistency: "Cohérence",
      publicSupport: "% de vote",
      outrage: "Indignation",
      support: "Soutien",
      skepticism: "Scepticisme",
      engagement: "Engagement"
    },
    chaos: {
      title: "PERTE DE MOYENS, PLUS D'ARGUMENTATION",
      warning: "MODE POPULISTE SCANDALISE",
      unstable: "INSTABILITÉ DÉTECTÉE"
    }
  }
};