// Audio Engine - Handles all audio processing and playback with enhanced crossfade options
class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.audioBuffer = null;
        this.audioData = null;
        this.source = null;
        this.isPlaying = false;
        this.playbackStartTime = 0;
        this.pausedAt = 0;
        this.loopTimeout = null;
    }

    async initialize() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    async loadAudioFile(file) {
        await this.initialize();
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // Store audio data for analysis
            this.audioData = new Float32Array(this.audioBuffer.getChannelData(0));
            
            return {
                duration: this.audioBuffer.duration,
                sampleRate: this.audioBuffer.sampleRate,
                channels: this.audioBuffer.numberOfChannels,
                samples: this.audioBuffer.length
            };
        } catch (error) {
            throw new Error(`Failed to load audio: ${error.message}`);
        }
    }

    playSelection(startTime, duration) {
        this.stopPlayback();
        
        if (!this.audioBuffer) {
            throw new Error('No audio loaded');
        }

        return new Promise((resolve) => {
            this.source = this.audioContext.createBufferSource();
            this.source.buffer = this.audioBuffer;
            this.source.connect(this.audioContext.destination);
            
            this.source.onended = () => {
                this.isPlaying = false;
                resolve();
            };
            
            // Add fade in/out to prevent clicks
            const gainNode = this.audioContext.createGain();
            this.source.disconnect();
            this.source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const fadeTime = 0.005; // 5ms fade
            const now = this.audioContext.currentTime;
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(1, now + fadeTime);
            gainNode.gain.setValueAtTime(1, now + duration - fadeTime);
            gainNode.gain.linearRampToValueAtTime(0, now + duration);
            
            this.source.start(0, startTime, duration);
            this.isPlaying = true;
            this.playbackStartTime = now;
        });
    }

    async playLoop(startTime, duration, crossfadeMs = 20, crossfadeType = 'cosine', clickReduction = false) {
        this.stopPlayback();
        
        if (!this.audioBuffer) {
            throw new Error('No audio loaded');
        }

        this.isPlaying = true;

        const playNext = async () => {
            if (!this.isPlaying) return;

            try {
                // Create seamless loop with enhanced crossfade
                const loopBuffer = await this.createSeamlessLoop(startTime, duration, crossfadeMs, crossfadeType, clickReduction);
                
                this.source = this.audioContext.createBufferSource();
                this.source.buffer = loopBuffer;
                this.source.connect(this.audioContext.destination);
                
                this.source.onended = () => {
                    if (this.isPlaying) {
                        // Small delay to prevent audio artifacts
                        this.loopTimeout = setTimeout(playNext, 1);
                    }
                };
                
                this.source.start(0);
                
            } catch (error) {
                console.error('Loop playback error:', error);
                this.isPlaying = false;
            }
        };

        await playNext();
    }

    async createSeamlessLoop(startTime, duration, crossfadeMs = 20, crossfadeType = 'cosine', clickReduction = false) {
        const sampleRate = this.audioBuffer.sampleRate;
        const startSample = Math.floor(startTime * sampleRate);
        const durationSamples = Math.floor(duration * sampleRate);
        const crossfadeSamples = Math.floor((crossfadeMs / 1000) * sampleRate);
        
        // Ensure crossfade doesn't exceed 25% of loop duration
        const maxCrossfade = Math.floor(durationSamples / 4);
        const actualCrossfade = Math.min(crossfadeSamples, maxCrossfade);
        
        // Create new buffer for the seamless loop
        const loopBuffer = this.audioContext.createBuffer(
            this.audioBuffer.numberOfChannels,
            durationSamples,
            sampleRate
        );

        for (let channel = 0; channel < this.audioBuffer.numberOfChannels; channel++) {
            const inputData = this.audioBuffer.getChannelData(channel);
            const outputData = loopBuffer.getChannelData(channel);
            
            // Copy main audio data
            for (let i = 0; i < durationSamples; i++) {
                const sourceIndex = startSample + i;
                outputData[i] = sourceIndex < inputData.length ? inputData[sourceIndex] : 0;
            }
            
            // Apply enhanced crossfade for seamless looping
            if (actualCrossfade > 0) {
                this.applyEnhancedCrossfade(outputData, actualCrossfade, crossfadeType, clickReduction, sampleRate);
            }
        }

        return loopBuffer;
    }

    applyEnhancedCrossfade(audioData, crossfadeSamples, crossfadeType = 'cosine', clickReduction = false, sampleRate = 44100) {
        const length = audioData.length;
        
        if (crossfadeSamples * 2 >= length) {
            return; // Skip if crossfade is too long
        }

        // Apply click reduction if enabled
        if (clickReduction) {
            this.applyClickReduction(audioData, crossfadeSamples, sampleRate);
        }

        // Crossfade beginning with end using specified curve
        for (let i = 0; i < crossfadeSamples; i++) {
            const fadeRatio = this.calculateFadeRatio(i, crossfadeSamples, crossfadeType);
            const endIndex = length - crossfadeSamples + i;
            
            const startSample = audioData[i];
            const endSample = audioData[endIndex];
            
            // Blend start with end using the calculated fade ratio
            audioData[i] = startSample * fadeRatio + endSample * (1 - fadeRatio);
        }
        
        // Fade out the end section to prevent doubling
        for (let i = 0; i < crossfadeSamples; i++) {
            const fadeRatio = this.calculateFadeRatio(crossfadeSamples - i - 1, crossfadeSamples, crossfadeType);
            const endIndex = length - crossfadeSamples + i;
            audioData[endIndex] *= fadeRatio;
        }
    }

    calculateFadeRatio(sampleIndex, totalSamples, crossfadeType) {
        const progress = sampleIndex / totalSamples;
        
        switch (crossfadeType) {
            case 'linear':
                return progress;
                
            case 'cosine':
                return 0.5 * (1 - Math.cos(Math.PI * progress));
                
            case 'logarithmic':
                return Math.log(1 + progress * (Math.E - 1)) / Math.E;
                
            case 'exponential':
                return (Math.exp(progress) - 1) / (Math.E - 1);
                
            default:
                return 0.5 * (1 - Math.cos(Math.PI * progress)); // Default to cosine
        }
    }

    applyClickReduction(audioData, crossfadeSamples, sampleRate) {
        // Apply high-frequency filtering to reduce clicks and pops
        const cutoffFreq = 8000; // 8kHz cutoff
        const nyquist = sampleRate / 2;
        const normalizedCutoff = cutoffFreq / nyquist;
        
        // Simple first-order low-pass filter
        const alpha = Math.exp(-2 * Math.PI * normalizedCutoff);
        
        // Apply filter to crossfade regions
        this.applyLowPassFilter(audioData, 0, crossfadeSamples, alpha);
        this.applyLowPassFilter(audioData, audioData.length - crossfadeSamples, crossfadeSamples, alpha);
    }

    applyLowPassFilter(audioData, startIndex, length, alpha) {
        let previousSample = audioData[startIndex];
        
        for (let i = startIndex + 1; i < startIndex + length; i++) {
            audioData[i] = alpha * previousSample + (1 - alpha) * audioData[i];
            previousSample = audioData[i];
        }
    }

    stopPlayback() {
        if (this.source) {
            try {
                this.source.stop();
            } catch (e) {
                // Ignore errors from already stopped sources
            }
            this.source = null;
        }
        
        if (this.loopTimeout) {
            clearTimeout(this.loopTimeout);
            this.loopTimeout = null;
        }
        
        this.isPlaying = false;
    }

    getAudioData() {
        return this.audioData;
    }

    getAudioBuffer() {
        return this.audioBuffer;
    }

    getSampleRate() {
        return this.audioBuffer ? this.audioBuffer.sampleRate : 0;
    }

    getDuration() {
        return this.audioBuffer ? this.audioBuffer.duration : 0;
    }

    // Extract audio segment for analysis
    extractSegment(startTime, duration) {
        if (!this.audioData) return null;
        
        const sampleRate = this.audioBuffer.sampleRate;
        const startSample = Math.floor(startTime * sampleRate);
        const endSample = Math.floor((startTime + duration) * sampleRate);
        
        return this.audioData.slice(startSample, Math.min(endSample, this.audioData.length));
    }

    // Calculate RMS energy of audio segment
    calculateRMS(audioSegment) {
        if (!audioSegment || audioSegment.length === 0) return 0;
        
        let sum = 0;
        for (let i = 0; i < audioSegment.length; i++) {
            sum += audioSegment[i] * audioSegment[i];
        }
        
        return Math.sqrt(sum / audioSegment.length);
    }

    // Calculate spectral centroid (brightness measure)
    calculateSpectralCentroid(audioSegment) {
        if (!audioSegment || audioSegment.length === 0) return 0;
        
        // Simple approximation using high-frequency content
        let totalEnergy = 0;
        let weightedSum = 0;
        
        for (let i = 0; i < audioSegment.length; i++) {
            const energy = audioSegment[i] * audioSegment[i];
            totalEnergy += energy;
            weightedSum += energy * i;
        }
        
        return totalEnergy > 0 ? weightedSum / totalEnergy : 0;
    }
}