/**
 * energy-circle.js - Energy circle visualization
 * Displays audio energy as interactive circles
 */

class EnergyCircleVisualizer extends Visualizer {
    constructor(canvas, analyzer, processor) {
        super(canvas, analyzer, processor);
        
        // Specific settings for energy circle visualization
        this.settings = {
            ...this.settings,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            bassColor: 'rgba(231, 76, 60, 0.7)',
            midColor: 'rgba(46, 204, 113, 0.7)',
            trebleColor: 'rgba(52, 152, 219, 0.7)',
            mainColor: 'rgba(41, 128, 185, 0.5)',
            pulseDuration: 200, // milliseconds
            addBlur: true,
            showLabels: true,
            showValues: true
        };
        
        // Pulse animation properties
        this.pulseSize = 0;
        this.prevBeat = 0;
    }
    
    /**
     * Draw the energy circle visualization
     * @param {Object} features - Audio features from processor
     */
    draw(features) {
        this.clear();
        
        if (!features) return;
        
        // Extract energy values
        const { bassEnergy, midEnergy, trebleEnergy, totalEnergy } = features;
        
        // Calculate dimensions
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const maxRadius = Math.min(this.width, this.height) * 0.4;
        
        // Draw concentric background circles
        this.drawBackgroundCircles(centerX, centerY, maxRadius);
        
        // Draw main energy circle
        this.drawMainEnergyCircle(centerX, centerY, maxRadius, totalEnergy);
        
        // Draw frequency band circles
        this.drawFrequencyCircles(centerX, centerY, maxRadius, bassEnergy, midEnergy, trebleEnergy);
        
        // Draw beat pulse
        this.drawBeatPulse(centerX, centerY, maxRadius);
        
        // Draw labels if enabled
        if (this.settings.showLabels) {
            this.drawLabels(centerX, centerY, maxRadius);
        }
        
        // Draw energy value
        if (this.settings.showValues) {
            this.drawEnergyValue(centerX, centerY, totalEnergy);
        }
    }
    
    /**
     * Draw concentric background circles
     */
    drawBackgroundCircles(centerX, centerY, maxRadius) {
        for (let i = 5; i > 0; i--) {
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, maxRadius * (i/5), 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * i})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
    }
    
    /**
     * Draw the main energy circle
     */
    drawMainEnergyCircle(centerX, centerY, maxRadius, totalEnergy) {
        // Main circle radius based on total energy
        const mainRadius = maxRadius * (0.2 + totalEnergy * 0.8);
        
        // Apply blur effect if enabled
        if (this.settings.addBlur && totalEnergy > 0.5) {
            this.ctx.shadowBlur = 15 * (totalEnergy - 0.5) * 2;
            this.ctx.shadowColor = 'rgba(41, 128, 185, 0.7)';
        }
        
        // Draw main circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, mainRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(41, 128, 185, ${0.3 + totalEnergy * 0.7})`;
        this.ctx.fill();
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    }
    
    /**
     * Draw frequency band circles
     */
    drawFrequencyCircles(centerX, centerY, maxRadius, bassEnergy, midEnergy, trebleEnergy) {
        // Distance from center for satellite circles
        const distance = maxRadius * 0.5;
        
        // Draw bass circle (red, at angle 0)
        this.drawFrequencyCircle(
            centerX, centerY, 
            maxRadius * 0.7, 
            bassEnergy,
            this.settings.bassColor,
            0, // angle
            distance
        );
        
        // Draw mid circle (green, at angle 2π/3)
        this.drawFrequencyCircle(
            centerX, centerY, 
            maxRadius * 0.7, 
            midEnergy,
            this.settings.midColor,
            Math.PI * 2/3, // angle
            distance
        );
        
        // Draw treble circle (blue, at angle 4π/3)
        this.drawFrequencyCircle(
            centerX, centerY, 
            maxRadius * 0.7, 
            trebleEnergy,
            this.settings.trebleColor,
            Math.PI * 4/3, // angle
            distance
        );
    }
    
    /**
     * Draw a single frequency circle
     */
    drawFrequencyCircle(centerX, centerY, maxRadius, energy, color, angle, distance) {
        // Calculate circle radius based on energy
        const radius = maxRadius * energy;
        
        // Calculate position based on angle and distance
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        // Apply blur effect for higher energy
        if (this.settings.addBlur && energy > 0.7) {
            this.ctx.shadowBlur = 10 * (energy - 0.7) * 3;
            this.ctx.shadowColor = color;
        }
        
        // Draw the circle
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        
        // Draw line connecting to center
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(x, y);
        this.ctx.strokeStyle = color.replace('0.7', '0.3');
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    /**
     * Draw a pulse animation on beat detection
     */
    drawBeatPulse(centerX, centerY, maxRadius) {
        // Get the last beat time from the BPM detector
        const lastBeatTime = bpmDetector.getData().lastBeatTime;
        const now = this.analyzer.getCurrentTime();
        
        if (lastBeatTime && now) {
            const timeSinceLastBeat = now - lastBeatTime;
            
            // If this is a recent beat
            if (timeSinceLastBeat < this.settings.pulseDuration) {
                // Calculate pulse size (from 1 to 0 based on age)
                this.pulseSize = 1 - (timeSinceLastBeat / this.settings.pulseDuration);
                
                // If this is a new beat
                if (lastBeatTime !== this.prevBeat) {
                    this.prevBeat = lastBeatTime;
                }
                
                // Draw pulse
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, maxRadius * (1 + this.pulseSize * 0.2), 0, Math.PI * 2);
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${this.pulseSize * 0.8})`;
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            }
        }
    }
    
    /**
     * Draw labels for frequency bands
     */
    drawLabels(centerX, centerY, maxRadius) {
        const distance = maxRadius * 0.85;
        this.ctx.font = '12px Roboto Mono';
        this.ctx.textAlign = 'center';
        
        // Bass label
        this.ctx.fillStyle = 'rgba(231, 76, 60, 0.9)';
        const bassX = centerX + Math.cos(0) * distance;
        const bassY = centerY + Math.sin(0) * distance;
        this.ctx.fillText('Graves', bassX, bassY);
        
        // Mid label
        this.ctx.fillStyle = 'rgba(46, 204, 113, 0.9)';
        const midX = centerX + Math.cos(Math.PI * 2/3) * distance;
        const midY = centerY + Math.sin(Math.PI * 2/3) * distance;
        this.ctx.fillText('Médiums', midX, midY);
        
        // Treble label
        this.ctx.fillStyle = 'rgba(52, 152, 219, 0.9)';
        const trebleX = centerX + Math.cos(Math.PI * 4/3) * distance;
        const trebleY = centerY + Math.sin(Math.PI * 4/3) * distance;
        this.ctx.fillText('Aigus', trebleX, trebleY);
    }
    
    /**
     * Draw the total energy value
     */
    drawEnergyValue(centerX, centerY, totalEnergy) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = 'bold 24px Roboto Mono';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${Math.round(totalEnergy * 100)}%`, centerX, centerY + 8);
    }
}

// Register this visualizer type
if (!window.visualizers) {
    window.visualizers = {};
}

window.visualizers.energyCircle = (canvas) => 
    new EnergyCircleVisualizer(canvas, audioAnalyzer, audioProcessor);