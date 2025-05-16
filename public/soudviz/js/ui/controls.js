/**
 * controls.js - UI controls handling
 * Manages interaction with control elements
 */

class UIControls {
    constructor(analyzer, processor, bpmDetector) {
        this.analyzer = analyzer;
        this.processor = processor;
        this.bpmDetector = bpmDetector;
        
        // Store references to visualizations
        this.visualizations = {
            viz1: null,
            viz2: null
        };
        
        // Initialize
        this.setupEventHandlers();
    }
    
    /**
     * Set up event handlers for UI controls
     */
    setupEventHandlers() {
        // Audio initialization
        document.getElementById('startAudio').addEventListener('click', async () => {
            if (!this.analyzer.isInitialized()) {
                const success = await this.analyzer.initAudio();
                
                if (success) {
                    // Update UI to show connected state
                    document.getElementById('micStatus').classList.add('connected');
                    document.getElementById('startAudio').textContent = 'Microphone Actif';
                    
                    // Start visualizations
                    this.startVisualizations();
                } else {
                    alert('Erreur lors de l\'accès au microphone. Veuillez autoriser l\'accès au microphone et réessayer.');
                }
            }
        });
        
        // FFT Size control
        document.getElementById('fftSize').addEventListener('input', (e) => {
            const fftSizeExp = parseInt(e.target.value);
            const fftSize = Math.pow(2, fftSizeExp);
            document.getElementById('fftSizeValue').textContent = fftSize;
            
            this.analyzer.updateSettings({ fftSize });
        });
        
        // Smoothing control
        document.getElementById('smoothingTimeConstant').addEventListener('input', (e) => {
            const smoothing = parseFloat(e.target.value);
            document.getElementById('smoothingValue').textContent = smoothing.toFixed(2);
            
            this.analyzer.updateSettings({ smoothingTimeConstant: smoothing });
        });
        
        // Bass scale control
        document.getElementById('bassScale').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            document.getElementById('bassScaleValue').textContent = value.toFixed(1);
            
            this.processor.updateSettings({ bassScale: value });
        });
        
        // Treble scale control
        document.getElementById('trebleScale').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            document.getElementById('trebleScaleValue').textContent = value.toFixed(1);
            
            this.processor.updateSettings({ trebleScale: value });
        });
        
        // Beat detection sensitivity
        document.getElementById('beatSensitivity').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            document.getElementById('beatSensitivityValue').textContent = value.toFixed(1);
            
            this.bpmDetector.updateSettings({ sensitivity: value });
        });
        
        // Beat detection decay
        document.getElementById('beatDecay').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            document.getElementById('beatDecayValue').textContent = value.toFixed(3);
            
            this.bpmDetector.updateSettings({ decay: value });
        });
        
        // Beat detection threshold
        document.getElementById('beatThreshold').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            document.getElementById('beatThresholdValue').textContent = value.toFixed(2);
            
            this.bpmDetector.updateSettings({ threshold: value });
        });
        
        // Visualization type selectors
        document.getElementById('visualizationType1').addEventListener('change', (e) => {
            const type = e.target.value;
            document.getElementById('viz1Title').textContent = this.getVisualizationTitle(type);
            
            // Update visualization
            this.changeVisualization(1, type);
            
            // Show/hide abstract mapping controls if needed
            this.updateMappingControlsVisibility();
        });
        
        document.getElementById('visualizationType2').addEventListener('change', (e) => {
            const type = e.target.value;
            document.getElementById('viz2Title').textContent = this.getVisualizationTitle(type);
            
            // Update visualization
            this.changeVisualization(2, type);
            
            // Show/hide abstract mapping controls if needed
            this.updateMappingControlsVisibility();
        });
        
        // Handle beat events for visual feedback
        document.addEventListener('beat-detected', () => {
            // Add pulse effect to visualizations
            document.getElementById('metrics1').classList.add('beat-active');
            document.getElementById('metrics2').classList.add('beat-active');
            
            // Remove after a short delay
            setTimeout(() => {
                document.getElementById('metrics1').classList.remove('beat-active');
                document.getElementById('metrics2').classList.remove('beat-active');
            }, 100);
        });
        
        // Window resize event
        window.addEventListener('resize', () => {
            // Update visualizations on resize
            if (this.visualizations.viz1) {
                this.visualizations.viz1.setupCanvas();
            }
            if (this.visualizations.viz2) {
                this.visualizations.viz2.setupCanvas();
            }
        });
        
        // Listen for audio-initialized event
        document.addEventListener('audio-initialized', () => {
            this.startVisualizations();
        });
    }
    
    /**
     * Start visualizations after audio is initialized
     */
    startVisualizations() {
        // Get selected visualization types
        const type1 = document.getElementById('visualizationType1').value;
        const type2 = document.getElementById('visualizationType2').value;
        
        // Initialize visualizations
        this.changeVisualization(1, type1);
        this.changeVisualization(2, type2);
        
        // Update titles
        document.getElementById('viz1Title').textContent = this.getVisualizationTitle(type1);
        document.getElementById('viz2Title').textContent = this.getVisualizationTitle(type2);
        
        // Show/hide abstract mapping controls
        this.updateMappingControlsVisibility();
    }
    
    /**
     * Change visualization type
     * @param {number} index - Visualization index (1 or 2)
     * @param {string} type - Visualization type
     */
    changeVisualization(index, type) {
        // Stop current visualization if exists
        if (this.visualizations[`viz${index}`]) {
            this.visualizations[`viz${index}`].stop();
        }
        
        // Get canvas element
        const canvas = document.getElementById(`visualization${index}`);
        
        // Create new visualization
        if (window.visualizers && window.visualizers[type]) {
            this.visualizations[`viz${index}`] = window.visualizers[type](canvas);
            
            // Start visualization if audio is initialized
            if (this.analyzer.isInitialized()) {
                this.visualizations[`viz${index}`].start();
            }
        }
    }
    
    /**
     * Show/hide abstract mapping controls based on visualizations
     */
    updateMappingControlsVisibility() {
        const type1 = document.getElementById('visualizationType1').value;
        const type2 = document.getElementById('visualizationType2').value;
        
        const abstractMappingControls = document.getElementById('abstractMappingControls');
        
        // Show controls if either visualization is abstract art
        if (type1 === 'abstractArt' || type2 === 'abstractArt') {
            abstractMappingControls.style.display = 'block';
        } else {
            abstractMappingControls.style.display = 'none';
        }
    }
    
    /**
     * Get display title for a visualization type
     * @param {string} type - Visualization type key
     * @returns {string} Display title
     */
    getVisualizationTitle(type) {
        const titles = {
            frequencyBars: 'Spectre de Fréquences',
            waveform: 'Forme d\'Onde',
            spectralFlux: 'Flux Spectral',
            spectrogram: 'Spectrogramme',
            bpmTracker: 'Analyseur de BPM',
            energyCircle: 'Énergie Audio',
            abstractArt: 'Art Abstrait',
            centroidVisualizer: 'Centroïde Spectral'
        };
        
        return titles[type] || 'Visualisation Audio';
    }
    
    /**
     * Update the metrics displays
     * @param {Object} features - Audio features
     */
    updateMetrics(features) {
        if (!features) return;
        
        // Update frequency band energies
        document.getElementById('bassEnergy').textContent = features.bassEnergy.toFixed(2);
        document.getElementById('midEnergy').textContent = features.combinedMidEnergy.toFixed(2);
        document.getElementById('trebleEnergy').textContent = features.trebleEnergy.toFixed(2);
        
        // Update BPM and energy data
        const beatData = this.bpmDetector.getData();
        document.getElementById('bpmValue').textContent = beatData.bpm || '-';
        document.getElementById('bpmConfidence').textContent = `${beatData.bpmConfidence}%`;
        document.getElementById('energyLevel').textContent = features.totalEnergy.toFixed(2);
        
        // Add color highlights based on energy levels
        const bassElement = document.getElementById('bassEnergy');
        const midElement = document.getElementById('midEnergy');
        const trebleElement = document.getElementById('trebleEnergy');
        
        // Reset classes
        bassElement.className = 'metric-value';
        midElement.className = 'metric-value';
        trebleElement.className = 'metric-value';
        
        // Add highlight class for highest energy band
        if (features.bassEnergy > features.combinedMidEnergy && features.bassEnergy > features.trebleEnergy) {
            bassElement.classList.add('bass-highlight');
        } else if (features.combinedMidEnergy > features.bassEnergy && features.combinedMidEnergy > features.trebleEnergy) {
            midElement.classList.add('mid-highlight');
        } else if (features.trebleEnergy > features.bassEnergy && features.trebleEnergy > features.combinedMidEnergy) {
            trebleElement.classList.add('treble-highlight');
        }
    }
}

// Create global instance when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (typeof audioAnalyzer !== 'undefined' && typeof audioProcessor !== 'undefined' && typeof bpmDetector !== 'undefined') {
        window.uiControls = new UIControls(audioAnalyzer, audioProcessor, bpmDetector);
    } else {
        console.error("Les dépendances requises (audioAnalyzer, audioProcessor, bpmDetector) ne sont pas chargées.");
    }
});