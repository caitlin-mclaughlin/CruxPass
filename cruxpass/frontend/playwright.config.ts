import process from 'process';
import { defineConfig, devices } from '@playwright/test';

const backendPort = process.env.E2E_BACKEND_PORT ?? '8080';
const frontendPort = process.env.E2E_FRONTEND_PORT ?? '5173';
const frontendHost = process.env.E2E_FRONTEND_HOST ?? '127.0.0.1';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  reporter: [['html'], ['list']],
  use: {
    baseURL: `http://${frontendHost}:${frontendPort}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: `cd ../backend && SPRING_PROFILES_ACTIVE=e2e SERVER_PORT=${backendPort} ./gradlew bootRun`,
      url: `http://localhost:${backendPort}/api/competitions`,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: `VITE_API_URL=http://localhost:${backendPort}/api npm run dev -- --host ${frontendHost} --port ${frontendPort}`,
      url: `http://${frontendHost}:${frontendPort}`,
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
});
