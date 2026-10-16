import { defineConfig } from '@playwright/test';

// HTTP checks use the optimized production server, without browser JavaScript
// hiding SSR/metadata failures or Next's development-only dynamic fallback.
export default defineConfig({
  testDir: './tests/production',
  globalSetup: './tests/production-setup.ts',
  forbidOnly: !!process.env.CI,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [['list']],
  outputDir: './test-results/production',
  use: { baseURL: `http://127.0.0.1:${process.env.PLAYWRIGHT_PORT ?? '3401'}` },
  projects: [{ name: 'production-http' }],
});
