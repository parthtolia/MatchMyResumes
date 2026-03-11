import { test, expect } from "@playwright/test"
import {
    FILES,
    navigateToDashboard,
    uploadFileViaDropzone,
} from "../utils/test-helpers"

test.describe("Resume Upload Flow", () => {
    test.beforeEach(async ({ page }) => {
        await navigateToDashboard(page, "resumes")
    })

    // ── Valid uploads ───────────────────────────────────────────────
    test("should upload a valid PDF resume", async ({ page }) => {
        await uploadFileViaDropzone(page, FILES.validPdf)

        // Wait for upload success indicator
        await expect(
            page.getByText(/uploaded successfully|upload complete/i).first()
        ).toBeVisible({ timeout: 30_000 })
    })

    test("should upload a valid DOCX resume", async ({ page }) => {
        await uploadFileViaDropzone(page, FILES.validDocx)

        await expect(
            page.getByText(/uploaded successfully|upload complete/i).first()
        ).toBeVisible({ timeout: 30_000 })
    })

    test("should display uploaded resume in the list", async ({ page }) => {
        await uploadFileViaDropzone(page, FILES.validPdf)

        await expect(
            page.getByText(/uploaded successfully/i).first()
        ).toBeVisible({ timeout: 30_000 })

        // The resume filename should appear in the list
        await expect(
            page.getByText(/sample-resume/i).first()
        ).toBeVisible({ timeout: 5_000 })
    })

    // ── Rejection: unsupported file type ────────────────────────────
    test("should reject unsupported file types", async ({ page }) => {
        await uploadFileViaDropzone(page, FILES.unsupported)

        // Dropzone rejects via accept filter or shows error
        // Should NOT show success message
        await expect(
            page.getByText(/uploaded successfully/i)
        ).not.toBeVisible({ timeout: 3_000 })

        // Should show rejection feedback (dropzone or custom error)
        await expect(
            page.getByText(/unsupported|invalid|must be|PDF or DOCX|not allowed/i).first()
        ).toBeVisible({ timeout: 5_000 })
    })

    // ── Rejection: file too large ───────────────────────────────────
    test("should reject files exceeding 10MB limit", async ({ page }) => {
        await uploadFileViaDropzone(page, FILES.largeFile)

        // Frontend dropzone maxSize should reject immediately
        await expect(
            page.getByText(/exceeds|too large|10\s?MB|size limit/i).first()
        ).toBeVisible({ timeout: 5_000 })

        // Should NOT show success
        await expect(
            page.getByText(/uploaded successfully/i)
        ).not.toBeVisible({ timeout: 2_000 })
    })

    // ── Rejection: corrupted file ───────────────────────────────────
    test("should handle corrupted PDF gracefully", async ({ page }) => {
        await uploadFileViaDropzone(page, FILES.corrupted)

        // Backend should return an error about parsing
        // Allow time for the upload round-trip
        await expect(
            page.getByText(/error|failed|corrupt|could not|unable to parse/i).first()
        ).toBeVisible({ timeout: 15_000 })
    })

    // ── Rejection: empty file ───────────────────────────────────────
    test("should handle empty file upload", async ({ page }) => {
        await uploadFileViaDropzone(page, FILES.empty)

        // Backend or frontend should reject empty/0-byte file
        await expect(
            page.getByText(/error|empty|no content|failed|too small/i).first()
        ).toBeVisible({ timeout: 15_000 })
    })

    // ── Duplicate upload ────────────────────────────────────────────
    test("should show error for duplicate filename upload", async ({ page }) => {
        // Upload once
        await uploadFileViaDropzone(page, FILES.validPdf)
        await expect(
            page.getByText(/uploaded successfully/i).first()
        ).toBeVisible({ timeout: 30_000 })

        // Wait for state to settle, then upload same file again
        await page.waitForTimeout(1_000)
        await uploadFileViaDropzone(page, FILES.validPdf)

        // Should show duplicate/already exists error
        await expect(
            page.getByText(/already exists|duplicate/i).first()
        ).toBeVisible({ timeout: 15_000 })
    })

    // ── Dropzone visual states ──────────────────────────────────────
    test("should show dropzone upload area", async ({ page }) => {
        // Verify the dropzone is rendered with instructions
        await expect(
            page.getByText(/drop.*resume|click to browse|drag/i).first()
        ).toBeVisible()
    })
})
