import { test, expect } from "@playwright/test"
import { navigateToDashboard } from "../utils/test-helpers"

test.describe("Resume Templates Page", () => {
    test.beforeEach(async ({ page }) => {
        await navigateToDashboard(page, "resume-templates")
    })

    // ── Page load ─────────────────────────────────────────────────
    test("should display templates page", async ({ page }) => {
        await expect(
            page.getByText(/ats resume templates/i).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    // ── Stats bar ─────────────────────────────────────────────────
    test("should display template stats", async ({ page }) => {
        await expect(page.getByText(/free templates/i).first()).toBeVisible({ timeout: 10_000 })
        await expect(page.getByText(/ats compatible/i).first()).toBeVisible({ timeout: 10_000 })
        await expect(page.getByText(/downloads/i).first()).toBeVisible({ timeout: 10_000 })
    })

    // ── Search ────────────────────────────────────────────────────
    test("should display search input", async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="search" i]').first()
        await expect(searchInput).toBeVisible({ timeout: 10_000 })
    })

    test("should filter templates by search", async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="search" i]').first()
        await searchInput.fill("professional")
        await page.waitForTimeout(500)

        // Should show filtered results count
        await expect(
            page.getByText(/showing \d+ of \d+ templates/i).first()
        ).toBeVisible({ timeout: 5_000 })
    })

    // ── Category filter ───────────────────────────────────────────
    test("should display category filter buttons", async ({ page }) => {
        await expect(
            page.getByText(/category/i).first()
        ).toBeVisible({ timeout: 10_000 })

        // "All" button should be visible
        await expect(
            page.locator("button").filter({ hasText: /all/i }).first()
        ).toBeVisible({ timeout: 5_000 })
    })

    test("should filter by category", async ({ page }) => {
        // Click a category button (not "All")
        const categoryBtns = page.locator("button").filter({ hasText: /chronological|functional|hybrid/i })
        const firstCategory = categoryBtns.first()

        if (await firstCategory.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await firstCategory.click()
            await page.waitForTimeout(500)

            // Results should update
            await expect(
                page.getByText(/showing \d+ of \d+ templates/i).first()
            ).toBeVisible({ timeout: 5_000 })
        }
    })

    // ── Level filter ──────────────────────────────────────────────
    test("should display level filter buttons", async ({ page }) => {
        await expect(
            page.getByText(/level/i).first()
        ).toBeVisible({ timeout: 10_000 })

        // All Levels button
        await expect(
            page.locator("button").filter({ hasText: /all levels/i }).first()
        ).toBeVisible({ timeout: 5_000 })
    })

    test("should filter by experience level", async ({ page }) => {
        const levelBtns = page.locator("button").filter({ hasText: /entry|mid|senior|executive/i })
        const firstLevel = levelBtns.first()

        if (await firstLevel.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await firstLevel.click()
            await page.waitForTimeout(500)

            await expect(
                page.getByText(/showing \d+ of \d+ templates/i).first()
            ).toBeVisible({ timeout: 5_000 })
        }
    })

    // ── Clear filters ─────────────────────────────────────────────
    test("should show and use clear filters button", async ({ page }) => {
        // Apply a filter first
        const searchInput = page.locator('input[placeholder*="search" i]').first()
        await searchInput.fill("executive")
        await page.waitForTimeout(500)

        // Clear filters button should appear
        const clearBtn = page.locator("button").filter({ hasText: /clear filter/i }).first()
        if (await clearBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await clearBtn.click()
            await page.waitForTimeout(500)

            // Search should be cleared
            const value = await searchInput.inputValue()
            expect(value).toBe("")
        }
    })

    // ── Template grid ─────────────────────────────────────────────
    test("should display template cards in grid", async ({ page }) => {
        await expect(
            page.getByText(/showing \d+ of \d+ templates/i).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    // ── Tips section ──────────────────────────────────────────────
    test("should display how-to-use tips", async ({ page }) => {
        await expect(
            page.getByText(/how to use/i).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    // ── CTA ───────────────────────────────────────────────────────
    test("should show ATS score CTA", async ({ page }) => {
        await expect(
            page.getByText(/ready to check your ats score/i).first()
        ).toBeVisible({ timeout: 10_000 })

        const ctaLink = page.locator("a").filter({ hasText: /check your ats score/i }).first()
        await expect(ctaLink).toBeVisible({ timeout: 5_000 })
    })

    test("should navigate to CV Analysis from CTA", async ({ page }) => {
        const ctaLink = page.locator("a").filter({ hasText: /check your ats score/i }).first()
        if (await ctaLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await ctaLink.click()
            await page.waitForURL(/cv-analysis/, { timeout: 10_000 })
        }
    })
})
