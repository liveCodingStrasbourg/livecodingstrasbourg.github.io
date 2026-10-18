// command-parser.js - Parses and executes text commands

// Immediately initialize the command parser - this will be available globally
(function() {
    console.log("Initializing command parser...");
    
    // Main command parser module functionality
    window.commandParser = {
      // Execute command with story tracking
      executeCommandWithTracking: function(cmd) {
        const result = this.executeCommand(cmd);
        
        // Check story goals after successful command
        if (result && window.storyMode && window.storyMode.storyActive) {
          setTimeout(() => {
            window.storyMode.checkGoal();
          }, 500);
        }
        
        return result;
      },
      
      // Execute command string
      executeCommand: function(cmd) {
        // Normalize and trim command
        cmd = cmd.toLowerCase().trim();
        
        // Log the command to output
        if (window.log) {
          window.log(`> ${cmd}`);
        } else {
          console.log(`Command: ${cmd}`);
        }
        
        // Store command for story mode tracking
        this.lastCommand = cmd;
        
        // Time commands
        if (this.isClosingTimeCommand(cmd)) {
          return this.handleClosingTimeCommand(cmd);
        }
        
        if (this.isOpeningTimeCommand(cmd)) {
          return this.handleOpeningTimeCommand(cmd);
        }
        
        // Cart wheels commands (rhythm section)
        if (cmd.startsWith("my cart has")) {
          return this.handleCartWheelsCommand(cmd);
        }
        
        // Product commands (add/remove products)
        if (cmd.startsWith("add")) {
          return this.handleAddProductCommand(cmd);
        }
        
        if (cmd.startsWith("remove")) {
          return this.handleRemoveProductCommand(cmd);
        }
        
        // Mode commands
        if (this.isDiscountModeCommand(cmd)) {
          return this.handleDiscountModeCommand(cmd);
        }
        
        if (this.isInflationModeCommand(cmd)) {
          return this.handleInflationModeCommand(cmd);
        }
        
        if (this.isConsumerismModeCommand(cmd)) {
          return this.handleConsumerismModeCommand(cmd);
        }
        
        if (this.isBlackFridayModeCommand(cmd)) {
          return this.handleBlackFridayModeCommand(cmd);
        }
        
        if (this.isAisle7Command(cmd)) {
          return this.handleAisle7Command(cmd);
        }
        
        if (this.isFluorescentLightsCommand(cmd)) {
          return this.handleFluorescentLightsCommand(cmd);
        }
        
        if (this.isApocalypseModeCommand(cmd)) {
          return this.handleApocalypseModeCommand(cmd);
        }
        
        // Check if it's closing time command (increase tempo)
        if (this.isClosingTimeCommand(cmd)) {
          return this.handleClosingTimeCommand(cmd);
        }
        
        // Check if it's opening time command (decrease tempo)
        if (this.isOpeningTimeCommand(cmd)) {
          return this.handleOpeningTimeCommand(cmd);
        }
        
        // Check for store feature commands
        if (this.isCheckoutCommand(cmd) || this.isFinishCheckoutCommand(cmd) ||
            this.isScanBarcodeCommand(cmd) || this.isSeasonCommand(cmd) ||
            this.isAnnouncementCommand(cmd) || this.isRushHourCommand(cmd) ||
            this.isCouponCommand(cmd) || this.isDecayCommand(cmd) ||
            this.isStoreLayoutCommand(cmd) || this.isMapComposeCommand(cmd)) {
          return this.handleStoreFeatureCommand(cmd);
        }
        
        // Check for performance commands
        if (cmd === "performance stats" || cmd === "show performance") {
          return this.showPerformanceStats();
        }
        
        if (cmd.startsWith("performance mode ")) {
          const mode = cmd.replace("performance mode ", "").trim();
          return this.setPerformanceMode(mode);
        }
        
        // Check for shoplifting commands
        if (this.isShopliftCommand(cmd)) {
          return this.handleShopliftCommand(cmd);
        }
        
        // Check for story mode commands
        if (cmd === "story mode" || cmd === "start story") {
          if (window.storyMode) {
            window.storyMode.start();
            return true;
          }
          return false;
        }
        
        if (cmd === "skip story" || cmd === "story skip") {
          if (window.storyMode) {
            window.storyMode.skipStory();
            return true;
          }
          return false;
        }
        
        // Check for performance mode commands
        if (this.isPerformanceModeCommand(cmd)) {
          return this.handlePerformanceModeCommand(cmd);
        }
        
        // Unknown command
        if (window.log) {
          window.log("Unknown command - the register won't accept that.");
        } else {
          console.log("Unknown command");
        }
        
        // Don't check story goals for unknown commands
        return false;
      },
      
      // Handle cart wheels command
      handleCartWheelsCommand: function(cmd) {
        const wheelText = cmd.replace("my cart has", "").trim();
        
        // Check for new material attributes (heavy, iron, steel) combined with wheel types
        if (window.cartWheels && window.cartWheels.setWheels) {
          window.cartWheels.setWheels(wheelText);
        } else {
          console.log("Cart wheels handler not loaded");
          if (window.log) window.log("Cart wheels system not available yet.");
        }
        return true;
      },
      
      // Check for "it's closing time" command
      isClosingTimeCommand: function(cmd) {
        return cmd === "it's closing time" || cmd === "its closing time";
      },
      
      // Handle "it's closing time" command
      handleClosingTimeCommand: function(cmd) {
        if (window.audioEngine && window.audioEngine.changeBPM) {
          window.audioEngine.changeBPM(10); // Increase BPM by 10
          window.log("It's closing time! The music speeds up as customers rush to finish shopping...");
          return true;
        } else {
          console.log("Audio engine not loaded");
          if (window.log) window.log("Audio engine not available yet.");
          return false;
        }
      },
      
      // Check for "it's opening time" command
      isOpeningTimeCommand: function(cmd) {
        return cmd === "it's opening time" || cmd === "its opening time";
      },
      
      // Handle "it's opening time" command
      handleOpeningTimeCommand: function(cmd) {
        if (window.audioEngine && window.audioEngine.changeBPM) {
          window.audioEngine.changeBPM(-10); // Decrease BPM by 10
          window.log("It's opening time! The music slows down as the day begins calmly...");
          return true;
        } else {
          console.log("Audio engine not loaded");
          if (window.log) window.log("Audio engine not available yet.");
          return false;
        }
      },
      
      // Check for checkout commands
      isCheckoutCommand: function(cmd) {
        return cmd === "checkout" || cmd === "start checkout";
      },
      
      isFinishCheckoutCommand: function(cmd) {
        return cmd === "finish checkout" || cmd === "stop checkout";
      },
      
      isScanBarcodeCommand: function(cmd) {
        return cmd.startsWith("scan barcode") || cmd.startsWith("scan");
      },
      
      // Check for season commands
      isSeasonCommand: function(cmd) {
        return cmd.startsWith("season ");
      },
      
      // Check for announcement commands
      isAnnouncementCommand: function(cmd) {
        return cmd.startsWith("announcement ") || cmd.startsWith("announce ");
      },
      
      // Check for rush hour commands
      isRushHourCommand: function(cmd) {
        return cmd === "rush hour on" || cmd === "rush hour off";
      },
      
      // Check for coupon commands
      isCouponCommand: function(cmd) {
        return cmd.startsWith("apply coupon ") || cmd.startsWith("coupon ");
      },
      
      // Check for decay commands
      isDecayCommand: function(cmd) {
        return cmd === "decay on" || cmd === "decay off" || cmd === "spoil all" || 
               cmd.startsWith("preserve ");
      },
      
      // Check for store layout commands
      isStoreLayoutCommand: function(cmd) {
        return cmd === "store layout" || cmd === "show layout" || cmd === "view store";
      },
      
      // Check for map compose commands
      isMapComposeCommand: function(cmd) {
        return cmd === "map compose on" || cmd === "map compose off" || cmd === "map compose";
      },
      
      // Handle store features commands
      handleStoreFeatureCommand: function(cmd) {
        if (!window.storeFeatures) {
          console.log("Store features not loaded");
          window.log("Store features not available yet.");
          return false;
        }
        
        // Checkout
        if (this.isCheckoutCommand(cmd)) {
          window.storeFeatures.startCheckout();
          return true;
        }
        
        if (this.isFinishCheckoutCommand(cmd)) {
          window.storeFeatures.finishCheckout();
          return true;
        }
        
        // Barcode scanning
        if (this.isScanBarcodeCommand(cmd)) {
          const barcode = cmd.replace(/scan\s*(barcode)?\s*/i, '').trim();
          window.storeFeatures.scanBarcode(barcode);
          return true;
        }
        
        // Seasons
        if (this.isSeasonCommand(cmd)) {
          const season = cmd.replace("season ", "").trim().toLowerCase();
          window.storeFeatures.setSeason(season);
          return true;
        }
        
        // Announcements
        if (this.isAnnouncementCommand(cmd)) {
          const message = cmd.replace(/announce(ment)?\s+/i, '').trim();
          window.storeFeatures.makeAnnouncement(message);
          return true;
        }
        
        // Rush hour
        if (cmd === "rush hour on") {
          window.storeFeatures.startRushHour();
          return true;
        }
        if (cmd === "rush hour off") {
          window.storeFeatures.endRushHour();
          return true;
        }
        
        // Coupons
        if (this.isCouponCommand(cmd)) {
          const code = cmd.replace(/^(apply\s+)?coupon\s+/i, '').trim();
          window.storeFeatures.applyCoupon(code);
          return true;
        }
        
        // Decay system
        if (cmd === "decay on") {
          window.storeFeatures.startProductDecay();
          return true;
        }
        if (cmd === "decay off") {
          window.storeFeatures.stopDecay();
          return true;
        }
        if (cmd === "spoil all") {
          window.storeFeatures.spoilAll();
          return true;
        }
        if (cmd.startsWith("preserve ")) {
          const product = cmd.replace("preserve ", "").trim();
          window.storeFeatures.preserveProduct(product);
          return true;
        }
        
        // Store layout visualizer
        if (this.isStoreLayoutCommand(cmd)) {
          if (window.storeLayout) {
            window.storeLayout.show();
            return true;
          } else {
            window.log("Store Layout Visualizer not available yet.");
            return false;
          }
        }
        
        // Map compose mode
        if (this.isMapComposeCommand(cmd)) {
          if (window.storeLayout) {
            if (cmd === "map compose" || cmd === "map compose on") {
              window.storeLayout.show();
              setTimeout(() => {
                if (!window.storeLayout.mapComposing.enabled) {
                  window.storeLayout.toggleMapCompose();
                }
              }, 100);
              return true;
            } else if (cmd === "map compose off") {
              if (window.storeLayout.mapComposing.enabled) {
                window.storeLayout.toggleMapCompose();
              }
              return true;
            }
          } else {
            window.log("Store Layout Visualizer not available yet.");
            return false;
          }
        }
        
        return false;
      },
      
      // Handle add product command
      handleAddProductCommand: function(cmd) {
        const addParts = cmd.replace("add", "").trim();
        
        // Break down the command
        const parsed = this.parseProductCommand(addParts);
        
        if (parsed.productName) {
          // Check if product exists and product manager is available
          if (window.productTypes && window.productTypes[parsed.productName]) {
            if (window.productManager && window.productManager.addProduct) {
              window.productManager.addProduct(parsed.productName, parsed.modifier);
            } else {
              console.log("Product manager not loaded");
              if (window.log) window.log("Product management system not available yet.");
            }
          } else {
            if (window.log) {
              window.log(`Unknown product: ${parsed.productName}. This market has been abandoned for decades.`);
            }
          }
          return true;
        } else {
          if (window.log) window.log("Invalid command format. Try 'add [product]'.");
          return false;
        }
      },
      
      // Handle remove product command
      handleRemoveProductCommand: function(cmd) {
        const productName = cmd.replace("remove", "").trim();
        
        if (window.productManager && window.productManager.removeProduct) {
          return window.productManager.removeProduct(productName);
        } else {
          console.log("Product manager not loaded");
          if (window.log) window.log("Product management system not available yet.");
          return false;
        }
      },
      
      // Parse product command to extract product name and modifiers
      parseProductCommand: function(addParts) {
        // Extract the product name (last word before special parameters if present)
        let productName, modifier;
        
        // Find the position of product name by checking for special parameters
        const nutriscorePos = addParts.toLowerCase().indexOf("nutriscore");
        const shelfLifePos = addParts.toLowerCase().indexOf("shelflife");
        const openProductPos = addParts.toLowerCase().indexOf("open");
        const escalatorPos = addParts.toLowerCase().indexOf("escalator");
        
        // Determine where to look for the product name
        let cutoffPos = addParts.length;
        
        // Find the earliest special parameter
        if (nutriscorePos !== -1) {
          cutoffPos = Math.min(cutoffPos, nutriscorePos);
        }
        
        if (shelfLifePos !== -1) {
          cutoffPos = Math.min(cutoffPos, shelfLifePos);
        }
        
        if (openProductPos !== -1) {
          cutoffPos = Math.min(cutoffPos, openProductPos);
        }
        
        if (escalatorPos !== -1) {
          cutoffPos = Math.min(cutoffPos, escalatorPos);
        }
        
        // Get the part before any special parameters
        const beforeSpecials = addParts.substring(0, cutoffPos).trim();
        
        // Last word is the product name
        const parts = beforeSpecials.split(" ");
        if (parts.length > 0) {
          productName = parts.pop();
          // Everything else before the product name is the modifier
          modifier = parts.join(" ");
          
          // Add the special parameters back to the modifier
          if (cutoffPos < addParts.length) {
            modifier = (modifier + " " + addParts.substring(cutoffPos)).trim();
          }
        }
        
        return { productName, modifier };
      },
      
      // Check for discount mode command
      isDiscountModeCommand: function(cmd) {
        return cmd === "discount mode on" || cmd === "discount mode off";
      },
      
      // Handle discount mode command
      handleDiscountModeCommand: function(cmd) {
        const enabled = cmd.endsWith("on");
        
        if (window.modeManager && window.modeManager.toggleDiscountMode) {
          window.modeManager.toggleDiscountMode(enabled);
        } else {
          console.log("Mode manager not loaded");
          if (window.log) window.log("Mode management system not available yet.");
        }
        return true;
      },
      
      // Check for inflation mode command
      isInflationModeCommand: function(cmd) {
        return cmd === "inflation mode on" || cmd === "inflation mode off";
      },
      
      // Handle inflation mode command
      handleInflationModeCommand: function(cmd) {
        const enabled = cmd.endsWith("on");
        
        if (window.modeManager && window.modeManager.toggleInflationMode) {
          window.modeManager.toggleInflationMode(enabled);
        } else {
          console.log("Mode manager not loaded");
          if (window.log) window.log("Mode management system not available yet.");
        }
        return true;
      },
      
      // Check for consumerism mode command
      isConsumerismModeCommand: function(cmd) {
        return cmd === "consumerism mode on" || cmd === "consumerism mode off";
      },
      
      // Handle consumerism mode command
      handleConsumerismModeCommand: function(cmd) {
        const enabled = cmd.endsWith("on");
        
        if (window.modeManager && window.modeManager.toggleConsumerismMode) {
          window.modeManager.toggleConsumerismMode(enabled);
        } else {
          console.log("Mode manager not loaded");
          if (window.log) window.log("Mode management system not available yet.");
        }
        return true;
      },
      
      // Check for black friday mode command
      isBlackFridayModeCommand: function(cmd) {
        return cmd === "black_friday mode on" || cmd === "black_friday mode off" ||
               cmd === "black friday mode on" || cmd === "black friday mode off";
      },
      
      // Handle black friday mode command
      handleBlackFridayModeCommand: function(cmd) {
        const enabled = cmd.endsWith("on");
        
        if (window.modeManager && window.modeManager.toggleBlackFridayMode) {
          window.modeManager.toggleBlackFridayMode(enabled);
        } else {
          console.log("Mode manager not loaded");
          if (window.log) window.log("Mode management system not available yet.");
        }
        return true;
      },
      
      // Check for aisle 7 ambience command
      isAisle7Command: function(cmd) {
        return cmd === "aisle_7 ambience on" || cmd === "aisle_7 ambience off" ||
               cmd === "aisle 7 ambience on" || cmd === "aisle 7 ambience off" ||
               cmd === "aisle_7 mode on" || cmd === "aisle_7 mode off" ||
               cmd === "aisle 7 mode on" || cmd === "aisle 7 mode off";
      },
      
      // Handle aisle 7 ambience command
      handleAisle7Command: function(cmd) {
        const enabled = cmd.endsWith("on");
        
        if (window.modeManager && window.modeManager.toggleAisle7Mode) {
          window.modeManager.toggleAisle7Mode(enabled);
        } else {
          console.log("Mode manager not loaded");
          if (window.log) window.log("Mode management system not available yet.");
        }
        return true;
      },
      
      // Check for fluorescent lights flicker command
      isFluorescentLightsCommand: function(cmd) {
        return cmd === "fluorescent_lights flicker on" || cmd === "fluorescent_lights flicker off" ||
               cmd === "fluorescent lights flicker on" || cmd === "fluorescent lights flicker off" ||
               cmd === "fluorescent_lights mode on" || cmd === "fluorescent_lights mode off" ||
               cmd === "fluorescent lights mode on" || cmd === "fluorescent lights mode off";
      },
      
      // Handle fluorescent lights flicker command
      handleFluorescentLightsCommand: function(cmd) {
        const enabled = cmd.endsWith("on");
        
        if (window.modeManager && window.modeManager.toggleFluorescentLightsMode) {
          window.modeManager.toggleFluorescentLightsMode(enabled);
        } else {
          console.log("Mode manager not loaded");
          if (window.log) window.log("Mode management system not available yet.");
        }
        return true;
      },
      
      // Check for apocalypse mode command
      isApocalypseModeCommand: function(cmd) {
        return cmd === "apocalypse mode on" || cmd === "apocalypse mode off";
      },
      
      // Handle apocalypse mode command
      handleApocalypseModeCommand: function(cmd) {
        const enabled = cmd.endsWith("on");
        
        if (window.modeManager && window.modeManager.toggleApocalypseMode) {
          window.modeManager.toggleApocalypseMode(enabled);
        } else {
          console.log("Mode manager not loaded");
          if (window.log) window.log("Mode management system not available yet.");
        }
        return true;
      },
      
      // Check for performance mode command
      isPerformanceModeCommand: function(cmd) {
        return cmd.includes("performance mode") || 
               cmd.includes("quality mode") || 
               cmd.includes("balanced mode");
      },
      
      // Handle performance mode command
      handlePerformanceModeCommand: function(cmd) {
        if (!window.performanceManager) {
          window.log("Performance manager not available");
          return false;
        }
        
        if (cmd.includes("performance mode")) {
          window.performanceManager.setPerformanceMode('performance');
          window.log("🚀 Performance mode activated - optimized for stability");
        } else if (cmd.includes("quality mode")) {
          window.performanceManager.setPerformanceMode('quality');
          window.log("🎵 Quality mode activated - maximum audio fidelity");
        } else if (cmd.includes("balanced mode")) {
          window.performanceManager.setPerformanceMode('balanced');
          window.log("⚖️ Balanced mode activated - good quality and performance");
        }
        
        return true;
      },
      
      // Generate a random command
      generateRandomCommand: function() {
        // List of possible command categories
        const commandCategories = [
          'cart_wheels',
          'add_product',
          'remove_product',
          'toggle_mode',
          'time_command'
        ];
        
        // Pick a random category
        const category = commandCategories[Math.floor(Math.random() * commandCategories.length)];
        
        switch(category) {
          case 'cart_wheels':
            return this.generateRandomCartWheelsCommand();
          case 'add_product':
            return this.generateRandomAddProductCommand();
          case 'remove_product':
            return this.generateRandomRemoveProductCommand();
          case 'toggle_mode':
            return this.generateRandomModeCommand();
          case 'time_command':
            return this.generateRandomTimeCommand();
          default:
            return "add beer"; // Fallback
        }
      },
      
      // Generate random cart wheels command
      generateRandomCartWheelsCommand: function() {
        const wheelTypes = ["square", "broken", "premium", "defective", "bargain", "luxury"];
        const wheelMaterials = ["", "heavy ", "iron ", "steel "];
        
        const randomType = wheelTypes[Math.floor(Math.random() * wheelTypes.length)];
        const randomMaterial = wheelMaterials[Math.floor(Math.random() * wheelMaterials.length)];
        
        return `my cart has ${randomMaterial}${randomType} wheels`;
      },
      
      // Generate random time command
      generateRandomTimeCommand: function() {
        const timeCommands = ["it's closing time", "it's opening time"];
        return timeCommands[Math.floor(Math.random() * timeCommands.length)];
      },
      
      // Generate random add product command
      generateRandomAddProductCommand: function() {
        // Make sure productTypes is available
        if (!window.productTypes) {
          return "add beer"; // Default fallback
        }
        
        // Get a random product
        const productKeys = Object.keys(window.productTypes);
        const randomProduct = productKeys[Math.floor(Math.random() * productKeys.length)];
        
        // Chance for a simple add command
        if (Math.random() < 0.3) {
          return `add ${randomProduct}`;
        }
        
        // Possible modifiers
        const modifiers = [
          "fresh", "old", "strong", "flavorless", 
          "cheap", "expensive", "processed", "industrial", 
          "overpriced", "vomit", "artisanal", "bargain",
          "luxury", "artificial", "mass-produced", "addictive",
          "packaged", "glass" // New modifiers
        ];
        
        // Select 1-2 modifiers
        let selectedModifiers = [];
        const numModifiers = Math.random() < 0.7 ? 1 : 2;
        
        for (let i = 0; i < numModifiers; i++) {
          const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
          if (!selectedModifiers.includes(mod)) {
            selectedModifiers.push(mod);
          }
        }
        
        // Chance for special parameters
        let specialParams = "";
        
        // Nutriscore
        if (Math.random() < 0.2) {
          const nutritionGrades = ['A', 'B', 'C', 'D', 'E'];
          const randomGrade = nutritionGrades[Math.floor(Math.random() * nutritionGrades.length)];
          specialParams += ` nutriscore ${randomGrade}`;
        }
        
        // Shelf life
        if (Math.random() < 0.2) {
          const shelfLifeOptions = ['today', 'week', 'month', 'year', 'decade', 'forever'];
          const randomShelfLife = shelfLifeOptions[Math.floor(Math.random() * shelfLifeOptions.length)];
          specialParams += ` shelflife ${randomShelfLife}`;
        }
        
        // Open
        if (Math.random() < 0.2) {
          specialParams += " open";
        }
        
        return `add ${selectedModifiers.join(' ')} ${randomProduct}${specialParams}`;
      },
      
      // Generate random remove product command
      generateRandomRemoveProductCommand: function() {
        // Make sure state.products is available
        if (!window.state || !window.state.products) {
          return this.generateRandomAddProductCommand(); // Fallback to add
        }
        
        // Get all current products
        const currentProducts = Object.values(window.state.products).map(p => p.name);
        
        // If no products, fall back to add command
        if (currentProducts.length === 0) {
          return this.generateRandomAddProductCommand();
        }
        
        // Pick a random product to remove
        const randomProduct = currentProducts[Math.floor(Math.random() * currentProducts.length)];
        return `remove ${randomProduct}`;
      },
      
      // Generate random mode command
      generateRandomModeCommand: function() {
        const modes = [
          'discount',
          'inflation',
          'consumerism',
          'black_friday',
          'aisle_7 ambience',
          'fluorescent_lights flicker',
          'apocalypse'
        ];
        
        const randomMode = modes[Math.floor(Math.random() * modes.length)];
        const action = Math.random() < 0.8 ? 'on' : 'off'; // Bias toward turning modes on
        
        return `${randomMode} mode ${action}`;
      },
      
      // Show performance stats
      showPerformanceStats: function() {
        if (!window.performanceManager) {
          window.log("Performance monitoring not available.");
          return false;
        }
        
        const stats = window.performanceManager.getStats();
        window.log("🎛️ PERFORMANCE STATISTICS:");
        window.log(`Active Voices: ${stats.activeVoices}/${stats.maxPolyphony}`);
        window.log(`Dropped Voices: ${stats.droppedVoices}`);
        window.log(`Effect Reuses: ${stats.effectReuses}`);
        window.log(`Synth Reuses: ${stats.synthReuses}`);
        window.log(`Performance Mode: ${stats.performanceMode}`);
        window.log(`Synth Pool: ${stats.synthPoolUsage.inUse} in use, ${stats.synthPoolUsage.available} available`);
        return true;
      },
      
      // Set performance mode
      setPerformanceMode: function(mode) {
        if (!window.performanceManager) {
          window.log("Performance manager not available.");
          return false;
        }
        
        if (['performance', 'balanced', 'quality'].includes(mode)) {
          window.performanceManager.setPerformanceMode(mode);
          window.log(`🎚️ Performance mode set to: ${mode.toUpperCase()}`);
          return true;
        } else {
          window.log("Invalid performance mode. Use: performance, balanced, or quality");
          return false;
        }
      },
      
      // Check if command is shoplifting related
      isShopliftCommand: function(cmd) {
        return cmd.startsWith("shoplift ") || 
               cmd.startsWith("steal ") || 
               cmd.startsWith("pocket ") ||
               cmd.startsWith("five finger discount ") ||
               cmd.startsWith("security level ") ||
               cmd === "security chase" ||
               cmd === "security chase on" ||
               cmd === "security chase off" ||
               cmd === "shoplifting stats" ||
               cmd === "theft stats";
      },
      
      // Handle shoplifting commands
      handleShopliftCommand: function(cmd) {
        if (!window.shopliftingSystem) {
          window.log("Shoplifting system not available.");
          return false;
        }
        
        // Shoplift product commands
        if (cmd.startsWith("shoplift ") || cmd.startsWith("steal ") || 
            cmd.startsWith("pocket ") || cmd.startsWith("five finger discount ")) {
          const productName = cmd.replace(/^(shoplift|steal|pocket|five finger discount)\s+/, '').trim();
          return window.shopliftingSystem.shopliftProduct(productName);
        }
        
        // Security level
        if (cmd.startsWith("security level ")) {
          const level = cmd.replace("security level ", "").trim();
          if (level === "low") {
            window.shopliftingSystem.setSecurityLevel(0.3);
          } else if (level === "medium") {
            window.shopliftingSystem.setSecurityLevel(0.5);
          } else if (level === "high") {
            window.shopliftingSystem.setSecurityLevel(0.7);
          } else if (level === "paranoid") {
            window.shopliftingSystem.setSecurityLevel(0.95);
          } else {
            const numLevel = parseFloat(level);
            if (!isNaN(numLevel)) {
              window.shopliftingSystem.setSecurityLevel(numLevel / 100);
            } else {
              window.log("Invalid security level. Use: low, medium, high, paranoid, or 0-100");
              return false;
            }
          }
          return true;
        }
        
        // Security chase
        if (cmd === "security chase" || cmd === "security chase on") {
          window.shopliftingSystem.startChase();
          return true;
        }
        
        if (cmd === "security chase off") {
          window.shopliftingSystem.stopChase();
          return true;
        }
        
        // Stats
        if (cmd === "shoplifting stats" || cmd === "theft stats") {
          const stats = window.shopliftingSystem.getStats();
          window.log("🚨 SHOPLIFTING STATISTICS:");
          window.log(`Total Attempts: ${stats.totalThefts}`);
          window.log(`Successful Escapes: ${stats.successful}`);
          window.log(`Caught by Security: ${stats.caught}`);
          window.log(`Currently Stealing: ${stats.currentlyStealing}`);
          window.log(`In Detention: ${stats.detained}`);
          window.log(`Security Level: ${stats.securityLevel}`);
          return true;
        }
        
        return false;
      }
    };
    
    console.log("Command parser initialized successfully");
  })();
  
  // Double check that command parser was created
  if (!window.commandParser) {
    console.error("Failed to create command parser! Creating emergency fallback...");
    
    window.commandParser = {
      executeCommand: function(cmd) {
        console.log("Emergency fallback command execution:", cmd);
        return false;
      },
      generateRandomCommand: function() {
        return "add beer";
      }
    };
  }