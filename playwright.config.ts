import { defineConfig, devices } from '@playwright/test';

const PORT = 4175;

/**
 * Browser smoke tests against the built site (dist-site). Run `bun run build:site`
 * first, then `bun run test:e2e`. Files end in `.e2e.ts` so `bun test` never
 * picks them up.
 */
export default defineConfig({
  testDir: './test/e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `bun scripts/static-server.ts dist-site ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
