# CONSUME: Soundscape of Capitalism

![CONSUME](https://via.placeholder.com/800x200/121212/ff2a6d?text=CONSUME:+Soundscape+of+Capitalism)

## Table des matières

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Interface utilisateur](#interface-utilisateur)
4. [Commandes de base](#commandes-de-base)
5. [Les produits](#les-produits)
6. [Les modificateurs de produits](#les-modificateurs-de-produits)
7. [Paramètres spéciaux](#paramètres-spéciaux)
8. [Les roues de caddie](#les-roues-de-caddie)
9. [Modes spéciaux](#modes-spéciaux)
10. [Exemples de scénarios](#exemples-de-scénarios)
11. [Dépannage](#dépannage)
12. [Référence technique](#référence-technique)

## Introduction

**CONSUME: Soundscape of Capitalism** est une expérience audio interactive qui transforme les mécanismes du consumérisme en paysage sonore. À travers une interface de commandes textuelles, vous pouvez ajouter des produits, modifier leur état, et déclencher différents modes qui affectent l'ensemble de l'environnement sonore.

Cette expérience simule un supermarché abandonné où chaque produit devient un instrument de musique, et où les sons se combinent pour créer une ambiance à la fois fascinante et légèrement inquiétante. Les produits, leurs modificateurs, et les différents modes créent ensemble une métaphore sonore du capitalisme consumériste.

### Concept

L'expérience joue sur plusieurs thèmes :
- Le consumérisme et notre relation aux produits
- L'obsolescence programmée et le cycle de vie des produits
- La manipulation marketing et les techniques de vente
- L'horreur subtile des espaces commerciaux abandonnés

## Installation

### Prérequis

- Un navigateur web moderne (Firefox, Chrome, Safari)
- JavaScript activé
- Audio activé 

### Démarrage

1. Ouvrez le fichier le lien dans votre navigateur (index.html si vous avez téléchargé le projet)
2. Cliquez sur le bouton "Enable Sound" pour activer l'audio
3. L'interface de commande s'affichera, prête à recevoir vos instructions

## Interface utilisateur


L'interface de CONSUME est divisée en plusieurs sections :

1. **Titre clignotant** - Affiche le titre du projet avec des effets de néon
2. **Éditeur de commandes** - Zone de texte où vous tapez vos commandes
3. **Panneau de contrôle** - Boutons pour exécuter des commandes
   - **Run All** - Exécute toutes les commandes dans l'éditeur
   - **Run Current Line** - Exécute uniquement la ligne où se trouve le curseur
   - **Stop All** - Arrête tous les sons
   - **Random Command** - Génère et exécute une commande aléatoire
4. **Conteneur de visualisation** - Affiche les produits actifs et leurs effets sonores
5. **Conteneur de sortie** - Affiche les messages du système (comme un reçu)
6. **Éléments d'ambiance** - Éléments visuels comme les rayonnages de supermarché, taches, etc.

### Raccourcis clavier

- `Ctrl+Enter` : Exécute la ligne actuelle
- `Ctrl+Shift+Enter` : Exécute toutes les lignes
- `Ctrl+R` : Génère une commande aléatoire
- `Échap` : Arrête tous les sons

## Commandes de base

CONSUME utilise un langage de commande simple et intuitif. Voici les commandes de base :

### Ajouter des produits

```
add [produit]
```

Exemple :
```
add beer
add salad
add ham
```

### Modifier les roues du caddie

```
my cart has [type] wheels
```

Exemple :
```
my cart has square wheels
my cart has broken wheels
my cart has premium wheels
```

### Activer/désactiver les modes spéciaux

```
[mode] mode on
[mode] mode off
```

Exemple :
```
discount mode on
inflation mode off
consumerism mode on
```

### Retirer des produits

```
remove [produit]
```

Exemple :
```
remove beer
```

## Les produits

CONSUME propose une variété de produits, chacun générant un son unique :

| Produit | Type de son | Description sonore | Catégorie |
|---------|-------------|-------------------|-----------|
| beer | FM Synth | Synthé FM avec harmoniques | Boisson |
| salad | AM Synth | Synthé AM à onde carrée | Légume |
| ham | Mono Synth | Synthé mono à onde en dents de scie | Viande |
| milk | Pluck Synth | Synthé de type corde pincée | Produit laitier |
| chips | Noise Synth | Synthé à bruit blanc | Snack |
| pizza | Duo Synth | Synthé superposé | Fast-food |
| oil | Membrane Synth | Synthé de basse profonde | Ingrédient |
| wine | Poly Synth | Synthé poly à onde triangulaire | Boisson |
| soda | AM Synth | Synthé AM dur | Boisson |
| bread | FM Synth | Synthé FM doux | Boulangerie |
| cereal | Mono Synth | Synthé mono à onde carrée | Petit-déjeuner |
| chocolate | Mono Synth | Synthé mono à onde sinusoïdale | Sucreries |
| candy | AM Synth | Synthé AM aigu | Sucreries |
| energy_drink | Metal Synth | Synthé métallique énergique | Boisson |

## Les modificateurs de produits

Vous pouvez ajouter des modificateurs aux produits pour changer leur son. Chaque modificateur applique des effets différents :

### Modificateurs de hauteur (pitch)

- **fresh** - Monte la hauteur d'une octave
- **old** - Baisse la hauteur d'une octave

Exemple :
```
add fresh beer
add old ham
```

### Modificateurs de filtre

- **strong** - Applique un filtre passe-bas
- **flavorless** - Applique un filtre passe-haut

Exemple :
```
add strong beer
add flavorless salad
```

### Modificateurs d'effets

| Modificateur | Effet | Description |
|--------------|-------|-------------|
| cheap | Bitcrusher | Son brut et de basse qualité |
| expensive | Reverb | Son avec beaucoup d'espace |
| processed | Chorus | Son modifié artificiellement |
| industrial | Distortion | Son distordu et agressif |
| overpriced | Phaser | Son avec phase changeante |
| vomit | Chebyshev | Son fortement déformé |
| artisanal | Tremolo | Son avec variations d'amplitude |
| bargain | Feedback Delay | Son avec léger écho |
| luxury | Reverb | Son avec longue réverbération |
| artificial | Vibrato | Son avec hauteur oscillante |
| mass-produced | Bitcrusher | Son très dégradé |
| addictive | Ping-Pong Delay | Son avec écho rebondissant |

Exemple :
```
add cheap milk
add luxury chocolate
add artificial soda
```

Vous pouvez combiner jusqu'à 3 modificateurs par produit :

```
add fresh strong cheap beer
```

## Paramètres spéciaux

En plus des modificateurs, vous pouvez ajouter des paramètres spéciaux qui affectent davantage le comportement du produit :

### Nutriscore

Affecte la tonalité (key) du produit :

```
add beer nutriscore A
add ham nutriscore E
```

Les notes vont de A (meilleur) à E (pire) et changent la clé musicale.

### Durée de conservation (Shelf Life)

Contrôle la fréquence de répétition du produit :

```
add milk shelflife today
add bread shelflife year
```

| Durée | Répétition | Notation musicale |
|-------|------------|-------------------|
| today | Très rapide | 32n |
| week | Rapide | 16n |
| month | Moyenne | 8n |
| year | Lente | 4n |
| decade | Très lente | 2n |
| forever | Extrêmement lente | 1n |

### Produit ouvert

Rend le comportement du produit imprévisible :

```
add beer open
```

Les produits ouverts peuvent sauter aléatoirement des répétitions.

### Combinaisons de paramètres

Vous pouvez combiner tous ces paramètres spéciaux :

```
add old beer nutriscore C shelflife month open
```

## Les roues de caddie

Les roues de caddie servent de section rythmique à votre paysage sonore. Chaque type de roue crée un rythme différent :

| Type de roue | Description du rythme |
|--------------|----------------------|
| square | Rythme de base régulier |
| broken | Rythme irrégulier |
| premium | Rythme serré et cohérent |
| defective | Rythme glitchy |
| bargain | Rythme rapide mais inconsistant |
| luxury | Rythme précis avec variations subtiles |
| none | Pas de rythme (silence) |

Exemple d'utilisation :
```
my cart has square wheels
my cart has broken wheels
my cart has no wheels
```

## Modes spéciaux

CONSUME propose plusieurs modes spéciaux qui transforment l'ensemble du paysage sonore :

| Mode | Commande | Effet |
|------|----------|-------|
| Discount | `discount mode on/off` | Désaccorde aléatoirement les produits |
| Inflation | `inflation mode on/off` | Augmente progressivement la hauteur des sons |
| Consumerism | `consumerism mode on/off` | Rend les produits plus addictifs, ajoute des effets de délai |
| Black Friday | `black_friday mode on/off` | Crée une distorsion chaotique et augmente le volume |
| Aisle 7 | `aisle_7 ambience on/off` | Ajoute une réverbération inquiétante et ralentit le tempo |
| Fluorescent Lights | `fluorescent_lights flicker on/off` | Ajoute un effet de trémolo sur les sons |
| Apocalypse | `apocalypse mode on/off` | Distorsion globale, fluctuations de volume et changements aléatoires |

Chaque mode s'active pour une durée limitée et se désactive automatiquement (sauf Apocalypse, qui doit être désactivé manuellement).

## Exemples de scénarios

Voici quelques scénarios d'utilisation pour créer différentes ambiances sonores :

### Supermarché de luxe

```
my cart has luxury wheels
add luxury chocolate
add expensive wine
add artisanal bread
add fresh milk nutriscore A
```

### Dépanneur miteux

```
my cart has broken wheels
add old beer
add cheap chips
add processed pizza shelflife week
add artificial soda open
discount mode on
```

### Frénésie consumériste

```
my cart has premium wheels
add addictive energy_drink
add mass-produced candy
add overpriced chocolate
consumerism mode on
black_friday mode on
```

### Supermarché abandonné

```
my cart has defective wheels
add old milk open
add old ham nutriscore E
aisle_7 ambience on
fluorescent_lights flicker on
```

### Cauchemar consumériste

```
my cart has square wheels
add vomit beer
add industrial oil
add processed pizza
add artificial soda
apocalypse mode on
```

## Dépannage

### L'audio ne fonctionne pas

1. Vérifiez que votre navigateur prend en charge l'API Web Audio
2. Assurez-vous d'avoir cliqué sur le bouton "Enable Sound"
3. Vérifiez que le son n'est pas coupé sur votre système
4. Essayez de rafraîchir la page et de réactiver le son

### Les commandes ne s'exécutent pas

1. Vérifiez la syntaxe de vos commandes
2. Assurez-vous que le produit existe dans le système
3. Vérifiez que vous n'avez pas atteint la limite maximale de produits (20)
4. Essayez d'utiliser le bouton "Run Current Line" au lieu de la touche Entrée

### Performance audio médiocre

1. Fermez les autres applications et onglets qui consomment des ressources
2. Réduisez le nombre de produits actifs
3. Évitez d'utiliser trop de modes spéciaux simultanément
4. Utilisez un ordinateur plus puissant si possible

## Référence technique

### Nombre maximal de produits

Le système limite le nombre de produits actifs à 20 pour maintenir les performances.

### Limites des modificateurs

Chaque produit peut avoir jusqu'à 3 modificateurs simultanément.

### Durée des modes

| Mode | Durée automatique (ms) |
|------|----------------------|
| Discount | 10000 |
| Inflation | 8000 |
| Consumerism | 15000 |
| Black Friday | 12000 |
| Aisle 7 | 20000 |
| Fluorescent Lights | 25000 |
| Apocalypse | Illimitée (désactivation manuelle) |

### Structure des fichiers

- `index.html` - Fichier HTML principal
- `config.js` - Configuration du système
- `command-parser.js` - Analyse et exécution des commandes
- `product-types.js` - Définition des produits et leurs propriétés
- `audio-engine.js` - Moteur audio principal
- `cart-wheels.js` - Gestion des sons de roues de caddie
- `product-manager.js` - Gestion des produits
- `mode-manager.js` - Gestion des modes spéciaux
- `visualization.js` - Visualisation de l'audio
- `ui-effects.js` - Effets visuels de l'interface
- `ui-handlers.js` - Gestionnaires d'événements de l'interface
- `main.js` - Point d'entrée principal
- `_consume-style.css` - Styles CSS

---

*Avec CONSUME: Soundscape of Capitalism, transformez votre navigateur en un laboratoire sonore inquiétant où le consumérisme devient une symphonie dérangeante. N'oubliez pas : les produits vous observent...*
