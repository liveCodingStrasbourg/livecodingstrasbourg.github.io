// Pitch Detection Module - Detects fundamental frequency and musical note
class PitchDetector {
    constructor() {
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.a4Frequency = 440; // Hz
    }

    // Main pitch detection function
    detectPitch(audioData, sampleRate) {
        if (!audioData || audioData.length === 0) {
            return { frequency: 0, note: '--', octave: 0, cents: 0, confidence: 0 };
        }

        // Use autocorrelation method for pitch detection
        const pitch = this.autocorrelationPitch(audioData, sampleRate);
        
        if (pitch.frequency < 50 || pitch.frequency > 2000) {
            return { frequency: 0, note: '--', octave: 0, cents: 0, confidence: 0 };
        }

        // Convert frequency to musical note
        const noteInfo = this.frequencyToNote(pitch.frequency);
        
        return {
            frequency: pitch.frequency,
            note: noteInfo.note,
            octave: noteInfo.octave,
            cents: noteInfo.cents,
            confidence: pitch.confidence
        };
    }

    // Autocorrelation-based pitch detection
    autocorrelationPitch(audioData, sampleRate) {
        const bufferSize = Math.min(4096, audioData.length);
        const buffer = audioData.slice(0, bufferSize);
        
        // Apply window function to reduce spectral leakage
        this.applyHannWindow(buffer);
        
        // Calculate autocorrelation
        const correlations = new Array(Math.floor(bufferSize / 2));
        
        for (let lag = 0; lag < correlations.length; lag++) {
            let sum = 0;
            for (let i = 0; i < bufferSize - lag; i++) {
                sum += buffer[i] * buffer[i + lag];
            }
            correlations[lag] = sum / (bufferSize - lag);
        }
        
        // Find the peak that corresponds to fundamental frequency
        const peak = this.findFundamentalPeak(correlations, sampleRate);
        
        if (peak.index === 0) {
            return { frequency: 0, confidence: 0 };
        }
        
        // Refine frequency using parabolic interpolation
        const refinedFreq = this.parabolicInterpolation(correlations, peak.index, sampleRate);
        
        return {
            frequency: refinedFreq,
            confidence: peak.confidence
        };
    }

    // Apply Hann window to reduce spectral leakage
    applyHannWindow(buffer) {
        const length = buffer.length;
        for (let i = 0; i < length; i++) {
            const window = 0.5 * (1 - Math.cos(2 * Math.PI * i / (length - 1)));
            buffer[i] *= window;
        }
    }

    // Find the peak that most likely corresponds to the fundamental frequency
    findFundamentalPeak(correlations, sampleRate) {
        const minFreq = 50;  // Minimum frequency to consider (Hz)
        const maxFreq = 1000; // Maximum frequency to consider (Hz)
        
        const minLag = Math.ceil(sampleRate / maxFreq);
        const maxLag = Math.floor(sampleRate / minFreq);
        
        let bestIndex = 0;
        let bestValue = 0;
        let confidence = 0;
        
        // Find the highest peak within the frequency range
        for (let i = minLag; i < Math.min(maxLag, correlations.length); i++) {
            if (correlations[i] > bestValue) {
                bestValue = correlations[i];
                bestIndex = i;
            }
        }
        
        // Calculate confidence based on peak prominence
        if (bestIndex > 0 && correlations.length > bestIndex) {
            const localMax = Math.max(...correlations.slice(Math.max(0, bestIndex - 5), bestIndex + 6));
            const localAvg = correlations.slice(minLag, maxLag).reduce((a, b) => a + b, 0) / (maxLag - minLag);
            confidence = Math.min(1, (bestValue - localAvg) / Math.max(localAvg, 0.001));
        }
        
        return {
            index: bestIndex,
            value: bestValue,
            confidence: Math.max(0, Math.min(1, confidence))
        };
    }

    // Use parabolic interpolation to refine frequency estimate
    parabolicInterpolation(correlations, peakIndex, sampleRate) {
        if (peakIndex <= 0 || peakIndex >= correlations.length - 1) {
            return sampleRate / peakIndex;
        }
        
        const y1 = correlations[peakIndex - 1];
        const y2 = correlations[peakIndex];
        const y3 = correlations[peakIndex + 1];
        
        // Parabolic interpolation formula
        const a = (y1 - 2 * y2 + y3) / 2;
        const b = (y3 - y1) / 2;
        
        if (Math.abs(a) < 1e-10) {
            return sampleRate / peakIndex;
        }
        
        const xOffset = -b / (2 * a);
        const refinedLag = peakIndex + xOffset;
        
        return sampleRate / refinedLag;
    }

    // Convert frequency to musical note
    frequencyToNote(frequency) {
        if (frequency <= 0) {
            return { note: '--', octave: 0, cents: 0 };
        }
        
        // Calculate the number of semitones from A4 (440 Hz)
        const semitonesFromA4 = 12 * Math.log2(frequency / this.a4Frequency);
        
        // Round to nearest semitone to get the closest note
        const nearestSemitone = Math.round(semitonesFromA4);
        const cents = Math.round((semitonesFromA4 - nearestSemitone) * 100);
        
        // Calculate note and octave
        // A4 is at index 9 in noteNames array, octave 4
        const noteIndex = (9 + nearestSemitone) % 12;
        const octave = 4 + Math.floor((9 + nearestSemitone) / 12);
        
        // Handle negative note indices
        const finalNoteIndex = noteIndex < 0 ? noteIndex + 12 : noteIndex;
        
        return {
            note: this.noteNames[finalNoteIndex],
            octave: octave,
            cents: cents
        };
    }

    // Detect pitch from audio segment with improved analysis
    detectSegmentPitch(audioData, sampleRate, startTime, duration) {
        if (!audioData) return { frequency: 0, note: '--', octave: 0, cents: 0, confidence: 0 };
        
        const startSample = Math.floor(startTime * sampleRate);
        const durationSamples = Math.floor(duration * sampleRate);
        const endSample = Math.min(startSample + durationSamples, audioData.length);
        
        if (endSample <= startSample) {
            return { frequency: 0, note: '--', octave: 0, cents: 0, confidence: 0 };
        }
        
        const segment = audioData.slice(startSample, endSample);
        
        // Apply pre-emphasis filter to improve pitch detection
        const preEmphasized = this.applyPreEmphasis(segment);
        
        // Detect pitch on the pre-emphasized signal
        return this.detectPitch(preEmphasized, sampleRate);
    }

    // Apply pre-emphasis filter to enhance higher frequencies
    applyPreEmphasis(audioData, alpha = 0.97) {
        const filtered = new Float32Array(audioData.length);
        filtered[0] = audioData[0];
        
        for (let i = 1; i < audioData.length; i++) {
            filtered[i] = audioData[i] - alpha * audioData[i - 1];
        }
        
        return filtered;
    }

    // Format pitch detection result for display
    formatPitchResult(pitchResult) {
        if (!pitchResult || pitchResult.frequency === 0 || pitchResult.note === '--') {
            return '--';
        }
        
        const { note, octave, cents, frequency, confidence } = pitchResult;
        
        if (confidence < 0.3) {
            return '--';
        }
        
        let result = `${note}${octave}`;
        
        // Add cents indication if significantly off-tune
        if (Math.abs(cents) > 20) {
            const centsSign = cents > 0 ? '+' : '';
            result += ` (${centsSign}${cents}¢)`;
        }
        
        // Add frequency for reference
        result += ` [${frequency.toFixed(1)}Hz]`;
        
        return result;
    }

    // Get the dominant pitch across multiple segments for better accuracy
    getAveragePitch(audioData, sampleRate, startTime, duration, numSegments = 5) {
        const segmentDuration = duration / numSegments;
        const pitchResults = [];
        
        for (let i = 0; i < numSegments; i++) {
            const segmentStart = startTime + (i * segmentDuration);
            const pitch = this.detectSegmentPitch(audioData, sampleRate, segmentStart, segmentDuration);
            
            if (pitch.confidence > 0.3) {
                pitchResults.push(pitch);
            }
        }
        
        if (pitchResults.length === 0) {
            return { frequency: 0, note: '--', octave: 0, cents: 0, confidence: 0 };
        }
        
        // Calculate weighted average frequency
        let totalWeight = 0;
        let weightedFreqSum = 0;
        
        pitchResults.forEach(pitch => {
            const weight = pitch.confidence;
            weightedFreqSum += pitch.frequency * weight;
            totalWeight += weight;
        });
        
        const avgFrequency = weightedFreqSum / totalWeight;
        const avgConfidence = totalWeight / pitchResults.length;
        
        // Convert average frequency back to note
        const noteInfo = this.frequencyToNote(avgFrequency);
        
        return {
            frequency: avgFrequency,
            note: noteInfo.note,
            octave: noteInfo.octave,
            cents: noteInfo.cents,
            confidence: avgConfidence
        };
    }

    // Calculate musical key signature based on detected pitches
    analyzeKey(pitchResults) {
        if (!pitchResults || pitchResults.length === 0) {
            return { key: 'unknown', confidence: 0 };
        }
        
        // Count note occurrences
        const noteCounts = {};
        this.noteNames.forEach(note => noteCounts[note] = 0);
        
        pitchResults.forEach(pitch => {
            if (pitch.note !== '--' && pitch.confidence > 0.3) {
                noteCounts[pitch.note] += pitch.confidence;
            }
        });
        
        // Find the most prominent note
        let maxCount = 0;
        let dominantNote = 'C';
        
        for (const [note, count] of Object.entries(noteCounts)) {
            if (count > maxCount) {
                maxCount = count;
                dominantNote = note;
            }
        }
        
        return {
            key: dominantNote,
            confidence: Math.min(1, maxCount / pitchResults.length)
        };
    }
}