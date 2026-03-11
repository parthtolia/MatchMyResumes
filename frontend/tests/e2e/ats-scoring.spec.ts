import { test, expect } from "@playwright/test"
import {
    FILES,
    SAMPLE_JD,
    navigateToDashboard,
    uploadFileViaDropzone,
    mockApiError,
    mockApiTimeout,
} from "../utils/test-helpers"

test.describe("ATS Score Generation — CV Analysis (standalone)", () => {
    test.beforeEach(async ({ page }) => {
        await navigateToDashboard(page, "cv-analysis")
    })

    test("should upload resume and display ATS score", async ({ page }) => {
        await uploadFileViaDropzone(page, FILES.validPdf)

        // Wait for score to appear (AI processing can take a while)
        // Score circle shows a number 0-100
        await expect(
            page.locator("text=/\\b\\d{1,3}\\b/").first()
        ).toBeVisible({ timeout: 60_000 })

        // Check that score breakdown sections appear
        await expect(
            page.getByText(/section completeness|ats formatting|quantification/i).first()
        ).toBeVisible({ timeout: 5_000 })
    })

    test("should display improvement tips after scoring", async ({ page }) => {
        await uploadFileViaDropzone(page, FILES.validPdf)

        // Wait for results
        await page.waitForTimeout(2_000)
        await expect(
            page.getByText(/improvement|tips|suggestion/i).first()
        ).toBeVisible({ timeout: 60_000 })
    })

    test("should show CTA to JD Match after CV score", async ({ page }) => {
        await uploadFileViaDropzone(page, FILES.validPdf)

        // After scoring, a CTA banner links to /dashboard/scan
        await expect(
            page.getByText(/match.*job description|ATS vs JD/i).first()
        ).toBeVisible({ timeout: 60_000 })
    })
})

test.describe("ATS Score Generation — JD Match Score", () => {
    test.beforeEach(async ({ page }) => {
        await navigateToDashboard(page, "scan")
    })

    test("should show 3-step flow indicator", async ({ page }) => {
        // Step indicator: upload → job description → result
        await expect(page.getByText(/upload/i).first()).toBeVisible()
        await expect(page.getByText(/job description/i).first()).toBeVisible()
    })

    test("should upload resume and proceed to JD step", async ({ page }) => {
        // Step 1: upload resume
        await uploadFileViaDropzone(page, FILES.validPdf)

        // Should advance to step 2 and show resume filename
        await expect(
            page.getByText(/resume uploaded|sample-resume/i).first()
        ).toBeVisible({ timeout: 30_000 })

        // JD input area should now be visible
        await expect(
            page.getByText(/paste.*job description|select.*saved/i).first()
        ).toBeVisible({ timeout: 5_000 })
    })

    test("should score resume against pasted JD", async ({ page }) => {
        // Step 1: upload
        await uploadFileViaDropzone(page, FILES.validPdf)
        await expect(
            page.getByText(/resume uploaded|sample-resume/i).first()
        ).toBeVisible({ timeout: 30_000 })

        // Step 2: enter JD — click "Paste New Job Description" radio if present
        const pasteRadio = page.getByText(/paste new/i).first()
        if (await pasteRadio.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await pasteRadio.click()
        }

        // Fill in job title and description
        const titleInput = page.locator(
            'input[placeholder*="title" i], input[name*="title" i]'
        ).first()
        if (await titleInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await titleInput.fill(SAMPLE_JD.title)
        }

        const jdTextarea = page.locator(
            'textarea[placeholder*="description" i], textarea[placeholder*="paste" i], textarea[name*="jd" i], textarea'
        ).first()
        await jdTextarea.fill(SAMPLE_JD.text)

        // Click analyze button
        const analyzeBtn = page.locator(
            'button:has-text("Analyze"), button:has-text("Score"), button:has-text("Submit")'
        ).first()
        await analyzeBtn.click()

        // Step 3: Wait for score result
        await expect(
            page.getByText(/keyword match|semantic similarity|ats formatting/i).first()
        ).toBeVisible({ timeout: 60_000 })
    })

    test("should show keyword heatmap in results", async ({ page }) => {
        // Upload + enter JD
        await uploadFileViaDropzone(page, FILES.validPdf)
        await expect(
            page.getByText(/resume uploaded|sample-resume/i).first()
        ).toBeVisible({ timeout: 30_000 })

        const pasteRadio = page.getByText(/paste new/i).first()
        if (await pasteRadio.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await pasteRadio.click()
        }

        const titleInput = page.locator('input[placeholder*="title" i]').first()
        if (await titleInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await titleInput.fill(SAMPLE_JD.title)
        }

        const jdTextarea = page.locator("textarea").first()
        await jdTextarea.fill(SAMPLE_JD.text)

        const analyzeBtn = page.locator(
            'button:has-text("Analyze"), button:has-text("Score")'
        ).first()
        await analyzeBtn.click()

        // Wait for keyword heatmap
        await expect(
            page.getByText(/matched|missing|keyword/i).first()
        ).toBeVisible({ timeout: 60_000 })
    })
})

test.describe("ATS Score — Error Scenarios", () => {
    test("should show error when scoring API fails", async ({ page }) => {
        // Mock the scoring endpoint to return 500
        await mockApiError(page, /\/api\/resumes\/cv-score/, 500, {
            detail: "AI service temporarily unavailable",
        })

        await navigateToDashboard(page, "cv-analysis")
        await uploadFileViaDropzone(page, FILES.validPdf)

        // Should show error message instead of crashing
        await expect(
            page.getByText(/error|failed|unavailable|try again/i).first()
        ).toBeVisible({ timeout: 30_000 })
    })

    test("should handle API timeout gracefully", async ({ page }) => {
        // Mock scoring to never respond
        await mockApiTimeout(page, /\/api\/resumes\/cv-score/)

        await navigateToDashboard(page, "cv-analysis")
        await uploadFileViaDropzone(page, FILES.validPdf)

        // Should eventually show a timeout or error state
        // (axios has a default timeout, or the UI has a loading timeout)
        await expect(
            page.getByText(/timeout|error|failed|taking too long/i).first()
        ).toBeVisible({ timeout: 90_000 })
    })

    test("should handle corrupted file during scoring", async ({ page }) => {
        await navigateToDashboard(page, "cv-analysis")
        await uploadFileViaDropzone(page, FILES.corrupted)

        // Backend should return parse error
        await expect(
            page.getByText(/error|failed|corrupt|parse|unable/i).first()
        ).toBeVisible({ timeout: 30_000 })
    })

    test("should recover after page refresh during scoring", async ({ page }) => {
        await navigateToDashboard(page, "cv-analysis")
        await uploadFileViaDropzone(page, FILES.validPdf)

        // Immediately refresh while scoring might be in progress
        await page.waitForTimeout(500)
        await page.reload()
        await page.waitForLoadState("domcontentloaded")

        // Page should recover — show the upload form again, not crash
        await expect(
            page.getByText(/drop.*resume|click to browse|resume ats score/i).first()
        ).toBeVisible({ timeout: 15_000 })
    })
})
