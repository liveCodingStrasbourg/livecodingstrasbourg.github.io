// visualization.js - Handles visualization of active synths and audio with fade-out animation

// Main visualization module functionality
window.visualization = {
    // Active visualizers by product ID
    visualizers: {},
    
    // Animation frame request ID
    animationFrameId: null,
    
    // Fade-out duration in milliseconds (reduced for better responsiveness)
    fadeOutDuration: 500,
    
    // Initialize visualization system
    init: function() {
      // Start visualization loop
      this.startVisualizationLoop();
    },
    
    // Add a product visualizer
    addProductVisualizer: function(productId) {
      const product = window.state.products[productId];
      if (!product) return;

      // Get container
      const container = document.getElementById('active-synths');
      if (!container) return;

      // If a visualizer already exists for this ID, remove it immediately first
      if (this.visualizers[productId]) {
        const oldVisualizer = this.visualizers[productId];
        if (oldVisualizer.element) {
          oldVisualizer.element.remove();
        }
        delete this.visualizers[productId];
      }

      // Also check for any DOM elements with matching ID (cleanup orphaned elements)
      const existingEl = document.getElementById(`visualizer-${productId}`);
      if (existingEl) {
        existingEl.remove();
      }

      // Create visualizer element
      const visualizerEl = document.createElement('div');
      visualizerEl.className = `synth-item ${product.name}`;
      visualizerEl.id = `visualizer-${productId}`;
      visualizerEl.dataset.productId = productId;
      visualizerEl.title = 'Double-click to remove';
      
      // Apply product-specific styling
      if (product.color) {
        visualizerEl.style.borderColor = product.color;
      }
      
      // Apply modifier-specific classes
      if (product.modifiers) {
        Object.keys(product.modifiers).forEach(modifier => {
          visualizerEl.classList.add(modifier);
        });
      }
      
      // Get current volume (default -12 dB)
      const currentVol = product.synth?.volume?.value ?? -12;
      const sliderVal = Math.round(((currentVol + 40) / 40) * 100); // Map -40 to 0 dB => 0 to 100

      // Check if this is a slot-based product (ID is 0-9)
      const isSlot = window.state.VALID_SLOTS && window.state.VALID_SLOTS.includes(productId);
      const slotLabel = isSlot ? `[${productId}] ` : '';

      // Add content
      visualizerEl.innerHTML = `
        <div class="synth-header">
          <div class="synth-name"><span class="slot-label">${slotLabel}</span>${product.name}</div>
          <div class="synth-remove" title="Click to remove">×</div>
        </div>
        <div class="synth-type">${window.productTypes[product.name]?.description || 'Synth'}</div>
        <div class="synth-properties">
          ${this.formatProductProperties(product)}
        </div>
        <div class="synth-volume">
          <input type="range" class="volume-slider" id="vol-${productId}"
                 min="0" max="100" value="${sliderVal}" title="Volume">
        </div>
        <div class="synth-visualizer">
          <div class="visualizer-bar" id="bar-${productId}"></div>
        </div>
      `;

      // Click handler function for removing product
      const removeProduct = (e) => {
        e.stopPropagation();
        e.preventDefault();

        // Check if already being removed
        const viz = this.visualizers[productId];
        if (viz && viz.isRemovePending) {
          return; // Already removing
        }

        // Start fade-out animation
        this.startFadeOut(productId);

        // Actual removal
        if (window.productManager && window.productManager.removeProductById) {
          window.productManager.removeProductById(productId);
        }
        window.log(`Removing ${product.name}...`);
      };

      // Add click handler to remove button
      const removeBtn = visualizerEl.querySelector('.synth-remove');
      if (removeBtn) {
        removeBtn.addEventListener('click', removeProduct);
      }

      // Also add double-click on the whole card to remove
      visualizerEl.addEventListener('dblclick', removeProduct);

      // Add volume slider handler
      const volumeSlider = visualizerEl.querySelector('.volume-slider');
      if (volumeSlider) {
        volumeSlider.addEventListener('click', (e) => e.stopPropagation());
        volumeSlider.addEventListener('input', (e) => {
          e.stopPropagation();
          const val = parseInt(e.target.value);
          // Map 0-100 to -40 to 0 dB
          const dbVal = (val / 100) * 40 - 40;
          if (product.synth && product.synth.volume) {
            product.synth.volume.value = dbVal;
          }
        });
      }
      
      // Apply initial fade-in animation
      visualizerEl.style.opacity = "0";
      visualizerEl.style.transform = "scale(0.95)";
      visualizerEl.style.transition = `opacity 0.5s ease-in, transform 0.5s ease-in`;
      
      // Add to container
      container.appendChild(visualizerEl);
      
      // Trigger a reflow to ensure the transition works
      visualizerEl.offsetHeight;
      
      // Fade in
      visualizerEl.style.opacity = "1";
      visualizerEl.style.transform = "scale(1)";
      
      // Store reference
      this.visualizers[productId] = {
        element: visualizerEl,
        barElement: document.getElementById(`bar-${productId}`),
        lastUpdate: Date.now(),
        amplitude: 0,
        isRemovePending: false
      };
    },
    
    // Start fade-out animation for a product visualizer
    startFadeOut: function(productId) {
      const visualizer = this.visualizers[productId];
      if (!visualizer || visualizer.isRemovePending) return;
      
      // Mark as pending removal
      visualizer.isRemovePending = true;
      
      // Apply fade out style
      if (visualizer.element) {
        // Add transition style for smooth fade-out
        visualizer.element.style.transition = `opacity ${this.fadeOutDuration/1000}s ease-out, transform ${this.fadeOutDuration/1000}s ease-out`;
        visualizer.element.style.opacity = "0";
        visualizer.element.style.transform = "scale(0.8)";
      }
    },
    
    // Remove a product visualizer
    removeProductVisualizer: function(productId) {
      const visualizer = this.visualizers[productId];
      if (!visualizer) return;
      
      // Start fade-out if not already pending removal
      if (!visualizer.isRemovePending) {
        this.startFadeOut(productId);
      }
      
      // Schedule actual DOM removal after fade-out completes
      setTimeout(() => {
        if (visualizer.element) {
          visualizer.element.remove();
        }
        
        // Remove reference
        delete this.visualizers[productId];
      }, this.fadeOutDuration);
    },
    
    // Format product properties for display
    formatProductProperties: function(product) {
      let properties = [];
      
      // Add note info
      if (product.note) {
        if (Array.isArray(product.note)) {
          properties.push(`Notes: ${product.note.join(', ')}`);
        } else {
          properties.push(`Note: ${product.note}`);
        }
      }
      
      // Add modifier info
      if (product.modifiers && Object.keys(product.modifiers).length > 0) {
        properties.push(`Mods: ${Object.keys(product.modifiers).join(', ')}`);
      }
      
      // Add special parameters
      if (product.nutriscoreKey) {
        properties.push(`Nutriscore: ${product.nutriscoreKey}`);
      }
      
      if (product.isOpenProduct) {
        properties.push("Status: Open");
      }
      
      return properties.join('<br>');
    },
    
    // Trigger visualizer animation for a product
    triggerVisualizer: function(productId) {
      const product = window.state.products[productId];
      if (!product) return;
      
      // Update last trigger time
      product.lastTriggerTime = Date.now();
      
      // Set initial amplitude (will decay over time)
      product.visualAmplitude = 1.0;
    },
    
    // Update all visualizers
    updateVisualizers: function() {
      const now = Date.now();
      
      Object.keys(window.state.products).forEach(productId => {
        const product = window.state.products[productId];
        const visualizer = this.visualizers[productId];
        
        if (!product || !visualizer || !visualizer.barElement) return;
        
        // Skip updating for elements that are being removed
        if (visualizer.isRemovePending) return;
        
        // Calculate time since last trigger
        const timeSinceLastTrigger = now - product.lastTriggerTime;
        
        // Decay amplitude over time
        if (product.visualAmplitude > 0) {
          // Decay rate depends on the product's pattern (faster for faster patterns)
          let decayRate = 0.001; // Default decay rate
          
          if (product.shelfLifeDuration) {
            // Adjust decay rate based on shelf life
            switch (product.shelfLifeDuration) {
              case '32n': decayRate = 0.01; break;  // Very fast
              case '16n': decayRate = 0.005; break; // Fast
              case '8n':  decayRate = 0.002; break; // Medium
              case '4n':  decayRate = 0.001; break; // Slow
              case '2n':  decayRate = 0.0005; break; // Very slow
              case '1n':  decayRate = 0.0002; break; // Extremely slow
            }
          }
          
          // Calculate new amplitude with smoothing
          const newAmplitude = Math.max(0, product.visualAmplitude - (decayRate * timeSinceLastTrigger));
          
          // Apply smoothing
          product.visualAmplitude = newAmplitude + 
            (product.visualAmplitude - newAmplitude) * CONFIG.visualization.smoothingFactor;
        }
        
        // Calculate bar height as percentage
        const minHeight = CONFIG.visualization.minBarHeight;
        const barHeight = minHeight + (product.visualAmplitude * (CONFIG.visualization.maxBarHeight - minHeight));
        
        // Apply bar height
        visualizer.barElement.style.height = `${barHeight}%`;
        
        // Apply active modes visual effects
        if (window.state.modes.discount) {
          visualizer.barElement.style.opacity = 0.7 + (Math.random() * 0.3);
        }
        
        if (window.state.modes.inflation) {
          visualizer.barElement.style.height = `${barHeight * (1 + Math.sin(now / 500) * 0.2)}%`;
        }
        
        if (window.state.modes.consumerism) {
          // Make bars more colorful but subtly
          visualizer.barElement.style.background = `linear-gradient(to top, #607d8b, #78909c)`;
        }
        
        if (window.state.modes.black_friday) {
          // More intense
          visualizer.barElement.style.opacity = Math.random() > 0.2 ? 1 : 0.6;
          visualizer.barElement.style.background = 'linear-gradient(to top, #455a64, #607d8b)';
        }
        
        if (window.state.modes.apocalypse) {
          // Random behavior
          visualizer.barElement.style.height = `${Math.random() * 100}%`;
          visualizer.barElement.style.width = `${80 + Math.random() * 20}%`;
          visualizer.barElement.style.left = `${Math.random() * 20}%`;
        }
      });
    },
    
    // Start the visualization update loop
startVisualizationLoop: function() {
  let lastUpdate = 0;
  const updateLoop = () => {
    const now = Date.now();
    if (now - lastUpdate > 100) { // Only update every 100ms instead of every frame
      this.updateVisualizers();
      lastUpdate = now;
    }
    this.animationFrameId = requestAnimationFrame(updateLoop);
  };
  
  this.animationFrameId = requestAnimationFrame(updateLoop);
},
    
    // Stop the visualization update loop
    stopVisualizationLoop: function() {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }
  };

// Pending changes progress visualization
window.pendingChangesViz = {
  containerElement: null,
  isVisible: false,

  // Initialize the pending changes display
  init: function() {
    // Create container element
    this.containerElement = document.createElement('div');
    this.containerElement.id = 'pending-changes-container';
    this.containerElement.className = 'pending-changes-container';
    this.containerElement.style.display = 'none';

    // Insert after the active-synths container or at top of main area
    const activeSynths = document.getElementById('active-synths');
    if (activeSynths && activeSynths.parentNode) {
      activeSynths.parentNode.insertBefore(this.containerElement, activeSynths);
    } else {
      document.body.appendChild(this.containerElement);
    }

    // Start update loop
    this.startUpdateLoop();
  },

  // Start the update loop for pending changes
  startUpdateLoop: function() {
    const self = this;
    let lastUpdate = 0;

    const updateLoop = () => {
      const now = Date.now();
      // Update every 50ms for smooth progress bar animation
      if (now - lastUpdate > 50) {
        self.updateDisplay();
        lastUpdate = now;
      }
      requestAnimationFrame(updateLoop);
    };

    requestAnimationFrame(updateLoop);
  },

  // Update the pending changes display
  updateDisplay: function() {
    const pendingChanges = window.state.pendingChanges;
    const pendingSlots = Object.keys(pendingChanges);

    // Hide if no pending changes
    if (pendingSlots.length === 0) {
      if (this.isVisible) {
        this.containerElement.style.display = 'none';
        this.isVisible = false;
      }
      return;
    }

    // Show container
    if (!this.isVisible) {
      this.containerElement.style.display = 'block';
      this.isVisible = true;
    }

    // Calculate progress to next half note (2n subdivision)
    let progressPercent = 0;
    if (Tone.Transport.state === "started") {
      // Get current position within the bar
      const position = Tone.Transport.position;
      // Position format is "bars:beats:sixteenths" like "1:2:3"
      const parts = position.split(':');
      const beats = parseFloat(parts[1]) || 0;
      const sixteenths = parseFloat(parts[2]) || 0;

      // Calculate progress through current half note (2 beats = 8 sixteenths)
      const totalSixteenths = ((beats % 2) * 4) + sixteenths;
      const maxSixteenths = 8; // 2 beats * 4 sixteenths per half note
      progressPercent = (totalSixteenths / maxSixteenths) * 100;
    }

    // Build HTML for pending changes
    let html = '<div class="pending-changes-header">';
    html += '<span class="pending-icon">⏳</span>';
    html += '<span class="pending-label">Queued changes</span>';
    html += '</div>';

    html += '<div class="pending-progress-bar">';
    html += `<div class="pending-progress-fill" style="width: ${progressPercent}%"></div>`;
    html += '</div>';

    html += '<div class="pending-changes-list">';

    pendingSlots.forEach(slot => {
      const change = pendingChanges[slot];
      const currentProduct = window.state.slots[slot];
      const oldName = currentProduct ? currentProduct.name : '(empty)';

      html += `<div class="pending-change-item">`;
      html += `<span class="pending-slot">[${slot}]</span>`;
      html += `<span class="pending-old">${oldName}</span>`;
      html += `<span class="pending-arrow">→</span>`;
      html += `<span class="pending-new">${change.name}</span>`;
      html += `</div>`;
    });

    html += '</div>';

    this.containerElement.innerHTML = html;
  }
};

// Initialize pending changes visualization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    window.pendingChangesViz.init();
  });
} else {
  // DOM already loaded
  setTimeout(function() {
    window.pendingChangesViz.init();
  }, 100);
}