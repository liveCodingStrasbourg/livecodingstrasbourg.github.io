/**
 * mapping-ui.js - UI for signal-to-visualization mapping
 * Handles mapping between audio features and visual parameters for abstract visualizations
 */

class MappingUI {
    constructor() {
        // Initialize event handlers
        this.setupEventHandlers();
        this.setupStaticControls();
    }
    
    /**
     * Set up event handlers for mapping controls
     */
    setupEventHandlers() {
        // Color mapping control
        document.getElementById('colorMapping').addEventListener('change', (e) => {
            this.updateMapping('colorMapping', e.target.value);
            this.updateStaticControlsVisibility();
        });
        
        // Size mapping control
        document.getElementById('sizeMapping').addEventListener('change', (e) => {
            this.updateMapping('sizeMapping', e.target.value);
            this.updateStaticControlsVisibility();
        });
        
        // Position mapping control
        document.getElementById('positionMapping').addEventListener('change', (e) => {
            this.updateMapping('positionMapping', e.target.value);
            this.updateStaticControlsVisibility();
        });
        
        // Style mapping control
        document.getElementById('styleMapping').addEventListener('change', (e) => {
            this.updateMapping('styleType', e.target.value);
        });
        
        // Reactivity factor control
        if (document.getElementById('reactivityFactor')) {
            document.getElementById('reactivityFactor').addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                document.getElementById('reactivityFactorValue').textContent = value.toFixed(1);
                this.updateMapping('reactivityFactor', value);
            });
        }
        
        // CPU sensitivity control
        if (document.getElementById('cpuSensitivity')) {
            document.getElementById('cpuSensitivity').addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                document.getElementById('cpuSensitivityValue').textContent = value.toFixed(1);
                this.updateMapping('cpuSensitivity', value);
            });
        }
    }
    
    /**
     * Set up static value controls
     */
    setupStaticControls() {
        // Add event listeners for static value sliders
        const staticControls = [
            'staticColorValue',
            'staticSizeValue',
            'staticPositionXValue',
            'staticPositionYValue'
        ];
        
        staticControls.forEach(controlId => {
            const element = document.getElementById(controlId);
            if (element) {
                element.addEventListener('input', (e) => {
                    const value = parseFloat(e.target.value);
                    const valueElement = document.getElementById(`${controlId}Value`);
                    if (valueElement) {
                        valueElement.textContent = value.toFixed(2);
                    }
                    this.updateMapping(controlId, value);
                });
            }
        });
        
        // Initial update of visibility
        this.updateStaticControlsVisibility();
    }
    
    /**
     * Update visibility of static controls based on mapping selections
     */
    updateStaticControlsVisibility() {
        // Get current mapping values
        const colorMapping = document.getElementById('colorMapping').value;
        const sizeMapping = document.getElementById('sizeMapping').value;
        const positionMapping = document.getElementById('positionMapping').value;
        
        // Update visibility of each static control
        this.updateControlVisibility('staticColorControl', colorMapping === 'static');
        this.updateControlVisibility('staticSizeControl', sizeMapping === 'static');
        this.updateControlVisibility('staticPositionControl', positionMapping === 'static');
    }
    
    /**
     * Update visibility of a control
     * @param {string} controlId - ID of the control container
     * @param {boolean} visible - Whether the control should be visible
     */
    updateControlVisibility(controlId, visible) {
        const control = document.getElementById(controlId);
        if (control) {
            control.style.display = visible ? 'block' : 'none';
        }
    }
    
    /**
     * Update mapping settings in abstract art visualizations
     * @param {string} mappingType - Type of mapping to update
     * @param {string|number} value - New mapping value
     */
    updateMapping(mappingType, value) {
        // Update both visualizations if they are abstract art
        if (window.uiControls && window.uiControls.visualizations) {
            const { viz1, viz2 } = window.uiControls.visualizations;
            
            if (viz1 && viz1 instanceof AbstractArtVisualizer) {
                viz1.updateSettings({ [mappingType]: value });
            }
            
            if (viz2 && viz2 instanceof AbstractArtVisualizer) {
                viz2.updateSettings({ [mappingType]: value });
            }
        }
        
        console.log(`Updated ${mappingType} to ${value}`);
    }
}

// Create global instance when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mappingUI = new MappingUI();
});