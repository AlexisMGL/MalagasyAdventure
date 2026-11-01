import { defineConfig } from '@playwright/test';
import base from './playwright.config';

// Exercise the actual production bundle: update checks are intentionally absent in dev.
export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: 'pwa.spec.ts',
  outputDir: 'test-results/pwa',
  use: { ...base.use, baseURL: 'http://127.0.0.1:4174' },
  webServer: { command: 'npm run preview', url: 'http://127.0.0.1:4174', reuseExistingServer: !process.env.CI, timeout: 60000 },
});
