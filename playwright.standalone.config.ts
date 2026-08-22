import { defineConfig, devices } from '@playwright/test';

import { resolveStandaloneApp } from '@nebula-studio-internal/vite';

const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
const skipWebServer = process.env.NEBULA_E2E_EXTERNAL_WEB === 'true';
const docs = resolveStandaloneApp('docs');
const settings = resolveStandaloneApp('settings');
const integration = resolveStandaloneApp('integration');

export default defineConfig({
  testDir: './e2e',
  testMatch: /standalone\.spec\.ts/,
  outputDir: './test-results/playwright-standalone',
  timeout: 60_000,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-standalone', open: 'never' }],
  ],
  use: {
    ...devices['Desktop Chrome'],
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    launchOptions: executablePath ? { executablePath } : undefined,
  },
  webServer: skipWebServer
    ? undefined
    : [
        {
          command: 'vp run --filter @nebula-studio-renderer/docs dev',
          url: docs.baseUrl,
          reuseExistingServer: true,
          timeout: 120_000,
        },
        {
          command: 'vp run --filter @nebula-studio-renderer/settings dev',
          url: settings.baseUrl,
          reuseExistingServer: true,
          timeout: 120_000,
        },
        {
          command: 'vp run --filter @nebula-studio-renderer/integration dev',
          url: integration.baseUrl,
          reuseExistingServer: true,
          timeout: 120_000,
        },
      ],
});
