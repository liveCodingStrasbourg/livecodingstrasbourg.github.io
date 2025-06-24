# Performance Improvements for SUPERMARKET Audio Engine

## Overview
This document outlines the performance optimizations implemented to reduce audio glitches when sounds play quickly.

## Key Optimizations Implemented

### 1. Performance Manager (`performance-manager.js`)
- **Voice Management**: Limits simultaneous voices to prevent CPU overload (default: 12 voices)
- **Voice Stealing**: Automatically stops oldest/lowest priority sounds when limit is reached
- **Effect Pooling**: Reuses effect instances instead of creating new ones
- **Synth Pooling**: Pre-allocates synths for faster instantiation
- **Performance Monitoring**: Tracks dropped voices, effect reuses, and system health

### 2. Audio Context Optimization
- **Lookahead Time**: Adjustable based on performance mode
  - Performance mode: 10ms (low latency, may glitch)
  - Balanced mode: 30ms (good balance)
  - Quality mode: 100ms (smoother, higher latency)
- **Update Interval**: Optimized for each mode

### 3. Additional Optimizations (`audio-optimizations.js`)
- **Throttling**: Limits frequency of parameter updates
- **Batch Updates**: Groups audio parameter changes using requestAnimationFrame
- **Efficient Patterns**: Pre-calculates escalator patterns
- **Lightweight Synths**: Adds envelope gating to reduce CPU when not playing

## Performance Commands

### Check Performance Stats
```
performance stats
show performance
```
Shows:
- Active voices vs maximum
- Dropped voices count
- Effect/synth reuse statistics
- Current performance mode

### Change Performance Mode
```
performance mode performance  // Low latency, may glitch
performance mode balanced     // Default, good balance
performance mode quality      // Smooth audio, higher latency
```

## Configuration

### Adjust Maximum Polyphony
In `performance-manager.js`:
```javascript
config: {
  maxPolyphony: 12,  // Reduce for better performance
  ...
}
```

### Enable/Disable Features
- `voiceStealingEnabled`: Auto-stop old sounds (default: true)
- `effectReuseEnabled`: Reuse effects from pool (default: true)

## Best Practices for Users

1. **Keep Active Products Under Limit**: Remove products before adding new ones
2. **Use Performance Mode**: When experiencing glitches, switch to performance mode
3. **Monitor Stats**: Check performance stats regularly
4. **Reduce Complexity**: Avoid too many complex modifiers simultaneously

## Technical Details

### Voice Priority System
- Each product gets priority 1 by default
- Voice stealing targets lowest priority first
- Older voices stolen before newer ones at same priority

### Effect Pool Management
- Maximum 8 effects per type in pool
- Automatic cleanup every 30 seconds
- Effects reset to default state when returned to pool

### Synth Pool
- 16 pre-allocated synths
- Covers common types: FM, AM, Pluck, Duo, basic Synth
- Muted when not in use to save CPU

## Future Improvements
- Dynamic polyphony adjustment based on CPU usage
- Web Worker for non-critical calculations
- WebAssembly for critical DSP operations
- Adaptive quality based on device performance