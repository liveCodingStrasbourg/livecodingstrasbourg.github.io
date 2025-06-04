/**
 * WaveformRenderer.js - Complete Fixed Version
 * Sound Synthesis Explorer - TOPLAP Strasbourg
 */

class WaveformRenderer {
  constructor() {
    // Canvas management
    this.canvases = new Map();
    this.contexts = new Map();
    this.animationId = null;
    this.isAnimating = false;
    
    // Configuration de rendu
    this.width = 600;
    this.height = 300;
    this.sampleRate = 44100;
    this.bufferSize = 1024;
    
    // Analyseur de spectre
    this.analyser = null;
    this.dataArray = null;
    this.frequencyData = null;
    
    // Couleurs cyberpunk
    this.colors = {
      background: '#0a0a0a',
      grid: 'rgba(0, 255, 65, 0.2)',
      waveform: '#00ff41',
      spectrum: '#ff00ff',
      accent: '#00ffff',
      text: '#00ff41'
    };
    
    // Configuration des grilles
    this.gridConfig = {
      majorLines: 8,
      minorLines: 4,
      showLabels: true,
      lineWidth: 0.5
    };
    
    this.bindMethods();
    this.setupCanvases();
  }
  
  bindMethods() {
    this.setupCanvases = this.setupCanvases.bind(this);
    this.getCanvas = this.getCanvas.bind(this);
    this.clearCanvas = this.clearCanvas.bind(this);
    this.drawGrid = this.drawGrid.bind(this);
    this.initSpectrumAnalyzer = this.initSpectrumAnalyzer.bind(this);
    this.drawSpectrum = this.drawSpectrum.bind(this);
    this.drawFilterResponse = this.drawFilterResponse.bind(this);
    this.drawMiniWaveform = this.drawMiniWaveform.bind(this);
    this.drawMiniNoise = this.drawMiniNoise.bind(this);
  }
  
  /**
   * Configure tous les canvas trouvés dans le DOM
   */
  setupCanvases() {
    try {
      const canvasElements = document.querySelectorAll('canvas');
      
      canvasElements.forEach(canvas => {
        if (!canvas.id) {
          console.warn('[WaveformRenderer] Canvas without ID found');
          return;
        }
        
        const context = canvas.getContext('2d');
        if (!context) {
          console.error(`[WaveformRenderer] Failed to get context for ${canvas.id}`);
          return;
        }
        
        // Stocker les références
        this.canvases.set(canvas.id, canvas);
        this.contexts.set(canvas.id, context);
        
        // Configuration du canvas
        this.setupCanvas(canvas.id);
      });
      
      console.log(`[WaveformRenderer] Setup completed for ${this.canvases.size} canvases`);
      
    } catch (error) {
      console.error('[WaveformRenderer] Setup failed:', error);
    }
  }
  
  /**
   * Configure un canvas spécifique
   */
  setupCanvas(canvasId) {
    try {
      const canvas = this.canvases.get(canvasId);
      const context = this.contexts.get(canvasId);
      
      if (!canvas || !context) {
        console.warn(`[WaveformRenderer] Canvas ${canvasId} not found`);
        return false;
      }
      
      // Définir la taille réelle du canvas
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      // Mettre à l'échelle le contexte
      context.scale(dpr, dpr);
      
      // Styles par défaut
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.fillStyle = this.colors.background;
      context.strokeStyle = this.colors.waveform;
      
      // Effacer le canvas
      this.clearCanvas(canvasId);
      
      return true;
      
    } catch (error) {
      console.error(`[WaveformRenderer] Failed to setup canvas ${canvasId}:`, error);
      return false;
    }
  }
  
  /**
   * Obtient un canvas par ID
   */
  getCanvas(canvasId) {
    return {
      canvas: this.canvases.get(canvasId),
      context: this.contexts.get(canvasId)
    };
  }
  
  /**
   * Efface un canvas
   */
  clearCanvas(canvasId) {
    try {
      const { canvas, context } = this.getCanvas(canvasId);
      
      if (!context || !canvas) {
        return false;
      }
      
      context.fillStyle = this.colors.background;
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      return true;
      
    } catch (error) {
      console.error(`[WaveformRenderer] Failed to clear canvas ${canvasId}:`, error);
      return false;
    }
  }
  
  /**
   * Dessine une grille sur le canvas
   */
  drawGrid(canvasId, config = {}) {
    try {
      const { canvas, context } = this.getCanvas(canvasId);
      
      if (!context || !canvas) {
        return false;
      }
      
      const gridConf = { ...this.gridConfig, ...config };
      const width = canvas.width;
      const height = canvas.height;
      
      context.save();
      context.strokeStyle = this.colors.grid;
      context.lineWidth = gridConf.lineWidth;
      
      // Lignes verticales
      const vStep = width / gridConf.majorLines;
      for (let i = 0; i <= gridConf.majorLines; i++) {
        const x = i * vStep;
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      
      // Lignes horizontales
      const hStep = height / gridConf.majorLines;
      for (let i = 0; i <= gridConf.majorLines; i++) {
        const y = i * hStep;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }
      
      context.restore();
      return true;
      
    } catch (error) {
      console.error(`[WaveformRenderer] Failed to draw grid on ${canvasId}:`, error);
      return false;
    }
  }

  /**
   * Dessine une forme d'onde générée mathématiquement
   */
  drawWaveform(canvasId, type = 'sine', frequency = 440, amplitude = 0.8, phase = 0) {
    try {
      const { canvas, context } = this.getCanvas(canvasId);
      
      if (!context || !canvas) {
        return false;
      }
      
      this.clearCanvas(canvasId);
      this.drawGrid(canvasId);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      const cycles = 2; // Nombre de cycles à afficher
      
      context.save();
      context.strokeStyle = this.colors.waveform;
      context.lineWidth = 3;
      context.shadowColor = this.colors.waveform;
      context.shadowBlur = 10;
      
      context.beginPath();
      
      for (let x = 0; x < width; x++) {
        const t = (x / width) * cycles * 2 * Math.PI + phase;
        let y;
        
        switch (type) {
          case 'sine':
            y = Math.sin(t);
            break;
            
          case 'square':
            y = Math.sign(Math.sin(t));
            break;
            
          case 'sawtooth':
            y = (2 * (t / (2 * Math.PI) % 1)) - 1;
            break;
            
          case 'triangle':
            const saw = (2 * (t / (2 * Math.PI) % 1)) - 1;
            y = 2 * Math.abs(saw) - 1;
            break;
            
          case 'pulse':
            const duty = 0.5; // 50% duty cycle par défaut
            y = ((t / (2 * Math.PI)) % 1) < duty ? 1 : -1;
            break;
            
          default:
            y = Math.sin(t);
        }
        
        y = centerY - (y * amplitude * centerY * 0.8);
        
        if (x === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }
      
      context.stroke();
      context.restore();
      
      // Ajouter des labels
      this.drawWaveformLabels(canvasId, type, frequency, amplitude);
      
      return true;
      
    } catch (error) {
      console.error(`[WaveformRenderer] Failed to draw waveform:`, error);
      return false;
    }
  }
  
  /**
   * Dessine les labels d'une forme d'onde
   */
  drawWaveformLabels(canvasId, type, frequency, amplitude) {
    try {
      const { canvas, context } = this.getCanvas(canvasId);
      
      if (!context) {
        return false;
      }
      
      context.save();
      context.fillStyle = this.colors.text;
      context.font = '14px Courier New';
      context.shadowColor = this.colors.text;
      context.shadowBlur = 5;
      
      // Label du type de forme d'onde
      context.fillText(`${type.toUpperCase()}`, 10, 25);
      
      // Label de fréquence
      context.fillText(`${frequency.toFixed(1)} Hz`, 10, 45);
      
      // Label d'amplitude
      context.fillText(`Amp: ${(amplitude * 100).toFixed(0)}%`, 10, 65);
      
      context.restore();
      return true;
      
    } catch (error) {
      console.error(`[WaveformRenderer] Failed to draw labels:`, error);
      return false;
    }
  }
  
  /**
   * Dessine du bruit (noise)
   */
  drawNoise(canvasId, type = 'white', amplitude = 0.5) {
    try {
      const { canvas, context } = this.getCanvas(canvasId);
      
      if (!context || !canvas) {
        return false;
      }
      
      this.clearCanvas(canvasId);
      this.drawGrid(canvasId);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      
      context.save();
      context.strokeStyle = this.colors.waveform;
      context.lineWidth = 1;
      context.globalAlpha = 0.7;
      
      context.beginPath();
      
      // Générer du bruit selon le type
      for (let x = 0; x < width; x++) {
        let noiseValue;
        
        switch (type) {
          case 'white':
            noiseValue = (Math.random() - 0.5) * 2;
            break;
            
          case 'pink':
            // Approximation simple du bruit rose
            noiseValue = this.generatePinkNoise();
            break;
            
          case 'brown':
            // Approximation du bruit brun
            noiseValue = this.generateBrownNoise();
            break;
            
          default:
            noiseValue = (Math.random() - 0.5) * 2;
        }
        
        const y = centerY - (noiseValue * amplitude * centerY * 0.8);
        
        if (x === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }
      
      context.stroke();
      context.restore();
      
      // Labels
      this.drawNoiseLabels(canvasId, type, amplitude);
      
      return true;
      
    } catch (error) {
      console.error(`[WaveformRenderer] Failed to draw noise:`, error);
      return false;
    }
  }
  
  /**
   * Génère du bruit rose (approximation simple)
   */
  generatePinkNoise() {
    // Générateur de bruit rose simple
    if (!this.pinkNoiseState) {
      this.pinkNoiseState = {
        b0: 0, b1: 0, b2: 0, b3: 0, b4: 0, b5: 0, b6: 0
      };
    }
    
    const white = Math.random() - 0.5;
    this.pinkNoiseState.b0 = 0.99886 * this.pinkNoiseState.b0 + white * 0.0555179;
    this.pinkNoiseState.b1 = 0.99332 * this.pinkNoiseState.b1 + white * 0.0750759;
    this.pinkNoiseState.b2 = 0.96900 * this.pinkNoiseState.b2 + white * 0.1538520;
    this.pinkNoiseState.b3 = 0.86650 * this.pinkNoiseState.b3 + white * 0.3104856;
    this.pinkNoiseState.b4 = 0.55000 * this.pinkNoiseState.b4 + white * 0.5329522;
    this.pinkNoiseState.b5 = -0.7616 * this.pinkNoiseState.b5 - white * 0.0168980;
    
    const pink = this.pinkNoiseState.b0 + this.pinkNoiseState.b1 + this.pinkNoiseState.b2 + 
                 this.pinkNoiseState.b3 + this.pinkNoiseState.b4 + this.pinkNoiseState.b5 + 
                 this.pinkNoiseState.b6 + white * 0.5362;
    
    this.pinkNoiseState.b6 = white * 0.115926;
    
    return pink * 0.11;
  }
  
  /**
   * Génère du bruit brun (approximation simple)
   */
  generateBrownNoise() {
    if (!this.brownNoiseState) {
      this.brownNoiseState = { lastOut: 0 };
    }
    
    const white = Math.random() - 0.5;
    this.brownNoiseState.lastOut = (this.brownNoiseState.lastOut + (0.02 * white)) / 1.02;
    
    return this.brownNoiseState.lastOut * 3.5;
  }
  
  /**
   * Dessine les labels pour le bruit
   */
  drawNoiseLabels(canvasId, type, amplitude) {
    try {
      const { canvas, context } = this.getCanvas(canvasId);
      
      if (!context) {
        return false;
      }
      
      context.save();
      context.fillStyle = this.colors.text;
      context.font = '14px Courier New';
      context.shadowColor = this.colors.text;
      context.shadowBlur = 5;
      
      context.fillText(`${type.toUpperCase()} NOISE`, 10, 25);
      context.fillText(`Amp: ${(amplitude * 100).toFixed(0)}%`, 10, 45);
      
      context.restore();
      return true;
      
    } catch (error) {
      console.error(`[WaveformRenderer] Failed to draw noise labels:`, error);
      return false;
    }
  }

  /**
   * Initialise l'analyseur de spectre
   */
  initSpectrumAnalyzer() {
    try {
      if (!window.audioManager || !window.audioManager.masterGain) {
        console.warn('[WaveformRenderer] AudioManager not ready for spectrum analysis');
        return false;
      }
      
      this.analyser = new Tone.Analyser('fft', 1024);
      window.audioManager.masterGain.connect(this.analyser);
      
      this.frequencyData = new Uint8Array(this.analyser.size);
      
      console.log('[WaveformRenderer] Spectrum analyzer initialized');
      return true;
      
    } catch (error) {
      console.error('[WaveformRenderer] Failed to initialize spectrum analyzer:', error);
      return false;
    }
  }
  
  /**
   * Dessine le spectre de fréquences
   */
  drawSpectrum(canvasId) {
    try {
      if (!this.analyser) {
        this.initSpectrumAnalyzer();
        if (!this.analyser) return false;
      }
      
      const { canvas, context } = this.getCanvas(canvasId);
      if (!context || !canvas) return false;
      
      // Obtenir les données de fréquence
      const frequencyData = this.analyser.getValue();
      
      this.clearCanvas(canvasId);
      this.drawSpectrumGrid(canvasId);
      
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / frequencyData.length;
      
      context.save();
      
      // Gradient pour les barres
      const gradient = context.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, this.colors.spectrum);
      gradient.addColorStop(0.5, this.colors.accent);
      gradient.addColorStop(1, this.colors.waveform);
      
      context.fillStyle = gradient;
      context.shadowColor = this.colors.spectrum;
      context.shadowBlur = 3;
      
      // Dessiner les barres de spectre
      for (let i = 0; i < frequencyData.length; i++) {
        const value = (frequencyData[i] + 100) / 100; // Normaliser de -100dB à 0dB
        const barHeight = Math.max(0, value * height);
        
        const x = i * barWidth;
        const y = height - barHeight;
        
        context.fillRect(x, y, barWidth - 1, barHeight);
      }
      
      context.restore();
      return true;
      
    } catch (error) {
      console.error('[WaveformRenderer] Failed to draw spectrum:', error);
      return false;
    }
  }
  
  /**
   * Dessine la grille pour le spectre
   */
  drawSpectrumGrid(canvasId) {
    try {
      const { canvas, context } = this.getCanvas(canvasId);
      if (!context || !canvas) return false;
      
      const width = canvas.width;
      const height = canvas.height;
      
      context.save();
      context.strokeStyle = this.colors.grid;
      context.lineWidth = this.gridConfig.lineWidth;
      context.setLineDash([2, 2]);
      
      // Lignes horizontales (niveaux dB)
      for (let i = 0; i <= 8; i++) {
        const y = (i / 8) * height;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }
      
      // Lignes verticales (fréquences)
      for (let i = 0; i <= 10; i++) {
        const x = (i / 10) * width;
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      
      // Labels de fréquence
      context.fillStyle = this.colors.text;
      context.font = '10px Courier New';
      context.fillText('0Hz', 5, height - 5);
      context.fillText('22kHz', width - 40, height - 5);
      context.fillText('0dB', 5, 15);
      context.fillText('-100dB', 5, height - 20);
      
      context.restore();
      return true;
      
    } catch (error) {
      console.error('[WaveformRenderer] Failed to draw spectrum grid:', error);
      return false;
    }
  }

  /**
   * Dessine la réponse d'un filtre
   */
  drawFilterResponse(canvasId, cutoff = 1000, resonance = 1, type = 'lowpass') {
    try {
      const { canvas, context } = this.getCanvas(canvasId);
      if (!context || !canvas) return false;
      
      this.clearCanvas(canvasId);
      this.drawSpectrumGrid(canvasId);
      
      const width = canvas.width;
      const height = canvas.height;
      
      context.save();
      context.strokeStyle = this.colors.waveform;
      context.lineWidth = 3;
      context.shadowColor = this.colors.waveform;
      context.shadowBlur = 8;
      
      context.beginPath();
      
      // Calculer la réponse du filtre
      for (let x = 0; x < width; x++) {
        const frequency = (x / width) * 22050; // 0 à 22.05kHz
        const normalizedFreq = frequency / cutoff;
        
        let magnitude = 1;
        
        switch (type) {
          case 'lowpass':
            // Réponse passe-bas avec résonance
            const distance = Math.abs(normalizedFreq - 1);
            magnitude = 1 / (1 + Math.pow(normalizedFreq, 2));
            if (normalizedFreq > 0.7 && normalizedFreq < 1.3) {
              magnitude *= (1 + resonance * Math.exp(-distance * 5));
            }
            break;
            
          case 'highpass':
            magnitude = normalizedFreq / (1 + normalizedFreq);
            break;
            
          case 'bandpass':
            const bandCenter = 1;
            const bandWidth = 0.5;
            magnitude = 1 / (1 + Math.pow((normalizedFreq - bandCenter) / bandWidth, 2));
            break;
        }
        
        // Convertir en dB et normaliser pour l'affichage
        const magnitudeDB = 20 * Math.log10(Math.max(0.001, magnitude));
        const y = height - ((magnitudeDB + 60) / 60) * height; // -60dB à 0dB
        
        if (x === 0) {
          context.moveTo(x, Math.max(0, Math.min(height, y)));
        } else {
          context.lineTo(x, Math.max(0, Math.min(height, y)));
        }
      }
      
      context.stroke();
      
      // Marquer la fréquence de coupure
      const cutoffX = (cutoff / 22050) * width;
      context.strokeStyle = this.colors.accent;
      context.lineWidth = 2;
      context.setLineDash([5, 5]);
      context.beginPath();
      context.moveTo(cutoffX, 0);
      context.lineTo(cutoffX, height);
      context.stroke();
      
      // Labels
      context.fillStyle = this.colors.text;
      context.font = '12px Courier New';
      context.fillText(`Cutoff: ${cutoff}Hz`, cutoffX + 5, 20);
      context.fillText(`Q: ${resonance.toFixed(1)}`, cutoffX + 5, 35);
      
      context.restore();
      return true;
      
    } catch (error) {
      console.error('[WaveformRenderer] Failed to draw filter response:', error);
      return false;
    }
  }

  /**
   * Dessine une forme d'onde à partir de données audio temps réel
   */
  drawRealtimeWaveform(canvasId, audioData = null) {
    try {
      if (!audioData && window.audioManager) {
        audioData = window.audioManager.getAnalyserData();
      }
      
      if (!audioData) {
        return false;
      }
      
      const { canvas, context } = this.getCanvas(canvasId);
      
      if (!context || !canvas) {
        return false;
      }
      
      this.clearCanvas(canvasId);
      this.drawGrid(canvasId);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      
      context.save();
      context.strokeStyle = this.colors.waveform;
      context.lineWidth = 2;
      context.shadowColor = this.colors.waveform;
      context.shadowBlur = 8;
      
      context.beginPath();
      
      const dataLength = audioData.length;
      const sliceWidth = width / dataLength;
      
      for (let i = 0; i < dataLength; i++) {
        const x = i * sliceWidth;
        const sample = Array.isArray(audioData) ? audioData[i] : audioData[i];
        const y = centerY - (sample * centerY * 0.8);
        
        if (i === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }
      
      context.stroke();
      context.restore();
      
      return true;
      
    } catch (error) {
      console.error(`[WaveformRenderer] Failed to draw realtime waveform:`, error);
      return false;
    }
  }
  
  /**
   * Dessine un spectre de fréquences
   */
  drawSpectrum(canvasId, fftData = null, logScale = true) {
    try {
      if (!fftData && window.audioManager) {
        fftData = window.audioManager.getFFTData();
      }
      
      if (!fftData) {
        return false;
      }
      
      const { canvas, context } = this.getCanvas(canvasId);
      
      if (!context || !canvas) {
        return false;
      }
      
      this.clearCanvas(canvasId);
      this.drawGrid(canvasId);
      
      const width = canvas.width;
      const height = canvas.height;
      
      context.save();
      context.fillStyle = this.colors.spectrum;
      context.shadowColor = this.colors.spectrum;
      context.shadowBlur = 5;
      
      const dataLength = fftData.length;
      const barWidth = width / dataLength;
      
      for (let i = 0; i < dataLength; i++) {
        let magnitude = Array.isArray(fftData) ? fftData[i] : fftData[i];
        
        // Convertir de dB en amplitude linéaire
        if (magnitude < -100) magnitude = -100;
        const normalizedMagnitude = (magnitude + 100) / 100;
        
        const barHeight = normalizedMagnitude * height * 0.9;
        const x = i * barWidth;
        const y = height - barHeight;
        
        // Gradient de couleur selon la fréquence
        const hue = (i / dataLength) * 240; // 0 = rouge, 240 = bleu
        context.fillStyle = `hsl(${hue}, 100%, 50%)`;
        
        context.fillRect(x, y, barWidth - 1, barHeight);
      }
      
      context.restore();
      
      // Labels de fréquence
      this.drawSpectrumLabels(canvasId, dataLength);
      
      return true;
      
    } catch (error) {
      console.error(`[WaveformRenderer] Failed to draw spectrum:`, error);
      return false;
    }
  }
  
  /**
   * Dessine les labels du spectre de fréquences
   */
  drawSpectrumLabels(canvasId, dataLength) {
    try {
      const { canvas, context } = this.getCanvas(canvasId);
      
      if (!context) {
        return false;
      }
      
      context.save();
      context.fillStyle = this.colors.text;
      context.font = '12px Courier New';
      context.textAlign = 'center';
      
      const width = canvas.width;
      const height = canvas.height;
      const sampleRate = 44100;
      const nyquist = sampleRate / 2;
      
      // Labels de fréquence (quelques points de référence)
      const freqPoints = [100, 1000, 5000, 10000];
      
      freqPoints.forEach(freq => {
        if (freq < nyquist) {
          const x = (freq / nyquist) * width;
          context.fillText(`${freq}Hz`, x, height - 5);
          
          // Ligne verticale de référence
          context.save();
          context.strokeStyle = this.colors.accent;
          context.lineWidth = 1;
          context.globalAlpha = 0.5;
          context.beginPath();
          context.moveTo(x, 0);
          context.lineTo(x, height - 20);
          context.stroke();
          context.restore();
        }
      });
      
      context.restore();
      return true;
      
    } catch (error) {
      console.error(`[WaveformRenderer] Failed to draw spectrum labels:`, error);
      return false;
    }
  }
  
  /**
   * Dessine une enveloppe ADSR
   */
  drawADSREnvelope(canvasId, attack = 0.1, decay = 0.3, sustain = 0.7, release = 0.5) {
    try {
      const { canvas, context } = this.getCanvas(canvasId);
      
      if (!context || !canvas) {
        return false;
      }
      
      this.clearCanvas(canvasId);
      this.drawGrid(canvasId);
      
      const width = canvas.width;
      const height = canvas.height;
      const bottomY = height * 0.9;
      const topY = height * 0.1;
      const sustainY = bottomY - (sustain * (bottomY - topY));
      
      // Calculer les positions X
      const totalTime = attack + decay + 1.0 + release; // 1 seconde de sustain
      const attackX = (attack / totalTime) * width * 0.8;
      const decayX = attackX + ((decay / totalTime) * width * 0.8);
      const sustainX = decayX + (1.0 / totalTime) * width * 0.8;
      const releaseX = sustainX + ((release / totalTime) * width * 0.8);
      
      context.save();
      context.strokeStyle = this.colors.waveform;
      context.lineWidth = 3;
      context.shadowColor = this.colors.waveform;
      context.shadowBlur = 10;
      
      // Dessiner l'enveloppe
      context.beginPath();
      
      // Attack
      context.moveTo(50, bottomY);
      context.lineTo(50 + attackX, topY);
      
      // Decay
      context.lineTo(50 + decayX, sustainY);
      
      // Sustain
      context.lineTo(50 + sustainX, sustainY);
      
      // Release
      context.lineTo(50 + releaseX, bottomY);
      
      context.stroke();
      
      // Points de contrôle
      context.fillStyle = this.colors.accent;
      context.shadowColor = this.colors.accent;
      const points = [
        { x: 50, y: bottomY, label: 'Start' },
        { x: 50 + attackX, y: topY, label: 'Peak' },
        { x: 50 + decayX, y: sustainY, label: 'Sustain' },
        { x: 50 + sustainX, y: sustainY, label: 'Release' },
        { x: 50 + releaseX, y: bottomY, label: 'End' }
      ];
      
      points.forEach(point => {
        context.beginPath();
        context.arc(point.x, point.y, 4, 0, 2 * Math.PI);
        context.fill();
      });
      
      context.restore();
      
      // Labels ADSR
      this.drawADSRLabels(canvasId, attack, decay, sustain, release);
      
      return true;
      
    } catch (error) {
      console.error(`[WaveformRenderer] Failed to draw ADSR envelope:`, error);
      return false;
    }
  }
  
  /**
   * Dessine les labels ADSR
   */
  drawADSRLabels(canvasId, attack, decay, sustain, release) {
    try {
      const { canvas, context } = this.getCanvas(canvasId);
      
      if (!context) {
        return false;
      }
      
      context.save();
      context.fillStyle = this.colors.text;
      context.font = '14px Courier New';
      context.shadowColor = this.colors.text;
      context.shadowBlur = 5;
      
      const labels = [
        `Attack: ${attack.toFixed(2)}s`,
        `Decay: ${decay.toFixed(2)}s`,
        `Sustain: ${(sustain * 100).toFixed(0)}%`,
        `Release: ${release.toFixed(2)}s`
      ];
      
      labels.forEach((label, index) => {
        context.fillText(label, 10, 25 + (index * 20));
      });
      
      context.restore();
      return true;
      
    } catch (error) {
      console.error(`[WaveformRenderer] Failed to draw ADSR labels:`, error);
      return false;
    }
  }

  /**
   * Dessine la réponse fréquentielle d'un filtre
   */
  drawFilterResponse(canvasId, filterType = 'lowpass', cutoffFreq = 1000, Q = 1) {
    try {
      const { canvas, context } = this.getCanvas(canvasId);
      
      if (!context || !canvas) {
        return false;
      }
      
      this.clearCanvas(canvasId);
      this.drawGrid(canvasId);
      
      const width = canvas.width;
      const height = canvas.height;
      const minFreq = 20;
      const maxFreq = 20000;
      const minDb = -60;
      const maxDb = 20;
      
      context.save();
      context.strokeStyle = this.colors.waveform;
      context.lineWidth = 3;
      context.shadowColor = this.colors.waveform;
      context.shadowBlur = 8;
      
      context.beginPath();
      
      for (let x = 0; x < width; x++) {
        // Fréquence logarithmique
        const logFreq = minFreq * Math.pow(maxFreq / minFreq, x / width);
        
        // Calculer la réponse du filtre
        let magnitude = this.calculateFilterResponse(filterType, logFreq, cutoffFreq, Q);
        
        // Convertir en dB
        const db = 20 * Math.log10(Math.abs(magnitude));
        
        // Normaliser pour l'affichage
        const normalizedDb = (db - minDb) / (maxDb - minDb);
        const y = height * (1 - Math.max(0, Math.min(1, normalizedDb)));
        
        if (x === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }
      
      context.stroke();
      
      // Marquer la fréquence de coupure
      const cutoffX = width * Math.log(cutoffFreq / minFreq) / Math.log(maxFreq / minFreq);
      context.strokeStyle = this.colors.accent;
      context.lineWidth = 2;
      context.setLineDash([5, 5]);
      context.beginPath();
      context.moveTo(cutoffX, 0);
      context.lineTo(cutoffX, height);
      context.stroke();
      context.setLineDash([]);
      
      context.restore();
      
      // Labels
      this.drawFilterLabels(canvasId, filterType, cutoffFreq, Q);
      
      return true;
      
    } catch (error) {
      console.error(`[WaveformRenderer] Failed to draw filter response:`, error);
      return false;
    }
  }
  
  /**
   * Calcule la réponse d'un filtre
   */
  calculateFilterResponse(type, frequency, cutoffFreq, Q) {
    const omega = 2 * Math.PI * frequency;
    const omegaC = 2 * Math.PI * cutoffFreq;
    const s = omega / omegaC;
    
    switch (type) {
      case 'lowpass':
        return 1 / Math.sqrt(1 + Math.pow(s * Q, 2));
        
      case 'highpass':
        return (s * Q) / Math.sqrt(1 + Math.pow(s * Q, 2));
        
      case 'bandpass':
        return 1 / Math.sqrt(1 + Math.pow(Q * (s - 1/s), 2));
        
      case 'notch':
        const numerator = Math.pow(s, 2) + 1;
        const denominator = Math.sqrt(Math.pow(s, 4) + Math.pow(1 + s*s/Q, 2));
        return numerator / denominator;
        
      default:
        return 1;
    }
  }
  
  /**
   * Dessine les labels du filtre
   */
  drawFilterLabels(canvasId, type, cutoffFreq, Q) {
    try {
      const { canvas, context } = this.getCanvas(canvasId);
      
      if (!context) {
        return false;
      }
      
      context.save();
      context.fillStyle = this.colors.text;
      context.font = '14px Courier New';
      context.shadowColor = this.colors.text;
      context.shadowBlur = 5;
      
      context.fillText(`${type.toUpperCase()} FILTER`, 10, 25);
      context.fillText(`Cutoff: ${cutoffFreq.toFixed(0)} Hz`, 10, 45);
      context.fillText(`Q: ${Q.toFixed(1)}`, 10, 65);
      
      context.restore();
      return true;
      
    } catch (error) {
      console.error(`[WaveformRenderer] Failed to draw filter labels:`, error);
      return false;
    }
  }
  
  /**
   * Démarre l'animation temps réel
   */
  startAnimation() {
    if (this.isAnimating) {
      return;
    }
    
    this.isAnimating = true;
    
    const animate = () => {
      if (!this.isAnimating) {
        return;
      }
      
      // Mettre à jour toutes les visualisations temps réel
      this.updateRealtimeVisualizations();
      
      this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
    console.log('[WaveformRenderer] Animation started');
  }
  
  /**
   * Arrête l'animation
   */
  stopAnimation() {
    this.isAnimating = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    console.log('[WaveformRenderer] Animation stopped');
  }
  
  /**
   * Met à jour les visualisations temps réel
   */
  updateRealtimeVisualizations() {
    try {
      // Liste des canvas qui doivent être mis à jour en temps réel
      const realtimeCanvases = [
        'waveform-canvas',
        'spectrum-canvas',
        'osc-waveform-canvas',
        'mod-canvas',
        'filter-spectrum-canvas'
      ];
      
      realtimeCanvases.forEach(canvasId => {
        if (this.canvases.has(canvasId)) {
          // Vérifier si le canvas est visible (onglet actif)
          const canvas = this.canvases.get(canvasId);
          if (canvas && this.isCanvasVisible(canvas)) {
            this.drawRealtimeWaveform(canvasId);
          }
        }
      });
      
    } catch (error) {
      console.error('[WaveformRenderer] Failed to update realtime visualizations:', error);
    }
  }
  
  /**
   * Vérifie si un canvas est visible
   */
  isCanvasVisible(canvas) {
    const rect = canvas.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }
  
  /**
   * Redimensionne tous les canvas
   */
  resizeAllCanvases() {
    try {
      this.canvases.forEach((canvas, canvasId) => {
        this.setupCanvas(canvasId);
      });
      
      console.log('[WaveformRenderer] All canvases resized');
      
    } catch (error) {
      console.error('[WaveformRenderer] Failed to resize canvases:', error);
    }
  }
  
  /**
   * Nettoyage des ressources
   */
  cleanup() {
    try {
      this.stopAnimation();
      
      this.canvases.clear();
      this.contexts.clear();
      
      // Reset des états de bruit
      this.pinkNoiseState = null;
      this.brownNoiseState = null;
      
      console.log('[WaveformRenderer] Cleanup completed');
      
    } catch (error) {
      console.error('[WaveformRenderer] Cleanup failed:', error);
    }
  }
  
  /**
   * Dessine une mini forme d'onde dans une petite canvas
   */
  drawMiniWaveform(canvas, waveform, frequency = 440) {
    try {
      if (!canvas || !canvas.getContext) return false;
      
      const context = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas
      context.clearRect(0, 0, width, height);
      
      // Set style
      context.strokeStyle = this.colors.waveform;
      context.lineWidth = 2;
      context.shadowColor = this.colors.waveform;
      context.shadowBlur = 3;
      
      // Draw waveform
      context.beginPath();
      
      const cycles = 2; // Show 2 cycles
      const samples = width;
      
      for (let x = 0; x < samples; x++) {
        const t = (x / samples) * cycles * 2 * Math.PI;
        let y = 0;
        
        switch (waveform) {
          case 'sine':
            y = Math.sin(t);
            break;
          case 'square':
            y = Math.sign(Math.sin(t));
            break;
          case 'sawtooth':
            y = -1 + 2 * ((t % (2 * Math.PI)) / (2 * Math.PI));
            break;
          case 'triangle':
            y = (2 / Math.PI) * Math.asin(Math.sin(t));
            break;
          default:
            y = Math.sin(t);
        }
        
        const canvasY = height/2 - (y * height/4);
        
        if (x === 0) {
          context.moveTo(x, canvasY);
        } else {
          context.lineTo(x, canvasY);
        }
      }
      
      context.stroke();
      return true;
      
    } catch (error) {
      console.error('[WaveformRenderer] Failed to draw mini waveform:', error);
      return false;
    }
  }
  
  /**
   * Dessine un mini aperçu de bruit dans une petite canvas
   */
  drawMiniNoise(canvas, noiseType) {
    try {
      if (!canvas || !canvas.getContext) return false;
      
      const context = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas
      context.clearRect(0, 0, width, height);
      
      // Set style
      context.strokeStyle = this.colors.spectrum;
      context.lineWidth = 1;
      context.shadowColor = this.colors.spectrum;
      context.shadowBlur = 2;
      
      // Generate noise visualization
      context.beginPath();
      
      const samples = width;
      
      for (let x = 0; x < samples; x++) {
        let amplitude = 0;
        
        switch (noiseType) {
          case 'white':
            amplitude = (Math.random() - 0.5) * 0.8;
            break;
          case 'pink':
            amplitude = this.generatePinkNoise() * 0.6;
            break;
          case 'brown':
            amplitude = this.generateBrownNoise() * 0.4;
            break;
          default:
            amplitude = (Math.random() - 0.5) * 0.8;
        }
        
        const canvasY = height/2 + (amplitude * height/2);
        
        if (x === 0) {
          context.moveTo(x, canvasY);
        } else {
          context.lineTo(x, canvasY);
        }
      }
      
      context.stroke();
      return true;
      
    } catch (error) {
      console.error('[WaveformRenderer] Failed to draw mini noise:', error);
      return false;
    }
  }
}

// Créer l'instance globale
window.waveformRenderer = new WaveformRenderer();

// Setup automatique quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.waveformRenderer) {
      window.waveformRenderer.setupCanvases();
    }
  });
} else {
  if (window.waveformRenderer) {
    window.waveformRenderer.setupCanvases();
  }
}

// Redimensionnement automatique
window.addEventListener('resize', () => {
  if (window.waveformRenderer) {
    window.waveformRenderer.resizeAllCanvases();
  }
});

console.log('[WaveformRenderer] Class loaded and global instance created');