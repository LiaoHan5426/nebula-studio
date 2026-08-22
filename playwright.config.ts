import { resolveShellWeb } from '@nebula-studio-internal/vite';
import { defineConfig, devices } from '@playwright/test';

const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;
const skipWebServer = process.env.NEBULA_E2E_EXTERNAL_WEB === 'true';
const shellWeb = resolveShellWeb();

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results/playwright',
  timeout: 45_000,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: shellWeb.baseUrl,
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    launchOptions: executablePath ? { executablePath } : undefined,
  },
  projects: [
    {
      name: 'mock-regression',
      testIgnore: [
        /experience-baseline\.spec\.ts/,
        /resource-performance\.spec\.ts/,
        /real-stack\.spec\.ts/,
        /electron\.spec\.ts/,
        /phase7-web\.spec\.ts/,
        /standalone\.spec\.ts/,
      ],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'experience',
      testMatch: [
        /experience-baseline\.spec\.ts/,
        /resource-performance\.spec\.ts/,
      ],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'live-web',
      testMatch: /phase7-web\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        video: 'off',
        trace: 'off',
      },
    },
    {
      name: 'real-stack',
      testMatch: /real-stack\.spec\.ts/,
      retries: 1,
      use: { ...devices['Desktop Chrome'], trace: 'off' },
    },
    {
      name: 'electron',
      testMatch: /electron\.spec\.ts/,
    },
  ],
  webServer: skipWebServer
    ? undefined
    : {
        command: 'vp run dev:web',
        port: shellWeb.port,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
