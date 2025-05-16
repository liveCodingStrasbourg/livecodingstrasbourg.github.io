/**
 * config.js - Configuration globale pour l'application de visualisation audio
 * Contient les constantes, paramètres par défaut et mappage des couleurs
 */

const CONFIG = {
    // Paramètres audio
    audio: {
        fftSizes: [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768],
        defaultFftIndex: 6, // 2048
        defaultSmoothing: 0.8,
        minDecibels: -90,
        maxDecibels: -10
    },
    
    // Limites de fréquence pour les différentes bandes (en pourcentage du spectre)
    frequencyBands: {
        bass: { min: 0, max: 0.08 },       // ~20-250Hz
        lowMid: { min: 0.08, max: 0.15 },  // ~250-500Hz
        mid: { min: 0.15, max: 0.4 },      // ~500-2000Hz
        highMid: { min: 0.4, max: 0.7 },   // ~2000-4000Hz
        treble: { min: 0.7, max: 1.0 }     // ~4000-20000Hz
    },
    
    // Paramètres de détection de battements
    beatDetection: {
        minBeatInterval: 250,  // Intervalle minimum entre battements (ms) -> Max 240 BPM
        energyHistorySize: 43, // ~1 seconde à 60fps
        defaultThreshold: 0.15,
        defaultSensitivity: 1.5,
        defaultDecay: 0.98,
        maxBeatHistory: 24     // Pour le calcul du BPM
    },
    
    // Paramètres pour le tap tempo
    tapTempo: {
        maxTapInterval: 2000,  // Intervalle maximum entre taps (ms)
        minTapsRequired: 3,    // Nombre minimum de taps pour calculer le BPM
        maxHistory: 8          // Nombre maximum de taps à conserver
    },
    
    // Mappage des couleurs
    colors: {
        primary: '#2a2a72',
        secondary: '#009ffd',
        accent: '#32cd32',
        bass: 'rgb(231, 76, 60)',      // Rouge
        lowMid: 'rgb(230, 126, 34)',   // Orange
        mid: 'rgb(46, 204, 113)',      // Vert
        highMid: 'rgb(52, 152, 219)',  // Bleu clair
        treble: 'rgb(155, 89, 182)',   // Violet
        
        // Couleurs Mondrian
        mondrianPalette: [
            '#FF0000', // Rouge
            '#FFDD00', // Jaune
            '#0000FF', // Bleu
            '#FFFFFF'  // Blanc
        ],
        
        // Palette abstraite
        abstractPalette: [
            '#FF0000', // Rouge
            '#FF7F00', // Orange
            '#FFFF00', // Jaune
            '#00FF00', // Vert
            '#0000FF', // Bleu
            '#4B0082', // Indigo
            '#9400D3'  // Violet
        ]
    },
    
    // Signaux audio disponibles pour le mapping
    availableSignals: [
        { id: 'bass', name: 'Graves', description: 'Énergie des basses fréquences (20-250Hz)' },
        { id: 'mid', name: 'Médiums', description: 'Énergie des moyennes fréquences (250-2000Hz)' },
        { id: 'treble', name: 'Aigus', description: 'Énergie des hautes fréquences (2000-20000Hz)' },
        { id: 'energy', name: 'Énergie', description: 'Énergie totale du signal audio' },
        { id: 'centroid', name: 'Centroïde', description: 'Centre de gravité spectral' },
        { id: 'zcr', name: 'ZCR', description: 'Taux de passage par zéro' },
        { id: 'beat', name: 'Battement', description: 'Détection de battement (binaire)' },
        { id: 'bpm', name: 'BPM', description: 'Tempo en battements par minute' }
    ],
    
    // Préréglages prédéfinis
    presets: {
        preset1: {
            name: 'Dance Music',
            fftSize: 8192,
            smoothing: 0.6,
            bassScale: 2.0,
            midScale: 1.0,
            trebleScale: 1.2,
            beatSensitivity: 1.8,
            beatDecay: 0.98,
            beatThreshold: 0.12,
            vizType1: 'frequencyBars',
            vizType2: 'bpmTracker',
            mapping: {
                mondrian: {
                    size: 'bass',
                    color: 'energy',
                    division: 'beat'
                },
                abstract: {
                    shape: 'bass',
                    color: 'treble',
                    position: 'mid',
                    rotation: 'beat'
                }
            }
        },
        preset2: {
            name: 'Voix et Parole',
            fftSize: 4096,
            smoothing: 0.7,
            bassScale: 1.0,
            midScale: 2.0,
            trebleScale: 1.5,
            beatSensitivity: 1.2,
            beatDecay: 0.97,
            beatThreshold: 0.2,
            vizType1: 'spectrogram',
            vizType2: 'waveform',
            mapping: {
                mondrian: {
                    size: 'mid',
                    color: 'centroid',
                    division: 'zcr'
                },
                abstract: {
                    shape: 'centroid',
                    color: 'zcr',
                    position: 'mid',
                    rotation: 'energy'
                }
            }
        },
        preset3: {
            name: 'Ambiant',
            fftSize: 16384,
            smoothing: 0.9,
            bassScale: 1.8,
            midScale: 1.0,
            trebleScale: 0.8,
            beatSensitivity: 1.0,
            beatDecay: 0.99,
            beatThreshold: 0.25,
            vizType1: 'mondrian',
            vizType2: 'energyCircle',
            mapping: {
                mondrian: {
                    size: 'energy',
                    color: 'centroid',
                    division: 'treble'
                },
                abstract: {
                    shape: 'treble',
                    color: 'centroid',
                    position: 'bass',
                    rotation: 'energy'
                }
            }
        },
        preset4: {
            name: 'Rock/Metal',
            fftSize: 2048,
            smoothing: 0.5,
            bassScale: 1.8,
            midScale: 1.5,
            trebleScale: 2.0,
            beatSensitivity: 2.0,
            beatDecay: 0.95,
            beatThreshold: 0.1,
            vizType1: 'abstract',
            vizType2: 'frequencyBars',
            mapping: {
                mondrian: {
                    size: 'beat',
                    color: 'energy',
                    division: 'treble'
                },
                abstract: {
                    shape: 'mid',
                    color: 'energy',
                    position: 'treble',
                    rotation: 'bass'
                }
            }
        },
        preset5: {
            name: 'Jazz',
            fftSize: 4096,
            smoothing: 0.75,
            bassScale: 1.2,
            midScale: 1.5,
            trebleScale: 1.0,
            beatSensitivity: 1.3,
            beatDecay: 0.97,
            beatThreshold: 0.18,
            vizType1: 'spectralFlux',
            vizType2: 'abstract',
            mapping: {
                mondrian: {
                    size: 'mid',
                    color: 'bass',
                    division: 'centroid'
                },
                abstract: {
                    shape: 'zcr',
                    color: 'bass',
                    position: 'mid',
                    rotation: 'centroid'
                }
            }
        }
    }
};

// Export CONFIG pour utilisation dans d'autres modules
// (compatible avec les imports ES6 et le chargement direct par script)
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}