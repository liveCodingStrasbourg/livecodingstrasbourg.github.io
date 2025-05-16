/**
 * ui-controller.js - Partie 1/6 - Contrôleur d'interface utilisateur
 * Définition de la classe et initialisation
 */

class UIController {
    /**
     * Crée une nouvelle instance du contrôleur d'interface
     */
    constructor() {
        // Références aux éléments DOM principaux
        this.elements = {
            // Onglets
            tabs: document.querySelectorAll('.tab-btn'),
            tabContents: document.querySelectorAll('.tab-content'),
            
            // Boutons
            startAudioBtn: document.getElementById('startAudio'),
            loadAudioFileBtn: document.getElementById('loadAudioFile'),
            audioFileInput: document.getElementById('audioFileInput'),
            tapTempoBtn: document.getElementById('tapTempo'),
            resetTapTempoBtn: document.getElementById('resetTapTempo'),
            fullscreenBtn1: document.getElementById('fullscreenBtn1'),
            fullscreenBtn2: document.getElementById('fullscreenBtn2'),
            infoBtn1: document.getElementById('info1Button'),
            infoBtn2: document.getElementById('info2Button'),
            
            // Sélecteurs de visualisation
            vizType1Select: document.getElementById('visualizationType1'),
            vizType2Select: document.getElementById('visualizationType2'),
            
            // Panneaux de visualisation
            vizPanel1: document.getElementById('vizPanel1'),
            vizPanel2: document.getElementById('vizPanel2'),
            canvas1: document.getElementById('visualization1'),
            canvas2: document.getElementById('visualization2'),
            
            // Panneaux d'info
            infoPanel1: document.getElementById('info1Panel'),
            infoPanel2: document.getElementById('info2Panel'),
            
            // Indicateurs
            micStatus: document.getElementById('micStatus'),
            
            // Contrôles de mapping
            signalSelects: document.querySelectorAll('.signal-select'),
            
            // Préréglages
            presetSelect: document.getElementById('presetSelect'),
            newPresetName: document.getElementById('newPresetName'),
            savePresetBtn: document.getElementById('savePreset'),
            deletePresetBtn: document.getElementById('deletePreset')
        };
        
        // État des visualisations
        this.visualizations = {
            viz1: null,
            viz2: null
        };
        
        // État du tap tempo
        this.tapTempo = {
            lastTapTime: 0
        };
        
        // État de l'interface
        this.state = {
            activeTab: 'source-tab',
            isAudioInitialized: false,
            isFullscreen: false,
            fullscreenElement: null
        };
        
        // Liaison des méthodes au contexte this pour éviter les problèmes de référence
        this.onTabClick = this.onTabClick.bind(this);
        this.onStartAudioClick = this.onStartAudioClick.bind(this);
        this.onLoadAudioFileClick = this.onLoadAudioFileClick.bind(this);
        this.onAudioFileSelected = this.onAudioFileSelected.bind(this);
        this.onTapTempoClick = this.onTapTempoClick.bind(this);
        this.onResetTapTempoClick = this.onResetTapTempoClick.bind(this);
        this.onVisualizationTypeChange = this.onVisualizationTypeChange.bind(this);
        this.onInfoButtonClick = this.onInfoButtonClick.bind(this);
        this.onFullscreenClick = this.onFullscreenClick.bind(this);
        this.exitFullscreen = this.exitFullscreen.bind(this);
        this.onFFTSizeChange = this.onFFTSizeChange.bind(this);
        this.onSmoothingChange = this.onSmoothingChange.bind(this);
        this.onScaleFactorChange = this.onScaleFactorChange.bind(this);
        this.onBeatSettingChange = this.onBeatSettingChange.bind(this);
        this.onSignalMappingChange = this.onSignalMappingChange.bind(this);
        this.onPresetChange = this.onPresetChange.bind(this);
        this.onSavePresetClick = this.onSavePresetClick.bind(this);
        this.onDeletePresetClick = this.onDeletePresetClick.bind(this);
        this.updateMetrics = this.updateMetrics.bind(this);
        
        // Initialisation des événements
        this.initEvents();
        
        // Initialisation des visualisations par défaut
        this.initVisualizations();
        
        // Initialisation des valeurs d'affichage
        this.updateDisplayValues();
        
        // Chargement des préréglages
        this.loadPresets();
    }

    /**
 * ui-controller.js - Partie 2/6 - Méthodes d'initialisation et utilitaires
 */

    /**
     * Initialise tous les événements de l'interface
     */
    initEvents() {
        // Gestion des onglets
        this.elements.tabs.forEach(tab => {
            tab.addEventListener('click', this.onTabClick);
        });
        
        // Gestion de l'audio
        this.elements.startAudioBtn.addEventListener('click', this.onStartAudioClick);
        this.elements.loadAudioFileBtn.addEventListener('click', this.onLoadAudioFileClick);
        this.elements.audioFileInput.addEventListener('change', this.onAudioFileSelected);
        
        // Gestion du tap tempo
        this.elements.tapTempoBtn.addEventListener('click', this.onTapTempoClick);
        this.elements.resetTapTempoBtn.addEventListener('click', this.onResetTapTempoClick);
        
        // Gestion des visualisations
        this.elements.vizType1Select.addEventListener('change', (event) => this.onVisualizationTypeChange(1, event));
        this.elements.vizType2Select.addEventListener('change', (event) => this.onVisualizationTypeChange(2, event));
        
        // Gestion des panneaux d'info
        this.elements.infoBtn1.addEventListener('click', () => this.onInfoButtonClick(1));
        this.elements.infoBtn2.addEventListener('click', () => this.onInfoButtonClick(2));
        
        // Gestion du plein écran
        this.elements.fullscreenBtn1.addEventListener('click', () => this.onFullscreenClick(1));
        this.elements.fullscreenBtn2.addEventListener('click', () => this.onFullscreenClick(2));
        
        // Gestion des contrôles FFT
        document.getElementById('fftSize').addEventListener('input', this.onFFTSizeChange);
        document.getElementById('smoothingTimeConstant').addEventListener('input', this.onSmoothingChange);
        
        // Gestion des contrôles d'amplification
        document.getElementById('bassScale').addEventListener('input', this.onScaleFactorChange);
        document.getElementById('midScale').addEventListener('input', this.onScaleFactorChange);
        document.getElementById('trebleScale').addEventListener('input', this.onScaleFactorChange);
        
        // Gestion des contrôles de détection de battements
        document.getElementById('beatSensitivity').addEventListener('input', this.onBeatSettingChange);
        document.getElementById('beatDecay').addEventListener('input', this.onBeatSettingChange);
        document.getElementById('beatThreshold').addEventListener('input', this.onBeatSettingChange);
        
        // Gestion des mappings de signaux
        this.elements.signalSelects.forEach(select => {
            select.addEventListener('change', this.onSignalMappingChange);
        });
        
        // Gestion des préréglages
        this.elements.presetSelect.addEventListener('change', this.onPresetChange);
        this.elements.savePresetBtn.addEventListener('click', this.onSavePresetClick);
        this.elements.deletePresetBtn.addEventListener('click', this.onDeletePresetClick);
        
        // Mise à jour des métriques
        setInterval(this.updateMetrics, 100);
    }
    
    /**
     * Initialise les visualisations par défaut
     */
    initVisualizations() {
        // Obtention des types de visualisation sélectionnés
        const vizType1 = this.elements.vizType1Select.value;
        const vizType2 = this.elements.vizType2Select.value;
        
        // Création des visualisations
        this.createVisualization(1, vizType1);
        this.createVisualization(2, vizType2);
        
        // Mise à jour des titres
        this.updateVisualizationTitles();
        
        // Mise à jour des panneaux d'info
        this.updateInfoPanels();
    }
    
    /**
     * Met à jour les valeurs affichées dans l'interface
     */
    updateDisplayValues() {
        // Mise à jour des valeurs FFT
        const fftSizeExp = document.getElementById('fftSize').value;
        const fftSize = Math.pow(2, parseInt(fftSizeExp));
        document.getElementById('fftSizeValue').textContent = fftSize;
        
        // Mise à jour des valeurs de lissage
        const smoothing = document.getElementById('smoothingTimeConstant').value;
        document.getElementById('smoothingValue').textContent = parseFloat(smoothing).toFixed(2);
        
        // Mise à jour des valeurs d'amplification
        const bassScale = document.getElementById('bassScale').value;
        document.getElementById('bassScaleValue').textContent = parseFloat(bassScale).toFixed(1);
        
        const midScale = document.getElementById('midScale').value;
        document.getElementById('midScaleValue').textContent = parseFloat(midScale).toFixed(1);
        
        const trebleScale = document.getElementById('trebleScale').value;
        document.getElementById('trebleScaleValue').textContent = parseFloat(trebleScale).toFixed(1);
        
        // Mise à jour des valeurs de détection de battements
        const beatSensitivity = document.getElementById('beatSensitivity').value;
        document.getElementById('beatSensitivityValue').textContent = parseFloat(beatSensitivity).toFixed(1);
        
        const beatDecay = document.getElementById('beatDecay').value;
        document.getElementById('beatDecayValue').textContent = parseFloat(beatDecay).toFixed(3);
        
        const beatThreshold = document.getElementById('beatThreshold').value;
        document.getElementById('beatThresholdValue').textContent = parseFloat(beatThreshold).toFixed(2);
    }
    
    /**
     * Crée ou remplace une visualisation
     * @param {number} index - Index de la visualisation (1 ou 2)
     * @param {string} type - Type de visualisation
     */
    createVisualization(index, type) {
        // Récupération du canvas
        const canvas = this.elements[`canvas${index}`];
        
        // Nettoyage de la visualisation précédente
        if (this.visualizations[`viz${index}`]) {
            this.visualizations[`viz${index}`].dispose();
            this.visualizations[`viz${index}`] = null;
        }
        
        // Création de la nouvelle visualisation
        let visualization = null;
        
        switch (type) {
            case 'frequencyBars':
                visualization = new FrequencyBarsVisualization(canvas);
                break;
            case 'waveform':
                visualization = new WaveformVisualization(canvas);
                break;
            case 'spectralFlux':
                visualization = new SpectralFluxVisualization(canvas);
                break;
            case 'spectrogram':
                visualization = new SpectrogramVisualization(canvas);
                break;
            case 'bpmTracker':
                visualization = new BPMTrackerVisualization(canvas);
                break;
            case 'energyCircle':
                visualization = new EnergyCircleVisualization(canvas);
                break;
            case 'mondrian':
                visualization = new MondrianVisualization(canvas);
                break;
            case 'abstract':
                visualization = new AbstractVisualization(canvas);
                break;
            default:
                console.error(`Type de visualisation non reconnu: ${type}`);
                return;
        }
        
        // Enregistrement de la visualisation
        this.visualizations[`viz${index}`] = visualization;
        
        // Démarrage de la visualisation
        visualization.start();
        
        // Application des mappings configurés pour cette visualisation
        this.applySignalMappings(visualization, type);
        
        // Connexion à audioProcessor pour les mises à jour
        if (audioProcessor.isInitialized) {
            audioProcessor.addAudioProcessCallback(data => {
                visualization.updateAudioData(data);
            });
        }
    }

    /**
 * ui-controller.js - Partie 3/6 - Méthodes pour les visualisations et l'interface
 */

    /**
     * Applique les mappages de signaux à une visualisation
     * @param {Visualization} visualization - Visualisation à configurer
     * @param {string} type - Type de visualisation
     */
    applySignalMappings(visualization, type) {
        // Collecte des mappings pour cette visualisation
        const mappings = {};
        
        this.elements.signalSelects.forEach(select => {
            const vizType = select.dataset.viz;
            const param = select.dataset.param;
            
            if (vizType === type) {
                mappings[param] = select.value;
            }
        });
        
        // Application des mappings
        if (Object.keys(mappings).length > 0) {
            visualization.setSignalMappings(mappings);
        }
    }
    
    /**
     * Met à jour les titres des visualisations
     */
    updateVisualizationTitles() {
        const viz1Type = this.elements.vizType1Select.value;
        const viz2Type = this.elements.vizType2Select.value;
        
        document.getElementById('viz1Title').textContent = this.getVisualizationTitle(viz1Type);
        document.getElementById('viz2Title').textContent = this.getVisualizationTitle(viz2Type);
    }
    
    /**
     * Met à jour les panneaux d'information
     */
    updateInfoPanels() {
        const viz1Type = this.elements.vizType1Select.value;
        const viz2Type = this.elements.vizType2Select.value;
        
        this.elements.infoPanel1.innerHTML = this.getVisualizationInfo(viz1Type);
        this.elements.infoPanel2.innerHTML = this.getVisualizationInfo(viz2Type);
    }
    
    /**
     * Retourne le titre pour un type de visualisation
     * @param {string} type - Type de visualisation
     * @returns {string} Titre de la visualisation
     */
    getVisualizationTitle(type) {
        switch (type) {
            case 'frequencyBars':
                return 'Spectre de Fréquences';
            case 'waveform':
                return 'Forme d\'Onde';
            case 'spectralFlux':
                return 'Flux Spectral';
            case 'spectrogram':
                return 'Spectrogramme';
            case 'bpmTracker':
                return 'Analyseur de BPM';
            case 'energyCircle':
                return 'Cercle Énergétique';
            case 'mondrian':
                return 'Mondrian';
            case 'abstract':
                return 'Abstrait';
            default:
                return 'Visualisation Audio';
        }
    }
    
    /**
     * Retourne les informations pour un type de visualisation
     * @param {string} type - Type de visualisation
     * @returns {string} HTML contenant les informations
     */
    getVisualizationInfo(type) {
        switch (type) {
            case 'frequencyBars':
                return `
                    <h4>Spectre de Fréquences (FFT)</h4>
                    <p>La Transformée de Fourier Rapide (FFT) décompose un signal sonore en ses fréquences constitutives, 
                    permettant de visualiser la distribution énergétique du son à travers le spectre audible (20Hz - 20kHz).</p>
                    <p>Algorithme : Nous échantillonnons le signal audio puis appliquons la FFT pour obtenir l'amplitude de chaque 
                    bande de fréquence.</p>
                    <p><code>X(k) = ∑[n=0 to N-1] x(n)e^(-j2πkn/N)</code></p>
                    <p>Où <code>x(n)</code> est le signal d'entrée, <code>N</code> est le nombre d'échantillons, et <code>X(k)</code> 
                    représente l'amplitude de la fréquence <code>k</code>.</p>
                `;
            case 'waveform':
                return `
                    <h4>Forme d'Onde</h4>
                    <p>La forme d'onde représente l'amplitude du signal audio au fil du temps, montrant directement 
                    les variations de pression acoustique captées par le microphone.</p>
                    <p>C'est la représentation la plus fondamentale du signal sonore, permettant d'observer les motifs temporels 
                    et l'enveloppe du son.</p>
                    <p>Le tracé montre l'amplitude normalisée (entre -1 et 1) sur l'axe Y et le temps sur l'axe X.</p>
                `;
            case 'spectralFlux':
                return `
                    <h4>Flux Spectral</h4>
                    <p>Le flux spectral mesure la vitesse de changement du spectre de fréquences au fil du temps. 
                    C'est un excellent indicateur des transitions sonores et des changements dans le contenu audio.</p>
                    <p>Algorithme : On calcule la différence entre les spectres de fréquence consécutifs, en ne conservant 
                    que les changements positifs (augmentations d'énergie).</p>
                    <p><code>flux = ∑ max(|X_t[k] - X_{t-1}[k]|, 0)</code></p>
                    <p>Où <code>X_t[k]</code> est l'amplitude de la fréquence <code>k</code> au temps <code>t</code>.</p>
                    <p>Les pics dans le flux spectral indiquent souvent des attaques percussives ou des changements brusques 
                    dans la musique.</p>
                `;
            case 'spectrogram':
                return `
                    <h4>Spectrogramme</h4>
                    <p>Le spectrogramme est une représentation visuelle tridimensionnelle du signal sonore, montrant 
                    l'évolution du spectre de fréquences au fil du temps.</p>
                    <p>L'axe vertical représente la fréquence (de bas en haut), l'axe horizontal représente le temps 
                    (de gauche à droite), et la couleur représente l'intensité (bleu = faible, rouge = élevée).</p>
                    <p>Cette visualisation permet d'identifier des motifs harmoniques, des formants vocaux, des instruments, 
                    et la structure temporelle du son.</p>
                    <p>L'échelle de fréquence est logarithmique pour mieux représenter la perception humaine des hauteurs.</p>
                `;
            case 'bpmTracker':
                return `
                    <h4>Analyseur de BPM</h4>
                    <p>Le BPM (Battements Par Minute) mesure le tempo d'un morceau musical. Notre algorithme détecte les pics 
                    d'énergie qui correspondent aux battements.</p>
                    <p>Algorithme de détection :</p>
                    <ol>
                        <li>Extraction de l'énergie dans les basses fréquences (20-250Hz)</li>
                        <li>Détection des pics locaux dépassant un seuil adaptatif basé sur l'énergie moyenne</li>
                        <li>Filtrage temporel pour éviter les faux positifs</li>
                        <li>Calcul des intervalles entre battements consécutifs</li>
                        <li>Conversion des intervalles médians en BPM (60000/intervalle_ms)</li>
                        <li>Lissage temporel pour stabiliser l'affichage</li>
                    </ol>
                    <p>La confiance indique la régularité des battements détectés.</p>
                    <p>Le BPM manuel est calculé à partir des taps de l'utilisateur.</p>
                `;
            case 'energyCircle':
                return `
                    <h4>Cercle Énergétique</h4>
                    <p>Cette visualisation représente l'énergie audio sous forme de cercles interactifs, permettant de 
                    comparer facilement l'équilibre entre les graves, médiums et aigus.</p>
                    <p>Le cercle principal au centre représente l'énergie totale, tandis que les trois cercles 
                    satellites représentent respectivement :</p>
                    <ul>
                        <li>Rouge : Graves (20-250Hz)</li>
                        <li>Vert : Médiums (250-2000Hz)</li>
                        <li>Bleu : Aigus (2000-20000Hz)</li>
                    </ul>
                    <p>La taille de chaque cercle est proportionnelle à l'énergie dans la bande correspondante, 
                    et un effet de pulsation est visible lors de la détection d'un battement.</p>
                `;
            case 'mondrian':
                return `
                    <h4>Visualisation Mondrian</h4>
                    <p>Inspirée des compositions néoplastiques de Piet Mondrian, cette visualisation 
                    représente le signal audio sous forme de grille rectangulaire colorée.</p>
                    <p>Les rectangles se divisent et fusionnent en fonction de l'activité audio, créant 
                    une composition dynamique qui évolue avec la musique.</p>
                    <p>Paramètres configurables :</p>
                    <ul>
                        <li><strong>Taille</strong> - contrôle la taille des rectangles</li>
                        <li><strong>Couleur</strong> - influence la sélection des couleurs</li>
                        <li><strong>Division</strong> - déclenche la division/fusion des rectangles</li>
                    </ul>
                    <p>Les battements audio déclenchent des changements visuels synchronisés.</p>
                `;
            case 'abstract':
                return `
                    <h4>Visualisation Abstraite</h4>
                    <p>Cette visualisation utilise des formes géométriques abstraites qui évoluent 
                    et réagissent au signal audio de manière organique.</p>
                    <p>Différentes caractéristiques du son sont mappées sur les propriétés visuelles :</p>
                    <ul>
                        <li><strong>Forme</strong> - type et taille des formes</li>
                        <li><strong>Couleur</strong> - palette chromatique</li>
                        <li><strong>Position</strong> - emplacement des formes</li>
                        <li><strong>Rotation</strong> - mouvement angulaire des formes</li>
                    </ul>
                    <p>L'ensemble crée une chorégraphie visuelle dynamique qui reflète la texture et 
                    le rythme de l'audio en temps réel.</p>
                `;
            default:
                return `
                    <h4>Visualisation Audio</h4>
                    <p>Cette visualisation représente les propriétés du signal audio capté par votre microphone.</p>
                    <p>Utilisez les contrôles pour ajuster les paramètres et explorer différentes façons de 
                    représenter le son.</p>
                `;
        }
    }

    /**
 * ui-controller.js - Partie 4/6 - Gestionnaires d'événements généraux et audio
 */

    /**
     * Gestionnaire d'événement pour le clic sur un onglet
     * @param {Event} event - Événement de clic
     */
    onTabClick(event) {
        const tabId = event.target.dataset.tab;
        
        // Désactiver tous les onglets
        this.elements.tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Masquer tous les contenus d'onglets
        this.elements.tabContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Activer l'onglet sélectionné
        event.target.classList.add('active');
        
        // Afficher le contenu correspondant
        document.getElementById(tabId).classList.add('active');
        
        // Mettre à jour l'état
        this.state.activeTab = tabId;
    }
    
    /**
     * Gestionnaire d'événement pour le clic sur le bouton d'activation du microphone
     */
    async onStartAudioClick() {
        if (!this.state.isAudioInitialized) {
            try {
                // Initialisation de l'audio
                await audioProcessor.initMicrophoneInput();
                
                // Mise à jour de l'interface
                this.elements.micStatus.classList.add('connected');
                this.elements.startAudioBtn.textContent = 'Microphone Actif';
                
                // Connexion des visualisations à l'audio
                this.connectVisualizationsToAudio();
                
                // Mise à jour de l'état
                this.state.isAudioInitialized = true;
            } catch (error) {
                console.error('Erreur lors de l\'initialisation audio:', error);
                alert('Erreur lors de l\'accès au microphone. Veuillez autoriser l\'accès au microphone et réessayer.');
            }
        } else {
            // Réinitialisation de l'audio si déjà actif
            audioProcessor.dispose();
            
            // Mise à jour de l'interface
            this.elements.micStatus.classList.remove('connected');
            this.elements.startAudioBtn.textContent = 'Activer le Microphone';
            
            // Mise à jour de l'état
            this.state.isAudioInitialized = false;
        }
    }
    
    /**
     * Gestionnaire d'événement pour le clic sur le bouton de chargement de fichier audio
     */
    onLoadAudioFileClick() {
        this.elements.audioFileInput.click();
    }
    
    /**
     * Gestionnaire d'événement pour la sélection d'un fichier audio
     * @param {Event} event - Événement de changement
     */
    async onAudioFileSelected(event) {
        const file = event.target.files[0];
        
        if (file) {
            try {
                // Initialisation avec le fichier audio
                await audioProcessor.initFileInput(file);
                
                // Mise à jour de l'interface
                this.elements.micStatus.classList.add('connected');
                this.elements.startAudioBtn.textContent = file.name;
                
                // Connexion des visualisations à l'audio
                this.connectVisualizationsToAudio();
                
                // Mise à jour de l'état
                this.state.isAudioInitialized = true;
            } catch (error) {
                console.error('Erreur lors du chargement du fichier audio:', error);
                alert(`Erreur lors du chargement du fichier audio: ${error.message}`);
            }
        }
    }
    
    /**
     * Connecte les visualisations à l'audio
     */
    connectVisualizationsToAudio() {
        if (!audioProcessor.isInitialized) return;
        
        // Connexion de chaque visualisation
        for (const vizKey in this.visualizations) {
            const viz = this.visualizations[vizKey];
            if (viz) {
                audioProcessor.addAudioProcessCallback(data => {
                    viz.updateAudioData(data);
                });
            }
        }
    }
    
    /**
     * Gestionnaire d'événement pour le clic sur le bouton de tap tempo
     */
    onTapTempoClick() {
        const result = beatDetector.tap();
        
        // Mise à jour de l'affichage du BPM manuel
        if (result.bpm) {
            document.getElementById('manualBpm').textContent = result.bpm;
            document.getElementById('manualBpmValue').textContent = result.bpm;
        }
        
        // Animation du bouton
        this.elements.tapTempoBtn.classList.add('pulse');
        setTimeout(() => {
            this.elements.tapTempoBtn.classList.remove('pulse');
        }, 200);
    }
    
    /**
     * Gestionnaire d'événement pour le clic sur le bouton de réinitialisation du tap tempo
     */
    onResetTapTempoClick() {
        beatDetector.resetTapTempo();
        document.getElementById('manualBpm').textContent = '0';
        document.getElementById('manualBpmValue').textContent = '0';
    }
    
    /**
     * Gestionnaire d'événement pour le changement de type de visualisation
     * @param {number} index - Index de la visualisation (1 ou 2)
     * @param {Event} event - Événement de changement
     */
    onVisualizationTypeChange(index, event) {
        const vizType = event.target.value;
        
        // Création de la nouvelle visualisation
        this.createVisualization(index, vizType);
        
        // Mise à jour des titres
        this.updateVisualizationTitles();
        
        // Mise à jour des panneaux d'info
        this.updateInfoPanels();
    }
    
    /**
     * Gestionnaire d'événement pour le clic sur un bouton d'information
     * @param {number} index - Index du panneau d'info (1 ou 2)
     */
    onInfoButtonClick(index) {
        const panel = this.elements[`infoPanel${index}`];
        panel.style.display = panel.style.display === 'none' || panel.style.display === '' ? 'block' : 'none';
    }

    /**
 * ui-controller.js - Partie 5/6 - Gestionnaires d'événements pour les contrôles et les visualisations
 */

    /**
     * Gestionnaire d'événement pour le clic sur un bouton plein écran
     * @param {number} index - Index de la visualisation (1 ou 2)
     */
    onFullscreenClick(index) {
        const panel = this.elements[`vizPanel${index}`];
        
        if (!this.state.isFullscreen) {
            // Passage en plein écran
            panel.classList.add('fullscreen');
            
            // Création d'un bouton de sortie du plein écran
            const exitButton = document.createElement('button');
            exitButton.className = 'fullscreen-exit';
            exitButton.innerHTML = '×';
            exitButton.addEventListener('click', this.exitFullscreen);
            panel.appendChild(exitButton);
            
            // Mise à jour de l'état
            this.state.isFullscreen = true;
            this.state.fullscreenElement = panel;
            
            // Redimensionnement des visualisations
            if (this.visualizations[`viz${index}`]) {
                this.visualizations[`viz${index}`].resize();
            }
        } else {
            this.exitFullscreen();
        }
    }
    
    /**
     * Quitte le mode plein écran
     */
    exitFullscreen() {
        if (this.state.fullscreenElement) {
            // Suppression de la classe fullscreen
            this.state.fullscreenElement.classList.remove('fullscreen');
            
            // Suppression du bouton de sortie
            const exitButton = this.state.fullscreenElement.querySelector('.fullscreen-exit');
            if (exitButton) {
                exitButton.remove();
            }
            
            // Mise à jour de l'état
            this.state.isFullscreen = false;
            this.state.fullscreenElement = null;
            
            // Redimensionnement des visualisations
            if (this.visualizations.viz1) {
                this.visualizations.viz1.resize();
            }
            if (this.visualizations.viz2) {
                this.visualizations.viz2.resize();
            }
        }
    }
    
    /**
     * Gestionnaire d'événement pour le changement de taille FFT
     * @param {Event} event - Événement de changement
     */
    onFFTSizeChange(event) {
        const fftSizeExp = parseInt(event.target.value);
        const fftSize = Math.pow(2, fftSizeExp);
        
        // Mise à jour de l'affichage
        document.getElementById('fftSizeValue').textContent = fftSize;
        
        // Mise à jour de l'analyseur audio
        if (audioProcessor.isInitialized) {
            audioProcessor.updateAnalyserSettings({ fftSize });
        }
    }
    
    /**
     * Gestionnaire d'événement pour le changement du paramètre de lissage FFT
     * @param {Event} event - Événement de changement
     */
    onSmoothingChange(event) {
        const smoothing = parseFloat(event.target.value);
        
        // Mise à jour de l'affichage
        document.getElementById('smoothingValue').textContent = smoothing.toFixed(2);
        
        // Mise à jour de l'analyseur audio
        if (audioProcessor.isInitialized) {
            audioProcessor.updateAnalyserSettings({ smoothing });
        }
    }
    
    /**
     * Gestionnaire d'événement pour le changement des facteurs d'échelle
     * @param {Event} event - Événement de changement
     */
    onScaleFactorChange(event) {
        const bassScale = parseFloat(document.getElementById('bassScale').value);
        const midScale = parseFloat(document.getElementById('midScale').value);
        const trebleScale = parseFloat(document.getElementById('trebleScale').value);
        
        // Mise à jour de l'affichage
        document.getElementById('bassScaleValue').textContent = bassScale.toFixed(1);
        document.getElementById('midScaleValue').textContent = midScale.toFixed(1);
        document.getElementById('trebleScaleValue').textContent = trebleScale.toFixed(1);
        
        // Mise à jour du processeur audio
        audioProcessor.setScaleFactors(bassScale, midScale, trebleScale);
    }
    
    /**
     * Gestionnaire d'événement pour le changement des paramètres de détection de battement
     * @param {Event} event - Événement de changement
     */
    onBeatSettingChange(event) {
        const beatSensitivity = parseFloat(document.getElementById('beatSensitivity').value);
        const beatDecay = parseFloat(document.getElementById('beatDecay').value);
        const beatThreshold = parseFloat(document.getElementById('beatThreshold').value);
        
        // Mise à jour de l'affichage
        document.getElementById('beatSensitivityValue').textContent = beatSensitivity.toFixed(1);
        document.getElementById('beatDecayValue').textContent = beatDecay.toFixed(3);
        document.getElementById('beatThresholdValue').textContent = beatThreshold.toFixed(2);
        
        // Mise à jour du détecteur de battements
        beatDetector.updateSettings({
            sensitivity: beatSensitivity,
            decay: beatDecay,
            threshold: beatThreshold
        });
    }
    
    /**
     * Gestionnaire d'événement pour le changement des mappings de signaux
     * @param {Event} event - Événement de changement
     */
    onSignalMappingChange(event) {
        const select = event.target;
        const vizType = select.dataset.viz;
        const param = select.dataset.param;
        const signalValue = select.value;
        
        // Récupération de la visualisation correspondante
        let visualization = null;
        
        if (this.elements.vizType1Select.value === vizType) {
            visualization = this.visualizations.viz1;
        } else if (this.elements.vizType2Select.value === vizType) {
            visualization = this.visualizations.viz2;
        }
        
        // Application du mapping si la visualisation est active
        if (visualization) {
            const mapping = {};
            mapping[param] = signalValue;
            visualization.setSignalMappings(mapping);
        }
    }

    /**
 * ui-controller.js - Partie 6/6 - Gestion des préréglages et métriques
 */

    /**
     * Gestionnaire d'événement pour le changement de préréglage
     * @param {Event} event - Événement de changement
     */
    onPresetChange(event) {
        const presetKey = event.target.value;
        
        if (presetKey) {
            let preset = null;
            
            // Récupération du préréglage (par défaut ou personnalisé)
            if (presetKey.startsWith('custom_')) {
                const customPresets = this.loadCustomPresets();
                preset = customPresets[presetKey];
            } else if (CONFIG.presets[presetKey]) {
                preset = CONFIG.presets[presetKey];
            }
            
            if (preset) {
                this.applyPreset(preset);
            }
        }
    }
    
    /**
     * Applique un préréglage à l'application
     * @param {Object} preset - Préréglage à appliquer
     */
    applyPreset(preset) {
        // Mise à jour des contrôles FFT
        const fftSizeExp = Math.log2(preset.fftSize);
        document.getElementById('fftSize').value = fftSizeExp;
        document.getElementById('fftSizeValue').textContent = preset.fftSize;
        
        document.getElementById('smoothingTimeConstant').value = preset.smoothing;
        document.getElementById('smoothingValue').textContent = preset.smoothing.toFixed(2);
        
        // Mise à jour des facteurs d'échelle
        document.getElementById('bassScale').value = preset.bassScale;
        document.getElementById('bassScaleValue').textContent = preset.bassScale.toFixed(1);
        
        document.getElementById('midScale').value = preset.midScale;
        document.getElementById('midScaleValue').textContent = preset.midScale.toFixed(1);
        
        document.getElementById('trebleScale').value = preset.trebleScale;
        document.getElementById('trebleScaleValue').textContent = preset.trebleScale.toFixed(1);
        
        // Mise à jour des paramètres de détection de battements
        document.getElementById('beatSensitivity').value = preset.beatSensitivity;
        document.getElementById('beatSensitivityValue').textContent = preset.beatSensitivity.toFixed(1);
        
        document.getElementById('beatDecay').value = preset.beatDecay;
        document.getElementById('beatDecayValue').textContent = preset.beatDecay.toFixed(3);
        
        document.getElementById('beatThreshold').value = preset.beatThreshold;
        document.getElementById('beatThresholdValue').textContent = preset.beatThreshold.toFixed(2);
        
        // Mise à jour des types de visualisation
        if (preset.vizType1 && preset.vizType1 !== this.elements.vizType1Select.value) {
            this.elements.vizType1Select.value = preset.vizType1;
            this.onVisualizationTypeChange(1, { target: this.elements.vizType1Select });
        }
        
        if (preset.vizType2 && preset.vizType2 !== this.elements.vizType2Select.value) {
            this.elements.vizType2Select.value = preset.vizType2;
            this.onVisualizationTypeChange(2, { target: this.elements.vizType2Select });
        }
        
        // Mise à jour des mappings
        if (preset.mapping) {
            // Mise à jour des sélecteurs de mapping dans l'interface
            this.elements.signalSelects.forEach(select => {
                const vizType = select.dataset.viz;
                const param = select.dataset.param;
                
                if (preset.mapping[vizType] && preset.mapping[vizType][param]) {
                    select.value = preset.mapping[vizType][param];
                }
            });
            
            // Application des mappings aux visualisations actives
            if (preset.mapping.mondrian && this.visualizations.viz1 instanceof MondrianVisualization) {
                this.visualizations.viz1.setSignalMappings(preset.mapping.mondrian);
            } else if (preset.mapping.mondrian && this.visualizations.viz2 instanceof MondrianVisualization) {
                this.visualizations.viz2.setSignalMappings(preset.mapping.mondrian);
            }
            
            if (preset.mapping.abstract && this.visualizations.viz1 instanceof AbstractVisualization) {
                this.visualizations.viz1.setSignalMappings(preset.mapping.abstract);
            } else if (preset.mapping.abstract && this.visualizations.viz2 instanceof AbstractVisualization) {
                this.visualizations.viz2.setSignalMappings(preset.mapping.abstract);
            }
        }
        
        // Application des paramètres à l'audio si initialisé
        if (audioProcessor.isInitialized) {
            audioProcessor.updateAnalyserSettings({
                fftSize: preset.fftSize,
                smoothing: preset.smoothing
            });
            
            audioProcessor.setScaleFactors(preset.bassScale, preset.midScale, preset.trebleScale);
        }
        
        // Application des paramètres au détecteur de battements
        beatDetector.updateSettings({
            sensitivity: preset.beatSensitivity,
            decay: preset.beatDecay,
            threshold: preset.beatThreshold
        });
        
        console.log(`Préréglage "${preset.name}" appliqué avec succès.`);
    }
    
    /**
     * Gestionnaire d'événement pour le clic sur le bouton de sauvegarde de préréglage
     */
    onSavePresetClick() {
        const presetName = this.elements.newPresetName.value.trim();
        
        if (presetName === '') {
            alert('Veuillez entrer un nom pour le préréglage.');
            return;
        }
        
        // Création du préréglage à partir des paramètres actuels
        const preset = {
            name: presetName,
            fftSize: parseInt(document.getElementById('fftSizeValue').textContent),
            smoothing: parseFloat(document.getElementById('smoothingTimeConstant').value),
            bassScale: parseFloat(document.getElementById('bassScale').value),
            midScale: parseFloat(document.getElementById('midScale').value),
            trebleScale: parseFloat(document.getElementById('trebleScale').value),
            beatSensitivity: parseFloat(document.getElementById('beatSensitivity').value),
            beatDecay: parseFloat(document.getElementById('beatDecay').value),
            beatThreshold: parseFloat(document.getElementById('beatThreshold').value),
            vizType1: this.elements.vizType1Select.value,
            vizType2: this.elements.vizType2Select.value,
            mapping: {
                mondrian: {},
                abstract: {}
            }
        };
        
        // Collecte des mappings
        this.elements.signalSelects.forEach(select => {
            const vizType = select.dataset.viz;
            const param = select.dataset.param;
            
            if (vizType === 'mondrian') {
                preset.mapping.mondrian[param] = select.value;
            } else if (vizType === 'abstract') {
                preset.mapping.abstract[param] = select.value;
            }
        });
        
        // Sauvegarde du préréglage dans localStorage
        const customPresets = this.loadCustomPresets();
        const presetKey = 'custom_' + Date.now();
        customPresets[presetKey] = preset;
        
        localStorage.setItem('audioVisualizer_customPresets', JSON.stringify(customPresets));
        
        // Mise à jour de la liste déroulante
        this.loadPresets();
        
        // Sélection du nouveau préréglage
        this.elements.presetSelect.value = presetKey;
        
        // Effacement du champ de nom
        this.elements.newPresetName.value = '';
        
        console.log(`Préréglage "${presetName}" sauvegardé avec succès.`);
    }
    
    /**
     * Gestionnaire d'événement pour le clic sur le bouton de suppression de préréglage
     */
    onDeletePresetClick() {
        const presetKey = this.elements.presetSelect.value;
        
        if (!presetKey || !presetKey.startsWith('custom_')) {
            alert('Veuillez sélectionner un préréglage personnalisé à supprimer.');
            return;
        }
        
        // Chargement des préréglages personnalisés
        const customPresets = this.loadCustomPresets();
        
        // Vérification que le préréglage existe
        if (!customPresets[presetKey]) {
            alert('Le préréglage sélectionné n\'existe pas.');
            return;
        }
        
        // Confirmation de la suppression
        if (confirm(`Voulez-vous vraiment supprimer le préréglage "${customPresets[presetKey].name}" ?`)) {
            // Suppression du préréglage
            delete customPresets[presetKey];
            
            // Sauvegarde des préréglages mis à jour
            localStorage.setItem('audioVisualizer_customPresets', JSON.stringify(customPresets));
            
            // Mise à jour de la liste déroulante
            this.loadPresets();
            
            // Réinitialisation de la sélection
            this.elements.presetSelect.value = '';
            
            console.log('Préréglage supprimé avec succès.');
        }
    }
    
    /**
     * Charge les préréglages personnalisés depuis localStorage
     * @returns {Object} Préréglages personnalisés
     */
    loadCustomPresets() {
        const storedPresets = localStorage.getItem('audioVisualizer_customPresets');
        return storedPresets ? JSON.parse(storedPresets) : {};
    }
    
    /**
     * Charge tous les préréglages (par défaut et personnalisés) dans la liste déroulante
     */
    loadPresets() {
        // Récupération des préréglages par défaut
        const defaultPresets = CONFIG.presets;
        
        // Récupération des préréglages personnalisés
        const customPresets = this.loadCustomPresets();
        
        // Effacement des options existantes (sauf la première)
        while (this.elements.presetSelect.options.length > 1) {
            this.elements.presetSelect.remove(1);
        }
        
        // Ajout des préréglages par défaut
        const defaultPresetGroup = document.createElement('optgroup');
        defaultPresetGroup.label = 'Préréglages par défaut';
        
        for (const key in defaultPresets) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = defaultPresets[key].name;
            defaultPresetGroup.appendChild(option);
        }
        
        this.elements.presetSelect.appendChild(defaultPresetGroup);
        
        // Ajout des préréglages personnalisés s'il y en a
        if (Object.keys(customPresets).length > 0) {
            const customPresetGroup = document.createElement('optgroup');
            customPresetGroup.label = 'Préréglages personnalisés';
            
            for (const key in customPresets) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = customPresets[key].name;
                customPresetGroup.appendChild(option);
            }
            
            this.elements.presetSelect.appendChild(customPresetGroup);
        }
    }
    
    /**
     * Met à jour les métriques affichées
     */
    updateMetrics() {
        if (!audioProcessor || !audioProcessor.isInitialized) return;
        
        // Mise à jour des énergies
        const bassEnergyElement = document.getElementById('bassEnergy');
        if (bassEnergyElement) {
            bassEnergyElement.textContent = audioProcessor.stats.bassEnergy.toFixed(2);
        }
        
        const midEnergyElement = document.getElementById('midEnergy');
        if (midEnergyElement) {
            const midEnergy = ((audioProcessor.stats.lowMidEnergy + audioProcessor.stats.midEnergy + audioProcessor.stats.highMidEnergy) / 3);
            midEnergyElement.textContent = midEnergy.toFixed(2);
        }
        
        const trebleEnergyElement = document.getElementById('trebleEnergy');
        if (trebleEnergyElement) {
            trebleEnergyElement.textContent = audioProcessor.stats.trebleEnergy.toFixed(2);
        }
        
        // Mise à jour des métriques BPM
        const beatData = beatDetector.getBeatData();
        
        const bpmValueElement = document.getElementById('bpmValue');
        if (bpmValueElement) {
            bpmValueElement.textContent = beatData.bpm || '0';
        }
        
        const bpmConfidenceElement = document.getElementById('bpmConfidence');
        if (bpmConfidenceElement) {
            bpmConfidenceElement.textContent = `${beatData.confidence}%`;
        }
        
        const energyLevelElement = document.getElementById('energyLevel');
        if (energyLevelElement) {
            energyLevelElement.textContent = audioProcessor.stats.totalEnergy.toFixed(2);
            
            // Effet de pulsation sur battement
            if (beatData.beatDetected) {
                energyLevelElement.classList.add('pulse');
                setTimeout(() => {
                    energyLevelElement.classList.remove('pulse');
                }, 200);
            }
        }
        
        const manualBpmValueElement = document.getElementById('manualBpmValue');
        if (manualBpmValueElement) {
            manualBpmValueElement.textContent = beatData.manualBpm || '0';
        }
    }
    
    /**
     * Nettoie les ressources utilisées par le contrôleur UI
     */
    dispose() {
        // Arrêt des visualisations
        for (const vizKey in this.visualizations) {
            if (this.visualizations[vizKey]) {
                this.visualizations[vizKey].dispose();
                this.visualizations[vizKey] = null;
            }
        }
        
        // Nettoyage de l'audio
        if (audioProcessor && audioProcessor.isInitialized) {
            audioProcessor.dispose();
        }
    }
}

// Création d'une instance unique pour l'application
const uiController = new UIController();

// Export
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = uiController;
} else {
    window.uiController = uiController;
}