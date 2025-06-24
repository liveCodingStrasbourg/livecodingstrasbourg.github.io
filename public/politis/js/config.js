/**
 * Configuration de l'application d'Interface Politique
 * Ce fichier contient tous les textes et paramètres facilement modifiables
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
    
    // Réponses des politiciens pour chaque émotion
    responses: {
      screaming: [
        "PRÉJUGÉ MÉDIATIQUE HONTEUX!",
        "J'AVAIS TOUT PREVU",
        "LES IMMIGRES",
        "MAIS SI ON AVAIT ECOUTE LA THEORIE DU RUISSELLEMENT",
        "MAIS CE REPAS A PERMIS DE FAIRE DU CHIFFRE",
        "C'EST WOKE",
        "ISLAMOGAUCHISME",
        "MAIS JE CONNAIS LA REPONSE",
        "C'EST DE LA CENSURE!",
        "ILS VOUS MENTENT!",
        "C'EST LA FAUTE DE LA GAUCHE",
        "PROPAGANDE PURE!",
        "AGENDA RADICAL!"
      ],
      shouting: [
        "JE N'AI JAMAIS DIT ÇA!",
        "MÉDIAS MENSONGERS!",
        "LE PAPE EST WOKE",
        "ON PEUT PARLER DE RACISME ANTIBLANC",
        "NOS CHIFFRES DISENT LE CONTRAIRE",
        "FAITES PAYER LES PRISONNIERS",
        "C'EST PAS UNE QUESTION DE COULEUR DE PEAU",
        "J'AI UN AMI NOIR",
        "MAIS MAIS .. MAIS",
        "CE QU'IL FAUT SAVOIR",
        "GRAND REMPLACEMENT!!!",
        "LES FAITS ??? JE VAIS VOUS DIRE...",
        "ALLEZ AU BAGNE !",
        "IL FAUDRAIT VOUS PRIVATISER !!!",
        "TROUVE UN VRAI TRAVAIL",
        "C ETAIT UN PLACEMENT...",
        "RACISME ANTI BLANC!",
        "FAITES VOS RECHERCHES"
      ],
      sweating: [
        "LFI doit être dissolu...",
        "mais j'ai déclaré mes impôts...",
        "A l'époque...",
        "non mais vous voyez",
        "mais c'est une mairie de gauche!",
        "des pistes cyclables ????",
        "c'est une opération de communication!!!",
        "j'ai publié un livre, j'ai déjà tout dit",
        "mais Mr. Poutine, c'est, ... ",
        "l'important c'est la fierté nationale",
        "et vous vous êtes un bon français???",
        "mais cet argent, je. Enfin c'est un petit appartement",
        "un héritage que je vous dit",
        "jamais. jamais. Enfin. Une seule fois",
        "Mais ce lundi, j'étais chez moi...",
        "ma femme peut en témoigner...",
        "j'étais bourré..."
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

        "V̷̖̲̑̐Ø̵̻̱͝Ų̴̖͊̽͜Ṣ̵̯̋̅̕ ̷͙͑̄́Ņ̵͇̑̾̿'̴̪̻̏Ę̸̮̑̌̚C̶̰̯̀̔H̷̜̑̿͝Ā̷̭͔̽P̵̯̘̦̈́P̸̗͑Ȅ̴̖̙͠R̵̬͓̾̾̕E̵̢̳̱͒̀Z̵̘̤̐ ̴̦͂͑͝P̷̳̠̌͆͂A̷͍̿S̴̡̀̂̎!̶̥̕"
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
      // Fréquences pour chaque émotion (en Hz)
      frequencies: {
        'idle': [262, 294, 330, 349, 392, 440], // C4 à A4
        'screaming': [659, 698, 784, 880, 988, 1047], // E5 à C6
        'shouting': [523, 587, 659, 698, 784, 880], // C5 à A5
        'sweating': [196, 220, 247, 262, 294, 330], // G3 à E4
        'chaos': [880, 932, 988, 1047, 1109, 1175] // Fréquences plus élevées pour le chaos
      },
      
      // Durée des notes (en secondes)
      noteDuration: 0.5,
      
      // Temps entre les notes (en millisecondes)
      noteSpacing: 400,
      
      // Paramètres des formants vocaux
      voiceParams: {
        formantFreqs: [500, 1500, 2500], // Fréquences de base des formants
        vibratoSpeed: [5, 7],  // Plage de vitesse du vibrato
        vibratoDepth: [2, 4]   // Plage de profondeur du vibrato
      }
    },
    
    // Paramètres de l'algorithme de hachage
    hashAlgorithm: {
      maxHashValue: 10000, // Valeur maximale du hash
      emotionMap: ['idle', 'screaming', 'shouting', 'sweating'],
      defaultSequenceLength: 8 // Nombre de notes dans la mélodie
    },
    
    // Paramètres du mode chaos
    chaosMode: {
      minQuestions: 5,  // Minimum de questions avant déclenchement possible
      maxQuestions: 20,  // Maximum de questions avant déclenchement garanti
      chaosDuration: 12000, // Durée du mode chaos en ms
      chaosSequenceLength: 12, // Longueur de la séquence en mode chaos
      publicSupportRange: [0, 100] // Plage du soutien public en mode chaos
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