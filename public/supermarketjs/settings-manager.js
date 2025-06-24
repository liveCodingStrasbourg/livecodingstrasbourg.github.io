// settings-manager.js - Manages audio performance settings UI

window.settingsManager = {
  // Current settings
  currentSettings: {
    preset: 'balanced',
    custom: {
      maxPolyphony: 12,
      latencyHint: 'playback',
      lookAhead: 0.1,
      updateInterval: 0.05,
      effectQuality: 'medium',
      voiceStealingEnabled: true,
      autoQualityReduction: true
    }
  },
  
  // Initialize settings UI
  init: function() {
    console.log("Initializing settings manager...");
    
    // Set up preset buttons
    this.initPresetButtons();
    
    // Set up custom settings controls
    this.initCustomSettings();
    
    // Set up status updates
    this.startStatusUpdates();
    
    // Load saved settings
    this.loadSettings();
  },
  
  // Initialize preset buttons
  initPresetButtons: function() {
    const presetButtons = document.querySelectorAll('.preset-btn');
    
    presetButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = btn.dataset.preset;
        this.selectPreset(preset);
      });
    });
  },
  
  // Select a preset
  selectPreset: function(preset) {
    // Update UI
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.preset === preset);
    });
    
    // Show/hide custom settings
    const customSection = document.querySelector('.custom-settings');
    if (customSection) {
      customSection.style.display = preset === 'custom' ? 'block' : 'none';
    }
    
    // Apply preset
    if (preset !== 'custom') {
      this.applyPreset(preset);
    }
    
    this.currentSettings.preset = preset;
    this.saveSettings();
  },
  
  // Apply a preset
  applyPreset: function(preset) {
    if (!window.performanceManager) {
      console.warn("Performance manager not available");
      return;
    }
    
    // Apply the preset
    window.performanceManager.setPerformanceMode(preset);
    
    // Update status display
    document.getElementById('current-mode').textContent = 
      preset.charAt(0).toUpperCase() + preset.slice(1);
    
    // Show feedback
    window.log(`Audio performance preset changed to: ${preset}`);
  },
  
  // Initialize custom settings controls
  initCustomSettings: function() {
    // Polyphony slider
    const polyphonySlider = document.getElementById('setting-polyphony');
    const polyphonyValue = document.getElementById('polyphony-value');
    
    if (polyphonySlider) {
      polyphonySlider.addEventListener('input', (e) => {
        polyphonyValue.textContent = e.target.value;
        this.currentSettings.custom.maxPolyphony = parseInt(e.target.value);
      });
    }
    
    // Look ahead slider
    const lookAheadSlider = document.getElementById('setting-lookahead');
    const lookAheadValue = document.getElementById('lookahead-value');
    
    if (lookAheadSlider) {
      lookAheadSlider.addEventListener('input', (e) => {
        lookAheadValue.textContent = parseFloat(e.target.value).toFixed(2);
        this.currentSettings.custom.lookAhead = parseFloat(e.target.value);
      });
    }
    
    // Update interval slider
    const updateSlider = document.getElementById('setting-update');
    const updateValue = document.getElementById('update-value');
    
    if (updateSlider) {
      updateSlider.addEventListener('input', (e) => {
        updateValue.textContent = parseFloat(e.target.value).toFixed(2);
        this.currentSettings.custom.updateInterval = parseFloat(e.target.value);
      });
    }
    
    // Other controls
    const latencySelect = document.getElementById('setting-latency');
    if (latencySelect) {
      latencySelect.addEventListener('change', (e) => {
        this.currentSettings.custom.latencyHint = e.target.value;
      });
    }
    
    const effectQualitySelect = document.getElementById('setting-effect-quality');
    if (effectQualitySelect) {
      effectQualitySelect.addEventListener('change', (e) => {
        this.currentSettings.custom.effectQuality = e.target.value;
      });
    }
    
    const voiceStealingCheck = document.getElementById('setting-voice-stealing');
    if (voiceStealingCheck) {
      voiceStealingCheck.addEventListener('change', (e) => {
        this.currentSettings.custom.voiceStealingEnabled = e.target.checked;
      });
    }
    
    const autoReduceCheck = document.getElementById('setting-auto-reduce');
    if (autoReduceCheck) {
      autoReduceCheck.addEventListener('change', (e) => {
        this.currentSettings.custom.autoQualityReduction = e.target.checked;
      });
    }
    
    // Apply button
    const applyBtn = document.getElementById('apply-custom-settings');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        this.applyCustomSettings();
      });
    }
  },
  
  // Apply custom settings
  applyCustomSettings: function() {
    const settings = this.currentSettings.custom;
    
    // Apply to performance manager
    if (window.performanceManager) {
      // Set max polyphony
      window.performanceManager.setMaxPolyphony(settings.maxPolyphony);
      
      // Apply Tone.js settings
      if (Tone && Tone.context) {
        // Update context settings
        if (settings.latencyHint === 'playback') {
          // Prioritize stability with higher latency
          Tone.context.lookAhead = Math.max(settings.lookAhead, 0.2);
          Tone.context.updateInterval = Math.max(settings.updateInterval, 0.1);
        } else {
          Tone.context.lookAhead = settings.lookAhead;
          Tone.context.updateInterval = settings.updateInterval;
        }
      }
      
      // Apply effect quality
      if (settings.effectQuality === 'low') {
        window.performanceManager.simplifyAllEffects();
      } else if (settings.effectQuality === 'medium') {
        window.performanceManager.limitReverbEffects();
      }
      
      // Update config
      window.performanceManager.config.voiceStealingEnabled = settings.voiceStealingEnabled;
    }
    
    // Save settings
    this.saveSettings();
    
    // Update status
    document.getElementById('current-mode').textContent = 'Custom';
    
    // Show feedback
    window.log("Custom audio performance settings applied");
    
    // Visual feedback
    const applyBtn = document.getElementById('apply-custom-settings');
    if (applyBtn) {
      applyBtn.textContent = 'Applied ✓';
      setTimeout(() => {
        applyBtn.textContent = 'Apply Custom Settings';
      }, 2000);
    }
  },
  
  // Start status updates
  startStatusUpdates: function() {
    // Update immediately
    this.updateStatus();
    
    // Update every second
    setInterval(() => {
      this.updateStatus();
    }, 1000);
  },
  
  // Update status display
  updateStatus: function() {
    // Active voices
    if (window.performanceManager) {
      const activeVoices = window.performanceManager.activeVoices.length;
      const maxVoices = window.performanceManager.config.maxPolyphony;
      document.getElementById('active-voices').textContent = `${activeVoices} / ${maxVoices}`;
    }
    
    // Dropouts
    if (window.audioEngine && window.audioEngine.performanceMetrics) {
      document.getElementById('dropout-count').textContent = 
        window.audioEngine.performanceMetrics.dropouts;
    }
    
    // CPU Load estimate
    if (window.performanceManager && window.performanceManager.activeVoices.length > 0) {
      const load = window.performanceManager.activeVoices.length / 
                   window.performanceManager.config.maxPolyphony;
      let loadText = 'Low';
      if (load > 0.8) loadText = 'High';
      else if (load > 0.5) loadText = 'Medium';
      
      const cpuLoadEl = document.getElementById('cpu-load');
      if (cpuLoadEl) {
        cpuLoadEl.textContent = loadText;
        cpuLoadEl.style.color = load > 0.8 ? '#ff6666' : (load > 0.5 ? '#ffaa00' : '#66ff66');
      }
    }
  },
  
  // Save settings to localStorage
  saveSettings: function() {
    localStorage.setItem('supermarket_audio_settings', JSON.stringify(this.currentSettings));
  },
  
  // Load settings from localStorage
  loadSettings: function() {
    const saved = localStorage.getItem('supermarket_audio_settings');
    if (saved) {
      try {
        this.currentSettings = JSON.parse(saved);
        
        // Apply saved preset
        this.selectPreset(this.currentSettings.preset);
        
        // Update custom controls
        this.updateCustomControls();
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }
  },
  
  // Update custom controls to match saved values
  updateCustomControls: function() {
    const settings = this.currentSettings.custom;
    
    // Update sliders
    const polyphonySlider = document.getElementById('setting-polyphony');
    if (polyphonySlider) {
      polyphonySlider.value = settings.maxPolyphony;
      document.getElementById('polyphony-value').textContent = settings.maxPolyphony;
    }
    
    const lookAheadSlider = document.getElementById('setting-lookahead');
    if (lookAheadSlider) {
      lookAheadSlider.value = settings.lookAhead;
      document.getElementById('lookahead-value').textContent = settings.lookAhead.toFixed(2);
    }
    
    const updateSlider = document.getElementById('setting-update');
    if (updateSlider) {
      updateSlider.value = settings.updateInterval;
      document.getElementById('update-value').textContent = settings.updateInterval.toFixed(2);
    }
    
    // Update selects
    const latencySelect = document.getElementById('setting-latency');
    if (latencySelect) {
      latencySelect.value = settings.latencyHint;
    }
    
    const effectQualitySelect = document.getElementById('setting-effect-quality');
    if (effectQualitySelect) {
      effectQualitySelect.value = settings.effectQuality;
    }
    
    // Update checkboxes
    const voiceStealingCheck = document.getElementById('setting-voice-stealing');
    if (voiceStealingCheck) {
      voiceStealingCheck.checked = settings.voiceStealingEnabled;
    }
    
    const autoReduceCheck = document.getElementById('setting-auto-reduce');
    if (autoReduceCheck) {
      autoReduceCheck.checked = settings.autoQualityReduction;
    }
  }
};