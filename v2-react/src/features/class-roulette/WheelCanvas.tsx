import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

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
      const outerRadius = size / 2 - 10;
      const innerRadius = outerRadius * 0.3;

      // Segments configuration - The Finals theme
      const segments = 12;
      const classes = ['LIGHT', 'MEDIUM', 'HEAVY'];
      const colors = {
        LIGHT: { base: '#4FC3F7', dark: '#29B6F6', light: '#81D4FA' },
        MEDIUM: { base: '#AB47BC', dark: '#7B1FA2', light: '#CE93D8' },
        HEAVY: { base: '#FF1744', dark: '#D50000', light: '#FF5252' },
      };

      const anglePerSegment = (Math.PI * 2) / segments;

      // Draw outer metallic rim with purple underglow
      const rimInner = Math.max(0, outerRadius - 20);
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
      rimGradient.addColorStop(0, '#3a3a3a');
      rimGradient.addColorStop(0.3, '#2a2a2a');
      rimGradient.addColorStop(0.7, '#1a1a1a');
      rimGradient.addColorStop(1, '#7B1FA2');

      offCtx.beginPath();
      offCtx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      offCtx.arc(centerX, centerY, outerRadius - 20, 0, Math.PI * 2, true);
      offCtx.fillStyle = rimGradient;
      offCtx.fill();

      // Draw holographic gold inner ring
      const goldInner = Math.max(0, outerRadius - 25);
      const goldOuter = Math.max(0, outerRadius - 20);
      if (goldInner < 0 || goldOuter <= 0) return;
      const goldGradient = offCtx.createRadialGradient(
        centerX,
        centerY,
        goldInner,
        centerX,
        centerY,
        goldOuter
      );
      goldGradient.addColorStop(0, '#FFD700');
      goldGradient.addColorStop(0.3, '#FFED4E');
      goldGradient.addColorStop(0.6, '#AB47BC');
      goldGradient.addColorStop(1, '#FFD700');

      offCtx.beginPath();
      offCtx.arc(centerX, centerY, outerRadius - 20, 0, Math.PI * 2);
      offCtx.arc(centerX, centerY, outerRadius - 25, 0, Math.PI * 2, true);
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
        const segOuter = Math.max(0, outerRadius - 25);
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
        offCtx.arc(centerX, centerY, outerRadius - 25, startAngle, endAngle);
        offCtx.closePath();
        offCtx.fillStyle = gradient;
        offCtx.fill();

        // Draw segment border
        offCtx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        offCtx.lineWidth = 1;
        offCtx.stroke();

        // Draw text
        offCtx.save();
        offCtx.translate(centerX, centerY);
        offCtx.rotate(startAngle + anglePerSegment / 2);
        offCtx.textAlign = 'center';
        offCtx.textBaseline = 'middle';
        offCtx.fillStyle = 'white';
        offCtx.font = `bold ${size / 20}px "Impact", sans-serif`;
        offCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        offCtx.shadowBlur = 4;
        offCtx.shadowOffsetX = 2;
        offCtx.shadowOffsetY = 2;
        offCtx.fillText(className, outerRadius * 0.55, 0);
        offCtx.restore();

        // Add gloss overlay
        offCtx.save();
        offCtx.beginPath();
        offCtx.moveTo(centerX, centerY);
        offCtx.arc(centerX, centerY, outerRadius - 25, startAngle, endAngle);
        offCtx.closePath();
        offCtx.clip();

        const glossGradient = offCtx.createLinearGradient(
          centerX - outerRadius,
          centerY - outerRadius,
          centerX + outerRadius,
          centerY + outerRadius
        );
        glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        glossGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
        glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

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
      hubGradient.addColorStop(0, '#4a4a4a');
      hubGradient.addColorStop(0.7, '#2a2a2a');
      hubGradient.addColorStop(1, '#1a1a1a');

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
