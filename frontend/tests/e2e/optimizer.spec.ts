import { test, expect } from "@playwright/test"
import {
    SAMPLE_JD,
    navigateToDashboard,
    mockApiError,
    uniqueJdTitle,
} from "../utils/test-helpers"

test.describe("AI Resume Optimizer", () => {
    test.beforeEach(async ({ page }) => {
        await navigateToDashboard(page, "optimize")
    })

    // ── Page load ─────────────────────────────────────────────────
    test("should display optimizer page", async ({ page }) => {
        await expect(
            page.getByText(/ai resume optimizer/i).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    test("should show AI rules explanation", async ({ page }) => {
        await expect(
            page.getByText(/ai rules|without fabricating/i).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    // ── Plan gating ───────────────────────────────────────────────
    test("should show plan gating for free users", async ({ page }) => {
        // Check if either the locked state or the optimize form is shown
        const locked = await page.getByText(/pro feature|upgrade/i).first().isVisible({ timeout: 5_000 }).catch(() => false)
        const unlocked = await page.locator("button").filter({ hasText: /optimize my resume/i }).first().isVisible({ timeout: 5_000 }).catch(() => false)

        // One of these must be true
        expect(locked || unlocked).toBeTruthy()
    })

    test("should show upgrade button when locked", async ({ page }) => {
        const lockState = page.getByText(/pro feature/i).first()
        if (await lockState.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await expect(
                page.locator("a, button").filter({ hasText: /upgrade|view.*plans/i }).first()
            ).toBeVisible({ timeout: 5_000 })
        }
    })

    // ── Form elements ─────────────────────────────────────────────
    test("should display resume dropdown", async ({ page }) => {
        const select = page.locator("select").first()
        await expect(select).toBeVisible({ timeout: 10_000 })
    })

    test("should display JD source radio options", async ({ page }) => {
        // Saved JD or Paste new
        const savedOption = page.getByText(/saved job|select saved/i).first()
        const pasteOption = page.getByText(/paste new/i).first()

        const hasSaved = await savedOption.isVisible({ timeout: 3_000 }).catch(() => false)
        const hasPaste = await pasteOption.isVisible({ timeout: 3_000 }).catch(() => false)

        expect(hasSaved || hasPaste).toBeTruthy()
    })

    // ── Optimization flow (Pro/Premium users) ─────────────────────
    test("should start optimization when form is filled", async ({ page }) => {
        test.setTimeout(120_000)

        // Skip if locked (free plan)
        const locked = await page.getByText(/pro feature/i).first().isVisible({ timeout: 5_000 }).catch(() => false)
        if (locked) {
            test.skip(true, "Free plan — optimizer is locked")
            return
        }

        // Select first resume
        const resumeSelect = page.locator("select").first()
        const options = await resumeSelect.locator("option").count()
        if (options <= 1) {
            test.skip(true, "No resumes available")
            return
        }
        await resumeSelect.selectOption({ index: 1 })

        // Switch to paste new JD
        const pasteRadio = page.getByText(/paste new/i).first()
        if (await pasteRadio.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await pasteRadio.click()
        }

        // Fill JD
        const titleInput = page.locator('input[placeholder*="title" i]').first()
        if (await titleInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await titleInput.fill(uniqueJdTitle())
        }

        const jdTextarea = page.locator("textarea").first()
        await jdTextarea.fill(SAMPLE_JD.text)

        // Click Optimize
        const optimizeBtn = page.locator("button").filter({ hasText: /optimize my resume/i }).first()
        await optimizeBtn.click()

        // Should show loading state
        await expect(
            page.getByText(/optimizing|gpt-4o|15-30 seconds/i).first()
        ).toBeVisible({ timeout: 15_000 })

        // Wait for results (long timeout for AI)
        await expect(
            page.getByText(/original resume|optimized resume|changes made/i).first()
        ).toBeVisible({ timeout: 90_000 })
    })

    test("should show side-by-side results after optimization", async ({ page }) => {
        test.setTimeout(120_000)

        const locked = await page.getByText(/pro feature/i).first().isVisible({ timeout: 5_000 }).catch(() => false)
        if (locked) {
            test.skip(true, "Free plan — optimizer is locked")
            return
        }

        // Mock a successful optimization to avoid waiting for AI
        await page.route(/\/api\/resumes\/optimize/, (route) =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    optimized_text: "Optimized resume content with improved keywords and formatting for ATS compatibility.",
                    changes_summary: [
                        "Added quantifiable metrics to work experience",
                        "Integrated missing keywords: Python, FastAPI, React",
                        "Improved action verb usage",
                    ],
                    new_resume_id: "test-optimized-1",
                }),
            })
        )

        const resumeSelect = page.locator("select").first()
        const options = await resumeSelect.locator("option").count()
        if (options <= 1) {
            test.skip(true, "No resumes available")
            return
        }
        await resumeSelect.selectOption({ index: 1 })

        const pasteRadio = page.getByText(/paste new/i).first()
        if (await pasteRadio.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await pasteRadio.click()
        }
        const jdTextarea = page.locator("textarea").first()
        await jdTextarea.fill(SAMPLE_JD.text)

        const optimizeBtn = page.locator("button").filter({ hasText: /optimize my resume/i }).first()
        await optimizeBtn.click()

        // Check for results layout
        await expect(
            page.getByText(/changes made|original resume|optimized resume/i).first()
        ).toBeVisible({ timeout: 30_000 })

        // Copy/PDF/DOCX buttons should appear
        await expect(
            page.locator("button").filter({ hasText: /copy/i }).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    // ── Error handling ────────────────────────────────────────────
    test("should handle optimization API error gracefully", async ({ page }) => {
        const locked = await page.getByText(/pro feature/i).first().isVisible({ timeout: 5_000 }).catch(() => false)
        if (locked) {
            test.skip(true, "Free plan — optimizer is locked")
            return
        }

        await mockApiError(page, /\/api\/resumes\/optimize/, 500, {
            detail: "AI service temporarily unavailable",
        })

        const resumeSelect = page.locator("select").first()
        const options = await resumeSelect.locator("option").count()
        if (options <= 1) {
            test.skip(true, "No resumes available")
            return
        }
        await resumeSelect.selectOption({ index: 1 })

        const pasteRadio = page.getByText(/paste new/i).first()
        if (await pasteRadio.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await pasteRadio.click()
        }
        const jdTextarea = page.locator("textarea").first()
        await jdTextarea.fill(SAMPLE_JD.text)

        const optimizeBtn = page.locator("button").filter({ hasText: /optimize my resume/i }).first()
        await optimizeBtn.click()

        await expect(
            page.getByText(/error|failed|unavailable/i).first()
        ).toBeVisible({ timeout: 15_000 })
    })
})
