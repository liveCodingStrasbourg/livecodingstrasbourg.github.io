/**
 * bpm-tracker.js - BPM tracking visualization
 * Displays the detected beats and calculated BPM
 */

class BPMTrackerVisualizer extends Visualizer {
    constructor(canvas, analyzer, processor) {
        super(canvas, analyzer, processor);
        
        // Reference to the BPM detector
        this.bpmDetector = bpmDetector;
        
        // Specific settings for BPM visualization
        this.settings = {
            ...this.settings,
            backgroundColor: 'rgba(41, 128, 185, 0.1)',
            beatMarkerColor: 'rgb(41, 128, 185)',
            beatHistoryDuration: 2000, // milliseconds to show beat history
            showConfidence: true,
            showManualBPM: true,
            pulseColors: true
        };
        
        // Animation properties
        this.pulseSize = 0;
        this.prevBeat = 0;
    }
    
    /**
     * Draw the BPM tracker visualization
     * @param {Object} features - Audio features from processor
     */
    draw(features) {
        this.clear();
        
        if (!features) return;
        
        // Get beat detection data
        const beatData = this.bpmDetector.getData();
        const now = this.analyzer.getCurrentTime();
        
        // Draw background grid
        this.drawGrid();
        
        // Draw recent beats
        this.drawBeatHistory(beatData.beatTimes, now);
        
        // Draw pulse animation on most recent beat
        this.drawBeatPulse(beatData.lastBeatTime, now);
        
        // Draw BPM value
        this.drawBPMDisplay(beatData);
        
        // Draw comparison with manual BPM if enabled
        if (this.settings.showManualBPM && beatData.manualBPM > 0) {
            this.drawManualBPMComparison(beatData);
        }
        
        // Draw algorithm explanation if enabled
        if (this.settings.showLabels) {
            this.drawAlgorithmExplanation(beatData);
        }
    }
    
    /**
     * Draw a grid background
     */
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < this.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < this.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw the history of detected beats
     * @param {Array} beatTimes - Array of beat timestamps
     * @param {number} now - Current time
     */
    drawBeatHistory(beatTimes, now) {
        if (!beatTimes || beatTimes.length === 0) return;
        
        const maxAge = this.settings.beatHistoryDuration;
        
        beatTimes.forEach((time, index) => {
            const age = now - time;
            
            if (age < maxAge) {
                // Position based on age
                const x = this.width - (age / maxAge) * this.width;
                
                // Opacity based on age
                const opacity = 1 - (age / maxAge);
                
                // Size based on age
                const size = 20 - (age / maxAge) * 15;
                
                // Draw beat marker
                this.ctx.fillStyle = `rgba(41, 128, 185, ${opacity})`;
                this.ctx.beginPath();
                this.ctx.arc(x, this.height / 2, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }
    
    /**
     * Draw a pulse animation on the most recent beat
     * @param {number} lastBeatTime - Timestamp of the last beat
     * @param {number} now - Current time
     */
    drawBeatPulse(lastBeatTime, now) {
        if (!lastBeatTime) return;
        
        const timeSinceLastBeat = now - lastBeatTime;
        const pulseDuration = 500; // ms
        
        if (timeSinceLastBeat < pulseDuration) {
            // Update pulse size (1.0 to 0.0 based on age)
            this.pulseSize = 1 - (timeSinceLastBeat / pulseDuration);
            
            // If this is a new beat (not the same as the previous one)
            if (lastBeatTime !== this.prevBeat) {
                this.prevBeat = lastBeatTime;
                
                // Trigger visual feedback
                const event = new CustomEvent('visual-beat-pulse');
                document.dispatchEvent(event);
            }
            
            // Draw the pulse
            const pulseRadius = this.height / 3 * (1 + this.pulseSize * 0.3);
            this.ctx.beginPath();
            this.ctx.arc(this.width / 2, this.height / 2, pulseRadius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(41, 128, 185, ${this.pulseSize * 0.7})`;
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw the BPM display with current value and confidence
     * @param {Object} beatData - Beat detection data
     */
    drawBPMDisplay(beatData) {
        const bpm = beatData.bpm || 0;
        const confidence = beatData.bpmConfidence || 0;
        
        // Background for BPM display
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(this.width / 2 - 100, this.height / 2 - 50, 200, 100);
        
        // Determine color based on confidence
        let bpmColor = 'rgba(255, 255, 255, 0.9)';
        if (this.settings.pulseColors) {
            if (confidence >= 80) {
                bpmColor = 'rgb(46, 204, 113)'; // Green for high confidence
            } else if (confidence >= 50) {
                bpmColor = 'rgb(241, 196, 15)'; // Yellow for medium confidence
            } else {
                bpmColor = 'rgb(231, 76, 60)'; // Red for low confidence
            }
        }
        
        // Draw BPM value
        this.ctx.fillStyle = bpmColor;
        this.ctx.font = 'bold 36px Roboto Mono';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${bpm} BPM`, this.width / 2, this.height / 2 - 10);
        
        // Draw confidence if enabled
        if (this.settings.showConfidence) {
            this.ctx.font = '14px Roboto Mono';
            this.ctx.fillText(`Confiance: ${confidence}%`, this.width / 2, this.height / 2 + 20);
        }
    }
    
    /**
     * Draw comparison between detected and manual BPM
     * @param {Object} beatData - Beat detection data
     */
    drawManualBPMComparison(beatData) {
        const detectedBPM = beatData.bpm || 0;
        const manualBPM = beatData.manualBPM || 0;
        
        if (manualBPM === 0) return;
        
        // Calculate difference
        const diff = detectedBPM - manualBPM;
        const absDiff = Math.abs(diff);
        const percentDiff = manualBPM > 0 ? (absDiff / manualBPM * 100).toFixed(1) : 0;
        
        // Position for comparison display
        const y = this.height - 40;
        
        // Draw comparison
        this.ctx.font = '12px Roboto Mono';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        this.ctx.fillText(
            `Manuel: ${manualBPM} BPM | Différence: ${diff > 0 ? '+' : ''}${diff} BPM (${percentDiff}%)`,
            this.width / 2,
            y
        );
        
        // Visual indicator of match quality
        let matchColor;
        if (absDiff <= 2) {
            matchColor = 'rgb(46, 204, 113)'; // Excellent match - green
        } else if (absDiff <= 5) {
            matchColor = 'rgb(241, 196, 15)'; // Good match - yellow
        } else {
            matchColor = 'rgb(231, 76, 60)'; // Poor match - red
        }
        
        // Draw match quality indicator
        this.ctx.fillStyle = matchColor;
        this.ctx.beginPath();
        this.ctx.arc(this.width / 2, y + 15, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * Draw algorithm explanation
     * @param {Object} beatData - Beat detection data
     */
    drawAlgorithmExplanation(beatData) {
        this.ctx.font = '12px Roboto Mono';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.textAlign = 'center';
        
        this.ctx.fillText(
            'Algorithme: détection de pics énergétiques + analyse des intervalles', 
            this.width / 2, 
            this.height - 20
        );
        
        // Draw current settings
        if (beatData.threshold !== undefined && beatData.sensitivity !== undefined) {
            this.ctx.fillText(
                `Seuil: ${beatData.threshold.toFixed(2)} | Sensibilité: ${beatData.sensitivity.toFixed(1)}`,
                this.width / 2,
                this.height - 5
            );
        }
    }
}

// Register this visualizer type
if (!window.visualizers) {
    window.visualizers = {};
}

window.visualizers.bpmTracker = (canvas) => 
    new BPMTrackerVisualizer(canvas, audioAnalyzer, audioProcessor);