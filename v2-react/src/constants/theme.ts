export const COLORS = {
  classes: {
    Light: { base: '#3b82f6', dark: '#2563eb', light: '#60a5fa' },
    Medium: { base: '#10b981', dark: '#059669', light: '#34d399' },
    Heavy: { base: '#ef4444', dark: '#dc2626', light: '#f87171' },
  },
  ui: {
    gold: '#ffd700',
    goldLight: '#ffed4e',
    goldDark: '#c79800',
    metallic: {
      light: '#3a3a3a',
      medium: '#2a2a2a',
      dark: '#1a1a1a',
    },
  },
} as const;

export const BREAKPOINTS = {
  mobile: 375,
  tablet: 768,
  desktop: 1024,
} as const;
