import { defineConfig } from '@playwright/test';

/**
 * G4 最小 E2E 配置。
 * 需要: pnpm add -D @playwright/test && pnpm exec playwright install
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  webServer: {
    command: 'vp run dev:web',
    port: 5173,
    reuseExistingServer: true,
  },
});
