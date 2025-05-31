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
        this.snapToZero = false;
        this.precisionMode = false;
        
        this.initializeElements();
        this.setupEventListeners();
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
        this.manualBeatGroup = document.getElementById('manualBeatGroup');
        this.snapToNearestBeatBtn = document.getElementById('snapToNearestBeat');
        this.findLoopsBtn = document.getElementById('findLoopsBtn');
        
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
                this.manualBeatGroup.style.display = 'block';
            } else {
                this.manualBeatGroup.style.display = 'none';
            }
        });
        
        // Buttons
        this.playBtn.addEventListener('click', () => this.togglePlayback());
        this.loopBtn.addEventListener('click', () => this.toggleLoop());
        this.analyzeBtn.addEventListener('click', () => this.analyzeCurrentSelection());
        this.exportBtn.addEventListener('click', () => this.exportCurrentLoop());
        this.resetViewBtn.addEventListener('click', () => this.resetView());
        this.findLoopsBtn.addEventListener('click', () => this.findPerfectLoops());
        this.snapToNearestBeatBtn.addEventListener('click', () => this.snapSelectionToBeat());
        
        // Window resize
        window.addEventListener('resize', () => this.redrawVisualization());
        
        // Prevent context menu on canvas
        this.waveformCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
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

            setTimeout(() => {
                this.hideProgress();
                this.hideGlobalLoading();
            }, 500);

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
        
        beatPositions.forEach(beat => {
            if (beat.time >= this.viewStartTime && beat.time <= viewEndTime) {
                const relativeTime = beat.time - this.viewStartTime;
                const position = (relativeTime / viewDuration) * 100;
                
                const marker = document.createElement('div');
                marker.className = beat.isStrong ? 'beat-marker strong' : 'beat-marker';
                marker.style.left = `${position}%`;
                marker.title = `beat: ${beat.time.toFixed(2)}s ${beat.isStrong ? '(strong)' : ''}`;
                this.beatMarkers.appendChild(marker);
            }
        });
    }

    // Enhanced selection handling with zero crossing snap
    startSelection(event) {
        if (!this.audioEngine.getAudioData()) return;
        
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
        if (!this.isSelecting || !this.audioEngine.getAudioData()) return;
        
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
        this.updatePitchDisplay();
        
        event.preventDefault();
    }

    endSelection() {
        if (!this.isSelecting) return;
        
        this.isSelecting = false;
        
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
        this.updatePitchDisplay();
        
        if (this.selectionDuration >= 0.5) {
            this.analyzeSelectionQuality();
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
    }

    // Enhanced Main Application - Part 3: Analysis & Playback
// Continue from Part 2...

    // Enhanced pitch analysis
    updatePitchDisplay() {
        if (!this.audioEngine.getAudioData() || this.selectionDuration < 0.1) {
            this.pitchInput.value = '--';
            return;
        }

        const audioData = this.audioEngine.getAudioData();
        const sampleRate = this.audioEngine.getSampleRate();
        
        this.detectedPitch = this.pitchDetector.getAveragePitch(
            audioData, sampleRate, this.selectionStart, this.selectionDuration
        );
        
        this.pitchInput.value = this.pitchDetector.formatPitchResult(this.detectedPitch);
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

    updateCrossfadeDisplay() {
        const value = this.crossfadeInput.value;
        this.crossfadeValue.textContent = `${value}ms`;
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
    }

    findPerfectLoops() {
        if (!this.audioEngine.getAudioData()) {
            this.showError('no audio loaded');
            return;
        }

        this.findLoopsBtn.textContent = '[ SEARCHING... ]';
        this.findLoopsBtn.disabled = true;
        this.showGlobalLoading('finding optimal loop points...');

        try {
            this.currentSuggestions = this.loopAnalyzer.findPerfectLoops(this.selectionDuration, 0.1);
            this.displayLoopSuggestions();
            this.redrawVisualization();
            this.hideGlobalLoading();

            this.findLoopsBtn.textContent = `[ FOUND_${this.currentSuggestions.length}_LOOPS ]`;
            setTimeout(() => {
                this.findLoopsBtn.textContent = '[ ANALYZE_LOOPS ]';
                this.findLoopsBtn.disabled = false;
            }, 2000);

        } catch (error) {
            console.error('Loop finding failed:', error);
            this.findLoopsBtn.textContent = '[ ANALYZE_LOOPS ]';
            this.findLoopsBtn.disabled = false;
            this.hideGlobalLoading();
        }
    }

    // Enhanced beat snapping with manual values
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

        const nearestBeat = this.findNearestBeat(this.selectionStart, beatPositions);
        if (!nearestBeat) return;

        // Get beat length - either from dropdown or manual input
        let beatLength;
        if (this.beatLengthInput.value === 'custom') {
            beatLength = parseFloat(this.manualBeatsInput.value) || 4;
        } else {
            beatLength = parseFloat(this.beatLengthInput.value);
        }

        const beatDuration = 60 / detectedBPM;
        let newDuration = beatLength * beatDuration;

        let newStart = nearestBeat.time;
        
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

        const beatText = beatLength < 1 ? `${beatLength * 4}/4` : `${beatLength}`;
        console.log(`snapped to beat at ${nearestBeat.time.toFixed(3)}s, duration: ${beatText} beats (${this.selectionDuration.toFixed(3)}s)`);
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
            this.suggestionsList.innerHTML = '<div class="terminal-output">no perfect loops found for this duration<br>try different duration or beat snapping</div>';
            return;
        }

        this.suggestionsList.innerHTML = '';
        
        this.currentSuggestions.forEach((suggestion, index) => {
            const div = document.createElement('div');
            div.className = 'loop-suggestion';
            div.dataset.index = index;
            
            div.innerHTML = `
                <h5>loop_${suggestion.rank} - ${(suggestion.quality * 100).toFixed(1)}% quality</h5>
                <p>start: ${suggestion.startTime.toFixed(3)}s | duration: ${suggestion.duration.toFixed(3)}s</p>
                <p>analysis: ${suggestion.description.toLowerCase()}</p>
                <div class="quality-bar">
                    <div class="quality-fill" style="width: ${suggestion.quality * 100}%"></div>
                </div>
                <p style="font-size: 10px; opacity: 0.6; margin-top: 5px;">click to apply selection</p>
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
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.reviensApp = new ReviensApp();
});