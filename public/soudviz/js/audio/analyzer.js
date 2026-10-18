/**
 * analyzer.js - Core audio analyzer setup and management
 * Handles the AudioContext, AnalyserNode, and microphone connection
 */

class AudioAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.audioSource = null;
        this.isAudioInitialized = false;
        
        // Data arrays for analysis
        this.frequencyData = null;
        this.timeData = null;
        
        // Default settings
        this.settings = {
            fftSize: 2048,
            smoothingTimeConstant: 0.8
        };
        
        // Bind methods
        this.initAudio = this.initAudio.bind(this);
        this.updateSettings = this.updateSettings.bind(this);
        this.getFrequencyData = this.getFrequencyData.bind(this);
        this.getTimeData = this.getTimeData.bind(this);
    }
    
    /**
     * Initialize audio analysis by requesting microphone access
     * @returns {Promise} Resolves when audio is initialized
     */
    async initAudio() {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create analyzer node
            this.analyser = this.audioContext.createAnalyser();
            
            // Apply initial settings
            this.updateSettings(this.settings);
            
            // Connect microphone to analyzer
            this.audioSource = this.audioContext.createMediaStreamSource(stream);
            this.audioSource.connect(this.analyser);
            
            // Initialize data arrays
            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
            this.timeData = new Uint8Array(this.analyser.fftSize);
            
            // Mark as initialized
            this.isAudioInitialized = true;
            
            // Emit event for UI updates
            const event = new CustomEvent('audio-initialized');
            document.dispatchEvent(event);
            
            console.log('Audio initialized with FFT size:', this.analyser.fftSize);
            return true;
        } catch (error) {
            console.error('Error initializing audio:', error);
            return false;
        }
    }
    
    /**
     * Update analyzer settings
     * @param {Object} settings - New settings
     */
    updateSettings(settings) {
        if (!this.analyser) return;
        
        // Save new settings
        this.settings = { ...this.settings, ...settings };
        
        // Apply FFT size (must be a power of 2)
        if (settings.fftSize) {
            this.analyser.fftSize = settings.fftSize;
            
            // Update data arrays
            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
            this.timeData = new Uint8Array(this.analyser.fftSize);
        }
        
        // Apply smoothing time constant
        if (settings.smoothingTimeConstant !== undefined) {
            this.analyser.smoothingTimeConstant = settings.smoothingTimeConstant;
        }
        
        console.log('Analyzer settings updated:', this.settings);
    }
    
    /**
     * Get the current frequency domain data
     * @returns {Uint8Array} Frequency data
     */
    getFrequencyData() {
        if (!this.isAudioInitialized) return null;
        
        this.analyser.getByteFrequencyData(this.frequencyData);
        return this.frequencyData;
    }
    
    /**
     * Get the current time domain data
     * @returns {Uint8Array} Time domain data
     */
    getTimeData() {
        if (!this.isAudioInitialized) return null;
        
        this.analyser.getByteTimeDomainData(this.timeData);
        return this.timeData;
    }
    
    /**
     * Get current audio context time in milliseconds
     * @returns {number} Current time in ms
     */
    getCurrentTime() {
        return this.audioContext ? this.audioContext.currentTime * 1000 : 0;
    }
    
    /**
     * Get the sample rate of the audio context
     * @returns {number} Sample rate in Hz
     */
    getSampleRate() {
        return this.audioContext ? this.audioContext.sampleRate : 44100;
    }
    
    /**
     * Check if audio is initialized
     * @returns {boolean} True if initialized
     */
    isInitialized() {
        return this.isAudioInitialized;
    }
}

// Create a global instance
const audioAnalyzer = new AudioAnalyzer();