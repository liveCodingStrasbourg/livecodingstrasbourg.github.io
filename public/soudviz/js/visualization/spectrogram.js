/**
 * spectrogram.js - Spectrogram visualization
 * Displays the frequency spectrum over time as a color map
 */

class SpectrogramVisualizer extends Visualizer {
    constructor(canvas, analyzer, processor) {
        super(canvas, analyzer, processor);
        
        // Specific settings for spectrogram visualization
        this.settings = {
            ...this.settings,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            useLogFrequencyScale: true,
            colorMap: 'rainbow', // 'rainbow', 'heatmap', 'grayscale'
            showFrequencyLabels: true,
            frequencyLabels: [20, 100, 1000, 10000, 20000]
        };
        
        // To be extra safe, create the offscreen canvas here
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        
        // Initialize the offscreen canvas
        this.resetOffscreenCanvas();
    }
    
    /**
     * Set up canvas dimensions and scaling for pixel density
     * Override to also reset offscreen canvas
     */
    setupCanvas() {
        super.setupCanvas();
        this.resetOffscreenCanvas();
    }
    
    /**
     * Reset and resize the offscreen canvas
     */
    resetOffscreenCanvas() {
        if (!this.offscreenCanvas) {
            this.offscreenCanvas = document.createElement('canvas');
            this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        }
        
        this.offscreenCanvas.width = this.width;
        this.offscreenCanvas.height = this.height;
        this.offscreenCtx.fillStyle = 'black';
        this.offscreenCtx.fillRect(0, 0, this.width, this.height);
    }
    
    /**
     * Map a value to a color based on the selected color map
     * @param {number} value - Normalized value (0-1)
     * @returns {string} - CSS color string
     */
    getColor(value) {
        // Ensure value is in 0-1 range
        value = Math.max(0, Math.min(1, value));
        
        switch (this.settings.colorMap) {
            case 'rainbow':
                // Hue from blue (240) to red (0)
                const hue = 240 - (value * 240);
                const saturation = 50 + (value * 50);
                const lightness = 20 + (value * 40);
                return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                
            case 'heatmap':
                // Black to red to yellow to white
                if (value < 0.33) {
                    // Black to red
                    const r = Math.round(value * 3 * 255);
                    return `rgb(${r}, 0, 0)`;
                } else if (value < 0.66) {
                    // Red to yellow
                    const g = Math.round((value - 0.33) * 3 * 255);
                    return `rgb(255, ${g}, 0)`;
                } else {
                    // Yellow to white
                    const b = Math.round((value - 0.66) * 3 * 255);
                    return `rgb(255, 255, ${b})`;
                }
            
            case 'grayscale':
                // Black to white
                const intensity = Math.round(value * 255);
                return `rgb(${intensity}, ${intensity}, ${intensity})`;
                
            default:
                return `rgb(0, ${Math.round(value * 255)}, 0)`;
        }
    }
    
    /**
     * Draw the spectrogram visualization
     * @param {Object} features - Audio features from processor
     */
    draw(features) {
        // Don't clear the canvas - we're scrolling the image
        
        if (!features) return;
        
        const frequencyData = this.analyzer.getFrequencyData();
        if (!frequencyData) return;
        
        // Limit to 1/4 of the bins for better visibility of audible range
        const binCount = Math.min(frequencyData.length, frequencyData.length / 4);
        
        // Step 1: Scroll the existing image to the left
        this.offscreenCtx.drawImage(
            this.offscreenCanvas,
            1, 0, this.width - 1, this.height,
            0, 0, this.width - 1, this.height
        );
        
        // Step 2: Clear the rightmost column
        this.offscreenCtx.clearRect(this.width - 1, 0, 1, this.height);
        
        // Step 3: Draw the new spectrum data in the rightmost column
        for (let i = 0; i < binCount; i++) {
            // Calculate y position with logarithmic scaling for frequencies
            let y;
            
            if (this.settings.useLogFrequencyScale) {
                // Logarithmic mapping to emphasize lower frequencies
                const logPos = Math.log10((i + 1) / binCount) / Math.log10(1 / binCount);
                y = this.height - (logPos * this.height);
            } else {
                // Linear mapping
                y = this.height - ((i / binCount) * this.height);
            }
            
            // Get normalized value (0-1)
            const value = frequencyData[i] / 255;
            
            // Set color based on value
            this.offscreenCtx.fillStyle = this.getColor(value);
            
            // Draw a pixel (or small rectangle for better visibility)
            this.offscreenCtx.fillRect(this.width - 1, y, 1, 2);
        }
        
        // Step 4: Copy the offscreen canvas to the visible canvas
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
        
        // Step 5: Draw frequency labels if enabled
        if (this.settings.showFrequencyLabels) {
            this.drawFrequencyLabels();
        }
    }
    
    /**
     * Draw frequency labels on the y-axis
     */
    drawFrequencyLabels() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '10px Roboto Mono';
        this.ctx.textAlign = 'right';
        
        // Calculate Nyquist frequency
        const nyquist = this.analyzer.getSampleRate() / 2;
        
        for (const freq of this.settings.frequencyLabels) {
            if (freq <= nyquist) {
                // Position with logarithmic scaling
                const logPos = Math.log10(freq / 20) / Math.log10(nyquist / 20);
                const y = this.height - (logPos * this.height);
                
                if (y >= 0 && y <= this.height) {
                    // Format frequency label
                    let label = this.formatFrequency(freq) + ' Hz';
                    
                    // Draw with semi-transparent background for readability
                    this.drawLabel(label, this.width - 5, y, {
                        align: 'right',
                        baseline: 'middle',
                        background: 'rgba(0, 0, 0, 0.5)',
                        padding: 3
                    });
                }
            }
        }
        
        // Add a time axis label at the bottom
        this.drawLabel('Temps →', this.width / 2, this.height - 5, {
            baseline: 'bottom',
            font: '10px Roboto Mono'
        });
    }
    
    /**
     * Update visualizer settings
     * @param {Object} settings - New settings
     */
    updateSettings(settings) {
        const oldColorMap = this.settings.colorMap;
        const oldFrequencyScale = this.settings.useLogFrequencyScale;
        
        super.updateSettings(settings);
        
        // If color map or frequency scale changed, reset the canvas
        if ((settings.colorMap && settings.colorMap !== oldColorMap) ||
            (settings.useLogFrequencyScale !== undefined && 
             settings.useLogFrequencyScale !== oldFrequencyScale)) {
            this.resetOffscreenCanvas();
        }
    }
}

// Register this visualizer type
if (!window.visualizers) {
    window.visualizers = {};
}

window.visualizers.spectrogram = (canvas) => 
    new SpectrogramVisualizer(canvas, audioAnalyzer, audioProcessor);