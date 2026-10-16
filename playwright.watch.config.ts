import { defineConfig } from '@playwright/test';
import base from './playwright.config';

// Watch one browser at a time and retain recordings for successful tests too.
export default defineConfig(base, {
  workers: 1,
  timeout: 180_000,
  outputDir: 'test-videos',
  use: {
    baseURL: 'http://127.0.0.1:3101',
    headless: false,
    launchOptions: { slowMo: 250 },
    video: { mode: 'on', size: { width: 1920, height: 1080 } },
  },
  projects: base.projects?.map(project => ({
    ...project,
    use: {
      ...project.use,
      ...(project.name === 'chromium' ? { viewport: { width: 1920, height: 1080 } } : {}),
    },
  })),
});
