/**
 * UI-related constants for components and interactions
 */

// Array indices for better readability
export const ARRAY_INDICES = {
  first: 0,
  second: 1,
  third: 2,
  fourth: 3,
  fifth: 4,
} as const;

// Component-specific constants
export const UI_CONSTANTS = {
  spinSelector: {
    cardMargin: 16, // Margin between cards in pixels
    defaultCardHeight: 90, // Default card height if not calculated
    dataStreamWidth: 2, // Width of data stream animation
    dataStreamHeight: 8, // Height of data stream animation
    winnerBannerDuration: 3000, // How long to show winner banner
    idleRestartDelay: 1000, // Delay before restarting idle animation
    autoSpinDelay: 1000, // Delay before auto-spinning
    jackpotSpins: {
      min: 2,
      max: 4,
    },
  },
  slotMachine: {
    columnCount: 5, // Number of slot columns
    velocityMultiplier: 60, // Multiplier for velocity calculation
    spinsBeforeStopping: 3, // Number of full rotations before stopping
  },
  wheel: {
    dpr: 1, // Default device pixel ratio
    outerRadiusOffset: 0.55, // Text position as ratio of outer radius
    logoObjectFit: 'contain' as const,
    pointerRotation: 180, // Pointer rotation in degrees
    dataStreamAnimationDelay: 0.2, // Delay between data streams
    particlePercent: 100, // Max percentage for particle positioning
    triangleHeightRatio: 1.5, // Height ratio for triangle particles
  },
  resultModal: {
    fadeInDelay: 100, // Delay before modal fade in
    fadeOutDuration: 300, // Duration of modal fade out
  },
  general: {
    percentageDivisor: 100, // For converting to percentage
    halfDivisor: 2, // For calculating center points
    gradientStops: {
      start: 0,
      mid: 0.5,
      nearEnd: 0.7,
      end: 1,
    },
  },
} as const;

// Media query breakpoints
export const MEDIA_QUERIES = {
  mobile: 768,
  tablet: 1024,
} as const;

// Z-index values for layering
export const Z_INDICES = {
  background: 0,
  wheel: 10,
  pointer: 20,
  modal: 1000,
  celebration: 9999,
} as const;

// Iteration counts
export const ITERATIONS = {
  wheel: {
    classPattern: 4, // Number of times to repeat class pattern
    segments: 3, // Number of different class types
  },
  animation: {
    single: 1, // Single iteration
  },
} as const;