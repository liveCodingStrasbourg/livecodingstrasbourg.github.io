/**
 * visualizer.js - Base visualization functionality
 * Provides a common foundation for all visualization types
 */

class Visualizer {
    /**
     * Create a visualizer instance
     * @param {HTMLCanvasElement} canvas - Canvas element to draw on
     * @param {AudioAnalyzer} analyzer - Audio analyzer instance
     * @param {AudioProcessor} processor - Audio processor instance
     */
    constructor(canvas, analyzer, processor) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.analyzer = analyzer;
        this.processor = processor;
        
        // Canvas dimensions
        this.width = 0;
        this.height = 0;
        
        // Default visualization settings
        this.settings = {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            foregroundColor: 'rgb(46, 204, 113)',
            showLabels: true
        };
        
        // Animation frame ID
        this.animationFrameId = null;
        
        // Initialize
        this.setupCanvas();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
        });
    }
    
    /**
     * Set up canvas dimensions and scaling for pixel density
     */
    setupCanvas() {
        // Get actual element dimensions
        const rect = this.canvas.getBoundingClientRect();
        
        // Set device pixel ratio aware dimensions
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // Set dimensions for drawing logic
        this.width = rect.width;
        this.height = rect.height;
        
        // Scale canvas for device pixel ratio
        this.ctx.scale(dpr, dpr);
    }
    
    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Optional background fill
        if (this.settings.backgroundColor) {
            this.ctx.fillStyle = this.settings.backgroundColor;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }
    
    /**
     * Draw visualization (to be implemented by subclasses)
     * @param {Object} features - Audio features from processor
     */
    draw(features) {
        // Base implementation just clears the canvas
        this.clear();
        
        // Subclasses should override this method
        console.warn('Visualizer.draw() called directly. This method should be overridden by subclasses.');
    }
    
    /**
     * Start visualization loop
     */
    start() {
        const loop = () => {
            if (!this.analyzer.isInitialized()) {
                this.animationFrameId = requestAnimationFrame(loop);
                return;
            }
            
            // Get audio features
            const features = this.processor.update();
            
            // Draw visualization
            this.draw(features);
            
            // Continue loop
            this.animationFrameId = requestAnimationFrame(loop);
        };
        
        // Start loop
        loop();
    }
    
    /**
     * Stop visualization loop
     */
    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    /**
     * Update visualizer settings
     * @param {Object} settings - New settings
     */
    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
    }
    
    /**
     * Format frequency value for display
     * @param {number} freq - Frequency in Hz
     * @returns {string} Formatted frequency string
     */
    formatFrequency(freq) {
        return freq < 1000 ? `${freq}` : `${(freq / 1000).toFixed(1)}k`;
    }
    
    /**
     * Draw a text label with optional background
     * @param {string} text - Text to display
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {Object} options - Display options
     */
    drawLabel(text, x, y, options = {}) {
        const defaultOptions = {
            font: '10px Roboto Mono',
            color: 'rgba(255, 255, 255, 0.7)',
            background: null,
            align: 'center',
            baseline: 'middle',
            padding: 2
        };
        
        const opts = { ...defaultOptions, ...options };
        
        this.ctx.font = opts.font;
        this.ctx.textAlign = opts.align;
        this.ctx.textBaseline = opts.baseline;
        
        // Measure text width
        const metrics = this.ctx.measureText(text);
        const textWidth = metrics.width;
        const textHeight = parseInt(opts.font, 10);
        
        // Draw background if specified
        if (opts.background) {
            this.ctx.fillStyle = opts.background;
            
            // Position background based on alignment
            let bgX = x;
            if (opts.align === 'center') {
                bgX = x - textWidth / 2;
            } else if (opts.align === 'right') {
                bgX = x - textWidth;
            }
            
            const bgY = opts.baseline === 'middle' ? y - textHeight / 2 : y;
            this.ctx.fillRect(
                bgX - opts.padding, 
                bgY - opts.padding, 
                textWidth + opts.padding * 2, 
                textHeight + opts.padding * 2
            );
        }
        
        // Draw text
        this.ctx.fillStyle = opts.color;
        this.ctx.fillText(text, x, y);
    }
}

// This class is abstract and will be extended by specific visualizations