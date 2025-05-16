// visualization.js - Handles visualization of active synths and audio with fade-out animation

// Main visualization module functionality
window.visualization = {
    // Active visualizers by product ID
    visualizers: {},
    
    // Animation frame request ID
    animationFrameId: null,
    
    // Fade-out duration in milliseconds
    fadeOutDuration: 3000,
    
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
      
      // Create visualizer element
      const visualizerEl = document.createElement('div');
      visualizerEl.className = `synth-item ${product.name}`;
      visualizerEl.id = `visualizer-${productId}`;
      visualizerEl.dataset.productId = productId;
      
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
      
      // Add content
      visualizerEl.innerHTML = `
        <div class="synth-name">${product.name}</div>
        <div class="synth-type">${productTypes[product.name]?.description || 'Synth'}</div>
        <div class="synth-properties">
          ${this.formatProductProperties(product)}
        </div>
        <div class="synth-visualizer">
          <div class="visualizer-bar" id="bar-${productId}"></div>
        </div>
      `;
      
      // Add click handler to remove product
      visualizerEl.addEventListener('click', () => {
        // Start fade-out animation
        this.startFadeOut(productId);
        
        // Actual removal happens after the fade-out in removeProductVisualizer
        window.productManager.removeProductById(productId);
        window.log(`Removing ${product.name}...`);
      });
      
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
      const updateLoop = () => {
        this.updateVisualizers();
        this.animationFrameId = requestAnimationFrame(updateLoop);
      };
      
      // Start the loop
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