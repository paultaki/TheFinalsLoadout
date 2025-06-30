/**
 * Percy Visual Test for Slot Machine
 * 
 * To run locally with Percy token:
 * 
 * For PowerShell:
 *   $Env:PERCY_TOKEN = "web_416b183d5c69aeeaa43f6103097af0d5b421863d930e8910ca5a9019fd7d24a1"
 * 
 * For Git Bash:
 *   export PERCY_TOKEN=web_416b183d5c69aeeaa43f6103097af0d5b421863d930e8910ca5a9019fd7d24a1
 * 
 * Then run: npm run test:visual
 */

import { test, expect } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test('slot machine visual', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('.main-spin-button');
  await page.waitForTimeout(4000); // wait full animation
  await percySnapshot(page, 'slot-machine-spin');
  expect(true).toBe(true); // placeholder assertion
});