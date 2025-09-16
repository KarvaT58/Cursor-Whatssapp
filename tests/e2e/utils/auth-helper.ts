import { Page, expect } from '@playwright/test'
import { testUsers } from './test-data'

/**
 * Authentication helper functions for E2E tests
 */
export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Login with test user credentials
   */
  async login(userType: 'admin' | 'user' = 'user') {
    const user = testUsers[userType]

    await this.page.goto('/login')

    // Wait for login form to be visible
    await expect(this.page.locator('form')).toBeVisible()

    // Fill login form
    await this.page.fill('input[type="email"]', user.email)
    await this.page.fill('input[type="password"]', user.password)

    // Submit form
    await this.page.click('button[type="submit"]')

    // Wait for redirect to dashboard
    await this.page.waitForURL('/dashboard')

    // Verify user is logged in
    await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible()
  }

  /**
   * Logout from the application
   */
  async logout() {
    // Click user menu
    await this.page.click('[data-testid="user-menu"]')

    // Click logout button
    await this.page.click('[data-testid="logout-button"]')

    // Wait for redirect to login
    await this.page.waitForURL('/login')

    // Verify user is logged out
    await expect(this.page.locator('form')).toBeVisible()
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[data-testid="user-menu"]', {
        timeout: 5000,
      })
      return true
    } catch {
      return false
    }
  }

  /**
   * Navigate to protected route and handle authentication
   */
  async navigateToProtectedRoute(route: string) {
    await this.page.goto(route)

    // If redirected to login, authenticate first
    if (this.page.url().includes('/login')) {
      await this.login()
      await this.page.goto(route)
    }
  }
}
