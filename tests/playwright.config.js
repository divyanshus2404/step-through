const { defineConfig, devices } = require('@playwright/test');
const channel = process.env.PW_CHANNEL || undefined;
module.exports = defineConfig({
  testDir: './e2e',
  timeout: 240000,
  fullyParallel: false,
  workers: 2,
  reporter: 'list',
  use: { baseURL: process.env.BASE_URL || 'http://localhost:4173' },
  webServer: process.env.BASE_URL ? undefined : { command: 'node server.js', port: 4173, reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { channel, viewport: { width: 1280, height: 800 } } },
    { name: 'phone', use: { channel, viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'safari', use: { ...devices['Desktop Safari'] } },
    { name: 'iphone', use: { ...devices['iPhone 14'] } },
  ],
});
