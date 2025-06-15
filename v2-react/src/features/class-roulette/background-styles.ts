import { COLORS_EXTENDED, SHADOWS, GRADIENTS, FILTERS, OPACITY } from '../../constants/styles';

// Generate hexagonal grid background styles
export const getHexagonalGridStyles = () => {
  const backgroundImage = GRADIENTS.hexagonalGrid.angles
    .map((angle, i) => {
      const color = i < 4 ? COLORS_EXTENDED.metallic.rim.outer : 'rgba(171, 71, 188, 0.1)';
      const percent = GRADIENTS.hexagonalGrid.percentages;
      if (i < 4) {
        return `linear-gradient(${angle}deg, ${color} ${percent.start}%, transparent ${
          percent.start + percent.gap
        }%, transparent ${percent.end}%, ${color} ${percent.end + percent.gap}%, ${color})`;
      } else {
        return `linear-gradient(${angle}deg, ${color} ${percent.accent}%, transparent ${
          percent.accent + percent.accentGap
        }%, transparent ${percent.accentEnd}%, ${color} ${percent.accentEnd}%, ${color})`;
      }
    })
    .join(', ');

  return {
    opacity: OPACITY.background.hexGrid,
    backgroundImage,
    backgroundSize: GRADIENTS.hexagonalGrid.size,
    backgroundPosition: GRADIENTS.hexagonalGrid.positions,
  };
};

// Generate scanlines overlay styles
export const getScanlinesStyles = () => {
  return {
    background: `repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent ${GRADIENTS.scanlines.size},
      ${COLORS_EXTENDED.ui.scanlines} ${GRADIENTS.scanlines.size},
      ${COLORS_EXTENDED.ui.scanlines} ${parseInt(GRADIENTS.scanlines.size) * 2}px
    )`,
    animation: `scanlines ${GRADIENTS.scanlines.duration} linear infinite`,
  };
};

// Generate wheel shadow styles
export const getWheelShadowStyles = () => {
  return {
    boxShadow: `
      ${SHADOWS.wheel.depth.outer},
      ${SHADOWS.wheel.depth.inset},
      ${SHADOWS.wheel.depth.drop}
    `,
  };
};

// Generate hub shadow styles
export const getHubShadowStyles = () => {
  return {
    boxShadow: `
      ${SHADOWS.wheel.hub.primary},
      ${SHADOWS.wheel.hub.secondary},
      ${SHADOWS.wheel.hub.inset}
    `,
  };
};

// Generate neon glow styles
export const getNeonGlowStyles = () => {
  return {
    boxShadow: `${SHADOWS.wheel.neonGlow.small}, ${SHADOWS.wheel.neonGlow.large}`,
    filter: FILTERS.blur.glow,
    transform: 'scale(1.1)',
  };
};