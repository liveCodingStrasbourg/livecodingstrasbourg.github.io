// syntax-highlighter.js - Code editor syntax highlighting with background colors

(function() {
  'use strict';

  window.syntaxHighlighter = {
    editor: null,
    backdrop: null,
    highlightLayer: null,

    // Word categories for highlighting
    categories: {
      slots: /\[\d\]/g,
      verbs: /\b(add|reach|grab|crouch|remove|shoplift|steal)\b/gi,
      products: null, // Will be populated from productTypes
      modifiers: /\b(fresh|old|strong|flavorless|cheap|expensive|processed|industrial|overpriced|vomit|artisanal|bargain|luxury|artificial|mass-produced|addictive)\b/gi,
      parameters: /\b(nutriscore|shelflife|escalator|open|volume)\b/gi,
      paramValues: /\b(today|week|month|year|decade|forever|up|down|bounce|zigzag|express|checkout|slow|normal|fast|rush|broken|loud|soft|quiet|max|min|mute|whisper)\b/gi,
      nutriscoreGrades: /\b([A-E])\b/g,
      modes: /\b(discount|inflation|consumerism|black_friday)\s+mode\b/gi,
      modeToggle: /\b(on|off)\b/gi,
      cartCommand: /\bmy\s+cart\s+has\b/gi,
      wheelTypes: /\b(squeaky|rusty|broken|smooth|wobbly|shopping|racing|golden|diamond|plasma)\s+wheels?\b/gi,
      transitions: /\b(sliding\s+doors|conveyor\s+belt|elevator\s+music|fade\s+to|store\s+closing|checkout\s+line|lunch\s+break)\b/gi,
      comments: /\/\/.*/g
    },

    // Initialize the syntax highlighter
    init: function() {
      this.editor = document.getElementById('editor');
      if (!this.editor) {
        console.warn('Syntax highlighter: Editor not found');
        return;
      }

      // Build products regex from productTypes
      this.buildProductsRegex();

      // Create the backdrop structure
      this.createBackdrop();

      // Set up event listeners
      this.setupEventListeners();

      // Initial highlight
      this.highlight();

      console.log('Syntax highlighter initialized');
    },

    // Build products regex from available product types
    buildProductsRegex: function() {
      if (window.productTypes) {
        const products = Object.keys(window.productTypes).join('|');
        this.categories.products = new RegExp(`\\b(${products})\\b`, 'gi');
      } else {
        // Fallback list
        this.categories.products = /\b(beer|milk|wine|soda|coffee|energy_drink|salad|ham|chips|pizza|bread|cereal|chocolate|candy|butter|eggs|pasta|rice|cheese|oil)\b/gi;
      }
    },

    // Create backdrop element for highlighting
    createBackdrop: function() {
      // Wrap editor in a container if not already
      let container = this.editor.parentElement;
      if (!container.classList.contains('editor-highlight-container')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'editor-highlight-container';
        container.insertBefore(wrapper, this.editor);
        wrapper.appendChild(this.editor);
        container = wrapper;
      }

      // Create backdrop
      this.backdrop = document.createElement('div');
      this.backdrop.className = 'editor-backdrop';

      // Create highlight layer inside backdrop
      this.highlightLayer = document.createElement('div');
      this.highlightLayer.className = 'editor-highlight-layer';
      this.backdrop.appendChild(this.highlightLayer);

      // Insert backdrop before editor
      container.insertBefore(this.backdrop, this.editor);
    },

    // Set up event listeners
    setupEventListeners: function() {
      const self = this;

      // Update on various input events
      this.editor.addEventListener('input', () => this.highlight());
      this.editor.addEventListener('keyup', () => this.highlight());
      this.editor.addEventListener('paste', () => setTimeout(() => this.highlight(), 10));
      this.editor.addEventListener('cut', () => setTimeout(() => this.highlight(), 10));
      this.editor.addEventListener('focus', () => this.highlight());
      this.editor.addEventListener('blur', () => this.highlight());

      // Sync scroll
      this.editor.addEventListener('scroll', () => this.syncScroll());

      // Update on window resize
      window.addEventListener('resize', () => this.highlight());

      // Poll for changes as fallback (catches programmatic changes)
      this.lastValue = this.editor.value;
      setInterval(() => {
        if (this.editor.value !== this.lastValue) {
          this.lastValue = this.editor.value;
          this.highlight();
        }
      }, 100);

      // Expose refresh method globally for other modules to call
      window.refreshSyntaxHighlight = () => this.highlight();
    },

    // Sync scroll position
    syncScroll: function() {
      if (this.highlightLayer) {
        // Use transform for smoother sync
        this.highlightLayer.style.transform = `translate(-${this.editor.scrollLeft}px, -${this.editor.scrollTop}px)`;
      }
    },

    // Main highlight function
    highlight: function() {
      if (!this.highlightLayer || !this.editor) return;

      // Ensure highlight layer matches editor dimensions
      const editorStyles = window.getComputedStyle(this.editor);
      this.highlightLayer.style.width = this.editor.scrollWidth + 'px';
      this.highlightLayer.style.minHeight = this.editor.scrollHeight + 'px';

      const text = this.editor.value;
      let html = this.escapeHtml(text);

      // Apply highlighting in order (later ones can override earlier)
      // Comments first (will be handled specially)
      html = this.highlightCategory(html, 'comments', 'hl-comment');

      // Then other categories
      html = this.highlightCategory(html, 'slots', 'hl-slot');
      html = this.highlightCategory(html, 'verbs', 'hl-verb');
      html = this.highlightCategory(html, 'products', 'hl-product');
      html = this.highlightCategory(html, 'modifiers', 'hl-modifier');
      html = this.highlightCategory(html, 'parameters', 'hl-parameter');
      html = this.highlightCategory(html, 'paramValues', 'hl-value');
      html = this.highlightCategory(html, 'nutriscoreGrades', 'hl-grade');
      html = this.highlightCategory(html, 'modes', 'hl-mode');
      html = this.highlightCategory(html, 'modeToggle', 'hl-toggle');
      html = this.highlightCategory(html, 'cartCommand', 'hl-cart');
      html = this.highlightCategory(html, 'wheelTypes', 'hl-wheel');
      html = this.highlightCategory(html, 'transitions', 'hl-transition');

      // Add line ending character to preserve spacing
      html = html.replace(/\n/g, '<br>');

      // Add final space to ensure last line renders correctly
      html += '&nbsp;';

      this.highlightLayer.innerHTML = html;
      this.syncScroll();
    },

    // Highlight a category of words
    highlightCategory: function(html, category, className) {
      const regex = this.categories[category];
      if (!regex) return html;

      // Clone regex to avoid issues with global flag
      const re = new RegExp(regex.source, regex.flags);

      return html.replace(re, (match) => {
        // Don't highlight if already inside a span
        return `<span class="${className}">${match}</span>`;
      });
    },

    // Escape HTML special characters
    escapeHtml: function(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    // Refresh highlighting (call after dynamic changes)
    refresh: function() {
      this.buildProductsRegex();
      this.highlight();
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Wait a bit for other scripts to load productTypes
      setTimeout(() => window.syntaxHighlighter.init(), 200);
    });
  } else {
    setTimeout(() => window.syntaxHighlighter.init(), 200);
  }
})();
