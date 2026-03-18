import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright configuration for MatchMyResumes E2E tests.
 *
 * Run against production:  BASE_URL=https://matchmyresumes.com npx playwright test
 * Run against local dev:   npx playwright test
 * Run specific file:       npx playwright test tests/e2e/auth.spec.ts
 * Run with UI:             npx playwright test --ui
 * Run headed:              npx playwright test --headed
 * Debug single test:       npx playwright test --debug -g "should login"
 */

const isProduction = (process.env.BASE_URL || "").includes("matchmyresumes.com")
export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [["html", { open: "never" }], ["list"]],

    use: {
        baseURL: process.env.BASE_URL || "http://localhost:3000",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "on-first-retry",
        actionTimeout: 15_000,
        navigationTimeout: 30_000,
    },

    projects: [
        // Auth setup — runs first, saves signed-in state
        {
            name: "auth-setup",
            testMatch: /auth\.setup\.ts/,
        },

        // Main tests — use saved auth state
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                storageState: "tests/.auth/user.json",
            },
            dependencies: ["auth-setup"],
        },

        // Tests that must run without auth (login, signup, landing)
        {
            name: "no-auth",
            testMatch: /\.(noauth)\.spec\.ts/,
            use: { ...devices["Desktop Chrome"] },
        },

        // Mobile viewport tests
        {
            name: "mobile",
            testMatch: /\.mobile\.spec\.ts/,
            use: {
                ...devices["Pixel 5"],
                storageState: "tests/.auth/user.json",
            },
            dependencies: ["auth-setup"],
        },
    ],

    /* Start dev server automatically if not running (skip for production) */
    ...(isProduction
        ? {}
        : {
              webServer: {
                  command: "npm run dev",
                  url: "http://localhost:3000",
                  reuseExistingServer: true,
                  timeout: 60_000,
              },
          }),
})
