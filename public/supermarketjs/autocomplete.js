// autocomplete.js - Autocomplete system for SUPERMARKET command interface

(function() {
  console.log("Loading autocomplete system...");

  window.autocomplete = {
    // Configuration
    config: {
      maxSuggestions: 8,
      debounceMs: 100,
      minCharsToTrigger: 2  // Require at least 2 chars before showing
    },

    // Suggestion data
    suggestions: {
      // Command starters
      commands: [
        { text: "add", desc: "Add product (eye level)" },
        { text: "reach", desc: "Top shelf (+1 octave)" },
        { text: "grab", desc: "Lower shelf (-1 octave)" },
        { text: "crouch", desc: "Bottom shelf (-2 octaves)" },
        { text: "remove", desc: "Remove products" },
        { text: "my cart has", desc: "Set cart wheels" },
        { text: "discount mode", desc: "Toggle detuning" },
        { text: "inflation mode", desc: "Toggle pitch rise" },
        { text: "consumerism mode", desc: "Toggle echo/delay" },
        { text: "black_friday mode", desc: "Toggle chaos" },
        { text: "checkout line", desc: "Fade to silence" },
        { text: "lunch break", desc: "Soften music" },
        { text: "store closing", desc: "Fade everything" },
        { text: "cleanup time", desc: "Muzak remains" },
        { text: "intermission", desc: "Brief pause" },
        { text: "coffee break", desc: "Quick fade" },
        { text: "conveyor belt", desc: "Sequential fade" },
        { text: "sliding doors", desc: "Stereo sweep" },
        { text: "elevator music", desc: "Lowpass filter" },
        { text: "fade to silence", desc: "Volume fade" },
        { text: "fade to soft", desc: "Background level" },
        { text: "fade to full", desc: "Full volume" },
        { text: "morph to", desc: "Transform products" },
        { text: "volume loud", desc: "High volume" },
        { text: "volume soft", desc: "Low volume" },
        { text: "volume quiet", desc: "Very low volume" },
        { text: "volume max", desc: "Maximum volume" },
        { text: "volume mute", desc: "Silent" },
        { text: "it's closing time", desc: "Speed up tempo" },
        { text: "it's opening time", desc: "Slow down tempo" },
        { text: "checkout", desc: "Start recording" },
        { text: "finish checkout", desc: "Stop recording" },
        { text: "scan barcode", desc: "Generate sequence" },
        { text: "season", desc: "Set seasonal theme" },
        { text: "announcement", desc: "PA announcement" },
        { text: "rush hour", desc: "Tempo escalation" },
        { text: "apply coupon", desc: "Apply effect coupon" },
        { text: "decay on", desc: "Products expire" },
        { text: "decay off", desc: "Stop decay" },
        { text: "preserve", desc: "Preserve product" },
        { text: "spoil all", desc: "Expire all" },
        { text: "store layout", desc: "Open map view" },
        { text: "map compose", desc: "Spatial sequencer" },
        { text: "shoplift", desc: "Attempt theft" },
        { text: "steal", desc: "Attempt theft" },
        { text: "security level", desc: "Set security" },
        { text: "story mode", desc: "Start tutorial" },
        { text: "performance stats", desc: "Show stats" },
        { text: "performance mode", desc: "Set audio mode" }
      ],

      // Modifiers (effects applied before product)
      modifiers: [
        { text: "fresh", desc: "Higher pitch" },
        { text: "old", desc: "Lower pitch" },
        { text: "strong", desc: "Lowpass filter" },
        { text: "flavorless", desc: "Highpass filter" },
        { text: "cheap", desc: "Bitcrusher" },
        { text: "expensive", desc: "Reverb" },
        { text: "processed", desc: "Chorus" },
        { text: "industrial", desc: "Distortion" },
        { text: "overpriced", desc: "Phaser" },
        { text: "vomit", desc: "Extreme distortion" },
        { text: "artisanal", desc: "Tremolo" },
        { text: "bargain", desc: "Feedback delay" },
        { text: "luxury", desc: "Long reverb" },
        { text: "artificial", desc: "Vibrato" },
        { text: "mass-produced", desc: "Heavy bitcrusher" },
        { text: "addictive", desc: "Ping-pong delay" }
      ],

      // Parameters (after product)
      parameters: [
        { text: "nutriscore", desc: "Key transposition" },
        { text: "shelflife", desc: "Repetition rate" },
        { text: "open", desc: "Random triggering" },
        { text: "escalator", desc: "Arpeggiator" }
      ],

      // Nutriscore grades
      nutriscoreGrades: [
        { text: "A", desc: "Key of A" },
        { text: "B", desc: "Key of B" },
        { text: "C", desc: "Key of C" },
        { text: "D", desc: "Key of D" },
        { text: "E", desc: "Key of E" }
      ],

      // Shelflife values
      shelflifeValues: [
        { text: "today", desc: "Very short" },
        { text: "week", desc: "Short" },
        { text: "month", desc: "Medium" },
        { text: "year", desc: "Long" },
        { text: "forever", desc: "Infinite" }
      ],

      // Escalator patterns
      escalatorPatterns: [
        { text: "up", desc: "Ascending" },
        { text: "down", desc: "Descending" },
        { text: "bounce", desc: "Up then down" },
        { text: "zigzag", desc: "Alternating" },
        { text: "express", desc: "Random fast" },
        { text: "checkout", desc: "Barcode rhythm" }
      ],

      // Escalator speeds
      escalatorSpeeds: [
        { text: "slow", desc: "Slow speed" },
        { text: "normal", desc: "Normal speed" },
        { text: "fast", desc: "Fast speed" },
        { text: "rush", desc: "Very fast" },
        { text: "broken", desc: "Irregular" }
      ],

      // Cart wheel types
      wheelTypes: [
        { text: "square", desc: "Basic 4/4 beat" },
        { text: "broken", desc: "Glitchy rhythm" },
        { text: "premium", desc: "Smooth swing" },
        { text: "defective", desc: "Chaotic poly" },
        { text: "bargain", desc: "Simple minimal" },
        { text: "luxury", desc: "Complex jazz" },
        { text: "heavy", desc: "Kick-heavy techno" },
        { text: "chrome", desc: "Crisp digital" },
        { text: "turbo", desc: "Fast breakbeat" },
        { text: "plastic", desc: "Synthetic drums" },
        { text: "wobbly", desc: "Dubstep wobble" },
        { text: "squeaky", desc: "Hi-hat shuffle" },
        { text: "rubber", desc: "Bouncy funk" },
        { text: "smooth", desc: "Liquid DnB" },
        { text: "rusty", desc: "Industrial" },
        { text: "vintage", desc: "Classic 808/909" },
        { text: "stolen", desc: "Erratic pattern" },
        { text: "golden", desc: "Trap hi-hats" },
        { text: "no", desc: "No rhythm" }
      ],

      // On/off toggle
      onOff: [
        { text: "on", desc: "Enable" },
        { text: "off", desc: "Disable" }
      ],

      // Seasons
      seasons: [
        { text: "halloween", desc: "Spooky theme" },
        { text: "christmas", desc: "Festive theme" },
        { text: "summer", desc: "Bright vibes" },
        { text: "winter", desc: "Cold crisp" },
        { text: "easter", desc: "Bouncy spring" },
        { text: "valentines", desc: "Romantic" },
        { text: "normal", desc: "Regular theme" }
      ],

      // Coupons
      coupons: [
        { text: "BOGO", desc: "Duplicate products" },
        { text: "50OFF", desc: "Half speed" },
        { text: "FREESHIP", desc: "Spacious reverb" },
        { text: "VIP", desc: "Luxury effects" }
      ],

      // Security levels
      securityLevels: [
        { text: "low", desc: "30% security" },
        { text: "medium", desc: "50% security" },
        { text: "high", desc: "70% security" },
        { text: "paranoid", desc: "95% security" }
      ],

      // Products - will be populated dynamically
      products: []
    },

    // State
    state: {
      visible: false,
      selectedIndex: 0,
      currentSuggestions: [],
      context: null
    },

    // DOM elements
    dropdown: null,
    mirror: null,
    editor: null,
    debounceTimer: null,

    // Initialize
    init: function() {
      console.log("Initializing autocomplete...");

      this.editor = document.getElementById('editor');
      if (!this.editor) {
        console.warn("Autocomplete: Editor not found");
        return;
      }

      // Populate products from window.productTypes
      this.populateProducts();

      // Create dropdown element
      this.createDropdown();

      // Create mirror element for cursor positioning
      this.createMirror();

      // Add event listeners
      this.editor.addEventListener('input', (e) => this.onInput(e));
      this.editor.addEventListener('keydown', (e) => this.onKeyDown(e));
      this.editor.addEventListener('click', () => this.onCursorMove());
      this.editor.addEventListener('blur', () => {
        setTimeout(() => this.hide(), 150);
      });

      console.log("Autocomplete initialized");
    },

    // Populate products from window.productTypes
    populateProducts: function() {
      if (window.productTypes) {
        this.suggestions.products = Object.keys(window.productTypes).map(key => ({
          text: key,
          desc: window.productTypes[key].description || window.productTypes[key].category || ''
        }));
      }
    },

    // Create dropdown element
    createDropdown: function() {
      this.dropdown = document.createElement('div');
      this.dropdown.id = 'autocomplete-dropdown';
      this.dropdown.className = 'autocomplete-dropdown';
      document.body.appendChild(this.dropdown);
    },

    // Create mirror element for cursor position detection
    createMirror: function() {
      this.mirror = document.createElement('div');
      this.mirror.id = 'autocomplete-mirror';
      this.mirror.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        visibility: hidden;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow: hidden;
      `;
      document.body.appendChild(this.mirror);
    },

    // Handle input event
    onInput: function(e) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(() => {
        this.updateSuggestions();
      }, this.config.debounceMs);
    },

    // Handle keydown event
    onKeyDown: function(e) {
      // Don't intercept if Ctrl is pressed (for shortcuts)
      if (e.ctrlKey) return;

      if (!this.state.visible) {
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          this.selectNext();
          break;
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          this.selectPrevious();
          break;
        case 'Tab':
          // Only Tab accepts suggestions - Enter creates new line normally
          if (this.state.currentSuggestions.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            this.acceptSuggestion();
          }
          break;
        case 'Enter':
          // Hide autocomplete but let Enter create new line normally
          this.hide();
          return; // Don't prevent default - let Enter work normally
        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          this.hide();
          break;
      }
    },

    // Handle cursor move
    onCursorMove: function() {
      this.updateSuggestions();
    },

    // Update suggestions based on current context
    updateSuggestions: function() {
      if (!this.editor) return;

      const context = this.detectContext();
      this.state.context = context;

      const suggestions = this.getSuggestionsForContext(context);
      this.state.currentSuggestions = suggestions;
      this.state.selectedIndex = 0;

      if (suggestions.length > 0) {
        this.render();
        this.updatePosition();
        this.show();
      } else {
        this.hide();
      }
    },

    // Detect current typing context
    detectContext: function() {
      const cursorPos = this.editor.selectionStart;
      const text = this.editor.value;

      // Get current line
      const lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1;
      const lineEnd = text.indexOf('\n', cursorPos);
      const currentLine = text.substring(lineStart, lineEnd > -1 ? lineEnd : text.length);

      // Get text before cursor on current line
      const posInLine = cursorPos - lineStart;
      const beforeCursor = currentLine.substring(0, posInLine).toLowerCase();

      // Strip slot prefix [0]-[9] if present
      let strippedBeforeCursor = beforeCursor;
      const slotMatch = beforeCursor.match(/^\[\d\]\s*/);
      if (slotMatch) {
        strippedBeforeCursor = beforeCursor.substring(slotMatch[0].length);
      }

      // Get current word being typed (from stripped text)
      const lastSpaceIndex = strippedBeforeCursor.lastIndexOf(' ');
      const currentWord = strippedBeforeCursor.substring(lastSpaceIndex + 1);
      const completedText = strippedBeforeCursor.substring(0, lastSpaceIndex + 1).trim();
      const words = completedText.split(/\s+/).filter(w => w);

      // Empty line or just slot prefix - don't show suggestions yet
      if (strippedBeforeCursor.trim() === '') {
        return { type: 'none', filter: '', words: [] };
      }

      // Require minimum characters before showing suggestions (unless we have completed words)
      if (currentWord.length < this.config.minCharsToTrigger && words.length === 0) {
        return { type: 'none', filter: '', words: [] };
      }

      // Check for specific command contexts

      // Product verbs: add, reach, grab, crouch (all trigger product suggestions)
      const productVerbs = ['add', 'reach', 'grab', 'crouch'];
      const firstWord = words[0];
      const trimmedInput = strippedBeforeCursor.trim();

      // Check if we're in a product verb context
      if (productVerbs.includes(firstWord) || productVerbs.includes(trimmedInput) ||
          (words.length === 0 && productVerbs.some(v => v.startsWith(currentWord) && currentWord.length >= 1))) {
        return this.detectAddContext(words, currentWord, strippedBeforeCursor);
      }

      // "remove" command
      if (words[0] === 'remove' || strippedBeforeCursor.trim() === 'remove') {
        return { type: 'product_or_all', filter: currentWord, words: words };
      }

      // "my cart has" command
      if (beforeCursor.includes('my cart has')) {
        const afterCart = beforeCursor.split('my cart has')[1] || '';
        const cartWord = afterCart.trim().split(/\s+/).pop() || '';
        return { type: 'wheel', filter: cartWord, words: words };
      }
      if (beforeCursor.trim() === 'my' || beforeCursor.trim() === 'my cart') {
        return { type: 'cart_completion', filter: currentWord, partial: beforeCursor.trim() };
      }

      // Mode commands
      if (beforeCursor.match(/(discount|inflation|consumerism|black_friday)\s+mode\s*$/i)) {
        return { type: 'on_off', filter: currentWord, words: words };
      }

      // Season command
      if (beforeCursor.match(/season\s*$/i) || words[0] === 'season') {
        return { type: 'season', filter: currentWord, words: words };
      }

      // Coupon command
      if (beforeCursor.match(/(apply\s+coupon|coupon)\s*$/i)) {
        return { type: 'coupon', filter: currentWord, words: words };
      }

      // Security level command
      if (beforeCursor.match(/security\s+level\s*$/i)) {
        return { type: 'security', filter: currentWord, words: words };
      }

      // Rush hour
      if (beforeCursor.match(/rush\s+hour\s*$/i)) {
        return { type: 'on_off', filter: currentWord, words: words };
      }

      // Morph to
      if (beforeCursor.match(/morph\s+to\s*$/i)) {
        return { type: 'product', filter: currentWord, words: words };
      }

      // Preserve
      if (words[0] === 'preserve') {
        return { type: 'product', filter: currentWord, words: words };
      }

      // Shoplift/steal
      if (words[0] === 'shoplift' || words[0] === 'steal' || words[0] === 'pocket') {
        return { type: 'product', filter: currentWord, words: words };
      }

      // Default: suggest commands
      return { type: 'command', filter: currentWord, words: words };
    },

    // Detect context for "add" command
    detectAddContext: function(words, currentWord, beforeCursor) {
      const modifierTexts = this.suggestions.modifiers.map(m => m.text);
      const productTexts = this.suggestions.products.map(p => p.text);
      const parameterTexts = this.suggestions.parameters.map(p => p.text);
      const nutriscoreGrades = this.suggestions.nutriscoreGrades.map(n => n.text.toLowerCase());
      const shelflifeValues = this.suggestions.shelflifeValues.map(s => s.text);
      const escalatorPatterns = this.suggestions.escalatorPatterns.map(p => p.text);
      const escalatorSpeeds = this.suggestions.escalatorSpeeds.map(s => s.text);

      let usedModifiers = [];
      let usedParameters = [];
      let productFound = null;
      let afterProduct = false;
      let lastKeyword = null;

      // Analyze words after "add"
      for (let i = 1; i < words.length; i++) {
        const word = words[i];

        // Check if it's a product
        if (productTexts.includes(word)) {
          productFound = word;
          afterProduct = true;
          continue;
        }

        // Check if it's a modifier (before product)
        if (modifierTexts.includes(word) && !afterProduct) {
          usedModifiers.push(word);
          continue;
        }

        // Check for parameter keywords
        if (word === 'nutriscore') {
          lastKeyword = 'nutriscore';
          usedParameters.push('nutriscore');
          afterProduct = true;
          continue;
        }
        if (word === 'shelflife') {
          lastKeyword = 'shelflife';
          usedParameters.push('shelflife');
          afterProduct = true;
          continue;
        }
        if (word === 'escalator') {
          lastKeyword = 'escalator';
          usedParameters.push('escalator');
          afterProduct = true;
          continue;
        }
        if (word === 'open') {
          usedParameters.push('open');
          afterProduct = true;
          lastKeyword = null; // open doesn't need a value
          continue;
        }

        // Check for parameter values (these reset lastKeyword)
        if (nutriscoreGrades.includes(word)) {
          lastKeyword = null;
          continue;
        }
        if (shelflifeValues.includes(word)) {
          lastKeyword = null;
          continue;
        }
        if (escalatorPatterns.includes(word) || escalatorSpeeds.includes(word)) {
          // Escalator can have both pattern and speed, so check if we need more
          continue;
        }
      }

      // Check the last complete word for context
      const lastWord = words[words.length - 1];

      // If the last word is a parameter keyword, suggest its values
      if (lastWord === 'nutriscore') {
        return { type: 'nutriscore', filter: currentWord, words: words };
      }
      if (lastWord === 'shelflife') {
        return { type: 'shelflife', filter: currentWord, words: words };
      }
      if (lastWord === 'escalator') {
        return { type: 'escalator', filter: currentWord, words: words };
      }

      // If we're still expecting a value for a keyword
      if (lastKeyword === 'nutriscore') {
        return { type: 'nutriscore', filter: currentWord, words: words };
      }
      if (lastKeyword === 'shelflife') {
        return { type: 'shelflife', filter: currentWord, words: words };
      }
      if (lastKeyword === 'escalator') {
        return { type: 'escalator', filter: currentWord, words: words };
      }

      // After product, suggest parameters (that haven't been used yet)
      if (afterProduct) {
        return {
          type: 'parameter',
          filter: currentWord,
          words: words,
          productFound: productFound,
          usedModifiers: usedModifiers,
          usedParameters: usedParameters
        };
      }

      // Before product, suggest modifiers + products
      // Filter out already used modifiers
      return {
        type: 'modifier_or_product',
        filter: currentWord,
        words: words,
        usedModifiers: usedModifiers
      };
    },

    // Get suggestions for context
    getSuggestionsForContext: function(context) {
      let items = [];

      switch (context.type) {
        case 'none':
          return [];

        case 'command':
          items = this.suggestions.commands;
          break;

        case 'modifier_or_product':
          // Filter out already used modifiers
          const availableModifiers = this.suggestions.modifiers.filter(
            m => !context.usedModifiers || !context.usedModifiers.includes(m.text)
          );
          items = [...availableModifiers, ...this.suggestions.products];
          break;

        case 'product':
        case 'product_or_all':
          items = [...this.suggestions.products];
          if (context.type === 'product_or_all') {
            items.unshift({ text: 'all', desc: 'Remove all products' });
          }
          break;

        case 'parameter':
          // Filter out already used parameters
          items = this.suggestions.parameters.filter(
            p => !context.usedParameters || !context.usedParameters.includes(p.text)
          );
          break;

        case 'nutriscore':
          items = this.suggestions.nutriscoreGrades;
          break;

        case 'shelflife':
          items = this.suggestions.shelflifeValues;
          break;

        case 'escalator':
          items = [...this.suggestions.escalatorPatterns, ...this.suggestions.escalatorSpeeds];
          break;

        case 'wheel':
          items = this.suggestions.wheelTypes;
          break;

        case 'cart_completion':
          // Use full phrase so replacement works correctly
          items = [{ text: 'my cart has', desc: 'Set cart wheels' }];
          break;

        case 'on_off':
          items = this.suggestions.onOff;
          break;

        case 'season':
          items = this.suggestions.seasons;
          break;

        case 'coupon':
          items = this.suggestions.coupons;
          break;

        case 'security':
          items = this.suggestions.securityLevels;
          break;
      }

      // Filter by current word
      return this.filterSuggestions(items, context.filter);
    },

    // Filter suggestions by prefix/substring
    filterSuggestions: function(items, filter) {
      if (!filter) {
        return items.slice(0, this.config.maxSuggestions);
      }

      const lowerFilter = filter.toLowerCase();
      let results = [];

      // First pass: prefix match
      for (const item of items) {
        if (results.length >= this.config.maxSuggestions) break;
        if (item.text.toLowerCase().startsWith(lowerFilter)) {
          results.push(item);
        }
      }

      // Second pass: substring match (if not enough results)
      if (results.length < this.config.maxSuggestions) {
        for (const item of items) {
          if (results.length >= this.config.maxSuggestions) break;
          if (!item.text.toLowerCase().startsWith(lowerFilter) &&
              item.text.toLowerCase().includes(lowerFilter)) {
            results.push(item);
          }
        }
      }

      return results;
    },

    // Render suggestions
    render: function() {
      const suggestions = this.state.currentSuggestions;

      let html = '<div class="autocomplete-hint">Tab to accept</div><ul class="autocomplete-list">';

      suggestions.forEach((item, index) => {
        const isSelected = index === this.state.selectedIndex;
        const selectedClass = isSelected ? 'selected' : '';

        html += `
          <li data-index="${index}" class="autocomplete-item ${selectedClass}">
            <span class="autocomplete-text">${this.escapeHtml(item.text)}</span>
            <span class="autocomplete-desc">${this.escapeHtml(item.desc || '')}</span>
          </li>
        `;
      });

      html += '</ul>';
      this.dropdown.innerHTML = html;

      // Add click handlers
      this.dropdown.querySelectorAll('li').forEach(li => {
        li.addEventListener('mousedown', (e) => {
          e.preventDefault();
          const index = parseInt(li.dataset.index);
          this.state.selectedIndex = index;
          this.acceptSuggestion();
        });
      });
    },

    // Escape HTML
    escapeHtml: function(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    // Get caret coordinates
    getCaretCoordinates: function() {
      const element = this.editor;
      const position = element.selectionStart;

      // Copy styles to mirror
      const computed = window.getComputedStyle(element);
      const stylesToCopy = [
        'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
        'lineHeight', 'letterSpacing', 'paddingTop', 'paddingLeft',
        'paddingRight', 'paddingBottom', 'borderWidth', 'boxSizing'
      ];

      stylesToCopy.forEach(prop => {
        this.mirror.style[prop] = computed[prop];
      });

      this.mirror.style.width = element.offsetWidth + 'px';

      // Set content up to caret position
      const text = element.value.substring(0, position);
      this.mirror.textContent = text;

      // Add span at end to mark caret
      const caretMarker = document.createElement('span');
      caretMarker.textContent = '|';
      caretMarker.style.position = 'relative';
      this.mirror.appendChild(caretMarker);

      // Get positions
      const editorRect = element.getBoundingClientRect();
      const markerRect = caretMarker.getBoundingClientRect();
      const mirrorRect = this.mirror.getBoundingClientRect();

      // Calculate relative position
      const relativeLeft = markerRect.left - mirrorRect.left;
      const relativeTop = markerRect.top - mirrorRect.top;

      // Account for scroll
      const scrollTop = element.scrollTop;
      const scrollLeft = element.scrollLeft;

      const lineHeight = parseInt(computed.lineHeight) || 18;

      return {
        left: editorRect.left + relativeLeft - scrollLeft,
        top: editorRect.top + relativeTop - scrollTop + lineHeight
      };
    },

    // Update dropdown position
    updatePosition: function() {
      const coords = this.getCaretCoordinates();

      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = coords.left;
      let top = coords.top;

      // Get dropdown dimensions (make visible briefly to measure)
      this.dropdown.style.display = 'block';
      this.dropdown.style.visibility = 'hidden';
      const dropdownWidth = this.dropdown.offsetWidth;
      const dropdownHeight = this.dropdown.offsetHeight;
      this.dropdown.style.visibility = 'visible';

      // Adjust if would go off right edge
      if (left + dropdownWidth > viewportWidth - 10) {
        left = viewportWidth - dropdownWidth - 10;
      }

      // Adjust if would go off bottom edge (show above cursor)
      if (top + dropdownHeight > viewportHeight - 10) {
        top = coords.top - dropdownHeight - 20;
      }

      // Ensure not off left or top
      left = Math.max(10, left);
      top = Math.max(10, top);

      this.dropdown.style.left = left + 'px';
      this.dropdown.style.top = top + 'px';
    },

    // Show dropdown
    show: function() {
      this.dropdown.style.display = 'block';
      this.state.visible = true;
    },

    // Hide dropdown
    hide: function() {
      this.dropdown.style.display = 'none';
      this.state.visible = false;
    },

    // Check if visible
    isVisible: function() {
      return this.state.visible;
    },

    // Select next suggestion
    selectNext: function() {
      if (this.state.currentSuggestions.length === 0) return;
      this.state.selectedIndex = (this.state.selectedIndex + 1) % this.state.currentSuggestions.length;
      this.render();
      this.scrollSelectedIntoView();
    },

    // Select previous suggestion
    selectPrevious: function() {
      if (this.state.currentSuggestions.length === 0) return;
      this.state.selectedIndex = (this.state.selectedIndex - 1 + this.state.currentSuggestions.length) % this.state.currentSuggestions.length;
      this.render();
      this.scrollSelectedIntoView();
    },

    // Scroll selected item into view
    scrollSelectedIntoView: function() {
      const selectedItem = this.dropdown.querySelector('.autocomplete-item.selected');
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    },

    // Accept current suggestion
    acceptSuggestion: function() {
      if (this.state.currentSuggestions.length === 0) return;

      const suggestion = this.state.currentSuggestions[this.state.selectedIndex];
      if (!suggestion) return;

      // Pass context for multi-word phrase handling
      this.insertSuggestion(suggestion.text, this.state.context);
      this.hide();
    },

    // Insert suggestion text
    insertSuggestion: function(text, context) {
      const cursorPos = this.editor.selectionStart;
      const content = this.editor.value;
      const beforeCursor = content.substring(0, cursorPos);
      const lineStart = beforeCursor.lastIndexOf('\n') + 1;

      let wordStart;

      // Handle multi-word phrase completions (like "my cart has")
      // These need to replace from the start of the partial phrase
      if (context && context.type === 'cart_completion' && context.partial) {
        // Find where the partial phrase starts on this line
        const lineContent = beforeCursor.substring(lineStart);
        const partialStart = lineContent.lastIndexOf(context.partial.split(' ')[0]);
        wordStart = lineStart + (partialStart >= 0 ? partialStart : 0);
      } else {
        // Normal single-word replacement
        const lastSpaceIndex = beforeCursor.lastIndexOf(' ');
        wordStart = Math.max(lastSpaceIndex + 1, lineStart);
      }

      // Build new content
      const before = content.substring(0, wordStart);
      const after = content.substring(cursorPos);

      // Add space after if needed
      const needsSpace = after.length === 0 || after[0] !== ' ';
      const insertText = text + (needsSpace ? ' ' : '');

      const newContent = before + insertText + after;
      this.editor.value = newContent;

      // Position cursor after inserted text
      const newPosition = wordStart + insertText.length;
      this.editor.selectionStart = newPosition;
      this.editor.selectionEnd = newPosition;

      // Focus editor
      this.editor.focus();

      // Refresh syntax highlighting
      if (window.refreshSyntaxHighlight) {
        window.refreshSyntaxHighlight();
      }

      // Trigger another update for chained suggestions
      setTimeout(() => this.updateSuggestions(), 10);
    }
  };

  console.log("Autocomplete module loaded");
})();
