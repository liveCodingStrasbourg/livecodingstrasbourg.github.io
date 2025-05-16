/**
 * info-panels.js - Gestion des panneaux d'information
 * Ce module gère l'affichage et le contenu des panneaux d'information pour les visualisations
 */

class InfoPanelsManager {
    constructor() {
        // Références aux éléments DOM
        this.infoPanels = {
            panel1: document.getElementById('info1Panel'),
            panel2: document.getElementById('info2Panel')
        };
        
        this.infoButtons = {
            button1: document.getElementById('info1Button'),
            button2: document.getElementById('info2Button')
        };
        
        // État des panneaux (affiché ou masqué)
        this.panelState = {
            panel1: false,
            panel2: false
        };
        
        // Liaison des méthodes au contexte this
        this.togglePanel = this.togglePanel.bind(this);
        this.updatePanelContent = this.updatePanelContent.bind(this);
        
        // Initialisation des événements
        this.initEvents();
    }
    
    /**
     * Initialise les événements pour les boutons d'information
     */
    initEvents() {
        if (this.infoButtons.button1) {
            this.infoButtons.button1.addEventListener('click', () => this.togglePanel('panel1'));
        }
        
        if (this.infoButtons.button2) {
            this.infoButtons.button2.addEventListener('click', () => this.togglePanel('panel2'));
        }
    }
    
    /**
     * Bascule l'affichage d'un panneau d'information
     * @param {string} panelId - Identifiant du panneau ('panel1' ou 'panel2')
     */
    togglePanel(panelId) {
        const panel = this.infoPanels[panelId];
        
        if (!panel) return;
        
        // Inverse l'état du panneau
        this.panelState[panelId] = !this.panelState[panelId];
        
        // Mise à jour de l'affichage
        if (this.panelState[panelId]) {
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    }
    
    /**
     * Met à jour le contenu d'un panneau d'information
     * @param {string} panelId - Identifiant du panneau ('panel1' ou 'panel2')
     * @param {string} visualizationType - Type de visualisation
     */
    updatePanelContent(panelId, visualizationType) {
        const panel = this.infoPanels[panelId];
        
        if (!panel) return;
        
        // Récupération du contenu en fonction du type de visualisation
        const content = this.getVisualizationInfo(visualizationType);
        
        // Mise à jour du contenu du panneau
        panel.innerHTML = content;
    }
    
    /**
     * Retourne les informations pour un type de visualisation
     * @param {string} type - Type de visualisation
     * @returns {string} HTML contenant les informations
     */
    getVisualizationInfo(type) {
        switch (type) {
            case 'frequencyBars':
                return `
                    <h4>Spectre de Fréquences (FFT)</h4>
                    <p>La Transformée de Fourier Rapide (FFT) décompose un signal sonore en ses fréquences constitutives, 
                    permettant de visualiser la distribution énergétique du son à travers le spectre audible (20Hz - 20kHz).</p>
                    <p>Algorithme : Nous échantillonnons le signal audio puis appliquons la FFT pour obtenir l'amplitude de chaque 
                    bande de fréquence.</p>
                    <p><code>X(k) = ∑[n=0 to N-1] x(n)e^(-j2πkn/N)</code></p>
                    <p>Où <code>x(n)</code> est le signal d'entrée, <code>N</code> est le nombre d'échantillons, et <code>X(k)</code> 
                    représente l'amplitude de la fréquence <code>k</code>.</p>
                `;
            case 'waveform':
                return `
                    <h4>Forme d'Onde</h4>
                    <p>La forme d'onde représente l'amplitude du signal audio au fil du temps, montrant directement 
                    les variations de pression acoustique captées par le microphone.</p>
                    <p>C'est la représentation la plus fondamentale du signal sonore, permettant d'observer les motifs temporels 
                    et l'enveloppe du son.</p>
                    <p>Le tracé montre l'amplitude normalisée (entre -1 et 1) sur l'axe Y et le temps sur l'axe X.</p>
                `;
            case 'spectralFlux':
                return `
                    <h4>Flux Spectral</h4>
                    <p>Le flux spectral mesure la vitesse de changement du spectre de fréquences au fil du temps. 
                    C'est un excellent indicateur des transitions sonores et des changements dans le contenu audio.</p>
                    <p>Algorithme : On calcule la différence entre les spectres de fréquence consécutifs, en ne conservant 
                    que les changements positifs (augmentations d'énergie).</p>
                    <p><code>flux = ∑ max(|X_t[k] - X_{t-1}[k]|, 0)</code></p>
                    <p>Où <code>X_t[k]</code> est l'amplitude de la fréquence <code>k</code> au temps <code>t</code>.</p>
                    <p>Les pics dans le flux spectral indiquent souvent des attaques percussives ou des changements brusques 
                    dans la musique.</p>
                `;
            case 'spectrogram':
                return `
                    <h4>Spectrogramme</h4>
                    <p>Le spectrogramme est une représentation visuelle tridimensionnelle du signal sonore, montrant 
                    l'évolution du spectre de fréquences au fil du temps.</p>
                    <p>L'axe vertical représente la fréquence (de bas en haut), l'axe horizontal représente le temps 
                    (de gauche à droite), et la couleur représente l'intensité (bleu = faible, rouge = élevée).</p>
                    <p>Cette visualisation permet d'identifier des motifs harmoniques, des formants vocaux, des instruments, 
                    et la structure temporelle du son.</p>
                    <p>L'échelle de fréquence est logarithmique pour mieux représenter la perception humaine des hauteurs.</p>
                `;
            case 'bpmTracker':
                return `
                    <h4>Analyseur de BPM</h4>
                    <p>Le BPM (Battements Par Minute) mesure le tempo d'un morceau musical. Notre algorithme détecte les pics 
                    d'énergie qui correspondent aux battements.</p>
                    <p>Algorithme de détection :</p>
                    <ol>
                        <li>Extraction de l'énergie dans les basses fréquences (20-250Hz)</li>
                        <li>Détection des pics locaux dépassant un seuil adaptatif basé sur l'énergie moyenne</li>
                        <li>Filtrage temporel pour éviter les faux positifs</li>
                        <li>Calcul des intervalles entre battements consécutifs</li>
                        <li>Conversion des intervalles médians en BPM (60000/intervalle_ms)</li>
                        <li>Lissage temporel pour stabiliser l'affichage</li>
                    </ol>
                    <p>La confiance indique la régularité des battements détectés.</p>
                    <p>Le BPM manuel est calculé à partir des taps de l'utilisateur.</p>
                `;
            case 'energyCircle':
                return `
                    <h4>Cercle Énergétique</h4>
                    <p>Cette visualisation représente l'énergie audio sous forme de cercles interactifs, permettant de 
                    comparer facilement l'équilibre entre les graves, médiums et aigus.</p>
                    <p>Le cercle principal au centre représente l'énergie totale, tandis que les trois cercles 
                    satellites représentent respectivement :</p>
                    <ul>
                        <li>Rouge : Graves (20-250Hz)</li>
                        <li>Vert : Médiums (250-2000Hz)</li>
                        <li>Bleu : Aigus (2000-20000Hz)</li>
                    </ul>
                    <p>La taille de chaque cercle est proportionnelle à l'énergie dans la bande correspondante, 
                    et un effet de pulsation est visible lors de la détection d'un battement.</p>
                `;
            case 'mondrian':
                return `
                    <h4>Visualisation Mondrian</h4>
                    <p>Inspirée des compositions néoplastiques de Piet Mondrian, cette visualisation 
                    représente le signal audio sous forme de grille rectangulaire colorée.</p>
                    <p>Les rectangles se divisent et fusionnent en fonction de l'activité audio, créant 
                    une composition dynamique qui évolue avec la musique.</p>
                    <p>Paramètres configurables :</p>
                    <ul>
                        <li><strong>Taille</strong> - contrôle la taille des rectangles</li>
                        <li><strong>Couleur</strong> - influence la sélection des couleurs</li>
                        <li><strong>Division</strong> - déclenche la division/fusion des rectangles</li>
                    </ul>
                    <p>Les battements audio déclenchent des changements visuels synchronisés.</p>
                `;
            case 'abstract':
                return `
                    <h4>Visualisation Abstraite</h4>
                    <p>Cette visualisation utilise des formes géométriques abstraites qui évoluent 
                    et réagissent au signal audio de manière organique.</p>
                    <p>Différentes caractéristiques du son sont mappées sur les propriétés visuelles :</p>
                    <ul>
                        <li><strong>Forme</strong> - type et taille des formes</li>
                        <li><strong>Couleur</strong> - palette chromatique</li>
                        <li><strong>Position</strong> - emplacement des formes</li>
                        <li><strong>Rotation</strong> - mouvement angulaire des formes</li>
                    </ul>
                    <p>L'ensemble crée une chorégraphie visuelle dynamique qui reflète la texture et 
                    le rythme de l'audio en temps réel.</p>
                `;
            case 'centroidVisualizer':
                return `
                    <h4>Centroïde Spectral</h4>
                    <p>Le centroïde spectral représente le "centre de gravité" du spectre de fréquence, 
                    indiquant la fréquence moyenne pondérée par l'énergie.</p>
                    <p>Cette mesure est fortement corrélée avec la "brillance" perçue du son :</p>
                    <ul>
                        <li>Une valeur élevée indique une dominance des hautes fréquences (son brillant)</li>
                        <li>Une valeur basse indique une dominance des basses fréquences (son sombre)</li>
                    </ul>
                    <p>La formule de calcul est : <code>Centroïde = ∑(f * A(f)) / ∑A(f)</code></p>
                    <p>Où <code>f</code> est la fréquence et <code>A(f)</code> est l'amplitude à cette fréquence.</p>
                    <p>Cette visualisation montre l'évolution du centroïde au fil du temps, permettant 
                    d'analyser les changements de timbre dans le son.</p>
                `;
            case 'abstractArt':
                return `
                    <h4>Art Abstrait Audio-réactif</h4>
                    <p>Cette visualisation transforme le son en composition artistique abstraite en temps réel, 
                    s'inspirant de divers courants artistiques.</p>
                    <p>Les caractéristiques audio contrôlent différents aspects visuels :</p>
                    <ul>
                        <li><strong>Couleur</strong> - Les changements de couleur sont liés à la signature spectrale</li>
                        <li><strong>Forme</strong> - La morphologie des éléments réagit à l'énergie du signal</li>
                        <li><strong>Mouvement</strong> - Les transitions sont synchronisées avec le flux spectral</li>
                        <li><strong>Composition</strong> - La structure globale évolue avec le contenu harmonique</li>
                    </ul>
                    <p>Plusieurs styles sont disponibles (Mondrian, Kandinsky, Minimaliste), 
                    chacun avec sa propre interprétation visuelle des caractéristiques audio.</p>
                `;
            default:
                return `
                    <h4>Visualisation Audio</h4>
                    <p>Cette visualisation représente les propriétés du signal audio capté par votre microphone.</p>
                    <p>Utilisez les contrôles pour ajuster les paramètres et explorer différentes façons de 
                    représenter le son.</p>
                `;
        }
    }
}

// Création d'une instance unique pour l'application
const infoPanels = new InfoPanelsManager();

// Export global
window.infoPanels = infoPanels;