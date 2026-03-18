import { Page, expect, Locator } from "@playwright/test"
import path from "path"
import fs from "fs"

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

/** Upload a file via a dropzone with a unique filename to avoid 409 duplicates.
 *  Pass `customName` to control the filename (useful for duplicate-detection tests). */
export async function uploadFileViaDropzone(
    page: Page,
    filePath: string,
    options?: { customName?: string }
) {
    const fileInput = page.locator('input[type="file"]').first()
    const buffer = fs.readFileSync(filePath)
    const ext = path.extname(filePath)
    const baseName = path.basename(filePath, ext)
    const uniqueName = options?.customName ?? `${baseName}-${Date.now()}${ext}`
    const mimeType =
        ext === ".pdf"
            ? "application/pdf"
            : ext === ".docx"
            ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            : "application/octet-stream"

    await fileInput.setInputFiles({ name: uniqueName, mimeType, buffer })
}

/** Upload using the exact on-disk filename (for testing duplicate detection). */
export async function uploadFileViaDropzoneExact(page: Page, filePath: string) {
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(filePath)
}

/** Generate a unique JD title to avoid 409 duplicate title errors. */
export function uniqueJdTitle(base = SAMPLE_JD.title): string {
    return `${base} ${Date.now()}`
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

/** Delete all resumes for the test user via API (for cleanup). */
export async function deleteAllTestResumes(page: Page) {
    const response = await page.request.get("/api/resumes")
    if (response.ok()) {
        const resumes = await response.json()
        for (const r of resumes) {
            await page.request.delete(`/api/resumes/${r.id}`)
        }
    }
}

/** Delete all JDs for the test user via API (for cleanup). */
export async function deleteAllTestJobs(page: Page) {
    const response = await page.request.get("/api/jobs")
    if (response.ok()) {
        const jobs = await response.json()
        for (const j of jobs) {
            await page.request.delete(`/api/jobs/${j.id}`)
        }
    }
}

/** Clerk login via the Clerk sign-in UI.
 *  Handles the email → password → optional verification code flow.
 *  When Clerk sends a verification code, the test pauses for up to 120s
 *  so you can enter the code manually in the headed browser.
 */
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

    // Check if Clerk asks for a verification code (email OTP)
    // If we land on dashboard immediately, great — no code needed.
    // Otherwise, wait up to 120s for the user to enter the code manually.
    const dashboardOrCode = await Promise.race([
        page.waitForURL(/dashboard/, { timeout: 5_000 }).then(() => "dashboard" as const),
        page.locator('input[name="code"], input[autocomplete="one-time-code"], input[inputmode="numeric"]')
            .first()
            .waitFor({ state: "visible", timeout: 5_000 })
            .then(() => "code" as const),
    ]).catch(() => "unknown" as const)

    if (dashboardOrCode === "dashboard") {
        return // Already signed in, no verification needed
    }

    if (dashboardOrCode === "code") {
        // Verification code step detected — pause and let the user enter it
        console.log("\n╔══════════════════════════════════════════════════════╗")
        console.log("║  VERIFICATION CODE REQUIRED                        ║")
        console.log("║  Check your email and enter the code in the        ║")
        console.log("║  browser window. Waiting up to 120 seconds...      ║")
        console.log("╚══════════════════════════════════════════════════════╝\n")

        // Wait for the user to enter the code and get redirected to dashboard
        await page.waitForURL(/dashboard/, { timeout: 120_000 })
        return
    }

    // Fallback: neither dashboard nor code input detected — wait longer
    // This handles edge cases like slow Clerk redirects
    await page.waitForURL(/dashboard/, { timeout: 120_000 })
}
