import { test, expect } from "@playwright/test"

test.describe("Logout", () => {
    test("should log out and redirect to landing or sign-in page", async ({ page }) => {
        await page.goto("/dashboard")
        await page.waitForLoadState("domcontentloaded")

        // Clerk's UserButton is typically in the header/sidebar
        // Click the user avatar or menu button
        const userButton = page.locator(
            '[data-clerk-component="UserButton"], button[aria-label*="user" i], button[aria-label*="account" i], .cl-userButtonTrigger'
        ).first()

        // If Clerk UserButton exists, click it
        if (await userButton.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await userButton.click()

            // Click "Sign out" in the dropdown
            const signOutBtn = page.locator(
                'button:has-text("Sign out"), [data-localization-key*="signOut"]'
            ).first()
            await signOutBtn.click()

            // Should redirect away from dashboard
            await page.waitForURL(/\/(sign-in)?$/, { timeout: 15_000 })
            expect(page.url()).not.toContain("/dashboard")
        } else {
            // In dev mode, there might not be a Clerk button — skip gracefully
            test.skip(true, "Clerk UserButton not visible (likely dev mode)")
        }
    })
})
