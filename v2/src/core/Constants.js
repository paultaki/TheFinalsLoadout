/**
 * Central constants file for all animation timings and physics values
 * DO NOT MODIFY - These values are critical for animation fidelity
 */

// Slot Machine Physics
export const SLOT_PHYSICS = {
  ACCELERATION: 8000,
  MAX_VELOCITY: 5000,
  DECELERATION: -3500,
  BOUNCE_DAMPENING: 0.4,
  ITEM_HEIGHT: 188,
  TIMING: {
    REGULAR_SPIN: {
      COLUMN_DELAY: 250,
      BASE_DURATION: 800,
      DECELERATION_TIME: 400,
    },
    FINAL_SPIN: {
      COLUMN_DELAY: 200,
      BASE_DURATION: 2500,
      DECELERATION_TIME: 800,
      COLUMN_STOPS: [3000, 4000, 5200, 6000, 7000],
    },
  },
};

// Price Wheel Physics (Price is Right style)
export const SPIN_PHYSICS = {
  initialVelocity: { min: 4800, max: 5600 },
  friction: 0.985,
  decelerationThreshold: 600,
  decelerationDuration: 600,
  idleSpeed: 0.3,
  minTickVelocity: 50
};

// Roulette Wheel Configuration
export const ROULETTE_CONFIG = {
  baseClasses: [
    { name: 'Light', color: '#4FC3F7' },
    { name: 'Medium', color: '#AB47BC' },
    { name: 'Heavy', color: '#FF1744' }
  ],
  spinDuration: 8000,
  minRotations: 8,
  maxRotations: 12,
  ballDuration: 7500,
  ballRadius: 140,
  finalRadius: 100,
  wheelRadius: 160,
  outerRadius: 185,
  phases: {
    launch: 0.15,
    coast: 0.35,
    decelerate: 0.25,
    spiral: 0.15,
    bounce: 0.07,
    settle: 0.03
  }
};

// Slot Column Animation Timings
export const SLOT_TIMING = {
  ANIMATION_SAFETY_TIMEOUT: 10000, // 10 second safety timeout
  FRAME_DURATION: 16.67, // Target 60fps
  BLUR_THRESHOLD_VELOCITY: 2000,
  SNAP_THRESHOLD_VELOCITY: 50,
  BOUNCE_VELOCITY_MULTIPLIER: 0.5
};

// General Animation Constants
export const ANIMATION_CONSTANTS = {
  WAIT_FOR_GLOBAL_TIMEOUT: 4000,
  DEFAULT_FALLBACK_COUNT: "31,846",
  LOCAL_COUNTER_DEFAULT: "5321",
  MOBILE_WIDTH_THRESHOLD: 768
};

// Reveal Card Durations
export const REVEAL_TIMING = {
  DEFAULT_DURATION: 2000,
  JACKPOT_SOUND_DURATION: 1500,
  FADE_OUT_DELAY: 300
};

// CSS Animation Names (DO NOT CHANGE)
export const CSS_ANIMATIONS = {
  SLOT_BLUR: 'slot-blur',
  SLOT_SNAP: 'slot-snap', 
  PULSE: 'pulse',
  GLOW_PULSE: 'glowPulse',
  DIGITAL_FLICKER: 'digitalFlicker',
  WINNER_GLOW: 'winnerGlow',
  HOLOGRAPHIC_SHIMMER: 'holographicShimmer',
  FRAME_GLOW: 'frameGlow',
  WHEEL_COMPLETE: 'wheelComplete'
};

// Easing Functions
export const EASING = {
  easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3)
};