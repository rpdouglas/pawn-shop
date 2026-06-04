import { defineConfig, devices } from '@playwright/test'

import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  globalSetup: path.resolve(__dirname, './e2e/global-setup.ts'),
  use: {
    baseURL: process.env['PLAYWRIGHT_BASE_URL'] ?? 'http://localhost:5173',
    headless: true,
    reducedMotion: 'reduce',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev:full',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env['CI'],
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
