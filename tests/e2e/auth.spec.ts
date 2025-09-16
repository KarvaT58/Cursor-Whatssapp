import { test, expect } from './fixtures/auth.fixture'
import { testUsers } from './utils/test-data'

test.describe('Authentication Flow', () => {
  test('should display login page when accessing protected route without authentication', async ({
    page,
  }) => {
    await page.goto('/dashboard')

    // Should redirect to login page
    await expect(page).toHaveURL(/.*login/)
    await expect(page.locator('form')).toBeVisible()
  })

  test('should show login form with required fields', async ({ page }) => {
    await page.goto('/login')

    // Check if login form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should display error message for invalid credentials', async ({
    page,
  }) => {
    await page.goto('/login')

    // Fill form with invalid credentials
    await page.fill('input[type="email"]', 'invalid@test.com')
    await page.fill('input[type="password"]', 'wrongpassword')

    // Submit form
    await page.click('button[type="submit"]')

    // Should show error message
    await page.waitForSelector(
      '[data-testid="toast"], .toast, [role="alert"]',
      { state: 'visible' }
    )
    await expect(
      page.locator('[data-testid="toast"], .toast, [role="alert"]')
    ).toContainText(/invalid|error|incorrect/i)
  })

  test('should successfully login with valid credentials', async ({
    page,
    authHelper,
  }) => {
    await page.goto('/login')

    // Login with test user
    await authHelper.login('user')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/)

    // Should show user menu
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()

    // Should show dashboard content
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible()
  })

  test('should logout successfully', async ({
    page,
    authHelper,
    pageHelpers,
  }) => {
    // Login first
    await authHelper.login('user')

    // Logout
    await authHelper.logout()

    // Should redirect to login page
    await expect(page).toHaveURL(/.*login/)

    // Should show login form
    await expect(page.locator('form')).toBeVisible()
  })

  test('should maintain session across page refreshes', async ({
    page,
    authHelper,
  }) => {
    // Login
    await authHelper.login('user')

    // Refresh page
    await page.reload()

    // Should still be authenticated
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
    await expect(page).toHaveURL(/.*dashboard/)
  })

  test('should redirect to dashboard after successful login', async ({
    page,
    authHelper,
  }) => {
    await page.goto('/login')

    // Login
    await authHelper.login('user')

    // Should be on dashboard
    await expect(page).toHaveURL(/.*dashboard/)

    // Should show dashboard elements
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
    await expect(
      page.locator('[data-testid="dashboard-content"]')
    ).toBeVisible()
  })

  test('should handle empty form submission', async ({ page, pageHelpers }) => {
    await page.goto('/login')

    // Try to submit empty form
    await pageHelpers.clickAndWait('button[type="submit"]')

    // Should show validation errors
    await expect(page.locator('input[type="email"]:invalid')).toBeVisible()
    await expect(page.locator('input[type="password"]:invalid')).toBeVisible()
  })

  test('should validate email format', async ({ page, pageHelpers }) => {
    await page.goto('/login')

    // Enter invalid email format
    await pageHelpers.fillField('input[type="email"]', 'invalid-email')
    await pageHelpers.fillField('input[type="password"]', 'password123')

    // Try to submit
    await pageHelpers.clickAndWait('button[type="submit"]')

    // Should show email validation error
    await expect(page.locator('input[type="email"]:invalid')).toBeVisible()
  })

  test('should show loading state during login', async ({
    page,
    pageHelpers,
  }) => {
    await page.goto('/login')

    // Fill valid credentials
    await pageHelpers.fillField('input[type="email"]', testUsers.user.email)
    await pageHelpers.fillField(
      'input[type="password"]',
      testUsers.user.password
    )

    // Submit and check for loading state
    await page.click('button[type="submit"]')

    // Should show loading state (button disabled or spinner)
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
  })
})
