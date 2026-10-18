/**
 * centroid-visualizer.js - Enhanced Spectral centroid visualization
 * Displays the distribution of frequencies in the audio signal with improved aesthetics
 */

class CentroidVisualizer extends Visualizer {
    constructor(canvas, analyzer, processor) {
        super(canvas, analyzer, processor);

        // Enhanced settings for centroid visualization
        this.settings = {
            ...this.settings,
            backgroundColor: 'rgba(15, 15, 23, 0.2)',
            foregroundColor: 'rgb(85, 239, 196)',
                lineColor: 'rgba(85, 239, 196, 0.85)',
                historyLineColor: 'rgba(108, 92, 231, 0.5)',
                centroidMarkerColor: 'rgb(253, 121, 168)',
                peakMarkerColor: 'rgba(255, 118, 117, 0.8)',
                gridColor: 'rgba(108, 92, 231, 0.15)',
                labelBackground: 'rgba(26, 26, 38, 0.7)',
                labelColor: 'rgba(245, 245, 247, 0.9)',
                highlightColor: 'rgb(0, 206, 201)',
                showHistory: true,
                historyLength: 150, // Increased for smoother trails
                smoothingFactor: 0.85,
                showFrequencyLabels: true,
                showGrid: true,
                useGlow: false,
                animationSpeed: 0.05,
                useDepthEffect: false
        };

        // History of centroid values
        this.centroidHistory = [];

        // History of energy distribution
        this.energyHistory = [];

        // Smoothed centroid value
        this.smoothedCentroid = 0.5;

        // Animation properties
        this.animationPhase = 0;

        // Frequency labels with improved scale distribution
        this.frequencyLabels = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];

        // Beat detection state (for visual effects)
        this.beatActive = false;
        this.beatDecay = 0;

        // Listen for beat events
        document.addEventListener('beat-detected', () => {
            this.beatActive = true;
            this.beatDecay = 1.0;
        });
    }

    /**
     * Draw the centroid visualization with enhanced visuals
     * @param {Object} features - Audio features from processor
     */
    draw(features) {
        this.clear();

        if (!features) return;

        const frequencyData = this.analyzer.getFrequencyData();
        if (!frequencyData) return;

        // Update animation phase
        this.animationPhase = (this.animationPhase + this.settings.animationSpeed) % (Math.PI * 2);

        // Update beat decay
        if (this.beatDecay > 0) {
            this.beatDecay *= 0.95;
            if (this.beatDecay < 0.01) this.beatDecay = 0;
        }

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

        // Draw grid if enabled
        if (this.settings.showGrid) {
            this.drawGrid();
        }

        // Draw the frequency distribution and centroid
        this.drawFrequencyDistribution(normalizedData, this.smoothedCentroid, features);

        // Draw the centroid history with enhanced visuals
        if (this.settings.showHistory && this.centroidHistory.length > 1) {
            this.drawCentroidHistory();
        }

        // Draw frequency labels
        if (this.settings.showFrequencyLabels) {
            this.drawFrequencyLabels();
        }

        // Draw metrics at the top with improved styling
        this.drawMetrics(features);
    }

    /**
     * Draw grid lines for better visualization
     */
    drawGrid() {
        const width = this.width;
        const height = this.height;

        this.ctx.strokeStyle = this.settings.gridColor;
        this.ctx.lineWidth = 1;

        // Horizontal grid lines (amplitude)
        for (let i = 0.2; i <= 1; i += 0.2) {
            const y = height - (i * height);

            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }

        // Vertical grid lines (frequency bands)
        for (const freq of this.frequencyLabels) {
            const x = this.getXPositionForFrequency(freq, width);

            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }
    }

    /**
     * Draw the current frequency distribution and centroid marker with enhanced visuals
     * @param {Array} normalizedData - Normalized frequency data
     * @param {number} centroid - Current centroid value (0-1)
     * @param {Object} features - Audio features for visual effects
     */
    drawFrequencyDistribution(normalizedData, centroid, features) {
        const width = this.width;
        const height = this.height;
        const totalEnergy = features.totalEnergy;

        // Apply beat effect to the visualization
        const beatScale = 1 + (this.beatDecay * 0.15);

        // Draw the frequency distribution as a filled area with enhanced gradient
        this.ctx.beginPath();
        this.ctx.moveTo(0, height);

        for (let i = 0; i < normalizedData.length / 3; i++) {
            // Use improved logarithmic scale for better frequency representation
            const x = this.getXPositionForFrequency(
                this.indexToFrequency(i, normalizedData.length / 3),
                                                    width
            );

            // Add subtle animation to the visualization
            const animFactor = Math.sin(this.animationPhase + i * 0.01) * 0.03;
            const energyBump = this.beatDecay * 0.2 * normalizedData[i];

            // Calculate Y position with animated effects
            const y = height - ((normalizedData[i] * beatScale + animFactor + energyBump) * (height * 0.85));

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

        // Create gradient based on energy and beat
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, `rgba(85, 239, 196, ${0.6 + this.beatDecay * 0.3})`);
        gradient.addColorStop(0.5, `rgba(108, 92, 231, ${0.3 + this.beatDecay * 0.2})`);
        gradient.addColorStop(1, `rgba(0, 0, 0, 0.05)`);

        this.ctx.fillStyle = gradient;

        // Add glow effect during beat
        if (this.settings.useGlow && this.beatDecay > 0.1) {
            this.ctx.shadowBlur = 15 * this.beatDecay;
            this.ctx.shadowColor = 'rgba(0, 206, 201, 0.7)';
        }

        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Draw a line along the top of the distribution with enhanced styling
        this.ctx.beginPath();

        for (let i = 0; i < normalizedData.length / 3; i++) {
            const x = this.getXPositionForFrequency(
                this.indexToFrequency(i, normalizedData.length / 3),
                                                    width
            );

            const animFactor = Math.sin(this.animationPhase + i * 0.01) * 0.03;
            const energyBump = this.beatDecay * 0.2 * normalizedData[i];
            const y = height - ((normalizedData[i] * beatScale + animFactor + energyBump) * (height * 0.85));

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        // Gradient for the line based on energy
        const lineGradient = this.ctx.createLinearGradient(0, 0, width, 0);
        lineGradient.addColorStop(0, 'rgba(255, 118, 117, 0.9)');
        lineGradient.addColorStop(centroid, 'rgba(253, 121, 168, 0.9)');
        lineGradient.addColorStop(1, 'rgba(85, 239, 196, 0.9)');

        this.ctx.strokeStyle = lineGradient;
        this.ctx.lineWidth = 2 + this.beatDecay;

        // Add glow effect to the line
        if (this.settings.useGlow) {
            this.ctx.shadowBlur = 8 + (this.beatDecay * 10);
            this.ctx.shadowColor = 'rgba(108, 92, 231, 0.6)';
        }

        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // Draw the centroid marker with enhanced styling
        const centroidX = this.getXPositionForFrequency(
            this.frequencyFromCentroid(centroid),
                                                        width
        );

        // Vertical line at centroid with gradient
        const centroidGradient = this.ctx.createLinearGradient(0, 0, 0, height);
        centroidGradient.addColorStop(0, 'rgba(253, 121, 168, 1)');
        centroidGradient.addColorStop(1, 'rgba(253, 121, 168, 0.3)');

        this.ctx.beginPath();
        this.ctx.moveTo(centroidX, 10);
        this.ctx.lineTo(centroidX, height - 10);
        this.ctx.strokeStyle = centroidGradient;
        this.ctx.lineWidth = 2;

        if (this.settings.useGlow) {
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = 'rgba(253, 121, 168, 0.7)';
        }

        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // Circle at the top of the centroid line with pulse effect
        const pulseSize = 5 + Math.sin(this.animationPhase * 2) + (this.beatDecay * 3);

        this.ctx.beginPath();
        this.ctx.arc(centroidX, 10, pulseSize, 0, Math.PI * 2);
        this.ctx.fillStyle = this.settings.centroidMarkerColor;

        if (this.settings.useGlow) {
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = 'rgba(253, 121, 168, 0.7)';
        }

        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Enhanced label for the centroid
        this.drawEnhancedLabel(
            `${this.frequencyFromCentroid(centroid).toFixed(0)} Hz`,
                               centroidX,
                               30,
                               {
                                   background: this.settings.labelBackground,
                                   color: this.settings.centroidMarkerColor,
                                   fontSize: 12,
                                   padding: 5,
                                   borderColor: 'rgba(253, 121, 168, 0.3)',
                               borderWidth: 1,
                               roundedCorners: true
                               }
        );
    }

    /**
     * Draw the history of centroid values with depth effect
     */
    drawCentroidHistory() {
        const width = this.width;
        const height = this.height;
        const historyLength = this.centroidHistory.length;

        if (historyLength < 2) return;

        // Draw frequency distribution history with depth effect
        if (this.settings.useDepthEffect) {
            // Draw from oldest to newest
            for (let i = 0; i < historyLength - 1; i += 2) {
                const alpha = 0.1 * (i / historyLength); // Older values are more transparent
                const energyData = this.energyHistory[i];

                if (!energyData) continue;

                this.ctx.beginPath();

                for (let j = 0; j < energyData.length / 3; j++) {
                    const x = this.getXPositionForFrequency(
                        this.indexToFrequency(j, energyData.length / 3),
                                                            width
                    );
                    const y = height - (energyData[j] * (height * 0.6));

                    if (j === 0) {
                        this.ctx.moveTo(x, height);
                        this.ctx.lineTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }

                this.ctx.lineTo(width, height);
                this.ctx.closePath();

                // Use a subtle gradient for the history
                const historyGradient = this.ctx.createLinearGradient(0, 0, 0, height);
                historyGradient.addColorStop(0, `rgba(108, 92, 231, ${alpha * 0.6})`);
                historyGradient.addColorStop(1, `rgba(108, 92, 231, 0)`);

                this.ctx.fillStyle = historyGradient;
                this.ctx.fill();
            }
        }

        // Draw a line connecting centroid values with enhanced styling
        this.ctx.beginPath();

        for (let i = 0; i < historyLength; i++) {
            const x = (i / historyLength) * width;
            const y = height - (this.centroidHistory[i] * height * 0.8);

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        // Create gradient for the history line
        const lineGradient = this.ctx.createLinearGradient(0, 0, width, 0);
        lineGradient.addColorStop(0, 'rgba(108, 92, 231, 0.1)');
        lineGradient.addColorStop(1, 'rgba(108, 92, 231, 0.7)');

        this.ctx.strokeStyle = lineGradient;
        this.ctx.lineWidth = 2;

        if (this.settings.useGlow) {
            this.ctx.shadowBlur = 4;
            this.ctx.shadowColor = 'rgba(108, 92, 231, 0.5)';
        }

        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // Add dots at each centroid point
        for (let i = historyLength - 10; i < historyLength; i += 2) {
            if (i >= 0) {
                const x = (i / historyLength) * width;
                const y = height - (this.centroidHistory[i] * height * 0.8);
                const size = 2 * ((i / historyLength) * 1.5);

                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(108, 92, 231, ${i / historyLength})`;
                this.ctx.fill();
            }
        }
    }

    /**
     * Draw frequency labels on the x-axis with improved styling
     */
    drawFrequencyLabels() {
        const width = this.width;
        const height = this.height;

        this.ctx.fillStyle = this.settings.labelColor;
        this.ctx.font = '10px Roboto Mono';
        this.ctx.textAlign = 'center';

        // Calculate Nyquist frequency
        const nyquist = this.analyzer.getSampleRate() / 2;

        // Draw frequency markers with improved styling
        for (const freq of this.frequencyLabels) {
            if (freq <= nyquist) {
                // Position based on logarithmic scale
                const x = this.getXPositionForFrequency(freq, width);

                if (x >= 0 && x <= width) {
                    // Draw marker line
                    this.ctx.fillStyle = this.settings.gridColor;
                    this.ctx.fillRect(x, height - 15, 1, 5);

                    // Draw label text
                    let label = this.formatFrequency(freq);
                    this.ctx.fillStyle = this.settings.labelColor;
                    this.ctx.fillText(label, x, height - 4);
                }
            }
        }
    }

    /**
     * Draw metrics at the top of the visualization with enhanced styling
     * @param {Object} features - Audio features
     */
    drawMetrics(features) {
        const width = this.width;
        const centroidFreq = this.frequencyFromCentroid(this.smoothedCentroid);

        // Create background for metrics area
        this.ctx.fillStyle = 'rgba(26, 26, 38, 0.7)';
        this.ctx.fillRect(10, 10, width - 20, 30);
        this.ctx.strokeStyle = 'rgba(108, 92, 231, 0.3)';
        this.ctx.strokeRect(10, 10, width - 20, 30);

        // Display centroid value with enhanced styling
        this.drawEnhancedLabel(
            `Centroïde: ${centroidFreq.toFixed(0)} Hz`,
                               width / 2,
                               25,
                               {
                                   align: 'center',
                                   color: this.settings.highlightColor,
                                   fontSize: 12,
                                   noBackground: true,
                                   bold: true
                               }
        );

        // Create background for band energies
        this.ctx.fillStyle = 'rgba(15, 15, 23, 0.5)';
        this.ctx.fillRect(10, 45, width - 20, 25);

        // Display frequency band energies with improved visual feedback
        const bandWidth = (width - 40) / 3;

        // Bass energy
        const bassColor = features.bassEnergy > 0.5 ?
        `rgba(255, 118, 117, ${0.5 + features.bassEnergy * 0.5})` :
        'rgba(255, 118, 117, 0.5)';

        this.ctx.fillStyle = bassColor;
        this.ctx.fillRect(20, 50, bandWidth * features.bassEnergy, 15);

        this.drawEnhancedLabel(
            `Graves: ${features.bassEnergy.toFixed(2)}`,
                               20 + (bandWidth / 2),
                               60,
                               {
                                   align: 'center',
                                   color: 'rgba(255, 255, 255, 0.9)',
                               fontSize: 10,
                               noBackground: true,
                               bold: features.bassEnergy > 0.5
                               }
        );

        // Mid energy
        const midColor = features.combinedMidEnergy > 0.5 ?
        `rgba(253, 121, 168, ${0.5 + features.combinedMidEnergy * 0.5})` :
        'rgba(253, 121, 168, 0.5)';

        this.ctx.fillStyle = midColor;
        this.ctx.fillRect(20 + bandWidth, 50, bandWidth * features.combinedMidEnergy, 15);

        this.drawEnhancedLabel(
            `Médiums: ${features.combinedMidEnergy.toFixed(2)}`,
                               20 + bandWidth + (bandWidth / 2),
                               60,
                               {
                                   align: 'center',
                                   color: 'rgba(255, 255, 255, 0.9)',
                               fontSize: 10,
                               noBackground: true,
                               bold: features.combinedMidEnergy > 0.5
                               }
        );

        // Treble energy
        const trebleColor = features.trebleEnergy > 0.5 ?
        `rgba(85, 239, 196, ${0.5 + features.trebleEnergy * 0.5})` :
        'rgba(85, 239, 196, 0.5)';

        this.ctx.fillStyle = trebleColor;
        this.ctx.fillRect(20 + bandWidth * 2, 50, bandWidth * features.trebleEnergy, 15);

        this.drawEnhancedLabel(
            `Aigus: ${features.trebleEnergy.toFixed(2)}`,
                               20 + bandWidth * 2 + (bandWidth / 2),
                               60,
                               {
                                   align: 'center',
                                   color: 'rgba(255, 255, 255, 0.9)',
                               fontSize: 10,
                               noBackground: true,
                               bold: features.trebleEnergy > 0.5
                               }
        );
    }

    /**
     * Draw an enhanced label with various styling options
     * @param {string} text - Label text
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - Styling options
     */
    drawEnhancedLabel(text, x, y, options = {}) {
        const defaults = {
            align: 'center',
            color: this.settings.labelColor,
            background: null,
            fontSize: 10,
            padding: 4,
            borderColor: null,
            borderWidth: 0,
            roundedCorners: false,
            noBackground: false,
            bold: false
        };

        const opts = { ...defaults, ...options };

        this.ctx.save();
        this.ctx.font = `${opts.bold ? 'bold ' : ''}${opts.fontSize}px Roboto Mono`;
        this.ctx.textAlign = opts.align;

        // Calculate text dimensions
        const metrics = this.ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = opts.fontSize;

        // Calculate background dimensions and position
        let bgX, bgWidth;

        if (opts.align === 'center') {
            bgX = x - (textWidth / 2) - opts.padding;
            bgWidth = textWidth + (opts.padding * 2);
        } else if (opts.align === 'left') {
            bgX = x - opts.padding;
            bgWidth = textWidth + (opts.padding * 2);
        } else {
            bgX = x - textWidth - opts.padding;
            bgWidth = textWidth + (opts.padding * 2);
        }

        const bgY = y - textHeight - opts.padding;
        const bgHeight = textHeight + (opts.padding * 2);

        // Draw background if not disabled
        if (!opts.noBackground && opts.background) {
            this.ctx.fillStyle = opts.background;

            if (opts.roundedCorners) {
                this.roundRect(bgX, bgY, bgWidth, bgHeight, 3);
                this.ctx.fill();
            } else {
                this.ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
            }

            // Draw border if specified
            if (opts.borderColor && opts.borderWidth > 0) {
                this.ctx.strokeStyle = opts.borderColor;
                this.ctx.lineWidth = opts.borderWidth;

                if (opts.roundedCorners) {
                    this.roundRect(bgX, bgY, bgWidth, bgHeight, 3);
                    this.ctx.stroke();
                } else {
                    this.ctx.strokeRect(bgX, bgY, bgWidth, bgHeight);
                }
            }
        }

        // Draw text
        this.ctx.fillStyle = opts.color;

        // Add glow effect for emphasis if bold
        if (opts.bold && this.settings.useGlow) {
            this.ctx.shadowBlur = 4;
            this.ctx.shadowColor = opts.color;
        }

        this.ctx.fillText(text, x, y);
        this.ctx.restore();
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

    /**
     * Calculate x position for a given frequency using improved logarithmic scale
     * @param {number} freq - Frequency in Hz
     * @param {number} width - Canvas width
     * @returns {number} X position
     */
    getXPositionForFrequency(freq, width) {
        // Logarithmic mapping from 20Hz-20kHz to 0-width
        const minFreq = 20;
        const maxFreq = 20000;

        const normPosition = Math.log10(freq / minFreq) / Math.log10(maxFreq / minFreq);
        return normPosition * width;
    }

    /**
     * Convert an array index to a frequency value
     * @param {number} index - Array index
     * @param {number} length - Array length
     * @returns {number} Frequency in Hz
     */
    indexToFrequency(index, length) {
        const nyquist = this.analyzer.getSampleRate() / 2;
        // Using sqrt scale for better visual distribution
        return 20 * Math.pow(nyquist / 20, index / length);
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

    /**
     * Format frequency value for display
     * @param {number} freq - Frequency in Hz
     * @returns {string} Formatted frequency
     */
    formatFrequency(freq) {
        if (freq >= 1000) {
            return `${(freq / 1000).toFixed(freq >= 10000 ? 0 : 1)}k`;
        }
        return `${freq}`;
    }
}

// Register this visualizer type
if (!window.visualizers) {
    window.visualizers = {};
}

window.visualizers.centroidVisualizer = (canvas) =>
new CentroidVisualizer(canvas, audioAnalyzer, audioProcessor);
