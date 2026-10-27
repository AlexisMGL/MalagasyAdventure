import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', timeout: 90000, expect: { timeout: 15000 }, fullyParallel: false, workers: 1,
  reporter: 'list', use: { baseURL: 'http://127.0.0.1:4184',
    trace: { mode: 'retain-on-failure', screenshots: false, snapshots: true, sources: true }, screenshot: 'only-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: { command: 'npm run dev -- --port 4184', url: 'http://127.0.0.1:4184',
    reuseExistingServer: !process.env.CI, timeout: 60000 },
});
