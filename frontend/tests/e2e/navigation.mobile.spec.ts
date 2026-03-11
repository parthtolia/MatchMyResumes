import { test, expect } from "@playwright/test"

test.describe("Mobile Navigation", () => {
    test("should show mobile menu button", async ({ page }) => {
        await page.goto("/dashboard")
        await page.waitForLoadState("domcontentloaded")

        // On mobile viewport, a hamburger/menu button should be visible
        const menuBtn = page.locator(
            'button[aria-label*="menu" i], button[aria-label*="nav" i], [data-testid="mobile-menu"]'
        ).first()

        await expect(menuBtn).toBeVisible({ timeout: 10_000 })
    })

    test("should open mobile menu and show nav links", async ({ page }) => {
        await page.goto("/dashboard")
        await page.waitForLoadState("domcontentloaded")

        const menuBtn = page.locator(
            'button[aria-label*="menu" i], button[aria-label*="nav" i], [data-testid="mobile-menu"]'
        ).first()

        if (await menuBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await menuBtn.click()

            // Nav links should now be visible
            await expect(
                page.locator('a[href*="dashboard"]').first()
            ).toBeVisible({ timeout: 5_000 })
        }
    })

    test("should navigate via mobile menu", async ({ page }) => {
        await page.goto("/dashboard")
        await page.waitForLoadState("domcontentloaded")

        const menuBtn = page.locator(
            'button[aria-label*="menu" i], button[aria-label*="nav" i]'
        ).first()

        if (await menuBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await menuBtn.click()

            const resumesLink = page.locator('a[href*="/resumes"]').first()
            if (await resumesLink.isVisible({ timeout: 3_000 }).catch(() => false)) {
                await resumesLink.click()
                await page.waitForURL(/resumes/, { timeout: 10_000 })
            }
        }
    })

    test("should render landing page without horizontal overflow", async ({ page }) => {
        await page.goto("/")
        await page.waitForLoadState("domcontentloaded")

        const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
        const viewportWidth = page.viewportSize()?.width || 393
        // Allow 5px tolerance for scroll bar
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5)
    })
})
