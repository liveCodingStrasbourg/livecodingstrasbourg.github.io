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

        // Pre-create the loop buffer once for efficiency
        const loopBuffer = await this.createSeamlessLoop(startTime, duration, crossfadeMs, crossfadeType, clickReduction);

        try {
            this.source = this.audioContext.createBufferSource();
            this.source.buffer = loopBuffer;

            // Use Web Audio's native looping for seamless playback
            this.source.loop = true;
            this.source.loopStart = 0;
            this.source.loopEnd = loopBuffer.duration;

            this.source.connect(this.audioContext.destination);
            this.source.start(0);
        } catch (error) {
            console.error('Loop playback error:', error);
            this.isPlaying = false;
        }
        // Loop runs indefinitely until stopPlayback is called
    }

    async createSeamlessLoop(startTime, duration, crossfadeMs = 20, crossfadeType = 'cosine', clickReduction = false) {
        const sampleRate = this.audioBuffer.sampleRate;
        const startSample = Math.floor(startTime * sampleRate);
        const durationSamples = Math.floor(duration * sampleRate);
        const crossfadeSamples = Math.floor((crossfadeMs / 1000) * sampleRate);

        // Ensure crossfade doesn't exceed 25% of loop duration
        const maxCrossfade = Math.floor(durationSamples / 4);
        const actualCrossfade = Math.min(crossfadeSamples, maxCrossfade);

        // Create buffer - we keep the same duration but apply crossfade internally
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

            // Apply seamless loop crossfade
            if (actualCrossfade > 0) {
                this.applySeamlessLoopCrossfade(outputData, actualCrossfade, clickReduction, sampleRate);
            }
        }

        return loopBuffer;
    }

    applySeamlessLoopCrossfade(audioData, crossfadeSamples, clickReduction = false, sampleRate = 44100) {
        const length = audioData.length;

        if (crossfadeSamples * 2 >= length) {
            return;
        }

        if (clickReduction) {
            AudioUtils.applyClickReduction(audioData, crossfadeSamples, sampleRate);
        }

        // For seamless looping with Web Audio's loop=true:
        // When playback reaches buffer[length-1], it jumps to buffer[0]
        // We need the END to blend smoothly into the START
        //
        // IMPORTANT: Keep the START unchanged so the loop feels correctly timed.
        // Only modify the END region to crossfade into the start content.

        // Copy the start region (these samples won't be modified)
        const startCopy = new Float32Array(crossfadeSamples);
        for (let i = 0; i < crossfadeSamples; i++) {
            startCopy[i] = audioData[i];
        }

        // Apply crossfade ONLY to the END region
        // Fade out the original end while fading in the start content
        for (let i = 0; i < crossfadeSamples; i++) {
            const progress = i / crossfadeSamples;

            // Equal-power crossfade curves
            const fadeIn = Math.sin(progress * Math.PI / 2);
            const fadeOut = Math.cos(progress * Math.PI / 2);

            const endIndex = length - crossfadeSamples + i;
            const originalEnd = audioData[endIndex];

            // Blend: fade FROM original end content TO start content
            // At i=0: mostly originalEnd, at i=crossfadeSamples-1: mostly start
            audioData[endIndex] = originalEnd * fadeOut + startCopy[i] * fadeIn;
        }

        // Now: the END smoothly transitions into the START
        // The START remains unmodified, so the loop feels correctly timed
    }

    applyEnhancedCrossfade(audioData, crossfadeSamples, crossfadeType = 'cosine', clickReduction = false, sampleRate = 44100) {
        const length = audioData.length;

        if (crossfadeSamples * 2 >= length) {
            return;
        }

        if (clickReduction) {
            AudioUtils.applyClickReduction(audioData, crossfadeSamples, sampleRate);
        }

        // For seamless looping with Web Audio's loop=true:
        // We need the END of the buffer to transition smoothly INTO the START
        // At the loop point: buffer[length-1] -> buffer[0] should be continuous
        //
        // Strategy: The crossfade zone at the END fades out the original end
        // while fading IN a copy of samples from the START of the buffer.
        // Critically: the LAST sample of the crossfade should be close to buffer[0]

        // Copy the first crossfadeSamples from the start (these won't be modified)
        const startCopy = new Float32Array(crossfadeSamples);
        for (let i = 0; i < crossfadeSamples; i++) {
            startCopy[i] = audioData[i];
        }

        // Apply crossfade to the END region only
        for (let i = 0; i < crossfadeSamples; i++) {
            const progress = i / crossfadeSamples;

            // Equal-power crossfade curves
            const fadeOut = Math.cos(progress * Math.PI / 2);
            const fadeIn = Math.sin(progress * Math.PI / 2);

            const endIndex = length - crossfadeSamples + i;
            const originalEnd = audioData[endIndex];

            // Key fix: map the start samples in REVERSE order so that
            // at the end of crossfade (i=crossfadeSamples-1), we fade into startCopy[0]
            // This makes buffer[length-1] ≈ buffer[0]
            const startIndex = crossfadeSamples - 1 - i;

            audioData[endIndex] = originalEnd * fadeOut + startCopy[startIndex] * fadeIn;
        }

        // Now: audioData[length-1] = originalEnd[last]*0 + startCopy[0]*1 = startCopy[0]
        // And: audioData[0] = startCopy[0] (unchanged)
        // So the loop point is continuous!
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

    // Calculate RMS energy of audio segment (delegates to shared utility)
    calculateRMS(audioSegment) {
        return AudioUtils.calculateRMS(audioSegment);
    }

    // Calculate spectral centroid (delegates to shared utility)
    calculateSpectralCentroid(audioSegment) {
        return AudioUtils.calculateSpectralCentroid(audioSegment);
    }
}