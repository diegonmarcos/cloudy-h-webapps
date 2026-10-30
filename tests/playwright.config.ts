import { defineConfig, devices } from '@playwright/test';

// Phone = Pixel 7 (412x915 CSS px, DPR 2.625); tablet = Pixel Tablet landscape 1280x800 and portrait 800x1280 (#1320 C.3).
const PORT = 4173;
export default defineConfig({
  testDir: './e2e',
  outputDir: './results/artifacts',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: './results/report', open: 'never' }]],
  use: { baseURL: `http://127.0.0.1:${PORT}`, trace: 'retain-on-failure' },
  webServer: { command: `node tests/serve.mjs`, cwd: '..', port: PORT, reuseExistingServer: false, env: { PORT: String(PORT) } },
  projects: [
    { name: 'phone', use: { ...devices['Pixel 7'], viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true } },
    { name: 'tablet-land', use: { browserName: 'chromium', viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, hasTouch: true } },
    { name: 'tablet-port', use: { browserName: 'chromium', viewport: { width: 800, height: 1280 }, deviceScaleFactor: 2, hasTouch: true } },
  ],
});
