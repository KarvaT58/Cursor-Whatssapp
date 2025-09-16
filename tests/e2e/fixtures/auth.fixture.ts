import { test as base, expect, Page } from '@playwright/test'
import { AuthHelper } from '../utils/auth-helper'
import { PageHelpers } from '../utils/page-helpers'

/**
 * Authentication fixture for E2E tests
 */
export const test = base.extend<{
  authHelper: AuthHelper
  pageHelpers: PageHelpers
  authenticatedPage: Page
}>({
  authHelper: async ({ page }, use) => {
    const authHelper = new AuthHelper(page)
    await use(authHelper)
  },

  pageHelpers: async ({ page }, use) => {
    const pageHelpers = new PageHelpers(page)
    await use(pageHelpers)
  },

  authenticatedPage: async (
    { page, authHelper }: { page: Page; authHelper: AuthHelper },
    use
  ) => {
    // Login before each test
    await authHelper.login('user')

    // Verify authentication
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()

    await use(page)
  },
})

export { expect } from '@playwright/test'
