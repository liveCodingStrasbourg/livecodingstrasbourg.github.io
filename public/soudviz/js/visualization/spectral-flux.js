/**
 * spectral-flux.js - Spectral flux visualization
 * Displays the rate of change in the frequency spectrum over time
 */

class SpectralFluxVisualizer extends Visualizer {
    constructor(canvas, analyzer, processor) {
        super(canvas, analyzer, processor);
        
        // Specific settings for spectral flux visualization
        this.settings = {
            ...this.settings,
            lineColor: 'rgb(155, 89, 182)',
            lineWidth: 2,
            fillColor: 'rgba(155, 89, 182, 0.2)',
            showThresholdLine: true,
            thresholdLineColor: 'rgba(255, 255, 255, 0.3)',
            beatMarkerColor: 'rgba(255, 50, 50, 0.7)'
        };
    }
    
    /**
     * Draw the spectral flux visualization
     * @param {Object} features - Audio features from processor
     */
    draw(features) {
        this.clear();
        
        if (!features || !features.spectralFluxHistory || features.spectralFluxHistory.length < 2) {
            this.drawLabel('Collecte des données...', this.width / 2, this.height / 2, {
                font: '14px Roboto Mono'
            });
            return;
        }
        
        const fluxHistory = features.spectralFluxHistory;
        
        // Calculate scaling
        const maxFlux = Math.max(...fluxHistory.map(d => d.value), 0.1);
        const step = this.width / (fluxHistory.length - 1);
        
        // Draw filled area under the curve
        if (this.settings.fillColor) {
            this.ctx.fillStyle = this.settings.fillColor;
            this.ctx.beginPath();
            
            // Start at the bottom left
            this.ctx.moveTo(0, this.height);
            
            // Draw points along the line
            for (let i = 0; i < fluxHistory.length; i++) {
                const x = i * step;
                const y = this.height - (fluxHistory[i].value / maxFlux) * (this.height - 40);
                this.ctx.lineTo(x, y);
            }
            
            // Complete the path back to the bottom
            this.ctx.lineTo((fluxHistory.length - 1) * step, this.height);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        // Draw the flux curve
        this.ctx.strokeStyle = this.settings.lineColor;
        this.ctx.lineWidth = this.settings.lineWidth;
        this.ctx.beginPath();
        
        for (let i = 0; i < fluxHistory.length; i++) {
            const x = i * step;
            const y = this.height - (fluxHistory[i].value / maxFlux) * (this.height - 40);
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.stroke();
        
        // Draw threshold line if enabled
        if (this.settings.showThresholdLine) {
            // Calculate a dynamic threshold based on average + standard deviation
            const values = fluxHistory.map(d => d.value);
            const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);
            
            // Threshold at mean + 1.5 * stdDev
            const threshold = avg + (1.5 * stdDev);
            const thresholdY = this.height - (threshold / maxFlux) * (this.height - 40);
            
            this.ctx.strokeStyle = this.settings.thresholdLineColor;
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 3]);
            this.ctx.beginPath();
            this.ctx.moveTo(0, thresholdY);
            this.ctx.lineTo(this.width, thresholdY);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // Draw threshold value
            this.drawLabel(
                `Seuil: ${threshold.toFixed(3)}`, 
                this.width - 10, 
                thresholdY - 5, 
                {
                    align: 'right',
                    font: '9px Roboto Mono',
                    background: 'rgba(0, 0, 0, 0.4)'
                }
            );
        }
        
        // Draw beat markers
        if (features.beatData && features.beatData.beatTimes) {
            const now = this.analyzer.getCurrentTime();
            const timeWindow = fluxHistory[fluxHistory.length - 1].time - fluxHistory[0].time;
            
            features.beatData.beatTimes.forEach(beatTime => {
                // Only show beats within the visible time window
                if (now - beatTime <= timeWindow) {
                    // Calculate x position based on relative time
                    const relativePosition = 1 - ((now - beatTime) / timeWindow);
                    const x = relativePosition * this.width;
                    
                    // Draw beat marker
                    this.ctx.fillStyle = this.settings.beatMarkerColor;
                    this.ctx.beginPath();
                    this.ctx.arc(x, 20, 5, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });
        }
        
        // Draw current value
        const currentFlux = fluxHistory[fluxHistory.length - 1].value;
        this.drawLabel(
            `Flux Spectral: ${currentFlux.toFixed(3)}`, 
            10, 
            20, 
            {
                align: 'left',
                font: '12px Roboto Mono',
                color: 'rgba(255, 255, 255, 0.8)'
            }
        );
        
        // Draw explanation
        if (this.settings.showLabels) {
            this.drawLabel(
                'Mesure les changements dans le spectre au fil du temps', 
                10, 
                40, 
                {
                    align: 'left',
                    font: '10px Roboto Mono'
                }
            );
            
            this.drawLabel(
                'Pics = transitions sonores importantes', 
                10, 
                55, 
                {
                    align: 'left',
                    font: '10px Roboto Mono'
                }
            );
        }
    }
}

// Register this visualizer type
if (!window.visualizers) {
    window.visualizers = {};
}

window.visualizers.spectralFlux = (canvas) => 
    new SpectralFluxVisualizer(canvas, audioAnalyzer, audioProcessor);