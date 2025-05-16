/**
 * processor.js - Signal processing and feature extraction from audio data
 * Extracts various audio features from frequency and time domain data
 */

class AudioProcessor {
    constructor(analyzer) {
        this.analyzer = analyzer;
        
        // Spectral flux history
        this.spectralFluxData = [];
        this.maxSpectralFluxHistoryLength = 100;
        
        // Spectral centroid history
        this.spectralCentroidHistory = [];
        this.maxCentroidHistoryLength = 30;
        
        // Settings for frequency band scaling
        this.settings = {
            bassScale: 1.5,
            trebleScale: 1.0
        };
        
        // Bind methods
        this.update = this.update.bind(this);
        this.calculateBandEnergy = this.calculateBandEnergy.bind(this);
        this.calculateSpectralCentroid = this.calculateSpectralCentroid.bind(this);
        this.calculateSpectralFlux = this.calculateSpectralFlux.bind(this);
    }
    
    /**
     * Update analysis data and calculate all features
     * @returns {Object} Extracted audio features
     */
    update() {
        if (!this.analyzer.isInitialized()) {
            return null;
        }
        
        // Get latest audio data
        const frequencyData = this.analyzer.getFrequencyData();
        const timeData = this.analyzer.getTimeData();
        
        if (!frequencyData || !timeData) {
            return null;
        }
        
        // Calculate band energies
        const bassEnergy = this.calculateBandEnergy(frequencyData, 0, 0.08);
        const lowMidEnergy = this.calculateBandEnergy(frequencyData, 0.08, 0.15);
        const midEnergy = this.calculateBandEnergy(frequencyData, 0.15, 0.4);
        const highMidEnergy = this.calculateBandEnergy(frequencyData, 0.4, 0.7);
        const trebleEnergy = this.calculateBandEnergy(frequencyData, 0.7, 1.0);
        
        // Apply scaling factors
        const scaledBassEnergy = Math.min(1, bassEnergy * this.settings.bassScale);
        const scaledTrebleEnergy = Math.min(1, trebleEnergy * this.settings.trebleScale);
        
        // Calculate spectral flux
        const spectralFlux = this.calculateSpectralFlux(frequencyData);
        
        // Calculate spectral centroid
        const spectralCentroid = this.calculateSpectralCentroid(frequencyData);
        
        // Calculate overall energy
        const totalEnergy = (scaledBassEnergy + midEnergy + scaledTrebleEnergy) / 3;
        
        // Return all computed features
        return {
            bassEnergy: scaledBassEnergy,
            lowMidEnergy,
            midEnergy,
            highMidEnergy,
            trebleEnergy: scaledTrebleEnergy,
            combinedMidEnergy: (lowMidEnergy + midEnergy + highMidEnergy) / 3,
            totalEnergy,
            spectralFlux,
            spectralCentroid,
            spectralFluxHistory: [...this.spectralFluxData],
            centroidHistory: [...this.spectralCentroidHistory],
            peakLevel: this.calculatePeakLevel(timeData)
        };
    }
    
    /**
     * Calculate energy in a specific frequency band
     * @param {Uint8Array} frequencyData - Frequency domain data
     * @param {number} startPerc - Start percentage of frequency range (0-1)
     * @param {number} endPerc - End percentage of frequency range (0-1)
     * @returns {number} Normalized energy (0-1)
     */
    calculateBandEnergy(frequencyData, startPerc, endPerc) {
        const start = Math.floor(frequencyData.length * startPerc);
        const end = Math.floor(frequencyData.length * endPerc);
        let total = 0;
        
        for (let i = start; i < end; i++) {
            total += frequencyData[i] / 255; // Normalize to 0-1
        }
        
        // Average energy in the band
        return total / (end - start);
    }
    
    /**
     * Calculate spectral centroid - weighted mean of the frequencies
     * @param {Uint8Array} frequencyData - Frequency domain data
     * @returns {number} Normalized spectral centroid (0-1)
     */
    calculateSpectralCentroid(frequencyData) {
        let numerator = 0;
        let denominator = 0;
        
        for (let i = 0; i < frequencyData.length; i++) {
            const amplitude = frequencyData[i] / 255;
            numerator += (i + 1) * amplitude;
            denominator += amplitude;
        }
        
        // Avoid division by zero
        if (denominator === 0) {
            return 0;
        }
        
        // Calculate centroid and normalize to 0-1
        const centroid = numerator / denominator / frequencyData.length;
        
        // Add to history
        this.spectralCentroidHistory.push({
            time: this.analyzer.getCurrentTime(),
            value: centroid
        });
        
        // Limit history size
        if (this.spectralCentroidHistory.length > this.maxCentroidHistoryLength) {
            this.spectralCentroidHistory.shift();
        }
        
        return centroid;
    }
    
    /**
     * Calculate spectral flux - rate of change of the spectrum
     * @param {Uint8Array} frequencyData - Frequency domain data
     * @returns {number} Spectral flux value (0-1)
     */
    calculateSpectralFlux(frequencyData) {
        let flux = 0;
        
        if (this.spectralFluxData.length > 0) {
            // Get the last spectrum
            const lastSpectrum = this.spectralFluxData[this.spectralFluxData.length - 1].spectrum;
            
            // Calculate difference
            for (let i = 0; i < frequencyData.length; i++) {
                const diff = (frequencyData[i] / 255) - (lastSpectrum[i] / 255);
                // Only count increases in energy
                flux += diff > 0 ? diff : 0;
            }
            
            // Normalize
            flux = flux / frequencyData.length;
        }
        
        // Record current spectrum
        this.spectralFluxData.push({
            time: this.analyzer.getCurrentTime(),
            value: flux,
            spectrum: [...frequencyData]
        });
        
        // Limit history length
        if (this.spectralFluxData.length > this.maxSpectralFluxHistoryLength) {
            this.spectralFluxData.shift();
        }
        
        return flux;
    }
    
    /**
     * Calculate peak level from time domain data
     * @param {Uint8Array} timeData - Time domain data
     * @returns {number} Peak level (0-1)
     */
    calculatePeakLevel(timeData) {
        let max = 0;
        
        for (let i = 0; i < timeData.length; i++) {
            const amplitude = Math.abs((timeData[i] / 128.0) - 1.0);
            if (amplitude > max) {
                max = amplitude;
            }
        }
        
        return max;
    }
    
    /**
     * Update processor settings
     * @param {Object} settings - New settings
     */
    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
    }
}

// Create global instance
const audioProcessor = new AudioProcessor(audioAnalyzer);