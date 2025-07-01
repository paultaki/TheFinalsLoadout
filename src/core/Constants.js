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
  ANIMATION_SAFETY_TIMEOUT: 10000, // 10 second safety timeout (line 530)
  ANIMATION_TOTAL_TIMEOUT: 15000,  // 15 second timeout (line 1328)
  FRAME_DURATION: 16.67, // Target 60fps (line 578)
  BLUR_THRESHOLD_VELOCITY: 2000,
  SNAP_THRESHOLD_VELOCITY: 50,
  BOUNCE_VELOCITY_MULTIPLIER: 0.5,
  ANIMATION_START_DELAY: 50,       // Delay before starting animation (line 1142)
  LANDING_FLASH_DELAY: 300,        // Delay for landing flash effect (line 1491)
  LOCK_IN_DELAY: 300,              // Delay for lock-in animation (line 746)
  COLUMN_STOP_DELAY: 200,          // Delay between column stops (line 1498)
  SCREEN_SHAKE_DURATION: 200,      // Duration of screen shake (line 767)
  FINALIZE_DELAY_REGULAR: 300,     // Delay for regular spin finalization (line 1530)
  FINALIZE_DELAY_FINAL: 1000       // Delay for final spin finalization (line 1530)
};

// Animation phase durations
export const ANIMATION_PHASES = {
  ACCELERATION_PHASE: 500,         // 0-500ms acceleration phase (line 585)
  SNAPBACK_ACCELERATION: 0.8,      // Gentler snapback multiplier (line 648)
  VELOCITY_VARIATION: 200,         // Velocity variation amount (line 607)
  VELOCITY_VARIATION_RATE: 100,    // Sin wave rate for velocity variation (line 607)
  OVERSHOOT_AMOUNT: 0.3,           // 30% overshoot (line 615)
  OVERSHOOT_AMOUNT_GADGET: 0.2,    // 20% overshoot for gadgets (line 621)
  SNAPBACK_VELOCITY_MULT: 0.5,     // Reverse at 50% speed (line 640)
  ACCELERATION_POWER: 2,           // Power for exponential acceleration (line 592)
  ACCELERATION_MAX_MULT: 3         // Up to 3x acceleration (line 592)
};

// Blur effect thresholds
export const BLUR_THRESHOLDS = {
  EXTREME_VELOCITY: 3500,   // Velocity for extreme blur (line 798)
  EXTREME_BLUR: 8,          // 8px blur (line 799)
  HIGH_VELOCITY: 2000,      // Velocity for high speed blur (line 801)
  HIGH_BLUR: 3,             // 3px blur (line 802)
  MEDIUM_VELOCITY: 1000,    // Velocity for medium blur (line 804)
  MEDIUM_BLUR: 1            // 1px blur (line 805)
};

// Glow effect parameters
export const GLOW_EFFECTS = {
  BASE_INTENSITY: 20,        // Base glow intensity (line 855)
  INTENSITY_DIVISOR: 100,    // Velocity to intensity conversion (line 855)
  BASE_OPACITY: 0.2,         // Base glow opacity (line 856)
  OPACITY_DIVISOR: 10000,    // Velocity to opacity conversion (line 856)
  MAX_INTENSITY: 100,        // Maximum glow intensity (line 859)
  MAX_OPACITY: 1             // Maximum glow opacity (line 860)
};

// Sound volumes
export const SOUND_VOLUMES = {
  COLUMN_STOP: 0.5,         // Column stop sound volume (line 753)
  SPIN_START: 0.6,          // Spin start sound volume (line 1257)
  SPINNING: 0.25,           // Spinning sound volume reduced by 50% (line 1267)
  TRANSITION: 0.6,          // Transition sound between spins (line 2310)
  CELEBRATION: 0.7          // Celebration sound at end (line 2778)
};

// Velocity thresholds
export const VELOCITY_THRESHOLDS = {
  STOP_VELOCITY: 100,       // Velocity to trigger stop (lines 641, 651)
  BOUNCE_STOP: 50,          // Velocity to stop bouncing (line 663)
  MIN_VELOCITY: 50,         // Minimum velocity threshold (line 652)
  DT_CAP: 50               // Cap deltaTime at 50ms (line 582)
};

// Shake effect parameters
export const SHAKE_EFFECTS = {
  SNAPBACK_SHAKE_RATE: 50,  // Shake frequency during snapback (line 824)
  SNAPBACK_SHAKE_AMOUNT: 3  // Shake amplitude (line 824)
};

// General Animation Constants
export const ANIMATION_CONSTANTS = {
  WAIT_FOR_GLOBAL_TIMEOUT: 4000,
  WAIT_FOR_GLOBAL_INTERVAL: 50,   // Check interval for globals (line 14)
  DEFAULT_FALLBACK_COUNT: "31,846",
  LOCAL_COUNTER_DEFAULT: "5321",
  MOBILE_WIDTH_THRESHOLD: 768
};

// UI timing
export const UI_TIMING = {
  FILTER_STATUS_DURATION: 2000,    // Filter status message duration (lines 1692, 1907)
  NEXT_SPIN_DELAY: 200,            // Delay before next spin in sequence (line 2335)
  HISTORY_ADD_DELAY: 500,           // Delay before adding to history (lines 2637, 2649)
  BUTTON_FEEDBACK_DURATION: 2000,   // Button state feedback duration (lines 3838, 3851, 3894)
  AUDIO_RELOAD_DELAY: 100,          // Audio reload delay for mobile (line 2936)
  COUNTDOWN_UPDATE_INTERVAL: 3600000 // Countdown update interval - 1 hour (line 3985)
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

// Celebration effects
export const CELEBRATION_EFFECTS = {
  FLOATING_TEXT_DURATION: 2000,     // Floating celebration text duration (line 2834)
  FLOATING_TEXT_STAGGER: 100,       // Stagger delay between floating texts (line 2835)
  BANNER_FADE_DURATION: 500,        // Banner fade out duration (line 2841)
  BANNER_DISPLAY_DURATION: 3000,    // Total banner display time (line 2844)
  SCREEN_SHAKE_DURATION: 600,       // Celebration screen shake (line 2854)
  BUTTON_ANIMATION_DURATION: 500    // Spin button move animation (line 2689)
};

// Particle effects
export const PARTICLE_EFFECTS = {
  WAVE_COUNT: 3,                    // Number of particle waves (line 2865)
  PARTICLES_PER_WAVE: 12,           // Particles in each wave (line 2866)
  BASE_VELOCITY: 150,               // Base particle velocity (line 2871)
  VELOCITY_INCREMENT: 50,           // Velocity increase per wave (line 2871)
  MIN_SIZE: 4,                      // Minimum particle size (line 2872)
  SIZE_RANGE: 8,                    // Particle size variation (line 2872)
  BASE_DURATION: 800,               // Base animation duration (line 2908)
  DURATION_INCREMENT: 200,          // Duration increase per wave (line 2908)
  WAVE_DELAY: 100                   // Delay between waves (line 2917)
};

// Roast display timing
export const ROAST_TIMING = {
  FADE_OUT_DURATION: 500,           // Roast container fade out (lines 3184, 3255)
  DISPLAY_DURATION: 10000           // Roast display time (lines 3185, 3256)
};

// Export settings
export const EXPORT_SETTINGS = {
  CANVAS_SCALE: 2                   // HTML2Canvas quality scale (line 2808)
};

// Easing Functions
export const EASING = {
  easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3)
};