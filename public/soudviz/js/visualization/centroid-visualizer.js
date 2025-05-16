/**
 * centroid-visualizer.js - Spectral centroid visualization
 * Displays the distribution of frequencies in the audio signal
 */

class CentroidVisualizer extends Visualizer {
    constructor(canvas, analyzer, processor) {
        super(canvas, analyzer, processor);
        
        // Specific settings for centroid visualization
        this.settings = {
            ...this.settings,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            foregroundColor: 'rgb(56, 174, 204)',
            lineColor: 'rgba(56, 174, 204, 0.7)',
            historyLineColor: 'rgba(56, 174, 204, 0.3)',
            centroidMarkerColor: 'rgb(255, 120, 0)',
            peakMarkerColor: 'rgba(255, 60, 60, 0.8)',
            showHistory: true,
            historyLength: 120, // Number of frames to keep in history
            smoothingFactor: 0.85, // Higher values = smoother line
            showFrequencyLabels: true
        };
        
        // History of centroid values
        this.centroidHistory = [];
        
        // History of energy distribution
        this.energyHistory = [];
        
        // Smoothed centroid value
        this.smoothedCentroid = 0.5;
        
        // Frequency labels
        this.frequencyLabels = [50, 100, 250, 500, 1000, 2500, 5000, 10000, 20000];
    }
    
    /**
     * Draw the centroid visualization
     * @param {Object} features - Audio features from processor
     */
    draw(features) {
        this.clear();
        
        if (!features) return;
        
        const frequencyData = this.analyzer.getFrequencyData();
        if (!frequencyData) return;
        
        // Normalize the frequency data
        const normalizedData = Array.from(frequencyData).map(val => val / 255);
        
        // Get the centroid from features
        const centroid = features.spectralCentroid;
        
        // Apply smoothing to the centroid
        this.smoothedCentroid = this.smoothedCentroid * this.settings.smoothingFactor + 
                               centroid * (1 - this.settings.smoothingFactor);
        
        // Add to history (keep limited length)
        if (this.settings.showHistory) {
            this.centroidHistory.push(this.smoothedCentroid);
            this.energyHistory.push([...normalizedData]);
            
            // Limit history length
            if (this.centroidHistory.length > this.settings.historyLength) {
                this.centroidHistory.shift();
                this.energyHistory.shift();
            }
        }
        
        // Draw the frequency distribution and centroid
        this.drawFrequencyDistribution(normalizedData, this.smoothedCentroid);
        
        // Draw the centroid history
        if (this.settings.showHistory && this.centroidHistory.length > 1) {
            this.drawCentroidHistory();
        }
        
        // Draw frequency labels
        if (this.settings.showFrequencyLabels) {
            this.drawFrequencyLabels();
        }
        
        // Draw metrics at the top
        this.drawMetrics(features);
    }
    
    /**
     * Draw the current frequency distribution and centroid marker
     * @param {Array} normalizedData - Normalized frequency data
     * @param {number} centroid - Current centroid value (0-1)
     */
    drawFrequencyDistribution(normalizedData, centroid) {
        const width = this.width;
        const height = this.height;
        
        // Use logarithmic scale for x-axis to better represent frequency perception
        const logScale = (index, length) => {
            // Map index to frequency (0-1)
            return Math.log10(1 + index * 9) / Math.log10(10);
        };
        
        // Draw the frequency distribution as a filled area
        this.ctx.beginPath();
        this.ctx.moveTo(0, height);
        
        for (let i = 0; i < normalizedData.length / 4; i++) {
            // Use logarithmic scale for better representation of lower frequencies
            const x = logScale(i / (normalizedData.length / 4), 1) * width;
            const y = height - (normalizedData[i] * (height * 0.8));
            
            if (i === 0) {
                this.ctx.moveTo(x, height);
                this.ctx.lineTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        // Complete the path to form a closed shape
        this.ctx.lineTo(width, height);
        this.ctx.closePath();
        
        // Fill with gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(56, 174, 204, 0.6)');
        gradient.addColorStop(1, 'rgba(56, 174, 204, 0.1)');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Draw a line along the top of the distribution
        this.ctx.beginPath();
        
        for (let i = 0; i < normalizedData.length / 4; i++) {
            const x = logScale(i / (normalizedData.length / 4), 1) * width;
            const y = height - (normalizedData[i] * (height * 0.8));
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.strokeStyle = this.settings.lineColor;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw the centroid marker
        const centroidX = width * centroid;
        
        // Vertical line at centroid
        this.ctx.beginPath();
        this.ctx.moveTo(centroidX, 10);
        this.ctx.lineTo(centroidX, height - 10);
        this.ctx.strokeStyle = this.settings.centroidMarkerColor;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Circle at the top of the centroid line
        this.ctx.beginPath();
        this.ctx.arc(centroidX, 10, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = this.settings.centroidMarkerColor;
        this.ctx.fill();
        
        // Label for the centroid
        this.drawLabel(
            `Centroïde: ${this.frequencyFromCentroid(centroid).toFixed(0)} Hz`, 
            centroidX, 
            25, 
            {
                background: 'rgba(0, 0, 0, 0.5)',
                color: this.settings.centroidMarkerColor
            }
        );
    }
    
    /**
     * Draw the history of centroid values
     */
    drawCentroidHistory() {
        const width = this.width;
        const height = this.height;
        const historyLength = this.centroidHistory.length;
        
        // Draw vertical bars representing past centroids
        for (let i = 0; i < historyLength; i++) {
            const alpha = i / historyLength; // Older values are more transparent
            
            // Position and size
            const x = (i / historyLength) * width;
            const centroidHeight = height * (1 - this.centroidHistory[i]);
            
            // Draw thin vertical line
            this.ctx.beginPath();
            this.ctx.moveTo(x, height);
            this.ctx.lineTo(x, centroidHeight);
            this.ctx.strokeStyle = `rgba(56, 174, 204, ${alpha * 0.3})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
        
        // Draw a line connecting centroid values
        this.ctx.beginPath();
        
        for (let i = 0; i < historyLength; i++) {
            const x = (i / historyLength) * width;
            const y = height * (1 - this.centroidHistory[i]);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.strokeStyle = this.settings.historyLineColor;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    /**
     * Draw frequency labels on the x-axis
     */
    drawFrequencyLabels() {
        const width = this.width;
        const height = this.height;
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '10px Roboto Mono';
        this.ctx.textAlign = 'center';
        
        // Calculate Nyquist frequency
        const nyquist = this.analyzer.getSampleRate() / 2;
        
        // Draw frequency markers
        for (const freq of this.frequencyLabels) {
            if (freq <= nyquist) {
                // Position based on logarithmic scale
                const normPosition = Math.log10(freq / 20) / Math.log10(nyquist / 20);
                const x = normPosition * width;
                
                if (x >= 0 && x <= width) {
                    // Draw marker line
                    this.ctx.fillRect(x, height - 15, 1, 5);
                    
                    // Draw label text
                    let label = this.formatFrequency(freq);
                    this.ctx.fillText(label, x, height - 2);
                }
            }
        }
    }
    
    /**
     * Draw metrics at the top of the visualization
     * @param {Object} features - Audio features
     */
    drawMetrics(features) {
        // Display centroid value
        const centroidFreq = this.frequencyFromCentroid(this.smoothedCentroid);
        
        this.drawLabel(
            `Centroïde Spectral: ${centroidFreq.toFixed(0)} Hz`, 
            10, 
            20, 
            {
                align: 'left',
                color: 'rgba(255, 255, 255, 0.9)',
                background: 'rgba(0, 0, 0, 0.4)',
                font: '12px Roboto Mono'
            }
        );
        
        // Display frequency band energies
        this.drawLabel(
            `Graves: ${features.bassEnergy.toFixed(2)}`, 
            10, 
            45, 
            {
                align: 'left',
                color: features.bassEnergy > 0.5 ? 'rgb(255, 120, 0)' : 'rgba(255, 255, 255, 0.7)',
                font: '10px Roboto Mono'
            }
        );
        
        this.drawLabel(
            `Médiums: ${features.combinedMidEnergy.toFixed(2)}`, 
            130, 
            45, 
            {
                align: 'left',
                color: features.combinedMidEnergy > 0.5 ? 'rgb(255, 120, 0)' : 'rgba(255, 255, 255, 0.7)',
                font: '10px Roboto Mono'
            }
        );
        
        this.drawLabel(
            `Aigus: ${features.trebleEnergy.toFixed(2)}`, 
            250, 
            45, 
            {
                align: 'left',
                color: features.trebleEnergy > 0.5 ? 'rgb(255, 120, 0)' : 'rgba(255, 255, 255, 0.7)',
                font: '10px Roboto Mono'
            }
        );
    }
    
    /**
     * Convert a centroid value (0-1) to frequency (Hz)
     * @param {number} centroid - Normalized centroid value (0-1)
     * @returns {number} Frequency in Hz
     */
    frequencyFromCentroid(centroid) {
        // Logarithmic mapping from 0-1 to 20Hz-20kHz
        const minFreq = 20;
        const maxFreq = 20000;
        
        return Math.pow(10, centroid * (Math.log10(maxFreq) - Math.log10(minFreq)) + Math.log10(minFreq));
    }
}

// Register this visualizer type
if (!window.visualizers) {
    window.visualizers = {};
}

window.visualizers.centroidVisualizer = (canvas) => 
    new CentroidVisualizer(canvas, audioAnalyzer, audioProcessor);