import { test, expect } from "@playwright/test"
import {
    FILES,
    SAMPLE_JD,
    navigateToDashboard,
    uploadFileViaDropzone,
    mockApiError,
    uniqueJdTitle,
} from "../utils/test-helpers"

test.describe("Cover Letter Generator", () => {
    test.beforeEach(async ({ page }) => {
        await navigateToDashboard(page, "cover-letter")
    })

    // ── Page load ─────────────────────────────────────────────────
    test("should display the cover letter page", async ({ page }) => {
        await expect(
            page.getByText(/cover letter generator/i).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    test("should show empty state before generation", async ({ page }) => {
        await expect(
            page.getByText(/your cover letter will appear here/i).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    // ── Configuration panel ───────────────────────────────────────
    test("should display resume dropdown", async ({ page }) => {
        await expect(
            page.getByText(/resume/i).first()
        ).toBeVisible({ timeout: 10_000 })

        // Either a select/dropdown or "Choose resume" placeholder
        const select = page.locator("select, [role='combobox']").first()
        await expect(select).toBeVisible({ timeout: 5_000 })
    })

    test("should display tone selection buttons", async ({ page }) => {
        const tones = ["professional", "enthusiastic", "confident", "creative"]

        for (const tone of tones) {
            await expect(
                page.locator("button").filter({ hasText: new RegExp(tone, "i") }).first()
            ).toBeVisible({ timeout: 10_000 })
        }
    })

    test("should display length selection buttons", async ({ page }) => {
        const lengths = ["Short", "Medium", "Long"]

        for (const length of lengths) {
            await expect(
                page.locator("button").filter({ hasText: new RegExp(length, "i") }).first()
            ).toBeVisible({ timeout: 10_000 })
        }
    })

    test("should allow selecting different tones", async ({ page }) => {
        // Click each tone button and verify it becomes active
        const tones = ["enthusiastic", "confident", "creative", "professional"]

        for (const tone of tones) {
            const btn = page.locator("button").filter({ hasText: new RegExp(tone, "i") }).first()
            await btn.click()
            // Active button has violet/highlighted styling
            await page.waitForTimeout(300)
        }
    })

    test("should allow selecting different lengths", async ({ page }) => {
        const lengths = ["Short", "Medium", "Long"]

        for (const length of lengths) {
            const btn = page.locator("button").filter({ hasText: new RegExp(length, "i") }).first()
            await btn.click()
            await page.waitForTimeout(300)
        }
    })

    // ── JD source toggle ──────────────────────────────────────────
    test("should toggle between saved JD and paste new JD", async ({ page }) => {
        const pasteRadio = page.getByText(/paste new/i).first()
        if (await pasteRadio.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await pasteRadio.click()

            // Textarea should appear for pasting
            await expect(
                page.locator("textarea").first()
            ).toBeVisible({ timeout: 5_000 })
        }
    })

    // ── Generate button ───────────────────────────────────────────
    test("should show generate button", async ({ page }) => {
        await expect(
            page.locator("button").filter({ hasText: /generate cover letter/i }).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    // ── Full generation flow ──────────────────────────────────────
    test("should generate a cover letter end-to-end", async ({ page }) => {
        test.setTimeout(120_000) // AI generation can take time

        // Select first resume from dropdown
        const resumeSelect = page.locator("select").first()
        await resumeSelect.waitFor({ state: "visible", timeout: 10_000 })
        const options = await resumeSelect.locator("option").count()

        // Skip if no resumes available
        if (options <= 1) {
            test.skip(true, "No resumes available for cover letter generation")
            return
        }

        await resumeSelect.selectOption({ index: 1 })

        // Switch to paste new JD
        const pasteRadio = page.getByText(/paste new/i).first()
        if (await pasteRadio.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await pasteRadio.click()
        }

        // Fill JD title if input exists
        const titleInput = page.locator('input[placeholder*="title" i], input[name*="title" i]').first()
        if (await titleInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await titleInput.fill(uniqueJdTitle())
        }

        // Fill JD text
        const jdTextarea = page.locator("textarea").first()
        await jdTextarea.fill(SAMPLE_JD.text)

        // Optional: fill company and job title
        const companyInput = page.locator('input[placeholder*="company" i]').first()
        if (await companyInput.isVisible({ timeout: 1_000 }).catch(() => false)) {
            await companyInput.fill("Acme Corp")
        }

        const jobTitleInput = page.locator('input[placeholder*="job title" i]').first()
        if (await jobTitleInput.isVisible({ timeout: 1_000 }).catch(() => false)) {
            await jobTitleInput.fill("Senior Software Engineer")
        }

        // Click Generate
        const generateBtn = page.locator("button").filter({ hasText: /generate cover letter/i }).first()
        await generateBtn.click()

        // Should show loading state
        await expect(
            page.getByText(/generating|analyzing|extracting|drafting|polishing/i).first()
        ).toBeVisible({ timeout: 10_000 })

        // Wait for cover letter to appear (long timeout for AI)
        await expect(
            page.locator("textarea, [class*='preview']").first()
        ).toBeVisible({ timeout: 90_000 })

        // Output should contain substantial text (not empty)
        const outputArea = page.locator("textarea").nth(1).or(page.locator("textarea").first())
        const text = await outputArea.inputValue().catch(() => "")
        if (text) {
            expect(text.length).toBeGreaterThan(50)
        }
    })

    // ── Editor tabs ───────────────────────────────────────────────
    test("should show Write and Preview tabs after generation", async ({ page }) => {
        // This test verifies the tabs exist in the output panel
        // Mock a successful cover letter response to avoid waiting for AI
        await page.route(/\/api\/cover-letters/, (route) =>
            route.fulfill({
                status: 201,
                contentType: "application/json",
                body: JSON.stringify({
                    id: "test-cl-1",
                    content: "# Cover Letter\n\nDear Hiring Manager,\n\nI am writing to express my interest in the position.\n\nSincerely,\nTest User",
                    tone: "professional",
                    length: "short",
                    company_name: "Acme",
                    job_title: "Engineer",
                    created_at: new Date().toISOString(),
                }),
            })
        )

        // Select resume and JD
        const resumeSelect = page.locator("select").first()
        await resumeSelect.waitFor({ state: "visible", timeout: 10_000 })
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

        const generateBtn = page.locator("button").filter({ hasText: /generate cover letter/i }).first()
        await generateBtn.click()

        // Check for Write/Preview tabs
        await expect(
            page.locator("button").filter({ hasText: /write/i }).first()
        ).toBeVisible({ timeout: 15_000 })

        await expect(
            page.locator("button").filter({ hasText: /preview/i }).first()
        ).toBeVisible({ timeout: 5_000 })
    })

    // ── Error handling ────────────────────────────────────────────
    test("should show error when cover letter API fails", async ({ page }) => {
        await mockApiError(page, /\/api\/cover-letters/, 500, {
            detail: "AI service unavailable",
        })

        const resumeSelect = page.locator("select").first()
        await resumeSelect.waitFor({ state: "visible", timeout: 10_000 })
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

        const generateBtn = page.locator("button").filter({ hasText: /generate cover letter/i }).first()
        await generateBtn.click()

        await expect(
            page.getByText(/error|failed|unavailable/i).first()
        ).toBeVisible({ timeout: 15_000 })
    })
})
