/**
 * manual-bpm.js - Manual BPM tapping functionality
 * Allows the user to manually tap the tempo to compare with detected BPM
 */

class ManualBPM {
    constructor(bpmDetector) {
        this.bpmDetector = bpmDetector;
        
        // Element references
        this.tapButton = document.getElementById('tapBpm');
        this.bpmValueDisplay = document.getElementById('manualBpmValue');
        
        // Initialize
        this.setupEventHandlers();
    }
    
    /**
     * Set up event handlers for tap BPM functionality
     */
    setupEventHandlers() {
        // Tap BPM button
        this.tapButton.addEventListener('click', () => {
            this.onTap();
        });
        
        // Allow keyboard spacebar to trigger tapping
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                // Only trigger if we're not in an input field
                if (document.activeElement.tagName !== 'INPUT' && 
                    document.activeElement.tagName !== 'TEXTAREA' && 
                    document.activeElement.tagName !== 'SELECT') {
                    
                    event.preventDefault(); // Prevent page scrolling
                    this.onTap();
                }
            }
        });
        
        // Double-click to reset
        this.tapButton.addEventListener('dblclick', () => {
            this.resetTaps();
        });
    }
    
    /**
     * Handle a tap event
     */
    onTap() {
        // Register tap with BPM detector
        const bpm = this.bpmDetector.tap();
        
        // Provide visual feedback
        this.tapButton.classList.add('pulse');
        setTimeout(() => {
            this.tapButton.classList.remove('pulse');
        }, 200);
        
        // Update display
        if (bpm > 0) {
            this.bpmValueDisplay.textContent = bpm;
        }
    }
    
    /**
     * Reset tap history
     */
    resetTaps() {
        this.bpmDetector.clearTaps();
        this.bpmValueDisplay.textContent = '0';
    }
}

// Create global instance when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (typeof bpmDetector !== 'undefined') {
        window.manualBPM = new ManualBPM(bpmDetector);
    } else {
        console.error("Le module bpmDetector n'est pas chargé correctement.");
    }
});