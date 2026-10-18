// store-layout.js - Store Layout Visualizer with Map-Based Composing

window.storeLayout = {
  // Grid configuration
  grid: {
    width: 12,
    height: 8,
    cellSize: 50,
    margin: 10
  },
  
  // Layout data
  layout: [],
  customers: [],
  shelves: [],
  
  // Map composing mode
  mapComposing: {
    enabled: false,
    sequence: [],
    currentStep: 0,
    interval: null
  },
  
  // Storage key for persistence
  storageKey: 'supermarket_store_layout',

  // UI elements
  container: null,
  canvas: null,
  ctx: null,
  
  // Drag state
  dragState: {
    isDragging: false,
    draggedProduct: null,
    offsetX: 0,
    offsetY: 0
  },
  
  // Initialize the store layout visualizer
  init: function() {
    console.log("Initializing store layout...");
    
    // Check if already initialized
    if (this.container) {
      console.log("Store layout already initialized");
      return;
    }
    
    // Create container
    this.container = document.createElement('div');
    this.container.id = 'store-layout-container';
    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.95);
      border: 2px solid #00ff00;
      border-radius: 10px;
      padding: 20px;
      z-index: 1000;
      display: none;
      box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
      max-height: 90vh;
      overflow-y: auto;
    `;
    
    // Create header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      color: #00ff00;
      font-family: monospace;
    `;
    header.innerHTML = `
      <h2 style="margin: 0;">🏪 STORE LAYOUT VISUALIZER</h2>
      <div style="display: flex; gap: 10px;">
        <button id="toggle-map-compose" style="
          background: #00ff00;
          color: black;
          border: none;
          padding: 5px 15px;
          cursor: pointer;
          border-radius: 5px;
          font-family: monospace;
          font-weight: bold;
        ">🎵 MAP COMPOSE: OFF</button>
        <button id="close-layout" style="
          background: #ff0000;
          color: white;
          border: none;
          padding: 5px 15px;
          cursor: pointer;
          border-radius: 5px;
          font-family: monospace;
        ">✕ CLOSE</button>
      </div>
    `;
    
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.grid.width * this.grid.cellSize + this.grid.margin * 2;
    this.canvas.height = this.grid.height * this.grid.cellSize + this.grid.margin * 2;
    this.canvas.style.cssText = `
      border: 1px solid #333;
      cursor: grab;
      background: #111;
    `;
    
    this.ctx = this.canvas.getContext('2d');
    
    // Create info panel
    const infoPanel = document.createElement('div');
    infoPanel.id = 'layout-info';
    infoPanel.style.cssText = `
      margin-top: 20px;
      padding: 15px;
      background: rgba(0, 255, 0, 0.1);
      border: 1px solid #00ff00;
      border-radius: 5px;
      color: #00ff00;
      font-family: monospace;
      font-size: 14px;
    `;
    infoPanel.innerHTML = `
      <div id="sequence-display" style="margin-bottom: 10px;">
        <strong>SEQUENCE:</strong> <span id="sequence-text">-</span>
      </div>
      <div id="compose-status" style="margin-bottom: 10px;">
        <strong>STATUS:</strong> <span id="status-text">Map compose mode disabled</span>
      </div>
      <div id="timing-info" style="font-size: 11px; color: #888;">
        <strong>TIP:</strong> Distance between products determines timing. Spread them out for slower sequences!
      </div>
    `;
    
    // Create legend
    const legend = document.createElement('div');
    legend.style.cssText = `
      margin-top: 20px;
      color: #00ff00;
      font-family: monospace;
      font-size: 12px;
    `;
    legend.innerHTML = `
      <div style="margin-bottom: 10px;">LEGEND:</div>
      <div style="display: flex; gap: 20px; flex-wrap: wrap;">
        <span>🛒 = Active Product</span>
        <span>📦 = Empty Shelf</span>
        <span>🚶 = Customer</span>
        <span>🚪 = Entrance</span>
        <span>💰 = Exit/Checkout</span>
        <span>✨ = Next in sequence</span>
      </div>
      <div style="margin-top: 10px; color: #888;">
        MAP COMPOSE MODE: Customers follow shortest path to exit, triggering products in order.
        Drag products to create your sequence!
      </div>
    `;
    
    // Assemble container
    this.container.appendChild(header);
    this.container.appendChild(this.canvas);
    this.container.appendChild(infoPanel);
    this.container.appendChild(legend);
    document.body.appendChild(this.container);
    
    // Initialize layout
    this.initializeLayout();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Start animation loop
    this.animate();

    // Save layout before page unload
    window.addEventListener('beforeunload', () => {
      this.saveLayout();
    });

    // Mark as initialized
    console.log("Store layout initialized successfully");
    this.initialized = true;
  },
  
  // Initialize the store layout grid
  initializeLayout: function() {
    // Create empty grid
    this.layout = [];
    for (let y = 0; y < this.grid.height; y++) {
      this.layout[y] = [];
      for (let x = 0; x < this.grid.width; x++) {
        this.layout[y][x] = null;
      }
    }
    
    // Add entrance (top-left)
    this.layout[0][0] = { type: 'entrance', symbol: '🚪' };
    
    // Add exit/checkout (bottom-right)
    this.layout[this.grid.height - 1][this.grid.width - 1] = { type: 'checkout', symbol: '💰' };
    
    // Create shelf layout (aisles)
    for (let y = 2; y < this.grid.height - 2; y++) {
      for (let x = 2; x < this.grid.width - 2; x += 3) {
        // Create vertical aisles with shelves
        if (x < this.grid.width - 2) {
          this.layout[y][x] = { type: 'shelf', symbol: '📦' };
          this.layout[y][x + 1] = { type: 'shelf', symbol: '📦' };
        }
      }
    }
    
    // Place active products on shelves
    this.updateProductPlacements();
  },
  
  // Update product placements based on active products
  updateProductPlacements: function() {
    if (!window.state || !window.state.products) return;

    const products = Object.values(window.state.products);

    // Load saved positions from localStorage
    const savedPositions = this.loadLayout();

    // Find all shelf positions (for products without saved positions)
    const shelfPositions = [];
    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        if (this.layout[y][x] && this.layout[y][x].type === 'shelf') {
          shelfPositions.push({ x, y });
        }
      }
    }

    // Clear existing products from layout
    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        if (this.layout[y][x] && this.layout[y][x].type === 'product') {
          // Keep the shelf underneath
          this.layout[y][x] = { type: 'shelf', symbol: '📦' };
        }
      }
    }

    // Track which shelf positions are occupied
    const occupiedPositions = new Set();

    // First pass: place products with saved positions
    products.forEach(product => {
      const saved = savedPositions[product.id];
      if (saved && this.layout[saved.y] && this.layout[saved.y][saved.x]) {
        const cell = this.layout[saved.y][saved.x];
        if (cell.type === 'shelf') {
          this.layout[saved.y][saved.x] = {
            type: 'product',
            symbol: '🛒',
            name: product.name,
            id: product.id,
            color: product.color,
            visited: false
          };
          occupiedPositions.add(`${saved.x},${saved.y}`);
        }
      }
    });

    // Second pass: place products without saved positions on available shelves
    let shelfIndex = 0;
    products.forEach(product => {
      const saved = savedPositions[product.id];
      const alreadyPlaced = saved && occupiedPositions.has(`${saved.x},${saved.y}`);

      if (!alreadyPlaced) {
        // Find next available shelf
        while (shelfIndex < shelfPositions.length) {
          const pos = shelfPositions[shelfIndex];
          const posKey = `${pos.x},${pos.y}`;
          if (!occupiedPositions.has(posKey) && this.layout[pos.y][pos.x].type === 'shelf') {
            this.layout[pos.y][pos.x] = {
              type: 'product',
              symbol: '🛒',
              name: product.name,
              id: product.id,
              color: product.color,
              visited: false
            };
            occupiedPositions.add(posKey);
            shelfIndex++;
            break;
          }
          shelfIndex++;
        }
      }
    });
    
    // Update sequence for map composing
    if (this.mapComposing.enabled) {
      this.updateComposingSequence();
    }
  },
  
  // Setup event listeners
  setupEventListeners: function() {
    // Close button
    document.getElementById('close-layout').addEventListener('click', () => {
      this.hide();
    });
    
    // Toggle map compose mode
    document.getElementById('toggle-map-compose').addEventListener('click', () => {
      this.toggleMapCompose();
    });
    
    // Canvas mouse events
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    
    // Prevent context menu
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  },
  
  // Toggle map compose mode
  toggleMapCompose: function() {
    this.mapComposing.enabled = !this.mapComposing.enabled;

    const button = document.getElementById('toggle-map-compose');
    const statusText = document.getElementById('status-text');

    if (this.mapComposing.enabled) {
      button.textContent = '🎵 MAP COMPOSE: ON';
      button.style.background = '#ff00ff';
      statusText.textContent = 'Map compose mode ACTIVE - Customer path creates sequence';

      // Start composing
      this.startMapComposing();
      window.log('🗺️ Map Compose Mode ACTIVATED! Customer journey creates the music...');
    } else {
      button.textContent = '🎵 MAP COMPOSE: OFF';
      button.style.background = '#00ff00';
      statusText.textContent = 'Map compose mode disabled';

      // Stop composing
      this.stopMapComposing();
      window.log('🗺️ Map Compose Mode deactivated');
    }

    // Check story mode goals after toggling map compose
    if (window.storyMode && window.storyMode.storyActive) {
      setTimeout(() => {
        window.storyMode.checkGoal();
      }, 100);
    }
  },
  
  // Start map composing
  startMapComposing: function() {
    // Clear existing customers
    this.customers = [];
    
    // Disable all existing product loops
    this.disableAllProductLoops();
    
    // Update sequence based on optimal path
    this.updateComposingSequence();
    
    console.log("Map compose sequence:", this.mapComposing.sequence.map(p => p.name));
    
    // Spawn a customer to follow the path
    this.spawnComposingCustomer();
    
    // Start the sequencer
    if (this.mapComposing.sequence.length > 0) {
      this.mapComposing.currentStep = 0;
      
      // Ensure Transport is running
      if (Tone.Transport.state !== "started") {
        Tone.Transport.start();
      }
      
      // Set interval based on BPM - update dynamically
      this.updateSequencerTiming();
    }
  },
  
  // Disable all product loops when in map compose mode
  disableAllProductLoops: function() {
    if (window.state && window.state.products) {
      console.log("Disabling all product loops for map compose");
      Object.values(window.state.products).forEach(product => {
        if (product.loop) {
          product.loop.stop();
          // Don't dispose - we still need the loop structure
        }
      });
    }
  },
  
  // Re-enable all product loops
  enableAllProductLoops: function() {
    if (window.state && window.state.products) {
      Object.values(window.state.products).forEach(product => {
        if (product.loop) {
          product.loop.start();
        }
      });
    }
  },
  
  // Convert grid distance to musical time in bars (quantized steps)
  distanceToMusicalTime: function(distance) {
    // Map Euclidean distance to beat subdivisions (returned as bars)
    // Close products = faster rhythm, far products = longer pause
    if (distance <= 2) return { notation: "8n", bars: 0.125 };   // Half beat
    if (distance <= 4) return { notation: "4n", bars: 0.25 };    // 1 beat
    if (distance <= 7) return { notation: "2n", bars: 0.5 };     // 2 beats
    return { notation: "1m", bars: 1 };                          // Full bar
  },

  // Update sequencer timing based on distances
  updateSequencerTiming: function() {
    if (this.mapComposing.interval) {
      clearInterval(this.mapComposing.interval);
    }
    
    // Stop existing loop
    if (this.mapComposing.loop) {
      this.mapComposing.loop.stop();
      this.mapComposing.loop.dispose();
      this.mapComposing.loop = null;
    }
    
    // Clear any scheduled events
    if (this.mapComposing.eventIds) {
      this.mapComposing.eventIds.forEach(id => {
        if (id) Tone.Transport.clear(id);
      });
      this.mapComposing.eventIds = [];
    }
    
    // Use distance-based timing
    if (this.mapComposing.sequence.length > 0) {
      console.log("Creating distance-based map compose sequence with", this.mapComposing.sequence.length, "products");
      
      // Calculate distances between products
      const distances = [];
      let totalDistance = 0;
      
      // Start from entrance (0,0)
      let prevX = 0, prevY = 0;
      
      for (let i = 0; i < this.mapComposing.sequence.length; i++) {
        const product = this.mapComposing.sequence[i];
        const distance = Math.sqrt(
          Math.pow(product.x - prevX, 2) + 
          Math.pow(product.y - prevY, 2)
        );
        distances.push(distance);
        totalDistance += distance;
        prevX = product.x;
        prevY = product.y;
      }
      
      // Add distance from last product back to entrance for loop
      const loopDistance = Math.sqrt(
        Math.pow(0 - prevX, 2) + 
        Math.pow(0 - prevY, 2)
      );
      distances.push(loopDistance);
      totalDistance += loopDistance;
      
      console.log("Distances:", distances);
      console.log("Total distance:", totalDistance);
      
      // Convert distances to quantized musical time intervals
      // Create a Part with events at specific times
      let currentTime = 0;
      const events = [];

      for (let i = 0; i < this.mapComposing.sequence.length; i++) {
        const product = this.mapComposing.sequence[i];
        const distance = distances[i];
        const timing = this.distanceToMusicalTime(distance);

        // Convert bars to bars:beats:sixteenths format for Tone.js
        const bars = Math.floor(currentTime);
        const beats = Math.floor((currentTime - bars) * 4);
        const sixteenths = Math.floor(((currentTime - bars) * 4 - beats) * 4);
        const timeStr = `${bars}:${beats}:${sixteenths}`;

        events.push({
          time: timeStr,
          product: product,
          index: i,
          distance: distance,
          musicalTime: timing.notation
        });

        // Add time in bars
        currentTime += timing.bars;
      }

      // Store total loop time (include return trip to entrance)
      const returnDistance = distances[distances.length - 1];
      const returnTiming = this.distanceToMusicalTime(returnDistance);
      const totalBars = currentTime + returnTiming.bars;
      this.mapComposing.loopDuration = totalBars;
      
      // Create a Part that plays the events
      this.mapComposing.loop = new Tone.Part((time, event) => {
        const realProduct = window.state.products[event.product.id];
        
        if (realProduct && realProduct.synth && realProduct.note) {
          // Trigger the note
          if (Array.isArray(realProduct.note)) {
            realProduct.note.forEach(n => {
              realProduct.synth.triggerAttackRelease(n, '8n', time);
            });
          } else {
            realProduct.synth.triggerAttackRelease(realProduct.note, '8n', time);
          }
          
          // Visual feedback
          Tone.Draw.schedule(() => {
            event.product.visited = true;
            setTimeout(() => {
              event.product.visited = false;
            }, 500);

            // Update current step
            this.mapComposing.currentStep = event.index;

            // Sync customer position to current product
            if (this.customers[0]) {
              this.customers[0].targetX = event.product.x;
              this.customers[0].targetY = event.product.y;
              this.customers[0].targetIndex = event.index;
            }

            // Log with musical timing info
            window.log(`🎵 Playing ${realProduct.name} (${event.index + 1}/${this.mapComposing.sequence.length}) [${event.musicalTime}]`);
          }, time);
        }
      }, events);
      
      // Set loop and start - convert bars to bars:beats:sixteenths
      const loopBars = Math.floor(this.mapComposing.loopDuration);
      const loopBeats = Math.floor((this.mapComposing.loopDuration - loopBars) * 4);
      const loopSixteenths = Math.floor(((this.mapComposing.loopDuration - loopBars) * 4 - loopBeats) * 4);

      this.mapComposing.loop.loop = true;
      this.mapComposing.loop.loopEnd = `${loopBars}:${loopBeats}:${loopSixteenths}`;
      this.mapComposing.loop.start(0);
      
      console.log(`Map compose loop started - total duration: ${this.mapComposing.loopDuration.toFixed(2)} bars`);
      
      // Update info display
      const statusText = document.getElementById('status-text');
      if (statusText) {
        statusText.textContent = `Map compose ACTIVE - ${this.mapComposing.sequence.length} products, loop: ${this.mapComposing.loopDuration.toFixed(1)} bars`;
      }
      
      // Ensure Transport is started
      if (Tone.Transport.state !== "started") {
        Tone.Transport.position = 0; // Reset position
        Tone.Transport.start();
        console.log("Started Transport for map compose");
      } else {
        console.log("Transport already running, state:", Tone.Transport.state);
      }
      
      console.log(`Map compose sequence created: ${events.length} events over ${currentTime.toFixed(2)} bars`);
      console.log("Transport BPM:", Tone.Transport.bpm.value);
      console.log("Transport position:", Tone.Transport.position);
    }
  },
  
  // Stop map composing
  stopMapComposing: function() {
    if (this.mapComposing.interval) {
      clearInterval(this.mapComposing.interval);
      this.mapComposing.interval = null;
    }
    
    // Stop Tone.js loop
    if (this.mapComposing.loop) {
      this.mapComposing.loop.stop();
      this.mapComposing.loop.dispose();
      this.mapComposing.loop = null;
    }
    
    // Cancel only our scheduled events
    if (this.mapComposing.eventIds) {
      this.mapComposing.eventIds.forEach(id => {
        if (id) Tone.Transport.clear(id);
      });
      this.mapComposing.eventIds = [];
    }
    
    if (this.mapComposing.loopEventId) {
      Tone.Transport.clear(this.mapComposing.loopEventId);
      this.mapComposing.loopEventId = null;
    }
    
    // Clear sequence
    this.mapComposing.sequence = [];
    this.mapComposing.currentStep = 0;
    this.mapComposing.loopDuration = 0;
    
    // Re-enable all product loops
    this.enableAllProductLoops();
    
    // Reset product visited states
    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        if (this.layout[y][x] && this.layout[y][x].type === 'product') {
          this.layout[y][x].visited = false;
        }
      }
    }
  },
  
  // Update composing sequence based on shortest path
  updateComposingSequence: function() {
    // Find all products
    const products = [];
    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        if (this.layout[y][x] && this.layout[y][x].type === 'product') {
          products.push({ x, y, ...this.layout[y][x] });
        }
      }
    }
    
    if (products.length === 0) {
      this.mapComposing.sequence = [];
      return;
    }
    
    // Calculate shortest path from entrance through all products to exit
    const entrance = { x: 0, y: 0 };
    const exit = { x: this.grid.width - 1, y: this.grid.height - 1 };
    
    // Create a path that creates musical patterns
    const sequence = [];
    let current = entrance;
    const unvisited = [...products];
    
    // Group products by type for musical variety
    const productGroups = {};
    for (const product of products) {
      if (!productGroups[product.name]) {
        productGroups[product.name] = [];
      }
      productGroups[product.name].push(product);
    }
    
    // Build sequence with musical variety
    while (unvisited.length > 0) {
      let nextProduct = null;
      
      // Try to alternate between different product types
      if (sequence.length > 0) {
        const lastType = sequence[sequence.length - 1].name;
        
        // Find a different product type that's reasonably close
        let candidates = unvisited.filter(p => p.name !== lastType);
        if (candidates.length === 0) candidates = unvisited;
        
        // Choose the closest from candidates
        let minDist = Infinity;
        for (const product of candidates) {
          const dist = Math.abs(product.x - current.x) + Math.abs(product.y - current.y);
          if (dist < minDist) {
            minDist = dist;
            nextProduct = product;
          }
        }
      } else {
        // First product - choose closest
        let minDist = Infinity;
        for (const product of unvisited) {
          const dist = Math.abs(product.x - current.x) + Math.abs(product.y - current.y);
          if (dist < minDist) {
            minDist = dist;
            nextProduct = product;
          }
        }
      }
      
      if (nextProduct) {
        sequence.push(nextProduct);
        current = nextProduct;
        unvisited.splice(unvisited.indexOf(nextProduct), 1);
      }
    }
    
    this.mapComposing.sequence = sequence;
    
    // Update sequence display with timing info
    const sequenceText = document.getElementById('sequence-text');
    if (sequenceText) {
      if (sequence.length > 0) {
        // Calculate distances for display
        let prevX = 0, prevY = 0;
        const sequenceDisplay = sequence.map((p, i) => {
          const dist = Math.sqrt(
            Math.pow(p.x - prevX, 2) + 
            Math.pow(p.y - prevY, 2)
          );
          prevX = p.x;
          prevY = p.y;
          return `${p.name}(${dist.toFixed(1)})`;
        }).join(' → ');
        sequenceText.textContent = sequenceDisplay;
      } else {
        sequenceText.textContent = '-';
      }
    }
  },
  
  // This function is no longer needed as we use Tone.js Sequence
  
  // Spawn a customer for composing mode
  spawnComposingCustomer: function() {
    if (this.mapComposing.sequence.length === 0) return;
    
    const customer = {
      x: 0,
      y: 0,
      targetIndex: 0,
      path: [{ x: 0, y: 0 }],
      color: '#ff00ff',
      speed: 0.1
    };
    
    this.customers = [customer];
    this.updateComposingCustomerTarget(customer);
  },
  
  // Update composing customer target
  updateComposingCustomerTarget: function(customer) {
    if (customer.targetIndex < this.mapComposing.sequence.length) {
      const target = this.mapComposing.sequence[customer.targetIndex];
      customer.targetX = target.x;
      customer.targetY = target.y;
    } else {
      // Go to exit
      customer.targetX = this.grid.width - 1;
      customer.targetY = this.grid.height - 1;
    }
  },
  
  // Handle mouse down
  handleMouseDown: function(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const gridX = Math.floor((x - this.grid.margin) / this.grid.cellSize);
    const gridY = Math.floor((y - this.grid.margin) / this.grid.cellSize);
    
    if (gridX >= 0 && gridX < this.grid.width && gridY >= 0 && gridY < this.grid.height) {
      const cell = this.layout[gridY][gridX];
      if (cell && cell.type === 'product') {
        this.dragState.isDragging = true;
        this.dragState.draggedProduct = cell;
        this.dragState.offsetX = x - (gridX * this.grid.cellSize + this.grid.margin);
        this.dragState.offsetY = y - (gridY * this.grid.cellSize + this.grid.margin);
        this.canvas.style.cursor = 'grabbing';
        
        // Replace with shelf
        this.layout[gridY][gridX] = { type: 'shelf', symbol: '📦' };
      }
    }
  },
  
  // Handle mouse move
  handleMouseMove: function(e) {
    if (!this.dragState.isDragging) return;
    
    const rect = this.canvas.getBoundingClientRect();
    this.dragState.mouseX = e.clientX - rect.left;
    this.dragState.mouseY = e.clientY - rect.top;
  },
  
  // Handle mouse up
  handleMouseUp: function(e) {
    if (!this.dragState.isDragging) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const gridX = Math.floor((x - this.grid.margin) / this.grid.cellSize);
    const gridY = Math.floor((y - this.grid.margin) / this.grid.cellSize);
    
    // Place product if valid shelf spot
    if (gridX >= 0 && gridX < this.grid.width && gridY >= 0 && gridY < this.grid.height) {
      const cell = this.layout[gridY][gridX];
      if (cell && cell.type === 'shelf') {
        this.layout[gridY][gridX] = this.dragState.draggedProduct;
        window.log(`📍 Moved ${this.dragState.draggedProduct.name} to shelf ${gridY + 1}-${gridX + 1}`);

        // Update sequence if in compose mode
        if (this.mapComposing.enabled) {
          this.updateComposingSequence();
        }

        // Save layout after drag
        this.saveLayout();
      } else {
        // Find nearest shelf
        this.placeProductOnNearestShelf(this.dragState.draggedProduct, gridX, gridY);
      }
    }
    
    this.dragState.isDragging = false;
    this.dragState.draggedProduct = null;
    this.canvas.style.cursor = 'grab';
  },
  
  // Handle click
  handleClick: function(e) {
    if (this.dragState.isDragging) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const gridX = Math.floor((x - this.grid.margin) / this.grid.cellSize);
    const gridY = Math.floor((y - this.grid.margin) / this.grid.cellSize);
    
    if (gridX >= 0 && gridX < this.grid.width && gridY >= 0 && gridY < this.grid.height) {
      const cell = this.layout[gridY][gridX];
      
      // Click on product to hear it
      if (cell && cell.type === 'product') {
        const product = window.state.products[cell.id];
        if (product && product.synth && product.note) {
          if (Array.isArray(product.note)) {
            product.synth.triggerAttackRelease(product.note, '8n');
          } else {
            product.synth.triggerAttackRelease(product.note, '8n');
          }
          window.log(`🔊 Previewing ${cell.name}`);
        }
      }
    }
  },
  
  // Place product on nearest shelf
  placeProductOnNearestShelf: function(product, targetX, targetY) {
    let nearest = null;
    let minDist = Infinity;
    
    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        if (this.layout[y][x] && this.layout[y][x].type === 'shelf') {
          const dist = Math.abs(x - targetX) + Math.abs(y - targetY);
          if (dist < minDist) {
            minDist = dist;
            nearest = { x, y };
          }
        }
      }
    }
    
    if (nearest) {
      this.layout[nearest.y][nearest.x] = product;
      if (this.mapComposing.enabled) {
        this.updateComposingSequence();
      }
      // Save layout after placement
      this.saveLayout();
    }
  },
  
  // Draw the store layout
  draw: function() {
    // Clear canvas
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid
    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        const cellX = x * this.grid.cellSize + this.grid.margin;
        const cellY = y * this.grid.cellSize + this.grid.margin;
        
        // Draw cell border
        this.ctx.strokeStyle = '#333';
        this.ctx.strokeRect(cellX, cellY, this.grid.cellSize, this.grid.cellSize);
        
        // Draw cell content
        const cell = this.layout[y][x];
        if (cell) {
          // Highlight next in sequence
          if (this.mapComposing.enabled && this.mapComposing.sequence.length > 0) {
            const nextProduct = this.mapComposing.sequence[this.mapComposing.currentStep];
            if (cell.type === 'product' && cell.id === nextProduct.id) {
              // Glowing effect for next product
              this.ctx.fillStyle = '#ff00ff33';
              this.ctx.fillRect(cellX, cellY, this.grid.cellSize, this.grid.cellSize);
              
              // Sparkle effect
              this.ctx.font = '16px Arial';
              this.ctx.textAlign = 'center';
              this.ctx.textBaseline = 'middle';
              this.ctx.fillStyle = '#fff';
              this.ctx.fillText('✨', cellX + this.grid.cellSize / 2, cellY + 10);
            }
          }
          
          if (cell.type === 'product') {
            // Draw product glow
            this.ctx.fillStyle = cell.visited ? '#00ff0033' : cell.color + '33';
            this.ctx.fillRect(cellX, cellY, this.grid.cellSize, this.grid.cellSize);
          }
          
          // Draw symbol
          this.ctx.font = '24px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillStyle = cell.visited ? '#00ff00' : '#fff';
          this.ctx.fillText(
            cell.symbol,
            cellX + this.grid.cellSize / 2,
            cellY + this.grid.cellSize / 2
          );
          
          // Draw product name
          if (cell.type === 'product') {
            this.ctx.font = '10px monospace';
            this.ctx.fillStyle = cell.color;
            this.ctx.fillText(
              cell.name,
              cellX + this.grid.cellSize / 2,
              cellY + this.grid.cellSize - 5
            );
          }
        }
      }
    }
    
    // Draw path lines in compose mode with distance visualization
    if (this.mapComposing.enabled && this.mapComposing.sequence.length > 0) {
      // Calculate distances for line thickness
      let prevX = 0, prevY = 0;
      
      for (let i = 0; i < this.mapComposing.sequence.length; i++) {
        const product = this.mapComposing.sequence[i];
        
        // Calculate distance
        const distance = Math.sqrt(
          Math.pow(product.x - prevX, 2) + 
          Math.pow(product.y - prevY, 2)
        );
        
        // Map distance to line properties
        const opacity = Math.max(0.2, Math.min(0.8, distance / 10));
        const thickness = Math.max(1, Math.min(4, distance / 2));
        
        // Draw line segment
        this.ctx.strokeStyle = `rgba(255, 0, 255, ${opacity})`;
        this.ctx.lineWidth = thickness;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        
        this.ctx.moveTo(
          prevX * this.grid.cellSize + this.grid.margin + this.grid.cellSize / 2,
          prevY * this.grid.cellSize + this.grid.margin + this.grid.cellSize / 2
        );
        
        this.ctx.lineTo(
          product.x * this.grid.cellSize + this.grid.margin + this.grid.cellSize / 2,
          product.y * this.grid.cellSize + this.grid.margin + this.grid.cellSize / 2
        );
        
        this.ctx.stroke();
        
        // Draw distance label at midpoint
        if (distance > 1) {
          const midX = (prevX + product.x) / 2 * this.grid.cellSize + this.grid.margin + this.grid.cellSize / 2;
          const midY = (prevY + product.y) / 2 * this.grid.cellSize + this.grid.margin + this.grid.cellSize / 2;
          
          this.ctx.fillStyle = '#ff00ff';
          this.ctx.font = '10px monospace';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(distance.toFixed(1), midX, midY - 10);
        }
        
        prevX = product.x;
        prevY = product.y;
      }
      
      // Draw final line to exit
      const exitDistance = Math.sqrt(
        Math.pow((this.grid.width - 1) - prevX, 2) + 
        Math.pow((this.grid.height - 1) - prevY, 2)
      );
      
      this.ctx.strokeStyle = `rgba(255, 0, 255, ${Math.max(0.2, Math.min(0.8, exitDistance / 10))})`;
      this.ctx.lineWidth = Math.max(1, Math.min(4, exitDistance / 2));
      this.ctx.beginPath();
      
      this.ctx.moveTo(
        prevX * this.grid.cellSize + this.grid.margin + this.grid.cellSize / 2,
        prevY * this.grid.cellSize + this.grid.margin + this.grid.cellSize / 2
      );
      
      this.ctx.lineTo(
        (this.grid.width - 1) * this.grid.cellSize + this.grid.margin + this.grid.cellSize / 2,
        (this.grid.height - 1) * this.grid.cellSize + this.grid.margin + this.grid.cellSize / 2
      );
      
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }
    
    // Draw customers
    for (const customer of this.customers) {
      this.drawCustomer(customer);
    }
    
    // Draw dragged product
    if (this.dragState.isDragging && this.dragState.mouseX !== undefined) {
      this.ctx.globalAlpha = 0.8;
      this.ctx.font = '24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText(
        this.dragState.draggedProduct.symbol,
        this.dragState.mouseX,
        this.dragState.mouseY
      );
      this.ctx.globalAlpha = 1;
    }
  },
  
  // Draw a customer
  drawCustomer: function(customer) {
    const x = customer.x * this.grid.cellSize + this.grid.margin + this.grid.cellSize / 2;
    const y = customer.y * this.grid.cellSize + this.grid.margin + this.grid.cellSize / 2;
    
    // Draw customer
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = customer.color;
    this.ctx.fillText('🚶', x, y);
  },
  
  // Update customers
  updateCustomers: function() {
    if (!this.mapComposing.enabled || this.mapComposing.sequence.length === 0) return;
    
    for (const customer of this.customers) {
      // Sync customer position with current sequence step
      const currentStep = this.mapComposing.currentStep;
      
      if (currentStep < this.mapComposing.sequence.length) {
        // Move toward current product
        const target = this.mapComposing.sequence[currentStep];
        customer.targetX = target.x;
        customer.targetY = target.y;
      } else {
        // Move toward exit
        customer.targetX = this.grid.width - 1;
        customer.targetY = this.grid.height - 1;
      }
      
      // Smooth movement
      const dx = customer.targetX - customer.x;
      const dy = customer.targetY - customer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0.1) {
        // Move proportionally to distance
        const moveSpeed = Math.min(customer.speed * 2, distance);
        customer.x += (dx / distance) * moveSpeed;
        customer.y += (dy / distance) * moveSpeed;
      } else {
        customer.x = customer.targetX;
        customer.y = customer.targetY;
      }
    }
  },
  
  // Animation loop
  animate: function() {
    if (this.container.style.display === 'none') return;
    
    this.updateCustomers();
    this.draw();
    
    requestAnimationFrame(() => this.animate());
  },
  
  // Show the layout visualizer
  show: function() {
    if (!this.container) {
      console.log("Store layout not initialized, initializing now...");
      this.init();
    }

    if (this.container) {
      this.container.style.display = 'block';
      this.updateProductPlacements();
      this.animate();

      // Track for story mode
      if (window.storyMode && window.storyMode.tracking) {
        window.storyMode.tracking.storeLayoutOpened = true;
      }

      // Check story mode goals after opening layout
      if (window.storyMode && window.storyMode.storyActive) {
        setTimeout(() => {
          window.storyMode.checkGoal();
        }, 100);
      }

      window.log('🏪 Store Layout Visualizer opened - Click products to preview, drag to rearrange!');
    } else {
      window.log('❌ Failed to show store layout - initialization error');
    }
  },
  
  // Hide the layout visualizer
  hide: function() {
    this.container.style.display = 'none';

    // Stop map composing if active
    if (this.mapComposing.enabled) {
      this.toggleMapCompose();
    }

    window.log('🏪 Store Layout Visualizer closed');
  },

  // Save layout positions to localStorage
  saveLayout: function() {
    const positions = {};
    for (let y = 0; y < this.grid.height; y++) {
      for (let x = 0; x < this.grid.width; x++) {
        const cell = this.layout[y][x];
        if (cell && cell.type === 'product') {
          positions[cell.id] = { x, y };
        }
      }
    }
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({ positions }));
      console.log('Store layout saved:', Object.keys(positions).length, 'products');
    } catch (e) {
      console.warn('Failed to save store layout:', e);
    }
  },

  // Load layout positions from localStorage
  loadLayout: function() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        console.log('Store layout loaded:', Object.keys(data.positions || {}).length, 'positions');
        return data.positions || {};
      }
    } catch (e) {
      console.warn('Failed to load store layout:', e);
    }
    return {};
  }
};

// Initialize when ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.storeLayout.init();
  });
} else {
  window.storeLayout.init();
}