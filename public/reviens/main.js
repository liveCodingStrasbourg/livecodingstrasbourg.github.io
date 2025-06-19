// Enhanced Main Application - Part 1: Setup & Core Functions
class ReviensApp {
    constructor() {
        this.audioEngine = new AudioEngine();
        this.loopAnalyzer = new LoopAnalyzer(this.audioEngine);
        this.pitchDetector = new PitchDetector();
        this.playbackManager = new PlaybackManager(this.audioEngine);
        this.exportManager = new ExportManager(this.audioEngine, this.loopAnalyzer, this.pitchDetector);
        
        this.selectionStart = 0;
        this.selectionDuration = 4;
        this.zoomLevel = 1;
        this.viewStartTime = 0;
        this.currentSuggestions = [];
        this.isSelecting = false;
        this.selectionStartX = 0;
        this.detectedPitch = null;
        
        // Selection edge dragging
        this.isDraggingEdge = false;
        this.isDraggingSelection = false;
        this.dragEdgeType = null; // 'start', 'end', or 'selection'
        this.dragStartX = 0;
        this.dragStartSelectionStart = 0;
        this.dragStartSelectionDuration = 0;
        this.snapToZero = false;
        this.precisionMode = false;
        
        // Undo/Redo system
        this.selectionHistory = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        
        // Performance optimization: debouncing
        this.debounceTimers = {};
        this.lastAnalysisTime = 0;
        
        this.initializeElements();
        this.setupEventListeners();
        
        // Load saved session
        this.loadFromLocalStorage();
    }

    initializeElements() {
        // File input elements
        this.fileInput = document.getElementById('fileInput');
        this.fileName = document.getElementById('fileName');
        this.loadingProgress = document.getElementById('loadingProgress');
        this.progressFill = document.getElementById('progressFill');
        
        // Global loading
        this.globalLoading = document.getElementById('globalLoading');
        this.loadingMessage = document.getElementById('loadingMessage');
        
        // Info sections
        this.audioInfo = document.getElementById('audioInfo');
        this.trackInfo = document.getElementById('trackInfo');
        this.trackVisualization = document.getElementById('trackVisualization');
        this.controls = document.getElementById('controls');
        this.buttonGroup = document.getElementById('buttonGroup');
        
        // Canvas elements
        this.waveformCanvas = document.getElementById('waveformCanvas');
        this.waveformCtx = this.waveformCanvas.getContext('2d');
        this.selectionOverlay = document.getElementById('selectionOverlay');
        this.playbackCursor = document.getElementById('playbackCursor');
        this.timeRuler = document.getElementById('timeRuler');
        this.beatMarkers = document.getElementById('beatMarkers');
        this.navigationSlider = document.getElementById('navigationSlider');
        this.sliderStart = document.querySelector('.slider-start');
        this.sliderEnd = document.querySelector('.slider-end');
        
        // Control inputs
        this.startTimeInput = document.getElementById('startTime');
        this.durationInput = document.getElementById('duration');
        this.zoomInput = document.getElementById('zoomLevel');
        this.bpmInput = document.getElementById('bpm');
        this.pitchInput = document.getElementById('pitch');
        this.crossfadeInput = document.getElementById('crossfade');
        this.crossfadeValue = document.getElementById('crossfadeValue');
        this.clickReductionInput = document.getElementById('clickReduction');
        this.crossfadeTypeInput = document.getElementById('crossfadeType');
        this.zoomValue = document.getElementById('zoomValue');
        
        // Enhanced controls
        this.snapToZeroInput = document.getElementById('snapToZero');
        this.precisionModeInput = document.getElementById('precisionMode');
        
        // Beat snap controls
        this.snapToBeatInput = document.getElementById('snapToBeat');
        this.beatLengthInput = document.getElementById('beatLength');
        this.manualBeatsInput = document.getElementById('manualBeats');
        this.snapToNearestBeatBtn = document.getElementById('snapToNearestBeat');
        this.findLoopsBtn = document.getElementById('findLoopsBtn');
        this.searchModeInput = document.getElementById('searchMode');
        this.minDurationInput = document.getElementById('minDuration');
        this.maxDurationInput = document.getElementById('maxDuration');
        
        // Analysis displays
        this.loopAnalysis = document.getElementById('loopAnalysis');
        this.loopSuggestions = document.getElementById('loopSuggestions');
        this.suggestionsList = document.getElementById('suggestionsList');
        
        // Buttons
        this.playBtn = document.getElementById('playBtn');
        this.loopBtn = document.getElementById('loopBtn');
        this.analyzeBtn = document.getElementById('analyzeBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.resetViewBtn = document.getElementById('resetViewBtn');
        this.helpBtn = document.getElementById('helpBtn');
        
        // Export progress
        this.exportProgress = document.getElementById('exportProgress');
        this.exportStatus = document.getElementById('exportStatus');
        this.exportProgressFill = document.getElementById('exportProgressFill');
        
        // Initialize playback manager
        this.playbackManager.initialize(this.playbackCursor, (position) => {
            // Optional: update any UI elements based on playback position
        });
    }

    setupEventListeners() {
        // File upload
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Canvas interaction
        this.waveformCanvas.addEventListener('mousedown', (e) => this.startSelection(e));
        this.waveformCanvas.addEventListener('mousemove', (e) => this.updateSelection(e));
        this.waveformCanvas.addEventListener('mouseup', () => this.endSelection());
        this.waveformCanvas.addEventListener('mouseleave', () => this.endSelection());
        this.waveformCanvas.addEventListener('wheel', (e) => this.handleWheelZoom(e));
        
        // Control inputs
        this.startTimeInput.addEventListener('input', () => this.updateSelectionFromInput());
        this.durationInput.addEventListener('input', () => this.updateSelectionFromInput());
        this.zoomInput.addEventListener('input', () => this.updateZoom());
        this.crossfadeInput.addEventListener('input', () => this.updateCrossfadeDisplay());
        this.navigationSlider.addEventListener('input', (e) => this.handleNavigationSlider(e));
        
        // Enhanced controls
        this.snapToZeroInput.addEventListener('change', (e) => {
            this.snapToZero = e.target.checked;
        });
        this.precisionModeInput.addEventListener('change', (e) => {
            this.precisionMode = e.target.checked;
            this.redrawVisualization();
        });
        
        // Beat length controls
        this.beatLengthInput.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                this.manualBeatsInput.style.display = 'inline-block';
            } else {
                this.manualBeatsInput.style.display = 'none';
            }
        });
        
        // Buttons
        this.playBtn.addEventListener('click', () => this.togglePlayback());
        this.loopBtn.addEventListener('click', () => this.toggleLoop());
        this.analyzeBtn.addEventListener('click', () => this.analyzeCurrentSelection());
        this.exportBtn.addEventListener('click', () => this.exportCurrentLoop());
        this.resetViewBtn.addEventListener('click', () => this.resetView());
        this.helpBtn.addEventListener('click', () => this.toggleHelpPanel());
        this.findLoopsBtn.addEventListener('click', () => this.findPerfectLoops());
        this.snapToNearestBeatBtn.addEventListener('click', () => this.snapSelectionToBeat());
        
        // Smart duration suggestions
        this.durationInput.addEventListener('focus', () => this.showDurationSuggestions());
        this.durationInput.addEventListener('blur', () => this.hideDurationSuggestions());
        
        // Window resize
        window.addEventListener('resize', () => this.redrawVisualization());
        
        // Prevent context menu on canvas
        this.waveformCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Tab functionality
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Arrow key navigation for beats - only when no form element is focused
        document.addEventListener('keydown', (e) => this.handleKeyNavigation(e));
        
        // Add focus/blur handlers to show which control is active
        this.addFocusIndicators();
    }

    // Enhanced loading management
    showGlobalLoading(message = 'working...') {
        this.loadingMessage.textContent = message;
        this.globalLoading.style.display = 'flex';
    }

    hideGlobalLoading() {
        this.globalLoading.style.display = 'none';
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Clear analyzer cache for new audio
        this.loopAnalyzer.clearCache();

        try {
            this.fileName.innerHTML = `<div class="terminal-output">loading: ${file.name}</div>`;
            this.showProgress(0);
            this.showGlobalLoading('decoding audio file...')

            const fileInfo = await this.audioEngine.loadAudioFile(file);
            this.showProgress(100);

            this.fileName.innerHTML = `<div class="terminal-output">loaded: ${file.name}</div>`;
            this.displayTrackInfo(fileInfo);
            this.showVisualization();
            this.showControls();
            this.updateInputLimits(fileInfo.duration);
            
            // Reset view
            this.viewStartTime = 0;
            this.zoomLevel = 1;
            this.zoomInput.value = 1;
            this.updateZoomDisplay();
            
            this.redrawVisualization();

            // Automatically run analysis for BPM and pitch detection
            setTimeout(async () => {
                this.hideProgress();
                this.hideGlobalLoading();
                // Focus the canvas to enable keyboard navigation
                this.waveformCanvas.focus();
                
                // Auto-analyze for BPM and pitch
                try {
                    console.log('Auto-analyzing loaded audio...');
                    const beatResults = this.loopAnalyzer.detectBeats();
                    console.log('Beat detection results:', beatResults);
                    
                    if (beatResults.bpm) {
                        this.bpmInput.value = beatResults.bpm;
                    }
                    
                    // Update pitch for default selection
                    this.updatePitchDisplay();
                    this.updateKeyInfoDisplays();
                    
                    // Enable snap controls if beats were detected
                    if (beatResults.beats && beatResults.beats.length > 0) {
                        this.snapToBeatInput.disabled = false;
                        this.snapToNearestBeatBtn.disabled = false;
                    }
                    
                    // Redraw with beat markers
                    this.redrawVisualization();
                    
                    // Clear debug logs after 5 seconds
                    setTimeout(() => {
                        console.clear();
                        console.log('Reviens: Analysis complete. Console cleared for cleaner output.');
                    }, 5000);
                } catch (error) {
                    console.error('Auto-analysis failed:', error);
                }
            }, 800);

        } catch (error) {
            console.error('File upload failed:', error);
            this.showError(`Failed to load audio file: ${error.message}`);
            this.hideProgress();
            this.hideGlobalLoading();
        }
    }

    showError(message) {
        this.fileName.innerHTML = `<div class="terminal-output" style="color: #ff0000;">error: ${message}</div>`;
    }

    showProgress(percentage) {
        this.loadingProgress.style.display = 'block';
        this.progressFill.style.width = `${percentage}%`;
    }

    hideProgress() {
        this.loadingProgress.style.display = 'none';
    }

    displayTrackInfo(fileInfo) {
        this.trackInfo.innerHTML = `
            <div class="info-card">
                <h4>duration</h4>
                <p>${this.formatTime(fileInfo.duration)}</p>
            </div>
            <div class="info-card">
                <h4>sample_rate</h4>
                <p>${fileInfo.sampleRate} Hz</p>
            </div>
            <div class="info-card">
                <h4>channels</h4>
                <p>${fileInfo.channels}</p>
            </div>
            <div class="info-card">
                <h4>samples</h4>
                <p>${fileInfo.samples.toLocaleString()}</p>
            </div>
            <div class="info-card">
                <h4>bit_depth</h4>
                <p>32-bit float</p>
            </div>
        `;
        this.audioInfo.style.display = 'block';
    }

    showVisualization() {
        this.trackVisualization.style.display = 'block';
    }

    showControls() {
        this.controls.style.display = 'grid';
        this.buttonGroup.style.display = 'flex';
    }

    updateInputLimits(duration) {
        this.startTimeInput.max = Math.max(0, duration - 0.1).toFixed(2);
        this.durationInput.max = duration.toFixed(2);
        this.durationInput.min = "0.1";
    }

    // Enhanced time conversion methods
    getViewDuration() {
        const totalDuration = this.audioEngine.getDuration();
        return totalDuration / this.zoomLevel;
    }

    getViewEndTime() {
        const viewDuration = this.getViewDuration();
        const totalDuration = this.audioEngine.getDuration();
        return Math.min(this.viewStartTime + viewDuration, totalDuration);
    }

    canvasXToTime(x) {
        const canvasWidth = this.waveformCanvas.offsetWidth;
        const ratio = Math.max(0, Math.min(1, x / canvasWidth));
        const viewDuration = this.getViewDuration();
        return this.viewStartTime + (ratio * viewDuration);
    }

    timeToCanvasX(time) {
        const viewDuration = this.getViewDuration();
        const ratio = (time - this.viewStartTime) / viewDuration;
        return ratio * this.waveformCanvas.offsetWidth;
    }

    // Find nearest zero crossing for precise loop points
    findNearestZeroCrossing(time) {
        if (!this.snapToZero || !this.audioEngine.getAudioData()) {
            return time;
        }

        const audioData = this.audioEngine.getAudioData();
        const sampleRate = this.audioEngine.getSampleRate();
        const centerSample = Math.floor(time * sampleRate);
        const searchRange = Math.floor(sampleRate * 0.01); // Search within 10ms
        
        let bestSample = centerSample;
        let minDistance = Math.abs(audioData[centerSample] || 0);
        
        // Search for zero crossing
        for (let i = Math.max(0, centerSample - searchRange); 
             i < Math.min(audioData.length - 1, centerSample + searchRange); i++) {
            
            const current = Math.abs(audioData[i] || 0);
            const next = Math.abs(audioData[i + 1] || 0);
            
            // Check for zero crossing (sign change)
            if (audioData[i] * audioData[i + 1] <= 0) {
                const distance = Math.abs(i - centerSample);
                if (distance < Math.abs(bestSample - centerSample)) {
                    bestSample = i;
                    minDistance = Math.min(current, next);
                }
            }
            
            // Also check for minimum amplitude
            if (current < minDistance) {
                minDistance = current;
                bestSample = i;
            }
        }
        
        return bestSample / sampleRate;
    }

    updateZoomDisplay() {
        this.zoomValue.textContent = `${this.zoomLevel}x`;
    }

    // Utility functions
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(3);
        return `${mins}:${secs.padStart(6, '0')}`;
    }

    // Enhanced Main Application - Part 2: Visualization & Controls
// Continue from Part 1...

    redrawVisualization() {
        if (!this.audioEngine.getAudioData()) return;
        
        this.drawTimeRuler();
        this.drawWaveform();
        this.updateSelectionOverlay();
        this.drawBeatMarkers();
        this.updateNavigationSlider();
        
        // Update playback manager view
        this.playbackManager.updateView(this.viewStartTime, this.zoomLevel);
    }

    drawTimeRuler() {
        const totalDuration = this.audioEngine.getDuration();
        const viewDuration = this.getViewDuration();
        const viewEndTime = this.getViewEndTime();
        
        this.timeRuler.innerHTML = '';
        
        const numMarkers = this.precisionMode ? 20 : 10;
        const timeStep = viewDuration / numMarkers;
        
        for (let i = 0; i <= numMarkers; i++) {
            const time = this.viewStartTime + (i * timeStep);
            if (time > totalDuration) break;
            
            const position = (i / numMarkers) * 100;
            
            const marker = document.createElement('div');
            marker.style.position = 'absolute';
            marker.style.left = `${position}%`;
            marker.style.top = '8px';
            marker.style.fontSize = this.precisionMode ? '9px' : '10px';
            marker.style.color = '#666';
            marker.textContent = this.formatTime(time);
            this.timeRuler.appendChild(marker);
        }
    }

    drawWaveform() {
        const canvas = this.waveformCanvas;
        const ctx = this.waveformCtx;
        
        // Set canvas size with higher resolution for precision mode
        const pixelRatio = this.precisionMode ? 2 : 1;
        canvas.width = canvas.offsetWidth * pixelRatio;
        canvas.height = 150 * pixelRatio;
        canvas.style.width = canvas.offsetWidth + 'px';
        canvas.style.height = '150px';
        ctx.scale(pixelRatio, pixelRatio);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const audioData = this.audioEngine.getAudioData();
        const totalDuration = this.audioEngine.getDuration();
        const sampleRate = this.audioEngine.getSampleRate();
        
        // Calculate visible range
        const viewDuration = this.getViewDuration();
        const viewEndTime = this.getViewEndTime();
        
        const startSample = Math.floor(this.viewStartTime * sampleRate);
        const endSample = Math.floor(viewEndTime * sampleRate);
        const samplesPerPixel = Math.max(1, Math.floor((endSample - startSample) / (canvas.width / pixelRatio)));
        
        // Draw loop suggestions as background highlights
        this.drawLoopHighlights(ctx, this.viewStartTime, viewDuration, canvas.width / pixelRatio, canvas.height / pixelRatio);
        
        // Draw zero crossing indicators if enabled
        if (this.snapToZero && this.zoomLevel > 5) {
            this.drawZeroCrossings(ctx, audioData, startSample, endSample, samplesPerPixel, sampleRate);
        }
        
        // Draw waveform
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = this.precisionMode ? 0.5 : 1;
        ctx.beginPath();
        
        let hasDrawnFirst = false;
        
        for (let x = 0; x < canvas.width / pixelRatio; x++) {
            const sampleStart = startSample + (x * samplesPerPixel);
            const sampleEnd = Math.min(sampleStart + samplesPerPixel, audioData.length);
            
            let min = 0, max = 0;
            for (let i = sampleStart; i < sampleEnd && i < audioData.length; i++) {
                const sample = audioData[i];
                min = Math.min(min, sample);
                max = Math.max(max, sample);
            }
            
            const yMin = (canvas.height / pixelRatio) / 2 - (min * (canvas.height / pixelRatio) / 2 * 0.9);
            const yMax = (canvas.height / pixelRatio) / 2 - (max * (canvas.height / pixelRatio) / 2 * 0.9);
            
            if (!hasDrawnFirst) {
                ctx.moveTo(x, yMax);
                hasDrawnFirst = true;
            } else {
                ctx.lineTo(x, yMax);
            }
            
            if (Math.abs(yMax - yMin) > 1) {
                ctx.lineTo(x, yMin);
            }
        }
        
        ctx.stroke();
        
        // Draw center line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, (canvas.height / pixelRatio) / 2);
        ctx.lineTo(canvas.width / pixelRatio, (canvas.height / pixelRatio) / 2);
        ctx.stroke();
    }

    drawZeroCrossings(ctx, audioData, startSample, endSample, samplesPerPixel, sampleRate) {
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)';
        ctx.lineWidth = 1;
        
        const canvasWidth = ctx.canvas.width / (this.precisionMode ? 2 : 1);
        const canvasHeight = ctx.canvas.height / (this.precisionMode ? 2 : 1);
        
        for (let i = startSample; i < endSample - 1 && i < audioData.length - 1; i++) {
            // Detect zero crossing
            if (audioData[i] * audioData[i + 1] <= 0 && Math.abs(audioData[i]) + Math.abs(audioData[i + 1]) > 0.01) {
                const x = ((i - startSample) / samplesPerPixel);
                if (x >= 0 && x < canvasWidth) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, canvasHeight);
                    ctx.stroke();
                }
            }
        }
    }

    drawLoopHighlights(ctx, viewStartTime, viewDuration, canvasWidth, canvasHeight) {
        if (!this.currentSuggestions || this.currentSuggestions.length === 0) return;
        
        const topSuggestions = this.currentSuggestions.slice(0, 5);
        
        topSuggestions.forEach((suggestion, index) => {
            const startTime = suggestion.startTime;
            const duration = suggestion.duration;
            const endTime = startTime + duration;
            
            const viewEndTime = viewStartTime + viewDuration;
            if (endTime < viewStartTime || startTime > viewEndTime) return;
            
            const visibleStart = Math.max(startTime, viewStartTime);
            const visibleEnd = Math.min(endTime, viewEndTime);
            
            const startX = ((visibleStart - viewStartTime) / viewDuration) * canvasWidth;
            const width = ((visibleEnd - visibleStart) / viewDuration) * canvasWidth;
            
            if (width < 1) return;
            
            const alpha = Math.max(0.1, suggestion.quality * 0.3);
            const hue = index === 0 ? 120 : (120 - index * 15);
            
            ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${alpha})`;
            ctx.fillRect(startX, 0, width, canvasHeight);
            
            if (index === 0) {
                ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
                ctx.lineWidth = 2;
                ctx.strokeRect(startX, 0, width, canvasHeight);
            }
            
            if (index < 3 && width > 60) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.font = '11px JetBrains Mono';
                ctx.textAlign = 'center';
                const labelX = startX + width / 2;
                const labelY = 15 + index * 12;
                ctx.fillText(`${(suggestion.quality * 100).toFixed(0)}%`, labelX, labelY);
            }
        });
    }

    drawBeatMarkers() {
        const beatPositions = this.loopAnalyzer.getBeatPositions();
        this.beatMarkers.innerHTML = '';
        
        if (beatPositions.length === 0) return;
        
        const viewDuration = this.getViewDuration();
        const viewEndTime = this.getViewEndTime();
        
        // Filter beats based on zoom level to reduce clutter
        const filteredBeats = this.filterBeatsForDisplay(beatPositions, viewDuration);
        
        filteredBeats.forEach(beat => {
            if (beat.time >= this.viewStartTime && beat.time <= viewEndTime) {
                const relativeTime = beat.time - this.viewStartTime;
                const position = (relativeTime / viewDuration) * 100;
                
                const marker = document.createElement('div');
                marker.className = beat.isStrong ? 'beat-marker strong' : 'beat-marker';
                marker.style.left = `${position}%`;
                
                // Apply confidence-based opacity and brightness
                const confidence = this.calculateBeatConfidence(beat, filteredBeats);
                const opacity = 0.3 + (confidence * 0.7); // Range 0.3-1.0
                const brightness = 0.5 + (confidence * 0.5); // Range 0.5-1.0
                
                if (beat.isStrong) {
                    marker.style.background = `rgba(255, 255, 0, ${opacity})`;
                    marker.style.boxShadow = `0 0 ${2 + confidence * 6}px rgba(255, 255, 0, ${opacity})`;
                    marker.style.filter = `brightness(${brightness})`;
                } else {
                    marker.style.background = `rgba(255, 255, 0, ${opacity * 0.8})`;
                    marker.style.filter = `brightness(${brightness})`;
                }
                
                marker.title = `beat: ${beat.time.toFixed(2)}s (confidence: ${(confidence * 100).toFixed(0)}%) ${beat.isStrong ? '(strong)' : ''}`;
                this.beatMarkers.appendChild(marker);
            }
        });
    }

    // Filter beats based on zoom level and importance to prevent UI clutter
    filterBeatsForDisplay(beatPositions, viewDuration) {
        if (beatPositions.length === 0) return [];
        
        // Calculate how many beats would be visible in current view
        const visibleBeats = beatPositions.filter(beat => 
            beat.time >= this.viewStartTime && beat.time <= this.getViewEndTime()
        );
        
        // Calculate density - beats per second in view
        const beatsPerSecond = visibleBeats.length / viewDuration;
        
        // Very aggressive filtering based on zoom level and density
        
        // If zoomed out too much (showing more than 15 seconds), only show strong beats
        if (viewDuration > 15) {
            return visibleBeats.filter(beat => beat.isStrong);
        }
        
        // If showing 8-15 seconds, show strong beats + very high-strength regular beats
        if (viewDuration > 8) {
            const avgStrength = visibleBeats.reduce((sum, b) => sum + (b.strength || 0.5), 0) / visibleBeats.length;
            const strengthThreshold = avgStrength * 1.4; // More selective
            
            return visibleBeats.filter(beat => 
                beat.isStrong || (beat.strength || 0.5) > strengthThreshold
            );
        }
        
        // If showing 3-8 seconds, be more selective about regular beats
        if (viewDuration > 3) {
            if (beatsPerSecond > 3) { // If more than 3 beats per second
                // Keep strong beats and thin out regular beats significantly
                const strongBeats = visibleBeats.filter(beat => beat.isStrong);
                const regularBeats = visibleBeats.filter(beat => !beat.isStrong);
                const step = Math.max(2, Math.ceil(beatsPerSecond / 2)); // Skip more beats
                const filteredRegular = regularBeats.filter((beat, index) => index % step === 0);
                
                return [...strongBeats, ...filteredRegular].sort((a, b) => a.time - b.time);
            }
        }
        
        // If showing 1-3 seconds, limit total visible beats more aggressively
        if (viewDuration > 1) {
            if (beatsPerSecond > 3) {
                // Maximum 8 beats for this zoom level
                const strongBeats = visibleBeats.filter(beat => beat.isStrong);
                const regularBeats = visibleBeats.filter(beat => !beat.isStrong);
                const maxRegular = Math.max(2, 8 - strongBeats.length);
                const step = Math.ceil(regularBeats.length / maxRegular);
                const filteredRegular = regularBeats.filter((beat, index) => index % step === 0);
                
                return [...strongBeats, ...filteredRegular].sort((a, b) => a.time - b.time);
            }
        }
        
        // For extremely zoomed in views (< 1 second), be very selective
        if (viewDuration <= 1) {
            if (beatsPerSecond > 4) {
                // Maximum 5 beats for extreme zoom
                const strongBeats = visibleBeats.filter(beat => beat.isStrong);
                const regularBeats = visibleBeats.filter(beat => !beat.isStrong);
                const maxRegular = Math.max(1, 5 - strongBeats.length);
                const step = Math.ceil(regularBeats.length / maxRegular);
                const filteredRegular = regularBeats.filter((beat, index) => index % step === 0);
                
                return [...strongBeats, ...filteredRegular].sort((a, b) => a.time - b.time);
            }
        }
        
        // For ultra-zoomed views (< 0.5 seconds), show minimal beats
        if (viewDuration <= 0.5) {
            if (beatsPerSecond > 2) {
                // Maximum 3 beats for ultra-zoom
                const strongBeats = visibleBeats.filter(beat => beat.isStrong);
                if (strongBeats.length >= 3) {
                    return strongBeats.slice(0, 3);
                }
                const regularBeats = visibleBeats.filter(beat => !beat.isStrong);
                const maxRegular = Math.max(0, 3 - strongBeats.length);
                const step = Math.max(1, Math.ceil(regularBeats.length / maxRegular));
                const filteredRegular = regularBeats.filter((beat, index) => index % step === 0);
                
                return [...strongBeats, ...filteredRegular.slice(0, maxRegular)].sort((a, b) => a.time - b.time);
            }
        }
        
        // Final pass: ensure minimum visual spacing between beats
        if (visibleBeats.length > 1) {
            const minVisualDistance = viewDuration / 50; // Minimum 2% of view width between beats
            const spacedBeats = [visibleBeats[0]]; // Always keep first beat
            
            for (let i = 1; i < visibleBeats.length; i++) {
                const lastBeat = spacedBeats[spacedBeats.length - 1];
                const currentBeat = visibleBeats[i];
                
                // Keep beat if it's far enough from the last one, or if it's a strong beat
                if (currentBeat.time - lastBeat.time >= minVisualDistance || currentBeat.isStrong) {
                    spacedBeats.push(currentBeat);
                }
            }
            
            return spacedBeats;
        }
        
        return visibleBeats;
    }

    // Calculate beat confidence for visualization
    calculateBeatConfidence(beat, allBeats) {
        // Base confidence from beat strength
        let confidence = Math.min(1, (beat.strength || 0.5) / 0.8);
        
        // Strong beats get higher confidence
        if (beat.isStrong) {
            confidence = Math.min(1, confidence * 1.3);
        }
        
        // Factor in onset type quality
        if (beat.onsetType === 'percussive') {
            confidence *= 1.2;
        } else if (beat.onsetType === 'energy') {
            confidence *= 1.1;
        }
        
        // Consider temporal consistency with nearby beats
        const nearbyBeats = allBeats.filter(b => 
            Math.abs(b.time - beat.time) < 2.0 && b !== beat
        );
        
        if (nearbyBeats.length > 0) {
            const avgNearbyStrength = nearbyBeats.reduce((sum, b) => sum + (b.strength || 0.5), 0) / nearbyBeats.length;
            const relativeStrength = (beat.strength || 0.5) / Math.max(avgNearbyStrength, 0.1);
            confidence *= Math.min(1.5, Math.max(0.5, relativeStrength));
        }
        
        // Energy consistency bonus
        if (beat.energy && beat.energy > 0.3) {
            confidence *= 1.1;
        }
        
        return Math.max(0.1, Math.min(1, confidence));
    }

    // Enhanced selection handling with zero crossing snap
    startSelection(event) {
        if (!this.audioEngine.getAudioData()) return;
        
        // Don't start new selection if we're dragging edges
        if (this.isDraggingEdge) return;
        
        this.isSelecting = true;
        const rect = this.waveformCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        
        this.selectionStartX = x;
        
        let clickTime = this.canvasXToTime(x);
        const totalDuration = this.audioEngine.getDuration();
        
        // Apply zero crossing snap
        if (this.snapToZero) {
            clickTime = this.findNearestZeroCrossing(clickTime);
        }
        
        this.selectionStart = Math.max(0, Math.min(clickTime, totalDuration - 0.1));
        this.selectionDuration = 0.1;
        
        this.updateInputValues();
        this.updateSelectionOverlay();
        
        event.preventDefault();
    }

    updateSelection(event) {
        if (!this.isSelecting || !this.audioEngine.getAudioData() || this.isDraggingEdge) return;
        
        const rect = this.waveformCanvas.getBoundingClientRect();
        const currentX = event.clientX - rect.left;
        
        let startTime = this.canvasXToTime(this.selectionStartX);
        let currentTime = this.canvasXToTime(currentX);
        
        // Apply zero crossing snap
        if (this.snapToZero) {
            startTime = this.findNearestZeroCrossing(startTime);
            currentTime = this.findNearestZeroCrossing(currentTime);
        }
        
        const totalDuration = this.audioEngine.getDuration();
        
        if (currentTime >= startTime) {
            this.selectionStart = Math.max(0, Math.min(startTime, totalDuration - 0.1));
            this.selectionDuration = Math.max(0.1, Math.min(currentTime - this.selectionStart, totalDuration - this.selectionStart));
        } else {
            this.selectionStart = Math.max(0, Math.min(currentTime, totalDuration - 0.1));
            this.selectionDuration = Math.max(0.1, Math.min(startTime - this.selectionStart, totalDuration - this.selectionStart));
        }
        
        this.updateInputValues();
        this.updateSelectionOverlay();
        this.debouncedUpdatePitchDisplay();
        
        event.preventDefault();
    }

    endSelection() {
        if (!this.isSelecting) return;
        
        this.isSelecting = false;
        
        // Save to history when selection is finalized
        this.saveSelectionToHistory();
        
        if (this.selectionDuration >= 0.5) {
            this.analyzeSelectionQuality();
            this.updatePitchDisplay();
        }
    }

    updateSelectionFromInput() {
        let newStart = parseFloat(this.startTimeInput.value) || 0;
        let newDuration = parseFloat(this.durationInput.value) || 0.1;
        
        // Apply zero crossing snap to input values
        if (this.snapToZero) {
            newStart = this.findNearestZeroCrossing(newStart);
            const newEnd = this.findNearestZeroCrossing(newStart + newDuration);
            newDuration = newEnd - newStart;
        }
        
        const maxDuration = this.audioEngine.getDuration();
        this.selectionStart = Math.max(0, Math.min(newStart, maxDuration - 0.1));
        this.selectionDuration = Math.max(0.1, Math.min(newDuration, maxDuration - this.selectionStart));
        
        this.updateInputValues();
        this.updateSelectionOverlay();
        this.debouncedUpdatePitchDisplay();
        
        // Save to history for manual input changes
        this.saveSelectionToHistory();
        
        if (this.selectionDuration >= 0.5) {
            this.debouncedAnalyzeSelectionQuality();
        }
    }

    updateInputValues() {
        this.startTimeInput.value = this.selectionStart.toFixed(3);
        this.durationInput.value = this.selectionDuration.toFixed(3);
    }

    updateSelectionOverlay() {
        if (!this.audioEngine.getAudioData()) {
            this.selectionOverlay.style.display = 'none';
            return;
        }
        
        const viewDuration = this.getViewDuration();
        const viewEndTime = this.getViewEndTime();
        
        const selectionEnd = this.selectionStart + this.selectionDuration;
        if (selectionEnd < this.viewStartTime || this.selectionStart > viewEndTime) {
            this.selectionOverlay.style.display = 'none';
            return;
        }
        
        const visibleStart = Math.max(this.selectionStart, this.viewStartTime);
        const visibleEnd = Math.min(selectionEnd, viewEndTime);
        
        const startRatio = (visibleStart - this.viewStartTime) / viewDuration;
        const widthRatio = (visibleEnd - visibleStart) / viewDuration;
        
        this.selectionOverlay.style.display = 'block';
        this.selectionOverlay.style.left = `${startRatio * 100}%`;
        this.selectionOverlay.style.width = `${widthRatio * 100}%`;
        this.selectionOverlay.style.top = '0';
        this.selectionOverlay.style.height = `${this.waveformCanvas.offsetHeight}px`;
        
        // Add edge handles if not already present
        this.addSelectionHandles();
    }

    addSelectionHandles() {
        // Remove existing handles and event listeners
        const existingHandles = this.selectionOverlay.querySelectorAll('.selection-handle');
        existingHandles.forEach(handle => handle.remove());
        
        // Remove existing selection overlay event listeners
        const newOverlay = this.selectionOverlay.cloneNode(true);
        this.selectionOverlay.parentNode.replaceChild(newOverlay, this.selectionOverlay);
        this.selectionOverlay = newOverlay;
        
        // Only add handles if selection is visible and has reasonable width
        const overlayWidth = parseFloat(this.selectionOverlay.style.width);
        if (overlayWidth < 1) return; // Too narrow to show handles
        
        console.log('Adding selection handles, overlay width:', overlayWidth);
        
        // Create start handle
        const startHandle = document.createElement('div');
        startHandle.className = 'selection-handle start';
        startHandle.title = 'Drag to adjust start time';
        this.selectionOverlay.appendChild(startHandle);
        
        // Create end handle
        const endHandle = document.createElement('div');
        endHandle.className = 'selection-handle end';
        endHandle.title = 'Drag to adjust end time';
        this.selectionOverlay.appendChild(endHandle);
        
        // Add event listeners for handles with proper binding
        startHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.startEdgeDrag(e, 'start');
        });
        
        endHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.startEdgeDrag(e, 'end');
        });
        
        // Add event listener for selection body (to move entire selection)
        this.selectionOverlay.addEventListener('mousedown', (e) => {
            // Only if not clicking on a handle
            if (!e.target.classList.contains('selection-handle')) {
                e.preventDefault();
                e.stopPropagation();
                this.startEdgeDrag(e, 'selection');
            }
        });
        
        console.log('Selection handles added successfully');
    }

    // Edge dragging methods
    startEdgeDrag(event, edgeType) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('Starting edge drag:', edgeType);
        
        this.isDraggingEdge = true;
        this.dragEdgeType = edgeType;
        this.dragStartX = event.clientX;
        this.dragStartSelectionStart = this.selectionStart;
        this.dragStartSelectionDuration = this.selectionDuration;
        
        // Store bound function references for proper cleanup
        this.boundHandleEdgeDrag = this.handleEdgeDrag.bind(this);
        this.boundEndEdgeDrag = this.endEdgeDrag.bind(this);
        
        // Add global mouse listeners
        document.addEventListener('mousemove', this.boundHandleEdgeDrag);
        document.addEventListener('mouseup', this.boundEndEdgeDrag);
        
        // Change cursor
        document.body.style.cursor = edgeType === 'selection' ? 'move' : 'ew-resize';
    }

    handleEdgeDrag(event) {
        if (!this.isDraggingEdge) return;
        
        const deltaX = event.clientX - this.dragStartX;
        const viewDuration = this.getViewDuration();
        const canvasWidth = this.waveformCanvas.offsetWidth;
        const deltaTime = (deltaX / canvasWidth) * viewDuration;
        
        const totalDuration = this.audioEngine.getDuration();
        let newStart = this.dragStartSelectionStart;
        let newDuration = this.dragStartSelectionDuration;
        
        switch(this.dragEdgeType) {
            case 'start':
                // Adjust start time, keep end time fixed
                newStart = Math.max(0, Math.min(
                    this.dragStartSelectionStart + deltaTime,
                    this.dragStartSelectionStart + this.dragStartSelectionDuration - 0.1
                ));
                newDuration = (this.dragStartSelectionStart + this.dragStartSelectionDuration) - newStart;
                break;
                
            case 'end':
                // Adjust end time, keep start time fixed
                const newEnd = Math.max(
                    this.dragStartSelectionStart + 0.1,
                    Math.min(totalDuration, this.dragStartSelectionStart + this.dragStartSelectionDuration + deltaTime)
                );
                newDuration = newEnd - this.dragStartSelectionStart;
                break;
                
            case 'selection':
                // Move entire selection
                newStart = Math.max(0, Math.min(
                    this.dragStartSelectionStart + deltaTime,
                    totalDuration - this.dragStartSelectionDuration
                ));
                newDuration = this.dragStartSelectionDuration;
                break;
        }
        
        // Apply zero crossing snap if enabled
        if (this.snapToZero && (this.dragEdgeType === 'start' || this.dragEdgeType === 'selection')) {
            newStart = this.findNearestZeroCrossing(newStart);
        }
        if (this.snapToZero && this.dragEdgeType === 'end') {
            const newEnd = this.findNearestZeroCrossing(newStart + newDuration);
            newDuration = newEnd - newStart;
        }
        
        // Update selection
        this.selectionStart = newStart;
        this.selectionDuration = newDuration;
        
        // Update UI
        this.updateInputValues();
        this.updateSelectionOverlay();
        this.debouncedUpdatePitchDisplay();
    }

    endEdgeDrag(event) {
        if (!this.isDraggingEdge) return;
        
        console.log('Ending edge drag:', this.dragEdgeType);
        
        this.isDraggingEdge = false;
        this.dragEdgeType = null;
        
        // Remove global mouse listeners - store references to remove properly
        if (this.boundHandleEdgeDrag) {
            document.removeEventListener('mousemove', this.boundHandleEdgeDrag);
        }
        if (this.boundEndEdgeDrag) {
            document.removeEventListener('mouseup', this.boundEndEdgeDrag);
        }
        
        // Reset cursor
        document.body.style.cursor = '';
        
        // Save to history
        this.saveSelectionToHistory();
        
        // Analyze quality if duration is sufficient
        if (this.selectionDuration >= 0.5) {
            this.debouncedAnalyzeSelectionQuality();
        }
        
        // Refresh handles to ensure they're still responsive
        setTimeout(() => {
            this.updateSelectionOverlay();
        }, 10);
    }

    // Enhanced Main Application - Part 3: Analysis & Playback
// Continue from Part 2...

    // Enhanced pitch analysis
    updatePitchDisplay() {
        if (!this.audioEngine.getAudioData() || this.selectionDuration < 0.2) {
            this.pitchInput.value = '--';
            this.detectedPitch = null;
            return;
        }

        const audioData = this.audioEngine.getAudioData();
        const sampleRate = this.audioEngine.getSampleRate();
        
        try {
            this.detectedPitch = this.pitchDetector.getAveragePitch(
                audioData, sampleRate, this.selectionStart, this.selectionDuration
            );
            
            console.log('Pitch detection result:', this.detectedPitch);
            
            const formattedPitch = this.pitchDetector.formatPitchResult(this.detectedPitch);
            this.pitchInput.value = formattedPitch;
            
            console.log('Formatted pitch:', formattedPitch);
        } catch (error) {
            console.error('Pitch detection failed:', error);
            this.pitchInput.value = '--';
            this.detectedPitch = null;
        }
    }

    updateZoom() {
        const newZoom = parseFloat(this.zoomInput.value);
        const oldViewDuration = this.getViewDuration();
        
        this.zoomLevel = newZoom;
        this.updateZoomDisplay();
        
        const newViewDuration = this.getViewDuration();
        const totalDuration = this.audioEngine.getDuration();
        
        const viewCenter = this.viewStartTime + (oldViewDuration / 2);
        this.viewStartTime = Math.max(0, Math.min(viewCenter - (newViewDuration / 2), totalDuration - newViewDuration));
        
        this.redrawVisualization();
    }

    handleWheelZoom(event) {
        if (!this.audioEngine.getAudioData()) return;
        
        event.preventDefault();
        
        const zoomDelta = event.deltaY > 0 ? -1 : 1;
        const newZoom = Math.max(1, Math.min(50, this.zoomLevel + zoomDelta));
        
        if (newZoom !== this.zoomLevel) {
            const rect = this.waveformCanvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseTimeRatio = mouseX / this.waveformCanvas.offsetWidth;
            const mouseTime = this.viewStartTime + (this.getViewDuration() * mouseTimeRatio);
            
            this.zoomLevel = newZoom;
            this.zoomInput.value = newZoom;
            this.updateZoomDisplay();
            
            const newViewDuration = this.getViewDuration();
            const totalDuration = this.audioEngine.getDuration();
            this.viewStartTime = Math.max(0, Math.min(mouseTime - (newViewDuration * mouseTimeRatio), totalDuration - newViewDuration));
            
            this.redrawVisualization();
        }
    }

    resetView() {
        if (!this.audioEngine.getAudioData()) return;
        
        this.zoomLevel = 1;
        this.viewStartTime = 0;
        this.zoomInput.value = 1;
        this.updateZoomDisplay();
        
        this.redrawVisualization();
    }

    // Handle keyboard navigation and shortcuts
    handleKeyNavigation(event) {
        // Check if any form element is focused
        const isFormElementFocused = document.activeElement.tagName === 'INPUT' || 
                                   document.activeElement.tagName === 'SELECT' ||
                                   document.activeElement.tagName === 'TEXTAREA';
        
        // For arrow keys specifically, only handle them when canvas is focused or no form element is focused
        const isArrowKey = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key);
        
        if (isArrowKey) {
            // Only handle arrow keys if canvas is focused or no form element is focused
            const canvasIsFocused = document.activeElement === this.waveformCanvas;
            const noFormElementFocused = !isFormElementFocused;
            
            if (!canvasIsFocused && !noFormElementFocused) {
                return; // Let the form element handle the arrow keys
            }
        } else if (isFormElementFocused) {
            // For non-arrow keys, don't handle any shortcuts when form elements are focused
            return;
        }
        
        // Global shortcuts (work without audio loaded)
        if (event.ctrlKey || event.metaKey) {
            switch(event.key.toLowerCase()) {
                case 'z':
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    return;
                case 'y':
                    event.preventDefault();
                    this.redo();
                    return;
            }
        }
        
        if (!this.audioEngine.getAudioData()) return;
        
        // Audio-dependent shortcuts
        switch(event.key.toLowerCase()) {
            case ' ':
                event.preventDefault();
                this.togglePlayback();
                break;
            case 'r':
                event.preventDefault();
                this.toggleLoop();
                break;
            case 'a':
                event.preventDefault();
                this.analyzeCurrentSelection();
                break;
            case 'e':
                event.preventDefault();
                this.exportCurrentLoop();
                break;
            case 'escape':
                event.preventDefault();
                this.resetView();
                break;
            case '?':
                event.preventDefault();
                this.toggleHelpPanel();
                break;
            case 's':
                event.preventDefault();
                this.snapSelectionToBeat();
                break;
            case 'f':
                event.preventDefault();
                this.findPerfectLoops();
                break;
        }
        
        // Beat navigation
        const beatPositions = this.loopAnalyzer.getBeatPositions();
        if (beatPositions.length === 0) return;
        
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.navigateToPreviousBeat(beatPositions);
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.navigateToNextBeat(beatPositions);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.navigateToPreviousStrongBeat(beatPositions);
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.navigateToNextStrongBeat(beatPositions);
                break;
        }
    }

    navigateToPreviousBeat(beatPositions) {
        const currentStart = this.selectionStart;
        
        // Find the previous beat
        let previousBeat = null;
        for (let i = beatPositions.length - 1; i >= 0; i--) {
            if (beatPositions[i].time < currentStart - 0.01) { // Small tolerance
                previousBeat = beatPositions[i];
                break;
            }
        }
        
        if (previousBeat) {
            this.jumpToBeat(previousBeat);
        }
    }

    navigateToNextBeat(beatPositions) {
        const currentStart = this.selectionStart;
        
        // Find the next beat
        let nextBeat = null;
        for (let i = 0; i < beatPositions.length; i++) {
            if (beatPositions[i].time > currentStart + 0.01) { // Small tolerance
                nextBeat = beatPositions[i];
                break;
            }
        }
        
        if (nextBeat) {
            this.jumpToBeat(nextBeat);
        }
    }

    navigateToPreviousStrongBeat(beatPositions) {
        const currentStart = this.selectionStart;
        const strongBeats = beatPositions.filter(beat => beat.isStrong);
        
        // Find the previous strong beat
        let previousStrongBeat = null;
        for (let i = strongBeats.length - 1; i >= 0; i--) {
            if (strongBeats[i].time < currentStart - 0.01) {
                previousStrongBeat = strongBeats[i];
                break;
            }
        }
        
        if (previousStrongBeat) {
            this.jumpToBeat(previousStrongBeat);
        }
    }

    navigateToNextStrongBeat(beatPositions) {
        const currentStart = this.selectionStart;
        const strongBeats = beatPositions.filter(beat => beat.isStrong);
        
        // Find the next strong beat
        let nextStrongBeat = null;
        for (let i = 0; i < strongBeats.length; i++) {
            if (strongBeats[i].time > currentStart + 0.01) {
                nextStrongBeat = strongBeats[i];
                break;
            }
        }
        
        if (nextStrongBeat) {
            this.jumpToBeat(nextStrongBeat);
        }
    }

    jumpToBeat(beat) {
        let newStart = beat.time;
        
        // Apply zero crossing snap if enabled
        if (this.snapToZero) {
            newStart = this.findNearestZeroCrossing(newStart);
        }
        
        // Ensure we don't go past the end of the audio
        const maxDuration = this.audioEngine.getDuration();
        newStart = Math.max(0, Math.min(newStart, maxDuration - this.selectionDuration));
        
        this.selectionStart = newStart;
        this.updateInputValues();
        this.updateSelectionOverlay();
        
        // Save to history for beat navigation
        this.saveSelectionToHistory();
        
        // Auto-zoom to the beat if it's not visible
        this.ensureBeatIsVisible(newStart);
        
        // Update analysis and pitch
        this.debouncedUpdatePitchDisplay();
        if (this.selectionDuration >= 0.5) {
            this.debouncedAnalyzeSelectionQuality();
        }
        
        // Visual feedback
        this.highlightBeatMarker(beat);
        
        console.log(`Jumped to ${beat.isStrong ? 'strong ' : ''}beat at ${newStart.toFixed(3)}s`);
    }

    ensureBeatIsVisible(beatTime) {
        const viewDuration = this.getViewDuration();
        const viewEndTime = this.getViewEndTime();
        
        // Check if beat is outside current view
        if (beatTime < this.viewStartTime || beatTime > viewEndTime) {
            // Center the view on the beat
            const totalDuration = this.audioEngine.getDuration();
            this.viewStartTime = Math.max(0, Math.min(
                beatTime - viewDuration / 2, 
                totalDuration - viewDuration
            ));
            this.redrawVisualization();
        }
    }

    highlightBeatMarker(beat) {
        // Add a temporary highlight effect to the beat marker
        const viewDuration = this.getViewDuration();
        const relativeTime = beat.time - this.viewStartTime;
        const position = (relativeTime / viewDuration) * 100;
        
        // Create temporary highlight
        const highlight = document.createElement('div');
        highlight.style.cssText = `
            position: absolute;
            left: ${position}%;
            top: 0;
            width: 3px;
            height: 100%;
            background: rgba(255, 255, 255, 0.8);
            pointer-events: none;
            animation: beatHighlight 0.8s ease-out forwards;
            z-index: 10;
        `;
        
        this.beatMarkers.appendChild(highlight);
        
        // Remove highlight after animation
        setTimeout(() => {
            if (highlight.parentNode) {
                highlight.parentNode.removeChild(highlight);
            }
        }, 800);
    }

    // Undo/Redo system methods
    saveSelectionToHistory() {
        // Don't save if it's the same as current
        if (this.historyIndex >= 0 && this.selectionHistory[this.historyIndex]) {
            const current = this.selectionHistory[this.historyIndex];
            if (Math.abs(current.start - this.selectionStart) < 0.001 && 
                Math.abs(current.duration - this.selectionDuration) < 0.001) {
                return;
            }
        }
        
        // Remove any history after current index (for branching)
        this.selectionHistory = this.selectionHistory.slice(0, this.historyIndex + 1);
        
        // Add new state
        this.selectionHistory.push({
            start: this.selectionStart,
            duration: this.selectionDuration,
            timestamp: Date.now()
        });
        
        // Limit history size
        if (this.selectionHistory.length > this.maxHistorySize) {
            this.selectionHistory = this.selectionHistory.slice(-this.maxHistorySize);
        }
        
        this.historyIndex = this.selectionHistory.length - 1;
        this.saveToLocalStorage();
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreSelectionFromHistory();
            console.log(`Undo: restored selection ${this.historyIndex + 1}/${this.selectionHistory.length}`);
        }
    }
    
    redo() {
        if (this.historyIndex < this.selectionHistory.length - 1) {
            this.historyIndex++;
            this.restoreSelectionFromHistory();
            console.log(`Redo: restored selection ${this.historyIndex + 1}/${this.selectionHistory.length}`);
        }
    }
    
    restoreSelectionFromHistory() {
        if (this.historyIndex >= 0 && this.historyIndex < this.selectionHistory.length) {
            const state = this.selectionHistory[this.historyIndex];
            this.selectionStart = state.start;
            this.selectionDuration = state.duration;
            
            this.updateInputValues();
            this.updateSelectionOverlay();
            this.debouncedUpdatePitchDisplay();
            if (this.selectionDuration >= 0.5) {
                this.debouncedAnalyzeSelectionQuality();
            }
        }
    }

    // Auto-save system
    saveToLocalStorage() {
        try {
            const state = {
                selectionHistory: this.selectionHistory,
                historyIndex: this.historyIndex,
                selectionStart: this.selectionStart,
                selectionDuration: this.selectionDuration,
                zoomLevel: this.zoomLevel,
                viewStartTime: this.viewStartTime,
                snapToZero: this.snapToZero,
                precisionMode: this.precisionMode,
                timestamp: Date.now()
            };
            localStorage.setItem('reviens_session', JSON.stringify(state));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('reviens_session');
            if (saved) {
                const state = JSON.parse(saved);
                
                // Only restore if less than 24 hours old
                if (Date.now() - state.timestamp < 24 * 60 * 60 * 1000) {
                    this.selectionHistory = state.selectionHistory || [];
                    this.historyIndex = state.historyIndex || -1;
                    this.selectionStart = state.selectionStart || 0;
                    this.selectionDuration = state.selectionDuration || 4;
                    this.zoomLevel = state.zoomLevel || 1;
                    this.viewStartTime = state.viewStartTime || 0;
                    this.snapToZero = state.snapToZero || false;
                    this.precisionMode = state.precisionMode || false;
                    
                    console.log(`Restored session with ${this.selectionHistory.length} history entries`);
                    return true;
                }
            }
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
        }
        return false;
    }

    // Help panel for keyboard shortcuts
    toggleHelpPanel() {
        const existingPanel = document.getElementById('helpPanel');
        if (existingPanel) {
            existingPanel.remove();
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'helpPanel';
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #111111;
            border: 2px solid #00ff00;
            border-radius: 4px;
            padding: 20px;
            z-index: 1000;
            color: #00ff00;
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            min-width: 400px;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
        `;

        panel.innerHTML = `
            <div style="text-align: center; margin-bottom: 15px; font-weight: bold; color: #ffffff;">
                KEYBOARD SHORTCUTS
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                    <div style="color: #ffffff; margin-bottom: 5px;">PLAYBACK:</div>
                    <div>SPACE → Play/Stop</div>
                    <div>R → Loop/Stop Loop</div>
                    <div>ESC → Reset View</div>
                </div>
                <div>
                    <div style="color: #ffffff; margin-bottom: 5px;">ANALYSIS:</div>
                    <div>A → Analyze Audio</div>
                    <div>S → Snap to Beat</div>
                    <div>F → Find & Select Best Loop</div>
                    <div>E → Export Loop</div>
                </div>
                <div>
                    <div style="color: #ffffff; margin-bottom: 5px;">NAVIGATION:</div>
                    <div>← → Previous Beat</div>
                    <div>→ → Next Beat</div>
                    <div>↑ → Previous Strong Beat</div>
                    <div>↓ → Next Strong Beat</div>
                </div>
                <div>
                    <div style="color: #ffffff; margin-bottom: 5px;">HISTORY:</div>
                    <div>Ctrl+Z → Undo</div>
                    <div>Ctrl+Y → Redo</div>
                    <div>Ctrl+Shift+Z → Redo</div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 15px; color: #666; font-size: 10px;">
                Click anywhere or press ESC to close
            </div>
        `;

        // Close on click or ESC
        panel.addEventListener('click', () => panel.remove());
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                panel.remove();
                document.removeEventListener('keydown', escHandler);
            }
        });

        document.body.appendChild(panel);
    }

    updateCrossfadeDisplay() {
        const value = this.crossfadeInput.value;
        this.crossfadeValue.textContent = `${value}ms`;
    }

    // Navigation slider methods
    handleNavigationSlider(event) {
        if (!this.audioEngine.getAudioData()) return;
        
        const totalDuration = this.audioEngine.getDuration();
        const sliderValue = parseFloat(event.target.value) / 100;
        const viewDuration = this.getViewDuration();
        
        // Calculate new view start time
        this.viewStartTime = Math.max(0, Math.min(
            sliderValue * (totalDuration - viewDuration),
            totalDuration - viewDuration
        ));
        
        this.redrawVisualization();
        this.updateNavigationSlider();
    }

    updateNavigationSlider() {
        if (!this.audioEngine.getAudioData()) {
            this.navigationSlider.style.display = 'none';
            return;
        }
        
        this.navigationSlider.style.display = 'block';
        
        const totalDuration = this.audioEngine.getDuration();
        const viewDuration = this.getViewDuration();
        const viewEndTime = this.getViewEndTime();
        
        // Update slider position based on current view
        if (viewDuration >= totalDuration) {
            // Viewing entire track
            this.navigationSlider.value = 0;
            this.navigationSlider.disabled = true;
        } else {
            this.navigationSlider.disabled = false;
            const sliderPosition = (this.viewStartTime / (totalDuration - viewDuration)) * 100;
            this.navigationSlider.value = Math.max(0, Math.min(100, sliderPosition));
        }
        
        // Update labels
        this.sliderStart.textContent = this.formatTime(this.viewStartTime);
        this.sliderEnd.textContent = this.formatTime(viewEndTime);
    }

    // Enhanced playback with better cursor tracking
    async togglePlayback() {
        if (this.audioEngine.isPlaying || this.playbackManager.isPlaybackActive()) {
            this.audioEngine.stopPlayback();
            this.playbackManager.stopPlayback();
            this.playBtn.textContent = '[ PLAY ]';
            this.playBtn.disabled = false;
        } else {
            if (!this.audioEngine.getAudioData()) {
                this.showError('no audio loaded');
                return;
            }
            
            try {
                this.playBtn.textContent = '[ STOP ]';
                this.showGlobalLoading('starting playback...');
                
                // Start playback cursor - ensure it's visible
                this.playbackManager.startPlayback(
                    this.selectionStart, 
                    this.selectionDuration,
                    this.viewStartTime,
                    this.zoomLevel
                );
                
                this.hideGlobalLoading();
                await this.audioEngine.playSelection(this.selectionStart, this.selectionDuration);
                
                this.playBtn.textContent = '[ PLAY ]';
                this.playBtn.disabled = false;
                this.playbackManager.stopPlayback();
            } catch (error) {
                console.error('Playback failed:', error);
                this.showError(`playback failed: ${error.message}`);
                this.playBtn.textContent = '[ PLAY ]';
                this.playBtn.disabled = false;
                this.playbackManager.stopPlayback();
                this.hideGlobalLoading();
            }
        }
    }

    async toggleLoop() {
        if (this.audioEngine.isPlaying || this.playbackManager.isPlaybackActive()) {
            this.audioEngine.stopPlayback();
            this.playbackManager.stopPlayback();
            this.loopBtn.textContent = '[ LOOP ]';
            this.loopBtn.disabled = false;
        } else {
            if (!this.audioEngine.getAudioData()) {
                this.showError('no audio loaded');
                return;
            }
            
            try {
                this.loopBtn.textContent = '[ STOP_LOOP ]';
                this.showGlobalLoading('preparing loop...');
                
                const crossfadeMs = parseInt(this.crossfadeInput.value);
                const crossfadeType = this.crossfadeTypeInput.value;
                const clickReduction = this.clickReductionInput.checked;
                
                // Start loop playback cursor - this should make it visible
                this.playbackManager.startLoopPlayback(
                    this.selectionStart,
                    this.selectionDuration,
                    this.viewStartTime,
                    this.zoomLevel
                );
                
                this.hideGlobalLoading();
                await this.audioEngine.playLoop(this.selectionStart, this.selectionDuration, crossfadeMs, crossfadeType, clickReduction);
                
                this.loopBtn.textContent = '[ LOOP ]';
                this.loopBtn.disabled = false;
                this.playbackManager.stopPlayback();
            } catch (error) {
                console.error('Loop playback failed:', error);
                this.showError(`loop playback failed: ${error.message}`);
                this.loopBtn.textContent = '[ LOOP ]';
                this.loopBtn.disabled = false;
                this.playbackManager.stopPlayback();
                this.hideGlobalLoading();
            }
        }
    }

    // Enhanced analysis with loading feedback
    async analyzeCurrentSelection() {
        if (!this.audioEngine.getAudioData()) {
            this.showError('no audio loaded');
            return;
        }

        this.analyzeBtn.textContent = '[ ANALYZING... ]';
        this.analyzeBtn.disabled = true;
        this.showGlobalLoading('analyzing audio patterns...')

        try {
            // Detect beats and BPM
            const beatResults = this.loopAnalyzer.detectBeats();
            
            if (beatResults.bpm) {
                this.bpmInput.value = beatResults.bpm;
            }

            // Detect pitch for current selection
            this.updatePitchDisplay();

            // Enable snap controls if beats were detected
            if (beatResults.beats && beatResults.beats.length > 0) {
                this.snapToBeatInput.disabled = false;
                this.snapToNearestBeatBtn.disabled = false;
            }

            this.redrawVisualization();
            this.analyzeSelectionQuality();
            this.updateKeyInfoDisplays();
            this.hideGlobalLoading();

            this.analyzeBtn.textContent = '[ ANALYSIS_COMPLETE ]';
            setTimeout(() => {
                this.analyzeBtn.textContent = '[ ANALYZE ]';
                this.analyzeBtn.disabled = false;
            }, 2000);

        } catch (error) {
            console.error('Analysis failed:', error);
            this.showError(`analysis failed: ${error.message}`);
            this.analyzeBtn.textContent = '[ ANALYZE ]';
            this.analyzeBtn.disabled = false;
            this.hideGlobalLoading();
        }
    }

    analyzeSelectionQuality() {
        if (!this.audioEngine.getAudioData()) return;

        const quality = this.loopAnalyzer.analyzeLoopQuality(this.selectionStart, this.selectionDuration);
        this.displayLoopAnalysis(quality);
        this.updateKeyInfoDisplays();
    }

    findPerfectLoops() {
        if (!this.audioEngine.getAudioData()) {
            this.showError('no audio loaded');
            return;
        }

        // Get user parameters
        const minDuration = parseFloat(this.minDurationInput.value) || 2;
        const maxDuration = parseFloat(this.maxDurationInput.value) || 8;
        const searchMode = this.searchModeInput.value;

        if (minDuration >= maxDuration) {
            this.showError('min duration must be less than max duration');
            return;
        }

        this.findLoopsBtn.textContent = '[ SEARCHING... ]';
        this.findLoopsBtn.disabled = true;
        
        const searchArea = searchMode === 'full_track' ? 'entire track' : 
                          `around selection (${this.selectionStart.toFixed(1)}s)`;
        this.showGlobalLoading(`searching ${searchArea} for loops ${minDuration}s-${maxDuration}s...`);

        try {
            // Get all potential loops in the duration range
            const allSuggestions = this.findLoopsInRange(minDuration, maxDuration, searchMode);
            
            if (allSuggestions.length === 0) {
                this.showError(`no good loops found between ${minDuration}s-${maxDuration}s`);
                this.hideGlobalLoading();
                this.findLoopsBtn.textContent = '[ FIND_BEST_LOOP ]';
                this.findLoopsBtn.disabled = false;
                return;
            }

            // Sort by quality and get the best one
            allSuggestions.sort((a, b) => b.quality - a.quality);
            const bestLoop = allSuggestions[0];
            
            // Automatically select the best loop
            this.selectBestLoop(bestLoop);
            
            // Store all suggestions for display
            this.currentSuggestions = allSuggestions.slice(0, 10); // Top 10
            this.displayLoopSuggestions();
            this.redrawVisualization();
            this.hideGlobalLoading();

            const foundType = allSuggestions.some(s => s.musicalAlignment) ? 'MUSICAL' : 'STANDARD';
            this.findLoopsBtn.textContent = `[ SELECTED_BEST_OF_${allSuggestions.length} ]`;
            setTimeout(() => {
                this.findLoopsBtn.textContent = '[ FIND_BEST_LOOP ]';
                this.findLoopsBtn.disabled = false;
            }, 3000);

        } catch (error) {
            console.error('Loop finding failed:', error);
            this.showError(`loop search failed: ${error.message}`);
            this.findLoopsBtn.textContent = '[ FIND_BEST_LOOP ]';
            this.findLoopsBtn.disabled = false;
            this.hideGlobalLoading();
        }
    }

    findLoopsInRange(minDuration, maxDuration, searchMode) {
        const allSuggestions = [];
        const stepSize = 0.25; // Check every 0.25 seconds
        
        // Determine search area
        let searchStart, searchEnd;
        const totalDuration = this.audioEngine.getDuration();
        
        if (searchMode === 'around_selection') {
            // Search within ±30 seconds of current selection, or full track if smaller
            const searchRadius = Math.min(30, totalDuration / 4);
            searchStart = Math.max(0, this.selectionStart - searchRadius);
            searchEnd = Math.min(totalDuration, this.selectionStart + searchRadius);
        } else {
            // Search entire track
            searchStart = 0;
            searchEnd = totalDuration;
        }

        // Try different durations in the range
        for (let duration = minDuration; duration <= maxDuration; duration += stepSize) {
            // Try musical loops first if we have beats
            const musicalLoops = this.loopAnalyzer.findMusicalLoops(duration, 0.3);
            const validMusicalLoops = musicalLoops.filter(loop => 
                loop.startTime >= searchStart && 
                loop.startTime + loop.duration <= searchEnd
            );
            
            allSuggestions.push(...validMusicalLoops);
            
            // If no musical loops for this duration, try standard analysis
            if (validMusicalLoops.length === 0) {
                const standardLoops = this.loopAnalyzer.findPerfectLoops(duration, 0.2);
                const validStandardLoops = standardLoops.filter(loop => 
                    loop.startTime >= searchStart && 
                    loop.startTime + loop.duration <= searchEnd &&
                    loop.quality > 0.4 // Only decent quality
                );
                
                allSuggestions.push(...validStandardLoops);
            }
        }

        // Remove duplicates (loops that are very close to each other)
        return this.removeDuplicateLoops(allSuggestions);
    }

    removeDuplicateLoops(loops) {
        const filtered = [];
        const tolerance = 0.1; // 100ms tolerance
        
        for (const loop of loops) {
            const isDuplicate = filtered.some(existing => 
                Math.abs(existing.startTime - loop.startTime) < tolerance &&
                Math.abs(existing.duration - loop.duration) < tolerance
            );
            
            if (!isDuplicate) {
                filtered.push(loop);
            }
        }
        
        return filtered;
    }

    selectBestLoop(loop) {
        // Automatically select the best loop found
        this.selectionStart = loop.startTime;
        this.selectionDuration = loop.duration;
        
        // Save to history
        this.saveSelectionToHistory();
        
        // Update UI
        this.updateInputValues();
        this.updateSelectionOverlay();
        this.zoomToSelection();
        
        // Analyze the selected loop
        const quality = this.loopAnalyzer.analyzeLoopQuality(loop.startTime, loop.duration);
        this.displayLoopAnalysis(quality);
        this.updatePitchDisplay();
        
        console.log(`Auto-selected best loop: ${loop.startTime.toFixed(2)}s, ${loop.duration.toFixed(2)}s (${(loop.quality * 100).toFixed(0)}% quality)`);
    }

    // Enhanced beat snapping with musical intelligence
    snapSelectionToBeat() {
        const beatPositions = this.loopAnalyzer.getBeatPositions();
        if (!beatPositions || beatPositions.length === 0) {
            this.showError('no beats detected - analyze first');
            return;
        }

        const detectedBPM = this.loopAnalyzer.getDetectedBPM();
        if (!detectedBPM) {
            this.showError('no bpm detected - analyze first');
            return;
        }

        // Try musical phrase-aware snapping first
        const musicalSnap = this.tryMusicalPhraseSnap(beatPositions, detectedBPM);
        if (musicalSnap) {
            this.applySnapResult(musicalSnap);
            return;
        }

        // Fallback to enhanced beat snapping
        const beatSnap = this.tryEnhancedBeatSnap(beatPositions, detectedBPM);
        if (beatSnap) {
            this.applySnapResult(beatSnap);
        }
    }

    tryMusicalPhraseSnap(beatPositions, detectedBPM) {
        const phrases = this.loopAnalyzer.detectPhrases();
        const downbeats = phrases.downbeats;
        
        if (downbeats.length < 2) return null;
        
        // Find the best downbeat near current selection
        const targetStart = this.selectionStart;
        let bestDownbeat = null;
        let minDistance = Infinity;
        
        for (const downbeat of downbeats) {
            const distance = Math.abs(downbeat.time - targetStart);
            if (distance < minDistance) {
                minDistance = distance;
                bestDownbeat = downbeat;
            }
        }
        
        if (!bestDownbeat || minDistance > 2.0) return null; // Too far from any downbeat
        
        // Get target duration
        let beatLength = this.getTargetBeatLength();
        const beatDuration = 60 / detectedBPM;
        let targetDuration = beatLength * beatDuration;
        
        // Find the best ending downbeat
        const targetEnd = bestDownbeat.time + targetDuration;
        let bestEndDownbeat = null;
        let minEndDistance = Infinity;
        
        for (const downbeat of downbeats) {
            if (downbeat.time <= bestDownbeat.time) continue;
            const distance = Math.abs(downbeat.time - targetEnd);
            if (distance < minEndDistance) {
                minEndDistance = distance;
                bestEndDownbeat = downbeat;
            }
        }
        
        if (bestEndDownbeat && minEndDistance < beatDuration) {
            return {
                startTime: bestDownbeat.time,
                duration: bestEndDownbeat.time - bestDownbeat.time,
                type: 'musical_phrase',
                confidence: (bestDownbeat.confidence + bestEndDownbeat.confidence) / 2,
                startBar: bestDownbeat.barNumber,
                endBar: bestEndDownbeat.barNumber
            };
        }
        
        return null;
    }

    tryEnhancedBeatSnap(beatPositions, detectedBPM) {
        // Find best starting beat considering beat strength and type
        const targetStart = this.selectionStart;
        const candidates = this.findBeatCandidates(beatPositions, targetStart);
        
        if (candidates.length === 0) return null;
        
        // Score candidates based on multiple factors
        const scoredCandidates = candidates.map(candidate => {
            const beat = candidate.beat;
            const distance = candidate.distance;
            
            // Base score from beat strength
            let score = beat.strength || 0.5;
            
            // Penalize distance
            const maxDistance = 60 / detectedBPM; // One beat duration
            const distancePenalty = Math.min(1, distance / maxDistance);
            score *= (1 - distancePenalty * 0.5);
            
            // Bonus for strong beats (likely downbeats)
            if (beat.isStrong) {
                score *= 1.3;
            }
            
            // Bonus for beats with good onset characteristics
            if (beat.onsetType === 'percussive') {
                score *= 1.2;
            }
            
            return { ...candidate, score };
        });
        
        // Sort by score and pick the best
        scoredCandidates.sort((a, b) => b.score - a.score);
        const bestCandidate = scoredCandidates[0];
        
        // Calculate optimal duration
        const beatLength = this.getTargetBeatLength();
        const beatDuration = 60 / detectedBPM;
        let duration = beatLength * beatDuration;
        
        // Try to align end with another strong beat
        const idealEndTime = bestCandidate.beat.time + duration;
        const endBeat = this.findNearestStrongBeat(beatPositions, idealEndTime, beatDuration * 0.5);
        
        if (endBeat) {
            duration = endBeat.time - bestCandidate.beat.time;
        }
        
        return {
            startTime: bestCandidate.beat.time,
            duration: duration,
            type: 'enhanced_beat',
            confidence: bestCandidate.score,
            beatType: bestCandidate.beat.isStrong ? 'strong' : 'regular'
        };
    }

    findBeatCandidates(beatPositions, targetTime) {
        const candidates = [];
        const maxDistance = 1.0; // Maximum 1 second away
        
        for (const beat of beatPositions) {
            const distance = Math.abs(beat.time - targetTime);
            if (distance <= maxDistance) {
                candidates.push({ beat, distance });
            }
        }
        
        return candidates;
    }

    findNearestStrongBeat(beatPositions, targetTime, tolerance) {
        let bestBeat = null;
        let minDistance = tolerance;
        
        for (const beat of beatPositions) {
            if (!beat.isStrong) continue;
            const distance = Math.abs(beat.time - targetTime);
            if (distance < minDistance) {
                minDistance = distance;
                bestBeat = beat;
            }
        }
        
        return bestBeat;
    }

    getTargetBeatLength() {
        if (this.beatLengthInput.value === 'custom') {
            return parseFloat(this.manualBeatsInput.value) || 4;
        } else {
            return parseFloat(this.beatLengthInput.value);
        }
    }

    applySnapResult(snapResult) {
        let newStart = snapResult.startTime;
        let newDuration = snapResult.duration;
        
        // Apply zero crossing snap if enabled
        if (this.snapToZero) {
            newStart = this.findNearestZeroCrossing(newStart);
            const newEnd = this.findNearestZeroCrossing(newStart + newDuration);
            newDuration = newEnd - newStart;
        }
        
        this.selectionStart = newStart;
        this.selectionDuration = Math.min(newDuration, this.audioEngine.getDuration() - this.selectionStart);
        
        this.updateInputValues();
        this.updateSelectionOverlay();
        this.analyzeSelectionQuality();
        this.updatePitchDisplay();
        
        // Enhanced feedback
        let message = `snapped to ${snapResult.type}`;
        if (snapResult.startBar && snapResult.endBar) {
            message += ` (bars ${snapResult.startBar}-${snapResult.endBar})`;
        }
        message += ` at ${newStart.toFixed(3)}s, duration: ${newDuration.toFixed(3)}s`;
        message += ` (confidence: ${(snapResult.confidence * 100).toFixed(0)}%)`;
        
        console.log(message);
    }

    findNearestBeat(targetTime, beatPositions) {
        let nearestBeat = null;
        let minDistance = Infinity;

        for (const beat of beatPositions) {
            const distance = Math.abs(beat.time - targetTime);
            if (distance < minDistance) {
                minDistance = distance;
                nearestBeat = beat;
            }
        }

        return nearestBeat;
    }

    // Enhanced Main Application - Part 4: Display & Export
// Continue from Part 3...

    displayLoopAnalysis(quality) {
        this.loopAnalysis.innerHTML = `
            <div class="terminal-output">
                <p>quality: ${(quality.score * 100).toFixed(1)}% - ${this.loopAnalyzer.getQualityDescription(quality.score).toLowerCase()}</p>
                <p>seamlessness: ${(quality.seamlessness * 100).toFixed(1)}%</p>
                <p>energy_consistency: ${(quality.energy * 100).toFixed(1)}%</p>
                <p>spectral_match: ${(quality.spectralMatch * 100).toFixed(1)}%</p>
                <p>rhythmic_fit: ${(quality.rhythmicFit * 100).toFixed(1)}%</p>
                <p>duration: ${this.selectionDuration.toFixed(3)}s</p>
                ${quality.score >= 0.8 ? '<p style="color: #00ff00;">status: excellent loop potential</p>' : ''}
                ${quality.score < 0.5 ? '<p style="color: #ff0000;">warning: consider adjusting selection</p>' : ''}
                ${this.snapToZero ? '<p style="color: #ffff00;">zero_crossing_snap: enabled</p>' : ''}
            </div>
        `;
    }

    displayLoopSuggestions() {
        if (this.currentSuggestions.length === 0) {
            this.suggestionsList.innerHTML = '<div class="terminal-output">no loops found in specified range<br>try adjusting min/max duration or search mode</div>';
            return;
        }

        this.suggestionsList.innerHTML = '';
        
        this.currentSuggestions.forEach((suggestion, index) => {
            const div = document.createElement('div');
            div.className = 'loop-suggestion';
            div.dataset.index = index;
            
            // Mark the first one as selected (it's the best and already applied)
            if (index === 0) {
                div.classList.add('selected');
                div.style.border = '2px solid #00ff00';
            }
            
            div.innerHTML = `
                <h5>${index === 0 ? '★ SELECTED' : `option_${index + 1}`} - ${(suggestion.quality * 100).toFixed(1)}% quality</h5>
                <p>start: ${suggestion.startTime.toFixed(3)}s | duration: ${suggestion.duration.toFixed(3)}s</p>
                <p>analysis: ${suggestion.description.toLowerCase()}</p>
                <div class="quality-bar">
                    <div class="quality-fill" style="width: ${suggestion.quality * 100}%"></div>
                </div>
                <p style="font-size: 10px; opacity: 0.6; margin-top: 5px;">
                    ${index === 0 ? 'currently selected (best found)' : 'click to select this option'}
                </p>
            `;
            
            div.addEventListener('click', () => this.selectLoopSuggestion(index));
            this.suggestionsList.appendChild(div);
        });
    }

    selectLoopSuggestion(index) {
        document.querySelectorAll('.loop-suggestion').forEach(s => s.classList.remove('selected'));
        
        const suggestionEl = document.querySelector(`[data-index="${index}"]`);
        if (suggestionEl) {
            suggestionEl.classList.add('selected');
        }
        
        const suggestion = this.currentSuggestions[index];
        
        this.selectionStart = suggestion.startTime;
        this.selectionDuration = suggestion.duration;
        
        this.updateInputValues();
        this.updateSelectionOverlay();
        this.zoomToSelection();
        
        const quality = this.loopAnalyzer.analyzeLoopQuality(suggestion.startTime, suggestion.duration);
        this.displayLoopAnalysis(quality);
        this.updatePitchDisplay();
        
        this.redrawVisualization();
    }

    zoomToSelection() {
        const totalDuration = this.audioEngine.getDuration();
        const padding = this.selectionDuration * 0.5;
        const neededDuration = this.selectionDuration + (padding * 2);
        
        const maxZoom = Math.min(50, totalDuration / neededDuration);
        
        if (maxZoom > this.zoomLevel) {
            this.zoomLevel = Math.min(maxZoom, 20);
            this.zoomInput.value = this.zoomLevel;
        }
        
        const centerTime = this.selectionStart + (this.selectionDuration / 2);
        const viewDuration = this.getViewDuration();
        this.viewStartTime = Math.max(0, Math.min(centerTime - (viewDuration / 2), totalDuration - viewDuration));
        
        this.redrawVisualization();
    }

    // Enhanced export with loading feedback
    async exportCurrentLoop() {
        if (!this.audioEngine.getAudioData()) {
            this.showError('no audio loaded');
            return;
        }

        if (this.exportManager.isExportInProgress()) {
            this.showError('export already in progress');
            return;
        }

        try {
            this.showExportProgress();
            this.showGlobalLoading('preparing export...');
            
            const crossfadeMs = parseInt(this.crossfadeInput.value);
            const crossfadeType = this.crossfadeTypeInput.value;
            const clickReduction = this.clickReductionInput.checked;
            
            await this.exportManager.exportLoop(
                this.selectionStart,
                this.selectionDuration,
                crossfadeMs,
                crossfadeType,
                clickReduction,
                (progress, status) => {
                    this.updateExportProgress(progress, status);
                    this.loadingMessage.textContent = status;
                }
            );
            
            this.hideExportProgress();
            this.hideGlobalLoading();
            
        } catch (error) {
            console.error('Export failed:', error);
            this.showError(`export failed: ${error.message}`);
            this.hideExportProgress();
            this.hideGlobalLoading();
        }
    }

    showExportProgress() {
        this.exportProgress.style.display = 'block';
    }

    hideExportProgress() {
        this.exportProgress.style.display = 'none';
    }

    updateExportProgress(percentage, status) {
        this.exportStatus.textContent = status;
        this.exportProgressFill.style.width = `${percentage}%`;
    }

    // Smart duration suggestions based on musical analysis
    showDurationSuggestions() {
        if (!this.audioEngine.getAudioData()) return;
        
        const suggestions = this.calculateSmartDurations();
        if (suggestions.length === 0) return;
        
        this.createDurationSuggestionsUI(suggestions);
    }

    calculateSmartDurations() {
        const suggestions = [];
        const detectedBPM = this.loopAnalyzer.getDetectedBPM();
        
        if (detectedBPM) {
            const beatDuration = 60 / detectedBPM;
            
            // Musical duration suggestions
            const musicalLengths = [
                { beats: 0.5, name: '1/2 beat' },
                { beats: 1, name: '1 beat' },
                { beats: 2, name: '2 beats' },
                { beats: 4, name: '1 bar' },
                { beats: 8, name: '2 bars' },
                { beats: 16, name: '4 bars' },
                { beats: 32, name: '8 bars' }
            ];
            
            for (const length of musicalLengths) {
                const duration = length.beats * beatDuration;
                const totalDuration = this.audioEngine.getDuration();
                
                if (duration <= totalDuration - this.selectionStart) {
                    suggestions.push({
                        duration: duration,
                        label: `${length.name} (${duration.toFixed(2)}s)`,
                        type: 'musical',
                        beats: length.beats
                    });
                }
            }
        }
        
        // Phrase-based suggestions
        const phrases = this.loopAnalyzer.detectPhrases();
        if (phrases.phrases && phrases.phrases.length > 0) {
            const uniqueDurations = new Set();
            
            for (const phrase of phrases.phrases) {
                const duration = phrase.duration;
                if (!uniqueDurations.has(duration) && duration > 1.0) {
                    uniqueDurations.add(duration);
                    suggestions.push({
                        duration: duration,
                        label: `phrase (${duration.toFixed(2)}s)`,
                        type: 'phrase',
                        energy: phrase.energy
                    });
                }
            }
        }
        
        // Natural loop suggestions based on current position
        const naturalLoops = this.findNaturalLoopDurations();
        suggestions.push(...naturalLoops);
        
        // Sort by relevance and remove duplicates
        return this.filterAndSortSuggestions(suggestions);
    }

    findNaturalLoopDurations() {
        const suggestions = [];
        const startTime = this.selectionStart;
        const maxDuration = this.audioEngine.getDuration() - startTime;
        
        // Try different durations and score them
        const testDurations = [1, 2, 4, 8, 16, 32].map(beats => {
            const detectedBPM = this.loopAnalyzer.getDetectedBPM() || 120;
            return beats * (60 / detectedBPM);
        }).filter(d => d <= maxDuration);
        
        for (const duration of testDurations) {
            const quality = this.loopAnalyzer.analyzeLoopQuality(startTime, duration);
            if (quality.score > 0.5) {
                suggestions.push({
                    duration: duration,
                    label: `natural loop (${duration.toFixed(2)}s)`,
                    type: 'natural',
                    quality: quality.score
                });
            }
        }
        
        return suggestions;
    }

    filterAndSortSuggestions(suggestions) {
        // Remove near-duplicates
        const filtered = [];
        const tolerance = 0.1;
        
        for (const suggestion of suggestions) {
            const isDuplicate = filtered.some(existing => 
                Math.abs(existing.duration - suggestion.duration) < tolerance
            );
            
            if (!isDuplicate) {
                filtered.push(suggestion);
            }
        }
        
        // Sort by type priority and quality
        return filtered.sort((a, b) => {
            const typePriority = { musical: 3, phrase: 2, natural: 1 };
            const aPriority = typePriority[a.type] || 0;
            const bPriority = typePriority[b.type] || 0;
            
            if (aPriority !== bPriority) {
                return bPriority - aPriority;
            }
            
            // Within same type, sort by quality/relevance
            const aQuality = a.quality || a.energy || 0.5;
            const bQuality = b.quality || b.energy || 0.5;
            return bQuality - aQuality;
        }).slice(0, 8); // Limit to 8 suggestions
    }

    createDurationSuggestionsUI(suggestions) {
        // Remove existing suggestions
        this.removeDurationSuggestions();
        
        const container = document.createElement('div');
        container.className = 'duration-suggestions';
        container.style.cssText = `
            position: absolute;
            background: #111111;
            border: 1px solid #333333;
            border-radius: 4px;
            padding: 8px;
            z-index: 1000;
            font-size: 11px;
            max-height: 200px;
            overflow-y: auto;
            min-width: 200px;
        `;
        
        const header = document.createElement('div');
        header.textContent = 'suggested durations:';
        header.style.cssText = `
            color: #666666;
            margin-bottom: 6px;
            font-size: 10px;
        `;
        container.appendChild(header);
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'duration-suggestion-item';
            item.textContent = suggestion.label;
            item.style.cssText = `
                padding: 4px 6px;
                cursor: pointer;
                border-radius: 2px;
                color: #00ff00;
                transition: background-color 0.2s;
            `;
            
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#333333';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'transparent';
            });
            
            item.addEventListener('click', () => {
                this.durationInput.value = suggestion.duration.toFixed(3);
                this.updateSelectionFromInput();
                this.removeDurationSuggestions();
            });
            
            container.appendChild(item);
        });
        
        // Position relative to duration input
        const inputRect = this.durationInput.getBoundingClientRect();
        container.style.left = inputRect.left + 'px';
        container.style.top = (inputRect.bottom + 4) + 'px';
        
        container.id = 'durationSuggestions';
        document.body.appendChild(container);
    }

    hideDurationSuggestions() {
        // Delay hiding to allow clicks
        setTimeout(() => this.removeDurationSuggestions(), 200);
    }

    removeDurationSuggestions() {
        const existing = document.getElementById('durationSuggestions');
        if (existing) {
            existing.remove();
        }
    }

    // Debounced methods for performance optimization
    debounce(func, delay, key) {
        if (this.debounceTimers[key]) {
            clearTimeout(this.debounceTimers[key]);
        }
        this.debounceTimers[key] = setTimeout(() => {
            func();
            delete this.debounceTimers[key];
        }, delay);
    }

    debouncedUpdatePitchDisplay() {
        this.debounce(() => this.updatePitchDisplay(), 150, 'pitch');
    }

    debouncedAnalyzeSelectionQuality() {
        const now = Date.now();
        // Throttle analysis to max once per 200ms
        if (now - this.lastAnalysisTime < 200) {
            this.debounce(() => {
                this.analyzeSelectionQuality();
                this.lastAnalysisTime = Date.now();
            }, 200, 'analysis');
        } else {
            this.analyzeSelectionQuality();
            this.lastAnalysisTime = now;
        }
    }
    
    // Tab switching functionality
    switchTab(tabName) {
        // Remove active class from all tabs and content
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        const activeTabButton = document.querySelector(`[data-tab="${tabName}"]`);
        const activeTabContent = document.querySelector(`[data-tab="${tabName}"].tab-content`);
        
        if (activeTabButton && activeTabContent) {
            activeTabButton.classList.add('active');
            activeTabContent.classList.add('active');
        }
    }
    
    // Add visual focus indicators to clarify which control responds to keyboard input
    addFocusIndicators() {
        // Canvas focus indicator
        this.waveformCanvas.setAttribute('tabindex', '0');
        this.waveformCanvas.addEventListener('focus', () => {
            this.waveformCanvas.style.outline = '2px solid #00ff00';
            this.waveformCanvas.style.outlineOffset = '2px';
            this.showFocusHint('Visualization active - arrows navigate beats, mouse wheel zooms');
        });
        
        this.waveformCanvas.addEventListener('blur', () => {
            this.waveformCanvas.style.outline = 'none';
            this.hideFocusHint();
        });
        
        // Beat length selector focus indicator
        this.beatLengthInput.addEventListener('focus', () => {
            this.beatLengthInput.parentElement.style.outline = '2px solid #ffff00';
            this.beatLengthInput.parentElement.style.outlineOffset = '1px';
            this.showFocusHint('Beat selector active - arrows change beat length');
        });
        
        this.beatLengthInput.addEventListener('blur', () => {
            this.beatLengthInput.parentElement.style.outline = 'none';
            this.hideFocusHint();
        });
        
        // Add focus indicators for other form inputs that might conflict
        const formInputs = [
            this.startTimeInput, this.durationInput, this.zoomInput, 
            this.crossfadeInput, this.minDurationInput, this.maxDurationInput, this.manualBeatsInput
        ];
        
        formInputs.forEach(input => {
            if (input) {
                input.addEventListener('focus', () => {
                    this.showFocusHint('Input field active - arrows adjust values');
                });
                input.addEventListener('blur', () => {
                    this.hideFocusHint();
                });
            }
        });
        
        // Click on canvas to focus it
        this.waveformCanvas.addEventListener('click', () => {
            this.waveformCanvas.focus();
        });
    }
    
    // Show focus hint
    showFocusHint(message) {
        this.hideFocusHint(); // Remove any existing hint
        
        const hint = document.createElement('div');
        hint.id = 'focusHint';
        hint.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid #00ff00;
            color: #00ff00;
            padding: 8px 16px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            z-index: 1000;
            border-radius: 3px;
            box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
            pointer-events: none;
        `;
        hint.textContent = message;
        document.body.appendChild(hint);
        
        // Auto-hide after 3 seconds
        setTimeout(() => this.hideFocusHint(), 3000);
    }
    
    // Hide focus hint
    hideFocusHint() {
        const existingHint = document.getElementById('focusHint');
        if (existingHint) {
            existingHint.remove();
        }
    }
    
    // Update key info displays
    updateKeyInfoDisplays() {
        const bpmDisplay = document.getElementById('bpmDisplay');
        const pitchDisplay = document.getElementById('pitchDisplay');
        const qualityDisplay = document.getElementById('qualityDisplay');
        
        console.log('Updating key info displays...');
        
        // Update BPM
        if (bpmDisplay) {
            const bpm = this.loopAnalyzer.getDetectedBPM();
            console.log('BPM from analyzer:', bpm);
            bpmDisplay.textContent = bpm ? `${bpm}` : '--';
        }
        
        // Update pitch
        if (pitchDisplay) {
            const formattedPitch = this.detectedPitch ? 
                this.pitchDetector.formatPitchResult(this.detectedPitch) : '--';
            console.log('Formatted pitch for display:', formattedPitch);
            pitchDisplay.textContent = formattedPitch;
        }
        
        // Update quality for current selection
        if (qualityDisplay && this.audioEngine.getAudioData()) {
            const quality = this.loopAnalyzer.analyzeLoopQuality(this.selectionStart, this.selectionDuration);
            const percentage = Math.round(quality.score * 100);
            qualityDisplay.textContent = percentage > 0 ? `${percentage}%` : '--';
            
            // Color code the quality
            if (percentage >= 80) {
                qualityDisplay.style.color = '#00ff00';
            } else if (percentage >= 60) {
                qualityDisplay.style.color = '#ffff00';
            } else if (percentage >= 40) {
                qualityDisplay.style.color = '#ff8800';
            } else {
                qualityDisplay.style.color = '#ff4444';
            }
        }
    }

}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.reviensApp = new ReviensApp();
});