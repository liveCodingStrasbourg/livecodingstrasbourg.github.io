/**
 * main.js - Entry point for the audio visualization application
 * Coordinates the initialization and communication between modules
 */

class AudioVisualizer {
    constructor() {
        // Vérifier que toutes les dépendances sont bien chargées
        if (typeof audioAnalyzer === 'undefined' || 
            typeof audioProcessor === 'undefined' || 
            typeof bpmDetector === 'undefined') {
            console.error("Les dépendances requises ne sont pas chargées correctement.");
            return;
        }
        
        // Core modules
        this.analyzer = audioAnalyzer;
        this.processor = audioProcessor;
        this.bpmDetector = bpmDetector;
        
        // UI modules
        this.controls = null;
        this.infoPanels = null;
        this.mappingUI = null;
        this.manualBPM = null;
        
        // Animation frame ID
        this.animationFrameId = null;
        
        // Initialize the application
        this.init();
    }
    
    /**
     * Initialize the application
     */
    init() {
        // Ensure DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
        } else {
            this.onDOMReady();
        }
    }
    
    /**
     * Called when DOM is ready
     */
    onDOMReady() {
        // Get references to UI modules
        this.controls = window.uiControls || null;
        this.infoPanels = window.infoPanels || null;
        this.mappingUI = window.mappingUI || null;
        this.manualBPM = window.manualBPM || null;
        
        // Vérifier que les dépendances UI sont disponibles
        if (!this.controls) {
            console.warn("Le module UI Controls n'est pas chargé correctement.");
        }
        
        // Setup canvas dimensions
        this.setupCanvas();
        
        // Start the main loop
        this.startMainLoop();
        
        console.log('Audio Visualizer initialized');
    }
    
    /**
     * Setup canvas dimensions
     */
    setupCanvas() {
        const setupCanvas = (canvas) => {
            if (!canvas) return;
            
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            
            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);
            
            // Initial clear
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, 0, rect.width, rect.height);
            
            // Draw message if not initialized
            if (!this.analyzer.isInitialized()) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.font = '16px Roboto Mono';
                ctx.textAlign = 'center';
                ctx.fillText('Cliquez sur "Activer le Microphone" pour commencer', rect.width / 2, rect.height / 2);
            }
        };
        
        // Setup both canvas elements
        setupCanvas(document.getElementById('visualization1'));
        setupCanvas(document.getElementById('visualization2'));
        
        // Handle window resize
        window.addEventListener('resize', () => {
            setupCanvas(document.getElementById('visualization1'));
            setupCanvas(document.getElementById('visualization2'));
        });
    }
    
    /**
     * Start the main application loop
     */
    startMainLoop() {
        const loop = () => {
            // Update audio analysis if initialized
            if (this.analyzer.isInitialized()) {
                // Get audio features
                const features = this.processor.update();
                
                // Update beat detection
                if (features) {
                    this.bpmDetector.update(features);
                
                    // Update metrics display
                    if (this.controls) {
                        this.controls.updateMetrics(features);
                    }
                }
            }
            
            // Continue loop
            this.animationFrameId = requestAnimationFrame(loop);
        };
        
        // Start loop
        loop();
    }
    
    /**
     * Stop the main application loop
     */
    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
}

// Fonction utilitaire pour vérifier si toutes les dépendances sont chargées
function checkDependencies() {
    const dependencies = [
        'audioAnalyzer',
        'audioProcessor',
        'bpmDetector',
        'window.visualizers'
    ];
    
    let allLoaded = true;
    const missing = [];
    
    dependencies.forEach(dep => {
        // Evaluer la dépendance dans le scope global
        let loaded = false;
        try {
            loaded = eval(`typeof ${dep} !== 'undefined'`);
        } catch (e) {
            loaded = false;
        }
        
        if (!loaded) {
            allLoaded = false;
            missing.push(dep);
        }
    });
    
    if (!allLoaded) {
        console.error(`Dépendances manquantes: ${missing.join(', ')}`);
        return false;
    }
    
    return true;
}

// Create the main application instance
document.addEventListener('DOMContentLoaded', () => {
    if (checkDependencies()) {
        window.audioVisualizer = new AudioVisualizer();
    } else {
        console.error("Certaines dépendances ne sont pas chargées. Vérifiez l'ordre des scripts.");
        
        // Afficher un message d'erreur dans le DOM
        const container = document.querySelector('.container');
        if (container) {
            const errorMsg = document.createElement('div');
            errorMsg.style.color = 'red';
            errorMsg.style.padding = '20px';
            errorMsg.style.background = 'rgba(0,0,0,0.7)';
            errorMsg.style.borderRadius = '8px';
            errorMsg.style.margin = '20px';
            errorMsg.innerHTML = `
                <h3>Erreur de chargement</h3>
                <p>Certaines dépendances JavaScript ne sont pas chargées correctement.</p>
                <p>Vérifiez la console du navigateur pour plus de détails.</p>
            `;
            container.prepend(errorMsg);
        }
    }
});