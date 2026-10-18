// story-mode.js - Narrative campaign to discover all features

window.storyMode = {
  // Story state
  currentChapter: 0,
  currentStep: 0,
  storyActive: false,
  completedChapters: [],
  unlockedFeatures: [],

  // Tracking for validation
  tracking: {
    productsRemoved: 0,
    wheelTypesUsed: new Set(),
    storeLayoutOpened: false
  },
  
  // Story progression
  chapters: [
    {
      id: "awakening",
      title: "Chapter 1: The Awakening",
      description: "The abandoned supermarket stirs to life...",
      steps: [
        {
          text: "You enter an abandoned supermarket. The fluorescent lights flicker weakly. Something feels... alive here.",
          hint: "The shelves have 10 slots [0]-[9]. Try '[0] add beer' to fill slot 0.",
          goal: "[0] add beer",
          validate: () => Object.keys(window.state.products).length > 0,
          success: "The beer materializes in slot 0, humming with an otherworldly tone. The supermarket awakens!",
          unlocks: ["basic_products"]
        },
        {
          text: "The product calls out for companions. The shelves yearn to be filled.",
          hint: "Fill more slots! Try '[1] add chips' and '[2] add salad'.",
          goal: "add 3 products in different slots",
          validate: () => Object.keys(window.state.products).length >= 3,
          success: "The products harmonize together. The supermarket's soul is returning!",
          unlocks: ["remove_command"]
        },
        {
          text: "Sometimes products spoil or need to be cleared. You sense the power to remove them.",
          hint: "Try '[0] remove' to clear slot 0, or 'remove all' to clear everything.",
          goal: "remove any product",
          validate: () => window.storyMode.tracking.productsRemoved > 0,
          success: "You've learned to control the sonic inventory. But there's more to discover...",
          unlocks: ["modifiers_basic"]
        }
      ]
    },
    
    {
      id: "modifications",
      title: "Chapter 2: The Modifications",
      description: "Products can be more than they seem...",
      steps: [
        {
          text: "You notice labels on the shelves: 'fresh', 'old', 'cheap', 'expensive'. What do they mean?",
          hint: "Modifiers change how products sound. Try '[0] add fresh salad' or '[1] add old ham'.",
          goal: "add modified product",
          validate: () => {
            return Object.values(window.state.products).some(p =>
              Object.keys(p.modifiers || {}).length > 0
            );
          },
          success: "The modifier transforms the product! Fresh items sing higher, old ones groan lower...",
          unlocks: ["modifiers_advanced"]
        },
        {
          text: "Multiple modifiers can stack, creating complex sonic textures.",
          hint: "Try combining modifiers: '[0] add cheap old beer' or '[1] add expensive fresh wine'.",
          goal: "add double-modified product",
          validate: () => {
            return Object.values(window.state.products).some(p =>
              Object.keys(p.modifiers || {}).length >= 2
            );
          },
          success: "The modifiers blend and clash, creating rich harmonic chaos!",
          unlocks: ["cart_wheels"]
        }
      ]
    },
    
    {
      id: "rhythm",
      title: "Chapter 3: The Shopping Cart",
      description: "Your cart needs wheels to navigate this sonic space...",
      steps: [
        {
          text: "You find an old shopping cart. Its wheels are missing. Without rhythm, there is only chaos.",
          hint: "Give your cart wheels to create rhythm. Try 'my cart has square wheels'.",
          goal: "set cart wheels",
          validate: () => window.state.cart.wheels !== "none",
          success: "The cart rolls forward, its wheels creating a beat. The supermarket has a pulse!",
          unlocks: ["cart_variations"]
        },
        {
          text: "Different wheels create different rhythms. The cart yearns for experimentation.",
          hint: "Try different wheels: broken, premium, heavy, turbo, golden...",
          goal: "try 3 wheel types",
          validate: () => window.storyMode.tracking.wheelTypesUsed.size >= 3,
          success: "Each wheel tells a different story, drives a different groove!",
          unlocks: ["special_modes"]
        }
      ]
    },
    
    {
      id: "economics",
      title: "Chapter 4: The Economy",
      description: "The supermarket has its own economic reality...",
      steps: [
        {
          text: "You notice old sale tags. 'DISCOUNT', 'INFLATION'... Economic forces still linger here.",
          hint: "Activate economic modes. Try 'discount mode on' or 'inflation mode on'.",
          goal: "activate economic mode",
          validate: () => window.state.modes.discount || window.state.modes.inflation,
          success: "The prices flux, the products detune. Economics becomes music!",
          unlocks: ["black_friday", "consumerism_mode"]
        },
        {
          text: "A calendar on the wall shows different seasons. Each brings its own sonic atmosphere.",
          hint: "Change the season with 'season halloween' or 'season christmas'.",
          goal: "change season",
          validate: () => window.storeFeatures && window.storeFeatures.currentSeason !== 'normal',
          success: "The store transforms! Seasonal magic fills the aisles.",
          unlocks: ["rush_hour", "announcements"]
        }
      ]
    },
    
    {
      id: "chaos",
      title: "Chapter 5: The Chaos",
      description: "Not everything in this supermarket follows the rules...",
      steps: [
        {
          text: "Security cameras hang broken from the ceiling. No one's watching anymore...",
          hint: "What happens if you steal? Try 'shoplift beer' or 'steal chips'.",
          goal: "attempt theft",
          validate: () => window.shopliftingSystem && window.shopliftingSystem.stats.totalThefts > 0,
          success: "The product panics! Alarms wail! The supermarket has a dark side...",
          unlocks: ["security_levels", "chase_mode"]
        },
        {
          text: "Products are starting to decay. The supermarket's timeline is unstable.",
          hint: "Enable decay to see products expire over time. Try 'decay on'.",
          goal: "enable decay",
          validate: () => window.storeFeatures && window.storeFeatures.decay.active,
          success: "Time accelerates. Products age and spoil. Nothing lasts forever here.",
          unlocks: ["preservation", "coupons"]
        }
      ]
    },
    
    {
      id: "mapping",
      title: "Chapter 6: The Map",
      description: "The store layout holds musical secrets...",
      steps: [
        {
          text: "You find a store map. The layout itself could be an instrument.",
          hint: "First add some products, then open the store layout with 'store layout'.",
          goal: "open store layout with products",
          validate: () => {
            return window.storyMode.tracking.storeLayoutOpened &&
                   Object.keys(window.state.products || {}).length >= 2;
          },
          success: "The products appear on the map! Now let's make them play in sequence...",
          unlocks: ["map_compose"]
        },
        {
          text: "Map Compose mode turns the customer's path into a musical sequence.",
          hint: "Click 'MAP COMPOSE: OFF' button to turn it ON. Products will play in order!",
          goal: "activate map compose",
          validate: () => window.storeLayout && window.storeLayout.mapComposing.enabled,
          success: "Space becomes time! The sequence plays based on product positions!",
          unlocks: ["spatial_composition"]
        }
      ]
    },
    
    {
      id: "apocalypse",
      title: "Chapter 7: The Reckoning",
      description: "Push the supermarket to its limits...",
      steps: [
        {
          text: "You sense you can push things further. What happens at the edge of chaos?",
          hint: "Activate multiple modes at once. Try rush hour, black friday, and chase mode together!",
          goal: "create chaos",
          validate: () => {
            const chaosCount = [
              window.state.modes.black_friday,
              window.state.modes.apocalypse,
              window.storeFeatures?.rushHour?.active,
              window.shopliftingSystem?.security?.chaseMode
            ].filter(Boolean).length;
            return chaosCount >= 2;
          },
          success: "The supermarket convulses with sonic mayhem! You've unlocked its full potential!",
          unlocks: ["all_features", "sandbox_mode"]
        },
        {
          text: "You've discovered all the supermarket's secrets. Now, create your masterpiece.",
          hint: "Use everything you've learned. Create your ultimate sonic shopping experience!",
          goal: "freeplay",
          validate: () => true,
          success: "The supermarket is yours. Every product, every mode, every possibility awaits.",
          unlocks: ["story_complete"]
        }
      ]
    }
  ],
  
  // Initialize story mode
  init: function() {
    console.log("Initializing story mode...");
    
    // Load progress from localStorage
    this.loadProgress();
    
    // Create story UI
    this.createStoryUI();
  },
  
  // Start story mode
  start: function() {
    this.storyActive = true;
    this.currentChapter = 0;
    this.currentStep = 0;
    
    // Clear the store for fresh start
    if (window.state.products) {
      Object.keys(window.state.products).forEach(id => {
        if (window.productManager) {
          window.productManager.removeProductById(id);
        }
      });
    }
    
    // Reset modes
    Object.keys(window.state.modes).forEach(mode => {
      window.state.modes[mode] = false;
    });
    
    // Show first chapter
    this.showChapter(0);
    window.log("📖 STORY MODE BEGUN: The Abandoned Supermarket");
  },
  
  // Show current chapter/step
  showChapter: function(chapterIndex) {
    const chapter = this.chapters[chapterIndex];
    if (!chapter) return;
    
    const step = chapter.steps[this.currentStep];
    if (!step) {
      // Chapter complete, move to next
      this.completeChapter(chapterIndex);
      return;
    }
    
    // Display story text
    window.log(`\n📖 ${chapter.title}`);
    window.log(`📝 ${step.text}`);
    window.log(`💡 HINT: ${step.hint}`);
    
    // Update UI
    this.updateStoryUI(chapter, step);
    
    // Set up goal tracking
    this.currentGoal = step;
  },
  
  // Check if current goal is met
  checkGoal: function() {
    if (!this.storyActive || !this.currentGoal) return;
    
    console.log("Checking goal:", this.currentGoal.goal);
    console.log("Current modes state:", window.state.modes);
    console.log("Discount mode:", window.state.modes.discount);
    console.log("Inflation mode:", window.state.modes.inflation);
    console.log("Validation function:", this.currentGoal.validate.toString());
    
    const validationResult = this.currentGoal.validate();
    console.log("Validation result:", validationResult);
    
    if (validationResult) {
      // Goal achieved!
      window.log(`✅ ${this.currentGoal.success}`);
      
      // Unlock features
      if (this.currentGoal.unlocks) {
        this.currentGoal.unlocks.forEach(feature => {
          this.unlockedFeatures.push(feature);
          window.log(`🔓 Unlocked: ${feature}`);
        });
      }
      
      // Move to next step
      this.currentStep++;
      
      // Save progress
      this.saveProgress();
      
      // Show next step after delay
      setTimeout(() => {
        this.showChapter(this.currentChapter);
      }, 2000);
    }
  },
  
  // Complete chapter
  completeChapter: function(chapterIndex) {
    this.completedChapters.push(chapterIndex);
    window.log(`\n🎉 ${this.chapters[chapterIndex].title} COMPLETE!`);
    
    // Move to next chapter
    this.currentChapter++;
    this.currentStep = 0;
    
    if (this.currentChapter < this.chapters.length) {
      setTimeout(() => {
        this.showChapter(this.currentChapter);
      }, 3000);
    } else {
      // Story complete!
      this.completeStory();
    }
  },
  
  // Complete entire story
  completeStory: function() {
    window.log("\n🏆 STORY MODE COMPLETE! You've mastered the Sonic Supermarket!");
    window.log("🎵 All features unlocked. Create freely!");
    this.storyActive = false;
    
    // Show completion animation
    this.showCompletionAnimation();
  },
  
  // Create story UI overlay
  createStoryUI: function() {
    const storyUI = document.createElement('div');
    storyUI.id = 'story-ui';
    storyUI.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid #ffaa00;
      border-radius: 8px;
      padding: 15px;
      max-width: 300px;
      color: #fff;
      font-family: monospace;
      font-size: 12px;
      z-index: 1000;
      display: none;
    `;
    
    storyUI.innerHTML = `
      <div id="story-header" style="margin-bottom: 10px; color: #ffaa00; font-weight: bold;">
        📖 STORY MODE
      </div>
      <div id="story-chapter" style="margin-bottom: 5px; color: #ffaa00;"></div>
      <div id="story-progress" style="margin-bottom: 10px;">
        <div style="background: #333; height: 4px; border-radius: 2px;">
          <div id="progress-bar" style="background: #ffaa00; height: 100%; width: 0%; border-radius: 2px; transition: width 0.5s;"></div>
        </div>
      </div>
      <div id="story-text" style="margin-bottom: 10px; line-height: 1.4;"></div>
      <div id="story-hint" style="color: #88ff88; font-size: 11px; margin-bottom: 10px;"></div>
      <div id="story-goal" style="color: #ffaa00; font-size: 11px;"></div>
      <button id="skip-story" style="
        margin-top: 10px;
        background: #666;
        color: #fff;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-family: monospace;
        font-size: 11px;
      ">Skip Story Mode</button>
    `;
    
    document.body.appendChild(storyUI);
    
    // Skip button handler
    document.getElementById('skip-story').addEventListener('click', () => {
      if (confirm('Skip story mode and unlock all features?')) {
        this.skipStory();
      }
    });
  },
  
  // Update story UI
  updateStoryUI: function(chapter, step) {
    const ui = document.getElementById('story-ui');
    if (!ui) return;
    
    ui.style.display = 'block';
    
    document.getElementById('story-chapter').textContent = chapter.title;
    document.getElementById('story-text').textContent = step.text;
    document.getElementById('story-hint').textContent = `💡 ${step.hint}`;
    document.getElementById('story-goal').textContent = `📍 Goal: ${step.goal}`;
    
    // Update progress bar
    const totalSteps = this.chapters.reduce((sum, ch) => sum + ch.steps.length, 0);
    const currentProgress = this.chapters.slice(0, this.currentChapter).reduce((sum, ch) => sum + ch.steps.length, 0) + this.currentStep;
    const percentage = (currentProgress / totalSteps) * 100;
    document.getElementById('progress-bar').style.width = percentage + '%';
  },
  
  // Hide story UI
  hideStoryUI: function() {
    const ui = document.getElementById('story-ui');
    if (ui) ui.style.display = 'none';
  },
  
  // Skip story mode
  skipStory: function() {
    this.storyActive = false;
    this.unlockedFeatures = ['all_features'];
    this.completedChapters = this.chapters.map((_, i) => i);
    this.hideStoryUI();
    window.log("📖 Story mode skipped. All features unlocked!");
  },
  
  // Save progress
  saveProgress: function() {
    const progress = {
      currentChapter: this.currentChapter,
      currentStep: this.currentStep,
      completedChapters: this.completedChapters,
      unlockedFeatures: this.unlockedFeatures
    };
    localStorage.setItem('supermarket_story_progress', JSON.stringify(progress));
  },
  
  // Load progress
  loadProgress: function() {
    const saved = localStorage.getItem('supermarket_story_progress');
    if (saved) {
      const progress = JSON.parse(saved);
      this.currentChapter = progress.currentChapter || 0;
      this.currentStep = progress.currentStep || 0;
      this.completedChapters = progress.completedChapters || [];
      this.unlockedFeatures = progress.unlockedFeatures || [];
    }
  },
  
  // Show completion animation
  showCompletionAnimation: function() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 2000;
      color: #ffaa00;
      font-family: monospace;
      text-align: center;
    `;
    
    overlay.innerHTML = `
      <h1 style="font-size: 48px; margin-bottom: 20px; animation: pulse 2s infinite;">🏆</h1>
      <h2 style="font-size: 32px; margin-bottom: 20px;">STORY COMPLETE!</h2>
      <p style="font-size: 18px; margin-bottom: 30px;">You've mastered the Sonic Supermarket</p>
      <p style="font-size: 14px; color: #fff;">All features unlocked. The supermarket is yours.</p>
    `;
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 2s';
      setTimeout(() => overlay.remove(), 2000);
    }, 5000);
  },
  
  // Check if feature is unlocked
  isFeatureUnlocked: function(feature) {
    return this.unlockedFeatures.includes(feature) || 
           this.unlockedFeatures.includes('all_features');
  },
  
  // Get current hint
  getCurrentHint: function() {
    if (!this.storyActive || !this.currentGoal) return null;
    return this.currentGoal.hint;
  }
};