/**
 * abstract-art.js - Abstract art visualization
 * Creates abstract art based on audio analysis with customizable mappings
 */

class AbstractArtVisualizer extends Visualizer {
    constructor(canvas, analyzer, processor) {
        super(canvas, analyzer, processor);

        // Specific settings for abstract art visualization
        this.settings = {
            ...this.settings,
            backgroundColor: 'rgba(15, 15, 30, 0.2)',
            styleType: 'mondrian', // 'mondrian', 'kandinsky', 'minimal'

            // Mapping settings (defines which audio features control visual elements)
            colorMapping: 'bass',     // Options: 'bass', 'mid', 'treble', 'centroid', 'energy', 'static'
            sizeMapping: 'energy',    // Options: 'energy', 'bass', 'mid', 'treble', 'flux', 'static'
            positionMapping: 'flux',  // Options: 'flux', 'centroid', 'bass', 'mid', 'treble', 'static'

            // Animation settings
            animationSpeed: 0.03,     // Reduced for less CPU usage
            reactivityFactor: 2.0,    // Default reactivity (user controllable)
            cpuSensitivity: 0.7,      // New parameter for CPU usage control (0.1-1.0)
            shapesCount: 10,          // Reduced from 15 for better performance
            maxHistory: 5,            // Reduced from 10 for better performance

            // Static values (used when mapping is set to 'static')
            staticColorValue: 0.5,
            staticSizeValue: 0.5,
            staticPositionXValue: 0.5,
            staticPositionYValue: 0.5,

            // Style-specific settings
            mondrianColors: ['#D40000', '#002FA7', '#FFDC00', '#FFFFFF', '#000000'],
            kandinskyColors: ['#FF5555', '#FFCC00', '#55AAFF', '#AA66CC', '#FFFFFF'],
            minimalColors: ['#000000', '#FFFFFF', '#AAAAAA']
        };

        // Initialize shapes for animation
        this.shapes = [];
        this.initializeShapes();

        // Keep history of movements for smoother animations
        this.history = {
            color: 0,
            size: 0,
            positionX: 0,
            positionY: 0
        };

        // Audio reactivity parameters
        this.reactivity = {
            peakDetected: false,
            lastPeakTime: 0,
            lastColorChangeTime: 0,
            colorChangeCooldown: 100, // ms
            currentBoostFactor: 1.0
        };
    }

    /**
     * Initialize shape objects based on the selected style
     */
    initializeShapes() {
        this.shapes = [];

        const count = this.settings.shapesCount;

        // Create different shapes based on style type
        switch (this.settings.styleType) {
            case 'mondrian':
                // Create rectangles for Mondrian style
                for (let i = 0; i < count; i++) {
                    const width = 20 + Math.random() * 150;
                    const height = 20 + Math.random() * 150;

                    this.shapes.push({
                        type: 'rect',
                        x: Math.random() * this.width,
                        y: Math.random() * this.height,
                        width: width,
                        height: height,
                        baseWidth: width,   // Store original size for scaling reference
                        baseHeight: height,
                        color: this.getRandomColor(),
                        strokeWidth: 6,
                        rotation: (Math.random() - 0.5) * 0.2, // Slight random rotation
                        opacity: 0.7 + Math.random() * 0.3,
                        size: 0.5 + Math.random() * 0.5,
                        directionX: Math.random() - 0.5,  // For bounce effects
                        directionY: Math.random() - 0.5
                    });
                }
                break;

            case 'kandinsky':
                // Create circles and lines for Kandinsky style
                for (let i = 0; i < count; i++) {
                    const isCircle = Math.random() > 0.3;

                    if (isCircle) {
                        const radius = 10 + Math.random() * 50;

                        this.shapes.push({
                            type: 'circle',
                            x: Math.random() * this.width,
                            y: Math.random() * this.height,
                            radius: radius,
                            baseRadius: radius,  // Store original radius
                            color: this.getRandomColor(),
                            strokeWidth: 2 + Math.random() * 4,
                            rotation: Math.random() * Math.PI * 2,  // Full rotation range
                            opacity: 0.6 + Math.random() * 0.4,
                            size: 0.5 + Math.random() * 0.5,
                            directionX: Math.random() - 0.5,
                            directionY: Math.random() - 0.5
                        });
                    } else {
                        const startX = Math.random() * this.width;
                        const startY = Math.random() * this.height;
                        const endX = startX + (Math.random() - 0.5) * 200;
                        const endY = startY + (Math.random() - 0.5) * 200;

                        this.shapes.push({
                            type: 'line',
                            x: startX,
                            y: startY,
                            endX: endX,
                            endY: endY,
                            baseEndX: endX,  // Store original endpoints
                            baseEndY: endY,
                            color: this.getRandomColor(),
                            strokeWidth: 1 + Math.random() * 5,
                            rotation: Math.random() * Math.PI * 2,
                            opacity: 0.6 + Math.random() * 0.4,
                            size: 0.5 + Math.random() * 0.5,
                            directionX: Math.random() - 0.5,
                            directionY: Math.random() - 0.5
                        });
                    }
                }
                break;

            case 'minimal':
            default:
                // Create simple shapes for minimal style
                for (let i = 0; i < count; i++) {
                    const shape = Math.random() > 0.5 ? 'rect' : 'circle';

                    if (shape === 'rect') {
                        const width = 10 + Math.random() * 80;
                        const height = 10 + Math.random() * 80;

                        this.shapes.push({
                            type: 'rect',
                            x: Math.random() * this.width,
                            y: Math.random() * this.height,
                            width: width,
                            height: height,
                            baseWidth: width,
                            baseHeight: height,
                            color: this.getRandomColor(),
                            strokeWidth: 0, // No stroke for minimal
                            rotation: Math.random() * Math.PI * 2,
                            opacity: 0.5 + Math.random() * 0.5,
                            size: 0.5 + Math.random() * 0.5,
                            directionX: Math.random() - 0.5,
                            directionY: Math.random() - 0.5
                        });
                    } else {
                        const radius = 5 + Math.random() * 40;

                        this.shapes.push({
                            type: 'circle',
                            x: Math.random() * this.width,
                            y: Math.random() * this.height,
                            radius: radius,
                            baseRadius: radius,
                            color: this.getRandomColor(),
                            strokeWidth: 0,
                            rotation: 0,
                            opacity: 0.5 + Math.random() * 0.5,
                            size: 0.5 + Math.random() * 0.5,
                            directionX: Math.random() - 0.5,
                            directionY: Math.random() - 0.5
                        });
                    }
                }
                break;
        }

        // Add some small particles for additional visual interest
        const particleCount = Math.floor(count / 2);
        for (let i = 0; i < particleCount; i++) {
            const radius = 1 + Math.random() * 3;

            this.shapes.push({
                type: 'circle',
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: radius,
                baseRadius: radius,
                color: this.getRandomColor(),
                strokeWidth: 0,
                opacity: 0.3 + Math.random() * 0.3,
                size: 0.5 + Math.random() * 0.5,
                directionX: (Math.random() - 0.5) * 2,  // Faster movement
                directionY: (Math.random() - 0.5) * 2,
                isParticle: true  // Flag as particle for special handling
            });
        }
    }

    /**
     * Get a random color based on the selected style
     * @returns {string} CSS color
     */
    getRandomColor() {
        let colors;

        switch (this.settings.styleType) {
            case 'mondrian':
                colors = this.settings.mondrianColors;
                break;
            case 'kandinsky':
                colors = this.settings.kandinskyColors;
                break;
            case 'minimal':
            default:
                colors = this.settings.minimalColors;
                break;
        }

        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Draw the abstract art visualization
     * @param {Object} features - Audio features from processor
     */
    draw(features) {
        this.clear();

        if (!features) return;

        // Update visual parameters based on audio features and mappings
        this.updateVisualsFromAudio(features);

        // Draw all shapes
        this.shapes.forEach(shape => {
            this.drawShape(shape);
        });

        // Draw mapping info if labels are enabled
        if (this.settings.showLabels) {
            this.drawMappingInfo();
        }
    }

    /**
     * Update visual parameters based on audio features and current mappings
     * @param {Object} features - Audio features
     */
    updateVisualsFromAudio(features) {
        const now = this.analyzer.getCurrentTime();

        // Extract relevant features based on mappings
        const colorValue = this.getFeatureValue(features, this.settings.colorMapping);
        const sizeValue = this.getFeatureValue(features, this.settings.sizeMapping);
        const positionValue = this.getFeatureValue(features, this.settings.positionMapping);

        // Detect audio energy peaks for enhanced reactivity - with lower threshold to reduce nervousness
        const peakThreshold = 0.8; // Increased threshold (was 0.7)
        const fluxThreshold = 0.2; // Increased threshold (was 0.15)

        // Check if we're in a peak with reduced sensitivity
        if (features.spectralFlux > fluxThreshold || features.bassEnergy > peakThreshold) {
            // Apply CPU sensitivity control - only register peak if we haven't had one recently
            const peakCooldown = 200; // ms between peaks - increased for less CPU usage
            const timeSinceLastPeak = now - this.reactivity.lastPeakTime;

            if (timeSinceLastPeak > peakCooldown) {
                this.reactivity.peakDetected = true;
                this.reactivity.lastPeakTime = now;

                // Boost reactivity factor when peak is detected - reduced for less nervousness
                this.reactivity.currentBoostFactor = 1.5 + (features.bassEnergy * 2.0);
            }
        } else {
            // Gradually return to normal reactivity
            const timeSincePeak = now - this.reactivity.lastPeakTime;
            if (timeSincePeak > 500) { // 500ms cooldown
                this.reactivity.peakDetected = false;
                this.reactivity.currentBoostFactor = Math.max(1.0, this.reactivity.currentBoostFactor * 0.95);
            }
        }

        // Calculate reactivity multiplier with CPU sensitivity scaling
        const cpuSensitivity = this.settings.cpuSensitivity || 0.7; // Default to moderate sensitivity
        const reactivityMultiplier = this.settings.reactivityFactor *
                                    this.reactivity.currentBoostFactor *
                                    cpuSensitivity;

        // Apply different smoothing based on whether we're at a peak
        const colorSmoothing = this.reactivity.peakDetected ? 0.6 : 0.85;  // Increased for less nervousness
        const sizeSmoothing = this.reactivity.peakDetected ? 0.4 : 0.8;    // Increased for less nervousness
        const positionSmoothing = this.reactivity.peakDetected ? 0.7 : 0.92; // Increased for less nervousness

        // Add to history with smoothing
        this.history.color = this.history.color * colorSmoothing + colorValue * (1 - colorSmoothing);
        this.history.size = this.history.size * sizeSmoothing + sizeValue * (1 - sizeSmoothing);
        this.history.positionX = this.history.positionX * positionSmoothing + features.spectralCentroid * (1 - positionSmoothing);
        this.history.positionY = this.history.positionY * positionSmoothing + positionValue * (1 - positionSmoothing);

        // Performance optimization: only update a subset of shapes each frame
        // This significantly reduces CPU usage
        const updateRatio = this.settings.cpuSensitivity || 0.7; // Portion of shapes to update each frame
        const shapesToUpdate = Math.max(1, Math.floor(this.shapes.length * updateRatio));
        const startIndex = Math.floor(Math.random() * (this.shapes.length - shapesToUpdate));

        // Update a subset of shapes based on audio features
        for (let i = startIndex; i < startIndex + shapesToUpdate; i++) {
            if (i >= this.shapes.length) break;

            const shape = this.shapes[i];
            const index = i % this.shapes.length;

            // Skip updating some particles for better performance
            if (shape.isParticle && Math.random() > 0.3) continue;

            // Individualize movement for each shape based on its index
            const individualFactor = 0.5 + (index / this.shapes.length) * 1.5;

            // Update position with reduced reactivity
            const posXDelta = (this.history.positionX - 0.5) * this.settings.animationSpeed * 15 * reactivityMultiplier * individualFactor;
            const posYDelta = (this.history.positionY - 0.5) * this.settings.animationSpeed * 15 * reactivityMultiplier * individualFactor;

            // Reduced randomness for less CPU usage and nervousness
            const randomFactor = this.reactivity.peakDetected ? 0.05 : 0.005;
            const randomX = (Math.random() - 0.5) * randomFactor * reactivityMultiplier;
            const randomY = (Math.random() - 0.5) * randomFactor * reactivityMultiplier;

            // Apply movement
            shape.x += posXDelta + randomX * this.width;
            shape.y += posYDelta + randomY * this.height;

            // Apply rotation based on energy - with reduced intensity
            if (shape.rotation !== undefined) {
                const rotationSpeed = features.totalEnergy * this.settings.animationSpeed * 3 * reactivityMultiplier;
                shape.rotation += rotationSpeed * (index % 2 === 0 ? 1 : -1) * 0.7; // 70% intensity
            }

            // Simplified boundary checks for better performance
            const buffer = 50; // Reduced buffer size
            if (shape.x < -buffer) shape.x = this.width + buffer / 2;
            if (shape.x > this.width + buffer) shape.x = -buffer / 2;
            if (shape.y < -buffer) shape.y = this.height + buffer / 2;
            if (shape.y > this.height + buffer) shape.y = -buffer / 2;

            // Update size based on mapping - with smoother transitions
            let sizeFactor = 0.9 + (this.history.size * 0.4 * reactivityMultiplier);

            // Smaller pulse size for better performance
            if (this.reactivity.peakDetected) {
                sizeFactor *= 1.1; // Reduced from 1.2
            }

            if (shape.type === 'rect') {
                // Target width and height with smoother transitions
                const targetWidth = shape.baseWidth * sizeFactor;
                const targetHeight = shape.baseHeight * sizeFactor;

                // Smoother interpolation for less CPU usage
                shape.width = shape.width * 0.9 + targetWidth * 0.1;
                shape.height = shape.height * 0.9 + targetHeight * 0.1;

                // Prevent shapes from getting too large or too small
                shape.width = Math.max(5, Math.min(200, shape.width));
                shape.height = Math.max(5, Math.min(200, shape.height));
            } else if (shape.type === 'circle') {
                // Target radius with smoother transition
                const targetRadius = shape.baseRadius * sizeFactor;

                // Smoother interpolation
                shape.radius = shape.radius * 0.9 + targetRadius * 0.1;
                shape.radius = Math.max(2, Math.min(100, shape.radius));
            } else if (shape.type === 'line') {
                // Keep original endpoint and scale from the start point
                const dx = shape.baseEndX - shape.x;
                const dy = shape.baseEndY - shape.y;

                // Smoother transition for lines
                const currentDx = shape.endX - shape.x;
                const currentDy = shape.endY - shape.y;
                const targetDx = dx * sizeFactor;
                const targetDy = dy * sizeFactor;

                shape.endX = shape.x + currentDx * 0.9 + targetDx * 0.1;
                shape.endY = shape.y + currentDy * 0.9 + targetDy * 0.1;
            }

            // Update opacity based on energy - smoother changes
            const targetOpacity = 0.3 + features.totalEnergy * 0.6;
            shape.opacity = shape.opacity * 0.9 + targetOpacity * 0.1;

            // Change colors less frequently - improves performance significantly
            const colorChangeCooldown = 500; // ms between color changes - increased from 200
            const timeSinceColorChange = now - (shape.lastColorChange || 0);

            // Reduce frequency of color changes based on CPU sensitivity
            const colorChangeChance = features.spectralFlux * 0.3 * this.settings.cpuSensitivity;
            const shouldChangeColor = this.reactivity.peakDetected &&
                                    Math.random() < colorChangeChance &&
                                    timeSinceColorChange > colorChangeCooldown;

            if (shouldChangeColor) {
                shape.color = this.getRandomColor();
                shape.lastColorChange = now;
            }

            // Simplified stroke for better performance - no stroke by default unless at peak
            shape.strokeWidth = this.reactivity.peakDetected && !shape.isParticle ?
                              1 + features.bassEnergy * 2 :
                              0;
        }
    }

    /**
     * Get the value of a specific audio feature
     * @param {Object} features - Audio features
     * @param {string} featureType - Type of feature to extract
     * @returns {number} Feature value (0-1)
     */
    getFeatureValue(features, featureType) {
        switch (featureType) {
            case 'bass':
                return features.bassEnergy;
            case 'mid':
                return features.midEnergy;
            case 'treble':
                return features.trebleEnergy;
            case 'centroid':
                return features.spectralCentroid;
            case 'flux':
                return features.spectralFlux;
            case 'static':
                // Return the appropriate static value based on context
                if (featureType === this.settings.colorMapping) {
                    return this.settings.staticColorValue;
                } else if (featureType === this.settings.sizeMapping) {
                    return this.settings.staticSizeValue;
                } else if (featureType === this.settings.positionMapping) {
                    // For position, we might need X or Y
                    return 0.5; // Default static position center
                }
                return 0.5; // Default static value
            case 'energy':
            default:
                return features.totalEnergy;
        }
    }

    /**
     * Draw a shape based on its properties
     * @param {Object} shape - Shape properties
     */
    drawShape(shape) {
        this.ctx.save();

        // Apply opacity
        this.ctx.globalAlpha = shape.opacity;

        // Skip shadow effects for better performance
        // Only apply simple effects to avoid CPU overload

        // Apply rotation if applicable
        if (shape.rotation) {
            this.ctx.translate(shape.x, shape.y);
            this.ctx.rotate(shape.rotation);
            this.ctx.translate(-shape.x, -shape.y);
        }

        // Set fill and stroke styles
        this.ctx.fillStyle = shape.color;

        // Apply stroke only if explicitly set and greater than 0
        if (shape.strokeWidth && shape.strokeWidth > 0) {
            // Simplified stroke styling for performance
            this.ctx.strokeStyle = this.settings.styleType === 'mondrian' ?
                                 '#000000' :
                                 'rgba(0, 0, 0, 0.7)';
            this.ctx.lineWidth = shape.strokeWidth;
        }

        // Skip compositioning for better performance

        // Draw the shape based on its type
        switch (shape.type) {
            case 'rect':
                // Simplified rectangle drawing
                this.ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
                if (shape.strokeWidth && shape.strokeWidth > 0) {
                    this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                }
                break;

            case 'circle':
                this.ctx.beginPath();
                this.ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
                this.ctx.fill();
                if (shape.strokeWidth && shape.strokeWidth > 0) {
                    this.ctx.stroke();
                }
                break;

            case 'line':
                this.ctx.beginPath();
                this.ctx.moveTo(shape.x, shape.y);
                this.ctx.lineTo(shape.endX, shape.endY);
                this.ctx.lineWidth = shape.strokeWidth;
                this.ctx.stroke();
                break;
        }

        this.ctx.restore();
    }

    /**
     * Draw a rectangle with rounded corners
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     * @param {number} radius - Corner radius
     */
    drawRoundedRect(x, y, width, height, radius) {
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
     * Get a contrasting color to the given color
     * @param {string} color - CSS color string
     * @returns {string} Contrasting color
     */
    getContrastingColor(color) {
        // Simple hue shift for basic color contrast
        if (color.startsWith('#')) {
            // Convert hex to RGB
            const r = parseInt(color.slice(1, 3), 16) / 255;
            const g = parseInt(color.slice(3, 5), 16) / 255;
            const b = parseInt(color.slice(5, 7), 16) / 255;

            // Find the hue
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0; // achromatic
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }

                h /= 6;
            }

            // Shift the hue by 180 degrees
            h = (h + 0.5) % 1;

            // Convert back to hex
            const toRGB = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            const rgb = [
                Math.round(toRGB(p, q, h + 1/3) * 255),
                Math.round(toRGB(p, q, h) * 255),
                Math.round(toRGB(p, q, h - 1/3) * 255)
            ];

            return `#${rgb[0].toString(16).padStart(2, '0')}${rgb[1].toString(16).padStart(2, '0')}${rgb[2].toString(16).padStart(2, '0')}`;
        }

        // Default contrast for non-hex colors
        return color === '#000000' ? '#FFFFFF' : '#000000';
    }

    /**
     * Draw mapping information
     */
    drawMappingInfo() {
        const padding = 15;
        const boxWidth = 180;
        const boxHeight = 100;
        const x = this.width - boxWidth - padding;
        const y = padding;

        // Draw semi-transparent background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(x, y, boxWidth, boxHeight);

        // Draw mapping info
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '12px Roboto Mono';
        this.ctx.textAlign = 'left';

        this.ctx.fillText(`Style: ${this.settings.styleType}`, x + 10, y + 20);
        this.ctx.fillText(`Couleur ← ${this.settings.colorMapping}`, x + 10, y + 40);
        this.ctx.fillText(`Taille ← ${this.settings.sizeMapping}`, x + 10, y + 60);
        this.ctx.fillText(`Position ← ${this.settings.positionMapping}`, x + 10, y + 80);
    }

    /**
     * Update visualizer settings
     * @param {Object} settings - New settings
     */
    updateSettings(settings) {
        const oldStyleType = this.settings.styleType;
        super.updateSettings(settings);

        // Reinitialize shapes if style type changed
        if (settings.styleType && settings.styleType !== oldStyleType) {
            this.initializeShapes();
        }
    }
}

// Register this visualizer type
if (!window.visualizers) {
    window.visualizers = {};
}

window.visualizers.abstractArt = (canvas) =>
    new AbstractArtVisualizer(canvas, audioAnalyzer, audioProcessor);
