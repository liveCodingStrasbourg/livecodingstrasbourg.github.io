// Shared Audio Utilities - Common functions used across modules
const AudioUtils = {
    // Crossfade curve calculations
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
                return 0.5 * (1 - Math.cos(Math.PI * progress));
        }
    },

    // Click reduction via low-pass filtering
    applyClickReduction(audioData, crossfadeSamples, sampleRate) {
        const cutoffFreq = 8000;
        const nyquist = sampleRate / 2;
        const normalizedCutoff = cutoffFreq / nyquist;
        const alpha = Math.exp(-2 * Math.PI * normalizedCutoff);

        this.applyLowPassFilter(audioData, 0, crossfadeSamples, alpha);
        this.applyLowPassFilter(audioData, audioData.length - crossfadeSamples, crossfadeSamples, alpha);
    },

    // Simple first-order low-pass filter
    applyLowPassFilter(audioData, startIndex, length, alpha) {
        let previousSample = audioData[startIndex];

        for (let i = startIndex + 1; i < startIndex + length && i < audioData.length; i++) {
            audioData[i] = alpha * previousSample + (1 - alpha) * audioData[i];
            previousSample = audioData[i];
        }
    },

    // Hann window function for spectral analysis
    applyHannWindow(buffer) {
        const length = buffer.length;
        for (let i = 0; i < length; i++) {
            const window = 0.5 * (1 - Math.cos(2 * Math.PI * i / (length - 1)));
            buffer[i] *= window;
        }
    },

    // RMS energy calculation
    calculateRMS(audioSegment) {
        if (!audioSegment || audioSegment.length === 0) return 0;

        let sum = 0;
        for (let i = 0; i < audioSegment.length; i++) {
            sum += audioSegment[i] * audioSegment[i];
        }

        return Math.sqrt(sum / audioSegment.length);
    },

    // Spectral centroid calculation
    calculateSpectralCentroid(audioSegment) {
        if (!audioSegment || audioSegment.length === 0) return 0;

        let totalEnergy = 0;
        let weightedSum = 0;

        for (let i = 0; i < audioSegment.length; i++) {
            const energy = audioSegment[i] * audioSegment[i];
            totalEnergy += energy;
            weightedSum += energy * i;
        }

        return totalEnergy > 0 ? weightedSum / totalEnergy : 0;
    },

    // Time formatting
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(3);
        return `${mins}:${secs.padStart(6, '0')}`;
    },

    // Short time format (for playback display)
    formatTimeShort(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${mins}:${secs.padStart(4, '0')}`;
    }
};

// Make available globally
window.AudioUtils = AudioUtils;
