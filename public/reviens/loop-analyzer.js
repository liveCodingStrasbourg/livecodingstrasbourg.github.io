class LoopAnalyzer {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.beatPositions = [];
        this.detectedBPM = null;
    }

    // Find perfect loop suggestions based on duration
    findPerfectLoops(targetDuration, tolerance = 0.1) {
        const audioData = this.audioEngine.getAudioData();
        const sampleRate = this.audioEngine.getSampleRate();
        const totalDuration = this.audioEngine.getDuration();
        
        if (!audioData || totalDuration === 0) {
            return [];
        }

        const suggestions = [];
        const stepSize = 0.05; // Check every 50ms
        const maxStartTime = totalDuration - targetDuration - 0.1;
        
        if (maxStartTime <= 0) {
            return [];
        }

        // Scan through audio to find best loop points
        for (let startTime = 0; startTime <= maxStartTime; startTime += stepSize) {
            const loopQuality = this.analyzeLoopQuality(startTime, targetDuration);
            
            if (loopQuality.score > 0.3) { // Only include decent quality loops
                suggestions.push({
                    startTime: startTime,
                    duration: targetDuration,
                    quality: loopQuality.score,
                    seamlessness: loopQuality.seamlessness,
                    energy: loopQuality.energy,
                    spectralMatch: loopQuality.spectralMatch,
                    rhythmicFit: loopQuality.rhythmicFit,
                    description: this.getQualityDescription(loopQuality.score)
                });
            }
        }

        // Sort by quality and return top suggestions
        return suggestions
            .sort((a, b) => b.quality - a.quality)
            .slice(0, 10)
            .map((suggestion, index) => ({
                ...suggestion,
                rank: index + 1
            }));
    }

    // Analyze how well a loop will work
    analyzeLoopQuality(startTime, duration) {
        const audioData = this.audioEngine.getAudioData();
        const sampleRate = this.audioEngine.getSampleRate();
        
        const startSample = Math.floor(startTime * sampleRate);
        const durationSamples = Math.floor(duration * sampleRate);
        const endSample = Math.min(startSample + durationSamples, audioData.length);
        
        if (endSample <= startSample) {
            return { score: 0, seamlessness: 0, energy: 0, spectralMatch: 0, rhythmicFit: 0 };
        }

        const segment = audioData.slice(startSample, endSample);
        
        // 1. Seamlessness - how well start and end match
        const seamlessness = this.calculateSeamlessness(segment);
        
        // 2. Energy consistency - stable energy throughout
        const energyConsistency = this.calculateEnergyConsistency(segment);
        
        // 3. Spectral matching - frequency content similarity
        const spectralMatch = this.calculateSpectralMatching(segment);
        
        // 4. Rhythmic fit - alignment with beats
        const rhythmicFit = this.calculateRhythmicFit(startTime, duration);
        
        // Combined score with weights
        const score = (
            seamlessness * 0.4 +
            energyConsistency * 0.25 +
            spectralMatch * 0.2 +
            rhythmicFit * 0.15
        );

        return {
            score: Math.max(0, Math.min(1, score)),
            seamlessness: seamlessness,
            energy: energyConsistency,
            spectralMatch: spectralMatch,
            rhythmicFit: rhythmicFit
        };
    }

    // Calculate how seamlessly a loop will connect
    calculateSeamlessness(segment) {
        const fadeLength = Math.min(1000, segment.length / 8); // Up to 1000 samples for fade
        
        if (segment.length < fadeLength * 2) {
            return 0;
        }

        const startSegment = segment.slice(0, fadeLength);
        const endSegment = segment.slice(-fadeLength);
        
        // Calculate correlation between start and end
        let correlation = 0;
        let startEnergy = 0;
        let endEnergy = 0;
        
        for (let i = 0; i < fadeLength; i++) {
            const startSample = startSegment[i];
            const endSample = endSegment[i];
            
            correlation += startSample * endSample;
            startEnergy += startSample * startSample;
            endEnergy += endSample * endSample;
        }
        
        // Normalized correlation coefficient
        const denominator = Math.sqrt(startEnergy * endEnergy);
        if (denominator === 0) return 0;
        
        const normalizedCorrelation = Math.abs(correlation / denominator);
        
        // Also check amplitude difference
        const startRMS = Math.sqrt(startEnergy / fadeLength);
        const endRMS = Math.sqrt(endEnergy / fadeLength);
        const amplitudeSimilarity = 1 - Math.min(1, Math.abs(startRMS - endRMS) / Math.max(startRMS, endRMS, 0.001));
        
        return (normalizedCorrelation * 0.7 + amplitudeSimilarity * 0.3);
    }

    // Calculate energy consistency throughout the loop
    calculateEnergyConsistency(segment) {
        const windowSize = Math.floor(segment.length / 10); // 10 windows
        const energies = [];
        
        for (let i = 0; i < segment.length - windowSize; i += windowSize) {
            let energy = 0;
            for (let j = 0; j < windowSize; j++) {
                const sample = segment[i + j];
                energy += sample * sample;
            }
            energies.push(Math.sqrt(energy / windowSize));
        }
        
        if (energies.length < 2) return 0.5;
        
        // Calculate coefficient of variation (std dev / mean)
        const mean = energies.reduce((sum, e) => sum + e, 0) / energies.length;
        const variance = energies.reduce((sum, e) => sum + Math.pow(e - mean, 2), 0) / energies.length;
        const stdDev = Math.sqrt(variance);
        
        const cv = mean > 0 ? stdDev / mean : 1;
        
        // Lower variation = higher consistency
        return Math.max(0, 1 - cv);
    }

    // Calculate spectral matching between different parts
    calculateSpectralMatching(segment) {
        const quarterLength = Math.floor(segment.length / 4);
        
        if (quarterLength < 256) return 0.5; // Not enough data
        
        const firstQuarter = segment.slice(0, quarterLength);
        const lastQuarter = segment.slice(-quarterLength);
        
        // Simple spectral analysis using zero crossing rate
        const getZeroCrossingRate = (data) => {
            let crossings = 0;
            for (let i = 1; i < data.length; i++) {
                if ((data[i] >= 0) !== (data[i-1] >= 0)) {
                    crossings++;
                }
            }
            return crossings / data.length;
        };
        
        const firstZCR = getZeroCrossingRate(firstQuarter);
        const lastZCR = getZeroCrossingRate(lastQuarter);
        
        // Similarity based on zero crossing rate difference
        const zcrSimilarity = 1 - Math.min(1, Math.abs(firstZCR - lastZCR) / Math.max(firstZCR, lastZCR, 0.001));
        
        // Also check high frequency content
        const getHighFreqContent = (data) => {
            let highFreq = 0;
            for (let i = 1; i < data.length; i++) {
                highFreq += Math.abs(data[i] - data[i-1]);
            }
            return highFreq / data.length;
        };
        
        const firstHF = getHighFreqContent(firstQuarter);
        const lastHF = getHighFreqContent(lastQuarter);
        const hfSimilarity = 1 - Math.min(1, Math.abs(firstHF - lastHF) / Math.max(firstHF, lastHF, 0.001));
        
        return (zcrSimilarity * 0.6 + hfSimilarity * 0.4);
    }

    // Calculate how well the loop fits rhythmically
    calculateRhythmicFit(startTime, duration) {
        if (!this.detectedBPM || this.beatPositions.length === 0) {
            return 0.5; // Neutral score if no beat info
        }
        
        const beatDuration = 60 / this.detectedBPM;
        const expectedBeats = Math.round(duration / beatDuration);
        
        // Check if duration is close to a musical subdivision
        const commonSubdivisions = [0.25, 0.5, 1, 2, 4, 8, 16]; // In beats
        let bestFit = 0;
        
        for (const subdivision of commonSubdivisions) {
            const expectedDuration = subdivision * beatDuration;
            const difference = Math.abs(duration - expectedDuration);
            const tolerance = beatDuration * 0.1; // 10% tolerance
            
            if (difference <= tolerance) {
                bestFit = Math.max(bestFit, 1 - (difference / tolerance));
            }
        }
        
        // Check if start time aligns with beats
        let beatAlignment = 0;
        const tolerance = beatDuration * 0.05; // 5% tolerance
        
        for (const beat of this.beatPositions) {
            const difference = Math.abs(startTime - beat.time);
            if (difference <= tolerance) {
                beatAlignment = 1 - (difference / tolerance);
                break;
            }
        }
        
        return (bestFit * 0.7 + beatAlignment * 0.3);
    }

    // Detect beats in the audio
    detectBeats() {
        const audioData = this.audioEngine.getAudioData();
        const sampleRate = this.audioEngine.getSampleRate();
        
        if (!audioData) {
            return { beats: [], bpm: null };
        }

        this.beatPositions = this.performBeatDetection(audioData, sampleRate);
        this.detectedBPM = this.calculateBPM(this.beatPositions);
        
        return {
            beats: this.beatPositions,
            bpm: this.detectedBPM
        };
    }

    performBeatDetection(audioData, sampleRate) {
        const beats = [];
        const windowSize = Math.floor(sampleRate * 0.04); // 40ms windows
        const hopSize = Math.floor(windowSize / 2); // 50% overlap
        
        // Calculate energy flux
        const energyFlux = [];
        let prevEnergy = 0;
        
        for (let i = 0; i < audioData.length - windowSize; i += hopSize) {
            let energy = 0;
            
            // Calculate RMS energy for window
            for (let j = 0; j < windowSize; j++) {
                const sample = audioData[i + j];
                energy += sample * sample;
            }
            energy = Math.sqrt(energy / windowSize);
            
            // Spectral flux (positive energy difference)
            const flux = Math.max(0, energy - prevEnergy);
            energyFlux.push({
                time: i / sampleRate,
                flux: flux,
                energy: energy
            });
            
            prevEnergy = energy;
        }
        
        // Adaptive peak picking
        const windowLength = Math.floor(energyFlux.length / 15);
        
        for (let i = windowLength; i < energyFlux.length - windowLength; i++) {
            const current = energyFlux[i];
            
            // Calculate local statistics
            let localSum = 0;
            let localMax = 0;
            
            for (let j = i - windowLength; j < i + windowLength; j++) {
                localSum += energyFlux[j].flux;
                localMax = Math.max(localMax, energyFlux[j].flux);
            }
            
            const localAvg = localSum / (windowLength * 2);
            const threshold = localAvg + (localMax - localAvg) * 0.3;
            
            // Peak detection with minimum spacing
            if (current.flux > threshold &&
                current.flux > energyFlux[i-1].flux &&
                current.flux >= energyFlux[i+1].flux) {
                
                // Minimum distance between beats
                const minDistance = 60 / 200; // Max 200 BPM
                if (beats.length === 0 || 
                    current.time - beats[beats.length - 1].time > minDistance) {
                    
                    beats.push({
                        time: current.time,
                        strength: current.flux / Math.max(localAvg, 0.001),
                        energy: current.energy
                    });
                }
            }
        }
        
        // Identify strong beats (likely downbeats)
        if (beats.length > 0) {
            const avgStrength = beats.reduce((sum, b) => sum + b.strength, 0) / beats.length;
            const strongThreshold = avgStrength * 1.5;
            
            beats.forEach(beat => {
                beat.isStrong = beat.strength > strongThreshold;
            });
        }
        
        return beats;
    }

    calculateBPM(beats) {
        if (beats.length < 2) return null;
        
        // Calculate intervals between beats
        const intervals = [];
        for (let i = 1; i < beats.length; i++) {
            intervals.push(beats[i].time - beats[i-1].time);
        }
        
        // Find most common interval (mode)
        const histogram = {};
        const tolerance = 0.02; // 20ms tolerance
        
        intervals.forEach(interval => {
            const rounded = Math.round(interval / tolerance) * tolerance;
            histogram[rounded] = (histogram[rounded] || 0) + 1;
        });
        
        // Find the most frequent interval
        let maxCount = 0;
        let mostCommonInterval = 0;
        
        for (const [interval, count] of Object.entries(histogram)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommonInterval = parseFloat(interval);
            }
        }
        
        if (mostCommonInterval > 0) {
            const bpm = Math.round(60 / mostCommonInterval);
            return Math.max(60, Math.min(200, bpm));
        }
        
        return null;
    }

    getQualityDescription(score) {
        if (score >= 0.9) return "Excellent - Perfect loop quality";
        if (score >= 0.8) return "Very Good - High quality loop";
        if (score >= 0.7) return "Good - Solid loop potential";
        if (score >= 0.6) return "Fair - Decent loop with minor issues";
        if (score >= 0.5) return "Average - Acceptable loop quality";
        if (score >= 0.4) return "Below Average - Noticeable loop artifacts";
        return "Poor - Significant loop issues";
    }

    // Get beat positions for visualization
    getBeatPositions() {
        return this.beatPositions;
    }

    // Get detected BPM
    getDetectedBPM() {
        return this.detectedBPM;
    }
}