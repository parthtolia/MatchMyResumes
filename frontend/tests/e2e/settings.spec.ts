import { test, expect } from "@playwright/test"
import { navigateToDashboard } from "../utils/test-helpers"

test.describe("Settings Page", () => {
    test.beforeEach(async ({ page }) => {
        await navigateToDashboard(page, "settings")
    })

    // ── Page load ─────────────────────────────────────────────────
    test("should display settings page", async ({ page }) => {
        await expect(
            page.getByText(/settings/i).first()
        ).toBeVisible({ timeout: 10_000 })

        await expect(
            page.getByText(/manage your account/i).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    // ── Profile section ───────────────────────────────────────────
    test("should display profile section", async ({ page }) => {
        await expect(
            page.getByText(/profile/i).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    test("should show user name and email", async ({ page }) => {
        await expect(
            page.getByText(/full name/i).first()
        ).toBeVisible({ timeout: 10_000 })

        await expect(
            page.getByText(/email/i).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    test("should show Open Account Portal link", async ({ page }) => {
        await expect(
            page.getByText(/open account portal/i).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    // ── Security section ──────────────────────────────────────────
    test("should display security section", async ({ page }) => {
        await expect(
            page.getByText(/security/i).first()
        ).toBeVisible({ timeout: 10_000 })
    })

    test("should show security information", async ({ page }) => {
        await expect(
            page.getByText(/clerk|authentication|encrypted/i).first()
        ).toBeVisible({ timeout: 10_000 })
    })
})
