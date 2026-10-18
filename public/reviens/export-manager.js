// Enhanced Export Manager - Part 1: Core Export Logic
class ExportManager {
    constructor(audioEngine, loopAnalyzer, pitchDetector) {
        this.audioEngine = audioEngine;
        this.loopAnalyzer = loopAnalyzer;
        this.pitchDetector = pitchDetector;
        this.isExporting = false;
    }

    async exportLoop(startTime, duration, crossfadeMs = 20, crossfadeType = 'cosine', clickReduction = false, onProgress = null) {
        if (this.isExporting) {
            throw new Error('Export already in progress');
        }

        this.isExporting = true;
        
        try {
            if (onProgress) onProgress(0, 'analyzing audio...');
            
            const audioBuffer = this.audioEngine.getAudioBuffer();
            if (!audioBuffer) {
                throw new Error('No audio loaded');
            }

            // Validate parameters
            const maxDuration = audioBuffer.duration - startTime;
            if (duration > maxDuration) {
                throw new Error(`Duration too long. Maximum: ${maxDuration.toFixed(2)}s`);
            }

            // Analyze pitch and BPM
            if (onProgress) onProgress(15, 'detecting pitch and tempo...');
            const pitchInfo = await this.analyzePitchInfo(startTime, duration);
            const bpmInfo = this.getBPMInfo();
            const loopInfo = this.getLoopInfo(duration, bpmInfo.bpm);

            if (onProgress) onProgress(30, 'creating seamless loop...');
            
            // Create the loop buffer with enhanced crossfade
            const loopBuffer = await this.createExportBuffer(startTime, duration, crossfadeMs, crossfadeType, clickReduction);
            
            if (onProgress) onProgress(70, 'converting to WAV format...');
            
            // Convert to WAV with error handling
            const wavData = await this.audioBufferToWav(loopBuffer);
            
            if (onProgress) onProgress(90, 'preparing download...');
            
            // Create enhanced filename with all analysis data
            const filename = this.generateEnhancedFilename(
                startTime, duration, crossfadeType, clickReduction,
                pitchInfo, bpmInfo, loopInfo
            );
            
            // Create download
            await this.downloadFile(wavData, filename);
            
            if (onProgress) onProgress(100, 'export complete!');
            
            return true;
            
        } catch (error) {
            console.error('Export failed:', error);
            throw error;
        } finally {
            this.isExporting = false;
        }
    }

    // Analyze pitch information for the selected segment
    async analyzePitchInfo(startTime, duration) {
        const audioData = this.audioEngine.getAudioData();
        const sampleRate = this.audioEngine.getSampleRate();
        
        if (!audioData || !this.pitchDetector) {
            return { note: 'unknown', frequency: 0, confidence: 0 };
        }
        
        // Get average pitch across the segment
        const pitchResult = this.pitchDetector.getAveragePitch(audioData, sampleRate, startTime, duration);
        
        return {
            note: pitchResult.note !== '--' ? `${pitchResult.note}${pitchResult.octave}` : 'unknown',
            frequency: pitchResult.frequency,
            confidence: pitchResult.confidence
        };
    }

    // Get BPM information
    getBPMInfo() {
        const detectedBPM = this.loopAnalyzer ? this.loopAnalyzer.getDetectedBPM() : null;
        
        return {
            bpm: detectedBPM || 120,
            detected: !!detectedBPM
        };
    }

    // Calculate loop information (bars, beats)
    getLoopInfo(duration, bpm) {
        const beatDuration = 60 / bpm; // Duration of one beat
        const totalBeats = duration / beatDuration;
        const bars = totalBeats / 4; // Assuming 4/4 time signature
        
        return {
            beats: Math.round(totalBeats * 4) / 4, // Round to quarter beats
            bars: Math.round(bars * 4) / 4, // Round to quarter bars
            beatDuration: beatDuration,
            isWholeBeats: Math.abs(totalBeats - Math.round(totalBeats)) < 0.1,
            isWholeBars: Math.abs(bars - Math.round(bars)) < 0.1
        };
    }

    // Generate enhanced filename with all analysis data
    generateEnhancedFilename(startTime, duration, crossfadeType, clickReduction, pitchInfo, bpmInfo, loopInfo) {
        const timestamp = new Date().toISOString()
            .slice(0, 19)
            .replace(/[:-]/g, '')
            .replace('T', '_');
        
        // Format components
        const startStr = startTime.toFixed(1).replace('.', '_');
        const durationStr = duration.toFixed(1).replace('.', '_');
        
        // Pitch information
        const pitch = pitchInfo.confidence > 0.3 ? pitchInfo.note : 'unk';
        
        // BPM information
        const bpm = bpmInfo.bpm.toString();
        
        // Loop length in musical terms
        let loopLength;
        if (loopInfo.isWholeBars) {
            loopLength = `${Math.round(loopInfo.bars)}bar`;
        } else if (loopInfo.isWholeBeats) {
            loopLength = `${Math.round(loopInfo.beats)}beat`;
        } else {
            loopLength = `${loopInfo.beats.toFixed(1)}beat`;
        }
        
        // Technical parameters
        const crossfadeStr = crossfadeType.substring(0, 3); // First 3 letters
        const clickStr = clickReduction ? '_CR' : '';
        
        // Frequency info (if detected)
        const freqStr = pitchInfo.frequency > 0 ? `_${Math.round(pitchInfo.frequency)}hz` : '';
        
        // Build filename: reviens_[pitch]_[bpm]bpm_[length]_[duration]s_[technical]_[timestamp].wav
        return `reviens_${pitch}_${bpm}bpm_${loopLength}_${durationStr}s_${crossfadeStr}${clickStr}${freqStr}_${timestamp}.wav`;
    }

    async createExportBuffer(startTime, duration, crossfadeMs, crossfadeType = 'cosine', clickReduction = false) {
        const audioBuffer = this.audioEngine.getAudioBuffer();
        const sampleRate = audioBuffer.sampleRate;
        const channels = audioBuffer.numberOfChannels;
        
        const startSample = Math.floor(startTime * sampleRate);
        const durationSamples = Math.floor(duration * sampleRate);
        const crossfadeSamples = Math.floor((crossfadeMs / 1000) * sampleRate);
        
        // Ensure we don't exceed buffer bounds
        const endSample = Math.min(startSample + durationSamples, audioBuffer.length);
        const actualDurationSamples = endSample - startSample;
        
        // Create output buffer
        const outputBuffer = this.audioEngine.audioContext.createBuffer(
            channels,
            actualDurationSamples,
            sampleRate
        );

        // Process each channel
        for (let channel = 0; channel < channels; channel++) {
            const inputData = audioBuffer.getChannelData(channel);
            const outputData = outputBuffer.getChannelData(channel);
            
            // Copy audio data
            for (let i = 0; i < actualDurationSamples; i++) {
                const sourceIndex = startSample + i;
                outputData[i] = sourceIndex < inputData.length ? inputData[sourceIndex] : 0;
            }
            
            // Apply enhanced crossfade for seamless looping
            this.applyEnhancedCrossfadeToBuffer(outputData, crossfadeSamples, crossfadeType, clickReduction, sampleRate);
        }

        return outputBuffer;
    }

    applyEnhancedCrossfadeToBuffer(audioData, crossfadeSamples, crossfadeType = 'cosine', clickReduction = false, sampleRate = 44100) {
        const length = audioData.length;

        const maxCrossfade = Math.floor(length / 4);
        const actualCrossfade = Math.min(crossfadeSamples, maxCrossfade);

        if (actualCrossfade <= 0 || actualCrossfade * 2 >= length) {
            return;
        }

        if (clickReduction) {
            AudioUtils.applyClickReduction(audioData, actualCrossfade, sampleRate);
        }

        // For seamless looping: make start and end regions IDENTICAL
        // by crossfading both with the same blend of start+end content

        // Store copies before modification
        const startRegion = new Float32Array(actualCrossfade);
        const endRegion = new Float32Array(actualCrossfade);
        for (let i = 0; i < actualCrossfade; i++) {
            startRegion[i] = audioData[i];
            endRegion[i] = audioData[length - actualCrossfade + i];
        }

        // Apply identical crossfade to BOTH start and end regions
        for (let i = 0; i < actualCrossfade; i++) {
            const progress = i / actualCrossfade;

            // Equal-power curves
            const fadeIn = Math.sin(progress * Math.PI / 2);
            const fadeOut = Math.cos(progress * Math.PI / 2);

            // Blend end content into start content
            const blended = endRegion[i] * fadeOut + startRegion[i] * fadeIn;

            // Apply to both regions - they become identical
            audioData[i] = blended;
            audioData[length - actualCrossfade + i] = blended;
        }

        // Now start and end regions are identical, making the loop seamless
    }

    async audioBufferToWav(audioBuffer) {
        const sampleRate = audioBuffer.sampleRate;
        const channels = audioBuffer.numberOfChannels;
        const length = audioBuffer.length;
        
        // Calculate buffer sizes
        const bytesPerSample = 2; // 16-bit
        const blockAlign = channels * bytesPerSample;
        const byteRate = sampleRate * blockAlign;
        const headerSize = 44;
        const dataSize = length * blockAlign;
        const totalSize = headerSize + dataSize;
        
        // Create WAV file buffer
        const buffer = new ArrayBuffer(totalSize);
        const view = new DataView(buffer);
        
        // Helper to write strings
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        // WAV Header
        writeString(0, 'RIFF');
        view.setUint32(4, totalSize - 8, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true); // PCM format chunk size
        view.setUint16(20, 1, true);  // PCM format
        view.setUint16(22, channels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, 16, true); // 16-bit
        writeString(36, 'data');
        view.setUint32(40, dataSize, true);
        
        // Convert and write audio data
        let offset = headerSize;
        const maxInt16 = 32767;
        
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < channels; channel++) {
                const channelData = audioBuffer.getChannelData(channel);
                
                // Convert float to 16-bit integer with proper clamping
                let sample = channelData[i];
                sample = Math.max(-1, Math.min(1, sample)); // Clamp to [-1, 1]
                
                // Apply dithering to reduce quantization noise
                const dither = (Math.random() - 0.5) / maxInt16;
                sample += dither;
                
                const intSample = Math.round(sample * maxInt16);
                const clampedSample = Math.max(-maxInt16, Math.min(maxInt16, intSample));
                
                view.setInt16(offset, clampedSample, true);
                offset += 2;
            }
        }
        
        return buffer;
    }

    async downloadFile(arrayBuffer, filename) {
        const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
        
        // Try modern File System Access API first
        if ('showSaveFilePicker' in window) {
            try {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'WAV Audio Files',
                        accept: { 'audio/wav': ['.wav'] }
                    }]
                });
                
                const writable = await fileHandle.createWritable();
                await writable.write(blob);
                await writable.close();
                return;
                
            } catch (error) {
                if (error.name === 'AbortError') {
                    throw new Error('Export cancelled by user');
                }
                // Fall through to legacy method
                console.log('File System Access API failed, using fallback');
            }
        }
        
        // Fallback to traditional download
        return new Promise((resolve, reject) => {
            try {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                
                a.style.display = 'none';
                a.href = url;
                a.download = filename;
                
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                // Clean up after a delay
                setTimeout(() => {
                    URL.revokeObjectURL(url);
                    resolve();
                }, 1000);
                
            } catch (error) {
                reject(new Error(`Download failed: ${error.message}`));
            }
        });
    }

    // Check if export is currently in progress
    isExportInProgress() {
        return this.isExporting;
    }

    // Cancel current export (if possible)
    cancelExport() {
        if (this.isExporting) {
            this.isExporting = false;
            return true;
        }
        return false;
    }

    // Generate filename example for preview
    previewFilename(startTime, duration, crossfadeType, clickReduction, pitchInfo, bpmInfo, loopInfo) {
        // Create a sample filename without timestamp for preview
        const pitch = pitchInfo.confidence > 0.3 ? pitchInfo.note : 'unk';
        const bpm = bpmInfo.bpm.toString();
        
        let loopLength;
        if (loopInfo.isWholeBars) {
            loopLength = `${Math.round(loopInfo.bars)}bar`;
        } else if (loopInfo.isWholeBeats) {
            loopLength = `${Math.round(loopInfo.beats)}beat`;
        } else {
            loopLength = `${loopInfo.beats.toFixed(1)}beat`;
        }
        
        const durationStr = duration.toFixed(1).replace('.', '_');
        const crossfadeStr = crossfadeType.substring(0, 3);
        const clickStr = clickReduction ? '_CR' : '';
        const freqStr = pitchInfo.frequency > 0 ? `_${Math.round(pitchInfo.frequency)}hz` : '';
        
        return `reviens_${pitch}_${bpm}bpm_${loopLength}_${durationStr}s_${crossfadeStr}${clickStr}${freqStr}_[timestamp].wav`;
    }
}