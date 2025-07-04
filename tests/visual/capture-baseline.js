import { chromium } from '@playwright/test';

async function captureBaseline() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: './tests/visual/baselines/videos',
      size: { width: 1920, height: 1080 }
    }
  });
  
  const page = await context.newPage();
  await page.goto('http://localhost:8080');
  
  console.log('Recording 30-second baseline...');
  
  // Wait for load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Capture initial state
  await page.screenshot({ 
    path: './tests/visual/baselines/initial-state.png',
    fullPage: true 
  });
  
  // Start slot machine animation
  await page.click('#generateBtn');
  
  // Record for 30 seconds
  const startTime = Date.now();
  let frameCount = 0;
  
  while (Date.now() - startTime < 30000) {
    await page.screenshot({ 
      path: `./tests/visual/baselines/frame-${frameCount.toString().padStart(5, '0')}.png` 
    });
    frameCount++;
    await page.waitForTimeout(16); // ~60fps
  }
  
  console.log(`Captured ${frameCount} frames`);
  
  await context.close();
  await browser.close();
}

captureBaseline().catch(console.error);