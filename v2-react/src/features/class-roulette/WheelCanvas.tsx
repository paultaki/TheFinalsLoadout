import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { DIMENSIONS, NUMBERS } from '../../constants/physics';
import { COLORS_EXTENDED, SHADOWS } from '../../constants/styles';

interface WheelCanvasProps {
  size: number;
  rotation: number;
}

export interface WheelCanvasRef {
  getCanvas: () => HTMLCanvasElement | null;
}

const WheelCanvas = forwardRef<WheelCanvasRef, WheelCanvasProps>(({ size, rotation }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Expose canvas to parent
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
  }));

  // Pre-render static wheel to offscreen canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    // Create offscreen canvas if not exists
    if (!offscreenCanvasRef.current) {
      const offscreen = document.createElement('canvas');
      offscreen.width = size * dpr;
      offscreen.height = size * dpr;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      offCtx.scale(dpr, dpr);

      // Draw static wheel elements
      const centerX = size / 2;
      const centerY = size / 2;
      const outerRadius = size / 2 - DIMENSIONS.canvas.padding;
      const innerRadius = outerRadius * DIMENSIONS.wheel.innerRadiusRatio;

      // Segments configuration - The Finals theme
      const segments = NUMBERS.segments;
      const classes = ['LIGHT', 'MEDIUM', 'HEAVY'];
      const colors = {
        LIGHT: COLORS_EXTENDED.classes.light,
        MEDIUM: COLORS_EXTENDED.classes.medium,
        HEAVY: COLORS_EXTENDED.classes.heavy,
      };

      const anglePerSegment = (Math.PI * 2) / segments;

      // Draw outer metallic rim with purple underglow
      const rimInner = Math.max(0, outerRadius - DIMENSIONS.wheel.rimWidth);
      const rimOuter = Math.max(0, outerRadius);
      if (rimInner < 0 || rimOuter <= 0) return;
      const rimGradient = offCtx.createRadialGradient(
        centerX,
        centerY,
        rimInner,
        centerX,
        centerY,
        rimOuter
      );
      rimGradient.addColorStop(0, COLORS_EXTENDED.metallic.rim.inner);
      rimGradient.addColorStop(0.3, COLORS_EXTENDED.metallic.rim.mid);
      rimGradient.addColorStop(0.7, COLORS_EXTENDED.metallic.rim.outer);
      rimGradient.addColorStop(1, COLORS_EXTENDED.metallic.rim.glow);

      offCtx.beginPath();
      offCtx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      offCtx.arc(centerX, centerY, outerRadius - DIMENSIONS.wheel.rimWidth, 0, Math.PI * 2, true);
      offCtx.fillStyle = rimGradient;
      offCtx.fill();

      // Draw holographic gold inner ring
      const goldInner = Math.max(0, outerRadius - DIMENSIONS.wheel.segmentInset);
      const goldOuter = Math.max(0, outerRadius - DIMENSIONS.wheel.rimWidth);
      if (goldInner < 0 || goldOuter <= 0) return;
      const goldGradient = offCtx.createRadialGradient(
        centerX,
        centerY,
        goldInner,
        centerX,
        centerY,
        goldOuter
      );
      goldGradient.addColorStop(0, COLORS_EXTENDED.gold.primary);
      goldGradient.addColorStop(0.3, COLORS_EXTENDED.gold.light);
      goldGradient.addColorStop(0.6, COLORS_EXTENDED.gold.accent);
      goldGradient.addColorStop(1, COLORS_EXTENDED.gold.primary);

      offCtx.beginPath();
      offCtx.arc(centerX, centerY, outerRadius - DIMENSIONS.wheel.rimWidth, 0, Math.PI * 2);
      offCtx.arc(centerX, centerY, outerRadius - DIMENSIONS.wheel.segmentInset, 0, Math.PI * 2, true);
      offCtx.fillStyle = goldGradient;
      offCtx.fill();

      // Draw segments
      for (let i = 0; i < segments; i++) {
        const startAngle = i * anglePerSegment - Math.PI / 2;
        const endAngle = (i + 1) * anglePerSegment - Math.PI / 2;
        const className = classes[i % 3];
        const color = colors[className as keyof typeof colors];

        // Create gradient for segment
        const segInner = Math.max(0, innerRadius);
        const segOuter = Math.max(0, outerRadius - DIMENSIONS.wheel.segmentInset);
        if (segInner < 0 || segOuter <= 0) continue;
        const gradient = offCtx.createRadialGradient(
          centerX,
          centerY,
          segInner,
          centerX,
          centerY,
          segOuter
        );
        gradient.addColorStop(0, color.light);
        gradient.addColorStop(0.5, color.base);
        gradient.addColorStop(1, color.dark);

        // Draw segment
        offCtx.beginPath();
        offCtx.moveTo(centerX, centerY);
        offCtx.arc(centerX, centerY, outerRadius - DIMENSIONS.wheel.segmentInset, startAngle, endAngle);
        offCtx.closePath();
        offCtx.fillStyle = gradient;
        offCtx.fill();

        // Draw segment border
        offCtx.strokeStyle = COLORS_EXTENDED.ui.segmentBorder;
        offCtx.lineWidth = 1;
        offCtx.stroke();

        // Draw text
        offCtx.save();
        offCtx.translate(centerX, centerY);
        offCtx.rotate(startAngle + anglePerSegment / 2);
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.fillStyle = 'white';
        offCtx.font = `bold ${size / DIMENSIONS.canvas.fontSize}px "Impact", sans-serif`;
        offCtx.shadowColor = COLORS_EXTENDED.ui.shadowColor;
        offCtx.shadowBlur = SHADOWS.text.blur;
        offCtx.shadowOffsetX = SHADOWS.text.offsetX;
        offCtx.shadowOffsetY = SHADOWS.text.offsetY;
        offCtx.fillText(className, outerRadius * 0.55, 0);
        offCtx.restore();

        // Add gloss overlay
        offCtx.save();
        offCtx.beginPath();
        offCtx.moveTo(centerX, centerY);
        offCtx.arc(centerX, centerY, outerRadius - DIMENSIONS.wheel.segmentInset, startAngle, endAngle);
        offCtx.closePath();
        offCtx.clip();

        const glossGradient = offCtx.createLinearGradient(
          centerX - outerRadius,
          centerY - outerRadius,
          centerX + outerRadius,
          centerY + outerRadius
        );
        glossGradient.addColorStop(0, `rgba(255, 255, 255, ${NUMBERS.opacity.gloss.start})`);
        glossGradient.addColorStop(0.5, `rgba(255, 255, 255, ${NUMBERS.opacity.gloss.mid})`);
        glossGradient.addColorStop(1, `rgba(255, 255, 255, ${NUMBERS.opacity.gloss.end})`);

        offCtx.fillStyle = glossGradient;
        offCtx.fillRect(0, 0, size, size);
        offCtx.restore();
      }

      // Draw inner hub circle (for logo placement)
      const hubInner = 0;
      const hubOuter = Math.max(0, innerRadius);
      if (hubOuter <= 0) return;
      const hubGradient = offCtx.createRadialGradient(
        centerX,
        centerY,
        hubInner,
        centerX,
        centerY,
        hubOuter
      );
      hubGradient.addColorStop(0, COLORS_EXTENDED.metallic.hub.light);
      hubGradient.addColorStop(0.7, COLORS_EXTENDED.metallic.hub.medium);
      hubGradient.addColorStop(1, COLORS_EXTENDED.metallic.hub.dark);

      offCtx.beginPath();
      offCtx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
      offCtx.fillStyle = hubGradient;
      offCtx.fill();

      // Store the offscreen canvas
      offscreenCanvasRef.current = offscreen;
    }
  }, [size]);

  // Draw rotated wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    const offscreen = offscreenCanvasRef.current;
    if (!canvas || !offscreen) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // const dpr = window.devicePixelRatio || 1;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Save context
    ctx.save();

    // Apply rotation
    ctx.translate(size / 2, size / 2);
    ctx.rotate(rotation);
    ctx.translate(-size / 2, -size / 2);

    // Draw the pre-rendered wheel
    ctx.drawImage(offscreen, 0, 0, size, size);

    // Restore context
    ctx.restore();
  }, [rotation, size]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0" style={{ width: size, height: size }} />
  );
});

WheelCanvas.displayName = 'WheelCanvas';

export default WheelCanvas;
