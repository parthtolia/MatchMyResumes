import { test, expect } from "@playwright/test"

test.describe("Public Pages — No Auth Required", () => {
    // ── Landing page ──────────────────────────────────────────────
    test("should load landing page", async ({ page }) => {
        await page.goto("/")
        await page.waitForLoadState("domcontentloaded")

        await expect(page.locator("h1").first()).toBeVisible({ timeout: 10_000 })
    })

    test("should display hero section with CTA", async ({ page }) => {
        await page.goto("/")
        await page.waitForLoadState("domcontentloaded")

        // Main headline should mention ATS, resume, or score
        await expect(
            page.getByText(/ats|resume|score|match/i).first()
        ).toBeVisible({ timeout: 10_000 })

        // CTA button (Get Started, Try Free, Sign Up, etc.)
        const cta = page.locator("a, button").filter({ hasText: /get started|try free|sign up|start/i }).first()
        await expect(cta).toBeVisible({ timeout: 10_000 })
    })

    test("should have navigation links on landing page", async ({ page }) => {
        await page.goto("/")
        await page.waitForLoadState("domcontentloaded")

        // Check for nav links (sign in, pricing, etc.)
        const signInLink = page.locator("a").filter({ hasText: /sign in|log in/i }).first()
        const hasSignIn = await signInLink.isVisible({ timeout: 5_000 }).catch(() => false)

        // At minimum, the page should have clickable links
        const links = page.locator("a")
        const count = await links.count()
        expect(count).toBeGreaterThan(0)
    })

    test("should not have horizontal overflow on landing page", async ({ page }) => {
        await page.goto("/")
        await page.waitForLoadState("domcontentloaded")
        await page.waitForTimeout(2_000)

        const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
        const viewportWidth = page.viewportSize()?.width || 1280
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5)
    })

    // ── Privacy policy ────────────────────────────────────────────
    test("should load privacy policy page", async ({ page }) => {
        await page.goto("/privacy")
        await page.waitForLoadState("domcontentloaded")

        await expect(
            page.getByText(/privacy/i).first()
        ).toBeVisible({ timeout: 10_000 })

        // Page should have substantial content
        const bodyText = await page.locator("body").innerText()
        expect(bodyText.length).toBeGreaterThan(100)
    })

    // ── Terms of service ──────────────────────────────────────────
    test("should load terms of service page", async ({ page }) => {
        await page.goto("/terms")
        await page.waitForLoadState("domcontentloaded")

        await expect(
            page.getByText(/terms/i).first()
        ).toBeVisible({ timeout: 10_000 })

        const bodyText = await page.locator("body").innerText()
        expect(bodyText.length).toBeGreaterThan(100)
    })

    // ── Blog ──────────────────────────────────────────────────────
    test("should load blog listing page", async ({ page }) => {
        await page.goto("/blog")
        await page.waitForLoadState("domcontentloaded")

        // Page should render (might have articles or an empty state)
        await expect(page.locator("body")).toBeVisible()

        // Should have blog-related heading or content
        await expect(
            page.getByText(/blog|articles|posts/i).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    // ── 404 handling ──────────────────────────────────────────────
    test("should handle non-existent pages gracefully", async ({ page }) => {
        const response = await page.goto("/nonexistent-page-xyz")
        await page.waitForLoadState("domcontentloaded")

        // Should either show 404 page or redirect
        const is404 = response?.status() === 404
        const hasNotFound = await page.getByText(/not found|404/i).first().isVisible({ timeout: 5_000 }).catch(() => false)
        const redirected = !page.url().includes("nonexistent")

        // At minimum, page should not crash (show blank white screen)
        await expect(page.locator("body")).toBeVisible()
        expect(is404 || hasNotFound || redirected).toBeTruthy()
    })

    // ── SEO basics ────────────────────────────────────────────────
    test("should have meta title on landing page", async ({ page }) => {
        await page.goto("/")
        await page.waitForLoadState("domcontentloaded")

        const title = await page.title()
        expect(title.length).toBeGreaterThan(0)
    })

    test("should have meta description on landing page", async ({ page }) => {
        await page.goto("/")
        await page.waitForLoadState("domcontentloaded")

        const metaDesc = await page.locator('meta[name="description"]').getAttribute("content")
        expect(metaDesc).toBeTruthy()
        expect(metaDesc!.length).toBeGreaterThan(10)
    })
})
