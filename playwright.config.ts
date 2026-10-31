import { defineConfig, devices } from '@playwright/test';

// End-to-end tests run against their own API and client on separate ports,
// with a fresh SQLite database (packages/server/e2e.db) built from the migrations.
// They never touch dev.db or the ports used by `npm run dev`.
const apiUrl = 'http://localhost:3201';
const clientUrl = 'http://localhost:5201';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: false,
    workers: 1,
    forbidOnly: !!process.env.CI,
    retries: 0,
    reporter: 'list',
    use: {
        baseURL: clientUrl,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    webServer: [
        {
            name: 'api',
            cwd: 'packages/server',
            command: 'rm -f e2e.db e2e.db-journal e2e.db-wal e2e.db-shm && npx prisma migrate deploy && npx tsx src/index.ts',
            // /api/healthCheck needs a session, so it answers 401, which Playwright counts as ready.
            url: `${apiUrl}/api/healthCheck`,
            reuseExistingServer: false,
            timeout: 60_000,
            env: {
                PORT: '3201',
                DATABASE_URL: 'file:./e2e.db',
                CLIENT_URL: clientUrl,
                API_URL: apiUrl,
                LOG_LEVEL: 'warn',
            },
        },
        {
            name: 'client',
            cwd: 'packages/client',
            command: 'npx vite --port 5201 --strictPort',
            url: clientUrl,
            reuseExistingServer: false,
            timeout: 60_000,
            env: {
                VITE_API_URL: apiUrl,
            },
        },
    ],
});
