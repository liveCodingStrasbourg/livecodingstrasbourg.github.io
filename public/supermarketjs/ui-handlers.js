// ui-handlers.js - Setup for UI event handlers and user interactions

// Intro tab content (always resets on load)
const INTRO_CONTENT = `// ═══════════════════════════════════════════════════════════════
//  RAYON - Audio Live Coding Environment
//  Welcome to the sonic shopping experience!
// ═══════════════════════════════════════════════════════════════

// SLOT-BASED COMMANDS (10 slots: [0] to [9])
// Add products (synthesizers) to slots:
[0] add beer
[1] add chips
[2] add fresh salad

// Replace a slot (beat-synced transition on next bar):
[0] add wine               // replaces beer in slot 0

// Remove products:
[0] remove                 // remove slot 0
remove all                 // clear all slots

// MODIFIERS change how products sound:
[3] add cheap old beer          // bitcrusher + lower pitch
[4] add expensive fresh wine    // reverb + higher pitch
[5] add industrial ham          // distortion effect

// CART WHEELS create drum patterns:
my cart has square wheels   // basic 4/4 beat
my cart has heavy wheels    // techno kick pattern
my cart has golden wheels   // trap hi-hats

// PARAMETERS fine-tune products:
[6] add beer nutriscore A       // key transposition
[7] add chips shelflife week    // repetition rate
[8] add salad escalator up fast // arpeggiator

// MODES apply global effects:
discount mode on            // random detuning
inflation mode on           // gradual pitch rise

// ═══════════════════════════════════════════════════════════════
//  TRY STORY MODE for a guided tutorial!
//  Type: story mode
// ═══════════════════════════════════════════════════════════════

// COMPLEX EXAMPLE - Run all lines (Ctrl+Shift+Enter):
[0] add cheap old ham
[1] add fresh expensive wine
[2] add industrial chips escalator bounce fast
my cart has turbo wheels
discount mode on
`;

// Tab 1 content - Comprehensive examples (resets on load)
const TAB1_EXAMPLES = `// ═══════════════════════════════════════════════════════════════
//  RAYON - COMPLETE FEATURE REFERENCE
//  All products, modifiers, parameters & commands
// ═══════════════════════════════════════════════════════════════


// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
//  PRODUCTS (Synthesizers)
// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

// Drinks
[0] add beer                // FM synth, smooth jazz
[1] add milk                // Soft pluck synth
[2] add wine                // Detuned poly, complex layers
[3] add soda                // High pitched membrane
[4] add coffee              // Dark filtered sawtooth
[5] add energy_drink        // Buzzy FM synth

// Food
[0] add salad               // Pluck synth, crisp texture
[1] add ham                 // Sawtooth, rich depth
[2] add chips               // Crispy sawtooth, filter sweep
[3] add pizza               // Triangle wave FM
[4] add bread               // Warm duo synth
[5] add cereal              // Crunchy granular
[6] add chocolate           // Rich square wave AM
[7] add candy               // Bright sawtooth mono
[8] add butter              // Creamy detuned duo
[9] add eggs                // Plucked string, bright attack
[0] add pasta               // Soft poly, Italian warmth
[1] add rice                // Short noise bursts

// Base ingredients
[0] add oil                 // Low frequency sine bass


// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
//  MODIFIERS (Effects)
// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

// Pitch modifiers
[0] add fresh beer          // Octave up
[1] add old beer            // Octave down

// Filter modifiers
[0] add strong beer         // Lowpass filter (darker)
[1] add flavorless beer     // Highpass filter (thinner)

// Distortion/Lo-fi
[0] add cheap beer          // Bitcrusher
[1] add mass-produced beer  // Heavy bitcrusher
[2] add industrial beer     // Distortion
[3] add vomit beer          // Extreme waveshaper

// Reverb/Space
[0] add expensive beer      // Short reverb
[1] add luxury beer         // Long reverb

// Modulation
[0] add processed beer      // Chorus
[1] add overpriced beer     // Phaser
[2] add artisanal beer      // Tremolo
[3] add artificial beer     // Vibrato

// Delay
[0] add bargain beer        // Feedback delay
[1] add addictive beer      // Ping-pong delay

// Combined modifiers
[0] add cheap old industrial beer
[1] add fresh expensive luxury wine
[2] add processed artificial candy


// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
//  PARAMETERS
// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

// Nutriscore (Key transposition)
[0] add beer nutriscore A   // Highest pitch
[1] add beer nutriscore B
[2] add beer nutriscore C
[3] add beer nutriscore D
[4] add beer nutriscore E   // Lowest pitch

// Shelflife (Repetition rate)
[0] add chips shelflife today   // Very fast repeats
[1] add chips shelflife week    // Fast repeats
[2] add chips shelflife month   // Medium repeats
[3] add chips shelflife year    // Slow repeats
[4] add chips shelflife forever // Sustained/drone

// Open (Random triggering)
[0] add salad open          // ~60% chance to trigger each beat

// Escalator (Arpeggiator) - Patterns
[0] add wine escalator up       // Notes go up
[1] add wine escalator down     // Notes go down
[2] add wine escalator bounce   // Up then down
[3] add wine escalator zigzag   // Alternating
[4] add wine escalator express  // Skip notes
[5] add wine escalator checkout // Random order

// Escalator - Speeds
[0] add ham escalator up slow
[1] add ham escalator up normal
[2] add ham escalator up fast
[3] add ham escalator up rush
[4] add ham escalator up broken // Glitchy timing

// Volume (per-product volume control)
[0] add beer volume max     // Maximum volume (100%)
[1] add beer volume loud    // High volume (~85%)
[2] add beer volume soft    // Low volume (~50%)
[3] add beer volume quiet   // Very low (~35%)
[4] add beer volume whisper // Barely audible (~25%)
[5] add beer volume mute    // Silent
[6] add beer volume 75      // Numeric (0-100)

// Combined parameters
[0] add fresh wine escalator bounce fast nutriscore A
[1] add cheap chips shelflife week open volume soft


// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
//  CART WHEELS (Drum Patterns)
// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

// Original wheels
my cart has square wheels   // Basic 4/4 beat
my cart has broken wheels   // Glitchy irregular rhythm
my cart has premium wheels  // Smooth swing rhythm
my cart has defective wheels // Chaotic polyrhythm
my cart has bargain wheels  // Simple minimal beat
my cart has luxury wheels   // Complex jazz rhythm

// Electronic/Techno wheels
my cart has heavy wheels    // Kick-heavy techno (4-on-floor)
my cart has chrome wheels   // Crisp digital, metallic hi-hats
my cart has turbo wheels    // Fast breakbeat/drum'n'bass
my cart has plastic wheels  // Synthetic artificial drums

// Groove wheels
my cart has wobbly wheels   // Dubstep-like wobble bass
my cart has squeaky wheels  // Hi-hat focused, shuffle
my cart has rubber wheels   // Bouncy elastic funk
my cart has smooth wheels   // Liquid drum'n'bass flow

// Character wheels
my cart has rusty wheels    // Industrial metallic percussion
my cart has vintage wheels  // Classic 808/909 patterns
my cart has stolen wheels   // Erratic changing patterns
my cart has golden wheels   // Luxurious trap hi-hats

// Stop drums
my cart has no wheels


// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
//  MODES (Global Effects)
// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

discount mode on            // Random detuning
discount mode off

inflation mode on           // Gradual pitch increase
inflation mode off

consumerism mode on         // Echo/delay effects
consumerism mode off

black_friday mode on        // Chaotic distortion
black_friday mode off

aisle_7 mode on             // Mysterious reverb
aisle_7 mode off

fluorescent_lights mode on  // Flickering tremolo
fluorescent_lights mode off

apocalypse mode on          // Everything goes crazy
apocalypse mode off


// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
//  BREAKS & RESPIRATION
// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

checkout line               // 5s pause, fade to silence
intermission                // 3s brief pause
coffee break                // Quick 2s fade out/in
smoke break                 // Quick 2s fade out/in

lunch break                 // Stop drums, soften music
lunch break off             // Resume full energy

store closing               // Everything slowly fades
cleanup time                // Only one product remains


// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
//  TRANSITIONS
// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

conveyor belt               // Products fade in/out sequence
conveyor belt fast
conveyor belt slow

sliding doors               // Stereo pan sweep

elevator music              // Heavy lowpass filter
muzak                       // Same as elevator music

smooth transition           // Crossfade between groups
crossfade

fade to silence             // Master volume to zero
fade to soft                // Master volume to low
fade to full                // Master volume to max

morph to wine               // Transform all to target


// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
//  STORE FEATURES
// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

// Seasons (visual themes + audio effects)
season halloween            // Spooky tremolo
season christmas            // Festive reverb
season summer               // Bright chorus
season winter               // Cold crisp delay
season easter               // Bouncy vibrato
season valentines           // Romantic phaser
season normal               // Reset to default

// Rush hour
rush hour                   // Tempo increases, chaos builds
rush hour off               // Return to normal

// Announcements (PA system)
announcement cleanup
announcement closing
announcement sale
announcement fresh
announcement security
announcement Hello shoppers!

// Coupons
coupon BOGO                 // Duplicate all products
coupon 50OFF                // Half speed everything
coupon FREESHIP             // Spacious reverb
coupon VIP                  // Premium effects

// Product decay system
decay on                    // Products gradually expire
decay off                   // Stop decay
preserve beer               // Protect from decay
spoil all                   // Instantly rot everything


// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
//  PRODUCT COMBOS (Auto-detected when enabled)
// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

// Friday Night (party mode)
[0] add beer
[1] add chips

// Morning Routine (gentle wake-up)
[0] add milk
[1] add cereal

// Sophisticated Jazz (smooth ambience)
[0] add wine
[1] add cheese

// Lunch Break (midday energy)
[0] add bread
[1] add ham

// Sugar Rush (maximum chaos)
[0] add energy_drink
[1] add candy

// Health Conscious (calm zen)
[0] add oil
[1] add salad


// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
//  OTHER COMMANDS
// ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

[0] remove                  // Remove slot 0
remove all                  // Clear all slots

story mode                  // Start guided tutorial

scan 12345                  // Generate pattern from barcode


// ═══════════════════════════════════════════════════════════════
//  EXAMPLE COMPOSITIONS
// ═══════════════════════════════════════════════════════════════

// --- Chill Lo-fi Beat ---
// [0] add cheap old coffee
// [1] add processed milk shelflife week
// my cart has smooth wheels
// discount mode on

// --- Techno Warehouse ---
// [0] add industrial ham
// [1] add cheap chips escalator up fast
// [2] add mass-produced energy_drink
// my cart has heavy wheels
// black_friday mode on

// --- Ambient Drone ---
// [0] add luxury wine shelflife forever
// [1] add expensive oil shelflife forever
// [2] add artificial butter shelflife year
// my cart has no wheels
// aisle_7 mode on

// --- Glitch Chaos ---
// [0] add vomit beer open
// [1] add cheap old candy escalator broken rush
// my cart has stolen wheels
// apocalypse mode on
`;

// Tab 2 - "Midnight Mall" - A complete driving electronic composition
const TAB2_MIDNIGHT_MALL = `// ═══════════════════════════════════════════════════════════════
//  MIDNIGHT MALL - A driving electronic composition
//  Press Ctrl+Shift+Enter to run all lines
// ═══════════════════════════════════════════════════════════════

// === BASS FOUNDATION ===
[0] add industrial ham shelflife month volume loud
[1] add cheap oil shelflife year nutriscore D

// === MELODIC LAYERS ===
[2] add expensive wine shelflife year nutriscore B volume soft
[3] add fresh beer escalator up normal nutriscore A
[4] add artisanal coffee shelflife month

// === HARMONIC PADS ===
[5] add luxury cheese shelflife forever volume quiet
[6] add processed pasta shelflife year nutriscore C

// === TEXTURAL ELEMENTS ===
[7] add mass-produced chips escalator zigzag fast volume soft
[8] add bargain candy shelflife week
[9] add artificial rice escalator bounce normal volume whisper

// === RHYTHM SECTION ===
my cart has heavy wheels

// === ATMOSPHERE ===
consumerism mode on
`;

// Tab 3 - "Empty Aisles" - An ambient/experimental soundscape
const TAB3_EMPTY_AISLES = `// ═══════════════════════════════════════════════════════════════
//  EMPTY AISLES - Ambient soundscape for late night contemplation
//  Press Ctrl+Shift+Enter to run all lines
// ═══════════════════════════════════════════════════════════════

// === DEEP DRONES ===
[0] add luxury butter shelflife forever nutriscore E volume soft
[1] add expensive oil shelflife forever nutriscore D volume quiet

// === FLOATING PADS ===
[2] add glass wine shelflife forever nutriscore C volume soft
[3] add luxury cheese shelflife year volume quiet
[4] add expensive pasta shelflife year nutriscore B volume whisper

// === ETHEREAL TEXTURES ===
[5] add addictive eggs shelflife year nutriscore A volume quiet
[6] add artisanal bread shelflife month volume soft
[7] add overpriced chocolate shelflife year volume whisper

// === SPARSE MELODIC HINTS ===
[8] add bargain coffee shelflife month open volume quiet
[9] add glass salad shelflife week open volume whisper

// === MINIMAL RHYTHM (optional - comment out for pure drone) ===
my cart has wobbly wheels

// === DEEP ATMOSPHERE ===
aisle_7 mode on
discount mode on
`;

// Tab 4 - "Black Friday Chaos" - Intense industrial mayhem
const TAB4_BLACK_FRIDAY = `// ═══════════════════════════════════════════════════════════════
//  BLACK FRIDAY CHAOS - Industrial mayhem and consumer frenzy
//  Press Ctrl+Shift+Enter to run all lines
// ═══════════════════════════════════════════════════════════════

// === AGGRESSIVE BASS ===
[0] add industrial ham shelflife week nutriscore E volume max
[1] add vomit soda shelflife week volume loud

// === DISTORTED LEADS ===
[2] add mass-produced beer escalator express rush
[3] add cheap pizza shelflife today nutriscore D
[4] add industrial energy_drink escalator zigzag fast

// === CHAOTIC TEXTURES ===
[5] add vomit chips escalator broken rush open
[6] add cheap candy shelflife today escalator express rush
[7] add mass-produced cereal open

// === NOISE ELEMENTS ===
[8] add industrial rice shelflife today volume loud
[9] add vomit salad escalator broken rush open volume soft

// === RELENTLESS DRUMS ===
my cart has turbo wheels

// === FULL CHAOS MODE ===
black_friday mode on
apocalypse mode on
`;

// Tab 5 - "Lo-Fi Grocery" - Chill beats to shop to
const TAB5_LOFI_GROCERY = `// ═══════════════════════════════════════════════════════════════
//  LO-FI GROCERY - Chill beats to shop to
//  Press Ctrl+Shift+Enter to run all lines
// ═══════════════════════════════════════════════════════════════

// === WARM BASS ===
[0] add cheap ham shelflife month nutriscore C volume soft
[1] add processed butter shelflife year volume quiet

// === DUSTY KEYS ===
[2] add cheap coffee shelflife month nutriscore B
[3] add mass-produced beer shelflife month nutriscore A volume soft
[4] add bargain wine shelflife year

// === VINYL CRACKLE TEXTURES ===
[5] add cheap eggs shelflife week volume quiet
[6] add mass-produced bread shelflife month volume whisper

// === SUBTLE MELODIES ===
[7] add bargain chocolate escalator up slow volume soft
[8] add cheap pasta shelflife year volume quiet

// === SOFT PERCUSSION ===
[9] add mass-produced rice shelflife month open volume whisper

// === LAID BACK GROOVE ===
my cart has smooth wheels

// === NOSTALGIC WARMTH ===
discount mode on
`;


// Editor tabs manager
window.editorTabs = {
  activeTab: 0,
  content: {},
  tabNames: {},
  storageKey: 'supermarket_editor_tabs',

  init: function() {
    // Load saved content from localStorage
    this.loadFromStorage();

    // Set intro content (always reset)
    this.content[0] = INTRO_CONTENT;

    // Set Tab 1 to comprehensive examples (always reset)
    this.content[1] = TAB1_EXAMPLES;
    this.tabNames[1] = 'Reference';

    // Set default compositions for tabs 2-5 (only if empty/never customized)
    const defaultCompositions = {
      2: { content: TAB2_MIDNIGHT_MALL, name: 'Midnight Mall' },
      3: { content: TAB3_EMPTY_AISLES, name: 'Empty Aisles' },
      4: { content: TAB4_BLACK_FRIDAY, name: 'Black Friday' },
      5: { content: TAB5_LOFI_GROCERY, name: 'Lo-Fi Grocery' }
    };

    // Initialize tabs with default compositions or empty
    for (let i = 2; i <= 9; i++) {
      if (!this.content[i]) {
        // Use default composition if available, otherwise empty
        this.content[i] = defaultCompositions[i]?.content || '';
      }
      if (!this.tabNames[i]) {
        // Use default name if available, otherwise Tab N
        this.tabNames[i] = defaultCompositions[i]?.name || ('Tab ' + i);
      }
    }

    // Set up tab click and double-click handlers
    const tabs = document.querySelectorAll('.editor-tab');
    tabs.forEach(tab => {
      const tabIndex = parseInt(tab.dataset.tab);

      // Single click to switch
      tab.addEventListener('click', (e) => {
        // Don't switch if clicking on input
        if (e.target.tagName === 'INPUT') return;
        this.switchTab(tabIndex);
      });

      // Double click to rename (except Intro tab)
      if (tabIndex > 0) {
        tab.addEventListener('dblclick', (e) => {
          e.preventDefault();
          this.startRenaming(tabIndex, tab);
        });
      }
    });

    // Apply saved tab names
    this.applyTabNames();

    // Load active tab from storage or default to 0
    const savedData = localStorage.getItem(this.storageKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        this.activeTab = parsed.activeTab || 0;
      } catch (e) {
        this.activeTab = 0;
      }
    }

    // Update tab UI and load content
    this.updateTabUI();
    const editor = document.getElementById('editor');
    if (editor) {
      editor.value = this.content[this.activeTab] || '';
      // Refresh syntax highlighting after loading content
      setTimeout(() => {
        if (window.refreshSyntaxHighlight) {
          window.refreshSyntaxHighlight();
        }
      }, 250);
    }

    // Auto-save on input
    if (editor) {
      editor.addEventListener('input', () => {
        this.content[this.activeTab] = editor.value;
        this.saveToStorage();
      });
    }

    // Save before page unload
    window.addEventListener('beforeunload', () => {
      this.saveToStorage();
    });

    console.log('Editor tabs initialized');
  },

  switchTab: function(tabIndex) {
    const editor = document.getElementById('editor');
    if (!editor) return;

    // Save current tab content
    this.content[this.activeTab] = editor.value;

    // Switch to new tab
    this.activeTab = tabIndex;

    // Load new tab content
    editor.value = this.content[tabIndex] || '';

    // Update tab UI
    this.updateTabUI();

    // Save to storage
    this.saveToStorage();

    // Refresh syntax highlighting
    if (window.refreshSyntaxHighlight) {
      window.refreshSyntaxHighlight();
    }

    // Focus editor
    editor.focus();
  },

  updateTabUI: function() {
    const tabs = document.querySelectorAll('.editor-tab');
    tabs.forEach(tab => {
      const tabIndex = parseInt(tab.dataset.tab);
      tab.classList.toggle('active', tabIndex === this.activeTab);
    });
  },

  applyTabNames: function() {
    const tabs = document.querySelectorAll('.editor-tab');
    tabs.forEach(tab => {
      const tabIndex = parseInt(tab.dataset.tab);
      if (tabIndex > 0 && this.tabNames[tabIndex]) {
        tab.textContent = this.tabNames[tabIndex];
      }
    });
  },

  startRenaming: function(tabIndex, tabElement) {
    const currentName = this.tabNames[tabIndex] || 'Tab ' + tabIndex;

    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'editor-tab-input';
    input.value = currentName;
    input.maxLength = 12;

    // Replace tab content with input
    tabElement.textContent = '';
    tabElement.appendChild(input);
    input.focus();
    input.select();

    const finishRenaming = () => {
      const newName = input.value.trim() || 'Tab ' + tabIndex;
      this.tabNames[tabIndex] = newName;
      tabElement.textContent = newName;
      this.saveToStorage();
    };

    input.addEventListener('blur', finishRenaming);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        input.blur();
      } else if (e.key === 'Escape') {
        input.value = currentName;
        input.blur();
      }
    });
  },

  saveToStorage: function() {
    // Only save tabs 2-9 (not intro or reference)
    const dataToSave = {
      activeTab: this.activeTab,
      tabs: {},
      tabNames: {}
    };

    for (let i = 2; i <= 9; i++) {
      dataToSave.tabs[i] = this.content[i] || '';
      dataToSave.tabNames[i] = this.tabNames[i] || 'Tab ' + i;
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Failed to save editor tabs to localStorage:', e);
    }
  },

  loadFromStorage: function() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.tabs) {
          // Only load tabs 2-9 (0=intro and 1=reference are always reset)
          for (let i = 2; i <= 9; i++) {
            this.content[i] = parsed.tabs[i] || '';
          }
        }
        if (parsed.tabNames) {
          // Only load tab names for tabs 2-9 (tab 1 is always 'Reference')
          for (let i = 2; i <= 9; i++) {
            this.tabNames[i] = parsed.tabNames[i] || 'Tab ' + i;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load editor tabs from localStorage:', e);
    }
  }
};

// Main UI handlers module functionality
window.uiHandlers = {
  // Store DOM elements
  elements: {
    editor: document.getElementById("editor"),
    output: document.getElementById("output"),
    runAllBtn: document.getElementById("run-all"),
    runLineBtn: document.getElementById("run-line"),
    stopBtn: document.getElementById("stop"),
    clearBtn: document.getElementById("clear-all"),
    randomizeBtn: document.getElementById("randomize")
  },
  
  // Initialize UI handlers
  init: function() {
    // Locate UI elements first
    this.locateElements();

    // Initialize UI components
    this.setupEventListeners();

    // Initialize editor tabs (must be before reference tabs)
    if (window.editorTabs && window.editorTabs.init) {
      window.editorTabs.init();
    }

    // Initialize reference panel tab functionality
    this.initializeTabs();

    // Initialize clickable reference items
    this.initializeClickableItems();

    // Initialize drag and drop
    this.initializeDragAndDrop();
    
    // Initialize About modal
    this.initializeAboutModal();

    // Initialize visualization panel tabs
    this.initializeVizTabs();

    // Initialize theme selector
    this.initializeThemeSelector();

    // Initialize recording buttons
    this.initializeRecording();

    // Initialize auto-combos toggle
    this.initializeAutoCombosToggle();

    // Initialize popup messages toggle
    this.initializePopupToggle();

    // Initialize cart wheels visualizer
    this.initializeCartVisualizer();

    // Log initial messages
    window.log("Welcome to Rayon - Audio Live Coding");
    window.log("The system is ready for your commands...");
    window.log("TIP: Use Ctrl+Enter to execute current line, Ctrl+Shift+Enter to execute all");
  },
  
  // Locate UI elements (in case they weren't found during initial load)
  locateElements: function() {
    this.elements = {
      editor: document.getElementById("editor"),
      output: document.getElementById("output"),
      runAllBtn: document.getElementById("run-all"),
      runLineBtn: document.getElementById("run-line"),
      stopBtn: document.getElementById("stop"),
      clearBtn: document.getElementById("clear-all"),
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

    if (this.elements.clearBtn) {
      this.elements.clearBtn.addEventListener("click", this.handleClear.bind(this));
    } else {
      console.warn("Clear button not found");
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
        if (window.commandParser && window.commandParser.executeCommandWithTracking) {
          window.commandParser.executeCommandWithTracking(line);
          
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
          if (window.commandParser && window.commandParser.executeCommandWithTracking) {
            await new Promise(resolve => setTimeout(resolve, 100)); // Add a small delay between commands
            window.commandParser.executeCommandWithTracking(line);
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

      // Hide cart wheels visualizer
      if (window.updateCartVisualizer) {
        window.updateCartVisualizer('none');
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

  // Clear all products from slots
  handleClear: function(event) {
    try {
      // Remove all products using the product manager
      if (window.productManager && window.productManager.removeAll) {
        window.productManager.removeAll();
      }

      // Also clear any pending changes
      if (window.state && window.state.pendingChanges) {
        window.state.pendingChanges = {};
      }

      // Clear the visualization container completely
      const synthsContainer = document.getElementById('active-synths');
      if (synthsContainer) {
        synthsContainer.innerHTML = '';
      }

      // Clear visualization references
      if (window.visualization && window.visualization.visualizers) {
        window.visualization.visualizers = {};
      }

      // Visual feedback
      if (window.uiEffects && window.uiEffects.flashSuccess) {
        window.uiEffects.flashSuccess(this.elements.clearBtn);
      }
    } catch (error) {
      console.error("Error clearing products:", error);
      window.log("Error clearing products. Check console for details.");
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

      // Refresh syntax highlighting
      if (window.refreshSyntaxHighlight) {
        window.refreshSyntaxHighlight();
      }

      // Execute the command
      if (window.commandParser && window.commandParser.executeCommandWithTracking) {
        window.commandParser.executeCommandWithTracking(randomCommand);
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
    // Let autocomplete handle events first if visible
    if (window.autocomplete && window.autocomplete.isVisible()) {
      // Autocomplete handles Tab, Enter (without Ctrl), Escape, and Arrow keys
      if (['Tab', 'Escape', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        return; // Autocomplete's onKeyDown will handle it
      }
      if (event.key === 'Enter' && !event.ctrlKey && !event.shiftKey) {
        return; // Autocomplete handles plain Enter
      }
    }

    // Ctrl+Enter - smart behavior:
    // - On empty line: insert [next slot] add
    // - On non-empty line: execute current line
    if (event.ctrlKey && event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const currentLine = this.getCurrentLine();
      console.log("Ctrl+Enter pressed, current line:", JSON.stringify(currentLine));
      if (currentLine.trim() === '') {
        console.log("Empty line, inserting next slot add");
        this.insertNextSlotAdd();
      } else {
        console.log("Non-empty line, executing");
        this.handleRunLine();
      }
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
  
  // Insert [next available slot] add at cursor position
  insertNextSlotAdd: function() {
    console.log("insertNextSlotAdd called");

    if (!this.elements.editor) {
      this.locateElements();
      if (!this.elements.editor) {
        console.log("Editor not found!");
        return;
      }
    }

    // Find the next available slot (0-9)
    const usedSlots = new Set();
    if (window.state && window.state.slots) {
      Object.keys(window.state.slots).forEach(slot => {
        if (window.state.slots[slot]) {
          usedSlots.add(slot);
        }
      });
    }
    console.log("Used slots:", Array.from(usedSlots));

    // Find first available slot
    let nextSlot = null;
    for (let i = 0; i <= 9; i++) {
      if (!usedSlots.has(String(i))) {
        nextSlot = i;
        break;
      }
    }
    console.log("Next available slot:", nextSlot);

    if (nextSlot === null) {
      window.log("All slots [0-9] are in use! Remove a product first.");
      return;
    }

    // Insert text at cursor
    const editor = this.elements.editor;
    const cursorPos = editor.selectionStart;
    const text = editor.value;

    // Find line boundaries
    const lineStart = text.lastIndexOf('\n', cursorPos - 1) + 1;
    const lineEnd = text.indexOf('\n', cursorPos);
    const actualLineEnd = lineEnd > -1 ? lineEnd : text.length;

    // Build the insert text
    const insertText = `[${nextSlot}] add `;
    console.log("Inserting:", insertText);

    // Replace current line content (if empty) or insert at cursor
    const before = text.substring(0, lineStart);
    const after = text.substring(actualLineEnd);

    editor.value = before + insertText + after;

    // Position cursor after "add "
    const newCursorPos = lineStart + insertText.length;
    editor.selectionStart = newCursorPos;
    editor.selectionEnd = newCursorPos;
    editor.focus();

    // Refresh syntax highlighting
    if (window.refreshSyntaxHighlight) {
      window.refreshSyntaxHighlight();
    }

    // Trigger autocomplete to show suggestions
    if (window.autocomplete) {
      setTimeout(() => window.autocomplete.updateSuggestions(), 50);
    }

    console.log("Insert complete, editor value:", editor.value);
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
  },

  // Initialize About modal
  initializeAboutModal: function() {
    const aboutBtn = document.getElementById('about-btn');
    const aboutModal = document.getElementById('about-modal');
    const closeAbout = document.getElementById('close-about');

    if (aboutBtn && aboutModal) {
      aboutBtn.addEventListener('click', () => {
        aboutModal.style.display = 'flex';
      });

      if (closeAbout) {
        closeAbout.addEventListener('click', () => {
          aboutModal.style.display = 'none';
        });
      }

      // Close on overlay click
      aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
          aboutModal.style.display = 'none';
        }
      });

      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && aboutModal.style.display === 'flex') {
          aboutModal.style.display = 'none';
        }
      });
    }
  },

  // Initialize visualization panel tabs
  initializeVizTabs: function() {
    const vizTabs = document.querySelectorAll('.viz-tab');
    vizTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active from all tabs and panels
        vizTabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.viz-panel').forEach(p => p.classList.remove('active'));

        // Activate clicked tab and corresponding panel
        tab.classList.add('active');
        const panelId = 'viz-' + tab.dataset.vizTab + '-panel';
        const panel = document.getElementById(panelId);
        if (panel) panel.classList.add('active');
      });
    });
  },

  // Initialize theme selector
  initializeThemeSelector: function() {
    const themeBtns = document.querySelectorAll('.theme-btn');
    const savedTheme = localStorage.getItem('rayon_theme') || 'default';

    console.log('Theme selector init, found', themeBtns.length, 'buttons');

    // Apply saved theme on load
    if (savedTheme !== 'default') {
      document.documentElement.setAttribute('data-theme', savedTheme);
      document.body.setAttribute('data-theme', savedTheme);
    }

    // Update button active states
    themeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === savedTheme);
    });

    themeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const theme = btn.dataset.theme;
        console.log('Theme clicked:', theme);

        // Update active state
        themeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Apply theme to both html and body
        if (theme === 'default') {
          document.documentElement.removeAttribute('data-theme');
          document.body.removeAttribute('data-theme');
        } else {
          document.documentElement.setAttribute('data-theme', theme);
          document.body.setAttribute('data-theme', theme);
        }

        // Save preference
        localStorage.setItem('rayon_theme', theme);
        console.log('Theme applied:', theme);
      });
    });
  },

  // Initialize recording functionality
  initializeRecording: function() {
    this.audioRecorder = null;
    this.videoRecorder = null;
    this.recordedChunks = [];
    this.recordingStartTime = null;

    const audioBtn = document.getElementById('record-audio-btn');
    const videoBtn = document.getElementById('record-video-btn');
    const statusEl = document.getElementById('recording-status');

    if (audioBtn) {
      audioBtn.addEventListener('click', () => this.toggleAudioRecording(audioBtn, statusEl));
    }

    if (videoBtn) {
      videoBtn.addEventListener('click', () => this.toggleVideoRecording(videoBtn, statusEl));
    }
  },

  // Helper to download blob using data URL (works without server)
  downloadBlob: function(blob, filename, statusEl) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const a = document.createElement('a');
      a.href = reader.result;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      statusEl.textContent = 'Recording saved!';
      setTimeout(() => { statusEl.textContent = ''; }, 3000);
    };
    reader.onerror = () => {
      statusEl.textContent = 'Error saving file';
      console.error('FileReader error:', reader.error);
    };
    reader.readAsDataURL(blob);
  },

  toggleAudioRecording: async function(btn, statusEl) {
    if (this.audioRecorder && this.audioRecorder.state === 'recording') {
      // Stop recording
      this.audioRecorder.stop();
      btn.classList.remove('recording');
      btn.innerHTML = '<span class="record-icon">●</span> Record Audio';
      statusEl.textContent = 'Processing...';
      statusEl.classList.remove('active');
    } else {
      try {
        // Get audio from Tone.js destination
        const dest = Tone.getContext().createMediaStreamDestination();
        Tone.getDestination().connect(dest);

        this.recordedChunks = [];
        this.audioRecorder = new MediaRecorder(dest.stream, { mimeType: 'audio/webm' });

        this.audioRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) this.recordedChunks.push(e.data);
        };

        this.audioRecorder.onstop = () => {
          const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
          const filename = 'rayon-audio-' + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.webm';
          this.downloadBlob(blob, filename, statusEl);
        };

        this.audioRecorder.start(1000); // Collect data every second
        this.recordingStartTime = Date.now();
        btn.classList.add('recording');
        btn.innerHTML = '<span class="record-icon">●</span> Stop Recording';
        statusEl.textContent = 'Recording audio...';
        statusEl.classList.add('active');

        // Update timer
        this.updateRecordingTimer(statusEl, 'audio');
      } catch (err) {
        console.error('Audio recording error:', err);
        statusEl.textContent = 'Error: ' + err.message;
      }
    }
  },

  toggleVideoRecording: async function(btn, statusEl) {
    if (this.videoRecorder && this.videoRecorder.state === 'recording') {
      // Stop recording
      this.videoRecorder.stop();
      btn.classList.remove('recording');
      btn.innerHTML = '<span class="record-icon">●</span> Record Audio + Video';
      statusEl.textContent = 'Processing...';
      statusEl.classList.remove('active');
    } else {
      try {
        // Get screen capture with audio
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false
        });

        // Get audio from Tone.js
        const audioDest = Tone.getContext().createMediaStreamDestination();
        Tone.getDestination().connect(audioDest);

        // Combine streams
        const tracks = [...displayStream.getTracks(), ...audioDest.stream.getTracks()];
        const combinedStream = new MediaStream(tracks);

        this.recordedChunks = [];
        this.videoRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });

        this.videoRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) this.recordedChunks.push(e.data);
        };

        this.videoRecorder.onstop = () => {
          displayStream.getTracks().forEach(t => t.stop());
          const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
          const filename = 'rayon-video-' + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.webm';
          this.downloadBlob(blob, filename, statusEl);
        };

        // Handle user stopping screen share
        displayStream.getVideoTracks()[0].onended = () => {
          if (this.videoRecorder && this.videoRecorder.state === 'recording') {
            this.videoRecorder.stop();
            btn.classList.remove('recording');
            btn.innerHTML = '<span class="record-icon">●</span> Record Audio + Video';
          }
        };

        this.videoRecorder.start(1000); // Collect data every second
        this.recordingStartTime = Date.now();
        btn.classList.add('recording');
        btn.innerHTML = '<span class="record-icon">●</span> Stop Recording';
        statusEl.textContent = 'Recording video...';
        statusEl.classList.add('active');

        this.updateRecordingTimer(statusEl, 'video');
      } catch (err) {
        console.error('Video recording error:', err);
        if (err.name !== 'NotAllowedError') {
          statusEl.textContent = 'Error: ' + err.message;
        }
      }
    }
  },

  updateRecordingTimer: function(statusEl, type) {
    const update = () => {
      const recorder = type === 'audio' ? this.audioRecorder : this.videoRecorder;
      if (recorder && recorder.state === 'recording') {
        const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
        const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const secs = (elapsed % 60).toString().padStart(2, '0');
        statusEl.textContent = `Recording ${type}... ${mins}:${secs}`;
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  },

  // Initialize tab functionality
  initializeTabs: function() {
    const tabs = document.querySelectorAll('.ref-tab');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Show corresponding panel
        const tabName = tab.dataset.tab;
        const allTabs = ['products', 'modifiers', 'parameters', 'modes', 'cart', 'store', 'special', 'breaks', 'transitions', 'theft'];
        allTabs.forEach(name => {
          const panel = document.getElementById(`${name}-panel`);
          if (panel) {
            panel.classList.toggle('active', name === tabName);
          }
        });
      });
    });
  },
  
  // Initialize drag and drop for reference items
  initializeDragAndDrop: function() {
    const draggableItems = document.querySelectorAll('.ref-item.clickable');
    const editor = this.elements.editor;

    if (!editor) return;

    // Make all ref-items draggable
    draggableItems.forEach(item => {
      item.setAttribute('draggable', 'true');

      item.addEventListener('dragstart', (e) => {
        const command = item.dataset.insert;
        if (command) {
          e.dataTransfer.setData('text/plain', command);
          e.dataTransfer.effectAllowed = 'copy';
          item.classList.add('dragging');
        }
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });
    });

    // Editor drop zone
    editor.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      editor.classList.add('drag-over');
    });

    editor.addEventListener('dragleave', () => {
      editor.classList.remove('drag-over');
    });

    editor.addEventListener('drop', (e) => {
      e.preventDefault();
      editor.classList.remove('drag-over');

      const command = e.dataTransfer.getData('text/plain');
      if (!command) return;

      // Get drop position
      const dropPos = this.getCaretPositionFromPoint(editor, e.clientX, e.clientY);

      // Insert command at drop position
      const text = editor.value;
      const before = text.substring(0, dropPos);
      const after = text.substring(dropPos);

      // Add newline if dropping mid-line (not at start of line)
      const lastNewline = before.lastIndexOf('\n');
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
      const currentLineContent = before.substring(lineStart).trim();

      let insertText = command;
      if (currentLineContent.length > 0) {
        // There's content on the current line, add to new line
        insertText = '\n' + command;
      }

      editor.value = before + insertText + after;

      // Set cursor after inserted text
      const newPos = dropPos + insertText.length;
      editor.selectionStart = newPos;
      editor.selectionEnd = newPos;
      editor.focus();

      // Refresh syntax highlighting
      if (window.refreshSyntaxHighlight) {
        window.refreshSyntaxHighlight();
      }

      // Update tab content
      if (window.editorTabs) {
        window.editorTabs.content[window.editorTabs.activeTab] = editor.value;
        window.editorTabs.saveToStorage();
      }
    });

    console.log('Drag and drop initialized');
  },

  // Helper to estimate caret position from mouse coordinates
  getCaretPositionFromPoint: function(textarea, x, y) {
    // Get textarea position
    const rect = textarea.getBoundingClientRect();
    const style = window.getComputedStyle(textarea);
    const paddingLeft = parseFloat(style.paddingLeft);
    const paddingTop = parseFloat(style.paddingTop);
    const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
    const fontSize = parseFloat(style.fontSize);

    // Calculate relative position
    const relX = x - rect.left - paddingLeft + textarea.scrollLeft;
    const relY = y - rect.top - paddingTop + textarea.scrollTop;

    // Estimate line number
    const lineNum = Math.floor(relY / lineHeight);

    // Get lines
    const lines = textarea.value.split('\n');

    // Calculate character position
    let pos = 0;
    for (let i = 0; i < Math.min(lineNum, lines.length); i++) {
      pos += lines[i].length + 1; // +1 for newline
    }

    // Estimate character in line (rough approximation)
    if (lineNum < lines.length) {
      const charWidth = fontSize * 0.6; // Approximate for monospace
      const charInLine = Math.floor(relX / charWidth);
      pos += Math.min(charInLine, lines[lineNum].length);
    }

    return Math.max(0, Math.min(pos, textarea.value.length));
  },

  // Initialize auto-combos toggle
  initializeAutoCombosToggle: function() {
    const toggle = document.getElementById('auto-combos-toggle');
    if (!toggle) {
      console.warn('Auto-combos toggle not found');
      return;
    }

    // Load saved preference (default to enabled)
    const savedPref = localStorage.getItem('rayon_auto_combos');
    if (savedPref !== null) {
      toggle.checked = savedPref === 'true';
    }

    // Set global flag
    window.autoCombosEnabled = toggle.checked;

    // Handle toggle changes
    toggle.addEventListener('change', () => {
      window.autoCombosEnabled = toggle.checked;
      localStorage.setItem('rayon_auto_combos', toggle.checked.toString());

      if (toggle.checked) {
        window.log("Auto-detect combos enabled");
      } else {
        window.log("Auto-detect combos disabled");
        // Clear any active combo
        if (window.state.activeCombo) {
          window.state.activeCombo = null;
          document.body.classList.remove('party-mode');
        }
      }
    });

    console.log('Auto-combos toggle initialized, enabled:', window.autoCombosEnabled);
  },

  // Initialize popup messages toggle
  initializePopupToggle: function() {
    const toggle = document.getElementById('popup-messages-toggle');
    if (!toggle) {
      console.warn('Popup messages toggle not found');
      return;
    }

    // Load saved preference (default to enabled)
    const savedPref = localStorage.getItem('rayon_popup_messages');
    if (savedPref !== null) {
      toggle.checked = savedPref === 'true';
    }

    // Set global flag
    window.popupMessagesEnabled = toggle.checked;

    // Handle toggle changes
    toggle.addEventListener('change', () => {
      window.popupMessagesEnabled = toggle.checked;
      localStorage.setItem('rayon_popup_messages', toggle.checked.toString());
    });

    console.log('Popup messages toggle initialized, enabled:', window.popupMessagesEnabled);
  },

  // Initialize cart wheels visualizer
  initializeCartVisualizer: function() {
    const visualizer = document.getElementById('cart-wheels-visualizer');
    if (!visualizer) {
      console.warn('Cart wheels visualizer not found');
      return;
    }

    // Click handler to stop wheels
    visualizer.addEventListener('click', () => {
      visualizer.classList.add('stopping');

      // Stop the wheels
      if (window.cartWheels && window.cartWheels.setWheels) {
        window.cartWheels.setWheels('none');
      }

      // Hide after animation
      setTimeout(() => {
        visualizer.style.display = 'none';
        visualizer.classList.remove('stopping');
      }, 300);
    });

    // Expose update function globally
    window.updateCartVisualizer = this.updateCartVisualizer.bind(this);

    console.log('Cart wheels visualizer initialized');
  },

  // Update cart wheels visualizer display
  updateCartVisualizer: function(wheelType) {
    const visualizer = document.getElementById('cart-wheels-visualizer');
    const typeDisplay = document.getElementById('cart-wheel-type');

    if (!visualizer || !typeDisplay) return;

    if (!wheelType || wheelType === 'none') {
      // Hide visualizer with animation
      visualizer.classList.add('stopping');
      setTimeout(() => {
        visualizer.style.display = 'none';
        visualizer.classList.remove('stopping');
      }, 300);
      return;
    }

    // Determine wheel category for color coding
    const electronicWheels = ['heavy', 'chrome', 'turbo', 'plastic'];
    const grooveWheels = ['wobbly', 'squeaky', 'rubber', 'smooth'];
    const characterWheels = ['rusty', 'vintage', 'stolen', 'golden'];

    let category = 'original';
    if (electronicWheels.includes(wheelType)) {
      category = 'electronic';
    } else if (grooveWheels.includes(wheelType)) {
      category = 'groove';
    } else if (characterWheels.includes(wheelType)) {
      category = 'character';
    }

    // Update display
    typeDisplay.textContent = wheelType;
    visualizer.setAttribute('data-wheel-category', category);

    // Show visualizer
    visualizer.style.display = 'flex';
    visualizer.classList.remove('stopping');
  },

  // Initialize clickable reference items
  initializeClickableItems: function() {
    const clickableItems = document.querySelectorAll('.ref-item.clickable');

    clickableItems.forEach(item => {
      item.addEventListener('click', () => {
        // Get the command to insert
        const command = item.dataset.insert;
        const type = item.dataset.type; // product, modifier, parameter, mode, example
        if (!command) return;
        
        // Get the editor
        const editor = this.elements.editor;
        if (!editor) return;
        
        // Get current line context
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const currentValue = editor.value;
        const lines = currentValue.split('\n');
        
        // Find which line the cursor is on
        let lineStart = 0;
        let lineEnd = 0;
        let currentLineIndex = 0;
        let charCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
          lineStart = charCount;
          lineEnd = charCount + lines[i].length;
          if (start >= lineStart && start <= lineEnd) {
            currentLineIndex = i;
            break;
          }
          charCount += lines[i].length + 1; // +1 for newline
        }
        
        const currentLine = lines[currentLineIndex];
        const trimmedLine = currentLine.trim();
        
        // Smart insertion based on context
        let newLine = currentLine;
        let cursorOffset = 0;
        
        if (type === 'modifier' && trimmedLine.startsWith('add ')) {
          // Insert modifier after 'add' and before product
          const parts = trimmedLine.split(/\s+/);
          const productIndex = parts.findIndex((part, idx) => 
            idx > 0 && window.productTypes && window.productTypes[part]
          );
          
          if (productIndex > 0) {
            // Insert before product
            parts.splice(productIndex, 0, command);
            newLine = parts.join(' ');
          } else {
            // No product found, just append
            newLine = trimmedLine + ' ' + command;
          }
        } else if (type === 'parameter' && trimmedLine.startsWith('add ')) {
          // Add parameter at the end
          newLine = trimmedLine + ' ' + command;
          cursorOffset = newLine.length;
        } else if (type === 'cart' || type === 'store' || type === 'special') {
          // Replace entire line with full command
          newLine = command;
        } else if (trimmedLine === '' || type === 'example' || type === 'mode') {
          // Empty line or full command - just insert
          newLine = command;
        } else {
          // Default: new line
          lines.splice(currentLineIndex + 1, 0, command);
          editor.value = lines.join('\n');
          const newPosition = lineEnd + command.length + 1;
          editor.selectionStart = newPosition;
          editor.selectionEnd = newPosition;
          editor.focus();

          // Refresh syntax highlighting
          if (window.refreshSyntaxHighlight) {
            window.refreshSyntaxHighlight();
          }

          // Visual feedback
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.transform = '';
          }, 100);
          return;
        }
        
        // Update the current line
        lines[currentLineIndex] = newLine;
        editor.value = lines.join('\n');

        // Set cursor position
        const newPosition = lineStart + (cursorOffset || newLine.length);
        editor.selectionStart = newPosition;
        editor.selectionEnd = newPosition;

        // Focus the editor
        editor.focus();

        // Refresh syntax highlighting
        if (window.refreshSyntaxHighlight) {
          window.refreshSyntaxHighlight();
        }

        // Add a visual feedback effect
        item.style.transform = 'scale(0.95)';
        setTimeout(() => {
          item.style.transform = '';
        }, 100);
      });
    });
  }
};