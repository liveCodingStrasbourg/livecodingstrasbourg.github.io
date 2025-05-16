/**
 * frequency-bars.js - Frequency spectrum visualization
 * Displays the frequency domain data as a bar graph
 */

class FrequencyBarsVisualizer extends Visualizer {
    constructor(canvas, analyzer, processor) {
        super(canvas, analyzer, processor);
        
        // Specific settings for frequency visualization
        this.settings = {
            ...this.settings,
            barSpacing: 1,
            useLogScale: true,
            logBase: 1.02,
            maxBarHeight: 0,  // Will be calculated in draw()
            showFrequencyLabels: true,
            bassColor: 'rgb(32, 147, 255)',
            midColor: 'rgb(46, 204, 113)',
            trebleColor: 'rgb(241, 196, 15)',
            frequencyLabels: [50, 100, 250, 500, 1000, 2500, 5000, 10000, 20000]
        };
    }
    
    /**
     * Draw the frequency spectrum visualization
     * @param {Object} features - Audio features from processor
     */
    draw(features) {
        this.clear();
        
        if (!features) return;
        
        const frequencyData = this.analyzer.getFrequencyData();
        if (!frequencyData) return;
        
        // Get actual dimensions
        this.settings.maxBarHeight = this.height - 30; // Space for labels
        
        // Calculate bar width based on visible frequency range (1/4 of total)
        const visibleBins = Math.min(frequencyData.length, frequencyData.length / 4);
        const barWidth = this.width / visibleBins;
        
        // Reference to sample rate
        const sampleRate = this.analyzer.getSampleRate();
        const nyquist = sampleRate / 2;
        
        // Draw frequency bars
        for (let i = 0; i < visibleBins; i++) {
            // Calculate index with logarithmic scaling if enabled
            let binIndex = i;
            if (this.settings.useLogScale) {
                binIndex = Math.round(
                    (Math.pow(this.settings.logBase, i) - 1) / 
                    (Math.pow(this.settings.logBase, visibleBins) - 1) * visibleBins
                );
            }
            
            // Get normalized amplitude (0-1)
            const value = frequencyData[binIndex] / 255;
            
            // Calculate bar height
            const barHeight = value * this.settings.maxBarHeight;
            
            // Calculate bar position
            const x = i * (barWidth + this.settings.barSpacing);
            const y = this.height - barHeight;
            
            // Determine color based on frequency range
            let barColor;
            if (i < visibleBins * 0.08) {
                barColor = this.settings.bassColor;
            } else if (i < visibleBins * 0.4) {
                barColor = this.settings.midColor;
            } else {
                barColor = this.settings.trebleColor;
            }
            
            // Create gradient fill
            const gradient = this.ctx.createLinearGradient(0, y, 0, this.height);
            gradient.addColorStop(0, barColor);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
            
            // Draw bar
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, barWidth, barHeight);
        }
        
        // Draw frequency labels if enabled
        if (this.settings.showFrequencyLabels) {
            this.drawFrequencyLabels(nyquist);
        }
    }
    
    /**
     * Draw frequency labels along the x-axis
     * @param {number} nyquist - Nyquist frequency (half the sample rate)
     */
    drawFrequencyLabels(nyquist) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.font = '10px Roboto Mono';
        this.ctx.textAlign = 'center';
        
        // Draw labels for selected frequencies
        for (const freq of this.settings.frequencyLabels) {
            if (freq <= nyquist) {
                // Position with logarithmic scaling to match the visualization
                const normPosition = Math.log(freq / 20) / Math.log(nyquist / 20);
                const x = normPosition * this.width;
                
                // Draw marker line
                this.ctx.fillRect(x, this.height - 15, 1, 5);
                
                // Draw label
                let label = this.formatFrequency(freq);
                this.ctx.fillText(label, x, this.height - 2);
            }
        }
    }
}

// Register this visualizer type
if (!window.visualizers) {
    window.visualizers = {};
}

window.visualizers.frequencyBars = (canvas) => 
    new FrequencyBarsVisualizer(canvas, audioAnalyzer, audioProcessor);