const { defineConfig } = require('@playwright/test');
const channel = process.env.PW_CHANNEL || undefined;
module.exports = defineConfig({
  testDir: './e2e',
  timeout: 240000,
  fullyParallel: false,
  workers: 2,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4173', channel },
  webServer: { command: 'node server.js', port: 4173, reuseExistingServer: true },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'phone', use: { viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true } },
  ],
});
