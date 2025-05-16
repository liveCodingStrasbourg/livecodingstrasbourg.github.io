/**
 * mondrian.js - Visualisation inspirée du style de Piet Mondrian
 * Cette visualisation crée une grille dynamique de rectangles colorés qui réagissent à l'audio.
 */

class MondrianVisualization extends Visualization {
    /**
     * Crée une nouvelle visualisation Mondrian
     * @param {HTMLCanvasElement} canvas - Élément canvas pour le rendu
     * @param {Object} options - Options de configuration
     */
    constructor(canvas, options = {}) {
        super(canvas, options);
        
        // Structure de la grille
        this.grid = [];
        this.gridSize = { cols: 6, rows: 4 };
        
        // Palettes de couleurs Mondrian
        this.colors = CONFIG.colors.mondrianPalette;
        
        // Mappages par défaut
        this.signalMappings = {
            size: 'bass',
            color: 'mid',
            division: 'treble'
        };
        
        // État de la visualisation
        this.lastDivision = 0;
        this.lastBeat = false;
        
        // Initialisation de la grille
        this.initGrid();
    }
    
    /**
     * Retourne les options par défaut pour la visualisation Mondrian
     * @returns {Object} Options par défaut
     */
    getDefaultOptions() {
        return Object.assign({}, super.getDefaultOptions(), {
            backgroundColor: '#f5f5f5',
            borderColor: '#000000',
            borderWidth: 2,
            minRectSize: 0.7,  // Taille minimale des rectangles (facteur)
            maxRectSize: 1.5,  // Taille maximale des rectangles (facteur)
            animationSpeed: 0.15, // Vitesse d'animation (0-1)
            divisionTreshold: 0.6, // Seuil pour déclencher une nouvelle division
            beatReactivity: 0.8   // Réactivité aux battements (0-1)
        });
    }
    
    /**
     * Initialise la grille de rectangles
     */
    initGrid() {
        // Initialisation d'une grille basique
        this.grid = [];
        
        // Grille initiale de cellules
        for (let y = 0; y < this.gridSize.rows; y++) {
            for (let x = 0; x < this.gridSize.cols; x++) {
                const cell = {
                    // Position et taille normalisées (0-1)
                    x: x / this.gridSize.cols,
                    y: y / this.gridSize.rows,
                    width: 1 / this.gridSize.cols,
                    height: 1 / this.gridSize.rows,
                    
                    // Attributs visuels
                    colorIndex: Math.floor(Math.random() * this.colors.length),
                    scale: 1.0,
                    targetScale: 1.0,
                    
                    // Identifiant unique pour le suivi
                    id: `cell_${x}_${y}`,
                    
                    // Gestion des divisions
                    divided: false,
                    children: []
                };
                
                this.grid.push(cell);
            }
        }
    }
    
    /**
     * Divise une cellule en plusieurs sous-cellules
     * @param {Object} cell - Cellule à diviser
     */
    divideCell(cell) {
        if (cell.divided) return;
        
        // Marque la cellule comme divisée
        cell.divided = true;
        cell.children = [];
        
        // Détermine si on divise horizontalement ou verticalement (alternance)
        const divideHorizontally = Math.random() > 0.5;
        
        if (divideHorizontally) {
            // Division en deux parties horizontales
            const ratio = 0.3 + Math.random() * 0.4; // Ratio de division entre 0.3 et 0.7
            
            // Première partie
            const child1 = {
                x: cell.x,
                y: cell.y,
                width: cell.width,
                height: cell.height * ratio,
                colorIndex: Math.floor(Math.random() * this.colors.length),
                scale: 1.0,
                targetScale: 1.0,
                id: `${cell.id}_h1`,
                divided: false,
                children: []
            };
            
            // Deuxième partie
            const child2 = {
                x: cell.x,
                y: cell.y + cell.height * ratio,
                width: cell.width,
                height: cell.height * (1 - ratio),
                colorIndex: Math.floor(Math.random() * this.colors.length),
                scale: 1.0,
                targetScale: 1.0,
                id: `${cell.id}_h2`,
                divided: false,
                children: []
            };
            
            cell.children.push(child1, child2);
        } else {
            // Division en deux parties verticales
            const ratio = 0.3 + Math.random() * 0.4; // Ratio de division entre 0.3 et 0.7
            
            // Première partie
            const child1 = {
                x: cell.x,
                y: cell.y,
                width: cell.width * ratio,
                height: cell.height,
                colorIndex: Math.floor(Math.random() * this.colors.length),
                scale: 1.0,
                targetScale: 1.0,
                id: `${cell.id}_v1`,
                divided: false,
                children: []
            };
            
            // Deuxième partie
            const child2 = {
                x: cell.x + cell.width * ratio,
                y: cell.y,
                width: cell.width * (1 - ratio),
                height: cell.height,
                colorIndex: Math.floor(Math.random() * this.colors.length),
                scale: 1.0,
                targetScale: 1.0,
                id: `${cell.id}_v2`,
                divided: false,
                children: []
            };
            
            cell.children.push(child1, child2);
        }
    }
    
    /**
     * Fusionne les cellules enfant en une seule cellule parent
     * @param {Object} cell - Cellule parent à restaurer
     */
    mergeCell(cell) {
        if (!cell.divided) return;
        
        // Réinitialise la cellule
        cell.divided = false;
        cell.children = [];
        cell.colorIndex = Math.floor(Math.random() * this.colors.length);
    }
    
    /**
     * Met à jour l'état de la visualisation en fonction des données audio
     */
    update() {
        if (!this.audioData) return;
        
        // Récupération des valeurs mappées
        const sizeValue = this.getMappedSignalValue('size', 0.5);
        const colorValue = this.getMappedSignalValue('color', 0.5);
        const divisionValue = this.getMappedSignalValue('division', 0.5);
        
        // Détection des battements
        const beatDetected = beatDetector.beatDetected;
        
        // Si un battement est détecté, on applique un effet visuel
        if (beatDetected && !this.lastBeat) {
            // On sélectionne une cellule aléatoire pour changer sa couleur
            const randomIndex = Math.floor(Math.random() * this.grid.length);
            const cell = this.grid[randomIndex];
            
            if (!cell.divided) {
                cell.colorIndex = Math.floor(colorValue * this.colors.length) % this.colors.length;
                cell.targetScale = 1 + (this.options.beatReactivity * 0.3);
            }
        }
        this.lastBeat = beatDetected;
        
        // Mise à jour des divisions en fonction du signal de division
        if (Math.abs(divisionValue - this.lastDivision) > this.options.divisionTreshold / 10) {
            this.lastDivision = divisionValue;
            
            if (divisionValue > this.options.divisionTreshold) {
                // Sélection d'une cellule à diviser
                const undividedCells = this.grid.filter(cell => !cell.divided);
                if (undividedCells.length > 0) {
                    const cellToSplit = undividedCells[Math.floor(Math.random() * undividedCells.length)];
                    this.divideCell(cellToSplit);
                }
            } else {
                // Sélection d'une cellule à fusionner
                const dividedCells = this.grid.filter(cell => cell.divided);
                if (dividedCells.length > 0) {
                    const cellToMerge = dividedCells[Math.floor(Math.random() * dividedCells.length)];
                    this.mergeCell(cellToMerge);
                }
            }
        }
        
        // Mise à jour de la taille des cellules en fonction du signal de taille
        this.grid.forEach(cell => {
            if (!cell.divided) {
                // Définition de la taille cible en fonction du signal et de l'énergie
                const targetScaleFactor = this.options.minRectSize + 
                    sizeValue * (this.options.maxRectSize - this.options.minRectSize);
                
                // Animation fluide vers la taille cible
                cell.targetScale = targetScaleFactor;
                cell.scale += (cell.targetScale - cell.scale) * this.options.animationSpeed;
            }
        });
    }
    
    /**
     * Dessine récursivement une cellule et ses enfants
     * @param {Object} cell - Cellule à dessiner
     */
    drawCell(cell) {
        // Si la cellule est divisée, on dessine ses enfants
        if (cell.divided && cell.children.length > 0) {
            cell.children.forEach(child => this.drawCell(child));
            return;
        }
        
        // Calcul des dimensions et position réelles sur le canvas
        const x = cell.x * this.width;
        const y = cell.y * this.height;
        const w = cell.width * this.width;
        const h = cell.height * this.height;
        
        // Calcul de la mise à l'échelle avec effet de rétrécissement au centre
        const scaleW = cell.scale * w;
        const scaleH = cell.scale * h;
        const offsetX = (w - scaleW) / 2;
        const offsetY = (h - scaleH) / 2;
        
        // Dessin du rectangle avec sa couleur
        this.ctx.fillStyle = this.colors[cell.colorIndex];
        this.ctx.fillRect(x + offsetX, y + offsetY, scaleW, scaleH);
        
        // Dessin de la bordure
        this.ctx.strokeStyle = this.options.borderColor;
        this.ctx.lineWidth = this.options.borderWidth;
        this.ctx.strokeRect(x + offsetX, y + offsetY, scaleW, scaleH);
    }
    
    /**
     * Rendu de la visualisation
     */
    render() {
        // Mise à jour de l'état
        this.update();
        
        // Effacement du canvas avec la couleur de fond
        this.ctx.fillStyle = this.options.backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Dessin de toutes les cellules de la grille
        this.grid.forEach(cell => {
            if (!cell.divided) {
                this.drawCell(cell);
            } else {
                // Si la cellule est divisée, ses enfants seront dessinés
                this.drawCell(cell);
            }
        });
    }
}

// Enregistrement de la visualisation dans le registre global
window.MondrianVisualization = MondrianVisualization;