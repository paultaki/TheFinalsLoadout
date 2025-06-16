import { DIMENSIONS, NUMBERS } from '../../constants/physics';
import { COLORS_EXTENDED, SHADOWS } from '../../constants/styles';

// Segments configuration
export const SEGMENTS = NUMBERS.segments;
export const CLASSES = ['LIGHT', 'MEDIUM', 'HEAVY'] as const;
export const CLASS_COLORS = {
  LIGHT: COLORS_EXTENDED.classes.light,
  MEDIUM: COLORS_EXTENDED.classes.medium,
  HEAVY: COLORS_EXTENDED.classes.heavy,
} as const;

// Draw metallic rim with purple underglow
export const drawMetallicRim = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  outerRadius: number
): void => {
  const rimInner = Math.max(0, outerRadius - DIMENSIONS.wheel.rimWidth);
  const rimOuter = Math.max(0, outerRadius);
  if (rimInner < 0 || rimOuter <= 0) return;

  const rimGradient = ctx.createRadialGradient(centerX, centerY, rimInner, centerX, centerY, rimOuter);
  rimGradient.addColorStop(0, COLORS_EXTENDED.metallic.rim.inner);
  rimGradient.addColorStop(0.3, COLORS_EXTENDED.metallic.rim.mid);
  rimGradient.addColorStop(0.7, COLORS_EXTENDED.metallic.rim.outer);
  rimGradient.addColorStop(1, COLORS_EXTENDED.metallic.rim.glow);

  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
  ctx.arc(centerX, centerY, outerRadius - DIMENSIONS.wheel.rimWidth, 0, Math.PI * 2, true);
  ctx.fillStyle = rimGradient;
  ctx.fill();
};

// Draw holographic gold inner ring
export const drawGoldInnerRing = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  outerRadius: number
): void => {
  const goldInner = Math.max(0, outerRadius - DIMENSIONS.wheel.segmentInset);
  const goldOuter = Math.max(0, outerRadius - DIMENSIONS.wheel.rimWidth);
  if (goldInner < 0 || goldOuter <= 0) return;

  const goldGradient = ctx.createRadialGradient(centerX, centerY, goldInner, centerX, centerY, goldOuter);
  goldGradient.addColorStop(0, COLORS_EXTENDED.gold.primary);
  goldGradient.addColorStop(0.3, COLORS_EXTENDED.gold.light);
  goldGradient.addColorStop(0.6, COLORS_EXTENDED.gold.accent);
  goldGradient.addColorStop(1, COLORS_EXTENDED.gold.primary);

  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius - DIMENSIONS.wheel.rimWidth, 0, Math.PI * 2);
  ctx.arc(centerX, centerY, outerRadius - DIMENSIONS.wheel.segmentInset, 0, Math.PI * 2, true);
  ctx.fillStyle = goldGradient;
  ctx.fill();
};

// Draw a single segment
export const drawSegment = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  className: string,
  color: any,
  size: number
): void => {
  // Create gradient for segment
  const segInner = Math.max(0, innerRadius);
  const segOuter = Math.max(0, outerRadius - DIMENSIONS.wheel.segmentInset);
  if (segInner < 0 || segOuter <= 0) return;

  const gradient = ctx.createRadialGradient(centerX, centerY, segInner, centerX, centerY, segOuter);
  gradient.addColorStop(0, color.light);
  gradient.addColorStop(0.5, color.base);
  gradient.addColorStop(1, color.dark);

  // Draw segment
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, outerRadius - DIMENSIONS.wheel.segmentInset, startAngle, endAngle);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw segment border
  ctx.strokeStyle = COLORS_EXTENDED.ui.segmentBorder;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Draw text
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(startAngle + (endAngle - startAngle) / 2);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size / DIMENSIONS.canvas.fontSize}px "Impact", sans-serif`;
  ctx.shadowColor = COLORS_EXTENDED.ui.shadowColor;
  ctx.shadowBlur = SHADOWS.text.blur;
  ctx.shadowOffsetX = SHADOWS.text.offsetX;
  ctx.shadowOffsetY = SHADOWS.text.offsetY;
  ctx.fillText(className, outerRadius * 0.55, 0);
  ctx.restore();

  // Add gloss overlay
  drawGlossOverlay(ctx, centerX, centerY, outerRadius, startAngle, endAngle, size);
};

// Draw gloss overlay for segment
export const drawGlossOverlay = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  size: number
): void => {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, outerRadius - DIMENSIONS.wheel.segmentInset, startAngle, endAngle);
  ctx.closePath();
  ctx.clip();

  const glossGradient = ctx.createLinearGradient(
    centerX - outerRadius,
    centerY - outerRadius,
    centerX + outerRadius,
    centerY + outerRadius
  );
  glossGradient.addColorStop(0, `rgba(255, 255, 255, ${NUMBERS.opacity.gloss.start})`);
  glossGradient.addColorStop(0.5, `rgba(255, 255, 255, ${NUMBERS.opacity.gloss.mid})`);
  glossGradient.addColorStop(1, `rgba(255, 255, 255, ${NUMBERS.opacity.gloss.end})`);

  ctx.fillStyle = glossGradient;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();
};

// Draw inner hub circle
export const drawInnerHub = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  innerRadius: number
): void => {
  const hubOuter = Math.max(0, innerRadius);
  if (hubOuter <= 0) return;

  const hubGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, hubOuter);
  hubGradient.addColorStop(0, COLORS_EXTENDED.metallic.hub.light);
  hubGradient.addColorStop(0.7, COLORS_EXTENDED.metallic.hub.medium);
  hubGradient.addColorStop(1, COLORS_EXTENDED.metallic.hub.dark);

  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  ctx.fillStyle = hubGradient;
  ctx.fill();
};

// Draw the complete static wheel
export const drawStaticWheel = (
  ctx: CanvasRenderingContext2D,
  size: number,
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number
): void => {
  // Draw outer metallic rim
  drawMetallicRim(ctx, centerX, centerY, outerRadius);

  // Draw holographic gold inner ring
  drawGoldInnerRing(ctx, centerX, centerY, outerRadius);

  // Draw segments
  const anglePerSegment = (Math.PI * 2) / SEGMENTS;
  for (let i = 0; i < SEGMENTS; i++) {
    const startAngle = i * anglePerSegment - Math.PI / 2;
    const endAngle = (i + 1) * anglePerSegment - Math.PI / 2;
    const className = CLASSES[i % 3];
    const color = CLASS_COLORS[className];

    drawSegment(ctx, centerX, centerY, innerRadius, outerRadius, startAngle, endAngle, className, color, size);
  }

  // Draw inner hub
  drawInnerHub(ctx, centerX, centerY, innerRadius);
};