// ui-handlers.js - UI related functions and event handlers

// Spooky messages for random appearance
const spookyMessages = [
  "The expired products are watching you...",
  "Something is crawling in aisle 7...",
  "Did that can just move on its own?",
  "The milk spoiled decades ago...",
  "The checkout attendant has been missing since 1983...",
  "Price check on a soul... price check...",
  "The meat doesn't come from animals...",
  "Listen closely to the scanner beeps... they're saying something...",
  "That's not ketchup on the floor...",
  "The store never closes. The store never opened.",
  "Every product has an expiration date. Even you.",
  "The cart wheels squeak in harmony with the screams.",
  "The store manager will see you... soon."
];

// DOM elements
const editor = document.getElementById("editor");
const outputEl = document.getElementById("output");
const runAllBtn = document.getElementById("run-all");
const runLineBtn = document.getElementById("run-line");
const stopBtn = document.getElementById("stop");
const randomizeBtn = document.getElementById("randomize");
const horrorElements = document.getElementById("horror-elements");

// Create noise overlay
function createNoiseOverlay() {
  const noiseOverlay = document.createElement("div");
  noiseOverlay.className = "noise";
  document.body.appendChild(noiseOverlay);
}

// Helper functions
function log(message) {
  const time = new Date().toLocaleTimeString();
  const formattedMessage = message.replace(/beer|salad|ham|milk|chips|pizza|oil|pinard|huitsix|rotting/gi, 
    match => `<span class="product">${match}</span>`);
  outputEl.innerHTML += `[${time}] ${formattedMessage}<br>`;
  outputEl.scrollTop = outputEl.scrollHeight;
}

function getCurrentLine() {
  const cursorPos = editor.selectionStart;
  const text = editor.value;
  const lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1;
  const lineEnd = text.indexOf('\n', cursorPos);
  return text.substring(lineStart, lineEnd > -1 ? lineEnd : text.length).trim();
}

// Add horror visual elements
function addHorrorElements() {
  // Clear previous elements
  horrorElements.innerHTML = '';
  
  // Add blood stains
  for (let i = 0; i < 5; i++) {
    const stain = document.createElement("div");
    stain.className = "bloodstain";
    stain.style.width = `${20 + Math.random() * 100}px`;
    stain.style.height = `${20 + Math.random() * 100}px`;
    stain.style.top = `${Math.random() * 100}%`;
    stain.style.left = `${Math.random() * 100}%`;
    horrorElements.appendChild(stain);
  }
  
  // Add mold spots
  for (let i = 0; i < 8; i++) {
    const mold = document.createElement("div");
    mold.className = "mold-spot";
    mold.style.width = `${10 + Math.random() * 40}px`;
    mold.style.height = `${10 + Math.random() * 40}px`;
    mold.style.top = `${Math.random() * 100}%`;
    mold.style.left = `${Math.random() * 100}%`;
    horrorElements.appendChild(mold);
  }
}

// Display random spooky message
function showRandomSpookyMessage() {
  if (Math.random() < 0.1) { // 10% chance when called
    const message = spookyMessages[Math.floor(Math.random() * spookyMessages.length)];
    const messageEl = document.createElement("div");
    messageEl.className = "spooky-message";
    messageEl.textContent = message;
    messageEl.style.top = `${50 + (Math.random() * 40 - 20)}%`;
    messageEl.style.left = `${50 + (Math.random() * 40 - 20)}%`;
    document.body.appendChild(messageEl);
    
    // Remove after animation completes
    setTimeout(() => {
      messageEl.remove();
    }, 5000);
  }
}

// Random command generator
function generateRandomCommand() {
  const commands = [];
  
  // Cart wheels
  commands.push("my cart has square wheels");
  commands.push("my cart has bad wheels");
  commands.push("my cart has 3 wheels");
  commands.push("my cart has no wheels");
  
  // Products
  const products = Object.keys(productTypes);
  
  // Modifiers
  const modifiers = [
    "", "fresh", "old", "strong old", "flavorless old", 
    "cheap", "expensive", "processed", "industrial", 
    "overpriced", "vomit", "artisanal"
  ];
  
  // Generate product commands
  products.forEach(product => {
    const randomModifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    if (randomModifier) {
      commands.push(`add ${randomModifier} ${product}`);
    } else {
      commands.push(`add ${product}`);
    }
  });
  
  // Generate product commands with special parameters
  products.forEach(product => {
    // Add commands with nutriscore
    const randNutriscore = String.fromCharCode(65 + Math.floor(Math.random() * 5)); // A to E
    commands.push(`add ${product} nutriscore ${randNutriscore}`);
    
    // Add commands with shelflife
    const shelfLifeOptions = ["today", "week", "month", "year", "decade", "forever"];
    const randShelfLife = shelfLifeOptions[Math.floor(Math.random() * shelfLifeOptions.length)];
    commands.push(`add ${product} shelflife ${randShelfLife}`);
    
    // Add commands with open modifier
    commands.push(`add ${product} open`);
    
    // Add some combined commands
    if (Math.random() > 0.7) {
      const randMod = modifiers[Math.floor(Math.random() * modifiers.length)];
      if (randMod) {
        commands.push(`add ${randMod} ${product} nutriscore ${randNutriscore} shelflife ${randShelfLife} open`);
      }
    }
  });
  
  // Add remove commands
  products.forEach(product => {
    commands.push(`remove ${product}`);
  });
  
  // Add mode commands
  commands.push("discount mode on");
  commands.push("inflation mode on");
  commands.push("apocalypse mode on");
  
  // Return a random command
  return commands[Math.floor(Math.random() * commands.length)];
}

// Command parser and executor
function executeCommand(cmd) {
  cmd = cmd.toLowerCase().trim();
  log(`> ${cmd}`);

  // Cart wheels commands (rhythm section)
  if (cmd.startsWith("my cart has")) {
    const wheelText = cmd.replace("my cart has", "").trim();
    // Extract the wheel type from the full text
    let wheelType;
    if (wheelText.includes("square wheels")) wheelType = "square";
    else if (wheelText.includes("bad wheels")) wheelType = "bad";
    else if (wheelText.includes("no wheels")) wheelType = "none";
    else if (wheelText.includes("3 wheels")) wheelType = "3";
    else wheelType = wheelText; // fallback
    
    setWheels(wheelType);
    return;
  }

  // Product commands with nutriscore, shelflife, and open support
  if (cmd.startsWith("add")) {
    const addParts = cmd.replace("add", "").trim();
    
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
      cutoffPos = nutriscorePos;
    }
    
    if (shelfLifePos !== -1 && shelfLifePos < cutoffPos) {
      cutoffPos = shelfLifePos;
    }
    
    if (openProductPos !== -1 && openProductPos < cutoffPos) {
      cutoffPos = openProductPos;
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
      
      if (productTypes[productName]) {
        addProduct(productName, modifier);
      } else {
        log(`Unknown product: ${productName}. This market has been abandoned for decades.`);
      }
    } else {
      log("Invalid command format. Try 'add [product]'.");
    }
    return;
  }

  if (cmd.startsWith("remove")) {
    const productName = cmd.replace("remove", "").trim();
    removeProduct(productName);
    return;
  }

  // Mode commands
  if (cmd === "discount mode on") {
    toggleDiscountMode(true);
    showRandomSpookyMessage();
    return;
  }

  if (cmd === "discount mode off") {
    toggleDiscountMode(false);
    return;
  }

  if (cmd === "inflation mode on") {
    toggleInflationMode(true);
    showRandomSpookyMessage();
    return;
  }

  if (cmd === "inflation mode off") {
    toggleInflationMode(false);
    return;
  }
  
  if (cmd === "apocalypse mode on") {
    toggleApocalypseMode(true);
    return;
  }
  
  if (cmd === "apocalypse mode off") {
    toggleApocalypseMode(false);
    return;
  }

  log("Unknown command - the register won't accept that.");
}

// Execute current line with audio initialization
async function executeCurrentLine() {
  await startAudio();
  
  // Start transport if not started
  if (Tone.Transport.state !== "started") {
    Tone.Transport.start();
  }
  
  const line = getCurrentLine();
  if (line && !line.trim().startsWith("//")) {
    executeCommand(line);
  }
}

// Execute all lines with audio initialization
async function executeAllLines() {
  await startAudio();
  
  // Start transport if not started
  if (Tone.Transport.state !== "started") {
    Tone.Transport.start();
  }
  
  const lines = editor.value.split("\n");
  lines.forEach(line => {
    if (line.trim() && !line.trim().startsWith("//")) {
      executeCommand(line);
    }
  });
}

// Keyboard shortcut handler
function handleKeyboardShortcuts(e) {
  // Check for Ctrl+Enter to execute current line
  if (e.ctrlKey && e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    executeCurrentLine();
  }
  
  // Check for Ctrl+Shift+Enter to execute all lines
  if (e.ctrlKey && e.key === 'Enter' && e.shiftKey) {
    e.preventDefault();
    executeAllLines();
  }
}

// Event listeners
function setupEventListeners() {
  // Button event listeners
  runAllBtn.addEventListener("click", executeAllLines);
  runLineBtn.addEventListener("click", executeCurrentLine);

  stopBtn.addEventListener("click", () => {
    // Stop all loops and synths
    Object.keys(state.products).forEach(id => {
      if (state.products[id].apocalypseInterval) {
        clearInterval(state.products[id].apocalypseInterval);
      }
      removeProduct(state.products[id].name);
    });
    
    if (drumSequencer) {
      drumSequencer.dispose();
      drumSequencer = null;
    }
    
    if (apocalypseInterval) {
      clearInterval(apocalypseInterval);
      apocalypseInterval = null;
    }
    
    // Reset all modes
    state.modes.discount = false;
    state.modes.inflation = false;
    state.modes.apocalypse = false;
    
    document.body.classList.remove('discount-mode', 'inflation-mode', 'apocalypse-mode', 
                                   'discount-active', 'inflation-active');
    
    // Stop transport
    Tone.Transport.stop();
    state.cart.wheels = "none";
    
    // Reset BPM
    Tone.Transport.bpm.value = 120;
    
    // Clean up any remaining effects on master output
    Tone.Destination.disconnect();
    Tone.Destination.volume.value = 0;
    
    log("Everything stopped. The supermarket is silent again... for now.");
  });
  
  randomizeBtn.addEventListener("click", async () => {
    const randomCommand = generateRandomCommand();
    
    // Insert the command at the current cursor position
    const cursorPos = editor.selectionStart;
    const text = editor.value;
    const newText = text.substring(0, cursorPos) + randomCommand + text.substring(cursorPos);
    editor.value = newText;
    
    // Execute it
    await startAudio();
    
    if (Tone.Transport.state !== "started") {
      Tone.Transport.start();
    }
    
    executeCommand(randomCommand);
  });
  
  // Add keyboard shortcut listener
  editor.addEventListener("keydown", handleKeyboardShortcuts);
  
  // Show keyboard shortcuts in the UI
  const shortcutInfo = document.createElement("div");
  shortcutInfo.className = "shortcut-info";
  shortcutInfo.innerHTML = `
    <div class="shortcut-tooltip">
      <span>⌨️ Shortcuts:</span>
      <span>Ctrl+Enter = Execute current line</span>
      <span>Ctrl+Shift+Enter = Execute all</span>
    </div>
  `;
  document.body.appendChild(shortcutInfo);
}

// Initialize UI components
function initializeUI() {
  createNoiseOverlay();
  addHorrorElements();
  setupEventListeners();
  log("Welcome to the Abandoned Supermarket of Horrors!");
  log("The products await your commands... they're getting hungry...");
  log("💀 TIP: Use Ctrl+Enter to execute current line, Ctrl+Shift+Enter to execute all");
  
  // Occasionally show spooky messages
  setInterval(showRandomSpookyMessage, 15000);
}

// Expose functions to global scope for other modules to use
window.log = log;
window.getCurrentLine = getCurrentLine;
window.showRandomSpookyMessage = showRandomSpookyMessage;
window.executeCommand = executeCommand;
window.initializeUI = initializeUI;