/**
 * energy-circle.js - Enhanced Energy circle visualization
 * Displays audio energy as interactive circles with improved aesthetics
 */

class EnergyCircleVisualizer extends Visualizer {
    constructor(canvas, analyzer, processor) {
        super(canvas, analyzer, processor);

        // Enhanced settings for energy circle visualization
        this.settings = {
            ...this.settings,
            backgroundColor: 'rgba(15, 15, 23, 0.2)',
            // Updated colors to match new color scheme
            bassColor: 'rgba(255, 118, 117, 0.85)',       // Red-pink
            midColor: 'rgba(253, 121, 168, 0.85)',        // Pink
            trebleColor: 'rgba(85, 239, 196, 0.85)',      // Teal
            mainColor: 'rgba(108, 92, 231, 0.75)',        // Purple
            accentColor: 'rgba(0, 206, 201, 0.8)',        // Cyan

            // Visual settings
            pulseDuration: 300,        // milliseconds
            addBlur: true,             // Optional blur effects
            showLabels: true,          // Show frequency band labels
            showValues: true,          // Show energy percentage
            maxEnergyLines: 8,         // Energy connection lines
            useRotation: true,         // Enable rotation animation
            smoothTransition: true,    // Smooth size transitions

            // Animation settings
            rotationSpeed: 0.001,      // Base rotation speed
            energyRotationFactor: 0.01, // How much energy affects rotation
            animateConnections: true,   // Animate connection lines
            animationWaveSpeed: 0.05,   // Speed of connection animations

            // Design options
            circleStyle: 'gradient',   // 'flat', 'gradient', or 'ring'
            showGrid: true,            // Show concentric grid
            useDynamicColors: true,    // Color change based on energy

            // Beat detection
            beatPulseSize: 0.25,       // Max size increase on beat
            beatPulseColor: 'rgba(253, 121, 168, 0.7)'  // Color for beat pulse
        };

        // State variables
        this.pulseSize = 0;
        this.prevBeat = 0;
        this.rotation = 0;
        this.animPhase = 0;

        // Previous values for smooth transitions
        this.prevValues = {
            bass: 0,
            mid: 0,
            treble: 0,
            total: 0
        };

        // Smooth value transitions
        this.transitionSpeed = 0.15; // Lower = smoother but slower
        this.activeValues = { ...this.prevValues };

        // Listen for beat events
        document.addEventListener('beat-detected', () => {
            this.triggerBeatPulse();
        });
    }

    /**
     * Trigger a beat pulse animation
     */
    triggerBeatPulse() {
        this.pulseSize = 1.0;
    }

    /**
     * Draw the energy circle visualization with enhanced aesthetics
     * @param {Object} features - Audio features from processor
     */
    draw(features) {
        this.clear();

        if (!features) return;

        // Extract energy values
        const { bassEnergy, midEnergy, trebleEnergy, totalEnergy } = features;

        // Update animation phase
        this.animPhase = (this.animPhase + this.settings.animationWaveSpeed) % (Math.PI * 2);

        // Update rotation based on energy
        if (this.settings.useRotation) {
            this.rotation += this.settings.rotationSpeed +
            (totalEnergy * this.settings.energyRotationFactor);
            this.rotation %= Math.PI * 2;
        }

        // Update pulse decay
        if (this.pulseSize > 0) {
            this.pulseSize *= 0.92;
            if (this.pulseSize < 0.01) this.pulseSize = 0;
        }

        // Smooth transitions for values if enabled
        if (this.settings.smoothTransition) {
            this.activeValues.bass = this.smoothValue(this.activeValues.bass, bassEnergy);
            this.activeValues.mid = this.smoothValue(this.activeValues.mid, midEnergy);
            this.activeValues.treble = this.smoothValue(this.activeValues.treble, trebleEnergy);
            this.activeValues.total = this.smoothValue(this.activeValues.total, totalEnergy);
        } else {
            this.activeValues.bass = bassEnergy;
            this.activeValues.mid = midEnergy;
            this.activeValues.treble = trebleEnergy;
            this.activeValues.total = totalEnergy;
        }

        // Calculate dimensions
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const maxRadius = Math.min(this.width, this.height) * 0.4;

        // Draw background grid if enabled
        if (this.settings.showGrid) {
            this.drawEnergyGrid(centerX, centerY, maxRadius);
        }

        // Draw energy connection lines
        this.drawEnergyConnections(centerX, centerY, maxRadius);

        // Draw main energy circle
        this.drawMainEnergyCircle(centerX, centerY, maxRadius);

        // Draw frequency band circles
        this.drawFrequencyCircles(centerX, centerY, maxRadius);

        // Draw beat pulse
        if (this.pulseSize > 0) {
            this.drawBeatPulse(centerX, centerY, maxRadius);
        }

        // Draw labels if enabled
        if (this.settings.showLabels) {
            this.drawLabels(centerX, centerY, maxRadius);
        }

        // Draw energy value
        if (this.settings.showValues) {
            this.drawEnergyValue(centerX, centerY);
        }

        // Store previous values for next frame
        this.prevValues = { ...this.activeValues };
    }

    /**
     * Smooth transitions between values
     * @param {number} current - Current value
     * @param {number} target - Target value
     * @returns {number} Smoothed value
     */
    smoothValue(current, target) {
        // Faster movement toward target for rising values
        const factor = target > current ? this.transitionSpeed * 1.5 : this.transitionSpeed;
        return current + (target - current) * factor;
    }

    /**
     * Draw concentric energy grid
     */
    drawEnergyGrid(centerX, centerY, maxRadius) {
        // Draw concentric circles with improved styling
        for (let i = 1; i <= 5; i++) {
            const radius = maxRadius * (i/5);
            const beatEffect = this.pulseSize * 0.08 * (6-i) / 5;

            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius + beatEffect, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(108, 92, 231, ${0.05 + (0.03 * i)})`;
            this.ctx.lineWidth = i === 5 ? 1.5 : 1;
            this.ctx.stroke();
        }

        // Draw radial lines
        const radialLines = 12;
        for (let i = 0; i < radialLines; i++) {
            const angle = (i / radialLines) * Math.PI * 2 + this.rotation;

            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(
                centerX + Math.cos(angle) * maxRadius,
                            centerY + Math.sin(angle) * maxRadius
            );
            this.ctx.strokeStyle = 'rgba(108, 92, 231, 0.05)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
    }

    /**
     * Draw energy connection lines with animation
     */
    drawEnergyConnections(centerX, centerY, maxRadius) {
        // Only draw if we have reasonable energy
        if (this.activeValues.total < 0.05) return;

        const lineCount = Math.floor(this.settings.maxEnergyLines * Math.min(1, this.activeValues.total * 1.5));

        // Draw connection lines with animation
        for (let i = 0; i < lineCount; i++) {
            const angle = (i / lineCount) * Math.PI * 2 + this.rotation;

            // Wave animation for line length
            let lineLength = maxRadius * (0.4 + this.activeValues.total * 0.6);
            if (this.settings.animateConnections) {
                const wavePhase = (this.animPhase + (i / lineCount) * Math.PI * 2) % (Math.PI * 2);
                lineLength *= 0.9 + Math.sin(wavePhase) * 0.1;
            }

            // Calculate end position
            const endX = centerX + Math.cos(angle) * lineLength;
            const endY = centerY + Math.sin(angle) * lineLength;

            // Draw line with gradient
            const gradient = this.ctx.createLinearGradient(centerX, centerY, endX, endY);
            gradient.addColorStop(0, `rgba(108, 92, 231, ${0.1 + this.activeValues.total * 0.3})`);
            gradient.addColorStop(1, `rgba(108, 92, 231, 0)`);

            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(endX, endY);
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 1.5;
            this.ctx.stroke();

            // Add energy node at the end of each line
            this.ctx.beginPath();
            this.ctx.arc(endX, endY, 2 + this.activeValues.total * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 206, 201, ${0.2 + this.activeValues.total * 0.5})`;
            this.ctx.fill();
        }
    }

    /**
     * Draw the main energy circle with enhanced styling
     */
    drawMainEnergyCircle(centerX, centerY, maxRadius) {
        // Main circle radius based on total energy with beat pulse effect
        const baseRadius = maxRadius * (0.25 + this.activeValues.total * 0.75);
        const pulseEffect = this.pulseSize * this.settings.beatPulseSize * maxRadius;
        const mainRadius = baseRadius + pulseEffect;

        // Apply blur effect if enabled for high energy
        if (this.settings.addBlur && this.activeValues.total > 0.5) {
            const blurAmount = 10 * (this.activeValues.total - 0.5) * 2;
            this.ctx.shadowBlur = blurAmount;
            this.ctx.shadowColor = this.settings.mainColor;
        }

        if (this.settings.circleStyle === 'ring') {
            // Draw as ring
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, mainRadius, 0, Math.PI * 2);
            this.ctx.lineWidth = 6 + this.activeValues.total * 6;
            this.ctx.strokeStyle = this.settings.mainColor;
            this.ctx.stroke();

            // Inner glow fill
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, mainRadius * 0.8, 0, Math.PI * 2);

            const innerGradient = this.ctx.createRadialGradient(
                centerX, centerY, mainRadius * 0.3,
                centerX, centerY, mainRadius * 0.8
            );
            innerGradient.addColorStop(0, `rgba(108, 92, 231, ${0.2 + this.activeValues.total * 0.2})`);
            innerGradient.addColorStop(1, 'rgba(108, 92, 231, 0)');

            this.ctx.fillStyle = innerGradient;
            this.ctx.fill();

        } else if (this.settings.circleStyle === 'gradient') {
            // Draw with gradient fill
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, mainRadius, 0, Math.PI * 2);

            const gradient = this.ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, mainRadius
            );
            gradient.addColorStop(0, `rgba(108, 92, 231, ${0.5 + this.activeValues.total * 0.5})`);
            gradient.addColorStop(0.7, `rgba(0, 206, 201, ${0.3 + this.activeValues.total * 0.3})`);
            gradient.addColorStop(1, 'rgba(0, 206, 201, 0)');

            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // Add subtle border
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = `rgba(108, 92, 231, ${0.1 + this.activeValues.total * 0.3})`;
            this.ctx.stroke();

        } else {
            // Default flat style
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, mainRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(108, 92, 231, ${0.3 + this.activeValues.total * 0.7})`;
            this.ctx.fill();
        }

        // Reset shadow
        this.ctx.shadowBlur = 0;
    }

    /**
     * Draw frequency band circles with enhanced styling
     */
    drawFrequencyCircles(centerX, centerY, maxRadius) {
        // Base rotation plus dynamic rotation
        const baseRotation = this.rotation;

        // Distance from center for satellite circles
        const distance = maxRadius * 0.6;

        // Draw bass circle (red-pink, at angle 0 + rotation)
        this.drawFrequencyCircle(
            centerX, centerY,
            maxRadius * 0.8,
            this.activeValues.bass,
            this.settings.bassColor,
            baseRotation, // angle
            distance
        );

        // Draw mid circle (pink, at angle 2π/3 + rotation)
        this.drawFrequencyCircle(
            centerX, centerY,
            maxRadius * 0.8,
            this.activeValues.mid,
            this.settings.midColor,
            baseRotation + Math.PI * 2/3, // angle
            distance
        );

        // Draw treble circle (teal, at angle 4π/3 + rotation)
        this.drawFrequencyCircle(
            centerX, centerY,
            maxRadius * 0.8,
            this.activeValues.treble,
            this.settings.trebleColor,
            baseRotation + Math.PI * 4/3, // angle
            distance
        );
    }

    /**
     * Draw a single frequency circle with enhanced styling
     */
    drawFrequencyCircle(centerX, centerY, maxRadius, energy, color, angle, distance) {
        // Add subtle pulse effect to the radius based on energy
        const pulseAmount = Math.sin(this.animPhase * 2) * 0.03 * energy;
        const beatEffect = this.pulseSize * 0.15;

        // Calculate circle radius based on energy with effects
        const radius = maxRadius * (energy * 0.8 + 0.2) * (1 + pulseAmount + beatEffect);

        // Calculate position based on angle and distance
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        // Apply blur effect for higher energy
        if (this.settings.addBlur && energy > 0.6) {
            const blurAmount = 8 * (energy - 0.6) * 2.5;
            this.ctx.shadowBlur = blurAmount;
            this.ctx.shadowColor = color;
        }

        // Draw the circle with improved style
        if (this.settings.circleStyle === 'ring') {
            // Ring style
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.lineWidth = 3 + energy * 5;
            this.ctx.strokeStyle = color;
            this.ctx.stroke();

        } else if (this.settings.circleStyle === 'gradient') {
            // Gradient style
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);

            const gradient = this.ctx.createRadialGradient(
                x, y, 0,
                x, y, radius
            );
            gradient.addColorStop(0, color.replace('0.85', '0.9'));
            gradient.addColorStop(1, color.replace('0.85', '0.3'));

            this.ctx.fillStyle = gradient;
            this.ctx.fill();

        } else {
            // Default flat style
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.fill();
        }

        // Reset shadow
        this.ctx.shadowBlur = 0;

        // Draw connection line to center with animation
        this.drawConnectionLine(centerX, centerY, x, y, color, energy);
    }

    /**
     * Draw animated connection line between center and frequency circle
     */
    drawConnectionLine(centerX, centerY, x, y, color, energy) {
        // Create basic line
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);

        if (this.settings.animateConnections && energy > 0.1) {
            // Animated curved line for high energy
            const curveAmount = 20 * energy * Math.sin(this.animPhase);
            const midX = (centerX + x) / 2 - Math.sin(this.animPhase) * curveAmount;
            const midY = (centerY + y) / 2 + Math.cos(this.animPhase) * curveAmount;

            this.ctx.quadraticCurveTo(midX, midY, x, y);
        } else {
            // Straight line for low energy
            this.ctx.lineTo(x, y);
        }

        // Create gradient for line
        const gradient = this.ctx.createLinearGradient(centerX, centerY, x, y);
        gradient.addColorStop(0, `rgba(108, 92, 231, ${0.3 * energy})`);
        gradient.addColorStop(1, color.replace('0.85', `${0.3 + energy * 0.5}`));

        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 1 + energy * 2;
        this.ctx.stroke();

        // Add energy flow particles along the line for high energy
        if (energy > 0.5 && this.settings.animateConnections) {
            this.drawEnergyParticles(centerX, centerY, x, y, color, energy);
        }
    }

    /**
     * Draw energy flow particles along connection line
     */
    drawEnergyParticles(centerX, centerY, x, y, color, energy) {
        const particleCount = Math.floor(4 * energy);

        for (let i = 0; i < particleCount; i++) {
            // Calculate position along the line with animation
            const pos = (this.animPhase / Math.PI + i / particleCount) % 1;

            // Particle position
            const px = centerX + (x - centerX) * pos;
            const py = centerY + (y - centerY) * pos;

            // Particle size (larger near the end)
            const size = 2 + pos * 3 * energy;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(px, py, size, 0, Math.PI * 2);
            this.ctx.fillStyle = color.replace('0.85', '0.9');
            this.ctx.fill();
        }
    }

    /**
     * Draw a pulse animation on beat detection
     */
    drawBeatPulse(centerX, centerY, maxRadius) {
        if (this.pulseSize <= 0) return;

        // Calculate pulse radius
        const pulseRadius = maxRadius * (1 + this.pulseSize * 0.3);

        // Draw outer pulse ring
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(253, 121, 168, ${this.pulseSize * 0.7})`;
        this.ctx.lineWidth = 2 + this.pulseSize * 3;

        if (this.settings.addBlur) {
            this.ctx.shadowBlur = 10 * this.pulseSize;
            this.ctx.shadowColor = this.settings.beatPulseColor;
        }

        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // Draw inner pulse glow
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, pulseRadius * 0.7, 0, Math.PI * 2);

        const pulseGradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, pulseRadius * 0.7
        );
        pulseGradient.addColorStop(0, `rgba(253, 121, 168, ${this.pulseSize * 0.1})`);
        pulseGradient.addColorStop(1, 'rgba(253, 121, 168, 0)');

        this.ctx.fillStyle = pulseGradient;
        this.ctx.fill();
    }

    /**
     * Draw labels for frequency bands with enhanced styling
     */
    drawLabels(centerX, centerY, maxRadius) {
        const distance = maxRadius * 0.9;
        const baseRotation = this.rotation;

        // Common label styling
        this.ctx.font = 'bold 12px Roboto Mono';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Function to draw a label with background
        const drawEnhancedLabel = (text, angle, color) => {
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;

            // Calculate label background size
            const metrics = this.ctx.measureText(text);
            const padding = 6;
            const bgWidth = metrics.width + padding * 2;
            const bgHeight = 20;

            // Draw background with subtle transparency
            this.ctx.fillStyle = 'rgba(15, 15, 23, 0.7)';
            this.roundRect(
                x - bgWidth/2,
                y - bgHeight/2,
                bgWidth,
                bgHeight,
                4
            );
            this.ctx.fill();

            // Draw border
            this.ctx.strokeStyle = color.replace('0.85', '0.4');
            this.ctx.lineWidth = 1;
            this.roundRect(
                x - bgWidth/2,
                y - bgHeight/2,
                bgWidth,
                bgHeight,
                4
            );
            this.ctx.stroke();

            // Draw text
            this.ctx.fillStyle = color;
            this.ctx.fillText(text, x, y);
        };

        // Bass label
        drawEnhancedLabel('Graves', baseRotation, this.settings.bassColor);

        // Mid label
        drawEnhancedLabel('Médiums', baseRotation + Math.PI * 2/3, this.settings.midColor);

        // Treble label
        drawEnhancedLabel('Aigus', baseRotation + Math.PI * 4/3, this.settings.trebleColor);
    }

    /**
     * Draw the total energy value with enhanced styling
     */
    drawEnergyValue(centerX, centerY) {
        // Calculate energy percentage
        const energyPercent = Math.round(this.activeValues.total * 100);

        // Add subtle animation to the value display
        const size = 1 + this.pulseSize * 0.2 + Math.sin(this.animPhase) * 0.05;

        // Background circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 36, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(15, 15, 23, 0.6)';
        this.ctx.fill();

        // Draw ring around the value
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(0, 206, 201, ${0.3 + this.activeValues.total * 0.5})`;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw energy text with enhanced styling
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(size, size);

        // Choose color based on energy level
        let valueColor;
        if (this.settings.useDynamicColors) {
            if (energyPercent < 33) {
                valueColor = this.settings.bassColor; // Low energy
            } else if (energyPercent < 66) {
                valueColor = this.settings.midColor; // Medium energy
            } else {
                valueColor = this.settings.trebleColor; // High energy
            }
        } else {
            valueColor = 'rgba(255, 255, 255, 0.9)';
        }

        // Draw text
        this.ctx.fillStyle = valueColor;
        this.ctx.font = 'bold 24px Roboto Mono';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${energyPercent}%`, 0, 0);

        this.ctx.restore();

        // Add beat indicator text if beat is active
        if (this.pulseSize > 0.5) {
            this.ctx.fillStyle = this.settings.beatPulseColor;
            this.ctx.font = 'bold 10px Roboto Mono';
            this.ctx.fillText('BEAT', centerX, centerY + 40);
        }
    }

    /**
     * Helper method to draw rounded rectangles
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Rectangle width
     * @param {number} height - Rectangle height
     * @param {number} radius - Corner radius
     */
    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
}

// Register this visualizer type
if (!window.visualizers) {
    window.visualizers = {};
}

window.visualizers.energyCircle = (canvas) =>
new EnergyCircleVisualizer(canvas, audioAnalyzer, audioProcessor);
