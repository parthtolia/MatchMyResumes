import { test as setup } from "@playwright/test"
import { clerkLogin, TEST_USER } from "../utils/test-helpers"

/**
 * Authentication setup — runs once before all authenticated test suites.
 * Saves the signed-in browser state (cookies, localStorage) to a JSON file
 * so subsequent tests don't need to log in again.
 *
 * If Clerk requires a verification code, you have 120 seconds to enter it
 * in the headed browser window. Run with --headed to see the browser.
 */
setup("authenticate", async ({ page }) => {
    setup.setTimeout(180_000) // 3 minutes to allow manual code entry
    await clerkLogin(page, TEST_USER.email, TEST_USER.password)

    // Save signed-in state
    await page.context().storageState({ path: "tests/.auth/user.json" })
})
