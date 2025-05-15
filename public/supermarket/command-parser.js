// command-parser.js - Parses and executes text commands

// Immediately initialize the command parser - this will be available globally
(function() {
    console.log("Initializing command parser...");
    
    // Main command parser module functionality
    window.commandParser = {
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
        
        // Unknown command
        if (window.log) {
          window.log("Unknown command - the register won't accept that.");
        } else {
          console.log("Unknown command");
        }
        return false;
      },
      
      // Handle cart wheels command
      handleCartWheelsCommand: function(cmd) {
        const wheelText = cmd.replace("my cart has", "").trim();
        
        // Extract the wheel type from the text
        let wheelType;
        
        // Check for specific wheel types in any order
        if (wheelText.includes("square")) wheelType = "square";
        else if (wheelText.includes("broken")) wheelType = "broken";
        else if (wheelText.includes("premium")) wheelType = "premium";
        else if (wheelText.includes("defective")) wheelType = "defective";
        else if (wheelText.includes("bargain")) wheelType = "bargain";
        else if (wheelText.includes("luxury")) wheelType = "luxury";
        else if (wheelText.includes("no wheels")) wheelType = "none";
        else wheelType = wheelText; // fallback
        
        // Set cart wheels if the function exists
        if (window.cartWheels && window.cartWheels.setWheels) {
          window.cartWheels.setWheels(wheelType);
        } else {
          console.log("Cart wheels handler not loaded");
          if (window.log) window.log("Cart wheels system not available yet.");
        }
        return true;
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
      
      // Generate a random command
      generateRandomCommand: function() {
        // List of possible command categories
        const commandCategories = [
          'cart_wheels',
          'add_product',
          'remove_product',
          'toggle_mode'
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
          default:
            return "add beer"; // Fallback
        }
      },
      
      // Generate random cart wheels command
      generateRandomCartWheelsCommand: function() {
        const wheelTypes = ["square", "broken", "premium", "defective", "bargain", "luxury"];
        const randomType = wheelTypes[Math.floor(Math.random() * wheelTypes.length)];
        return `my cart has ${randomType} wheels`;
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
          "luxury", "artificial", "mass-produced", "addictive"
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