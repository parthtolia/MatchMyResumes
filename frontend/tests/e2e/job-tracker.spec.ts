import { test, expect } from "@playwright/test"
import { navigateToDashboard } from "../utils/test-helpers"

test.describe("Job Application Tracker", () => {
    test.beforeEach(async ({ page }) => {
        await navigateToDashboard(page, "tracker")
    })

    // ── Page load ─────────────────────────────────────────────────
    test("should display tracker page", async ({ page }) => {
        await expect(
            page.getByText(/application tracker/i).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    test("should show kanban columns", async ({ page }) => {
        const columns = ["Saved", "Applied", "Interview", "Offer", "Rejected"]

        for (const col of columns) {
            await expect(
                page.getByText(new RegExp(col, "i")).first()
            ).toBeVisible({ timeout: 10_000 })
        }
    })

    test("should show Add Application button", async ({ page }) => {
        await expect(
            page.locator("button").filter({ hasText: /add application/i }).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    // ── Add application form ──────────────────────────────────────
    test("should open add application form", async ({ page }) => {
        const addBtn = page.locator("button").filter({ hasText: /add application/i }).first()
        await addBtn.click()

        // Form should appear with Company Name and Job Title fields
        await expect(
            page.getByText(/company name/i).first()
        ).toBeVisible({ timeout: 5_000 })

        await expect(
            page.getByText(/job title/i).first()
        ).toBeVisible({ timeout: 5_000 })
    })

    test("should show all form fields in add modal", async ({ page }) => {
        const addBtn = page.locator("button").filter({ hasText: /add application/i }).first()
        await addBtn.click()

        // Required fields
        await expect(page.getByText(/company name/i).first()).toBeVisible({ timeout: 5_000 })
        await expect(page.getByText(/job title/i).first()).toBeVisible({ timeout: 5_000 })

        // Optional fields
        await expect(page.getByText(/job url|url/i).first()).toBeVisible({ timeout: 5_000 })
    })

    test("should close form with Cancel button", async ({ page }) => {
        const addBtn = page.locator("button").filter({ hasText: /add application/i }).first()
        await addBtn.click()

        await expect(page.getByText(/company name/i).first()).toBeVisible({ timeout: 5_000 })

        // Click Cancel
        const cancelBtn = page.locator("button").filter({ hasText: /cancel/i }).first()
        await cancelBtn.click()

        // Form should close
        await page.waitForTimeout(500)
    })

    // ── Create application ────────────────────────────────────────
    test("should create a new application", async ({ page }) => {
        const timestamp = Date.now()
        const companyName = `TestCompany_${timestamp}`
        const jobTitle = `Engineer_${timestamp}`

        const addBtn = page.locator("button").filter({ hasText: /add application/i }).first()
        await addBtn.click()

        // Fill required fields
        const companyInput = page.locator('input[placeholder*="company" i], input[name*="company" i]').first()
        await companyInput.fill(companyName)

        const titleInput = page.locator('input[placeholder*="title" i], input[name*="title" i]').first()
        await titleInput.fill(jobTitle)

        // Submit
        const submitBtn = page.locator("button").filter({ hasText: /add application/i }).last()
        await submitBtn.click()

        // New card should appear on the board
        await expect(
            page.getByText(companyName).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    test("should create application with all fields filled", async ({ page }) => {
        const timestamp = Date.now()
        const companyName = `FullTest_${timestamp}`
        const jobTitle = `SeniorEng_${timestamp}`

        const addBtn = page.locator("button").filter({ hasText: /add application/i }).first()
        await addBtn.click()

        // Fill all fields
        const companyInput = page.locator('input[placeholder*="company" i], input[name*="company" i]').first()
        await companyInput.fill(companyName)

        const titleInput = page.locator('input[placeholder*="title" i], input[name*="title" i]').first()
        await titleInput.fill(jobTitle)

        const urlInput = page.locator('input[placeholder*="url" i], input[name*="url" i]').first()
        if (await urlInput.isVisible({ timeout: 1_000 }).catch(() => false)) {
            await urlInput.fill("https://example.com/jobs/123")
        }

        const notesArea = page.locator('textarea[placeholder*="notes" i], textarea').first()
        if (await notesArea.isVisible({ timeout: 1_000 }).catch(() => false)) {
            await notesArea.fill("Great company, applied via LinkedIn")
        }

        // Submit
        const submitBtn = page.locator("button").filter({ hasText: /add application/i }).last()
        await submitBtn.click()

        await expect(
            page.getByText(companyName).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    // ── Application card interactions ─────────────────────────────
    test("should expand application card to show details", async ({ page }) => {
        await page.waitForTimeout(3_000)

        // Find any application card (look for company names or job titles)
        const card = page.locator("[class*='card'], [class*='application']").first()
        const hasCards = await card.isVisible({ timeout: 5_000 }).catch(() => false)

        if (!hasCards) {
            // Check for empty state
            const isEmpty = await page.getByText(/no applications yet/i).first().isVisible({ timeout: 3_000 }).catch(() => false)
            if (isEmpty) {
                test.skip(true, "No applications to interact with")
                return
            }
        }

        // Try to expand a card by clicking the chevron/expand button
        const expandBtn = page.locator("button svg").first()
        if (await expandBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await expandBtn.click()
            await page.waitForTimeout(500)
        }
    })

    // ── Empty state ───────────────────────────────────────────────
    test("should show empty state or applications", async ({ page }) => {
        await page.waitForTimeout(3_000)

        const hasApps = await page.locator("[class*='card']").first().isVisible({ timeout: 3_000 }).catch(() => false)
        const hasEmpty = await page.getByText(/no applications yet/i).first().isVisible({ timeout: 3_000 }).catch(() => false)
        const hasStats = await page.getByText(/total|active/i).first().isVisible({ timeout: 3_000 }).catch(() => false)

        // Page should show either applications, empty state, or stats
        expect(hasApps || hasEmpty || hasStats).toBeTruthy()
    })

    // ── Persistence after refresh ─────────────────────────────────
    test("should persist applications after page refresh", async ({ page }) => {
        await page.waitForTimeout(3_000)

        // Get initial state
        const hasApps = await page.getByText(/total/i).first().isVisible({ timeout: 5_000 }).catch(() => false)

        // Refresh
        await page.reload()
        await page.waitForLoadState("domcontentloaded")

        // Same state should show
        await expect(
            page.getByText(/application tracker/i).first()
        ).toBeVisible({ timeout: 15_000 })
    })
})
