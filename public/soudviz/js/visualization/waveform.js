/**
 * waveform.js - Waveform visualization
 * Displays the time-domain audio data as a waveform
 */

class WaveformVisualizer extends Visualizer {
    constructor(canvas, analyzer, processor) {
        super(canvas, analyzer, processor);
        
        // Specific settings for waveform visualization
        this.settings = {
            ...this.settings,
            lineWidth: 2,
            lineColor: 'rgb(46, 204, 113)',
            centerLineColor: 'rgba(255, 255, 255, 0.2)'
        };
    }
    
    /**
     * Draw the waveform visualization
     * @param {Object} features - Audio features from processor
     */
    draw(features) {
        this.clear();
        
        if (!features) return;
        
        const timeData = this.analyzer.getTimeData();
        if (!timeData) return;
        
        // Vertical center of the canvas
        const center = this.height / 2;
        
        // Draw center line (zero amplitude)
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.settings.centerLineColor;
        this.ctx.beginPath();
        this.ctx.moveTo(0, center);
        this.ctx.lineTo(this.width, center);
        this.ctx.stroke();
        
        // Draw waveform
        this.ctx.lineWidth = this.settings.lineWidth;
        this.ctx.strokeStyle = this.settings.lineColor;
        this.ctx.beginPath();
        
        const sliceWidth = this.width / timeData.length;
        let x = 0;
        
        for (let i = 0; i < timeData.length; i++) {
            // Convert to range -1 to 1
            const v = (timeData[i] / 128) - 1;
            
            // Scale to canvas height and invert (positive up)
            const y = center + (v * center);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        this.ctx.stroke();
        
        // Draw labels
        if (this.settings.showLabels) {
            // Time label
            this.drawLabel('Temps →', this.width - 10, this.height - 10, {
                align: 'right',
                baseline: 'bottom'
            });
            
            // Amplitude label
            this.drawLabel('Amplitude', 10, 15, {
                align: 'left',
                baseline: 'top'
            });
            
            // Draw amplitude scale
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(5, center - 35, 1, 70);
            
            this.drawLabel('+1.0', 10, center - 30, {
                align: 'left',
                font: '9px Roboto Mono'
            });
            
            this.drawLabel('0.0', 10, center, {
                align: 'left',
                font: '9px Roboto Mono'
            });
            
            this.drawLabel('-1.0', 10, center + 30, {
                align: 'left',
                font: '9px Roboto Mono'
            });
        }
        
        // Additional stats if peaks are present
        if (features.peakLevel > 0.8) {
            this.drawLabel(`Peak: ${features.peakLevel.toFixed(2)}`, this.width - 10, 15, {
                align: 'right',
                baseline: 'top',
                background: features.peakLevel > 0.95 ? 'rgba(255, 0, 0, 0.5)' : null,
                color: features.peakLevel > 0.95 ? 'white' : 'rgba(255, 255, 255, 0.7)'
            });
        }
    }
}

// Register this visualizer type
if (!window.visualizers) {
    window.visualizers = {};
}

window.visualizers.waveform = (canvas) => 
    new WaveformVisualizer(canvas, audioAnalyzer, audioProcessor);