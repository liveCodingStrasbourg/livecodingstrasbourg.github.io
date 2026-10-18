class LoopAnalyzer {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.beatPositions = [];
        this.detectedBPM = null;
        
        // Performance optimization: caching
        this.analysisCache = new Map();
        this.onsetFeaturesCache = null;
        this.phrasesCache = null;
        this.lastAnalyzedAudio = null;
        this.isAnalyzing = false;
    }

    // Find perfect loop suggestions based on duration (optimized)
    findPerfectLoops(targetDuration, tolerance = 0.1) {
        const audioData = this.audioEngine.getAudioData();
        const sampleRate = this.audioEngine.getSampleRate();
        const totalDuration = this.audioEngine.getDuration();
        
        if (!audioData || totalDuration === 0) {
            return [];
        }

        const suggestions = [];
        const stepSize = 0.1; // Reduced frequency: check every 100ms instead of 50ms
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

    // Analyze how well a loop will work with caching
    analyzeLoopQuality(startTime, duration) {
        // Create cache key
        const cacheKey = `${startTime.toFixed(3)}_${duration.toFixed(3)}`;
        
        // Check cache first
        if (this.analysisCache.has(cacheKey)) {
            return this.analysisCache.get(cacheKey);
        }

        const audioData = this.audioEngine.getAudioData();
        const sampleRate = this.audioEngine.getSampleRate();
        
        const startSample = Math.floor(startTime * sampleRate);
        const durationSamples = Math.floor(duration * sampleRate);
        const endSample = Math.min(startSample + durationSamples, audioData.length);
        
        if (endSample <= startSample) {
            const result = { score: 0, seamlessness: 0, energy: 0, spectralMatch: 0, rhythmicFit: 0 };
            this.analysisCache.set(cacheKey, result);
            return result;
        }

        const segment = audioData.slice(startSample, endSample);
        
        // Simplified analysis for performance
        const seamlessness = this.calculateOptimizedSeamlessness(segment);
        const energyConsistency = this.calculateOptimizedEnergyConsistency(segment);
        const spectralMatch = this.calculateOptimizedSpectralMatching(segment);
        const rhythmicFit = this.calculateRhythmicFit(startTime, duration);
        
        // Combined score with weights
        const score = (
            seamlessness * 0.4 +
            energyConsistency * 0.25 +
            spectralMatch * 0.2 +
            rhythmicFit * 0.15
        );

        const result = {
            score: Math.max(0, Math.min(1, score)),
            seamlessness: seamlessness,
            energy: energyConsistency,
            spectralMatch: spectralMatch,
            rhythmicFit: rhythmicFit
        };

        // Cache the result
        this.analysisCache.set(cacheKey, result);
        return result;
    }

    // Optimized seamlessness calculation
    calculateOptimizedSeamlessness(segment) {
        const fadeLength = Math.min(500, segment.length / 16); // Reduced sample count
        
        if (segment.length < fadeLength * 2) return 0;

        // Sample fewer points for speed
        const sampleStep = Math.max(1, Math.floor(fadeLength / 50));
        let correlation = 0;
        let startEnergy = 0;
        let endEnergy = 0;
        let samples = 0;
        
        for (let i = 0; i < fadeLength; i += sampleStep) {
            const startSample = segment[i];
            const endSample = segment[segment.length - fadeLength + i];
            
            correlation += startSample * endSample;
            startEnergy += startSample * startSample;
            endEnergy += endSample * endSample;
            samples++;
        }
        
        const denominator = Math.sqrt(startEnergy * endEnergy);
        if (denominator === 0) return 0;
        
        return Math.abs(correlation / denominator);
    }

    // Optimized energy consistency calculation
    calculateOptimizedEnergyConsistency(segment) {
        const numWindows = Math.min(8, Math.floor(segment.length / 1000)); // Fewer windows
        if (numWindows < 2) return 0.5;
        
        const windowSize = Math.floor(segment.length / numWindows);
        const energies = [];
        
        for (let i = 0; i < numWindows; i++) {
            const start = i * windowSize;
            let energy = 0;
            // Sample every 4th point for speed
            for (let j = start; j < start + windowSize && j < segment.length; j += 4) {
                energy += segment[j] * segment[j];
            }
            energies.push(Math.sqrt(energy / (windowSize / 4)));
        }
        
        const mean = energies.reduce((a, b) => a + b, 0) / energies.length;
        const variance = energies.reduce((sum, e) => sum + Math.pow(e - mean, 2), 0) / energies.length;
        const cv = mean > 0 ? Math.sqrt(variance) / mean : 1;
        
        return Math.max(0, 1 - cv);
    }

    // Optimized spectral matching
    calculateOptimizedSpectralMatching(segment) {
        const quarterLength = Math.floor(segment.length / 4);
        if (quarterLength < 64) return 0.5;
        
        const firstQuarter = segment.slice(0, quarterLength);
        const lastQuarter = segment.slice(-quarterLength);
        
        // Very simple high-frequency content comparison
        let firstHF = 0;
        let lastHF = 0;
        
        // Sample every 8th point for speed
        for (let i = 8; i < quarterLength; i += 8) {
            firstHF += Math.abs(firstQuarter[i] - firstQuarter[i-8]);
            lastHF += Math.abs(lastQuarter[i] - lastQuarter[i-8]);
        }
        
        firstHF /= quarterLength / 8;
        lastHF /= quarterLength / 8;
        
        return 1 - Math.min(1, Math.abs(firstHF - lastHF) / Math.max(firstHF, lastHF, 0.001));
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

    // Detect beats in the audio with caching
    detectBeats() {
        const audioData = this.audioEngine.getAudioData();
        const sampleRate = this.audioEngine.getSampleRate();
        
        if (!audioData) {
            return { beats: [], bpm: null };
        }

        // Check if we've already analyzed this audio
        const audioHash = this.getAudioHash(audioData);
        if (this.lastAnalyzedAudio === audioHash && this.beatPositions.length > 0) {
            return {
                beats: this.beatPositions,
                bpm: this.detectedBPM
            };
        }

        // Prevent concurrent analysis
        if (this.isAnalyzing) {
            return { beats: this.beatPositions, bpm: this.detectedBPM };
        }

        this.isAnalyzing = true;
        this.lastAnalyzedAudio = audioHash;
        
        try {
            this.beatPositions = this.performBeatDetection(audioData, sampleRate);
            this.detectedBPM = this.calculateBPM(this.beatPositions);
        } finally {
            this.isAnalyzing = false;
        }
        
        return {
            beats: this.beatPositions,
            bpm: this.detectedBPM
        };
    }

    performBeatDetection(audioData, sampleRate) {
        const beats = [];
        
        // Optimized parameters for performance
        const windowSize = Math.floor(sampleRate * 0.05); // Slightly larger windows
        const hopSize = Math.floor(windowSize / 2); // Reduced overlap
        
        // Use cached onset features if available
        let onsetFeatures = this.onsetFeaturesCache;
        if (!onsetFeatures) {
            onsetFeatures = this.calculateOptimizedOnsetFeatures(audioData, sampleRate, windowSize, hopSize);
            this.onsetFeaturesCache = onsetFeatures;
        }
        
        // Simplified onset detection for performance
        const combinedOnsets = this.combineOnsetDetection(onsetFeatures);
        
        // Enhanced adaptive peak picking with musical context
        const windowLength = Math.floor(onsetFeatures.length / 20); // Smaller windows for better resolution
        
        for (let i = windowLength; i < onsetFeatures.length - windowLength; i++) {
            const current = onsetFeatures[i];
            
            // Calculate adaptive threshold using multiple methods
            const threshold = this.calculateAdaptiveThreshold(onsetFeatures, i, windowLength);
            
            // Multi-condition peak detection
            if (this.isValidOnset(onsetFeatures, i, threshold)) {
                
                // More conservative minimum distance to prevent subdivision detection
                const minDistance = Math.max(0.25, this.calculateMinBeatDistance(beats, current.time)); // At least 250ms apart (240 BPM max)
                
                if (beats.length === 0 || current.time - beats[beats.length - 1].time > minDistance) {
                    
                    beats.push({
                        time: current.time,
                        strength: current.combinedStrength,
                        energy: current.energy,
                        spectralCentroid: current.spectralCentroid,
                        onsetType: current.dominantOnsetType
                    });
                }
            }
        }
        
        // Identify strong beats (likely downbeats) more conservatively
        if (beats.length > 0) {
            const avgStrength = beats.reduce((sum, b) => sum + b.strength, 0) / beats.length;
            const strongThreshold = avgStrength * 1.8; // Higher threshold for more selectivity
            
            beats.forEach(beat => {
                beat.isStrong = beat.strength > strongThreshold;
            });
            
            // Ensure we have some strong beats - if not, mark the strongest ones
            const strongBeats = beats.filter(b => b.isStrong);
            if (strongBeats.length === 0 && beats.length > 0) {
                // Mark top 25% of beats as strong
                const sortedByStrength = [...beats].sort((a, b) => b.strength - a.strength);
                const numStrong = Math.max(1, Math.floor(beats.length * 0.25));
                for (let i = 0; i < numStrong; i++) {
                    sortedByStrength[i].isStrong = true;
                }
            }
        }
        
        return beats;
    }

    // Generate simple hash for audio data caching
    getAudioHash(audioData) {
        const sampleStep = Math.floor(audioData.length / 1000); // Sample every 1000th point
        let hash = audioData.length;
        for (let i = 0; i < audioData.length; i += sampleStep) {
            hash = ((hash << 5) - hash + audioData[i] * 1000) & 0x7fffffff;
        }
        return hash;
    }

    // Clear caches when new audio is loaded
    clearCache() {
        this.analysisCache.clear();
        this.onsetFeaturesCache = null;
        this.phrasesCache = null;
        this.lastAnalyzedAudio = null;
    }

    // Optimized onset detection with reduced complexity
    calculateOptimizedOnsetFeatures(audioData, sampleRate, windowSize, hopSize) {
        const features = [];
        let prevEnergy = 0;
        let prevSpectralCentroid = 0;
        
        // Skip windowing for performance - just use raw energy
        for (let i = 0; i < audioData.length - windowSize; i += hopSize) {
            const time = i / sampleRate;
            
            // Simplified energy calculation (no windowing)
            let energy = 0;
            for (let j = 0; j < windowSize; j += 4) { // Sample every 4th point
                const sample = audioData[i + j];
                energy += sample * sample;
            }
            energy = Math.sqrt(energy / (windowSize / 4));
            
            // Energy flux (main onset detector)
            const energyFlux = Math.max(0, energy - prevEnergy);
            
            // Simplified spectral centroid (every 8th sample for speed)
            let weightedSum = 0;
            let totalEnergy = 0;
            for (let j = 0; j < windowSize; j += 8) {
                const sample = audioData[i + j];
                const sampleEnergy = sample * sample;
                totalEnergy += sampleEnergy;
                weightedSum += sampleEnergy * j;
            }
            const spectralCentroid = totalEnergy > 0 ? weightedSum / totalEnergy : 0;
            const spectralFlux = Math.abs(spectralCentroid - prevSpectralCentroid);
            
            // Combined strength (simplified - just energy + spectral)
            const combinedStrength = energyFlux * 0.7 + spectralFlux * 0.3;
            
            features.push({
                time: time,
                energy: energy,
                energyFlux: energyFlux,
                spectralCentroid: spectralCentroid,
                spectralFlux: spectralFlux,
                combinedStrength: combinedStrength,
                dominantOnsetType: energyFlux > spectralFlux ? 'energy' : 'spectral'
            });
            
            prevEnergy = energy;
            prevSpectralCentroid = spectralCentroid;
        }
        
        return features;
    }

    applyHannWindow(buffer) {
        const length = buffer.length;
        for (let i = 0; i < length; i++) {
            const window = 0.5 * (1 - Math.cos(2 * Math.PI * i / (length - 1)));
            buffer[i] *= window;
        }
    }

    calculateRMSEnergy(window) {
        let sum = 0;
        for (let i = 0; i < window.length; i++) {
            sum += window[i] * window[i];
        }
        return Math.sqrt(sum / window.length);
    }

    calculateSpectralCentroid(window) {
        let totalEnergy = 0;
        let weightedSum = 0;
        
        for (let i = 0; i < window.length; i++) {
            const energy = window[i] * window[i];
            totalEnergy += energy;
            weightedSum += energy * i;
        }
        
        return totalEnergy > 0 ? weightedSum / totalEnergy : 0;
    }

    calculateHighFrequencyContent(window) {
        let highFreq = 0;
        const startIndex = Math.floor(window.length * 0.6);
        
        for (let i = startIndex; i < window.length; i++) {
            highFreq += Math.abs(window[i]);
        }
        
        return highFreq / (window.length - startIndex);
    }

    calculatePhaseDeviation(currentWindow, previousWindow) {
        if (!previousWindow) return 0;
        
        let deviation = 0;
        const length = Math.min(currentWindow.length, previousWindow.length);
        
        for (let i = 1; i < length; i++) {
            const currentPhase = Math.atan2(currentWindow[i], currentWindow[i-1]);
            const prevPhase = Math.atan2(previousWindow[i], previousWindow[i-1]);
            const phaseDiff = Math.abs(currentPhase - prevPhase);
            deviation += Math.min(phaseDiff, 2 * Math.PI - phaseDiff);
        }
        
        return deviation / length;
    }

    getDominantOnsetType(energyFlux, spectralFlux, highFreqFlux, phaseDeviation) {
        const maxValue = Math.max(energyFlux, spectralFlux, highFreqFlux, phaseDeviation);
        
        if (maxValue === energyFlux) return 'energy';
        if (maxValue === spectralFlux) return 'spectral';
        if (maxValue === highFreqFlux) return 'percussive';
        return 'harmonic';
    }

    combineOnsetDetection(onsetFeatures) {
        const maxStrength = Math.max(...onsetFeatures.map(f => f.combinedStrength));
        if (maxStrength === 0) return onsetFeatures;
        
        return onsetFeatures.map(feature => ({
            ...feature,
            combinedStrength: feature.combinedStrength / maxStrength
        }));
    }

    calculateAdaptiveThreshold(features, index, windowLength) {
        const window = features.slice(Math.max(0, index - windowLength), index + windowLength + 1);
        
        const strengths = window.map(f => f.combinedStrength);
        const localMean = strengths.reduce((a, b) => a + b, 0) / strengths.length;
        const localMax = Math.max(...strengths);
        const localStd = Math.sqrt(strengths.reduce((sum, x) => sum + Math.pow(x - localMean, 2), 0) / strengths.length);
        
        const baseThreshold = localMean + localStd;
        const adaptiveThreshold = Math.min(baseThreshold, localMax * 0.6);
        
        return Math.max(adaptiveThreshold, localMean * 1.5);
    }

    isValidOnset(features, index, threshold) {
        const current = features[index];
        const prev = index > 0 ? features[index - 1] : null;
        const next = index < features.length - 1 ? features[index + 1] : null;
        
        if (current.combinedStrength < threshold) return false;
        
        if (prev && current.combinedStrength <= prev.combinedStrength) return false;
        if (next && current.combinedStrength < next.combinedStrength) return false;
        
        switch (current.dominantOnsetType) {
            case 'percussive':
                return current.highFreqFlux > threshold * 0.7;
            case 'harmonic':
                return current.phaseDeviation > threshold * 0.5;
            case 'spectral':
                return current.spectralFlux > threshold * 0.6;
            default:
                return true;
        }
    }

    calculateMinBeatDistance(beats, currentTime) {
        if (beats.length < 2) return 60 / 200;
        
        const recentBeats = beats.slice(-4);
        const intervals = [];
        
        for (let i = 1; i < recentBeats.length; i++) {
            intervals.push(recentBeats[i].time - recentBeats[i-1].time);
        }
        
        if (intervals.length === 0) return 60 / 200;
        
        intervals.sort((a, b) => a - b);
        const medianInterval = intervals[Math.floor(intervals.length / 2)];
        
        return Math.max(medianInterval * 0.5, 60 / 250);
    }

    calculateBPM(beats) {
        if (beats.length < 4) return null; // Need more beats for reliable BPM
        
        // Focus on strong beats first for more reliable BPM detection
        const strongBeats = beats.filter(beat => beat.isStrong);
        console.log('Total beats:', beats.length, 'Strong beats:', strongBeats.length);
        
        // Try with strong beats first
        let targetBeats = strongBeats.length >= 4 ? strongBeats : beats;
        
        // Calculate intervals between consecutive beats
        const intervals = [];
        for (let i = 1; i < targetBeats.length; i++) {
            intervals.push(targetBeats[i].time - targetBeats[i-1].time);
        }
        
        console.log('Beat intervals:', intervals.slice(0, 10)); // Log first 10 intervals
        
        // Filter for realistic musical intervals (focusing on typical song BPMs)
        const musicalIntervals = intervals.filter(interval => 
            interval >= 0.4 && interval <= 1.5 // 40-150 BPM range - more conservative
        );
        
        console.log('Musical intervals:', musicalIntervals.slice(0, 10));
        
        if (musicalIntervals.length < 3) {
            console.log('Not enough musical intervals found, trying all beats with wider range');
            // Fallback: try all beats with wider range
            const allIntervals = [];
            for (let i = 1; i < beats.length; i++) {
                allIntervals.push(beats[i].time - beats[i-1].time);
            }
            const fallbackIntervals = allIntervals.filter(interval => 
                interval >= 0.3 && interval <= 2.0 // Wider range as fallback
            );
            if (fallbackIntervals.length < 3) return null;
            return this.calculateBPMFromIntervals(fallbackIntervals);
        }
        
        return this.calculateBPMFromIntervals(musicalIntervals);
    }
    
    calculateBPMFromIntervals(intervals) {
        // Use median instead of mode for more robust BPM calculation
        const sortedIntervals = [...intervals].sort((a, b) => a - b);
        const medianInterval = sortedIntervals[Math.floor(sortedIntervals.length / 2)];
        
        console.log('Sorted intervals:', sortedIntervals.slice(0, 10));
        console.log('Median interval:', medianInterval);
        
        // Also check the mode for validation
        const histogram = {};
        const tolerance = 0.1; // 100ms tolerance for grouping
        
        intervals.forEach(interval => {
            const rounded = Math.round(interval / tolerance) * tolerance;
            histogram[rounded] = (histogram[rounded] || 0) + 1;
        });
        
        let maxCount = 0;
        let mostCommonInterval = 0;
        
        for (const [interval, count] of Object.entries(histogram)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommonInterval = parseFloat(interval);
            }
        }
        
        console.log('Most common interval:', mostCommonInterval, 'count:', maxCount);
        
        // Use median if it's close to mode, otherwise use mode
        const targetInterval = Math.abs(medianInterval - mostCommonInterval) < 0.1 ? 
            medianInterval : mostCommonInterval;
        
        if (targetInterval > 0) {
            const bpm = Math.round(60 / targetInterval);
            console.log('Calculated BPM:', bpm, 'from interval:', targetInterval);
            
            // More reasonable BPM range and better validation
            if (bpm >= 60 && bpm <= 180) {
                console.log('BPM accepted:', bpm);
                return bpm;
            }
            // If calculated BPM is unrealistic, try to find a musical subdivision
            if (bpm > 180) {
                console.log('BPM too high, trying subdivisions...');
                // Try half-time
                const halfTimeBpm = Math.round(bpm / 2);
                if (halfTimeBpm >= 60 && halfTimeBpm <= 180) {
                    console.log('Using half-time BPM:', halfTimeBpm);
                    return halfTimeBpm;
                }
                // Try quarter-time
                const quarterTimeBpm = Math.round(bpm / 4);
                if (quarterTimeBpm >= 60 && quarterTimeBpm <= 180) {
                    console.log('Using quarter-time BPM:', quarterTimeBpm);
                    return quarterTimeBpm;
                }
            }
            if (bpm < 60) {
                console.log('BPM too low, trying double-time...');
                // Try double-time
                const doubleTimeBpm = Math.round(bpm * 2);
                if (doubleTimeBpm >= 60 && doubleTimeBpm <= 180) {
                    console.log('Using double-time BPM:', doubleTimeBpm);
                    return doubleTimeBpm;
                }
            }
            console.log('No valid BPM found');
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

    // Detect musical phrases and downbeats with caching
    detectPhrases() {
        if (!this.beatPositions || this.beatPositions.length < 8) {
            return { phrases: [], downbeats: [] };
        }

        // Return cached result if available
        if (this.phrasesCache) {
            return this.phrasesCache;
        }

        // Lazy computation - only calculate when needed
        const phrases = this.identifyMusicalPhrases();
        const downbeats = this.identifyDownbeats();
        
        // Cache the result
        this.phrasesCache = { phrases, downbeats };
        return this.phrasesCache;
    }

    identifyMusicalPhrases() {
        const phrases = [];
        const windowSize = 8; // Analyze in 8-beat segments (2 bars in 4/4)
        
        // Simplified phrase detection based only on beat strength patterns
        for (let i = 0; i < this.beatPositions.length - windowSize; i += 4) {
            const segmentBeats = this.beatPositions.slice(i, i + windowSize);
            const startTime = segmentBeats[0].time;
            const endTime = segmentBeats[segmentBeats.length - 1].time;
            const duration = endTime - startTime;
            
            // Quick analysis based on beat strengths only
            const avgStrength = segmentBeats.reduce((sum, beat) => sum + (beat.strength || 0.5), 0) / segmentBeats.length;
            const hasStrongStart = segmentBeats[0].isStrong;
            
            // Simple phrase break detection based on beat patterns
            if (hasStrongStart || i === 0) {
                phrases.push({
                    startTime: startTime,
                    endTime: endTime,
                    duration: duration,
                    startBeat: i,
                    endBeat: i + windowSize - 1,
                    energy: avgStrength, // Use average beat strength as energy
                    spectralCentroid: 0.5, // Placeholder
                    harmonicStability: 0.5, // Placeholder
                    rhythmicComplexity: 0.3 // Placeholder
                });
            }
        }
        
        return phrases;
    }

    analyzeMusicalSegment(audioData, sampleRate, startTime, duration) {
        const startSample = Math.floor(startTime * sampleRate);
        const durationSamples = Math.floor(duration * sampleRate);
        const segment = audioData.slice(startSample, startSample + durationSamples);
        
        // Energy analysis
        const energy = this.calculateRMSEnergy(segment);
        
        // Spectral centroid for harmonic content
        const spectralCentroid = this.calculateSpectralCentroid(segment);
        
        // Harmonic stability (variance in spectral centroid over time)
        const harmonicStability = this.calculateHarmonicStability(segment, sampleRate);
        
        // Rhythmic complexity (onset density and regularity)
        const rhythmicComplexity = this.calculateRhythmicComplexity(segment, sampleRate);
        
        return {
            energy: energy,
            spectralCentroid: spectralCentroid,
            harmonicStability: harmonicStability,
            rhythmicComplexity: rhythmicComplexity
        };
    }

    calculateHarmonicStability(segment, sampleRate) {
        const windowSize = Math.floor(sampleRate * 0.1); // 100ms windows
        const hopSize = Math.floor(windowSize / 2);
        const centroids = [];
        
        for (let i = 0; i < segment.length - windowSize; i += hopSize) {
            const window = segment.slice(i, i + windowSize);
            centroids.push(this.calculateSpectralCentroid(window));
        }
        
        if (centroids.length < 2) return 0;
        
        // Calculate variance in spectral centroid
        const mean = centroids.reduce((a, b) => a + b, 0) / centroids.length;
        const variance = centroids.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / centroids.length;
        
        // Return stability (inverse of variance, normalized)
        return Math.max(0, 1 - Math.sqrt(variance) / mean);
    }

    calculateRhythmicComplexity(segment, sampleRate) {
        // Simplified rhythmic complexity based on onset irregularity
        const onsetFeatures = this.calculateOnsetFeatures(segment, sampleRate, 
            Math.floor(sampleRate * 0.04), Math.floor(sampleRate * 0.01));
        
        if (onsetFeatures.length < 4) return 0;
        
        const onsetTimes = onsetFeatures
            .filter(f => f.combinedStrength > 0.3)
            .map(f => f.time);
        
        if (onsetTimes.length < 3) return 0;
        
        // Calculate intervals between onsets
        const intervals = [];
        for (let i = 1; i < onsetTimes.length; i++) {
            intervals.push(onsetTimes[i] - onsetTimes[i - 1]);
        }
        
        // Complexity is based on interval variation
        const meanInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, x) => sum + Math.pow(x - meanInterval, 2), 0) / intervals.length;
        
        return Math.min(1, Math.sqrt(variance) / meanInterval);
    }

    isPhraseBreak(currentAnalysis, previousAnalysis) {
        if (!previousAnalysis) return true;
        
        // Look for significant changes that indicate phrase boundaries
        const energyChange = Math.abs(currentAnalysis.energy - previousAnalysis.energy) / 
                           Math.max(previousAnalysis.energy, 0.001);
        const spectralChange = Math.abs(currentAnalysis.spectralCentroid - previousAnalysis.spectralCentroid) /
                              Math.max(previousAnalysis.spectralCentroid, 0.001);
        const harmonicChange = Math.abs(currentAnalysis.harmonicStability - previousAnalysis.harmonicStability);
        
        // Phrase break criteria
        return energyChange > 0.3 || spectralChange > 0.4 || harmonicChange > 0.3;
    }

    identifyDownbeats() {
        if (!this.beatPositions || this.beatPositions.length < 4) return [];
        
        const downbeats = [];
        const beatsPerBar = 4; // Assume 4/4 time signature
        
        // Use beat strength and spacing to identify downbeats
        for (let i = 0; i < this.beatPositions.length; i += beatsPerBar) {
            const beat = this.beatPositions[i];
            if (beat && beat.isStrong) {
                downbeats.push({
                    time: beat.time,
                    strength: beat.strength,
                    barNumber: Math.floor(i / beatsPerBar) + 1,
                    confidence: this.calculateDownbeatConfidence(i)
                });
            }
        }
        
        return downbeats;
    }

    calculateDownbeatConfidence(beatIndex) {
        const windowSize = 8; // Look at surrounding beats
        const start = Math.max(0, beatIndex - windowSize / 2);
        const end = Math.min(this.beatPositions.length, beatIndex + windowSize / 2);
        const surroundingBeats = this.beatPositions.slice(start, end);
        
        if (surroundingBeats.length < 3) return 0.5;
        
        const targetBeat = this.beatPositions[beatIndex];
        const avgStrength = surroundingBeats.reduce((sum, b) => sum + b.strength, 0) / surroundingBeats.length;
        
        // Confidence based on relative strength
        return Math.min(1, targetBeat.strength / Math.max(avgStrength, 0.001));
    }

    // Enhanced loop suggestion based on musical structure
    findMusicalLoops(targetDuration, tolerance = 0.1) {
        const phrases = this.detectPhrases();
        const downbeats = phrases.downbeats;
        
        if (downbeats.length < 2) {
            // Fallback to regular loop finding
            return this.findPerfectLoops(targetDuration, tolerance);
        }
        
        const suggestions = [];
        
        // Look for loops that align with musical phrases
        for (let i = 0; i < downbeats.length - 1; i++) {
            for (let j = i + 1; j < downbeats.length; j++) {
                const startTime = downbeats[i].time;
                const endTime = downbeats[j].time;
                const duration = endTime - startTime;
                
                // Check if duration is close to target
                if (Math.abs(duration - targetDuration) <= tolerance) {
                    const quality = this.analyzeLoopQuality(startTime, duration);
                    
                    // Bonus for musical alignment
                    const musicalBonus = (downbeats[i].confidence + downbeats[j].confidence) / 2 * 0.2;
                    quality.score += musicalBonus;
                    quality.score = Math.min(1, quality.score);
                    
                    if (quality.score > 0.3) {
                        suggestions.push({
                            startTime: startTime,
                            duration: duration,
                            quality: quality.score,
                            seamlessness: quality.seamlessness,
                            energy: quality.energy,
                            spectralMatch: quality.spectralMatch,
                            rhythmicFit: quality.rhythmicFit,
                            musicalAlignment: musicalBonus,
                            description: this.getQualityDescription(quality.score),
                            startBar: downbeats[i].barNumber,
                            endBar: downbeats[j].barNumber
                        });
                    }
                }
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
}