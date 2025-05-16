/**
 * frequency-bars.js - Enhanced Frequency spectrum visualization
 * Displays the frequency domain data as a modern bar graph with improved aesthetics
 */

class FrequencyBarsVisualizer extends Visualizer {
    constructor(canvas, analyzer, processor) {
        super(canvas, analyzer, processor);

        // Enhanced settings for frequency visualization
        this.settings = {
            ...this.settings,
            barSpacing: 1,
            useLogScale: true,
            logBase: 1.03, // Slightly increased for better low-frequency representation
            maxBarHeight: 0,  // Will be calculated in draw()
            showFrequencyLabels: true,
            showFrequencyGrid: true,
            // Updated color scheme to match the new design aesthetic
            bassColor: 'rgb(255, 118, 117)', // Red-pink
            midColor: 'rgb(253, 121, 168)',  // Pink
            trebleColor: 'rgb(85, 239, 196)', // Teal
            gridColor: 'rgba(108, 92, 231, 0.15)', // Subtle purple
            labelColor: 'rgba(245, 245, 247, 0.8)', // Light text color
            // Frequency bands cutoffs and labels
            bassRange: 0.1,    // First 10% of visible bins are bass
            midRange: 0.45,    // Next 35% are mids
            frequencyLabels: [20, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 20000],
            // Animation properties
            animationSpeed: 0.05,
            useAnimation: true,
            // Beat detection response
            beatResponse: false,
            // Visualization style
            barStyle: 'pill', // 'flat', 'rounded', or 'pill'
            // Performance settings
            highQuality: true  // Set to false for better performance
        };

        // State variables
        this.animationPhase = 0;
        this.beatActive = false;
        this.beatDecay = 0;
        this.previousBars = null; // Store previous bar heights for smooth transitions

        // Listen for beat events
        document.addEventListener('beat-detected', () => {
            if (this.settings.beatResponse) {
                this.beatActive = true;
                this.beatDecay = 1.0;
            }
        });
    }

    /**
     * Draw the frequency spectrum visualization with enhanced aesthetics
     * @param {Object} features - Audio features from processor
     */
    draw(features) {
        this.clear();

        if (!features) return;

        const frequencyData = this.analyzer.getFrequencyData();
        if (!frequencyData) return;

        // Update animation phase
        if (this.settings.useAnimation) {
            this.animationPhase = (this.animationPhase + this.settings.animationSpeed) % (Math.PI * 2);
        }

        // Update beat decay
        if (this.beatDecay > 0) {
            this.beatDecay *= 0.92; // Slightly faster decay than centroid
            if (this.beatDecay < 0.01) this.beatDecay = 0;
        }

        // Get actual dimensions
        this.settings.maxBarHeight = this.height - 30; // Space for labels

        // Calculate bar width based on visible frequency range (1/3 of total for better performance)
        const visibleBins = Math.min(frequencyData.length, Math.floor(frequencyData.length / 3));
        const barWidth = Math.max(2, (this.width / visibleBins) - this.settings.barSpacing);

        // Reference to sample rate
        const sampleRate = this.analyzer.getSampleRate();
        const nyquist = sampleRate / 2;

        // Initialize arrays for current bar heights if not yet created
        if (!this.previousBars || this.previousBars.length !== visibleBins) {
            this.previousBars = new Array(visibleBins).fill(0);
        }

        // Draw grid if enabled
        if (this.settings.showFrequencyGrid) {
            this.drawFrequencyGrid(nyquist);
        }

        // Prepare bar heights array for this frame
        const currentBars = new Array(visibleBins);

        // First pass - calculate all bar heights
        for (let i = 0; i < visibleBins; i++) {
            // Calculate index with improved logarithmic scaling
            let binIndex = i;
            if (this.settings.useLogScale) {
                binIndex = Math.min(
                    frequencyData.length - 1,
                    Math.round(
                        (Math.pow(this.settings.logBase, i) - 1) /
                        (Math.pow(this.settings.logBase, visibleBins) - 1) * visibleBins
                    )
                );
            }

            // Get normalized amplitude (0-1)
            const value = frequencyData[binIndex] / 255;

            // Add subtle animation to bar heights based on their position
            let animatedValue = value;
            if (this.settings.useAnimation) {
                const animFactor = Math.sin(this.animationPhase + (i / visibleBins) * Math.PI * 4) * 0.03;
                animatedValue = Math.max(0, value + animFactor);
            }

            // Apply beat response if active
            if (this.beatActive && this.beatDecay > 0) {
                // More pronounced effect on lower frequencies
                const beatFactor = this.beatDecay * (1 - (i / visibleBins) * 0.7);
                animatedValue = Math.min(1, animatedValue * (1 + beatFactor * 0.3));
            }

            // Apply smoothing with previous frame
            let smoothedValue = animatedValue;
            if (this.previousBars[i] !== undefined) {
                // Rising values approach faster than falling values
                const smoothFactor = animatedValue > this.previousBars[i] ? 0.6 : 0.85;
                smoothedValue = this.previousBars[i] * smoothFactor + animatedValue * (1 - smoothFactor);
            }

            // Store the current bar height
            currentBars[i] = smoothedValue;

            // Calculate final bar height
            const barHeight = smoothedValue * this.settings.maxBarHeight;

            // Calculate bar position
            const x = i * (barWidth + this.settings.barSpacing);
            const y = this.height - barHeight - 20; // Leave space for labels

            // Determine color based on frequency range
            let barColor;
            if (i < visibleBins * this.settings.bassRange) {
                barColor = this.settings.bassColor;
            } else if (i < visibleBins * this.settings.midRange) {
                barColor = this.settings.midColor;
            } else {
                barColor = this.settings.trebleColor;
            }

            // Create gradient fill
            const gradient = this.ctx.createLinearGradient(0, y, 0, this.height - 20);

            // Enhanced gradient for more depth
            if (this.settings.highQuality) {
                gradient.addColorStop(0, barColor);
                gradient.addColorStop(0.4, barColor);
                gradient.addColorStop(1, 'rgba(30, 30, 45, 0.4)');
            } else {
                gradient.addColorStop(0, barColor);
                gradient.addColorStop(1, 'rgba(30, 30, 45, 0.4)');
            }

            // Draw bar with selected style
            this.ctx.fillStyle = gradient;

            if (this.settings.barStyle === 'rounded') {
                // Rounded top bars
                this.roundedBar(x, y, barWidth, barHeight);
            } else if (this.settings.barStyle === 'pill') {
                // Pill-shaped bars
                this.pillBar(x, y, barWidth, barHeight);
            } else {
                // Default flat bars
                this.ctx.fillRect(x, y, barWidth, barHeight);
            }

            // Add subtle border for better definition
            if (this.settings.highQuality && barHeight > 2) {
                this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                this.ctx.lineWidth = 0.5;

                if (this.settings.barStyle === 'rounded') {
                    this.roundedBar(x, y, barWidth, barHeight, true);
                } else if (this.settings.barStyle === 'pill') {
                    this.pillBar(x, y, barWidth, barHeight, true);
                } else {
                    this.ctx.strokeRect(x, y, barWidth, barHeight);
                }
            }
        }

        // Store the current bars for the next frame
        this.previousBars = currentBars;

        // Draw frequency range indicators
        this.drawFrequencyRangeIndicators(visibleBins, barWidth);

        // Draw frequency labels if enabled
        if (this.settings.showFrequencyLabels) {
            this.drawFrequencyLabels(nyquist);
        }

        // Add beat visual indicator if active
        if (this.beatActive && this.beatDecay > 0.1) {
            this.drawBeatIndicator();
        }
    }

    /**
     * Draw a rounded top bar
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Bar width
     * @param {number} height - Bar height
     * @param {boolean} strokeOnly - Whether to stroke instead of fill
     */
    roundedBar(x, y, width, height, strokeOnly = false) {
        if (height <= 0) return;

        const radius = Math.min(width / 2, 4);

        this.ctx.beginPath();

        // Bottom corners
        this.ctx.moveTo(x, y + height);
        this.ctx.lineTo(x + width, y + height);

        // Right side
        this.ctx.lineTo(x + width, y + radius);

        // Top right corner
        this.ctx.quadraticCurveTo(x + width, y, x + width - radius, y);

        // Top
        this.ctx.lineTo(x + radius, y);

        // Top left corner
        this.ctx.quadraticCurveTo(x, y, x, y + radius);

        // Close the path
        this.ctx.closePath();

        if (strokeOnly) {
            this.ctx.stroke();
        } else {
            this.ctx.fill();
        }
    }

    /**
     * Draw a pill-shaped bar
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Bar width
     * @param {number} height - Bar height
     * @param {boolean} strokeOnly - Whether to stroke instead of fill
     */
    pillBar(x, y, width, height, strokeOnly = false) {
        if (height <= 0) return;

        const radius = Math.min(width / 2, height / 2, 4);

        this.ctx.beginPath();

        // Bottom right corner
        this.ctx.moveTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);

        // Bottom
        this.ctx.lineTo(x + radius, y + height);

        // Bottom left corner
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);

        // Left side
        this.ctx.lineTo(x, y + radius);

        // Top left corner
        this.ctx.quadraticCurveTo(x, y, x + radius, y);

        // Top
        this.ctx.lineTo(x + width - radius, y);

        // Top right corner
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);

        // Close the path
        this.ctx.closePath();

        if (strokeOnly) {
            this.ctx.stroke();
        } else {
            this.ctx.fill();
        }
    }

    /**
     * Draw frequency range indicators (bass, mid, treble)
     * @param {number} visibleBins - Number of visible frequency bins
     * @param {number} barWidth - Width of each bar
     */
    drawFrequencyRangeIndicators(visibleBins, barWidth) {
        const ranges = [
            { name: "Graves", end: visibleBins * this.settings.bassRange, color: this.settings.bassColor },
            { name: "Médiums", end: visibleBins * this.settings.midRange, color: this.settings.midColor },
            { name: "Aigus", end: visibleBins, color: this.settings.trebleColor }
        ];

        // Draw subtle background for the labels
        this.ctx.fillStyle = 'rgba(30, 30, 45, 0.4)';
        this.ctx.fillRect(0, this.height - 20, this.width, 20);

        let prevEnd = 0;

        // Draw each range
        for (const range of ranges) {
            const start = prevEnd * (barWidth + this.settings.barSpacing);
            const end = range.end * (barWidth + this.settings.barSpacing);
            const width = end - start;

            // Draw subtle divider lines
            if (prevEnd > 0) {
                this.ctx.fillStyle = 'rgba(245, 245, 247, 0.2)';
                this.ctx.fillRect(start - 1, this.height - 20, 1, 20);
            }

            // Draw label
            this.ctx.fillStyle = range.color;
            this.ctx.font = '10px Roboto Mono';
            this.ctx.textAlign = 'center';
            const labelX = start + (width / 2);
            this.ctx.fillText(range.name, labelX, this.height - 7);

            prevEnd = range.end;
        }
    }

    /**
     * Draw frequency grid for better visualization
     * @param {number} nyquist - Nyquist frequency
     */
    drawFrequencyGrid(nyquist) {
        this.ctx.strokeStyle = this.settings.gridColor;
        this.ctx.lineWidth = 0.5;

        // Horizontal lines (amplitude)
        for (let i = 0.2; i <= 1; i += 0.2) {
            const y = this.height - 20 - (i * (this.height - 20));

            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        // Vertical lines (frequency bands)
        for (const freq of this.settings.frequencyLabels) {
            if (freq <= nyquist) {
                const normPosition = this.logFrequencyPosition(freq, 20, nyquist);
                const x = normPosition * this.width;

                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.height - 20);
                this.ctx.stroke();
            }
        }
    }

    /**
     * Draw frequency labels along the x-axis with improved styling
     * @param {number} nyquist - Nyquist frequency (half the sample rate)
     */
    drawFrequencyLabels(nyquist) {
        this.ctx.fillStyle = this.settings.labelColor;
        this.ctx.font = '9px Roboto Mono';
        this.ctx.textAlign = 'center';

        // Draw labels for selected frequencies
        for (const freq of this.settings.frequencyLabels) {
            if (freq <= nyquist) {
                // Position based on logarithmic scale
                const normPosition = this.logFrequencyPosition(freq, 20, nyquist);
                const x = normPosition * this.width;

                if (x >= 0 && x <= this.width) {
                    // Draw marker line
                    this.ctx.fillRect(x, this.height - 20, 1, 3);

                    // Draw label
                    let label = this.formatFrequency(freq);
                    this.ctx.fillText(label, x, this.height - 7);
                }
            }
        }
    }

    /**
     * Draw a visual indicator when a beat is detected
     */
    drawBeatIndicator() {
        // Draw a subtle flash effect
        this.ctx.fillStyle = `rgba(253, 121, 168, ${this.beatDecay * 0.15})`;
        this.ctx.fillRect(0, 0, this.width, this.height - 20);

        // Add a beat label
        if (this.beatDecay > 0.6) {
            const padding = 5;
            const fontSize = 12;
            const text = "BEAT";

            this.ctx.font = `bold ${fontSize}px Roboto Mono`;
            this.ctx.textAlign = "center";

            // Measure text
            const metrics = this.ctx.measureText(text);
            const textWidth = metrics.width;

            // Background for the beat label
            const bgX = (this.width / 2) - (textWidth / 2) - padding;
            const bgY = 10 - padding;
            const bgWidth = textWidth + (padding * 2);
            const bgHeight = fontSize + (padding * 2);

            // Draw background with animation
            const bgOpacity = this.beatDecay * 0.8;
            this.ctx.fillStyle = `rgba(253, 121, 168, ${bgOpacity})`;
            this.roundRect(bgX, bgY, bgWidth, bgHeight, 4);
            this.ctx.fill();

            // Draw text
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            this.ctx.fillText(text, this.width / 2, 10 + fontSize / 2);
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

    /**
     * Calculate normalized position for frequency on logarithmic scale
     * @param {number} freq - Frequency in Hz
     * @param {number} minFreq - Minimum frequency
     * @param {number} maxFreq - Maximum frequency
     * @returns {number} Normalized position (0-1)
     */
    logFrequencyPosition(freq, minFreq, maxFreq) {
        return Math.log10(freq / minFreq) / Math.log10(maxFreq / minFreq);
    }

    /**
     * Format frequency for display
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

window.visualizers.frequencyBars = (canvas) =>
new FrequencyBarsVisualizer(canvas, audioAnalyzer, audioProcessor);
