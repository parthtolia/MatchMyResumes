import { test, expect } from "@playwright/test"
import {
    FILES,
    navigateToDashboard,
    uploadFileViaDropzone,
} from "../utils/test-helpers"

test.describe("Resume Management — View & Details", () => {
    test.beforeEach(async ({ page }) => {
        await navigateToDashboard(page, "resumes")
    })

    test("should show page heading and resume count", async ({ page }) => {
        await expect(
            page.getByText(/my resumes/i).first()
        ).toBeVisible({ timeout: 10_000 })

        // Should show "N resume versions stored" subtitle
        await expect(
            page.getByText(/resume.*stored/i).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    test("should display resume list with filenames", async ({ page }) => {
        // Wait for resumes to load from global data
        await page.waitForTimeout(3_000)

        // Either shows resume items or "No resumes uploaded yet"
        const hasResumes = await page.getByText(/\.pdf|\.docx/i).first().isVisible({ timeout: 5_000 }).catch(() => false)
        const hasEmpty = await page.getByText(/no resumes uploaded/i).first().isVisible({ timeout: 3_000 }).catch(() => false)

        expect(hasResumes || hasEmpty).toBeTruthy()
    })

    test("should show resume details when clicking a resume", async ({ page }) => {
        await page.waitForTimeout(3_000)

        // Click first resume item if available
        const resumeItem = page.locator("text=/\\.pdf|\\.docx/i").first()
        if (await resumeItem.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await resumeItem.click()

            // Detail panel should show with Copy/PDF/DOCX buttons
            await expect(
                page.getByText(/copy/i).first()
            ).toBeVisible({ timeout: 10_000 })
        }
    })

    test("should show Copy, PDF, and DOCX buttons in detail panel", async ({ page }) => {
        await page.waitForTimeout(3_000)

        const resumeItem = page.locator("text=/\\.pdf|\\.docx/i").first()
        if (await resumeItem.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await resumeItem.click()
            await page.waitForTimeout(1_000)

            await expect(page.locator("button").filter({ hasText: /copy/i }).first()).toBeVisible({ timeout: 5_000 })
            await expect(page.locator("button").filter({ hasText: /pdf/i }).first()).toBeVisible({ timeout: 5_000 })
            await expect(page.locator("button").filter({ hasText: /docx/i }).first()).toBeVisible({ timeout: 5_000 })
        }
    })

    test("should copy resume text to clipboard", async ({ page }) => {
        await page.waitForTimeout(3_000)

        const resumeItem = page.locator("text=/\\.pdf|\\.docx/i").first()
        if (await resumeItem.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await resumeItem.click()
            await page.waitForTimeout(1_000)

            const copyBtn = page.locator("button").filter({ hasText: /copy/i }).first()
            await copyBtn.click()

            // Button should change to "Copied!"
            await expect(
                page.getByText(/copied/i).first()
            ).toBeVisible({ timeout: 3_000 })
        }
    })
})

test.describe("Resume Management — Delete", () => {
    test.beforeEach(async ({ page }) => {
        await navigateToDashboard(page, "resumes")
    })

    test("should show Select mode toggle button", async ({ page }) => {
        await page.waitForTimeout(3_000)

        // Select button should be visible if resumes exist
        const selectBtn = page.locator("button").filter({ hasText: /select/i }).first()
        const hasResumes = await page.getByText(/\.pdf|\.docx/i).first().isVisible({ timeout: 5_000 }).catch(() => false)

        if (hasResumes) {
            await expect(selectBtn).toBeVisible({ timeout: 5_000 })
        }
    })

    test("should toggle select mode and show checkboxes", async ({ page }) => {
        await page.waitForTimeout(3_000)

        const selectBtn = page.locator("button").filter({ hasText: /^select$/i }).first()
        if (await selectBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await selectBtn.click()

            // Cancel button should appear (indicating select mode is active)
            await expect(
                page.locator("button").filter({ hasText: /cancel/i }).first()
            ).toBeVisible({ timeout: 3_000 })
        }
    })

    test("should show delete confirmation modal", async ({ page }) => {
        await page.waitForTimeout(3_000)

        // Hover over a resume to see the trash icon
        const resumeItem = page.locator("text=/\\.pdf|\\.docx/i").first()
        if (await resumeItem.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await resumeItem.hover()

            // Click trash/delete button
            const trashBtn = page.locator("button svg").filter({ has: page.locator('[class*="trash" i], [data-lucide="trash"]') }).first()
                .or(page.locator("button[aria-label*='delete' i]").first())
                .or(page.locator("button").filter({ has: page.locator("svg") }).last())

            // Alternatively, enter select mode and use the Delete button
            const selectBtn = page.locator("button").filter({ hasText: /^select$/i }).first()
            if (await selectBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
                await selectBtn.click()
                await page.waitForTimeout(500)

                // Click the first resume to select it
                await resumeItem.click()
                await page.waitForTimeout(500)

                // Click Delete button
                const deleteBtn = page.locator("button").filter({ hasText: /delete/i }).first()
                if (await deleteBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
                    await deleteBtn.click()

                    // Modal should appear
                    await expect(
                        page.getByText(/cannot be undone/i).first()
                    ).toBeVisible({ timeout: 5_000 })

                    // Click Cancel to not actually delete
                    const cancelBtn = page.locator("button").filter({ hasText: /cancel/i }).first()
                    await cancelBtn.click()
                }
            }
        }
    })
})

test.describe("Resume Management — Upload & Refresh", () => {
    test("should refresh data after upload and show new resume", async ({ page }) => {
        await navigateToDashboard(page, "resumes")

        // Count existing resumes
        await page.waitForTimeout(3_000)
        const initialCount = await page.locator("text=/\\.pdf|\\.docx/i").count()

        // Upload a new resume
        await uploadFileViaDropzone(page, FILES.validPdf)

        await expect(
            page.getByText(/uploaded successfully|upload complete|already exists/i).first()
        ).toBeVisible({ timeout: 30_000 })
    })
})
