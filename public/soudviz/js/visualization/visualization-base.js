/**
 * visualization-base.js - Classe de base pour toutes les visualisations
 * Définit l'interface commune et les fonctionnalités partagées par toutes les visualisations.
 */

class Visualization {
    /**
     * Crée une nouvelle instance de visualisation
     * @param {HTMLCanvasElement} canvas - Élément canvas pour le rendu
     * @param {Object} options - Options de configuration
     */
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = Object.assign({}, this.getDefaultOptions(), options);
        
        // Dimensions réelles du canvas (prend en compte le devicePixelRatio)
        this.width = canvas.width / window.devicePixelRatio;
        this.height = canvas.height / window.devicePixelRatio;
        
        // Données audio
        this.audioData = null;
        
        // Identifiant de l'animation
        this.animationId = null;
        
        // État de l'animation
        this.isActive = false;
        
        // Mappings des signaux aux paramètres visuels
        this.signalMappings = {};
        
        // Initialisation
        this.init();
    }
    
    /**
     * Retourne les options par défaut pour la visualisation
     * @returns {Object} Options par défaut
     */
    getDefaultOptions() {
        return {
            // Options de base
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            foregroundColor: CONFIG.colors.secondary,
            
            // Options spécifiques à la visualisation
            // (à surcharger dans les classes dérivées)
        };
    }
    
    /**
     * Initialise la visualisation
     * À surcharger dans les classes dérivées si nécessaire
     */
    init() {
        // Dimensionnement initial du canvas
        this.resize();
        
        // Événement de redimensionnement
        window.addEventListener('resize', this.resize.bind(this));
    }
    
    /**
     * Ajuste les dimensions du canvas et de la visualisation
     */
    resize() {
        // Récupération des dimensions actuelles de l'élément
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;
        
        // Taille du canvas avec prise en compte de la densité de pixels
        this.canvas.width = displayWidth * window.devicePixelRatio;
        this.canvas.height = displayHeight * window.devicePixelRatio;
        
        // Ajustement du contexte pour la densité de pixels
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        // Mise à jour des dimensions utilisées pour le rendu
        this.width = displayWidth;
        this.height = displayHeight;
        
        // Demande de rendu
        this.render();
    }
    
    /**
     * Démarre la visualisation
     */
    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.animate();
    }
    
    /**
     * Arrête la visualisation
     */
    stop() {
        this.isActive = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * Boucle d'animation principale
     */
    animate() {
        if (!this.isActive) return;
        
        this.render();
        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
    
    /**
     * Rendu de la visualisation
     * À surcharger dans les classes dérivées
     */
    render() {
        // Effacement du canvas
        this.ctx.fillStyle = this.options.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // À surcharger dans les classes dérivées pour le rendu spécifique
    }
    
    /**
     * Met à jour les données audio pour la visualisation
     * @param {Object} audioData - Données audio à visualiser
     */
    updateAudioData(audioData) {
        this.audioData = audioData;
    }
    
    /**
     * Met à jour les options de la visualisation
     * @param {Object} options - Nouvelles options
     */
    updateOptions(options) {
        this.options = Object.assign({}, this.options, options);
    }
    
    /**
     * Définit le mapping des signaux audio aux paramètres visuels
     * @param {Object} mappings - Mappings à appliquer
     */
    setSignalMappings(mappings) {
        this.signalMappings = Object.assign({}, this.signalMappings, mappings);
        console.log(`Signal mappings updated for ${this.constructor.name}:`, this.signalMappings);
    }
    
    /**
     * Obtient la valeur d'un signal audio mappé
     * @param {string} paramName - Nom du paramètre visuel
     * @param {number} defaultValue - Valeur par défaut si le mapping n'existe pas
     * @returns {number} Valeur du signal mappé (0-1)
     */
    getMappedSignalValue(paramName, defaultValue = 0.5) {
        if (!this.audioData || !this.signalMappings) return defaultValue;
        
        const signalId = this.signalMappings[paramName];
        if (!signalId || signalId === 'none') return defaultValue;
        
        // Récupération de la valeur du signal
        switch (signalId) {
            case 'bass':
                return this.audioData.stats.bassEnergy;
            case 'mid':
                return this.audioData.stats.midEnergy;
            case 'treble':
                return this.audioData.stats.trebleEnergy;
            case 'energy':
                return this.audioData.stats.totalEnergy;
            case 'centroid':
                return this.audioData.stats.spectralCentroid;
            case 'zcr':
                return this.audioData.stats.zeroCrossingRate;
            case 'beat':
                return beatDetector.beatDetected ? 1 : 0;
            case 'bpm':
                // Normalisation du BPM entre 0 et 1 (plage 60-180 BPM)
                const bpm = beatDetector.bpm || 120;
                return Math.min(1, Math.max(0, (bpm - 60) / 120));
            default:
                return defaultValue;
        }
    }
    
    /**
     * Nettoie les ressources utilisées par la visualisation
     */
    dispose() {
        this.stop();
        window.removeEventListener('resize', this.resize);
    }
}

// Export global
window.Visualization = Visualization;