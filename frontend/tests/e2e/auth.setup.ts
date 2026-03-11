import { test as setup } from "@playwright/test"
import { clerkLogin, TEST_USER } from "../utils/test-helpers"

/**
 * Authentication setup — runs once before all authenticated test suites.
 * Saves the signed-in browser state (cookies, localStorage) to a JSON file
 * so subsequent tests don't need to log in again.
 */
setup("authenticate", async ({ page }) => {
    await clerkLogin(page, TEST_USER.email, TEST_USER.password)

    // Save signed-in state
    await page.context().storageState({ path: "tests/.auth/user.json" })
})
