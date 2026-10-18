/**
 * Configuration de l'application d'Interface Politique
 * Ce fichier contient tous les textes et paramètres facilement modifiables
 */

const CONFIG = {
    // ==========================================================
    // LISTE DES PERSONNAGES (16 au total, 3 sélectionnés au hasard)
    // ==========================================================
    allCharacters: [
      // Politiciens
      "JORDAN BARDELLA",
      "MARINE LE PEN",
      "ÉRIC CIOTTI",
      "NICOLAS SARKOZY",
      "ÉRIC ZEMMOUR",
      "MARION MARÉCHAL",
      "FRANÇOIS FILLON",
      "GÉRALD DARMANIN",
      "BRUNO RETAILLEAU",
      "NADINE MORANO",
      // Figures publiques
      "DIDIER RAOULT",
      "MICHEL ONFRAY",
      "PASCAL PRAUD",
      "VINCENT BOLLORÉ",
      "CYRIL HANOUNA",
      "ALAIN FINKIELKRAUT"
    ],

    // Sera rempli au démarrage avec 3 personnages aléatoires
    politicians: [],
    selectedIndices: [],

    // ==========================================================
    // PROFILS DE TOUS LES PERSONNAGES (mots-clés déclencheurs)
    // ==========================================================
    allProfiles: {
      0: { // JORDAN BARDELLA
        triggerKeywords: ["immigration", "frontiere", "identite", "rn", "rassemblement", "clandestin", "migrant"],
        weakKeywords: ["europeennes", "parlement", "jeune", "tiktok", "experience", "bac", "cv"],
        baseEmotion: "shouting",
        volatility: 0.8
      },
      1: { // MARINE LE PEN
        triggerKeywords: ["peuple", "nation", "souverainete", "frexit", "pen", "elites"],
        weakKeywords: ["russie", "poutine", "emprunt", "financement", "pere", "jean-marie", "proces"],
        baseEmotion: "shouting",
        volatility: 0.75
      },
      2: { // ÉRIC CIOTTI
        triggerKeywords: ["alliance", "droite", "rn", "union", "patriote", "nice"],
        weakKeywords: ["trahison", "exclusion", "lr", "republicains", "retournement"],
        baseEmotion: "shouting",
        volatility: 0.85
      },
      3: { // NICOLAS SARKOZY
        triggerKeywords: ["president", "securite", "travail", "merite", "france forte"],
        weakKeywords: ["libye", "kadhafi", "bygmalion", "proces", "mis en examen", "carla"],
        baseEmotion: "shouting",
        volatility: 0.7
      },
      4: { // ÉRIC ZEMMOUR
        triggerKeywords: ["grand remplacement", "civilisation", "islam", "reconquete", "identite"],
        weakKeywords: ["condamnation", "propos", "justice", "femmes", "sondages", "score"],
        baseEmotion: "screaming",
        volatility: 0.9
      },
      5: { // MARION MARÉCHAL
        triggerKeywords: ["conservateur", "tradition", "famille", "chretien", "reconquete"],
        weakKeywords: ["le pen", "nom", "tante", "grand-pere", "zemmour", "alliance"],
        baseEmotion: "shouting",
        volatility: 0.7
      },
      6: { // FRANÇOIS FILLON
        triggerKeywords: ["rigueur", "reformes", "travail", "courage", "verite"],
        weakKeywords: ["penelope", "emploi fictif", "costumes", "proces", "mis en examen", "general"],
        baseEmotion: "shouting",
        volatility: 0.6
      },
      7: { // GÉRALD DARMANIN
        triggerKeywords: ["interieur", "police", "ordre", "securite", "terrorisme", "expulsion"],
        weakKeywords: ["tourcoing", "accusation", "plainte", "lrem", "macron"],
        baseEmotion: "shouting",
        volatility: 0.7
      },
      8: { // BRUNO RETAILLEAU
        triggerKeywords: ["senat", "autorite", "ordre", "loi", "ferme"],
        weakKeywords: ["extreme", "modere", "alliance", "rn"],
        baseEmotion: "shouting",
        volatility: 0.6
      },
      9: { // NADINE MORANO
        triggerKeywords: ["france", "identite", "race", "valeurs", "fierte"],
        weakKeywords: ["race blanche", "propos", "polemique", "twitter", "derapage"],
        baseEmotion: "screaming",
        volatility: 0.85
      },
      10: { // DIDIER RAOULT
        triggerKeywords: ["hydroxychloroquine", "covid", "traitement", "science", "ihu", "marseille"],
        weakKeywords: ["etude", "lancet", "ordre", "medecins", "sanctions", "methodologie"],
        baseEmotion: "screaming",
        volatility: 0.9
      },
      11: { // MICHEL ONFRAY
        triggerKeywords: ["peuple", "gauche", "trahison", "philosophie", "hedonisme"],
        weakKeywords: ["woke", "islamo-gauchisme", "contradiction", "zemmour"],
        baseEmotion: "shouting",
        volatility: 0.75
      },
      12: { // PASCAL PRAUD
        triggerKeywords: ["liberte", "expression", "woke", "censure", "verite"],
        weakKeywords: ["cnews", "objectivite", "polemique", "bollore", "audience"],
        baseEmotion: "screaming",
        volatility: 0.85
      },
      13: { // VINCENT BOLLORÉ
        triggerKeywords: ["media", "entreprise", "succes", "industrie", "strategie"],
        weakKeywords: ["cnews", "europe1", "jdd", "extreme droite", "influence", "afrique"],
        baseEmotion: "sweating",
        volatility: 0.5
      },
      14: { // CYRIL HANOUNA
        triggerKeywords: ["tpmp", "audience", "emission", "direct", "clash"],
        weakKeywords: ["arcom", "sanctions", "bollore", "derapage", "polemique", "niveau"],
        baseEmotion: "shouting",
        volatility: 0.8
      },
      15: { // ALAIN FINKIELKRAUT
        triggerKeywords: ["culture", "identite", "france", "academie", "civilisation", "litterature"],
        weakKeywords: ["gilets jaunes", "sioniste", "insulte", "agression", "polemique", "racisme"],
        baseEmotion: "screaming",
        volatility: 0.85
      }
    },

    // Sera rempli dynamiquement
    politicianProfiles: {},
    
    // Visages ASCII pour différentes émotions (16 variations pour chaque état)
    faces: {
      idle: [
        "-_-",     // 0: Bardella
        "=_=",     // 1: Le Pen
        "-.-",     // 2: Ciotti
        "'_'",     // 3: Sarkozy
        ">_>",     // 4: Zemmour
        "^_^",     // 5: Maréchal
        "._.",     // 6: Fillon
        "-_-",     // 7: Darmanin
        "=.=",     // 8: Retailleau
        "o_o",     // 9: Morano
        "*_*",     // 10: Raoult
        "-.-",     // 11: Onfray
        ">_<",     // 12: Praud
        "._.",     // 13: Bolloré
        "^o^",     // 14: Hanouna
        "~_~"      // 15: Finkielkraut
      ],
      screaming: [
        "O_O!",    // 0: Bardella
        "O0O!",    // 1: Le Pen
        "@_@!",    // 2: Ciotti
        "O_O!",    // 3: Sarkozy
        "0_0!",    // 4: Zemmour
        "O_O!",    // 5: Maréchal
        "@_@",     // 6: Fillon
        "O_O",     // 7: Darmanin
        "O_O!",    // 8: Retailleau
        "O0O",     // 9: Morano
        "O_O",     // 10: Raoult
        "O_O?",    // 11: Onfray
        "O_O!",    // 12: Praud
        "0_0",     // 13: Bolloré
        "O0O!",    // 14: Hanouna
        "O~O!"     // 15: Finkielkraut
      ],
      shouting: [
        ">`<",     // 0: Bardella
        ">#<",     // 1: Le Pen
        ">_<",     // 2: Ciotti
        ">.<",     // 3: Sarkozy
        ">=<",     // 4: Zemmour
        ">#<",     // 5: Maréchal
        ">_<",     // 6: Fillon
        ">=<",     // 7: Darmanin
        ">-<",     // 8: Retailleau
        ">#<",     // 9: Morano
        ">O<",     // 10: Raoult
        ">_>",     // 11: Onfray
        ">=<",     // 12: Praud
        ">_<",     // 13: Bolloré
        ">0<",     // 14: Hanouna
        ">~<"      // 15: Finkielkraut
      ],
      sweating: [
        "o_o;",    // 0: Bardella
        ";_;'",    // 1: Le Pen
        "T_T;",    // 2: Ciotti
        ";.;'",    // 3: Sarkozy
        "x_x;",    // 4: Zemmour
        "o.o;",    // 5: Maréchal
        ";_;;",    // 6: Fillon
        "-.-'",    // 7: Darmanin
        "._.;",    // 8: Retailleau
        "o_o;",    // 9: Morano
        "'_';",    // 10: Raoult
        "-_-'",    // 11: Onfray
        ";_;'",    // 12: Praud
        "._.'",    // 13: Bolloré
        "^_^;",    // 14: Hanouna
        "~_~;"     // 15: Finkielkraut
      ],
      chaos: [
        "@O@",     // 0: Bardella
        "#O#",     // 1: Le Pen
        "X_X",     // 2: Ciotti
        "@0@",     // 3: Sarkozy
        "#X#",     // 4: Zemmour
        "!O!",     // 5: Maréchal
        "@X@",     // 6: Fillon
        "#O#",     // 7: Darmanin
        "@_@",     // 8: Retailleau
        "X@X",     // 9: Morano
        "#O#",     // 10: Raoult
        "!X!",     // 11: Onfray
        "@#@",     // 12: Praud
        "X@X",     // 13: Bolloré
        "@0@",     // 14: Hanouna
        "#~#"      // 15: Finkielkraut
      ]
    },
    
    // =====================================================
    // RÉPONSES PAR PERSONNAGE (index = position dans allCharacters)
    // Structure: allResponses[index][emotion][]
    // Facile à éditer: ajoutez des phrases dans chaque tableau
    // =====================================================
    allResponses: {
      // -------------------------------------------------
      // 0: JORDAN BARDELLA
      // Jeune, TikTok, immigration, manque d'expérience
      // -------------------------------------------------
      0: {
        idle: [
          "Le peuple attend...",
          "Marine compte sur moi.",
          "Les réseaux s'emballent...",
          "Quelle est la prochaine question?",
          "Je suis prêt.",
          "La France mérite mieux."
        ],
        screaming: [
          "LA FRANCE AUX FRANÇAIS!",
          "VOUS VOYEZ BIEN QUE J'AVAIS RAISON!",
          "C'EST LE PROJET DE MARINE!",
          "L'IMMIGRATION INCONTRÔLÉE!",
          "LE PEUPLE EN A ASSEZ!",
          "STOP À L'INSÉCURITÉ!",
          "LES FRONTIÈRES DOIVENT ÊTRE FERMÉES!",
          "C'EST UNE INVASION!",
          "LA JEUNESSE SE LÈVE!",
          "NOUS ALLONS GAGNER!"
        ],
        shouting: [
          "J'AI 28 ANS ET PLUS D'EXPÉRIENCE QUE VOUS!",
          "MES TIKTOKS SONT TRÈS CLAIRS!",
          "LE PEUPLE M'A CHOISI!",
          "C'EST PAS UNE QUESTION D'ÂGE!",
          "JE CONNAIS LES QUARTIERS!",
          "J'AI GRANDI EN BANLIEUE!",
          "MON PROGRAMME EST SOLIDE!",
          "VOUS NE M'IMPRESSIONNEZ PAS!"
        ],
        sweating: [
          "Mon parcours est... cohérent...",
          "J'ai travaillé, enfin... des stages...",
          "Le bac, c'est... c'était compliqué...",
          "Mon CV est... en cours de mise à jour...",
          "L'expérience professionnelle... c'est relatif...",
          "J'ai fait Sciences Po... enfin, presque...",
          "Le terrain, je connais... un peu...",
          "Mes diplômes sont... en ordre..."
        ]
      },

      // -------------------------------------------------
      // 1: MARINE LE PEN
      // Souveraineté, peuple, dédiabolisation, père
      // -------------------------------------------------
      1: {
        idle: [
          "Le peuple souffre...",
          "Ils ne comprennent pas.",
          "La France profonde m'attend.",
          "Bientôt, ce sera notre tour.",
          "Je me bats depuis 20 ans.",
          "Les élites tremblent."
        ],
        screaming: [
          "LE PEUPLE CONTRE LES ÉLITES!",
          "LA FRANCE D'ABORD!",
          "JE SUIS LA VOIX DES OUBLIÉS!",
          "LA SOUVERAINETÉ NATIONALE!",
          "LE SYSTÈME ME PERSÉCUTE!",
          "FREXIT MAINTENANT!",
          "L'EUROPE NOUS DÉTRUIT!",
          "LES FRANÇAIS SONT ABANDONNÉS!",
          "JE NE LÂCHERAI RIEN!",
          "C'EST LE COMBAT DE MA VIE!"
        ],
        shouting: [
          "JE NE SUIS PAS MON PÈRE!",
          "LE RN A CHANGÉ!",
          "J'AI DÉDIABOLISÉ LE PARTI!",
          "NOUS SOMMES RÉPUBLICAINS!",
          "ARRÊTEZ LES AMALGAMES!",
          "J'AI EXCLU LES EXTRÉMISTES!",
          "REGARDEZ NOS ÉLUS LOCAUX!",
          "NOUS SOMMES CRÉDIBLES!"
        ],
        sweating: [
          "L'emprunt russe c'était... légal...",
          "Mon père je ne... enfin...",
          "Les assistants parlementaires... c'est compliqué...",
          "Poutine c'est... de la diplomatie...",
          "Le financement du parti... c'est transparent...",
          "Jean-Marie, c'est... le passé...",
          "Ces accusations sont... politiques...",
          "Le procès va... bien se passer..."
        ]
      },

      // -------------------------------------------------
      // 2: ÉRIC CIOTTI
      // Alliance RN, trahison LR, Nice
      // -------------------------------------------------
      2: {
        idle: [
          "L'histoire me donnera raison.",
          "Nice reste fidèle.",
          "La droite doit s'unir.",
          "Ils m'ont sous-estimé.",
          "Le siège est à moi.",
          "J'attends leurs excuses."
        ],
        screaming: [
          "L'UNION DES DROITES!",
          "J'ASSUME MON CHOIX!",
          "LA FRANCE A BESOIN DE NOUS!",
          "C'EST HISTORIQUE!",
          "LE PEUPLE NOUS SOUTIENT!",
          "LR EST MORT SANS MOI!",
          "J'AI EU LE COURAGE!",
          "LA DROITE DOIT SE RÉVEILLER!",
          "ILS ONT PEUR DU CHANGEMENT!",
          "JE SUIS LE VRAI PRÉSIDENT!"
        ],
        shouting: [
          "JE SUIS TOUJOURS PRÉSIDENT DE LR!",
          "C'EST EUX LES TRAÎTRES!",
          "L'ALLIANCE EST LOGIQUE!",
          "NICE ME SOUTIENT!",
          "LE BUREAU POLITIQUE EST ILLÉGITIME!",
          "J'AI LES STATUTS POUR MOI!",
          "WAUQUIEZ A TRAHI!",
          "JE NE PARTIRAI PAS!"
        ],
        sweating: [
          "L'exclusion est... contestée juridiquement...",
          "Le siège, c'est... compliqué...",
          "Les militants sont... divisés...",
          "Ma position est... cohérente... depuis toujours...",
          "Les huissiers, c'était... un malentendu...",
          "Le changement de serrures... c'est normal...",
          "Mon avocat gère... ça va...",
          "Les sondages ne veulent... rien dire..."
        ]
      },

      // -------------------------------------------------
      // 3: NICOLAS SARKOZY
      // Ancien président, affaires judiciaires, énergie
      // -------------------------------------------------
      3: {
        idle: [
          "La France a besoin de moi.",
          "Je consulte, j'observe...",
          "Carla m'attend.",
          "L'Élysée me manque parfois.",
          "Les jeunes ne savent pas.",
          "J'ai tout vu, tout fait."
        ],
        screaming: [
          "J'AI ÉTÉ PRÉSIDENT!",
          "LA FRANCE FORTE!",
          "TRAVAILLER PLUS POUR GAGNER PLUS!",
          "JE REVIENDRAI!",
          "C'EST UNE CABALE!",
          "J'AI SAUVÉ L'EURO!",
          "SANS MOI, C'ÉTAIT LA CRISE!",
          "LA RACAILLE, J'AI GÉRÉ!",
          "J'AI FAIT BOUGER LES LIGNES!",
          "VOUS ÊTES QUI POUR ME JUGER?"
        ],
        shouting: [
          "VOUS ME PARLEZ DE QUOI LÀ?",
          "CASSE-TOI PAUV' CON!",
          "J'AI SAUVÉ LA FRANCE!",
          "MES RÉFORMES ONT MARCHÉ!",
          "VOUS NE COMPRENEZ RIEN!",
          "J'AI L'EXPÉRIENCE!",
          "REGARDEZ MON BILAN!",
          "C'EST FACILE DE CRITIQUER!"
        ],
        sweating: [
          "Bygmalion c'est... un malentendu...",
          "Kadhafi, j'ai jamais... enfin...",
          "Les écoutes sont... illégales...",
          "Le bracelet? C'est temporaire...",
          "Les financements libyens... c'est faux...",
          "Paul Bismuth, c'est... compliqué...",
          "L'affaire des sondages... c'est clos...",
          "Mes avocats gèrent très bien..."
        ]
      },

      // -------------------------------------------------
      // 4: ÉRIC ZEMMOUR
      // Polémiste, identité, condamnations
      // -------------------------------------------------
      4: {
        idle: [
          "L'Histoire jugera.",
          "Je lis, j'écris, je pense.",
          "Ils ont peur des idées.",
          "La France éternelle...",
          "Napoléon aurait compris.",
          "Le déclin est réversible."
        ],
        screaming: [
          "LE GRAND REMPLACEMENT!",
          "LA FRANCE SE MEURT!",
          "RECONQUÊTE!",
          "LA CIVILISATION EST EN DANGER!",
          "JE DIS TOUT HAUT CE QUE TOUT LE MONDE PENSE!",
          "L'ISLAM EST INCOMPATIBLE!",
          "NOS ANCÊTRES NOUS REGARDENT!",
          "C'EST UNE GUERRE CULTURELLE!",
          "LA FRANCE N'EST PAS UN HÔTEL!",
          "RÉVEILLEZ-VOUS!"
        ],
        shouting: [
          "LES CHIFFRES SONT LÀ!",
          "LISEZ MES LIVRES!",
          "J'AI ÉTÉ CENSURÉ!",
          "LA VÉRITÉ DÉRANGE!",
          "J'AI DES SOURCES!",
          "L'INSEE LE DIT!",
          "REGARDEZ LES PRÉNOMS!",
          "C'EST FACTUEL!"
        ],
        sweating: [
          "Cette condamnation est... politique...",
          "Mes propos ont été... sortis du contexte...",
          "Le score de l'élection, c'était... un début...",
          "Les sondages ne veulent rien dire...",
          "Marion et moi, c'est... stratégique...",
          "La justice est... aux ordres...",
          "Ces amendes sont... symboliques...",
          "7% c'est déjà... historique..."
        ]
      },

      // -------------------------------------------------
      // 5: MARION MARÉCHAL
      // Dynastie Le Pen, conservatisme, Reconquête
      // -------------------------------------------------
      5: {
        idle: [
          "Les traditions ont du sens.",
          "La famille reste ma priorité.",
          "Je trace ma propre voie.",
          "L'ISSEP forme les esprits.",
          "La droite doit s'assumer.",
          "L'avenir se prépare."
        ],
        screaming: [
          "LES VALEURS TRADITIONNELLES!",
          "LA FAMILLE D'ABORD!",
          "L'IDENTITÉ FRANÇAISE!",
          "LA FRANCE CHRÉTIENNE!",
          "DÉFENDONS NOS RACINES!",
          "LA CIVILISATION EUROPÉENNE!",
          "STOP AU WOKISME!",
          "NOS ENFANTS MÉRITENT MIEUX!",
          "L'ÉCOLE DOIT TRANSMETTRE!",
          "LA DROITE DOIT S'UNIR!"
        ],
        shouting: [
          "JE SUIS INDÉPENDANTE!",
          "MON NOM N'A RIEN À VOIR!",
          "J'AI MES PROPRES IDÉES!",
          "LA DROITE A BESOIN D'UNITÉ!",
          "J'AI QUITTÉ LA POLITIQUE, J'Y REVIENS!",
          "MON ÉCOLE FORME DES LEADERS!",
          "JE NE SUIS LA MARIONNETTE DE PERSONNE!",
          "JUGEZ-MOI SUR MES ACTES!"
        ],
        sweating: [
          "Ma tante et moi c'est... différent...",
          "Mon grand-père, je... enfin...",
          "L'alliance avec Zemmour, c'était... stratégique...",
          "Mon nom de famille est... un hasard...",
          "La rupture avec Marine, c'est... personnel...",
          "Reconquête et moi, c'est... compliqué...",
          "Les européennes, je... on verra...",
          "Le passé familial... ne me définit pas..."
        ]
      },

      // -------------------------------------------------
      // 6: FRANÇOIS FILLON
      // Penelopegate, costumes, mise en examen
      // -------------------------------------------------
      6: {
        idle: [
          "La rigueur paie toujours.",
          "J'aurais dû être président.",
          "Le destin est cruel.",
          "Pénélope m'attend.",
          "La Sarthe me manque.",
          "Le courage, c'est rare."
        ],
        screaming: [
          "QUI IMAGINE LE GÉNÉRAL MIS EN EXAMEN!?",
          "C'EST UN ASSASSINAT POLITIQUE!",
          "LA VÉRITÉ TRIOMPHERA!",
          "JE NE ME RENDRAI PAS!",
          "LE CABINET NOIR!",
          "ON M'A VOLÉ L'ÉLECTION!",
          "C'EST UN COMPLOT DU PS!",
          "JE SUIS INNOCENT!",
          "LE CANARD ENCHAÎNÉ MENT!",
          "LA JUSTICE EST AUX ORDRES!"
        ],
        shouting: [
          "MON HONNEUR EST INTACT!",
          "J'AI SERVI LA FRANCE!",
          "C'EST UNE MACHINATION!",
          "LE PEUPLE ME SOUTIENT!",
          "J'AI UN PROGRAMME SOLIDE!",
          "MA FEMME EST IRRÉPROCHABLE!",
          "JE REFUSE LA BOUE!",
          "LAISSEZ MA FAMILLE TRANQUILLE!"
        ],
        sweating: [
          "Pénélope a vraiment travaillé...",
          "Les costumes, c'était... un prêt...",
          "L'emploi était... réel...",
          "La montre, c'est... un cadeau...",
          "Les 900 000 euros... c'est légal...",
          "Les enfants ont été... assistants...",
          "Le Canard... a menti...",
          "Le jugement sera... juste..."
        ]
      },

      // -------------------------------------------------
      // 7: GÉRALD DARMANIN
      // Intérieur, sécurité, fermeté, polémiques
      // -------------------------------------------------
      7: {
        idle: [
          "La sécurité n'attend pas.",
          "Beauvau tourne à plein.",
          "Les préfets sont briefés.",
          "Je suis sur tous les fronts.",
          "L'ordre, c'est ma mission.",
          "Les Français veulent du résultat."
        ],
        screaming: [
          "L'ORDRE RÉPUBLICAIN!",
          "TOLÉRANCE ZÉRO!",
          "JE PROTÈGE LES FRANÇAIS!",
          "EXPULSIONS MASSIVES!",
          "LA FERMETÉ PAIE!",
          "LES DÉLINQUANTS DEHORS!",
          "J'AI EXPULSÉ DES MILLIERS!",
          "LA POLICE EST AVEC MOI!",
          "PAS DE QUARTIER!",
          "C'EST MOI LE PLUS FERME!"
        ],
        shouting: [
          "J'ASSUME TOTALEMENT!",
          "LES CHIFFRES SONT LÀ!",
          "LE PEN EST TROP MOLLE!",
          "JE SUIS SUR LE TERRAIN!",
          "J'AI DES RÉSULTATS!",
          "REGARDEZ LES STATISTIQUES!",
          "JE VAIS PARTOUT!",
          "LA GAUCHE EST LAXISTE!"
        ],
        sweating: [
          "Cette affaire est classée...",
          "Tourcoing c'est... du passé...",
          "Ma vie privée ne regarde que moi...",
          "L'enquête a conclu que...",
          "Ces accusations sont... anciennes...",
          "J'ai été blanchi par... la justice...",
          "Mon parcours parle pour moi...",
          "Passons aux vrais sujets..."
        ]
      },

      // -------------------------------------------------
      // 8: BRUNO RETAILLEAU
      // Sénat, ordre, autorité, conservateur
      // -------------------------------------------------
      8: {
        idle: [
          "Le Sénat veille.",
          "La Vendée est solide.",
          "L'autorité se mérite.",
          "Les institutions comptent.",
          "La droite réfléchit.",
          "J'observe, j'analyse."
        ],
        screaming: [
          "L'AUTORITÉ DE L'ÉTAT!",
          "LA LOI C'EST LA LOI!",
          "ASSEZ DE LAXISME!",
          "LA FRANCE A BESOIN D'ORDRE!",
          "LA DROITE DOIT GOUVERNER!",
          "STOP À L'ANARCHIE!",
          "LES VOYOUS DOIVENT PAYER!",
          "LA RÉPUBLIQUE EST EN DANGER!",
          "IL FAUT DE LA FERMETÉ!",
          "LE RÉGALIEN D'ABORD!"
        ],
        shouting: [
          "LE SÉNAT FAIT SON TRAVAIL!",
          "JE DÉFENDS NOS VALEURS!",
          "C'EST DU BON SENS!",
          "L'ORDRE AVANT TOUT!",
          "LA VENDÉE MONTRE L'EXEMPLE!",
          "J'AI DES CONVICTIONS!",
          "LE CONSERVATISME N'EST PAS UN GROS MOT!",
          "ASSEZ DE COMPROMIS!"
        ],
        sweating: [
          "Le groupe LR est... uni...",
          "L'extrême droite, ce n'est pas nous... enfin...",
          "Les alliances sont... tactiques...",
          "Ma position est... nuancée...",
          "Ciotti et moi... c'est différent...",
          "Je ne suis pas d'extrême droite... mais...",
          "Le RN, on discute... parfois...",
          "Ma ligne est... constante..."
        ]
      },

      // -------------------------------------------------
      // 9: NADINE MORANO
      // Tweets polémiques, race blanche, franc-parler
      // -------------------------------------------------
      9: {
        idle: [
          "Je tweete, je tweete...",
          "Les Français me comprennent.",
          "Sarkozy m'apprécie.",
          "Je dis ce que je pense.",
          "Twitter, c'est la liberté.",
          "La vérité fait mal."
        ],
        screaming: [
          "LA FRANCE EST UN PAYS DE RACE BLANCHE!",
          "JE DIS CE QUE JE PENSE!",
          "ON NE PEUT PLUS RIEN DIRE!",
          "LES BIEN-PENSANTS!",
          "J'ASSUME TOUT!",
          "DE GAULLE L'A DIT!",
          "LA CANCEL CULTURE!",
          "ILS VEULENT ME FAIRE TAIRE!",
          "JE NE M'EXCUSE PAS!",
          "C'EST LA RÉALITÉ!"
        ],
        shouting: [
          "SARKOZY M'A SOUTENUE!",
          "LE PEUPLE EST AVEC MOI!",
          "C'EST LA VÉRITÉ!",
          "ARRÊTEZ L'HYPOCRISIE!",
          "J'AI MES CONVICTIONS!",
          "LA FRANCE PROFONDE ME SOUTIENT!",
          "TWITTER N'EST PAS LA FRANCE!",
          "MES FOLLOWERS SAVENT!"
        ],
        sweating: [
          "Ce tweet était... maladroit...",
          "De Gaulle l'a dit aussi...",
          "C'est sorti du contexte...",
          "Je voulais dire... autre chose...",
          "Mon community manager... parfois...",
          "C'était de l'humour... enfin...",
          "Le buzz, c'est... incontrôlable...",
          "J'aurais dû... reformuler..."
        ]
      },

      // -------------------------------------------------
      // 10: DIDIER RAOULT
      // COVID, hydroxychloroquine, IHU Marseille
      // -------------------------------------------------
      10: {
        idle: [
          "La science parle d'elle-même.",
          "L'IHU continue ses recherches.",
          "Marseille ne m'oublie pas.",
          "J'ai mes publications.",
          "Les virus mutent, moi non.",
          "L'histoire me donnera raison."
        ],
        screaming: [
          "L'HYDROXYCHLOROQUINE MARCHE!",
          "ILS ONT TUÉ DES GENS!",
          "LA SCIENCE EST AVEC MOI!",
          "MARSEILLE A RAISON!",
          "BIG PHARMA MENT!",
          "LES LABORATOIRES SONT CORROMPUS!",
          "J'AI SAUVÉ DES VIES!",
          "LE LANCET A TRICHÉ!",
          "PFIZER CACHE LA VÉRITÉ!",
          "LA MÉDECINE PARISIENNE EST NULLE!"
        ],
        shouting: [
          "J'AI PUBLIÉ 3000 ARTICLES!",
          "MES ÉTUDES SONT CLAIRES!",
          "LES PARISIENS NE COMPRENNENT RIEN!",
          "JE SUIS LE PLUS CITÉ AU MONDE!",
          "REGARDEZ MES H-INDEX!",
          "J'AI FORMÉ DES GÉNÉRATIONS!",
          "L'IHU EST UNIQUE!",
          "MA BARBE N'A RIEN À VOIR!"
        ],
        sweating: [
          "L'étude du Lancet était... biaisée...",
          "Les sanctions de l'Ordre, c'est... politique...",
          "Ma méthodologie est... innovante...",
          "Les critiques sont... jaloux...",
          "Le groupe contrôle... c'est accessoire...",
          "Les conflits d'intérêts... c'est normal...",
          "Ma retraite... est méritée...",
          "Les plaintes... n'aboutiront pas..."
        ]
      },

      // -------------------------------------------------
      // 11: MICHEL ONFRAY
      // Philosophe, anti-woke, contradictions
      // -------------------------------------------------
      11: {
        idle: [
          "La pensée demande du temps.",
          "Nietzsche m'inspire toujours.",
          "L'hédonisme est une discipline.",
          "J'écris, j'écris...",
          "La Normandie me ressource.",
          "Les intellectuels sont morts."
        ],
        screaming: [
          "LA GAUCHE A TRAHI LE PEUPLE!",
          "LE WOKISME DÉTRUIT TOUT!",
          "L'ISLAMO-GAUCHISME!",
          "JE SUIS UN HOMME DE GAUCHE, MOI!",
          "NIETZSCHE AVAIT RAISON!",
          "MÉLENCHON EST UN TRAÎTRE!",
          "L'UNIVERSITÉ EST GANGRENÉE!",
          "LA PENSÉE UNIQUE RÈGNE!",
          "LES PSEUDO-INTELLECTUELS!",
          "LE PEUPLE A ÉTÉ ABANDONNÉ!"
        ],
        shouting: [
          "J'AI ÉCRIT 100 LIVRES!",
          "LISEZ-MOI AVANT DE CRITIQUER!",
          "LA PHILOSOPHIE A DES RÉPONSES!",
          "L'UNIVERSITÉ EST MORTE!",
          "J'AI FONDÉ UNE UNIVERSITÉ!",
          "MON JOURNAL EST INDÉPENDANT!",
          "JE NE SUIS PAS UN RÉACTIONNAIRE!",
          "C'EST DE LA PHILOSOPHIE!"
        ],
        sweating: [
          "Mon soutien à Zemmour, c'était... nuancé...",
          "Je ne suis pas de droite... enfin...",
          "Mes contradictions sont... dialectiques...",
          "Front Populaire, c'est... différent...",
          "Avec CNews, c'est... ponctuel...",
          "La gauche m'a... abandonné...",
          "Mes positions ont... évolué...",
          "Le gilets jaunes, c'était... complexe..."
        ]
      },

      // -------------------------------------------------
      // 12: PASCAL PRAUD
      // CNews, anti-woke, polémiques
      // -------------------------------------------------
      12: {
        idle: [
          "L'Heure des Pros va commencer.",
          "Les audiences sont bonnes.",
          "Le wokisme, on en reparle.",
          "La vérité doit être dite.",
          "Les chroniqueurs arrivent.",
          "France 2 est jalouse."
        ],
        screaming: [
          "ON NE PEUT PLUS RIEN DIRE!",
          "LE WOKISME GANGRÈNE LA FRANCE!",
          "LES MÉDIAS MAINSTREAM MENTENT!",
          "LA LIBERTÉ D'EXPRESSION!",
          "C'EST DE LA CENSURE!",
          "FRANCE TÉLÉ EST AUX ORDRES!",
          "L'ARCOM NOUS PERSÉCUTE!",
          "ON VEUT NOUS FAIRE TAIRE!",
          "C'EST LA BIEN-PENSANCE!",
          "LES ÉLITES CONTRE LE PEUPLE!"
        ],
        shouting: [
          "MON ÉMISSION EST LA PLUS REGARDÉE!",
          "LES FRANÇAIS ME SUIVENT!",
          "JE POSE LES VRAIES QUESTIONS!",
          "L'HEURE DES PROS DIT LA VÉRITÉ!",
          "NOUS SOMMES INDÉPENDANTS!",
          "J'AI DES SOURCES!",
          "REGARDEZ NOS AUDIENCES!",
          "LE PUBLIC A CHOISI!"
        ],
        sweating: [
          "CNews est... pluraliste...",
          "Bolloré n'intervient... jamais...",
          "L'ARCOM, c'est... politique...",
          "Mes invités sont... variés...",
          "La ligne éditoriale... je la choisis...",
          "Les mises en demeure... c'est injuste...",
          "On invite aussi... des gens de gauche...",
          "L'objectivité, c'est... subjectif..."
        ]
      },

      // -------------------------------------------------
      // 13: VINCENT BOLLORÉ
      // Magnat des médias, discret, influence
      // -------------------------------------------------
      13: {
        idle: [
          "Les affaires tournent.",
          "Mes médias se portent bien.",
          "Je préfère la discrétion.",
          "L'entreprise avant tout.",
          "Canal+ reste stratégique.",
          "La prière me guide."
        ],
        screaming: [
          "JE SUIS UN ENTREPRENEUR!",
          "MES MÉDIAS SONT LIBRES!",
          "C'EST DU BUSINESS!",
          "LA RÉUSSITE DÉRANGE!",
          "JE DÉFENDS MES INTÉRÊTS!",
          "C'EST LE CAPITALISME!",
          "J'AI CRÉÉ DES EMPLOIS!",
          "MES CHAÎNES SONT POPULAIRES!",
          "LE MARCHÉ A PARLÉ!",
          "JE NE M'EXCUSE PAS DE RÉUSSIR!"
        ],
        shouting: [
          "JE N'INTERVIENS JAMAIS!",
          "C'EST DE L'INDÉPENDANCE!",
          "MES RÉDACTIONS SONT LIBRES!",
          "LA CONCURRENCE EST SAINE!",
          "VIVENDI EST TRANSPARENT!",
          "MES DIRECTEURS DÉCIDENT!",
          "C'EST UNE STRATÉGIE INDUSTRIELLE!",
          "JE SUIS UN CATHOLIQUE ENGAGÉ!"
        ],
        sweating: [
          "L'Afrique, c'était... des affaires...",
          "Mes médias sont... pluralistes...",
          "JDD, Europe 1... c'est... le marché...",
          "Je suis juste... un actionnaire...",
          "Les rédactions... sont indépendantes...",
          "Ces départs... sont volontaires...",
          "La ligne éditoriale... je n'interviens pas...",
          "Hanouna, c'est... son émission..."
        ]
      },

      // -------------------------------------------------
      // 14: CYRIL HANOUNA
      // TPMP, Bolloré, clashs, sanctions
      // -------------------------------------------------
      14: {
        idle: [
          "Baba prépare l'émission.",
          "Les fanzouzes attendent.",
          "TPMP, c'est la vie.",
          "Twitter va s'enflammer.",
          "Qui on invite ce soir?",
          "L'audience va exploser."
        ],
        screaming: [
          "ON EST EN DIRECT!",
          "BABA AIME SES TÉLÉSPECTATEURS!",
          "C'EST DU DIVERTISSEMENT!",
          "LES HATERS SONT JALOUX!",
          "TPMP C'EST LA FAMILLE!",
          "ON CASSE LES CODES!",
          "VOUS ÊTES MILLIONS À NOUS REGARDER!",
          "C'EST ÇA LA TÉLÉ POPULAIRE!",
          "ON DIT LA VÉRITÉ!",
          "BABA NE LÂCHE RIEN!"
        ],
        shouting: [
          "J'AI 3 MILLIONS DE TÉLÉSPECTATEURS!",
          "LE PEUPLE M'AIME!",
          "C'EST RÉVOLUTIONNAIRE!",
          "ON FAIT LE BUZZ!",
          "LES ÉLITES NOUS DÉTESTENT!",
          "FRANCE TÉLÉ EST MORTE!",
          "ON EST NUMÉRO UN!",
          "LES FANZOUZES SAVENT!"
        ],
        sweating: [
          "L'ARCOM, c'est... injuste...",
          "Le niveau de l'émission, c'est... populaire...",
          "Bolloré? On est... indépendants...",
          "Les sanctions sont... exagérées...",
          "L'appel à Boyard, c'était... spontané...",
          "Les clashs, c'est... du direct...",
          "Les amendes... on va faire appel...",
          "La politique, je... m'y connais pas..."
        ]
      },

      // -------------------------------------------------
      // 15: ALAIN FINKIELKRAUT
      // Académicien, identité, culture française, polémiques
      // -------------------------------------------------
      15: {
        idle: [
          "La France que j'aime...",
          "Répliques, samedi prochain.",
          "L'Académie délibère.",
          "La culture s'effondre.",
          "Kundera avait raison.",
          "Je relis Péguy."
        ],
        screaming: [
          "LA FRANCE SE SUICIDE!",
          "LA CULTURE EST MORTE!",
          "ON DÉTRUIT NOTRE CIVILISATION!",
          "L'ÉCOLE NE TRANSMET PLUS RIEN!",
          "C'EST LA FIN DE L'OCCIDENT!",
          "ILS HAÏSSENT LA FRANCE!",
          "L'IDENTITÉ EST NIÉE!",
          "LA LITTÉRATURE AGONISE!",
          "PLUS PERSONNE NE LIT!",
          "C'EST UN EFFONDREMENT!"
        ],
        shouting: [
          "JE SUIS ACADÉMICIEN!",
          "J'AI ÉCRIT DES LIVRES!",
          "LISEZ AVANT DE JUGER!",
          "C'EST DE LA PENSÉE!",
          "VOUS NE COMPRENEZ PAS!",
          "J'AI LE DROIT DE DIRE!",
          "LA NUANCE EXISTE!",
          "ÉCOUTEZ RÉPLIQUES!"
        ],
        sweating: [
          "Les gilets jaunes, c'était... violent...",
          "Cette insulte était... terrible...",
          "Je ne suis pas raciste... enfin...",
          "Mes propos ont été... déformés...",
          "L'Académie me soutient... je crois...",
          "Cette polémique... est injuste...",
          "On m'a agressé... dans la rue...",
          "Je suis incompris... souvent..."
        ]
      }
    },

    // Sera rempli dynamiquement avec les réponses des 3 sélectionnés
    politicianResponses: {},

    // =====================================================
    // RÉPONSES GÉNÉRIQUES (fallback si rien de spécifique)
    // =====================================================
    genericResponses: {
      idle: [
        "Je réfléchis...",
        "Hmm...",
        "Intéressant...",
        "On verra bien.",
        "La suite va être intéressante.",
        "J'attends la prochaine question."
      ],
      screaming: [
        "PRÉJUGÉ MÉDIATIQUE!",
        "C'EST UN COMPLOT!",
        "ILS VOUS MENTENT!",
        "RÉVEILLEZ-VOUS!",
        "PROPAGANDE PURE!",
        "ON NOUS CACHE TOUT!",
        "LE SYSTÈME EST POURRI!",
        "LA VÉRITÉ ÉCLATE!"
      ],
      shouting: [
        "JE N'AI JAMAIS DIT ÇA!",
        "MÉDIAS MENSONGERS!",
        "C'EST DU BON SENS!",
        "FAITES VOS RECHERCHES!",
        "VOUS ÊTES DANS LE DÉNI!",
        "ARRÊTEZ VOS MENSONGES!",
        "J'AI DES PREUVES!",
        "VOUS NE M'AUREZ PAS!"
      ],
      sweating: [
        "C'est sorti du contexte...",
        "J'ai été mal conseillé...",
        "Ce n'est pas ce que j'ai voulu dire...",
        "C'était de l'humour...",
        "Mes propos ont été déformés...",
        "Il faudrait vérifier...",
        "Je ne me souviens plus exactement...",
        "C'est plus compliqué que ça..."
      ]
    },

    // =====================================================
    // RÉPONSES CHAOS (pour tous, mode chaos)
    // =====================================================
    chaosResponses: [
      "CHAOS! CHAOS! CHAOS!",
      "TOUT BRÛLE!",
      "COMPLOT! COMPLOT!",
      "LE SYSTÈME S'EFFONDRE!",
      "RÉVOLUTION!",
      "LA FRANCE... LA FRANCE...",
      "JE DÉMISSIONNE!",
      "AAAAAAARGH!",
      "VOUS N'ÉCHAPPEREZ PAS!",
      "LE PEUPLE A FAIM!",
      "TOUT EST FAUX!",
      "NON NON NOOOON!",
      "C'EST LA FIN!",
      "TRAHISON! TRAHISON!",
      "AU SECOURS!",
      "JE PERDS LE CONTRÔLE!",
      "POURQUOI MOI?!",
      "C'EST UN CAUCHEMAR!",
      "ARRÊTEZ TOUT!",
      "JE VAIS EXPLOSER!",
      "LA RÉPUBLIQUE EST MORTE!",
      "PLUS RIEN N'A DE SENS!",
      "ILS SONT PARTOUT!",
      "JE NE COMPRENDS PLUS!",
      "SAUVE QUI PEUT!",
      "C'EST L'APOCALYPSE!",
      "MON DIEU! MON DIEU!",
      "JE REFUSE! JE REFUSE!",
      "LAISSEZ-MOI PARTIR!",
      "TOUT S'ÉCROULE!",
      "JE N'EN PEUX PLUS!",
      "C'EST INSUPPORTABLE!",
      "QU'AI-JE FAIT?!",
      "LA VÉRITÉ ÉCLATE!",
      "JE SUIS INNOCENT!",
      "ILS M'ONT PIÉGÉ!"
    ],

    // =====================================================
    // RÉPONSES CROISÉES (quand deux personnages interagissent)
    // Structure: crossResponses[fromIndex][toIndex] = [phrases]
    // =====================================================
    crossResponses: {
      // Bardella (0)
      0: {
        1: ["Marine a raison!", "Comme dit Marine!", "Marine m'a tout appris!"],
        2: ["Éric, on est ensemble!", "Bravo Ciotti!"],
        4: ["Zemmour, c'est autre chose...", "Éric, on n'est pas d'accord sur tout..."]
      },
      // Le Pen (1)
      1: {
        0: ["Jordan fait du bon travail!", "Bravo Jordan!", "Jordan est l'avenir!"],
        5: ["Ma nièce a ses idées...", "Marion, restons dignes.", "Marion exagère parfois..."],
        2: ["Éric a fait le bon choix!", "Bienvenue Éric!"],
        7: ["Darmanin est trop mou!", "Gérald, vous êtes ridicule!"]
      },
      // Ciotti (2)
      2: {
        1: ["Marine, on va gagner!", "J'ai rejoint Marine!"],
        0: ["Jordan a raison!", "Bardella dit vrai!"],
        3: ["Nicolas, c'est fini LR!", "Sarkozy, le passé!"]
      },
      // Sarkozy (3)
      3: {
        6: ["François, tes costumes...", "Fillon, tu m'as déçu!"],
        9: ["Nadine, du calme!", "Morano, restons corrects!"],
        2: ["Ciotti, quel traître!", "Éric a trahi!"]
      },
      // Zemmour (4)
      4: {
        5: ["Marion comprend!", "Marion, rejoins-nous!"],
        11: ["Michel a raison!", "Onfray est lucide!"],
        15: ["Alain comprend le déclin!", "Finkielkraut voit juste!"],
        1: ["Marine n'ose pas!", "Le Pen est molle!"]
      },
      // Maréchal (5)
      5: {
        1: ["Ma tante se trompe!", "Marine, écoute-moi!"],
        4: ["Éric voit juste!", "Zemmour a du courage!"],
        0: ["Jordan est jeune...", "Bardella manque d'expérience..."]
      },
      // Fillon (6)
      6: {
        3: ["Nicolas m'a trahi!", "Sarkozy est jaloux!"],
        2: ["Ciotti, j'aurais dû...!", "Éric a eu le courage..."]
      },
      // Darmanin (7)
      7: {
        1: ["Le Pen est trop molle!", "Marine, vous êtes faible!"],
        0: ["Bardella, aucune expérience!", "Jordan ne connaît rien!"],
        3: ["Nicolas, vous aviez raison!", "Sarkozy m'inspire!"]
      },
      // Retailleau (8)
      8: {
        2: ["Ciotti a trahi LR!", "Éric, c'était une erreur!"],
        7: ["Gérald exagère!", "Darmanin, du calme!"]
      },
      // Morano (9)
      9: {
        3: ["Nicolas m'a soutenue!", "Sarkozy comprend!"],
        1: ["Marine dit vrai!", "Le Pen a raison!"],
        12: ["Pascal, tu as raison!", "Praud dit la vérité!"]
      },
      // Raoult (10)
      10: {
        11: ["Onfray comprend!", "Michel voit clair!"],
        15: ["Finkielkraut sait!", "Alain est intelligent!"]
      },
      // Onfray (11)
      11: {
        4: ["Éric a du courage!", "Zemmour ose dire!"],
        15: ["Alain, on est d'accord!", "Finkielkraut voit juste!"],
        12: ["Pascal pose les bonnes questions!", "Praud, continuez!"]
      },
      // Praud (12)
      12: {
        11: ["Michel a raison!", "Onfray est lucide!"],
        15: ["Alain, venez à l'émission!", "Finkielkraut, bravo!"],
        14: ["Cyril, on se soutient!", "Hanouna, bien joué!"],
        13: ["Merci Vincent!", "Bolloré nous fait confiance!"]
      },
      // Bolloré (13)
      13: {
        12: ["Pascal fait du bon travail.", "Praud, continuez."],
        14: ["Cyril est... divertissant.", "Hanouna a ses méthodes."]
      },
      // Hanouna (14)
      14: {
        12: ["Pascal, t'es le meilleur!", "Praud, on t'aime!"],
        13: ["Merci patron!", "Vincent, je gère!"]
      },
      // Finkielkraut (15)
      15: {
        11: ["Michel comprend!", "Onfray, enfin quelqu'un!"],
        4: ["Zemmour dit des vérités!", "Éric a le courage!"],
        12: ["Pascal, continuez!", "Praud résiste!"],
        10: ["Raoult, la science...", "Didier, attention..."]
      }
    },

    // Probabilité qu'un personnage interpelle un autre (0-1)
    crossResponseChance: 0.2,

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
      // Fréquences pour chaque émotion (en Hz) - réduites pour moins de stridence
      frequencies: {
        'idle': [196, 220, 247, 262, 294, 330],      // G3-E4 (doux)
        'screaming': [392, 440, 494, 523, 587, 659], // G4-E5 (réduit de ~40%)
        'shouting': [330, 370, 392, 440, 494, 523],  // E4-C5 (réduit)
        'sweating': [147, 165, 185, 196, 220, 247],  // D3-B3 (très doux)
        'chaos': [698, 784, 880, 988, 1047, 1175]   // F5-D6 (AIGU - cris intenses!)
      },

      // Type d'oscillateur par émotion (du plus doux au plus agressif)
      waveforms: {
        'idle': 'sine',        // Lisse, calme
        'sweating': 'triangle', // Légèrement nerveux mais doux
        'shouting': 'square',   // Plus agressif mais pas strident
        'screaming': 'sawtooth', // Garde le mordant dramatique
        'chaos': 'sawtooth'     // Strident pour les cris de chaos
      },

      // Temps d'attaque par émotion (en secondes)
      attackTime: {
        'idle': 0.1,      // Onset très doux
        'sweating': 0.08,
        'shouting': 0.04,
        'screaming': 0.02, // Punchy mais pas brutal
        'chaos': 0.005    // TRÈS rapide - cris soudains!
      },

      // Fréquence de coupure du filtre passe-bas par émotion (Hz)
      lowpassCutoff: {
        'idle': 2000,      // Très filtré, doux
        'sweating': 2500,
        'shouting': 3000,
        'screaming': 4000, // Plus ouvert pour le mordant
        'chaos': 8000      // Presque pas de filtrage - son brut!
      },

      // Intervalles d'accords par émotion (ratios de fréquence)
      chordIntervals: {
        'idle': [1, 1.5],           // Quinte (stable)
        'sweating': [1, 1.2],       // Tierce mineure (inquiétant)
        'shouting': [1, 1.5, 2],    // Quinte + octave (puissant)
        'screaming': [1, 1.414],    // Triton (dissonant, tendu)
        'chaos': [1, 1.189, 1.414, 1.682, 2] // Cluster dissonant très dense!
      },

      // Durée des notes (en secondes)
      noteDuration: 0.5,

      // Temps entre les notes (en millisecondes)
      noteSpacing: 400,

      // Volume de base (réduit pour moins de stridence)
      baseVolume: 0.2,
      voiceEffectVolume: 0.4,
      chaosVolume: 0.5, // Volume plus élevé pour le chaos

      // Paramètres des formants vocaux
      voiceParams: {
        formantFreqs: [500, 1500, 2500], // Fréquences de base des formants
        vibratoSpeed: [5, 7],  // Plage de vitesse du vibrato
        vibratoDepth: [2, 4]   // Plage de profondeur du vibrato (réduit)
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

    // ==========================================================
    // SYSTÈME DE BARRES DYNAMIQUES
    // Véracité, Transpiration, Foutage de gueule
    // ==========================================================
    barMetrics: {
      // Valeurs initiales (%)
      initial: {
        veracite: 45,
        transpiration: 20,
        foutage: 35
      },

      // Effets de base par type de réaction (min, max)
      baseEffects: {
        screaming: {
          veracite: [-15, -8],
          transpiration: [3, 8],
          foutage: [12, 22]
        },
        shouting: {
          veracite: [-8, -3],
          transpiration: [2, 5],
          foutage: [6, 12]
        },
        sweating: {
          veracite: [-18, -10],
          transpiration: [18, 28],
          foutage: [2, 6]
        },
        idle: {
          veracite: [0, 2],
          transpiration: [-3, -1],
          foutage: [-2, 0]
        }
      },

      // Récupération passive par seconde quand rien ne se passe
      passiveRecovery: {
        veracite: 0.3,
        transpiration: -0.5,
        foutage: -0.2
      },

      // Seuils déclencheurs d'événements
      thresholds: {
        veracite: {
          critical: 10,   // < 10% = alerte critique
          low: 25,        // < 25% = avertissement
          high: 75        // > 75% = rare moment de vérité
        },
        transpiration: {
          high: 70,       // > 70% = sueur visible
          critical: 90    // > 90% = panique totale
        },
        foutage: {
          high: 80,       // > 80% = insolence maximale
          critical: 95    // > 95% = déclenche mini-chaos
        }
      }
    },

    // Multiplicateurs par personnage (index dans allCharacters)
    // Chaque personnage affecte les barres différemment selon sa personnalité
    characterBarWeights: {
      0: { // BARDELLA - jeune, confiant, peu de sueur
        veracite: 0.9,
        transpiration: 0.6,
        foutage: 1.3
      },
      1: { // LE PEN - rodée, contrôle ses émotions
        veracite: 0.8,
        transpiration: 0.7,
        foutage: 1.2
      },
      2: { // CIOTTI - nerveux depuis l'alliance
        veracite: 1.0,
        transpiration: 1.5,
        foutage: 1.1
      },
      3: { // SARKOZY - maître du foutage de gueule
        veracite: 0.6,
        transpiration: 0.8,
        foutage: 1.8
      },
      4: { // ZEMMOUR - polémiste, peu de vérité, beaucoup de foutage
        veracite: 0.5,
        transpiration: 0.9,
        foutage: 1.6
      },
      5: { // MARÉCHAL - contrôlée, moins extrême
        veracite: 1.0,
        transpiration: 0.8,
        foutage: 1.0
      },
      6: { // FILLON - roi de la transpiration (Penelope...)
        veracite: 0.7,
        transpiration: 2.0,
        foutage: 0.9
      },
      7: { // DARMANIN - agressif, peu de sueur
        veracite: 0.8,
        transpiration: 0.7,
        foutage: 1.4
      },
      8: { // RETAILLEAU - sérieux, modéré
        veracite: 1.1,
        transpiration: 0.9,
        foutage: 0.8
      },
      9: { // MORANO - explose facilement, foutage max
        veracite: 0.6,
        transpiration: 1.2,
        foutage: 1.9
      },
      10: { // RAOULT - confiant en ses mensonges
        veracite: 0.4,
        transpiration: 0.5,
        foutage: 1.7
      },
      11: { // ONFRAY - philosophe, moins de foutage direct
        veracite: 0.9,
        transpiration: 0.8,
        foutage: 1.1
      },
      12: { // PRAUD - habitué aux clashs, peu de sueur
        veracite: 0.7,
        transpiration: 0.6,
        foutage: 1.5
      },
      13: { // BOLLORÉ - froid, calculateur, sue quand piégé
        veracite: 0.8,
        transpiration: 1.3,
        foutage: 1.0
      },
      14: { // HANOUNA - showman, foutage de gueule incarné
        veracite: 0.5,
        transpiration: 0.7,
        foutage: 2.0
      },
      15: { // FINKIELKRAUT - émotif, dramatique, peu de foutage
        veracite: 0.8,
        transpiration: 1.4,
        foutage: 0.9
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