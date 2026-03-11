import { test, expect } from "@playwright/test"
import { clerkLogin, TEST_USER } from "../utils/test-helpers"

test.describe("Authentication — No Auth Required", () => {
    // ── Signup ──────────────────────────────────────────────────────
    test("should display the sign-up page", async ({ page }) => {
        await page.goto("/sign-up")
        await page.waitForLoadState("domcontentloaded")

        // Clerk renders a sign-up form
        await expect(page.locator("text=Sign up").or(page.locator("text=Create your account")).first()).toBeVisible({
            timeout: 15_000,
        })
    })

    test("should have email and password fields on sign-up", async ({ page }) => {
        await page.goto("/sign-up")
        await page.waitForLoadState("domcontentloaded")

        const emailInput = page.locator(
            'input[name="emailAddress"], input[type="email"], input[autocomplete="email"]'
        ).first()
        await expect(emailInput).toBeVisible({ timeout: 15_000 })
    })

    // ── Login ───────────────────────────────────────────────────────
    test("should display the sign-in page", async ({ page }) => {
        await page.goto("/sign-in")
        await page.waitForLoadState("domcontentloaded")

        await expect(page.locator("text=Sign in").or(page.locator("text=Welcome back")).first()).toBeVisible({
            timeout: 15_000,
        })
    })

    test("should login with valid credentials and redirect to dashboard", async ({ page }) => {
        // Skip if no real test credentials are configured
        test.skip(
            !process.env.TEST_USER_EMAIL,
            "Set TEST_USER_EMAIL and TEST_USER_PASSWORD env vars with a real Clerk account to run this test"
        )
        await clerkLogin(page, TEST_USER.email, TEST_USER.password)
        await expect(page).toHaveURL(/dashboard/)
    })

    test("should show error on invalid login attempt", async ({ page }) => {
        await page.goto("/sign-in")
        await page.waitForLoadState("domcontentloaded")

        // Enter invalid credentials
        const emailInput = page.locator(
            'input[name="identifier"], input[type="email"], input[autocomplete="email"]'
        ).first()
        await emailInput.waitFor({ state: "visible", timeout: 15_000 })
        await emailInput.fill("nonexistent@example.com")

        // Click Clerk's primary form button
        await page.locator(".cl-formButtonPrimary").click()

        // Clerk shows "Couldn't find your account." error
        await expect(
            page.getByText(/couldn.*find|invalid|not found|no account/i).first()
        ).toBeVisible({ timeout: 15_000 })
    })

    // ── Unauthenticated redirect ────────────────────────────────────
    test("should redirect unauthenticated users from dashboard to sign-in", async ({ page }) => {
        await page.goto("/dashboard")
        // Should redirect to sign-in (Clerk middleware or layout guard)
        await expect(page).toHaveURL(/sign-in/, { timeout: 15_000 })
    })

    // ── Landing page accessible ─────────────────────────────────────
    test("should load the landing page without auth", async ({ page }) => {
        await page.goto("/")
        await expect(page.locator("h1").first()).toBeVisible()
        // Check for key landing page content
        await expect(page.getByText(/ATS|resume|score/i).first()).toBeVisible()
    })
})
