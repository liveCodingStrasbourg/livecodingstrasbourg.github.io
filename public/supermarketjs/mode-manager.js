// mode-manager.js - Manages special modes like discount, inflation, etc.

// Main mode manager module functionality
window.modeManager = {
    // Active timeouts for auto-disabling modes
    timeouts: {},
    
    // Mode indicator elements
    indicators: {},
    
    // Toggle discount mode
    toggleDiscountMode: function(enabled) {
      window.state.modes.discount = enabled;
      
      // Check story mode goals after mode change
      if (window.storyMode && window.storyMode.storyActive) {
        setTimeout(() => {
          window.storyMode.checkGoal();
        }, 100);
      }
      
      if (enabled) {
        // Add visual class
        document.body.classList.add('discount-mode');
        
        // Show indicator
        this.showModeIndicator("discount", "DISCOUNT MODE");
        
        // Log the change
        window.log("💸 DISCOUNT MODE ACTIVATED (everything's cheap for a reason...)");
        
        // Add random detuning to all synths
        Object.keys(window.state.products).forEach(id => {
          const product = window.state.products[id];
          if (product && product.synth && product.synth.detune) {
            product.synth.detune.value += Math.random() * 50 - 25; // Random detune +/- 25 cents
          }
        });
        
        // Set auto-disable timeout
        this.timeouts.discount = setTimeout(() => {
          this.toggleDiscountMode(false);
        }, CONFIG.modes.discount.autoDuration);
        
        // Show random messages
        if (window.uiEffects && window.uiEffects.showRandomAmbientMessage) {
          window.uiEffects.showRandomAmbientMessage();
        }
      } else {
        // Remove visual class
        document.body.classList.remove('discount-mode');
        
        // Hide indicator
        this.hideIndicator("discount");
        
        // Clear timeout
        if (this.timeouts.discount) {
          clearTimeout(this.timeouts.discount);
          this.timeouts.discount = null;
        }
        
        // Log the change
        window.log("Discount mode deactivated (prices return to normal...)");
        
        // Reset detuning
        Object.keys(window.state.products).forEach(id => {
          const product = window.state.products[id];
          if (product && product.synth && product.synth.detune) {
            product.synth.detune.value = 0;
          }
        });
      }
    },
    
    // Toggle inflation mode
    toggleInflationMode: function(enabled) {
      window.state.modes.inflation = enabled;
      
      // Check story mode goals after mode change
      if (window.storyMode && window.storyMode.storyActive) {
        setTimeout(() => {
          window.storyMode.checkGoal();
        }, 100);
      }
      
      if (enabled) {
        // Add visual class
        document.body.classList.add('inflation-mode');
        
        // Show indicator
        this.showModeIndicator("inflation", "INFLATION MODE");
        
        // Log the change
        window.log("📈 INFLATION MODE ACTIVATED (prices and pitches rising uncontrollably...)");
        
        // Apply to all current products
        Object.keys(window.state.products).forEach(id => {
          window.productManager.applyInflationToProduct(id);
        });
        
        // Set auto-disable timeout
        this.timeouts.inflation = setTimeout(() => {
          this.toggleInflationMode(false);
        }, CONFIG.modes.inflation.autoDuration);
        
        // Show random messages
        if (window.uiEffects && window.uiEffects.showRandomAmbientMessage) {
          window.uiEffects.showRandomAmbientMessage();
        }
      } else {
        // Remove visual class
        document.body.classList.remove('inflation-mode');
        
        // Hide indicator
        this.hideIndicator("inflation");
        
        // Clear timeout
        if (this.timeouts.inflation) {
          clearTimeout(this.timeouts.inflation);
          this.timeouts.inflation = null;
        }
        
        // Log the change
        window.log("Inflation mode deactivated (prices stabilize...)");
        
        // Stop all inflation effects
        Object.keys(window.state.products).forEach(id => {
          const product = window.state.products[id];
          if (product && product.inflationInterval) {
            clearInterval(product.inflationInterval);
            product.inflationInterval = null;
          }

          // Reset detune
          if (product && product.synth && product.synth.detune) {
            product.synth.detune.value = 0;
          }

          // Restore original volume
          if (product && product.synth && product._originalVolume !== undefined) {
            product.synth.volume.value = product._originalVolume;
            delete product._originalVolume;
          }
        });
      }
    },
    
    // Toggle consumerism mode
    toggleConsumerismMode: function(enabled) {
      window.state.modes.consumerism = enabled;
      
      if (enabled) {
        // Add visual class
        document.body.classList.add('consumerism-mode');
        
        // Show indicator
        this.showModeIndicator("consumerism", "CONSUME MODE");
        
        // Log the change
        window.log("🛍️ CONSUME MODE ACTIVATED (you need more products...)");
        
        // Apply to all current products
        Object.keys(window.state.products).forEach(id => {
          window.productManager.applyConsumerismToProduct(id);
        });
        
        // Affect cart wheels
        window.cartWheels.updateEffects();
        
        // Show more ads
        this.showConsumerismAds();
        
        // Set auto-disable timeout
        this.timeouts.consumerism = setTimeout(() => {
          this.toggleConsumerismMode(false);
        }, CONFIG.modes.consumerism.autoDuration);
      } else {
        // Remove visual class
        document.body.classList.remove('consumerism-mode');
        
        // Hide indicator
        this.hideIndicator("consumerism");
        
        // Clear timeout
        if (this.timeouts.consumerism) {
          clearTimeout(this.timeouts.consumerism);
          this.timeouts.consumerism = null;
        }
        
        // Log the change
        window.log("Consume mode deactivated (your desire for products diminishes...)");
        
        // Reset cart wheels
        window.cartWheels.resetEffects();
        
        // Reset all effects - simple solution is to reload all products
        // This is a bit heavy-handed but ensures all effects are properly reset
        this.resetEffects();
      }
    },
    
    // Toggle black friday mode
    toggleBlackFridayMode: function(enabled) {
      window.state.modes.black_friday = enabled;
      
      if (enabled) {
        // Add visual class
        document.body.classList.add('black-friday-mode');
        
        // Show indicator
        this.showModeIndicator("black_friday", "BLACK FRIDAY");
        
        // Log the change
        window.log("⚫️ BLACK FRIDAY MODE ACTIVATED (insanity in the aisles...)");
        
        // Apply to all current products
        Object.keys(window.state.products).forEach(id => {
          window.productManager.applyBlackFridayToProduct(id);
        });
        
        // Affect cart wheels
        window.cartWheels.updateEffects();
        
        // Show more ads (violent ones)
        this.showBlackFridayAds();
        
        // Set auto-disable timeout
        this.timeouts.black_friday = setTimeout(() => {
          this.toggleBlackFridayMode(false);
        }, CONFIG.modes.black_friday.autoDuration);
      } else {
        // Remove visual class
        document.body.classList.remove('black-friday-mode');
        
        // Hide indicator
        this.hideIndicator("black_friday");
        
        // Clear timeout
        if (this.timeouts.black_friday) {
          clearTimeout(this.timeouts.black_friday);
          this.timeouts.black_friday = null;
        }
        
        // Log the change
        window.log("Black Friday mode deactivated (the crowds disperse...)");
        
        // Reset cart wheels
        window.cartWheels.resetEffects();
        
        // Clean up all intervals
        Object.keys(window.state.products).forEach(id => {
          const product = window.state.products[id];
          if (product && product.blackFridayInterval) {
            clearInterval(product.blackFridayInterval);
            product.blackFridayInterval = null;
          }
        });
        
        // Reset all effects
        this.resetEffects();
      }
    },
    
    // Toggle aisle 7 ambience
    toggleAisle7Mode: function(enabled) {
      window.state.modes.aisle_7 = enabled;
      
      if (enabled) {
        // Add visual class
        document.body.classList.add('aisle-mode');
        
        // Show indicator
        this.showModeIndicator("aisle_7", "AISLE 7");
        
        // Log the change
        window.log("👁️ AISLE 7 ACTIVATED (where time and space distort...)");
        
        // Create spooky reverb effect on master output
        const reverb = new Tone.Reverb({
          decay: 10,
          wet: 0.7
        }).toDestination();
        
        // Store for later disposal
        window.state.masterEffects = window.state.masterEffects || {};
        window.state.masterEffects.aisle7 = reverb;
        
        Tone.Destination.connect(reverb);
        
        // Slow down transport
        Tone.Transport.bpm.rampTo(Tone.Transport.bpm.value * 0.7, 3);
        
        // Show spooky messages more frequently
        this.showAisle7Messages();
        
        // Set auto-disable timeout
        this.timeouts.aisle_7 = setTimeout(() => {
          this.toggleAisle7Mode(false);
        }, CONFIG.modes.aisle_7.autoDuration);
      } else {
        // Remove visual class
        document.body.classList.remove('aisle-mode');
        
        // Hide indicator
        this.hideIndicator("aisle_7");
        
        // Clear timeout
        if (this.timeouts.aisle_7) {
          clearTimeout(this.timeouts.aisle_7);
          this.timeouts.aisle_7 = null;
        }
        
        // Log the change
        window.log("Aisle 7 deactivated (you return to the main store...)");
        
        // Dispose reverb
        if (window.state.masterEffects && window.state.masterEffects.aisle7) {
          window.state.masterEffects.aisle7.dispose();
          window.state.masterEffects.aisle7 = null;
        }
        
        // Reset tempo
        Tone.Transport.bpm.rampTo(CONFIG.audio.defaultBPM, 2);
      }
    },
    
    // Toggle fluorescent lights flicker
    toggleFluorescentLightsMode: function(enabled) {
      window.state.modes.fluorescent_lights = enabled;
      
      if (enabled) {
        // Add visual class for flickering
        document.body.classList.add('fluorescent-flicker');
        
        // Show indicator
        this.showModeIndicator("fluorescent_lights", "FLICKER");
        
        // Log the change
        window.log("💡 FLUORESCENT LIGHTS FLICKER (the buzzing gets louder...)");
        
        // Create subtle tremolo effect on master output
        const tremolo = new Tone.Tremolo({
          frequency: 0.5 + Math.random(),
          depth: 0.2 + Math.random() * 0.3,
          wet: 0.5
        }).start().toDestination();
        
        // Store for later disposal
        window.state.masterEffects = window.state.masterEffects || {};
        window.state.masterEffects.fluorescent = tremolo;
        
        Tone.Destination.connect(tremolo);
        
        // Intensify flickering UI effects
        window.uiEffects.intensifyFlicker();
        
        // Set auto-disable timeout
        this.timeouts.fluorescent_lights = setTimeout(() => {
          this.toggleFluorescentLightsMode(false);
        }, CONFIG.modes.fluorescent_lights.autoDuration);
      } else {
        // Remove visual class
        document.body.classList.remove('fluorescent-flicker');
        
        // Hide indicator
        this.hideIndicator("fluorescent_lights");
        
        // Clear timeout
        if (this.timeouts.fluorescent_lights) {
          clearTimeout(this.timeouts.fluorescent_lights);
          this.timeouts.fluorescent_lights = null;
        }
        
        // Log the change
        window.log("Fluorescent lights stabilize (but the buzzing remains...)");
        
        // Dispose tremolo
        if (window.state.masterEffects && window.state.masterEffects.fluorescent) {
          window.state.masterEffects.fluorescent.dispose();
          window.state.masterEffects.fluorescent = null;
        }
        
        // Reset UI effects
        window.uiEffects.resetFlicker();
      }
    },
    
    // Toggle apocalypse mode
    toggleApocalypseMode: function(enabled) {
      window.state.modes.apocalypse = enabled;
      
      if (enabled) {
        // Add visual class for apocalypse
        document.body.classList.add('apocalypse-mode');
        
        // Show indicator
        this.showModeIndicator("apocalypse", "APOCALYPSE");
        
        // Log the change
        window.log("☢️ APOCALYPSE MODE ACTIVATED (reality breaks down...)", true);
        
        // Apply global distortion
        const distortion = new Tone.Distortion({
          distortion: 0.4,
          wet: 0.2
        }).toDestination();
        
        // Store for later disposal
        window.state.masterEffects = window.state.masterEffects || {};
        window.state.masterEffects.apocalypse = distortion;
        
        Tone.Destination.connect(distortion);
        
        // Randomize BPM
        Tone.Transport.bpm.value = 80 + Math.random() * 100;
        
        // Apply apocalypse to all products
        Object.keys(window.state.products).forEach(id => {
          window.productManager.applyApocalypseToProduct(id);
        });
        
        // Create global interval for random effects
        window.state.apocalypseInterval = setInterval(() => {
          // Randomly change BPM
          Tone.Transport.bpm.rampTo(80 + Math.random() * 100, 2);
          
          // Random master volume fluctuations
          Tone.Destination.volume.rampTo(Math.random() * -10, 0.5);
          
          // Random chance to add or remove products
          if (Math.random() < 0.3) {
            this.randomApocalypseProductChange();
          }
        }, 3000); // Every 3 seconds
        
        // Show spooky messages more frequently
        this.showApocalypseMessages();
        
        // No auto-disable for apocalypse - it's too chaotic
      } else {
        // Remove visual class
        document.body.classList.remove('apocalypse-mode');
        
        // Hide indicator
        this.hideIndicator("apocalypse");
        
        // Clear timeout
        if (this.timeouts.apocalypse) {
          clearTimeout(this.timeouts.apocalypse);
          this.timeouts.apocalypse = null;
        }
        
        // Log the change
        window.log("Apocalypse mode deactivated (relative stability returns...)");
        
        // Dispose distortion
        if (window.state.masterEffects && window.state.masterEffects.apocalypse) {
          window.state.masterEffects.apocalypse.dispose();
          window.state.masterEffects.apocalypse = null;
        }
        
        // Reset global settings
        Tone.Destination.disconnect();
        Tone.Destination.volume.value = CONFIG.audio.masterVolume;
        
        // Reset BPM
        Tone.Transport.bpm.value = CONFIG.audio.defaultBPM;
        
        // Clear global interval
        if (window.state.apocalypseInterval) {
          clearInterval(window.state.apocalypseInterval);
          window.state.apocalypseInterval = null;
        }
        
        // Clean up all product intervals
        Object.keys(window.state.products).forEach(id => {
          const product = window.state.products[id];
          if (product && product.apocalypseInterval) {
            clearInterval(product.apocalypseInterval);
            product.apocalypseInterval = null;
          }
        });
        
        // Reset all effects
        this.resetEffects();
      }
    },
    
    // Reset all effects by refreshing audio engine
    resetEffects: function() {
      // Re-create all current products
      const currentProducts = JSON.parse(JSON.stringify(window.state.products));
      
      // Reset audio engine
      window.audioEngine.setupGlobalEffects();
      
      // Remove all products
      Object.keys(window.state.products).forEach(id => {
        window.productManager.removeProductById(id);
      });
      
      // Re-add all products
      Object.keys(currentProducts).forEach(id => {
        const product = currentProducts[id];
        window.productManager.addProduct(product.name, Object.keys(product.modifiers).join(' '));
      });
    },
    
    // Show mode indicator
    showModeIndicator: function(modeName, displayName) {
      // Remove existing indicator if any
      if (this.indicators[modeName]) {
        this.hideIndicator(modeName);
      }
      
      // Create new indicator
      const indicator = document.createElement("div");
      indicator.className = "mode-indicator";
      indicator.textContent = displayName;
      document.body.appendChild(indicator);
      
      // Store reference
      this.indicators[modeName] = indicator;
    },
    
    // Hide mode indicator
    hideIndicator: function(modeName) {
      if (this.indicators[modeName]) {
        this.indicators[modeName].remove();
        this.indicators[modeName] = null;
      }
    },
    
    // Show consumerism ads
    showConsumerismAds: function() {
      // Show 5 ads in sequence
      const showAd = (index) => {
        setTimeout(() => {
          // Get a random product name
          const productKeys = Object.keys(window.productTypes);
          const randomProductName = productKeys[Math.floor(Math.random() * productKeys.length)];
          
          // Show ad
          window.productManager.showRandomAd(randomProductName);
        }, index * 3000); // Every 3 seconds
      };
      
      for (let i = 0; i < 5; i++) {
        showAd(i);
      }
    },
    
    // Show black friday ads
    showBlackFridayAds: function() {
      // Black Friday specific aggressive ads
      const blackFridayAds = [
        "BUY NOW OR MISS OUT FOREVER!",
        "DOORBUSTING DEALS! TRAMPLED FOR SAVINGS!",
        "FIGHT FOR THE LAST ONE!",
        "90% OFF! QUANTITIES EXTREMELY LIMITED!",
        "EXCLUSIVE BLACK FRIDAY OFFER - JUST KILL FOR IT",
        "BUY BUY BUY BEFORE IT'S GONE!",
        "LOWEST PRICES OF THE YEAR - WORTH DYING FOR!"
      ];
      
      // Show more aggressive black friday messages
      const showAd = (index) => {
        setTimeout(() => {
          // Create ad message element
          const messageEl = document.createElement("div");
          messageEl.className = "ad-message";
          messageEl.textContent = blackFridayAds[index % blackFridayAds.length];
          messageEl.style.top = `${30 + (Math.random() * 40)}%`;
          messageEl.style.left = `${20 + (Math.random() * 60)}%`;
          document.body.appendChild(messageEl);
          
          // Remove after animation completes
          setTimeout(() => {
            messageEl.remove();
          }, 4000);
        }, index * 2000); // Every 2 seconds - more frequent
      };
      
      for (let i = 0; i < 7; i++) {
        showAd(i);
      }
    },
    
    // Show aisle 7 messages
    showAisle7Messages: function() {
      // Aisle 7 specific creepy messages
      const aisle7Messages = [
        "Aisle 7 never ends...",
        "The products in Aisle 7 watch you...",
        "Aisle 7 existed before the store...",
        "Nobody returns from Aisle 7...",
        "The expiration dates in Aisle 7 are all wrong...",
        "Aisle 7 is where lost customers go...",
        "The floor in Aisle 7 feels... soft...",
        "Aisle 7 wasn't here yesterday...",
        "The ceiling in Aisle 7 breathes...",
        "Aisle 7 remembers you..."
      ];
      
      // Show creepy aisle 7 messages
      const showMessage = (index) => {
        setTimeout(() => {
          window.uiEffects.showCustomAmbientMessage(
            aisle7Messages[index % aisle7Messages.length]
          );
        }, index * 4000); // Every 4 seconds
      };
      
      for (let i = 0; i < 5; i++) {
        showMessage(i);
      }
    },
    
    // Show apocalypse messages
    showApocalypseMessages: function() {
      // Apocalypse specific messages
      const apocalypseMessages = [
        "THE END IS HERE",
        "NO MORE SHOPPING DAYS LEFT",
        "CONSUME ONE LAST TIME",
        "CAPITALISM'S FINAL SALE",
        "TIME EXPIRED",
        "ALL ITEMS MUST GO... FOREVER",
        "YOUR CART IS THE LEAST OF YOUR WORRIES",
        "PRICE CHECK ON ARMAGEDDON",
        "YOUR PURCHASE WON'T SAVE YOU",
        "THE MANAGER CAN'T HELP YOU NOW"
      ];
      
      // Show apocalyptic messages
      const showMessage = (index) => {
        setTimeout(() => {
          // Create apocalypse message element
          const messageEl = document.createElement("div");
          messageEl.className = "ad-message";
          messageEl.style.color = "#ff0000";
          messageEl.style.fontSize = "32px";
          messageEl.textContent = apocalypseMessages[index % apocalypseMessages.length];
          messageEl.style.top = `${30 + (Math.random() * 40)}%`;
          messageEl.style.left = `${20 + (Math.random() * 60)}%`;
          document.body.appendChild(messageEl);
          
          // Remove after animation completes
          setTimeout(() => {
            messageEl.remove();
          }, 4000);
        }, index * 3000); // Every 3 seconds
      };
      
      for (let i = 0; i < 8; i++) {
        showMessage(i);
      }
    },
    
    // Random apocalypse product changes
    randomApocalypseProductChange: function() {
      const productKeys = Object.keys(window.productTypes);
      const currentProducts = Object.keys(window.state.products).map(id => window.state.products[id].name);
      
      // Chance to add a random product
      if (Math.random() < 0.5 && currentProducts.length < CONFIG.audio.maxProducts) {
        // Choose a random product type
        const randomProduct = productKeys[Math.floor(Math.random() * productKeys.length)];
        
        // Random modifiers
        const modifiers = ["old", "vomit", "industrial", "cheap", "artificial", "mass-produced"];
        const randomModifier = modifiers[Math.floor(Math.random() * modifiers.length)];
        
        // Add the product
        window.productManager.addProduct(randomProduct, randomModifier);
        window.log(`Apocalypse has spawned ${randomModifier} ${randomProduct}!`);
      }
      // Chance to remove a random product
      else if (currentProducts.length > 0) {
        // Choose a random product to remove
        const randomProductToRemove = currentProducts[Math.floor(Math.random() * currentProducts.length)];
        
        // Remove it
        window.productManager.removeProduct(randomProductToRemove);
        window.log(`Apocalypse has devoured ${randomProductToRemove}!`);
      }
    }
  };