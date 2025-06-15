// Handle retina displays
export const setupCanvas = (
  canvas: HTMLCanvasElement,
  size: number
): CanvasRenderingContext2D | null => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  ctx.scale(dpr, dpr);

  return ctx;
};

// Create offscreen canvas for pre-rendering
export const createOffscreenCanvas = (size: number): HTMLCanvasElement | null => {
  const offscreen = document.createElement('canvas');
  const dpr = window.devicePixelRatio || 1;
  offscreen.width = size * dpr;
  offscreen.height = size * dpr;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return null;

  offCtx.scale(dpr, dpr);
  return offscreen;
};

// Draw rotated image from offscreen canvas
export const drawRotatedWheel = (
  ctx: CanvasRenderingContext2D,
  offscreenCanvas: HTMLCanvasElement,
  size: number,
  rotation: number
): void => {
  // Clear canvas
  ctx.clearRect(0, 0, size, size);

  // Save context
  ctx.save();

  // Apply rotation
  ctx.translate(size / 2, size / 2);
  ctx.rotate(rotation);
  ctx.translate(-size / 2, -size / 2);

  // Draw the pre-rendered wheel
  ctx.drawImage(offscreenCanvas, 0, 0, size, size);

  // Restore context
  ctx.restore();
};