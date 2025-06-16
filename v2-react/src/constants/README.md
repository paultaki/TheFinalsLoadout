# Constants Directory

This directory contains all extracted magic numbers and string constants from the codebase, organized by category.

## Files

### physics.ts
- **PHYSICS**: Friction, velocity thresholds, particle physics
- **DIMENSIONS**: Size ratios, responsive sizes, canvas dimensions
- **TIMING**: Animation durations, delays, timeouts
- **THRESHOLDS**: Swipe detection, audio settings, blur effects
- **SLOT_PHYSICS**: Slot machine specific physics
- **NUMBERS**: Common numeric constants (segments, angles, opacity values)

### styles.ts
- **COLORS_EXTENDED**: Extended color palette for all UI elements
- **SHADOWS**: Shadow configurations for various components
- **GRADIENTS**: Gradient definitions and configurations
- **FILTERS**: CSS filter effects
- **Z_INDEX**: Z-index layering values
- **ANIMATIONS**: Animation timing and configurations
- **OPACITY**: Opacity calculations and values
- **TRANSFORMS**: Transform values for animations

### ui.ts
- **ARRAY_INDICES**: Named array indices for better readability
- **UI_CONSTANTS**: Component-specific UI values
- **MEDIA_QUERIES**: Breakpoint values
- **Z_INDICES**: Additional z-index values
- **ITERATIONS**: Loop iteration counts

### Existing Files
- **animation.ts**: Animation timing constants
- **roulette.ts**: Roulette wheel specific constants
- **sounds.ts**: Sound file paths
- **theme.ts**: Base theme colors and breakpoints

## Usage

Import the constants you need:

```typescript
import { PHYSICS, TIMING } from '../constants/physics';
import { COLORS_EXTENDED, SHADOWS } from '../constants/styles';
import { UI_CONSTANTS } from '../constants/ui';
```

All values are kept exactly as they were in the original code - only extracted into named constants for better maintainability.