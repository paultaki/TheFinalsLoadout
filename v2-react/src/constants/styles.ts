/**
 * Style constants for colors, shadows, and visual effects
 */

// Extended color palette
export const COLORS_EXTENDED = {
  classes: {
    light: {
      base: '#4FC3F7',
      dark: '#29B6F6',
      light: '#81D4FA',
    },
    medium: {
      base: '#AB47BC',
      dark: '#7B1FA2',
      light: '#CE93D8',
    },
    heavy: {
      base: '#FF1744',
      dark: '#D50000',
      light: '#FF5252',
    },
  },
  metallic: {
    rim: {
      inner: '#3a3a3a',
      mid: '#2a2a2a',
      outer: '#1a1a1a',
      glow: '#7B1FA2', // Purple underglow
    },
    hub: {
      light: '#4a4a4a',
      medium: '#2a2a2a',
      dark: '#1a1a1a',
    },
  },
  gold: {
    primary: '#FFD700',
    light: '#FFED4E',
    accent: '#AB47BC', // Purple accent in gold gradient
  },
  particles: {
    purple: '#AB47BC',
    blue: '#4FC3F7',
    gold: '#FFD700',
    red: '#FF1744',
  },
  confetti: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
  ui: {
    scanlines: 'rgba(255, 255, 255, 0.03)',
    segmentBorder: 'rgba(0, 0, 0, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    dataStreamRed: '#FF1744',
    dataStreamPurple: '#AB47BC',
  },
} as const;

// Shadow configurations
export const SHADOWS = {
  text: {
    blur: 4,
    offsetX: 2,
    offsetY: 2,
  },
  wheel: {
    neonGlow: {
      small: '0 0 60px rgba(171, 71, 188, 0.6)',
      large: '0 0 120px rgba(171, 71, 188, 0.4)',
    },
    depth: {
      outer: '0 0 50px rgba(0, 0, 0, 0.8)',
      inset: 'inset 0 0 30px rgba(0, 0, 0, 0.5)',
      drop: '0 10px 40px rgba(0, 0, 0, 0.6)',
    },
    hub: {
      primary: '0 0 40px rgba(171, 71, 188, 0.8)',
      secondary: '0 0 80px rgba(171, 71, 188, 0.4)',
      inset: 'inset 0 0 20px rgba(171, 71, 188, 0.3)',
    },
    pointer: 'drop-shadow(0 0 20px rgba(255, 23, 68, 0.8))',
    logo: 'drop-shadow(0 0 10px rgba(171, 71, 188, 0.8))',
  },
  particle: (color: string, size: number) => `0 0 ${size * 2}px ${color}`,
} as const;

// Gradient configurations
export const GRADIENTS = {
  metallic: {
    rim: (centerX: number, centerY: number, inner: number, outer: number) => ({
      type: 'radial',
      x1: centerX,
      y1: centerY,
      r1: inner,
      x2: centerX,
      y2: centerY,
      r2: outer,
      stops: [
        { offset: 0, color: '#3a3a3a' },
        { offset: 0.3, color: '#2a2a2a' },
        { offset: 0.7, color: '#1a1a1a' },
        { offset: 1, color: '#7B1FA2' },
      ],
    }),
    gold: (centerX: number, centerY: number, inner: number, outer: number) => ({
      type: 'radial',
      x1: centerX,
      y1: centerY,
      r1: inner,
      x2: centerX,
      y2: centerY,
      r2: outer,
      stops: [
        { offset: 0, color: '#FFD700' },
        { offset: 0.3, color: '#FFED4E' },
        { offset: 0.6, color: '#AB47BC' },
        { offset: 1, color: '#FFD700' },
      ],
    }),
  },
  hexagonalGrid: {
    angles: [30, 150, 30, 150, 60, 60],
    percentages: {
      start: 12,
      gap: 0.5,
      end: 87,
      accent: 25,
      accentGap: 0.5,
      accentEnd: 75,
    },
    size: '80px 140px',
    positions: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px',
  },
  scanlines: {
    size: '2px',
    gap: '2px',
    duration: '8s',
  },
} as const;

// Filter effects
export const FILTERS = {
  blur: {
    spinning: 'blur(2px)',
    glow: 'blur(20px)',
  },
  transition: {
    filter: '0.3s',
  },
} as const;

// Z-index layers
export const Z_INDEX = {
  background: 0,
  wheel: 10,
  pointer: 20,
  celebration: 9999,
} as const;

// Animation configurations
export const ANIMATIONS = {
  dataStream: {
    duration: '0.5s',
    delay: '0.2s',
  },
  scanlines: {
    duration: '8s',
    timing: 'linear',
  },
  confetti: {
    minDuration: '2s',
    maxDuration: '3s', // 2 + 1
  },
  screenFlash: {
    duration: '0.3s',
    timing: 'ease-out',
  },
  glitchTransition: {
    duration: '300ms',
  },
} as const;

// Opacity values
export const OPACITY = {
  background: {
    hexGrid: 0.2,
    dataStream: 0.6,
  },
  particle: {
    calculation: (created: number, lifetime: number) => 
      1 - (Date.now() - created) / lifetime,
  },
} as const;

// Transform values
export const TRANSFORMS = {
  pointer: {
    rotation: 'rotate(180deg)',
  },
  hub: {
    center: 'translate(-50%, -50%)',
  },
  glow: {
    scale: 'scale(1.1)',
  },
  heartbeat: {
    scales: ['scale(1)', 'scale(1.03)', 'scale(1)'],
  },
  cabinet: {
    shake: ['translateX(-4px)', 'translateX(4px)', 'translateX(0)'],
  },
} as const;