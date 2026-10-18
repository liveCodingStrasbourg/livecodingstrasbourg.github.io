/**
 * bpm-detector.js - Beat detection and BPM calculation algorithms
 * Detects beats and calculates BPM from audio features
 */

class BPMDetector {
    constructor(analyzer) {
        this.analyzer = analyzer;
        
        // Beat detection data
        this.beatData = {
            energyHistory: [],
            beatTimes: [],
            lastBeatTime: 0,
            threshold: 0.15,
            sensitivity: 1.5,
            decay: 0.98,
            bpm: 0,
            bpmConfidence: 0,
            beatConfidence: 0
        };
        
        // Manual BPM tapping
        this.manualBPM = {
            tapTimes: [],
            lastTapTime: 0,
            bpm: 0
        };
        
        // Settings
        this.settings = {
            historySize: 43,         // ~1 second at 60fps
            maxBeatHistory: 24,      // For BPM calculation
            minBeatInterval: 250,    // 250ms -> Max 240 BPM
            maxTapInterval: 2000     // Max 2 seconds between taps
        };
        
        // Bind methods
        this.update = this.update.bind(this);
        this.calculateBPM = this.calculateBPM.bind(this);
        this.tap = this.tap.bind(this);
        this.clearTaps = this.clearTaps.bind(this);
    }
    
    /**
     * Update beat detection with new audio features
     * @param {Object} features - Audio features from processor
     * @returns {boolean} True if a beat was detected
     */
    update(features) {
        if (!features) return false;
        
        const now = this.analyzer.getCurrentTime();
        const { bassEnergy } = features;
        
        // Update beat detection settings
        this.beatData.threshold = this.settings.threshold || 0.15;
        this.beatData.sensitivity = this.settings.sensitivity || 1.5;
        this.beatData.decay = this.settings.decay || 0.98;
        
        // Add current energy to history
        this.beatData.energyHistory.push(bassEnergy);
        
        // Limit history size
        if (this.beatData.energyHistory.length > this.settings.historySize) {
            this.beatData.energyHistory.shift();
        }
        
        // Calculate local average and variance
        const localAvg = this.beatData.energyHistory.reduce((a, b) => a + b, 0) / 
                        this.beatData.energyHistory.length;
        
        const variance = this.beatData.energyHistory.reduce((a, b) => a + Math.pow(b - localAvg, 2), 0) / 
                        this.beatData.energyHistory.length;
        
        // Dynamic threshold based on the local average, variance and sensitivity
        const dynamicThreshold = localAvg + (Math.sqrt(variance) * this.beatData.sensitivity);
        
        // Check time since last beat
        const timeSinceLastBeat = now - this.beatData.lastBeatTime;
        
        // Energy threshold check
        const energyOverThreshold = bassEnergy > Math.max(this.beatData.threshold, dynamicThreshold);
        
        // Timing check to avoid double-triggering
        const timingOK = timeSinceLastBeat > this.settings.minBeatInterval;
        
        // Check if current energy is a local peak
        let isPeak = false;
        if (this.beatData.energyHistory.length >= 3) {
            const current = bassEnergy;
            const prev1 = this.beatData.energyHistory[this.beatData.energyHistory.length - 2];
            const prev2 = this.beatData.energyHistory[this.beatData.energyHistory.length - 3];
            
            isPeak = current > prev1 && current > prev2;
        }
        
        // Calculate beat confidence score
        this.beatData.beatConfidence = 
            (energyOverThreshold ? 0.6 : 0) + 
            (isPeak ? 0.3 : 0) + 
            (timingOK ? 0.1 : 0);
        
        // If all conditions are met, register a beat
        if (energyOverThreshold && timingOK && isPeak) {
            this.beatData.beatTimes.push(now);
            this.beatData.lastBeatTime = now;
            
            // Limit beat history size
            if (this.beatData.beatTimes.length > this.settings.maxBeatHistory) {
                this.beatData.beatTimes.shift();
            }
            
            // Calculate BPM from beat intervals
            this.calculateBPM();
            
            // Trigger beat event
            const event = new CustomEvent('beat-detected', { 
                detail: { 
                    time: now, 
                    energy: bassEnergy,
                    bpm: this.beatData.bpm
                }
            });
            document.dispatchEvent(event);
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Calculate BPM from beat interval history
     */
    calculateBPM() {
        if (this.beatData.beatTimes.length < 4) return;
        
        // Calculate intervals between beats
        const intervals = [];
        for (let i = 1; i < this.beatData.beatTimes.length; i++) {
            const interval = this.beatData.beatTimes[i] - this.beatData.beatTimes[i-1];
            
            // Convert to BPM
            const instantBPM = 60000 / interval;
            
            // Filter to reasonable BPM range
            if (instantBPM >= 60 && instantBPM <= 200) {
                intervals.push(interval);
            }
        }
        
        if (intervals.length > 0) {
            // Sort intervals for median calculation
            intervals.sort((a, b) => a - b);
            const medianInterval = intervals[Math.floor(intervals.length / 2)];
            
            // Convert to BPM
            const medianBPM = Math.round(60000 / medianInterval);
            
            // Smoothly update the BPM
            if (this.beatData.bpm === 0) {
                this.beatData.bpm = medianBPM;
            } else if (Math.abs(this.beatData.bpm - medianBPM) < 10) {
                // Small change - smooth heavily
                this.beatData.bpm = Math.round(
                    this.beatData.bpm * 0.7 + medianBPM * 0.3
                );
            } else if (Math.abs(this.beatData.bpm - medianBPM) < 20) {
                // Medium change - moderate smoothing
                this.beatData.bpm = Math.round(
                    this.beatData.bpm * 0.5 + medianBPM * 0.5
                );
            } else {
                // Large change - accept new value
                this.beatData.bpm = medianBPM;
            }
            
            // Calculate BPM confidence based on interval consistency
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            let variance = 0;
            for (let i = 0; i < intervals.length; i++) {
                variance += Math.pow(intervals[i] - avgInterval, 2);
            }
            variance /= intervals.length;
            const stdDev = Math.sqrt(variance);
            
            // Coefficient of variation (lower is better)
            const cv = stdDev / avgInterval;
            
            // Convert to confidence percentage
            this.beatData.bpmConfidence = Math.min(100, Math.round((1 - Math.min(cv, 0.5) * 2) * 100));
        }
    }
    
    /**
     * Register a manual tap for BPM calculation
     */
    tap() {
        const now = performance.now();
        
        // Clear old taps if it's been too long
        if (now - this.manualBPM.lastTapTime > this.settings.maxTapInterval && this.manualBPM.tapTimes.length > 0) {
            this.clearTaps();
        }
        
        // Add this tap
        this.manualBPM.tapTimes.push(now);
        this.manualBPM.lastTapTime = now;
        
        // Need at least 2 taps to calculate BPM
        if (this.manualBPM.tapTimes.length < 2) {
            return 0;
        }
        
        // Calculate intervals between taps
        const intervals = [];
        for (let i = 1; i < this.manualBPM.tapTimes.length; i++) {
            intervals.push(this.manualBPM.tapTimes[i] - this.manualBPM.tapTimes[i-1]);
        }
        
        // Calculate average interval
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        
        // Convert to BPM
        this.manualBPM.bpm = Math.round(60000 / avgInterval);
        
        // Cap at realistic values
        this.manualBPM.bpm = Math.min(Math.max(this.manualBPM.bpm, 40), 240);
        
        // Trigger event
        const event = new CustomEvent('manual-bpm-updated', { 
            detail: { bpm: this.manualBPM.bpm }
        });
        document.dispatchEvent(event);
        
        return this.manualBPM.bpm;
    }
    
    /**
     * Clear manual tap history
     */
    clearTaps() {
        this.manualBPM.tapTimes = [];
        this.manualBPM.lastTapTime = 0;
        this.manualBPM.bpm = 0;
    }
    
    /**
     * Get all beat detection data
     * @returns {Object} Beat detection data
     */
    getData() {
        return {
            ...this.beatData,
            manualBPM: this.manualBPM.bpm
        };
    }
    
    /**
     * Update beat detection settings
     * @param {Object} settings - New settings
     */
    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
        
        if (settings.threshold !== undefined) {
            this.beatData.threshold = settings.threshold;
        }
        
        if (settings.sensitivity !== undefined) {
            this.beatData.sensitivity = settings.sensitivity;
        }
        
        if (settings.decay !== undefined) {
            this.beatData.decay = settings.decay;
        }
    }
}

// Create global instance
const bpmDetector = new BPMDetector(audioAnalyzer);