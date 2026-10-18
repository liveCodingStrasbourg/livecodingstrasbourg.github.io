/**
 * beat-detector.js - Détection de battements et calcul du BPM
 * Ce module gère la détection de battements dans le signal audio et le calcul du BPM,
 * ainsi que le tap tempo manuel pour comparaison.
 */

class BeatDetector {
    constructor() {
        // Configuration
        this.threshold = CONFIG.beatDetection.defaultThreshold;
        this.sensitivity = CONFIG.beatDetection.defaultSensitivity;
        this.decay = CONFIG.beatDetection.defaultDecay;
        this.minBeatInterval = CONFIG.beatDetection.minBeatInterval;
        this.energyHistorySize = CONFIG.beatDetection.energyHistorySize;
        this.maxBeatHistory = CONFIG.beatDetection.maxBeatHistory;
        
        // État interne
        this.energyHistory = [];
        this.beatTimes = [];
        this.lastBeatTime = 0;
        this.bpm = 0;
        this.bpmConfidence = 0;
        this.beatDetected = false;
        
        // Tap tempo
        this.tapTimes = [];
        this.manualBpm = 0;
        this.lastTapTime = 0;
        this.maxTapInterval = CONFIG.tapTempo.maxTapInterval;
        this.minTapsRequired = CONFIG.tapTempo.minTapsRequired;
        
        // Callbacks
        this.onBeatCallbacks = [];
    }
    
    /**
     * Détecte un battement dans le signal audio
     * @param {number} energy - L'énergie actuelle (entre 0 et 1)
     * @param {number} time - Le temps actuel en millisecondes
     * @returns {boolean} true si un battement est détecté, false sinon
     */
    detectBeat(energy, time) {
        // Ajout de l'énergie actuelle à l'historique
        this.energyHistory.push(energy);
        
        // Limitation de la taille de l'historique
        if (this.energyHistory.length > this.energyHistorySize) {
            this.energyHistory.shift();
        }
        
        // Calcul de la moyenne locale et de la variance
        const localAvg = this.energyHistory.reduce((a, b) => a + b, 0) / this.energyHistory.length;
        const variance = this.energyHistory.reduce((a, b) => a + Math.pow(b - localAvg, 2), 0) / this.energyHistory.length;
        
        // Seuil dynamique basé sur la moyenne, la variance et la sensibilité
        const dynamicThreshold = localAvg + (Math.sqrt(variance) * this.sensitivity);
        
        // Intervalle depuis le dernier battement
        const timeSinceLastBeat = time - this.lastBeatTime;
        
        // Conditions pour la détection de battement
        const energyOverThreshold = energy > Math.max(this.threshold, dynamicThreshold);
        const timingOK = timeSinceLastBeat > this.minBeatInterval;
        
        // Vérification que c'est un pic local
        let isPeak = false;
        if (this.energyHistory.length >= 3) {
            const current = energy;
            const prev1 = this.energyHistory[this.energyHistory.length - 2];
            const prev2 = this.energyHistory[this.energyHistory.length - 3];
            
            isPeak = current > prev1 && current > prev2;
        }
        
        // Calcul de la confiance du battement
        const beatConfidence = (energyOverThreshold ? 0.6 : 0) + 
                               (isPeak ? 0.3 : 0) + 
                               (timingOK ? 0.1 : 0);
        
        // Si toutes les conditions sont remplies, on a un battement
        if (energyOverThreshold && timingOK && isPeak) {
            this.beatTimes.push(time);
            this.lastBeatTime = time;
            this.beatDetected = true;
            
            // Limitation de la taille de l'historique des battements
            if (this.beatTimes.length > this.maxBeatHistory) {
                this.beatTimes.shift();
            }
            
            // Calcul du BPM
            this.calculateBPM();
            
            // Notification des observateurs
            this.notifyBeatObservers(time);
            
            return true;
        }
        
        this.beatDetected = false;
        return false;
    }
    
    /**
     * Calcule le BPM à partir de l'historique des battements
     */
    calculateBPM() {
        if (this.beatTimes.length < 4) {
            this.bpmConfidence = Math.min(25, this.beatTimes.length * 5);
            return;
        }
        
        // Calcul des intervalles entre battements
        const intervals = [];
        for (let i = 1; i < this.beatTimes.length; i++) {
            const interval = this.beatTimes[i] - this.beatTimes[i-1];
            
            // Conversion en BPM instantané
            const instantBPM = 60000 / interval;
            
            // Filtrage des BPM dans une plage raisonnable
            if (instantBPM >= 60 && instantBPM <= 200) {
                intervals.push(interval);
            }
        }
        
        if (intervals.length > 0) {
            // Tri des intervalles pour calcul de la médiane
            intervals.sort((a, b) => a - b);
            const medianInterval = intervals[Math.floor(intervals.length / 2)];
            
            // Conversion de l'intervalle médian en BPM
            const medianBPM = Math.round(60000 / medianInterval);
            
            // Si le nouveau BPM est très différent, on le lisse pour éviter les sauts brusques
            if (this.bpm === 0) {
                this.bpm = medianBPM;
            } else if (Math.abs(this.bpm - medianBPM) < 10) {
                // Lissage du BPM - moyenne pondérée
                this.bpm = Math.round(this.bpm * 0.7 + medianBPM * 0.3);
            } else if (Math.abs(this.bpm - medianBPM) < 20) {
                // Changement plus important mais toujours filtré
                this.bpm = Math.round(this.bpm * 0.5 + medianBPM * 0.5);
            } else {
                // Changement radical, on accepte la nouvelle valeur
                this.bpm = medianBPM;
            }
            
            // Confiance BPM basée sur la cohérence des intervalles
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            let variance = 0;
            for (let i = 0; i < intervals.length; i++) {
                variance += Math.pow(intervals[i] - avgInterval, 2);
            }
            variance /= intervals.length;
            const stdDev = Math.sqrt(variance);
            
            // Coefficient de variation (plus il est bas, plus les battements sont réguliers)
            const cv = stdDev / avgInterval;
            
            // Conversion en pourcentage de confiance (inversement proportionnel au coefficient de variation)
            this.bpmConfidence = Math.min(100, Math.round((1 - Math.min(cv, 0.5) * 2) * 100));
        }
    }
    
    /**
     * Enregistre un tap manuel pour le calcul du BPM
     * @param {number} time - Le temps actuel en millisecondes
     */
    tap(time = Date.now()) {
        // Si le dernier tap est trop ancien, on réinitialise l'historique
        if (time - this.lastTapTime > this.maxTapInterval && this.lastTapTime > 0) {
            this.tapTimes = [];
        }
        
        // Enregistrement du tap
        this.tapTimes.push(time);
        this.lastTapTime = time;
        
        // Limitation de la taille de l'historique
        if (this.tapTimes.length > CONFIG.tapTempo.maxHistory) {
            this.tapTimes.shift();
        }
        
        // Calcul du BPM manuel
        this.calculateManualBPM();
        
        return {
            bpm: this.manualBpm,
            taps: this.tapTimes.length
        };
    }
    
    /**
     * Calcule le BPM manuel à partir des taps
     */
    calculateManualBPM() {
        if (this.tapTimes.length < this.minTapsRequired) {
            return;
        }
        
        // Calcul des intervalles entre les taps
        const intervals = [];
        for (let i = 1; i < this.tapTimes.length; i++) {
            const interval = this.tapTimes[i] - this.tapTimes[i-1];
            intervals.push(interval);
        }
        
        // Calcul de la moyenne des intervalles
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        
        // Conversion en BPM
        this.manualBpm = Math.round(60000 / avgInterval);
    }
    
    /**
     * Réinitialise l'historique des taps
     */
    resetTapTempo() {
        this.tapTimes = [];
        this.lastTapTime = 0;
        this.manualBpm = 0;
    }
    
    /**
     * Met à jour les paramètres de détection de battements
     * @param {Object} options - Paramètres à mettre à jour
     */
    updateSettings(options = {}) {
        if (options.threshold !== undefined) {
            this.threshold = parseFloat(options.threshold);
        }
        
        if (options.sensitivity !== undefined) {
            this.sensitivity = parseFloat(options.sensitivity);
        }
        
        if (options.decay !== undefined) {
            this.decay = parseFloat(options.decay);
        }
        
        console.log('Beat detection settings updated:', {
            threshold: this.threshold,
            sensitivity: this.sensitivity,
            decay: this.decay
        });
    }
    
    /**
     * Ajoute un callback à appeler lors de la détection d'un battement
     * @param {Function} callback - Fonction à appeler avec le temps du battement
     */
    addBeatCallback(callback) {
        if (typeof callback === 'function' && !this.onBeatCallbacks.includes(callback)) {
            this.onBeatCallbacks.push(callback);
        }
    }
    
    /**
     * Supprime un callback de la liste des observateurs
     * @param {Function} callback - Callback à supprimer
     */
    removeBeatCallback(callback) {
        const index = this.onBeatCallbacks.indexOf(callback);
        if (index !== -1) {
            this.onBeatCallbacks.splice(index, 1);
        }
    }
    
    /**
     * Notifie tous les observateurs d'un battement
     * @param {number} time - Le temps du battement en millisecondes
     */
    notifyBeatObservers(time) {
        for (const callback of this.onBeatCallbacks) {
            callback({
                time,
                bpm: this.bpm,
                confidence: this.bpmConfidence
            });
        }
    }
    
    /**
     * Obtient les données actuelles de battement
     * @returns {Object} Données de battement et BPM
     */
    getBeatData() {
        return {
            bpm: this.bpm,
            manualBpm: this.manualBpm,
            confidence: this.bpmConfidence,
            beatDetected: this.beatDetected,
            lastBeatTime: this.lastBeatTime,
            beatTimes: [...this.beatTimes],
            tapCount: this.tapTimes.length
        };
    }
}

// Création d'une instance unique pour l'application
const beatDetector = new BeatDetector();

// Export
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = beatDetector;
} else {
    window.beatDetector = beatDetector;
}