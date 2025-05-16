// ui-handlers.js - Setup for UI event handlers and user interactions

// Main UI handlers module functionality
window.uiHandlers = {
  // Store DOM elements
  elements: {
    editor: document.getElementById("editor"),
    output: document.getElementById("output"),
    runAllBtn: document.getElementById("run-all"),
    runLineBtn: document.getElementById("run-line"),
    stopBtn: document.getElementById("stop"),
    randomizeBtn: document.getElementById("randomize")
  },
  
  // Initialize UI handlers
  init: function() {
    // Locate UI elements first
    this.locateElements();
    
    // Initialize UI components
    this.setupEventListeners();
    
    // Create keyboard shortcut tooltip
    if (window.uiEffects && window.uiEffects.createShortcutTooltip) {
      window.uiEffects.createShortcutTooltip();
    }
    
    // Log initial messages
    window.log("Welcome to Retail Therapy: Market Soundscape - Alpha Version");
    window.log("The system is ready for your commands...");
    window.log("💡 TIP: Use Ctrl+Enter to execute current line, Ctrl+Shift+Enter to execute all");
  },
  
  // Locate UI elements (in case they weren't found during initial load)
  locateElements: function() {
    this.elements = {
      editor: document.getElementById("editor"),
      output: document.getElementById("output"),
      runAllBtn: document.getElementById("run-all"),
      runLineBtn: document.getElementById("run-line"),
      stopBtn: document.getElementById("stop"),
      randomizeBtn: document.getElementById("randomize")
    };
  },
  
  // Set up event listeners
  setupEventListeners: function() {
    // Button event listeners
    if (this.elements.runAllBtn) {
      this.elements.runAllBtn.addEventListener("click", this.handleRunAll.bind(this));
    } else {
      console.warn("Run All button not found");
    }
    
    if (this.elements.runLineBtn) {
      this.elements.runLineBtn.addEventListener("click", this.handleRunLine.bind(this));
    } else {
      console.warn("Run Line button not found");
    }
    
    if (this.elements.stopBtn) {
      this.elements.stopBtn.addEventListener("click", this.handleStop.bind(this));
    } else {
      console.warn("Stop button not found");
    }
    
    if (this.elements.randomizeBtn) {
      this.elements.randomizeBtn.addEventListener("click", this.handleRandomize.bind(this));
    } else {
      console.warn("Randomize button not found");
    }
    
    // Add keyboard shortcut listener
    if (this.elements.editor) {
      this.elements.editor.addEventListener("keydown", this.handleKeyboardShortcuts.bind(this));
    } else {
      console.warn("Editor not found");
    }
    
    document.addEventListener("keydown", this.handleGlobalKeyboardShortcuts.bind(this));
  },
  
  // Get the current line from the editor
  getCurrentLine: function() {
    if (!this.elements.editor) {
      this.locateElements();
      if (!this.elements.editor) return "";
    }
    
    const cursorPos = this.elements.editor.selectionStart;
    const text = this.elements.editor.value;
    const lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1;
    const lineEnd = text.indexOf('\n', cursorPos);
    return text.substring(lineStart, lineEnd > -1 ? lineEnd : text.length).trim();
  },
  
  // Execute current line with error handling
  handleRunLine: async function(event) {
    try {
      // Make sure audio is started
      const audioStarted = await this.ensureAudioStarted();
      if (!audioStarted) {
        window.log("Unable to start audio. Please try clicking the 'Enable Sound' button again.");
        return;
      }
      
      // Get and execute current line
      const line = this.getCurrentLine();
      if (line && !line.trim().startsWith("//")) {
        if (window.commandParser && window.commandParser.executeCommand) {
          window.commandParser.executeCommand(line);
          
          // Add visual feedback
          if (window.uiEffects && window.uiEffects.flashSuccess) {
            window.uiEffects.flashSuccess(this.elements.runLineBtn);
          }
        } else {
          window.log("Command system not available. Please refresh the page.");
        }
      }
    } catch (error) {
      console.error("Error executing line:", error);
      window.log("Error executing command. Check console for details.");
    }
  },
  
  // Execute all lines with error handling
  handleRunAll: async function(event) {
    try {
      // Make sure audio is started
      const audioStarted = await this.ensureAudioStarted();
      if (!audioStarted) {
        window.log("Unable to start audio. Please try clicking the 'Enable Sound' button again.");
        return;
      }
      
      // Locate elements if needed
      if (!this.elements.editor) {
        this.locateElements();
        if (!this.elements.editor) {
          window.log("Editor not found. Please refresh the page.");
          return;
        }
      }
      
      // Get and execute all lines
      const lines = this.elements.editor.value.split("\n");
      let executedCommands = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith("//")) {
          if (window.commandParser && window.commandParser.executeCommand) {
            await new Promise(resolve => setTimeout(resolve, 100)); // Add a small delay between commands
            window.commandParser.executeCommand(line);
            executedCommands++;
          }
        }
      }
      
      // Add visual feedback
      if (executedCommands > 0 && window.uiEffects) {
        if (window.uiEffects.flashSuccess) {
          window.uiEffects.flashSuccess(this.elements.runAllBtn);
        }
        if (window.uiEffects.shakeScreen) {
          window.uiEffects.shakeScreen(0.5); // Light shake
        }
      }
    } catch (error) {
      console.error("Error executing all lines:", error);
      window.log("Error executing commands. Check console for details.");
    }
  },
  
  // Ensure audio is started
  ensureAudioStarted: async function() {
    if (!Tone) {
      window.log("Tone.js is not available. Please refresh the page.");
      return false;
    }
    
    // Check if audio context is already running
    if (Tone.context.state === "running") {
      // Start transport if not already started
      if (Tone.Transport.state !== "started") {
        Tone.Transport.start();
      }
      return true;
    }
    
    // Try to start audio engine
    try {
      // Start audio through our audio engine
      const started = await window.audioEngine.startAudio();
      
      if (started) {
        // Start transport
        if (Tone.Transport.state !== "started") {
          Tone.Transport.start();
        }
        return true;
      } else {
        window.log("Could not start audio. Please try refreshing the page.");
        return false;
      }
    } catch (error) {
      console.error("Error starting audio:", error);
      window.log("Error starting audio. Please check console for details.");
      return false;
    }
  },
  
  // Stop all audio and reset
  handleStop: function(event) {
    try {
      // Reset all modes
      if (window.state && window.state.modes && window.modeManager) {
        Object.keys(window.state.modes).forEach(mode => {
          if (window.state.modes[mode]) {
            const methodName = `toggle${this.capitalizeFirstLetter(mode)}Mode`;
            if (window.modeManager[methodName]) {
              window.modeManager[methodName](false);
            }
          }
        });
      }
      
      // Stop all audio
      if (window.audioEngine && window.audioEngine.stopAllAudio) {
        window.audioEngine.stopAllAudio();
      }
      
      // Visual feedback
      if (window.uiEffects && window.uiEffects.flashSuccess) {
        window.uiEffects.flashSuccess(this.elements.stopBtn);
      }
    } catch (error) {
      console.error("Error stopping audio:", error);
      window.log("Error stopping audio. Check console for details.");
    }
  },
  
  // Generate and execute a random command
  handleRandomize: async function(event) {
    try {
      // Make sure audio is started
      const audioStarted = await this.ensureAudioStarted();
      if (!audioStarted) {
        window.log("Unable to start audio. Please try clicking the 'Enable Sound' button again.");
        return;
      }
      
      // Generate random command
      let randomCommand = "add beer"; // Fallback command
      
      if (window.commandParser && window.commandParser.generateRandomCommand) {
        randomCommand = window.commandParser.generateRandomCommand();
      }
      
      // Locate editor if needed
      if (!this.elements.editor) {
        this.locateElements();
        if (!this.elements.editor) {
          window.log("Editor not found. Please refresh the page.");
          return;
        }
      }
      
      // Insert the command at the current cursor position
      const cursorPos = this.elements.editor.selectionStart;
      const text = this.elements.editor.value;
      const newText = text.substring(0, cursorPos) + randomCommand + text.substring(cursorPos);
      this.elements.editor.value = newText;
      
      // Move cursor after the inserted command
      this.elements.editor.selectionStart = cursorPos + randomCommand.length;
      this.elements.editor.selectionEnd = cursorPos + randomCommand.length;
      
      // Execute the command
      if (window.commandParser && window.commandParser.executeCommand) {
        window.commandParser.executeCommand(randomCommand);
      }
      
      // Visual feedback
      if (window.uiEffects && window.uiEffects.flashSuccess) {
        window.uiEffects.flashSuccess(this.elements.randomizeBtn);
      }
    } catch (error) {
      console.error("Error generating random command:", error);
      window.log("Error generating random command. Check console for details.");
    }
  },
  
  // Handle keyboard shortcuts
  handleKeyboardShortcuts: function(event) {
    // Ctrl+Enter to execute current line
    if (event.ctrlKey && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleRunLine();
    }
    
    // Ctrl+Shift+Enter to execute all lines
    if (event.ctrlKey && event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      this.handleRunAll();
    }
    
    // Ctrl+R to generate a random command
    if (event.ctrlKey && event.key === 'r') {
      event.preventDefault();
      this.handleRandomize();
    }
  },
  
  // Handle global keyboard shortcuts (works even when editor doesn't have focus)
  handleGlobalKeyboardShortcuts: function(event) {
    // Escape to stop all
    if (event.key === 'Escape') {
      event.preventDefault();
      this.handleStop();
    }
  },
  
  // Helper function to capitalize first letter (for method names)
  capitalizeFirstLetter: function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
};