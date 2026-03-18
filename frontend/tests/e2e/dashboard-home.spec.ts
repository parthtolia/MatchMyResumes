import { test, expect } from "@playwright/test"
import { navigateToDashboard, collectConsoleErrors } from "../utils/test-helpers"

test.describe("Dashboard Home", () => {
    test.beforeEach(async ({ page }) => {
        await navigateToDashboard(page)
    })

    // ── Welcome header ────────────────────────────────────────────
    test("should display welcome message", async ({ page }) => {
        await expect(
            page.getByText(/welcome/i).first()
        ).toBeVisible({ timeout: 15_000 })
    })

    // ── Stat cards ────────────────────────────────────────────────
    test("should display all four stat cards", async ({ page }) => {
        const statLabels = [
            /resumes stored/i,
            /ats scans/i,
            /cover letters/i,
            /applications/i,
        ]

        for (const label of statLabels) {
            await expect(
                page.getByText(label).first()
            ).toBeVisible({ timeout: 15_000 })
        }
    })

    test("should show numeric values in stat cards", async ({ page }) => {
        // Wait for stats to load (they show numbers like 0, 1, 5, etc.)
        await page.waitForTimeout(3_000)

        // Each stat card should have a number
        const statCards = page.locator("text=/^\\d+$/")
        const count = await statCards.count()
        expect(count).toBeGreaterThanOrEqual(4)
    })

    // ── Quick action cards ────────────────────────────────────────
    test("should display all quick action cards", async ({ page }) => {
        const actions = [
            { text: /resume ats score/i, href: /cv-analysis/ },
            { text: /jd match score/i, href: /scan/ },
            { text: /ai optimizer/i, href: /optimize/ },
            { text: /cover letter/i, href: /cover-letter/ },
        ]

        for (const action of actions) {
            const link = page.locator("a").filter({ hasText: action.text }).first()
            await expect(link).toBeVisible({ timeout: 10_000 })
        }
    })

    test("should navigate to CV Analysis from quick action", async ({ page }) => {
        const link = page.locator('a[href*="/dashboard/cv-analysis"]').first()
        await link.click()
        await page.waitForURL(/cv-analysis/, { timeout: 10_000 })
        await expect(page.getByText(/resume ats score/i).first()).toBeVisible()
    })

    test("should navigate to JD Match from quick action", async ({ page }) => {
        const link = page.locator('a[href*="/dashboard/scan"]').first()
        await link.click()
        await page.waitForURL(/scan/, { timeout: 10_000 })
    })

    test("should navigate to Optimizer from quick action", async ({ page }) => {
        const link = page.locator('a[href*="/dashboard/optimize"]').first()
        await link.click()
        await page.waitForURL(/optimize/, { timeout: 10_000 })
    })

    test("should navigate to Cover Letter from quick action", async ({ page }) => {
        const link = page.locator('a[href*="/dashboard/cover-letter"]').first()
        await link.click()
        await page.waitForURL(/cover-letter/, { timeout: 10_000 })
    })

    // ── Tips section ──────────────────────────────────────────────
    test("should display ATS tips section", async ({ page }) => {
        await expect(
            page.getByText(/keyword match/i).first()
        ).toBeVisible({ timeout: 10_000 })

        await expect(
            page.getByText(/formatting/i).first()
        ).toBeVisible()
    })

    // ── No console errors ─────────────────────────────────────────
    test("should load dashboard without console errors", async ({ page }) => {
        const errors = collectConsoleErrors(page)
        await navigateToDashboard(page)
        await page.waitForTimeout(3_000)

        // Filter out known benign errors (e.g., favicon 404, analytics)
        const critical = errors.filter(
            (e) =>
                !e.includes("favicon") &&
                !e.includes("analytics") &&
                !e.includes("gtag") &&
                !e.includes("clerk")
        )
        expect(critical).toHaveLength(0)
    })
})
