/**
 * Feature flags for controlling experimental features
 */

export const FEATURE_FLAGS = {
  // Use new RouletteWheel component instead of ClassRoulette
  USE_NEW_ROULETTE: true,
} as const;

// Development toggle for testing (can be controlled via localStorage)
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('USE_NEW_ROULETTE');
  if (stored !== null) {
    (FEATURE_FLAGS as any).USE_NEW_ROULETTE = stored === 'true';
  }
}