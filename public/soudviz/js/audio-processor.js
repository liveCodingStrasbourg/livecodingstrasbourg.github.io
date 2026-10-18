/**
 * audio-processor.js - Traitement du signal audio et extraction de caractéristiques
 * Ce module gère l'initialisation de l'API Web Audio et l'extraction des différentes 
 * caractéristiques du signal audio (bandes de fréquences, centroid, zcr, etc.)
 */

class AudioProcessor {
    constructor() {
        // Contexte et nœuds audio
        this.audioContext = null;
        this.analyser = null;
        this.sourceNode = null;
        this.isInitialized = false;
        
        // Données d'analyse
        this.frequencyData = null;
        this.timeData = null;
        this.spectralFluxData = [];
        
        // Statistiques calculées
        this.stats = {
            bassEnergy: 0,
            lowMidEnergy: 0,
            midEnergy: 0,
            highMidEnergy: 0,
            trebleEnergy: 0,
            totalEnergy: 0,
            spectralCentroid: 0,
            zeroCrossingRate: 0,
            rmsEnergy: 0,
            spectralFlux: 0
        };
        
        // Callbacks et observateurs
        this.onAudioProcessCallbacks = [];
        
        // Facteurs d'échelle pour les différentes bandes
        this.bassScale = 1.5;
        this.midScale = 1.0;
        this.trebleScale = 1.0;
        
        // État de la source
        this.sourceType = null; // 'mic' ou 'file'
        this.audioElement = null;
    }
    
    /**
     * Initialise le contexte audio et demande l'accès au microphone
     * @returns {Promise} Une promesse qui est résolue lorsque l'audio est initialisé
     */
    async initMicrophoneInput() {
        try {
            // Demande d'accès au microphone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Création/réutilisation du contexte audio
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Nettoyage de la source précédente si elle existe
            if (this.sourceNode) {
                this.sourceNode.disconnect();
            }
            
            // Création de l'analyseur s'il n'existe pas
            if (!this.analyser) {
                this.analyser = this.audioContext.createAnalyser();
                this.updateAnalyserSettings();
            }
            
            // Création de la source audio du microphone
            this.sourceNode = this.audioContext.createMediaStreamSource(stream);
            this.sourceNode.connect(this.analyser);
            
            // Mise à jour des tableaux pour stocker les données
            this.updateDataArrays();
            
            // Mise à jour de l'état
            this.isInitialized = true;
            this.sourceType = 'mic';
            
            console.log('Microphone initialized with FFT size:', this.analyser.fftSize);
            return true;
        } catch (error) {
            console.error('Error initializing microphone input:', error);
            this.isInitialized = false;
            throw error;
        }
    }
    
    /**
     * Initialise le contexte audio avec un fichier audio
     * @param {File} file - Le fichier audio à traiter
     * @returns {Promise} Une promesse qui est résolue lorsque l'audio est initialisé
     */
    async initFileInput(file) {
        try {
            // Vérification du type de fichier
            if (!file.type.startsWith('audio/')) {
                throw new Error('Le fichier sélectionné n\'est pas un fichier audio.');
            }
            
            // Création/réutilisation du contexte audio
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Nettoyage de la source précédente si elle existe
            if (this.sourceNode) {
                this.sourceNode.disconnect();
            }
            
            // Création de l'élément audio pour la lecture du fichier
            if (!this.audioElement) {
                this.audioElement = new Audio();
                this.audioElement.controls = false;
                this.audioElement.loop = true;
            }
            
            // Création de l'URL du fichier
            const fileURL = URL.createObjectURL(file);
            this.audioElement.src = fileURL;
            
            // Création de l'analyseur s'il n'existe pas
            if (!this.analyser) {
                this.analyser = this.audioContext.createAnalyser();
                this.updateAnalyserSettings();
            }
            
            // Attente du chargement des métadonnées
            await new Promise(resolve => {
                this.audioElement.onloadedmetadata = resolve;
            });
            
            // Création de la source audio à partir de l'élément audio
            this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
            this.sourceNode.connect(this.analyser);
            this.sourceNode.connect(this.audioContext.destination); // Pour entendre l'audio
            
            // Mise à jour des tableaux pour stocker les données
            this.updateDataArrays();
            
            // Mise à jour de l'état
            this.isInitialized = true;
            this.sourceType = 'file';
            
            // Démarrage de la lecture
            await this.audioElement.play();
            
            console.log('File audio initialized with FFT size:', this.analyser.fftSize);
            return true;
        } catch (error) {
            console.error('Error initializing file input:', error);
            this.isInitialized = false;
            throw error;
        }
    }
    
    /**
     * Met à jour les paramètres de l'analyseur FFT
     * @param {Object} options - Options de configuration
     */
    updateAnalyserSettings(options = {}) {
        if (!this.analyser) return;
        
        // Mise à jour de la taille FFT
        if (options.fftSize) {
            const fftSize = parseInt(options.fftSize);
            if (fftSize >= 32 && fftSize <= 32768 && (fftSize & (fftSize - 1)) === 0) { // Vérification que c'est une puissance de 2
                this.analyser.fftSize = fftSize;
            } else {
                console.warn('Invalid FFT size. Using default:', this.analyser.fftSize);
            }
        }
        
        // Mise à jour du lissage temporel
        if (options.smoothing !== undefined) {
            const smoothing = parseFloat(options.smoothing);
            if (smoothing >= 0 && smoothing < 1) {
                this.analyser.smoothingTimeConstant = smoothing;
            }
        }
        
        // Mise à jour des limites de décibels
        if (options.minDecibels !== undefined) {
            this.analyser.minDecibels = options.minDecibels;
        }
        
        if (options.maxDecibels !== undefined) {
            this.analyser.maxDecibels = options.maxDecibels;
        }
        
        // Mise à jour des tableaux de données
        this.updateDataArrays();
        
        console.log('Analyser settings updated:', {
            fftSize: this.analyser.fftSize,
            bins: this.analyser.frequencyBinCount,
            smoothing: this.analyser.smoothingTimeConstant,
            minDecibels: this.analyser.minDecibels,
            maxDecibels: this.analyser.maxDecibels
        });
    }
    
    /**
     * Met à jour les tableaux de données en fonction de la taille FFT
     */
    updateDataArrays() {
        if (!this.analyser) return;
        
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
        this.timeData = new Uint8Array(this.analyser.fftSize);
    }
    
    /**
     * Fonction principale d'analyse audio appelée à chaque frame
     */
    processAudio() {
        if (!this.isInitialized || !this.analyser) return;
        
        // Récupération des données audio
        this.analyser.getByteFrequencyData(this.frequencyData);
        this.analyser.getByteTimeDomainData(this.timeData);
        
        // Extraction des caractéristiques
        this.extractFeatures();
        
        // Notification des observateurs
        this.notifyObservers();
    }
    
    /**
     * Extrait les différentes caractéristiques du signal audio
     */
    extractFeatures() {
        // Calcul des énergies par bande de fréquence
        const rawBassEnergy = this.calculateBandEnergy(
            CONFIG.frequencyBands.bass.min, 
            CONFIG.frequencyBands.bass.max
        );
        
        const rawLowMidEnergy = this.calculateBandEnergy(
            CONFIG.frequencyBands.lowMid.min, 
            CONFIG.frequencyBands.lowMid.max
        );
        
        const rawMidEnergy = this.calculateBandEnergy(
            CONFIG.frequencyBands.mid.min, 
            CONFIG.frequencyBands.mid.max
        );
        
        const rawHighMidEnergy = this.calculateBandEnergy(
            CONFIG.frequencyBands.highMid.min, 
            CONFIG.frequencyBands.highMid.max
        );
        
        const rawTrebleEnergy = this.calculateBandEnergy(
            CONFIG.frequencyBands.treble.min, 
            CONFIG.frequencyBands.treble.max
        );
        
        // Application des facteurs d'échelle
        this.stats.bassEnergy = Math.min(1, rawBassEnergy * this.bassScale);
        this.stats.lowMidEnergy = rawLowMidEnergy;
        this.stats.midEnergy = Math.min(1, rawMidEnergy * this.midScale);
        this.stats.highMidEnergy = rawHighMidEnergy;
        this.stats.trebleEnergy = Math.min(1, rawTrebleEnergy * this.trebleScale);
        
        // Calcul de l'énergie totale (moyenne pondérée)
        this.stats.totalEnergy = (
            this.stats.bassEnergy * 0.3 + 
            this.stats.midEnergy * 0.4 + 
            this.stats.trebleEnergy * 0.3
        );
        
        // Calcul du flux spectral
        this.calculateSpectralFlux();
        
        // Calcul du centroïde spectral
        this.calculateSpectralCentroid();
        
        // Calcul du taux de passage par zéro (ZCR)
        this.calculateZeroCrossingRate();
        
        // Calcul de l'énergie RMS
        this.calculateRMSEnergy();
    }
    
    /**
     * Calcule l'énergie pour une bande de fréquence spécifique
     * @param {number} startPerc - Pourcentage de début de la bande
     * @param {number} endPerc - Pourcentage de fin de la bande
     * @returns {number} L'énergie normalisée entre 0 et 1
     */
    calculateBandEnergy(startPerc, endPerc) {
        const start = Math.floor(this.frequencyData.length * startPerc);
        const end = Math.floor(this.frequencyData.length * endPerc);
        let total = 0;
        
        for (let i = start; i < end; i++) {
            total += this.frequencyData[i] / 255; // Normalisation entre 0 et 1
        }
        
        // Moyenne normalisée
        return total / Math.max(1, (end - start));
    }
    
    /**
     * Calcule le flux spectral (changement dans le spectre au fil du temps)
     */
    calculateSpectralFlux() {
        if (this.spectralFluxData.length > 0) {
            const lastSpectrum = this.spectralFluxData[this.spectralFluxData.length - 1].spectrum;
            let flux = 0;
            
            for (let i = 0; i < this.frequencyData.length; i++) {
                const diff = (this.frequencyData[i] / 255) - (lastSpectrum[i] / 255);
                // On ne compte que les augmentations d'énergie (changements positifs)
                flux += diff > 0 ? diff : 0;
            }
            
            // Normalisation du flux
            flux = flux / this.frequencyData.length;
            this.stats.spectralFlux = flux;
            
            this.spectralFluxData.push({
                time: this.audioContext.currentTime,
                value: flux,
                spectrum: [...this.frequencyData]
            });
        } else {
            // Premier spectre
            this.stats.spectralFlux = 0;
            this.spectralFluxData.push({
                time: this.audioContext.currentTime,
                value: 0,
                spectrum: [...this.frequencyData]
            });
        }
        
        // Nettoyage des anciennes données
        const maxHistoryLength = 100;
        if (this.spectralFluxData.length > maxHistoryLength) {
            this.spectralFluxData.shift();
        }
    }
    
    /**
     * Calcule le centroïde spectral (centre de gravité du spectre)
     */
    calculateSpectralCentroid() {
        let sumAmplitude = 0;
        let sumFreqByAmp = 0;
        
        for (let i = 0; i < this.frequencyData.length; i++) {
            const amplitude = this.frequencyData[i] / 255;
            sumAmplitude += amplitude;
            
            // La fréquence est proportionnelle à l'indice de bin
            sumFreqByAmp += i * amplitude;
        }
        
        if (sumAmplitude > 0) {
            // Le centroïde est normalisé entre 0 et 1
            this.stats.spectralCentroid = sumFreqByAmp / (sumAmplitude * this.frequencyData.length);
        } else {
            this.stats.spectralCentroid = 0;
        }
    }
    
    /**
     * Calcule le taux de passage par zéro (ZCR)
     */
    calculateZeroCrossingRate() {
        let crossings = 0;
        
        // Le timeData est entre 0 et 255, avec 128 comme point médian (0)
        for (let i = 1; i < this.timeData.length; i++) {
            if ((this.timeData[i - 1] < 128 && this.timeData[i] >= 128) || 
                (this.timeData[i - 1] >= 128 && this.timeData[i] < 128)) {
                crossings++;
            }
        }
        
        // Normalisation entre 0 et 1
        const maxExpectedCrossings = this.timeData.length / 2;
        this.stats.zeroCrossingRate = Math.min(1, crossings / maxExpectedCrossings);
    }
    
    /**
     * Calcule l'énergie RMS du signal audio
     */
    calculateRMSEnergy() {
        let sum = 0;
        
        for (let i = 0; i < this.timeData.length; i++) {
            // Conversion de 0-255 à -1...1
            const sample = (this.timeData[i] / 128.0) - 1.0;
            sum += sample * sample;
        }
        
        const rms = Math.sqrt(sum / this.timeData.length);
        this.stats.rmsEnergy = Math.min(1, rms);
    }
    
    /**
     * Met à jour les facteurs d'échelle pour les différentes bandes
     * @param {number} bassScale - Facteur d'amplification des graves
     * @param {number} midScale - Facteur d'amplification des médiums
     * @param {number} trebleScale - Facteur d'amplification des aigus
     */
    setScaleFactors(bassScale, midScale, trebleScale) {
        if (bassScale !== undefined) this.bassScale = parseFloat(bassScale);
        if (midScale !== undefined) this.midScale = parseFloat(midScale);
        if (trebleScale !== undefined) this.trebleScale = parseFloat(trebleScale);
    }
    
    /**
     * Ajoute un callback à appeler après chaque traitement audio
     * @param {Function} callback - Fonction à appeler avec les statistiques audio
     */
    addAudioProcessCallback(callback) {
        if (typeof callback === 'function' && !this.onAudioProcessCallbacks.includes(callback)) {
            this.onAudioProcessCallbacks.push(callback);
        }
    }
    
    /**
     * Supprime un callback de la liste des observateurs
     * @param {Function} callback - Callback à supprimer
     */
    removeAudioProcessCallback(callback) {
        const index = this.onAudioProcessCallbacks.indexOf(callback);
        if (index !== -1) {
            this.onAudioProcessCallbacks.splice(index, 1);
        }
    }
    
    /**
     * Notifie tous les observateurs avec les nouvelles statistiques audio
     */
    notifyObservers() {
        const data = {
            frequencyData: this.frequencyData,
            timeData: this.timeData,
            stats: { ...this.stats },
            spectralFluxData: this.spectralFluxData,
            time: this.audioContext ? this.audioContext.currentTime : performance.now() / 1000
        };
        
        for (const callback of this.onAudioProcessCallbacks) {
            callback(data);
        }
    }
    
    /**
     * Nettoie les ressources audio
     */
    dispose() {
        if (this.sourceNode) {
            this.sourceNode.disconnect();
        }
        
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.src = '';
        }
        
        this.isInitialized = false;
    }
}

// Création d'une instance unique pour l'application
const audioProcessor = new AudioProcessor();

// Export
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = audioProcessor;
} else {
    window.audioProcessor = audioProcessor;
}