import { defineConfig, devices } from '@playwright/test';

const qaPort = Number(process.env.QA_PORT ?? 8090);
const qaUrl = `http://127.0.0.1:${qaPort}`;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  webServer: {
    command: `QA_PORT=${qaPort} pnpm dev:qa`,
    url: qaUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL: qaUrl,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-webview-size',
      use: {
        ...devices['Pixel 7'],
      },
    },
  ],
});
