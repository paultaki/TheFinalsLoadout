import { test, expect } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Animation Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Slot Machine Spin Animation - Desktop', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('.slot-machine', { state: 'visible' });
    
    // Start recording
    await page.video().path();
    
    // Take baseline snapshot
    await percySnapshot(page, 'Slot Machine - Initial State');
    
    // Click spin button
    await page.click('#generateBtn');
    
    // Capture animation at multiple points
    const timestamps = [0, 500, 1000, 1500, 2000, 2500, 3000];
    
    for (const timestamp of timestamps) {
      await page.waitForTimeout(timestamp);
      await percySnapshot(page, `Slot Machine - Animation ${timestamp}ms`);
      
      // Verify FPS is above 55
      const fps = await page.evaluate(() => {
        return new Promise(resolve => {
          let frames = 0;
          const startTime = performance.now();
          
          function countFrames() {
            frames++;
            if (performance.now() - startTime < 1000) {
              requestAnimationFrame(countFrames);
            } else {
              resolve(frames);
            }
          }
          
          requestAnimationFrame(countFrames);
        });
      });
      
      expect(fps).toBeGreaterThanOrEqual(55);
    }
  });

  test('Roulette Wheel Animation', async ({ page }) => {
    // Trigger roulette overlay
    await page.evaluate(() => {
      if (window.overlayManager) {
        window.overlayManager.showClassRouletteOverlay();
      }
    });
    
    await page.waitForSelector('.roulette-overlay', { state: 'visible' });
    
    // Capture roulette animation
    const timestamps = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000];
    
    for (const timestamp of timestamps) {
      await page.waitForTimeout(timestamp);
      await percySnapshot(page, `Roulette Wheel - ${timestamp}ms`);
    }
  });

  test('Price Wheel Animation', async ({ page }) => {
    // Trigger price wheel overlay
    await page.evaluate(() => {
      if (window.overlayManager) {
        window.overlayManager.showSpinWheelOverlay();
      }
    });
    
    await page.waitForSelector('.spin-wheel-overlay', { state: 'visible' });
    
    // Capture price wheel animation
    const timestamps = [0, 500, 1000, 1500, 2000, 2500, 3000];
    
    for (const timestamp of timestamps) {
      await page.waitForTimeout(timestamp);
      await percySnapshot(page, `Price Wheel - ${timestamp}ms`);
    }
  });

  test('Mobile Touch Interactions', async ({ page, browserName }) => {
    if (browserName !== 'chromium-mobile') {
      test.skip();
    }
    
    // Test touch scroll on filter panel
    await page.locator('.filter-toggle').tap();
    await page.waitForSelector('.slide-out-panel.active');
    
    await percySnapshot(page, 'Mobile - Filter Panel Open');
    
    // Test slot machine on mobile
    await page.tap('#generateBtn');
    await page.waitForTimeout(2000);
    
    await percySnapshot(page, 'Mobile - Slot Animation');
  });
});

test.describe('Performance Metrics', () => {
  test('Animation Frame Rate', async ({ page }) => {
    await page.goto('/');
    
    // Monitor FPS during slot animation
    const metrics = await page.evaluate(async () => {
      const results = {
        fps: [],
        frameTime: [],
        memoryUsage: []
      };
      
      return new Promise(resolve => {
        let lastTime = performance.now();
        let frameCount = 0;
        const duration = 5000; // 5 seconds
        const startTime = performance.now();
        
        function measureFrame() {
          const currentTime = performance.now();
          const deltaTime = currentTime - lastTime;
          
          frameCount++;
          results.frameTime.push(deltaTime);
          
          if (currentTime - startTime >= 1000) {
            results.fps.push(frameCount);
            frameCount = 0;
          }
          
          if (performance.memory) {
            results.memoryUsage.push(performance.memory.usedJSHeapSize);
          }
          
          lastTime = currentTime;
          
          if (currentTime - startTime < duration) {
            requestAnimationFrame(measureFrame);
          } else {
            resolve(results);
          }
        }
        
        // Trigger animation
        document.getElementById('generateBtn').click();
        requestAnimationFrame(measureFrame);
      });
    });
    
    // Verify performance
    const avgFPS = metrics.fps.reduce((a, b) => a + b, 0) / metrics.fps.length;
    expect(avgFPS).toBeGreaterThanOrEqual(55);
    
    // Check for frame drops
    const droppedFrames = metrics.frameTime.filter(time => time > 20).length;
    expect(droppedFrames).toBeLessThan(metrics.frameTime.length * 0.05); // Less than 5% dropped
  });
});