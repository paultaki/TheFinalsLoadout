import { devices, PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: 'src/tests',
  timeout: 30_000,
  retries: 0,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { browserName: 'chromium' }
    },
    {
      name: 'webkit-mobile',
      use: { ...devices['iPhone 12'] }
    }
  ],
  reporter: [['html']]
};

export default config;