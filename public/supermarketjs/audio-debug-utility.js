// audio-debug-utility.js - Optional debugging utilities for audio

window.audioDebug = {
  // Enable/disable debug logging
  enabled: window.enableAudioDebug || false,
  
  // Log audio debug info
  log: function(...args) {
    if (this.enabled) {
      console.log('[Audio Debug]', ...args);
    }
  },
  
  // Log audio context info
  logContextInfo: function() {
    if (!this.enabled || !Tone || !Tone.context) return;
    
    const ctx = Tone.context;
    console.log('[Audio Debug] Context Info:', {
      state: ctx.state,
      sampleRate: ctx.sampleRate,
      baseLatency: ctx.baseLatency,
      outputLatency: ctx.outputLatency,
      currentTime: ctx.currentTime
    });
  },
  
  // Log active voice count
  logVoiceCount: function() {
    if (!this.enabled) return;
    
    const productCount = Object.keys(window.state?.products || {}).length;
    const activeVoices = window.performanceManager?.activeVoices?.length || 0;
    
    console.log('[Audio Debug] Active Voices:', {
      products: productCount,
      voices: activeVoices,
      maxPolyphony: window.performanceManager?.config?.maxPolyphony || 'N/A'
    });
  }
};