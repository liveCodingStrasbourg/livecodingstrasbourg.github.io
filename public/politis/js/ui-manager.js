const UIManager = {
  initPoliticians() {
    const grid = document.getElementById('politicians-grid');

    const overlay = grid.querySelector('.grid-overlay');
    grid.innerHTML = '';
    grid.appendChild(overlay);

    for (let i = 0; i < CONFIG.politicians.length; i++) {
      const politicianDiv = document.createElement('div');
      politicianDiv.className = 'politician-face';
      politicianDiv.id = `politician-${i}`;

      const nameDiv = document.createElement('div');
      nameDiv.className = 'name';
      nameDiv.textContent = CONFIG.politicians[i];

      const faceDiv = document.createElement('div');
      faceDiv.className = 'ascii-face';
      faceDiv.textContent = CONFIG.faces.idle[i];

      politicianDiv.appendChild(nameDiv);
      politicianDiv.appendChild(faceDiv);

      grid.appendChild(politicianDiv);
    }
  },

  updatePoliticianState(index, state, chaosModeActive = false) {
    const politicianDiv = document.getElementById(`politician-${index}`);

    if (!politicianDiv) return false;

    let faceState = state;
    if (chaosModeActive && state === 'screaming') {
      faceState = 'chaos';
    }

    if (state !== 'idle') {
      let responseArray;
      if (chaosModeActive && state === 'screaming') {
        responseArray = CONFIG.responses.chaos;
      } else {
        responseArray = CONFIG.responses[state] || [];
      }

      if (responseArray.length > 0) {
        const response = responseArray[Math.floor(Math.random() * responseArray.length)];
        const politicianName = CONFIG.politicians[index];

        this.addTerminalLine(`${politicianName}: \"${response}\"`, state === 'screaming');
      }
    }

    const faceDiv = politicianDiv.querySelector('.ascii-face');
    faceDiv.textContent = CONFIG.faces[faceState] ? CONFIG.faces[faceState][index] : CONFIG.faces.idle[index];

    if (state === 'idle') {
      politicianDiv.classList.remove('animate');
      politicianDiv.classList.remove('chaos-animate');

      const existingResponse = politicianDiv.querySelector('.response');
      if (existingResponse) {
        politicianDiv.removeChild(existingResponse);
      }
    } else {
      if (chaosModeActive && state === 'screaming') {
        politicianDiv.classList.add('animate', 'chaos-animate');
      } else {
        politicianDiv.classList.add('animate');
        politicianDiv.classList.remove('chaos-animate');
      }

      let responseDiv = politicianDiv.querySelector('.response');

      if (!responseDiv) {
        responseDiv = document.createElement('div');
        responseDiv.className = `response ${state}`;
        politicianDiv.appendChild(responseDiv);
      } else {
        responseDiv.className = `response ${state}`;
      }

      let responseArray;
      if (chaosModeActive && state === 'screaming') {
        responseArray = CONFIG.responses.chaos;
      } else {
        responseArray = CONFIG.responses[state] || [];
      }

      if (responseArray.length > 0) {
        const randomResponse = responseArray[Math.floor(Math.random() * responseArray.length)];
        responseDiv.innerHTML = randomResponse;
      }
    }

    return true;
  },

  addTerminalLine(text, isError = false) {
    const terminal = document.getElementById('terminal-box');
    const lineDiv = document.createElement('div');
    lineDiv.className = 'terminal-line';
    if (isError) lineDiv.classList.add('error');
    lineDiv.innerHTML = `> ${text}`;

    terminal.insertBefore(lineDiv, terminal.lastElementChild);

    while (terminal.children.length > 7) {
      terminal.removeChild(terminal.firstElementChild);
    }

    terminal.scrollTop = terminal.scrollHeight;
  },

  updateAudienceMetrics(metrics) {
    document.getElementById('outrage-value').textContent = `${metrics.outrage}%`;
    document.getElementById('support-value').textContent = `${metrics.support}%`;
    document.getElementById('skepticism-value').textContent = `${metrics.skepticism}%`;
    document.getElementById('engagement-value').textContent = `${metrics.engagement}%`;

    const outrageTrend = document.getElementById('outrage-value').nextElementSibling.nextElementSibling;
    outrageTrend.className = `stat-trend ${metrics.outrage > 50 ? 'trend-up' : 'trend-down'}`;
    outrageTrend.textContent = metrics.outrage > 50 ? '▲' : '▼';

    const supportTrend = document.getElementById('support-value').nextElementSibling.nextElementSibling;
    supportTrend.className = `stat-trend ${metrics.support > 40 ? 'trend-up' : 'trend-down'}`;
    supportTrend.textContent = metrics.support > 40 ? '▲' : '▼';

    const skepticismTrend = document.getElementById('skepticism-value').nextElementSibling.nextElementSibling;
    skepticismTrend.className = `stat-trend ${metrics.skepticism > 45 ? 'trend-up' : 'trend-down'}`;
    skepticismTrend.textContent = metrics.skepticism > 45 ? '▲' : '▼';

    const engagementTrend = document.getElementById('engagement-value').nextElementSibling.nextElementSibling;
    engagementTrend.className = `stat-trend ${metrics.engagement > 30 ? 'trend-up' : 'trend-down'}`;
    engagementTrend.textContent = metrics.engagement > 30 ? '▲' : '▼';
  },

  updateMetricBars(chaosModeActive = false, settings = null) {
    if (chaosModeActive) {
      document.querySelector('.metric:nth-child(1) .metric-value').style.width = '0%';
      document.querySelector('.metric:nth-child(2) .metric-value').style.width = '0%';
      const supportBarValue = settings ?
        settings.supportBarValue :
        CONFIG.chaosMode.publicSupportRange[0] +
          Math.random() * (CONFIG.chaosMode.publicSupportRange[1] - CONFIG.chaosMode.publicSupportRange[0]);

      document.querySelector('.metric:nth-child(3) .metric-value').style.width = `${supportBarValue}%`;
    } else {
      document.querySelector('.metric:nth-child(1) .metric-value').style.width = '23%';
      document.querySelector('.metric:nth-child(2) .metric-value').style.width = '17%';
      document.querySelector('.metric:nth-child(3) .metric-value').style.width = '65%';
    }
  },

  updateHashDisplay(hash, sequence) {
    const formattedHash = HashGenerator.formatHash(hash);
    document.getElementById('question-hash').textContent =
      `${CONFIG.interface.hashValueLabel} ${formattedHash}`;

    const melodyPreview = HashGenerator.generateMelodyPreview(sequence);
    document.getElementById('melody-preview').textContent =
      `${CONFIG.interface.melodyPreviewLabel} ${melodyPreview}`;
  },

  updateTime() {
    document.getElementById('system-time').textContent = new Date().toLocaleTimeString();
  },

  setupEventListeners(handlers) {
    document.getElementById('run-button').addEventListener('click', handlers.onQuestionSubmit);
    document.getElementById('custom-question-input').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        handlers.onQuestionSubmit();
      }
    });

    document.body.addEventListener('click', function() {
      AudioManager.init();
    });

    document.getElementById('audio-warning').style.display = 'block';
  },

  setOutputMessage(message) {
    document.getElementById('output').textContent = message;
  },

  setChaosMode(active) {
    if (active) {
      document.body.classList.add('chaos-mode');
      document.querySelector('.header-title').textContent = CONFIG.interface.chaos.title;
      document.querySelector('.system-warning').textContent = CONFIG.interface.chaos.warning;
      document.querySelector('.system-status').textContent = CONFIG.interface.chaos.unstable;
    } else {
      document.body.classList.remove('chaos-mode');
      document.querySelector('.header-title').textContent = CONFIG.interface.headerTitle;
      document.querySelector('.system-warning').textContent = CONFIG.interface.systemWarning;
      document.querySelector('.system-status').textContent = CONFIG.interface.systemStatus;
    }
  }
};
