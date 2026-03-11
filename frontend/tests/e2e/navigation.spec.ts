import { test, expect } from "@playwright/test"
import { navigateToDashboard } from "../utils/test-helpers"

test.describe("Navigation — Dashboard Routes", () => {
    test("should navigate from homepage to dashboard", async ({ page }) => {
        await page.goto("/")
        await page.waitForLoadState("domcontentloaded")

        // Click Dashboard link or Get Started
        const dashLink = page.locator(
            'a[href*="dashboard"], a:has-text("Dashboard"), a:has-text("Get Started")'
        ).first()
        await dashLink.click()

        // Should land on dashboard (or sign-in if not authed)
        await page.waitForURL(/(dashboard|sign-in)/, { timeout: 15_000 })
    })

    test("should navigate from dashboard to resume upload page", async ({ page }) => {
        await navigateToDashboard(page)

        // Click on resumes nav link or quick action
        const resumeLink = page.locator(
            'a[href*="/dashboard/resumes"], a:has-text("My Resumes"), a:has-text("Resumes")'
        ).first()
        await resumeLink.click()

        await page.waitForURL(/\/dashboard\/resumes/, { timeout: 10_000 })
        await expect(page.getByText(/my resumes/i).first()).toBeVisible()
    })

    test("should navigate to JD Match Score page", async ({ page }) => {
        await navigateToDashboard(page)

        const scanLink = page.locator(
            'a[href*="/dashboard/scan"], a:has-text("JD Match")'
        ).first()
        await scanLink.click()

        await page.waitForURL(/\/dashboard\/scan/, { timeout: 10_000 })
        await expect(page.getByText(/jd match score/i).first()).toBeVisible()
    })

    test("should navigate to Resume ATS Score page", async ({ page }) => {
        await navigateToDashboard(page)

        const cvLink = page.locator(
            'a[href*="/dashboard/cv-analysis"], a:has-text("Resume ATS"), a:has-text("ATS Score")'
        ).first()
        await cvLink.click()

        await page.waitForURL(/\/dashboard\/cv-analysis/, { timeout: 10_000 })
        await expect(page.getByText(/resume ats score/i).first()).toBeVisible()
    })

    test("should navigate to AI Optimizer page", async ({ page }) => {
        await navigateToDashboard(page)

        const optLink = page.locator(
            'a[href*="/dashboard/optimize"], a:has-text("Optimizer"), a:has-text("Optimize")'
        ).first()
        await optLink.click()

        await page.waitForURL(/\/dashboard\/optimize/, { timeout: 10_000 })
        await expect(page.getByText(/ai resume optimizer/i).first()).toBeVisible()
    })

    test("should navigate to Cover Letter page", async ({ page }) => {
        await navigateToDashboard(page)

        const clLink = page.locator(
            'a[href*="/dashboard/cover-letter"], a:has-text("Cover Letter")'
        ).first()
        await clLink.click()

        await page.waitForURL(/\/dashboard\/cover-letter/, { timeout: 10_000 })
    })

    test("should navigate to Settings page", async ({ page }) => {
        await navigateToDashboard(page)

        const settingsLink = page.locator(
            'a[href*="/dashboard/settings"], a:has-text("Settings")'
        ).first()
        await settingsLink.click()

        await page.waitForURL(/\/dashboard\/settings/, { timeout: 10_000 })
        await expect(page.getByText(/settings/i).first()).toBeVisible()
    })

    test("should navigate to Application Tracker page", async ({ page }) => {
        await navigateToDashboard(page)

        const trackerLink = page.locator(
            'a[href*="/dashboard/tracker"], a:has-text("Tracker"), a:has-text("Applications")'
        ).first()
        await trackerLink.click()

        await page.waitForURL(/\/dashboard\/tracker/, { timeout: 10_000 })
    })

    test("should navigate to Pricing page", async ({ page }) => {
        await navigateToDashboard(page)

        const pricingLink = page.locator(
            'a[href*="/dashboard/pricing"], a:has-text("Pricing"), a:has-text("Upgrade")'
        ).first()
        await pricingLink.click()

        await page.waitForURL(/\/dashboard\/pricing/, { timeout: 10_000 })
    })
})

test.describe("Navigation — Quick Actions on Dashboard", () => {
    test("should link to ATS Score from quick actions", async ({ page }) => {
        await navigateToDashboard(page)

        const quickAction = page.locator(
            'a[href="/dashboard/cv-analysis"]'
        ).first()
        if (await quickAction.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await quickAction.click()
            await page.waitForURL(/cv-analysis/, { timeout: 10_000 })
        }
    })

    test("should link to JD Match Score from quick actions", async ({ page }) => {
        await navigateToDashboard(page)

        const quickAction = page.locator(
            'a[href="/dashboard/scan"]'
        ).first()
        if (await quickAction.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await quickAction.click()
            await page.waitForURL(/scan/, { timeout: 10_000 })
        }
    })
})

test.describe("Navigation — Sidebar / Mobile Menu", () => {
    test("should show sidebar with all navigation links", async ({ page }) => {
        await navigateToDashboard(page)

        // Check that the main nav links exist in the page
        const navTexts = [
            /dashboard/i,
            /resumes/i,
            /score|scan|analysis/i,
            /settings/i,
        ]

        for (const text of navTexts) {
            await expect(page.locator("a, button").filter({ hasText: text }).first()).toBeVisible({
                timeout: 5_000,
            })
        }
    })
})
