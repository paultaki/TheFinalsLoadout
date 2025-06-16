/**
 * Physics constants for animations and interactions
 */

// Friction and velocity decay
export const PHYSICS = {
  friction: {
    spinning: 0.988, // Velocity decay factor for spinning animations
  },
  velocity: {
    thresholds: {
      deceleration: 600, // Velocity threshold to start deceleration
      tickSound: 50, // Minimum velocity for tick sounds
    },
    initial: {
      min: 2400, // Minimum initial spin velocity
      max: 2800, // Maximum initial spin velocity (2400 + 400)
    },
  },
  particle: {
    gravity: 0.5,
    velocity: {
      min: 5,
      max: 15,
    },
    lifetime: {
      min: 800,
      max: 1200,
    },
    glitchProbability: 0.05,
    glitchMagnitude: 10,
  },
} as const;

// Size ratios and dimensions
export const DIMENSIONS = {
  wheel: {
    innerRadiusRatio: 0.3, // Inner radius as ratio of outer radius
    hubSizeRatio: 0.25, // Hub size as ratio of wheel size
    pointerSizeRatio: 0.15, // Pointer size as ratio of wheel size
    logoSizeRatio: 0.7, // Logo size as ratio of hub size
    rimWidth: 20, // Width of the metallic rim
    goldRingWidth: 5, // Width of the gold inner ring
    segmentInset: 25, // Inset of segments from outer edge
  },
  canvas: {
    padding: 10, // Canvas padding from edge
    fontSize: 20, // Font size divisor (size / 20)
  },
  responsive: {
    minWheelSize: 300,
    maxWheelSizeRatio: 0.6, // Max wheel size as ratio of viewport width
    maxWheelSize: 500,
  },
} as const;

// Animation timings
export const TIMING = {
  wheel: {
    spins: {
      min: 6, // Minimum full rotations
      max: 8, // Maximum full rotations
    },
    duration: 4, // Total spin duration in seconds
    resultDelay: 2000, // Delay before showing result in ms
    fallbackDuration: 5000, // Fallback duration without GSAP
  },
  spinSelector: {
    deceleration: 400, // Deceleration duration in ms
    tickDuration: 90, // Pointer tick animation duration
    heartbeatThreshold: 120, // Velocity threshold for heartbeat effect
    heartbeatDuration: 300, // Heartbeat animation duration
    cabinetShakeDuration: 90, // Cabinet shake duration
    idleSpeed: 0.3, // Idle animation scroll speed
  },
  confetti: {
    duration: 3000, // Confetti lifetime in ms
    staggerDelay: 300, // Delay between multiple confetti bursts
  },
  particles: {
    cleanupDelay: 500, // Delay before removing particle container
  },
} as const;

// Thresholds and limits
export const THRESHOLDS = {
  swipe: {
    minDistance: 50, // Minimum swipe distance in pixels
    minVelocity: 0.5, // Minimum swipe velocity
  },
  audio: {
    volume: {
      max: 1,
      speedDivisor: 500, // Speed divisor for volume calculation
    },
    playbackRate: {
      max: 1.5,
      speedDivisor: 300, // Speed divisor for playback rate
    },
  },
  blur: {
    rotationThreshold: 720, // Rotation threshold for blur effect
  },
} as const;

// Slot machine physics
export const SLOT_PHYSICS = {
  height: 120, // Height of each slot
  totalSlots: 15, // Total number of slots per column
  staggerDelay: 120, // Delay between column starts
  duration: {
    normal: 2500, // Normal spin duration
    final: 5000, // Final spin duration
  },
  easing: {
    progressThreshold: 0.8, // Progress threshold for easing transition
  },
} as const;

// Numeric constants
export const NUMBERS = {
  segments: 12, // Number of wheel segments
  columns: 5, // Number of slot machine columns
  particleCount: {
    desktop: 50,
    mobile: 30,
    tablet: 40,
  },
  confettiCount: 50,
  confettiColors: 4, // Number of confetti color options
  fullCircle: 360, // Degrees in a full circle
  rightAngle: 90, // Degrees in a right angle
  opacity: {
    fadeTop: 0.2, // Opacity for fade effects
    gloss: {
      start: 0.15,
      mid: 0.05,
      end: 0,
    },
  },
  animation: {
    powerExponent: 2, // Power for easing functions (-10 * t)
    cubicExponent: 3, // Cubic easing exponent
    dataStreamCount: 2, // Number of data stream particles
  },
} as const;