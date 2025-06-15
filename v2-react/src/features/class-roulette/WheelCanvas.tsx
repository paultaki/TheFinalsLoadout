import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { DIMENSIONS } from '../../constants/physics';
import { drawStaticWheel } from './canvas-drawing';
import { setupCanvas, createOffscreenCanvas, drawRotatedWheel } from './canvas-utils';

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

    const ctx = setupCanvas(canvas, size);
    if (!ctx) return;

    // Create offscreen canvas if not exists
    if (!offscreenCanvasRef.current) {
      const offscreen = createOffscreenCanvas(size);
      if (!offscreen) return;
      
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      // Draw static wheel elements
      const centerX = size / 2;
      const centerY = size / 2;
      const outerRadius = size / 2 - DIMENSIONS.canvas.padding;
      const innerRadius = outerRadius * DIMENSIONS.wheel.innerRadiusRatio;

      drawStaticWheel(offCtx, size, centerX, centerY, outerRadius, innerRadius);

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

    drawRotatedWheel(ctx, offscreen, size, rotation);
  }, [rotation, size]);

  return (
    <canvas ref={canvasRef} className="absolute inset-0" style={{ width: size, height: size }} />
  );
});

WheelCanvas.displayName = 'WheelCanvas';

export default WheelCanvas;
