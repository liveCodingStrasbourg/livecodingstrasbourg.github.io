# 🔪 Abandoned Supermarket of Horrors - Documentation

## Overview

The Horror Supermarket Live Coding Environment is an experimental audio playground that lets you create disturbing soundscapes using supermarket-themed commands. This browser-based tool combines live coding with horror aesthetics to create an unsettling audio experience.

## Getting Started

1. Open `index.html` in your browser
2. Type commands in the editor area
3. Use "Run Current Line" to execute a single command (or press **Ctrl+Enter**)
4. Or use "Run All" to execute all commands in the editor (or press **Ctrl+Shift+Enter**)
5. Use "Stop All" to silence everything
6. Click "🎲 Random Command" to generate and execute a random command

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl+Enter** | Execute current line |
| **Ctrl+Shift+Enter** | Execute all lines |

## Command Reference

### Rhythm Section (Cart Wheels)

Create rhythmic foundations with these commands:

```
my cart has square wheels     // Creates a steady techno beat (4/4)
my cart has bad wheels        // Creates a broken breakbeat pattern
my cart has 3 wheels          // Creates a randomized beat pattern (different each time)
my cart has no wheels         // Turns off all rhythmic elements
```

### Adding Products (Synths)

Each product has a unique synth sound. Add them with:

```
add beer                      // FM synth with harmonics
add salad                     // Square wave AM synth 
add ham                       // Sawtooth mono synth
add milk                      // Plucked string synth
add chips                     // Noise-based synth (white noise)
add pizza                     // Duo synth with vibrato (triangle/sine mix)
add oil                       // Membrane synth (deep bass drum)
add pinard                    // Poly synth (plays chords)
add huitsix                   // Harsh AM synth with square wave
add rotting                   // Metallic synth for disturbing sounds
```

### Modifier Categories

Products can be modified with these categories:

#### Pitch Modifiers
```
add fresh [product]           // Higher octave version
add old [product]             // Lower octave version
```

#### Filtering Modifiers
```
add strong [product]          // Low-pass filter (removes high frequencies)
add flavorless [product]      // High-pass filter (removes low frequencies)
```

#### Effect Modifiers
```
add cheap [product]           // Bitcrusher effect (lo-fi, crunchy sound)
add expensive [product]       // Reverb effect (spacious, premium sound)
add processed [product]       // Chorus effect (warbled, unnatural sound)
add industrial [product]      // Distortion effect (harsh, gritty sound)
add overpriced [product]      // Phaser effect (sweeping, modulated sound)
add vomit [product]           // Chebyshev effect (harmonically rich, disgusting)
add artisanal [product]       // Tremolo effect (wavering, unstable sound)
```

### Combining Modifiers

You can combine modifiers for more complex sounds:

```
add strong old beer           // Lower octave beer with low-pass filter
add flavorless old salad      // Lower octave salad with high-pass filter
add cheap fresh ham           // Higher octave ham with bitcrusher
add industrial old milk       // Lower octave milk with distortion
add artisanal fresh pizza     // Higher octave pizza with tremolo
add vomit old oil             // Lower octave oil with chebyshev distortion
```

### Special Modes

Special modes add chaos and variation:

```
discount mode on              // Randomizes pitch parameters (auto-off after 10s)
discount mode off             // Manually turn off discount mode
inflation mode on             // Makes everything pitch slide upward (auto-off after 5s)
inflation mode off            // Manually turn off inflation mode
apocalypse mode on            // Unleashes complete chaos (auto-off after 30s)
apocalypse mode off           // Manually turn off apocalypse mode
```

### Removing Products

```
remove [product]              // Removes all instances of a specific product
```

## Example Sequences

Here are some example sequences to try:

### Basic Beat and Melody
```
my cart has square wheels
add beer
add fresh salad
add old ham
```

### Horror Atmosphere
```
my cart has bad wheels
add vomit beer
add industrial oil
add artisanal milk
add cheap chips
```

### Full Chaos
```
my cart has 3 wheels
add cheap industrial oil
add vomit rotting
add processed pizza
add old huitsix
apocalypse mode on
```

## Working with the Interface

### Keyboard Shortcuts
- **Ctrl+Enter**: Execute the current line under the cursor
- **Ctrl+Shift+Enter**: Execute all lines in the editor
- These shortcuts make live coding much faster and more fluid

### Buttons
- **Run Current Line**: Execute only the line where the cursor is positioned
- **Run All**: Execute all lines in the editor in sequence
- **Stop All**: Stop all sounds and reset the environment
- **🎲 Random Command**: Generate and execute a random command

## Product Sound Characteristics

| Product | Synth Type | Sound Character | Notes |
|---------|------------|-----------------|-------|
| beer    | FM Synth   | Harmonic, rich  | C4    |
| salad   | AM Synth   | Square wave, digital | E4 |
| ham     | Mono Synth | Sawtooth, thick | G4   |
| milk    | Pluck Synth | String-like, soft | A4 |
| chips   | Noise Synth | White noise, crunchy | N/A |
| pizza   | Duo Synth   | Layered, vibrato | D4 |
| oil     | Membrane Synth | Deep bass drum | F2 |
| pinard  | Poly Synth  | Chord-based | B3, D4, F#4 |
| huitsix | AM Synth    | Harsh, square wave | G2 |
| rotting | Metal Synth | Metallic, inharmonic | C2 |

## Effect Characteristics

| Modifier   | Effect Type | Sound Character |
|------------|-------------|-----------------|
| fresh      | Pitch Shift | Brighter, higher octave (+12 semitones) |
| old        | Pitch Shift | Darker, lower octave (-12 semitones) |
| strong     | Low-pass Filter | Muffled, removes high frequencies |
| flavorless | High-pass Filter | Thin, removes low frequencies |
| cheap      | Bitcrusher | Lo-fi, crunchy, digital degradation |
| expensive  | Reverb | Spacious, echoing, atmospheric |
| processed  | Chorus | Warbled, detuned, shimmery |
| industrial | Distortion | Harsh, gritty, aggressive |
| overpriced | Phaser | Sweeping, modulated, psychedelic |
| vomit      | Chebyshev | Harmonically distorted, nasty |
| artisanal  | Tremolo | Wavering, pulsating amplitude |

## Special Modes Explained

### Discount Mode
- Randomly detunes each note by +/- 50 cents
- Creates unstable, wobbly pitch variation
- Automatically deactivates after 10 seconds
- Visual effect: screen shakes

### Inflation Mode
- Gradually slides all pitches upward by 20%
- Then returns to normal pitch
- Automatically deactivates after 5 seconds
- Visual effect: interface floats upward

### Apocalypse Mode
- Randomly adds and removes products
- Applies random tempo changes
- Adds distortion to master output
- Shows frequent spooky messages
- Automatically deactivates after 30 seconds
- Visual effect: violent screen shaking

## Technical Notes

- Built with Tone.js web audio framework
- Uses JavaScript for audio synthesis and sequencing
- No external audio samples (everything is generated with synths)
- All audio effects are created using Tone.js processors
- CSS animations provide visual feedback for different modes

## Horror Elements

The environment includes these creepy features:

- Random blood stains and mold spots on the interface
- Blood dripping animation from the top of the screen
- Flickering light effect on the editor
- Occasional spooky messages that appear during playback
- Receipt from Hell output log
- Product names highlighted in sickly yellow

## Advanced Techniques

- **Live Coding Flow**: Use Ctrl+Enter to quickly iterate on sounds
- **Layering**: Combine multiple products for richer textures
- **Effect Stacking**: Apply multiple modifiers for complex sounds
- **Rhythmic Patterns**: Use different cart wheels for rhythm variety
- **Timing**: Add products at different times for evolving compositions
- **Chaos Control**: Use apocalypse mode sparingly for dramatic moments
- **Generative Music**: Use the random command button to discover new combinations

## Troubleshooting

- **No Sound**: Click any button to initialize the audio engine
- **Performance Issues**: Remove products that you're not using
- **Extreme Effects**: Use Stop All if things get too chaotic
- **Browser Compatibility**: Works best in Chrome and Firefox

Enjoy your horrific sonic journey through the Abandoned Supermarket of Horrors!