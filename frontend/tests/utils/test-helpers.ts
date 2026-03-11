import { Page, expect, Locator } from "@playwright/test"
import path from "path"

// ── Fixtures directory ──────────────────────────────────────────────
export const FIXTURES_DIR = path.join(__dirname, "..", "fixtures")

// ── File paths for test uploads ─────────────────────────────────────
export const FILES = {
    validPdf: path.join(FIXTURES_DIR, "sample-resume.pdf"),
    validDocx: path.join(FIXTURES_DIR, "sample-resume.docx"),
    largeFile: path.join(FIXTURES_DIR, "large-file-15mb.pdf"),
    unsupported: path.join(FIXTURES_DIR, "script.js"),
    corrupted: path.join(FIXTURES_DIR, "corrupted.pdf"),
    empty: path.join(FIXTURES_DIR, "empty.pdf"),
}

// ── Test credentials (from env or defaults for dev mode) ────────────
export const TEST_USER = {
    email: process.env.TEST_USER_EMAIL || "test@matchmyresumes.ai",
    password: process.env.TEST_USER_PASSWORD || "TestPassword123!",
    firstName: process.env.TEST_USER_FIRST_NAME || "Test",
}

// ── Sample job description text (>100 chars for Pydantic min_length) ──
export const SAMPLE_JD = {
    title: "Senior Software Engineer",
    text: `We are looking for a Senior Software Engineer with 5+ years of experience
in Python, FastAPI, React, and TypeScript. The ideal candidate will have experience
with cloud services (AWS/GCP), PostgreSQL, Redis, and CI/CD pipelines. Strong
problem-solving skills and experience with agile methodologies required. Experience
with machine learning and NLP is a plus. You will be responsible for designing and
building scalable backend services, implementing RESTful APIs, writing comprehensive
tests, and mentoring junior developers on best practices.`,
}

// ── Reusable page helpers ───────────────────────────────────────────

/** Wait for the dashboard to fully load (global data fetched). */
export async function waitForDashboardLoad(page: Page) {
    // Use domcontentloaded instead of networkidle — Clerk keeps WebSocket connections
    // open that prevent networkidle from ever resolving.
    await page.waitForLoadState("domcontentloaded")
    // Dashboard shows "Welcome" or one of the stat cards
    await expect(
        page.locator("h1, h2").filter({ hasText: /welcome|my resumes|dashboard/i }).first()
    ).toBeVisible({ timeout: 15_000 })
}

/** Navigate to a dashboard sub-page and wait for load. */
export async function navigateToDashboard(page: Page, subpath = "") {
    await page.goto(`/dashboard${subpath ? `/${subpath}` : ""}`)
    await page.waitForLoadState("domcontentloaded")
}

/** Upload a file via a dropzone. Finds the hidden file input and sets the file. */
export async function uploadFileViaDropzone(page: Page, filePath: string) {
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(filePath)
}

/** Select a saved resume from a dropdown/select. */
export async function selectSavedResume(page: Page, resumeName?: string) {
    const select = page.locator("select, [role='combobox']").first()
    await select.click()
    if (resumeName) {
        await page.locator(`[role="option"]`).filter({ hasText: resumeName }).click()
    } else {
        // Select the first available option
        await page.locator(`[role="option"]`).first().click()
    }
}

/** Wait for a toast/notification message. */
export async function expectToast(page: Page, textMatch: string | RegExp) {
    await expect(
        page.locator("text=" + textMatch).or(page.getByText(textMatch))
    ).toBeVisible({ timeout: 10_000 })
}

/** Wait for a score circle to display a number. */
export async function expectScoreVisible(page: Page) {
    // The score circle renders a large number (0-100)
    const scoreEl = page.locator("[class*='score'], [class*='Score']").first()
    await expect(scoreEl).toBeVisible({ timeout: 60_000 })
}

/** Check that page has no console errors (attach to page before navigating). */
export function collectConsoleErrors(page: Page): string[] {
    const errors: string[] = []
    page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text())
    })
    return errors
}

/** Mock an API endpoint to return an error. */
export async function mockApiError(
    page: Page,
    urlPattern: string | RegExp,
    status = 500,
    body = { detail: "Internal server error" }
) {
    await page.route(urlPattern, (route) =>
        route.fulfill({
            status,
            contentType: "application/json",
            body: JSON.stringify(body),
        })
    )
}

/** Mock an API endpoint to hang indefinitely (simulate timeout). */
export async function mockApiTimeout(page: Page, urlPattern: string | RegExp) {
    await page.route(urlPattern, (route) => {
        // Never respond — simulates network timeout
        // Playwright will abort when the test ends
    })
}

/** Clerk login via the Clerk sign-in UI. */
export async function clerkLogin(page: Page, email: string, password: string) {
    await page.goto("/sign-in")
    await page.waitForLoadState("domcontentloaded")

    // Clerk renders its own form components — wait for the form, not networkidle
    const emailInput = page.locator(
        'input[name="identifier"], input[type="email"], input[autocomplete="email"]'
    ).first()
    await emailInput.waitFor({ state: "visible", timeout: 15_000 })
    await emailInput.fill(email)

    // Click Clerk's primary form button (avoids hidden submit and social login buttons)
    await page.locator(".cl-formButtonPrimary").click()

    // Wait for password field
    const passwordInput = page.locator(
        'input[name="password"], input[type="password"]'
    ).first()
    await passwordInput.waitFor({ state: "visible", timeout: 10_000 })
    await passwordInput.fill(password)

    // Submit — click Clerk's primary form button on the password step
    await page.locator(".cl-formButtonPrimary").click()

    // Wait for redirect to dashboard
    await page.waitForURL(/dashboard/, { timeout: 30_000 })
}
