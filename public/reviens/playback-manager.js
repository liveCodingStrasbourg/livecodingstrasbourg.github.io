// Playback Manager - Handles playback cursor and timing
class PlaybackManager {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.cursorElement = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.duration = 0;
        this.playbackStartTime = 0;
        this.animationFrame = null;
        this.onPositionUpdate = null;
        this.viewStartTime = 0;
        this.zoomLevel = 1;
    }

    // Initialize with cursor element and callbacks
    initialize(cursorElement, onPositionUpdate = null) {
        this.cursorElement = cursorElement;
        this.onPositionUpdate = onPositionUpdate;
    }

    // Start playback cursor animation
    startPlayback(startTime, duration, viewStartTime = 0, zoomLevel = 1) {
        this.startTime = startTime;
        this.duration = duration;
        this.viewStartTime = viewStartTime;
        this.zoomLevel = zoomLevel;
        this.isPlaying = true;
        this.playbackStartTime = this.audioEngine.audioContext.currentTime;
        
        this.showCursor();
        this.animatePlayback();
    }

    // Stop playback cursor animation
    stopPlayback() {
        this.isPlaying = false;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        this.hideCursor();
    }

    // Show the playback cursor
    showCursor() {
        if (this.cursorElement) {
            console.log('Showing cursor element:', this.cursorElement);
            this.cursorElement.style.display = 'block';
            this.cursorElement.style.opacity = '1';
            this.cursorElement.style.visibility = 'visible';
        } else {
            console.error('No cursor element available');
        }
    }

    // Hide the playback cursor
    hideCursor() {
        if (this.cursorElement) {
            this.cursorElement.style.display = 'none';
        }
    }

    // Animate the playback cursor
    animatePlayback() {
        if (!this.isPlaying || !this.cursorElement) return;

        const currentTime = this.audioEngine.audioContext.currentTime;
        const elapsed = currentTime - this.playbackStartTime;
        const currentPosition = this.startTime + elapsed;
        
        // Update cursor position
        this.updateCursorPosition(currentPosition);
        
        // Call position update callback if provided
        if (this.onPositionUpdate) {
            this.onPositionUpdate(currentPosition);
        }
        
        // Continue animation if still playing
        if (this.isPlaying && elapsed < this.duration) {
            this.animationFrame = requestAnimationFrame(() => this.animatePlayback());
        } else {
            // Playback finished
            this.stopPlayback();
        }
    }

    // Update cursor position based on current playback time
    updateCursorPosition(currentPosition) {
        if (!this.cursorElement) return;
        
        const totalDuration = this.audioEngine.getDuration();
        const viewDuration = totalDuration / this.zoomLevel;
        const viewEndTime = this.viewStartTime + viewDuration;
        
        // Check if cursor is visible in current view
        if (currentPosition < this.viewStartTime || currentPosition > viewEndTime) {
            this.cursorElement.style.display = 'none';
            return;
        }
        
        // Force cursor to be visible during playback
        this.cursorElement.style.display = 'block';
        this.cursorElement.style.opacity = '1';
        this.cursorElement.style.visibility = 'visible';
        this.cursorElement.style.zIndex = '15';
        
        // Calculate cursor position as percentage of visible area
        const relativePosition = currentPosition - this.viewStartTime;
        const positionRatio = relativePosition / viewDuration;
        const positionPercent = positionRatio * 100;
        
        this.cursorElement.style.left = `${positionPercent}%`;
    }

    // Update view parameters for zoom/pan
    updateView(viewStartTime, zoomLevel) {
        this.viewStartTime = viewStartTime;
        this.zoomLevel = zoomLevel;
        
        // Update cursor position if currently playing
        if (this.isPlaying) {
            const currentTime = this.audioEngine.audioContext.currentTime;
            const elapsed = currentTime - this.playbackStartTime;
            const currentPosition = this.startTime + elapsed;
            this.updateCursorPosition(currentPosition);
        }
    }

    // Get current playback position
    getCurrentPosition() {
        if (!this.isPlaying) return 0;
        
        const currentTime = this.audioEngine.audioContext.currentTime;
        const elapsed = currentTime - this.playbackStartTime;
        return this.startTime + elapsed;
    }

    // Check if playback is active
    isPlaybackActive() {
        return this.isPlaying;
    }

    // Seek to specific position (for future implementation)
    seekTo(position) {
        if (this.isPlaying) {
            // Would require restarting audio source at new position
            // This is complex with Web Audio API and may require buffering
            console.log(`Seek to ${position}s requested`);
        }
    }

    // Set up loop playback cursor (for continuous loops)
    startLoopPlayback(startTime, duration, viewStartTime = 0, zoomLevel = 1) {
        this.startTime = startTime;
        this.duration = duration;
        this.viewStartTime = viewStartTime;
        this.zoomLevel = zoomLevel;
        this.isPlaying = true;
        this.playbackStartTime = this.audioEngine.audioContext.currentTime;
        
        console.log('Starting loop playback manager:', {
            startTime: startTime,
            duration: duration,
            currentTime: this.audioEngine.audioContext.currentTime
        });
        
        this.showCursor();
        this.animateLoopPlayback();
    }

    // Animate cursor for looping playback
    animateLoopPlayback() {
        if (!this.isPlaying || !this.cursorElement) {
            console.log('Animation stopped:', {isPlaying: this.isPlaying, hasCursor: !!this.cursorElement});
            return;
        }

        const currentTime = this.audioEngine.audioContext.currentTime;
        const elapsed = currentTime - this.playbackStartTime;
        
        // Calculate position within the loop
        const loopPosition = elapsed % this.duration;
        const currentPosition = this.startTime + loopPosition;
        
        // Debug every second
        if (Math.floor(elapsed) % 1 === 0 && Math.floor(elapsed * 10) % 10 === 0) {
            console.log('Loop animation running:', {
                elapsed: elapsed.toFixed(2),
                loopPosition: loopPosition.toFixed(2),
                currentPosition: currentPosition.toFixed(2),
                cursorDisplay: this.cursorElement.style.display
            });
        }
        
        // Update cursor position
        this.updateCursorPosition(currentPosition);
        
        // Call position update callback if provided
        if (this.onPositionUpdate) {
            this.onPositionUpdate(currentPosition);
        }
        
        // Continue animation if still playing
        if (this.isPlaying) {
            this.animationFrame = requestAnimationFrame(() => this.animateLoopPlayback());
        } else {
            this.stopPlayback();
        }
    }

    // Get playback progress as percentage
    getPlaybackProgress() {
        if (!this.isPlaying) return 0;
        
        const currentTime = this.audioEngine.audioContext.currentTime;
        const elapsed = currentTime - this.playbackStartTime;
        
        return Math.min(1, elapsed / this.duration);
    }

    // Get remaining playback time
    getRemainingTime() {
        if (!this.isPlaying) return 0;
        
        const currentTime = this.audioEngine.audioContext.currentTime;
        const elapsed = currentTime - this.playbackStartTime;
        
        return Math.max(0, this.duration - elapsed);
    }

    // Format time for display
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = (seconds % 60).toFixed(1);
        return `${mins}:${secs.padStart(4, '0')}`;
    }

    // Get playback status info
    getPlaybackStatus() {
        if (!this.isPlaying) {
            return {
                isPlaying: false,
                position: 0,
                remaining: 0,
                progress: 0
            };
        }
        
        const currentTime = this.audioEngine.audioContext.currentTime;
        const elapsed = currentTime - this.playbackStartTime;
        const position = this.startTime + elapsed;
        const remaining = Math.max(0, this.duration - elapsed);
        const progress = Math.min(1, elapsed / this.duration);
        
        return {
            isPlaying: true,
            position: position,
            remaining: remaining,
            progress: progress,
            positionFormatted: this.formatTime(position),
            remainingFormatted: this.formatTime(remaining)
        };
    }
}